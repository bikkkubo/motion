'use client';

import { useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import TaskDialog from '@/components/TaskDialog';
import EventBadge from '@/components/EventBadge';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// TODO: Replace with actual user authentication
const TEMP_USER_ID = 'temp-user-id';

export default function Home() {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  
  const { events, calendarEvents, isLoading: eventsLoading, mutate: mutateEvents } = useEvents(TEMP_USER_ID);
  const { tasks, isLoading: tasksLoading, mutate: mutateTasks } = useTasks(TEMP_USER_ID);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setIsTaskDialogOpen(true);
  };

  const handleTaskCreated = () => {
    // Refresh both tasks and events after creating a task
    mutateTasks();
    mutateEvents();
    setIsTaskDialogOpen(false);
    setSelectedSlot(null);
  };

  const eventStyleGetter = (event: any) => {
    const isFromTask = event.resource?.isFromTask;
    const priority = event.resource?.priority || 1;
    
    let backgroundColor = '#3174ad';
    
    if (isFromTask) {
      // Color by priority for task-generated events
      switch (priority) {
        case 5: backgroundColor = '#dc2626'; break; // High priority - red
        case 4: backgroundColor = '#ea580c'; break; // Orange
        case 3: backgroundColor = '#ca8a04'; break; // Yellow
        case 2: backgroundColor = '#16a34a'; break; // Green
        case 1: backgroundColor = '#2563eb'; break; // Low priority - blue
      }
    } else {
      // Gray for calendar events
      backgroundColor = '#6b7280';
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (eventsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Motion Scheduler</h1>
              <p className="text-sm text-gray-600">
                {tasks?.length || 0} tasks • {events?.length || 0} events
              </p>
            </div>
            <button
              onClick={() => setIsTaskDialogOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6" style={{ height: 'calc(100vh - 200px)' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            selectable
            defaultView={Views.WEEK}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventBadge,
            }}
            step={30}
            timeslots={2}
            min={new Date(0, 0, 0, 7, 0, 0)} // 7 AM
            max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
          />
        </div>
      </main>

      {/* Task Dialog */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setSelectedSlot(null);
        }}
        onTaskCreated={handleTaskCreated}
        selectedSlot={selectedSlot}
        userId={TEMP_USER_ID}
      />
    </div>
  );
}
