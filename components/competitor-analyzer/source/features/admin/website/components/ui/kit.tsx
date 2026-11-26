"use client";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ElementType,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/components/infrastructure/lib/cn";
import type { Tone } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/../../data/selectors";
export const toneText: Record<Tone, string> = {
  good: "text-[#0B7A55]",
  warn: "text-[#9A5B08]",
  bad: "text-[#C0261F]",
  info: "text-[#1F5FBF]",
  muted: "text-[#64748B]",
  violet: "text-[#6D3FD1]",
};

export const toneChip: Record<Tone, string> = {
  good: "bg-[#E6F6EF] text-[#0B7A55] ring-[#BDE8D6]",
  warn: "bg-[#FDF3E3] text-[#9A5B08] ring-[#F5DFB8]",
  bad: "bg-[#FDECEB] text-[#C0261F] ring-[#F7CFCC]",
  info: "bg-[#EAF2FE] text-[#1F5FBF] ring-[#C9DDFA]",
  muted: "bg-[#F1F4F9] text-[#55637A] ring-[#E1E7F0]",
  violet: "bg-[#F2EDFE] text-[#6D3FD1] ring-[#DFD2FA]",
};

export const toneBar: Record<Tone, string> = {
  good: "bg-[#12A06D]",
  warn: "bg-[#E29208]",
  bad: "bg-[#DC3A32]",
  info: "bg-[#2563EB]",
  muted: "bg-[#94A3B8]",
  violet: "bg-[#7C3AED]",
};

export const toneDot: Record<Tone, string> = toneBar;

export const CARD =
  "rounded-xl border border-[#E6EBF4] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_28px_-18px_rgba(16,24,40,0.28)]";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonTone = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md";

const BUTTON_TONES: Record<ButtonTone, string> = {
  primary:
    "bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white ring-1 ring-inset ring-white/15 hover:from-[#2563EB] hover:to-[#1D4ED8] shadow-[0_1px_2px_rgba(16,24,40,0.10),0_4px_10px_-4px_rgba(37,99,235,0.45)]",
  secondary:
    "bg-white text-[#28354C] border border-[#DEE5EF] hover:border-[#C9D6EA] hover:bg-[#F7FAFE] shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
  ghost: "bg-transparent text-[#4A5A73] hover:bg-[#EFF3F9]",
  danger: "bg-white text-[#C0261F] border border-[#F0C9C6] hover:bg-[#FDF4F3]",
  success: "bg-[#0F9D6E] text-white hover:bg-[#0B845C]",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-[11px] gap-1.5 [&_svg]:size-3.5",
  md: "h-8.5 px-3 text-[12px] gap-1.5 [&_svg]:size-3.5",
};

export interface WButtonProps extends ComponentProps<"button"> {
  tone?: ButtonTone;
  size?: ButtonSize;
  icon?: ElementType;
  disabledReason?: string;
}

export function WButton({
  tone = "secondary",
  size = "md",
  icon: Icon,
  className,
  children,
  disabled,
  disabledReason,
  title,
  ...props
}: WButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? (disabledReason ?? title) : title}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-55",
        BUTTON_TONES[tone],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden /> : null}
      {children}
    </button>
  );
}

