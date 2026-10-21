export type Environment = "PRODUCTION" | "STAGING" | "DEVELOPMENT" | "OTHER";
export type BillingCycle = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY" | "CUSTOM";
export type TriState = "ENABLED" | "DISABLED" | "UNKNOWN";
export type PaymentStatus = "UNKNOWN" | "PAID" | "UNPAID" | "PENDING";
export type CapabilityLevel = "automatic_api" | "automatic_public_lookup" | "manual" | "unsupported" | "authentication_required";

export interface Money {
  currency: string;
  amount: number;
}

export interface DateSource {
  source?: string;
  verifiedAt?: string;
}

export interface Subscription {
  id: string;
  kind: string;
  label: string | null;
  providerName: string | null;
  cycle: BillingCycle;
  customIntervalMonths: number | null;
  autoRenew: TriState;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  renewalDate: string | null;
  expirationDate: string | null;
  graceDays: number | null;
  dateSources: Record<string, DateSource | null>;
  currency: string | null;
  amount: number | null;
  paymentStatus: PaymentStatus | null;
  invoiceRef: string | null;
  billingAccount: string | null;
  notes: string | null;
  billingHidden?: boolean;
}

export interface Certificate {
  id: string;
  assetId: string | null;
  hostname: string;
  port: number;
  commonName: string | null;
  sans: string[];
  issuer: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  state: "VALID" | "EXPIRING" | "EXPIRED" | "UNKNOWN";
  trusted: boolean | null;
  verifyError: string | null;
  autoRenew: TriState;
  lastCheckedAt: string | null;
  lastSuccessAt: string | null;
  lastError: string | null;
  asset?: { id: string; name: string; client: string | null };
}

export interface ServerInfo {
  serverType: string;
  planName: string | null;
  hostname: string | null;
  ipv4: string | null;
  ipv6: string | null;
  additionalIps: string[];
  region: string | null;
  datacenter: string | null;
  operatingSystem: string | null;
  vcpu: number | null;
  ramMb: number | null;
  storageGb: number | null;
  storageType: string | null;
  networkInfo: { providerReported?: Record<string, string | number | boolean | null> } | null;
  providerStatus: string | null;
  providerSuspended: boolean | null;
  providerCreatedAt: string | null;
  lastSyncedAt: string | null;
  syncState: string | null;
}

export interface DomainInfo {
  fqdn: string;
  unicodeName: string | null;
  tld: string;
  registrar: string | null;
  registeredAt: string | null;
  registryExpiresAt: string | null;
  registrarExpiresAt: string | null;
  rdapUpdatedAt: string | null;
  statuses: string[];
  nameservers: string[];
  dnssec: boolean | null;
  rdapSource: string | null;
  rdapState: string;
  rdapError: string | null;
  rdapCheckedAt: string | null;
  dnsState: string;
  dnsError: string | null;
  dnsCheckedAt: string | null;
  alertsEnabled: boolean;
  effectiveExpiry: { date: string | null; source: string; verified: boolean } | null;
}

export interface Asset {
  id: string;
  type: "SERVER" | "DOMAIN" | "HOSTING" | "SSL_CERTIFICATE" | "OTHER";
  name: string;
  technicalId: string | null;
  environment: Environment;
  provider: string | null;
  connection: { id: string; provider: string; label: string } | null;
  remoteId: string | null;
  source: "manual" | "provider_api";
  client: { id: string; name: string } | null;
  shared: boolean;
  ownerName: string | null;
  ownerEmail: string | null;
  tags: string[];
  notes: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  server: ServerInfo | null;
  domain: DomainInfo | null;
  certificates: Certificate[];
  subscriptions: Subscription[];
}

export interface DnsRecordsView {
  A: string[];
  AAAA: string[];
  MX: Array<{ priority: number; exchange: string }>;
  NS: string[];
  CNAME: string[];
  TXT: string[];
  CAA: Array<{ critical: number; tag: string; value: string }>;
  SOA: { nsname: string; hostmaster: string; serial: number } | null;
  DMARC?: string[];
  txtRedacted: boolean;
}

