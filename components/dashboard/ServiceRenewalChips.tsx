"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Globe2, Server } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { externalServiceApi } from "@/lib/externalServiceApi";
import { ExternalService } from "@/lib/types";
import { daysRemaining } from "@/lib/systemServiceUtils";

const FALLBACK_EXPIRY = "2027-05-31T00:00:00.000Z";

/** Mirrors the Topbar's urgency cut-off: amber once a service is inside its last two weeks. */
const URGENT_DAYS = 14;

const PALETTES = {
  expired: {
    chip: "border-red-200 bg-red-50/70 hover:border-red-300",
    icon: "border-red-200 bg-white text-red-500",
    digit: "text-red-600",
    suffix: "text-red-600",
  },
  urgent: {
    chip: "border-amber-200 bg-amber-50/70 hover:border-amber-300",
    icon: "border-amber-200 bg-white text-amber-600",
    digit: "text-amber-600",
    suffix: "text-amber-600",
  },
  safe: {
    chip: "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300",
    icon: "border-emerald-200 bg-white text-emerald-600",
    digit: "text-emerald-600",
    suffix: "text-emerald-600",
  },
} as const;

function RenewalChip({
  label,
  name,
  icon: Icon,
  expiryDate,
  onClick,
}: {
  label: string;
  name: string;
  icon: typeof Globe2;
  expiryDate: string;
  onClick: () => void;
}) {
  // false on the server, true in the browser — keeps Date.now() math out of hydration
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const days = daysRemaining(expiryDate);
  const expired = days < 0;
  const palette = expired
    ? PALETTES.expired
    : days <= URGENT_DAYS
      ? PALETTES.urgent
      : PALETTES.safe;

  return (
    <button
      type="button"
      onClick={onClick}
      suppressHydrationWarning
      title={mounted ? `${name} — renews ${new Date(expiryDate).toLocaleDateString()}` : name}
      className={`group inline-flex h-[54px] items-center gap-3 rounded-lg border px-3 pr-4 text-left shadow-sm transition-all hover:-translate-y-px hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#23471d] ${palette.chip}`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${palette.icon}`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex items-baseline gap-3 whitespace-nowrap">
        <span className="text-[15px] font-semibold tracking-tight text-slate-800">
          {label} Renewal
        </span>
        <span
          className={`font-mono text-[17px] font-semibold leading-none tabular-nums ${palette.digit}`}
          suppressHydrationWarning
        >
          {mounted ? String(expired ? 0 : days).padStart(2, "0") : "00"}
        </span>
        <span className={`-ml-1.5 text-[15px] font-semibold ${palette.suffix}`}>
          {expired ? "Expired" : "Days left"}
        </span>
      </span>
      <ChevronRight className="ml-5 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

/** Domain & hosting renewal chips shown on the right of the Dashboard page title.
 *  Moved here from the Topbar's centre cluster. */
export default function ServiceRenewalChips() {
  const router = useRouter();
  const admin = useAppSelector((state) => state.auth.admin);
  const isInternal = !admin || admin.userType === "INTERNAL";

  const [externalServices, setExternalServices] = useState<ExternalService[]>([]);

  useEffect(() => {
    if (!isInternal) return;

    externalServiceApi
      .summary()
      .then(setExternalServices)
      .catch(() => setExternalServices([]));
  }, [isInternal]);

  const byExpiry = (a: ExternalService, b: ExternalService) =>
    daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate);

  const hostingService = externalServices
    .filter((service) => service.category === "HOSTING")
    .sort(byExpiry)[0];

  const domainService = externalServices
    .filter((service) => service.category === "DOMAIN")
    .sort(byExpiry)[0];

  const domainExpiryDate = domainService?.expiryDate ?? FALLBACK_EXPIRY;
  const hostingExpiryDate = hostingService?.expiryDate ?? FALLBACK_EXPIRY;

  const goToServices = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("moksha_system_services_grant");
      sessionStorage.removeItem("moksha_system_services_expires_at");
      sessionStorage.removeItem("bharat_organic_system_services_grant");
    }
    router.push("/system-services");
  };

  return (
    <div className="hidden items-center gap-3 sm:flex">
      <RenewalChip
        label="Domain"
        name={domainService?.name || "bharatorganicexpo.com"}
        icon={Globe2}
        expiryDate={domainExpiryDate}
        onClick={goToServices}
      />
      <RenewalChip
        label="Hosting"
        name={hostingService?.name || "Server Hosting"}
        icon={Server}
        expiryDate={hostingExpiryDate}
        onClick={goToServices}
      />
    </div>
  );
}
