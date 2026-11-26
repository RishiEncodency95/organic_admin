"use client";

import { ArrowUpRight, Share2, Users } from "lucide-react";
import { cn } from "@/components/infrastructure/lib/cn";
import { formatDate, formatNumber } from "@/components/competitor-analyzer/source/lib/utils/format";
import { formatRelative } from "@/components/competitor-analyzer/source/features/admin/website/data/selectors";
import type { InstagramStats, SiteEvidence, SocialPlatform, StudySite, YouTubeStats } from "@/components/competitor-analyzer/api";
import { Panel } from "@/components/competitor-analyzer/report-sections";
import { SiteLabel } from "@/components/competitor-analyzer/ui";

type ColorOf = (domain: string) => string;

// YouTube Numbers is temporarily disabled at the user's request. Keep profile links.
const SHOW_YOUTUBE_NUMBERS = false;

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  pinterest: "Pinterest",
  threads: "Threads",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
};
const PLATFORM_ORDER = Object.keys(PLATFORM_LABEL) as SocialPlatform[];

const Missing = ({ text = "No link found" }: { text?: string }) => <span className="text-[11px] text-[#94A3B8]">{text}</span>;

function ProfileLink({ url, handle }: { url: string; handle: string | null }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-start gap-0.5 text-[11.5px] font-medium normal-case text-[#2563EB] hover:underline">
      <span className="[overflow-wrap:anywhere]">{handle ?? "Open"}</span>
      <ArrowUpRight className="mt-0.5 size-3 shrink-0" aria-hidden />
    </a>
  );
}

/** A number row: the value when the platform gave one, otherwise the reason it is missing. */
type Row = { label: string; hint: string; read: (e: SiteEvidence) => { value: string | null; reason?: string } | null };

function statReason(stats: YouTubeStats | InstagramStats | null | undefined, linked: boolean): string {
  if (!linked) return "No profile linked";
  if (!stats) return "Not checked";
  return stats.status === "ok" ? "" : stats.message;
}

const when = (iso: string | null) => (iso ? `${formatDate(iso)} (${formatRelative(iso)})` : null);

const ROWS: { platform: "youtube" | "instagram"; rows: Row[] }[] = [
  {
    platform: "youtube",
    rows: [
      { label: "Subscribers", hint: "People following the channel.", read: (e) => yt(e, (s) => (s.subscribers === null ? null : formatNumber(s.subscribers)), "Hidden by the channel") },
      { label: "Videos", hint: "Public videos on the channel.", read: (e) => yt(e, (s) => formatNumber(s.videos)) },
      { label: "Total views", hint: "All-time views of all videos.", read: (e) => yt(e, (s) => formatNumber(s.views)) },
      { label: "Latest upload", hint: "How recently they posted a video.", read: (e) => yt(e, (s) => when(s.lastUploadAt), "Not shown") },
    ],
  },
  // Instagram numbers hidden for now (owner, 2026-10-23): no Instagram professional account is connected through Meta yet.
  // The backend still reads them; uncomment this group (and `ig` below) to show them again.
  // {
  //   platform: "instagram",
  //   rows: [
  //     { label: "Followers", hint: "People following the account.", read: (e) => ig(e, (s) => formatNumber(s.followers)) },
  //     { label: "Posts", hint: "Posts on the account.", read: (e) => ig(e, (s) => formatNumber(s.posts)) },
  //     { label: "Latest post", hint: "How recently they posted.", read: (e) => ig(e, (s) => when(s.lastPostAt), "Not shown") },
  //   ],
  // },
];

function yt(e: SiteEvidence, pick: (s: Extract<YouTubeStats, { status: "ok" }>) => string | null, empty = "Not available") {
  const s = e.socials?.youtube;
  const linked = Boolean(e.socials?.profiles.some((p) => p.platform === "youtube"));
  if (s?.status !== "ok") return { value: null, reason: statReason(s, linked) };
  const value = pick(s);
  return value === null ? { value: null, reason: empty } : { value };
}

// function ig(e: SiteEvidence, pick: (s: Extract<InstagramStats, { status: "ok" }>) => string | null, empty = "Not available") {
//   const s = e.socials?.instagram;
//   const linked = Boolean(e.socials?.profiles.some((p) => p.platform === "instagram"));
//   if (s?.status !== "ok") return { value: null, reason: statReason(s, linked) };
//   const value = pick(s);
//   return value === null ? { value: null, reason: empty } : { value };
// }

