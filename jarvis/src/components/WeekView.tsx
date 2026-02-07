"use client";

type DayInfo = { date: string; hasPlan: boolean; hasJournal: boolean; completed?: number; total?: number };

type Props = { days: DayInfo[]; onSelectDate?: (date: string) => void };

export function WeekView({ days, onSelectDate }: Props) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d) => {
        const status = d.hasPlan && (d.completed !== undefined && d.total !== undefined)
          ? (d.completed === d.total ? "full" : d.completed! > 0 ? "partial" : "planned")
          : d.hasPlan
            ? "planned"
            : "empty";
        const colors = {
          empty: "bg-neutral-800 text-neutral-500",
          planned: "bg-neutral-700 text-neutral-300",
          partial: "bg-amber-900/40 text-amber-200",
          full: "bg-emerald-900/40 text-emerald-200",
        };
        return (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelectDate?.(d.date)}
            className={`rounded p-2 text-center text-xs ${colors[status]}`}
            title={d.date}
          >
            <div>{new Date(d.date + "T12:00:00").getDate()}</div>
            {d.hasJournal && <span className="text-[10px]">•</span>}
          </button>
        );
      })}
    </div>
  );
}
