import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/utils/google';

/**
 * GET /api/auth/google
 * Redirects to Google OAuth authorization URL
 */
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd want to:
    // 1. Check if user is authenticated
    // 2. Store state parameter for CSRF protection
    // 3. Add user ID to state for callback handling
    
    const authUrl = getAuthUrl();
    
    // Redirect to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('Error generating auth URL:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}