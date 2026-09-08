import { CSSProperties } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "accent" | "neutral" | "danger";
  /** Fixed categorical hex for this metric's domain (e.g. cases vs. donations vs. volunteers) —
   * tints the icon chip and adds a left accent stripe so the KPI row reads as distinct metrics
   * rather than one repeated gray tile. Ignored when tone="danger" (an active problem always
   * wins visually, using the reserved status color instead of a metric's own identity color). */
  accentColor?: string;
}

export default function StatCard({ icon: Icon, label, value, hint, tone = "accent", accentColor }: StatCardProps) {
  const isDanger = tone === "danger";
  const hasStripe = isDanger || !!accentColor;

  const chipClass = isDanger
    ? "bg-status-danger-bg text-status-danger-text"
    : accentColor
      ? ""
      : tone === "neutral"
        ? "bg-surface-sunken text-text-secondary"
        : "bg-accent-soft text-accent";

  const chipStyle: CSSProperties | undefined =
    !isDanger && accentColor ? { backgroundColor: `${accentColor}1f`, color: accentColor } : undefined;

  const stripeStyle: CSSProperties | undefined = !isDanger && accentColor ? { borderLeftColor: accentColor } : undefined;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-none border border-white/60 bg-white/40 backdrop-blur-xl px-3 py-2.5 shadow-sm transition-shadow hover:shadow-md ${hasStripe ? `border-l-4 ${isDanger ? "border-l-status-danger-text" : ""}` : ""
        }`}
      style={stripeStyle}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${chipClass}`} style={chipStyle}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-lg font-semibold leading-tight text-text-primary">{value}</p>
          {hint && <p className="truncate text-[10px] text-text-muted">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
