"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { competitorApi, type Health } from "@/lib/competitorAnalyzerApi";
import StudiesPanel from "@/components/competitor-analyzer/StudiesPanel";
import DiscoveryPanel from "@/components/competitor-analyzer/DiscoveryPanel";
import KeywordsPanel from "@/components/competitor-analyzer/KeywordsPanel";
import TrainingPanel from "@/components/competitor-analyzer/TrainingPanel";
import HealthPanel from "@/components/competitor-analyzer/HealthPanel";
import AutoFindCard from "@/components/competitor-analyzer/AutoFindCard";
import { AnalyzerIntro } from "@/components/competitor-analyzer/AnalyzerIntro";
import presentation from "@/components/competitor-analyzer/presentation.module.css";
import { ErrorBox, errorText, Tabs } from "@/components/competitor-analyzer/ui";

/*
 * AI Competitor Analyzer — evidence-based comparison of the Moksha Voyage website with selected competitors.
 * Studies are opened at /competitor-analyzer/[studyId] (report, actions, history).
 */

type Tab = "studies" | "discovery" | "keywords" | "training" | "health";
const TABS: { id: Tab; label: string }[] = [
  { id: "studies", label: "Comparison Studies" },
  { id: "discovery", label: "Discovery & Watchlist" },
  { id: "keywords", label: "Keywords & Content Gaps" },
  { id: "training", label: "Training & Settings" },
  { id: "health", label: "Provider Health" },
];

const noop = () => () => undefined;

export default function CompetitorAnalyzerPage() {
  // Returning from Google sign-in (?google=…) opens Provider Health, where the result is shown.
  const fromGoogle = useSyncExternalStore(noop, () => new URLSearchParams(window.location.search).has("google"), () => false);
  const [picked, setTab] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (fromGoogle ? "health" : "studies");
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      competitorApi.health().then((value) => { if (alive) { setHealth(value); setError(""); } }).catch((e) => { if (alive) setError(errorText(e, "Could not load analyzer status")); });
    };
    refresh();
    const timer = setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { alive = false; clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  const aiReady = health?.ai.state === "ready";

  return (
    <div className={`${presentation.shell} mx-auto max-w-[1440px] space-y-1 p-1.5 md:p-2 lg:pr-14`}>
      <div className="flex items-center justify-between px-1 py-2"><span className="text-[11px] font-medium text-slate-500">Research & insights <span className="mx-2 text-slate-300">/</span> <span className="text-[#31533d]">Competitor analyzer</span></span><span className="text-[10px] text-slate-400">Moksha Voyage</span></div>
      <AnalyzerIntro aiReady={aiReady} />
      {health && !aiReady && <p className="rounded-xl border border-amber-100 bg-amber-50 p-2 text-xs text-amber-800">AI is {health.ai.state.replace("_", " ")}: {health.ai.reason} Measured evidence and scores still work.</p>}
      <ErrorBox message={error} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "studies" && (
        <div className="space-y-1">
          <AutoFindCard aiReady={aiReady && health?.ai.webSearch === "enabled"} maxCompetitors={Math.min(health?.limits.maxCompetitors ?? 4, 4)} />
          <StudiesPanel maxCompetitors={Math.min(health?.limits.maxCompetitors ?? 4, 4)} />
        </div>
      )}
      {tab === "discovery" && <DiscoveryPanel aiReady={aiReady && health?.ai.webSearch === "enabled"} />}
      {tab === "keywords" && <KeywordsPanel aiReady={aiReady} />}
      {tab === "training" && <TrainingPanel canEdit />}
      {tab === "health" && <HealthPanel health={health} />}
    </div>
  );
}
