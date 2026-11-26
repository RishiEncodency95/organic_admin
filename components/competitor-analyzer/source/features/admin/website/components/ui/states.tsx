"use client";

/**
 * Loading, empty, error, locked and unavailable states.
 *
 * Every panel in this module renders one of these instead of a blank area, and
 * each one says what is missing and what the user can do next.
 */

import type { CSSProperties, ElementType, ReactNode } from "react";
import {
  AlertTriangle,
  CircleSlash,
  Inbox,
  Lock,
  PlugZap,
  RefreshCw,
  ServerOff,
  Globe,
} from "lucide-react";
import { cn } from "@/components/infrastructure/lib/cn";
import { CARD, Chip, WButton } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/kit";
import { NoWebsiteConfiguredError, ServiceUnavailableError } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/../../data/types";

/* ------------------------------------------------------------------ */
/* Skeletons                                                           */
/* ------------------------------------------------------------------ */

function Shimmer({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span style={style} className={cn("block animate-pulse rounded bg-[#EDF1F7]", className)} />;
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn(CARD, "flex flex-col gap-2 p-3")}>
          <Shimmer className="h-2.5 w-20" />
          <Shimmer className="h-6 w-16" />
          <Shimmer className="h-2 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, label = "Loading rows" }: { rows?: number; label?: string }) {
  return (
    <div className="p-3.5" role="status" aria-label={label}>
      <Shimmer className="mb-3 h-2.5 w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 border-b border-[#F4F6FA] py-2.5 last:border-0">
          <Shimmer className="h-3 w-[26%]" />
          <Shimmer className="h-3 w-[14%]" />
          <Shimmer className="h-3 w-[12%]" />
          <Shimmer className="h-3 w-[18%]" />
          <Shimmer className="ml-auto h-3 w-[10%]" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="p-3.5" role="status" aria-label="Loading chart">
      <Shimmer className="mb-3 h-2.5 w-28" />
      <Shimmer style={{ height }} className="w-full" />
    </div>
  );
}

export function SkeletonBlock({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2 p-3.5" role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, index) => (
        <Shimmer key={index} className={cn("h-3", index % 3 === 0 ? "w-full" : index % 3 === 1 ? "w-4/5" : "w-3/5")} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

function MessageShell({
  icon: Icon,
  tone,
  title,
  body,
  actions,
  className,
  compact,
  children,
}: {
  icon: ElementType;
  tone: "muted" | "warn" | "bad" | "info";
  title: string;
  body: ReactNode;
  actions?: ReactNode;
  className?: string;
  compact?: boolean;
  children?: ReactNode;
}) {
  const tones = {
    muted: "bg-[#F1F4F9] text-[#64748B]",
    warn: "bg-[#FDF3E3] text-[#9A5B08]",
    bad: "bg-[#FDECEB] text-[#C0261F]",
    info: "bg-[#EAF2FE] text-[#1F5FBF]",
  } as const;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 px-4 py-6" : "gap-2.5 px-6 py-10",
        className,
      )}
    >
      <span className={cn("grid place-items-center rounded-full", tones[tone], compact ? "size-8" : "size-11")}>
        <Icon className={compact ? "size-4" : "size-5"} aria-hidden />
      </span>
      <h3 className={cn("font-semibold text-[#111C3A]", compact ? "text-[12.5px]" : "text-[13.5px]")}>{title}</h3>
      <p className={cn("max-w-md text-[11.5px] leading-relaxed text-[#6B7A94]")}>{body}</p>
      {children}
      {actions ? <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  actions,
  icon = Inbox,
  compact,
  className,
}: {
  title: string;
  body: ReactNode;
  actions?: ReactNode;
  icon?: ElementType;
  compact?: boolean;
  className?: string;
}) {
  const props = {
    icon,
    tone: "muted" as const,
    title,
    body,
    ...(actions !== undefined ? { actions } : {}),
    ...(compact !== undefined ? { compact } : {}),
    ...(className !== undefined ? { className } : {}),
  };
  return <MessageShell {...props} />;
}

