-- Baccarat Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create dedicated API schema (recommended for security)
CREATE SCHEMA IF NOT EXISTS api;

-- Games table - tracks individual shoe sessions
CREATE TABLE api.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    number_of_decks INTEGER NOT NULL CHECK (number_of_decks IN (6, 8)),
    cut_card_position INTEGER NOT NULL CHECK (cut_card_position BETWEEN 10 AND 50),
    total_hands INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Hands table - tracks individual baccarat hands
CREATE TABLE api.hands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES api.games(id) ON DELETE CASCADE,
    hand_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    player_cards TEXT[] NOT NULL,
    banker_cards TEXT[] NOT NULL,
    player_total INTEGER NOT NULL CHECK (player_total BETWEEN 0 AND 9),
    banker_total INTEGER NOT NULL CHECK (banker_total BETWEEN 0 AND 9),
    outcome TEXT NOT NULL CHECK (outcome IN ('player', 'banker', 'tie')),
    player_pair BOOLEAN NOT NULL DEFAULT FALSE,
    banker_pair BOOLEAN NOT NULL DEFAULT FALSE,
    is_natural BOOLEAN NOT NULL DEFAULT FALSE,
    cards_remaining INTEGER NOT NULL,
    penetration DECIMAL(5,4) NOT NULL CHECK (penetration BETWEEN 0 AND 1),
    UNIQUE(game_id, hand_number)
);

-- Burned cards table - tracks cards removed from play
CREATE TABLE api.burned_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES api.games(id) ON DELETE CASCADE,
    card_value TEXT NOT NULL,
    card_suit TEXT NOT NULL CHECK (card_suit IN ('hearts', 'diamonds', 'clubs', 'spades')),
    burned_at TIMESTAMPTZ DEFAULT NOW(),
    position_in_shoe INTEGER NOT NULL
);

-- Edge calculations table - stores calculated advantages
CREATE TABLE api.edge_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES api.games(id) ON DELETE CASCADE,
    hand_id UUID NOT NULL REFERENCES api.hands(id) ON DELETE CASCADE,
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    player_edge DECIMAL(8,6) NOT NULL,
    banker_edge DECIMAL(8,6) NOT NULL,
    tie_edge DECIMAL(8,6) NOT NULL,
    player_pair_edge DECIMAL(8,6) NOT NULL,
    banker_pair_edge DECIMAL(8,6) NOT NULL,
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    cards_remaining INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_games_status ON api.games(status);
CREATE INDEX idx_games_created_at ON api.games(created_at);
CREATE INDEX idx_hands_game_id ON api.hands(game_id);
CREATE INDEX idx_hands_created_at ON api.hands(created_at);
CREATE INDEX idx_burned_cards_game_id ON api.burned_cards(game_id);
CREATE INDEX idx_edge_calculations_game_id ON api.edge_calculations(game_id);
CREATE INDEX idx_edge_calculations_hand_id ON api.edge_calculations(hand_id);

-- Function to increment game hands count
CREATE OR REPLACE FUNCTION api.increment_game_hands(game_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE api.games 
    SET total_hands = total_hands + 1, 
        updated_at = NOW()
    WHERE id = game_id;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE api.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.burned_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.edge_calculations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on games" ON api.games FOR ALL USING (true);
CREATE POLICY "Allow all operations on hands" ON api.hands FOR ALL USING (true);
CREATE POLICY "Allow all operations on burned_cards" ON api.burned_cards FOR ALL USING (true);
CREATE POLICY "Allow all operations on edge_calculations" ON api.edge_calculations FOR ALL USING (true);

-- Grant permissions to authenticated and anon roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA api TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA api TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA api TO anon, authenticated;

-- Update the Supabase configuration to use the api schema
-- In your Supabase dashboard, go to Settings > API
-- Set the "Exposed schemas" to include "api" 