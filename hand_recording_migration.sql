-- Migration to add betting and balance tracking to hands table
-- This allows recording complete betting information for each hand

-- Add betting information columns to hands table
ALTER TABLE api.hands 
ADD COLUMN IF NOT EXISTS bet_type text,
ADD COLUMN IF NOT EXISTS bet_amount numeric,
ADD COLUMN IF NOT EXISTS bet_won boolean,
ADD COLUMN IF NOT EXISTS bet_payout numeric,
ADD COLUMN IF NOT EXISTS bet_net_result numeric,
ADD COLUMN IF NOT EXISTS balance_before numeric,
ADD COLUMN IF NOT EXISTS balance_after numeric;

-- Add check constraint for bet_type
ALTER TABLE api.hands 
ADD CONSTRAINT hands_bet_type_check 
CHECK (bet_type IS NULL OR bet_type = ANY (ARRAY['player'::text, 'banker'::text, 'tie'::text, 'playerPair'::text, 'bankerPair'::text]));

-- Add comments for documentation
COMMENT ON COLUMN api.hands.bet_type IS 'Type of bet placed on this hand (player, banker, tie, playerPair, bankerPair)';
COMMENT ON COLUMN api.hands.bet_amount IS 'Amount bet on this hand';
COMMENT ON COLUMN api.hands.bet_won IS 'Whether the bet was won or lost';
COMMENT ON COLUMN api.hands.bet_payout IS 'Total payout received (including original bet if won)';
COMMENT ON COLUMN api.hands.bet_net_result IS 'Net result of the bet (positive for win, negative for loss)';
COMMENT ON COLUMN api.hands.balance_before IS 'Player balance before this hand';
COMMENT ON COLUMN api.hands.balance_after IS 'Player balance after this hand'; 