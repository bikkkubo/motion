import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeOAuthTokens, setupCalendarWatch } from '@/utils/google';

/**
 * GET /api/auth/google/callback
 * Handles OAuth callback from Google
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=oauth_error`
      );
    }
    
    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      );
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // TODO: Get user ID from session/auth
    // For now, using a placeholder - in real implementation:
    // const session = await getServerSession(authOptions);
    // const userId = session?.user?.id;
    
    const userId = 'temp-user-id'; // Replace with actual user ID from auth
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Store tokens in Supabase
    await storeOAuthTokens(userId, tokens);
    
    // Set up calendar watch for push notifications
    try {
      await setupCalendarWatch(userId);
      console.log('Calendar watch setup successful');
    } catch (watchError) {
      console.error('Failed to setup calendar watch:', watchError);
      // Don't fail the entire flow if watch setup fails
    }
    
    // Redirect back to app with success
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?auth=success`
    );
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?error=callback_failed`
    );
  }
}