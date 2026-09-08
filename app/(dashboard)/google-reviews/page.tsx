"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { FlaskConical, RefreshCw, X } from "lucide-react";
import { gbpApi, type Connection, type GbpDashboard, type GbpLocation, type GbpReview } from "@/lib/gbpApi";
import GoogleReviewsScreen from "./GoogleReviewsScreen";
import { demoReviewsData, toReviewsData } from "./reviewsData";

const emptyDashboard: GbpDashboard = {
  metrics: { overallRating: 0, totalReviews: 0, newReviews: 0, pendingReplies: 0 },
  tabCounts: { all: 0, new: 0, pending: 0, replied: 0, negative: 0 },
  ratingBreakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percentage: 0 })),
  trend: [], byLocation: [], negativeReviews: [], lastSyncedAt: null,
};

// The screen filters, searches and pages client-side, so one generous fetch backs the whole view.
const ROW_FETCH_LIMIT = 100;
const fmt = (d: string | null) => (d ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d)) : "Never");

// The demo flag lives in localStorage so the preview survives reloads; read through a store to stay SSR-safe.
const DEMO_FLAG = "gbp:demo";
const demoListeners = new Set<() => void>();
const readDemo = () => { try { return localStorage.getItem(DEMO_FLAG) === "1" } catch { return false } };
const subscribeDemo = (cb: () => void) => { demoListeners.add(cb); return () => { demoListeners.delete(cb) } };
const writeDemo = (on: boolean) => { try { if (on) localStorage.setItem(DEMO_FLAG, "1"); else localStorage.removeItem(DEMO_FLAG) } catch {} demoListeners.forEach((cb) => cb()) };

export default function GoogleReviewsPage() {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [locations, setLocations] = useState<GbpLocation[]>([]);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [rows, setRows] = useState<GbpReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(false);

  // Demo preview fills the very same screen with sample data, so the post-connection view can be
  // reviewed before Google is linked. When real data arrives only the data changes, not the UI.
  const demo = useSyncExternalStore(subscribeDemo, readDemo, () => false);
  function toggleDemo(on: boolean) { setSettings(false); setError(""); if (!on) setLoading(true); writeDemo(on) }

  // Every setState here lands after an await, so mounting this effect does not cascade a render.
  const load = useCallback(async () => {
    if (demo) return;
    try {
      const c = await gbpApi.connection();
      setError("");
      setConnection(c);
      if (!c.connected) { setDashboard(emptyDashboard); setRows([]); setLocations([]); return }
      const [l, d, r] = await Promise.all([
        gbpApi.locations(),
        gbpApi.dashboard({}),
        gbpApi.reviews({ page: 1, limit: ROW_FETCH_LIMIT, sortBy: "createTime", sortOrder: "desc" }),
      ]);
      setLocations(l); setDashboard(d); setRows(r.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load Google reviews");
    } finally {
      setLoading(false);
    }
  }, [demo]);
  useEffect(() => { load() }, [load]);

  async function connect() {
    try { const { url } = await gbpApi.oauthUrl(); window.location.assign(url) }
    catch (e) { setError(e instanceof Error ? e.message : "Could not start Google connection") }
  }

  async function sync() {
    setError("");
    try { await gbpApi.sync(); await load() }
    catch (e) { setError(e instanceof Error ? e.message : "Review sync failed") }
  }

  const connected = Boolean(connection?.connected);
  const data = demo ? demoReviewsData : toReviewsData(dashboard, rows, connection, locations, "All time");

  return (
    <section className="min-h-full">
      {error && (
        <div className="mx-4 mt-4 flex justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError("")}><X size={16} /></button>
        </div>
      )}

      {demo || connected ? (
        <GoogleReviewsScreen data={data} onSettings={() => setSettings(true)} onSync={demo ? undefined : sync} />
      ) : (
        !loading && (
          <div className="mx-auto max-w-2xl mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-gradient-to-b from-blue-50/50 to-white px-8 py-16 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-100 mb-8 transition-transform hover:scale-105">
                <Image src="/google-g-logo.svg" alt="Google Business Profile" width={40} height={40} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Connect Google Business Profile</h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500">
                No reviews or metrics are shown until a real Google account is connected and synced. 
                Unlock insights and manage your reputation seamlessly.
              </p>
              
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button 
                  onClick={connect} 
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-[#00864a] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#007640] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00864a] focus:ring-offset-2 sm:w-auto"
                >
                  <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <Image src="/google-g-logo.svg" alt="" width={14} height={14} />
                  </div>
                  Connect Google
                </button>
                <button 
                  onClick={() => toggleDemo(true)} 
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 sm:w-auto"
                >
                  <FlaskConical size={18} className="text-slate-400" /> 
                  Preview with demo data
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <span className="block h-px w-8 bg-slate-200"></span>
                <p>Demo preview is sample data only</p>
                <span className="block h-px w-8 bg-slate-200"></span>
              </div>
            </div>
          </div>
        )
      )}

      {!demo && loading && (
        <div className="fixed inset-0 grid place-items-center bg-white/50">
          <RefreshCw className="animate-spin text-[#00864a]" />
        </div>
      )}

      {settings && (
        <Modal close={() => setSettings(false)} title="Integration settings">
          <div className="space-y-2 text-sm">
            <p>Status: <b>{demo ? "Demo preview" : connected ? "Connected" : "Disconnected"}</b></p>
            <p>Google account: {connection?.googleEmail || "—"}</p>
            <p>OAuth health: {connection?.oauthHealth || "—"}</p>
            <p>Locations: {connection?.locationCount || 0}</p>
            <p>Notifications: {connection?.notifications || "notifications_not_configured"}</p>
            <p>Last successful sync: {fmt(connection?.lastSuccessfulSync || null)}</p>

            <label className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-[#e1e6eb] bg-slate-50 p-3">
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold"><FlaskConical size={15} /> Demo data preview</span>
                <span className="mt-1 block text-xs text-slate-500">Fills this screen with sample reviews. The layout is identical to the live one, only the data is swapped.</span>
              </span>
              <input type="checkbox" checked={demo} onChange={(e) => toggleDemo(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#00864a]" />
            </label>

            <div className="flex gap-2 pt-3">
              {!demo && <button onClick={connect} className="rounded-lg bg-[#00864a] px-4 py-2 text-white">{connected ? "Reconnect" : "Connect"}</button>}
              {connected && !demo && (
                <button onClick={async () => { await gbpApi.disconnect(); setSettings(false); await load() }} className="rounded-lg border px-4 py-2 text-red-600">Disconnect</button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function Modal({ title, children, close }: { title: string; children: React.ReactNode; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={close}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
