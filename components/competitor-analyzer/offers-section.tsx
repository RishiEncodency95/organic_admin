"use client";

import { Fragment } from "react";
import { Package, Quote, Star, Store, Tags } from "lucide-react";
import { cn } from "@/components/infrastructure/lib/cn";
import { OFFER_FIELDS, type OfferFact, type OfferField, type OffersBlock, type SiteEvidence, type SiteOffers, type StudySite } from "@/components/competitor-analyzer/api";
import { Panel } from "@/components/competitor-analyzer/report-sections";
import { SiteLabel, SourceLink, useSiteLabelOf } from "@/components/competitor-analyzer/ui";

type ColorOf = (domain: string) => string;

const FIELD_LABEL: Record<OfferField, { label: string; hint: string }> = {
  eventName: { label: "Event", hint: "The event or exhibition the site promotes." },
  dates: { label: "Dates", hint: "When it happens." },
  location: { label: "City / venue", hint: "Where it happens." },
  exhibitors: { label: "Exhibitors", hint: "How many exhibitors or brands the site says take part." },
  visitors: { label: "Visitors", hint: "Visitors, buyers or delegates the site claims." },
  stallPrice: { label: "Stall / booth price", hint: "Price of a stall, booth or space." },
  ticketPrice: { label: "Ticket / entry fee", hint: "What a visitor or delegate pays." },
  deadline: { label: "Booking deadline", hint: "Last date to register or book." },
};

/** One stated fact: the value, and on hover the exact words and the page they came from. */
function Fact({ fact }: { fact: OfferFact }) {
  return (
    <div className="group min-w-0">
      <p className="font-semibold text-[#111C3A] [overflow-wrap:anywhere]" title={`“${fact.quote}”`}>{fact.value}</p>
      <p className="mt-0.5 flex items-start gap-1 text-[10px] leading-snug text-[#6B7A94]">
        <Quote className="mt-px size-2.5 shrink-0 text-[#94A3B8]" aria-hidden />
        <span className="line-clamp-2 italic [overflow-wrap:anywhere]">{fact.quote}</span>
      </p>
      <SourceLink url={fact.url} />
    </div>
  );
}

const NotMentioned = () => <span className="text-[11px] text-[#94A3B8]">Not mentioned</span>;

/**
 * Star ratings each website states about itself in its structured data (what Google may show as stars). Kept apart
 * from the scores and the claims: it is the site's own statement, not a rating read from Google.
 */
