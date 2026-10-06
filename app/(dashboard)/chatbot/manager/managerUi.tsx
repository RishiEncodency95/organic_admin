"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronDown, CircleAlert, CircleCheck, GripVertical, MoreVertical, X } from "lucide-react";
import type { ManagerSection } from "@/lib/chatbotManagerApi";

/*
 * Pieces shared by the Chatbot Manager tabs. Sizes avoid the text-[Npx] values that the
 * dashboard's AdminContentScale remaps with !important.
 */

export const selectClass =
  "h-[36px] w-full cursor-pointer appearance-none rounded-[7px] border border-[#dfe3e8] bg-white pl-[14px] pr-[36px] text-[13.6px] text-[#0f172a] outline-none transition focus:border-[#15633a]";
export const inputClass =
  "h-[38px] w-full rounded-[7px] border border-[#dfe3e8] bg-white px-[14px] text-[14.6px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#15633a] focus:ring-2 focus:ring-[#15633a]/15";
export const labelClass = "mb-[7px] block text-[13.6px] text-[#334155]";
export const cardClass = "rounded-[12px] border border-[#e3e8e4] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]";
export const cardTitleClass = "text-[20.5px] font-bold leading-tight text-[#0f2a1c]";

/** Native select styled like the design's dropdowns */
export function Select<T extends string>({
  value,
  options,
  onChange,
  label,
  className = "",
  selectClassName = "",
}: {
  value: T;
  options: readonly T[] | { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
  selectClassName?: string;
}) {
  return (
    <label className={`relative block ${className}`}>
      <select value={value} onChange={(e) => onChange(e.target.value as T)} className={`${selectClass} ${selectClassName}`} aria-label={label}>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          )
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#0f172a]" />
    </label>
  );
}

/** Same Organic Mitra logo as the website chatbot (copied from organic_frontend/public) */
export const LOGO = "/organic-mitra-logo.png";

export const BotAvatar = ({ size = 34 }: { size?: number }) => (
  <span
    className="grid shrink-0 place-items-center rounded-full bg-white shadow-sm ring-2 ring-[#F2B40E]/60"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <Image src={LOGO} alt="" width={64} height={64} style={{ width: size * 0.72, height: size * 0.72 }} className="object-contain" />
  </span>
);

// ─── Toast ───────────────────────────────────────────────────────────────────

export type Notify = (text: string, options?: { tone?: "success" | "error"; undo?: () => void }) => void;
export type Toast = { id: number; text: string; tone: "success" | "error"; undo?: () => void };

/** What the page asks a tab to do from the header's "Save Draft" */
export type TabHandle = { save: () => void };

/** Bottom-centre confirmation; rendered into document.body so the page zoom does not shrink it */
export function ToastBar({ toast, onDone }: { toast: Toast | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, toast.undo ? 6000 : 3500);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast || typeof document === "undefined") return null;
  const Icon = toast.tone === "error" ? CircleAlert : CircleCheck;
  return createPortal(
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className="fixed bottom-[24px] left-1/2 z-[300] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-[12px] rounded-[10px] bg-[#0f2a1c] py-[10px] pl-[14px] pr-[10px] font-sans text-[13.5px] text-white shadow-lg"
    >
      <Icon className={`h-[18px] w-[18px] shrink-0 ${toast.tone === "error" ? "text-[#f87171]" : "text-[#4ade80]"}`} />
      <span>{toast.text}</span>
      {toast.undo && (
        <button
          type="button"
          onClick={() => {
            toast.undo?.();
            onDone();
          }}
          className="rounded-[6px] px-[8px] py-[2px] font-semibold text-[#4ade80] hover:bg-white/10"
        >
          Undo
        </button>
      )}
      <button type="button" onClick={onDone} aria-label="Dismiss" className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
        <X className="h-[15px] w-[15px]" />
      </button>
    </div>,
    document.body
  );
}

// ─── Confirm dialog ──────────────────────────────────────────────────────────

export type ConfirmOptions = {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  run: () => void;
  /** Optional middle button, e.g. "Discard" next to "Save & continue" */
  secondary?: { label: string; run: () => void };
  /** Information only: just the main button */
  hideCancel?: boolean;
};

