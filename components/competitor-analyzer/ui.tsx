"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { SERIES_COLORS } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/charts";
import { cn } from "@/components/infrastructure/lib/cn";

/** One fixed colour per site, by its position in the study (your site first), never by rank. */
export const SITE_COLORS = SERIES_COLORS;

/** The names sites give themselves, by domain, so labels can show "Bharat Organic Expo" instead of the domain. */
const SiteNamesContext = createContext<Record<string, string>>({});

export function SiteNamesProvider({ sites, children }: { sites: { domain: string; name?: string | null }[]; children: ReactNode }) {
  const names = useMemo(() => Object.fromEntries(sites.filter((s) => s.name).map((s) => [s.domain, s.name!])), [sites]);
  return <SiteNamesContext.Provider value={names}>{children}</SiteNamesContext.Provider>;
}

/** `labelOf(domain)` gives the site's name, or the domain when no name is known. */
export function useSiteLabelOf() {
  const names = useContext(SiteNamesContext);
  return (domain: string) => names[domain] ?? domain;
}

/** Where to look for a site's icon, in order: the site's own /favicon.ico, then Google's favicon service
 *  (it also finds icons declared in the page's <link rel="icon">). After both fail, a letter tile. */
const faviconSources = (domain: string) => [`https://${domain}/favicon.ico`, `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`];

export function SiteFavicon({ domain, size = 18 }: { domain: string; size?: number }) {
  const [attempt, setAttempt] = useState(0);
  const sources = faviconSources(domain);
  // Advance only from the attempt that failed, so onError and the hydration check never skip a source.
  const next = (from: number) => setAttempt((a) => (a === from ? a + 1 : a));
  if (!domain || attempt >= sources.length) {
    return (
      <span className="grid shrink-0 place-items-center rounded bg-[#EFF4FC] text-[10px] font-bold uppercase text-[#3B69B8]" style={{ width: size, height: size }} aria-hidden>
        {domain.slice(0, 1) || "?"}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the site's own favicon
    <img
      key={attempt}
      src={sources[attempt]}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => next(attempt)}
      // An image that failed before React hydrated never fires onError, so check once it is attached.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) next(attempt);
      }}
      className="shrink-0 rounded object-contain"
    />
  );
}

export function pagePath(url: string) {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? "Home page" : u.pathname.replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function SourceLink({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-0.5 truncate text-[10.5px] normal-case text-[#2563EB] hover:underline">
      {pagePath(url)} <ArrowUpRight className="size-3 shrink-0" aria-hidden />
    </a>
  );
}

/** `wrap` lets a long name continue on the next line instead of being cut (for card headers). */
export function SiteLabel({ domain, color, own, wrap }: { domain: string; color: string; own?: boolean; wrap?: boolean }) {
  const label = useSiteLabelOf()(domain);
  return (
    <span className={cn("min-w-0 gap-1.5 normal-case", wrap ? "flex w-full items-start" : "inline-flex items-center")}>
      <span className={cn("size-2 shrink-0 rounded-[2px]", wrap && "mt-[5px]")} style={{ background: color }} aria-hidden />
      <span className={cn("shrink-0", wrap && "mt-px")}><SiteFavicon domain={domain} size={14} /></span>
      <span className={cn(wrap ? "min-w-0 leading-snug [overflow-wrap:anywhere]" : "truncate", own ? "font-semibold text-[#1D4ED8]" : "text-[#28354C]")} title={domain}>{label}</span>
      {own ? <span className="shrink-0 rounded bg-[#2563EB] px-1 text-[9.5px] font-semibold uppercase text-white">You</span> : null}
    </span>
  );
}

const TWO_PART_SUFFIX = /^(co|com|net|org|gov|ac|edu|nic|res|gen|firm|ind|ltd|plc)$/;
/** The brand part of a host ("acme" for www.acme.co.in), as the server compares them. */
function brandOf(host: string) {
  const labels = host.toLowerCase().replace(/^www\./, "").split(".").filter(Boolean);
  if (labels.length < 2) return labels[0] ?? "";
  const suffix = labels.length >= 3 && TWO_PART_SUFFIX.test(labels[labels.length - 2]!) && labels[labels.length - 1]!.length === 2 ? 2 : 1;
  return labels[labels.length - 1 - suffix] ?? "";
}

/**
 * Why a site has no score, in plain words, or null when it was read normally. Works on old runs too: a home page read
 * on another business's address (before the server stopped following those), a "redirecting…" / "coming soon" page,
 * or too few pages to score fairly. `wrongSite`: the numbers shown belong to another website, so warn even next to a score.
 */
export function siteNotice(ev: { domain: string; reachable: boolean; error: string | null; movedTo?: string | null; pages: { url: string; title: string; h1?: string | null }[]; coverage?: { status: string; read: number } } | undefined): { text: string; wrongSite: boolean } | null {
  if (!ev) return null;
  const note = (text: string, wrongSite = false) => ({ text, wrongSite });
  if (ev.movedTo) return note(`This address sends visitors to ${ev.movedTo}, a different website, so it is not compared. Add ${ev.movedTo} itself to compare that business.`);
  if (!ev.reachable) return note(ev.error ?? "The website could not be opened.");
  const home = ev.pages[0];
  let landed = "";
  try {
    landed = home ? new URL(home.url).hostname.replace(/^www\./, "") : "";
  } catch {
    landed = "";
  }
  if (landed && brandOf(landed) !== brandOf(ev.domain)) return note(`This address opened ${landed}, a different website, so these numbers are not this business's. Re-check to leave it out, or remove it.`, true);
  if (home && /\b(redirecting|coming soon|launching soon|under construction|under maintenance|domain (is )?for sale)\b/i.test(`${home.title} ${home.h1 ?? ""}`)) return note("The home page is only a “coming soon” or “redirecting…” page, so there is nothing to compare yet.");
  if (ev.coverage?.status === "insufficient") return note(`Only ${ev.coverage.read} page${ev.coverage.read === 1 ? "" : "s"} could be read, too little to score fairly.`);
  return null;
}
