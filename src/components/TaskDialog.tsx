'use client';

import { useState } from 'react';
import { createTask } from '@/hooks/useTasks';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  selectedSlot?: { start: Date; end: Date } | null;
  userId: string;
}

export default function TaskDialog({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  selectedSlot,
  userId 
}: TaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_min: 60,
    priority: 3,
    due_at: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createTask({
        userId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        duration_min: formData.duration_min,
        priority: formData.priority,
        due_at: formData.due_at || undefined,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        duration_min: 60,
        priority: 3,
        due_at: '',
      });

      onTaskCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New Task
            {selectedSlot && (
              <span className="text-sm font-normal text-gray-500 block">
                Suggested for {selectedSlot.start.toLocaleString()}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          {/* Duration and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                value={formData.duration_min}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_min: parseInt(e.target.value) || 60 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="15"
                max="480"
                step="15"
                required
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Normal</option>
                <option value={3}>3 - Medium</option>
                <option value={4}>4 - High</option>
                <option value={5}>5 - Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="due_at" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (optional)
            </label>
            <input
              type="datetime-local"
              id="due_at"
              value={formData.due_at}
              onChange={(e) => setFormData(prev => ({ ...prev, due_at: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}