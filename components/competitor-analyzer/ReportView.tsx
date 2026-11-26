"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, Lightbulb, ShieldCheck, Target, Trophy } from "lucide-react";
import { competitorApi, type Action, type Report, type ReportSite, type RunSummary, type Snapshot } from "@/lib/competitorAnalyzerApi";
import { colorFor, MAX_SERIES, PositioningMap, ScoreBars, ScoreRadar, ScoreTrend, SiteToggles } from "./charts";
import { ChartReadingGuide } from "./AnalyzerIntro";
import UpClose from "./UpClose";
import HeadToHeadPanel from "./HeadToHeadPanel";
import DisplayText from "./DisplayText";
import { AiUsagePanel, EvidenceDiagnostics, PageMatches } from "./ReportDiagnostics";
import { Badge, Card, Cites, Empty, ErrorBox, errorText, fmtDate, inputCls, ScoreBar, STATE_HELP, Tabs, useLoader } from "./ui";

/*
 * Competitor report. Everything comes from the saved run; unknown stays unknown. Plain-language first:
 * a "where you stand" panel on top, then tabs with a one-line explanation each.
 * mode "public" = read-only shared link (no check details, no action editing).
 */

type Tab = "overview" | "scores" | "sites" | "h2h" | "services" | "content" | "tech" | "actions" | "history";
const TABS: { id: Tab; label: string; help: string }[] = [
  { id: "overview", label: "Overview", help: "Who is strongest in which area, at a glance." },
  { id: "scores", label: "Score comparison", help: "Every area, every website, with the checks behind each score." },
  { id: "sites", label: "Each website", help: "A card per website: screenshot, freshness, content size, brand and social links." },
  { id: "h2h", label: "Head to head", help: "Moksha against each competitor: where each one is better, with the quote that proves it." },
  { id: "services", label: "Services & prices", help: "Which services each website mentions and the prices it publishes." },
  { id: "content", label: "Content ideas", help: "Topics competitors cover that you don't, ready-to-use ideas and FAQ drafts." },
  { id: "tech", label: "Speed & tech", help: "Google PageSpeed (mobile) and how much of each website could be read." },
  { id: "actions", label: "Action plan", help: "Tasks to improve your website. Rechecks never create duplicates." },
  { id: "history", label: "History", help: "How scores changed over time and what changed on the websites." },
];
const ACTION_STATUSES = ["suggested", "needs_review", "approved", "todo", "doing", "implemented", "verified", "rejected"];
const FEATURE_LABELS: Record<string, string> = { phone: "Phone number", clickToCall: "Tap-to-call button", whatsapp: "WhatsApp", contactForm: "Enquiry form", email: "Email", address: "Office address", operatingHours: "Hours / 24×7 claim", pricing: "Prices published", packages: "Packages explained", faq: "FAQ", testimonials: "Testimonials (site's own)", blog: "Blog / guides", aboutPage: "About page", servicesPage: "Services page", contactPage: "Contact page", privacyPolicy: "Privacy policy", termsPolicy: "Terms", refundPolicy: "Refund policy", locationPages: "City pages", structuredData: "Google structured data", hindiContent: "Hindi content", socialLinks: "Social profile links" };
const STATE_WORD: Record<string, string> = { present: "Yes", absent_confirmed: "No", not_observed: "Not seen", render_failed: "Couldn't check", fetch_failed: "Couldn't read", provider_unavailable: "Unavailable", not_applicable: "—" };
const STATE_CELL: Record<string, string> = { present: "bg-emerald-50 text-emerald-800", absent_confirmed: "bg-rose-50 text-rose-700", not_observed: "bg-slate-50 text-slate-500", render_failed: "bg-amber-50 text-amber-700", fetch_failed: "bg-amber-50 text-amber-700" };
const short = (d: string) => d.replace(/^www\./, "");

export interface ReportViewProps {
  mode?: "admin" | "public";
  studyId?: string;
  run: { _id: string; finishedAt: string | null; report?: Report | null };
  runs?: RunSummary[];
  actions?: Action[] | { title: string; priority: string; status: string; recommendation: string }[];
  liveActions?: Action[];
  onActionsChanged?: () => Promise<void>;
  screenshot: (domain: string) => (() => Promise<Blob>) | null;
  favicon?: (domain: string) => (() => Promise<Blob>) | null;
}

