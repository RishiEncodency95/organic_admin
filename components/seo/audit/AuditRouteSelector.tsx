"use client";

import React from "react";
import { ExternalLink, Globe, Compass } from "lucide-react";

export interface RouteOption {
  id: string;
  label: string;
  path: string;
}

interface AuditRouteSelectorProps {
  routes: RouteOption[];
  selectedPageId: string;
  onSelectRoute: (routeId: string) => void;
  currentUrl: string;
}

export default function AuditRouteSelector({
  routes,
  selectedPageId,
  onSelectRoute,
  currentUrl,
}: AuditRouteSelectorProps) {
  const selectedRoute = routes.find((r) => r.id === selectedPageId) || routes[0];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Dropdown Selector */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shrink-0">
            <Compass className="h-4.5 w-4.5 text-[#0b2a6b]" />
          </div>
          <div className="flex-1">
            <label htmlFor="audit-page-route-select" className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">
              Select Page Under Audit
            </label>
            <select
              id="audit-page-route-select"
              value={selectedPageId}
              onChange={(e) => onSelectRoute(e.target.value)}
              className="h-9 w-full max-w-md rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-xs font-bold text-slate-900 outline-none focus:border-[#0b2a6b] focus:bg-white shadow-2xs transition cursor-pointer"
            >
              {routes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} ({p.path})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live URL Link */}
        <div className="flex items-center gap-2">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-[#0b2a6b] transition"
          >
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-mono text-[11px] truncate max-w-[220px]">{currentUrl}</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Quick Route Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 [scrollbar-width:thin]">
        <span className="text-[10px] font-extrabold uppercase text-slate-600 shrink-0 mr-1">
          Quick Switch:
        </span>
        {routes.slice(0, 8).map((p) => {
          const isSelected = selectedPageId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectRoute(p.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 ${
                isSelected
                  ? "bg-[#0b2a6b] text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

