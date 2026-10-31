const LOCALE = "en-US";

/**
 * The signed-in user's display preferences (Settings → Preferences). Null until they saved some: then every format
 * below behaves exactly as before. Cached in localStorage so the first render after a reload already uses them.
 */
export interface DisplayPreferences {
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD" | "D MMM YYYY";
  timeFormat: "12-hour" | "24-hour";
  numberFormat: "indian" | "international";
  /** The next three come from Global Settings > Localization; nobody chooses them individually. */
  numberLocale?: string;
  currencyDisplay?: "symbol" | "code" | "name";
  firstDayOfWeek?: "monday" | "sunday" | "saturday";
}

export const DISPLAY_PREFERENCES_KEY = "omni:display-preferences";

function readCachedPreferences(): DisplayPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DISPLAY_PREFERENCES_KEY);
    return raw ? (JSON.parse(raw) as DisplayPreferences) : null;
  } catch {
    return null;
  }
}

let preferences: DisplayPreferences | null = readCachedPreferences();

export function getDisplayPreferences(): DisplayPreferences | null {
  return preferences;
}

/** Applies (or clears) the preferences and caches them; returns true when anything changed. */
export function setDisplayPreferences(next: DisplayPreferences | null): boolean {
  const changed = JSON.stringify(next) !== JSON.stringify(preferences);
  preferences = next;
  try {
    if (next) window.localStorage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(DISPLAY_PREFERENCES_KEY);
  } catch {
    // Storage blocked: the preferences still apply until the page is reloaded.
  }
  return changed;
}

const numberLocale = () => preferences?.numberLocale ?? (preferences?.numberFormat === "indian" ? "en-IN" : LOCALE);

/** The weekday a calendar starts on (0 = Sunday ... 6 = Saturday): the platform default, Monday, until preferences load. */
export function getFirstDayIndex(): 0 | 1 | 6 {
  return preferences?.firstDayOfWeek === "sunday" ? 0 : preferences?.firstDayOfWeek === "saturday" ? 6 : 1;
}

const compactNumber = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

const plainNumber = new Intl.NumberFormat(LOCALE);

export function formatNumber(value: number): string {
  return preferences ? new Intl.NumberFormat(numberLocale()).format(value) : plainNumber.format(value);
}

export function formatCompactNumber(value: number): string {
  if (value < 1000) return formatNumber(value);
  return preferences ? new Intl.NumberFormat(numberLocale(), { notation: "compact", maximumFractionDigits: 1 }).format(value) : compactNumber.format(value);
}

/** Money is abbreviated ("₹1.2L") only from one lakh up; below that the exact amount is shown, so a plan at ₹4,999 never reads as "₹5K". */
export const COMPACT_MONEY_FROM = 100_000;

export function formatCurrency(
  amountInMinorUnits: number,
  currency = "INR",
  options: { compact?: boolean; compactFrom?: number } = {},
): string {
  const amount = amountInMinorUnits / 100;
  // `compactFrom` (in whole currency units) keeps smaller amounts exact: "₹4,999", not "₹5K". Without it, compact applies to everything as before.
  const abbreviate = Boolean(options.compact) && Math.abs(amount) >= (options.compactFrom ?? 0);
  return new Intl.NumberFormat(preferences ? numberLocale() : LOCALE, {
    style: "currency",
    currency,
    currencyDisplay: preferences?.currencyDisplay ?? "symbol",
    notation: abbreviate ? "compact" : "standard",
    maximumFractionDigits: abbreviate ? 1 : 2,
    minimumFractionDigits: abbreviate ? 0 : options.compact && Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatDelta(value: number, fractionDigits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(fractionDigits)}%`;
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1,
  );
  const unit = BYTE_UNITS[exponent] ?? "B";
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${unit}`;
}

/** A date in the user's chosen order and time zone, e.g. 23/10/2026 or 23 Oct 2026. */
function preferredDate(date: Date, p: DisplayPreferences): string {
  if (p.dateFormat === "D MMM YYYY") return date.toLocaleDateString("en-GB", { timeZone: p.timezone, day: "numeric", month: "short", year: "numeric" });
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: p.timezone, day: "2-digit", month: "2-digit", year: "numeric" }).formatToParts(date).map((x) => [x.type, x.value]));
  if (p.dateFormat === "MM/DD/YYYY") return `${parts.month}/${parts.day}/${parts.year}`;
  if (p.dateFormat === "YYYY-MM-DD") return `${parts.year}-${parts.month}-${parts.day}`;
  return `${parts.day}/${parts.month}/${parts.year}`;
}

function preferredTime(date: Date, p: DisplayPreferences): string {
  return date.toLocaleTimeString("en-US", { timeZone: p.timezone, hour: "2-digit", minute: "2-digit", hour12: p.timeFormat === "12-hour" });
}

export function formatDate(iso: string): string {
  if (preferences) return preferredDate(new Date(iso), preferences);
  return new Date(iso).toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  if (preferences) {
    const date = new Date(iso);
    return `${preferredDate(date, preferences)}, ${preferredTime(date, preferences)}`;
  }
  return new Date(iso).toLocaleString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  if (preferences) return preferredTime(new Date(iso), preferences);
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const RELATIVE_UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const relativeTime = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const absolute = Math.abs(diff);

  if (absolute < 45_000) return "just now";

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (absolute >= ms) {
      return relativeTime.format(Math.round(diff / ms), unit);
    }
  }
  return relativeTime.format(Math.round(diff / 60_000), "minute");
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}
