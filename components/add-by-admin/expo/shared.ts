import { ApiRequestError } from "@/lib/api";

export const inputClass =
  "h-9 w-full rounded-md border border-surface-border bg-surface-card px-3 text-sm text-text-primary outline-none focus:border-accent";

export const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);
