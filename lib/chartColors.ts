import { CaseStatus } from "./types";

export const CAUSE_LABELS: Record<string, string> = {
  general: "General Sewa",
  cremation: "Cremation",
  ambulance: "Ambulance",
  annadan: "Annadan",
};

// Fixed categorical order, validated for CVD-safe separation (dataviz skill's palette validator) —
// distinct hues rather than tints of the single magnitude accent, since this chart's job is
// composition-of-a-total across causes, not a single-hue magnitude comparison.
export const CAUSE_COLORS: Record<string, string> = {
  general: "#A6752E",
  cremation: "#C1502E",
  ambulance: "#0891A8",
  annadan: "#6B4FA0",
};
export const CAUSE_COLOR_FALLBACK = "#8A8578";

// Same validated 4-hue set as CAUSE_COLORS, reused for KPI tiles so every page draws from one
// consistent palette rather than inventing new colors per section.
export const KPI_COLORS = {
  cases: "#A6752E",
  requests: "#0891A8",
  volunteers: "#C1502E",
  donations: "#6B4FA0",
};

// Single-hue ordinal ramp (light -> dark = earlier -> later pipeline stage), validated with the
// dataviz skill's palette validator in --ordinal mode (monotone lightness, >=0.06 OKLCH step gaps,
// light-end contrast >=2:1 against the card surface) — a stage's place in the pipeline is order,
// not identity, so this stays one hue rather than switching to distinct categorical colors.
export const PIPELINE_COLORS: Record<CaseStatus, string> = {
  NEW: "#c99245",
  UNDER_VERIFICATION: "#b47e2e",
  APPROVED: "#9f6b13",
  VOLUNTEER_ASSIGNED: "#8b5700",
  TRANSPORT_ARRANGED: "#774500",
  CREMATION_IN_PROGRESS: "#633200",
  CREMATION_COMPLETED: "#502000",
  DOCS_UPLOADED: "#3d0e00",
  CLOSED: "#3d0e00",
  REJECTED: "#8A8578",
  CANCELLED: "#8A8578",
};
