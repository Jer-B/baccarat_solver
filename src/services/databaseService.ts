import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { Card, HandResult } from '../types/cards';

type Tables = Database['api']['Tables'];
type GameRow = Tables['games']['Row'];
type GameInsert = Tables['games']['Insert'];
type HandRow = Tables['hands']['Row'];
type HandInsert = Tables['hands']['Insert'];
type BurnedCardInsert = Tables['burned_cards']['Insert'];
type EdgeCalculationInsert = Tables['edge_calculations']['Insert'];

export class DatabaseService {
  // Game Management
  async createGame(numberOfDecks: number, cutCardPosition: number): Promise<string> {
    const gameData: GameInsert = {
      number_of_decks: numberOfDecks,
      cut_card_position: cutCardPosition,
      total_hands: 0,
      status: 'active',
      metadata: {},
    };

    const { data, error } = await supabase.from('games').insert(gameData).select('id').single();

    if (error) {
      throw new Error(`Failed to create game: ${error.message}`);
    }

    return data.id;
  }

  async updateGameStatus(gameId: string, status: 'active' | 'completed'): Promise<void> {
    const { error } = await supabase
      .from('games')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', gameId);

    if (error) {
      throw new Error(`Failed to update game status: ${error.message}`);
    }
  }

  async getActiveGame(): Promise<GameRow | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw new Error(`Failed to get active game: ${error.message}`);
    }

    return data;
  }

  // Hand Management
  async saveHand(
    gameId: string,
    handNumber: number,
    playerCards: Card[],
    bankerCards: Card[],
    result: HandResult,
    cardsRemaining: number,
    penetration: number
  ): Promise<string> {
    const handData: HandInsert = {
      game_id: gameId,
      hand_number: handNumber,
      player_cards: playerCards.map(card => `${card.rank}${card.suit}`),
      banker_cards: bankerCards.map(card => `${card.rank}${card.suit}`),
      player_total: result.playerTotal,
      banker_total: result.bankerTotal,
      outcome: result.winner,
      player_pair: result.playerPair,
      banker_pair: result.bankerPair,
      natural: result.natural,
      cards_remaining: cardsRemaining,
      penetration,
    };

    const { data, error } = await supabase.from('hands').insert(handData).select('id').single();

    if (error) {
      throw new Error(`Failed to save hand: ${error.message}`);
    }

    // Update game total hands count
    await supabase.rpc('increment_game_hands', { game_id: gameId });

    return data.id;
  }

  async getGameHands(gameId: string, limit = 50): Promise<HandRow[]> {
    const { data, error } = await supabase
      .from('hands')
      .select('*')
      .eq('game_id', gameId)
      .order('hand_number', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get game hands: ${error.message}`);
    }

    return data || [];
  }

  // Burned Cards Management
  async saveBurnedCard(gameId: string, card: Card, positionInShoe: number): Promise<void> {
    const burnedCardData: BurnedCardInsert = {
      game_id: gameId,
      card_value: card.rank,
      card_suit: card.suit,
      position_in_shoe: positionInShoe,
    };

    const { error } = await supabase.from('burned_cards').insert(burnedCardData);

    if (error) {
      throw new Error(`Failed to save burned card: ${error.message}`);
    }
  }

  // Edge Calculations
  async saveEdgeCalculation(
    gameId: string,
    handId: string,
    edges: {
      playerEdge: number;
      bankerEdge: number;
      tieEdge: number;
      playerPairEdge: number;
      bankerPairEdge: number;
      confidence: number;
    },
    cardsRemaining: number
  ): Promise<void> {
    const edgeData: EdgeCalculationInsert = {
      game_id: gameId,
      hand_id: handId,
      player_edge: edges.playerEdge,
      banker_edge: edges.bankerEdge,
      tie_edge: edges.tieEdge,
      player_pair_edge: edges.playerPairEdge,
      banker_pair_edge: edges.bankerPairEdge,
      confidence: edges.confidence,
      cards_remaining: cardsRemaining,
    };

    const { error } = await supabase.from('edge_calculations').insert(edgeData);

    if (error) {
      throw new Error(`Failed to save edge calculation: ${error.message}`);
    }
  }

  // Analytics
  async getGameStatistics(gameId: string): Promise<{
    totalHands: number;
    playerWins: number;
    bankerWins: number;
    ties: number;
    playerPairs: number;
    bankerPairs: number;
    naturals: number;
  }> {
    const { data, error } = await supabase
      .from('hands')
      .select('outcome, player_pair, banker_pair, natural')
      .eq('game_id', gameId);

    if (error) {
      throw new Error(`Failed to get game statistics: ${error.message}`);
    }

    const stats = {
      totalHands: data.length,
      playerWins: data.filter(h => h.outcome === 'player').length,
      bankerWins: data.filter(h => h.outcome === 'banker').length,
      ties: data.filter(h => h.outcome === 'tie').length,
      playerPairs: data.filter(h => h.player_pair).length,
      bankerPairs: data.filter(h => h.banker_pair).length,
      naturals: data.filter(h => h.natural).length,
    };

    return stats;
  }

  async getRecentEdgeCalculations(gameId: string, limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('edge_calculations')
      .select('*')
      .eq('game_id', gameId)
      .order('calculated_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get edge calculations: ${error.message}`);
    }

    return data || [];
  }
}

export const databaseService = new DatabaseService();
