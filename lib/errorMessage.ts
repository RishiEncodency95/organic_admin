/** Safe message extraction for `catch (err)` blocks (err is `unknown`). Empty string when there is none. */
export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "";
}
