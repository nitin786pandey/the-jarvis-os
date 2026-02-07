import { Bot, webhookCallback } from "grammy";
import { getPlan, setPlan, getJournal, setJournal, getUserState, setUserState, lastNDates, getPlans, getJournals } from "@/lib/store";
import { planToTelegramText } from "@/lib/planner";
import { analyzeJournal } from "@/lib/adaptive";
import { getPARAContext } from "@/lib/para-reader";
import { chat } from "@/lib/llm";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function getChatId(): string | null {
  return process.env.TELEGRAM_CHAT_ID || null;
}

function isAllowed(chatId: number): boolean {
  const allowed = getChatId();
  return allowed !== null && String(chatId) === allowed;
}

/** Build context string for talk/guide mode: PARA + recent plans + recent journals. */
async function buildTalkContext(): Promise<string> {
  const dates = lastNDates(7);
  let para = "";
  try {
    para = getPARAContext().slice(0, 5500);
  } catch {
    para = "(Life/PARA not loaded)";
  }
  const plans = await getPlans(dates);
  const journals = await getJournals(dates);
  const planLines = dates
    .filter((d) => plans.has(d))
    .map((d) => {
      const p = plans.get(d)!;
      const tasks = [...p.nonNegotiables, ...p.big3, ...p.growth];
      const done = tasks.filter((t) => t.done).length;
      return `${d} (${p.themeName}): ${done}/${tasks.length} done`;
    });
  const journalLines = dates
    .filter((d) => journals.has(d))
    .map((d) => {
      const j = journals.get(d)!;
      const text = (j.text || "").slice(0, 400).replace(/\n/g, " ");
      return `${d}: ${text}${text.length >= 400 ? "…" : ""}`;
    });
  return [
    "## USER'S LIFE (PARA)\n",
    para,
    "\n\n## RECENT PLANS (last 7 days)\n",
    planLines.length ? planLines.join("\n") : "None yet.",
    "\n\n## RECENT JOURNALS (last 7 days)\n",
    journalLines.length ? journalLines.join("\n\n") : "None yet.",
  ].join("");
}

const TALK_SYSTEM_PROMPT = `You are Jarvis, the user's personal life planner and guide. You have access to their Life OS: PARA (Projects, Areas, Resources, Archives), daily system, recent daily plans, and journal entries. Use only the context provided—do not invent goals or data. Reply in a short, Telegram-friendly way (a few sentences). Be supportive and actionable. If they ask for plans or tasks, refer to their actual plans and goals from the context.`;

