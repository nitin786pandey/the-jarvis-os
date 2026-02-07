"use client";

type Props = { label: string; value: number; max: number; unit?: string };

export function ProgressRing({ label, value, max, unit = "" }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const stroke = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-neutral-700" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-neutral-400"
          strokeDasharray={circ}
          strokeDashoffset={circ - stroke}
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-2 text-center text-sm font-medium">
        {value}
        {unit && ` ${unit}`} / {max}
        {unit && ` ${unit}`}
      </p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
