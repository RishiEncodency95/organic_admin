"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { FaUserAstronaut } from "react-icons/fa";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  KeyRound,
  Bell,
  BellRing,
  HelpCircle,
  Sun,
  Moon,
  Sunrise,
  Search,
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
  Loader2,
  Key,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { authApi } from "@/lib/authApi";
import Swal from "sweetalert2";
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
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [greeting, setGreeting] = useState<{ text: string; icon: React.ReactNode }>({
    text: "Good Day",
    icon: <Sun size={18} className="text-orange-500" />,
  });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting({
          text: "Good Morning",
          icon: <Sunrise size={18} className="text-amber-500" />,
        });
      } else if (hour >= 12 && hour < 17) {
        setGreeting({
          text: "Good Afternoon",
          icon: <Sun size={18} className="text-orange-500" />,
        });
      } else {
        setGreeting({
          text: "Good Evening",
          icon: <Moon size={18} className="text-indigo-400" />,
        });
      }
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

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
    setMenuOpen(false);

    const result = await Swal.fire({
      title: "Logout?",
      text: "You will be logged out from admin panel",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
      customClass: {
        popup: "rounded-xl border border-slate-700/60 shadow-2xl",
      },
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: "Logged Out!",
        text: "You have been successfully logged out",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#1e2433",
        color: "#e2e8f0",
      });

      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }

      dispatch(logout());

      if (typeof window !== "undefined") {
        localStorage.removeItem("ms_admin_auth");
      }

      router.push("/login");
    }
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
      <header className="relative z-30 flex h-[62px] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-xl shadow-xs">
        {/* LEFT – MOBILE TOGGLE, CURRENT PAGE TITLE / BREADCRUMB & SEARCH */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-900/5 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>

          {/* ACTIVE PAGE TITLE / BREADCRUMB */}
          {isDashboard ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-2.5 bg-slate-50/80 px-3 py-1 rounded-xl border border-[#23471d]/25 group transition-all duration-300 hover:bg-white hover:border-[#23471d]/50 shadow-xs"
            >
              {/* Icon Circle */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-slate-100 shadow-xs">
                {greeting.icon}
              </div>

              {/* Text Content */}
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-slate-700 tracking-tight">
                    {greeting.text},
                  </span>
                  <span className="text-[12px] font-bold text-[#23471d] tracking-tight">
                    {admin?.name || displayName}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="relative flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-green-500 animate-ping opacity-75" />
                  </div>
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                    {displayRole}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : pagesSubRouteLabel(pathname) ? (
            <h1 className="flex min-w-0 items-center gap-1.5 text-[15px] font-semibold tracking-tight">
              <span
                className={`truncate ${
                  pathname.startsWith("/staff") || currentPageTitle(pathname) === "Staff Management"
                    ? "text-[#4B1426]"
                    : "text-slate-500"
                }`}
                style={{
                  color:
                    pathname.startsWith("/staff") || currentPageTitle(pathname) === "Staff Management"
                      ? "#4B1426"
                      : undefined,
                }}
              >
                {currentPageTitle(pathname)}
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              <span className="truncate text-slate-900 font-bold text-[#23471d]">
                {pagesSubRouteLabel(pathname)}
              </span>
            </h1>
          ) : (
            <h1
              className={`truncate text-[15px] font-bold tracking-tight ${
                pathname.startsWith("/staff") || currentPageTitle(pathname) === "Staff Management"
                  ? "text-[#4B1426]"
                  : "text-slate-900"
              }`}
              style={{
                color:
                  pathname.startsWith("/staff") || currentPageTitle(pathname) === "Staff Management"
                    ? "#4B1426"
                    : undefined,
              }}
            >
              {currentPageTitle(pathname)}
            </h1>
          )}

          {/* SEARCH BOX */}
          <div className="hidden lg:flex items-center relative ml-3">
            <Search className="absolute left-3 text-slate-400 pointer-events-none" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1 w-44 xl:w-56 bg-white border-2 border-slate-300 shadow-xs rounded-full text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#23471d] focus:ring-4 focus:ring-[#23471d]/10 transition-all focus:w-52 xl:focus:w-64"
            />
          </div>
        </div>

        {/* RIGHT – ICONS & PROFILE */}
        <div className="flex items-center gap-2 sm:gap-3 relative">
          {/* Help & Support */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveTitle(activeTitle === "help" ? null : "help")}
              className="p-2 rounded-lg hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
              title="Help & Support"
            >
              <HelpCircle size={18} className="text-[#23471d]" />
            </button>
            {activeTitle === "help" && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-50"
              >
                Help &amp; Support
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45" />
              </motion.div>
            )}
          </div>

          {/* Reminder List */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setActiveTitle(activeTitle === "reminder" ? null : "reminder");
                if (hasClusterContent) handleExpiringClick();
              }}
              className="p-2 rounded-lg hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
              title="Reminder List"
            >
              <BellRing size={18} className="text-[#23471d]" />
            </button>
            {activeTitle === "reminder" && !expiringOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="whitespace-nowrap absolute top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg z-50"
              >
                Reminder List
                <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-900 rotate-45" />
              </motion.div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setActiveTitle(null);
                handleBellClick();
              }}
              className="relative p-2 rounded-lg hover:bg-[#23471d]/10 transition-all duration-200 hover:scale-105"
              title="Notifications"
            >
              <Bell size={18} className="text-[#23471d]" />
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-lg"
              >
                {bellBadgeCount > 9 ? "9+" : bellBadgeCount || 3}
              </motion.span>
            </button>

            {notifOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close notifications"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setNotifOpen(false)}
                />

                <div className="absolute right-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-2xl">
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

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(!menuOpen);
                setActiveTitle(null);
              }}
              className="relative flex items-center gap-2 p-1 sm:pr-3 bg-white border-2 border-slate-300 shadow-xs rounded-full hover:bg-slate-50 transition-all duration-200"
            >
              {/* Profile Avatar: image if uploaded, Lottie animation if not */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-slate-200 flex-shrink-0 flex items-center justify-center shadow-xs bg-white">
                  {admin?.avatarUrl && admin.avatarUrl.trim() !== "" && admin.avatarUrl !== "null" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={admin.avatarUrl}
                      alt={admin?.name || displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <DotLottieReact
                      src="/avatar-lottie.lottie"
                      loop
                      autoplay
                      style={{ width: "100%", height: "100%", transform: "scale(1.2)" }}
                    />
                  )}
                </div>

                {/* Online Status Dot */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full z-10 flex items-center justify-center">
                  <div className="absolute inset-0 w-full h-full bg-green-500 rounded-full animate-ping opacity-75" />
                </div>
              </div>

              {/* User Info */}
              <div className="hidden sm:flex flex-col text-left leading-none ml-1">
                <span className="text-[12px] font-bold text-slate-800">
                  {admin?.name || displayName}
                </span>

                <span className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: "#4B1426" }}>
                  {displayRole}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* PROFILE DROPDOWN */}
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close profile menu"
                  onClick={() => setMenuOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                    <p className="text-[10px] text-slate-500 font-medium">Admin Panel</p>
                    <p className="text-[12px] font-bold text-slate-800">{admin?.name || displayName}</p>
                  </div>

                  {/* Manage Admin Users */}
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/staff");
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <FaUserAstronaut size={14} className="text-blue-600" />
                    <span className="font-medium">Manage Admin Users</span>
                  </button>

                  {/* Change Password */}
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setPasswordError("");
                      setPasswordModalOpen(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors duration-150"
                  >
                    <Key size={14} className="text-slate-600" />
                    <span className="font-medium">Change Password</span>
                  </button>

                  <div className="border-t border-slate-200" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut size={14} />
                    <span className="font-semibold">Logout</span>
                  </button>
                </motion.div>
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
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
              style={{
                background: "#fff1f2",
                borderRadius: "4px",
                boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              style={{
                background: "#16a34a",
                borderRadius: "4px",
                boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
              }}
            >
              {passwordSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Change password
            </button>
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
