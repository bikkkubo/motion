-- OAuth tokens table for Google Calendar integration
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'google',
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    scope TEXT NOT NULL,
    token_type TEXT DEFAULT 'Bearer',
    expiry TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one token per user per provider
    UNIQUE(user_id, provider)
);

-- Index for performance
CREATE INDEX idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX idx_oauth_tokens_expiry ON oauth_tokens(expiry);

-- Enable RLS on oauth_tokens table
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies: Users can only access their own tokens
CREATE POLICY "User can view own oauth tokens"
    ON oauth_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "User can insert own oauth tokens"
    ON oauth_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own oauth tokens"
    ON oauth_tokens FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can delete own oauth tokens"
    ON oauth_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE TRIGGER update_oauth_tokens_updated_at
    BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add calendar sync metadata to track sync state
CREATE TABLE calendar_sync_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_id TEXT NOT NULL,
    sync_token TEXT, -- Google Calendar sync token for incremental sync
    watch_id TEXT, -- Google Calendar watch/webhook ID
    watch_expiry TIMESTAMPTZ, -- When the watch expires
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One sync state per user per calendar
    UNIQUE(user_id, calendar_id)
);

-- Index for performance
CREATE INDEX idx_calendar_sync_state_user_id ON calendar_sync_state(user_id);
CREATE INDEX idx_calendar_sync_state_watch_expiry ON calendar_sync_state(watch_expiry);

-- Enable RLS on calendar_sync_state table
ALTER TABLE calendar_sync_state ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar sync state
CREATE POLICY "User can view own calendar sync state"
    ON calendar_sync_state FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "User can insert own calendar sync state"
    ON calendar_sync_state FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can update own calendar sync state"
    ON calendar_sync_state FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can delete own calendar sync state"
    ON calendar_sync_state FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for calendar_sync_state updated_at
CREATE TRIGGER update_calendar_sync_state_updated_at
    BEFORE UPDATE ON calendar_sync_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();