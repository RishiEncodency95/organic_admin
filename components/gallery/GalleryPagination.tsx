"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Shared footer for Table / Grid / Skeleton views — keeping pagination in one
 * place means all three views stay in lockstep on the same page & page size,
 * so switching views (or paging) never leaves one view stale.
 */
export default function GalleryPagination({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: GalleryPaginationProps) {
  return (
    <div className="mt-[12px] flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#2563eb]">
          Total Photos: <strong className="font-bold text-[#1d4ed8]">{totalCount}</strong>
        </span>
        <span className="text-[7.5px] text-[#8a92a0]">
          (Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, totalCount)} of {totalCount})
        </span>
      </div>

      <div className="flex items-center gap-[4px]">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          title="Previous Page"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`flex h-[22px] min-w-[22px] px-1.5 items-center justify-center rounded-[4px] border text-[8px] font-bold transition ${
              currentPage === pageNum
                ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs"
                : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
          title="Next Page"
        >
          <ChevronRight className="h-3 w-3" />
        </button>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="ml-2 h-[22px] rounded-[4px] border border-[#d8dce2] bg-white px-[6px] text-[8px] font-semibold text-[#334155] outline-none"
        >
          <option value={12}>12 / page</option>
          <option value={24}>24 / page</option>
          <option value={48}>48 / page</option>
        </select>
      </div>
    </div>
  );
}
