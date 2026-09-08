"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Bell,
  AlertTriangle,
  HeartHandshake,
  Mail,
  FolderKanban,
  HandHeart,
  CheckCheck,
  CalendarDays,
  Check,
  ArrowUpRight,
  Server,
  Globe2,
  LayoutGrid,
  CreditCard,
  ShieldCheck,
  Database,
  Cloud,
  Sparkles,
  BarChart3,
  Network,
  Share2,
  Plug,
  Package,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { casesApi, SlaBreach } from "@/lib/casesApi";
import {
  adminNotificationsApi,
  AdminNotificationItem,
  AdminNotificationType,
} from "@/lib/adminNotificationsApi";
import { ApiRequestError } from "@/lib/api";
import { externalServiceApi } from "@/lib/externalServiceApi";
import { settingsApi } from "@/lib/settingsApi";
import { ExternalService, Settings } from "@/lib/types";
import {
  daysRemaining,
  isWithinPopupThreshold,
  useCountdown,
  formatCountdown,
} from "@/lib/systemServiceUtils";
import { NAV_SECTIONS } from "./navigation";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const EXPIRY_POPUP_DISMISS_KEY = "ms_admin_expiry_popup_dismissed_on";

/** A service is "urgent" once it is expired or inside its last two weeks. */
const URGENT_DAYS = 14;

const NOTIFICATION_ICONS: Record<AdminNotificationType, typeof HeartHandshake> = {
  DONATION: HeartHandshake,
  ENQUIRY: Mail,
  CASE: FolderKanban,
  VOLUNTEER: HandHeart,
  SYSTEM_EXPIRY: AlertTriangle,
};

type CategoryIcon = ComponentType<{ className?: string }>;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#25D366" d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2 22l5.2-1.5A10 10 0 1 0 12 2Z" />
      <path fill="#fff" d="M17.4 14.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.6c.1-.2 0-.4 0-.6l-1-2.2c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" />
    </svg>
  );
}

