"use client";

import { Fragment, useMemo, useState } from "react";
import { AlignLeft, ArrowRightLeft, Bot, Braces, CheckCircle2, Heading1, Image as ImageIcon, Layers, Link2, Loader2, Share2, Sparkles, Type, Unlink, Wand2, type LucideIcon } from "lucide-react";
import { seoAuditApi, type AutoFixPayload, type PendingIssue } from "@/lib/seoAuditApi";
import { SITE_ORIGIN } from "@/lib/siteConfig";
import PaginationBar from "@/components/seo/PaginationBar";
import { readSchema } from "@/lib/schemaCheck";

interface ActiveIssuesListProps {
  issues: PendingIssue[];
  loading: boolean;
  error: string | null;
  /** Called after the server accepted the fix; the parent drops the row and reloads the list */
  onFixed: (issue: PendingIssue) => void;
  onOpenImageInspector?: (route: string) => void;
  /** Start on one kind of issue / one page (used when the Page report sends the admin here) */
  initialFilter?: string;
  initialRoute?: string;
}

const SEVERITY_STYLE: Record<PendingIssue["severity"], string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  notice: "bg-sky-100 text-sky-700 border-sky-200",
};

const SEVERITY_BAR: Record<PendingIssue["severity"], string> = {
  critical: "border-l-red-400",
  warning: "border-l-amber-300",
  notice: "border-l-sky-300",
};

/** Plain words for the three severities */
const SEVERITY_WORD: Record<PendingIssue["severity"], string> = { critical: "Serious", warning: "Should fix", notice: "Tip" };

const TYPE_LABEL: Record<string, string> = {
  title: "Titles",
  description: "Descriptions",
  h1: "Headings (H1)",
  schema: "Structured data",
  canonical: "Canonical",
  og: "Share cards",
  image_alt: "Image alt text",
  redirect: "Broken links",
  robots: "Indexing rules",
};

/** How each kind of issue is shown in the filter tiles: a plain name, what it means in simple words, an icon and a colour */
const TYPE_META: Record<string, { label: string; hint: string; icon: LucideIcon; tile: string; on: string; icon_: string }> = {
  title: { label: "Page titles", hint: "The headline Google shows", icon: Type, tile: "bg-sky-50 border-sky-200 hover:bg-sky-100/70", on: "bg-sky-100 border-sky-400 ring-2 ring-sky-300", icon_: "bg-sky-100 text-sky-600" },
  description: { label: "Descriptions", hint: "The short text under it", icon: AlignLeft, tile: "bg-violet-50 border-violet-200 hover:bg-violet-100/70", on: "bg-violet-100 border-violet-400 ring-2 ring-violet-300", icon_: "bg-violet-100 text-violet-600" },
  h1: { label: "Main headings", hint: "The big heading on a page", icon: Heading1, tile: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100/70", on: "bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300", icon_: "bg-indigo-100 text-indigo-600" },
  redirect: { label: "Broken links", hint: "Links that lead nowhere", icon: Unlink, tile: "bg-rose-50 border-rose-200 hover:bg-rose-100/70", on: "bg-rose-100 border-rose-400 ring-2 ring-rose-300", icon_: "bg-rose-100 text-rose-600" },
  canonical: { label: "Main address", hint: "Which web address counts", icon: Link2, tile: "bg-teal-50 border-teal-200 hover:bg-teal-100/70", on: "bg-teal-100 border-teal-400 ring-2 ring-teal-300", icon_: "bg-teal-100 text-teal-600" },
  schema: { label: "Extra info", hint: "Helps Google understand you", icon: Braces, tile: "bg-amber-50 border-amber-200 hover:bg-amber-100/70", on: "bg-amber-100 border-amber-400 ring-2 ring-amber-300", icon_: "bg-amber-100 text-amber-700" },
  og: { label: "Share cards", hint: "How it looks when shared", icon: Share2, tile: "bg-fuchsia-50 border-fuchsia-200 hover:bg-fuchsia-100/70", on: "bg-fuchsia-100 border-fuchsia-400 ring-2 ring-fuchsia-300", icon_: "bg-fuchsia-100 text-fuchsia-600" },
  image_alt: { label: "Picture text", hint: "Words that describe an image", icon: ImageIcon, tile: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70", on: "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300", icon_: "bg-emerald-100 text-emerald-600" },
  robots: { label: "Indexing rules", hint: "Search bot instructions", icon: Bot, tile: "bg-orange-50 border-orange-200 hover:bg-orange-100/70", on: "bg-orange-100 border-orange-400 ring-2 ring-orange-300", icon_: "bg-orange-100 text-orange-600" },
};
const ALL_META = { label: "All issues", hint: "Everything found", icon: Layers, tile: "bg-slate-50 border-slate-200 hover:bg-slate-100", on: "bg-slate-100 border-slate-400 ring-2 ring-slate-300", icon_: "bg-slate-200 text-slate-600" };

type Panel = { id: string; kind: "redirect" | "h1" } | null;

/** A short text for a stored value (title, description, canonical or a small object) */
const show = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "(empty)";
  if (typeof v === "string") return v.length > 160 ? `${v.slice(0, 160)}…` : v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const first = o.metaTitle ?? o.metaDescription ?? o.canonicalUrl ?? o.toUrl ?? o.alt ?? o.h1Heading;
    if (typeof first === "string") return show(first);
  }
  return "updated";
};

