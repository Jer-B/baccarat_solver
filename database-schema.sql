-- Baccarat Assistant Database Schema
-- Complete schema for fresh Supabase database initialization
-- Run this script to set up all required tables and functions

-- ============================================================================
-- USER SESSIONS TABLE
-- ============================================================================

-- Create user_sessions table for recording gaming sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
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
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON public.user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ended_at ON public.user_sessions(ended_at);

-- ============================================================================
-- GAME HANDS TABLE (for future expansion)
-- ============================================================================

-- Create game_hands table for detailed hand tracking
CREATE TABLE IF NOT EXISTS public.game_hands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    hand_number INTEGER NOT NULL,
    player_cards JSONB NOT NULL,
    banker_cards JSONB NOT NULL,
    player_total INTEGER NOT NULL,
    banker_total INTEGER NOT NULL,
    winner TEXT NOT NULL CHECK (winner IN ('player', 'banker', 'tie')),
    player_pair BOOLEAN DEFAULT FALSE,
    banker_pair BOOLEAN DEFAULT FALSE,
    natural BOOLEAN DEFAULT FALSE,
    bet_info JSONB NULL, -- Store betting information if any
    metadata JSONB NULL -- Additional hand metadata
);

-- Create indexes for game_hands
CREATE INDEX IF NOT EXISTS idx_game_hands_session_id ON public.game_hands(session_id);
CREATE INDEX IF NOT EXISTS idx_game_hands_created_at ON public.game_hands(created_at);
CREATE INDEX IF NOT EXISTS idx_game_hands_winner ON public.game_hands(winner);
CREATE INDEX IF NOT EXISTS idx_game_hands_hand_number ON public.game_hands(hand_number);

-- ============================================================================
-- BURN CARDS TABLE (for future expansion)
-- ============================================================================

-- Create burn_cards table for tracking burned cards
CREATE TABLE IF NOT EXISTS public.burn_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE CASCADE,
    hand_id UUID REFERENCES public.game_hands(id) ON DELETE CASCADE NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    card_rank TEXT NULL, -- NULL for unknown burns
    card_suit TEXT NULL, -- NULL for unknown burns
    card_value INTEGER NULL, -- Baccarat value (0-9)
    is_unknown_burn BOOLEAN DEFAULT FALSE,
    confidence_level DECIMAL(3,2) NULL, -- For suspected burns (0.00-1.00)
    burn_method TEXT NULL, -- 'random', 'suspected', 'observed', etc.
    metadata JSONB NULL
);

-- Create indexes for burn_cards
CREATE INDEX IF NOT EXISTS idx_burn_cards_session_id ON public.burn_cards(session_id);
CREATE INDEX IF NOT EXISTS idx_burn_cards_hand_id ON public.burn_cards(hand_id);
CREATE INDEX IF NOT EXISTS idx_burn_cards_is_unknown ON public.burn_cards(is_unknown_burn);
CREATE INDEX IF NOT EXISTS idx_burn_cards_created_at ON public.burn_cards(created_at);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user_sessions table
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
    BEFORE UPDATE ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate session analytics
