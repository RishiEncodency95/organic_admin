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
      className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#f8edda] px-4 py-4 text-[#2A211B] sm:px-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/login-background.png')] bg-cover bg-left bg-no-repeat" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-[#fffaf0]/55" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1100px] items-center gap-8 lg:min-h-[calc(100vh-96px)] lg:grid-cols-[.78fr_1.22fr] xl:gap-12">
        <aside className="hidden w-full max-w-[280px] justify-self-center self-center rounded-2xl border border-white/35 bg-white/55 p-4 text-center shadow-[0_12px_40px_rgba(79,52,24,.08)] backdrop-blur-[3px] lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bharat-organic-logo.png" alt="Bharat Organic" className="mx-auto h-[92px] w-[92px] object-contain drop-shadow-[0_8px_18px_rgba(94,61,25,.16)]" />
          <div className="mx-auto mt-2.5 h-px w-28 bg-gradient-to-r from-transparent via-[#B77A20] to-transparent" />
          <h2 className="mt-1.5 font-serif text-[24px] font-semibold leading-[1.12] tracking-[-.025em] text-[#0D555A]">Protected system records</h2>
          <p className="mx-auto mt-2 max-w-[240px] text-[11px] font-medium leading-[1.45] text-[#554331]">Only verified team members can open infrastructure and renewal information.</p>
        </aside>

        <div className="w-full min-w-0 max-w-[650px] justify-self-end">
          <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[23px] font-semibold leading-tight tracking-[-.03em] text-[#231A14]">
                System &amp; Security
              </h1>
              <p className="mt-0.5 text-[11.5px] leading-5 text-[#7C7267]">
                Protected service and infrastructure records
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4D9C6] bg-[#FBF6EC] px-3 py-1.5 text-[11.5px] font-semibold text-[#7A5C31]">
              <ShieldCheck size={14} strokeWidth={2.2} />
              Verification required
            </span>
          </header>

          <section className="overflow-hidden rounded-[20px] border border-white/80 bg-white/95 shadow-[0_18px_55px_-22px_rgba(72,49,26,.28)] backdrop-blur-sm">
            <div className="h-[3px] w-full bg-gradient-to-r from-[#C9A96A] via-[#8B6A3E] to-[#C9A96A]" />

            <div className="flex flex-wrap items-start gap-3 border-b border-[#F0EBE2] px-5 py-3.5 sm:px-6">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#E9DCC4] bg-[#FBF4E8] text-[#8B6A3E]">
                <LockKeyhole size={17} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-semibold tracking-[-.015em] text-[#231A14]">
                  Verify before opening this page
                </h2>
                <p className="mt-1 max-w-[52ch] text-[12.5px] leading-5 text-[#7C7267]">
                  Enter the current Microsoft Authenticator code for every person listed below.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#F0E6D2] bg-[#FDFAF3] px-2.5 py-1.5 text-[11px] font-semibold text-[#8B6A3E]">
                <Clock3 size={13} strokeWidth={2.2} />
                Access lasts 10 min
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {checking ? (
                <div className="grid min-h-[240px] place-items-center">
                  <div className="text-center">
                    <span className="mx-auto block size-7 animate-spin rounded-full border-[3px] border-[#EFE7D9] border-t-[#8B6A3E]" />
                    <p className="mt-3 text-[12.5px] font-medium text-[#8A8076]">Checking secure access…</p>
                  </div>
                </div>
              ) : requirements?.requester ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <p className="text-[12.5px] font-medium text-[#6E6459]">
                      {readyCount} of {roles.length} codes entered
                    </p>
                    <div className="flex flex-1 gap-1.5">
                      {roles.map((role) => (
                        <span
                          key={role}
                          className={`h-1 flex-1 rounded-full transition-colors ${isRowReady(role) ? "bg-[#8B6A3E]" : "bg-[#EDE6DA]"}`}
                        />
                      ))}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {roles.map((role) => {
                      const self = role === "self";
                      const people = self ? [] : requirements.approvers.filter((person) => person.roleSlug === role);
                      const ready = isRowReady(role);
                      const missingApprover = !self && people.length === 0;
                      const title = roleTitle(role);

                      return (
                        <li
                          key={role}
                          className={`rounded-xl border p-3 transition-colors ${missingApprover
                            ? "border-[#F0D6D2] bg-[#FEF7F6]"
                            : ready
                              ? "border-[#DCCFB6] bg-[#FDFAF4]"
                              : "border-[#EAE3D8] bg-white"
                            }`}
                        >
                          <div className="flex gap-3">
                            <span
                              aria-hidden
                              className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors ${ready
                                ? "border-[#8B6A3E] bg-[#8B6A3E] text-white"
                                : "border-[#DED5C6] bg-[#F7F3EB] text-[#B4A894]"
                                }`}
                            >
                              {ready ? <Check size={13} strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
                            </span>

                            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-end">
                              <div className="min-w-0">
                                <p className="text-[12.5px] font-semibold text-[#332821]">
                                  {title} <span className="text-[#C2544A]">*</span>
                                </p>
                                <p className="mb-1.5 mt-0 text-[10.5px] text-[#8A8076]">
                                  {self ? "Signed in as you" : `Any available ${role.replace("_", " ")}`}
                                </p>

                                {self ? (
                                  <div className="flex min-h-9 min-w-0 items-center gap-2 rounded-lg border border-[#EAE3D8] bg-[#FBF9F5] px-3">
                                    <UserCheck size={15} className="shrink-0 text-[#5C8A63]" />
                                    <span className="truncate text-[12.5px] font-medium text-[#332821]">
                                      {requirements.requester!.name}
                                    </span>
                                    <span className="ml-auto hidden truncate text-[11px] text-[#9A9086] md:block">
                                      {requirements.requester!.email}
                                    </span>
                                  </div>
                                ) : (
                                  <select
                                    value={selectedUsers[role] || ""}
                                    onChange={(event) => setSelectedUsers((old) => ({ ...old, [role]: event.target.value }))}
                                    disabled={missingApprover}
                                    aria-label={`${title} approver`}
                                    className="min-h-9 w-full min-w-0 rounded-lg border border-[#E2DACD] bg-white px-3 text-[12px] font-medium text-[#332821] outline-none transition focus:border-[#8B6A3E] focus:ring-4 focus:ring-[#F3E9D8] disabled:cursor-not-allowed disabled:bg-[#F6F3ED] disabled:text-[#A79D91]"
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
                                  size={15}
                                  className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${ready ? "text-[#8B6A3E]" : "text-[#B4A894]"}`}
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
                                  className="min-h-9 w-full rounded-lg border border-[#E2DACD] bg-white pl-9 pr-3 text-center font-mono text-[14px] font-semibold tracking-[.24em] text-[#332821] outline-none transition placeholder:font-normal placeholder:tracking-[.18em] placeholder:text-[#CFC6B8] focus:border-[#8B6A3E] focus:ring-4 focus:ring-[#F3E9D8] disabled:cursor-not-allowed disabled:bg-[#F6F3ED]"
                                />
                              </div>
                            </div>
                          </div>

                          {missingApprover && (
                            <p className="mt-3 pl-9 text-[12px] font-medium text-[#B8433A]">
                              No {role.replace("_", " ")} is available right now, so this page stays locked. Ask an
                              administrator to assign one.
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {twoFactorMissing && (
                    <p className="rounded-xl border border-[#F0D6D2] bg-[#FEF7F6] p-3 text-[12.5px] font-medium text-[#B8433A]">
                      Turn on Microsoft Authenticator for your account before you can verify here.
                    </p>
                  )}

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl border border-[#F0D6D2] bg-[#FEF7F6] p-3 text-[12.5px] font-medium text-[#B8433A]"
                    >
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col-reverse items-center justify-between gap-2 border-t border-[#F0EBE2] pt-3 sm:flex-row">
                    <p className="flex items-center gap-1.5 text-[11.5px] text-[#9A9086]">
                      <ShieldCheck size={13} />
                      Codes are checked once and never stored.
                    </p>
                    <button
                      onClick={verify}
                      disabled={submitting || !canSubmit}
                      className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#8B6A3E] px-5 text-[12px] font-semibold text-white shadow-[0_1px_2px_rgba(42,33,27,.12)] transition hover:bg-[#74542D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B6A3E] disabled:cursor-not-allowed disabled:bg-[#CFC2AC] disabled:shadow-none sm:w-auto"
                    >
                      <LockKeyhole size={15} strokeWidth={2.2} />
                      {submitting ? "Verifying…" : "Verify and open page"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid min-h-[240px] place-items-center text-center">
                  <p className="max-w-sm rounded-xl border border-[#F0D6D2] bg-[#FEF7F6] p-4 text-[12.5px] font-medium text-[#B8433A]">
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