interface FixResult {
  key: number;
  ok: boolean;
  /** Overrides the default banner title ("✓ Fixed" / "Nothing changed") */
  heading?: string;
  route: string;
  lines: Array<{ type: string; before: string; after: string }>;
  note: string;
}

export default function ActiveIssuesList({ issues, loading, error, onFixed, onOpenImageInspector, initialFilter, initialRoute }: ActiveIssuesListProps) {
  const [filter, setFilter] = useState<string>(initialFilter ?? "all");
  const [routeFilter, setRouteFilter] = useState<string>(initialRoute ?? "all");
  const [pageNo, setPageNo] = useState(1);
  const [pageSizeGrouped, setPageSizeGrouped] = useState(5);
  const [pageSizeFlat, setPageSizeFlat] = useState(20);
  const [busy, setBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [panel, setPanel] = useState<Panel>(null);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<FixResult[]>([]);
  const [grouped, setGrouped] = useState(true);
  const [extraTag, setExtraTag] = useState<NonNullable<NonNullable<AutoFixPayload["options"]>["h1ExtraTag"]>>("h2");
  // 1-Click Fix first SHOWS the new text; nothing is saved until "Apply this change"
  const [preview, setPreview] = useState<{ issueId: string; type: string; before: string; text: string; readOnly: boolean } | null>(null);
  const [previewBusy, setPreviewBusy] = useState<string | null>(null);

  const types = useMemo(() => Array.from(new Set(issues.map((i) => i.issueType))), [issues]);
  const routesList = useMemo(() => Array.from(new Set(issues.map((i) => i.route))).sort(), [issues]);

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      if (filter !== "all" && i.issueType !== filter) return false;
      if (routeFilter !== "all" && i.route !== routeFilter) return false;
      return true;
    });
  }, [issues, filter, routeFilter]);

  // issues of one page sit together (pages keep the order of their first issue)
  const groups = useMemo(() => {
    const map = new Map<string, PendingIssue[]>();
    for (const i of filtered) map.set(i.route, [...(map.get(i.route) ?? []), i]);
    return Array.from(map.entries()).map(([route, items]) => ({ route, items }));
  }, [filtered]);

  const pageSize = grouped ? pageSizeGrouped : pageSizeFlat;
  const totalUnits = grouped ? groups.length : filtered.length;
  const currentPage = Math.min(pageNo, Math.max(1, Math.ceil(totalUnits / pageSize)));
  const visibleGroups = grouped ? groups.slice((currentPage - 1) * pageSize, currentPage * pageSize) : [];
  const visibleFlat = grouped ? [] : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const run = async (issue: PendingIssue, payload: AutoFixPayload) => {
    setBusy(issue.id);
    setRowError((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== issue.id)));
    try {
      const res = await seoAuditApi.autoFixPage(payload);
      if (res.success === false) throw new Error(res.message || "The fix was not applied.");
      // say exactly what was written, so a fix is never a silent change
      const logs = (res.fixLogs ?? (res.fixLog ? [res.fixLog] : [])) as Array<Record<string, unknown>>;
      const lines = logs.map((l) => ({ type: String(l.issueType ?? ""), before: show(l.previousValue), after: show(l.newValue) }));
      const skipped = res.skipped && Object.keys(res.skipped).length ? ` Skipped: ${Object.entries(res.skipped).map(([k, v]) => `${k} (${v})`).join(", ")}.` : "";
      setResults((prev) => [{ key: Date.now(), ok: lines.length > 0, route: issue.route, lines, note: lines.length ? "Saved to the page's SEO record. It goes live on the website after the next website build." : `${res.message || "Nothing was written."}${skipped}` }, ...prev].slice(0, 5));
      setPanel(null);
      setValue("");
      onFixed(issue);
    } catch (err) {
      setRowError((p) => ({ ...p, [issue.id]: err instanceof Error ? err.message : "The fix failed." }));
    } finally {
      setBusy(null);
    }
  };

  const PREVIEWED = ["title", "description", "image_alt", "canonical", "og", "schema", "robots"];

  /** Asks the server what 1-Click Fix WOULD write (nothing is saved) and shows it */
  const showPreview = async (issue: PendingIssue) => {
    setPreviewBusy(issue.id);
    setRowError((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== issue.id)));
    setPanel(null);
    try {
      const res = await seoAuditApi.autoFixPage({
        pageUrl: issue.pageUrl,
        route: issue.route,
        issueType: issue.issueType as AutoFixPayload["issueType"],
        options: issue.issueType === "image_alt" ? { imageSrc: issue.imageSrc } : undefined,
        dryRun: true,
      });
      const first = res.preview?.[0];
      if (!first && /^Already saved/i.test(res.message || "")) {
        // the new text is already in the website data: say so, and let the list move the issue to "waiting for website"
        setResults((prev) => [{ key: Date.now(), ok: true, heading: "Already saved", route: issue.route, lines: [], note: res.message }, ...prev].slice(0, 5));
        onFixed(issue);
        return;
      }
      if (!first) {
        const why = res.skipped && Object.keys(res.skipped).length ? Object.entries(res.skipped).map(([k, v]) => `${k}: ${v === "ai_unavailable" ? "no AI answer, nothing to suggest" : v}`).join(", ") : res.message || "Nothing to change.";
        throw new Error(`Nothing was suggested (${why}). Nothing was changed.`);
      }
      const editable = first.type === "title" || first.type === "description" || first.type === "image_alt" || first.type === "canonical" || first.type === "schema";
      setPreview({ issueId: issue.id, type: first.type, before: show(first.before), text: typeof first.after === "string" ? first.after : show(first.after), readOnly: !editable });
    } catch (err) {
      setRowError((p) => ({ ...p, [issue.id]: err instanceof Error ? err.message : "Could not prepare the fix." }));
    } finally {
      setPreviewBusy(null);
    }
  };

  const oneClick = (issue: PendingIssue) => {
    if (PREVIEWED.includes(issue.issueType)) return showPreview(issue);
    return run(issue, {
      pageUrl: issue.pageUrl,
      route: issue.route,
      issueType: issue.issueType === "image_alt" ? "image_alt" : (issue.issueType as AutoFixPayload["issueType"]),
      options: issue.issueType === "image_alt" ? { imageSrc: issue.imageSrc } : undefined,
    });
  };

  /** Saves exactly what the preview showed (the text can be edited first) */
  const applyPreview = async (issue: PendingIssue) => {
    if (!preview) return;
    const text = preview.text.trim();
    if (!text) return;
    const options =
      preview.type === "title"
        ? { metaTitle: text }
        : preview.type === "description"
        ? { metaDescription: text }
        : preview.type === "image_alt"
        ? { imageSrc: issue.imageSrc, altText: text }
        : preview.type === "canonical"
        ? { canonicalUrl: text }
        : preview.type === "schema"
        ? { schemaMarkup: text }
        : undefined;
    await run(issue, { pageUrl: issue.pageUrl, route: issue.route, issueType: issue.issueType as AutoFixPayload["issueType"], options });
    setPreview(null);
  };

  const submitPanel = (issue: PendingIssue) => {
    const v = value.trim();
    if (!v) return;
    if (panel?.kind === "redirect") {
      return run(issue, { pageUrl: issue.pageUrl, route: issue.route, issueType: "redirect", options: { fromUrl: issue.route, toUrl: v, statusCode: 301 } });
    }
    return run(issue, { pageUrl: issue.pageUrl, route: issue.route, issueType: "h1", options: { h1Heading: v, h1ExtraTag: extraTag } });
  };

  /** One issue as a compact row: what is wrong, how it is now, and what can be done */
  const renderIssue = (issue: PendingIssue, showRoute: boolean) => {
    const isBusy = busy === issue.id;
    const open = panel?.id === issue.id;
    const btn = "inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-[0.6875rem] transition disabled:opacity-60";
    return (
      <li key={issue.id} className={`border-l-[3px] px-3 py-2 ${SEVERITY_BAR[issue.severity]}`}>
        <div className="grid items-start gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full border px-1.5 py-px text-[0.625rem] font-normal ${SEVERITY_STYLE[issue.severity]}`}>{SEVERITY_WORD[issue.severity]}</span>
              <span className="text-[0.8125rem] leading-tight text-slate-800 [font-weight:500]">{issue.title}</span>
              {showRoute && <span className="rounded bg-indigo-50 px-1.5 py-px font-mono text-[0.6875rem] text-indigo-700">{issue.route}</span>}
            </div>
            <div className="break-words text-[0.6875rem] leading-snug text-slate-500">{issue.detail}</div>
            {issue.currentValue && issue.issueType !== "redirect" && (
              <div className="line-clamp-2 break-words rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-[0.6875rem] leading-snug text-slate-600">
                <span className="mr-1.5 text-[0.625rem] uppercase tracking-wide text-slate-400">Now</span>&ldquo;{issue.currentValue}&rdquo;
              </div>
            )}
            {issue.imageSrc && (
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={issue.imageSrc.startsWith("http") ? issue.imageSrc : `${SITE_ORIGIN}${issue.imageSrc}`}
                  alt={issue.currentValue || "Preview"}
                  className="h-8 w-12 rounded border border-slate-200 bg-white object-contain"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <div className="min-w-0 flex-1 truncate font-mono text-[0.6875rem] text-slate-600" title={issue.imageSrc}>
                  {issue.imageSrc}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 md:max-w-[320px] md:justify-end">
            {issue.actions.includes("auto_fix") && (
              <button type="button" disabled={isBusy || previewBusy === issue.id} onClick={() => void oneClick(issue)} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-500`}>
                {isBusy || previewBusy === issue.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} {PREVIEWED.includes(issue.issueType) ? "Fix: see the change" : "1-Click Fix"}
              </button>
            )}
            {onOpenImageInspector && (issue.issueType === "image_alt" || issue.imageSrc) && (
              <button
                type="button"
                onClick={() => onOpenImageInspector(issue.route)}
                className={`${btn} border border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100`}
                title={`Open all images of ${issue.route} in the Image inspector`}
              >
                <Sparkles className="h-3 w-3 text-purple-600" /> Inspect images
              </button>
            )}
            {issue.actions.includes("redirect") && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setPanel(open && panel?.kind === "redirect" ? null : { id: issue.id, kind: "redirect" });
                  setValue("/");
                }}
                className={`${btn} border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100`}
              >
                <ArrowRightLeft className="h-3 w-3" /> Redirect 301
              </button>
            )}
            {issue.actions.includes("override_h1") && (
              <button
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setPanel(open && panel?.kind === "h1" ? null : { id: issue.id, kind: "h1" });
                  setValue(issue.currentValue ?? "");
                }}
                className={`${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
              >
                <Heading1 className="h-3 w-3" /> Override H1
              </button>
            )}
          </div>
        </div>

        {open && (
          <form
            className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2"
            onSubmit={(e) => {
              e.preventDefault();
              void submitPanel(issue);
            }}
          >
            {panel?.kind === "h1" && <div className="w-full text-[0.6875rem] text-slate-600">1. The page&apos;s one H1 (main heading). Keep or edit the text:</div>}
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={panel?.kind === "h1" ? 200 : 512}
              placeholder={panel?.kind === "redirect" ? "Redirect to (e.g. /services)" : "New H1 heading"}
              className="h-7 min-w-[240px] flex-1 rounded-md border border-slate-300 bg-white px-2 text-[0.75rem] text-slate-900 outline-none focus:border-emerald-600"
            />
            {panel?.kind === "h1" && (
              <label className="flex w-full flex-wrap items-center gap-1.5 text-[0.6875rem] text-slate-600">
                2. This page has more than one H1 tag. The extra ones become
                <select value={extraTag} onChange={(e) => setExtraTag(e.target.value as typeof extraTag)} className="h-7 cursor-pointer rounded-md border border-slate-300 bg-white px-2 text-[0.75rem] text-slate-800">
                  <option value="h2">H2 (recommended)</option>
                  <option value="h3">H3</option>
                  <option value="h4">H4</option>
                  <option value="p">Paragraph</option>
                  <option value="div">Plain block (div)</option>
                </select>
              </label>
            )}
            <button type="submit" disabled={isBusy || !value.trim()} className={`${btn} bg-indigo-700 text-white hover:bg-indigo-600`}>
              {isBusy ? "Saving…" : panel?.kind === "redirect" ? "Create 301" : `Save: 1 H1 + extra as ${extraTag === "p" ? "paragraph" : extraTag === "div" ? "div" : extraTag.toUpperCase()}`}
            </button>
            <button type="button" onClick={() => setPanel(null)} className={`${btn} border border-slate-300 bg-white text-slate-600`}>
              Cancel
            </button>
          </form>
        )}

        {preview?.issueId === issue.id && (
          <div className="mt-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-[0.75rem] text-emerald-950">
            <div className="text-[0.75rem] [font-weight:500]">Nothing is saved yet. This is what will be written to {issue.route}:</div>
            <div className="mt-1.5 text-[0.625rem] uppercase tracking-wide text-slate-500">Now</div>
            <div className="break-words text-[0.75rem] text-slate-600 line-through">{preview.before}</div>
            <div className="mt-1.5 text-[0.625rem] uppercase tracking-wide text-emerald-800">Will become {preview.readOnly ? "" : "(you can edit it)"}</div>
            {preview.readOnly ? (
              <div className="mt-0.5 break-words rounded border border-emerald-200 bg-white p-2 font-mono text-[0.6875rem]">{preview.text.length > 400 ? `${preview.text.slice(0, 400)}…` : preview.text}</div>
            ) : (
              <>
                <textarea
                  value={preview.text}
                  onChange={(e) => setPreview({ ...preview, text: e.target.value })}
                  rows={preview.type === "schema" ? 14 : preview.type === "description" ? 3 : 2}
                  spellCheck={preview.type !== "schema"}
                  className={`mt-0.5 w-full rounded border border-emerald-300 bg-white p-2 text-[0.75rem] text-slate-900 outline-none focus:border-emerald-700 ${preview.type === "schema" ? "font-mono text-[0.6875rem]" : ""}`}
                />
                {preview.type === "schema" &&
                  (() => {
                    const r = readSchema(preview.text);
                    return (
                      <div className={`text-[0.6875rem] ${r.ok ? "text-emerald-700" : "text-red-700"}`}>
                        {r.ok
                          ? `${r.types.length} schema${r.types.length === 1 ? "" : "s"}: ${r.types.join(", ")}. To add more, paste another <script type="application/ld+json"> block after this one.`
                          : r.problem}
                      </div>
                    );
                  })()}
                <div className={`text-[0.6875rem] ${preview.type === "schema" ? "hidden" : ""} ${(() => { const n = preview.text.trim().length; const [lo, hi] = preview.type === "title" ? [30, 70] : preview.type === "description" ? [120, 160] : [5, 125]; return n >= lo && n <= hi ? "text-emerald-700" : "text-amber-700"; })()}`}>
                  {preview.text.trim().length} characters (recommended: {preview.type === "title" ? "30 to 70" : preview.type === "description" ? "120 to 160" : "5 to 125"})
                </div>
              </>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <button type="button" disabled={isBusy || !preview.text.trim() || (preview.type === "schema" && !readSchema(preview.text).ok)} onClick={() => void applyPreview(issue)} className={`${btn} bg-emerald-700 text-white hover:bg-emerald-600`}>
                {isBusy ? "Saving…" : "Apply this change"}
              </button>
              {!preview.readOnly && (
                <button type="button" disabled={isBusy || previewBusy === issue.id} onClick={() => void showPreview(issue)} className={`${btn} border border-emerald-300 bg-white text-emerald-900`}>
                  {previewBusy === issue.id ? "Thinking…" : "Suggest another"}
                </button>
              )}
              <button type="button" onClick={() => setPreview(null)} className={`${btn} border border-slate-300 bg-white text-slate-600`}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {rowError[issue.id] && <div className="mt-1.5 text-[0.6875rem] text-red-700">{rowError[issue.id]}</div>}
      </li>
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-xs">
      {results.length > 0 && (
        <div className="space-y-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          {results.map((r) => (
            <div key={r.key} className={`rounded-lg border p-3 text-xs ${r.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="font-black">{r.heading ?? (r.ok ? "✓ Fixed" : "Nothing changed")} · <span className="font-mono">{r.route}</span></div>
                <button type="button" onClick={() => setResults((p) => p.filter((x) => x.key !== r.key))} className="font-bold text-slate-500 hover:text-slate-800 cursor-pointer" aria-label="Dismiss">✕</button>
              </div>
              {r.lines.map((l, i) => (
                <div key={i} className="mt-1.5">
                  <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-black uppercase">{l.type}</span>
                  <div className="mt-1 text-slate-500 line-through">{l.before}</div>
                  <div className="font-semibold">{l.after}</div>
                </div>
              ))}
              <div className="mt-1.5 text-[11px] opacity-80">{r.note}</div>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-[0.9375rem] [font-weight:500] text-slate-800">
              Issues to fix
              <span className="rounded-full bg-rose-100 px-2 py-px text-[0.6875rem] font-normal text-rose-700">
                {filtered.length}
                {filtered.length !== issues.length ? ` of ${issues.length}` : ""}
              </span>
            </h2>
            <p className="mt-0.5 max-w-xl text-[0.75rem] leading-snug text-slate-500">
              Pick a group below. Then press the green button on a line to see exactly what will change. Nothing is saved until you confirm.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white text-[11px]" role="group" aria-label="How to list the issues">
              {[
                { on: true, label: "By page" },
                { on: false, label: "One list" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={grouped === o.on}
                  onClick={() => {
                    setGrouped(o.on);
                    setPageNo(1);
                  }}
                  className={`cursor-pointer px-3 py-1.5 transition ${grouped === o.on ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {routesList.length > 1 && (
              <select
                value={routeFilter}
                onChange={(e) => {
                  setRouteFilter(e.target.value);
                  setPageNo(1);
                }}
                aria-label="Show issues of one page"
                className="h-8 max-w-[220px] cursor-pointer truncate rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700"
              >
                <option value="all">All pages ({issues.length})</option>
                {routesList.map((r) => (
                  <option key={r} value={r}>
                    {r} ({issues.filter((x) => x.route === r).length})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {types.length > 1 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2" role="group" aria-label="Show one kind of issue">
            {["all", ...types].map((t) => {
              const meta = t === "all" ? ALL_META : TYPE_META[t] ?? { ...ALL_META, label: TYPE_LABEL[t] ?? t.replace("_", " "), hint: "" };
              const Icon = meta.icon;
              const count = t === "all" ? issues.length : issues.filter((x) => x.issueType === t).length;
              const on = filter === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setFilter(t);
                    setPageNo(1);
                  }}
                  className={`group flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${on ? meta.on : meta.tile}`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition group-hover:scale-105 ${meta.icon_}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.8125rem] leading-tight [font-weight:500] text-slate-800">{meta.label}</span>
                    <span className="block truncate text-[0.6875rem] leading-snug text-slate-500" title={meta.hint}>{meta.hint}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-white/80 px-2 py-px text-[0.6875rem] font-normal text-slate-700">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading && issues.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-6 text-[0.75rem] text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading issues…
        </div>
      ) : error && issues.length === 0 ? (
        <div className="px-4 py-6 text-[0.75rem] text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-6 text-[0.75rem] text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Nothing to fix here.
        </div>
      ) : (
        <div className="space-y-2.5 p-3">
          {grouped ? (
            visibleGroups.map((g) => {
              const serious = g.items.filter((i) => i.severity === "critical").length;
              const total = issues.filter((x) => x.route === g.route).length;
              return (
                <section key={g.route} className="overflow-hidden rounded-xl border border-indigo-100 bg-white">
                  <header className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 bg-indigo-50/70 px-3 py-1.5">
                    <span className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-100 px-1.5 py-px text-[0.6875rem] font-normal text-indigo-700">Page</span>
                      <span className="font-mono text-[0.8125rem] text-slate-800">{g.route}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[0.6875rem] text-slate-500">
                      {serious > 0 && <span className="rounded-full bg-rose-100 px-2 py-px text-rose-700">{serious} serious</span>}
                      <span>
                        {total} issue{total === 1 ? "" : "s"} on this page
                      </span>
                    </span>
                  </header>
                  <ul className="divide-y divide-slate-100">{g.items.map((issue) => renderIssue(issue, false))}</ul>
                </section>
              );
            })
          ) : (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <ul className="divide-y divide-slate-100">{visibleFlat.map((issue) => renderIssue(issue, true))}</ul>
            </section>
          )}

          <PaginationBar
            page={currentPage}
            pageSize={pageSize}
            total={totalUnits}
            noun={grouped ? "pages" : "issues"}
            sizes={grouped ? [5, 10, 20] : [10, 20, 50]}
            onPage={setPageNo}
            onPageSize={(n) => {
              if (grouped) setPageSizeGrouped(n);
              else setPageSizeFlat(n);
              setPageNo(1);
            }}
          />
        </div>
      )}
    </section>
  );
}
