"use client";

import { useEffect, useState } from "react";
import { WeekView } from "@/components/WeekView";
import { PlanCard } from "@/components/PlanCard";
import type { DailyPlan } from "@/lib/store";
import Link from "next/link";

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return out.reverse();
}

export default function HistoryPage() {
  const [data, setData] = useState<Record<string, { plan?: unknown; journal?: { text?: string } }>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dates = lastNDates(28);
    const from = dates[0];
    const to = dates[dates.length - 1];
    fetch(`/api/plans?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const dates = lastNDates(28);
  const days = dates.map((date) => {
    const entry = data[date] as { plan?: { nonNegotiables?: unknown[]; big3?: unknown[]; growth?: unknown[] }; journal?: unknown } | undefined;
    const plan = entry?.plan;
    const total = plan
      ? (plan.nonNegotiables?.length ?? 0) + (plan.big3?.length ?? 0) + (plan.growth?.length ?? 0)
      : 0;
    const completed = plan
      ? [...(plan.nonNegotiables || []), ...(plan.big3 || []), ...(plan.growth || [])].filter((t: unknown) => (t as { done?: boolean }).done).length
      : 0;
    return {
      date,
      hasPlan: !!plan,
      hasJournal: !!(entry?.journal),
      total: total || undefined,
      completed: total ? completed : undefined,
    };
  });

  const selectedEntry = selectedDate ? (data[selectedDate] as { plan?: unknown; journal?: { text?: string } }) : null;
  const selectedPlan = selectedEntry?.plan;
  const selectedJournal = selectedEntry?.journal;

  return (
    <main className="min-h-screen p-4 pb-24">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
        <h1 className="text-xl font-semibold">History</h1>
      </header>

      {loading ? (
        <p className="text-neutral-500">Loading…</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-neutral-500">Last 28 days — tap a day</p>
          <WeekView days={days} onSelectDate={setSelectedDate} />

          {selectedDate && (
            <div className="mt-6">
              <h2 className="text-lg font-medium">{selectedDate}</h2>
              {selectedPlan ? (
                <div className="mt-2">
                  <PlanCard plan={selectedPlan as DailyPlan} readOnly />
                </div>
              ) : null}
              {selectedJournal?.text && (
                <div className="mt-4 rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
                  <h3 className="text-sm font-medium text-neutral-400">Journal</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{selectedJournal.text}</p>
                </div>
              )}
              {!selectedPlan && !selectedJournal?.text && (
                <p className="mt-2 text-sm text-neutral-500">No plan or journal for this day.</p>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