function StatedRatingsPanel({ evidence, sites, colorOf }: { evidence: SiteEvidence[]; sites: StudySite[]; colorOf: ColorOf }) {
  // Runs before 2026-10-26 did not read ratings at all (the field is missing): the panel is not shown for them.
  if (!evidence.some((e) => e.statedRating !== undefined)) return null;
  const ratingOf = (domain: string) => evidence.find((e) => e.domain === domain)?.statedRating ?? null;
  const count = (n: number | null) => (n == null ? null : n.toLocaleString("en-IN"));
  return (
    <Panel
      title="Star Ratings The Websites State"
      icon={Star}
      subtitle="Ratings written into each site's own data for Google · not checked on Google"
      explain={
        <>
          <p>Websites can add a star rating to their own page data so Google may show stars in search results. This is what each site <b>says about itself</b>; it is not read from Google Reviews and is not checked, so it is shown separately and never counted in any score.</p>
          <p><b>Not stated</b> means the site&apos;s pages carry no such rating.</p>
        </>
      }
    >
      <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
        {sites.map((s) => {
          const r = ratingOf(s.domain);
          return (
            <div key={s.domain} className={cn("rounded-lg border p-2.5", s.role === "own" ? "border-[#BFD3F7] bg-[#F5F8FF]" : "border-[#E6EBF4]")}>
              <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={s.role === "own"} wrap />
              {r ? (
                <>
                  <p className="mt-1.5 flex items-baseline gap-1">
                    <Star className="size-3.5 translate-y-0.5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden />
                    <span className="text-[16px] font-bold text-[#111C3A]">{r.value}</span>
                    <span className="text-[11px] text-[#6B7A94]">/ {r.best}</span>
                  </p>
                  <p className="text-[11px] text-[#4B5872]">
                    {[r.ratings != null ? `${count(r.ratings)} ratings` : null, r.reviews != null ? `${count(r.reviews)} reviews` : null].filter(Boolean).join(" · ")}
                    {r.about ? <span className="normal-case text-[#94A3B8]"> · for “{r.about}”</span> : null}
                  </p>
                  <SourceLink url={r.url} />
                </>
              ) : (
                <p className="mt-1.5 text-[11px] text-[#94A3B8]">Not stated</p>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

export function OffersPanel({ offers, sites, colorOf, evidence = [] }: { offers: OffersBlock | undefined; sites: StudySite[]; colorOf: ColorOf; evidence?: SiteEvidence[] }) {
  const labelOf = useSiteLabelOf();
  const explain = (
    <>
      <p>Each column is one website. A value appears only when the site itself writes it on a page we read; hover or read the small quote to see the exact words, and open the link to see the page.</p>
      <p><b>Not mentioned</b> means the pages we read do not say it, not that the business does not offer it. Prices are shown exactly as written (with or without tax).</p>
    </>
  );
  if (!offers) {
    return (
      <Panel title="What They Sell & At What Price" icon={Store} subtitle="Prices, packages and event facts each site states" explain={explain}>
        <p className="text-[12px] text-[#6B7A94]">This check was made before this section existed. Re-check to see what each website sells and at what price.</p>
      </Panel>
    );
  }
  if (offers.status === "failed") {
    return (
      <Panel title="What They Sell & At What Price" icon={Store} subtitle="Prices, packages and event facts each site states" explain={explain}>
        <p className="text-[12px] text-[#6B7A94]">{offers.reason ?? "The offers could not be read this time. Re-check to try again."}</p>
      </Panel>
    );
  }

  const bySite = (domain: string): SiteOffers | undefined => offers.sites.find((s) => s.domain === domain);
  const columns = sites.filter((s) => bySite(s.domain));
  const rows = OFFER_FIELDS.filter((f) => columns.some((s) => bySite(s.domain)?.[f]));
  const hidden = OFFER_FIELDS.length - rows.length;
  const anyLists = columns.some((s) => (bySite(s.domain)?.prices.length ?? 0) + (bySite(s.domain)?.claims.length ?? 0) > 0);

  // Runs before 2026-10-26 did not read products and services at all (the fields are missing, not empty).
  const catalogueRead = columns.some((s) => bySite(s.domain)?.products !== undefined);
  const anyCatalogue = columns.some((s) => (bySite(s.domain)?.products?.length ?? 0) + (bySite(s.domain)?.services?.length ?? 0) > 0);

  return (
    <div className="space-y-1">
      <Panel
        title="Products & Services"
        icon={Package}
        subtitle="What each website names as the things it sells and the work it does"
        explain={
          <>
            <p>Each card is one website. Products are the goods it names (machines, equipment, food items…); services are the work it offers (setups, treatments, courses, packages…). Names come from the site&apos;s own product and service links, headings and text, exactly as written.</p>
            <p>Hover a name to see the words on the page, and open the link to see that page. A site with nothing listed does not name its products or services on the pages we read; it may still sell them.</p>
          </>
        }
      >
        {!catalogueRead ? (
          <p className="text-[12px] text-[#6B7A94]">This check was made before products and services were read. Re-check to see what each website sells.</p>
        ) : anyCatalogue ? (
          <div className="grid gap-1 md:grid-cols-2 xl:grid-cols-3">
            {columns.map((s) => {
              const o = bySite(s.domain)!;
              const lists = [
                ["Products", o.products ?? []],
                ["Services", o.services ?? []],
              ] as const;
              return (
                <div key={s.domain} className={cn("rounded-lg border p-2.5", s.role === "own" ? "border-[#BFD3F7] bg-[#F5F8FF]" : "border-[#E6EBF4]")}>
                  <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={s.role === "own"} wrap />
                  {lists.every(([, items]) => !items.length) ? <p className="mt-1.5 text-[11px] text-[#94A3B8]">No products or services named on the pages read.</p> : null}
                  {lists.map(([title, items]) =>
                    items.length ? (
                      <Fragment key={title}>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#6B7A94]">{title} ({items.length})</p>
                        <ul className="mt-1 space-y-1">
                          {items.map((item) => (
                            <li key={item.value} className="flex items-start gap-1.5 text-[11.5px]">
                              <span className="mt-[7px] size-1 shrink-0 rounded-full bg-[#94A3B8]" aria-hidden />
                              <span className="min-w-0">
                                <span className="font-medium normal-case text-[#111C3A] [overflow-wrap:anywhere]" title={`“${item.quote}”`}>{item.value}</span>
                                <SourceLink url={item.url} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Fragment>
                    ) : null,
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[12px] text-[#6B7A94]">None of the websites names its products or services on the pages we read.</p>
        )}
      </Panel>

      <Panel
        title="What They Sell & At What Price"
        icon={Store}
        subtitle={rows.length ? `${rows.length} facts stated by at least one site${hidden ? `; ${hidden} that no site mentions are hidden` : ""}` : "Event and price facts each site states"}
        explain={explain}
      >
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[11.5px]">
              <thead>
                <tr className="border-b border-[#EEF2F8]">
                  <th className="w-[170px] py-2 text-left" />
                  {columns.map((s) => (
                    <th key={s.domain} className={cn("px-2 py-2 text-left text-[11px] font-normal", s.role === "own" && "rounded-t-md bg-[#EFF4FC]")}>
                      <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={s.role === "own"} wrap />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((field) => (
                  <tr key={field} className="border-t border-[#F2F5FA] align-top">
                    <td className="py-2 pr-3 text-[#28354C]">
                      <span className="font-medium">{FIELD_LABEL[field].label}</span>
                      <span className="block text-[10.5px] leading-snug text-[#94A3B8]">{FIELD_LABEL[field].hint}</span>
                    </td>
                    {columns.map((s) => {
                      const fact = bySite(s.domain)?.[field] ?? null;
                      return (
                        <td key={s.domain} className={cn("px-2 py-2", s.role === "own" && "bg-[#F5F8FF]")}>
                          {fact ? <Fact fact={fact} /> : <NotMentioned />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[12px] text-[#6B7A94]">None of the websites states event dates, venues, visitor numbers or stall and ticket prices on the pages we read.</p>
        )}
      </Panel>

      <Panel
        title="Packages, Prices & Numbers They Claim"
        icon={Tags}
        subtitle="Other priced offers and the numbers each site uses to sell itself"
        explain={<p>Products, services or packages with a written price, and claims such as years in business or countries served, each with the exact words from the page. Nothing is estimated.</p>}
      >
        {anyLists ? (
          <div className="grid gap-1 md:grid-cols-2 xl:grid-cols-3">
            {columns.map((s) => {
              const o = bySite(s.domain)!;
              if (!o.prices.length && !o.claims.length) {
                return (
                  <div key={s.domain} className="rounded-lg border border-[#E6EBF4] p-2.5">
                    <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={s.role === "own"} wrap />
                    <p className="mt-1.5 text-[11px] text-[#94A3B8]">No prices or numbers stated on the pages read.</p>
                  </div>
                );
              }
              return (
                <div key={s.domain} className={cn("rounded-lg border p-2.5", s.role === "own" ? "border-[#BFD3F7] bg-[#F5F8FF]" : "border-[#E6EBF4]")}>
                  <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={s.role === "own"} wrap />
                  {(["prices", "claims"] as const).map((kind) =>
                    o[kind].length ? (
                      <Fragment key={kind}>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#6B7A94]">{kind === "prices" ? "Priced offers" : "Numbers they claim"}</p>
                        <ul className="mt-1 space-y-1.5">
                          {o[kind].map((item) => (
                            <li key={`${item.label}-${item.value}`} className="text-[11.5px]">
                              <span className="text-[#28354C] [overflow-wrap:anywhere]">{item.label}: </span>
                              <span className="font-semibold text-[#111C3A]" title={`“${item.quote}”`}>{item.value}</span>
                              <SourceLink url={item.url} />
                            </li>
                          ))}
                        </ul>
                      </Fragment>
                    ) : null,
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[12px] text-[#6B7A94]">No website writes other prices or self-claimed numbers on the pages we read.</p>
        )}
        {offers.dropped ? <p className="mt-2 text-[10.5px] text-[#94A3B8]">{offers.dropped} fact{offers.dropped === 1 ? "" : "s"} the AI suggested were left out because the exact words could not be found on the page.</p> : null}
        <p className="mt-1 text-[10.5px] text-[#94A3B8]">Sites compared: {columns.map((s) => labelOf(s.domain)).join(", ")}.</p>
      </Panel>

      <StatedRatingsPanel evidence={evidence} sites={sites} colorOf={colorOf} />
    </div>
  );
}
