"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Eye, Link2, Loader2, X } from "lucide-react";
import { ApiError } from "@/components/infrastructure/lib/errors";
import { cn } from "@/components/infrastructure/lib/cn";
import { formatDate } from "@/components/competitor-analyzer/source/lib/utils/format";
import { Chip, WButton } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/kit";
import { formatRelative } from "@/components/competitor-analyzer/source/features/admin/website/data/selectors";
import type { StudyDetail, StudyShare } from "@/components/competitor-analyzer/api";
import { useStudyShares } from "@/components/competitor-analyzer/hooks";

const errorText = (err: unknown, fallback: string) => (ApiError.isApiError(err) ? err.message : fallback);
const linkOf = (token: string) => `${typeof window === "undefined" ? "" : window.location.origin}/shared/competitor-report/${token}`;

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Link copied");
  } catch {
    toast.error("Could not copy. Select the link and copy it instead.");
  }
}

function ShareRow({ share, onRevoke, busy }: { share: StudyShare; onRevoke: () => void; busy: boolean }) {
  const url = linkOf(share.token);
  const active = share.status === "active";
  return (
    <li className={cn("rounded-lg border p-2.5", active ? "border-[#E6EBF4] bg-white" : "border-[#EEF2F8] bg-[#FAFBFD] opacity-75")}>
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="text-[12px] font-semibold text-[#111C3A] normal-case">{share.label || "Share link"}</p>
        <Chip tone={active ? "good" : "muted"}>{active ? "Active" : share.status === "expired" ? "Expired" : "Switched off"}</Chip>
        <Chip>{share.lang === "hi" ? "Hindi PDF" : "English PDF"}</Chip>
        <span className="ml-auto flex items-center gap-1 text-[10.5px] text-[#6B7A94]"><Eye className="size-3" />{share.viewCount} view{share.viewCount === 1 ? "" : "s"}{share.lastViewedAt ? ` · last ${formatRelative(share.lastViewedAt)}` : ""}</span>
      </div>
      {active ? (
        <div className="mt-1.5 flex items-center gap-1.5">
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="h-7 min-w-0 flex-1 rounded-md border border-[#DAE1EC] bg-[#F8FAFD] px-2 text-[11px] normal-case text-[#28354C] outline-none" aria-label="Share link" />
          <WButton icon={Copy} onClick={() => void copy(url)}>Copy</WButton>
          <WButton icon={busy ? Loader2 : X} onClick={onRevoke} disabled={busy}>Switch off</WButton>
        </div>
      ) : null}
      <p className="mt-1 text-[10.5px] text-[#94A3B8]">
        Made {formatDate(share.createdAt)} · {active ? `works until ${formatDate(share.expiresAt)}` : share.revokedAt ? `switched off ${formatDate(share.revokedAt)}` : `expired ${formatDate(share.expiresAt)}`}
      </p>
    </li>
  );
}

/** Make a link the client can open without login; see how often it was opened and switch it off any time. */
export function SharePanel({ study, onClose }: { study: StudyDetail; onClose: () => void }) {
  const { list, create, revoke } = useStudyShares(study.id);
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [label, setLabel] = useState("");
  const shares = list.data ?? [];
  const active = shares.filter((s) => s.status === "active");

  const make = () =>
    create.mutate(
      { days, lang, label: label.trim() || undefined },
      {
        onSuccess: (share) => {
          setLabel("");
          void copy(linkOf(share.token));
        },
        onError: (e) => toast.error(errorText(e, "Could not make the link")),
      },
    );

  const pill = (on: boolean) => cn("rounded-md border px-2.5 py-1 text-[11.5px] font-medium", on ? "border-[#2563EB] bg-[#EFF4FC] text-[#1D4ED8]" : "border-[#E6EBF4] bg-white text-[#4B5872] hover:bg-[#F8FAFD]");

  return (
    <section className="rounded-xl border border-[#DCE6FB] bg-[#F7F9FF] p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111C3A]"><Link2 className="size-4 text-[#2563EB]" /> Share with your client</p>
          <p className="mt-0.5 max-w-2xl text-[11.5px] normal-case text-[#6B7A94]">
            Anyone with the link sees this report (always the latest check) and can download its PDF, without logging in. They do not see your action-plan progress, Action tasks, settings or Google Search Console data. The link stops working on its end date, or as soon as you switch it off.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-7 place-items-center rounded-md text-[#94A3B8] hover:bg-white hover:text-[#111C3A]"><X className="size-4" /></button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[#6B7A94]">Works for</p>
          <div className="mt-1 flex gap-1">
            {([7, 30, 90] as const).map((d) => <button key={d} type="button" className={pill(days === d)} onClick={() => setDays(d)}>{d} days</button>)}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#6B7A94]">PDF language</p>
          <div className="mt-1 flex gap-1">
            <button type="button" className={pill(lang === "en")} onClick={() => setLang("en")}>English</button>
            <button type="button" className={pill(lang === "hi")} onClick={() => setLang("hi")}>हिंदी</button>
          </div>
        </div>
        <label className="min-w-[200px] flex-1 text-[11px] font-semibold text-[#6B7A94]">
          Who is it for? (optional, only you see this)
          <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={80} placeholder="e.g. Ramesh, marketing head" className="mt-1 h-8 w-full rounded-md border border-[#DAE1EC] bg-white px-2.5 text-[12px] font-normal normal-case text-[#111C3A] outline-none focus:border-[#2563EB]" />
        </label>
        <WButton tone="primary" icon={create.isPending ? Loader2 : Link2} onClick={make} disabled={create.isPending || !study.report} disabledReason="Run the analysis once before sharing it">
          {create.isPending ? "Making link…" : "Make link & copy"}
        </WButton>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold text-[#6B7A94]">Links ({active.length} active)</p>
        {list.isLoading ? <p className="mt-1 text-[11.5px] text-[#94A3B8]">Loading…</p> : null}
        {list.error ? <p className="mt-1 text-[11.5px] text-[#C0261F]">{errorText(list.error, "Could not load the links")}</p> : null}
        {!list.isLoading && !shares.length ? <p className="mt-1 text-[11.5px] text-[#94A3B8]">No links yet. Make one above and send it to your client on WhatsApp or e-mail.</p> : null}
        {shares.length ? (
          <ul className="mt-1 grid gap-1 lg:grid-cols-2">
            {shares.map((s) => (
              <ShareRow
                key={s.id}
                share={s}
                busy={revoke.isPending && revoke.variables === s.id}
                onRevoke={() => revoke.mutate(s.id, { onSuccess: () => toast.success("Link switched off. It no longer opens."), onError: (e) => toast.error(errorText(e, "Could not switch the link off")) })}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
