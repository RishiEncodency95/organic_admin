"use client";

import { useState } from "react";

type IconProps = {
  className?: string;
};

const XIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden
  >
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.84L7.08 4.13H5.12l11.96 15.64Z" />
  </svg>
);

const FacebookIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden
  >
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
  </svg>
);

const InstagramIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
    />

    <circle
      cx="12"
      cy="12"
      r="4"
    />

    <circle
      cx="17.5"
      cy="6.5"
      r="1"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const LinkedinIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden
  >
    <path d="M6.5 8.25H3.25V21H6.5V8.25ZM4.88 3a1.88 1.88 0 1 0 0 3.75A1.88 1.88 0 0 0 4.88 3ZM21 13.7c0-3.84-2.05-5.62-4.79-5.62-2.2 0-3.19 1.21-3.74 2.06V8.25H9.22V21h3.25v-6.32c0-1.67.32-3.29 2.39-3.29 2.04 0 2.06 1.91 2.06 3.4V21H21v-7.3Z" />
  </svg>
);

const YoutubeIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden
  >
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12c-1.85-.5-9.4-.5-9.4-.5s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.12A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.27 3.6-6.27 3.6Z" />
  </svg>
);

const CloseIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

// Classic "share" glyph — box with an arrow pointing out the top,
// used for the collapsed state instead of the old rotated "+".
const ShareIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 15V3" />
    <path d="m7 8 5-5 5 5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
);

const links = [
  {
    label: "X",
    href: "https://x.com/mokshasewa",
    color: "#000000",
    icon: XIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/mokshasewa/",
    color: "#1877F2",
    icon: FacebookIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/mokshasewa/",
    color: "#E4405F",
    icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/moksha-sewaorg/",
    color: "#0077B5",
    icon: LinkedinIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@Mokshasewa",
    color: "#FF0000",
    icon: YoutubeIcon,
  },
];

