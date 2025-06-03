export interface Database {
  api: {
    Tables: {
      games: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          number_of_decks: number;
          cut_card_position: number;
          total_hands: number;
          status: 'active' | 'completed';
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          number_of_decks: number;
          cut_card_position: number;
          total_hands?: number;
          status?: 'active' | 'completed';
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          number_of_decks?: number;
          cut_card_position?: number;
          total_hands?: number;
          status?: 'active' | 'completed';
          metadata?: Record<string, any>;
        };
      };
      hands: {
        Row: {
          id: string;
          game_id: string;
          hand_number: number;
          created_at: string;
          player_cards: string[];
          banker_cards: string[];
          player_total: number;
          banker_total: number;
          outcome: 'player' | 'banker' | 'tie';
          player_pair: boolean;
          banker_pair: boolean;
          is_natural: boolean;
          cards_remaining: number;
          penetration: number;
          bet_type?: string | null;
          bet_amount?: number | null;
          bet_won?: boolean | null;
          bet_payout?: number | null;
          bet_net_result?: number | null;
          balance_before?: number | null;
          balance_after?: number | null;
        };
        Insert: {
          id?: string;
          game_id: string;
          hand_number: number;
          created_at?: string;
          player_cards: string[];
          banker_cards: string[];
          player_total: number;
          banker_total: number;
          outcome: 'player' | 'banker' | 'tie';
          player_pair: boolean;
          banker_pair: boolean;
          is_natural: boolean;
          cards_remaining: number;
          penetration: number;
          bet_type?: string | null;
          bet_amount?: number | null;
          bet_won?: boolean | null;
          bet_payout?: number | null;
          bet_net_result?: number | null;
          balance_before?: number | null;
          balance_after?: number | null;
        };
        Update: {
          id?: string;
          game_id?: string;
          hand_number?: number;
          created_at?: string;
          player_cards?: string[];
          banker_cards?: string[];
          player_total?: number;
          banker_total?: number;
          outcome?: 'player' | 'banker' | 'tie';
          player_pair?: boolean;
          banker_pair?: boolean;
          is_natural?: boolean;
          cards_remaining?: number;
          penetration?: number;
          bet_type?: string | null;
          bet_amount?: number | null;
          bet_won?: boolean | null;
          bet_payout?: number | null;
          bet_net_result?: number | null;
          balance_before?: number | null;
          balance_after?: number | null;
        };
      };
      burned_cards: {
        Row: {
          id: string;
          game_id: string;
          card_value: string;
          card_suit: string;
          burned_at: string;
          position_in_shoe: number;
        };
        Insert: {
          id?: string;
          game_id: string;
          card_value: string;
          card_suit: string;
          burned_at?: string;
          position_in_shoe: number;
        };
        Update: {
          id?: string;
          game_id?: string;
          card_value?: string;
          card_suit?: string;
          burned_at?: string;
          position_in_shoe?: number;
        };
      };
      edge_calculations: {
        Row: {
          id: string;
          game_id: string;
          hand_id: string;
          calculated_at: string;
          player_edge: number;
          banker_edge: number;
          tie_edge: number;
          player_pair_edge: number;
          banker_pair_edge: number;
          confidence: number;
          cards_remaining: number;
        };
        Insert: {
          id?: string;
          game_id: string;
          hand_id: string;
          calculated_at?: string;
          player_edge: number;
          banker_edge: number;
          tie_edge: number;
          player_pair_edge: number;
          banker_pair_edge: number;
          confidence: number;
          cards_remaining: number;
        };
        Update: {
          id?: string;
          game_id?: string;
          hand_id?: string;
          calculated_at?: string;
          player_edge?: number;
          banker_edge?: number;
          tie_edge?: number;
          player_pair_edge?: number;
          banker_pair_edge?: number;
          confidence?: number;
          cards_remaining?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
