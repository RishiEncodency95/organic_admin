"use client";

import { useState } from "react";
import { ArrowLeftRight, Camera, GripVertical, ImageOff, X } from "lucide-react";
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
  // The photos on the current page of the layout.
  items: MediaItem[];
  // Every photo, so a swap source picked on another page can still be found.
  allItems: MediaItem[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onSwapOrder: (a: MediaItem, b: MediaItem) => void;
}

export default function SkeletonBentoView({ items, allItems, selectedId, onSelect, onSwapOrder }: SkeletonBentoViewProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  // Click-to-swap: the first click picks the source photo and it stays picked while
  // the admin pages through the layout; clicking another photo of the same category
  // (on any page) makes it the target and shows the Swap button on it.
  const [swapSourceId, setSwapSourceId] = useState<number | null>(null);
  const [swapTargetId, setSwapTargetId] = useState<number | null>(null);
  const swapSource = allItems.find((x) => x.id === swapSourceId) ?? null;
  const swapTarget = swapSource ? allItems.find((x) => x.id === swapTargetId) ?? null : null;

  const clearSwap = () => {
    setSwapSourceId(null);
    setSwapTargetId(null);
  };

  const handleTileClick = (item: MediaItem) => {
    onSelect(item.id);
    if (swapSource && item.id === swapSource.id) {
      clearSwap();
    } else if (swapSource && item.category === swapSource.category) {
      setSwapTargetId(item.id);
    } else {
      // Nothing picked yet, or a photo from another category — start over from this one.
      setSwapSourceId(item.id);
      setSwapTargetId(null);
    }
  };

  const confirmSwap = () => {
    if (!swapSource || !swapTarget) return;
    onSwapOrder(swapSource, swapTarget);
    clearSwap();
  };

  // Always render exactly one full bento cycle (12 slots) — empty slots past
  // the current page's item count show as blank skeleton placeholders, so
  // the admin can see the whole layout, including gaps still to be filled.
  const slots = styleCycle.map((style, i) => ({ style, item: items[i] || null }));

  return (
    <div className="mt-[12px]">
      <div className="mb-[10px] flex min-h-[46px] flex-wrap items-center gap-[10px] rounded-[6px] border border-[#fde68a] bg-[#fffbeb] px-[12px] py-[8px]">
        {!swapSource ? (
          <p className="text-[9px] font-semibold text-[#92400e]">
            Click a photo to select it, then click another photo of the same category, on any page, to swap
            their positions.
          </p>
        ) : (
          <>
            <img
              src={swapSource.image}
              alt={swapSource.imageAlt || swapSource.title}
              className="h-[30px] w-[42px] shrink-0 rounded-[4px] border-2 border-amber-500 object-cover"
            />
            {swapTarget ? (
              <>
                <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-[#92400e]" />
                <img
                  src={swapTarget.image}
                  alt={swapTarget.imageAlt || swapTarget.title}
                  className="h-[30px] w-[42px] shrink-0 rounded-[4px] border-2 border-emerald-500 object-cover"
                />
                <p className="flex-1 text-[9px] font-semibold text-[#92400e]">
                  Swap these two <strong>{swapSource.category}</strong> photos?
                </p>
                <button
                  type="button"
                  onClick={confirmSwap}
                  className="inline-flex h-[26px] items-center gap-1.5 rounded-[4px] bg-[#075b33] px-3 text-[9px] font-bold text-white shadow-xs transition hover:bg-[#064a2a] active:scale-95"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  Swap positions
                </button>
              </>
            ) : (
              <p className="flex-1 text-[9px] font-semibold text-[#92400e]">
                <strong>{swapSource.title}</strong> ({swapSource.category}, {swapSource.year}) selected. Now click
                another <strong>{swapSource.category}</strong> photo on any page to swap with it.
              </p>
            )}
            <button
              type="button"
              onClick={clearSwap}
              className="inline-flex h-[26px] items-center gap-1 rounded-[4px] border border-[#d8dce2] bg-white px-2.5 text-[9px] font-bold text-[#334155] shadow-xs transition hover:bg-slate-50"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </>
        )}
      </div>

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
          const isSwapSource = swapSource?.id === item.id;
          const isSwapTarget = swapTarget?.id === item.id;
          const isOtherCategory = !!swapSource && !isSwapSource && item.category !== swapSource.category;

          return (
            <div
              key={item.id}
              style={style}
              draggable
              onClick={() => handleTileClick(item)}
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
                isDragging || isOtherCategory ? "opacity-40" : ""
              } ${
                isOver || isSwapTarget
                  ? "border-emerald-500 ring-2 ring-emerald-400/40"
                  : isSwapSource
                  ? "border-amber-500 ring-2 ring-amber-400/50"
                  : isSelected
                  ? "border-[#075b33] ring-2 ring-[#075b33]/20"
                  : "border-transparent hover:border-slate-300"
              }`}
              title="Click to select for swapping, or drag onto another photo to swap their positions"
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

              {isSwapSource && (
                <span className="pointer-events-none absolute top-[6px] left-[30px] rounded-[4px] bg-amber-500 px-1.5 py-0.5 text-[7px] font-bold uppercase text-white">
                  Selected
                </span>
              )}

              {isSwapTarget && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmSwap();
                    }}
                    className="inline-flex items-center gap-1 rounded-[4px] bg-[#075b33] px-2.5 py-1 text-[8.5px] font-bold text-white shadow-md transition hover:bg-[#064a2a] active:scale-95"
                  >
                    <ArrowLeftRight className="h-3 w-3" />
                    Swap here
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-[10px] text-[8.5px] font-medium text-[#64748b]">
        This mirrors the live Gallery / Glimpses page layout exactly: published photos only, 12 per page. Drag a
        photo onto another to swap their positions — blank tiles are empty slots on this page waiting for a photo.
      </p>
    </div>
  );
}