const SERVICE_CATEGORY_META: Record<ExternalService["category"], { icon: CategoryIcon; tone: string }> = {
  DOMAIN: { icon: Globe2, tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  HOSTING: { icon: Server, tone: "bg-blue-50 text-blue-700 ring-blue-200" },
  SSL_CERTIFICATE: { icon: ShieldCheck, tone: "bg-cyan-50 text-cyan-700 ring-cyan-200" },
  PAYMENT_GATEWAY: { icon: CreditCard, tone: "bg-violet-50 text-violet-700 ring-violet-200" },
  EMAIL_SMTP: { icon: Mail, tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  SMS_WHATSAPP: { icon: WhatsAppIcon, tone: "bg-green-50 text-green-700 ring-green-200" },
  MEDIA_STORAGE: { icon: Cloud, tone: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  AI_API: { icon: Sparkles, tone: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200" },
  ANALYTICS: { icon: BarChart3, tone: "bg-orange-50 text-orange-700 ring-orange-200" },
  DATABASE: { icon: Database, tone: "bg-teal-50 text-teal-700 ring-teal-200" },
  CDN: { icon: Network, tone: "bg-purple-50 text-purple-700 ring-purple-200" },
  SOFTWARE_LICENSE: { icon: KeyRound, tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  SOCIAL_MEDIA: { icon: Share2, tone: "bg-pink-50 text-pink-700 ring-pink-200" },
  API_SERVICE: { icon: Plug, tone: "bg-rose-50 text-rose-700 ring-rose-200" },
  OTHER: { icon: Package, tone: "bg-slate-100 text-slate-700 ring-slate-200" },
};

const DATE_OPTIONS = [
  "31 May 2026",
  "30 May 2026",
  "29 May 2026",
  "28 May 2026",
  "27 May 2026",
];

const FAR_FUTURE = "2099-01-01T00:00:00.000Z";

type Countdown = ReturnType<typeof useCountdown>;

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);

  if (minutes < 1) return "just now";

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

function currentPageTitle(pathname: string): string {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (
        item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
      ) {
        return item.label;
      }
    }
  }

  return "Bharat Organic Expo Admin";
}

/** The nav's own label is one word per module ("Pages & CMS") — too coarse once you're two levels
 * deep in that module (add/edit/view a specific page). Returns the extra trailing segment for
 * those routes so the Topbar heading reads "Pages & CMS > Add New Page" instead of just
 * "Pages & CMS" no matter which page within the module you're on. */
function pagesSubRouteLabel(pathname: string): string | null {
  if (pathname === "/pages/new") return "Add New Page";
  if (/^\/pages\/[^/]+\/edit$/.test(pathname)) return "Edit Page";
  if (/^\/pages\/[^/]+$/.test(pathname)) return "View Page";
  return null;
}

/** One renewal clock inside the status cluster. Kept deliberately quiet: the countdown is the
 * content, the icon and the small label only say which clock you are looking at. */
function ServiceClock({
  label,
  name,
  icon: Icon,
  countdown,
  expiryDate,
  onClick,
}: {
  label: string;
  name: string;
  icon: typeof Globe2;
  countdown: Countdown;
  expiryDate: string;
  onClick: () => void;
}) {
  const days = daysRemaining(expiryDate);
  const urgent = countdown.isExpired || days <= URGENT_DAYS;
  const palette = countdown.isExpired
    ? { card: "border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-50 hover:border-red-300", label: "text-red-700", digit: "text-red-700", unit: "text-red-600", dot: "animate-pulse bg-red-500", icon: "border-red-200 bg-red-50 text-red-600", live: "bg-red-100 text-red-700" }
    : urgent
      ? { card: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 hover:border-amber-300", label: "text-amber-700", digit: "text-amber-700", unit: "text-amber-600", dot: "animate-pulse bg-amber-500", icon: "border-amber-200 bg-amber-50 text-amber-600", live: "bg-amber-100 text-amber-700" }
      : { card: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 hover:border-emerald-300", label: "text-emerald-700", digit: "text-emerald-700", unit: "text-emerald-600", dot: "bg-emerald-500", icon: "border-emerald-200 bg-emerald-50 text-emerald-600", live: "bg-emerald-100 text-emerald-700" };
  const parts = [
    { value: countdown.days, unit: "Days" },
    { value: countdown.hours, unit: "Hours" },
    { value: countdown.minutes, unit: "Mins" },
    { value: countdown.seconds, unit: "Secs" },
  ];

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${name} — renews ${new Date(expiryDate).toLocaleDateString()}`}
      className={`group flex h-[46px] min-w-[210px] items-center gap-2 rounded-none border px-2.5 text-left shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-px hover:shadow-[0_7px_20px_rgba(15,23,42,0.10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${palette.card}`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-none border shadow-inner ${palette.icon}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-0.5 flex items-center justify-between gap-2">
          <span className={`truncate text-[10px] font-semibold ${palette.label}`}>{label} Renews In</span>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-none px-2 py-0.5 text-[8px] font-semibold ${palette.live}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
            {countdown.isExpired ? "Expired" : "Live"}
          </span>
        </span>
        <span className="grid grid-cols-4 divide-x divide-current/15">
          {parts.map((part) => (
            <span key={part.unit} className={`flex flex-col items-center justify-center px-1 ${palette.digit}`}>
              <span className="font-mono text-[12px] font-semibold leading-none tabular-nums">{String(part.value).padStart(2, "0")}</span>
              <small className={`mt-0.5 text-[5.5px] font-semibold uppercase leading-none tracking-wide ${palette.unit}`}>{part.unit}</small>
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const admin = useAppSelector((state) => state.auth.admin);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [expiringOpen, setExpiringOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]);

  const [breaches, setBreaches] = useState<SlaBreach[]>([]);

  const [externalServices, setExternalServices] = useState<ExternalService[]>([]);
  const [systemSettings, setSystemSettings] = useState<Settings | null>(null);
  const [expiryPopupOpen, setExpiryPopupOpen] = useState(false);

  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [passwordSaving, setPasswordSaving] = useState(false);

  const [passwordError, setPasswordError] = useState("");

  const isInternal = !admin || admin.userType === "INTERNAL";

  const isDashboard = pathname === "/";

  const firstName = admin?.name?.split(" ")[0] || "Admin";

  const initials = admin?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const displayName = firstName;

  const displayRole =
    admin?.roleSlug
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "Super Admin";

  const loadNotifications = useCallback(() => {
    if (!isInternal) return;

    adminNotificationsApi
      .list()
      .then(({ notifications, unreadCount }) => {
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  }, [isInternal]);

  useEffect(() => {
    if (!isInternal) return;

    casesApi
      .slaBreaches()
      .then(setBreaches)
      .catch(() => setBreaches([]));

    loadNotifications();

    externalServiceApi
      .summary()
      .then(setExternalServices)
      .catch(() => setExternalServices([]));

    settingsApi
      .getSystemAlerts()
      .then(setSystemSettings)
      .catch(() => setSystemSettings(null));
  }, [isInternal, loadNotifications]);

  const byExpiry = (a: ExternalService, b: ExternalService) =>
    daysRemaining(a.expiryDate) - daysRemaining(b.expiryDate);

  const expiringServices = externalServices
    .filter((service) => isWithinPopupThreshold(service, systemSettings))
    .sort(byExpiry);

  const hostingService = externalServices
    .filter((service) => service.category === "HOSTING")
    .sort(byExpiry)[0];

  const domainService = externalServices
    .filter((service) => service.category === "DOMAIN")
    .sort(byExpiry)[0];

  const otherServices = externalServices
    .filter(
      (service) =>
        service.category !== "HOSTING" && service.category !== "DOMAIN"
    )
    .sort(byExpiry);

  const hostingCountdown = useCountdown(hostingService?.expiryDate ?? FAR_FUTURE);
  const domainCountdown = useCountdown(domainService?.expiryDate ?? FAR_FUTURE);

  const urgentOtherCount = otherServices.filter(
    (service) => daysRemaining(service.expiryDate) <= URGENT_DAYS
  ).length;
  const expiredOtherCount = otherServices.filter(
    (service) => daysRemaining(service.expiryDate) < 0
  ).length;

  const hasClusterContent =
    Boolean(domainService) || Boolean(hostingService) || otherServices.length > 0;

  useEffect(() => {
    if (!isInternal || expiringServices.length === 0) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    const dismissedOn =
      typeof window !== "undefined"
        ? window.localStorage.getItem(EXPIRY_POPUP_DISMISS_KEY)
        : todayKey;

    if (dismissedOn !== todayKey) {
      setExpiryPopupOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInternal, expiringServices.length]);

  const dismissExpiryPopup = () => {
    setExpiryPopupOpen(false);
    window.localStorage.setItem(
      EXPIRY_POPUP_DISMISS_KEY,
      new Date().toISOString().slice(0, 10)
    );
  };

  const goToServices = () => {
    setExpiringOpen(false);
    router.push("/system-services");
  };

  const handleExpiringClick = () => {
    setExpiringOpen((value) => !value);

    setDateOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
  };

  const handleDateClick = () => {
    setDateOpen((value) => !value);

    setExpiringOpen(false);
    setNotifOpen(false);
    setMenuOpen(false);
  };

  const handleBellClick = () => {
    setExpiringOpen(false);
    setDateOpen(false);
    setMenuOpen(false);

    setNotifOpen((value) => {
      if (!value) {
        loadNotifications();
      }

      return !value;
    });
  };

  const handleProfileClick = () => {
    setExpiringOpen(false);
    setDateOpen(false);
    setNotifOpen(false);

    setMenuOpen((value) => !value);
  };

  const handleNotificationClick = async (notification: AdminNotificationItem) => {
    setNotifOpen(false);

    setNotifications((previous) =>
      previous.filter((item) => item._id !== notification._id)
    );

    setUnreadCount((previous) => Math.max(0, previous - 1));

    adminNotificationsApi.markRead(notification._id).catch(() => { });

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications([]);
    setUnreadCount(0);

    adminNotificationsApi.markAllRead().catch(() => { });
  };

  const bellBadgeCount = breaches.length + unreadCount;

  const handleLogout = async () => {
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }

    dispatch(logout());

    router.push("/login");
  };

  const handleChangePassword = async () => {
    setPasswordSaving(true);
    setPasswordError("");

    try {
      await authApi.changePassword(currentPassword, newPassword);

      dispatch(logout());

      router.push("/login?passwordChanged=1");
    } catch (err) {
      setPasswordError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <header className="relative z-30 flex h-[62px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-900/5 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          {isDashboard ? (
            <div className="min-w-[238px]">
              <div className="rounded-none border border-blue-100 bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-white px-3 py-1.5 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
                <h1 className="truncate text-[14px] font-semibold leading-none tracking-tight text-slate-900">
                  Welcome back, <span className="text-[#118AB2]">{firstName}</span>
                </h1>
                <p className="mt-1 hidden truncate text-[9.5px] font-semibold leading-none text-[#133458] sm:block">
                  Everything is ready for you
                </p>
              </div>
            </div>
          ) : pagesSubRouteLabel(pathname) ? (
            <h1 className="flex min-w-0 items-center gap-1.5 text-[15px] font-semibold tracking-tight">
              <span className="truncate text-slate-500">
                {currentPageTitle(pathname)}
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              <span className="truncate text-slate-900">
                {pagesSubRouteLabel(pathname)}
              </span>
            </h1>
          ) : (
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
              {currentPageTitle(pathname)}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Renewal clocks + everything else that expires, in one quiet cluster. */}
          {hasClusterContent && (
            <div className="relative hidden items-center gap-1 lg:flex">
              {domainService && (
                <ServiceClock
                  label="Domain"
                  name={domainService.name}
                  icon={Globe2}
                  countdown={domainCountdown}
                  expiryDate={domainService.expiryDate}
                  onClick={goToServices}
                />
              )}

              {domainService && hostingService && (
                <span className="h-6 w-px bg-slate-200" />
              )}

              {hostingService && (
                <ServiceClock
                  label="Hosting"
                  name={hostingService.name}
                  icon={Server}
                  countdown={hostingCountdown}
                  expiryDate={hostingService.expiryDate}
                  onClick={goToServices}
                />
              )}

              {otherServices.length > 0 && (
                <>
                  {(domainService || hostingService) && (
                    <span className="h-6 w-px bg-slate-200" />
                  )}

                  <button
                    type="button"
                    onClick={handleExpiringClick}
                    aria-label={`Other services (${otherServices.length})`}
                    aria-expanded={expiringOpen}
                    title={`${otherServices.length} other services`}
                    className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${expiringOpen
                      ? "bg-slate-900/5 text-slate-900"
                      : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-900"
                      }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span
                      className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-white px-1 text-[9px] font-semibold text-white ${expiredOtherCount > 0 ? "bg-red-600" : urgentOtherCount > 0 ? "bg-amber-500" : "bg-slate-400"
                        }`}
                    >
                      {otherServices.length > 9 ? "9+" : otherServices.length}
                    </span>
                  </button>
                </>
              )}

              {expiringOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close services menu"
                    onClick={() => setExpiringOpen(false)}
                  />

                  <div className="absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white py-1 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">
                    <p className="px-3 py-2 text-[11px] font-semibold text-slate-900">
                      Other services
                    </p>

                    <div className="max-h-72 overflow-y-auto">
                      {otherServices.map((service) => {
                        const days = daysRemaining(service.expiryDate);
                        const categoryMeta = SERVICE_CATEGORY_META[service.category] ?? SERVICE_CATEGORY_META.OTHER;
                        const ServiceIcon = categoryMeta.icon;

                        return (
                          <button
                            key={service._id}
                            type="button"
                            onClick={goToServices}
                            className={`flex w-full items-center justify-between gap-3 border-l-[3px] px-3 py-2 text-left text-xs font-medium text-slate-600 transition-colors ${days < 0 ? "border-l-red-500 bg-red-50/80 hover:bg-red-100/70" : days <= URGENT_DAYS ? "border-l-amber-400 bg-amber-50/80 hover:bg-amber-100/70" : "border-l-transparent hover:bg-slate-900/5"}`}
                          >
                            <span className="flex min-w-0 items-center gap-2.5">
                              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${categoryMeta.tone}`}>
                                <ServiceIcon className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className={`block truncate font-semibold ${days < 0 ? "text-red-800" : days <= URGENT_DAYS ? "text-amber-900" : "text-slate-800"}`}>{service.name}</span>
                                <span className="mt-0.5 block text-[9px] font-medium capitalize text-slate-400">{service.category.replaceAll("_", " ").toLowerCase()}</span>
                              </span>
                            </span>
                            <span
                              className={`shrink-0 font-mono tabular-nums ${days < 0
                                ? "text-red-600"
                                : days <= URGENT_DAYS
                                  ? "text-amber-700"
                                  : "text-slate-400"
                                }`}
                            >
                              {days < 0 ? `${Math.abs(days)}d over` : `${days}d`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={goToServices}
                      className="mt-1 flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Open System &amp; Security
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={handleDateClick}
              aria-expanded={dateOpen}
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {selectedDate}
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition ${dateOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {dateOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close date menu"
                  onClick={() => setDateOpen(false)}
                />

                <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white py-1 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">
                  {DATE_OPTIONS.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setDateOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors ${selectedDate === date
                        ? "text-slate-900"
                        : "text-slate-600 hover:bg-slate-900/5"
                        }`}
                    >
                      {date}
                      {selectedDate === date && (
                        <Check className="h-4 w-4 text-accent" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={handleBellClick}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-900/5"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="h-4 w-4" />
              {bellBadgeCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-status-danger-text px-1 text-[9px] font-semibold text-white">
                  {bellBadgeCount > 9 ? "9+" : bellBadgeCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close notifications"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setNotifOpen(false)}
                />

                <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white shadow-[0_12px_35px_rgba(15,23,42,0.15)]">
                  <div className="max-h-[28rem] overflow-y-auto">
                    {breaches.length > 0 && (
                      <div className="border-b border-slate-200/70 pb-1">
                        <p className="px-3 py-2 text-[11px] font-semibold text-slate-900">
                          SLA breaches
                        </p>

                        {breaches.map((breach) => (
                          <button
                            type="button"
                            key={`${breach._id}-${breach.breachReason}`}
                            onClick={() => {
                              setNotifOpen(false);

                              router.push(`/cases/${breach._id}`);
                            }}
                            className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-900/5"
                          >
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />

                            <span>
                              <span className="font-semibold text-slate-900">
                                {breach.caseId}
                              </span>

                              <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                                {breach.breachReason}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between px-3 py-2">
                      <p className="text-[11px] font-semibold text-slate-900">
                        Activity
                      </p>

                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p className="px-3 pb-3 text-xs font-medium text-slate-500">
                        Nothing new right now.
                      </p>
                    ) : (
                      notifications.map((notification) => {
                        const Icon = NOTIFICATION_ICONS[notification.type];

                        return (
                          <button
                            type="button"
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className="flex w-full items-start gap-2 bg-accent-soft/40 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-900/5"
                          >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                              <Icon className="h-3 w-3" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-slate-900">
                                {notification.title}
                              </span>

                              <span className="block truncate text-[11px] font-medium text-slate-500">
                                {notification.message}
                              </span>

                              <span className="mt-0.5 block text-[10px] text-slate-400">
                                {timeAgo(notification.createdAt)}
                              </span>
                            </span>

                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ============================
                ADMIN PROFILE
            ============================ */}

          <div className="relative">
            <button
              type="button"
              onClick={handleProfileClick}
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-[9px] px-1.5 py-1 transition-colors hover:bg-slate-900/5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-[#edf3f6] text-[11px] font-semibold text-accent shadow-sm">
                {admin?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={admin.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials || "AU"
                )}
              </span>

              <span className="hidden text-left sm:block">
                <span className="block text-[12px] font-semibold leading-tight tracking-tight text-slate-900">
                  {displayName}
                </span>

                <span className="mt-0.5 block text-[10px] font-medium capitalize leading-tight text-slate-500">
                  {displayRole}
                </span>
              </span>

              <ChevronDown
                className={`ml-1 h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />

                <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-[10px] border border-[#e5e2da] bg-white py-1 shadow-[0_12px_35px_rgba(15,23,42,0.15)]">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-[12px] font-semibold text-slate-900">
                      {admin?.name || displayName}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium capitalize text-slate-500">
                      {displayRole}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setPasswordError("");
                      setPasswordModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change password
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 border-t border-slate-100 px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={expiryPopupOpen}
        onClose={dismissExpiryPopup}
        title="Services expiring soon"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={dismissExpiryPopup}>
              Dismiss for today
            </Button>
            <Button
              size="sm"
              onClick={() => {
                dismissExpiryPopup();
                router.push("/system-services");
              }}
            >
              Open System &amp; Security
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {expiringServices.map((service) => {
            const days = daysRemaining(service.expiryDate);

            return (
              <div
                key={service._id}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {service.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(service.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold ${days < 0 ? "text-red-600" : "text-amber-700"
                    }`}
                >
                  {days < 0
                    ? `Expired ${Math.abs(days)}d ago`
                    : `${days}d left`}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change password"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPasswordModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleChangePassword}
              loading={passwordSaving}
            >
              Change password
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Current password"
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />

          <Input
            label="New password"
            type="password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            hint="At least 8 characters. You'll be signed out of every session after this."
          />

          {passwordError && (
            <p className="text-xs font-medium text-red-600">{passwordError}</p>
          )}
        </div>
      </Modal>
    </>
  );
}
