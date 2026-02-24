import { NextResponse } from "next/server";
import { getJournal, setJournal } from "@/lib/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const journal = await getJournal(date);
  return NextResponse.json(journal ?? null);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { date, text, completedTaskIds, skippedTaskIds } = body as {
    date?: string;
    text?: string;
    completedTaskIds?: string[];
    skippedTaskIds?: string[];
  };
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  const existing = await getJournal(date);
  await setJournal({
    date,
    text: existing?.text ? `${existing.text}\n---\n${text}` : text,
    completedTaskIds: completedTaskIds ?? existing?.completedTaskIds,
    skippedTaskIds: skippedTaskIds ?? existing?.skippedTaskIds,
    mood: existing?.mood,
    energy: existing?.energy,
    adjustmentSuggestions: existing?.adjustmentSuggestions,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
