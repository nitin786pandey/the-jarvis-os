"use client";

import { useState } from "react";

type Props = { date: string; onSaved?: () => void };

export function JournalInput({ date, onSaved }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, text: text.trim() }),
      });
      if (res.ok) {
        setText("");
        onSaved?.();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
      <h3 className="text-sm font-medium text-neutral-400">Journal for {date}</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you do? How was your day? Performance?"
        className="mt-2 w-full rounded border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none"
        rows={4}
      />
      <button
        onClick={submit}
        disabled={loading || !text.trim()}
        className="mt-2 rounded bg-neutral-600 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