export default function AdminSocialRail() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className="
        fixed
        right-2
        top-1/2
        z-30
        hidden
        -translate-y-1/2
        md:block
      "
      aria-label="Moksha Sewa social media"
    >
      {/* =========================================
          COLLAPSE / EXPAND BUTTON
          Lives OUTSIDE the white capsule — floats free,
          overlapping its top edge, so there's no white
          disc sitting behind it. Golden always, never white.
          Shows an X while open, a share glyph while collapsed.
      ========================================= */}

      <button
        type="button"
        onClick={() =>
          setCollapsed(
            (value) => !value,
          )
        }
        aria-label={
          collapsed
            ? "Expand social media"
            : "Collapse social media"
        }
        aria-expanded={!collapsed}
        title={
          collapsed
            ? "Open"
            : "Close"
        }
        className="
          group
          relative
          z-40

          mx-auto
          -mb-4

          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          overflow-hidden
          rounded-full
          border-2
          border-white
          text-white
          shadow-[0_6px_16px_rgba(155,116,62,.45)]
          ring-1
          ring-black/5
          transition-all
          duration-300
          ease-out

          hover:shadow-[0_9px_22px_rgba(155,116,62,.55)]
          hover:ring-2
          hover:ring-white
          hover:brightness-105

          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-[#9b743e]
        "
        style={{
          backgroundImage:
            "linear-gradient(135deg, #e8c779, #b1863f 55%, #9b743e)",
        }}
      >
        {/* SHINE */}

        <span
          className="
            pointer-events-none
            absolute
            inset-0

            bg-gradient-to-br
            from-white/30
            via-transparent
            to-black/15
          "
        />

        {/* CLOSE ICON */}

        <CloseIcon
          className={`
            absolute
            z-10
            h-[16px]
            w-[16px]
            transition-all
            duration-300
            ease-out

            ${collapsed
              ? "scale-50 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100"
            }
          `}
        />

        {/* SHARE ICON */}

        <ShareIcon
          className={`
            absolute
            z-10
            h-[16px]
            w-[16px]
            transition-all
            duration-300
            ease-out

            ${collapsed
              ? "scale-100 rotate-0 opacity-100"
              : "scale-50 -rotate-90 opacity-0"
            }
          `}
        />
      </button>

      <div
        className={`
          relative
          flex
          flex-col
          items-center
          overflow-hidden
          rounded-[22px]
          border
          border-white/90
          bg-white/80
          px-1
          shadow-[0_12px_30px_rgba(42,29,20,.14),0_2px_7px_rgba(42,29,20,.07)]
          backdrop-blur-xl
          transition-all
          duration-300
          ease-out

          ${collapsed
            ? "max-h-0 gap-0 border-transparent bg-transparent py-0 opacity-0 shadow-none"
            : "max-h-[320px] gap-1 pb-1 pt-6 opacity-100"
          }
        `}
      >
        {/* GOLD SIDE LINE */}

        {!collapsed && (
          <span
            className="
              pointer-events-none
              absolute
              inset-y-5
              right-[-4px]
              w-[3px]
              rounded-full
              bg-gradient-to-b
              from-[#e8c779]
              via-[#9b743e]
              to-[#e8c779]
            "
          />
        )}

        {/* =========================================
            SOCIAL ICONS
        ========================================= */}

        <div
          className={`
            flex
            flex-col
            items-center
            gap-1
            overflow-visible

            transition-all
            duration-300
            ease-out

            ${collapsed
              ? "pointer-events-none max-h-0 scale-90 opacity-0"
              : "max-h-[240px] scale-100 opacity-100"
            }
          `}
        >
          {links.map(
            ({
              label,
              href,
              color,
              icon: Icon,
            }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="
                  group
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full

                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#9b743e]
                "
              >
                {/* =================================
                    FLOATING HOVER TEXT
                ================================= */}

                <span
                  className="
                    pointer-events-none
                    absolute
                    right-[46px]
                    top-1/2
                    z-20

                    -translate-y-1/2
                    translate-x-[8px]

                    whitespace-nowrap

                    rounded-full
                    border
                    border-white/80

                    px-[12px]
                    py-[6px]

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.05em]
                    text-white

                    opacity-0

                    shadow-[0_5px_16px_rgba(0,0,0,.20)]

                    transition-all
                    duration-300
                    ease-out

                    group-hover:translate-x-0
                    group-hover:opacity-100
                  "
                  style={{
                    backgroundColor:
                      color,
                  }}
                >
                  {label}

                  {/* ARROW */}

                  <span
                    className="
                      absolute
                      right-[-4px]
                      top-1/2
                      h-[8px]
                      w-[8px]
                      -translate-y-1/2
                      rotate-45
                    "
                    style={{
                      backgroundColor:
                        color,
                    }}
                  />
                </span>

                {/* =================================
                    FIXED ICON BACKGROUND
                ================================= */}

                <span
                  className="
                    relative
                    z-30

                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center

                    overflow-hidden

                    rounded-full

                    border-2
                    border-white

                    text-white

                    shadow-[0_3px_10px_rgba(0,0,0,.18)]

                    ring-1
                    ring-black/5

                    transition-all
                    duration-300
                    ease-out

                    group-hover:shadow-[0_7px_20px_rgba(0,0,0,.25)]
                    group-hover:ring-2
                    group-hover:ring-white
                  "
                  style={{
                    backgroundColor:
                      color,
                  }}
                >
                  {/* SHINE */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0

                      bg-gradient-to-br
                      from-white/25
                      via-transparent
                      to-black/15
                    "
                  />

                  {/* ICON */}

                  <Icon
                    className="
                      relative
                      z-10

                      h-4
                      w-4
                      shrink-0

                      transition-transform
                      duration-300
                      ease-out

                      group-hover:rotate-[4deg]
                      group-hover:scale-[1.35]
                    "
                  />
                </span>
              </a>
            ),
          )}
        </div>

        {/* =========================================
            BOTTOM DIVIDER
        ========================================= */}

        {!collapsed && (
          <span
            className="
              mt-0.5
              h-px
              w-7

              bg-gradient-to-r
              from-transparent
              via-[#b18a50]
              to-transparent
            "
            aria-hidden
          />
        )}
      </div>
    </nav>
  );
}