import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Page numbers to show: the first 2, the current page with its neighbours and the last 2, with
 * null for a "…" gap. Up to 7 pages are all shown, so the pager never grows past ~9 buttons.
 */
export function pageItems(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, 2, page - 1, page, page + 1, pages - 1, pages].filter((n) => n >= 1 && n <= pages));
  const sorted = [...keep].sort((a, b) => a - b);
  const items: (number | null)[] = [];
  sorted.forEach((n, i) => {
    const prev = sorted[i - 1];
    if (prev !== undefined && n - prev === 2) items.push(prev + 1); // a single missing page: show it instead of "…"
    else if (prev !== undefined && n - prev > 2) items.push(null);
    items.push(n);
  });
  return items;
}

/** Compact ‹ 1 2 … 9 10 11 … 19 20 › pager used under the admin list tables. */
export default function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  const box = "flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border px-1.5 text-[8px] font-bold transition";
  return (
    <div className="flex items-center gap-[4px]">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page" className={`${box} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50 disabled:opacity-30`}>
        <ChevronLeft className="h-3 w-3" />
      </button>
      {pageItems(page, pages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} className="px-[2px] text-[8px] font-bold text-[#94a3b8]">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            aria-current={n === page ? "page" : undefined}
            className={`${box} ${n === page ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs" : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"}`}
          >
            {n}
          </button>
        )
      )}
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page" className={`${box} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50 disabled:opacity-30`}>
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
