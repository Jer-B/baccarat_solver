-- User Sessions Table Migration
-- Add this to your existing Supabase database

-- Create user_sessions table for recording gaming sessions
CREATE TABLE IF NOT EXISTS api.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NULL,
    duration_seconds INTEGER NULL,
    total_hands INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    session_name TEXT NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON api.user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON api.user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON api.user_sessions(started_at);

-- Enable Row Level Security
ALTER TABLE api.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on user_sessions" ON api.user_sessions FOR ALL USING (true);

-- Grant permissions to authenticated and anon roles
GRANT ALL ON api.user_sessions TO anon, authenticated;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_sessions table
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON api.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_sessions_updated_at();

-- Add to database types (for reference)
-- You'll need to update your TypeScript types to include this table 