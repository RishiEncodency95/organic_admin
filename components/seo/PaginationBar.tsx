"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { pageItems } from "@/components/ui/Pager";

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  /** Rows-per-page choices */
  sizes?: number[];
  /** What is being counted, for "Showing 1–10 of 39 changes" */
  noun?: string;
}

/**
 * Footer for a long list: what is on screen, page numbers (with first / last), and how many rows per page.
 * Sizes are written in rem so the admin's content scale does not enlarge them.
 */
export default function PaginationBar({ page, pageSize, total, onPage, onPageSize, sizes = [10, 20, 50], noun = "items" }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(total, current * pageSize);
  const box = "flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-lg border px-2 text-[0.75rem] transition disabled:cursor-not-allowed disabled:opacity-35";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
      <span className="text-[0.75rem] text-slate-500">
        Showing <span className="text-slate-800">{from}–{to}</span> of <span className="text-slate-800">{total}</span> {noun}
      </span>

      {pages > 1 && (
        <div className="flex items-center gap-1" role="navigation" aria-label="Pages">
          <button type="button" disabled={current <= 1} onClick={() => onPage(1)} aria-label="First page" className={`${box} border-slate-200 bg-white text-slate-600 hover:bg-slate-100`}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" disabled={current <= 1} onClick={() => onPage(current - 1)} aria-label="Previous page" className={`${box} border-slate-200 bg-white text-slate-600 hover:bg-slate-100`}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          {pageItems(current, pages).map((n, i) =>
            n === null ? (
              <span key={`gap-${i}`} className="px-1 text-[0.75rem] text-slate-400">
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPage(n)}
                aria-current={n === current ? "page" : undefined}
                className={`${box} ${n === current ? "border-indigo-600 bg-indigo-600 text-white shadow-xs" : "border-slate-200 bg-white text-slate-600 hover:bg-indigo-50"}`}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" disabled={current >= pages} onClick={() => onPage(current + 1)} aria-label="Next page" className={`${box} border-slate-200 bg-white text-slate-600 hover:bg-slate-100`}>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" disabled={current >= pages} onClick={() => onPage(pages)} aria-label="Last page" className={`${box} border-slate-200 bg-white text-slate-600 hover:bg-slate-100`}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <label className="flex items-center gap-1.5 text-[0.75rem] text-slate-500">
        Rows
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="h-7 cursor-pointer rounded-lg border border-slate-200 bg-white px-1.5 text-[0.75rem] text-slate-700"
        >
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s} per page
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
