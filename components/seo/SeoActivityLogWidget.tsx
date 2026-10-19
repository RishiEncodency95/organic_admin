"use client";

import { useEffect, useState } from "react";
import { History, RefreshCw, UserCheck, Calendar, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

interface ActivityLogItem {
  _id: string;
  userName: string;
  action: string;
  module: string;
  url: string;
  method: string;
  status: string;
  details: string;
  createdAt: string;
}

export default function SeoActivityLogWidget() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Fetch activity logs filtered by SEO or recent admin writes
      const res = await api.get<{
        items?: ActivityLogItem[];
        total?: number;
      }>("/activity-logs?limit=15");

      const items = res?.items || [];
      // Filter for SEO related items if available, or show general audit trail
      const seoRelated = items.filter(
        (i) =>
          i.module?.toLowerCase().includes("seo") ||
          i.url?.toLowerCase().includes("seo") ||
          i.details?.toLowerCase().includes("seo") ||
          i.details?.toLowerCase().includes("backlink")
      );

      setLogs(seoRelated.length > 0 ? seoRelated : items.slice(0, 10));
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23471d]">
            <History className="h-4 w-4" /> Live Audit Trail
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
            SEO Changes & Audit Activity Log
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Real-time tracking of every meta tag update, backlink added, and audit trigger made by admin team.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="h-8 w-8 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          title="Refresh Log"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Spinner />
            <p className="mt-2 text-xs font-semibold text-slate-400">Loading recent SEO logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ShieldCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No SEO Changes Logged Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Any time an administrator saves meta tags, uploads backlinks or modifies robots/canonical, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div
                key={log._id}
                className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-md border border-emerald-200/60 bg-emerald-50/80 hover:bg-emerald-100/80 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] flex items-center justify-center shrink-0">
                    {log.userName?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-900 truncate">
                      <span>{log.userName || "Admin"}</span>{" "}
                      <span className="font-semibold text-slate-500">
                        {log.details || `${log.action} in ${log.module}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span>{log.url}</span>
                      <span>•</span>
                      <span className="font-sans font-bold text-emerald-700">{log.status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700">
                    {log.action}
                  </span>
                  <div className="text-[9px] text-slate-400 flex items-center gap-1 justify-end font-medium">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
