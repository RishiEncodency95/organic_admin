"use client";

import { CalendarDays } from "lucide-react";

export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "month" | "all" | "custom";

export interface DateRange {
  key: RangeKey;
  /** yyyy-mm-dd, used by the custom inputs */
  fromDate?: string;
  toDate?: string;
}

const PRESETS: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom" },
];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fromInputDate = (value: string) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** The selected range as ISO timestamps for the API (undefined = open-ended). */
export function resolveRange(range: DateRange): { from?: string; to?: string } {
  const today = new Date();
  switch (range.key) {
    case "today":
      return { from: startOfDay(today).toISOString(), to: endOfDay(today).toISOString() };
    case "yesterday": {
      const y = addDays(today, -1);
      return { from: startOfDay(y).toISOString(), to: endOfDay(y).toISOString() };
    }
    case "7d":
      return { from: startOfDay(addDays(today, -6)).toISOString(), to: endOfDay(today).toISOString() };
    case "30d":
      return { from: startOfDay(addDays(today, -29)).toISOString(), to: endOfDay(today).toISOString() };
    case "month":
      return { from: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(), to: endOfDay(today).toISOString() };
    case "custom":
      return {
        from: range.fromDate ? startOfDay(fromInputDate(range.fromDate)).toISOString() : undefined,
        to: range.toDate ? endOfDay(fromInputDate(range.toDate)).toISOString() : undefined,
      };
    default:
      return {};
  }
}

/** Every calendar day in the range (for charts), capped to the last 90 days for "All Time". */
export function daysInRange(range: DateRange, firstDataDay?: string): string[] {
  const { from, to } = resolveRange(range);
  const end = to ? new Date(to) : new Date();
  let start = from ? new Date(from) : firstDataDay ? fromInputDate(firstDataDay) : addDays(end, -29);
  if ((end.getTime() - start.getTime()) / 86_400_000 > 90) start = addDays(end, -89);
  const days: string[] = [];
  for (let d = startOfDay(start); d <= end; d = addDays(d, 1)) days.push(toInputDate(d));
  return days;
}

export const rangeLabel = (range: DateRange) => {
  if (range.key !== "custom") return PRESETS.find((p) => p.key === range.key)?.label ?? "";
  const f = range.fromDate ? fromInputDate(range.fromDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "Start";
  const t = range.toDate ? fromInputDate(range.toDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "Today";
  return `${f} – ${t}`;
};

export default function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-[6px]">
      <CalendarDays className="h-[14px] w-[14px] text-[#166b40]" />
      <div className="flex flex-wrap gap-[4px] rounded-[7px] bg-[#f1f5f2] p-[3px]">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() =>
              onChange(
                p.key === "custom"
                  ? { key: "custom", fromDate: value.fromDate ?? toInputDate(addDays(new Date(), -6)), toDate: value.toDate ?? toInputDate(new Date()) }
                  : { key: p.key }
              )
            }
            className={`rounded-[5px] px-[9px] py-[4px] text-[10px] font-semibold transition-all ${
              value.key === p.key ? "bg-[#166b40] text-white shadow-sm" : "text-[#4b5563] hover:bg-white hover:text-[#166b40]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {value.key === "custom" && (
        <div className="flex items-center gap-[4px]">
          <input
            type="date"
            value={value.fromDate ?? ""}
            max={value.toDate || toInputDate(new Date())}
            onChange={(e) => onChange({ ...value, fromDate: e.target.value })}
            aria-label="From date"
            className="h-[28px] rounded-[5px] border border-[#e5e6e2] bg-white px-[6px] text-[10px] font-medium text-[#414b5e] outline-none focus:border-[#8fa98e]"
          />
          <span className="text-[10px] text-[#9aa0aa]">to</span>
          <input
            type="date"
            value={value.toDate ?? ""}
            min={value.fromDate}
            max={toInputDate(new Date())}
            onChange={(e) => onChange({ ...value, toDate: e.target.value })}
            aria-label="To date"
            className="h-[28px] rounded-[5px] border border-[#e5e6e2] bg-white px-[6px] text-[10px] font-medium text-[#414b5e] outline-none focus:border-[#8fa98e]"
          />
        </div>
      )}
    </div>
  );
}
