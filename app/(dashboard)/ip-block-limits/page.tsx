"use client";

import { useEffect, useState } from "react";
import { Ban, Globe2, RefreshCw, Save, Search, ShieldCheck, ShieldHalf, Zap, type LucideIcon } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Pager from "@/components/ui/Pager";
import { kpiToneClass, type KpiStatCardItem } from "@/components/ui/KpiStatCards";
import { ApiRequestError } from "@/lib/api";
import { apiLimitsApi, type ApiBlockRow, type ApiLimitsData } from "@/lib/apiLimitsApi";
import typography from "@/app/(dashboard)/pages/PagesTypography.module.css";

/*
 * IP Block Limits. Every protected website API (resume upload, enquiries, registrations,
 * OTPs, chatbot lead) allows an IP `maxAttempts` accepted requests in `blockHours`; the next
 * one blocks that IP on that API for `blockHours`. The backend enforces it (apiBlockGuard);
 * this page sets the limits and lists which IP was blocked on which API.
 */

const PAGE_SIZE = 15;
const HOUR_PRESETS = [1, 6, 12, 24, 48, 72];

type RuleForm = { enabled: boolean; maxAttempts: string; blockHours: string };
type BlockTab = "Blocked" | "all";

const inputClass =
  "h-[28px] w-full rounded-[5px] border border-[#e5e6e2] bg-white px-[8px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]";
const th = "overflow-hidden truncate px-[6px] py-[5px] text-[7px] font-bold uppercase text-white";

const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

/** "5 h 20 m left" until a block ends */
const timeLeft = (iso: string) => {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "ending now";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.round((ms % 3_600_000) / 60_000);
  return h ? `${h} h ${m} m left` : `${m} m left`;
};

const validRule = (r: RuleForm) => {
  const a = Number(r.maxAttempts);
  const h = Number(r.blockHours);
  return Number.isInteger(a) && a >= 1 && a <= 1000 && Number.isInteger(h) && h >= 1 && h <= 720;
};

const STATUS_TONE: Record<ApiBlockRow["status"], string> = {
  Blocked: "bg-rose-50 text-rose-700",
  Expired: "bg-slate-100 text-slate-600",
  Unblocked: "bg-emerald-50 text-emerald-700",
};

