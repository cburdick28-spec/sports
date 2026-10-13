import { SportConfig } from "../types";
import { poisson } from "../rng";

export const football: SportConfig = {
  id: "football",
  name: "Football",
  emoji: "⚽",
  tagline: "Draft an XI and fight through a knockout cup.",
  slots: [
    { key: "GK", label: "Goalkeeper", weight: 1.0 },
    { key: "DF1", label: "Defender", weight: 0.9 },
    { key: "DF2", label: "Defender", weight: 0.9 },
    { key: "MF1", label: "Midfielder", weight: 1.0 },
    { key: "MF2", label: "Midfielder", weight: 1.0 },
    { key: "FW1", label: "Forward", weight: 1.15 },
    { key: "FW2", label: "Forward", weight: 1.15 },
  ],
  rounds: [
    { name: "Group Stage", strength: 57 },
    { name: "Round of 16", strength: 63 },
    { name: "Quarterfinal", strength: 69 },
    { name: "Semifinal", strength: 75 },
    { name: "Final", strength: 81 },
  ],
  bestOf: 1,
  unit: "goals",
  tiebreak: "penalties",
  sample(you, opp, rng) {
    const d = you - opp;
    return {
      you: poisson(rng, 1.35 * Math.exp(d / 40)),
      opp: poisson(rng, 1.35 * Math.exp(-d / 40)),
    };
  },
  extraEvents: [
    {
      kind: "wildcard",
      label: "Referee drama",
      emoji: "🟨",
      weight: 8,
      color: "#eab308",
      blurb: "Chaos on the pitch. Big swing next match.",
    },
  ],
};
