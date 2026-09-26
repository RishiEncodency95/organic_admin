"use client";

import { useState } from "react";
import { Camera, GripVertical, ImageOff } from "lucide-react";
import type { MediaItem } from "@/app/(dashboard)/gallery/page";

/**
 * Exact copy of the 12-slot bento pattern from the public site's
 * GalleryGrid (frontend/app/components/gallery/GalleryGrid.tsx `styleCycle`)
 * so this preview lines up 1:1 with how the current page of photos will
 * actually lay out on the live Gallery / Glimpses page.
 */
const styleCycle = [
  { gridColumn: "span 5", gridRow: "span 12" },
  { gridColumn: "span 3", gridRow: "span 8" },
  { gridColumn: "span 2", gridRow: "span 8" },
  { gridColumn: "span 2", gridRow: "span 8" },
  { gridColumn: "span 4", gridRow: "span 8" },
  { gridColumn: "span 3", gridRow: "span 8" },
  { gridColumn: "span 3", gridRow: "span 7" },
  { gridColumn: "span 2", gridRow: "span 14" },
  { gridColumn: "span 2", gridRow: "span 10" },
  { gridColumn: "span 2", gridRow: "span 10" },
  { gridColumn: "span 3", gridRow: "span 10" },
  { gridColumn: "span 3", gridRow: "span 7" },
];

interface SkeletonBentoViewProps {
  items: MediaItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onSwapOrder: (a: MediaItem, b: MediaItem) => void;
}

export default function SkeletonBentoView({ items, selectedId, onSelect, onSwapOrder }: SkeletonBentoViewProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  // Always render exactly one full bento cycle (12 slots) — empty slots past
  // the current page's item count show as blank skeleton placeholders, so
  // the admin can see the whole layout, including gaps still to be filled.
  const slots = styleCycle.map((style, i) => ({ style, item: items[i] || null }));

  return (
    <div className="mt-[12px]">
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(12, 1fr)", gridAutoRows: "10px", gap: "8px" }}
      >
        {slots.map(({ style, item }, i) => {
          if (!item) {
            return (
              <div
                key={`empty-${i}`}
                style={style}
                className="animate-pulse overflow-hidden rounded-[10px] bg-slate-200"
              >
                <div className="flex h-full w-full items-center justify-center">
                  <ImageOff className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            );
          }

          const isSelected = selectedId === item.id;
          const isDragging = draggedId === item.id;
          const isOver = overId === item.id && draggedId !== null && draggedId !== item.id;

          return (
            <div
              key={item.id}
              style={style}
              draggable
              onClick={() => onSelect(item.id)}
              onDragStart={(e) => {
                setDraggedId(item.id);
                e.dataTransfer.effectAllowed = "move";
                // Required by the HTML5 drag-and-drop spec — without calling setData(),
                // several browsers silently refuse to fire the drop event at all, which
                // is why drops were doing nothing. dataTransfer is also the source of
                // truth on drop (not just React state), since it survives independently
                // of the drag gesture's own event/render timing.
                e.dataTransfer.setData("text/plain", String(item.id));
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setOverId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (draggedId !== null && draggedId !== item.id) setOverId(item.id);
              }}
              onDragLeave={() => setOverId((cur) => (cur === item.id ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                const transferredId = Number(e.dataTransfer.getData("text/plain"));
                const sourceId = Number.isFinite(transferredId) && transferredId !== 0 ? transferredId : draggedId;
                const draggedItem = items.find((x) => x.id === sourceId);
                if (draggedItem && draggedItem.id !== item.id) {
                  onSwapOrder(draggedItem, item);
                }
                setDraggedId(null);
                setOverId(null);
              }}
              className={`group relative cursor-grab overflow-hidden rounded-[10px] border-2 bg-[#eef2ee] shadow-sm transition-all active:cursor-grabbing ${
                isDragging ? "opacity-40" : ""
              } ${
                isOver
                  ? "border-emerald-500 ring-2 ring-emerald-400/40"
                  : isSelected
                  ? "border-[#075b33] ring-2 ring-[#075b33]/20"
                  : "border-transparent hover:border-slate-300"
              }`}
              title="Drag onto another photo to swap their positions in the layout"
            >
              <img
                src={item.image}
                alt={item.imageAlt || item.title}
                className="h-full w-full object-cover pointer-events-none"
                draggable={false}
              />

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)",
                }}
              />

              <div className="pointer-events-none absolute bottom-[8px] left-[8px] right-[8px] flex items-end justify-between gap-1">
                <span
                  className="inline-flex max-w-full items-center gap-1 truncate rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide"
                  style={{
                    background: "rgba(15,55,17,0.88)",
                    color: "#c8e6c9",
                    border: "1px solid rgba(76,175,80,0.4)",
                  }}
                >
                  <Camera className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </span>
              </div>

              <span
                className="pointer-events-none absolute top-[6px] right-[6px] rounded-[4px] px-1.5 py-0.5 text-[7px] font-bold text-white"
                style={{ background: "rgba(0,0,0,0.55)" }}
              >
                {item.year}
              </span>

              <div className="pointer-events-none absolute top-[6px] left-[6px] flex h-[20px] w-[20px] items-center justify-center rounded-[4px] bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3 w-3" />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-[10px] text-[8.5px] font-medium text-[#64748b]">
        This mirrors the live Gallery / Glimpses page layout exactly. Drag a photo onto another to swap their
        positions — blank tiles are empty slots on this page waiting for a photo.
      </p>
    </div>
  );
}
