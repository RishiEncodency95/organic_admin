/**
 * Reads schema markup (JSON-LD) the way the backend and the website do: one block or several, with or without
 * <script> tags. Used to tell the admin, while typing, how many schemas there are and what is wrong.
 */
export interface SchemaReading {
  ok: boolean;
  /** One entry per schema found, for example "Organization", "FAQPage" */
  types: string[];
  problem: string | null;
}

const typeOf = (it: Record<string, unknown>): string[] => {
  const t = it["@type"];
  if (typeof t === "string") return [t];
  if (Array.isArray(t)) return t.filter((x): x is string => typeof x === "string").slice(0, 1);
  const graph = it["@graph"];
  if (Array.isArray(graph)) return graph.flatMap((g) => (g && typeof g === "object" ? typeOf(g as Record<string, unknown>) : []));
  return [];
};

export function readSchema(raw: string): SchemaReading {
  const input = raw.trim();
  if (!input) return { ok: false, types: [], problem: "The schema is empty." };
  const scripts = [...input.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)].map((m) => m[1]);
  const blocks = scripts.length ? scripts : [input.replace(/<\/?script\b[^>]*>/gi, "")];
  const items: Record<string, unknown>[] = [];
  for (const block of blocks) {
    const text = block.trim();
    if (!text) continue;
    try {
      const value = JSON.parse(text);
      if (!value || typeof value !== "object") return { ok: false, types: [], problem: "A schema must be a JSON object." };
      items.push(...((Array.isArray(value) ? value : [value]) as Record<string, unknown>[]));
    } catch (e) {
      return { ok: false, types: [], problem: `Not valid JSON: ${e instanceof Error ? e.message : "check commas, quotes and brackets"}` };
    }
  }
  if (!items.length) return { ok: false, types: [], problem: "The schema is empty." };
  const types: string[] = [];
  for (let i = 0; i < items.length; i++) {
    const t = typeOf(items[i]);
    if (!t.length) return { ok: false, types, problem: `Schema ${i + 1} has no "@type" (what it describes, for example "Organization" or "FAQPage").` };
    types.push(...t);
  }
  return { ok: true, types, problem: null };
}
