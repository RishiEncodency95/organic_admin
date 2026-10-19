"use client";

import { useEffect, useState, useRef } from "react";
import {
  Link2,
  Upload,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { backlinkApi, type BacklinkItem, type BacklinkStats } from "@/lib/backlinkApi";
import Spinner from "@/components/ui/Spinner";

export default function BacklinkManager() {
  const [backlinks, setBacklinks] = useState<BacklinkItem[]>([]);
  const [stats, setStats] = useState<BacklinkStats>({
    total: 0,
    active: 0,
    lost: 0,
    broken: 0,
    dofollow: 0,
    nofollow: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLink, setNewLink] = useState({
    targetUrl: "",
    sourceUrl: "",
    anchorText: "",
    type: "dofollow" as "dofollow" | "nofollow",
    daScore: 25,
    status: "active" as "active" | "lost" | "broken",
    notes: "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBacklinks = async () => {
    try {
      setLoading(true);
      const res = await backlinkApi.getAll({
        search,
        status: statusFilter || undefined,
        limit: 50,
      });
      if (res && Array.isArray(res.items)) {
        setBacklinks(res.items);
        if (res.stats) setStats(res.stats);
      }
    } catch {
      // Fallback local dummy if backend is booting or freshly started
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklinks();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBacklinks();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await backlinkApi.uploadExcel(file);
      alert("Excel file uploaded successfully! Backlinks recorded.");
      fetchBacklinks();
    } catch (err: any) {
      alert(err.message || "Failed to upload excel file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.targetUrl || !newLink.sourceUrl) {
      alert("Please provide target and source URLs.");
      return;
    }

    try {
      await backlinkApi.create(newLink);
      setShowAddModal(false);
      setNewLink({
        targetUrl: "",
        sourceUrl: "",
        anchorText: "",
        type: "dofollow",
        daScore: 25,
        status: "active",
        notes: "",
      });
      fetchBacklinks();
    } catch (err: any) {
      alert(err.message || "Failed to add backlink");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this backlink?")) return;
    try {
      await backlinkApi.delete(id);
      fetchBacklinks();
    } catch (err: any) {
      alert(err.message || "Failed to delete backlink");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23471d]">
            <Link2 className="h-4 w-4" /> Off-Page SEO Intelligence
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
            Backlinks of Bharat Organic Website
          </h2>
          <p className="text-xs font-medium text-slate-500">
            See how many backlinks point to bharatorganicexpo.com, from where, and which ones are active, lost, or broken.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#23471d] px-3.5 text-xs font-bold text-white hover:bg-[#1a3516] transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload Excel Sheet
          </button>

          <a
            href={backlinkApi.getExportUrl()}
            download
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export Excel
          </a>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Single
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-slate-100/70 border-b border-slate-200 text-slate-800">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Backlinks</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Uploaded & Verified</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-emerald-600">Active Links</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Live & Indexing</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-indigo-600">Dofollow Links</div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{stats.dofollow}</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">High SEO Juice</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-500">Nofollow Links</div>
          <div className="text-2xl font-black text-slate-700 mt-1">{stats.nofollow}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Natural Ratio</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-amber-600">Lost Links</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.lost}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Needs Outreach</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-rose-600">Broken Links</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{stats.broken}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">404 or Removed</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Target, Source URL or Anchor..."
              className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-3.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-700 outline-none focus:border-emerald-600"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="lost">Lost Only</option>
            <option value="broken">Broken Only</option>
          </select>
          <button
            type="button"
            onClick={fetchBacklinks}
            className="h-9 w-9 rounded-lg border border-slate-300 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
            title="Refresh Backlinks"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Backlinks Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner />
            <p className="mt-3 text-xs font-bold text-slate-400">Loading Backlinks Matrix...</p>
          </div>
        ) : backlinks.length === 0 ? (
          <div className="py-16 text-center">
            <FileSpreadsheet className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Backlinks Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Upload your backlink Excel sheet or add a link manually to start tracking authority and link juice.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Source Backlink URL</th>
                <th className="py-3 px-4">Target Landing Route</th>
                <th className="py-3 px-4">Anchor Text</th>
                <th className="py-3 px-4 text-center">DA Score</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {backlinks.map((link) => (
                <tr key={link._id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 max-w-xs truncate">
                    <a
                      href={link.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      {link.sourceUrl}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px] text-slate-600">
                    {link.targetUrl}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {link.anchorText || <span className="text-slate-400 italic">No Anchor</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full font-black text-[11px] bg-slate-100 text-slate-800">
                      DA {link.daScore || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        link.type === "dofollow"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {link.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        link.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : link.status === "lost"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {link.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(link._id)}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Backlink"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-[#23471d] mb-1">Add Single Backlink Record</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter details for a single acquired backlink to store in the Bharat Organic SEO database.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Target URL (Your Website Route)</label>
                <input
                  type="text"
                  required
                  placeholder="https://bharatorganicexpo.com/exhibitors"
                  value={newLink.targetUrl}
                  onChange={(e) => setNewLink({ ...newLink, targetUrl: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-emerald-600 font-normal"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Source URL (Where the backlink is placed)</label>
                <input
                  type="text"
                  required
                  placeholder="https://partner-portal.com/blog/organic-future"
                  value={newLink.sourceUrl}
                  onChange={(e) => setNewLink({ ...newLink, sourceUrl: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-emerald-600 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Anchor Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Bharat Organic Expo"
                    value={newLink.anchorText}
                    onChange={(e) => setNewLink({ ...newLink, anchorText: e.target.value })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-emerald-600 font-normal"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Domain Authority (DA: 0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newLink.daScore}
                    onChange={(e) => setNewLink({ ...newLink, daScore: Number(e.target.value) })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-emerald-600 font-normal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Link Type</label>
                  <select
                    value={newLink.type}
                    onChange={(e) => setNewLink({ ...newLink, type: e.target.value as any })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-emerald-600"
                  >
                    <option value="dofollow">Dofollow</option>
                    <option value="nofollow">Nofollow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Link Status</label>
                  <select
                    value={newLink.status}
                    onChange={(e) => setNewLink({ ...newLink, status: e.target.value as any })}
                    className="h-9 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-emerald-600"
                  >
                    <option value="active">Active</option>
                    <option value="lost">Lost</option>
                    <option value="broken">Broken</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#23471d] text-white font-bold hover:bg-[#1a3516] transition shadow-xs"
                >
                  Save Backlink
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
