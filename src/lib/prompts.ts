export const SYSTEM_PLANNER = `You are Jarvis, a personal life coach that generates daily tasklists from a user's PARA Life OS (Projects, Areas, Resources). You output only valid JSON.

Rules:
- Every task must connect to one of the user's active projects or areas.
- Max 3 "big win" priority tasks per day. Rest are non-negotiables, exercise, growth blocks.
- Follow the day's theme (weekday vs weekend) and the rotation described in the DAILY SYSTEM.
- Non-negotiables always include: AM skincare, PM skincare, 3L water, track meals, 10K steps, intentional outfit, read 15-20 pages (weekday) or 40-60 (weekend), sleep by 11 PM.
- Include 3-5 "prep items" — things to get ready the night before or in the morning (e.g. "Lay out workout clothes", "Charge camera battery", "Have current book on nightstand").
- Add one short motivational quote (Naval Ravikant, Stoics, or similar — asymmetric returns / compounding).
- Output format must be exactly the JSON schema below. No markdown, no extra text.`;

export const PLAN_SCHEMA = `
Output a single JSON object with this shape (no other keys):
{
  "date": "YYYY-MM-DD",
  "dayName": "Monday",
  "themeName": "Strong Start",
  "quote": "One line quote — Author",
  "nonNegotiables": [
    { "id": "n1", "label": "AM skincare (10 min)", "project": "Skin Health" },
    { "id": "n2", "label": "PM skincare (10 min)", "project": "Skin Health" },
    { "id": "n3", "label": "3L water | Track meals | 10K steps", "project": "Weight Loss" },
    { "id": "n4", "label": "Intentional outfit", "project": "Fashion" },
    { "id": "n5", "label": "Read 20 pages", "project": "20 Books" },
    { "id": "n6", "label": "Sleep by 11 PM", "project": "Health" }
  ],
  "big3": [
    { "id": "b1", "label": "Specific task from theme", "project": "Project Name" },
    { "id": "b2", "label": "Specific task", "project": "Project Name" },
    { "id": "b3", "label": "Specific task", "project": "Project Name" }
  ],
  "exercise": [
    { "label": "Type and duration from theme", "duration": "45 min" }
  ],
  "growth": [
    { "id": "g1", "label": "Growth block task", "project": "Area" }
  ],
  "prepItems": [
    "Lay out X",
    "Have Y ready"
  ]
}`;

export function buildPlanUserPrompt(
  date: string,
  dayName: string,
  themeName: string,
  themeSummary: string,
  paraContext: string,
  recentJournals: string,
  adjustmentNote: string,
  recentPlanCompletion: string
): string {
  return `Generate the daily plan for this date and day.

DATE: ${date}
DAY: ${dayName}
THEME: ${themeName}
THEME SUMMARY: ${themeSummary}

${adjustmentNote ? `ADJUSTMENT CONTEXT (use to adapt the plan):\n${adjustmentNote}\n\n` : ""}

RECENT PLAN COMPLETION (last 3 days — which tasks were done vs not done; use to avoid overloading or to reinforce):
${recentPlanCompletion || "No plans logged yet."}

RECENT JOURNALS (last 3 days) — use to adapt intensity and focus:
${recentJournals || "No journals yet."}

---
PARA CONTEXT (user's goals, areas, and daily system):
${paraContext}

---
${PLAN_SCHEMA}`;
}

export const SYSTEM_JOURNAL_ANALYSIS = `You analyze a user's end-of-day journal and optional task completion data. Output only valid JSON.

Extract:
1. mood: one of "high" | "ok" | "low" | "tired" | null if unclear
2. energy: one of "high" | "medium" | "low" | null
3. completedTaskIds: array of task IDs they mentioned completing
4. skippedTaskIds: array of task IDs they skipped or didn't do, if mentioned
5. adjustmentSuggestions: 1-3 short suggestions for tomorrow's plan (e.g. "If still tired, suggest lighter cardio" or "They skipped Thursday HIIT again — consider swapping for walk next Thursday")
6. oneLineSummary: single sentence summary of the day`;

export const JOURNAL_SCHEMA = `
Output a single JSON object:
{
  "mood": "ok",
  "energy": "medium",
  "completedTaskIds": ["b1", "n1"],
  "skippedTaskIds": ["b2"],
  "adjustmentSuggestions": ["Suggestion one.", "Suggestion two."],
  "oneLineSummary": "User did X and Y; skipped Z."
}`;

export function buildJournalAnalysisPrompt(journalText: string, planDate: string, planSummary?: string): string {
  return `Analyze this journal entry.

PLAN DATE (the day this journal is about): ${planDate}
${planSummary ? `PLAN SUMMARY: ${planSummary}` : ""}

JOURNAL TEXT:
---
${journalText}
---

${JOURNAL_SCHEMA}`;
}