export interface AssetDetail extends Asset {
  relations: Array<{ id: string; kind: string; direction: "in" | "out"; asset: { id: string; name: string; type: string; technicalId: string | null } }>;
  linkedWebsites: Array<{ clientId: string; clientName: string; url: string }>;
  dnsPosture: {
    spf: { present: boolean; qualifier: "fail" | "softfail" | "neutral" | "pass" | "none" | null };
    dmarc: { present: boolean | null; policy: "none" | "quarantine" | "reject" | null };
    caa: { present: boolean; issuers: number };
    mx: { present: boolean };
    dkim: { checked: false; note: string };
  } | null;
  dnsHistory: Array<{ id: string; checkedAt: string; changed: boolean; changes: Array<{ type: string; added: string[]; removed: string[] }>; errors: Record<string, string>; records: DnsRecordsView }>;
  syncHistory: Array<{ id: string; kind: string; status: string; trigger: string; startedAt: string; finishedAt: string | null; stats: Record<string, unknown> | null; error: string | null }>;
  activity: Array<{ id: string; action: string; outcome: string; actor: string; at: string }>;
  billingHistory: Array<{ id: string; kind: string; coversDueDate: string | null; paidAt: string | null; amount: number; currency: string; invoiceRef: string | null; note: string | null; source: string; createdAt: string }>;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface RenewalItem {
  key: string;
  assetId: string;
  assetName: string;
  assetType: string;
  kind: "payment_due" | "service_expiry" | "domain_expiry" | "ssl_expiry";
  date: string;
  daysRemaining: number;
  source: "manual" | "rdap" | "provider_api" | "tls_probe" | "projected";
  verified: boolean;
  label: string;
  subscriptionId: string | null;
  amount: number | null;
  currency: string | null;
  paymentStatus: PaymentStatus | null;
}

export interface Dashboard {
  generatedAt: string;
  totals: {
    servers: number;
    domains: number;
    sslCertificates: number;
    hostingSubscriptions: number;
    connectedProviders: number;
    expiringWithin7Days: number;
    expiringWithin30Days: number;
    overdueOrExpired: number;
    unknownRenewalDates: number;
    openAlerts: number;
    runningServers: number;
    monitoredServers: number;
    serversNeedingAttention: number;
  };
  upcoming: RenewalItem[];
  domainExpiryTimeline: Array<{ month: string; count: number }>;
  serverDistribution: { byProvider: Array<{ provider: string; count: number }>; byEnvironment: Array<{ environment: string; count: number }> };
  inventory: { total: number; imported: number; manual: number };
  alerts: Array<{ id: string; kind: string; state: string; severity: string; title: string; raisedAt: string; asset: { id: string; name: string; type: string } }>;
  recentSync: Array<{ id: string; kind: string; status: string; trigger: string; startedAt: string; finishedAt: string | null; error: string | null }>;
  failedChecks: Array<{ assetId: string | null; name: string; check: string; detail: string | null }>;
  certificateStates: Record<string, number>;
  byClient: Array<{ clientId: string | null; name: string; servers: number; domains: number; certificates: number; monthlyCost: Money[] | null }>;
  billing?: {
    monthlyEquivalent: Money[];
    yearlyEquivalent: Money[];
    upcomingPayments30Days: Money[];
    monthlyProjection: Array<{ month: string; totals: Money[] }>;
    byProvider: Array<{ provider: string; monthly: Money[] }>;
    excluded: { unknownAmount: number; unknownCycle: number; unknownNextDue: number };
    note: string;
  };
}

export interface SubscriptionRow {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  client: string;
  provider: string | null;
  kind: string;
  label: string | null;
  cycle: BillingCycle;
  customIntervalMonths: number | null;
  autoRenew: TriState;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  renewalDate: string | null;
  expirationDate: string | null;
  dateSources: Record<string, DateSource | null>;
  currency?: string;
  amount?: number | null;
  paymentStatus?: PaymentStatus;
  invoiceRef?: string | null;
  billingAccount?: string | null;
  notes?: string | null;
  billingHidden?: boolean;
}

export interface ProviderCatalogueEntry {
  key: string;
  label: string;
  live: boolean;
  capabilities: Record<"inventory" | "configuration" | "networking" | "billing" | "utilization", CapabilityLevel>;
  credentialFields: Array<{ key: string; label: string; secret: boolean }>;
  docsUrl: string | null;
}

export interface Connection {
  id: string;
  provider: string;
  providerLabel: string;
  label: string;
  status: "PENDING_CREDENTIALS" | "CONNECTED" | "AUTH_FAILED" | "ERROR" | "DISCONNECTED";
  credentialsSaved: boolean;
  credentialHint: Record<string, string> | null;
  capabilities: ProviderCatalogueEntry["capabilities"] | null;
  importedAssets: number;
  lastTestedAt: string | null;
  lastSyncAt: string | null;
  lastSuccessfulSyncAt: string | null;
  lastErrorCode: string | null;
  lastError: string | null;
  disconnectedAt: string | null;
  createdAt: string;
}

export interface RemoteInstance {
  remoteId: string;
  name: string;
  hostname: string | null;
  ipv4: string | null;
  ipv6: string | null;
  region: string | null;
  vcpu: number | null;
  ramMb: number | null;
  storageGb: number | null;
  planName: string | null;
  providerStatus: string | null;
  imported: boolean;
  assetId: string | null;
}

export interface InfraAlert {
  id: string;
  kind: string;
  state: "OPEN" | "ACKNOWLEDGED" | "SNOOZED" | "RESOLVED";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  thresholdDays: number | null;
  targetDate: string | null;
  raisedAt: string;
  acknowledgedAt: string | null;
  snoozedUntil: string | null;
  resolvedAt: string | null;
  delivery: { deliveredAt: string | null; attempts: number; error: string | null; summary: Record<string, unknown> | null };
  asset: { id: string; name: string; type: string; technicalId: string | null };
}

export interface InfraSettings {
  thresholdDays: number[];
  inAppEnabled: boolean;
  emailEnabled: boolean;
  extraRecipients: string[];
  emailTransportConfigured: boolean;
  quietHours: { supported: boolean };
  whatsapp: { supported: boolean; reason: string };
}

export interface InfraCapabilities {
  billingRead: boolean;
  sensitiveDns: boolean;
  /** False when the server cannot store provider credentials (no ENCRYPTION_MASTER_KEY). */
  encryptionConfigured?: boolean;
  permissions?: { manage: boolean; billingRead: boolean; billingWrite: boolean; integrationsRead: boolean; integrationsWrite: boolean };
}
