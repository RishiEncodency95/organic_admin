"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seoAuditApi, type PendingState } from "./seoAuditApi";

/** Pending / resolved SEO issues and the live health score, straight from the API (no local copies kept). */
export function useSeoPending() {
  const [data, setData] = useState<PendingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const seq = useRef(0);
  const reload = useCallback(async () => {
    const mine = ++seq.current; // only the newest request may write: a slow older answer never overwrites a fresher one
    setLoading(true);
    try {
      const d = await seoAuditApi.pendingIssues();
      if (!alive.current || mine !== seq.current) return;
      setData(d);
      setError(null);
    } catch (err) {
      if (alive.current && mine === seq.current) setError(err instanceof Error ? err.message : "Could not load the issue list.");
    } finally {
      if (alive.current && mine === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const mine = ++seq.current;
    seoAuditApi
      .pendingIssues()
      .then((d) => {
        if (cancelled || mine !== seq.current) return;
        setData(d);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the issue list.");
      })
      .finally(() => {
        if (!cancelled && mine === seq.current) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Drops one issue from the list at once (it was just fixed); a reload then confirms it with the server. */
  const removeIssue = useCallback((id: string) => {
    setData((prev) =>
      prev
        ? { ...prev, pending: prev.pending.filter((i) => i.id !== id), counts: { ...prev.counts, pending: Math.max(0, prev.counts.pending - 1) } }
        : prev
    );
  }, []);

  return { data, loading, error, reload, removeIssue };
}