export function ErrorState({
  title = "Something went wrong",
  body,
  onRetry,
  compact,
}: {
  title?: string;
  body?: ReactNode;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <MessageShell
      icon={AlertTriangle}
      tone="bad"
      title={title}
      body={body ?? "We could not load this section. Try again, or come back in a moment."}
      {...(compact !== undefined ? { compact } : {})}
      actions={
        onRetry ? (
          <WButton icon={RefreshCw} onClick={onRetry}>
            Try again
          </WButton>
        ) : undefined
      }
    />
  );
}

export function LockedState({
  title,
  body,
  ctaLabel,
  onCta,
  unlocks,
  compact,
  className,
}: {
  title: string;
  body: ReactNode;
  ctaLabel?: string;
  onCta?: () => void;
  unlocks?: string[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <MessageShell
      icon={Lock}
      tone="info"
      title={title}
      body={body}
      className={className}
      {...(compact !== undefined ? { compact } : {})}
      actions={
        ctaLabel && onCta ? (
          <WButton tone="primary" icon={PlugZap} onClick={onCta}>
            {ctaLabel}
          </WButton>
        ) : undefined
      }
    >
      {unlocks?.length ? (
        <ul className="mt-1 flex max-w-lg flex-wrap items-center justify-center gap-1.5">
          {unlocks.map((item) => (
            <li key={item}>
              <Chip tone="muted">{item}</Chip>
            </li>
          ))}
        </ul>
      ) : null}
    </MessageShell>
  );
}

export function ServiceUnavailableState({ service, compact }: { service: string; compact?: boolean }) {
  return (
    <MessageShell
      icon={ServerOff}
      tone="warn"
      title={`${service} is not connected`}
      body={
        <>
          This workspace is running with live data mode on, and the {service.toLowerCase()} service has not been
          connected yet. Rather than show sample numbers as if they were real, this panel stays empty.
        </>
      }
      {...(compact !== undefined ? { compact } : {})}
    />
  );
}

export function NoWebsiteState({ clientName, onOpenClientProfile }: { clientName: string; onOpenClientProfile: () => void }) {
  return (
    <div className={cn(CARD, "mx-auto max-w-2xl")}>
      <MessageShell
        icon={Globe}
        tone="muted"
        title="No website configured for this client."
        body={
          <>
            <b className="font-semibold text-[#28354C]">{clientName}</b> has no website URL on their Client Profile.
            The Website module reads that URL — it is not set here, so it stays in one place for every module that
            needs it.
          </>
        }
        actions={
          <WButton tone="primary" icon={Globe} onClick={onOpenClientProfile}>
            Open Client Profile · Add Website URL
          </WButton>
        }
      />
    </div>
  );
}

export function NoClientSelectedState() {
  return (
    <div className={cn(CARD, "mx-auto max-w-2xl")}>
      <MessageShell
        icon={CircleSlash}
        tone="muted"
        title="Select a client to continue"
        body="Website Intelligence works on one client's website at a time. Pick a client from the switcher in the header."
      />
    </div>
  );
}

/**
 * Chooses the right message for a thrown error, so screens do not each have to
 * re-implement the same three branches.
 */
export function QueryErrorState({
  error,
  onRetry,
  compact,
}: {
  error: unknown;
  onRetry?: () => void;
  compact?: boolean;
}) {
  if (ServiceUnavailableError.is(error)) {
    const props = { service: error.service, ...(compact !== undefined ? { compact } : {}) };
    return <ServiceUnavailableState {...props} />;
  }
  if (NoWebsiteConfiguredError.is(error)) {
    return (
      <MessageShell
        icon={Globe}
        tone="muted"
        title="No website configured for this client."
        body="Add a website URL on the Client Profile to turn this module on."
        {...(compact !== undefined ? { compact } : {})}
      />
    );
  }
  return (
    <ErrorState
      body={error instanceof Error ? error.message : "An unexpected error stopped this panel from loading."}
      {...(onRetry !== undefined ? { onRetry } : {})}
      {...(compact !== undefined ? { compact } : {})}
    />
  );
}
