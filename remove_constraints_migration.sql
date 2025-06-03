-- Migration to remove cut card position and balance constraints
-- This allows for more flexible values without database restrictions

-- Remove cut card position constraint
ALTER TABLE api.games 
DROP CONSTRAINT IF EXISTS games_cut_card_position_check;

-- Remove number of decks constraint (allow more flexibility)
ALTER TABLE api.games 
DROP CONSTRAINT IF EXISTS games_number_of_decks_check;

-- Remove balance constraints if they exist
-- (Note: After large_balance_migration.sql, start_balance and end_balance are now DECIMAL(15,2))

-- Add comments for documentation
COMMENT ON COLUMN api.games.cut_card_position IS 'Cut card position - no longer constrained, allows any integer value';
COMMENT ON COLUMN api.games.number_of_decks IS 'Number of decks - no longer constrained, allows any integer value';
COMMENT ON COLUMN api.user_sessions.start_balance IS 'Starting balance - supports up to 999 trillion with DECIMAL(15,2)';
COMMENT ON COLUMN api.user_sessions.end_balance IS 'Ending balance - supports up to 999 trillion with DECIMAL(15,2)'; 