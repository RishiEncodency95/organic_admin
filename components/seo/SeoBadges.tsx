import type { SeoSeverity } from "@/lib/seoAuditApi";

export function scoreTone(score: number | null): string {
  if (score == null) return "bg-[#f3f4f6] text-[#4b5563]";
  if (score >= 90) return "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]";
  if (score >= 70) return "bg-[#e0f2fe] text-[#075985] border border-[#bae6fd]";
  if (score >= 50) return "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]";
  return "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]";
}

export function ScorePill({ score, size = "sm" }: { score: number | null; size?: "sm" | "lg" }) {
  const classes = size === "lg" ? "h-14 w-14 text-xl" : "h-7 w-9 text-[11px]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[6px] font-bold tabular-nums ${classes} ${scoreTone(score)}`}
      title={score == null ? "Not scored" : `SEO score ${score}/100`}
    >
      {score ?? "—"}
    </span>
  );
}

const STATUS_TONES: Array<{ test: (status: number) => boolean; classes: string }> = [
  { test: (status) => status >= 200 && status < 300, classes: "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]" },
  { test: (status) => status >= 300 && status < 400, classes: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]" },
  { test: (status) => status >= 400, classes: "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]" },
];

export function HttpStatusBadge({ status }: { status: number | null }) {
  if (status == null) {
    return (
      <span className="inline-flex rounded-full bg-[#fee2e2] px-2 py-0.5 text-[10px] font-bold text-[#991b1b]">
        no response
      </span>
    );
  }
  const tone = STATUS_TONES.find((entry) => entry.test(status))?.classes ?? "bg-[#f3f4f6] text-[#374151]";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${tone}`}>{status}</span>
  );
}

const FIELD_TONES: Record<string, string> = {
  ok: "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]",
  self: "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]",
  valid: "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]",
  valid_with_breadcrumb: "bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]",
  too_short: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
  too_long: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
  hierarchy_warning: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
  points_elsewhere: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
  none: "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]",
  unknown: "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]",
  missing: "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]",
  multiple: "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]",
  invalid: "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]",
  hierarchy_error: "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]",
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
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${FIELD_TONES[value] ?? "bg-[#f3f4f6] text-[#374151]"}`}
    >
      {FIELD_LABELS[value] ?? value}
    </span>
  );
}

const SEVERITY_TONES: Record<SeoSeverity, string> = {
  critical: "bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]",
  warning: "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]",
  notice: "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]",
};

export function SeverityBadge({ severity }: { severity: SeoSeverity }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${SEVERITY_TONES[severity]}`}>
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
