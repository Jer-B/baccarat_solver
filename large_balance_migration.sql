-- Migration to support larger balance amounts
-- Increases balance precision from DECIMAL(10,2) to DECIMAL(15,2)
-- This allows balances up to 999,999,999,999,999.99 (999 trillion)

-- Update start_balance column
ALTER TABLE api.user_sessions 
ALTER COLUMN start_balance TYPE DECIMAL(15,2);

-- Update end_balance column  
ALTER TABLE api.user_sessions 
ALTER COLUMN end_balance TYPE DECIMAL(15,2);

-- Add comment for documentation
COMMENT ON COLUMN api.user_sessions.start_balance IS 'Starting balance for the session - supports up to 999 trillion';
COMMENT ON COLUMN api.user_sessions.end_balance IS 'Ending balance for the session - supports up to 999 trillion'; 