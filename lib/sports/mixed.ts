import { SportConfig } from "../types";
import { poisson } from "../rng";

// Crossover mode: one squad built from three sports. The engine does not care,
// because a sport is just slots, rounds and a scoring function.
export const mixed: SportConfig = {
  id: "mixed",
  name: "Crossover",
  emoji: "🌀",
  tagline: "A footballer, a hooper and a goalie walk into a bracket. Chaos mode.",
  slots: [
    { key: "M1", label: "⚽ Striker", weight: 1.1 },
    { key: "M2", label: "⚽ Keeper", weight: 1.0 },
    { key: "M3", label: "🏀 Guard", weight: 1.0 },
    { key: "M4", label: "🏀 Big man", weight: 1.0 },
    { key: "M5", label: "🏒 Goalie", weight: 1.1 },
    { key: "M6", label: "🏒 Winger", weight: 1.0 },
  ],
  rounds: [
    { name: "Open Round", strength: 57 },
    { name: "Clash Round", strength: 63 },
    { name: "Showdown", strength: 69 },
    { name: "Grand Semi", strength: 75 },
    { name: "Mega Final", strength: 81 },
  ],
  bestOf: 3,
  unit: "points",
  tiebreak: "sudden death",
  sample(you, opp, rng) {
    const d = you - opp;
    return {
      you: poisson(rng, 3.0 * Math.exp(d / 45)),
      opp: poisson(rng, 3.0 * Math.exp(-d / 45)),
    };
  },
  extraEvents: [
    {
      kind: "wildcard",
      label: "Crossover chaos",
      emoji: "🌀",
      weight: 8,
      color: "#e879f9",
      blurb: "The rules get weird. Big swing next game.",
    },
  ],
};
