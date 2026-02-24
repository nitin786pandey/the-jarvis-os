import { NextResponse } from "next/server";
import { getPlan } from "@/lib/store";
import { sendPlainMessage } from "@/lib/telegram";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const date = today();
    const plan = await getPlan(date);
    if (!plan) {
      await sendPlainMessage("Good morning! No plan for today in the system — have a great day anyway.");
      return NextResponse.json({ ok: true, message: "No plan, sent fallback" });
    }
    const lines = ["Good morning! Here's what to have ready:", "", ...plan.prepItems.map((p) => `• ${p}`)];
    await sendPlainMessage(lines.join("\n"));
    return NextResponse.json({ ok: true, date });
  } catch (e) {
    console.error("Morning prep cron error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
