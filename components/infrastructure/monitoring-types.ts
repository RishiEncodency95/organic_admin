import type { Environment } from "./types";

export type CollectorState = "not_configured" | "pending" | "online" | "stale" | "offline" | "revoked";
export type HealthStatus = "ok" | "warning" | "critical" | "unknown";
export type RangeKey = "1h" | "6h" | "24h" | "7d" | "30d";

export interface HealthDimension {
  key: string;
  label: string;
  status: HealthStatus;
  reason: string;
}

export interface Filesystem {
  mount: string;
  fstype: string | null;
  totalBytes: number;
  usedBytes: number;
  usedPct: number;
  inodesUsedPct: number | null;
  readOnly: boolean | null;
}

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string | null;
  health: string | null;
  restartCount: number | null;
  cpuPct: number | null;
  memBytes: number | null;
  memLimitBytes: number | null;
  startedAt: string | null;
}

export interface MonitoringStatus {
  assetId: string;
  state: CollectorState;
  collector: {
    configured: boolean;
    revoked: boolean;
    tokenHint: string;
    label: string | null;
    agentVersion: string | null;
    createdAt: string | null;
    rotatedAt: string | null;
    lastSeenAt: string | null;
    lastSampleAt: string | null;
    rejectedSamples: number;
    sampleAgeSeconds: number | null;
  } | null;
  host: { hostname: string | null; os: string | null; kernel: string | null; arch: string | null; bootTime: string | null; cpuCores: number | null } | null;
  latest: {
    at: string;
    cpuPct: number | null;
    cpuUserPct: number | null;
    cpuSystemPct: number | null;
    cpuIowaitPct: number | null;
    cpuStealPct: number | null;
    load: Array<number | null>;
    memTotalBytes: number | null;
    memAvailBytes: number | null;
    memCachedBytes: number | null;
    swapTotalBytes: number | null;
    swapUsedBytes: number | null;
    memUsedPct: number | null;
    swapUsedPct: number | null;
    diskMaxUsedPct: number | null;
    filesystems: Filesystem[];
    diskReadBps: number | null;
    diskWriteBps: number | null;
    netRxBps: number | null;
    netTxBps: number | null;
    netErrPerSec: number | null;
    netDropPerSec: number | null;
    uptimeSec: number | null;
  } | null;
  report: {
    containers: ContainerInfo[];
    services: Array<{ name: string; state: string }>;
    security: { rebootRequired: boolean | null; pendingUpdates: number | null; securityUpdates: number | null; firewall: string | null; listeningPorts: Array<{ port: number; proto: string }> } | null;
  } | null;
  health: { overall: HealthStatus; confidence: "high" | "medium" | "low"; dimensions: HealthDimension[]; collectorState: CollectorState };
  thresholds: Record<string, number>;
  alerts: Array<{ id: string; kind: string; state: string; severity: string; title: string; raisedAt: string }>;
  nextBilling: { date: string; daysRemaining: number; kind: string; verified: boolean } | null;
}

export type MetricPoint = Record<string, number | null> & { t: number; samples: number };

export interface MetricsSeries {
  range: RangeKey;
  bucketSeconds: number;
  points: MetricPoint[];
  bucketsWithData?: number;
  bucketsTotal?: number;
  serversReporting?: number;
}

export interface FleetRow {
  id: string;
  name: string;
  technicalId: string | null;
  environment: Environment;
  provider: string | null;
  imported: boolean;
  client: string | null;
  clientId: string | null;
  providerStatus: string | null;
  providerSuspended: boolean | null;
  region: string | null;
  ipv4: string | null;
  plan: string | null;
  vcpu: number | null;
  ramMb: number | null;
  storageGb: number | null;
  lastSyncedAt: string | null;
  syncState: string | null;
  monitoring: CollectorState;
  cpuPct: number | null;
  memPct: number | null;
  diskPct: number | null;
  lastMetricsAt: string | null;
  openAlerts: number;
  nextRenewal: { date: string | null; daysRemaining: number; kind: string } | null;
}

export interface FleetResponse {
  summary: {
    total: number;
    running: number;
    stopped: number;
    otherStatus: number;
    noStatus: number;
    monitored: number;
    pendingSetup: number;
    unmonitored: number;
    collectorOffline: number;
    needingAttention: number;
    cpuPressure: number;
    memoryPressure: number;
    diskPressure: number;
    renewalsWithin30Days: number;
    byProvider: Array<{ label: string; value: number }>;
    byRegion: Array<{ label: string; value: number }>;
    byStatus: Array<{ label: string; value: number }>;
  };
  items: FleetRow[];
  total: number;
  page: number;
  limit: number;
}

export interface ProviderDetails {
  available: boolean;
  reason: string | null;
  message: string | null;
  snapshots: Array<{ id: string; name: string | null; description: string | null; createdAt: string | null; autoDeleteAt: string | null; imageName: string | null }>;
  audits: Array<{ id: string; action: string; at: string | null; actor: string | null; changedFields: string[] }>;
  errors: string[];
}

export interface DomainAnalytics {
  totals: { domains: number; withKnownExpiry: number; unknownExpiry: number; dnssecSigned: number; dnssecUnsigned: number };
  expiryWindows: Array<{ label: string; value: number }>;
  registrars: Array<{ label: string; value: number }>;
  portfolioGrowth: Array<{ month: string; added: number; total: number }>;
  checkHistory: Array<{ day: string; dnsOk: number; dnsFailed: number; rdapOk: number; rdapFailed: number }>;
  dnsChanges: Array<{ id: string; assetId: string; domain: string; at: string; types: string[] }>;
  certificates: Record<string, number>;
}
