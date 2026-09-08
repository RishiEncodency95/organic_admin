"use client";

import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";

import { Headphones } from "lucide-react";

import {
  NAV_SECTIONS,
  type NavItem,
} from "./navigation";

function isActive(
  pathname: string,
  href?: string,
  searchParams?: URLSearchParams,
) {
  if (!href) return false;

  if (href === "/") {
    return pathname === "/";
  }

  const [basePath, query = ""] = href.split("?");

  if (
    pathname !== basePath &&
    !pathname.startsWith(`${basePath}/`)
  ) {
    return false;
  }

  if (!query) return true;

  const expected = new URLSearchParams(query);

  for (const [key, value] of expected.entries()) {
    if (searchParams?.get(key) !== value) {
      return false;
    }
  }

  return true;
}

export default function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;

    const active = isActive(
      pathname,
      item.href,
      searchParams,
    );

    const content = (
      <>
        <span
          className="
            grid
            h-[21px]
            w-[21px]
            shrink-0
            place-items-center
          "
        >
          <Icon
            className="h-[15px] w-[15px]"
            strokeWidth={1.8}
          />
        </span>

        <span className="min-w-0 flex-1 truncate">
          {item.label}
        </span>

        {item.badge &&
          item.badge !== "NEW" && (
            <span
              className="
                flex
                h-[19px]
                min-w-[24px]
                shrink-0
                items-center
                justify-center
                rounded-[4px]
                bg-[linear-gradient(180deg,#F1A11A_0%,#D68208_100%)]
                px-[5px]
                text-[9px]
                font-bold
                leading-none
                text-white
                shadow-[0_2px_5px_rgba(0,0,0,0.25)]
              "
            >
              {item.badge}
            </span>
          )}

        {item.badge === "NEW" && (
          <span
            className="
              flex
              h-[19px]
              shrink-0
              items-center
              justify-center
              rounded-[6px]
              bg-[linear-gradient(180deg,#3AAA63_0%,#25844C_100%)]
              px-[7px]
              text-[8px]
              font-bold
              leading-none
              text-white
              shadow-[0_2px_5px_rgba(0,0,0,0.22)]
            "
          >
            NEW
          </span>
        )}
      </>
    );

    if (
      item.disabled ||
      !item.href
    ) {
      return (
        <div
          key={item.label}
          aria-disabled="true"
          title="This module is not available yet"
          className="
            flex
            h-[29px]
            cursor-not-allowed
            items-center
            gap-[6px]
            rounded-[6px]
            px-[9px]
            text-[12px]
            font-medium
            text-white/35
          "
        >
          {content}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={onNavigate}
        className={`
          relative
          flex
          h-[31px]
          items-center
          gap-[6px]
          overflow-hidden
          rounded-[7px]
          px-[9px]
          text-[12px]
          font-medium
          transition-all
          duration-150

          ${active
            ? `
                bg-[linear-gradient(90deg,#A88E3C_0%,#84773A_50%,#69643A_100%)]
                text-white
                shadow-[0_3px_10px_rgba(0,0,0,0.28)]
              `
            : `
                text-[#F2F5F7]
                hover:bg-white/[0.07]
                hover:text-white
              `
          }
        `}
      >
        {active && (
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent)]
            "
          />
        )}

        <span className="relative z-10 contents">
          {content}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className="
        relative
        flex
        h-full
        w-[240px]
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-[#183E59]
        bg-[#071f3c]
        text-white
        shadow-[4px_0_18px_rgba(0,0,0,0.20)]
      "
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          bg-cover
          bg-bottom
          bg-no-repeat
        "
        style={{
          backgroundImage:
            'url("/sidebar/sidebar-background.png")',
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />

      {/* LIGHT OVERLAY */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          bg-[linear-gradient(
            180deg,
            rgba(3,22,47,0.06)_0%,
            rgba(3,25,50,0.04)_55%,
            rgba(2,20,40,0.02)_100%
          )]
        "
      />

      {/* LOGO AREA */}
      <div
        className="
          relative
          z-10
          shrink-0
          px-[16px]
          pt-[16px]
          pb-[14px]
          text-center
        "
      >
        <Link href="/" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/admin.png"
            alt="Bharat Organic Expo Admin"
            className="
              mx-auto
              h-auto
              max-h-[75px]
              w-auto
              max-w-[195px]
              object-contain
              drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]
              transition-transform
              duration-200
              hover:scale-[1.02]
            "
          />
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav
        className="
          relative
          z-10
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          px-[14px]
          pb-[6px]

          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {NAV_SECTIONS.map(
          (
            section,
            index,
          ) => (
            <section
              key={section.title}
              className={`
                mb-[7px]
                ${index > 0
                  ? "border-t border-[#668196]/40 pt-[7px]"
                  : ""
                }
              `}
            >
              <div
                className="
                  mb-[4px]
                  flex
                  items-center
                  gap-[7px]
                  px-[5px]
                "
              >
                <h2
                  className="
                    shrink-0
                    text-[9.5px]
                    font-bold
                    uppercase
                    leading-[13px]
                    tracking-[0.035em]
                    text-[#E8B83E]
                  "
                >
                  {section.title}
                </h2>

                <span
                  className="
                    h-px
                    flex-1
                    bg-[#668196]/20
                  "
                />
              </div>

              <div className="space-y-[1px]">
                {section.items.map(
                  renderItem,
                )}
              </div>
            </section>
          ),
        )}
      </nav>

      {/* HELP BOX */}
      <div
        className="
          relative
          z-10
          shrink-0
          px-[15px]
          pb-[13px]
          pt-[4px]
        "
      >
        <a
          href="mailto:info@mokshasewa.org"
          className="
            relative
            flex
            h-[64px]
            items-center
            gap-[10px]
            overflow-hidden
            rounded-[9px]
            border
            border-[#B0A14B]/25
            bg-[linear-gradient(90deg,#6E6C38_0%,#72723C_55%,#62663A_100%)]
            px-[13px]
            text-white
            shadow-[0_4px_12px_rgba(0,0,0,0.24)]
            transition
            hover:brightness-110
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]
            "
          />

          <Headphones
            className="
              relative
              z-10
              h-[29px]
              w-[29px]
              shrink-0
            "
            strokeWidth={1.45}
          />

          <span className="relative z-10 min-w-0">
            <span
              className="
                block
                text-[11px]
                font-semibold
                leading-[15px]
              "
            >
              Need Help?
            </span>

            <span
              className="
                mt-[1px]
                block
                text-[9.5px]
                font-medium
                leading-[13px]
                text-white/85
              "
            >
              Contact IT Support
            </span>
          </span>
        </a>
      </div>
    </aside>
  );
}