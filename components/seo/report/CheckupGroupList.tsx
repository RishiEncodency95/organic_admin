"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  Clock,
  Database,
  Eye,
  FileCode,
  Gauge,
  Layers,
  Lightbulb,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type {
  CheckupGroup,
  CheckupLevel,
  CheckupSource,
  CheckupStatus,
  CheckupTest,
} from "@/lib/seoCheckupData";
import { sourceLabel } from "@/lib/seoCheckupData";
import { SITE_ORIGIN } from "@/lib/siteConfig";

export type StatusFilter = "all" | "failed" | "warning" | "passed";

const STATUS_STYLES: Record<CheckupStatus, { badge: string; card: string; icon: React.ElementType }> = {
  passed: {
    badge: "bg-emerald-600 text-white",
    card: "border-slate-200 bg-white",
    icon: Check,
  },
  failed: {
    badge: "bg-red-600 text-white",
    card: "border-red-200 bg-red-50/30",
    icon: X,
  },
  warning: {
    badge: "bg-amber-500 text-white",
    card: "border-amber-200 bg-amber-50/30",
    icon: AlertTriangle,
  },
};

const STAT_TONES: Record<string, string> = {
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  red: "bg-red-50 border-red-200 text-red-700",
};

const SOURCE_STYLES: Record<CheckupSource, string> = {
  measured: "border-blue-200 bg-blue-50 text-blue-700",
  crawl: "border-emerald-200 bg-emerald-50 text-emerald-700",
  derived: "border-amber-200 bg-amber-50 text-amber-700",
  not_tested: "border-slate-300 bg-slate-100 text-slate-600",
  not_connected: "border-slate-300 bg-slate-100 text-slate-600",
};

const SOURCE_HINT: Record<CheckupSource, string> = {
  measured: "Measured live over the network during this audit run",
  crawl: "Read from the live HTML of the crawled route",
  derived: "Calculated from real crawl inputs using published thresholds",
  not_tested: "Optional probe had no API credentials, so this was not tested",
  not_connected: "Optional data source is not connected",
};

const GROUP_ICONS: Record<string, React.ElementType> = {
  "ai-insights": Bot,
  "llm-visibility": Sparkles,
  "visual-seo": Eye,
  freshness: Clock,
  opportunities: Lightbulb,
  "common-seo": Search,
  speed: Zap,
  security: ShieldCheck,
  mobile: Smartphone,
  advanced: FileCode,
  pagespeed: Gauge,
};

