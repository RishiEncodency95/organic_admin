"use client";

import { useEffect, useState, type ReactNode } from "react";
import "./infra.css";
import { InfraProviders } from "./lib/query";

/**
 * Style scope + data layer for every Infrastructure route.
 *
 * The page content renders only after mount: the signed-in admin comes from browser storage (Redux), so on the
 * server every query is "not ready" while on the client it is "loading", and rendering both would never hydrate cleanly.
 */
export function InfraRoot({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <InfraProviders>
      <div className="infra-root infra-page">{mounted ? children : null}</div>
    </InfraProviders>
  );
}