export default function ReportView({ mode = "admin", studyId, run, runs = [], actions = [], liveActions = [], onActionsChanged, screenshot, favicon }: ReportViewProps) {
  const r = run.report!;
  const [tab, setTab] = useState<Tab>("overview");
  const sites = r.sites;
  const own = sites.find((s) => s.role === "own")!;
  const comps = sites.filter((s) => s.role === "competitor");
  const ai = r.ai?.result ?? null;
  const [visible, setVisible] = useState<string[]>(() => [own.domain, ...[...comps].sort((a, b) => (b.score?.overall ?? -1) - (a.score?.overall ?? -1)).map((c) => c.domain)].slice(0, Math.min(5, MAX_SERIES)));
  const aiNote = !ai ? `AI commentary is ${r.ai?.status === "invalid_output" ? "incomplete" : r.ai?.status?.replace(/_/g, " ") ?? "not available"}. The saved website evidence and measured comparisons are available.` : r.ai.dropped ? `${r.ai.dropped} AI statement(s) were removed because their proof could not be found on the pages.` : "";
  const help = TABS.find((t) => t.id === tab)?.help;

  return (
    <div className="space-y-1">
      <StandPanel r={r} own={own} comps={comps} actions={actions as Action[]} />
      <EvidenceDiagnostics report={r} />
      {mode === "admin" && <AiUsagePanel report={r} />}
      <div className="sticky top-0 z-10 bg-slate-50/95 pt-1 backdrop-blur">
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">{help}</p>
        <p className="text-xs text-slate-400">Checked {fmtDate(run.finishedAt)} · rubric {r.methodology?.rubricVersion} · settings v{r.methodology?.settingsVersion ?? 0}</p>
      </div>
      {aiNote && !["actions", "history", "sites", "tech"].includes(tab) && <div className="rounded-xl border border-amber-100 bg-[#fffbef] px-3 py-2 text-[11px] text-amber-800">{aiNote}{r.ai?.error && <details className="mt-1"><summary className="cursor-pointer text-[10px] text-amber-700">Why AI commentary is unavailable</summary><p className="mt-1 max-w-3xl text-[10px] leading-relaxed text-amber-700/80">{r.ai.error}</p></details>}</div>}

      {tab === "overview" && (
        <div className="space-y-1">
          <ChartReadingGuide />
          <Card title="Your comparison set" subtitle="Tap a website to show or hide it. The colour stays consistent across every chart.">
            <SiteToggles sites={sites} visible={visible} onChange={setVisible} />
          </Card>
          <div className="grid gap-1 xl:grid-cols-2">
            <Card title="Website benchmark" subtitle="An easy side-by-side view. Choose one metric to compare all selected websites.">
              <ScoreBars sites={sites} visible={visible} />
            </Card>
            <Card title="Strength by area" subtitle="Bigger shape = stronger website. Areas without enough evidence are left out.">
              <ScoreRadar sites={sites} visible={visible} />
            </Card>
          </div>
          <div className="grid gap-1 xl:grid-cols-3">
            <WhoToWatch r={r} own={own} comps={comps} />
            <Card title="Positioning map" subtitle="Content on the horizontal axis. Trust on the vertical axis. Hover over a point for its scores." className="xl:col-span-2">
              <PositioningMap sites={sites} visible={visible} />
            </Card>
          </div>
          <Card title="Compare the right services" subtitle="Shared services make a head-to-head comparison more useful.">
              <div className="grid gap-2 md:grid-cols-2">
                {r.scopes.map((s) => (
                  <div key={s.competitor} className="rounded-md border border-slate-100 p-2 text-xs">
                    <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(sites, s.competitor) }} /><b className="normal-case">{short(s.competitor)}</b> <Badge value={s.comparable ? "pass" : "warn"} label={s.comparable ? "similar services" : "different services"} /></div>
                    <p className="mt-1 text-slate-500">Both offer: {s.sharedServices.join(", ").replace(/_/g, " ") || "—"}</p>
                    {!!s.competitorOnly.length && <p className="text-slate-500">Only they mention: {s.competitorOnly.join(", ").replace(/_/g, " ")}</p>}
                  </div>
                ))}
              </div>
          </Card>
          {r.ownSearch && mode === "admin" && <OwnSearchCard r={r} />}
          {r.changes && <Card title="What changed since the last check"><Changes changes={r.changes} /></Card>}
          <Card title="How much can you trust this report?" subtitle={r.quality.rule}>
            <ul className="list-disc space-y-1 pl-4 text-xs text-slate-600">{r.limitations.map((l) => <li key={l}>{l}</li>)}{r.quality.issues?.slice(0, 8).map((i, n) => <li key={n} className={i.severity === "error" ? "text-rose-700" : ""}><DisplayText text={short(i.domain) + ": " + i.message} /></li>)}</ul>
          </Card>
        </div>
      )}

      {tab === "scores" && (
        <Card title="Score comparison" subtitle={`Out of 100 per area. Grey = not enough evidence (not counted as zero). Weights: ${r.methodology?.weights}.`}>
          <ScoreHeatmap sites={sites} />
          {mode === "admin" && studyId && <ChecksDetail studyId={studyId} runId={run._id} domains={sites.map((s) => s.domain)} />}
        </Card>
      )}

      {tab === "sites" && <UpClose runId={run._id} sites={sites} screenshot={screenshot} favicon={favicon} />}

      {tab === "h2h" && <div className="space-y-1"><PageMatches report={r} /><HeadToHeadPanel report={r} runId={run._id} favicon={favicon} /></div>}

      {tab === "services" && (
        <div className="space-y-1">
          <Card title="Services each website mentions" subtitle="“Not seen” means not found on the pages we read — it does not prove the business lacks it.">
            <Matrix sites={sites} rows={own.services.map((s) => ({ key: s.category, label: s.label }))} get={(site, key) => site.services.find((x) => x.category === key)} />
          </Card>
          <Card title="Contact options & trust details">
            <Matrix sites={sites} rows={Object.keys(FEATURE_LABELS).map((k) => ({ key: k, label: FEATURE_LABELS[k] }))} get={(site, key) => site.features[key]} />
          </Card>
          <Card title="Published prices" subtitle="Exact words from each website. Different units or inclusions are not compared as cheaper/costlier.">
            <div className="grid gap-1 md:grid-cols-2">
              {sites.map((s) => (
                <div key={s.domain} className="rounded-md border border-slate-100 p-3">
                  <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(sites, s.domain) }} /><span className="normal-case">{short(s.domain)}</span></h4>
                  {!s.prices.length ? <p className="text-xs text-slate-400">No price seen on the pages read.</p> : (
                    <ul className="space-y-1.5">{s.prices.slice(0, 8).map((p, i) => <li key={i} className="text-xs text-slate-600"><b className="text-slate-800">{p.raw}</b> {p.startingFrom && <Badge value="starting from" />} {p.unit && <Badge value={`per ${p.unit}`} />} {p.tax !== "unstated" && <Badge value={`tax ${p.tax}`} />}<span className="block italic text-slate-500">“{p.excerpt}”</span><a className="text-teal-700" href={p.sourceUrl} target="_blank" rel="noreferrer noopener">source page</a></li>)}</ul>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "content" && (
        <div className="grid gap-1 lg:grid-cols-2">
          <Card title="Topics they cover better">{ai?.gaps.length ? ai.gaps.map((g, i) => <div key={i} className="mb-3 border-b border-slate-100 pb-3 text-sm last:border-0"><b>{g.title}</b> <Badge value={g.category} /><p className="text-slate-600">{g.detail}</p><Cites items={g.evidence} max={2} /></div>) : <Empty>No proven content gaps in this check.</Empty>}</Card>
          <Card title="Content ideas for you">{ai?.contentIdeas.length ? ai.contentIdeas.map((c, i) => <IdeaCard key={i} idea={c} />) : <Empty>No content ideas in this check.</Empty>}</Card>
          <Card title="FAQ drafts (review before publishing — never published automatically)" className="lg:col-span-2">{ai?.faqDrafts?.length ? ai.faqDrafts.map((f, i) => <div key={i} className="mb-3 text-sm"><b>{f.question}</b><p className="text-slate-600">{f.answerDraft}</p><Cites items={f.evidence} max={1} /></div>) : <Empty>No FAQ drafts.</Empty>}</Card>
        </div>
      )}

      {tab === "tech" && (
        <div className="space-y-1">
          <Card title="Mobile speed (Google PageSpeed, lab test)" subtitle="Lab test of each home page. Real-visitor data is shown only when Google has it.">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500"><tr><th className="py-2 pr-3">Website</th><th>Performance</th><th>LCP</th><th>CLS</th><th>TBT</th><th>Accessibility</th><th>SEO</th><th>Real visitors</th></tr></thead>
                <tbody>{sites.map((s) => { const m = s.speed?.mobile; return <tr key={s.domain} className="border-t border-slate-100"><td className="py-2 pr-3"><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full" style={{ background: colorFor(sites, s.domain) }} /><span className="normal-case">{short(s.domain)}</span></td>{m ? <><td><ScoreBar value={(m.performance as number | null) ?? null} /></td><td>{m.lcpMs ? `${(Number(m.lcpMs) / 1000).toFixed(1)} s` : "—"}</td><td>{m.cls ?? "—"}</td><td>{m.tbtMs ? `${m.tbtMs} ms` : "—"}</td><td>{m.accessibility ?? "—"}</td><td>{m.seo ?? "—"}</td></> : <td colSpan={6} className="text-xs text-slate-400">{s.speed?.error ?? "not measured"}</td>}<td className="text-xs">{s.speed?.field ? String(s.speed.field.category ?? "available") : "not available"}</td></tr>; })}</tbody>
              </table>
            </div>
          </Card>
          <Card title="How much of each website was read" subtitle="A bounded sample of the most important pages.">
            <table className="w-full text-left text-xs"><thead className="uppercase text-slate-500"><tr><th className="py-1">Website</th><th>Status</th><th>Pages read</th><th>Failed</th><th>Blocked by robots.txt</th><th>JavaScript-only</th><th>Missing key pages</th></tr></thead>
              <tbody>{sites.map((s) => <tr key={s.domain} className="border-t border-slate-100"><td className="normal-case py-1.5">{short(s.domain)}</td><td><Badge value={s.coverage.status} /></td><td>{s.coverage.read}/{s.coverage.selected}</td><td>{s.coverage.failed}</td><td>{s.coverage.robotsBlocked}</td><td>{s.coverage.jsShellPages}</td><td>{s.coverage.missingPriorityKinds.join(", ") || "—"}</td></tr>)}</tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "actions" && (mode === "admin" && studyId && onActionsChanged ? <div className="space-y-2"><p className="text-xs text-slate-500">Live study action board. Report exports and shared links keep the actions saved with that report.</p><ActionBoard studyId={studyId} actions={liveActions} onChanged={onActionsChanged} /></div> : <PublicActions actions={actions as { title: string; priority: string; status: string; recommendation: string }[]} />)}

      {tab === "history" && (
        <div className="space-y-1">
          <Card title="Overall score over time" subtitle="One point per completed check.">
            <SiteToggles sites={sites} visible={visible} onChange={setVisible} />
            <div className="mt-3"><ScoreTrend runs={runs} sites={sites} visible={visible} /></div>
          </Card>
          {r.changes ? <Card title="Changes found in this check"><Changes changes={r.changes} /></Card> : <Empty>This is the first check — nothing to compare yet.</Empty>}
          {mode === "admin" && runs.length > 0 && <HistoryTable runs={runs} current={run._id} />}
        </div>
      )}
    </div>
  );
}

/* ── Where you stand ─────────────────────────────────────────────────────────── */
function StandPanel({ r, own, comps, actions }: { r: Report; own: ReportSite; comps: ReportSite[]; actions: Action[] }) {
  const ranked = [own, ...comps].filter((s) => s.score?.overall !== null && s.score?.overall !== undefined).sort((a, b) => (b.score.overall as number) - (a.score.overall as number));
  const rank = ranked.findIndex((s) => s.domain === own.domain) + 1;
  const comparable = r.leaders.filter((l) => Object.keys(l.scores).length >= 2);
  const leads = comparable.filter((l) => l.leader === own.domain).length;
  const gaps = comparable
    .map((l) => ({ l, best: Math.max(...Object.entries(l.scores).filter(([d]) => d !== own.domain).map(([, v]) => v)), mine: l.scores[own.domain] }))
    .filter((g) => g.mine !== undefined && g.best > g.mine)
    .sort((a, b) => b.best - b.mine - (a.best - a.mine));
  const quick = actions.filter((a) => a.priority === "high" && !["rejected", "verified", "implemented"].includes(a.status)).slice(0, 3);
  const avg = comps.filter((c) => c.score?.overall !== null && c.score?.overall !== undefined);
  const avgScore = avg.length ? Math.round(avg.reduce((s, c) => s + (c.score.overall as number), 0) / avg.length) : null;
  const score = own.score?.overall ?? null;
  const delta = score !== null && avgScore !== null ? score - avgScore : null;
  const circumference = 2 * Math.PI * 43;
  return (
    <section className="overflow-hidden rounded-2xl border border-[#dce5de] bg-[#f5f7f0]">
      <div className="grid gap-1 p-1 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 md:p-5">
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="50" cy="50" r="43" fill="none" stroke="#eaf0e7" strokeWidth="5" /><circle cx="50" cy="50" r="43" fill="none" stroke="#246b4d" strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.min(100, Math.max(0, score ?? 0)) / 100)} /></svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold tracking-tight text-[#234f39]">{score ?? "—"}</span><span className="text-[10px] text-slate-400">out of 100</span></div>
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#82917d]">Your website at a glance</p>
            <h2 className="text-lg font-semibold tracking-tight text-[#24432f] md:text-xl">{!r.overallComparable ? "Start with shared services." : delta !== null ? delta > 0 ? `${delta} points ahead of the average.` : delta < 0 ? `${Math.abs(delta)} points to close the gap.` : "On par with the comparison set." : "Build a clearer picture."}</h2>
            <p className="mt-1 break-all text-xs text-slate-500"><span className="normal-case">{own.domain}</span> <span className="mx-1 text-slate-300">·</span> {rank ? `#${rank} by website score` : "Not enough evidence to rank"}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">Competitor average: <b className="font-medium text-slate-700">{avgScore ?? "Not scored"}</b>. Scores measure sampled website content; search ranking and business performance are not measured.</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{own.score.evidenceCoverage != null ? `${own.score.evidenceCoverage}% Of Weighted Checks Evaluated. ` : ""}{own.score.calibration ? "Quality Rubric V2 · External Calibration Pending." : "Historical Rubric · Weights Have Not Been Externally Calibrated."}</p>
          </div>
        </div>
        <div className="rounded-xl border border-white bg-[#eef3e9] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f8063]"><Lightbulb size={14} /> Your next best moves</p>
          {quick.length ? <ol className="space-y-1">{quick.map((a, i) => <li key={a._id ?? i} className="flex items-start gap-2 rounded-lg bg-white/70 px-2.5 py-2 text-xs leading-relaxed text-[#42583b]"><span className="text-[10px] text-[#96a58b]">0{i + 1}</span>{a.title}</li>)}</ol> : <p className="py-2 text-xs leading-relaxed text-[#809074]">No high-priority tasks were saved in this report. Explore the evidence or review the live action board.</p>}
          {r.ai?.result?.summary && <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-[#75836d]">{r.ai.result.summary}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 px-1 pb-1 xl:grid-cols-4">
        <Stat icon={<Trophy size={14} />} label="Areas you lead" value={`${leads} / ${comparable.length} areas`} />
        <Stat icon={<Target size={14} />} label="Opportunity to improve" value={gaps[0] ? `${gaps[0].l.label} · −${gaps[0].best - gaps[0].mine}` : comparable.length ? "No measured gap" : "More evidence needed"} />
        <Stat icon={<Eye size={14} />} label="Competitors analysed" value={`${comps.length} websites`} />
        <Stat icon={<ShieldCheck size={14} />} label="Evidence coverage" value={`${r.quality.completeness}% · ${r.quality.status.replace(/_/g, " ")}`} />
      </div>
    </section>
  );
}
const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="rounded-xl border border-white bg-white/80 px-3 py-3">
    <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#879181]">{icon}{label}</div>
    <div className="mt-1 text-[13px] font-semibold text-[#35503a]">{value}</div>
  </div>
);

function WhoToWatch({ r, own, comps }: { r: Report; own: ReportSite; comps: ReportSite[] }) {
  const ranked = [...comps].sort((a, b) => (b.score?.overall ?? -1) - (a.score?.overall ?? -1));
  return (
    <Card title="Who to watch" subtitle="Competitors ranked by measured website score (not business size).">
      <ol className="space-y-2">
        {ranked.map((c) => {
          const better = r.leaders.filter((l) => l.scores[c.domain] !== undefined && l.scores[own.domain] !== undefined && l.scores[c.domain] > l.scores[own.domain]).map((l) => l.label);
          return (
            <li key={c.domain} className="rounded-md border border-slate-100 p-2">
              <div className="flex items-center justify-between gap-2 text-sm"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(r.sites, c.domain) }} /><b><DisplayText text={c.siteName ?? short(c.domain)} /></b></span><span className="font-semibold text-slate-700">{c.score?.overall ?? "—"}</span></div>
              <p className="text-[11px] text-slate-500">{better.length ? `Ahead of you in: ${better.join(", ")}` : "Not ahead of you in any measured area"}</p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function OwnSearchCard({ r }: { r: Report }) {
  const s = r.ownSearch!;
  return (
    <Card title="Your Google Search Console (measured)" subtitle="Your own site only. Impressions are not search volume; competitors have no Search Console data here.">
      {s.state !== "measured" ? <p className="text-sm text-slate-500">Not available for this check: {s.error ?? s.state}.</p> : !s.queries.length ? <p className="text-sm text-slate-500">Google shows no searches for your site in {s.period?.start} → {s.period?.end}. Submit your sitemap in Search Console and request indexing.</p> : (
        <div className="grid gap-1 md:grid-cols-2">
          <div className="text-sm text-slate-700">{s.period?.start} → {s.period?.end}: <b>{s.totals?.clicks}</b> clicks · <b>{s.totals?.impressions}</b> impressions · avg position <b>{s.totals?.position ?? "—"}</b></div>
          <table className="w-full text-left text-xs"><thead className="uppercase text-slate-500"><tr><th>Top searches</th><th>Clicks</th><th>Impr.</th><th>Pos.</th></tr></thead><tbody>{s.queries.slice(0, 10).map((q) => <tr key={q.key} className="border-t border-slate-100"><td className="py-1">{q.key}</td><td>{q.clicks}</td><td>{q.impressions}</td><td>{q.position}</td></tr>)}</tbody></table>
        </div>
      )}
    </Card>
  );
}

/* ── Score heatmap ───────────────────────────────────────────────────────────── */
const cellTone = (v: number | null | undefined) => (v === null || v === undefined ? "bg-slate-100 text-slate-400" : v >= 80 ? "bg-emerald-100 text-emerald-900" : v >= 60 ? "bg-lime-50 text-lime-900" : v >= 40 ? "bg-amber-100 text-amber-900" : "bg-rose-100 text-rose-900");
function ScoreHeatmap({ sites }: { sites: ReportSite[] }) {
  const own = sites.find((s) => s.role === "own")!;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-left text-sm">
        <thead><tr><th className="pr-3 text-xs font-medium uppercase text-slate-500">Area</th>{sites.map((s) => <th key={s.domain} className="min-w-[90px] text-center text-xs font-medium text-slate-600"><span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: colorFor(sites, s.domain) }} /><span className="normal-case">{short(s.domain)}</span>{s.role === "own" ? " (you)" : ""}</th>)}</tr></thead>
        <tbody>
          {own.score.categories.map((c) => (
            <tr key={c.category}>
              <td className="pr-3 text-sm text-slate-700">{c.label} <span className="text-[10px] text-slate-400">weight {c.weight}</span></td>
              {sites.map((s) => { const x = s.score.categories.find((y) => y.category === c.category); return <td key={s.domain} className={`rounded-md py-2 text-center font-semibold ${cellTone(x?.score)}`} title={x ? `${x.evaluated} checks measured, ${x.unknown} unknown` : ""}>{x?.score ?? "—"}</td>; })}
            </tr>
          ))}
          <tr><td className="pr-3 pt-2 text-sm font-semibold text-slate-800">Overall</td>{sites.map((s) => <td key={s.domain} className={`rounded-md py-2 text-center text-base font-bold ${cellTone(s.score.overall)}`}>{s.score.overall ?? "—"}</td>)}</tr>
        </tbody>
      </table>
      <p className="mt-2 text-[11px] text-slate-500">Colours: green ≥ 80 · light green 60–79 · amber 40–59 · red &lt; 40 · grey = not enough evidence.</p>
    </div>
  );
}

function Matrix<T extends { state: string; evidence: { url: string; excerpt?: string }[] } | undefined>({ sites, rows, get }: { sites: ReportSite[]; rows: { key: string; label: string }[]; get: (s: ReportSite, key: string) => T }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0.5 text-left text-xs">
        <thead><tr><th className="py-1 pr-2 font-medium uppercase text-slate-500">Item</th>{sites.map((s) => <th key={s.domain} className="min-w-[88px] text-center font-medium text-slate-600"><span className="normal-case">{short(s.domain)}</span></th>)}</tr></thead>
        <tbody>{rows.map((row) => (
          <tr key={row.key}>
            <td className="py-1 pr-2 font-medium text-slate-700">{row.label}</td>
            {sites.map((s) => { const v = get(s, row.key); return <td key={s.domain} className={`rounded px-1.5 py-1 text-center ${v ? STATE_CELL[v.state] ?? "bg-slate-50 text-slate-500" : "text-slate-300"}`} title={v ? `${STATE_HELP[v.state as keyof typeof STATE_HELP] ?? ""}${v.evidence?.[0]?.excerpt ? ` — “${v.evidence[0].excerpt}”` : ""}` : ""}>{v ? (v.evidence?.[0] ? <a href={v.evidence[0].url} target="_blank" rel="noreferrer noopener" className="hover:underline">{STATE_WORD[v.state] ?? v.state}</a> : STATE_WORD[v.state] ?? v.state) : "—"}</td>; })}
          </tr>
        ))}</tbody>
      </table>
      <p className="mt-2 text-[11px] text-slate-500">Yes = seen (click for the page) · No = checked the pages where it normally appears · Not seen = not on the pages read · Couldn&apos;t check = page needs JavaScript or failed.</p>
    </div>
  );
}

function IdeaCard({ idea }: { idea: { title: string; format: string; reason: string; outline: string[]; evidence?: { url: string; quote: string }[] } }) {
  const [copied, setCopied] = useState(false);
  const text = `${idea.title}\n\nWhy: ${idea.reason}\n\nOutline:\n${idea.outline.map((o) => `- ${o}`).join("\n")}`;
  return (
    <div className="mb-3 rounded-md border border-slate-100 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div><b>{idea.title}</b> <Badge value={idea.format} /></div>
        <button type="button" className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={12} /> : <Copy size={12} />}{copied ? "Copied" : "Copy idea"}</button>
      </div>
      <p className="text-slate-600">{idea.reason}</p>
      {!!idea.outline.length && <ul className="mt-1 list-disc pl-4 text-xs text-slate-500">{idea.outline.map((o) => <li key={o}>{o}</li>)}</ul>}
      {idea.evidence && <Cites items={idea.evidence} max={1} />}
    </div>
  );
}

function ChecksDetail({ studyId, runId, domains }: { studyId: string; runId: string; domains: string[] }) {
  const [domain, setDomain] = useState(domains[0]);
  const [only, setOnly] = useState<"problems" | "all">("problems");
  const { data, error } = useLoader(() => competitorApi.snapshot(studyId, runId, domain), [studyId, runId, domain]);
  const snap: Snapshot | null = data && data.domain === domain ? data : null;
  const checks = (snap?.checks ?? []).filter((c) => only === "all" || c.state === "fail" || c.state === "warn");
  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-slate-700">Why these scores?</span>
        <select className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((d) => <option key={d}>{d}</option>)}</select>
        <select className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={only} onChange={(e) => setOnly(e.target.value as "problems" | "all")}><option value="problems">Problems only</option><option value="all">All checks</option></select>
      </div>
      <ErrorBox message={error} />
      {!snap ? <p className="text-xs text-slate-500">Loading…</p> : !checks.length ? <Empty>No problems found by the checks.</Empty> : (
        <div className="space-y-1.5">{checks.map((c) => (
          <div key={c.id} className="rounded-md border border-slate-100 p-2 text-xs">
            <div className="flex items-center gap-2"><Badge value={c.state} label={c.state === "fail" ? "problem" : c.state === "warn" ? "could be better" : c.state === "pass" ? "good" : c.state.replace(/_/g, " ")} /><span className="font-medium text-slate-800">{c.title}</span><span className="text-slate-400">{c.id}</span></div>
            <p className="mt-1 text-slate-600">{c.explanation}</p>
            {(c.state === "fail" || c.state === "warn") && <p className="text-teal-800">How to fix: {c.remediation}</p>}
          </div>
        ))}</div>
      )}
    </div>
  );
}

function ActionBoard({ studyId, actions, onChanged }: { studyId: string; actions: Action[]; onChanged: () => Promise<void> }) {
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("open");
  const shown = useMemo(() => actions.filter((a) => (filter === "open" ? !["rejected", "verified"].includes(a.status) : filter === "all" ? true : a.status === filter)), [actions, filter]);
  const counts = useMemo(() => Object.fromEntries(["high", "medium", "low"].map((p) => [p, actions.filter((a) => a.priority === p && !["rejected", "verified"].includes(a.status)).length])), [actions]);
  const update = async (a: Action, body: Parameters<typeof competitorApi.updateAction>[2]) => {
    setError("");
    try {
      await competitorApi.updateAction(studyId, a._id, body);
      await onChanged();
    } catch (e) {
      setError(errorText(e));
    }
  };
  const tone: Record<string, string> = { high: "border-l-rose-400", medium: "border-l-amber-400", low: "border-l-slate-300" };
  return (
    <Card title="Action plan" subtitle={`Open: ${counts.high} high · ${counts.medium} medium · ${counts.low} low priority. "Verified" = a later check shows it fixed (not a business-result claim).`} actions={<select className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="open">Open tasks</option><option value="all">All</option>{ACTION_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>}>
      <ErrorBox message={error} />
      {!shown.length ? <Empty>No tasks in this view.</Empty> : (
        <div className="space-y-2">{shown.map((a) => (
          <div key={a._id} className={`rounded-md border border-slate-200 border-l-4 bg-white p-3 ${tone[a.priority] ?? ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold text-slate-800">{a.title}</p>
                <p className="mt-0.5 text-xs text-slate-600">{a.problem}</p>
                <p className="mt-1 text-sm text-teal-900">{a.recommendation}</p>
                <div className="mt-1 flex flex-wrap gap-1"><Badge value={a.priority} label={`${a.priority} priority`} /><Badge value={a.source} label={a.source === "ai" ? "AI suggestion — review" : `automatic check ${a.checkId}`} /></div>
                <Cites items={a.evidence.filter((e) => e.url)} max={1} />
              </div>
              <div className="flex w-44 flex-col gap-1.5">
                <select className="h-8 rounded-md border border-slate-200 px-2 text-xs" value={a.status} onChange={(e) => {
                  const status = e.target.value;
                  const notes = status === "rejected" ? (window.prompt("Why reject this? The analyzer learns from your reason.") ?? undefined) : undefined;
                  void update(a, { status, ...(notes ? { notes } : {}) });
                }}>{ACTION_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select>
                <input className={`${inputCls} h-8 text-xs`} placeholder="Assign to…" defaultValue={a.assignee ?? ""} onBlur={(e) => e.target.value !== (a.assignee ?? "") && update(a, { assignee: e.target.value || null })} />
                <input className={`${inputCls} h-8 text-xs`} type="date" defaultValue={a.dueDate?.slice(0, 10) ?? ""} onChange={(e) => update(a, { dueDate: e.target.value || null })} />
              </div>
            </div>
          </div>
        ))}</div>
      )}
    </Card>
  );
}

function PublicActions({ actions }: { actions: { title: string; priority: string; status: string; recommendation: string }[] }) {
  if (!actions.length) return <Empty>No tasks.</Empty>;
  return (
    <Card title="Action plan">
      <ul className="space-y-2">{actions.map((a, i) => <li key={i} className="rounded-md border border-slate-100 p-2 text-sm"><b>{a.title}</b> <Badge value={a.priority} label={`${a.priority} priority`} /> <Badge value={a.status} /><p className="text-slate-600">{a.recommendation}</p></li>)}</ul>
    </Card>
  );
}

function Changes({ changes }: { changes: NonNullable<Report["changes"]> }) {
  return (
    <div className="space-y-2">{changes.map((c) => (
      <div key={c.domain} className="text-xs">
        <b>{short(c.domain)}</b>: {!c.diff.comparable ? <span className="text-slate-500">{c.diff.reason}</span> : !c.diff.changes.length ? <span className="text-slate-500">no proven changes</span> : (
          <ul className="list-disc pl-4">{c.diff.changes.slice(0, 15).map((x, i) => <li key={i}>{x.kind.replace(/_/g, " ")}: {x.subject} {x.before !== null || x.after !== null ? <span className="text-slate-500">({String(x.before ?? "—").slice(0, 60)} → {String(x.after ?? "—").slice(0, 60)})</span> : null}</li>)}</ul>
        )}
        {c.diff.notComparable.length > 0 && <p className="text-slate-400">{c.diff.notComparable.length} item(s) could not be compared (page not read this time) — not counted as changes.</p>}
      </div>
    ))}</div>
  );
}

function HistoryTable({ runs, current }: { runs: RunSummary[]; current: string }) {
  return (
    <Card title="All checks">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500"><tr><th className="py-1">Started</th><th>Status</th><th>Your score</th><th>Evidence</th><th>AI</th></tr></thead>
        <tbody>{runs.map((r) => { const own = r.report?.sites?.find((s) => s.role === "own"); return <tr key={r._id} className={`border-t border-slate-100 ${r._id === current ? "bg-teal-50/50" : ""}`}><td className="py-1 text-xs">{fmtDate(r.createdAt)}</td><td><Badge value={r.status} /></td><td><ScoreBar value={own?.score?.overall ?? null} /></td><td>{r.quality ? <Badge value={r.quality.status} /> : "—"}</td><td className="text-xs">{r.ai?.status ?? "—"}</td></tr>; })}</tbody>
      </table>
    </Card>
  );
}