const FILTER_META: Record<StatusFilter, { label: string; className: string }> = {
  all: { label: "All checks", className: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50" },
  failed: { label: "Failed", className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" },
  warning: { label: "Warnings", className: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100" },
  passed: { label: "Passed", className: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
};

function StatusBadge({ status, label }: { status: CheckupStatus; label?: string }) {
  const statusStyle = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide ${statusStyle.badge}`}>
      <statusStyle.icon className="h-3 w-3" />
      {label ?? status.toUpperCase()}
    </span>
  );
}

function LevelChip({ level }: { level?: CheckupLevel }) {
  if (!level) return null;
  return (
    <span
      title={level === "site" ? "Same result for every route of the domain" : "Evaluated against this route's crawl data"}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
        level === "site" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-300 bg-white text-slate-600"
      }`}
    >
      <Layers className="h-2.5 w-2.5" />
      {level === "site" ? "Site-wide" : "Page"}
    </span>
  );
}

function SourceChip({ source }: { source?: CheckupSource }) {
  if (!source) return null;
  return (
    <span
      title={SOURCE_HINT[source]}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${SOURCE_STYLES[source]}`}
    >
      <Database className="h-2.5 w-2.5" />
      {sourceLabel(source)}
    </span>
  );
}

function CellValue({ value }: { value: string | number }) {
  const text = String(value);
  if (text === "✓") return <Check className="h-4 w-4 text-emerald-600" />;
  if (text === "✗") return <X className="h-4 w-4 text-slate-300" />;
  if (text === "—") return <span className="text-slate-400">—</span>;
  return <>{text}</>;
}

export function TestCard({
  test,
  defaultOpen,
  baseUrl,
}: {
  test: CheckupTest;
  defaultOpen: boolean;
  baseUrl?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const statusStyle = STATUS_STYLES[test.status];
  const Icon = statusStyle.icon;

  return (
    <div className={`rounded-xl border p-3.5 text-xs space-y-2.5 shadow-2xs ${statusStyle.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="flex items-center gap-1.5 font-bold text-slate-900">
          <Icon
            className={`h-4 w-4 shrink-0 ${
              test.status === "passed" ? "text-emerald-600" : test.status === "failed" ? "text-red-600" : "text-amber-600"
            }`}
          />
          {test.name}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <LevelChip level={test.level} />
          <SourceChip source={test.source} />
          {test.benchmark && (
            <span className="rounded bg-white px-2 py-0.5 font-bold text-slate-600 border border-slate-200 text-[10px]">
              {test.benchmark}
            </span>
          )}
          <StatusBadge status={test.status} label={test.badge} />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-0.5 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer text-[10.5px] transition"
          >
            {open ? "Hide" : "Details"}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-2.5 pt-1 border-t border-slate-100">
          {test.summary && <p className="leading-relaxed text-slate-700">{test.summary}</p>}

          {test.meta && test.meta.length > 0 && (
            <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-2.5">
              {test.meta.map((line, index) => (
                <div key={index} className={line.mono ? "font-mono text-[11px] text-slate-700 break-words" : "text-slate-700"}>
                  {line.label && <strong className="text-slate-900">{line.label}: </strong>}
                  {line.value}
                </div>
              ))}
            </div>
          )}

          {test.stats && test.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {test.stats.map((stat) => (
                <div key={stat.label} className={`rounded-lg border p-2.5 ${STAT_TONES[stat.tone ?? "blue"]}`}>
                  <span className="block text-lg font-extrabold">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase">{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          {test.tables?.map((table, tableIndex) => (
            <div key={tableIndex} className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2.5">
              {table.title && <strong className="mb-1.5 block text-slate-900">{table.title}</strong>}
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    {table.headers.map((header) => (
                      <th key={header} className="py-1 pr-3 font-bold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-1 pr-3">
                          <CellValue value={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {test.lists?.map((list, listIndex) => (
            <div key={listIndex} className="rounded-lg border border-slate-200 bg-white p-2.5">
              {list.title && <strong className="mb-1 block text-slate-900">{list.title}</strong>}
              <ul className="space-y-1.5 text-slate-700">
                {list.items.map((item, itemIndex) => {
                  const isImage =
                    typeof item === "string" &&
                    (item.match(/\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i) ||
                      item.includes("res.cloudinary.com") ||
                      item.includes("/_next/image"));
                  if (isImage) {
                    let srcUrl = item;
                    if (item.startsWith("/")) {
                      const defaultBase =
                        typeof window !== "undefined" && window.location.hostname !== "localhost"
                          ? SITE_ORIGIN
                          : "http://localhost:3000";
                      const base = baseUrl?.startsWith("http") ? baseUrl : defaultBase;
                      try {
                        srcUrl = new URL(item, base).toString();
                      } catch {}
                    }
                    let sectionHint = "Unknown Section";
                    try {
                      sectionHint = decodeURIComponent(item).split("/").pop()?.split(".")[0] || "Unknown Section";
                    } catch {}
                    return (
                      <li
                        key={itemIndex}
                        className="flex flex-col gap-1.5 break-all font-mono text-[10px] text-slate-700 rounded-lg border border-slate-100 bg-slate-50/50 p-2"
                      >
                        <span className="font-bold text-[#0b2a6b]">Section: {sectionHint}</span>
                        <span>{item}</span>
                        <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={srcUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                        </div>
                      </li>
                    );
                  }
                  return (
                    <li key={itemIndex} className="break-words list-disc ml-5">
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {test.fix && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-2.5">
              <strong className="block text-[10.5px] uppercase tracking-wider text-blue-700 font-bold">
                How to fix
              </strong>
              <p className="mt-0.5 text-slate-700">{test.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GroupCard({
  group,
  filter,
  defaultOpen,
  openVersion,
  baseUrl,
}: {
  group: CheckupGroup;
  filter: StatusFilter;
  defaultOpen: boolean;
  openVersion: number;
  baseUrl?: string;
}) {
  const Icon = GROUP_ICONS[group.id] ?? Search;
  const counts = group.tests.reduce(
    (acc, test) => {
      acc[test.status] += 1;
      return acc;
    },
    { failed: 0, warning: 0, passed: 0 },
  );

  const visible = group.tests.filter((test) => filter === "all" || test.status === filter);
  if (visible.length === 0) return null;

  return (
    <section
      id={`report-${group.id}`}
      className="report-section rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 scroll-mt-32"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Icon className="h-4.5 w-4.5 text-[#0b2a6b]" />
            {group.name}
            {group.score != null && <span className="text-slate-500 font-normal">({group.score}%)</span>}
          </h3>
          {group.note && <p className="mt-0.5 text-xs text-slate-500">{group.note}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          {counts.failed > 0 && (
            <span className="rounded-md bg-red-50 px-2 py-0.5 text-red-700 border border-red-200">
              {counts.failed} Failed
            </span>
          )}
          {counts.warning > 0 && (
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-200">
              {counts.warning} Warnings
            </span>
          )}
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-200">
            {counts.passed} Passed
          </span>
          {group.badge && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-300">
              {group.badge}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((test) => (
          <TestCard key={`${test.id}-${openVersion}`} test={test} defaultOpen={defaultOpen} baseUrl={baseUrl} />
        ))}
      </div>
    </section>
  );
}

interface CheckupGroupListProps {
  groups: CheckupGroup[];
  baseUrl?: string;
  totalChecks: number;
}

export default function CheckupGroupList({
  groups,
  baseUrl,
  totalChecks,
}: CheckupGroupListProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [openVersion, setOpenVersion] = useState(0);

  const filterCounts = React.useMemo(() => {
    let failed = 0;
    let warning = 0;
    let passed = 0;
    for (const g of groups) {
      for (const t of g.tests) {
        if (t.status === "failed") failed++;
        else if (t.status === "warning") warning++;
        else if (t.status === "passed") passed++;
      }
    }
    return {
      all: failed + warning + passed,
      failed,
      warning,
      passed,
    };
  }, [groups]);

  const visibleGroups = groups.filter((group) =>
    filter === "all" ? true : group.tests.some((test) => test.status === filter),
  );

  const jumpToGroup = (groupId: string) => {
    const el = document.getElementById(`report-${groupId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar & Filter Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter Tests:
          </span>
          {(Object.keys(FILTER_META) as StatusFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                filter === key ? "ring-2 ring-[#0b2a6b] shadow-2xs " : ""
              }${FILTER_META[key].className}`}
            >
              {FILTER_META[key].label}
              <span className="ml-1.5 font-mono opacity-80">({filterCounts[key]})</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDefaultOpen(true);
              setOpenVersion((v) => v + 1);
            }}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Expand All Details
          </button>
          <button
            type="button"
            onClick={() => {
              setDefaultOpen(false);
              setOpenVersion((v) => v + 1);
            }}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Sticky Quick-Jump Navigation */}
      <div className="no-print sticky top-0 z-20 flex flex-wrap gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-xs backdrop-blur [scrollbar-width:thin]">
        <span className="text-[10px] font-extrabold uppercase text-slate-400 self-center mr-1">Jump To:</span>
        {visibleGroups.map((group) => {
          const Icon = GROUP_ICONS[group.id] ?? Search;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => jumpToGroup(group.id)}
              className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:border-[#0b2a6b] hover:bg-slate-50 hover:text-[#0b2a6b]"
            >
              <Icon className="h-3 w-3" />
              {group.name}
              <span className="font-mono text-[10px] text-slate-400">({group.tests.length})</span>
            </button>
          );
        })}
      </div>

      {/* Render All Group Cards */}
      <div className="space-y-4">
        {visibleGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            filter={filter}
            defaultOpen={defaultOpen}
            openVersion={openVersion}
            baseUrl={baseUrl}
          />
        ))}

        {visibleGroups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            No tests match the &quot;{filter}&quot; filter on this route.
          </div>
        )}
      </div>
    </div>
  );
}

