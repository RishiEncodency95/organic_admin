"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Image as ImageIcon, Loader2, Save, Upload } from "lucide-react";
import { seoAuditApi, type SocialData, type SocialField } from "@/lib/seoAuditApi";
import { uploadApi } from "@/lib/uploadApi";
import { errorMessage } from "@/lib/errorMessage";
import { SITE_HOST } from "@/lib/siteConfig";

interface RouteOption {
  id: string;
  label: string;
  path: string;
}

const FIELDS: SocialField[] = ["ogTitle", "ogDescription", "ogImage", "ogImageAlt", "twitterCard", "twitterTitle", "twitterDescription", "twitterImage"];

type Form = Record<SocialField, string>;

const input = "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[0.8125rem] text-slate-800 outline-none focus:border-indigo-400";

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`text-[0.6875rem] ${n > max ? "text-amber-700" : "text-slate-400"}`}>{n}/{max}</span>;
}

function Field({ label, hint, children, counter }: { label: string; hint?: string; children: React.ReactNode; counter?: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[0.75rem] text-slate-700">
        <span>{label}</span>
        {counter}
      </span>
      {children}
      {hint && <span className="mt-0.5 block text-[0.6875rem] text-slate-400">{hint}</span>}
    </label>
  );
}

/** Edit Open Graph (WhatsApp / Facebook / LinkedIn) and X / Twitter share tags of each page, with a live preview */
export default function SocialTagsTab({ routes, initialPath }: { routes: RouteOption[]; initialPath?: string }) {
  const [route, setRoute] = useState<string>(initialPath || routes[0]?.path || "/");
  const [data, setData] = useState<SocialData | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"og" | "tw" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const fileOg = useRef<HTMLInputElement>(null);
  const fileTw = useRef<HTMLInputElement>(null);

  const load = useCallback(async (r: string) => {
    setLoading(true);
    setError(null);
    setSaved(null);
    try {
      const d = await seoAuditApi.social(r);
      setData(d);
      setForm({ ...d.saved });
    } catch (e) {
      setData(null);
      setForm(null);
      setError(errorMessage(e) || "Could not read the share tags.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // load() shows the loading state while the request runs
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(route);
  }, [route, load]);

  const dirty = useMemo(() => Boolean(data && form && FIELDS.some((f) => (form[f] ?? "") !== (data.saved[f] ?? ""))), [data, form]);

  // what the website will show: what is typed, else the fallback the website uses
  const shown = useMemo(() => {
    if (!data || !form) return null;
    const t = form.ogTitle.trim() || data.effective.ogTitle;
    const d = form.ogDescription.trim() || data.effective.ogDescription;
    const img = form.ogImage.trim() || data.effective.ogImage;
    return {
      ogTitle: t,
      ogDescription: d,
      ogImage: img,
      twTitle: form.twitterTitle.trim() || t,
      twDescription: form.twitterDescription.trim() || d,
      twImage: form.twitterImage.trim() || img,
      twCard: form.twitterCard === "summary" ? "summary" : "summary_large_image",
    };
  }, [data, form]);

  const set = (f: SocialField, v: string) => setForm((p) => (p ? { ...p, [f]: v } : p));

  const upload = async (file: File | undefined, target: "og" | "tw") => {
    if (!file) return;
    setUploading(target);
    setError(null);
    try {
      const r = await uploadApi.file(file, "moksha-voyage/social");
      set(target === "og" ? "ogImage" : "twitterImage", r.url);
    } catch (e) {
      setError(errorMessage(e) || "The picture could not be uploaded.");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const body: Partial<Record<SocialField, string>> = {};
      for (const f of FIELDS) body[f] = form[f] ?? "";
      const r = await seoAuditApi.saveSocial(route, body);
      setData(r.social);
      setForm({ ...r.social.saved });
      setSaved(r.changed ? "Saved. The website shows it as soon as it is built; you can undo it from Fix history." : "Nothing had changed.");
    } catch (e) {
      setError(errorMessage(e) || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const liveDiffers = (f: SocialField, fallback: string) => data && (data.live[f] ?? "") !== (form?.[f]?.trim() || fallback);
  const host = SITE_HOST;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/60 px-4 py-3">
        <h2 className="text-[0.9375rem] text-slate-800 [font-weight:500]">Share cards (Open Graph and X / Twitter)</h2>
        <p className="max-w-3xl text-[0.75rem] text-slate-500">
          What WhatsApp, Facebook, LinkedIn and X show when a page is shared: the headline, the text under it and the picture. Edit them page by page.
          Anything left empty uses the page&apos;s own title, description and picture.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            aria-label="Choose a page"
            className="h-8 min-w-[260px] cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-[0.8125rem] text-slate-800"
          >
            {routes.map((r) => (
              <option key={r.id} value={r.path}>
                {r.label}
              </option>
            ))}
          </select>
          {data && <span className="font-mono text-[0.6875rem] text-slate-500">{data.pageUrl}</span>}
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[0.75rem] text-rose-800">{error}</div>}
      {saved && <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[0.75rem] text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> {saved}</div>}
      {data?.note && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.75rem] text-amber-900">{data.note}</div>}

      {loading && !data ? (
        <div className="flex items-center gap-2 p-6 text-[0.8125rem] text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading the page…
        </div>
      ) : data && form && shown ? (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* Editor */}
          <div className="space-y-3">
            <section className="space-y-2.5 rounded-xl border border-sky-200 bg-sky-50/50 p-3">
              <h3 className="text-[0.8125rem] text-slate-800 [font-weight:500]">Open Graph · WhatsApp, Facebook, LinkedIn</h3>
              <Field label="Share title" counter={<Counter n={shown.ogTitle.length} max={data.limits.ogTitle} />}>
                <input className={input} value={form.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} placeholder={data.effective.ogTitle} disabled={!data.editable} />
              </Field>
              <Field label="Share description" counter={<Counter n={shown.ogDescription.length} max={data.limits.ogDescription} />}>
                <textarea className={input} rows={2} value={form.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} placeholder={data.effective.ogDescription} disabled={!data.editable} />
              </Field>
              <Field label="Share picture" hint="A full https:// address. About 1200 × 630 pixels works best.">
                <div className="flex gap-1.5">
                  <input className={input} value={form.ogImage} onChange={(e) => set("ogImage", e.target.value)} placeholder={data.effective.ogImage || "https://…"} disabled={!data.editable} />
                  <input ref={fileOg} type="file" accept="image/*" hidden onChange={(e) => void upload(e.target.files?.[0], "og")} />
                  <button type="button" disabled={!data.editable || uploading !== null} onClick={() => fileOg.current?.click()} className="inline-flex h-[34px] shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[0.75rem] text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    {uploading === "og" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
                  </button>
                </div>
              </Field>
              <Field label="Describe the share picture" counter={<Counter n={form.ogImageAlt.length} max={data.limits.ogImageAlt} />}>
                <input className={input} value={form.ogImageAlt} onChange={(e) => set("ogImageAlt", e.target.value)} placeholder={data.effective.ogImageAlt} disabled={!data.editable} />
              </Field>
            </section>

            <section className="space-y-2.5 rounded-xl border border-slate-300 bg-slate-50/70 p-3">
              <h3 className="text-[0.8125rem] text-slate-800 [font-weight:500]">X / Twitter card</h3>
              <Field label="Card style">
                <select className={input} value={form.twitterCard} onChange={(e) => set("twitterCard", e.target.value)} disabled={!data.editable}>
                  <option value="">Large picture (default)</option>
                  <option value="summary_large_image">Large picture</option>
                  <option value="summary">Small square picture</option>
                </select>
              </Field>
              <Field label="Card title" counter={<Counter n={shown.twTitle.length} max={data.limits.twitterTitle} />}>
                <input className={input} value={form.twitterTitle} onChange={(e) => set("twitterTitle", e.target.value)} placeholder={shown.ogTitle} disabled={!data.editable} />
              </Field>
              <Field label="Card description" counter={<Counter n={shown.twDescription.length} max={data.limits.twitterDescription} />}>
                <textarea className={input} rows={2} value={form.twitterDescription} onChange={(e) => set("twitterDescription", e.target.value)} placeholder={shown.ogDescription} disabled={!data.editable} />
              </Field>
              <Field label="Card picture">
                <div className="flex gap-1.5">
                  <input className={input} value={form.twitterImage} onChange={(e) => set("twitterImage", e.target.value)} placeholder={shown.ogImage || "https://…"} disabled={!data.editable} />
                  <input ref={fileTw} type="file" accept="image/*" hidden onChange={(e) => void upload(e.target.files?.[0], "tw")} />
                  <button type="button" disabled={!data.editable || uploading !== null} onClick={() => fileTw.current?.click()} className="inline-flex h-[34px] shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[0.75rem] text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    {uploading === "tw" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload
                  </button>
                </div>
              </Field>
            </section>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving || !data.editable}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[0.8125rem] text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save share cards
              </button>
              {dirty && (
                <button type="button" onClick={() => setForm({ ...data.saved })} className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-[0.8125rem] text-slate-600 hover:bg-slate-50">
                  Discard changes
                </button>
              )}
              {!dirty && !saved && <span className="text-[0.6875rem] text-slate-400">No unsaved changes</span>}
            </div>
          </div>

          {/* Preview and checks */}
          <div className="space-y-3">
            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <h3 className="mb-2 text-[0.8125rem] text-slate-800 [font-weight:500]">How it looks when shared</h3>
              <p className="mb-1 text-[0.6875rem] uppercase tracking-wide text-slate-400">WhatsApp / Facebook / LinkedIn</p>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {shown.ogImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shown.ogImage} alt={form.ogImageAlt || shown.ogTitle} className="aspect-[1.91/1] w-full bg-slate-100 object-cover" />
                ) : (
                  <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-slate-100 text-slate-400"><ImageIcon className="h-8 w-8" /></div>
                )}
                <div className="space-y-0.5 px-3 py-2">
                  <div className="text-[0.6875rem] uppercase text-slate-400">{host}</div>
                  <div className="line-clamp-2 text-[0.875rem] leading-snug text-slate-800 [font-weight:500]">{shown.ogTitle || "(no title)"}</div>
                  <div className="line-clamp-2 text-[0.75rem] leading-snug text-slate-500">{shown.ogDescription}</div>
                </div>
              </div>

              <p className="mb-1 mt-3 text-[0.6875rem] uppercase tracking-wide text-slate-400">X / Twitter</p>
              {shown.twCard === "summary" ? (
                <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {shown.twImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shown.twImage} alt="" className="h-24 w-24 shrink-0 bg-slate-100 object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-slate-100 text-slate-400"><ImageIcon className="h-6 w-6" /></div>
                  )}
                  <div className="min-w-0 space-y-0.5 px-3 py-2">
                    <div className="text-[0.6875rem] text-slate-400">{host}</div>
                    <div className="line-clamp-1 text-[0.8125rem] text-slate-800 [font-weight:500]">{shown.twTitle}</div>
                    <div className="line-clamp-2 text-[0.75rem] text-slate-500">{shown.twDescription}</div>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {shown.twImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shown.twImage} alt="" className="aspect-[2/1] w-full bg-slate-100 object-cover" />
                  ) : (
                    <div className="flex aspect-[2/1] w-full items-center justify-center bg-slate-100 text-slate-400"><ImageIcon className="h-8 w-8" /></div>
                  )}
                  <div className="space-y-0.5 px-3 py-2">
                    <div className="line-clamp-1 text-[0.8125rem] text-slate-800 [font-weight:500]">{shown.twTitle}</div>
                    <div className="line-clamp-2 text-[0.75rem] text-slate-500">{shown.twDescription}</div>
                    <div className="text-[0.6875rem] text-slate-400">{host}</div>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-3">
              <h3 className="mb-1.5 text-[0.8125rem] text-slate-800 [font-weight:500]">Checks</h3>
              <ul className="space-y-1">
                {data.checks.map((c) => (
                  <li key={c.text} className="flex items-start gap-1.5 text-[0.75rem] text-slate-600">
                    {c.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
                    {c.text}
                  </li>
                ))}
              </ul>
              <p className="mt-2 border-t border-slate-100 pt-2 text-[0.6875rem] text-slate-500">
                Live on the website at the last audit{data.auditedAt ? ` (${new Date(data.auditedAt).toLocaleDateString("en-IN")})` : ""}:{" "}
                {liveDiffers("ogTitle", data.effective.ogTitle) || liveDiffers("ogImage", data.effective.ogImage) ? "the saved values above are not on the live page yet (they appear after the next build and audit)." : "the live page matches the saved values."}
              </p>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
