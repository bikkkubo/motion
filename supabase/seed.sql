-- Seed data for development/testing
-- This file will be run after migrations in local development

-- Insert sample tasks (will only work after user authentication)
-- These are just examples - actual data will be user-specific via RLS

/*
-- Example tasks (uncomment after setting up auth)
INSERT INTO tasks (user_id, title, description, duration_min, priority, due_at) VALUES
('00000000-0000-0000-0000-000000000000', 'Review project proposal', 'Go through the new project requirements and timeline', 60, 3, NOW() + INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000000', 'Team standup meeting', 'Daily standup with the development team', 30, 2, NOW() + INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000000', 'Code review', 'Review pull requests from team members', 45, 3, NOW() + INTERVAL '3 days');

-- Example events
INSERT INTO events (user_id, title, description, start_at, end_at) VALUES
('00000000-0000-0000-0000-000000000000', 'Lunch break', 'Daily lunch break', NOW() + INTERVAL '1 day 12 hours', NOW() + INTERVAL '1 day 13 hours'),
('00000000-0000-0000-0000-000000000000', 'Team meeting', 'Weekly team sync', NOW() + INTERVAL '2 days 14 hours', NOW() + INTERVAL '2 days 15 hours');
*/

-- For now, just create some helpful comments
COMMENT ON TABLE tasks IS 'User tasks to be scheduled by OR-Tools optimizer';
COMMENT ON TABLE events IS 'Scheduled events from tasks or external calendar sync';
COMMENT ON COLUMN events.gcal_event_id IS 'Google Calendar event ID for sync';
COMMENT ON COLUMN events.task_id IS 'Reference to task if event was generated from a task';