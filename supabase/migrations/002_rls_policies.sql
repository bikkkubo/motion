-- Row Level Security (RLS) policies for Motion Scheduler
-- Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Enable RLS on events table  
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Tasks table policies: Users can only access their own tasks
CREATE POLICY "User can view own tasks"
    ON tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "User can insert own tasks"
    ON tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own tasks"
    ON tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can delete own tasks"
    ON tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Events table policies: Users can only access their own events
CREATE POLICY "User can view own events"
    ON events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "User can insert own events"
    ON events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own events"
    ON events FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can delete own events"
    ON events FOR DELETE
    USING (auth.uid() = user_id);

-- Additional constraint: When inserting events linked to tasks,
-- ensure the task belongs to the same user
CREATE OR REPLACE FUNCTION check_task_ownership()
RETURNS TRIGGER AS $$
BEGIN
    -- If task_id is provided, verify it belongs to the same user
    IF NEW.task_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = NEW.task_id 
            AND user_id = NEW.user_id
        ) THEN
            RAISE EXCEPTION 'Task does not belong to user';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to enforce task ownership when creating/updating events
CREATE TRIGGER enforce_task_ownership
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION check_task_ownership();