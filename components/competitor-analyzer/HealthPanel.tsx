"use client";

import type { Health } from "@/lib/competitorAnalyzerApi";
import { Badge, Card, fmtDate } from "./ui";
import GoogleCard from "./GoogleCard";
import DisplayText from "./DisplayText";

export default function HealthPanel({ health }: { health: Health | null }) {
  if (!health) return <p className="text-sm text-slate-500">Loading provider health…</p>;
  const rows: [string, string, string][] = [
    ["Analyzer", health.analyzerEnabled ? "ready" : "disabled", `Primary site: ${health.primarySite}`],
    ["AI (OpenAI, backend only)", health.ai.lastError ? "failed" : health.ai.state, health.ai.lastError ? `Last call failed ${fmtDate(health.ai.lastError.at)}: ${health.ai.lastError.message}` : health.ai.reason ?? `Model: ${health.ai.model}; web search ${health.ai.webSearch}`],
    ["AI budget (today)", health.budget.dailyBudgetUsd ? "ready" : "not_configured", health.budget.dailyBudgetUsd ? `$${health.budget.committedUsd.toFixed(4)} of $${health.budget.dailyBudgetUsd} committed · ${health.budget.uncertainCalls} uncertain call(s)` : "No daily budget set — paid AI calls are blocked"],
    ["Run queue", "ready", health.queue.mode],
    ["Worker", health.worker.running ? "ready" : "not_running", `${health.worker.inProcess ? "In-process" : "Dedicated process"} · last heartbeat ${fmtDate(health.worker.lastHeartbeatAt)}`],
    ["Google PageSpeed", health.pagespeed.state === "enabled" ? "ready" : "disabled", `API key ${health.pagespeed.apiKey.replace("_", " ")}`],
    ["Google Search Console", health.searchConsole.state, health.searchConsole.reason],
    ["Browser rendering", health.renderer.state, health.renderer.reason],
    ["Scheduled monitoring", health.scheduler.state, `${health.scheduler.scheduledStudies ?? 0} study(ies) on a weekly/monthly schedule · next due ${fmtDate(health.scheduler.nextDue ?? null)}`],
  ];
  return (
    <div className="space-y-1">
    <GoogleCard />
    <Card title="Settings & provider health" subtitle="Real readiness of each integration. Unavailable providers show as unavailable in reports — never as zero.">
      <table className="w-full text-left text-sm">
        <tbody>
          {rows.map(([name, state, detail]) => (
              <tr key={name} className="border-b border-slate-100"><td className="py-2 pr-3 font-medium text-slate-700">{name}</td><td className="pr-3"><Badge value={state} /></td><td className="text-xs text-slate-500"><DisplayText text={detail} /></td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-slate-500">Limits: up to {health.limits.maxCompetitors} competitors per study, {health.limits.defaultPagesPerSite} pages per site by default (max {health.limits.maxPagesPerSite}), rerun cooldown {health.limits.cooldownMinutes} min.</p>
    </Card>
    </div>
  );
}
