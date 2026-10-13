# Sports Roulette

Pick a sport, spin the wheel to draft your lineup, survive random events, and fight through the bracket to win the title. Inspired by [Pokémon Roulette](https://github.com/zeroxm/pokemon-roulette), but with sports instead of Pokémon.

All players are procedurally generated and fictional, so there is no licensing to worry about.

## Sports

| Sport | Lineup | Format |
|---|---|---|
| ⚽ Football | 7 players | 5 knockout rounds, single match, penalties on a draw |
| 🏀 Basketball | 5 players | 5 playoff rounds, best of 3 |
| 🏒 Hockey | 6 players | 5 playoff rounds, best of 3 |
| 🌀 Crossover | 6 players | One squad built from all three sports, 5 rounds, best of 3 |

## How a run works

1. **Draft.** For each lineup slot a wheel of 8 candidates spins. You can sign the result or use your one reroll per run.
2. **Event wheel.** Before every round a weighted wheel decides what happens: hot streak, injury, trade, scouting win, new tactics, a rival scouting you, a quiet week, or a sport-specific wildcard.
3. **Preview.** Every round has a named opponent, and once the event resolves you see a win-chance meter estimated from 600 simulated rounds.
4. **Match.** Team rating (position-weighted average plus boosts) goes up against the round's opponent. Scores are sampled per sport: Poisson goals for football and hockey, normally distributed points for basketball.
5. **Title or elimination.** Share your result as emoji, and your best players land in a local Hall of Fame (browser `localStorage`).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run sim      # balance check: plays 5000 full runs per sport
```

## Add a sport

The engine and UI are generic, so a sport is just a config:

1. Copy `lib/sports/hockey.ts` to `lib/sports/<yoursport>.ts`.
2. Set `slots`, `rounds`, `bestOf`, the `sample()` scoring function and an optional wildcard event.
3. Add it to the list in `lib/sports/index.ts`.
4. Run `npm run sim` to check the title rate (aim for roughly 5-12% with pure luck).

## Deploy

Import the repo on [Vercel](https://vercel.com/new). It is a stock Next.js app, so there is nothing to configure.

## Ideas

- Real-world player packs (needs a data source and a look at licensing)
- Shareable run results
- More sports: baseball, rugby, volleyball

## License

MIT
