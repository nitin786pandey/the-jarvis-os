"use client";

import type { DailyPlan } from "@/lib/store";

type Props = { plan: DailyPlan; onToggle?: (taskId: string, done: boolean) => void; readOnly?: boolean };

export function PlanCard({ plan, onToggle, readOnly }: Props) {
  const renderTask = (t: { id: string; label: string; project?: string; done?: boolean }) => (
    <label key={t.id} className="flex items-start gap-2 py-1">
      <input
        type="checkbox"
        checked={!!t.done}
        disabled={readOnly}
        onChange={(e) => onToggle?.(t.id, e.target.checked)}
        className="mt-1 rounded border-neutral-600 bg-neutral-800"
      />
      <span className={t.done ? "text-neutral-500 line-through" : ""}>
        {t.label}
        {t.project && <span className="ml-1 text-neutral-500 text-sm">[{t.project}]</span>}
      </span>
    </label>
  );

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
      <h2 className="text-lg font-semibold">
        {plan.dayName}, {plan.date} — {plan.themeName}
      </h2>
      {plan.quote && <p className="mt-1 text-sm text-neutral-400 italic">&quot;{plan.quote}&quot;</p>}
      <section className="mt-4">
        <h3 className="text-sm font-medium text-neutral-400">Non-negotiables</h3>
        <div className="mt-1 space-y-0">{plan.nonNegotiables.map(renderTask)}</div>
      </section>
      <section className="mt-4">
        <h3 className="text-sm font-medium text-neutral-400">Big 3</h3>
        <div className="mt-1 space-y-0">{plan.big3.map(renderTask)}</div>
      </section>
      <section className="mt-4">
        <h3 className="text-sm font-medium text-neutral-400">Exercise</h3>
        <ul className="mt-1 list-inside list-disc text-sm">
          {plan.exercise.map((e, i) => (
            <li key={i}>
              {e.label}
              {e.duration && ` — ${e.duration}`}
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-4">
        <h3 className="text-sm font-medium text-neutral-400">Growth</h3>
        <div className="mt-1 space-y-0">{plan.growth.map(renderTask)}</div>
      </section>
      {plan.prepItems.length > 0 && (
        <section className="mt-4">
          <h3 className="text-sm font-medium text-neutral-400">Get ready</h3>
          <ul className="mt-1 list-inside list-disc text-sm">
            {plan.prepItems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
