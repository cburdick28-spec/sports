import { SportConfig } from "../types";
import { poisson } from "../rng";

export const hockey: SportConfig = {
  id: "hockey",
  name: "Hockey",
  emoji: "🏒",
  tagline: "Assemble a line and grind out the cup, best-of-three at a time.",
  slots: [
    { key: "G", label: "Goalie", weight: 1.3 },
    { key: "D1", label: "Defenseman", weight: 0.9 },
    { key: "D2", label: "Defenseman", weight: 0.9 },
    { key: "W1", label: "Winger", weight: 1.0 },
    { key: "W2", label: "Winger", weight: 1.0 },
    { key: "C", label: "Center", weight: 1.1 },
  ],
  rounds: [
    { name: "Wild Card", strength: 57 },
    { name: "Round One", strength: 63 },
    { name: "Round Two", strength: 69 },
    { name: "Conference Final", strength: 75 },
    { name: "Cup Final", strength: 81 },
  ],
  bestOf: 3,
  unit: "goals",
  tiebreak: "overtime",
  sample(you, opp, rng) {
    const d = you - opp;
    return {
      you: poisson(rng, 2.9 * Math.exp(d / 50)),
      opp: poisson(rng, 2.9 * Math.exp(-d / 50)),
    };
  },
  extraEvents: [
    {
      kind: "wildcard",
      label: "Hot goalie",
      emoji: "🧤",
      weight: 8,
      color: "#38bdf8",
      blurb: "Somebody is standing on their head. Big swing next game.",
    },
  ],
};
