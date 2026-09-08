"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  HeartHandshake,
  History,
  Home,
  Laptop,
  Maximize2,
  Monitor,
  MoreVertical,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import {
  cmsPages,
  cmsPagesFromSettings,
  findCmsPageByRouteKey,
  getCmsPageRouteKey,
  PUBLIC_SITE_URL,
  type PageType,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { dashboardApi } from "@/lib/dashboardApi";

/* =========================================================
   ASSETS
========================================================= */

const MOKSHA_LOGO_URL =
  "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165236/moksha-sewa/assets/logo-moksha-seva.png";

const DIGNITY_BG_URL =
  "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";

/* =========================================================
   TYPES
========================================================= */

type PreviewMode =
  | "desktop"
  | "tablet"
  | "mobile";

/* =========================================================
   PAGE TYPE ICON
========================================================= */

function PageTypeIcon({
  type,
}: {
  type: PageType;
}) {
  if (type === "home") {
    return (
      <div className="grid h-[32px] w-[32px] place-items-center rounded-[8px] bg-[#eaf5eb] text-[#31714d]">
        <Home
          className="h-[16px] w-[16px]"
          strokeWidth={1.8}
        />
      </div>
    );
  }

  if (type === "people") {
    return (
      <div className="grid h-[32px] w-[32px] place-items-center rounded-[8px] bg-[#fff4e3] text-[#b27a27]">
        <UsersRound
          className="h-[16px] w-[16px]"
          strokeWidth={1.75}
        />
      </div>
    );
  }

  return (
    <div className="grid h-[32px] w-[32px] place-items-center rounded-[8px] bg-[#fff4e3] text-[#b27a27]">
      <FileText
        className="h-[16px] w-[16px]"
        strokeWidth={1.75}
      />
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[27px] grid-cols-[124px_1fr] items-center gap-[8px]">
      <dt className="text-[10.5px] font-medium text-[#5d6677]">
        {label}
      </dt>

      <dd className="min-w-0 text-[10.5px] font-normal text-[#3e495b]">
        {children}
      </dd>
    </div>
  );
}

/* =========================================================
   SEO ROW
========================================================= */

function SeoRow({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex h-[22px] items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-[7px]">
        <span className="grid h-[13px] w-[13px] shrink-0 place-items-center rounded-[3px] bg-[#147242] text-white">
          <Check
            className="h-[8px] w-[8px]"
            strokeWidth={2.5}
          />
        </span>

        <span className="truncate text-[9.5px] font-normal text-[#435066]">
          {label}
        </span>
      </div>

      <span className="text-[9px] font-medium text-[#28854e]">
        Good
      </span>
    </div>
  );
}

/* =========================================================
   FEATURE ITEM
========================================================= */

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-[9px] px-[11px] py-[8px]">
      <div className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full bg-[#e9f4e8] text-[#287148]">
        <Icon
          className="h-[15px] w-[15px]"
          strokeWidth={1.7}
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[9.5px] font-semibold text-[#2f563d]">
          {title}
        </p>

        <p className="mt-[1px] truncate text-[8.3px] font-medium text-[#777f84]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        flex
        h-[120px]
        min-w-0
        flex-col
        overflow-hidden
        rounded-[8px]
        border
        border-[#e7e4dc]
        bg-[#fffefa]
        px-[12px]
        py-[10px]
      "
    >
      <div className="mb-[5px] flex h-[26px] shrink-0 items-center text-[#2e7149]">
        {icon}
      </div>

      <h3 className="text-[9.8px] font-bold leading-[13px] text-[#33493d]">
        {title}
      </h3>

      <div className="mt-[4px] h-[31px] overflow-hidden">
        <p className="text-[8.3px] font-medium leading-[11px] text-[#66706f]">
          {text}
        </p>
      </div>

      <button
        type="button"
        className="mt-auto flex items-center gap-[4px] pt-[5px] text-[8px] font-semibold text-[#34704c]"
      >
        Learn more
        <ChevronRight className="h-[8px] w-[8px]" />
      </button>
    </div>
  );
}

/* =========================================================
   WEBSITE PREVIEW
========================================================= */

function WebsitePreview() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* =================================================
          WEBSITE NAVBAR
      ================================================= */}

      <div
        className="
          flex
          h-[49px]
          shrink-0
          items-center
          border-b
          border-[#eee9df]
          bg-[#fffef9]
          px-[18px]
        "
      >
        <div className="flex w-[205px] shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MOKSHA_LOGO_URL}
            alt="Moksha Sewa"
            className="h-[31px] w-auto object-contain"
          />
        </div>

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            justify-end
            gap-[15px]
            whitespace-nowrap
            text-[7.5px]
            font-semibold
            text-[#3d473f]
          "
        >
          <span className="text-[#36714d]">
            Home
          </span>

          <span>About Us</span>
          <span>Our Services</span>
          <span>How Sewa Works</span>
          <span>Get Involved</span>
          <span>Resources</span>
          <span>Contact Us</span>

          <button
            type="button"
            className="
              h-[29px]
              rounded-[5px]
              bg-[linear-gradient(135deg,#c68b20,#a97619)]
              px-[12px]
              text-[7.5px]
              font-semibold
              text-white
            "
          >
            Request Sewa Help
          </button>
        </div>
      </div>

      {/* =================================================
          DIGNITY HERO
      ================================================= */}

      <div
        className="
          relative
          h-[235px]
          shrink-0
          overflow-hidden
          bg-[#f6f2e7]
        "
      >
        {/* NEW KM.JPG BACKGROUND */}

        <div
          className="
            absolute
            inset-0
            bg-cover
            bg-center
            bg-no-repeat
          "
          style={{
            backgroundImage: `url("${DIGNITY_BG_URL}")`,
            backgroundPosition:
              "center center",
          }}
        />

        {/* CREAM OVERLAY */}

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(
              90deg,
              rgba(255,254,248,0.98)_0%,
              rgba(255,254,248,0.94)_31%,
              rgba(255,253,245,0.75)_49%,
              rgba(255,250,237,0.34)_70%,
              rgba(255,250,237,0.08)_100%
            )]
          "
        />

        {/* CONTENT */}

        <div className="relative z-10 h-full px-[34px] pt-[25px]">
          <div
            className="
              inline-flex
              items-center
              gap-[5px]
              rounded-full
              border
              border-[#dce8da]
              bg-white/80
              px-[9px]
              py-[5px]
              text-[7.6px]
              font-semibold
              uppercase
              tracking-[0.025em]
              text-[#4b7d5f]
              backdrop-blur-[2px]
            "
          >
            <HeartHandshake className="h-[9px] w-[9px]" />

            Dignity in every final journey
          </div>

          <h2
            className="
              mt-[14px]
              max-w-[380px]
              font-serif
              text-[26px]
              font-bold
              leading-[1.04]
              tracking-[-0.025em]
              text-[#243d2f]
            "
          >
            No One Should Leave
            <br />
            This World Without
            <br />

            <span className="text-[#176d44]">
              Dignity
            </span>
          </h2>

          <p
            className="
              mt-[10px]
              max-w-[365px]
              text-[9px]
              font-medium
              leading-[13.5px]
              text-[#58625f]
            "
          >
            Moksha Sewa provides free last rites,
            cremation, rituals and support for unclaimed
            and financially weak families with compassion,
            respect and responsibility.
          </p>

          <div className="mt-[13px] flex items-center gap-[8px]">
            <button
              type="button"
              className="
                flex
                h-[29px]
                items-center
                gap-[6px]
                rounded-[4px]
                bg-[#075c35]
                px-[13px]
                text-[7.8px]
                font-semibold
                text-white
              "
            >
              Request Sewa Help

              <ChevronRight className="h-[9px] w-[9px]" />
            </button>

            <button
              type="button"
              className="
                h-[29px]
                rounded-[4px]
                border
                border-[#cdbf98]
                bg-[#fffdf8]
                px-[13px]
                text-[7.8px]
                font-semibold
                text-[#9b7126]
              "
            >
              Learn Our Mission
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          FEATURE STRIP
      ================================================= */}

      <div
        className="
          grid
          h-[53px]
          shrink-0
          grid-cols-4
          border-b
          border-[#ece8df]
          bg-[#fffefa]
        "
      >
        <FeatureItem
          icon={ShieldCheck}
          title="Free & Compassionate"
          description="100% free support"
        />

        <FeatureItem
          icon={Home}
          title="Verified & Transparent"
          description="Complete verification"
        />

        <FeatureItem
          icon={HeartHandshake}
          title="Respect & Dignity"
          description="Every life matters"
        />

        <FeatureItem
          icon={Globe2}
          title="Pan India Sewa"
          description="Helping everywhere"
        />
      </div>

      {/* =================================================
          SERVICES
      ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-hidden
          bg-white
          px-[28px]
          pb-[13px]
          pt-[11px]
        "
      >
        <div className="text-center">
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-[#50815f]">
            Our Sewa
          </p>

          <h2 className="mt-[3px] font-serif text-[17px] font-bold leading-[20px] text-[#314238]">
            We Are Here To Help
          </h2>

          <p className="mt-[4px] text-[8.3px] font-medium text-[#757d7a]">
            Complete support for last rites and final
            journey with dignity and respect.
          </p>
        </div>

        <div className="mt-[10px] grid grid-cols-4 gap-[11px]">
          <ServiceCard
            icon={
              <div className="text-[23px] leading-none">
                🚑
              </div>
            }
            title="Final Journey & Transport"
            text="We arrange respectful transport of the departed with care."
          />

          <ServiceCard
            icon={
              <div className="text-[23px] leading-none">
                🔥
              </div>
            }
            title="Cremation & Last Rites"
            text="Complete cremation arrangements and essentials."
          />

          <ServiceCard
            icon={
              <div className="text-[23px] leading-none">
                🪔
              </div>
            }
            title="Ritual & Priest Support"
            text="Purohit and rituals as per traditions and beliefs."
          />

          <ServiceCard
            icon={
              <UsersRound
                className="h-[24px] w-[24px]"
                strokeWidth={1.45}
              />
            }
            title="Family & On-Ground Support"
            text="Emotional support and assistance at every step."
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SEO CIRCLE
========================================================= */

function SeoScoreCircle({ score }: { score: number }) {
  const circumference = 307.87;
  return (
    <div className="relative h-[102px] w-[102px] shrink-0">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r="49"
          fill="none"
          stroke="#edf0eb"
          strokeWidth="9"
        />

        <circle
          cx="60"
          cy="60"
          r="49"
          fill="none"
          stroke="#08703d"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="307.87"
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-end">
          <span className="text-[27px] font-bold tracking-[-0.04em] text-[#14233b]">
            {score}
          </span>

          <span className="mb-[4px] text-[8px] font-semibold text-[#667183]">
            /100
          </span>
        </div>

        <span className="mt-[-2px] text-[8.5px] font-semibold text-[#167044]">
          {score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Work"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   PERFORMANCE GRAPH
========================================================= */

function PerformanceGraph() {
  return (
    <div className="relative h-[62px] w-full">
      <svg
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient
            id="performanceFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#4c9c65"
              stopOpacity="0.26"
            />

            <stop
              offset="100%"
              stopColor="#4c9c65"
              stopOpacity="0.02"
            />
          </linearGradient>
        </defs>

        <line
          x1="0"
          y1="18"
          x2="400"
          y2="18"
          stroke="#eceee9"
          strokeWidth="1"
        />

        <line
          x1="0"
          y1="45"
          x2="400"
          y2="45"
          stroke="#eceee9"
          strokeWidth="1"
        />

        <path
          d="
            M0,60
            L20,57
            L40,43
            L61,49
            L80,37
            L101,47
            L121,52
            L141,41
            L160,22
            L181,27
            L202,12
            L223,40
            L243,48
            L263,43
            L283,52
            L303,37
            L323,29
            L343,36
            L363,22
            L383,35
            L400,31
            L400,70
            L0,70
            Z
          "
          fill="url(#performanceFill)"
        />

        <path
          d="
            M0,60
            L20,57
            L40,43
            L61,49
            L80,37
            L101,47
            L121,52
            L141,41
            L160,22
            L181,27
            L202,12
            L223,40
            L243,48
            L263,43
            L283,52
            L303,37
            L323,29
            L343,36
            L363,22
            L383,35
            L400,31
          "
          fill="none"
          stroke="#3d9360"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CmsPageDetailPage() {
  const params =
    useParams<{ id: string }>();

  const router =
    useRouter();

  const [pages, setPages] = useState(cmsPages);
  const [performance, setPerformance] = useState({ views: 0, visitors: 0, averageSessionSeconds: 0, bounceRate: 0 });

  const page = findCmsPageByRouteKey(pages, params.id) ?? pages[0] ?? cmsPages[0];

  useEffect(() => {
    settingsApi.get().then((settings) => setPages(cmsPagesFromSettings(settings as unknown as Record<string, unknown>))).catch(() => undefined);
  }, []);

  useEffect(() => {
    dashboardApi.overview().then((overview) => {
      const metric = overview.sources.analytics.data?.pages?.find((item) => item.path.replace(/\/$/, "") === page.slug.replace(/\/$/, ""));
      if (metric) setPerformance(metric);
    }).catch(() => undefined);
  }, [page.slug]);

  const [
    previewMode,
    setPreviewMode,
  ] = useState<PreviewMode>(
    "desktop",
  );

  const [
    previewScale,
    setPreviewScale,
  ] = useState("100%");

  const pageHref = `${PUBLIC_SITE_URL}${page.slug === "/" ? "" : page.slug}`;

  const deviceWidthPx =
    previewMode === "desktop"
      ? 1340
      : previewMode === "tablet"
        ? 768
        : 390;

  const previewViewportRef = useRef<HTMLDivElement>(null);
  const frameScrollRef = useRef<HTMLDivElement>(null);
  const [
    viewportSize,
    setViewportSize,
  ] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = previewViewportRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewportSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit the fixed device width into the available panel width (never zoom in past 100%),
  // then apply the manual zoom-out dropdown on top of that.
  const fitScale =
    viewportSize.width > 0
      ? Math.min(1, viewportSize.width / deviceWidthPx)
      : 1;
  const manualScale = parseInt(previewScale, 10) / 100;
  const previewScaleFactor = fitScale * manualScale;
  const scaledFrameWidth = deviceWidthPx * previewScaleFactor;
  const scaledFrameHeight = viewportSize.height;
  const unscaledFrameHeight =
    previewScaleFactor > 0
      ? scaledFrameHeight / previewScaleFactor
      : scaledFrameHeight;

  return (
    <div className="h-full min-h-0 w-full overflow-hidden bg-[#fffefb] text-[#172238]">
      <div className="flex h-full min-h-0 flex-col px-[14px] pb-[7px] pt-[8px]">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="flex h-[60px] shrink-0 items-start justify-between">
          <div className="flex items-start gap-[10px]">
            <div className="mt-[1px] grid h-[40px] w-[40px] place-items-center rounded-full bg-[#e8f4e9] text-[#2f7a50]">
              <Eye
                className="h-[19px] w-[19px]"
                strokeWidth={1.7}
              />
            </div>

            <div>
              <h1 className="text-[20px] font-bold leading-[22px] tracking-[-0.02em] text-[#193f2c]">
                View Page
              </h1>

              <div className="mt-[7px] flex items-center gap-[7px] text-[10.5px] font-medium text-[#697386]">
                <Link href="/pages" className="hover:text-[#2f7a50] hover:underline">
                  Pages &amp; CMS
                </Link>

                <ChevronRight className="h-[10px] w-[10px]" />

                <span>
                  {page.title}
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}

          <div className="flex items-center gap-[9px]">
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/pages",
                )
              }
              className="flex h-[37px] items-center gap-[7px] rounded-[6px] border border-[#dedfdb] bg-white px-[16px] text-[11px] font-semibold text-[#415067]"
            >
              <ArrowLeft className="h-[13px] w-[13px]" />

              Back to Pages
            </button>

            <button
              type="button"
              onClick={() =>
                window.open(
                  `/pages/${getCmsPageRouteKey(page)}/edit`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              className="flex h-[37px] items-center gap-[7px] rounded-[6px] border border-[#d4bd88] bg-[#fffef9] px-[17px] text-[11px] font-semibold text-[#314d3d]"
            >
              <Edit3 className="h-[13px] w-[13px]" />

              Edit Page
            </button>

            <Link
              href={pageHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[37px] items-center gap-[7px] rounded-[6px] bg-[linear-gradient(135deg,#08723e,#075832)] px-[17px] text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(5,88,48,0.15)]"
            >
              <ExternalLink className="h-[13px] w-[13px]" />

              Preview in New Tab

              <ExternalLink className="h-[10px] w-[10px]" />
            </Link>

            <button
              type="button"
              className="grid h-[37px] w-[37px] place-items-center rounded-[6px] border border-[#dedfdb] bg-white text-[#445065]"
            >
              <MoreVertical className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,2.2fr)_minmax(320px,1fr)] gap-[11px]">

          {/* =================================================
              LEFT PREVIEW
          ================================================= */}

          <section className="flex min-h-0 flex-col overflow-hidden rounded-[7px] border border-[#e6e7e2] bg-white shadow-[0_4px_18px_rgba(15,23,42,0.025)]">

            {/* PAGE INFO */}

            <div className="flex h-[79px] shrink-0 items-start justify-between border-b border-[#ecece8] px-[13px] py-[10px]">
              <div>
                <div className="flex items-center gap-[9px]">
                  <PageTypeIcon
                    type={page.type}
                  />

                  <h2 className="text-[18px] font-bold text-[#214735]">
                    {page.title}
                  </h2>

                  <span className="rounded-[5px] bg-[#e8f4e8] px-[8px] py-[4px] text-[9.5px] font-semibold text-[#3d7c55]">
                    {page.status}
                  </span>

                  {page.type ===
                    "home" && (
                      <span className="rounded-[5px] border border-[#e3dfd3] bg-[#fffefa] px-[8px] py-[4px] text-[9.5px] font-semibold text-[#626158]">
                        Homepage
                      </span>
                    )}
                </div>

                <p className="mt-[7px] text-[10.5px] font-medium text-[#657186]">
                  {PUBLIC_SITE_URL}
                  {page.slug === "/"
                    ? "/"
                    : page.slug}
                </p>
              </div>

              <div className="flex items-start gap-[9px] pr-[6px]">
                <CalendarDays
                  className="mt-[5px] h-[14px] w-[14px] text-[#a88131]"
                  strokeWidth={1.65}
                />

                <div>
                  <p className="text-[9px] font-semibold text-[#828995]">
                    Last Updated
                  </p>

                  <p className="mt-[2px] text-[10.5px] font-semibold text-[#5c6575]">
                    {page.updated}
                  </p>

                  <p className="mt-[3px] text-[9.2px] font-medium text-[#697384]">
                    By {page.updatedBy}
                  </p>
                </div>
              </div>
            </div>

            {/* PREVIEW */}

            <div
              ref={previewViewportRef}
              className="flex min-h-0 flex-1 items-start justify-center overflow-hidden bg-[#f8f8f5] px-[12px] pb-[14px] pt-[14px]"
            >
              <div
                className="shrink-0 overflow-auto rounded-[6px] border border-[#e9e6df] bg-white shadow-sm transition-all duration-200"
                style={{
                  width: scaledFrameWidth,
                  height: scaledFrameHeight,
                }}
              >
                <div
                  style={{
                    width: deviceWidthPx,
                    height: "100%",
                    minHeight: unscaledFrameHeight,
                    transform: `scale(${previewScaleFactor})`,
                    transformOrigin: "top left",
                  }}
                >
                  <iframe
                    title={`${page.title} live website preview`}
                    src={`${PUBLIC_SITE_URL}${page.slug === "/" ? "" : page.slug}`}
                    width={deviceWidthPx}
                    height="100%"
                    className="min-h-full border-0 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* DEVICE CONTROLS */}

            <div className="flex h-[50px] shrink-0 items-center justify-between border-t border-[#e8e8e3] bg-white px-[18px]">
              <div className="flex items-center gap-[13px]">
                <span className="text-[11px] font-semibold text-[#354158]">
                  View as
                </span>

                <div className="flex overflow-hidden rounded-[5px] border border-[#e0e1dd]">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewMode(
                        "desktop",
                      )
                    }
                    className={`flex h-[31px] items-center gap-[7px] px-[14px] text-[10px] font-semibold ${previewMode ===
                      "desktop"
                      ? "bg-[#08723e] text-white"
                      : "bg-white text-[#3f4b5e]"
                      }`}
                  >
                    <Monitor className="h-[13px] w-[13px]" />
                    Desktop
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewMode(
                        "tablet",
                      )
                    }
                    className={`flex h-[31px] items-center gap-[7px] border-l border-[#e1e2de] px-[14px] text-[10px] font-semibold ${previewMode ===
                      "tablet"
                      ? "bg-[#08723e] text-white"
                      : "bg-white text-[#3f4b5e]"
                      }`}
                  >
                    <Laptop className="h-[13px] w-[13px]" />
                    Tablet
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPreviewMode(
                        "mobile",
                      )
                    }
                    className={`flex h-[31px] items-center gap-[7px] border-l border-[#e1e2de] px-[14px] text-[10px] font-semibold ${previewMode ===
                      "mobile"
                      ? "bg-[#08723e] text-white"
                      : "bg-white text-[#3f4b5e]"
                      }`}
                  >
                    <Smartphone className="h-[13px] w-[13px]" />
                    Mobile
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-[8px]">
                <div className="relative">
                  <select
                    value={
                      previewScale
                    }
                    onChange={(event) =>
                      setPreviewScale(
                        event.target
                          .value,
                      )
                    }
                    className="h-[31px] appearance-none rounded-[5px] border border-[#dedfdb] bg-white pl-[12px] pr-[28px] text-[10px] font-semibold text-[#546075] outline-none"
                  >
                    <option>
                      100%
                    </option>

                    <option>
                      90%
                    </option>

                    <option>
                      80%
                    </option>

                    <option>
                      75%
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-[8px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 text-[#626d7e]" />
                </div>

                <button
                  type="button"
                  className="grid h-[31px] w-[35px] place-items-center rounded-[5px] border border-[#dedfdb] bg-white text-[#526075]"
                >
                  <Maximize2 className="h-[13px] w-[13px]" />
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="flex h-full min-h-0 flex-col gap-[8px] overflow-y-auto pr-[2px]">

            {/* PAGE OVERVIEW */}

            <section className="shrink-0 rounded-[7px] border border-[#e6e7e2] bg-white px-[14px] py-[11px]">
              <h2 className="text-[12.5px] font-semibold text-[#263148]">
                Page Overview
              </h2>

              <dl className="mt-[9px] space-y-[1px]">
                <InfoRow label="Page Type">
                  Static Page
                </InfoRow>

                <InfoRow label="Status">
                  <span className="inline-flex items-center gap-[5px] rounded-full bg-[#e8f4e8] px-[7px] py-[3px] text-[9.5px] font-semibold text-[#28774a]">
                    <span className="h-[4px] w-[4px] rounded-full bg-[#2f9857]" />

                    Published
                  </span>
                </InfoRow>

                <InfoRow label="Visibility">
                  <span className="inline-flex items-center gap-[5px]">
                    <Globe2 className="h-[11px] w-[11px]" />

                    Public
                  </span>
                </InfoRow>

                <InfoRow label="Author">
                  <span className="inline-flex items-center gap-[5px]">
                    <UserRound className="h-[11px] w-[11px]" />

                    {page.author}
                  </span>
                </InfoRow>

                <InfoRow label="Published On">
                  <span className="inline-flex items-center gap-[5px]">
                    <Clock3 className="h-[11px] w-[11px]" />

                    {page.updated}
                  </span>
                </InfoRow>

                <InfoRow label="Last Updated">
                  <span className="inline-flex items-center gap-[5px]">
                    <Clock3 className="h-[11px] w-[11px]" />

                    {page.updated}
                  </span>
                </InfoRow>

                <InfoRow label="Page ID">
                  #MSP-{String(page.id).padStart(4, "0")}
                </InfoRow>
              </dl>

              <button
                type="button"
                className="mt-[7px] flex h-[30px] w-full items-center justify-center gap-[6px] rounded-[5px] border border-[#e2ded5] bg-[#fffefa] text-[10px] font-semibold text-[#4e574d]"
              >
                <History className="h-[12px] w-[12px]" />

                View Page History
              </button>
            </section>

            {/* SEO */}

            <section className="shrink-0 rounded-[7px] border border-[#e6e7e2] bg-white px-[14px] py-[10px]">
              <h2 className="text-[12.5px] font-semibold text-[#263148]">
                SEO Score
              </h2>

              <div className="mt-[10px] grid grid-cols-[120px_1fr] items-center gap-[11px]">
                <div className="flex justify-center">
                  <SeoScoreCircle score={page.seoScore} />
                </div>

                <div className="space-y-[1px] border-l border-[#eeeeea] pl-[12px]">
                  <SeoRow label="Meta Title" />
                  <SeoRow label="Meta Description" />
                  <SeoRow label="Headings" />
                  <SeoRow label="Content Quality" />
                  <SeoRow label="Internal Linking" />
                  <SeoRow label="Images (ALT Text)" />
                  <SeoRow label="Schema Markup" />
                </div>
              </div>

              <button
                type="button"
                className="mt-[8px] flex h-[30px] w-full items-center justify-center gap-[7px] rounded-[5px] border border-[#e6dfcd] bg-[#fffefa] text-[10px] font-semibold text-[#475348]"
              >
                <ShieldCheck className="h-[12px] w-[12px]" />

                View Full SEO Analysis

                <ChevronRight className="h-[10px] w-[10px]" />
              </button>
            </section>

            {/* PERFORMANCE */}

            <section className="shrink-0 rounded-[7px] border border-[#e6e7e2] bg-white px-[14px] py-[10px]">
              <h2 className="text-[12px] font-semibold text-[#263148]">
                Page Performance

                <span className="ml-[4px] text-[9.5px] font-medium text-[#6c7688]">
                  (Last 30 Days)
                </span>
              </h2>

              <div className="mt-[8px] grid grid-cols-4 divide-x divide-[#ecece8]">
                <div className="px-[7px] first:pl-0">
                  <p className="text-[8px] font-medium text-[#7b8493]">
                    Page Views
                  </p>

                  <p className="mt-[1px] text-[14px] font-bold text-[#27364e]">
                    {performance.views.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-[1px] text-[8px] font-semibold text-[#249153]">
                    ↑ 18.7%
                  </p>
                </div>

                <div className="px-[7px]">
                  <p className="text-[8px] font-medium text-[#7b8493]">
                    Visitors
                  </p>

                  <p className="mt-[1px] text-[14px] font-bold text-[#27364e]">
                    {performance.visitors.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-[1px] text-[8px] font-semibold text-[#249153]">
                    ↑ 15.3%
                  </p>
                </div>

                <div className="px-[7px]">
                  <p className="text-[8px] font-medium text-[#7b8493]">
                    Avg. Time
                  </p>

                  <p className="mt-[1px] text-[14px] font-bold text-[#27364e]">
                    {`${Math.floor(performance.averageSessionSeconds / 60).toString().padStart(2, "0")}:${Math.round(performance.averageSessionSeconds % 60).toString().padStart(2, "0")}`}
                  </p>

                  <p className="mt-[1px] text-[8px] font-semibold text-[#249153]">
                    ↑ 8.2%
                  </p>
                </div>

                <div className="px-[7px] pr-0">
                  <p className="text-[8px] font-medium text-[#7b8493]">
                    Bounce Rate
                  </p>

                  <p className="mt-[1px] text-[14px] font-bold text-[#27364e]">
                    {performance.bounceRate.toFixed(1)}%
                  </p>

                  <p className="mt-[1px] text-[8px] font-semibold text-[#d04d4d]">
                    ↓ 5.1%
                  </p>
                </div>
              </div>

              <div className="mt-[5px]">
                <PerformanceGraph />
              </div>
            </section>

            {/* QUICK ACTIONS */}

            <section className="shrink-0 rounded-[7px] border border-[#e6e7e2] bg-white px-[14px] py-[8px]">
              <h2 className="text-[12px] font-semibold text-[#263148]">
                Quick Actions
              </h2>

              <div className="mt-[6px] grid grid-cols-3 gap-[7px]">
                <button
                  type="button"
                  className="flex h-[32px] items-center justify-center gap-[5px] rounded-[5px] border border-[#dedfdb] bg-white text-[9.2px] font-semibold text-[#475367]"
                >
                  <Copy className="h-[11px] w-[11px]" />

                  Duplicate Page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(
                      `${PUBLIC_SITE_URL}${page.slug === "/"
                        ? "/"
                        : page.slug
                      }`,
                    )
                  }
                  className="flex h-[32px] items-center justify-center gap-[5px] rounded-[5px] border border-[#dedfdb] bg-white text-[9.2px] font-semibold text-[#475367]"
                >
                  <RefreshCcw className="h-[11px] w-[11px]" />

                  Copy URL
                </button>

                <button
                  type="button"
                  className="flex h-[32px] items-center justify-center gap-[5px] rounded-[5px] border border-[#efcfc8] bg-white text-[9.2px] font-semibold text-[#cf4e46]"
                >
                  <Trash2 className="h-[11px] w-[11px]" />

                  Delete Page
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
