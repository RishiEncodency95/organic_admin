"use client";

import {
  Activity,
  AlertCircle,
  Bot,
  Clock,
  GitCompare,
  Heading1,
  Image as ImageIcon,
  ScanSearch,
  Share2,
  KeyRound,
  LayoutDashboard,
  Link2,
  ListChecks,
  Network,
  Send,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type AuditView = "issues" | "history" | "matrix";

interface Props {
  /** "audit" while one of the three main views is open, otherwise the id of the open tool */
  activeTab: string;
  view: AuditView;
  pendingCount: number;
  onOpenView: (view: AuditView) => void;
  onOpenTool: (toolId: string) => void;
}

/* Class names are written out in full so Tailwind can see them */
const TONE = {
  rose: { card: "bg-rose-50 border-rose-200 hover:bg-rose-100/70", on: "bg-rose-100 border-rose-300 ring-2 ring-rose-300", icon: "bg-rose-100 text-rose-600", dot: "bg-rose-500" },
  indigo: { card: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100/70", on: "bg-indigo-100 border-indigo-300 ring-2 ring-indigo-300", icon: "bg-indigo-100 text-indigo-600", dot: "bg-indigo-500" },
  emerald: { card: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70", on: "bg-emerald-100 border-emerald-300 ring-2 ring-emerald-300", icon: "bg-emerald-100 text-emerald-600", dot: "bg-emerald-500" },
  violet: { card: "bg-white/70 border-violet-200 hover:bg-white", on: "bg-white border-violet-400 ring-2 ring-violet-300", icon: "bg-violet-100 text-violet-600", dot: "bg-violet-500" },
  sky: { card: "bg-white/70 border-sky-200 hover:bg-white", on: "bg-white border-sky-400 ring-2 ring-sky-300", icon: "bg-sky-100 text-sky-600", dot: "bg-sky-500" },
  amber: { card: "bg-white/70 border-amber-200 hover:bg-white", on: "bg-white border-amber-400 ring-2 ring-amber-300", icon: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
} as const;

const VIEWS: Array<{ id: AuditView; label: string; text: string; icon: LucideIcon; tone: "rose" | "indigo" | "emerald" }> = [
  { id: "issues", label: "Issues to fix", text: "Problems found on your website. Fix them with one click.", icon: ShieldAlert, tone: "rose" },
  { id: "history", label: "Fix history & undo", text: "See every change made here and take any of them back.", icon: Clock, tone: "indigo" },
  { id: "matrix", label: "Page report", text: "A full check of one page: score, speed and every detail.", icon: LayoutDashboard, tone: "emerald" },
];

const GROUPS: Array<{
  title: string;
  text: string;
  bg: string;
  border: string;
  tone: "violet" | "sky" | "amber";
  tools: Array<{ id: string; label: string; text: string; icon: LucideIcon }>;
}> = [
  {
    title: "Page content",
    text: "The words and pictures on your pages",
    bg: "bg-violet-50",
    border: "border-violet-200",
    tone: "violet",
    tools: [
      { id: "ai_inspector", label: "Content inspector", text: "Read the text of each page and reword stiff lines", icon: Bot },
      { id: "ai_content", label: "AI content guard", text: "Check if a page reads like machine-written text", icon: Sparkles },
      { id: "headings", label: "Headings audit", text: "Every H1 to H6 of each page, and whether the order is right", icon: Heading1 },
      { id: "social", label: "Share cards (OG / X)", text: "Edit what WhatsApp, Facebook and X show for a page", icon: Share2 },
      { id: "image_inspector", label: "Image inspector", text: "Make sure every picture has a good description", icon: ImageIcon },
      { id: "ai_pictures", label: "AI picture check", text: "How many pictures of a page are AI-made", icon: ScanSearch },
      { id: "keyword_planner", label: "Keyword planner", text: "Find the words people type into Google", icon: KeyRound },
    ],
  },
  {
    title: "Links",
    text: "Links between pages and from other websites",
    bg: "bg-sky-50",
    border: "border-sky-200",
    tone: "sky",
    tools: [
      { id: "internal_links", label: "Internal links", text: "Connect related pages of your own site", icon: Network },
      { id: "backlinks", label: "Backlinks & Excel tracker", text: "Track links that other websites give you", icon: Link2 },
      { id: "not_found", label: "404 log", text: "Addresses visitors tried that do not exist", icon: AlertCircle },
      { id: "outreach", label: "Outreach", text: "Find sites that mention you and ask for a link", icon: Send },
    ],
  },
  {
    title: "Reports & tracking",
    text: "What happened, and what to do next",
    bg: "bg-amber-50",
    border: "border-amber-200",
    tone: "amber",
    tools: [
      { id: "activity_log", label: "Activity log", text: "A timeline of audits and changes", icon: Activity },
      { id: "semrush", label: "Compare audits", text: "Compare this audit with a Semrush report", icon: GitCompare },
      { id: "tasks", label: "Fix tasks", text: "A to-do list made from the audit", icon: ListChecks },
    ],
  },
];

export default function AuditNav({ activeTab, view, pendingCount, onOpenView, onOpenTool }: Props) {
  return (
    <nav aria-label="SEO audit sections" className="space-y-2.5">
      {/* The three main views */}
      <div className="grid gap-2.5 md:grid-cols-[repeat(3,minmax(0,1fr))]">
        {VIEWS.map((v) => {
          const on = activeTab === "audit" && view === v.id;
          const tone = TONE[v.tone];
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              type="button"
              aria-current={on ? "page" : undefined}
              onClick={() => onOpenView(v.id)}
              className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${on ? tone.on : tone.card}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${tone.icon}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-[0.875rem] [font-weight:500] text-slate-800">
                  {v.label}
                  {v.id === "issues" && pendingCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-1.5 py-px text-[0.6875rem] font-normal text-white">{pendingCount}</span>
                  )}
                </span>
                <span className="block text-[0.6875rem] leading-snug text-slate-600">{v.text}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* The other tools, grouped by what they are for */}
      <div>
        <div className="mb-1 px-1 text-[0.6875rem] text-slate-500">More tools, grouped by what they are for</div>
        <div className="grid gap-2.5 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
          {GROUPS.map((g) => {
            const tone = TONE[g.tone];
            return (
              <section key={g.title} className={`min-w-0 rounded-xl border p-2.5 ${g.bg} ${g.border}`}>
                <div className="px-1 pb-1.5">
                  <h3 className="text-[0.8125rem] [font-weight:500] text-slate-800">{g.title}</h3>
                  <p className="text-[0.6875rem] text-slate-500">{g.text}</p>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-1.5">
                  {g.tools.map((t) => {
                    const on = activeTab === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-current={on ? "page" : undefined}
                        onClick={() => onOpenTool(t.id)}
                        className={`group flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border px-2 py-1.5 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${on ? tone.on : tone.card}`}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition group-hover:scale-105 ${tone.icon}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-[0.8125rem] leading-tight [font-weight:500] text-slate-800">
                            {t.label}
                            {on && <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-label="open now" />}
                          </span>
                          <span className="block truncate text-[0.6875rem] leading-snug text-slate-500" title={t.text}>{t.text}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
