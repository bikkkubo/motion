import { NextRequest, NextResponse } from 'next/server';
import { performIncrementalSync, getUserIdByWatchId } from '@/utils/sync';

/**
 * POST /api/cal-webhook
 * Handles Google Calendar push notifications
 */
export async function POST(request: NextRequest) {
  try {
    // Verify Google webhook headers
    const headers = request.headers;
    const channelId = headers.get('x-goog-channel-id');
    const channelToken = headers.get('x-goog-channel-token');
    const resourceId = headers.get('x-goog-resource-id');
    const resourceState = headers.get('x-goog-resource-state');
    const resourceUri = headers.get('x-goog-resource-uri');
    
    console.log('Webhook received:', {
      channelId,
      channelToken,
      resourceId,
      resourceState,
      resourceUri,
    });
    
    // Validate required headers
    if (!channelId || !resourceState) {
      console.error('Missing required webhook headers');
      return NextResponse.json(
        { error: 'Invalid webhook headers' },
        { status: 400 }
      );
    }
    
    // Handle sync event (actual calendar changes)
    if (resourceState === 'sync') {
      console.log('Processing calendar sync event');
      
      // Get user ID from channel/watch ID
      const userId = await getUserIdByWatchId(channelId);
      
      if (!userId) {
        console.error(`No user found for watch ID: ${channelId}`);
        return NextResponse.json(
          { error: 'User not found for watch ID' },
          { status: 404 }
        );
      }
      
      // Perform incremental sync
      try {
        const result = await performIncrementalSync(userId);
        console.log(`Sync completed for user ${userId}:`, result);
        
        return NextResponse.json({
          success: true,
          message: 'Calendar synced successfully',
          eventCount: result.eventCount,
        });
        
      } catch (syncError) {
        console.error(`Sync failed for user ${userId}:`, syncError);
        
        // Return success to Google to avoid retries, but log the error
        return NextResponse.json({
          success: false,
          message: 'Sync failed but acknowledged',
        });
      }
    }
    
    // Handle exists event (watch verification)
    if (resourceState === 'exists') {
      console.log('Watch verification event - acknowledging');
      return NextResponse.json({ success: true });
    }
    
    // Handle other states
    console.log(`Unhandled resource state: ${resourceState}`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Always return 200 to Google to avoid retries
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * GET /api/cal-webhook
 * Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Google Calendar webhook endpoint is ready',
  });
}