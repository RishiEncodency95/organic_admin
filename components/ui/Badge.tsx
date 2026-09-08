type Tone = "pending" | "confirmed" | "progress" | "success" | "danger" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  pending: "bg-status-pending-bg text-status-pending-text",
  confirmed: "bg-status-confirmed-bg text-status-confirmed-text",
  progress: "bg-status-progress-bg text-status-progress-text",
  success: "bg-status-success-bg text-status-success-text",
  danger: "bg-status-danger-bg text-status-danger-text",
  neutral: "bg-status-neutral-bg text-status-neutral-text",
};

export default function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
