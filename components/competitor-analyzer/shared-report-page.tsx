"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleAlert, FileDown, Languages, Link2Off, Loader2, Swords } from "lucide-react";
import { formatDate } from "@/components/competitor-analyzer/source/lib/utils/format";
import { WButton } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/kit";
import { SkeletonBlock } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/states";
import { formatDateTime } from "@/components/competitor-analyzer/source/features/admin/website/data/selectors";
import { sharedApi } from "@/components/competitor-analyzer/api";
import { ReportBody } from "@/components/competitor-analyzer/report-body";
import { SITE_COLORS, SiteLabel, SiteNamesProvider } from "@/components/competitor-analyzer/ui";
import { cn } from "@/components/infrastructure/lib/cn";

function Problem({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border border-[#E6EBF4] bg-white p-6 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <Link2Off className="mx-auto size-8 text-[#94A3B8]" />
      <p className="mt-3 text-[15px] font-semibold text-[#111C3A]">{title}</p>
      <p className="mt-1 text-[12.5px] text-[#6B7A94]">{body}</p>
    </div>
  );
}

/** The report a company shared with its client: read-only, no login. */
export function SharedReportPage({ token }: { token: string }) {
  const query = useQuery({ queryKey: ["shared-competitor-report", token], queryFn: () => sharedApi.get(token), retry: false, staleTime: 5 * 60_000 });
  const [pdf, setPdf] = useState<"en" | "hi" | null>(null);
  const data = query.data?.study;
  const colorOf = useMemo(() => {
    const map = new Map((data?.sites ?? []).map((s, i) => [s.domain, SITE_COLORS[i % SITE_COLORS.length]!]));
    return (d: string) => map.get(d) ?? "#94A3B8";
  }, [data?.sites]);

  const download = async (lang: "en" | "hi") => {
    setPdf(lang);
    if (lang === "hi") toast.info("Preparing the Hindi report. The first time can take about a minute.");
    try {
      const { blob, fileName } = await sharedApi.pdf(token, lang);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The PDF could not be downloaded");
    } finally {
      setPdf(null);
    }
  };

  if (query.isLoading) return <div className="mx-auto max-w-[1400px] p-4"><SkeletonBlock lines={12} /></div>;
  if (query.error || !query.data || !data) {
    const status = (query.error as { status?: number } | null)?.status;
    return status === 410 ? (
      <Problem title="This link has expired" body="The link was switched off or reached its end date. Ask the person who sent it for a new one." />
    ) : status === 404 ? (
      <Problem title="This link is not valid" body="Check that the whole link was copied, or ask the person who sent it for a new one." />
    ) : (
      <Problem title="The report could not be opened" body={query.error instanceof Error ? query.error.message : "Please try again in a moment."} />
    );
  }

  const { share } = query.data;
  const own = data.sites[0]!;
  const ownLabel = own.name || own.domain;
  const report = data.report;

  return (
    <SiteNamesProvider sites={data.sites}>
      <div className="min-h-dvh bg-[#F5F7FB]">
        <div className="mx-auto w-full max-w-[1400px] min-w-0 space-y-1 p-3 capitalize sm:p-4">
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-[#E6EBF4] bg-white p-3 sm:flex-row sm:flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6B7A94]">Competitor report{share.preparedBy ? <span className="normal-case tracking-normal"> · prepared by {share.preparedBy}</span> : null}</p>
              <h1 className="mt-1 flex min-w-0 items-center gap-2 text-[18px] font-semibold tracking-[-0.01em] text-[#111C3A]">
                <Swords className="size-5 shrink-0 text-[#7C3AED]" />
                <span className="normal-case [overflow-wrap:anywhere]">{ownLabel} vs {data.sites.length - 1} competitor{data.sites.length === 2 ? "" : "s"}</span>
              </h1>
              <p className="mt-0.5 text-[11px] text-[#6B7A94]">
                {report ? `Checked ${formatDateTime(report.finishedAt ?? report.startedAt)}` : "No check yet"} · this link works until {formatDate(share.expiresAt)}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <WButton icon={pdf === "en" ? Loader2 : FileDown} disabled={!report || pdf !== null} onClick={() => void download("en")} tone={share.lang === "en" ? "primary" : undefined}>
                {pdf === "en" ? "Preparing PDF…" : "Download PDF"}
              </WButton>
              <WButton icon={pdf === "hi" ? Loader2 : Languages} disabled={!report || pdf !== null} onClick={() => void download("hi")} tone={share.lang === "hi" ? "primary" : undefined}>
                {pdf === "hi" ? "हिंदी PDF बन रही है…" : "हिंदी PDF"}
              </WButton>
            </div>
          </div>

          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
            {data.sites.map((s) => (
              <span key={s.domain} className={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]", s.role === "own" ? "border-[#2563EB] bg-[#EFF4FC]" : "border-[#E6EBF4] bg-white")}>
                <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={s.role === "own"} />
              </span>
            ))}
          </div>

          {report ? (
            <ReportBody data={data} colorOf={colorOf} shared />
          ) : (
            <p className="flex items-start gap-2 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-3 text-[12px] text-[#92400E]"><CircleAlert className="mt-0.5 size-4 shrink-0" />The report is not ready yet. Please open the link again later.</p>
          )}
        </div>
      </div>
    </SiteNamesProvider>
  );
}