export default function IpBlockLimitsPage() {
  const [data, setData] = useState<ApiLimitsData | null>(null);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [loadedTick, setLoadedTick] = useState(-1);
  const loading = loadedTick !== reloadTick;

  // Editable copy of every rule, keyed by API; filled by the first load
  const [forms, setForms] = useState<Record<string, RuleForm> | null>(null);
  const [allHours, setAllHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const [tab, setTab] = useState<BlockTab>("Blocked");
  const [apiFilter, setApiFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pendingUnblock, setPendingUnblock] = useState<ApiBlockRow | null>(null);
  const [unblocking, setUnblocking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiLimitsApi
      .get()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError("");
        setForms(
          (f) =>
            f ??
            Object.fromEntries(result.rules.map((r) => [r.key, { enabled: r.enabled, maxAttempts: String(r.maxAttempts), blockHours: String(r.blockHours) }]))
        );
      })
      .catch((err) => !cancelled && setError(errorText(err, "Could not load the IP block limits.")))
      .finally(() => !cancelled && setLoadedTick(reloadTick));
    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const rules = data?.rules ?? [];
  const setRule = (key: string, patch: Partial<RuleForm>) => setForms((f) => (f ? { ...f, [key]: { ...f[key], ...patch } } : f));
  const changed = rules.filter((r) => {
    const f = forms?.[r.key];
    return f && (f.enabled !== r.enabled || Number(f.maxAttempts) !== r.maxAttempts || Number(f.blockHours) !== r.blockHours);
  });
  const allValid = !!forms && rules.every((r) => validRule(forms[r.key]));

  const save = async () => {
    if (!forms || !allValid || !changed.length) return;
    setSaving(true);
    setError("");
    try {
      await apiLimitsApi.save(
        changed.map((r) => ({ key: r.key, enabled: forms[r.key].enabled, maxAttempts: Number(forms[r.key].maxAttempts), blockHours: Number(forms[r.key].blockHours) }))
      );
      setForms(null); // refilled from the saved values by the reload
      setReloadTick((n) => n + 1);
      flash(`Saved ${changed.length} rule${changed.length === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(errorText(err, "Could not save the limits."));
    } finally {
      setSaving(false);
    }
  };

  const applyHoursToAll = () => {
    const h = Number(allHours);
    if (!Number.isInteger(h) || h < 1 || h > 720) return;
    setForms((f) => (f ? Object.fromEntries(Object.entries(f).map(([k, v]) => [k, { ...v, blockHours: String(h) }])) : f));
  };

  const confirmUnblock = async () => {
    if (!pendingUnblock) return;
    setUnblocking(true);
    try {
      await apiLimitsApi.unblock(pendingUnblock.ip, pendingUnblock.api);
      flash(`${pendingUnblock.ip} is unblocked on ${pendingUnblock.apiLabel}.`);
      setPendingUnblock(null);
      setReloadTick((n) => n + 1);
    } catch (err) {
      setPendingUnblock(null);
      setError(errorText(err, "Could not unblock the IP."));
    } finally {
      setUnblocking(false);
    }
  };

  const term = search.trim().toLowerCase();
  const blocks = (data?.blocks ?? []).filter(
    (b) => (tab === "all" || b.status === "Blocked") && (!apiFilter || b.api === apiFilter) && (!term || b.ip.toLowerCase().includes(term) || b.apiLabel.toLowerCase().includes(term))
  );
  const pages = Math.max(1, Math.ceil(blocks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const first = (currentPage - 1) * PAGE_SIZE;
  const pageRows = blocks.slice(first, first + PAGE_SIZE);

  const stats = data?.stats;
  const card = (title: string, value: number | undefined, icon: LucideIcon, tone: KpiStatCardItem["tone"], colors: [string, string], footer: string, onClick: () => void): KpiStatCardItem => ({
    title,
    value: value ?? 0,
    icon,
    tone,
    gradient: `linear-gradient(135deg, #ffffff 0%, #ffffff 42%, ${colors[0]} 100%)`,
    borderColor: colors[0],
    numColor: colors[1],
    footer,
    onClick,
  });
  const cards: KpiStatCardItem[] = [
    card("Blocked Now", stats?.blockedNow, Ban, "rose", ["#fecdd3", "#be123c"], stats?.blockedNow ? "Show them" : "No one blocked", () => {
      setTab("Blocked");
      setPage(1);
    }),
    card("Blocks (30 days)", stats?.blocks30d, ShieldHalf, "amber", ["#fed7aa", "#c2410c"], "Full history", () => {
      setTab("all");
      setPage(1);
    }),
    card("Attempts Today", stats?.attemptsToday, Zap, "blue", ["#bae6fd", "#0284c7"], "On protected APIs", () => {}),
    card("IPs (7 days)", stats?.ips7d, Globe2, "emerald", ["#bbf7d0", "#15803d"], stats ? `${stats.protectedOn}/${stats.protectedTotal} APIs protected` : "", () => {}),
  ];

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white px-[18px] pb-[16px] pt-[14px] text-[#18233b]`}>
      <div className="mb-[10px] grid grid-cols-2 gap-[8px] xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={item.onClick}
              title={item.footer}
              className="flex h-[52px] items-center gap-[8px] rounded-[9px] border px-[10px] text-left transition-all hover:-translate-y-px"
              style={{ background: item.gradient, borderColor: item.borderColor, boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
            >
              <span className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-white/80 ring-1 ${kpiToneClass[item.tone]}`}>
                <Icon className="h-[12px] w-[12px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.2px] font-semibold leading-tight text-[#0f172a]">{item.title}</span>
                <span className="mt-[2px] flex items-baseline gap-[6px]">
                  <span className="text-[15px] font-bold leading-none tracking-[-0.03em]" style={{ color: item.numColor }}>
                    {stats ? item.value : "–"}
                  </span>
                  <span className="truncate text-[9.8px] font-medium leading-none text-[#64748b]">{item.footer}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* RULES */}
      <div className="mb-[10px] flex min-w-0 flex-col overflow-hidden border border-[#e8e5df] bg-white">
        <div className="flex flex-wrap items-center gap-[10px] border-b border-[#f0f0ec] px-[16px] py-[10px]">
          <div className="min-w-[240px] flex-1">
            <h2 className="text-[11.5px] font-bold text-[#263148]">Limits per API</h2>
            <p className="mt-[2px] text-[9px] font-medium leading-snug text-[#6c7587]">
              After the set number of attempts from one IP, that IP is blocked on that API for the set hours. Only accepted requests count.
            </p>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="text-[9px] font-semibold text-[#6c7587]">Block time for all:</span>
            <input type="number" min={1} max={720} value={allHours} onChange={(e) => setAllHours(e.target.value)} placeholder="hours" className={`${inputClass} w-[70px]`} />
            <button
              type="button"
              onClick={applyHoursToAll}
              disabled={!forms || !allHours}
              className="h-[28px] rounded-[5px] border border-[#e5e6e2] bg-white px-[10px] text-[9.5px] font-semibold text-[#414b5e] hover:bg-slate-50 disabled:opacity-40"
            >
              Apply
            </button>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!changed.length || !allValid || saving}
            className="flex h-[30px] items-center gap-[5px] rounded-[5px] border border-[#233D4D] bg-[#233D4D] px-[12px] text-[9.5px] font-semibold text-white hover:bg-[#1b3140] disabled:opacity-40"
          >
            <Save className="h-[11px] w-[11px]" /> {saving ? "Saving…" : changed.length ? `Save (${changed.length})` : "Save"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed border-collapse text-left">
            <thead>
              <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                <th className={`${th} w-[230px] pl-[14px]`}>API</th>
                <th className={`${th} w-[80px]`}>Limit</th>
                <th className={`${th} w-[100px]`}>Attempts / IP</th>
                <th className={th}>Block For (Hours)</th>
                <th className={`${th} w-[100px]`}>Attempts Today</th>
                <th className={`${th} w-[100px] pr-[14px]`}>Blocked Now</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec]">
              {loading && !data ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[10px] text-[#6c7587]">
                    Loading…
                  </td>
                </tr>
              ) : (
                rules.map((r) => {
                  const f = forms?.[r.key];
                  if (!f) return null;
                  const ok = validRule(f);
                  return (
                    <tr key={r.key} className={`align-middle ${f.enabled ? "" : "bg-slate-50/60"}`}>
                      <td className="py-[7px] pl-[14px] pr-[6px]">
                        <span className="block truncate text-[8.5px] font-bold text-[#4B1426]">{r.label}</span>
                        <span className="block truncate font-mono text-[7px] text-[#9aa0aa]" title={r.path}>
                          {r.path}
                        </span>
                      </td>
                      <td className="px-[6px] py-[7px]">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={f.enabled}
                          aria-label={`${r.label} limit`}
                          onClick={() => setRule(r.key, { enabled: !f.enabled })}
                          className={`relative h-[18px] w-[32px] rounded-full transition-colors ${f.enabled ? "bg-[#166b40]" : "bg-[#cbd5e1]"}`}
                        >
                          <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all ${f.enabled ? "left-[16px]" : "left-[2px]"}`} />
                        </button>
                      </td>
                      <td className="px-[6px] py-[7px]">
                        <input
                          type="number"
                          min={1}
                          max={1000}
                          value={f.maxAttempts}
                          disabled={!f.enabled}
                          onChange={(e) => setRule(r.key, { maxAttempts: e.target.value })}
                          className={`${inputClass} w-[70px] ${ok ? "" : "border-rose-300"}`}
                        />
                      </td>
                      <td className="px-[6px] py-[7px]">
                        <div className="flex items-center gap-[4px]">
                          <input
                            type="number"
                            min={1}
                            max={720}
                            value={f.blockHours}
                            disabled={!f.enabled}
                            onChange={(e) => setRule(r.key, { blockHours: e.target.value })}
                            className={`${inputClass} w-[64px] ${ok ? "" : "border-rose-300"}`}
                          />
                          {HOUR_PRESETS.map((h) => (
                            <button
                              key={h}
                              type="button"
                              disabled={!f.enabled}
                              onClick={() => setRule(r.key, { blockHours: String(h) })}
                              className={`h-[22px] rounded-[4px] border px-[6px] text-[7.5px] font-bold transition disabled:opacity-40 ${
                                Number(f.blockHours) === h ? "border-[#166b40] bg-[#166b40] text-white" : "border-[#e5e6e2] bg-white text-[#414b5e] hover:bg-slate-50"
                              }`}
                            >
                              {h < 24 ? `${h}h` : `${h / 24}d`}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-[6px] py-[7px] text-[8px] font-semibold text-[#334155]">{r.attemptsToday}</td>
                      <td className="py-[7px] pl-[6px] pr-[14px]">
                        {r.blockedNow ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTab("Blocked");
                              setApiFilter(r.key);
                              setPage(1);
                            }}
                            className="inline-flex h-[20px] items-center rounded-[4px] bg-rose-50 px-[6px] text-[7px] font-bold text-rose-700 hover:underline"
                          >
                            {r.blockedNow} blocked
                          </button>
                        ) : (
                          <span className="text-[7.5px] text-[#9aa0aa]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {(notice || error || (forms && !allValid)) && (
          <div className="border-t border-[#f0f0ec] px-[16px] py-[7px] text-[9px] font-semibold">
            {notice && (
              <p className="flex items-center gap-[5px] text-[#166b40]">
                <ShieldCheck className="h-[11px] w-[11px]" /> {notice}
              </p>
            )}
            {forms && !allValid && <p className="text-rose-700">Attempts must be 1–1000 and block time 1–720 hours (whole numbers).</p>}
            {error && <p className="text-red-600">{error}</p>}
          </div>
        )}
      </div>

      {/* BLOCKED IPs */}
      <div className="flex min-w-0 flex-col overflow-hidden border border-[#e8e5df] bg-white">
        <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[4px] border-b border-[#e8e5df] px-[16px] pt-[11px]">
          {(
            [
              ["Blocked", `Blocked Now (${stats?.blockedNow ?? 0})`],
              ["all", `Block History – 30 days (${stats?.blocks30d ?? 0})`],
            ] as [BlockTab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                setPage(1);
              }}
              className={`relative pb-[9px] text-[10px] font-bold transition-colors ${tab === key ? "text-[#166b40]" : "text-[#6c7587] hover:text-[#18233b]"}`}
            >
              {label}
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#166b40]" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-[8px] border-b border-[#f0f0ec] px-[16px] py-[10px]">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search IP address or API…"
              className={`${inputClass} h-[30px] pl-[26px]`}
            />
          </div>
          <select
            value={apiFilter}
            onChange={(e) => {
              setApiFilter(e.target.value);
              setPage(1);
            }}
            aria-label="API"
            className={`${inputClass} h-[30px] w-auto max-w-[220px] cursor-pointer`}
          >
            <option value="">All APIs</option>
            {rules.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setReloadTick((n) => n + 1)}
            className="flex h-[30px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-[5px] border border-[#e5e6e2] bg-white px-[10px] text-[9.5px] font-semibold text-[#414b5e] hover:bg-slate-50"
          >
            <RefreshCw className={`h-[11px] w-[11px] ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed border-collapse text-left">
            <thead>
              <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                <th className={`${th} w-[140px] pl-[14px]`}>IP Address</th>
                <th className={th}>API</th>
                <th className={`${th} w-[80px]`}>Attempts</th>
                <th className={`${th} w-[120px]`}>Blocked At</th>
                <th className={`${th} w-[120px]`}>Blocked Until</th>
                <th className={`${th} w-[150px]`}>Status</th>
                <th className={`${th} w-[100px] pr-[14px] text-right`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec]">
              {loading && !data ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[10px] text-[#6c7587]">
                    Loading…
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[10px] text-[#6c7587]">
                    {tab === "Blocked" ? "No IP is blocked right now." : "No IP was blocked in the last 30 days."}
                  </td>
                </tr>
              ) : (
                pageRows.map((b) => (
                  <tr key={b.id} className={`align-middle transition hover:bg-slate-50/80 ${loading ? "opacity-60" : ""}`}>
                    <td className="truncate py-[8px] pl-[14px] pr-[6px] font-mono text-[8px] font-semibold text-[#334155]">{b.ip}</td>
                    <td className="px-[6px] py-[8px]">
                      <span className="block truncate text-[8.5px] font-bold text-[#4B1426]">{b.apiLabel}</span>
                      <span className="block truncate font-mono text-[7px] text-[#9aa0aa]">{b.path}</span>
                    </td>
                    <td className="px-[6px] py-[8px] text-[8px] font-semibold text-[#334155]">{b.attempts}</td>
                    <td className="px-[6px] py-[8px]">
                      <span className="block truncate text-[8px] font-semibold text-[#334155]">{formatDate(b.blockedAt)}</span>
                      <span className="block truncate text-[7px] font-medium text-[#9aa0aa]">{formatTime(b.blockedAt)}</span>
                    </td>
                    <td className="px-[6px] py-[8px]">
                      <span className="block truncate text-[8px] font-semibold text-[#334155]">{formatDate(b.blockedUntil)}</span>
                      <span className="block truncate text-[7px] font-medium text-[#9aa0aa]">{formatTime(b.blockedUntil)}</span>
                    </td>
                    <td className="px-[6px] py-[8px]">
                      <span className={`inline-flex h-[20px] items-center rounded-[4px] px-[6px] text-[7px] font-bold ${STATUS_TONE[b.status]}`}>{b.status}</span>
                      <span className="mt-[2px] block truncate text-[7px] font-medium text-[#9aa0aa]">
                        {b.status === "Blocked" ? timeLeft(b.blockedUntil) : b.status === "Unblocked" ? `by ${b.liftedBy ?? "Admin"}` : "Block ended"}
                      </span>
                    </td>
                    <td className="py-[8px] pl-[6px] pr-[14px]">
                      <div className="flex justify-end">
                        {b.status === "Blocked" && (
                          <button
                            type="button"
                            onClick={() => setPendingUnblock(b)}
                            className="flex h-[25px] items-center rounded-[6px] border border-rose-400/30 bg-rose-500/10 px-[8px] text-[8px] font-bold text-rose-600 transition-all hover:bg-rose-500/20 active:scale-95"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {blocks.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[8px] text-[8px]">
            <span className="font-semibold text-[#5f6a7c]">
              Showing {first + 1} to {Math.min(first + PAGE_SIZE, blocks.length)} of {blocks.length} blocks
            </span>
            <Pager page={currentPage} pages={pages} onPage={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingUnblock !== null}
        onCancel={() => setPendingUnblock(null)}
        onConfirm={confirmUnblock}
        title="Unblock this IP?"
        description={pendingUnblock ? `${pendingUnblock.ip} will be able to use ${pendingUnblock.apiLabel} again right away, and its attempt count starts from zero.` : ""}
        confirmLabel="Unblock"
        loading={unblocking}
      />
    </div>
  );
}