/** Text link styled as an inline action, used for "View all" style affordances. */
export function LinkAction({ className, children, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer rounded text-[11px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
  icon: Icon,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  icon?: ElementType;
}) {
  return (
    <section className={cn(CARD, "flex flex-col overflow-hidden", className)}>
      {title ? (
        <header className="flex min-h-[46px] shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#EEF2F8] bg-gradient-to-b from-[#FBFCFE] to-white px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {Icon ? (
              <span className="grid size-[26px] shrink-0 place-items-center rounded-lg bg-[#EFF4FC] text-[#3B69B8] ring-1 ring-inset ring-[#DCE7F7]">
                <Icon className="size-3.5" aria-hidden />
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-[12.5px] font-semibold tracking-[-0.01em] text-[#111C3A]">{title}</h2>
              {subtitle ? <p className="mt-0.5 text-[10.5px] leading-snug text-[#6B7A94]">{subtitle}</p> : null}
            </div>
          </div>
          {action ? <div className="flex shrink-0 items-center gap-1.5">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("min-h-0 flex-1", bodyClassName ?? "p-3.5")}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Chips, meters, deltas                                               */
/* ------------------------------------------------------------------ */

export function Chip({
  tone = "muted",
  children,
  dot = false,
  className,
  icon: Icon,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
  icon?: ElementType;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
        toneChip[tone],
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", toneBar[tone])} aria-hidden /> : null}
      {Icon ? <Icon className="size-3" aria-hidden /> : null}
      {children}
    </span>
  );
}

export function Meter({
  value,
  max = 100,
  tone = "info",
  className,
  label,
}: {
  value: number;
  max?: number;
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span
      className={cn("block h-1.5 w-full overflow-hidden rounded-full bg-[#EDF1F7]", className)}
      role="meter"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <span className={cn("block h-full rounded-full transition-[width]", toneBar[tone])} style={{ width: `${pct}%` }} />
    </span>
  );
}

export function Delta({ value, suffix = "%", inverse = false }: { value: number; suffix?: string; inverse?: boolean }) {
  if (value === 0) return <span className="text-[10.5px] font-semibold text-[#94A3B8]">no change</span>;
  const positive = inverse ? value < 0 : value > 0;
  return (
    <span
      className={cn("whitespace-nowrap text-[10.5px] font-semibold", positive ? "text-[#0B7A55]" : "text-[#C0261F]")}
    >
      {value > 0 ? "▲" : "▼"} {Math.abs(value).toFixed(Math.abs(value) < 10 ? 1 : 0)}
      {suffix}
    </span>
  );
}

export function ScoreDial({
  value,
  tone,
  size = 58,
  label,
}: {
  value: number | null;
  tone: Tone;
  size?: number;
  label?: string;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const strokeColor: Record<Tone, string> = {
    good: "#12A06D",
    warn: "#E29208",
    bad: "#DC3A32",
    info: "#2563EB",
    muted: "#CBD5E1",
    violet: "#7C3AED",
  };
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={label ?? `Score ${pct}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EDF1F8" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
        />
      </svg>
      <span className="absolute text-[15px] font-semibold tracking-[-0.025em] text-[#0F1A38]">
        {value === null ? "—" : Math.round(value)}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

export function StatTile({
  label,
  value,
  best,
  sub,
  delta,
  deltaSuffix = "%",
  inverseDelta = false,
  tone = "info",
  icon: Icon,
  onClick,
  footer,
  className,
}: {
  label: string;
  value: ReactNode;
  best?: ReactNode;
  sub?: ReactNode;
  delta?: number;
  deltaSuffix?: string;
  inverseDelta?: boolean;
  tone?: Tone;
  icon?: ElementType;
  onClick?: () => void;
  footer?: ReactNode;
  className?: string;
}) {
  const Wrapper = onClick ? "button" : "div";
  const rail: Record<Tone, string> = {
    good: "from-[#12A06D]",
    warn: "from-[#E29208]",
    bad: "from-[#DC3A32]",
    info: "from-[#2563EB]",
    muted: "from-[#94A3B8]",
    violet: "from-[#7C3AED]",
  };

  const bgGradient: Record<Tone, string> = {
    good: "bg-gradient-to-br from-white to-[#F0FDF4]",
    warn: "bg-gradient-to-br from-white to-[#FFFBEB]",
    bad: "bg-gradient-to-br from-white to-[#FEF2F2]",
    info: "bg-gradient-to-br from-white to-[#EFF6FF]",
    muted: "bg-gradient-to-br from-white to-[#F8FAFC]",
    violet: "bg-gradient-to-br from-white to-[#F5F3FF]",
  };

  return (
    <Wrapper
      {...(onClick ? { type: "button" as const, onClick } : {})}
      className={cn(
        CARD,
        bgGradient[tone],
        "group relative flex w-full flex-col justify-center overflow-hidden p-3.5 pl-4 text-left",
        onClick &&
        "cursor-pointer transition-all hover:-translate-y-px hover:border-[#C9D6EA] hover:shadow-[0_1px_2px_rgba(16,24,40,0.05),0_16px_32px_-20px_rgba(16,24,40,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35",
        className,
      )}
    >
      {/* Background Watermark Icon */}
      {Icon ? (
        <Icon className={cn("absolute -bottom-3 -right-2 size-20 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6", toneText[tone])} aria-hidden />
      ) : null}

      {/* A tone rail keeps the tile readable at a glance without colouring text. */}
      <span
        className={cn("absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b to-transparent opacity-80", rail[tone])}
        aria-hidden
      />

      <span className="relative z-10 flex items-center justify-between gap-2 mb-1">
        <span className="truncate text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#64748B]">
          {label}
        </span>
        {Icon ? (
          <span className={cn("grid size-[26px] shrink-0 place-items-center rounded-lg ring-1 ring-inset bg-white/50 backdrop-blur-sm", toneChip[tone])}>
            <Icon className="size-[14px]" aria-hidden />
          </span>
        ) : null}
      </span>

<span className="relative z-10 flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-0.5">
        <b className={cn("text-[24px] font-bold leading-none tracking-[-0.03em]", toneText[tone])}>{value}</b>
        {best !== undefined ? <span className="mx-1 text-[#15803D] font-bold text-[10px]">/</span> : null}
        {best !== undefined ? (
          <span className="inline-flex items-center rounded-md bg-[#F0FDF4] px-1.5 py-0.5 text-[10px] font-bold text-[#15803D] ring-1 ring-inset ring-[#BBF7D0]">
            {best}
          </span>
        ) : null}
      </span>

      {delta !== undefined ? (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset",
            delta === 0
              ? toneChip.muted
              : (inverseDelta ? delta < 0 : delta > 0)
                ? toneChip.good
                : toneChip.bad,
          )}
        >
          <Delta value={delta} suffix={deltaSuffix} inverse={inverseDelta} />
        </span>
      ) : null}

      {sub ? <span className="relative z-10 truncate text-[11px] font-medium leading-snug text-[#64748B]">{sub}</span> : null}
      {footer && <div className="relative z-10 mt-2">{footer}</div>}
    </Wrapper>
  );
}

/** Label / value row used in detail panels and drawers. */
export function KeyValue({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 py-1.5", className)}>
      <dt className="shrink-0 text-[11px] font-medium text-[#6B7A94]">{label}</dt>
      <dd className="min-w-0 break-words text-right text-[11.5px] font-semibold text-[#28354C]">{children}</dd>
    </div>
  );
}
export function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  label,
  delay = 250,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  delay?: number;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);

  if (value !== committed) {
    setCommitted(value);
    setDraft(value);
  }

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChangeRef.current(draft), delay);
    return () => clearTimeout(timer);
  }, [draft, value, delay]);

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label ?? placeholder}
      </label>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#94A3B8]" aria-hidden />
      <input
        id={id}
        type="search"
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        className={cn(
          "h-8.5 w-full rounded-md border border-[#DAE1EC] bg-white pl-8 pr-7 text-[12px] text-[#28354C] placeholder:text-[#9AA7BC]",
          "focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20",
        )}
      />
      {draft ? (
        <button
          type="button"
          onClick={() => setDraft("")}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 grid size-5 -translate-y-1/2 cursor-pointer place-items-center rounded text-[#94A3B8] hover:bg-[#EFF3F9] hover:text-[#475569]"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

/** Native select — keyboard-accessible everywhere, no portal quirks in tables. */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
  className,
  srOnlyLabel = true,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
  srOnlyLabel?: boolean;
}) {
  const id = useId();
  return (
    <div className={cn("relative flex items-center gap-1.5", className)}>
      <label
        htmlFor={id}
        className={cn(srOnlyLabel ? "sr-only" : "text-[11px] font-medium text-[#6B7A94]")}
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-8.5 w-full cursor-pointer appearance-none rounded-md border border-[#DAE1EC] bg-white pl-2.5 pr-7 text-[12px] font-medium text-[#28354C]",
            "focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20",
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.count !== undefined ? ` (${option.count})` : ""}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-[#94A3B8]"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  size = "md",
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-md border border-[#DAE1EC] bg-[#F5F7FB] p-0.5", className)}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer rounded-[5px] font-semibold transition-colors",
              size === "sm" ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[11px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35",
              active ? "bg-white text-[#111C3A] shadow-[0_1px_2px_rgba(16,24,40,0.06)]" : "text-[#64748B] hover:text-[#28354C]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs (route-less, in-page)                                          */
/* ------------------------------------------------------------------ */

export function SubTabs<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: T;
  options: { value: T; label: string; count?: number; locked?: boolean }[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "scrollbar-thin flex items-center gap-0.5 overflow-x-auto rounded-lg bg-[#F3F6FB] p-1 ring-1 ring-inset ring-[#E6EBF4]",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "shrink-0 cursor-pointer rounded-[7px] px-2.5 py-1.5 text-[11.5px] font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35",
              active
                ? "bg-white text-[#1D4ED8] shadow-[0_1px_2px_rgba(16,24,40,0.10)] ring-1 ring-inset ring-[#DCE7F7]"
                : "text-[#5B6B85] hover:bg-white/70 hover:text-[#28354C]",
            )}
          >
            {option.label}
            {option.count !== undefined ? (
              <span className={cn("ml-1.5 text-[10px]", active ? "text-[#2563EB]" : "text-[#94A3B8]")}>
                {option.count}
              </span>
            ) : null}
            {option.locked ? <span className="ml-1 text-[9px] text-[#94A3B8]">🔒</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Value used when this column is sorted. Omit to make it unsortable. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
  /** Marks the column rendered as the title in the mobile card layout. */
  primary?: boolean;
  /** Dropped from the mobile card layout. */
  hideOnMobile?: boolean;
}

export interface SortState {
  key: string;
  direction: "asc" | "desc";
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  sort,
  onSortChange,
  empty,
  rowActions,
  caption,
  dense = false,
  desktopClassName,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  empty: ReactNode;
  rowActions?: (row: T) => ReactNode;
  caption?: string;
  dense?: boolean;
  desktopClassName?: string;
}) {
  if (rows.length === 0) return <>{empty}</>;

  const alignClass = (align: Column<T>["align"]) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  const handleSort = (column: Column<T>) => {
    if (!column.sortValue || !onSortChange) return;
    const direction = sort?.key === column.key && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ key: column.key, direction });
  };

  const primaryColumn = columns.find((column) => column.primary) ?? columns[0];

  return (
    <>
      {/* Desktop / tablet: real table */}
      <div className={cn("scrollbar-thin hidden overflow-x-auto md:block", desktopClassName)}>
        <table className="w-full min-w-full border-collapse">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-[#E9EEF6] bg-gradient-to-b from-[#F7F9FD] to-[#F2F5FA]">
              {columns.map((column) => {
                const sortable = Boolean(column.sortValue && onSortChange);
                const active = sort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    style={column.width ? { width: column.width } : undefined}
                    aria-sort={active ? (sort?.direction === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7A94]",
                      alignClass(column.align),
                      column.className,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1 rounded hover:text-[#28354C]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35",
                          active && "text-[#2563EB]",
                        )}
                      >
                        {column.header}
                        <ChevronsUpDown className="size-2.5" aria-hidden />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
              {rowActions ? (
                <th scope="col" className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-[#6B7A94]">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                      if (event.key === "Enter") onRowClick(row);
                    }
                    : undefined
                }
                className={cn(
                  "border-b border-[#F1F4F9] last:border-0",
                  onRowClick &&
                  "cursor-pointer transition-colors hover:bg-[#F8FAFD] focus-visible:bg-[#F1F6FE] focus-visible:outline-none",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-3 text-[11.5px] text-[#334155]",
                      dense ? "py-1.5" : "py-2.5",
                      alignClass(column.align),
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
                {rowActions ? (
                  <td
                    className={cn("px-3 text-right", dense ? "py-1.5" : "py-2.5")}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {rowActions(row)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-[#F2F5FA] md:hidden">
        {rows.map((row) => (
          <li key={getRowId(row)} className="px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              {onRowClick ? (
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className={cn(
                    "min-w-0 flex-1 cursor-pointer text-left",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35",
                  )}
                >
                  {primaryColumn ? primaryColumn.cell(row) : null}
                </button>
              ) : (
                <div className="min-w-0 flex-1 text-left">{primaryColumn ? primaryColumn.cell(row) : null}</div>
              )}
              {rowActions ? <div className="shrink-0">{rowActions(row)}</div> : null}
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {columns
                .filter((column) => column !== primaryColumn && !column.hideOnMobile)
                .map((column) => (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-[9.5px] font-semibold uppercase tracking-[0.04em] text-[#94A3B8]">
                      {column.header}
                    </dt>
                    <dd className="mt-0.5 truncate text-[11.5px] text-[#334155]">{column.cell(row)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Sorts rows in place for a `DataTable`, given the column definitions. */
export function useSortedRows<T>(rows: T[], columns: Column<T>[], sort: SortState | null): T[] {
  return useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((entry) => entry.key === sort.key);
    if (!column?.sortValue) return rows;
    const getValue = column.sortValue;
    return [...rows].sort((a, b) => {
      const left = getValue(a);
      const right = getValue(b);
      const comparison =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right));
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [rows, columns, sort]);
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 25, 50],
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizes?: number[];
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF2F8] px-3.5 py-2.5">
      <p className="text-[11px] text-[#6B7A94]">
        Showing <b className="font-semibold text-[#28354C]">{from}</b>–
        <b className="font-semibold text-[#28354C]">{to}</b> of{" "}
        <b className="font-semibold text-[#28354C]">{total}</b>
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange ? (
          <FilterSelect
            label="Rows per page"
            value={String(pageSize)}
            onChange={(value) => onPageSizeChange(Number(value))}
            options={pageSizes.map((size) => ({ value: String(size), label: `${size} / page` }))}
          />
        ) : null}
        <div className="flex items-center gap-1">
          <WButton
            size="sm"
            icon={ChevronLeft}
            disabled={page <= 1}
            disabledReason="You are on the first page"
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            Prev
          </WButton>
          <span className="px-1 text-[11px] font-semibold text-[#4A5A73]">
            {page} / {pageCount}
          </span>
          <WButton
            size="sm"
            disabled={page >= pageCount}
            disabledReason="You are on the last page"
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="size-3.5" aria-hidden />
          </WButton>
        </div>
      </div>
    </div>
  );
}

/** Client-side pagination state, shared by every table in the module. */
export function usePagination(total: number, initialSize = 25) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);

  return {
    page: safePage,
    pageSize,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    reset: () => setPage(1),
    slice: <T,>(rows: T[]) => rows.slice((safePage - 1) * pageSize, safePage * pageSize),
  };
}
