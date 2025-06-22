import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Google OAuth2 scopes for Calendar access
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

/**
 * Create Google OAuth2 client
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthUrl(): string {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_SCOPES,
    prompt: 'consent', // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();
  
  const { tokens } = await oauth2Client.getTokens(code);
  
  if (!tokens.access_token) {
    throw new Error('No access token received');
  }
  
  return tokens;
}

/**
 * Store OAuth tokens in Supabase
 */
export async function storeOAuthTokens(userId: string, tokens: any) {
  const { error } = await supabase
    .from('oauth_tokens')
    .upsert({
      user_id: userId,
      provider: 'google',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: GOOGLE_SCOPES.join(' '),
      token_type: tokens.token_type || 'Bearer',
      expiry: new Date(tokens.expiry_date).toISOString(),
    }, {
      onConflict: 'user_id,provider'
    });
    
  if (error) {
    throw new Error(`Failed to store tokens: ${error.message}`);
  }
}

/**
 * Get user's OAuth tokens from Supabase
 */
export async function getUserTokens(userId: string) {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return data;
}

/**
 * Create authenticated Google Calendar client
 */
export async function createCalendarClient(userId: string) {
  const tokens = await getUserTokens(userId);
  
  if (!tokens) {
    throw new Error('No OAuth tokens found for user');
  }
  
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: new Date(tokens.expiry).getTime(),
  });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * Set up Google Calendar watch for push notifications
 */
export async function setupCalendarWatch(userId: string, calendarId: string = 'primary') {
  try {
    const calendar = await createCalendarClient(userId);
    
    const watchId = `watch-${userId}-${Date.now()}`;
    const watchRequest = {
      calendarId,
      requestBody: {
        id: watchId,
        type: 'web_hook',
        address: process.env.GOOGLE_PUSH_ENDPOINT,
        params: {
          ttl: '3600', // 1 hour
        },
      },
    };
    
    const response = await calendar.events.watch(watchRequest);
    
    // Store watch metadata in Supabase
    await supabase
      .from('calendar_sync_state')
      .upsert({
        user_id: userId,
        calendar_id: calendarId,
        watch_id: watchId,
        watch_expiry: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour from now
      }, {
        onConflict: 'user_id,calendar_id'
      });
    
    return response.data;
  } catch (error) {
    console.error('Failed to setup calendar watch:', error);
    throw error;
  }
}

/**
 * Refresh OAuth tokens if needed
 */
export async function refreshTokensIfNeeded(userId: string) {
  const tokens = await getUserTokens(userId);
  
  if (!tokens) {
    return false;
  }
  
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: new Date(tokens.expiry).getTime(),
  });
  
  // Check if token is expired or will expire in the next 5 minutes
  const now = Date.now();
  const expiryTime = new Date(tokens.expiry).getTime();
  
  if (expiryTime - now < 5 * 60 * 1000) { // 5 minutes
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      await storeOAuthTokens(userId, credentials);
      
      return true;
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      return false;
    }
  }
  
  return true;
}