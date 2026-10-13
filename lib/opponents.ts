import { Rng, pick } from "./rng";

const PLACES = [
  "Harbor", "Ironwood", "Summit", "Redstone", "Lakeside", "Northgate", "Sunvale", "Blackfen",
  "Crown City", "Port Meridian", "Highmoor", "Silverlake", "Dustbowl", "Eastbrook", "Kestrel Bay",
  "Thornfield", "Marrow Point", "Gold Coast", "Stormhaven", "Westridge",
];

const MASCOTS = [
  "Wolves", "Comets", "Titans", "Vipers", "Foxes", "Hammers", "Storm", "Falcons", "Wardens",
  "Rhinos", "Phantoms", "Mariners", "Embers", "Outlaws", "Giants", "Blaze", "Specters", "Bears",
];

/** Unique opponent names for a run, one per round. */
export function opponentNames(rng: Rng, count: number): string[] {
  const used = new Set<string>();
  const out: string[] = [];
  while (out.length < count) {
    const n = `${pick(rng, PLACES)} ${pick(rng, MASCOTS)}`;
    if (!used.has(n)) {
      used.add(n);
      out.push(n);
    }
  }
  return out;
}