function registerHandlers(bot: Bot): void {
  async function requireAllowed(ctx: { chat: { id: number }; reply: (text: string) => Promise<unknown> }): Promise<boolean> {
    if (isAllowed(ctx.chat.id)) return true;
    await ctx.reply(
      `This bot only responds in the configured chat. Your chat ID: \`${ctx.chat.id}\`. ` +
        "Set TELEGRAM_CHAT_ID to this value in Vercel → Settings → Environment Variables, then redeploy."
    );
    return false;
  }

  bot.command("today", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    const date = today();
    const plan = await getPlan(date);
    if (!plan) {
      await ctx.reply("No plan for today. I'll generate one at 9 PM the night before.");
      return;
    }
    await ctx.reply(planToTelegramText(plan));
  });

  bot.command("tomorrow", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    const date = tomorrow();
    const plan = await getPlan(date);
    if (!plan) {
      await ctx.reply("No plan for tomorrow yet. It will be generated at 9 PM tonight.");
      return;
    }
    await ctx.reply(planToTelegramText(plan));
  });

  bot.command("done", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    const args = ctx.message?.text?.split(/\s+/)?.slice(1) || [];
    const taskId = args[0];
    if (!taskId) {
      await ctx.reply("Usage: /done <taskId> e.g. /done b1");
      return;
    }
    const date = today();
    const plan = await getPlan(date);
    if (!plan) {
      await ctx.reply("No plan for today.");
      return;
    }
    const allTasks = [...plan.nonNegotiables, ...plan.big3, ...plan.growth];
    const t = allTasks.find((x) => x.id === taskId);
    if (t) t.done = true;
    await setPlan(plan);
    await ctx.reply(`Marked ${taskId} done.`);
  });

  bot.command("skip", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    const text = ctx.message?.text?.split(/\s+/)?.slice(1)?.join(" ") || "";
    const [taskId, ...reasonParts] = text.split(/\s+/);
    const reason = reasonParts.join(" ");
    if (!taskId) {
      await ctx.reply("Usage: /skip <taskId> [reason] e.g. /skip b2 felt tired");
      return;
    }
    const date = today();
    const journal = await getJournal(date);
    const existing = journal?.text || "";
    const skipNote = reason ? `Skipped ${taskId}: ${reason}` : `Skipped ${taskId}`;
    await setJournal({
      date,
      text: existing ? `${existing}\n${skipNote}` : skipNote,
      skippedTaskIds: [...(journal?.skippedTaskIds || []), taskId],
      createdAt: new Date().toISOString(),
    });
    await ctx.reply("Noted. I'll take that into account for future plans.");
  });

  bot.command("journal", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await setUserState({ journalMode: true });
    await ctx.reply("Journal mode on. Send your entry as a message, then /done_journal when finished.");
  });

  bot.command("done_journal", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await setUserState({ journalMode: false });
    await ctx.reply("Journal mode off.");
  });

  bot.command("adjust", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    const request = ctx.message?.text?.replace(/^\/adjust\s*/, "")?.trim();
    if (!request) {
      await ctx.reply("Usage: /adjust <your request> e.g. /adjust swap cardio for swimming today");
      return;
    }
    await ctx.reply(
      "Got it. I'll factor this into tomorrow's plan. For immediate changes, edit your plan in the PWA or ask again tomorrow."
    );
    const journal = await getJournal(today());
    const existing = journal?.text || "";
    await setJournal({
      date: today(),
      text: existing ? `${existing}\n[Adjustment request]: ${request}` : `[Adjustment request]: ${request}`,
      createdAt: new Date().toISOString(),
    });
  });

  bot.command("approve", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await setUserState({ lastPlanApprovedAt: new Date().toISOString() });
    await ctx.reply("Plan approved. You're all set for tomorrow.");
  });

  bot.command("review", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    const dates = lastNDates(7);
    const plans = await getPlans(dates);
    let completed = 0;
    let total = 0;
    for (const date of dates) {
      const p = plans.get(date);
      if (p) {
        const tasks = [...p.nonNegotiables, ...p.big3, ...p.growth];
        total += tasks.length;
        completed += tasks.filter((t) => t.done).length;
      }
    }
    await ctx.reply(
      `Weekly review (last 7 days): ${completed}/${total} tasks completed. Check the PWA for full history and progress.`
    );
  });

  bot.command("progress", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await ctx.reply("Progress charts are on the PWA. Open the app and go to the Progress page.");
  });

  bot.command("talk", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await setUserState({ talkMode: true });
    await ctx.reply(
      "Talk mode on. Ask me anything—I have your Life context, recent plans, and journals. /done_talk to exit."
    );
  });

  bot.command("done_talk", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await setUserState({ talkMode: false });
    await ctx.reply("Talk mode off.");
  });

  bot.on("message:text", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    const state = await getUserState();
    if (state.talkMode) {
      const userText = ctx.message.text.trim();
      if (!userText || userText.startsWith("/")) return;
      const sent = await ctx.reply("…");
      try {
        const context = await buildTalkContext();
        const systemContent = TALK_SYSTEM_PROMPT + "\n\n---\n\nContext:\n\n" + context;
        const reply = await chat(
          [
            { role: "system", content: systemContent },
            { role: "user", content: userText },
          ],
          { maxTokens: 1024 }
        );
        await ctx.api.editMessageText(ctx.chat.id, sent.message_id, reply);
      } catch (e) {
        console.error("Talk mode error:", e);
        await ctx.api.editMessageText(
          ctx.chat.id,
          sent.message_id,
          "Something went wrong. Try again or /done_talk to exit."
        );
      }
      return;
    }
    if (state.journalMode) {
      const date = today();
      const text = ctx.message.text;
      const existing = await getJournal(date);
      const plan = await getPlan(date);
      let completedTaskIds = existing?.completedTaskIds || [];
      let skippedTaskIds = existing?.skippedTaskIds || [];
      try {
        const analysis = await analyzeJournal(text, date, plan ? plan.themeName : undefined);
        if (analysis.completedTaskIds?.length) completedTaskIds = [...new Set([...completedTaskIds, ...analysis.completedTaskIds])];
        if (analysis.skippedTaskIds?.length) skippedTaskIds = [...new Set([...skippedTaskIds, ...analysis.skippedTaskIds])];
      } catch {
        // ignore
      }
      await setJournal({
        date,
        text: existing?.text ? `${existing.text}\n---\n${text}` : text,
        completedTaskIds,
        skippedTaskIds,
        createdAt: new Date().toISOString(),
      });
      await setUserState({ journalMode: false });
      await ctx.reply("Journal saved. I'll use it to adapt future plans.");
      return;
    }
    if (ctx.message.text.startsWith("/")) return;
    await ctx.reply("Send /today for today's plan, /journal to log your day, or /help for all commands.");
  });

  const helpText = [
    "/today - Show today's plan",
    "/tomorrow - Show tomorrow's plan",
    "/done <id> - Mark task done (e.g. /done b1)",
    "/skip <id> [reason] - Skip task, optional reason",
    "/journal - Enter journal mode; next message is your entry",
    "/done_journal - Exit journal mode",
    "/talk - Free chat with Jarvis (Life + plans + journals)",
    "/done_talk - Exit talk mode",
    "/adjust <request> - Request change for tomorrow",
    "/approve - Approve tomorrow's plan",
    "/review - Quick weekly stats",
    "/progress - Link to PWA progress page",
    "/help - This message",
  ].join("\n");

  bot.command("start", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await ctx.reply("Jarvis Life Planner. Commands:\n\n" + helpText);
  });

  bot.command("help", async (ctx) => {
    if (!(await requireAllowed(ctx))) return;
    await ctx.reply(helpText);
  });
}

let cachedHandler: ((req: Request) => Promise<Response>) | null = null;

function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");
  const bot = new Bot(token);
  registerHandlers(bot);
  cachedHandler = webhookCallback(bot, "std/http");
  return cachedHandler;
}

export async function POST(req: Request) {
  try {
    return await getHandler()(req);
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return new Response("OK", { status: 200 });
  }
}
