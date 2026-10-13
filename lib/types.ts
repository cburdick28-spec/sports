export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Player {
  id: string;
  name: string;
  slot: string;
  rating: number;
  rarity: Rarity;
}

export interface Slot {
  key: string;
  label: string;
  /** How much this slot counts toward team rating. */
  weight: number;
}

export interface RoundDef {
  name: string;
  /** Opponent team rating for this round. */
  strength: number;
}

export interface GameResult {
  you: number;
  opp: number;
  /** Set when a tie was settled by penalties / overtime. */
  tiebreak?: string;
}

export interface SportConfig {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  slots: Slot[];
  rounds: RoundDef[];
  /** Games per round: 1 = single game, 3 = best of 3, etc. */
  bestOf: number;
  /** Score unit label, e.g. "goals". */
  unit: string;
  /** Sample a final score given both team ratings. Ties allowed; engine breaks them. */
  sample: (you: number, opp: number, rng: () => number) => { you: number; opp: number };
  /** Label for how ties are settled. */
  tiebreak: string;
  /** Sport-specific event slices added to the shared event wheel. */
  extraEvents?: EventDef[];
}

export type EventKind =
  | "hot_streak"
  | "injury"
  | "trade"
  | "coach"
  | "scout"
  | "rival_scouting"
  | "quiet"
  | "wildcard";

export interface EventDef {
  kind: EventKind;
  label: string;
  emoji: string;
  weight: number;
  color: string;
  blurb: string;
}

export interface TeamState {
  lineup: Record<string, Player>;
  /** Permanent boost from coach etc. */
  permBoost: number;
  /** One-match modifiers, cleared after the next round. */
  nextBoost: number;
  nextOppBoost: number;
}

export interface RoundOutcome {
  round: string;
  games: GameResult[];
  won: boolean;
}
