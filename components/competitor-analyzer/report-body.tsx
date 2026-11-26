"use client";

import { useState } from "react";
import {
  BarChart3, Crown, Gauge, History as HistoryIcon, Info, LayoutDashboard, Lightbulb, ListChecks, Map as MapIcon, Search, Share2, Sparkles, Store, Swords, Target, TrendingUp,
} from "lucide-react";
import { cn } from "@/components/infrastructure/lib/cn";
import { Chip } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/kit";
import { EmptyState } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/states";
import { formatDateTime } from "@/components/competitor-analyzer/source/features/admin/website/data/selectors";
import type { StudyDetail } from "@/components/competitor-analyzer/api";
import {
  ActionBoard, AreaGuide, Changes, ContentIdeas, Gaps, HeadToHead, Heatmap, Hero, History, Opportunities, Panel, PositioningMap, Profiles, ScoreRadar,
  Swot, TechTable, TopicMatrix, WinLose, type ActionTracking,
} from "@/components/competitor-analyzer/report-sections";
import { SiteLabel, SourceLink } from "@/components/competitor-analyzer/ui";
import { SearchPanel } from "@/components/competitor-analyzer/watch-sections";
import { OffersPanel } from "@/components/competitor-analyzer/offers-section";
import { SocialPanel } from "@/components/competitor-analyzer/social-section";

import { ProfilePanel } from "./profile-panel";
import { IndustryPanel, IndustryActions, ObservedContent } from "./industry-panel";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "scorecard", label: "Scorecard", icon: BarChart3 },
  { key: "versus", label: "Head To Head", icon: Swords },
  { key: "offers", label: "What They Sell", icon: Store },
  { key: "social", label: "Social Media", icon: Share2 },
  { key: "content", label: "Content & Topics", icon: Lightbulb },
  { key: "tech", label: "Website checks", icon: Gauge },
  { key: "plan", label: "Action Plan", icon: ListChecks },
  { key: "history", label: "History", icon: HistoryIcon },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/**
 * The report of the latest completed check, in tabs. Used by the team's study page and by the client's share link;
 * `shared` hides what only makes sense inside the platform (re-check hints, Search Console, CRM tasks).
 */
