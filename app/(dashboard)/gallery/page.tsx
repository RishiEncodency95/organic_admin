"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  FileImage,
  FileText,
  Filter,
  FolderClosed,
  HardDrive,
  Image as ImageIcon,
  MoreVertical,
  Music2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

type MediaType = "Image" | "Video" | "Document" | "Audio";
type MediaStatus = "Published" | "Draft";

type MediaItem = {
  id: number;
  name: string;
  meta: string;
  type: MediaType;
  size: string;
  folder: string;
  uploadedBy: string;
  date: string;
  time: string;
  status: MediaStatus;
  image: string;
};

const MEDIA_ITEMS: MediaItem[] = [
  {
    id: 1,
    name: "hero-home-banner.jpg",
    meta: "1920 × 1080",
    type: "Image",
    size: "245 KB",
    folder: "Banners",
    uploadedBy: "Admin User",
    date: "30 May 2026",
    time: "10:30 AM",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "dignity-care.jpg",
    meta: "1200 × 800",
    type: "Image",
    size: "189 KB",
    folder: "Our Mission",
    uploadedBy: "Admin User",
    date: "29 May 2026",
    time: "04:15 PM",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "volunteers-support.jpg",
    meta: "1280 × 853",
    type: "Image",
    size: "312 KB",
    folder: "About Us",
    uploadedBy: "Seva Team",
    date: "28 May 2026",
    time: "02:20 PM",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 4,
    name: "sewa-steps-infographic.png",
    meta: "1600 × 900",
    type: "Image",
    size: "157 KB",
    folder: "How It Works",
    uploadedBy: "Admin User",
    date: "26 May 2026",
    time: "11:45 AM",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 5,
    name: "policy-document.pdf",
    meta: "",
    type: "Document",
    size: "1.24 MB",
    folder: "Documents",
    uploadedBy: "Admin User",
    date: "24 May 2026",
    time: "01:05 PM",
    status: "Published",
    image: "",
  },
  {
    id: 6,
    name: "moksha-sewa-video.mp4",
    meta: "1920 × 1080",
    type: "Video",
    size: "24.6 MB",
    folder: "Videos",
    uploadedBy: "Seva Team",
    date: "22 May 2026",
    time: "05:30 PM",
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 7,
    name: "mantra-chants.mp3",
    meta: "03:45",
    type: "Audio",
    size: "8.7 MB",
    folder: "Audio",
    uploadedBy: "Admin User",
    date: "20 May 2026",
    time: "09:10 AM",
    status: "Draft",
    image: "",
  },
];

const typeTone: Record<MediaType, string> = {
  Image: "bg-emerald-50 text-emerald-700",
  Video: "bg-blue-50 text-blue-700",
  Document: "bg-violet-50 text-violet-700",
  Audio: "bg-orange-50 text-orange-700",
};

