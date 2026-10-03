"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";

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
