# Database Schema Migrations

Track your schema changes here during development.

## Version 1.0 - Initial Schema

**Date**: 2024-05-25
**Status**: ✅ Applied

### Tables Created:

- `api.games` - Game sessions
- `api.hands` - Individual hands
- `api.burned_cards` - Burned cards tracking
- `api.edge_calculations` - Edge calculation history

### Features:

- UUID primary keys
- Row Level Security enabled
- Performance indexes
- Data validation constraints

---

## Future Migrations

### Version 1.1 - Planned Changes

**Status**: 🚧 Planning

Potential improvements:

- [ ] Add `user_id` for multi-user support
- [ ] Add `session_notes` to games table
- [ ] Add `betting_history` table
- [ ] Add `pattern_analysis` table
- [ ] Optimize indexes based on usage patterns

### Migration Commands Template:

```sql
-- Version 1.1 Migration
-- Add user support
ALTER TABLE api.games ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add session notes
ALTER TABLE api.games ADD COLUMN notes TEXT;

-- Update RLS policies for user isolation
DROP POLICY "Allow all operations on games" ON api.games;
CREATE POLICY "Users can only access their own games"
ON api.games FOR ALL
USING (auth.uid() = user_id);
```

---

## Quick Reset Commands

### Reset Single Table:

```sql
TRUNCATE api.hands CASCADE;
```

### Reset All Data (Keep Structure):

```sql
TRUNCATE api.games CASCADE;
```

### Complete Schema Reset:

```sql
DROP SCHEMA api CASCADE;
-- Then run supabase-schema.sql again
```

---

## Testing Queries

### Check Schema Status:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'api';

-- Check table structure
\d api.games
```

### Sample Data Queries:

```sql
-- Count records
SELECT
  (SELECT COUNT(*) FROM api.games) as games,
  (SELECT COUNT(*) FROM api.hands) as hands,
  (SELECT COUNT(*) FROM api.burned_cards) as burned_cards;
```
