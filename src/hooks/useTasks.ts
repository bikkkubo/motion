import useSWR from 'swr';
import type { Database } from '../../supabase/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  const data = await response.json();
  return data.tasks;
};

export function useTasks(userId: string | null) {
  const { data, error, mutate } = useSWR<Task[]>(
    userId ? `/api/tasks?userId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    tasks: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function createTask(taskData: {
  userId: string;
  title: string;
  description?: string;
  duration_min: number;
  priority?: number;
  due_at?: string;
}) {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }

  return response.json();
}