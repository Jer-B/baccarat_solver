import { databaseService } from '../services/databaseService';

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing Supabase connection...');

    // Try to get active game (this will test the connection)
    const activeGame = await databaseService.getActiveGame();
    console.log('✅ Supabase connection successful!');

    if (activeGame) {
      console.log('📊 Found active game:', activeGame.id);
    } else {
      console.log('📝 No active game found (this is normal for first run)');
    }

    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

export async function createTestGame(): Promise<string | null> {
  try {
    console.log('🎰 Creating test game...');

    const gameId = await databaseService.createGame(8, 20);
    console.log('✅ Test game created with ID:', gameId);

    return gameId;
  } catch (error) {
    console.error('❌ Failed to create test game:', error);
    return null;
  }
}
