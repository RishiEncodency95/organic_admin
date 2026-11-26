"use client";

import { useEffect, useState } from "react";
import { CalendarRange, ChevronRight } from "lucide-react";
import {
  formatIst,
  getScheduleWindow,
  getSlideStatus,
  isSlideActiveAt,
  nowIstInputValue,
  parseIstDateTimeLocal,
} from "@/lib/heroSchedule";
import type { CmsRecord } from "@/lib/cmsJson";

const STATUS_TONE: Record<string, string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  expired: "border-slate-200 bg-slate-100 text-slate-500",
  always: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const STATUS_TEXT: Record<string, string> = {
  live: "Showing now",
  scheduled: "Waiting to start",
  expired: "Finished (hidden)",
  always: "Showing now",
};

function thumbSrc(item: CmsRecord): string {
  const raw = String(item.image || item.img || "");
  if (!raw) return "";
  return raw.startsWith("http") || raw.startsWith("/") ? raw : `/${raw}`;
}

/**
 * One clear table of every hero slide: its image, whether it is Normal (always shown) or
 * Scheduled, when it starts / ends, and whether it is on the website right now. All times IST.
 */
export function HeroScheduleOverview({
  items,
  labelFor,
  onOpenItem,
}: {
  items: Array<CmsRecord>;
  labelFor: (item: CmsRecord, index: number) => string;
  onOpenItem?: (index: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const [previewAt, setPreviewAt] = useState("");

  // Filled after mount so the server-rendered HTML never depends on the current time.
  useEffect(() => {
    setPreviewAt(nowIstInputValue());
  }, []);

  if (items.length === 0) return null;

  const now = Date.now();
  const previewMs = parseIstDateTimeLocal(previewAt) ?? now;
  const liveAtPreview = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isSlideActiveAt(item, previewMs))
    // Same order as the website: live scheduled slides first, then normal slides.
    .sort((a, b) => Number(Boolean(getScheduleWindow(b.item))) - Number(Boolean(getScheduleWindow(a.item))));
  const scheduledCount = items.filter((item) => getScheduleWindow(item)).length;

  return (
    <div className="overflow-hidden rounded-[6px] border border-[#e2e8f0] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-[#f8fafc] px-[12px] py-[8px] text-left hover:bg-[#f1f5f9] transition"
      >
        <span className="flex items-center gap-[6px] text-[11px] font-bold text-[#1e40af]">
          <ChevronRight className={`h-3.5 w-3.5 text-[#64748b] transition-transform ${open ? "rotate-90" : ""}`} />
          <CalendarRange className="h-3.5 w-3.5" />
          Slides Overview — {items.length - scheduledCount} Normal, {scheduledCount} Scheduled
        </span>
        <span className="text-[9px] font-medium text-[#64748b]">All times IST</span>
      </button>

      {open && (
        <div className="flex flex-col gap-[10px] p-[12px]">
          <div className="overflow-x-auto rounded-[6px] border border-[#e2e8f0]">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="bg-[#f8fafc]">
                <tr className="text-[9.5px] font-bold uppercase tracking-wide text-[#64748b]">
                  <th className="px-[8px] py-[6px]">#</th>
                  <th className="px-[8px] py-[6px]">Image</th>
                  <th className="px-[8px] py-[6px]">Slide</th>
                  <th className="px-[8px] py-[6px]">Type</th>
                  <th className="px-[8px] py-[6px]">Text</th>
                  <th className="px-[8px] py-[6px]">Starts</th>
                  <th className="px-[8px] py-[6px]">Ends</th>
                  <th className="px-[8px] py-[6px]">On website now?</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const win = getScheduleWindow(item);
                  const status = getSlideStatus(item, now);
                  const src = thumbSrc(item);
                  return (
                    <tr
                      key={String(item._id ?? index)}
                      onClick={() => onOpenItem?.(index)}
                      className={`cursor-pointer border-t border-[#f1f5f9] text-[10.5px] text-[#1e293b] hover:bg-[#f8fafc] ${
                        status.kind === "expired" ? "opacity-60" : ""
                      }`}
                      title="Click to edit this slide"
                    >
                      <td className="px-[8px] py-[5px] font-semibold text-[#64748b]">{index + 1}</td>
                      <td className="px-[8px] py-[5px]">
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt="" className="h-[30px] w-[80px] rounded-[3px] border border-[#e2e8f0] object-cover" />
                        ) : (
                          <span className="text-[9px] italic text-[#94a3b8]">No image</span>
                        )}
                      </td>
                      <td className="max-w-[220px] truncate px-[8px] py-[5px] font-semibold">{labelFor(item, index)}</td>
                      <td className="px-[8px] py-[5px]">
                        {win ? (
                          <span className="font-semibold text-blue-700">Scheduled</span>
                        ) : (
                          <span className="font-semibold text-emerald-700">Normal (always)</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-[8px] py-[5px]">
                        {item.showContent === false ? (
                          <span className="font-semibold text-slate-500">Image only</span>
                        ) : (
                          <span className="font-semibold text-[#334155]">Text + buttons</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-[8px] py-[5px]">
                        {win ? (win.start !== null ? formatIst(win.start) : "Immediately") : "—"}
                      </td>
                      <td className="whitespace-nowrap px-[8px] py-[5px]">
                        {win ? (win.end !== null ? formatIst(win.end) : "No end") : "—"}
                      </td>
                      <td className="px-[8px] py-[5px]">
                        <span className={`whitespace-nowrap rounded-full border px-[7px] py-[1px] text-[9px] font-bold ${STATUS_TONE[status.kind]}`}>
                          {STATUS_TEXT[status.kind]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Check any date / time */}
          <div className="flex flex-col gap-[6px] rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-[10px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <span className="text-[10px] font-bold text-[#1e293b]">Check another date/time:</span>
              <input
                type="datetime-local"
                value={previewAt}
                onChange={(e) => setPreviewAt(e.target.value)}
                className="h-[28px] rounded-[4px] border border-[#cbd5e1] bg-white px-[6px] text-[11px] font-medium text-[#1e293b] focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setPreviewAt(nowIstInputValue())}
                className="h-[28px] rounded-[4px] border border-[#cbd5e1] bg-white px-[8px] text-[10px] font-semibold text-[#334155] hover:bg-[#f1f5f9]"
              >
                Now
              </button>
            </div>
            <p className="text-[10px] text-[#475569]">
              {liveAtPreview.length === 0
                ? "No slide is live at this time — the website will show its default slides."
                : `The carousel will show ${liveAtPreview.length} slide(s), in this order: ${liveAtPreview
                    .map(({ item, index }) => `#${index + 1} ${labelFor(item, index)}`)
                    .join("  •  ")}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
