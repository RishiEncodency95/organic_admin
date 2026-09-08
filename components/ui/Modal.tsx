"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({ isOpen, onClose, title, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Portaled straight to <body> — a modal rendered in place can end up nested inside an ancestor
  // that has a filter/backdrop-filter/transform (e.g. Topbar's backdrop-blur-md header), which per
  // spec creates a new containing block for `fixed` descendants. That silently breaks `fixed
  // inset-0` centering, pinning the modal near that ancestor instead of the viewport. A portal
  // sidesteps the problem entirely regardless of where this component is rendered from.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[85vh] w-full ${SIZE_CLASSES[size]} overflow-hidden rounded-xl border border-surface-border bg-surface-card shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-sunken hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-104px)] overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-surface-border px-4 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
