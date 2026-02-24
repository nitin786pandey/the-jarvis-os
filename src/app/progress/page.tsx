"use client";

import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/ProgressRing";
import Link from "next/link";

const PROJECTS = [
  { key: "career-30lpa", label: "Career 30 LPA", max: 10, unit: "mock interviews" },
  { key: "weight-loss-15kg", label: "Weight Loss", max: 15, unit: "kg" },
  { key: "20-books-2026", label: "Books 2026", max: 20, unit: "books" },
  { key: "concert-photography", label: "Photography", max: 4, unit: "phases" },
  { key: "skin-health", label: "Skin Health", max: 100, unit: "% consistency" },
  { key: "fashion-upgrade", label: "Fashion", max: 100, unit: "% capsule" },
];

export default function ProgressPage() {
  const [values, setValues] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all(
      PROJECTS.map((p) =>
        fetch(`/api/progress/${p.key}`)
          .then((r) => r.json())
          .then((arr: Array<{ value: number }>) => {
            if (arr.length === 0) return 0;
            return arr[arr.length - 1]?.value ?? 0;
          })
          .then((v) => ({ key: p.key, value: v }))
          .catch(() => ({ key: p.key, value: 0 }))
      )
    ).then((pairs) => {
      const next: Record<string, number> = {};
      pairs.forEach(({ key, value }) => (next[key] = value));
      setValues(next);
    });
  }, []);

  return (
    <main className="min-h-screen p-4 pb-24">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-neutral-400 hover:text-white">← Back</Link>
        <h1 className="text-xl font-semibold">Progress</h1>
      </header>

      <p className="mb-6 text-sm text-neutral-500">
        Project progress. Data is updated when you log progress via API or Telegram.
      </p>

      <div className="grid grid-cols-2 gap-6">
        {PROJECTS.map((p) => (
          <ProgressRing
            key={p.key}
            label={p.label}
            value={values[p.key] ?? 0}
            max={p.max}
            unit={p.unit}
          />
        ))}
      </div>
    </main>
  );
}