export function ReportBody({ data, colorOf, tracking, shared = false }: { data: StudyDetail; colorOf: (domain: string) => string; tracking?: ActionTracking; shared?: boolean }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const report = data.report;
  if (!report) return null;
  const ai = report.model?.analysis ?? (report.ai?.status === "completed" ? report.ai.result : null);
  const own = data.sites[0]!;
  const ownLabel = own.name || own.domain;
  const ownSearch = shared ? null : report.sites.find((e) => e.role === "own")?.search ?? null;
  const deep = Boolean(ai?.topics?.length || ai?.sites?.length || ai?.contentIdeas?.length);
  const business=report.model?.businessIntelligence??report.businessIntelligence;
  const aiNotice=report.ai&&report.ai.status!=="completed"
    ? report.ai.reason==='The AI comparison did not finish. The measured comparison is shown; run again for AI insights.'
      ? 'AI insights are incomplete for this saved run. Measured scores and comparisons remain available. Check the AI provider and daily budget before running again.'
      : report.ai.reason
    : null;

  return (
    <>
      <Hero study={data} report={report} ai={ai} colorOf={colorOf} />
      {aiNotice ? (
        <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600"><summary className="cursor-pointer font-medium">Measured report available · AI summary pending</summary><p className="mt-2 max-w-3xl leading-relaxed">{aiNotice}</p><p className="mt-2 text-slate-500">This status belongs to the saved run. A budget reset does not regenerate an existing report automatically.</p></details>
      ) : null}
      {report.ai?.status === "completed" && !deep && !shared ? (
        <p className="flex items-start gap-2 rounded-lg border border-[#DCE6FB] bg-[#F7F9FF] p-2.5 text-[11.5px] text-[#28354C]"><Sparkles className="mt-0.5 size-4 shrink-0 text-[#7C3AED]" />AI topic and website-profile details are unavailable in this report. Measured website checks are available below.</p>
      ) : null}

      <nav className="sticky top-0 z-20 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-[#E6EBF4] bg-white/95 p-1 shadow-[0_1px_2px_rgba(16,24,40,0.04)] backdrop-blur" role="tablist" aria-label="Report sections">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={cn("flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors", tab === key ? "bg-[#111C3A] text-white" : "text-[#4B5872] hover:bg-[#F1F4F9]")}>
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <div className="space-y-1">
          {ai ? (
            <div className="grid gap-1 lg:grid-cols-2">
              <Panel
                title="Where you win and lose"
                icon={Target}
                subtitle="Your score vs the best competitor in each area"
                explain={<><p>Each row is one area websites are judged on. The <b>blue bar</b> is your score, the <b>grey bar</b> is the best competitor’s score (out of 10).</p><p><b className="text-[#0B845C]">Green “ahead”</b> = you beat everyone there. <b className="text-[#C0261F]">Red “behind”</b> = at least one competitor is better; the action plan tells you how to close the gap.</p></>}
              >
                <WinLose ai={ai} own={own.domain} previous={report.previous?.scores} />
              </Panel>
              <Panel
                title="Positioning map"
                icon={MapIcon}
                subtitle="Content depth vs trust — bigger bubble = higher overall score"
                explain={<><p>Every website is a bubble. <b>Further right</b> = more useful content. <b>Higher up</b> = more proof and trust (testimonials, numbers, partners).</p><p>The <b>top-right corner</b> is where the strongest sites sit. Your goal is to move your bubble up and to the right.</p></>}
              >
                <PositioningMap ai={ai} sites={data.sites} colorOf={colorOf} />
              </Panel>
            </div>
          ) : null}
          {ai?.swot ? (
            <Panel
              title={`SWOT for ${ownLabel}`}
              icon={Crown}
              subtitle="Compared with these competitors"
              explain={<p><b>Strengths</b> and <b>weaknesses</b> are about your website today. <b>Opportunities</b> are things you could add to win. <b>Threats</b> are what competitors do that could pull your visitors away.</p>}
            >
              <Swot swot={ai.swot} />
            </Panel>
          ) : null}
          <Panel
            title="What changed since the last check"
            icon={TrendingUp}
            aside={report.changes?.items.length ? <Chip tone="info">{report.changes.items.length}</Chip> : null}
            explain={<p>Each re-check is compared with the previous one: new pages, rewritten headings, price and product changes, follower moves, speed changes and score moves on every site. <b className="text-[#0B845C]">Green arrow</b> = that site got stronger, <b className="text-[#C0261F]">red arrow</b> = weaker. Re-check every week or two to keep watch.</p>}
          >
            <Changes report={report} colorOf={colorOf} own={own.domain} />
          </Panel>
        </div>
      ) : null}

      {tab === "scorecard" ? (
        ai?.scores.length ? (
          <div className="space-y-1">
            <Panel
              title="Who is best at what"
              icon={Crown}
              subtitle="Score out of 10 in each area · darker blue = stronger · crown = leader"
              explain={<><p>Read across a row to see who is best in that area. The <b>crown</b> marks the single leader (no crown = tie). The last row is the <b>overall score out of 100</b>.</p><p>Scores use fixed formulas over measured pages and Google PageSpeed. Missing evidence is excluded rather than scored as zero.</p></>}
            >
              <Heatmap ai={ai} sites={data.sites} colorOf={colorOf} previous={report.previous?.scores} />
            </Panel>
            <div className="grid gap-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Panel title="Scorecard shape" icon={BarChart3} subtitle="Bigger shape = stronger site" explain={<p>Each corner is one area. A site that is strong everywhere makes a big, round shape. <b>Your site is the filled shape</b>; dents show where you fall behind.</p>}>
                <ScoreRadar ai={ai} sites={data.sites} colorOf={colorOf} />
              </Panel>
              <Panel title="What each area means" icon={Info}>
                <AreaGuide ai={ai} />
              </Panel>
            </div>
          </div>
        ) : <EmptyState icon={BarChart3} title="No scores yet" body="Scores appear when the AI comparison completes." />
      ) : null}

      {tab === "versus" ? (
        ai ? (
          <Panel
            title="You vs each competitor"
            icon={Swords}
            explain={<p>Each competitor is compared with your website. Measured area scores remain available when AI insights are incomplete. Higher website scores do not establish market share or business threat.</p>}
          >
            <HeadToHead ai={ai} report={report} own={own.domain} colorOf={colorOf} />
          </Panel>
        ) : <EmptyState icon={Swords} title="Comparison evidence unavailable" body="This saved run has no comparable website measurements." />
      ) : null}

      {tab === "offers" ? <OffersPanel offers={report.ai?.offers} sites={data.sites} colorOf={colorOf} evidence={report.sites} /> : null}

      {tab === "social" ? <SocialPanel evidence={report.sites} sites={data.sites} colorOf={colorOf} /> : null}

      {tab === "content" ? (
        ai && deep ? (
          <div className="space-y-1">
            {ownSearch ? (
              <Panel
                title="Your Google search (last 28 days)"
                icon={Search}
                subtitle="Real data from your Google Search Console"
                explain={<p>What people actually searched before your site appeared in Google, how often you were shown (impressions), clicked, and your average position (1 = top). Compare it with the topic map below: topics competitors cover where you get no impressions are the clearest content opportunities.</p>}
              >
                <SearchPanel search={ownSearch} />
              </Panel>
            ) : !shared ? (
              <p className="flex items-start gap-2 rounded-lg border border-dashed border-[#DCE6FB] bg-white p-2.5 text-[11.5px] text-[#6B7A94]"><Search className="mt-0.5 size-4 shrink-0" />Google search data is not connected for {own.domain}. Website content comparisons are still available below.</p>
            ) : null}
            <Panel
              title="Topic map"
              icon={MapIcon}
              subtitle="Which site talks about what"
              explain={<p>Each row is a subject found on the websites; a <b>coloured dot</b> means that site covers it. <b className="text-[#92400E]">Yellow rows</b> are subjects competitors cover and you don’t — each is a chance for a new page or post.</p>}
            >
              <TopicMatrix ai={ai} sites={data.sites} colorOf={colorOf} search={ownSearch} />
            </Panel>
            <div className="grid gap-1 lg:grid-cols-2">
              <Panel
                title="Content ideas for you"
                icon={Lightbulb}
                aside={ai.contentIdeas?.length ? <Chip tone="violet">{ai.contentIdeas.length}</Chip> : null}
                explain={<p>Ready-to-use titles for pages, blog posts, FAQs or videos, based on the gaps above, each with a section outline and the search phrases it should answer. <b>Copy</b> puts the whole idea on your clipboard for a writer’s brief. “Inspired by” shows which competitor already does something similar.</p>}
              >
                <ContentIdeas ai={ai} colorOf={colorOf} />
              </Panel>
              <div className="space-y-1">
                <Panel title="What they have that you don't" icon={Target} aside={<Chip tone="muted">{ai.gaps.length}</Chip>} explain={<p>Things at least one competitor shows on its website that yours doesn’t, with a link to their page so you can see it yourself.</p>}>
                  <Gaps ai={ai} colorOf={colorOf} />
                </Panel>
                {ai.opportunities.length ? <Panel title="Nobody does this well yet" icon={Sparkles} explain={<p>Weak spots shared by every site in this comparison. Doing these first can make you stand out from all of them at once.</p>}><Opportunities ai={ai} /></Panel> : null}
              </div>
            </div>
            <Panel title="Each website up close" icon={LayoutDashboard} explain={<p>Pick a website to see its main promise, tone, what it offers, who it speaks to, and its strengths and weak spots (each linked to the page it comes from).</p>}>
              <Profiles ai={ai} report={report} sites={data.sites} colorOf={colorOf} />
            </Panel>
          </div>
        ) : <ObservedContent sites={report.sites} business={business} tracking={tracking} />
      ) : null}

      {tab === "tech" ? (
        <div className="space-y-1">

          <Panel
            title="Technical & content checklist"
            icon={ListChecks}
            explain={<p>Facts measured directly on each website. <span className="rounded bg-[#E7F6EF] px-1 font-semibold text-[#0B845C]">Green</span> = best of the group or within the recommended range, <span className="rounded bg-[#FEF2F2] px-1 font-semibold text-[#B91C1C]">red</span> = outside it, ✓ / ✗ = has it or not, “—” = could not be measured. The grey line under each item explains why it matters.</p>}
          >
            <TechTable report={report} sites={data.sites} colorOf={colorOf} />
          </Panel>
        </div>
      ) : null}

      {tab === "plan" ? (
        ai?.actions.length ? (
          <Panel
            title="Your action plan"
            icon={ListChecks}
            subtitle="What to do, when, and who to learn from"
            explain={<p>Steps for your website, grouped by when to do them. <b>Impact</b> = how much it should help, <b>effort</b> = how much work it is. <b className="text-[#0B845C]">Quick win</b> = high impact and low effort: start there. “Learn from” names the competitor that already does it well.</p>}
          >
            <ActionBoard ai={ai} colorOf={colorOf} tracking={tracking} />
            {tracking && !data.linkedClient ? <p className="mt-2 text-[11px] text-[#6B7A94]">To turn actions into CRM tasks, add {own.domain} as the website of one of your clients.</p> : null}
          </Panel>
        ) : <IndustryActions business={business} tracking={tracking} />
      ) : null}

      {tab === "history" ? (
        <div className="space-y-1">
          <Panel title="Overall score over time" icon={HistoryIcon} explain={<p>Each point is one check. A rising line means that site is improving; compare your line with the others to see if you are pulling ahead or falling behind.</p>}>
            <History study={data} colorOf={colorOf} />
          </Panel>
          <Panel title="What changed since the last check" icon={TrendingUp}><Changes report={report} colorOf={colorOf} own={own.domain} /></Panel>
        </div>
      ) : null}

      <IndustryPanel business={report.model?.businessIntelligence??report.businessIntelligence} tracking={shared?undefined:tracking}/>
      <ProfilePanel results={report.profileResults} />
      <details className="rounded-xl border border-[#E6EBF4] bg-white p-3 text-[11.5px] text-[#4B5872]">
        <summary className="cursor-pointer font-semibold text-[#111C3A]">Pages read in this check ({report.sites.reduce((n, e) => n + e.pages.length, 0)})</summary>
        <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {report.sites.map((e) => (
            <div key={e.domain} className={cn("rounded-lg p-2", e.role === "own" && "bg-[#EFF4FC] ring-1 ring-inset ring-[#BFD3F7]")}>
              <p className="flex flex-wrap items-center gap-2"><SiteLabel domain={e.domain} color={colorOf(e.domain)} own={e.role === "own"} />{e.coverage ? <Chip tone={e.coverage.status === "complete" ? "good" : e.coverage.status === "partial" ? "warn" : "bad"}>{e.coverage.score}% key-page confidence · {e.coverage.read}/{e.coverage.discovered} URLs sampled</Chip> : <Chip tone="warn">legacy scan</Chip>}</p>
              {e.reachable ? <ul className="mt-1 space-y-0.5">{e.pages.map((p) => <li key={p.url} className="flex flex-wrap items-center gap-1.5"><SourceLink url={p.url} /> <span className="text-[10px] text-[#94A3B8]">{p.words.toLocaleString("en-IN")} words</span>{p.kind ? <Chip>{p.kind}</Chip> : null}{p.method === "rendered" ? <Chip tone="info">browser rendered</Chip> : null}</li>)}</ul> : <p className="mt-1 text-[#C0261F]">{e.error}</p>}
              {e.coverage?.warnings.map((warning) => <p key={warning} className="mt-1 text-[10px] normal-case text-[#92400E]">{warning}</p>)}
            </div>
          ))}
        </div>
      </details>
      <p className="flex gap-1.5 text-[10.5px] text-[#94A3B8]"><Info className="mt-0.5 size-3 shrink-0" />Based on measured public pages and Google measurements taken on {formatDateTime(report.finishedAt ?? report.startedAt)}. Scores are deterministic; cited findings link to observed pages. Missing evidence is shown as not verified{report.ai?.status === "completed" && report.ai.dropped ? `; ${report.ai.dropped} unsupported or contradictory point(s) were removed` : ""}.</p>
    </>
  );
}
