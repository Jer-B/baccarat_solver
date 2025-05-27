# Connection Status & Export/Import Features

## Overview

This document describes the new connection monitoring and data export/import features added to the Baccarat Assistant application.

## Features Implemented

### 1. Connection Status Banner

A dynamic banner that appears under the navigation tabs to show the current database connection status.

#### Banner States

- **🔵 Checking**: Blue banner with pulsing indicator while checking connection
- **🟢 Connected**: Green banner (auto-hides after successful connection)
- **🟠 Disconnected**: Orange banner with error details and action buttons

#### Error Detection

The system detects and displays specific error types:
- **Invalid API key configuration**: When Supabase API key is missing or invalid
- **Database tables not set up**: When the required tables don't exist
- **Network connection failed**: When there's a network connectivity issue
- **Unknown connection error**: For other unexpected errors

#### Banner Features

- **Retry Button**: Attempts to reconnect to the database
- **Export Button**: Downloads session data as JSON file
- **Import Button**: Uploads and imports session data from JSON file
- **Dismiss Button**: Hides the banner (reappears on page refresh if still disconnected)
- **Local Mode Notice**: Shows "Sessions will work locally" when disconnected

### 2. Session Data Export

#### JSON Export Format

```json
{
  "exportDate": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "sessions": [
    {
      "id": "uuid",
      "session_name": "Session Name",
      "status": "completed",
      "started_at": "2024-01-15T09:00:00.000Z",
      "ended_at": "2024-01-15T10:00:00.000Z",
      "duration_seconds": 3600,
      "total_hands": 25,
      "created_at": "2024-01-15T09:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "metadata": {
    "totalSessions": 1,
    "exportedBy": "Baccarat Assistant",
    "description": "Session history export from Baccarat Assistant application"
  }
}
```

#### CSV Export Format

```csv
ID,Session Name,Status,Started At,Ended At,Duration (seconds),Total Hands,Created At,Updated At
uuid,"Session Name",completed,2024-01-15T09:00:00.000Z,2024-01-15T10:00:00.000Z,3600,25,2024-01-15T09:00:00.000Z,2024-01-15T10:00:00.000Z
```

### 3. Session Data Import

#### Import Process

1. Click the "📤 Import" button in the connection banner
2. Select a JSON file exported from the application
3. The system validates the file format and data structure
4. Sessions are imported to the database (if connected) or stored locally
5. Success/error notifications are displayed

#### Import Validation

- Validates JSON structure and required fields
- Checks for missing session data
- Handles duplicate sessions gracefully
- Reports import statistics (imported/skipped counts)

## Technical Implementation

### Files Added/Modified

#### New Files
- `src/composables/useSupabaseConnection.ts` - Connection monitoring
- `src/composables/useSessionExport.ts` - Export/import functionality
- `src/components/ConnectionStatusBanner.vue` - Status banner component
- `database-schema.sql` - Complete database schema for fresh setup

#### Modified Files
- `src/App.vue` - Added connection status banner
- `src/services/sessionService.ts` - Added toast notifications for database errors

### Connection Monitoring

The `useSupabaseConnection` composable:
- Performs periodic connection health checks
- Detects specific error types (API key, network, database)
- Provides reactive connection status
- Offers manual retry functionality

### Export/Import System

The `useSessionExport` composable provides:
- **JSON Export**: Complete session data with metadata
- **CSV Export**: Spreadsheet-compatible format
- **JSON Import**: Validates and imports session data
- **File Handling**: Browser-based file download/upload

### Error Handling

All operations include comprehensive error handling:
- **Console Logging**: Structured logging with `[feature][category]` format
- **Toast Notifications**: User-friendly error messages
- **Graceful Degradation**: Local functionality when database unavailable
- **Validation**: Input validation for all import operations

## Database Schema

### Updated Schema File

The new `database-schema.sql` file provides:
- Complete schema for fresh database initialization
- User sessions table with proper indexing
- Game hands table (for future expansion)
- Burn cards table (for professional features)
- Row Level Security setup
- Utility functions for analytics
- Sample data (commented out)

### Migration vs Fresh Setup

- **Migration**: Use existing `supabase-user-sessions.sql` for adding to existing database
- **Fresh Setup**: Use new `database-schema.sql` for complete initialization

## Usage Instructions

### For Users

1. **Connection Issues**: If the orange banner appears, check your internet connection and Supabase configuration
2. **Export Data**: Click "📥 Export" to download your session history
3. **Import Data**: Click "📤 Import" to restore session data from a backup
4. **Local Mode**: Sessions work locally even when database is unavailable

### For Developers

1. **Database Setup**: Run `database-schema.sql` in Supabase SQL editor for fresh setup
2. **Environment Variables**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured
3. **Testing**: Use the retry button to test connection recovery
4. **Monitoring**: Check browser console for detailed connection status logs

## Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Connection Check Frequency

The connection is checked:
- On application startup
- When manually triggered via retry button
- After failed database operations

## Troubleshooting

### Common Issues

1. **"Invalid API key configuration"**
   - Check environment variables are set correctly
   - Verify Supabase project settings
   - Ensure API key has proper permissions

2. **"Database tables not set up"**
   - Run the database schema SQL in Supabase
   - Check table names match the schema
   - Verify Row Level Security policies

3. **"Network connection failed"**
   - Check internet connectivity
   - Verify Supabase URL is accessible
   - Check for firewall/proxy issues

4. **Import Failures**
   - Ensure JSON file format is correct
   - Check for required fields in session data
   - Verify database connection before importing

### Debug Information

Enable detailed logging by checking the browser console for:
- `[supabase][connection]` - Connection status logs
- `[session-export]` - Export operation logs
- `[session-import]` - Import operation logs
- `[session-tracking]` - Database operation logs

## Future Enhancements

Potential improvements for future versions:
- Automatic periodic connection checks
- Background sync when connection restored
- Compressed export formats
- Selective import (choose specific sessions)
- Export filtering by date range
- Backup scheduling
- Cloud storage integration

## Security Considerations

- Export files contain session data - handle securely
- Import validation prevents malicious data injection
- Row Level Security policies control database access
- API keys should be kept confidential
- Consider encryption for sensitive exports

This implementation provides a robust foundation for connection monitoring and data portability while maintaining the application's core functionality even when offline. 