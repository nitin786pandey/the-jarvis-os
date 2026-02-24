import { NextResponse } from "next/server";
import { getPlans, getJournals } from "@/lib/store";

function parseDate(s: string): Date {
  const d = new Date(s + "T12:00:00Z");
  if (isNaN(d.getTime())) throw new Error("Invalid date");
  return d;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const days = url.searchParams.get("days");
  let dates: string[] = [];
  if (days) {
    const n = Math.min(Math.max(1, parseInt(days, 10)), 90);
    const end = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
  } else if (from && to) {
    const start = parseDate(from);
    const end = parseDate(to);
    if (start > end) return NextResponse.json({ error: "from must be before to" }, { status: 400 });
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
  } else {
    return NextResponse.json({ error: "Provide days= or from= and to=" }, { status: 400 });
  }
  const [plans, journals] = await Promise.all([getPlans(dates), getJournals(dates)]);
  const result: Record<string, { plan?: unknown; journal?: unknown }> = {};
  for (const date of dates) {
    result[date] = {};
    if (plans.get(date)) result[date].plan = plans.get(date);
    if (journals.get(date)) result[date].journal = journals.get(date);
  }
  return NextResponse.json(result);
}
