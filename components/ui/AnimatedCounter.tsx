"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat up from 0 when it scrolls into view ("1,234", "₹5.2L", "98%"). Values that
 * are not numbers ("–", "N/A") are shown as they are.
 */
export default function AnimatedCounter({ value, duration = 1200 }: { value: string | number; duration?: number }) {
  const strVal = String(value);
  const numericMatch = strVal.match(/^([^0-9]*)([0-9.,]+)(.*)$/);
  const prefix = numericMatch?.[1] ?? "";
  const suffix = numericMatch?.[3] ?? "";
  const rawNumberStr = numericMatch ? numericMatch[2].replace(/,/g, "") : "";
  const targetNum = numericMatch ? parseFloat(rawNumberStr) : NaN;
  const hasComma = numericMatch ? numericMatch[2].includes(",") : false;
  const decimalPlaces = (rawNumberStr.split(".")[1] || "").length;
  const canAnimate = Boolean(numericMatch) && !isNaN(targetNum) && targetNum !== 0;

  const [displayValue, setDisplayValue] = useState<string>(() =>
    canAnimate ? `${prefix}0${suffix}` : strVal
  );
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canAnimate) return;

    let animationFrameId: number | null = null;

    const startCounting = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentNum = targetNum * easeProgress;
        let formattedNum = currentNum.toFixed(decimalPlaces);

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

    if (typeof IntersectionObserver !== "undefined") {
      const el = spanRef.current;
      if (!el) {
        startCounting();
        return;
      }
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
    } else {
      startCounting();
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, [duration, canAnimate, prefix, suffix, targetNum, hasComma, decimalPlaces]);

  return <span ref={spanRef}>{canAnimate ? displayValue : strVal}</span>;
}
