# 🚀 Quick Supabase Setup - Create Tables

Follow these exact steps to create your database tables.

## Step 1: Open SQL Editor

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** (the + button)

## Step 2: Copy & Paste Schema

1. Open the file `supabase-schema.sql` in this project
2. Select ALL content (Cmd+A or Ctrl+A)
3. Copy it (Cmd+C or Ctrl+C)
4. Paste into the Supabase SQL Editor
5. Click **"Run"** button

## Step 3: Configure API Access

1. Go to **Settings** → **API** in your Supabase dashboard
2. Find **"Exposed schemas"** section
3. Add `api` to the list (if not already there)
4. Save changes

## Step 4: Verify Tables Created

After running the schema, you should see these tables in the **Table Editor**:

- ✅ `api.games`
- ✅ `api.hands`
- ✅ `api.burned_cards`
- ✅ `api.edge_calculations`

## Step 5: Test Connection

1. Make sure your `.env.local` file has the correct credentials
2. Run `yarn dev` in your project
3. Check browser console for connection status

---

## 🔧 Troubleshooting

### "No tables showing up"

- Make sure you ran the **complete** schema (all 106 lines)
- Check that you added `api` to exposed schemas
- Refresh your Supabase dashboard

### "Permission denied"

- Verify the RLS policies were created
- Check that the GRANT statements ran successfully

### "Schema not found"

- Ensure `CREATE SCHEMA IF NOT EXISTS api;` ran first
- Try running just that line, then the rest

---

## 📋 Quick Test Query

After setup, test with this query in SQL Editor:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'api';
```

Should return:

- games
- hands
- burned_cards
- edge_calculations
