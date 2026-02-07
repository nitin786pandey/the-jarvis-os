import { getPARAContext, getDayTemplate } from "./para-reader";
import { chatJSON } from "./llm";
import { buildPlanUserPrompt, SYSTEM_PLANNER } from "./prompts";
import type { DailyPlan } from "./store";
import { getAdjustmentContext } from "./adaptive";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayName(d: Date): string {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()];
}

type LLMPlan = {
  date: string;
  dayName: string;
  themeName: string;
  quote?: string;
  nonNegotiables: Array<{ id: string; label: string; project?: string }>;
  big3: Array<{ id: string; label: string; project?: string }>;
  exercise: Array<{ label: string; duration?: string }>;
  growth: Array<{ id: string; label: string; project?: string }>;
  prepItems: string[];
};

function toDailyPlan(llm: LLMPlan): DailyPlan {
  return {
    date: llm.date,
    dayName: llm.dayName,
    themeName: llm.themeName,
    quote: llm.quote,
    nonNegotiables: llm.nonNegotiables.map((t) => ({ ...t, done: false })),
    big3: llm.big3.map((t) => ({ ...t, done: false })),
    exercise: llm.exercise,
    growth: llm.growth.map((t) => ({ ...t, done: false })),
    prepItems: llm.prepItems || [],
  };
}

export async function generatePlan(forDate: string): Promise<DailyPlan> {
  const d = new Date(forDate + "T12:00:00Z");
  const template = getDayTemplate(d);
  const paraContext = getPARAContext();
  const adjustmentNote = await getAdjustmentContext(forDate);

  const recentJournalDates = [1, 2, 3].map((i) => {
    const x = new Date(d);
    x.setDate(x.getDate() - i);
    return formatDate(x);
  });
  const { getJournals, getPlans } = await import("./store");
  const [journalsMap, plansMap] = await Promise.all([
    getJournals(recentJournalDates),
    getPlans(recentJournalDates),
  ]);
  const recentJournals = recentJournalDates
    .map((date) => {
      const j = journalsMap.get(date);
      return j ? `${date}:\n${j.text}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  const recentPlanCompletion = recentJournalDates
    .map((date) => {
      const plan = plansMap.get(date);
      if (!plan) return null;
      const allTasks = [...plan.nonNegotiables, ...plan.big3, ...plan.growth];
      const done = allTasks.filter((t) => t.done).map((t) => t.id);
      const notDone = allTasks.filter((t) => !t.done).map((t) => t.id);
      const parts: string[] = [];
      if (done.length) parts.push(`done: ${done.join(",")}`);
      if (notDone.length) parts.push(`not done: ${notDone.join(",")}`);
      return `${date}: ${parts.join("; ")}`;
    })
    .filter(Boolean)
    .join("\n");

  const userPrompt = buildPlanUserPrompt(
    forDate,
    dayName(d),
    template.name,
    template.summary,
    paraContext,
    recentJournals,
    adjustmentNote,
    recentPlanCompletion
  );

  const raw = await chatJSON<LLMPlan>(
    [
      { role: "system", content: SYSTEM_PLANNER },
      { role: "user", content: userPrompt },
    ],
    { maxTokens: 4096 }
  );

  if (!raw.date) raw.date = forDate;
  if (!raw.dayName) raw.dayName = dayName(d);
  if (!raw.themeName) raw.themeName = template.name;
  if (!Array.isArray(raw.nonNegotiables)) raw.nonNegotiables = [];
  if (!Array.isArray(raw.big3)) raw.big3 = [];
  if (!Array.isArray(raw.exercise)) raw.exercise = [];
  if (!Array.isArray(raw.growth)) raw.growth = [];
  if (!Array.isArray(raw.prepItems)) raw.prepItems = [];

  return toDailyPlan(raw);
}

/**
 * Format plan as Telegram message text.
 */
export function planToTelegramText(plan: DailyPlan): string {
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
  lines.push("", "Reply /approve or tell me what to change.");
  return lines.join("\n");
}

/**
 * Format morning prep message (prep items only).
 */
export function planToPrepText(plan: DailyPlan): string {
  const lines = ["Good morning! Here's what to have ready:", "", ...plan.prepItems.map((p) => `• ${p}`)];
  return lines.join("\n");
}
