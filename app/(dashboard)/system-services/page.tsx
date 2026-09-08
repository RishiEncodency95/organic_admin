"use client";

import { useState, useEffect, useRef, useMemo, type ReactNode, type ChangeEvent, type ComponentType } from "react";
import {
  Pencil, Trash2, ExternalLink, BellRing, BellOff, Upload, FileText, X,
  Globe, Server, CreditCard, Mail, Cloud, ShieldCheck, Sparkles,
  BarChart3, Database, Network, KeyRound, Share2, Plug, Package,
  AlertTriangle, Search, Eye, type LucideIcon,
} from "lucide-react";
import { externalServiceApi } from "@/lib/externalServiceApi";
import SystemServiceAccessGate from "@/components/system-services/SystemServiceAccessGate";
import SystemServicesHeader from "@/components/system-services/SystemServicesHeader";
import SystemServiceToasts, { type SystemServiceToast } from "@/components/system-services/SystemServiceToasts";
import { settingsApi } from "@/lib/settingsApi";
import { uploadApi } from "@/lib/uploadApi";
import {
  ExternalService,
  ExternalServiceCategory,
  ExternalServiceBillingCycle,
  ExternalServiceReceipt,
  Settings,
} from "@/lib/types";
import { ApiRequestError } from "@/lib/api";
import { daysRemaining, serviceStatus, useCountdown, formatCountdown } from "@/lib/systemServiceUtils";
type UIStatus = "OK" | "SOON" | "EXPIRED" | "MUTED";
type GroupKey = "EXPIRED" | "SOON" | "LATER" | "MUTED";

type FormState = {
  category: ExternalServiceCategory; name: string; provider: string; accountIdentifier: string;
  loginUrl: string; secretLabel: string; secretValue: string; startDate: string; expiryDate: string;
  autoRenews: boolean; notes: string; popupReminderDays: string; emailReminderDays: string;
  notifyEmails: string; remindersEnabled: boolean; pricingType: "FREE" | "PAID"; costAmount: string;
  currency: string; billingCycle: ExternalServiceBillingCycle | ""; receipts: ExternalServiceReceipt[];
  details: Record<string, string>;
};
const CATEGORIES: { value: ExternalServiceCategory; label: string }[] = [
  { value: "DOMAIN", label: "Domain" },
  { value: "HOSTING", label: "Hosting / server" },
  { value: "SSL_CERTIFICATE", label: "SSL certificate" },
  { value: "PAYMENT_GATEWAY", label: "Payment gateway" },
  { value: "EMAIL_SMTP", label: "Email / SMTP" },
  { value: "SMS_WHATSAPP", label: "SMS / WhatsApp" },
  { value: "MEDIA_STORAGE", label: "Media storage" },
  { value: "AI_API", label: "AI / LLM API" },
  { value: "ANALYTICS", label: "Analytics" },
  { value: "DATABASE", label: "Database" },
  { value: "CDN", label: "CDN" },
  { value: "SOFTWARE_LICENSE", label: "Software licence" },
  { value: "SOCIAL_MEDIA", label: "Social media / ads" },
  { value: "API_SERVICE", label: "Other API service" },
  { value: "OTHER", label: "Other" },
];

const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label])) as Record<ExternalServiceCategory, string>;

type ServiceIcon = ComponentType<{ size?: number; className?: string }>;

function WhatsAppIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <path fill="#25D366" d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2 22l5.2-1.5A10 10 0 1 0 12 2Z" />
      <path fill="#fff" d="M17.4 14.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.6c.1-.2 0-.4 0-.6l-1-2.2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}

const CAT_ICON: Record<ExternalServiceCategory, ServiceIcon> = {
  DOMAIN: Globe, HOSTING: Server, SSL_CERTIFICATE: ShieldCheck, PAYMENT_GATEWAY: CreditCard,
  EMAIL_SMTP: Mail, SMS_WHATSAPP: WhatsAppIcon, MEDIA_STORAGE: Cloud, AI_API: Sparkles,
  ANALYTICS: BarChart3, DATABASE: Database, CDN: Network, SOFTWARE_LICENSE: KeyRound,
  SOCIAL_MEDIA: Share2, API_SERVICE: Plug, OTHER: Package,
};

const CAT_ICON_TONE: Record<ExternalServiceCategory, string> = {
  DOMAIN: "bg-emerald-50 text-emerald-700 ring-emerald-200", HOSTING: "bg-blue-50 text-blue-700 ring-blue-200",
  SSL_CERTIFICATE: "bg-cyan-50 text-cyan-700 ring-cyan-200", PAYMENT_GATEWAY: "bg-violet-50 text-violet-700 ring-violet-200",
  EMAIL_SMTP: "bg-sky-50 text-sky-700 ring-sky-200", SMS_WHATSAPP: "bg-green-50 text-green-700 ring-green-200",
  MEDIA_STORAGE: "bg-indigo-50 text-indigo-700 ring-indigo-200", AI_API: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  ANALYTICS: "bg-orange-50 text-orange-700 ring-orange-200", DATABASE: "bg-teal-50 text-teal-700 ring-teal-200",
  CDN: "bg-purple-50 text-purple-700 ring-purple-200", SOFTWARE_LICENSE: "bg-amber-50 text-amber-700 ring-amber-200",
  SOCIAL_MEDIA: "bg-pink-50 text-pink-700 ring-pink-200", API_SERVICE: "bg-rose-50 text-rose-700 ring-rose-200",
  OTHER: "bg-slate-100 text-slate-700 ring-slate-200",
};

