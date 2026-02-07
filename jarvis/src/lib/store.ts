import { Redis } from "@upstash/redis";

const TTL_DAYS = 90;
const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60;

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
  return new Redis({ url, token });
}

export type PlanTask = {
  id: string;
  label: string;
  project?: string;
  done?: boolean;
};

export type DailyPlan = {
  date: string; // YYYY-MM-DD
  dayName: string;
  themeName: string;
  quote?: string;
  nonNegotiables: PlanTask[];
  big3: PlanTask[];
  exercise: { label: string; duration?: string }[];
  growth: PlanTask[];
  prepItems: string[];
  raw?: string; // full text for Telegram
};

export type JournalEntry = {
  date: string;
  text: string;
  completedTaskIds?: string[];
  skippedTaskIds?: string[];
  mood?: string;
  energy?: string;
  adjustmentSuggestions?: string[];
  createdAt: string; // ISO
};

export type UserState = {
  journalMode?: boolean;
  talkMode?: boolean;
  autonomyLevel?: 2 | 3;
  lastPlanApprovedAt?: string; // ISO
};

export async function getPlan(date: string): Promise<DailyPlan | null> {
  const redis = getRedis();
  const key = `plan:${date}`;
  const data = await redis.get<string>(key);
  if (!data) return null;
  return typeof data === "string" ? (JSON.parse(data) as DailyPlan) : (data as DailyPlan);
}

export async function setPlan(plan: DailyPlan): Promise<void> {
  const redis = getRedis();
  await redis.set(`plan:${plan.date}`, JSON.stringify(plan), { ex: TTL_SECONDS });
}

export async function getJournal(date: string): Promise<JournalEntry | null> {
  const redis = getRedis();
  const data = await redis.get<string>(`journal:${date}`);
  if (!data) return null;
  return typeof data === "string" ? (JSON.parse(data) as JournalEntry) : (data as JournalEntry);
}

export async function setJournal(entry: JournalEntry): Promise<void> {
  const redis = getRedis();
  await redis.set(`journal:${entry.date}`, JSON.stringify(entry), { ex: TTL_SECONDS });
}

export async function getJournals(dates: string[]): Promise<Map<string, JournalEntry>> {
  const redis = getRedis();
  const keys = dates.map((d) => `journal:${d}`);
  const values = await redis.mget<(string | null)[]>(keys);
  const out = new Map<string, JournalEntry>();
  dates.forEach((date, i) => {
    const v = values[i];
    if (v) {
      const parsed = typeof v === "string" ? (JSON.parse(v) as JournalEntry) : (v as JournalEntry);
      out.set(date, parsed);
    }
  });
  return out;
}

export async function getPlans(dates: string[]): Promise<Map<string, DailyPlan>> {
  const redis = getRedis();
  const keys = dates.map((d) => `plan:${d}`);
  const values = await redis.mget<(string | null)[]>(keys);
  const out = new Map<string, DailyPlan>();
  dates.forEach((date, i) => {
    const v = values[i];
    if (v) {
      const parsed = typeof v === "string" ? (JSON.parse(v) as DailyPlan) : (v as DailyPlan);
      out.set(date, parsed);
    }
  });
  return out;
}

export async function getUserState(): Promise<UserState> {
  const redis = getRedis();
  const data = await redis.get<string>("user:state");
  if (!data) return {};
  return typeof data === "string" ? (JSON.parse(data) as UserState) : (data as UserState);
}

export async function setUserState(state: Partial<UserState>): Promise<void> {
  const redis = getRedis();
  const current = await getUserState();
  const next = { ...current, ...state };
  await redis.set("user:state", JSON.stringify(next), { ex: TTL_SECONDS });
}

export async function appendProgress(projectKey: string, entry: { date: string; value: number; note?: string }): Promise<void> {
  const redis = getRedis();
  const key = `progress:${projectKey}`;
  const existing = (await redis.get<string>(key)) || "[]";
  const arr = JSON.parse(existing) as Array<{ date: string; value: number; note?: string }>;
  arr.push(entry);
  if (arr.length > 365) arr.shift();
  await redis.set(key, JSON.stringify(arr), { ex: TTL_SECONDS });
}

export async function getProgress(projectKey: string): Promise<Array<{ date: string; value: number; note?: string }>> {
  const redis = getRedis();
  const data = await redis.get<string>(`progress:${projectKey}`);
  if (!data) return [];
  return JSON.parse(data);
}

function dateRange(count: number, fromDate: Date): string[] {
  const out: string[] = [];
  const d = new Date(fromDate);
  for (let i = 0; i < count; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }
  return out;
}

export function lastNDates(n: number, from?: Date): string[] {
  return dateRange(n, from || new Date());
}
