import { SportConfig } from "../types";
import { normal } from "../rng";

export const basketball: SportConfig = {
  id: "basketball",
  name: "Basketball",
  emoji: "🏀",
  tagline: "Build a starting five and take the playoff bracket, series by series.",
  slots: [
    { key: "PG", label: "Point Guard", weight: 1.0 },
    { key: "SG", label: "Shooting Guard", weight: 1.0 },
    { key: "SF", label: "Small Forward", weight: 1.0 },
    { key: "PF", label: "Power Forward", weight: 1.0 },
    { key: "C", label: "Center", weight: 1.0 },
  ],
  rounds: [
    { name: "Play-In", strength: 57 },
    { name: "First Round", strength: 63 },
    { name: "Semifinals", strength: 69 },
    { name: "Conference Finals", strength: 75 },
    { name: "Finals", strength: 81 },
  ],
  bestOf: 3,
  unit: "points",
  tiebreak: "overtime",
  sample(you, opp, rng) {
    const d = you - opp;
    return {
      you: Math.max(60, Math.round(normal(rng, 104 + d * 0.5, 9))),
      opp: Math.max(60, Math.round(normal(rng, 104 - d * 0.5, 9))),
    };
  },
  extraEvents: [
    {
      kind: "wildcard",
      label: "Buzzer-beater vibes",
      emoji: "⏱️",
      weight: 8,
      color: "#f97316",
      blurb: "Anything can happen. Big swing next game.",
    },
  ],
};
