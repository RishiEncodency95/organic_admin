"use client";

import { useLayoutEffect, useRef, useState } from "react";

/** Width the chatbot design pages are laid out at (the body width of the design mockups) */
export const DESIGN_WIDTH = 1320;

/**
 * Zoom factor that fits a DESIGN_WIDTH layout into the container's width, so a page built
 * with the design's pixel sizes keeps the same proportions on every screen.
 *
 * Usage: put `ref` on a full-width wrapper and `style={{ zoom, width: DESIGN_WIDTH }}` on the
 * page inside it. Avoid Recharts inside: its ResponsiveContainer measures the zoomed size.
 */
export function useFitWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setZoom(Math.min(1.25, Math.max(0.6, el.clientWidth / DESIGN_WIDTH)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, zoom };
}
