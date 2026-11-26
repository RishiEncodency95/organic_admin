"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { semrushApi, type SemrushPayload, type TaskStatus } from "./semrushApi";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/**
 * The newest Semrush upload with its comparison and task list, loaded once and shared by both tabs.
 * Uploading replaces it; changing a task's status updates the screen at once and is saved on the server.
 */
export function useSemrushReport() {
  const [data, setData] = useState<SemrushPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    semrushApi
      .latest()
      .then((payload) => {
        if (alive.current) setData(payload);
      })
      .catch((err) => {
        if (alive.current) setError(messageOf(err, "Could not load the Semrush report."));
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    return () => {
      alive.current = false;
    };
  }, []);

  /** Returns an error message, or null when the upload worked. */
  const upload = useCallback(
    async (files: { issuesCsv: string; issuesFileName: string; pagesCsv?: string; pagesFileName?: string }): Promise<string | null> => {
      setUploading(true);
      setError(null);
      try {
        const payload = await semrushApi.upload(files);
        if (alive.current) setData(payload);
        return null;
      } catch (err) {
        return messageOf(err, "The upload failed.");
      } finally {
        if (alive.current) setUploading(false);
      }
    },
    [],
  );

  const setTaskStatus = useCallback(async (issueId: number, status: TaskStatus) => {
    let previous: SemrushPayload | null = null;
    setData((current) => {
      previous = current;
      return current
        ? { ...current, tasks: current.tasks.map((t) => (t.issueId === issueId ? { ...t, status } : t)) }
        : current;
    });
    try {
      const payload = await semrushApi.setTask(issueId, status);
      if (alive.current) setData(payload);
    } catch (err) {
      if (alive.current) {
        setData(previous);
        setError(messageOf(err, "Could not save the task."));
      }
    }
  }, []);

  return { data, loading, error, uploading, upload, setTaskStatus, clearError: () => setError(null) };
}
