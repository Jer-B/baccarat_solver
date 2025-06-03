Verify all below points are done intensively and dry and fix them. tired to send the same request without proper result. I i say there is a problem there is one dont contredict me for below requests, so investigate !!!

can we change minimum from 0.05 to 0.2 for bet validation ? up to 2 digit after decimal. so 0.21 should works too.
/Users/hei02/Desktop/Main/baccarat/improved_baccarat_assistant/src/components/session/sections/BettingInterfaceSection.vue

122222222 , 10000 , 2000 isnt formatted if inputted manually.
When 4, 5 and 6 digits are inputted in bet amount or balance. I want them to be correctly formatted and easily readable as human. so an automatic "," should be added for such digits pattern. even for manually inputted data -> still dont work on manual input in the session control starting balance settings. in real time for balance input before session start and for betting amount as well

when starting balance is set to a number too big when starting the session , like 890500000, when starting the session it gets reset to $10000 when session starts at that place and int the current initial balance of the betting section. and that big number isnt saved to the DB anymore as end balance on session ending.

On ending the session if i didnt cleared hands and made a full game sequence, and have a pending bet, the pending bet isnt cancelled and showed balance still has the substracted bet amount of the pending bet.

In the betting balance, if i tried to input 0.05 manually it doesnt work , cant do 0.06 etc... number is reset to 0.05 when i input "0" then "." . re-resolve that.

I updated the schema with last changes. lets keep it as memo down here in case

```
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE api.burned_cards (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  game_id uuid NOT NULL,
  card_value text NOT NULL,
  card_suit text NOT NULL CHECK (card_suit = ANY (ARRAY['hearts'::text, 'diamonds'::text, 'clubs'::text, 'spades'::text])),
  burned_at timestamp with time zone DEFAULT now(),
  position_in_shoe integer NOT NULL,
  CONSTRAINT burned_cards_pkey PRIMARY KEY (id),
  CONSTRAINT burned_cards_game_id_fkey FOREIGN KEY (game_id) REFERENCES api.games(id)
);
CREATE TABLE api.edge_calculations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  game_id uuid NOT NULL,
  hand_id uuid NOT NULL,
  calculated_at timestamp with time zone DEFAULT now(),
  player_edge numeric NOT NULL,
  banker_edge numeric NOT NULL,
  tie_edge numeric NOT NULL,
  player_pair_edge numeric NOT NULL,
  banker_pair_edge numeric NOT NULL,
  confidence numeric NOT NULL CHECK (confidence >= 0::numeric AND confidence <= 1::numeric),
  cards_remaining integer NOT NULL,
  CONSTRAINT edge_calculations_pkey PRIMARY KEY (id),
  CONSTRAINT edge_calculations_hand_id_fkey FOREIGN KEY (hand_id) REFERENCES api.hands(id),
  CONSTRAINT edge_calculations_game_id_fkey FOREIGN KEY (game_id) REFERENCES api.games(id)
);
CREATE TABLE api.games (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  number_of_decks integer NOT NULL,
  cut_card_position integer NOT NULL,
  total_hands integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text])),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT games_pkey PRIMARY KEY (id)
);
CREATE TABLE api.hands (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  game_id uuid NOT NULL,
  hand_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  player_cards ARRAY NOT NULL,
  banker_cards ARRAY NOT NULL,
  player_total integer NOT NULL CHECK (player_total >= 0 AND player_total <= 9),
  banker_total integer NOT NULL CHECK (banker_total >= 0 AND banker_total <= 9),
  outcome text NOT NULL CHECK (outcome = ANY (ARRAY['player'::text, 'banker'::text, 'tie'::text])),
  player_pair boolean NOT NULL DEFAULT false,
  banker_pair boolean NOT NULL DEFAULT false,
  is_natural boolean NOT NULL DEFAULT false,
  cards_remaining integer NOT NULL,
  penetration numeric NOT NULL CHECK (penetration >= 0::numeric AND penetration <= 1::numeric),
  bet_type text CHECK (bet_type IS NULL OR (bet_type = ANY (ARRAY['player'::text, 'banker'::text, 'tie'::text, 'playerPair'::text, 'bankerPair'::text]))),
  bet_amount numeric,
  bet_won boolean,
  bet_payout numeric,
  bet_net_result numeric,
  balance_before numeric,
  balance_after numeric,
  CONSTRAINT hands_pkey PRIMARY KEY (id),
  CONSTRAINT hands_game_id_fkey FOREIGN KEY (game_id) REFERENCES api.games(id)
);
CREATE TABLE api.payout_presets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  player_payout numeric NOT NULL DEFAULT 1.00 CHECK (player_payout >= 0::numeric),
  banker_payout numeric NOT NULL DEFAULT 1.00 CHECK (banker_payout >= 0::numeric),
  banker_commission numeric NOT NULL DEFAULT 0.050 CHECK (banker_commission >= 0::numeric AND banker_commission <= 1::numeric),
  tie_payout numeric NOT NULL DEFAULT 8.00 CHECK (tie_payout >= 0::numeric),
  player_pair_payout numeric NOT NULL DEFAULT 11.00 CHECK (player_pair_payout >= 0::numeric),
  banker_pair_payout numeric NOT NULL DEFAULT 11.00 CHECK (banker_pair_payout >= 0::numeric),
  is_default boolean NOT NULL DEFAULT false,
  is_system_preset boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payout_presets_pkey PRIMARY KEY (id)
);
CREATE TABLE api.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone,
  duration_seconds integer,
  total_hands integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'interrupted'::text])),
  session_name text NOT NULL,
  cards_remaining integer,
  start_balance numeric,
  end_balance numeric,
  session_lifecycle_flag integer NOT NULL DEFAULT 1 CHECK (session_lifecycle_flag = ANY (ARRAY[1, 2, 3])),
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id)
);
```
