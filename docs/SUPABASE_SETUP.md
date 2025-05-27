# Supabase Database Setup Guide

This guide will walk you through setting up Supabase for the Advanced Baccarat Assistant application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of SQL and database concepts

## Step 1: Create a New Supabase Project

1. Log in to your Supabase dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `baccarat` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"

## Step 2: Database Schema Setup

### Create the API Schema

First, create a dedicated schema for better organization:

```sql
-- Create API schema
CREATE SCHEMA IF NOT EXISTS api;
```

### Create Tables

Execute the following SQL commands in the Supabase SQL Editor:

```sql
-- Games table
CREATE TABLE api.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deck_count INTEGER NOT NULL DEFAULT 8,
    cut_card_position INTEGER NOT NULL DEFAULT 14,
    edge_sorting_enabled BOOLEAN DEFAULT FALSE,
    track_burned_cards BOOLEAN DEFAULT TRUE,
    show_pattern_analysis BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    total_hands INTEGER DEFAULT 0,
    current_shoe_penetration DECIMAL(5,2) DEFAULT 0.00
);

-- Hands table
CREATE TABLE api.hands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES api.games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hand_number INTEGER NOT NULL,
    player_cards JSONB NOT NULL,
    banker_cards JSONB NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('player', 'banker', 'tie')),
    player_total INTEGER NOT NULL,
    banker_total INTEGER NOT NULL,
    player_pair BOOLEAN DEFAULT FALSE,
    banker_pair BOOLEAN DEFAULT FALSE,
    edge_calculations JSONB,
    pattern_data JSONB
);

-- Burned cards table
CREATE TABLE api.burned_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES api.games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    card_rank TEXT NOT NULL CHECK (card_rank IN ('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K')),
    card_suit TEXT NOT NULL CHECK (card_suit IN ('hearts', 'diamonds', 'clubs', 'spades')),
    card_value INTEGER NOT NULL CHECK (card_value BETWEEN 0 AND 9),
    is_edge_sorted BOOLEAN DEFAULT FALSE,
    edge_sort_orientation TEXT CHECK (edge_sort_orientation IN ('high', 'low', 'unknown'))
);

-- Edge calculations table
CREATE TABLE api.edge_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES api.games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    hand_number INTEGER NOT NULL,
    player_edge DECIMAL(8,4) NOT NULL,
    banker_edge DECIMAL(8,4) NOT NULL,
    tie_edge DECIMAL(8,4) NOT NULL,
    player_pair_edge DECIMAL(8,4) NOT NULL,
    banker_pair_edge DECIMAL(8,4) NOT NULL,
    confidence_level DECIMAL(5,2) NOT NULL,
    cards_remaining INTEGER NOT NULL,
    burned_cards_impact JSONB,
    edge_sorting_advantage DECIMAL(8,4) DEFAULT 0.0000
);
```

### Create Indexes for Performance

```sql
-- Indexes for better query performance
CREATE INDEX idx_hands_game_id ON api.hands(game_id);
CREATE INDEX idx_hands_created_at ON api.hands(created_at);
CREATE INDEX idx_burned_cards_game_id ON api.burned_cards(game_id);
CREATE INDEX idx_edge_calculations_game_id ON api.edge_calculations(game_id);
CREATE INDEX idx_edge_calculations_hand_number ON api.edge_calculations(hand_number);
```

### Set Up Row Level Security (RLS)

Enable RLS for all tables:

```sql
-- Enable RLS
ALTER TABLE api.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.burned_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.edge_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on games" ON api.games FOR ALL USING (true);
CREATE POLICY "Allow all operations on hands" ON api.hands FOR ALL USING (true);
CREATE POLICY "Allow all operations on burned_cards" ON api.burned_cards FOR ALL USING (true);
CREATE POLICY "Allow all operations on edge_calculations" ON api.edge_calculations FOR ALL USING (true);
```

### Create Updated At Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for games table
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON api.games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 3: Get Your Supabase Credentials

1. Go to your project settings
2. Navigate to "API" section
3. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: Your public API key

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit your `.env.local` file to version control. It's already included in `.gitignore`.

## Step 5: Test the Connection

The application includes a connection test utility. After setting up your environment variables, you can test the connection by running the development server and checking the browser console for connection status.

## Security Considerations

### Production Setup

For production environments, consider:

1. **Stricter RLS Policies**: Implement user-based access control
2. **API Key Rotation**: Regularly rotate your API keys
3. **Database Backups**: Set up automated backups
4. **Monitoring**: Enable database monitoring and alerts

### Example Production RLS Policy

```sql
-- Example: User-based access control (requires authentication)
CREATE POLICY "Users can only access their own games"
ON api.games FOR ALL
USING (auth.uid() = user_id);
```

## Database Schema Overview

### Tables Relationship

```
api.games (1) ──── (many) api.hands
    │
    ├── (many) api.burned_cards
    │
    └── (many) api.edge_calculations
```

### Key Features

- **UUID Primary Keys**: For better security and distribution
- **JSONB Fields**: For flexible data storage (edge calculations, pattern data)
- **Constraints**: Data validation at database level
- **Indexes**: Optimized for common query patterns
- **Triggers**: Automatic timestamp updates

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify your environment variables
2. **Permission Denied**: Check RLS policies
3. **Schema Not Found**: Ensure the `api` schema was created
4. **Type Errors**: Verify TypeScript types match database schema

### Useful SQL Queries

```sql
-- Check table structure
\d api.games

-- View recent hands
SELECT * FROM api.hands ORDER BY created_at DESC LIMIT 10;

-- Check burned cards impact
SELECT card_rank, COUNT(*) as count
FROM api.burned_cards
GROUP BY card_rank
ORDER BY count DESC;

-- View edge calculation trends
SELECT hand_number, player_edge, banker_edge
FROM api.edge_calculations
ORDER BY hand_number;
```

## Support

For additional help:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Next Steps

After completing this setup:

1. Run the application: `yarn dev`
2. Test database operations through the UI
3. Monitor performance in Supabase dashboard
4. Consider implementing additional features like real-time subscriptions
