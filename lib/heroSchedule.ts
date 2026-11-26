export const IST_OFFSET_MS = 330 * 60 * 1000;

type SlideLike = { [key: string]: unknown };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function parseIst(dateStr?: unknown, timeStr?: unknown, isEnd = false): number | null {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) return null;
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return null;

  let year: number;
  let month: number;
  let day: number;
  if (parts[0].length === 4) {
    year = Number(parts[0]);
    month = Number(parts[1]) - 1;
    day = Number(parts[2]);
  } else if (parts[2].length === 4) {
    day = Number(parts[0]);
    month = Number(parts[1]) - 1;
    year = Number(parts[2]);
  } else {
    return null;
  }

  let hours = isEnd ? 23 : 0;
  let minutes = isEnd ? 59 : 0;
  let seconds = isEnd ? 59 : 0;
  let ms = isEnd ? 999 : 0;
  if (timeStr && typeof timeStr === "string" && timeStr.trim()) {
    const timeParts = timeStr.trim().split(":");
    if (timeParts.length >= 2) {
      hours = Number(timeParts[0]) || 0;
      minutes = Number(timeParts[1]) || 0;
      seconds = 0;
      ms = 0;
    }
  }

  const value = Date.UTC(year, month, day, hours, minutes, seconds, ms) - IST_OFFSET_MS;
  return Number.isNaN(value) ? null : value;
}

/** Start/end of a slide's schedule window (null side = open ended). Null when the slide is not time-limited. */
export function getScheduleWindow(slide: SlideLike): { start: number | null; end: number | null } | null {
  if (!slide.isScheduled) return null;
  const start = parseIst(slide.startDate, slide.startTime, false);
  const end = parseIst(slide.endDate, slide.endTime, true);
  if (start === null && end === null) return null;
  return { start, end };
}

export function isSlideActiveAt(slide: SlideLike, at: number): boolean {
  const win = getScheduleWindow(slide);
  if (!win) return true;
  if (win.start !== null && at < win.start) return false;
  if (win.end !== null && at > win.end) return false;
  return true;
}

export function formatIst(ms: number): string {
  const d = new Date(ms + IST_OFFSET_MS);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${hh}:${mm}`;
}

export type SlideStatusKind = "always" | "live" | "scheduled" | "expired";

export function getSlideStatus(slide: SlideLike, now: number = Date.now()): { kind: SlideStatusKind; label: string } {
  const win = getScheduleWindow(slide);
  if (!win) return { kind: "always", label: "Always on" };
  if (win.end !== null && now > win.end) return { kind: "expired", label: `Expired · ${formatIst(win.end)}` };
  if (win.start !== null && now < win.start) return { kind: "scheduled", label: `Scheduled · from ${formatIst(win.start)}` };
  return { kind: "live", label: win.end !== null ? `Live · till ${formatIst(win.end)}` : "Live" };
}

/** Blocking problem (the save must stop), or null. */
export function validateSchedule(slide: SlideLike): string | null {
  if (!slide.isScheduled) return null;
  const start = parseIst(slide.startDate, slide.startTime, false);
  const end = parseIst(slide.endDate, slide.endTime, true);
  if (start !== null && end !== null && end < start) return "The end date/time is before the start date/time.";
  return null;
}

export function getScheduleWarning(slide: SlideLike, now: number = Date.now()): string | null {
  if (!slide.isScheduled) return null;
  const start = parseIst(slide.startDate, slide.startTime, false);
  const end = parseIst(slide.endDate, slide.endTime, true);
  if (start === null && end === null) return "Both start and end are empty, so this slide will always be live.";
  if (end !== null && now > end) return "The end time has already passed, so this slide will not show on the website.";
  return null;
}

export function findOverlaps(slides: SlideLike[], now: number = Date.now()): Map<number, number[]> {
  const windows = slides.map((slide) => {
    const win = getScheduleWindow(slide);
    if (!win) return null;
    if (win.end !== null && now > win.end) return null; // already over
    return { start: win.start ?? -Infinity, end: win.end ?? Infinity };
  });

  const result = new Map<number, number[]>();
  windows.forEach((a, i) => {
    if (!a) return;
    windows.forEach((b, j) => {
      if (i === j || !b) return;
      if (a.start <= b.end && b.start <= a.end) result.set(i, [...(result.get(i) ?? []), j]);
    });
  });
  return result;
}

export function nowIstInputValue(now: number = Date.now()): string {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 16);
}

export function parseIstDateTimeLocal(value: string): number | null {
  if (!value) return null;
  const [date, time] = value.split("T");
  return parseIst(date, time, false);
}
