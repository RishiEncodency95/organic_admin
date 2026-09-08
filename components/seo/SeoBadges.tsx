import type { SeoSeverity } from "@/lib/seoAuditApi";

export function scoreTone(score: number | null): string {
  if (score == null) return "bg-surface-sunken text-text-secondary";
  if (score >= 90) return "bg-status-success-bg text-status-success-text";
  if (score >= 70) return "bg-status-confirmed-bg text-status-confirmed-text";
  if (score >= 50) return "bg-status-pending-bg text-status-pending-text";
  return "bg-status-danger-bg text-status-danger-text";
}

export function ScorePill({ score, size = "sm" }: { score: number | null; size?: "sm" | "lg" }) {
  const classes = size === "lg" ? "h-14 w-14 text-xl" : "h-7 w-9 text-[12px]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg font-semibold tabular-nums ${classes} ${scoreTone(score)}`}
      title={score == null ? "Not scored" : `SEO score ${score}/100`}
    >
      {score ?? "—"}
    </span>
  );
}

const STATUS_TONES: Array<{ test: (status: number) => boolean; classes: string }> = [
  { test: (status) => status >= 200 && status < 300, classes: "bg-status-success-bg text-status-success-text" },
  { test: (status) => status >= 300 && status < 400, classes: "bg-status-pending-bg text-status-pending-text" },
  { test: (status) => status >= 400, classes: "bg-status-danger-bg text-status-danger-text" },
];

export function HttpStatusBadge({ status }: { status: number | null }) {
  if (status == null) {
    return (
      <span className="inline-flex rounded-full bg-status-danger-bg px-2 py-0.5 text-[11px] font-semibold text-status-danger-text">
        no response
      </span>
    );
  }
  const tone = STATUS_TONES.find((entry) => entry.test(status))?.classes ?? "bg-status-neutral-bg text-status-neutral-text";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${tone}`}>{status}</span>
  );
}

const FIELD_TONES: Record<string, string> = {
  ok: "bg-status-success-bg text-status-success-text",
  self: "bg-status-success-bg text-status-success-text",
  valid: "bg-status-success-bg text-status-success-text",
  valid_with_breadcrumb: "bg-status-success-bg text-status-success-text",
  too_short: "bg-status-pending-bg text-status-pending-text",
  too_long: "bg-status-pending-bg text-status-pending-text",
  hierarchy_warning: "bg-status-pending-bg text-status-pending-text",
  points_elsewhere: "bg-status-pending-bg text-status-pending-text",
  none: "bg-status-neutral-bg text-status-neutral-text",
  unknown: "bg-status-neutral-bg text-status-neutral-text",
  missing: "bg-status-danger-bg text-status-danger-text",
  multiple: "bg-status-danger-bg text-status-danger-text",
  invalid: "bg-status-danger-bg text-status-danger-text",
  hierarchy_error: "bg-status-danger-bg text-status-danger-text",
};

const FIELD_LABELS: Record<string, string> = {
  ok: "OK",
  self: "Self",
  valid: "Valid",
  valid_with_breadcrumb: "Valid + BC",
  too_short: "Short",
  too_long: "Long",
  missing: "Missing",
  multiple: "Multiple",
  invalid: "Invalid",
  none: "None",
  unknown: "Unknown",
  points_elsewhere: "Other page",
  hierarchy_error: "Hierarchy",
  hierarchy_warning: "Hierarchy",
};

export function StatusChip({ value, title }: { value: string; title?: string }) {
  return (
    <span
      title={title ?? value}
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${FIELD_TONES[value] ?? "bg-status-neutral-bg text-status-neutral-text"}`}
    >
      {FIELD_LABELS[value] ?? value}
    </span>
  );
}

const SEVERITY_TONES: Record<SeoSeverity, string> = {
  critical: "bg-status-danger-bg text-status-danger-text",
  warning: "bg-status-pending-bg text-status-pending-text",
  notice: "bg-status-neutral-bg text-status-neutral-text",
};

export function SeverityBadge({ severity }: { severity: SeoSeverity }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${SEVERITY_TONES[severity]}`}>
      {severity}
    </span>
  );
}

export function IssueCountCell({ counts }: { counts: { critical: number; warning: number; notice: number } }) {
  return (
    <div className="flex items-center gap-1 tabular-nums">
      <span
        title={`${counts.critical} critical`}
        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[11px] font-semibold ${counts.critical > 0 ? "bg-status-danger-bg text-status-danger-text" : "bg-surface-sunken text-text-muted"}`}
      >
        {counts.critical}
      </span>
      <span
        title={`${counts.warning} warnings`}
        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded px-1 text-[11px] font-semibold ${counts.warning > 0 ? "bg-status-pending-bg text-status-pending-text" : "bg-surface-sunken text-text-muted"}`}
      >
        {counts.warning}
      </span>
      <span
        title={`${counts.notice} notices`}
        className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-surface-sunken px-1 text-[11px] font-medium text-text-secondary"
      >
        {counts.notice}
      </span>
    </div>
  );
}

export function formatMs(value: number | null): string {
  if (value == null) return "—";
  if (value < 1000) return `${Math.round(value)}ms`;
  return `${(value / 1000).toFixed(2)}s`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-IN");
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