CREATE OR REPLACE FUNCTION get_session_analytics(session_uuid UUID)
RETURNS TABLE (
    session_id UUID,
    total_hands INTEGER,
    player_wins INTEGER,
    banker_wins INTEGER,
    ties INTEGER,
    player_pairs INTEGER,
    banker_pairs INTEGER,
    naturals INTEGER,
    average_hand_duration DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as session_id,
        COALESCE(COUNT(h.id)::INTEGER, 0) as total_hands,
        COALESCE(SUM(CASE WHEN h.winner = 'player' THEN 1 ELSE 0 END)::INTEGER, 0) as player_wins,
        COALESCE(SUM(CASE WHEN h.winner = 'banker' THEN 1 ELSE 0 END)::INTEGER, 0) as banker_wins,
        COALESCE(SUM(CASE WHEN h.winner = 'tie' THEN 1 ELSE 0 END)::INTEGER, 0) as ties,
        COALESCE(SUM(CASE WHEN h.player_pair THEN 1 ELSE 0 END)::INTEGER, 0) as player_pairs,
        COALESCE(SUM(CASE WHEN h.banker_pair THEN 1 ELSE 0 END)::INTEGER, 0) as banker_pairs,
        COALESCE(SUM(CASE WHEN h.natural THEN 1 ELSE 0 END)::INTEGER, 0) as naturals,
        CASE 
            WHEN s.duration_seconds IS NOT NULL AND s.duration_seconds > 0 AND COUNT(h.id) > 0 
            THEN (s.duration_seconds::DECIMAL / COUNT(h.id)::DECIMAL)
            ELSE 0
        END as average_hand_duration
    FROM public.user_sessions s
    LEFT JOIN public.game_hands h ON s.id = h.session_id
    WHERE s.id = session_uuid
    GROUP BY s.id, s.duration_seconds;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.burn_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
-- Note: These are permissive policies for development. Adjust for production use.

-- User Sessions policies
DROP POLICY IF EXISTS "Allow all operations on user_sessions" ON public.user_sessions;
CREATE POLICY "Allow all operations on user_sessions" 
    ON public.user_sessions FOR ALL 
    USING (true);

-- Game Hands policies
DROP POLICY IF EXISTS "Allow all operations on game_hands" ON public.game_hands;
CREATE POLICY "Allow all operations on game_hands" 
    ON public.game_hands FOR ALL 
    USING (true);

-- Burn Cards policies
DROP POLICY IF EXISTS "Allow all operations on burn_cards" ON public.burn_cards;
CREATE POLICY "Allow all operations on burn_cards" 
    ON public.burn_cards FOR ALL 
    USING (true);

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated and anon roles
GRANT ALL ON public.user_sessions TO anon, authenticated;
GRANT ALL ON public.game_hands TO anon, authenticated;
GRANT ALL ON public.burn_cards TO anon, authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment the following to insert sample data for testing

/*
-- Insert sample session
INSERT INTO public.user_sessions (session_name, started_at, ended_at, duration_seconds, total_hands, status)
VALUES 
    ('Sample Session 1', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 3600, 25, 'completed'),
    ('Sample Session 2', NOW() - INTERVAL '30 minutes', NULL, NULL, 0, 'active');

-- Get the session IDs for sample hands
DO $$
DECLARE
    sample_session_id UUID;
BEGIN
    SELECT id INTO sample_session_id FROM public.user_sessions WHERE session_name = 'Sample Session 1' LIMIT 1;
    
    -- Insert sample hands
    INSERT INTO public.game_hands (session_id, hand_number, player_cards, banker_cards, player_total, banker_total, winner, player_pair, banker_pair, natural)
    VALUES 
        (sample_session_id, 1, '[{"rank":"K","suit":"hearts","value":0},{"rank":"5","suit":"clubs","value":5}]', '[{"rank":"9","suit":"diamonds","value":9},{"rank":"2","suit":"spades","value":2}]', 5, 1, 'player', false, false, false),
        (sample_session_id, 2, '[{"rank":"8","suit":"hearts","value":8},{"rank":"A","suit":"clubs","value":1}]', '[{"rank":"7","suit":"diamonds","value":7}]', 9, 7, 'player', false, false, true);
END $$;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the schema was created correctly:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('user_sessions', 'game_hands', 'burn_cards');

-- Check indexes exist
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('user_sessions', 'game_hands', 'burn_cards');

-- Check functions exist
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('update_updated_at_column', 'get_session_analytics');

-- Test session analytics function
-- SELECT * FROM get_session_analytics('00000000-0000-0000-0000-000000000000'::UUID);

-- ============================================================================
-- NOTES
-- ============================================================================

/*
This schema provides:

1. Complete session tracking with user_sessions table
2. Detailed hand recording with game_hands table (for future expansion)
3. Burn card tracking with burn_cards table (for professional features)
4. Proper indexing for performance
5. Row Level Security setup
6. Utility functions for analytics
7. Proper foreign key relationships
8. JSONB fields for flexible metadata storage

To use this schema:
1. Copy this entire file
2. Run it in your Supabase SQL editor
3. Verify tables were created using the verification queries
4. Update your TypeScript types if needed
5. Test the connection from your application

For production use:
- Review and tighten Row Level Security policies
- Consider adding user authentication constraints
- Add additional indexes based on query patterns
- Set up proper backup and monitoring
*/ 