type DetailField = { key: string; label: string; placeholder: string; type?: "text" | "number" | "url" };
const CATEGORY_FIELDS: Record<ExternalServiceCategory, DetailField[]> = {
  DOMAIN: [
    { key: "domainName", label: "Domain Name", placeholder: "mokshasewa.org" },
    { key: "registrar", label: "Registrar", placeholder: "GoDaddy / Namecheap" },
    { key: "dnsProvider", label: "DNS Provider", placeholder: "Cloudflare" },
    { key: "nameservers", label: "Nameservers", placeholder: "ns1.example.com, ns2.example.com" },
    { key: "registrantEmail", label: "Registrant Email", placeholder: "admin@example.org" },
  ],
  HOSTING: [
    { key: "serverType", label: "Server Type", placeholder: "VPS / Dedicated / Shared" },
    { key: "publicIp", label: "Public IP", placeholder: "203.0.113.10" },
    { key: "region", label: "Region", placeholder: "Mumbai / ap-south-1" },
    { key: "operatingSystem", label: "Operating System", placeholder: "Ubuntu 24.04" },
    { key: "specification", label: "CPU / RAM / Storage", placeholder: "4 vCPU · 8 GB · 160 GB" },
    { key: "backupFrequency", label: "Backup Frequency", placeholder: "Daily / Weekly" },
  ],
  SSL_CERTIFICATE: [
    { key: "coveredDomains", label: "Covered Domains", placeholder: "mokshasewa.org, *.mokshasewa.org" },
    { key: "issuer", label: "Certificate Issuer", placeholder: "Let's Encrypt" },
    { key: "certificateType", label: "Certificate Type", placeholder: "DV / OV / EV / Wildcard" },
  ],
  PAYMENT_GATEWAY: [
    { key: "merchantId", label: "Merchant ID", placeholder: "Merchant/account identifier" },
    { key: "environment", label: "Environment", placeholder: "Live / Test" },
    { key: "settlementCycle", label: "Settlement Cycle", placeholder: "T+1 / T+2" },
    { key: "webhookUrl", label: "Webhook URL", placeholder: "https://example.org/api/webhook", type: "url" },
  ],
  EMAIL_SMTP: [
    { key: "smtpHost", label: "SMTP Host", placeholder: "smtp.gmail.com" },
    { key: "smtpPort", label: "SMTP Port", placeholder: "587", type: "number" },
    { key: "encryption", label: "Encryption", placeholder: "TLS / SSL" },
    { key: "senderEmail", label: "Sender Email", placeholder: "support@example.org" },
    { key: "dailyLimit", label: "Daily Sending Limit", placeholder: "500", type: "number" },
  ],
  SMS_WHATSAPP: [
    { key: "phoneNumber", label: "WhatsApp Number", placeholder: "+91 98765 43210" },
    { key: "wabaId", label: "WhatsApp Business Account ID", placeholder: "WABA ID" },
    { key: "phoneNumberId", label: "Phone Number ID", placeholder: "Meta/AiSensy phone ID" },
    { key: "templateNamespace", label: "Template Namespace", placeholder: "Template namespace/name" },
    { key: "webhookUrl", label: "Webhook URL", placeholder: "https://example.org/api/whatsapp", type: "url" },
    { key: "messageLimit", label: "Monthly Message Limit", placeholder: "10000", type: "number" },
  ],
  MEDIA_STORAGE: [
    { key: "bucketName", label: "Bucket / Cloud Name", placeholder: "moksha-media" },
    { key: "region", label: "Region", placeholder: "Asia / ap-south-1" },
    { key: "storageLimit", label: "Storage Limit", placeholder: "25 GB" },
    { key: "deliveryUrl", label: "Delivery URL", placeholder: "https://cdn.example.org", type: "url" },
  ],
  AI_API: [
    { key: "model", label: "Model", placeholder: "GPT / Gemini model name" },
    { key: "projectId", label: "Project ID", placeholder: "Cloud/API project" },
    { key: "usageLimit", label: "Usage / Token Limit", placeholder: "Monthly limit" },
    { key: "apiBaseUrl", label: "API Base URL", placeholder: "https://api.example.com", type: "url" },
  ],
  ANALYTICS: [
    { key: "propertyId", label: "Property ID", placeholder: "123456789" },
    { key: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" },
    { key: "streamUrl", label: "Website / Stream URL", placeholder: "https://mokshasewa.org", type: "url" },
  ],
  DATABASE: [
    { key: "engine", label: "Database Engine", placeholder: "MongoDB / PostgreSQL / MySQL" },
    { key: "clusterHost", label: "Cluster / Host", placeholder: "Production cluster" },
    { key: "databaseName", label: "Database Name", placeholder: "moksha-production" },
    { key: "region", label: "Region", placeholder: "Mumbai" },
    { key: "backupPolicy", label: "Backup Policy", placeholder: "Daily · 30-day retention" },
  ],
  CDN: [
    { key: "zoneId", label: "Zone / Distribution ID", placeholder: "Cloudflare zone ID" },
    { key: "distributionDomain", label: "Distribution Domain", placeholder: "cdn.example.org" },
    { key: "origin", label: "Origin Server", placeholder: "origin.example.org" },
  ],
  SOFTWARE_LICENSE: [
    { key: "product", label: "Product / Plan", placeholder: "Product and plan name" },
    { key: "seats", label: "Licensed Seats", placeholder: "10", type: "number" },
    { key: "assignedTo", label: "Assigned To", placeholder: "Team / employee" },
    { key: "version", label: "Version", placeholder: "Current licensed version" },
  ],
  SOCIAL_MEDIA: [
    { key: "platform", label: "Platform", placeholder: "Meta / Google Ads / LinkedIn" },
    { key: "accountHandle", label: "Account Handle", placeholder: "@mokshasewa" },
    { key: "adAccountId", label: "Ad Account ID", placeholder: "Advertising account ID" },
    { key: "businessManagerId", label: "Business Manager ID", placeholder: "Meta business ID" },
  ],
  API_SERVICE: [
    { key: "baseUrl", label: "API Base URL", placeholder: "https://api.example.com", type: "url" },
    { key: "projectId", label: "Project / Account ID", placeholder: "Project identifier" },
    { key: "quota", label: "Rate / Monthly Limit", placeholder: "100 requests/minute" },
    { key: "apiVersion", label: "API Version", placeholder: "v1" },
  ],
  OTHER: [
    { key: "reference", label: "Reference ID", placeholder: "Contract/account reference" },
    { key: "supportContact", label: "Support Contact", placeholder: "Email or phone" },
  ],
};

const PRIMARY_DETAIL: Record<ExternalServiceCategory, string> = {
  DOMAIN: "domainName", HOSTING: "publicIp", SSL_CERTIFICATE: "coveredDomains", PAYMENT_GATEWAY: "merchantId",
  EMAIL_SMTP: "senderEmail", SMS_WHATSAPP: "phoneNumber", MEDIA_STORAGE: "bucketName", AI_API: "model",
  ANALYTICS: "measurementId", DATABASE: "clusterHost", CDN: "distributionDomain", SOFTWARE_LICENSE: "product",
  SOCIAL_MEDIA: "accountHandle", API_SERVICE: "baseUrl", OTHER: "reference",
};
const REQUIRED_DETAILS: Record<ExternalServiceCategory, string[]> = {
  DOMAIN: ["domainName", "registrar"], HOSTING: ["serverType", "publicIp", "region"],
  SSL_CERTIFICATE: ["coveredDomains", "issuer"], PAYMENT_GATEWAY: ["merchantId", "environment"],
  EMAIL_SMTP: ["smtpHost", "smtpPort", "senderEmail"], SMS_WHATSAPP: ["phoneNumber", "wabaId", "phoneNumberId"],
  MEDIA_STORAGE: ["bucketName", "region"], AI_API: ["model", "projectId"], ANALYTICS: ["propertyId", "measurementId"],
  DATABASE: ["engine", "clusterHost", "databaseName"], CDN: ["zoneId", "distributionDomain", "origin"],
  SOFTWARE_LICENSE: ["product", "seats"], SOCIAL_MEDIA: ["platform", "accountHandle"],
  API_SERVICE: ["baseUrl", "projectId"], OTHER: ["reference"],
};

const CATEGORY_HELP: Record<ExternalServiceCategory, string> = {
  DOMAIN: "Ownership, DNS routing and registrar access required to keep the website reachable.",
  HOSTING: "Infrastructure, capacity, location and recovery information for the running server.",
  SSL_CERTIFICATE: "Certificate coverage and issuer information used for HTTPS renewals.",
  PAYMENT_GATEWAY: "Merchant, settlement and webhook information for online payments.",
  EMAIL_SMTP: "Sending server, security and quota information for transactional email.",
  SMS_WHATSAPP: "WhatsApp Business identity, webhook and messaging capacity.",
  MEDIA_STORAGE: "Storage bucket, delivery endpoint, region and capacity.",
  AI_API: "Model, project, endpoint and spend/usage limit for the AI integration.",
  ANALYTICS: "Google Analytics property, measurement stream and tracked website.",
  DATABASE: "Database engine, production cluster, region and backup policy.",
  CDN: "Distribution zone, public delivery domain and origin server.",
  SOFTWARE_LICENSE: "Licensed product, version, seats and ownership assignment.",
  SOCIAL_MEDIA: "Platform identity and advertising/business account references.",
  API_SERVICE: "Endpoint, version, project and quota for an external API.",
  OTHER: "Contract or support references that help identify and renew the service.",
};

const CREDENTIAL_NAME: Record<ExternalServiceCategory, string> = {
  DOMAIN: "Registrar Password / Auth Code", HOSTING: "SSH Password / API Token", SSL_CERTIFICATE: "Private Key Reference",
  PAYMENT_GATEWAY: "API Key / Secret", EMAIL_SMTP: "SMTP Password", SMS_WHATSAPP: "Access Token / API Key",
  MEDIA_STORAGE: "API Secret", AI_API: "API Key", ANALYTICS: "Service Account Reference", DATABASE: "Database Password",
  CDN: "API Token", SOFTWARE_LICENSE: "Licence Key", SOCIAL_MEDIA: "Access Token", API_SERVICE: "API Key", OTHER: "Password / Secret",
};

const CYCLE: Record<ExternalServiceBillingCycle, string> = {
  ONE_TIME: "one-time", MONTHLY: "monthly", YEARLY: "yearly",
};

const GROUP_META: Record<GroupKey, { label: string; note: string }> = {
  EXPIRED: { label: "Past due", note: "the site may already be affected" },
  SOON: { label: "Renew soon", note: "inside the reminder window" },
  LATER: { label: "Steady", note: "nothing to do yet" },
  MUTED: { label: "Reminders off", note: "tracked for reference only" },
};

const GROUP_ORDER: GroupKey[] = ["EXPIRED", "SOON", "LATER", "MUTED"];

const GROUP_TONES: Record<GroupKey, string> = {
  EXPIRED: "border-l-rose-500 text-rose-700",
  SOON: "border-l-amber-500 text-amber-700",
  LATER: "border-l-emerald-500 text-emerald-700",
  MUTED: "border-l-slate-400 text-slate-600",
};

const EMPTY: FormState = {
  category: "OTHER", name: "", provider: "", accountIdentifier: "", loginUrl: "",
  secretLabel: "", secretValue: "", startDate: "", expiryDate: "", autoRenews: false,
  notes: "", popupReminderDays: "", emailReminderDays: "", notifyEmails: "",
  remindersEnabled: true, pricingType: "PAID", costAmount: "", currency: "INR",
  billingCycle: "", receipts: [], details: {},
};

const uiStatus = (s: ExternalService, settings: Settings | null): UIStatus => {
  if (s.remindersEnabled === false) return "MUTED";
  const st = serviceStatus(s, settings);
  return st === "EXPIRED" ? "EXPIRED" : st === "EXPIRING_SOON" ? "SOON" : "OK";
};

const railClass = (st: UIStatus): string =>
  st === "EXPIRED" ? "bg-[#A8202B]" : st === "SOON" ? "bg-[#9C5A08]" : st === "MUTED" ? "bg-[#D8D0C7]" : "bg-[#8B6A3E]";

const inr = (n: number): string => "₹" + Number(n || 0).toLocaleString("en-IN");

const errText = (err: unknown, fallback: string): string =>
  err instanceof ApiRequestError ? err.message : fallback;

/* --------------------------------------------------------------- primitives */

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[5px] block text-xs font-medium text-[#665B53]">{label}{required && <span className="ml-0.5 font-bold text-red-600">*</span>}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-[#81766E]">{hint}</span>}
    </label>
  );
}

