"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/*
 * Month calendar for picking a date range: first click sets the start, second click the end
 * (clicking a day before the start moves the start instead). Dates are local "YYYY-MM-DD".
 * Used inside the zoomed inbox page, so text sizes avoid the AdminContentScale list.
 */

export type DateRange = { from: string; to: string };

/** Local date → "YYYY-MM-DD" */
export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const label = (iso: string) => new Date(`${iso}T00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

type Props = {
  initial: DateRange;
  /** Latest selectable date (today) */
  max: string;
  onApply: (range: DateRange) => void;
  onCancel: () => void;
};

export default function DateRangeCalendar({ initial, max, onApply, onCancel }: Props) {
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [hover, setHover] = useState("");
  const [view, setView] = useState(() => {
    const d = new Date(`${initial.to || max}T00:00`);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (string | null)[] = [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, i) => isoDate(new Date(view.y, view.m, i + 1)))];
  const canNext = isoDate(new Date(view.y, view.m + 1, 1)) <= max;

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const pick = (d: string) => {
    if (!from || to) {
      setFrom(d);
      setTo("");
    } else if (d < from) setFrom(d);
    else setTo(d);
  };

  // While choosing the end, preview the range up to the hovered day
  const end = to || (from && hover >= from ? hover : "");

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="grid h-[28px] w-[28px] place-items-center rounded-[6px] text-[#334155] hover:bg-slate-100">
          <ChevronLeft className="h-[16px] w-[16px]" />
        </button>
        <p className="text-[13.4px] font-semibold text-[#0f172a]">{new Date(view.y, view.m, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canNext}
          aria-label="Next month"
          className="grid h-[28px] w-[28px] place-items-center rounded-[6px] text-[#334155] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="h-[16px] w-[16px]" />
        </button>
      </div>

      <div className="mt-[6px] grid grid-cols-7 text-center text-[11.6px] font-medium text-[#64748b]">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-[3px]">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-[2px]" onMouseLeave={() => setHover("")}>
        {cells.map((d, i) => {
          if (!d) return <span key={`blank-${i}`} />;
          const disabled = d > max;
          const isEdge = d === from || d === end;
          const inRange = !!from && !!end && d > from && d < end;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => pick(d)}
              onMouseEnter={() => setHover(d)}
              aria-pressed={isEdge}
              aria-label={label(d)}
              className={`h-[32px] text-[12.6px] transition ${
                isEdge
                  ? "rounded-[6px] bg-[#15633a] font-semibold text-white"
                  : inRange
                    ? "bg-[#e3f5e8] text-[#14532d]"
                    : disabled
                      ? "cursor-not-allowed text-[#cbd5e1]"
                      : `rounded-[6px] text-[#0f172a] hover:bg-[#eefaf1] ${d === max ? "font-semibold text-[#15633a] underline underline-offset-[3px]" : ""}`
              }`}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>

      <p className="mt-[8px] min-h-[18px] text-[12.4px] text-[#475569]">
        {from && to ? `${label(from)} – ${label(to)}` : from ? "Now pick an end date" : "Pick a start date"}
      </p>

      <div className="mt-[8px] flex justify-end gap-[8px]">
        <button type="button" onClick={onCancel} className="h-[32px] rounded-[7px] border border-[#dfe3e8] px-[14px] text-[12.6px] font-medium hover:bg-slate-50">
          Cancel
        </button>
        <button
          type="button"
          disabled={!from || !to}
          onClick={() => onApply({ from, to })}
          className="h-[32px] rounded-[7px] bg-[#15633a] px-[14px] text-[12.6px] font-semibold text-white hover:bg-[#124f2f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
