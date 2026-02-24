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

  const date = tomorrow();
  try {
    const plan = await generatePlan(date);
    try {
      await setPlan(plan);
    } catch (e) {
      console.error("Evening plan: setPlan failed", e);
      return NextResponse.json(
        { error: "setPlan (Redis) failed", detail: e instanceof Error ? e.message : String(e) },
        { status: 500 }
      );
    }
    const text = planToTelegramText(plan);
    try {
      await sendPlainMessage(text);
    } catch (e) {
      console.error("Evening plan: sendPlainMessage failed", e);
      return NextResponse.json(
        { error: "Telegram send failed", detail: e instanceof Error ? e.message : String(e) },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, date, message: "Plan generated and sent" });
  } catch (e) {
    console.error("Evening plan cron error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    try {
      await sendPlainMessage(`Jarvis: Failed to generate plan. ${msg}`);
    } catch {
      // ignore
    }
    return NextResponse.json(
      { error: "generatePlan failed", detail: msg },
      { status: 500 }
    );
  }
}
