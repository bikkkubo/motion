import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

/**
 * GET /api/events?userId=xxx
 * Fetch user's events
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        tasks (
          title,
          description,
          priority
        )
      `)
      .eq('user_id', userId)
      .order('start_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ events });
    
  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}