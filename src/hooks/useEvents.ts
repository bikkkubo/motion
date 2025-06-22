import useSWR from 'swr';
import type { Database } from '../../supabase/database.types';

type Event = Database['public']['Tables']['events']['Row'] & {
  tasks?: Database['public']['Tables']['tasks']['Row'] | null;
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  const data = await response.json();
  return data.events;
};

export function useEvents(userId: string | null) {
  const { data, error, mutate } = useSWR<Event[]>(
    userId ? `/api/events?userId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 15000, // Refresh every 15 seconds (more frequent for calendar)
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Transform events for react-big-calendar
  const calendarEvents = data?.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_at),
    end: new Date(event.end_at),
    allDay: event.all_day,
    resource: {
      ...event,
      isFromTask: !!event.task_id,
      priority: event.tasks?.priority || 1,
    },
  })) || [];

  return {
    events: data,
    calendarEvents,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}