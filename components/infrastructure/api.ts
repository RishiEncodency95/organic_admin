import { apiClient } from "./lib/client";
import { companyScopeHeaders } from "./lib/company-scope";
import type {
  Asset, AssetDetail, Certificate, Connection, Dashboard, InfraAlert, InfraCapabilities, InfraSettings, Paged, ProviderCatalogueEntry, RemoteInstance, RenewalItem, SubscriptionRow,
} from "./types";

type Query = Record<string, string | number | undefined>;
const clean = (query: Query): Query => Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ""));

const h = (companyId: string) => companyScopeHeaders(companyId);
const get = <T,>(companyId: string, path: string, query?: Query, signal?: AbortSignal) =>
  apiClient.request<T>({ method: "GET", path: `/infrastructure${path}`, headers: h(companyId), query: query ? clean(query) : undefined, signal });
const send = <T,>(method: "POST" | "PATCH" | "PUT" | "DELETE", companyId: string, path: string, body?: unknown) =>
  apiClient.request<T>({ method, path: `/infrastructure${path}`, headers: h(companyId), body });

export const infraApi = {
  dashboard: (c: string, s?: AbortSignal) => get<Dashboard>(c, "/dashboard", undefined, s),
  capabilities: (c: string, s?: AbortSignal) => get<InfraCapabilities>(c, "/capabilities", undefined, s),
  servers: (c: string, q: Query, s?: AbortSignal) => get<Paged<Asset>>(c, "/servers", q, s),
  domains: (c: string, q: Query, s?: AbortSignal) => get<Paged<Asset>>(c, "/domains", q, s),
  asset: (c: string, id: string, s?: AbortSignal) => get<AssetDetail>(c, `/assets/${id}`, undefined, s),
  createServer: (c: string, body: Record<string, unknown>) => send<Asset>("POST", c, "/servers", body),
  createDomain: (c: string, body: Record<string, unknown>) => send<Asset>("POST", c, "/domains", body),
  bulkDomains: (c: string, body: { domains: string[]; clientId?: string | null; environment?: string }) =>
    send<{ results: Array<{ input: string; status: "created" | "duplicate" | "invalid"; message?: string }>; created: number }>("POST", c, "/domains/bulk", body),
  bulkRefresh: (c: string, assetIds: string[]) => send<{ queued: number; deduplicated: boolean }>("POST", c, "/domains/refresh", { assetIds }),
  updateAsset: (c: string, id: string, body: Record<string, unknown>) => send<Asset>("PATCH", c, `/assets/${id}`, body),
  archive: (c: string, id: string) => send<{ id: string }>("POST", c, `/assets/${id}/archive`),
  restore: (c: string, id: string) => send<{ id: string }>("POST", c, `/assets/${id}/restore`),
  remove: (c: string, id: string) => send<{ id: string }>("DELETE", c, `/assets/${id}`),
  refresh: (c: string, id: string) => send<Record<string, unknown>>("POST", c, `/assets/${id}/refresh`),
  link: (c: string, id: string, body: { toAssetId: string; kind: string }) => send<{ id: string }>("POST", c, `/assets/${id}/links`, body),
  unlink: (c: string, id: string, relationId: string) => send<{ removed: boolean }>("DELETE", c, `/assets/${id}/links/${relationId}`),
  certificates: (c: string, s?: AbortSignal) => get<Certificate[]>(c, "/certificates", undefined, s),
  addCertificate: (c: string, body: { assetId: string; hostname: string; port?: number }) => send<{ id: string }>("POST", c, "/certificates", body),
  refreshCertificate: (c: string, id: string) => send<Record<string, unknown>>("POST", c, `/certificates/${id}/refresh`),
  subscriptions: (c: string, s?: AbortSignal) => get<SubscriptionRow[]>(c, "/subscriptions", undefined, s),
  saveSubscription: (c: string, id: string | null, body: Record<string, unknown>) => (id ? send<{ id: string }>("PATCH", c, `/subscriptions/${id}`, body) : send<{ id: string }>("POST", c, "/subscriptions", body)),
  archiveSubscription: (c: string, id: string) => send<{ id: string }>("DELETE", c, `/subscriptions/${id}`),
  confirmPayment: (c: string, id: string, body: Record<string, unknown>) => send<{ nextDueDate: string | null; advanced: boolean }>("POST", c, `/subscriptions/${id}/payments`, body),
  addAdjustment: (c: string, id: string, body: Record<string, unknown>) => send<{ id: string }>("POST", c, `/subscriptions/${id}/adjustments`, body),
  renewals: (c: string, q: Query, s?: AbortSignal) => get<{ generatedAt: string; items: RenewalItem[]; total: number }>(c, "/renewals", q, s),
  paymentHistory: (c: string, s?: AbortSignal) => get<Array<{ month: string; totals: Array<{ currency: string; amount: number }> }>>(c, "/billing/payments", undefined, s),
  providers: (c: string, s?: AbortSignal) => get<{ connections: Connection[]; providers: ProviderCatalogueEntry[] }>(c, "/providers", undefined, s),
  createConnection: (c: string, body: { provider: string; label: string; credentials?: Record<string, string> }) => send<Connection>("POST", c, "/providers/connections", body),
  replaceCredentials: (c: string, id: string, credentials: Record<string, string>) => send<Connection>("PUT", c, `/providers/connections/${id}/credentials`, { credentials }),
  testConnection: (c: string, id: string) => send<Connection>("POST", c, `/providers/connections/${id}/test`),
  syncConnection: (c: string, id: string) => send<{ status: string; seen: number; updated: number; created: number; notListed: number; errors: string[] }>("POST", c, `/providers/connections/${id}/sync`),
  instances: (c: string, id: string) => get<{ partial: boolean; errors: string[]; instances: RemoteInstance[] }>(c, `/providers/connections/${id}/instances`),
  importInstances: (c: string, id: string, body: { remoteIds?: string[]; all?: boolean; clientId?: string | null; environment?: string }) =>
    send<{ created: number; skipped: number; notFound: number; partial: boolean }>("POST", c, `/providers/connections/${id}/import`, body),
  disconnect: (c: string, id: string) => send<{ id: string }>("DELETE", c, `/providers/connections/${id}`),
  alerts: (c: string, q: Query, s?: AbortSignal) => get<Paged<InfraAlert> & { openCount: number }>(c, "/alerts", q, s),
  alertAction: (c: string, id: string, body: { action: string; snoozeDays?: number }) => send<{ id: string; state: string }>("POST", c, `/alerts/${id}/action`, body),
  settings: (c: string, s?: AbortSignal) => get<InfraSettings>(c, "/settings", undefined, s),
  saveSettings: (c: string, body: Partial<Pick<InfraSettings, "thresholdDays" | "inAppEnabled" | "emailEnabled" | "extraRecipients">>) => send<InfraSettings>("PUT", c, "/settings", body),
  exportUrl: (what: "domains" | "servers" | "renewals") => `/infrastructure/export/${what}`,
};
