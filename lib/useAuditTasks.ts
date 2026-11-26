"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { auditTasksApi, type AuditTaskList, type TaskStatus } from "./auditTasksApi";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** The fix task list built from the latest audit. Changing a task updates the screen at once and is saved on the server. */
export function useAuditTasks() {
  const [data, setData] = useState<AuditTaskList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    auditTasksApi
      .list()
      .then((payload) => {
        if (alive.current) setData(payload);
      })
      .catch((err) => {
        if (alive.current) setError(messageOf(err, "Could not load the task list."));
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    return () => {
      alive.current = false;
    };
  }, []);

  const setStatus = useCallback(async (checkId: number, status: TaskStatus, note?: string) => {
    let previous: AuditTaskList | null = null;
    setData((current) => {
      previous = current;
      return current ? { ...current, tasks: current.tasks.map((t) => (t.checkId === checkId ? { ...t, status, note: note ?? t.note } : t)) } : current;
    });
    try {
      const payload = await auditTasksApi.setStatus(checkId, status, note);
      if (alive.current) setData(payload);
    } catch (err) {
      if (alive.current) {
        setData(previous);
        setError(messageOf(err, "Could not save the task."));
      }
    }
  }, []);

  return { data, loading, error, setStatus };
}
