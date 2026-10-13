import {
  EventDef,
  GameResult,
  Player,
  Rarity,
  RoundOutcome,
  SportConfig,
  TeamState,
} from "./types";
import { Rng, clamp, int, weightedIndex } from "./rng";
import { randomName } from "./names";

export const RARITY: Record<Rarity, { weight: number; min: number; max: number; color: string }> = {
  common: { weight: 50, min: 55, max: 70, color: "#94a3b8" },
  rare: { weight: 30, min: 70, max: 82, color: "#38bdf8" },
  epic: { weight: 15, min: 82, max: 92, color: "#c084fc" },
  legendary: { weight: 5, min: 92, max: 99, color: "#fbbf24" },
};

const RARITIES = Object.keys(RARITY) as Rarity[];

let counter = 0;
const uid = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`;

export function rarityForRating(rating: number): Rarity {
  if (rating >= 92) return "legendary";
  if (rating >= 82) return "epic";
  if (rating >= 70) return "rare";
  return "common";
}

export function rollPlayer(rng: Rng, slot: string): Player {
  const rarity = RARITIES[weightedIndex(rng, RARITIES.map((r) => RARITY[r].weight))];
  const { min, max } = RARITY[rarity];
  return { id: uid(), name: randomName(rng), slot, rating: int(rng, min, max), rarity };
}

/** The wheel for one draft pick: n candidates for the same slot. */
export function rollCandidates(rng: Rng, slot: string, n = 8): Player[] {
  return Array.from({ length: n }, () => rollPlayer(rng, slot));
}

export function emptyTeam(): TeamState {
  return { lineup: {}, permBoost: 0, nextBoost: 0, nextOppBoost: 0 };
}

export function teamRating(cfg: SportConfig, team: TeamState, includeNext = true): number {
  let sum = 0;
  let wsum = 0;
  for (const slot of cfg.slots) {
    const p = team.lineup[slot.key];
    if (!p) continue;
    sum += p.rating * slot.weight;
    wsum += slot.weight;
  }
  const base = wsum ? sum / wsum : 0;
  return base + team.permBoost + (includeNext ? team.nextBoost : 0);
}

// ---------- Events ----------

export const SHARED_EVENTS: EventDef[] = [
  { kind: "hot_streak", label: "Hot streak", emoji: "🔥", weight: 18, color: "#ef4444", blurb: "+6 team rating for the next round." },
  { kind: "scout", label: "Scouting win", emoji: "🔭", weight: 14, color: "#22c55e", blurb: "One random player gets +8 for good." },
  { kind: "coach", label: "New tactics", emoji: "📋", weight: 12, color: "#14b8a6", blurb: "+3 team rating for the rest of the run." },
  { kind: "trade", label: "Trade", emoji: "🔄", weight: 12, color: "#a78bfa", blurb: "A random player is swapped for a fresh gamble." },
  { kind: "injury", label: "Injury", emoji: "🩹", weight: 14, color: "#f43f5e", blurb: "A random player loses 12 rating." },
  { kind: "rival_scouting", label: "Rival scouted you", emoji: "🕵️", weight: 10, color: "#fb923c", blurb: "Next opponent gets +5." },
  { kind: "quiet", label: "Quiet week", emoji: "😴", weight: 14, color: "#64748b", blurb: "Nothing happens." },
];

export function eventsFor(cfg: SportConfig): EventDef[] {
  return [...SHARED_EVENTS, ...(cfg.extraEvents ?? [])];
}

export interface EventResult {
  team: TeamState;
  message: string;
}

export function applyEvent(cfg: SportConfig, team: TeamState, ev: EventDef, rng: Rng): EventResult {
  const next: TeamState = { ...team, lineup: { ...team.lineup } };
  const slots = cfg.slots.map((s) => s.key);
  const slotKey = slots[int(rng, 0, slots.length - 1)];
  const victim = next.lineup[slotKey];

  switch (ev.kind) {
    case "hot_streak":
      next.nextBoost += 6;
      return { team: next, message: "The squad is flying. +6 rating next round." };
    case "scout": {
      const r = clamp(victim.rating + 8, 40, 99);
      next.lineup[slotKey] = { ...victim, rating: r, rarity: rarityForRating(r) };
      return { team: next, message: `${victim.name} levels up: ${victim.rating} to ${r}.` };
    }
    case "coach":
      next.permBoost += 3;
      return { team: next, message: "New tactics click. +3 for the rest of the run." };
    case "trade": {
      const fresh = rollPlayer(rng, slotKey);
      next.lineup[slotKey] = fresh;
      return { team: next, message: `${victim.name} (${victim.rating}) out, ${fresh.name} (${fresh.rating}) in.` };
    }
    case "injury": {
      const r = clamp(victim.rating - 12, 40, 99);
      next.lineup[slotKey] = { ...victim, rating: r, rarity: rarityForRating(r) };
      return { team: next, message: `${victim.name} is hurt: ${victim.rating} to ${r}.` };
    }
    case "rival_scouting":
      next.nextOppBoost += 5;
      return { team: next, message: "Your next opponent did their homework. +5 for them." };
    case "wildcard": {
      const good = rng() < 0.55;
      if (good) {
        next.nextBoost += 10;
        return { team: next, message: "It breaks your way. +10 rating next round." };
      }
      next.nextBoost -= 6;
      return { team: next, message: "It breaks the wrong way. -6 rating next round." };
    }
    default:
      return { team: next, message: "Nothing happens." };
  }
}

// ---------- Matches ----------

export function winProbability(you: number, opp: number): number {
  return 1 / (1 + Math.exp(-(you - opp) / 25));
}

function playGame(cfg: SportConfig, you: number, opp: number, rng: Rng): GameResult {
  const s = cfg.sample(you, opp, rng);
  if (s.you !== s.opp) return s;
  const youWin = rng() < winProbability(you, opp);
  return {
    you: s.you + (youWin ? 1 : 0),
    opp: s.opp + (youWin ? 0 : 1),
    tiebreak: cfg.tiebreak,
  };
}

/** Play one round (single game or a series). Applies and clears the one-round modifiers. */
export function playRound(
  cfg: SportConfig,
  team: TeamState,
  roundIdx: number,
  rng: Rng,
): { outcome: RoundOutcome; team: TeamState; yourRating: number; oppRating: number } {
  const round = cfg.rounds[roundIdx];
  const yourRating = teamRating(cfg, team);
  const oppRating = round.strength + team.nextOppBoost;
  const need = Math.ceil(cfg.bestOf / 2);
  const games: GameResult[] = [];
  let w = 0;
  let l = 0;
  while (w < need && l < need) {
    const g = playGame(cfg, yourRating, oppRating, rng);
    games.push(g);
    if (g.you > g.opp) w++;
    else l++;
  }
  return {
    outcome: { round: round.name, games, won: w > l },
    team: { ...team, nextBoost: 0, nextOppBoost: 0 },
    yourRating,
    oppRating,
  };
}
