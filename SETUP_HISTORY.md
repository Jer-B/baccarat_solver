# Session History Setup Instructions

## Step 1: Database Migration

You need to add the `user_sessions` table to your Supabase database.

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase-user-sessions.sql`
5. Click **Run** to execute the migration

## Step 2: Test the Functionality

1. Start the development server: `yarn dev`
2. Navigate to the **History** tab
3. Start a gaming session using the "Start Session" button
4. Play some hands or wait a few seconds
5. End the session using the "End Session" button
6. Check the History tab to see your recorded session

## What's Implemented

### ✅ Session Recording
- Sessions are automatically recorded to Supabase when you start/end them
- Each session gets a unique ID and tracks start/end times
- Duration and hand count are calculated automatically

### ✅ History Tab
- View all recorded sessions in a list
- Click on any session to select it and view details
- Delete sessions with the trash icon (with confirmation)
- Sessions show ID, name, status, duration, and hand count

### ✅ Session Analytics
- **Per-Session Analytics**: Shows detailed metrics for the selected session
  - Session name, total hands, duration, status
  - Start and end times
  - Performance metrics (hands per hour, average hand duration, efficiency)

### ✅ Global Analytics
- **Global Analytics**: Shows statistics across all sessions
  - Total sessions, total hands, completed vs active sessions
  - Average session duration and hands per session
  - Total playing time and performance insights
  - Session breakdown with visual progress bars

### ✅ Error Handling
- Graceful handling of database connection issues
- Sessions continue locally even if database fails
- Clear error messages and loading states

## Features Not Yet Implemented

The following features are planned for future implementation:

- **Session Details**: Individual hand history per session
- **Session Notes**: Ability to add notes to sessions
- **Advanced Filtering**: Filter sessions by date, duration, etc.
- **Export Functionality**: Export session data
- **Session Comparison**: Compare performance between sessions

## Database Schema

The `user_sessions` table includes:
- `id`: Unique session identifier
- `session_name`: Auto-generated session name
- `started_at`: Session start timestamp
- `ended_at`: Session end timestamp (null for active sessions)
- `duration_seconds`: Total session duration
- `total_hands`: Number of hands played
- `status`: 'active' or 'completed'
- `created_at`/`updated_at`: Record timestamps

## Troubleshooting

### "Failed to load session history"
- Check your Supabase connection in the browser console
- Verify the `user_sessions` table was created successfully
- Check your environment variables are correct

### Sessions not appearing
- Make sure you ran the SQL migration
- Check the browser console for any errors
- Verify the table has the correct permissions

### Database connection issues
- Sessions will still work locally even if database is unavailable
- Check your Supabase project status
- Verify your API keys are correct

## Next Steps

This is the foundation for the session history system. Future enhancements will include:
1. Individual hand tracking per session
2. Detailed session analytics with charts
3. Session comparison tools
4. Export and import functionality 