import { Player } from "./types";

const KEY = "sports-roulette:v1";

export interface Save {
  runs: number;
  titles: number;
  bestBySport: Record<string, number>;
  /** Best players ever drafted, newest dedupe by name. */
  hallOfFame: (Player & { sport: string })[];
}

const empty = (): Save => ({ runs: 0, titles: 0, bestBySport: {}, hallOfFame: [] });

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

function write(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: progress just won't persist */
  }
}

export function recordRun(
  sport: string,
  roundsCleared: number,
  champion: boolean,
  lineup: Player[],
): Save {
  const s = loadSave();
  s.runs += 1;
  if (champion) s.titles += 1;
  s.bestBySport[sport] = Math.max(s.bestBySport[sport] ?? 0, roundsCleared);
  const merged = [...s.hallOfFame, ...lineup.map((p) => ({ ...p, sport }))];
  const byName = new Map<string, Player & { sport: string }>();
  for (const p of merged) {
    const prev = byName.get(p.name);
    if (!prev || p.rating > prev.rating) byName.set(p.name, p);
  }
  s.hallOfFame = [...byName.values()].sort((a, b) => b.rating - a.rating).slice(0, 12);
  write(s);
  return s;
}

export function resetSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
