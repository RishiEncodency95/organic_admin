import type { CapabilityLevel, Connection, DateSource, Money } from "./types";
import type { Tone } from "./lib/support-labels";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
const dateTimeFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" });

/** Dates are shown in UTC on purpose: expiry dates are calendar dates, and the same value must read the same everywhere. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return Number.isNaN(d.getTime()) ? "Not available" : dateFmt.format(d);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "Never";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Never" : dateTimeFmt.format(d);
}

export function formatRelative(value: string | null | undefined): string {
  if (!value) return "Never";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

export function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
  if (amount === null || amount === undefined || !currency) return "Not set";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Different currencies are listed side by side, never added together. */
export function formatMoneyList(list: Money[] | null | undefined): string {
  if (!list || list.length === 0) return "—";
  return list.map((m) => formatMoney(m.amount, m.currency)).join(" · ");
}

export function daysLabel(days: number | null | undefined): string {
  if (days === null || days === undefined) return "Unknown";
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "Today";
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function daysTone(days: number | null | undefined): Tone {
  if (days === null || days === undefined) return "slate";
  if (days < 0) return "red";
  if (days <= 7) return "orange";
  if (days <= 30) return "amber";
  return "green";
}

export function formatRam(mb: number | null): string {
  if (mb === null) return "Not available";
  return mb >= 1024 ? `${+(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}
export function formatStorage(gb: number | null): string {
  if (gb === null) return "Not available";
  return gb >= 1024 ? `${+(gb / 1024).toFixed(1)} TB` : `${gb} GB`;
}

export const ENV_LABEL = { PRODUCTION: "Production", STAGING: "Staging", DEVELOPMENT: "Development", OTHER: "Other" } as const;
export const CYCLE_LABEL = { MONTHLY: "Monthly", QUARTERLY: "Quarterly", HALF_YEARLY: "Half-yearly", YEARLY: "Yearly", CUSTOM: "Custom" } as const;
export const SERVER_TYPE_LABEL: Record<string, string> = { VPS: "VPS", DEDICATED: "Dedicated server", CLOUD_INSTANCE: "Cloud instance", SHARED_HOSTING: "Shared hosting", MANAGED_HOSTING: "Managed hosting", OTHER: "Other" };
export const TRI_LABEL = { ENABLED: "Enabled", DISABLED: "Disabled", UNKNOWN: "Unknown" } as const;
export const PAYMENT_LABEL = { UNKNOWN: "Unknown", PAID: "Paid", UNPAID: "Unpaid", PENDING: "Pending" } as const;
export const KIND_LABEL: Record<string, string> = { DOMAIN_REGISTRATION: "Domain registration", SERVER: "Server", HOSTING: "Hosting", SSL: "SSL certificate", ADDON: "Add-on", OTHER: "Other" };
export const RENEWAL_KIND_LABEL = { payment_due: "Payment due", service_expiry: "Service expiry", domain_expiry: "Domain expiry", ssl_expiry: "SSL expiry" } as const;

export const PROVIDER_NAMES: Record<string, string> = { contabo: "Contabo", hostinger: "Hostinger", digitalocean: "DigitalOcean", aws: "AWS", vultr: "Vultr", hetzner: "Hetzner", linode: "Linode / Akamai", other: "Other / custom", unspecified: "Not specified" };
export const providerName = (key: string | null | undefined) => (key ? PROVIDER_NAMES[key] ?? key : "Not specified");

export const CAPABILITY_LABEL: Record<CapabilityLevel, { label: string; tone: Tone }> = {
  automatic_api: { label: "Automatic API", tone: "green" },
  automatic_public_lookup: { label: "Automatic public lookup", tone: "blue" },
  manual: { label: "Manually managed", tone: "slate" },
  unsupported: { label: "Unsupported", tone: "amber" },
  authentication_required: { label: "Authentication required", tone: "violet" },
};

export const CONNECTION_STATUS: Record<Connection["status"], { label: string; tone: Tone }> = {
  PENDING_CREDENTIALS: { label: "Credentials needed", tone: "amber" },
  CONNECTED: { label: "Connected", tone: "green" },
  AUTH_FAILED: { label: "Authentication failed", tone: "red" },
  ERROR: { label: "Error", tone: "red" },
  DISCONNECTED: { label: "Disconnected", tone: "slate" },
};

export const RDAP_STATE: Record<string, { label: string; tone: Tone; hint: string }> = {
  OK: { label: "Registry data received", tone: "green", hint: "Dates come from the registry's RDAP service." },
  NO_EXPIRY: { label: "No expiry published", tone: "amber", hint: "The registry answered but does not publish an expiration date. Enter it manually if you know it." },
  NOT_FOUND: { label: "Not found in registry", tone: "amber", hint: "The registry has no record of this exact name (not registered, or a subdomain)." },
  UNSUPPORTED: { label: "TLD not supported", tone: "slate", hint: "This TLD has no public RDAP service. Enter dates manually." },
  RESTRICTED: { label: "Restricted by registry", tone: "amber", hint: "The registry does not release this data publicly." },
  RATE_LIMITED: { label: "Registry rate-limited", tone: "amber", hint: "Will be retried automatically." },
  ERROR: { label: "Lookup failed", tone: "red", hint: "The check failed; previously known dates are kept." },
  NEVER: { label: "Not checked yet", tone: "slate", hint: "The first lookup runs shortly after a domain is added." },
};

/** Where an expiry/due date came from: a verified value must never look the same as an estimate. */
export function sourceLabel(source: string | undefined, verified: boolean): { label: string; tone: Tone } {
  switch (source) {
    case "rdap": return { label: "Registry (RDAP)", tone: "green" };
    case "provider_api": return { label: "Provider API", tone: "green" };
    case "tls_probe": return { label: "Live certificate", tone: "green" };
    case "projected": return { label: "Projected, not confirmed", tone: "amber" };
    case "cycle_from_confirmed_payment": return { label: "Calculated from confirmed payment", tone: "blue" };
    case "manual": return verified ? { label: "Entered manually", tone: "blue" } : { label: "Manual estimate, unverified", tone: "amber" };
    default: return { label: "Source unknown", tone: "slate" };
  }
}

export function dateSourceOf(sources: Record<string, DateSource | null> | undefined, field: string) {
  return sources?.[field] ?? null;
}

/** Safe lookup: an unrecognised registry state reads as "not checked yet" instead of crashing. */
export function rdapInfo(state: string | null | undefined): { label: string; tone: Tone; hint: string } {
  return (state ? RDAP_STATE[state] : undefined) ?? { label: "Not checked yet", tone: "slate", hint: "The first lookup runs shortly after a domain is added." };
}
