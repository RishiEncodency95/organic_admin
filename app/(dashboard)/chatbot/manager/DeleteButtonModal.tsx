"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";

/*
 * "Delete button?" confirmation for the Welcome Menu — design preview; the change stays a
 * draft until publishing. Closes from ✕, Cancel or Escape. Rendered into document.body so
 * the manager page's zoom does not shrink it.
 */

type Props = {
  /** null keeps the popup closed */
  button: { label: string; options: string[] } | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteButtonModal({ button, onClose, onConfirm }: Props) {
  const open = button !== null;
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!button || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
      <div aria-hidden="true" className="absolute inset-0 bg-[#0b1f14]/55 backdrop-blur-[2px]" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-button-title"
        aria-describedby="delete-button-body"
        className="relative w-[420px] max-w-full rounded-[14px] bg-white px-[22px] pb-[16px] pt-[16px] text-[#0f172a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-start gap-[14px]">
          <span className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-full bg-[#fdecec] text-[#dc2626]">
            <Trash2 className="h-[19px] w-[19px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="delete-button-title" className="text-[18.5px] font-bold leading-tight text-[#0f2a1c]">
              Delete “{button.label || "Untitled"}”?
            </h2>
            <p id="delete-button-body" className="mt-[4px] text-[13.5px] text-[#475569]">
              Visitors will no longer see this button in the Welcome Menu
              {button.options.length > 0 && <> and its {button.options.length} next option{button.options.length === 1 ? "" : "s"} will be removed</>}. The change goes live only after
              publishing.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-[6px] -mt-[4px] grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full transition hover:bg-slate-100">
            <X className="h-[19px] w-[19px]" />
          </button>
        </div>

        <div className="mt-[16px] flex justify-end gap-[12px]">
          <button ref={cancelRef} type="button" onClick={onClose} className="h-[30px] rounded-[8px] border border-[#cbd5e1] bg-white px-[22px] text-[13.5px] font-semibold transition hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-[30px] items-center gap-[7px] rounded-[8px] bg-[#dc2626] px-[18px] text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-[#b91c1c]"
          >
            <Trash2 className="h-[15px] w-[15px]" /> Delete Button
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
