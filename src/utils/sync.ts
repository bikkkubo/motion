import { createCalendarClient, getUserTokens } from './google';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: string;
}

/**
 * Perform full sync of user's Google Calendar
 */
export async function performFullSync(userId: string, calendarId: string = 'primary') {
  try {
    console.log(`Starting full sync for user ${userId}, calendar ${calendarId}`);
    
    const calendar = await createCalendarClient(userId);
    
    // Get events from the last 30 days to 30 days in the future
    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 1000,
    });
    
    const events = response.data.items || [];
    console.log(`Found ${events.length} events in full sync`);
    
    // Sync events to database
    await syncEventsToDatabase(userId, events, calendarId);
    
    // Update sync state
    await updateSyncState(userId, calendarId, response.data.nextSyncToken || null);
    
    return { success: true, eventCount: events.length };
    
  } catch (error) {
    console.error('Full sync failed:', error);
    throw error;
  }
}

/**
 * Perform incremental sync using sync token
 */
export async function performIncrementalSync(userId: string, calendarId: string = 'primary') {
  try {
    console.log(`Starting incremental sync for user ${userId}, calendar ${calendarId}`);
    
    // Get current sync state
    const { data: syncState } = await supabase
      .from('calendar_sync_state')
      .select('sync_token')
      .eq('user_id', userId)
      .eq('calendar_id', calendarId)
      .single();
    
    if (!syncState?.sync_token) {
      console.log('No sync token found, performing full sync instead');
      return await performFullSync(userId, calendarId);
    }
    
    const calendar = await createCalendarClient(userId);
    
    const response = await calendar.events.list({
      calendarId,
      syncToken: syncState.sync_token,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items || [];
    console.log(`Found ${events.length} changed events in incremental sync`);
    
    // Sync changed events to database
    await syncEventsToDatabase(userId, events, calendarId);
    
    // Update sync state with new token
    await updateSyncState(userId, calendarId, response.data.nextSyncToken || null);
    
    return { success: true, eventCount: events.length };
    
  } catch (error) {
    console.error('Incremental sync failed:', error);
    
    // If sync token is invalid, fall back to full sync
    if (error.message?.includes('Sync token is no longer valid')) {
      console.log('Sync token invalid, falling back to full sync');
      return await performFullSync(userId, calendarId);
    }
    
    throw error;
  }
}

/**
 * Sync events to Supabase database
 */
async function syncEventsToDatabase(userId: string, events: CalendarEvent[], calendarId: string) {
  const eventsToUpsert = events
    .filter(event => event.id && event.status !== 'cancelled')
    .map(event => ({
      id: `gcal-${event.id}`, // Prefix to avoid conflicts
      user_id: userId,
      gcal_event_id: event.id,
      title: event.summary || 'Untitled Event',
      description: event.description || null,
      start_at: getEventDateTime(event.start),
      end_at: getEventDateTime(event.end),
      all_day: !!(event.start?.date), // If date field exists, it's all-day
    }))
    .filter(event => event.start_at && event.end_at); // Filter out invalid events
  
  // Handle deleted events
  const deletedEventIds = events
    .filter(event => event.status === 'cancelled')
    .map(event => `gcal-${event.id}`);
  
  if (deletedEventIds.length > 0) {
    await supabase
      .from('events')
      .delete()
      .eq('user_id', userId)
      .in('id', deletedEventIds);
    
    console.log(`Deleted ${deletedEventIds.length} cancelled events`);
  }
  
  if (eventsToUpsert.length > 0) {
    const { error } = await supabase
      .from('events')
      .upsert(eventsToUpsert, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('Failed to upsert events:', error);
      throw error;
    }
    
    console.log(`Upserted ${eventsToUpsert.length} events`);
  }
}

/**
 * Update calendar sync state
 */
async function updateSyncState(userId: string, calendarId: string, syncToken: string | null) {
  const { error } = await supabase
    .from('calendar_sync_state')
    .upsert({
      user_id: userId,
      calendar_id: calendarId,
      sync_token: syncToken,
      last_sync_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,calendar_id'
    });
  
  if (error) {
    console.error('Failed to update sync state:', error);
    throw error;
  }
}

/**
 * Convert Google Calendar event date/time to ISO string
 */
function getEventDateTime(dateTime?: { dateTime?: string; date?: string; timeZone?: string }): string | null {
  if (!dateTime) return null;
  
  if (dateTime.dateTime) {
    return new Date(dateTime.dateTime).toISOString();
  }
  
  if (dateTime.date) {
    // All-day event - set to start of day
    return new Date(dateTime.date + 'T00:00:00.000Z').toISOString();
  }
  
  return null;
}

/**
 * Get user ID from calendar sync state by watch ID
 */
export async function getUserIdByWatchId(watchId: string): Promise<string | null> {
  const { data } = await supabase
    .from('calendar_sync_state')
    .select('user_id')
    .eq('watch_id', watchId)
    .single();
  
  return data?.user_id || null;
}