'use client';

interface EventBadgeProps {
  event: {
    title: string;
    resource?: {
      isFromTask?: boolean;
      priority?: number;
      all_day?: boolean;
      description?: string;
    };
  };
}

export default function EventBadge({ event }: EventBadgeProps) {
  const { title, resource } = event;
  const isFromTask = resource?.isFromTask;
  const priority = resource?.priority;
  const isAllDay = resource?.all_day;

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 5: return '🔥'; // Urgent
      case 4: return '⚡'; // High
      case 3: return '📋'; // Medium
      case 2: return '📝'; // Normal
      case 1: return '💭'; // Low
      default: return '';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Urgent';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Normal';
      case 1: return 'Low';
      default: return '';
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs text-white h-full px-1">
      {isFromTask && priority && (
        <span title={`Priority: ${getPriorityLabel(priority)}`}>
          {getPriorityIcon(priority)}
        </span>
      )}
      
      <span className="truncate flex-1 font-medium">
        {title}
      </span>
      
      {isAllDay && (
        <span className="text-xs opacity-75" title="All day event">
          📅
        </span>
      )}
      
      {!isFromTask && (
        <span className="text-xs opacity-75" title="Calendar event">
          📆
        </span>
      )}
    </div>
  );
}