function Modal({
  open, onClose, title, width = 560, children, footer,
}: {
  open: boolean; onClose: () => void; title: string; width?: 420 | 440 | 560 | 620;
  children: ReactNode; footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  if (!open) return null;
  const widthClass = width === 420 ? "max-w-[420px]" : width === 440 ? "max-w-[440px]" : width === 620 ? "max-w-[620px]" : "max-w-[560px]";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e1c17]/45 p-5 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`flex max-h-[88vh] w-full flex-col rounded-[18px] border border-white/70 bg-white shadow-[0_24px_60px_rgba(10,25,20,.28)] ${widthClass}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between gap-3 border-b border-[#EAE5DE] px-[18px] py-4 [&_h3]:m-0 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:tracking-[-.01em]">
          <h3>{title}</h3>
          <button className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto px-[18px] py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#EAE5DE] px-[18px] py-[13px]">{footer}</div>}
      </div>
    </div>
  );
}

function Countdown({ expiryDate, status }: { expiryDate: string; status: UIStatus }) {
  const c = useCountdown(expiryDate);
  const tone = status === "EXPIRED"
    ? { shell: "border-rose-200 bg-rose-50/70", cell: "border-rose-200 bg-white text-rose-700", unit: "text-rose-500" }
    : status === "SOON"
      ? { shell: "border-amber-200 bg-amber-50/70", cell: "border-amber-200 bg-white text-amber-800", unit: "text-amber-600" }
      : status === "MUTED"
        ? { shell: "border-slate-200 bg-slate-50", cell: "border-slate-200 bg-white text-slate-600", unit: "text-slate-400" }
        : { shell: "border-emerald-200 bg-emerald-50/70", cell: "border-emerald-200 bg-white text-emerald-800", unit: "text-emerald-600" };
  const parts = [
    { value: c.days, unit: "Days" }, { value: c.hours, unit: "Hours" },
    { value: c.minutes, unit: "Mins" }, { value: c.seconds, unit: "Secs" },
  ];
  return (
    <span className={`grid w-[174px] grid-cols-4 gap-1 rounded-lg border p-1 shadow-sm ${tone.shell}`} title={formatCountdown(c)}>
      {parts.map((part) => (
        <span key={part.unit} className={`flex h-[31px] flex-col items-center justify-center rounded-md border shadow-[0_1px_2px_rgba(15,23,42,.04)] ${tone.cell}`}>
          <b className="font-mono text-[10.5px] leading-none tabular-nums">{String(part.value).padStart(2, "0")}</b>
          <small className={`mt-0.5 text-[6px] font-bold uppercase leading-none ${tone.unit}`}>{part.unit}</small>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------- runway */

function Runway({
  services, settings, onPick,
}: { services: ExternalService[]; settings: Settings | null; onPick: (id: string) => void }) {
  const live = services.filter((s) => s.remindersEnabled !== false);
  const overdue = live.filter((s) => daysRemaining(s.expiryDate) < 0);
  const within = live
    .filter((s) => { const d = daysRemaining(s.expiryDate); return d >= 0 && d <= 90; })
    .sort((a, b) => daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate));
  const later = services.length - overdue.length - within.length;

  return (
    <section className="mt-2 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,.03),0_8px_24px_rgba(15,23,42,.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-[15px] max-[560px]:flex-col max-[560px]:items-stretch">
        <span className="text-[15px] font-semibold tracking-[-.01em] text-slate-900">Renewal Runway</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10.5px] font-semibold text-slate-500">Next 90 Days · Select A Marker For Details</span>
      </div>
      <div className="overflow-x-auto p-3">
        {services.length === 0 ? (
          <p className="py-[30px] text-center text-[#81766E]">Nothing to plot yet.</p>
        ) : (
          <div className="grid min-w-[700px] grid-cols-[128px_1fr_128px] items-stretch gap-2">
            <div className={`flex flex-col justify-center rounded-lg border bg-white px-4 py-3 ${overdue.length ? "border-rose-200 text-rose-700" : "border-slate-200 text-slate-500"}`}>
              <div className="flex items-center gap-2"><span className={`size-2 rounded-full ${overdue.length ? "bg-rose-500" : "bg-slate-300"}`} /><span className="text-[10px] font-semibold uppercase tracking-[.08em]">Past Due</span></div>
              <div className="mt-2 text-[26px] font-semibold leading-none tracking-[-.04em] tabular-nums">{overdue.length}</div>
              <div className="mt-1.5 text-[10px] font-medium leading-[1.35] text-slate-500">Expired Services</div>
              <div className="mt-2.5 flex flex-wrap gap-[5px]">
                {overdue.map((s) => (
                  <button key={s._id} className="size-[11px] cursor-pointer rounded-full border-[2.5px] border-white bg-current p-0 shadow-[0_0_0_1.5px_currentColor]" style={{ color: "#A8202B" }}
                    title={`${s.name} — overdue`} onClick={() => onPick(s._id)} aria-label={`${s.name}, overdue`} />
                ))}
              </div>
            </div>

            <div className="relative h-[112px] rounded-lg border border-slate-200 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8fafc_100%)] px-2 shadow-inner">
              {[0, 30, 60, 90].map((t) => (
                <div
                  key={t}
                  className="absolute bottom-5 top-0 w-px bg-slate-200 [&_span]:absolute [&_span]:-bottom-[18px] [&_span]:whitespace-nowrap [&_span]:text-[10.5px] [&_span]:font-semibold [&_span]:text-slate-500"
                  style={{ left: t === 0 ? 28 : t === 90 ? "calc(100% - 32px)" : `${(t / 90) * 100}%` }}
                >
                  <span className="-translate-x-1/2">{t === 0 ? "Today" : `${t} Days`}</span>
                </div>
              ))}
              <div className="absolute inset-x-7 bottom-5 h-px bg-[#D8D0C7]" />
              {within.map((s, i) => {
                const d = daysRemaining(s.expiryDate);
                const st = uiStatus(s, settings);
                const markerPosition = Math.max(6, Math.min(94, (d / 90) * 100));
                return (
                  <div key={s._id} className="absolute flex -translate-x-1/2 flex-col items-center"
                    style={{ left: `${markerPosition}%`, top: 10 + (i % 2) * 28, bottom: 20 }}>
                    <div className={`relative z-10 mb-1 max-w-[130px] truncate whitespace-nowrap rounded-md border px-2.5 py-1 text-[10px] font-semibold shadow-sm ${st === "SOON" ? "border-amber-200 bg-amber-50 !text-amber-800" : "border-emerald-200 bg-emerald-50 !text-emerald-800"}`}>{s.name}</div>
                    <button className={`relative z-10 size-3 cursor-pointer rounded-full border-[3px] border-white bg-current p-0 shadow-[0_0_0_1.5px_currentColor] ${st === "SOON" ? "text-amber-600" : "text-emerald-600"}`}
                      onClick={() => onPick(s._id)} title={`${s.name} — ${d} days left`}
                      aria-label={`${s.name}, ${d} days left`} />
                    <div className="w-px flex-1 bg-[#D8D0C7]" />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col justify-center rounded-lg border border-slate-200 bg-white px-4 py-3 text-blue-700">
              <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-blue-500" /><span className="text-[10px] font-semibold uppercase tracking-[.08em]">Later</span></div>
              <div className="mt-2 text-[26px] font-semibold leading-none tracking-[-.04em] tabular-nums">{later}</div>
              <div className="mt-1.5 text-[10px] font-medium leading-[1.35] text-slate-500">Outside 90 Days</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type SummaryTone = "emerald" | "rose" | "amber" | "blue" | "violet";

const SUMMARY_TONES: Record<SummaryTone, { card: string; icon: string; value: string }> = {
  emerald: { card: "bg-gradient-to-br from-white via-white to-emerald-50", icon: "bg-emerald-50 text-emerald-700 ring-emerald-100", value: "text-emerald-700" },
  rose: { card: "bg-gradient-to-br from-white via-white to-rose-50", icon: "bg-rose-50 text-rose-700 ring-rose-100", value: "text-rose-700" },
  amber: { card: "bg-gradient-to-br from-white via-white to-amber-50", icon: "bg-amber-50 text-amber-700 ring-amber-100", value: "text-amber-700" },
  blue: { card: "bg-gradient-to-br from-white via-white to-blue-50", icon: "bg-blue-50 text-blue-700 ring-blue-100", value: "text-blue-700" },
  violet: { card: "bg-gradient-to-br from-white via-white to-violet-50", icon: "bg-violet-50 text-violet-700 ring-violet-100", value: "text-violet-700" },
};

function SummaryCard({ title, value, label, detail, icon: Icon, tone }: {
  title: string; value: ReactNode; label: string; detail: string; icon: LucideIcon; tone: SummaryTone;
}) {
  const colors = SUMMARY_TONES[tone];
  return (
    <div className={`relative min-h-[104px] min-w-0 overflow-hidden rounded-[10px] border border-black/15 p-2.5 pb-6 shadow-[0_1px_3px_rgba(0,0,0,.02)] transition duration-150 hover:-translate-y-px hover:shadow-[0_5px_15px_rgba(15,23,42,.08)] ${colors.card}`}>
      <div className="flex items-start gap-2">
        <span className={`grid size-[30px] shrink-0 place-items-center rounded-full ring-1 ${colors.icon}`}><Icon size={15} /></span>
        <span className="min-w-0 truncate pt-0.5 text-[9px] font-semibold uppercase tracking-[.01em] text-slate-900">{title}</span>
      </div>
      <div className={`-mt-[15px] ml-[38px] text-[22px] font-semibold leading-none tracking-[-.04em] tabular-nums ${colors.value}`}>{value}</div>
      <div className={`ml-[38px] mt-1 truncate text-[9px] font-semibold ${colors.value}`}>{label}</div>
      <div className="absolute inset-x-2 bottom-1 truncate text-center text-[8.5px] font-semibold leading-tight text-[#293957]">{detail}</div>
    </div>
  );
}

/* --------------------------------------------------------------------- page */

export default function SystemServicesPage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [services, setServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<SystemServiceToast[]>([]);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExternalService | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertDraft, setAlertDraft] = useState({ popupReminderDays: "15", emailReminderDays: "15", notifyEmails: "" });
  const [savingAlerts, setSavingAlerts] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ExternalService | null>(null);
  const [viewing, setViewing] = useState<ExternalService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toast = (text: string, type: "ok" | "err" = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };

  useEffect(() => {
    if (!accessGranted || !accessExpiresAt) return;
    const expiry = new Date(accessExpiresAt).getTime();
    const lock = () => {
      if (Date.now() < expiry) return;
      window.sessionStorage.removeItem("moksha_system_services_grant");
      window.sessionStorage.removeItem("moksha_system_services_expires_at");
      setServices([]);
      setSettings(null);
      setViewing(null);
      setEditing(null);
      setFormOpen(false);
      setAlertOpen(false);
      setAccessGranted(false);
      setAccessExpiresAt(null);
    };
    const timer = window.setTimeout(lock, Math.max(0, expiry - Date.now()));
    const recheck = () => lock();
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [accessGranted, accessExpiresAt]);

  const load = async () => {
    setLoading(true);
    settingsApi.getSystemAlerts().then((settingsRes) => {
      setSettings(settingsRes);
      setAlertDraft({
        popupReminderDays: String(settingsRes.systemAlerts?.popupReminderDays ?? 15),
        emailReminderDays: String(settingsRes.systemAlerts?.emailReminderDays ?? 15),
        notifyEmails: settingsRes.systemAlerts?.notifyEmails?.join(", ") ?? "",
      });
    }).catch((err) => {
      toast(errText(err, "Could not load reminder settings."), "err");
    });

    try {
      const servicesRes = await externalServiceApi.list();
      setServices(servicesRes);
    } catch (err) {
      toast(errText(err, "Could not load System & Security data."), "err");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowAccess(false); setFormOpen(true); };

  const openEdit = (s: ExternalService) => {
    setEditing(s);
    setShowAccess(Boolean(s.accountIdentifier || s.loginUrl || s.secretLabel || s.secretValue));
    setForm({
      category: s.category,
      name: s.name,
      provider: s.provider ?? "",
      accountIdentifier: s.accountIdentifier ?? "",
      loginUrl: s.loginUrl ?? "",
      secretLabel: s.secretLabel ?? "",
      secretValue: s.secretValue ?? "",
      startDate: s.startDate ? s.startDate.slice(0, 10) : "",
      expiryDate: s.expiryDate ? s.expiryDate.slice(0, 10) : "",
      autoRenews: s.autoRenews ?? false,
      notes: s.notes ?? "",
      popupReminderDays: s.popupReminderDays != null ? String(s.popupReminderDays) : "",
      emailReminderDays: s.emailReminderDays != null ? String(s.emailReminderDays) : "",
      notifyEmails: s.notifyEmails?.join(", ") ?? "",
      remindersEnabled: s.remindersEnabled ?? true,
      pricingType: s.pricingType ?? "PAID",
      costAmount: s.costAmount != null ? String(s.costAmount) : "",
      currency: s.currency ?? "INR",
      billingCycle: s.billingCycle ?? "",
      receipts: s.receipts ?? [],
      details: s.details ?? {},
    });
    setFormOpen(true);
  };

  const toPayload = (f: FormState): Partial<ExternalService> => ({
    category: f.category,
    name: f.name.trim(),
    provider: f.provider.trim() || undefined,
    accountIdentifier: f.accountIdentifier.trim() || undefined,
    loginUrl: f.loginUrl.trim() || undefined,
    secretLabel: f.secretLabel.trim() || undefined,
    secretValue: f.secretValue || undefined,
    startDate: f.startDate || undefined,
    expiryDate: f.expiryDate,
    autoRenews: f.autoRenews,
    notes: f.notes.trim() || undefined,
    popupReminderDays: f.popupReminderDays ? Number(f.popupReminderDays) : undefined,
    emailReminderDays: f.emailReminderDays ? Number(f.emailReminderDays) : undefined,
    notifyEmails: f.notifyEmails.split(",").map((e) => e.trim()).filter(Boolean),
    remindersEnabled: f.remindersEnabled,
    pricingType: f.pricingType,
    costAmount: f.pricingType === "PAID" && f.costAmount ? Number(f.costAmount) : undefined,
    currency: f.pricingType === "PAID" ? f.currency.trim() || "INR" : undefined,
    billingCycle: f.pricingType === "PAID" && f.billingCycle ? f.billingCycle : undefined,
    receipts: f.receipts,
    details: Object.fromEntries(Object.entries(f.details).map(([key, value]) => [key, value.trim()]).filter(([, value]) => value)),
  });

  const save = async () => {
    if (!form.name.trim()) { toast("Give the service a name first.", "err"); return; }
    if (!form.provider.trim()) { toast("Provider is required — enter the company that supplies this service.", "err"); return; }
    if (!form.expiryDate) { toast("An expiry date is required — it drives every reminder.", "err"); return; }
    const missingDetail = REQUIRED_DETAILS[form.category].find((key) => !form.details[key]?.trim());
    if (missingDetail) {
      const field = CATEGORY_FIELDS[form.category].find((item) => item.key === missingDetail);
      toast(`${field?.label ?? "Required detail"} is required for ${CAT_LABEL[form.category]}.`, "err");
      return;
    }
    if (form.pricingType === "PAID" && (!form.costAmount || !form.billingCycle)) { toast("Enter the paid amount and billing cycle.", "err"); return; }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editing) {
        const updated = await externalServiceApi.update(editing._id, payload);
        setServices((p) => p.map((s) => (s._id === updated._id ? updated : s)));
        toast(`Saved ${updated.name}.`);
      } else {
        const created = await externalServiceApi.create(payload);
        setServices((p) => [...p, created]);
        setHighlight(created._id);
        toast(`Added ${created.name}.`);
      }
      setFormOpen(false);
    } catch (err) {
      toast(errText(err, "Could not save this service."), "err");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await externalServiceApi.remove(deleteTarget._id);
      setServices((p) => p.filter((s) => s._id !== deleteTarget._id));
      toast(`Removed ${deleteTarget.name}.`);
      setDeleteTarget(null);
    } catch (err) {
      toast(errText(err, "Could not delete this service."), "err");
    } finally {
      setDeleting(false);
    }
  };

  const addReceipt = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadApi.file(file, "moksha-sewa/system-services");
      const receipt: ExternalServiceReceipt = { url: result.url, label: file.name, uploadedAt: new Date().toISOString() };
      setForm((p) => ({ ...p, receipts: [...p.receipts, receipt] }));
      toast("Bill attached.");
    } catch (err) {
      toast(errText(err, "Could not upload the receipt."), "err");
    } finally {
      setUploading(false);
    }
  };

  const saveAlertDefaults = async () => {
    if (!settings) return;
    setSavingAlerts(true);
    try {
      const updated = await settingsApi.update({
        ...settings,
        systemAlerts: {
          popupReminderDays: Number(alertDraft.popupReminderDays) || 15,
          emailReminderDays: Number(alertDraft.emailReminderDays) || 15,
          notifyEmails: alertDraft.notifyEmails.split(",").map((e) => e.trim()).filter(Boolean),
        },
      });
      setSettings(updated);
      setAlertOpen(false);
      toast("Reminder defaults saved.");
    } catch (err) {
      toast(errText(err, "Could not save the defaults."), "err");
    } finally {
      setSavingAlerts(false);
    }
  };

  const pick = (id: string) => {
    setHighlight(id);
    document.getElementById(`svc-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(() => setHighlight(null), 1400);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services
      .filter((s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.provider ?? "").toLowerCase().includes(q) ||
        (CAT_LABEL[s.category] ?? "").toLowerCase().includes(q))
      .sort((a, b) => daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate));
  }, [services, query]);

  const groups = useMemo(() => {
    const g: Record<GroupKey, ExternalService[]> = { EXPIRED: [], SOON: [], LATER: [], MUTED: [] };
    filtered.forEach((s) => {
      const st = uiStatus(s, settings);
      if (st === "MUTED") g.MUTED.push(s);
      else if (st === "EXPIRED") g.EXPIRED.push(s);
      else if (st === "SOON") g.SOON.push(s);
      else g.LATER.push(s);
    });
    return g;
  }, [filtered, settings]);

  const overdueCount = services.filter((s) => uiStatus(s, settings) === "EXPIRED").length;
  const soonCount = services.filter((s) => uiStatus(s, settings) === "SOON").length;
  const paidServices = services.filter((s) => s.pricingType === "PAID" && !!s.costAmount);
  const monthlyServices = paidServices.filter((s) => s.billingCycle === "MONTHLY");
  const yearlyServices = paidServices.filter((s) => s.billingCycle === "YEARLY");
  const monthlyTotal = monthlyServices.reduce((sum, s) => sum + Number(s.costAmount || 0), 0);
  const yearlyTotal = yearlyServices.reduce((sum, s) => sum + Number(s.costAmount || 0), 0);

  if (!accessGranted) return <SystemServiceAccessGate onGranted={async (expiresAt) => { setAccessExpiresAt(expiresAt); setAccessGranted(true); await load(); }} />;

  return (
    <div className="min-h-screen bg-[#F7F5F1] px-6 pb-24 pt-2 text-[13px] capitalize leading-[1.45] text-[#261B15] antialiased max-[820px]:px-3.5 max-[820px]:pb-20 max-[820px]:pt-[18px]">
      <div className="mx-auto max-w-[1240px]">
        <SystemServicesHeader reminderDisabled={!settings} onReminderDefaults={() => setAlertOpen(true)} onAddService={openAdd} />

        <div className="mt-1 grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard title="Inventory" value={loading ? "—" : services.length} label="Services tracked" detail={loading ? "Loading service data" : `${paidServices.length} paid · ${services.length - paidServices.length} free`} icon={Package} tone="emerald" />
          <SummaryCard title="Attention" value={loading ? "—" : overdueCount} label="Past due" detail={overdueCount ? "Immediate action required" : "No overdue renewals"} icon={AlertTriangle} tone="rose" />
          <SummaryCard title="Upcoming" value={loading ? "—" : soonCount} label="Renewing soon" detail="Inside the reminder window" icon={BellRing} tone="amber" />
          <SummaryCard title="Monthly" value={loading ? "—" : inr(monthlyTotal)} label="Monthly billing" detail={`${monthlyServices.length} monthly ${monthlyServices.length === 1 ? "subscription" : "subscriptions"}`} icon={CreditCard} tone="blue" />
          <SummaryCard title="Yearly" value={loading ? "—" : inr(yearlyTotal)} label="Annual billing" detail={`${yearlyServices.length} yearly ${yearlyServices.length === 1 ? "subscription" : "subscriptions"}`} icon={BarChart3} tone="violet" />
        </div>

        {!loading && <Runway services={services} settings={settings} onPick={pick} />}

        <section className="mt-2 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,.03),0_8px_24px_rgba(15,23,42,.04)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-2 max-[560px]:flex-col max-[560px]:items-stretch">
            <span className="text-[15px] font-semibold tracking-[-.01em] text-slate-900">Tracked Services</span>
            <div className="relative">
              <Search size={13} className="absolute left-[9px] top-[7px] text-[#81766E]" />
              <input className="w-[250px] rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-[11.5px] font-medium text-slate-800 transition placeholder:text-slate-400 focus:border-[#8B6A3E] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F5ECDD] max-[560px]:w-full" placeholder="Search Name Or Provider"
                value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="grid min-h-[38px] grid-cols-[4px_minmax(180px,1.6fr)_minmax(120px,.9fr)_110px_minmax(150px,.9fr)_84px] items-center gap-2 border-b border-slate-200 bg-slate-50/80 pr-4 text-[9.5px] font-semibold uppercase tracking-[.1em] text-slate-500 max-[820px]:grid-cols-[4px_1fr_auto_76px] max-[820px]:pr-2 max-[560px]:grid-cols-[4px_1fr_auto]">
            <span />
            <span>Service</span>
            <span className="max-[820px]:hidden">Category</span>
            <span className="-translate-x-3 max-[820px]:hidden">Cost</span>
            <span className="translate-x-5">Time Left</span>
            <span className="text-right max-[820px]:hidden">Actions</span>
          </div>

          {loading && [0, 1, 2, 3].map((i) => (
            <div className="grid min-h-[44px] grid-cols-[4px_minmax(180px,1.6fr)_minmax(120px,.9fr)_110px_minmax(150px,.9fr)_84px] items-center gap-2 border-b border-slate-100 pr-4 max-[820px]:grid-cols-[4px_1fr_auto_76px] max-[820px]:pr-2 max-[560px]:grid-cols-[4px_1fr_auto]" key={i}>
              <div className="self-stretch bg-[#EAE5DE]" />
              <div className="flex items-center gap-2.5">
                <span className="block size-[30px] animate-pulse rounded-lg bg-[#EDF1EF]" />
                <span className="block h-3 w-[150px] animate-pulse rounded-md bg-[#EDF1EF]" />
              </div>
              <div className="max-[820px]:hidden"><span className="block h-3 w-20 animate-pulse rounded-md bg-[#EDF1EF]" /></div>
              <div className="max-[820px]:hidden"><span className="block h-3 w-[60px] animate-pulse rounded-md bg-[#EDF1EF]" /></div>
              <div><span className="block h-3 w-[90px] animate-pulse rounded-md bg-[#EDF1EF]" /></div>
              <div />
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="border-t border-[#EAE5DE] px-4 py-11 text-center text-[#665B53]">
              {query
                ? <>Nothing matches “{query}”.</>
                : <>Nothing tracked yet. Start with the domain — it&apos;s the one that takes the site down.</>}
            </div>
          )}

          {!loading && GROUP_ORDER.map((key) => {
            const rows = groups[key];
            if (!rows.length) return null;
            return (
              <div key={key}>
                <div className={`relative flex items-center justify-center gap-1.5 border-l-[3px] border-b border-r border-slate-100 bg-slate-50/70 px-12 py-1 text-center text-[10.5px] font-semibold ${GROUP_TONES[key]}`}>
                  <b>{GROUP_META[key].label}</b>
                  <span className="font-medium text-slate-500">· {GROUP_META[key].note}</span>
                  <span className="absolute right-4 grid min-w-5 place-items-center rounded-full border border-slate-200 bg-white px-1.5 py-0.5 font-semibold text-slate-600 tabular-nums">{rows.length}</span>
                </div>
                {rows.map((s) => {
                  const st = uiStatus(s, settings);
                  const Icon = CAT_ICON[s.category] ?? Package;
                  return (
                    <div key={s._id} id={`svc-${s._id}`} className={`group grid min-h-[44px] grid-cols-[4px_minmax(180px,1.6fr)_minmax(120px,.9fr)_110px_minmax(150px,.9fr)_84px] items-center gap-2 border-b border-slate-100 pr-4 transition-colors last:border-b-0 hover:bg-slate-50/70 max-[820px]:grid-cols-[4px_1fr_auto_76px] max-[820px]:pr-2 max-[560px]:grid-cols-[4px_1fr_auto] ${highlight === s._id ? "animate-pulse bg-[#F5ECDD]" : ""}`}>
                      <div className={`self-stretch ${railClass(st)}`} />
                      <div className="flex min-w-0 items-center gap-2.5 [&_p]:m-0 [&_p]:truncate [&_p]:font-semibold [&_small]:text-[11.5px] [&_small]:text-[#81766E]">
                        <span className={`flex size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ${CAT_ICON_TONE[s.category]}`}>
                          <Icon size={13} />
                        </span>
                        <div className="min-w-0">
                          <p>{s.name}</p>
                          <small>
                            {s.provider || CAT_LABEL[s.category]}
                            {s.details?.[PRIMARY_DETAIL[s.category]] ? ` · ${s.details[PRIMARY_DETAIL[s.category]]}` : ""}
                            {s.autoRenews ? " · auto-renews" : ""}
                          </small>
                        </div>
                      </div>

                      <div className="truncate whitespace-nowrap text-[11.5px] font-medium text-slate-500 max-[820px]:hidden">{CAT_LABEL[s.category]}</div>

                      <div className="min-w-[110px] -translate-x-3 overflow-visible max-[820px]:hidden">
                        {s.pricingType === "FREE" ? (
                          <span className="inline-flex items-center gap-[5px] whitespace-nowrap rounded-full bg-[#F5ECDD] px-2 py-0.5 text-[11.5px] font-medium text-[#684A29]">Free</span>
                        ) : s.costAmount != null ? (
                          <span className="inline-flex whitespace-nowrap text-xs font-semibold tracking-[-.01em] tabular-nums">
                            {s.currency && s.currency !== "INR" ? `${s.currency} ${s.costAmount.toLocaleString("en-IN")}` : inr(s.costAmount)}
                            <span className="text-[#81766E]">
                              {s.billingCycle && s.billingCycle !== "ONE_TIME" ? ` /${CYCLE[s.billingCycle].slice(0, 2)}` : ""}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[#81766E]">amount not set</span>
                        )}
                      </div>

                      <div className="flex min-w-0 translate-x-5 items-center gap-1.5">
                        <Countdown expiryDate={s.expiryDate} status={st} />
                        {st === "MUTED" && <BellOff size={13} className="text-[#81766E]" aria-label="Reminders off" />}
                      </div>

                      <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-[820px]:opacity-100 max-[560px]:col-span-full max-[560px]:justify-start max-[560px]:pb-2">
                        {s.loginUrl && (
                          <a className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" href={s.loginUrl} target="_blank" rel="noreferrer" title="Open provider dashboard">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" onClick={() => setViewing(s)} title="View details"><Eye size={14} /></button>
                        <button className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" onClick={() => openEdit(s)} title="Edit"><Pencil size={14} /></button>
                        <button className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15] hover:!bg-[#FAE7E7] hover:!text-[#A8202B]" onClick={() => setDeleteTarget(s)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>
      </div>

      {/* add / edit */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Add a service"}
        width={620}
        footer={
          <>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-semibold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => setFormOpen(false)}>Cancel</button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#8B6A3E] bg-[#8B6A3E] px-[15px] py-2 text-[12.5px] font-semibold leading-none text-white shadow-[0_4px_12px_rgba(104,74,41,.16)] transition hover:-translate-y-px hover:border-[#684A29] hover:bg-[#684A29] hover:shadow-[0_6px_16px_rgba(104,74,41,.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [&_svg]:shrink-0" onClick={save} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Add service"}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-1">
            <Field label="Category" required hint="Choose the service type; relevant fields appear automatically.">
              <select className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ExternalServiceCategory, details: {} })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Name" required hint="A short name your team will recognize.">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.name} placeholder="Domain — mokshasewa.org"
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Provider" required hint="The company supplying it, for example Hostinger, Meta or Razorpay.">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.provider} placeholder="GoDaddy, Razorpay, Cloudinary"
                onChange={(e) => setForm({ ...form, provider: e.target.value })} />
            </Field>
            <div className="col-span-2 max-[820px]:col-span-1">
              <button type="button" className="flex w-full items-center justify-between rounded-lg border border-dashed border-[#CFC5BA] bg-[#FCFBF9] px-3 py-2.5 text-left text-[12px] font-semibold text-[#684A29] hover:bg-[#F8F3EC]" onClick={() => setShowAccess((value) => !value)}>
                <span>{showAccess ? "Hide" : "Add"} Login Or Credential Details <small className="ml-1 font-normal text-[#81766E]">Optional</small></span>
                <span>{showAccess ? "−" : "+"}</span>
              </button>
            </div>
            {showAccess && <>
            <Field label="Account" hint="Login email, username or account id">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.accountIdentifier}
                onChange={(e) => setForm({ ...form, accountIdentifier: e.target.value })} />
            </Field>
            <Field label="Dashboard URL">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.loginUrl} placeholder="https://dashboard.provider.com"
                onChange={(e) => setForm({ ...form, loginUrl: e.target.value })} />
            </Field>
            <Field label="Credential name">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.secretLabel} placeholder={CREDENTIAL_NAME[form.category]}
                onChange={(e) => setForm({ ...form, secretLabel: e.target.value })} />
            </Field>
            </>}
          </div>

          <div className="rounded-[10px] border border-[#EAE5DE] bg-[#FCFBF9] p-[13px]">
            <div className="mb-2.5 flex items-center gap-2">
              {(() => { const CategoryIcon = CAT_ICON[form.category]; return <CategoryIcon size={15} className="text-[#684A29]" />; })()}
              <div>
                <p className="m-0 text-xs font-semibold">{CAT_LABEL[form.category]} Details</p>
                <p className="m-0 mt-0.5 text-[11px] text-[#81766E]">{CATEGORY_HELP[form.category]}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-1">
              {CATEGORY_FIELDS[form.category].map((field) => (
                <Field key={field.key} label={field.label} required={REQUIRED_DETAILS[form.category].includes(field.key)} hint={REQUIRED_DETAILS[form.category].includes(field.key) ? `Required to identify this ${CAT_LABEL[form.category].toLowerCase()} correctly.` : "Optional — fill only if available."}>
                  <input
                    className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]"
                    type={field.type ?? "text"}
                    value={form.details[field.key] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(e) => setForm((current) => ({ ...current, details: { ...current.details, [field.key]: e.target.value } }))}
                  />
                </Field>
              ))}
            </div>
          </div>

          {showAccess && <Field label="Credential value" hint="Optional. Stored encrypted; add only a password, token or API key your team needs.">
            <textarea className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" rows={2} value={form.secretValue}
              onChange={(e) => setForm({ ...form, secretValue: e.target.value })} />
          </Field>}

          <div className="grid grid-cols-2 gap-3 max-[820px]:grid-cols-1">
            <Field label="Started on">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="date" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Expires on" required hint="Used for the renewal countdown and alerts.">
              <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="date" value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </Field>
          </div>

          <div className="rounded-[10px] border border-[#EAE5DE] p-[13px]">
            <p className="mb-2.5 text-xs font-semibold">Cost</p>
            <div className="inline-flex rounded-lg border border-[#EAE5DE] bg-[#FAF8F5] p-0.5 [&_button]:rounded-md [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-3.5 [&_button]:py-[5px] [&_button]:text-[12.5px] [&_button]:font-semibold [&_button]:text-[#665B53] [&_button[aria-pressed=true]]:bg-white [&_button[aria-pressed=true]]:text-[#261B15] [&_button[aria-pressed=true]]:shadow-sm" role="group" aria-label="Pricing">
              {(["FREE", "PAID"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={form.pricingType === v}
                  onClick={() => setForm({ ...form, pricingType: v })}>
                  {v === "FREE" ? "Free" : "Paid"}
                </button>
              ))}
            </div>
            {form.pricingType === "PAID" && (
              <div className="mt-3 grid grid-cols-3 gap-3 max-[820px]:grid-cols-1">
                <Field label="Currency" required>
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })} />
                </Field>
                <Field label="Amount" required hint="Exact amount charged each billing cycle.">
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={form.costAmount} placeholder="999"
                    onChange={(e) => setForm({ ...form, costAmount: e.target.value })} />
                </Field>
                <Field label="Billed" required hint="How often this service charges you.">
                  <select className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value as ExternalServiceBillingCycle | "" })}>
                    <option value="">Choose</option>
                    {(Object.keys(CYCLE) as ExternalServiceBillingCycle[]).map((v) => (
                      <option key={v} value={v}>{CYCLE[v]}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-[#EAE5DE] p-[13px]">
            <div className="flex items-center justify-between">
              <p className="m-0 text-xs font-semibold">Bills and receipts</p>
              <button type="button" className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-semibold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload size={13} /> {uploading ? "Uploading…" : "Attach"}
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={addReceipt} />
            </div>
            {form.receipts.length === 0 ? (
              <p className="mt-2 block text-[11.5px] text-[#81766E]">
                Nothing attached. Add the last invoice so the next renewal has a reference.
              </p>
            ) : form.receipts.map((r) => (
              <div className="mt-1.5 flex items-center justify-between gap-2 rounded-[7px] bg-[#FAF8F5] py-1.5 pl-2.5 pr-2 [&_a]:flex [&_a]:min-w-0 [&_a]:items-center [&_a]:gap-[7px] [&_a]:text-[12.5px] [&_a]:font-medium [&_a]:text-[#684A29] hover:[&_a]:underline" key={r.url}>
                <a href={r.url} target="_blank" rel="noreferrer">
                  <FileText size={13} />
                  <span className="truncate whitespace-nowrap">{r.label || "Receipt"}</span>
                </a>
                <button type="button" className="flex size-7 items-center justify-center rounded-[7px] border-0 bg-transparent text-[#81766E] hover:bg-[#FAF8F5] hover:text-[#261B15]" aria-label={`Remove ${r.label}`}
                  onClick={() => setForm((p) => ({ ...p, receipts: p.receipts.filter((x) => x.url !== r.url) }))}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-[10px] border border-[#EAE5DE] p-[13px]">
            <label className="flex items-start gap-[9px] text-[13px] font-medium [&_input]:mt-0.5 [&_input]:size-[15px] [&_input]:accent-[#8B6A3E]">
              <input type="checkbox" checked={form.remindersEnabled}
                onChange={(e) => setForm({ ...form, remindersEnabled: e.target.checked })} />
              <span>
                Remind us before this expires
                <span className="mt-1 block text-[11.5px] font-normal text-[#81766E]">
                  Turn it off for something that never really expires. It stays listed here, just without the
                  popup, the topbar alert and the email.
                </span>
              </span>
            </label>
            {form.remindersEnabled && (
              <div className="mt-3 grid grid-cols-3 gap-3 max-[820px]:grid-cols-1">
                <Field label="Popup, days before" hint={`Blank = ${settings?.systemAlerts?.popupReminderDays ?? 15}`}>
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={form.popupReminderDays}
                    onChange={(e) => setForm({ ...form, popupReminderDays: e.target.value })} />
                </Field>
                <Field label="Email, days before" hint={`Blank = ${settings?.systemAlerts?.emailReminderDays ?? 15}`}>
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={form.emailReminderDays}
                    onChange={(e) => setForm({ ...form, emailReminderDays: e.target.value })} />
                </Field>
                <Field label="Email these people" hint="Blank = default list">
                  <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" value={form.notifyEmails}
                    onChange={(e) => setForm({ ...form, notifyEmails: e.target.value })} />
                </Field>
              </div>
            )}
          </div>

          <Field label="Notes">
            <textarea className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          <label className="flex items-start gap-[9px] text-[13px] font-medium [&_input]:mt-0.5 [&_input]:size-[15px] [&_input]:accent-[#8B6A3E]">
            <input type="checkbox" checked={form.autoRenews}
              onChange={(e) => setForm({ ...form, autoRenews: e.target.checked })} />
            <span>Renews automatically with the provider</span>
          </label>
        </div>
      </Modal>

      {/* service details */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? `${viewing.name} Details` : "Service Details"}
        width={620}
        footer={viewing ? (
          <>
            <button className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] text-[12.5px] font-semibold text-[#261B15] hover:bg-[#FAF8F5]" onClick={() => setViewing(null)}>Close</button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-[10px] bg-[#8B6A3E] px-[15px] text-[12.5px] font-semibold text-white hover:bg-[#684A29]" onClick={() => { const service = viewing; setViewing(null); openEdit(service); }}><Pencil size={14} /> Edit Service</button>
          </>
        ) : undefined}
      >
        {viewing && (() => {
          const DetailIcon = CAT_ICON[viewing.category];
          const technicalRows = CATEGORY_FIELDS[viewing.category]
            .map((field) => ({ label: field.label, value: viewing.details?.[field.key] }))
            .filter((row) => row.value);
          const price = viewing.pricingType === "FREE"
            ? "Free"
            : viewing.costAmount != null
              ? `${viewing.currency && viewing.currency !== "INR" ? `${viewing.currency} ` : "₹"}${viewing.costAmount.toLocaleString("en-IN")}${viewing.billingCycle ? ` / ${CYCLE[viewing.billingCycle]}` : ""}`
              : "Amount Not Set";
          const overviewRows = [
            { label: "Provider", value: viewing.provider },
            { label: "Account", value: viewing.accountIdentifier },
            { label: "Started On", value: viewing.startDate ? new Date(viewing.startDate).toLocaleDateString("en-IN") : undefined },
            { label: "Expires On", value: viewing.expiryDate ? new Date(viewing.expiryDate).toLocaleDateString("en-IN") : undefined },
            { label: "Billing", value: price },
            { label: "Renewal", value: viewing.autoRenews ? "Automatic" : "Manual" },
            { label: "Reminders", value: viewing.remindersEnabled ? "Enabled" : "Disabled" },
            { label: "Receipts", value: `${viewing.receipts?.length ?? 0} Attached` },
          ].filter((row) => row.value);
          return (
            <div className="grid gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-[#EAE5DE] bg-[#FCFBF9] p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F5ECDD] text-[#684A29]"><DetailIcon size={20} /></span>
                <div className="min-w-0">
                  <p className="m-0 text-sm font-bold text-[#261B15]">{CAT_LABEL[viewing.category]}</p>
                  <p className="mb-0 mt-1 text-[12px] leading-5 text-[#665B53]">{CATEGORY_HELP[viewing.category]}</p>
                  {viewing.loginUrl && <a className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#684A29] hover:underline" href={viewing.loginUrl} target="_blank" rel="noreferrer">Open Provider Dashboard <ExternalLink size={12} /></a>}
                </div>
              </div>

              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[.08em] text-[#81766E]">Service Overview</p>
                <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#EAE5DE] max-[620px]:grid-cols-1">
                  {overviewRows.map((row) => <div key={row.label} className="border-b border-r border-[#EEE9E3] px-3 py-2.5 last:border-b-0"><p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-[#81766E]">{row.label}</p><p className="mb-0 mt-1 break-words text-[12.5px] font-semibold text-[#261B15]">{row.value}</p></div>)}
                </div>
              </section>

              <section>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[.08em] text-[#81766E]">{CAT_LABEL[viewing.category]} Technical Details</p>
                {technicalRows.length ? (
                  <div className="grid grid-cols-2 gap-2 max-[620px]:grid-cols-1">
                    {technicalRows.map((row) => <div key={row.label} className="rounded-lg border border-[#EAE5DE] bg-white px-3 py-2.5"><p className="m-0 text-[10px] font-semibold text-[#81766E]">{row.label}</p><p className="mb-0 mt-1 break-all text-[12.5px] font-semibold text-[#261B15]">{row.value}</p></div>)}
                  </div>
                ) : <p className="m-0 rounded-lg border border-dashed border-[#D8D0C7] bg-[#FCFBF9] px-3 py-4 text-center text-[12px] text-[#81766E]">No technical details added yet. Edit this service to complete them.</p>}
              </section>

              {viewing.notes && <section><p className="mb-2 text-[11px] font-bold uppercase tracking-[.08em] text-[#81766E]">Notes</p><p className="m-0 whitespace-pre-wrap rounded-lg bg-[#FAF8F5] p-3 text-[12.5px] leading-5 text-[#4A4039]">{viewing.notes}</p></section>}
            </div>
          );
        })()}
      </Modal>

      {/* reminder defaults */}
      <Modal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Reminder defaults"
        width={440}
        footer={
          <>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-semibold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => setAlertOpen(false)}>Cancel</button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#8B6A3E] bg-[#8B6A3E] px-[15px] py-2 text-[12.5px] font-semibold leading-none text-white shadow-[0_4px_12px_rgba(104,74,41,.16)] transition hover:-translate-y-px hover:border-[#684A29] hover:bg-[#684A29] hover:shadow-[0_6px_16px_rgba(104,74,41,.22)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none [&_svg]:shrink-0" onClick={saveAlertDefaults} disabled={savingAlerts}>
              {savingAlerts ? "Saving…" : "Save defaults"}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <p className="mt-0 block text-[11.5px] text-[#81766E]">Applied to every service that doesn&apos;t set its own.</p>
          <Field label="Show the popup this many days before expiry">
            <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={alertDraft.popupReminderDays}
              onChange={(e) => setAlertDraft({ ...alertDraft, popupReminderDays: e.target.value })} />
          </Field>
          <Field label="Send the email this many days before expiry">
            <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" type="number" min={0} value={alertDraft.emailReminderDays}
              onChange={(e) => setAlertDraft({ ...alertDraft, emailReminderDays: e.target.value })} />
          </Field>
          <Field label="Send it to" hint="Separate addresses with a comma">
            <input className="w-full rounded-lg border border-[#D8D0C7] bg-white px-2.5 py-2 text-[13px] text-[#261B15] placeholder:text-[#81766E] focus:border-[#8B6A3E] focus:outline-none focus:ring-4 focus:ring-[#F5ECDD]" placeholder="ops@mokshasewa.org, admin@mokshasewa.org"
              value={alertDraft.notifyEmails}
              onChange={(e) => setAlertDraft({ ...alertDraft, notifyEmails: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* delete */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this service?"
        width={420}
        footer={
          <>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#D8D0C7] bg-white px-[15px] py-2 text-[12.5px] font-semibold leading-none text-[#261B15] transition hover:-translate-y-px hover:border-[#C3B8AC] hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={() => setDeleteTarget(null)}>Keep it</button>
            <button className="inline-flex min-h-[38px] items-center justify-center gap-[7px] rounded-[10px] border border-[#A8202B] bg-[#A8202B] px-[15px] py-2 text-[12.5px] font-semibold leading-none text-white transition hover:-translate-y-px hover:bg-[#8A1A23] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0" onClick={confirmDelete} disabled={deleting}>
              <Trash2 size={14} /> {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        <div className="flex gap-[11px]">
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#FAE7E7] text-[#A8202B]">
            <AlertTriangle size={15} />
          </span>
          <div>
            <p className="m-0 font-semibold">{deleteTarget?.name}</p>
            <p className="mb-0 mt-1 text-[#665B53]">
              Its expiry date, credentials and attached bills go with it. If you only want the reminders to stop,
              edit the service and switch reminders off instead.
            </p>
          </div>
        </div>
      </Modal>

      <SystemServiceToasts items={toasts} />
    </div>
  );
}