function MetricCard({
  icon,
  iconClass,
  label,
  value,
  note,
  progress,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  note: string;
  progress?: number;
}) {
  return (
    <div className="relative flex h-[56px] min-w-0 items-center gap-[10px] overflow-hidden rounded-[7px] border border-[#e7e9ec] bg-white px-[12px] py-[7px] shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full ${iconClass}`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="break-words text-[9px] font-semibold leading-[11px] text-[#34435e]">{label}</p>
        <div className="mt-[2px] flex items-baseline gap-[6px]">
          <span className="text-[17px] font-semibold leading-none tracking-[-0.03em] text-[#10204a]">
            {value}
          </span>
          <span className="truncate text-[8.5px] font-semibold text-[#64748b]">
            {note}
          </span>
        </div>
      </div>

      {typeof progress === "number" ? (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#eef2f0]">
          <div
            className="h-full rounded-r-full bg-[#0b6a3b]"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function FilePreview({ item }: { item: MediaItem }) {
  if (item.type === "Document") {
    return (
      <div className="grid h-[50px] w-[70px] shrink-0 place-items-center rounded-[7px] border border-[#e5e8eb] bg-[#fff6f6]">
        <FileText className="h-[26px] w-[26px] text-red-500" />
      </div>
    );
  }

  if (item.type === "Audio") {
    return (
      <div className="grid h-[50px] w-[70px] shrink-0 place-items-center rounded-[7px] border border-[#e5e8eb] bg-[#eef3ff]">
        <Music2 className="h-[28px] w-[28px] text-indigo-500" />
      </div>
    );
  }

  return (
    <img
      src={item.image}
      alt=""
      className="h-[50px] w-[70px] shrink-0 rounded-[7px] border border-[#e5e8eb] object-cover"
    />
  );
}

export default function MediaLibraryPage() {
  const router = useRouter();
  const quickUploadRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All Types");
  const [folder, setFolder] = useState("All Folders");
  const [status, setStatus] = useState("All Status");
  const [selectedId, setSelectedId] = useState(1);

  const rows = useMemo(() => {
    return MEDIA_ITEMS.filter((item) => {
      const searchMatch =
        !query ||
        `${item.name} ${item.type} ${item.folder}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const typeMatch = type === "All Types" || item.type === type;
      const folderMatch = folder === "All Folders" || item.folder === folder;
      const statusMatch = status === "All Status" || item.status === status;

      return searchMatch && typeMatch && folderMatch && statusMatch;
    });
  }, [query, type, folder, status]);

  const selected =
    MEDIA_ITEMS.find((item) => item.id === selectedId) ?? MEDIA_ITEMS[0];

  const clearFilters = () => {
    setQuery("");
    setType("All Types");
    setFolder("All Folders");
    setStatus("All Status");
  };

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#075b33]">
              Media Library
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>Media Library</span>
            </nav>
          </div>

          <div className="flex items-center gap-[10px]">
            <input
              type="file"
              ref={quickUploadRef}
              className="hidden"
              multiple
              accept="image/*,video/*,application/pdf,audio/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  router.push("/gallery/created");
                }
              }}
            />

            <button
              type="button"
              onClick={() => router.push("/gallery/1")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <FolderClosed className="h-[15px] w-[15px]" />
              Add New Folder
            </button>

            <button
              type="button"
              onClick={() => quickUploadRef.current?.click()}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#b9d7c4] bg-white px-[18px] text-[10.5px] font-semibold text-[#14683d] transition hover:bg-emerald-50"
            >
              <Upload className="h-[15px] w-[15px]" />
              Upload Files
            </button>

            <button
              type="button"
              onClick={() => router.push("/gallery/created")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Plus className="h-[15px] w-[15px]" />
              Upload New Media
            </button>

            <button
              type="button"
              onClick={() => router.push("/gallery/uploaded")}
              className="grid h-[40px] w-[40px] place-items-center rounded-[6px] border border-[#dfe3e7] bg-white text-[#43516a] transition hover:bg-slate-50"
            >
              <MoreVertical className="h-[15px] w-[15px]" />
            </button>
          </div>
        </header>

        {/* STATS */}
        <section className="mt-[10px] grid grid-cols-6 gap-[10px]">
          <MetricCard
            icon={<FolderClosed className="h-[16px] w-[16px]" />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Files"
            value="1,248"
            note="+ 23 this month"
          />

          <MetricCard
            icon={<ImageIcon className="h-[16px] w-[16px]" />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Images"
            value="832"
            note="66.7% of total"
          />

          <MetricCard
            icon={<Video className="h-[16px] w-[16px]" />}
            iconClass="bg-blue-50 text-blue-700"
            label="Videos"
            value="148"
            note="11.9% of total"
          />

          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Documents"
            value="196"
            note="15.7% of total"
          />

          <MetricCard
            icon={<Music2 className="h-[16px] w-[16px]" />}
            iconClass="bg-violet-50 text-violet-700"
            label="Audio"
            value="72"
            note="5.8% of total"
          />

          <MetricCard
            icon={<HardDrive className="h-[16px] w-[16px]" />}
            iconClass="bg-stone-100 text-stone-700"
            label="Storage Used"
            value="2.48 GB"
            note="24.8% of 10GB"
            progress={24.8}
          />
        </section>

        {/* CONTENT */}
        <section className="mt-[16px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_285px]">
          {/* LEFT */}
          <div className="min-w-0 overflow-hidden">
            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-[10px]">
              <label className="relative min-w-[180px] flex-1">
                <Search className="absolute right-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#5d6b84]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search media by name, type or tag..."
                  className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[14px] pr-[40px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
                />
              </label>

              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="h-[40px] min-w-[120px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Types</option>
                <option>Image</option>
                <option>Video</option>
                <option>Document</option>
                <option>Audio</option>
              </select>

              <select
                value={folder}
                onChange={(event) => setFolder(event.target.value)}
                className="h-[40px] min-w-[125px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Folders</option>
                <option>Banners</option>
                <option>Our Mission</option>
                <option>About Us</option>
                <option>How It Works</option>
                <option>Documents</option>
                <option>Videos</option>
                <option>Audio</option>
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-[40px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
              </select>

              <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center gap-[6px] rounded-[6px] border border-[#cfe4d7] bg-white px-[12px] text-[10px] font-semibold text-[#146a3f] shrink-0"
              >
                <Filter className="h-[14px] w-[14px]" />
                More Filters
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-[40px] items-center justify-center gap-[6px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#35445f] shrink-0"
              >
                <RefreshCw className="h-[14px] w-[14px]" />
                Clear
              </button>
            </div>

            {/* TABLE */}
            <div className="mt-[12px] overflow-hidden rounded-[8px] border border-[#e7e9ec] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[930px] border-collapse text-left">
                  <thead>
                    <tr className="h-[42px] border-b border-[#e7e9ec] bg-[#fafbfc] text-[8.5px] font-semibold uppercase tracking-[0.04em] text-[#44516a]">
                      <th className="w-[42px] px-[12px] text-center">
                        <input type="checkbox" />
                      </th>
                      <th className="px-[8px]">File</th>
                      <th className="px-[8px] whitespace-nowrap">Type</th>
                      <th className="px-[8px] whitespace-nowrap">Size</th>
                      <th className="px-[8px] whitespace-nowrap">Folder</th>
                      <th className="px-[8px] whitespace-nowrap">Uploaded</th>
                      <th className="px-[8px] whitespace-nowrap">Date</th>
                      <th className="px-[8px]">Status</th>
                      <th className="px-[8px] text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`h-[66px] cursor-pointer border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/60 ${selectedId === item.id ? "bg-[#fbfefc]" : ""
                          }`}
                      >
                        <td className="px-[12px] text-center">
                          <input
                            type="checkbox"
                            onClick={(event) => event.stopPropagation()}
                          />
                        </td>

                        <td className="px-[8px]">
                          <div className="flex min-w-[220px] items-center gap-[12px]">
                            <FilePreview item={item} />
                            <div className="min-w-0 overflow-hidden">
                              <p className="truncate text-[10px] font-semibold text-[#19274a]">
                                {item.name}
                              </p>
                              {item.meta ? (
                                <p className="mt-[4px] text-[8.5px] font-semibold text-[#68758d]">
                                  {item.meta}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        <td className="px-[8px]">
                          <span
                            className={`inline-flex rounded-[5px] px-[8px] py-[4px] text-[8px] font-semibold ${typeTone[item.type]}`}
                          >
                            {item.type}
                          </span>
                        </td>

                        <td className="px-[8px] whitespace-nowrap text-[9px] font-semibold text-[#35445f]">
                          {item.size}
                        </td>

                        <td className="px-[8px] whitespace-nowrap text-[9px] font-semibold text-[#35445f]">
                          {item.folder}
                        </td>

                        <td className="px-[8px] whitespace-nowrap text-[9px] font-semibold text-[#35445f]">
                          {item.uploadedBy}
                        </td>

                        <td className="px-[8px] whitespace-nowrap">
                          <span className="text-[9px] font-semibold text-[#35445f]">
                            {item.date}
                          </span>
                          <span className="ml-[4px] text-[8px] font-semibold text-[#68758d]">
                            {item.time}
                          </span>
                        </td>

                        <td className="px-[8px]">
                          <span
                            className={`inline-flex items-center gap-[5px] rounded-[5px] px-[8px] py-[4px] text-[8px] font-semibold ${item.status === "Published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                              }`}
                          >
                            <span
                              className={`h-[5px] w-[5px] rounded-full ${item.status === "Published"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                                }`}
                            />
                            {item.status}
                          </span>
                        </td>

                        <td className="px-[8px]">
                          <div className="flex items-center justify-center gap-[8px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push("/gallery/created");
                              }}
                              className="grid h-[30px] w-[30px] place-items-center rounded-[5px] border border-[#e1e5e9] bg-white text-[#4b5871] hover:bg-slate-50"
                            >
                              <Eye className="h-[12px] w-[12px]" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Downloading ${item.name}`);
                              }}
                              className="grid h-[30px] w-[30px] place-items-center rounded-[5px] border border-[#e1e5e9] bg-white text-[#4b5871] hover:bg-slate-50"
                            >
                              <Download className="h-[12px] w-[12px]" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push("/gallery/uploaded");
                              }}
                              className="grid h-[30px] w-[30px] place-items-center rounded-[5px] border border-[#e1e5e9] bg-white text-[#4b5871] hover:bg-slate-50"
                            >
                              <MoreVertical className="h-[12px] w-[12px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex min-h-[58px] items-center justify-between gap-[12px] border-t border-[#e7e9ec] px-[12px]">
                <p className="text-[9px] font-semibold text-[#47546c]">
                  Showing 1 to {rows.length} of 1,248 files
                </p>

                <div className="flex items-center gap-[6px]">
                  <button type="button" className="grid h-[32px] w-[32px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white">
                    <ChevronLeft className="h-[13px] w-[13px]" />
                  </button>

                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={`grid h-[32px] min-w-[32px] place-items-center rounded-[5px] px-[6px] text-[9px] font-semibold ${page === 1
                        ? "bg-[#075b33] text-white"
                        : "border border-[#dfe3e7] bg-white text-[#35445f]"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <span className="px-[2px] text-[10px] font-semibold text-[#64748b]">…</span>

                  <button type="button" className="grid h-[32px] min-w-[38px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white px-[6px] text-[9px] font-semibold text-[#35445f]">
                    125
                  </button>

                  <button type="button" className="grid h-[32px] w-[32px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white">
                    <ChevronRight className="h-[13px] w-[13px]" />
                  </button>
                </div>

                <select className="h-[32px] rounded-[5px] border border-[#dfe3e7] bg-white px-[10px] text-[9px] font-semibold text-[#35445f]">
                  <option>10 / page</option>
                </select>
              </div>
            </div>

            {/* BOTTOM MESSAGE (Inside Left Column directly below table) */}
            <div className="mt-[12px] flex min-h-[60px] items-center justify-between gap-[16px] rounded-[8px] border border-[#dce8df] bg-[linear-gradient(90deg,#eef7f1,#f7fbf8)] px-[16px] py-[12px]">
              <div className="flex min-w-0 items-center gap-[12px]">
                <ShieldCheck className="h-[24px] w-[24px] shrink-0 text-[#14683d]" />
                <div className="min-w-0 overflow-hidden">
                  <p className="text-[10.5px] font-semibold text-[#274735]">
                    Keep your media library organized!
                  </p>
                  <p className="mt-[2px] truncate text-[9px] font-semibold text-[#64748b]">
                    Use folders, meaningful names and alt text for better performance and accessibility.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/gallery/uploaded")}
                className="inline-flex h-[36px] shrink-0 items-center gap-[8px] rounded-[6px] border border-[#d8e4dc] bg-white px-[14px] text-[9px] font-semibold text-[#14683d] transition hover:bg-emerald-50"
              >
                Media Library Best Practices
                <ChevronRight className="h-[13px] w-[13px]" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-[12px]">
            {/* MEDIA DETAILS */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-semibold text-[#19274a]">
                  Media Details
                </h2>
                <ChevronDown className="h-[14px] w-[14px] rotate-180 text-[#59657a]" />
              </div>

              <div className="mt-[12px]">
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt=""
                    className="h-[120px] w-full rounded-[8px] border border-[#e4e7eb] object-cover"
                  />
                ) : (
                  <div className="grid h-[120px] w-full place-items-center rounded-[8px] border border-[#e4e7eb] bg-[#f6f8fa]">
                    {selected.type === "Audio" ? (
                      <Music2 className="h-[46px] w-[46px] text-indigo-500" />
                    ) : (
                      <FileText className="h-[46px] w-[46px] text-violet-500" />
                    )}
                  </div>
                )}

                <div className="mt-[12px] flex items-center justify-between gap-[8px]">
                  <p className="truncate text-[10px] font-semibold text-[#19274a]">
                    {selected.name}
                  </p>
                  <span
                    className={`shrink-0 rounded-[5px] px-[8px] py-[4px] text-[8px] font-semibold ${typeTone[selected.type]}`}
                  >
                    {selected.type}
                  </span>
                </div>

                <div className="mt-[12px] space-y-[7px] text-[9px]">
                  <p>
                    <span className="font-semibold text-[#69758c]">Uploaded on:</span>{" "}
                    <span className="text-[#34425e]">
                      {selected.date}, {selected.time}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Uploaded by:</span>{" "}
                    <span className="text-[#34425e]">{selected.uploadedBy}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Folder:</span>{" "}
                    <span className="text-emerald-700">{selected.folder}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Size:</span>{" "}
                    <span className="text-[#34425e]">{selected.size}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Dimensions:</span>{" "}
                    <span className="text-[#34425e]">
                      {selected.meta || "—"}
                    </span>
                  </p>
                </div>

                <div className="mt-[12px]">
                  <p className="mb-[6px] text-[9px] font-semibold text-[#34425e]">URL:</p>
                  <div className="flex items-center gap-[8px] rounded-[6px] border border-[#e2e6ea] bg-[#fbfcfd] px-[9px] py-[8px]">
                    <p className="min-w-0 flex-1 break-all text-[8px] font-semibold leading-[1.35] text-[#59657a]">
                      https://mokshasewa.org/wp-content/uploads/2026/05/{selected.name}
                    </p>
                    <Copy className="h-[13px] w-[13px] shrink-0 text-[#60708a] cursor-pointer" onClick={() => navigator.clipboard?.writeText(`https://mokshasewa.org/wp-content/uploads/2026/05/${selected.name}`)} />
                  </div>
                </div>

                <div className="mt-[12px] grid grid-cols-3 gap-[7px]">
                  <button
                    type="button"
                    onClick={() => alert(`Editing details for ${selected.name}`)}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-[#e0e4e8] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                  >
                    <Pencil className="h-[12px] w-[12px]" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => quickUploadRef.current?.click()}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-[#e0e4e8] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                  >
                    <RefreshCw className="h-[12px] w-[12px]" />
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => alert(`Deleting ${selected.name}`)}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-rose-200 bg-white text-[8.5px] font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-[12px] w-[12px]" />
                    Delete
                  </button>
                </div>
              </div>
            </section>

            {/* FILE USAGE */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-semibold text-[#19274a]">
                  File Usage
                </h2>
                <ChevronDown className="h-[14px] w-[14px] rotate-180 text-[#59657a]" />
              </div>

              <p className="mt-[11px] text-[9px] font-semibold text-[#44516a]">
                Used in 5 pages
              </p>

              <div className="mt-[10px] space-y-[9px]">
                {["Home", "About Us", "Our Services", "How Sewa Works", "When a Family Needs Help"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-[8px]">
                      <span className="h-[7px] w-[7px] rounded-full bg-emerald-600" />
                      <span className="text-[8.8px] font-semibold text-[#34425e]">
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[12px] font-semibold text-[#19274a]">
                Quick Actions
              </h2>

              <div className="mt-[10px] grid grid-cols-2 gap-[8px]">
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt("Enter new folder name:");
                    if (name) alert(`Folder '${name}' created!`);
                  }}
                  className="inline-flex h-[36px] items-center justify-center gap-[7px] rounded-[5px] border border-[#e2e6ea] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                >
                  <FolderClosed className="h-[13px] w-[13px]" />
                  Create Folder
                </button>

                <button
                  type="button"
                  onClick={() => alert("Media Settings Window Opened")}
                  className="inline-flex h-[36px] items-center justify-center gap-[7px] rounded-[5px] border border-[#e2e6ea] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                >
                  <Settings className="h-[13px] w-[13px]" />
                  Media Settings
                </button>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}