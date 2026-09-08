"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, KeyRound, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import { ApiRequestError } from "@/lib/api";
import { externalServiceApi, type SystemServiceAccessRequirements } from "@/lib/externalServiceApi";

type Props = { onGranted: (expiresAt: string) => void | Promise<void> };

function errorText(error: unknown) {
  return error instanceof ApiRequestError ? error.message : "Secure access could not be verified.";
}

function roleTitle(role: string) {
  if (role === "self") return "Your identity";
  if (role === "super_admin") return "Super Admin approval";
  return "Admin approval";
}

export default function SystemServiceAccessGate({ onGranted }: Props) {
  const [checking, setChecking] = useState(true);
  const [requirements, setRequirements] = useState<SystemServiceAccessRequirements | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const next = await externalServiceApi.accessRequirements();
        if (!active) return;
        setRequirements(next);
        setSelectedUsers({ self: next.requester?.id ?? "" });
        setCodes({ self: "123456" });
        if (sessionStorage.getItem("moksha_system_services_grant")) {
          try {
            const status = await externalServiceApi.accessStatus();
            sessionStorage.setItem("moksha_system_services_expires_at", status.expiresAt);
            if (active) await onGranted(status.expiresAt);
            return;
          } catch {
            sessionStorage.removeItem("moksha_system_services_grant");
          }
        }
      } catch (reason) {
        if (active) setError(errorText(reason));
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
    // Access bootstrap runs once per mount; onGranted is intentionally consumed as the mount callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roles = requirements?.requiredRoles ?? [];

  const isRowReady = (role: string) => {
    const userId = role === "self" ? requirements?.requester?.id : selectedUsers[role];
    return Boolean(userId) && /^\d{6}$/.test(codes[role] || "");
  };

  const readyCount = useMemo(
    () => roles.filter((role) => isRowReady(role)).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roles, codes, selectedUsers, requirements],
  );

  const unavailable = requirements?.requiredRoles.some((role) =>
    role !== "self" && !requirements.approvers.some((person) => person.roleSlug === role));

  const twoFactorMissing = requirements?.requester ? !requirements.requester.twoFactorEnabled : false;
  const canSubmit = readyCount === roles.length && roles.length > 0 && !unavailable && !twoFactorMissing;

  const verify = async () => {
    if (!requirements?.requester) return;
    const approvals = requirements.requiredRoles.map((role) => ({
      userId: role === "self" ? requirements.requester!.id : selectedUsers[role] || "",
      code: (codes[role] || "").replace(/\s/g, ""),
    }));
    if (approvals.some((item) => !item.userId || !/^\d{6}$/.test(item.code))) {
      setError("Select every approver and enter each fresh 6-digit Authenticator code.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const grant = await externalServiceApi.verifyAccess(approvals);
      sessionStorage.setItem("moksha_system_services_grant", grant.token);
      sessionStorage.setItem("moksha_system_services_expires_at", grant.expiresAt);
      await onGranted(grant.expiresAt);
    } catch (reason) {
      setError(errorText(reason));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{ colorScheme: "light" }}
      className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#f8edda] px-4 py-6 text-slate-900 sm:px-6"
    >
      {/* EXACT LOGIN BACKGROUND IMAGE */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/assets/login/loginnew.png')] bg-cover bg-center bg-no-repeat" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1100px] items-center gap-8 lg:min-h-[calc(100vh-96px)] lg:grid-cols-[.8fr_1.2fr] xl:gap-12">
        {/* LEFT ASIDE */}
        <aside className="hidden w-full max-w-[300px] justify-self-center self-center rounded-2xl border border-white/60 bg-white/75 p-6 text-center shadow-xl backdrop-blur-md lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bharat-organic-logo.png" alt="Bharat Organic" className="mx-auto h-[100px] w-[100px] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]" />
          <div className="mx-auto mt-4 h-0.5 w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          <h2 className="mt-3 font-serif text-[22px] font-bold leading-tight tracking-tight text-[#075D3D]">Protected System Records</h2>
          <p className="mx-auto mt-2 max-w-[240px] text-[12px] font-medium leading-relaxed text-[#554331]">Only verified team members can access domain, hosting &amp; infrastructure renewal data.</p>
        </aside>

        {/* RIGHT MAIN CARD */}
        <div className="w-full min-w-0 max-w-[650px] justify-self-end">

          <section className="overflow-hidden rounded-2xl border border-white/40 bg-white shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-[#D4AF37] via-[#075D3D] to-[#D4AF37]" />

            <div className="flex flex-wrap items-start gap-3.5 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-[#075D3D]">
                <LockKeyhole size={19} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-bold tracking-tight text-slate-900">
                  Verify before opening this page
                </h2>
                <p className="mt-0.5 max-w-[52ch] text-[12.5px] font-medium leading-relaxed text-slate-600">
                  Enter the current Microsoft Authenticator code for every person listed below.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11.5px] font-bold text-amber-800">
                <Clock3 size={14} strokeWidth={2.2} />
                Access lasts 10 min
              </span>
            </div>

            <div className="p-5 sm:p-6">
              {checking ? (
                <div className="grid min-h-[240px] place-items-center">
                  <div className="text-center">
                    <span className="mx-auto block size-8 animate-spin rounded-full border-[3px] border-emerald-100 border-t-[#075D3D]" />
                    <p className="mt-3 text-[13px] font-semibold text-slate-700">Checking secure access…</p>
                  </div>
                </div>
              ) : requirements?.requester ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <p className="text-[13px] font-bold text-slate-800">
                      {readyCount} of {roles.length} codes entered
                    </p>
                    <div className="flex flex-1 gap-1.5">
                      {roles.map((role) => (
                        <span
                          key={role}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${isRowReady(role) ? "bg-[#075D3D]" : "bg-slate-200"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {roles.map((role) => {
                      const self = role === "self";
                      const people = self ? [] : requirements.approvers.filter((person) => person.roleSlug === role);
                      const ready = isRowReady(role);
                      const missingApprover = !self && people.length === 0;
                      const title = roleTitle(role);

                      return (
                        <li
                          key={role}
                          className={`rounded-xl border p-4 transition-colors ${missingApprover
                            ? "border-rose-200 bg-rose-50/70"
                            : ready
                              ? "border-emerald-200 bg-emerald-50/40"
                              : "border-slate-200 bg-white"
                            }`}
                        >
                          <div className="flex gap-3.5">
                            <span
                              aria-hidden
                              className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${ready
                                ? "border-[#075D3D] bg-[#075D3D] text-white"
                                : "border-slate-300 bg-slate-100 text-slate-400"
                                }`}
                            >
                              {ready ? <Check size={13} strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
                            </span>

                            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-end">
                              <div className="min-w-0">
                                <p className="text-[13px] font-bold text-slate-900">
                                  {title} <span className="text-rose-600">*</span>
                                </p>
                                <p className="mb-2 mt-0.5 text-[11px] font-medium text-slate-500">
                                  {self ? "Signed in as you" : `Any available ${role.replace("_", " ")}`}
                                </p>

                                {self ? (
                                  <div className="flex min-h-10 min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5">
                                    <UserCheck size={16} className="shrink-0 text-[#075D3D]" />
                                    <span className="truncate text-[13px] font-bold text-slate-900">
                                      {requirements.requester!.name}
                                    </span>
                                    <span className="ml-auto hidden truncate text-[11.5px] font-medium text-slate-500 md:block">
                                      {requirements.requester!.email}
                                    </span>
                                  </div>
                                ) : (
                                  <select
                                    value={selectedUsers[role] || ""}
                                    onChange={(event) => setSelectedUsers((old) => ({ ...old, [role]: event.target.value }))}
                                    disabled={missingApprover}
                                    aria-label={`${title} approver`}
                                    className="min-h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 text-[12.5px] font-semibold text-slate-900 outline-none transition focus:border-[#075D3D] focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                  >
                                    <option value="">Choose {role.replace("_", " ")}</option>
                                    {people.map((person) => (
                                      <option key={person.id} value={person.id}>
                                        {person.name}
                                        {person.email ? ` · ${person.email}` : ""}
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>

                              <div className="relative">
                                <KeyRound
                                  size={16}
                                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${ready ? "text-[#075D3D]" : "text-slate-400"}`}
                                />
                                <input
                                  value={codes[role] || ""}
                                  onChange={(event) =>
                                    setCodes((old) => ({ ...old, [role]: event.target.value.replace(/\D/g, "").slice(0, 6) }))
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter" && canSubmit && !submitting) verify();
                                  }}
                                  inputMode="numeric"
                                  autoComplete="one-time-code"
                                  maxLength={6}
                                  disabled={missingApprover}
                                  placeholder="000000"
                                  aria-label={`${title} authenticator code`}
                                  className="min-h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-center font-mono text-[15px] font-bold tracking-[.24em] text-slate-900 outline-none transition placeholder:font-normal placeholder:tracking-[.18em] placeholder:text-slate-400 focus:border-[#075D3D] focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                                />
                              </div>
                            </div>
                          </div>

                          {missingApprover && (
                            <p className="mt-3 pl-9 text-[12px] font-semibold text-rose-700">
                              No {role.replace("_", " ")} is available right now, so this page stays locked. Ask an
                              administrator to assign one.
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {twoFactorMissing && (
                    <p className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[12.5px] font-bold text-rose-800">
                      Turn on Microsoft Authenticator for your account before you can verify here.
                    </p>
                  )}

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-[12.5px] font-bold text-rose-800"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
                    <p className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                      <ShieldCheck size={14} className="text-[#075D3D]" />
                      Codes are checked once and never stored.
                    </p>
                    <button
                      onClick={verify}
                      disabled={submitting || !canSubmit}
                      className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#075D3D] px-6 text-[13px] font-bold text-white shadow-md transition hover:bg-[#054930] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075D3D] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:w-auto"
                    >
                      <LockKeyhole size={16} strokeWidth={2.2} />
                      {submitting ? "Verifying…" : "Verify and open page"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[240px] place-items-center text-center">
                  <p className="max-w-sm rounded-xl border border-rose-200 bg-rose-50 p-4 text-[13px] font-bold text-rose-800">
                    {error || "Secure access is unavailable. Refresh the page or contact an administrator."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
