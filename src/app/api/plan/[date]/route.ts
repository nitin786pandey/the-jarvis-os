import { NextResponse } from "next/server";
import { getPlan, setPlan } from "@/lib/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const plan = await getPlan(date);
  if (!plan) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const plan = await getPlan(date);
  if (!plan) return NextResponse.json(null, { status: 404 });
  const body = await req.json() as { taskId?: string; done?: boolean };
  const { taskId, done } = body;
  if (taskId == null || done === undefined) {
    return NextResponse.json({ error: "taskId and done required" }, { status: 400 });
  }
  const allTasks = [...plan.nonNegotiables, ...plan.big3, ...plan.growth];
  const t = allTasks.find((x) => x.id === taskId);
  if (t) t.done = !!done;
  await setPlan(plan);
  return NextResponse.json(plan);
}
