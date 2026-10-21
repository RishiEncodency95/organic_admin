"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "./lib/client";
import { companyScopeHeaders } from "./lib/company-scope";
import { INFRA_KEY, useScope } from "./hooks";
import type { DomainAnalytics, FleetResponse, MetricsSeries, MonitoringStatus, ProviderDetails, RangeKey } from "./monitoring-types";

type Query = Record<string, string | number | undefined>;
const clean = (q: Query): Query => Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== ""));
const get = <T,>(companyId: string, path: string, query?: Query, signal?: AbortSignal) =>
  apiClient.request<T>({ method: "GET", path: `/infrastructure${path}`, headers: companyScopeHeaders(companyId), query: query ? clean(query) : undefined, signal });
const send = <T,>(method: "POST" | "PUT" | "DELETE", companyId: string, path: string, body?: unknown) =>
  apiClient.request<T>({ method, path: `/infrastructure${path}`, headers: companyScopeHeaders(companyId), body });

export const monitoringApi = {
  fleet: (c: string, q: Query, s?: AbortSignal) => get<FleetResponse>(c, "/servers/fleet", q, s),
  domainAnalytics: (c: string, s?: AbortSignal) => get<DomainAnalytics>(c, "/domains/analytics", undefined, s),
  fleetMetrics: (c: string, range: RangeKey, s?: AbortSignal) => get<MetricsSeries>(c, "/metrics/fleet", { range }, s),
  status: (c: string, id: string, s?: AbortSignal) => get<MonitoringStatus>(c, `/assets/${id}/monitoring`, undefined, s),
  metrics: (c: string, id: string, range: RangeKey, s?: AbortSignal) => get<MetricsSeries>(c, `/assets/${id}/metrics`, { range }, s),
  providerDetails: (c: string, id: string, s?: AbortSignal) => get<ProviderDetails>(c, `/assets/${id}/provider-details`, undefined, s),
  createCollector: (c: string, id: string, label?: string) => send<{ token: string; ingestPath: string; hint: string; rotated: boolean }>("POST", c, `/assets/${id}/collector`, { label }),
  revokeCollector: (c: string, id: string) => send<{ revoked: boolean }>("DELETE", c, `/assets/${id}/collector`),
  thresholds: (c: string, s?: AbortSignal) => get<Record<string, number>>(c, "/monitoring/thresholds", undefined, s),
  saveThresholds: (c: string, body: Record<string, number>) => send<Record<string, number>>("PUT", c, "/monitoring/thresholds", body),
};

export function useFleet(q: Query) {
  const { companyId, ready } = useScope();
  return useQuery({ queryKey: [INFRA_KEY, companyId, "fleet", q], enabled: ready, queryFn: ({ signal }) => monitoringApi.fleet(companyId, q, signal), placeholderData: keepPreviousData, staleTime: 30_000 });
}
export function useFleetMetrics(range: RangeKey, enabled = true) {
  const { companyId, ready } = useScope();
  return useQuery({ queryKey: [INFRA_KEY, companyId, "fleet-metrics", range], enabled: ready && enabled, queryFn: ({ signal }) => monitoringApi.fleetMetrics(companyId, range, signal), staleTime: 60_000 });
}
/** One status request per minute while the tab is visible (React Query pauses it in background tabs). */
export function useMonitoring(assetId: string, enabled = true) {
  const { companyId, ready } = useScope();
  return useQuery({ queryKey: [INFRA_KEY, companyId, "monitoring", assetId], enabled: ready && enabled && Boolean(assetId), queryFn: ({ signal }) => monitoringApi.status(companyId, assetId, signal), staleTime: 30_000, refetchInterval: 60_000 });
}
export function useMetrics(assetId: string, range: RangeKey, enabled = true) {
  const { companyId, ready } = useScope();
  return useQuery({ queryKey: [INFRA_KEY, companyId, "metrics", assetId, range], enabled: ready && enabled && Boolean(assetId), queryFn: ({ signal }) => monitoringApi.metrics(companyId, assetId, range, signal), placeholderData: keepPreviousData, staleTime: 30_000 });
}
export function useProviderDetails(assetId: string, enabled: boolean) {
  const { companyId, ready } = useScope();
  return useQuery({ queryKey: [INFRA_KEY, companyId, "provider-details", assetId], enabled: ready && enabled, queryFn: ({ signal }) => monitoringApi.providerDetails(companyId, assetId, signal), staleTime: 60_000 });
}
export function useDomainAnalytics() {
  const { companyId, ready } = useScope();
  return useQuery({ queryKey: [INFRA_KEY, companyId, "domain-analytics"], enabled: ready, queryFn: ({ signal }) => monitoringApi.domainAnalytics(companyId, signal), staleTime: 60_000 });
}
export function useThresholds() {
  const { companyId, ready } = useScope();
  return useQuery({ queryKey: [INFRA_KEY, companyId, "thresholds"], enabled: ready, queryFn: ({ signal }) => monitoringApi.thresholds(companyId, signal), staleTime: 5 * 60_000 });
}
