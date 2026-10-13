"use client";

import { useEffect, useMemo, useState } from "react";
import Wheel, { WheelSlice } from "./Wheel";
import { SPORTS } from "@/lib/sports";
import {
  RARITY,
  applyEvent,
  emptyTeam,
  eventsFor,
  playRound,
  rollCandidates,
  teamRating,
} from "@/lib/engine";
import { defaultRng } from "@/lib/rng";
import { Save, loadSave, recordRun, resetSave } from "@/lib/storage";
import { EventDef, Player, RoundOutcome, SportConfig, TeamState } from "@/lib/types";

type Phase = "menu" | "draft" | "event" | "round" | "over";

const REROLLS = 1;

function lastName(name: string) {
  return name.split(" ").slice(1).join(" ") || name;
}

export default function Game() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [cfg, setCfg] = useState<SportConfig | null>(null);
  const [team, setTeam] = useState<TeamState>(emptyTeam());
  const [slotIdx, setSlotIdx] = useState(0);
  const [candidates, setCandidates] = useState<Player[]>([]);
  const [picked, setPicked] = useState<Player | null>(null);
  const [rerolls, setRerolls] = useState(REROLLS);
  const [nonce, setNonce] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [eventMsg, setEventMsg] = useState<{ ev: EventDef; message: string } | null>(null);
  const [last, setLast] = useState<{ outcome: RoundOutcome; you: number; opp: number } | null>(null);
  const [history, setHistory] = useState<RoundOutcome[]>([]);
  const [save, setSave] = useState<Save | null>(null);

  useEffect(() => {
    setSave(loadSave());
  }, []);

  const events = useMemo(() => (cfg ? eventsFor(cfg) : []), [cfg]);

  function startRun(sport: SportConfig) {
    setCfg(sport);
    setTeam(emptyTeam());
    setSlotIdx(0);
    setCandidates(rollCandidates(defaultRng, sport.slots[0].key));
    setPicked(null);
    setRerolls(REROLLS);
    setNonce((n) => n + 1);
    setRoundIdx(0);
    setEventMsg(null);
    setLast(null);
    setHistory([]);
    setPhase("draft");
  }

  function reroll() {
    if (!cfg || rerolls <= 0) return;
    setRerolls((r) => r - 1);
    setPicked(null);
    setCandidates(rollCandidates(defaultRng, cfg.slots[slotIdx].key));
    setNonce((n) => n + 1);
  }

  function sign() {
    if (!cfg || !picked) return;
    const slot = cfg.slots[slotIdx];
    const next: TeamState = { ...team, lineup: { ...team.lineup, [slot.key]: picked } };
    setTeam(next);
    setPicked(null);
    if (slotIdx + 1 >= cfg.slots.length) {
      setPhase("event");
      setNonce((n) => n + 1);
    } else {
      const ni = slotIdx + 1;
      setSlotIdx(ni);
      setCandidates(rollCandidates(defaultRng, cfg.slots[ni].key));
      setNonce((n) => n + 1);
    }
  }

  function onEvent(i: number) {
    if (!cfg) return;
    const ev = events[i];
    const res = applyEvent(cfg, team, ev, defaultRng);
    setTeam(res.team);
    setEventMsg({ ev, message: res.message });
  }

  function play() {
    if (!cfg) return;
    const res = playRound(cfg, team, roundIdx, defaultRng);
    setTeam(res.team);
    setLast({ outcome: res.outcome, you: res.yourRating, opp: res.oppRating });
    const nextHistory = [...history, res.outcome];
    setHistory(nextHistory);
    const cleared = nextHistory.filter((h) => h.won).length;
    const champion = res.outcome.won && roundIdx + 1 >= cfg.rounds.length;
    if (!res.outcome.won || champion) {
      setSave(recordRun(cfg.id, cleared, champion, Object.values(res.team.lineup)));
    }
    setPhase("round");
  }

  function nextRound() {
    if (!cfg || !last) return;
    if (!last.outcome.won || roundIdx + 1 >= cfg.rounds.length) {
      setPhase("over");
      return;
    }
    setRoundIdx((r) => r + 1);
    setEventMsg(null);
    setNonce((n) => n + 1);
    setPhase("event");
  }

  function backToMenu() {
    setPhase("menu");
    setCfg(null);
  }

  // ---------- Menu ----------
  if (phase === "menu" || !cfg) {
    return (
      <div className="stack">
        <p className="lede">
          Pick a sport. Spin the wheel to draft your lineup, survive the random events, and win the title.
        </p>
        <div className="sport-grid">
          {SPORTS.map((s) => (
            <button key={s.id} className="card sport-card" onClick={() => startRun(s)}>
              <span className="emoji">{s.emoji}</span>
              <strong>{s.name}</strong>
              <span className="muted">{s.tagline}</span>
              <span className="muted small">
                {s.slots.length} players · {s.rounds.length} rounds
                {save?.bestBySport[s.id] ? ` · best: ${save.bestBySport[s.id]}/${s.rounds.length}` : ""}
              </span>
            </button>
          ))}
        </div>

        {save && save.runs > 0 && (
          <div className="card">
            <div className="row between">
              <h2>Hall of Fame</h2>
              <span className="muted small">
                {save.runs} runs · {save.titles} titles
              </span>
            </div>
            <ul className="hof">
              {save.hallOfFame.map((p) => (
                <li key={p.name}>
                  <span className="dot" style={{ background: RARITY[p.rarity].color }} />
                  <span>{p.name}</span>
                  <span className="muted small">
                    {p.slot} · {p.sport}
                  </span>
                  <strong>{p.rating}</strong>
                </li>
              ))}
            </ul>
            <button
              className="btn ghost small"
              onClick={() => {
                resetSave();
                setSave(loadSave());
              }}
            >
              Reset progress
            </button>
          </div>
        )}
      </div>
    );
  }

  const slot = cfg.slots[slotIdx];
  const round = cfg.rounds[roundIdx];
  const rating = teamRating(cfg, team);

  const lineupPanel = (
    <aside className="card lineup">
      <div className="row between">
        <h2>
          {cfg.emoji} Your {cfg.name} squad
        </h2>
        <strong>{Object.keys(team.lineup).length ? rating.toFixed(1) : "—"}</strong>
      </div>
      <ul>
        {cfg.slots.map((s) => {
          const p = team.lineup[s.key];
          return (
            <li key={s.key} className={p ? "" : "empty"}>
              <span className="pos">{s.key}</span>
              {p ? (
                <>
                  <span className="dot" style={{ background: RARITY[p.rarity].color }} />
                  <span className="name">{p.name}</span>
                  <strong>{p.rating}</strong>
                </>
              ) : (
                <span className="muted">empty</span>
              )}
            </li>
          );
        })}
      </ul>
      {(team.permBoost !== 0 || team.nextBoost !== 0) && (
        <p className="muted small">
          Boosts: {team.permBoost !== 0 && `${team.permBoost > 0 ? "+" : ""}${team.permBoost} run`}{" "}
          {team.nextBoost !== 0 && `${team.nextBoost > 0 ? "+" : ""}${team.nextBoost} next round`}
        </p>
      )}
    </aside>
  );

  // ---------- Draft ----------
  if (phase === "draft") {
    const slices: WheelSlice[] = candidates.map((p) => ({
      label: lastName(p.name),
      sub: String(p.rating),
      color: RARITY[p.rarity].color,
    }));
    return (
      <div className="layout">
        <section className="card center stack">
          <p className="muted small">
            Pick {slotIdx + 1} of {cfg.slots.length}
          </p>
          <h2>Draft your {slot.label}</h2>
          <Wheel key={`draft-${nonce}`} slices={slices} onResult={(i) => setPicked(candidates[i])} />
          {picked && (
            <div className="reveal" style={{ borderColor: RARITY[picked.rarity].color }}>
              <span className="tag" style={{ background: RARITY[picked.rarity].color }}>
                {picked.rarity}
              </span>
              <h3>{picked.name}</h3>
              <p className="rating-big">{picked.rating}</p>
              <div className="row gap center-row">
                <button className="btn primary" onClick={sign}>
                  Sign
                </button>
                <button className="btn" onClick={reroll} disabled={rerolls <= 0}>
                  Reroll ({rerolls} left)
                </button>
              </div>
            </div>
          )}
        </section>
        {lineupPanel}
      </div>
    );
  }

  // ---------- Event ----------
  if (phase === "event") {
    const slices: WheelSlice[] = events.map((e) => ({
      label: e.emoji,
      sub: e.label,
      color: e.color,
      weight: e.weight,
    }));
    return (
      <div className="layout">
        <section className="card center stack">
          <p className="muted small">
            Round {roundIdx + 1} of {cfg.rounds.length}
          </p>
          <h2>Before the {round.name}</h2>
          <p className="muted">
            Opponent rating {round.strength} · you {rating.toFixed(1)}
          </p>
          <Wheel key={`event-${nonce}`} slices={slices} onResult={onEvent} buttonLabel="SPIN FOR EVENT" />
          {eventMsg && (
            <div className="reveal" style={{ borderColor: eventMsg.ev.color }}>
              <h3>
                {eventMsg.ev.emoji} {eventMsg.ev.label}
              </h3>
              <p>{eventMsg.message}</p>
              <button className="btn primary" onClick={play}>
                Play the {round.name}
              </button>
            </div>
          )}
        </section>
        {lineupPanel}
      </div>
    );
  }

  // ---------- Round result ----------
  if (phase === "round" && last) {
    const o = last.outcome;
    const champion = o.won && roundIdx + 1 >= cfg.rounds.length;
    return (
      <div className="layout">
        <section className="card center stack">
          <h2>{o.round}</h2>
          <p className="muted">
            You {last.you.toFixed(1)} vs opponent {last.opp.toFixed(1)}
          </p>
          <ul className="games">
            {o.games.map((g, i) => (
              <li key={i} className={g.you > g.opp ? "win" : "loss"}>
                {cfg.bestOf > 1 && <span className="muted small">Game {i + 1}</span>}
                <strong>
                  {g.you} – {g.opp}
                </strong>
                <span className="muted small">
                  {cfg.unit}
                  {g.tiebreak ? ` (${g.tiebreak})` : ""}
                </span>
              </li>
            ))}
          </ul>
          <h3 className={o.won ? "win-text" : "loss-text"}>
            {champion ? "🏆 CHAMPIONS!" : o.won ? "You advance" : "Eliminated"}
          </h3>
          <button className="btn primary" onClick={nextRound}>
            {champion || !o.won ? "See results" : "Next round"}
          </button>
        </section>
        {lineupPanel}
      </div>
    );
  }

  // ---------- Over ----------
  const cleared = history.filter((h) => h.won).length;
  const champion = cleared === cfg.rounds.length;
  return (
    <div className="layout">
      <section className="card center stack">
        <h2>{champion ? "🏆 Title won!" : "Run over"}</h2>
        <p className="lede">
          You cleared {cleared} of {cfg.rounds.length} rounds.
        </p>
        <ul className="games">
          {history.map((h, i) => (
            <li key={i} className={h.won ? "win" : "loss"}>
              <span>{h.round}</span>
              <strong>{h.won ? "W" : "L"}</strong>
            </li>
          ))}
        </ul>
        <div className="row gap center-row">
          <button className="btn primary" onClick={() => startRun(cfg)}>
            Run it back
          </button>
          <button className="btn" onClick={backToMenu}>
            Change sport
          </button>
        </div>
      </section>
      {lineupPanel}
    </div>
  );
}
