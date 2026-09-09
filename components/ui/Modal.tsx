"use client";

import { useEffect, useState } from "react";
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
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // tiny delay so CSS transition picks up the state change
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

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

  if (!mounted) return null;

  // Portaled straight to <body> — a modal rendered in place can end up nested inside an ancestor
  // that has a filter/backdrop-filter/transform (e.g. Topbar's backdrop-blur-md header), which per
  // spec creates a new containing block for `fixed` descendants. That silently breaks `fixed
  // inset-0` centering, pinning the modal near that ancestor instead of the viewport. A portal
  // sidesteps the problem entirely regardless of where this component is rendered from.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        transition: "background 280ms ease",
        background: visible ? "rgba(0,0,0,0.48)" : "rgba(0,0,0,0)",
      }}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Panel */}
      <div
        className={`relative z-10 max-h-[85vh] w-full ${SIZE_CLASSES[size]} overflow-hidden bg-white`}
        style={{
          boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px, 0 20px 60px rgba(0,0,0,0.18)",
          borderRadius: "0px",
          border: "1px solid rgba(27,31,35,0.12)",
          transform: visible ? "scale(1) translateY(0px)" : "scale(0.93) translateY(-28px)",
          opacity: visible ? 1 : 0,
          transition: "transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 240ms ease",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-[18px] py-[13px]"
          style={{
            borderBottom: "1px solid rgba(27,31,35,0.1)",
            background: "#eef0f2",
          }}
        >
          <h2 className="text-[13px] font-bold tracking-[-0.01em] text-[#18233b]">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-[26px] w-[26px] items-center justify-center transition-all hover:bg-red-50"
            style={{ borderRadius: "4px" }}
            title="Close"
          >
            <X className="h-[14px] w-[14px] text-red-500" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(85vh-108px)] overflow-y-auto px-[18px] py-[16px]">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className="flex justify-end gap-[8px] px-[18px] py-[12px]"
            style={{ borderTop: "1px solid rgba(27,31,35,0.1)", background: "#eef0f2" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
