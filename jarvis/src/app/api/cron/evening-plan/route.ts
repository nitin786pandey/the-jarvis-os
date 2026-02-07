import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/planner";
import { setPlan } from "@/lib/store";
import { sendPlainMessage } from "@/lib/telegram";
import { planToTelegramText } from "@/lib/planner";

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const date = tomorrow();
    const plan = await generatePlan(date);
    await setPlan(plan);
    const text = planToTelegramText(plan);
    await sendPlainMessage(text);
    return NextResponse.json({ ok: true, date, message: "Plan generated and sent" });
  } catch (e) {
    console.error("Evening plan cron error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    try {
      await sendPlainMessage(`Jarvis: Failed to generate plan. ${msg}`);
    } catch {
      // ignore
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
