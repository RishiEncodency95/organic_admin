"use client";

import { useEffect } from "react";

/**
 * One shared, reference-counted page scroll lock.
 *
 * Every modal, drawer and sheet goes through this, so stacked overlays
 * (a dialog opened from a sheet) can never leave the page stuck: the lock is
 * a class on <html> that is removed when the last holder releases it, with no
 * "original value" bookkeeping to go stale.
 */
const LOCK_CLASS = "scroll-locked";
let holders = 0;

function acquire() {
  if (typeof document === "undefined") return;
  if (holders === 0) {
    document.documentElement.classList.add(LOCK_CLASS);
  }
  holders += 1;
}

function release() {
  if (typeof document === "undefined") return;
  holders = Math.max(0, holders - 1);
  if (holders === 0) {
    document.documentElement.classList.remove(LOCK_CLASS);
  }
}

/** Locks the page behind an overlay for as long as `active` is true. */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    acquire();
    return release;
  }, [active]);
}

/**
 * Render inside a Radix `Content`: it only mounts while the overlay is open.
 * (The `*Content` wrappers themselves are mounted even when closed, so calling
 * the hook in them would lock the page permanently.)
 */
export function ScrollLock() {
  useScrollLock();
  return null;
}
