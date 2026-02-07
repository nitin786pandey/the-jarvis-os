import { Bot } from "grammy";

let botInstance: Bot | null = null;

function getBot(): Bot {
  if (!botInstance) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is required");
    botInstance = new Bot(token);
  }
  return botInstance;
}

export function getChatId(): string {
  const id = process.env.TELEGRAM_CHAT_ID;
  if (!id) throw new Error("TELEGRAM_CHAT_ID is required");
  return id;
}

export async function sendMessage(text: string): Promise<void> {
  const id = getChatId();
  await getBot().api.sendMessage(id, text, { parse_mode: "HTML" });
}

export async function sendPlainMessage(text: string): Promise<void> {
  const id = getChatId();
  await getBot().api.sendMessage(id, text);
}


export function formatPlanForTelegram(plan: {
  dayName: string;
  date: string;
  themeName: string;
  nonNegotiables: Array<{ label: string }>;
  big3: Array<{ label: string; project?: string }>;
  exercise: Array<{ label: string; duration?: string }>;
  growth: Array<{ label: string }>;
  prepItems: string[];
  quote?: string;
}): string {
  const lines: string[] = [
    `Tomorrow: ${plan.dayName}, ${plan.date} — "${plan.themeName}"`,
    "",
    "NON-NEGOTIABLES",
    ...plan.nonNegotiables.map((t) => `[ ] ${t.label}`),
    "",
    "BIG 3",
    ...plan.big3.map((t, i) => `${i + 1}. [ ] ${t.label}${t.project ? ` [${t.project}]` : ""}`),
    "",
    "EXERCISE",
    ...plan.exercise.map((e) => `[ ] ${e.label}${e.duration ? ` — ${e.duration}` : ""}`),
    "",
    "GROWTH",
    ...plan.growth.map((t) => `[ ] ${t.label}`),
    "",
    "GET READY TONIGHT",
    ...plan.prepItems.map((p) => `- ${p}`),
  ];
  if (plan.quote) lines.push("", `"${plan.quote}"`);
  return lines.join("\n");
}
