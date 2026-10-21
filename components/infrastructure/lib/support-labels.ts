export type Tone = "slate" | "blue" | "amber" | "red" | "green" | "violet" | "orange";

export const TONE_CLASS: Record<Tone, { chip: string; dot: string; text: string; soft: string }> = {
  slate: { chip: "border-slate-200 bg-slate-100 text-slate-700", dot: "bg-slate-400", text: "text-slate-700", soft: "bg-slate-50" },
  blue: { chip: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500", text: "text-blue-700", soft: "bg-blue-50" },
  amber: { chip: "border-amber-200 bg-amber-50 text-amber-800", dot: "bg-amber-500", text: "text-amber-800", soft: "bg-amber-50" },
  red: { chip: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-500", text: "text-rose-700", soft: "bg-rose-50" },
  green: { chip: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", text: "text-emerald-700", soft: "bg-emerald-50" },
  violet: { chip: "border-violet-200 bg-violet-50 text-violet-700", dot: "bg-violet-500", text: "text-violet-700", soft: "bg-violet-50" },
  orange: { chip: "border-orange-200 bg-orange-50 text-orange-700", dot: "bg-orange-500", text: "text-orange-700", soft: "bg-orange-50" },
};
