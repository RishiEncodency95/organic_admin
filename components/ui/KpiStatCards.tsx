"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";

/* =========================================================
   KPI STAT CARDS
   The metric card row used at the top of the Exhibitor List page,
   shared so other admin pages (Career Dashboard, Applications &
   AI Response) render exactly the same card size and style.
========================================================= */

export const kpiToneClass = {
  slate: "bg-slate-50 text-slate-700 ring-slate-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
} as const;

export interface KpiStatCardItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone: keyof typeof kpiToneClass;
  gradient: string;
  borderColor: string;
  numColor: string;
  footer: string;
  onClick: () => void;
  suffix?: string;
  // e.g. "↑ 12%"; a leading "↓" renders red, anything else green.
  trend?: string;
}

function AnimatedCounter({ value, duration = 1200 }: { value: string | number; duration?: number }) {
  const strVal = String(value);
  const numericMatch = strVal.match(/^([^\d.]*)([\d,.]+)(.*)$/);
  const prefix = numericMatch?.[1] ?? "";
  const suffix = numericMatch?.[3] ?? "";
  const rawNumberStr = numericMatch ? numericMatch[2].replace(/,/g, "") : "";
  const targetNum = numericMatch ? parseFloat(rawNumberStr) : NaN;
  const hasComma = numericMatch ? numericMatch[2].includes(",") : false;
  const decimalPlaces = (rawNumberStr.split(".")[1] || "").length;
  // Non-numeric values and zero are shown as-is; only real numbers count up.
  const canAnimate = !isNaN(targetNum) && targetNum !== 0;

  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canAnimate) return;
    const el = spanRef.current;
    let animationFrameId: number | null = null;

    const startCounting = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        let formattedNum = (targetNum * easeProgress).toFixed(decimalPlaces);

        if (hasComma) {
          const parts = formattedNum.split(".");
          parts[0] = parseInt(parts[0], 10).toLocaleString();
          formattedNum = parts.join(".");
        }

        setDisplayValue(`${prefix}${formattedNum}${suffix}`);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    if (el && typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounting();
            } else {
              setDisplayValue(`${prefix}0${suffix}`);
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(el);

      return () => {
        observer.disconnect();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }

    startCounting();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [canAnimate, targetNum, prefix, suffix, hasComma, decimalPlaces, duration]);

  return <span ref={spanRef}>{canAnimate ? displayValue : isNaN(targetNum) ? strVal : `${prefix}0${suffix}`}</span>;
}

export default function KpiStatCards({
  items,
  gridClassName = "mt-[12px] grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6",
  compact = false,
}: {
  items: KpiStatCardItem[];
  gridClassName?: string;
  // Smaller text and icon, for pages that fit more cards in a row.
  compact?: boolean;
}) {
  const sz = compact
    ? { card: "h-[82px]", icon: "h-[26px] w-[26px]", iconSvg: "h-3.5 w-3.5", title: "text-[7.5px]", value: "text-[17px]", small: "text-[8px]", footer: "text-[7.5px]", arrow: "h-2.5 w-2.5" }
    : { card: "h-[98px]", icon: "h-[30px] w-[30px]", iconSvg: "h-4 w-4", title: "text-[8.5px]", value: "text-[21px]", small: "text-[9.5px]", footer: "text-[8px]", arrow: "h-3 w-3" };
  return (
    <div className={gridClassName}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`relative flex ${sz.card} flex-col overflow-hidden rounded-[11px] border border-[#e5e7e6] bg-white p-2 !pb-5.5 transition-all hover:translate-y-[-1px]`}
            style={{
              background: item.gradient,
              borderColor: item.borderColor || undefined,
              boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
            }}
          >
            <div className="flex items-start gap-1.5">
              <div
                className={`grid ${sz.icon} shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${kpiToneClass[item.tone]}`}
              >
                <Icon className={sz.iconSvg} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate ${sz.title} !font-semibold tracking-[0.01em] text-slate-900`}
                  style={{ fontWeight: 600, color: "#0f172a" }}
                >
                  {item.title}
                </p>

                <div className="mt-1.5 flex items-end gap-1">
                  <span
                    className={`${sz.value} !font-semibold leading-none tracking-[-0.04em]`}
                    style={{ color: item.numColor, fontWeight: 600 }}
                  >
                    <AnimatedCounter value={item.value} />
                  </span>

                  {item.suffix && <span className={`mb-0.5 ${sz.small} font-bold`}>{item.suffix}</span>}

                  {item.trend && (
                    <span
                      className={`mb-0.5 ml-auto ${sz.small} font-bold ${
                        item.trend.startsWith("↓") ? "text-[#dc2626]" : "text-[#16a34a]"
                      }`}
                    >
                      {item.trend}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              onClick={item.onClick}
              className={`absolute bottom-1 left-2 right-2 flex cursor-pointer items-center justify-center gap-1 ${sz.footer} font-semibold text-[#293957] transition hover:text-blue-600`}
            >
              {item.footer}
              <ArrowRight className={sz.arrow} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
