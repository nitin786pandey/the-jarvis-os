"use client";

import { useEffect, useState } from "react";
import { PlanCard } from "@/components/PlanCard";
import { JournalInput } from "@/components/JournalInput";
import type { DailyPlan } from "@/lib/store";
import Link from "next/link";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const date = today();

  useEffect(() => {
    fetch(`/api/plan/${date}`)
      .then((r) => (r.status === 404 ? null : r.json()))
      .then(setPlan)
      .finally(() => setLoading(false));
  }, [date]);

  async function handleToggle(taskId: string, done: boolean) {
    const res = await fetch(`/api/plan/${date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, done }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlan(updated);
    }
  }

  return (
    <main className="min-h-screen p-4 pb-24">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Jarvis</h1>
        <nav className="flex gap-3 text-sm text-neutral-400">
          <Link href="/history" className="hover:text-white">History</Link>
          <Link href="/progress" className="hover:text-white">Progress</Link>
        </nav>
      </header>

      <p className="text-sm text-neutral-500">Today — {date}</p>

      {loading ? (
        <p className="mt-4 text-neutral-500">Loading…</p>
      ) : plan ? (
        <div className="mt-4">
          <PlanCard plan={plan} onToggle={handleToggle} />
        </div>
      ) : (
        <p className="mt-4 text-neutral-500">No plan for today. Check Telegram for your evening plan, or it will be generated at 9 PM.</p>
      )}

      <div className="mt-8">
        <JournalInput date={date} />
      </div>
    </main>
  );
}
