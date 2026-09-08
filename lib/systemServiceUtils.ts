import { useEffect, useState } from "react";
import { ExternalService, Settings } from "./types";

const DEFAULT_ALERTS = { popupReminderDays: 15, emailReminderDays: 15, notifyEmails: [] as string[] };

export function daysRemaining(expiryDate: string): number {
  return Math.floor((new Date(expiryDate).getTime() - Date.now()) / 86_400_000);
}

export function resolvePopupThreshold(item: ExternalService, settings?: Settings | null): number {
  return item.popupReminderDays ?? settings?.systemAlerts?.popupReminderDays ?? DEFAULT_ALERTS.popupReminderDays;
}

export function resolveEmailThreshold(item: ExternalService, settings?: Settings | null): number {
  return item.emailReminderDays ?? settings?.systemAlerts?.emailReminderDays ?? DEFAULT_ALERTS.emailReminderDays;
}

export type ServiceStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";

export function serviceStatus(item: ExternalService, settings?: Settings | null): ServiceStatus {
  const remaining = daysRemaining(item.expiryDate);
  if (remaining < 0) return "EXPIRED";
  if (remaining <= resolvePopupThreshold(item, settings)) return "EXPIRING_SOON";
  return "ACTIVE";
}
export function isWithinPopupThreshold(item: ExternalService, settings?: Settings | null): boolean {
  return item.remindersEnabled && daysRemaining(item.expiryDate) <= resolvePopupThreshold(item, settings);
}

interface Countdown {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/** Ticks every second so table rows and the Topbar/dashboard alerts show a genuinely live readout. */
export function useCountdown(expiryDate: string): Countdown {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalMs = new Date(expiryDate).getTime() - now;
  const abs = Math.abs(totalMs);

  return {
    totalMs,
    days: Math.floor(abs / 86_400_000),
    hours: Math.floor((abs % 86_400_000) / 3_600_000),
    minutes: Math.floor((abs % 3_600_000) / 60_000),
    seconds: Math.floor((abs % 60_000) / 1000),
    isExpired: totalMs < 0,
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");
export function formatCountdown(c: Countdown): string {
  const prefix = c.isExpired ? "Expired " : "";
  return `${prefix}${c.days}d ${pad2(c.hours)}h ${pad2(c.minutes)}m ${pad2(c.seconds)}s`;
}
