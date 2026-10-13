// Balance check: plays many full runs per sport with pure-luck drafting.
// Usage: npm run sim [runs]
import { SPORTS } from "../lib/sports";
import { applyEvent, emptyTeam, eventsFor, playRound, rollPlayer, teamRating } from "../lib/engine";
import { seeded, weightedIndex } from "../lib/rng";

const RUNS = Number(process.argv[2] ?? 5000);

for (const cfg of SPORTS) {
  const rng = seeded(42);
  const events = eventsFor(cfg);
  const reached = new Array(cfg.rounds.length + 1).fill(0);
  let titles = 0;
  let ratingSum = 0;

  for (let run = 0; run < RUNS; run++) {
    let team = emptyTeam();
    for (const slot of cfg.slots) team.lineup[slot.key] = rollPlayer(rng, slot.key);
    ratingSum += teamRating(cfg, team);

    let cleared = 0;
    for (let r = 0; r < cfg.rounds.length; r++) {
      const ev = events[weightedIndex(rng, events.map((e) => e.weight))];
      team = applyEvent(cfg, team, ev, rng).team;
      const res = playRound(cfg, team, r, rng);
      team = res.team;
      if (!res.outcome.won) break;
      cleared++;
    }
    reached[cleared]++;
    if (cleared === cfg.rounds.length) titles++;
  }

  console.log(`\n${cfg.emoji} ${cfg.name}  (avg draft rating ${(ratingSum / RUNS).toFixed(1)})`);
  console.log(`  title rate: ${((titles / RUNS) * 100).toFixed(1)}%`);
  cfg.rounds.forEach((rd, i) => {
    console.log(`  out in ${rd.name.padEnd(18)} ${((reached[i] / RUNS) * 100).toFixed(1)}%`);
  });
}
