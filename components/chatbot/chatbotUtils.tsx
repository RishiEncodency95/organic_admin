import React from "react";

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "2 min ago", "Yesterday", "12 Sep" — for the conversation list. */
export function timeAgo(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  if (Number.isNaN(diff)) return "";
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  if (hrs < 48) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function dayLabel(value: string): string {
  const d = new Date(value);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
}

export function initials(name?: string): string {
  const parts = (name || "?").trim().split(/\s+/);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}

const AVATAR_COLORS = ["#166b40", "#0f766e", "#1d4ed8", "#7c3aed", "#b45309", "#be185d", "#0369a1", "#4d7c0f"];
export function avatarColor(seed?: string): string {
  let h = 0;
  for (const ch of seed || "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** "https://bharatorganicexpo.com/registration/book-a-stand?x=1" → "/registration/book-a-stand" */
export function pagePath(url?: string): string {
  if (!url) return "—";
  try {
    return new URL(url).pathname || "/";
  } catch {
    return url;
  }
}

export const whatsappLink = (phone?: string) => {
  const digits = (phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
};

/** "01-10-2026 11:41" — spreadsheet-friendly */
export function toCsvDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Bot replies use a little markdown: [text](https://…), bare links, **bold**, "- " bullets
const INLINE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s)]+)/g;

function renderInline(text: string, keyPrefix: string, linkClass: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) nodes.push(text.slice(last, start));
    const [, linkText, linkUrl, bold, bareUrl] = match;
    const key = `${keyPrefix}-${i++}`;
    if (linkUrl || bareUrl) {
      nodes.push(
        <a key={key} href={linkUrl || bareUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {linkText || bareUrl}
        </a>
      );
    } else if (bold) {
      nodes.push(<strong key={key}>{bold}</strong>);
    }
    last = start + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function MessageText({ text, linkClass = "underline underline-offset-2 font-semibold break-words" }: { text: string; linkClass?: string }) {
  return (
    <>
      {text.split("\n").map((line, idx) => {
        const bullet = /^\s*[-*•]\s+/.test(line);
        const content = bullet ? line.replace(/^\s*[-*•]\s+/, "") : line;
        if (!content.trim()) return <div key={idx} className="h-[6px]" />;
        return (
          <div key={idx} className={bullet ? "flex gap-[6px]" : undefined}>
            {bullet && <span aria-hidden="true">•</span>}
            <span>{renderInline(content, String(idx), linkClass)}</span>
          </div>
        );
      })}
    </>
  );
}
