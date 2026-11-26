"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import type { SeoCheckupReportData } from "@/lib/seoCheckupData";

interface CategoryScoreSummaryProps {
  categories: SeoCheckupReportData["categories"];
  groups: SeoCheckupReportData["groups"];
  onSelectCategory: (groupId: string | null) => void;
}

export default function CategoryScoreSummary({
  categories,
  groups,
  onSelectCategory,
}: CategoryScoreSummaryProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold text-slate-900">
          SEO Score by Category
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {categories.length} audit groups
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const targetGroup = groups.find((group) => group.name === category.name);
          const total = category.passed + category.failed + category.warnings;
          const percent =
            category.score != null
              ? category.score
              : Math.round((category.passed / Math.max(1, total)) * 100);

          return (
            <button
              key={category.name}
              type="button"
              onClick={() => onSelectCategory(targetGroup?.id ?? null)}
              title={`Open the ${category.name} checks`}
              className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2 text-left transition hover:border-[#0b2a6b] hover:bg-slate-100/70 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="block truncate font-bold text-slate-900">
                  {category.name}
                </span>
                <span className="font-mono text-[11px] font-extrabold text-[#0b2a6b] shrink-0">
                  {category.score != null ? `${category.score}%` : ""}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10.5px] font-bold">
                {category.failed > 0 && <span className="text-red-600">{category.failed} Failed</span>}
                {category.warnings > 0 && <span className="text-amber-600">{category.warnings} Warn</span>}
                <span className="text-emerald-600">{category.passed} Pass</span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    percent >= 90
                      ? "bg-emerald-600"
                      : percent >= 70
                      ? "bg-blue-600"
                      : percent >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

