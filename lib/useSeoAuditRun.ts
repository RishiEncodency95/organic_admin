"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seoAuditApi, type AuditJobStatus } from "./seoAuditApi";

export type SeoJobKind = "audit" | "autofix_all";

export interface AuditRunState {
  running: boolean;
  percent: number;
  step: string | null;
  error: string | null;
  jobId: string | null;
  kind: SeoJobKind | null;
  /** Result of the last finished job (for auto-fix-all: totals) */
  result: Record<string, unknown> | null;
}

const POLL_MS = 2000;
const GIVE_UP_AFTER_MS = 40 * 60 * 1000;
const STORAGE_KEY = "seo-audit-active-job";

const store = {
  read(): { jobId: string; kind: SeoJobKind } | null {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  write(v: { jobId: string; kind: SeoJobKind } | null) {
    try {
      if (v) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
      else window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage may be blocked: polling still works for this page view */
    }
  },
};

const IDLE: AuditRunState = { running: false, percent: 0, step: null, error: null, jobId: null, kind: null, result: null };

/**
 * One background job at a time (a full audit or "Auto-Fix All"): start it, or attach to the one already running (409),
 * and poll its real state / progress with a single poller. The job id is kept in sessionStorage, so a page reload
 * resumes the progress bar. `onDone` runs after a successful job so the page can reload its issue lists.
 */
export function useSeoAuditRun(onDone?: (kind: SeoJobKind, result: Record<string, unknown> | null) => void) {
  const [state, setState] = useState<AuditRunState>(IDLE);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const polling = useRef<string | null>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    polling.current = null;
  };

  const poll = useCallback((jobId: string, kind: SeoJobKind, startedAt: number) => {
    if (polling.current === jobId) return; // a single poller per job
    stop();
    polling.current = jobId;
    const tick = async () => {
      if (!alive.current || polling.current !== jobId) return;
      let s: AuditJobStatus | null = null;
      try {
        s = await seoAuditApi.auditJobStatus(jobId);
      } catch (err) {
        if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
          stop();
          store.write(null);
          setState((p) => ({ ...p, running: false, error: err instanceof Error ? err.message : "Lost contact with the job." }));
          return;
        }
      }
      if (!alive.current || polling.current !== jobId) return;
      if (s) {
        if (s.state === "completed") {
          stop();
          store.write(null);
          const result = (s.result as Record<string, unknown> | undefined) ?? null;
          setState({ running: false, percent: 100, step: "Done", error: null, jobId, kind, result });
          onDoneRef.current?.(kind, result);
          return;
        }
        if (s.state === "failed" || s.state === "not_found") {
          stop();
          store.write(null);
          const errorMsg = s.skipped ? "Another job was already running (skipped)." : s.error || "The job failed.";
          setState({ running: false, percent: s.progress, step: s.step, error: errorMsg, jobId, kind, result: null });
          return;
        }
        setState({ running: true, percent: s.progress, step: s.step || (s.state === "waiting" ? "Waiting in the queue" : "Running"), error: null, jobId, kind, result: null });
      }
      if (Date.now() - startedAt > GIVE_UP_AFTER_MS) {
        stop();
        store.write(null);
        setState((p) => ({ ...p, running: false, error: "The job is taking too long. Check its status later." }));
        return;
      }
      timer.current = setTimeout(tick, POLL_MS);
    };
    timer.current = setTimeout(tick, 600);
  }, []);

  // resume after a reload, or attach to a job started elsewhere (webhook, another tab)
  useEffect(() => {
    alive.current = true;
    const saved = store.read();
    const resume = saved
      ? Promise.resolve(saved)
      : seoAuditApi.activeJob().then((a) => (a ? { jobId: a.jobId, kind: a.kind as SeoJobKind } : null)).catch(() => null);
    resume.then((j) => {
      if (!j || !alive.current) return;
      store.write(j);
      setState({ ...IDLE, running: true, step: "Reconnecting", jobId: j.jobId, kind: j.kind });
      poll(j.jobId, j.kind, Date.now());
    });
    return () => {
      alive.current = false;
      stop();
    };
  }, [poll]);

  const begin = useCallback(
    async (kind: SeoJobKind, start: () => Promise<{ jobId: string }>) => {
      setState({ ...IDLE, running: true, step: "Queuing", kind });
      try {
        const { jobId } = await start();
        store.write({ jobId, kind });
        setState({ ...IDLE, running: true, step: "Queued", jobId, kind });
        poll(jobId, kind, Date.now());
      } catch (err) {
        // 409: something is already running: follow that job instead of failing
        if ((err as { status?: number })?.status === 409 || (err instanceof Error && err.message.includes("already in progress"))) {
          const active = await seoAuditApi.activeJob().catch(() => null);
          if (active && active.jobId) {
            store.write({ jobId: active.jobId, kind: active.kind as SeoJobKind });
            setState({ ...IDLE, running: true, step: "Connecting to active background run…", jobId: active.jobId, kind: active.kind as SeoJobKind });
            poll(active.jobId, active.kind as SeoJobKind, Date.now());
            return;
          }
        }
        setState({ ...IDLE, error: err instanceof Error ? err.message : "Could not start the job.", kind });
      }
    },
    [poll]
  );

  const runNow = useCallback(() => begin("audit", () => seoAuditApi.triggerAudit()), [begin]);
  const runAutoFix = useCallback(() => begin("autofix_all", () => seoAuditApi.startAutoFixAll()), [begin]);

  return { ...state, runNow, runAutoFix };
}