export function SocialPanel({ evidence, sites, colorOf }: { evidence: SiteEvidence[]; sites: StudySite[]; colorOf: ColorOf }) {
  const columns = sites.flatMap((s) => {
    const e = evidence.find((x) => x.domain === s.domain);
    return e ? [{ site: s, e }] : [];
  });
  const checked = columns.some(({ e }) => e.socials);
  const explain = (
    <>
      <p>Each column is one website. We list the social profiles that the website itself links to (in its menu, footer or pages). <b>No link found</b> means the website does not link to one, not that the business has no account there.</p>
      <p>These are links observed on the sampled website pages. Profile ownership, audience numbers and engagement are not inferred.</p>
    </>
  );

  if (!checked) {
    return (
      <Panel title="Social Media Presence" icon={Share2} subtitle="Which social profiles each site links to" explain={explain}>
        <p className="text-[12px] text-[#6B7A94]">This check was made before this section existed. Re-check to compare social media.</p>
      </Panel>
    );
  }

  const platforms = PLATFORM_ORDER.filter((p) => columns.some(({ e }) => e.socials?.profiles.some((x) => x.platform === p)));
  const missing = PLATFORM_ORDER.length - platforms.length;
  const anyNumbers = ROWS.some((g) => columns.some(({ e }) => e.socials?.profiles.some((x) => x.platform === g.platform)));
  const head = (
    <thead>
      <tr className="border-b border-[#EEF2F8]">
        <th className="w-[170px] py-2 text-left" />
        {columns.map(({ site }) => (
          <th key={site.domain} className={cn("px-2 py-2 text-left text-[11px] font-normal", site.role === "own" && "rounded-t-md bg-[#EFF4FC]")}>
            <SiteLabel domain={site.domain} color={colorOf(site.domain)} own={site.role === "own"} wrap />
          </th>
        ))}
      </tr>
    </thead>
  );
  const checkedAt = columns.find(({ e }) => e.socials)?.e.socials?.checkedAt;

  return (
    <div className="space-y-1">
      <Panel
        title="Social Media Presence"
        icon={Share2}
        subtitle={platforms.length ? `${platforms.length} platform${platforms.length === 1 ? "" : "s"} linked by at least one site${missing ? `; ${missing} that no site links to are hidden` : ""}` : "Which social profiles each site links to"}
        explain={explain}
      >
        {platforms.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[11.5px]">
              {head}
              <tbody>
                {platforms.map((platform) => (
                  <tr key={platform} className="border-t border-[#F2F5FA] align-top">
                    <td className="py-2 pr-3 font-medium text-[#28354C]">{PLATFORM_LABEL[platform]}</td>
                    {columns.map(({ site, e }) => {
                      const profile = e.socials?.profiles.find((p) => p.platform === platform);
                      return (
                        <td key={site.domain} className={cn("px-2 py-2", site.role === "own" && "bg-[#F5F8FF]")}>
                          {profile ? <ProfileLink url={profile.url} handle={profile.handle} /> : e.socials ? <Missing /> : <Missing text="Not checked" />}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t border-[#EEF2F8] align-top">
                  <td className="py-2 pr-3 font-semibold text-[#111C3A]">Platforms linked</td>
                  {columns.map(({ site, e }) => (
                    <td key={site.domain} className={cn("px-2 py-2 font-semibold text-[#111C3A]", site.role === "own" && "bg-[#F5F8FF]")}>
                      {e.socials ? e.socials.profiles.length : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[12px] text-[#6B7A94]">None of the websites links to a social media profile on the pages we read.</p>
        )}
      </Panel>

      {SHOW_YOUTUBE_NUMBERS && anyNumbers ? (
        <Panel
          title="YouTube Numbers"
          icon={Users}
          subtitle="Public numbers from the platforms themselves"
          explain={
            <>
              <p>Read from YouTube when this check ran. A channel can hide its subscriber count.</p>
              <p>When a number is missing, the cell says why, so you know whether it is hidden, not set up or not found.</p>
            </>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[11.5px]">
              {head}
              <tbody>
                {ROWS.filter((g) => columns.some(({ e }) => e.socials?.profiles.some((x) => x.platform === g.platform))).map((group) => [
                  <tr key={group.platform} className="border-t border-[#EEF2F8]">
                    <td colSpan={columns.length + 1} className="pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B7A94]">{PLATFORM_LABEL[group.platform]}</td>
                  </tr>,
                  ...group.rows.map((row) => (
                    <tr key={`${group.platform}-${row.label}`} className="border-t border-[#F2F5FA] align-top">
                      <td className="py-2 pr-3 text-[#28354C]">
                        <span className="font-medium">{row.label}</span>
                        <span className="block text-[10.5px] leading-snug text-[#94A3B8]">{row.hint}</span>
                      </td>
                      {columns.map(({ site, e }) => {
                        const cell = row.read(e);
                        return (
                          <td key={site.domain} className={cn("px-2 py-2", site.role === "own" && "bg-[#F5F8FF]")}>
                            {cell?.value ? <span className="font-semibold text-[#111C3A]">{cell.value}</span> : <span className="text-[11px] leading-snug text-[#94A3B8]">{cell?.reason || "Not available"}</span>}
                          </td>
                        );
                      })}
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
          {checkedAt ? <p className="mt-2 text-[10.5px] text-[#94A3B8]">Numbers read on {formatDate(checkedAt)}.</p> : null}
        </Panel>
      ) : null}
    </div>
  );
}
