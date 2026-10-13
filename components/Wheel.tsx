"use client";

import { useRef, useState } from "react";

export interface WheelSlice {
  label: string;
  sub?: string;
  color: string;
  weight?: number;
}

interface Props {
  slices: WheelSlice[];
  /** Called once the wheel stops, with the winning slice index. */
  onResult: (index: number) => void;
  buttonLabel?: string;
  disabled?: boolean;
}

const R = 150;

function polar(angleDeg: number, r: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [r * Math.sin(a), -r * Math.cos(a)];
}

function slicePath(start: number, end: number): string {
  const [x1, y1] = polar(start, R);
  const [x2, y2] = polar(end, R);
  const large = end - start > 180 ? 1 : 0;
  return `M0 0 L${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
}

/**
 * A spinning wheel. Slice weights set the odds (default: equal). The winner is chosen
 * first, then the rotation is computed so that slice lands under the pointer.
 * Remount with a new `key` for each fresh wheel.
 */
export default function Wheel({ slices, onResult, buttonLabel = "SPIN", disabled }: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);
  const winner = useRef<number | null>(null);
  const finished = useRef(false);

  const weights = slices.map((s) => s.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);

  // Precompute angular ranges.
  const ranges: { start: number; end: number; mid: number }[] = [];
  let acc = 0;
  for (const w of weights) {
    const span = (w / total) * 360;
    ranges.push({ start: acc, end: acc + span, mid: acc + span / 2 });
    acc += span;
  }

  function spin() {
    if (spinning || done || disabled) return;
    let r = Math.random() * total;
    let idx = weights.length - 1;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r < 0) {
        idx = i;
        break;
      }
    }
    winner.current = idx;
    const span = ranges[idx].end - ranges[idx].start;
    const jitter = (Math.random() - 0.5) * span * 0.7;
    const turns = 5 + Math.floor(Math.random() * 3);
    setSpinning(true);
    setRotation(360 * turns + (360 - ranges[idx].mid + jitter));
    // Safety net in case the browser never fires transitionend.
    window.setTimeout(finish, 5000);
  }

  function finish() {
    if (finished.current || winner.current === null) return;
    finished.current = true;
    setSpinning(false);
    setDone(true);
    onResult(winner.current);
  }

  const onEnd = finish;

  return (
    <div className="wheel-wrap">
      <div className="pointer" aria-hidden="true" />
      <svg viewBox="-160 -160 320 320" className="wheel" role="img" aria-label="Roulette wheel">
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4.5s cubic-bezier(0.12, 0.7, 0.1, 1)" : "none",
            transformOrigin: "0 0",
          }}
          onTransitionEnd={onEnd}
        >
          {slices.map((s, i) => {
            const { start, end, mid } = ranges[i];
            const span = end - start;
            const [tx, ty] = polar(mid, R * 0.66);
            const small = span < 28;
            return (
              <g key={i}>
                <path d={slicePath(start, end)} fill={s.color} stroke="#0b1020" strokeWidth="2" />
                {!small && (
                  <g transform={`translate(${tx} ${ty}) rotate(${mid})`}>
                    <text textAnchor="middle" className="slice-label" y={s.sub ? -2 : 4}>
                      {s.label}
                    </text>
                    {s.sub && (
                      <text textAnchor="middle" className="slice-sub" y={10}>
                        {s.sub}
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
          <circle r="16" fill="#0b1020" stroke="#e2e8f0" strokeWidth="3" />
        </g>
      </svg>
      <button className="btn primary spin-btn" onClick={spin} disabled={spinning || done || disabled}>
        {spinning ? "Spinning..." : done ? "Done" : buttonLabel}
      </button>
    </div>
  );
}
