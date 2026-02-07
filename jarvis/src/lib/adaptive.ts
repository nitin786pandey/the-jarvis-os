import { getJournals } from "./store";
import { chatJSON } from "./llm";
import { buildJournalAnalysisPrompt, SYSTEM_JOURNAL_ANALYSIS } from "./prompts";

export type JournalAnalysis = {
  mood: string | null;
  energy: string | null;
  completedTaskIds: string[];
  skippedTaskIds: string[];
  adjustmentSuggestions: string[];
  oneLineSummary: string;
};

export async function analyzeJournal(
  journalText: string,
  planDate: string,
  planSummary?: string
): Promise<JournalAnalysis> {
  const content = buildJournalAnalysisPrompt(journalText, planDate, planSummary);
  return chatJSON<JournalAnalysis>(
    [
      { role: "system", content: SYSTEM_JOURNAL_ANALYSIS },
      { role: "user", content },
    ],
    { maxTokens: 1024 }
  );
}

/**
 * Build adjustment context for the next plan from the last 3 days of journals.
 * Returns a string to inject into the plan generation prompt.
 */
export async function getAdjustmentContext(forDate: string): Promise<string> {
  const dates = lastThreeDays(forDate);
  const journals = await getJournals(dates);
  const lines: string[] = [];
  for (const d of dates) {
    const j = journals.get(d);
    if (j?.text) {
      lines.push(`${d}: ${j.text.slice(0, 300)}${j.text.length > 300 ? "..." : ""}`);
      if (j.mood) lines.push(`  (mood: ${j.mood})`);
    }
  }
  if (lines.length === 0) return "";
  return "Recent journal context:\n" + lines.join("\n");
}

function lastThreeDays(fromDate: string): string[] {
  const out: string[] = [];
  const d = new Date(fromDate + "T12:00:00Z");
  for (let i = 1; i <= 3; i++) {
    d.setDate(d.getDate() - 1);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