/** Small yes/no popup. Closes from Cancel, ✕ or Escape. `onClose` must be stable. */
export function ConfirmDialog({ confirm, onClose }: { confirm: ConfirmOptions | null; onClose: () => void }) {
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!confirm) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm, onClose]);

  if (!confirm || typeof document === "undefined") return null;
  const done = (run: () => void) => () => {
    run();
    onClose();
  };
  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-[420px] max-w-full rounded-[14px] bg-white px-[22px] pb-[16px] pt-[16px] text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-[12px]">
          <h2 id="confirm-title" className="text-[18.5px] font-bold leading-tight text-[#0f2a1c]">
            {confirm.title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-[6px] -mt-[4px] grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full transition hover:bg-slate-100">
            <X className="h-[19px] w-[19px]" />
          </button>
        </div>
        <div className="mt-[6px] text-[13.5px] text-[#475569]">{confirm.body}</div>
        <div className="mt-[16px] flex justify-end gap-[10px]">
          {!confirm.hideCancel && (
            <button type="button" onClick={onClose} className="h-[30px] rounded-[8px] border border-[#cbd5e1] bg-white px-[18px] text-[13.5px] font-semibold transition hover:bg-slate-50">
              Cancel
            </button>
          )}
          {confirm.secondary && (
            <button type="button" onClick={done(confirm.secondary.run)} className="h-[30px] rounded-[8px] border border-[#f3a5a5] bg-white px-[16px] text-[13.5px] font-semibold text-[#dc2626] transition hover:bg-[#fdf2f2]">
              {confirm.secondary.label}
            </button>
          )}
          <button
            ref={okRef}
            type="button"
            onClick={done(confirm.run)}
            className={`h-[30px] rounded-[8px] px-[18px] text-[13.5px] font-semibold text-white shadow-sm transition ${confirm.danger ? "bg-[#dc2626] hover:bg-[#b91c1c]" : "bg-[#15633a] hover:bg-[#124f2f]"}`}
          >
            {confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Row ⋮ menu ──────────────────────────────────────────────────────────────

export type MenuItem = { label: string; onSelect: () => void; danger?: boolean; disabled?: boolean };

/**
 * The ⋮ icon as a working menu. The list is rendered into document.body at the icon's
 * position, so tables with overflow-hidden do not clip it. Escape / outside click close it;
 * arrow keys move between items.
 */
export function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [pos, setPos] = useState<{ top?: number; bottom?: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const close = () => setPos(null);

  useEffect(() => {
    if (!pos) return;
    menuRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPos(null);
      triggerRef.current?.focus();
    };
    const onMove = () => setPos(null);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [pos]);

  const open = () => {
    if (pos) return close();
    const r = triggerRef.current!.getBoundingClientRect();
    const right = window.innerWidth - r.right;
    setPos(window.innerHeight - r.bottom < 40 * items.length + 24 ? { bottom: window.innerHeight - r.top + 4, right } : { top: r.bottom + 4, right });
  };

  const arrows = (e: React.KeyboardEvent) => {
    const buttons = [...(menuRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === "ArrowDown" ? (i + 1) % buttons.length : e.key === "ArrowUp" ? (i - 1 + buttons.length) % buttons.length : -1;
    if (next < 0) return;
    e.preventDefault();
    buttons[next]?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        className="grid h-[24px] w-[20px] place-items-center rounded-[4px] text-[#334155] transition hover:bg-slate-100 hover:text-[#0f172a]"
      >
        <MoreVertical className="h-[17px] w-[17px]" />
      </button>
      {pos &&
        createPortal(
          <>
            <div aria-hidden="true" className="fixed inset-0 z-[150]" onClick={close} />
            <div
              ref={menuRef}
              role="menu"
              aria-label={label}
              onKeyDown={arrows}
              style={pos}
              className="fixed z-[160] w-[180px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-[4px] font-sans text-[13.5px] shadow-lg"
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                  className={`block w-full px-[12px] py-[7px] text-left outline-none transition disabled:cursor-not-allowed disabled:opacity-40 ${
                    item.danger ? "text-[#dc2626] hover:bg-[#fdf2f2] focus-visible:bg-[#fdf2f2]" : "text-[#0f172a] hover:bg-[#f1f7ee] focus-visible:bg-[#f1f7ee]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

// ─── Drag to reorder ─────────────────────────────────────────────────────────

/** Moves the item with `fromId` to the position of `toId` */
export function reorder<T extends { id: number }>(list: T[], fromId: number, toId: number): T[] {
  const from = list.findIndex((x) => x.id === fromId);
  const to = list.findIndex((x) => x.id === toId);
  if (from < 0 || to < 0 || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Row reordering for the ⋮⋮ grip: drag the grip onto another row, or focus it and use
 * ↑ / ↓. `ids` is the visible order; `move(fromId, toId)` updates the list.
 */
export function useReorder(ids: number[], move: (fromId: number, toId: number) => void) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const end = () => {
    setDragId(null);
    setOverId(null);
  };
  return {
    handle: (id: number, name: string) => ({
      draggable: true,
      title: "Drag to reorder (or focus and use ↑ / ↓)",
      "aria-label": `Reorder ${name}`,
      onClick: (e: React.MouseEvent) => e.stopPropagation(),
      onDragStart: (e: React.DragEvent<HTMLElement>) => {
        setDragId(id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(id));
        const row = e.currentTarget.closest("[data-reorder-row]");
        if (row) e.dataTransfer.setDragImage(row, 24, 20);
      },
      onDragEnd: end,
      onKeyDown: (e: React.KeyboardEvent) => {
        const i = ids.indexOf(id);
        const target = e.key === "ArrowUp" ? ids[i - 1] : e.key === "ArrowDown" ? ids[i + 1] : undefined;
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
        e.preventDefault();
        if (target !== undefined) move(id, target);
      },
    }),
    row: (id: number) => ({
      "data-reorder-row": "",
      onDragOver: (e: React.DragEvent) => {
        if (dragId === null) return;
        e.preventDefault();
        if (overId !== id) setOverId(id);
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (dragId !== null && dragId !== id) move(dragId, id);
        end();
      },
    }),
    rowClass: (id: number) => (dragId === id ? "opacity-50" : dragId !== null && overId === id ? "shadow-[inset_0_2px_0_0_#15633a]" : ""),
  };
}

/** The design's ⋮⋮ grip icon, made into a drag / keyboard handle */
export function DragHandle({ props, className = "" }: { props: ReturnType<ReturnType<typeof useReorder>["handle"]>; className?: string }) {
  return (
    <button type="button" {...props} className={`grid cursor-grab place-items-center rounded-[4px] text-[#64748b] outline-none transition hover:text-[#0f172a] focus-visible:ring-2 focus-visible:ring-[#15633a] active:cursor-grabbing ${className}`}>
      <GripVertical className="h-[18px] w-[18px]" />
    </button>
  );
}

// ─── Saved draft (shared by every tab) ────────────────────────────────────────

/** The draft loaded from the server, and a saver that writes one section back */
export type ManagerStore = {
  draft: Partial<Record<ManagerSection, unknown>>;
  save: (section: ManagerSection, data: unknown) => void;
  /** Version number now live on the website (0 = nothing published yet) */
  liveMinor: number;
};

export const ManagerStoreContext = createContext<ManagerStore | null>(null);

/** The section as last saved, or undefined when it was never saved (the tab keeps its defaults) */
export function useDraftSection<T>(section: ManagerSection): T | undefined {
  return useContext(ManagerStoreContext)?.draft[section] as T | undefined;
}

/**
 * Saves `value` as the section's draft whenever it changes (not on the first render),
 * shortly after the last change so quick edits become one request.
 */
export function useSyncSection(section: ManagerSection, value: unknown) {
  const store = useContext(ManagerStoreContext);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!store) return;
    const id = setTimeout(() => store.save(section, value), 500);
    return () => clearTimeout(id);
  }, [section, value, store]);
}
