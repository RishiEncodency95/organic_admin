"use client";
import { getImageSizeError, showUploadError } from "@/lib/uploadLimit";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { getBackendUrl } from "@/lib/api";
import typography from "../pages/PagesTypography.module.css";
import {
  Video,
  Plus,
  Search,
  Check,
  Clock3,
  Pencil,
  Trash2,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Play,
  UploadCloud,
  X,
  CheckCircle2,
  FileVideo,
  ArrowRight,
  FileEdit,
  Trash,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Swal from "sweetalert2";
import { useAppSelector } from "@/store/hooks";

const BACKEND_URL = getBackendUrl();

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const showSuccess = (msg: string) => {
  Toast.fire({ icon: "success", title: msg });
};

const showError = (msg: string) => {
  Toast.fire({ icon: "error", title: msg });
};

const YoutubeIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

type VideoPlatform = "youtube" | "instagram" | "upload";
type VideoStatus = "Published" | "Draft";

interface VideoHighlightItem {
  id: number;
  _id?: string;
  title: string;
  category: string;
  videoType: VideoPlatform;
  videoUrl: string;
  thumbnail: string;
  order: number;
  status: VideoStatus;
  uploadedBy: string;
  date: string;
  time: string;
}

const DEFAULT_ITEMS: VideoHighlightItem[] = [];

const extractYouTubeId = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (parsed.searchParams.has("v")) {
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last.length === 11) return last;
  } catch {}
  return null;
};

const getYouTubeThumbnail = (url: string): string => {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const extractInstagramId = (url: string): string | null => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:instagram\.com\/(?:reel|p|tv|share\/reel)\/|instagr\.am\/(?:reel|p|tv)\/)([\w-]+)/i);
  return match && match[1] ? match[1] : null;
};

const getInstagramEmbedUrl = (url: string): string => {
  if (!url) return url;
  const match = url.match(/instagram\.com\/(reel|p|tv|share\/reel)\/([\w-]+)/i);
  if (!match) return url;
  const type = match[1].toLowerCase() === "p" ? "p" : "reel";
  return `https://www.instagram.com/${type}/${match[2]}/embed/`;
};

const generateInstagramCover = (title: string, reelId?: string | null): string => {
  const safeTitle = (title || "Expo Video Reel").replace(/[<>&"]/g, "");
  const tagText = reelId ? `@Instagram Reel / ${reelId}` : "Instagram Reel";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18041d"/>
        <stop offset="35%" stop-color="#2c0b3f"/>
        <stop offset="70%" stop-color="#4B1426"/>
        <stop offset="100%" stop-color="#0e0212"/>
      </linearGradient>
      <linearGradient id="igBadge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f09433"/>
        <stop offset="25%" stop-color="#e6683c"/>
        <stop offset="50%" stop-color="#dc2743"/>
        <stop offset="75%" stop-color="#cc2366"/>
        <stop offset="100%" stop-color="#bc1888"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>
    <rect width="1280" height="720" fill="url(#bgGrad)"/>
    <circle cx="1080" cy="180" r="340" fill="url(#igBadge)" opacity="0.32" filter="blur(90px)"/>
    <circle cx="220" cy="580" r="300" fill="#4B1426" opacity="0.4" filter="blur(90px)"/>
    <circle cx="640" cy="360" r="220" fill="#1b5e20" opacity="0.2" filter="blur(90px)"/>
    <g transform="translate(640, 240)" filter="url(#glow)">
      <rect x="-56" y="-56" width="112" height="112" rx="30" fill="url(#igBadge)"/>
      <rect x="-38" y="-38" width="76" height="76" rx="20" fill="none" stroke="#ffffff" stroke-width="6"/>
      <circle cx="0" cy="0" r="19" fill="none" stroke="#ffffff" stroke-width="6"/>
      <circle cx="22" cy="-22" r="5.5" fill="#ffffff"/>
    </g>
    <g transform="translate(640, 380)" filter="url(#glow)">
      <circle cx="0" cy="0" r="32" fill="#ffffff" opacity="0.96"/>
      <polygon points="-8,-13 15,0 -8,13" fill="#cc2366"/>
    </g>
    <g transform="translate(640, 460)">
      <rect x="-140" y="-18" width="280" height="36" rx="18" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"/>
      <text x="0" y="5" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" text-anchor="middle" letter-spacing="1">${tagText}</text>
    </g>
    <text x="640" y="545" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" text-anchor="middle" filter="url(#glow)">${safeTitle}</text>
    <text x="640" y="595" fill="rgba(255,255,255,0.7)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="600" text-anchor="middle" letter-spacing="2">BHARAT ORGANIC EXPO • VIDEO HIGHLIGHTS</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const formatTimestamp = () => {
  const d = new Date();
  const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return { date: dateStr, time: timeStr };
};

export default function VideoHighlightsManagementPage() {
  const currentAdmin = useAppSelector((state) => state.auth.admin);

  const getAdminDisplayName = () => {
    if (currentAdmin?.name && currentAdmin.name.trim().length > 0) {
      return currentAdmin.name.trim();
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("ms_admin_auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.admin?.name && typeof parsed.admin.name === "string" && parsed.admin.name.trim().length > 0) {
            return parsed.admin.name.trim();
          }
        }
      } catch {}
    }
    return "Vansh Chaudhary";
  };

  const [videos, setVideos] = useState<VideoHighlightItem[]>(DEFAULT_ITEMS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [platformFilter, setPlatformFilter] = useState("All Platforms");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewVideoItem, setPreviewVideoItem] = useState<VideoHighlightItem | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formVideoType, setFormVideoType] = useState<VideoPlatform>("youtube");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formStatus, setFormStatus] = useState<VideoStatus>("Published");
  const [formOrder, setFormOrder] = useState(1);
  // Only true once the admin actually edits the Order box — until then we don't send an
  // order at all, so the backend places the new upload at the top on its own.
  const [formOrderTouched, setFormOrderTouched] = useState(false);

  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const fetchBackendVideos = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(`${BACKEND_URL}/api/website/gallery/video-highlights/items`);
      if (!res.ok) return;
      const json = await res.json();
      const rawItems = json?.data;
      if (Array.isArray(rawItems)) {
        const mapped: VideoHighlightItem[] = rawItems.map((v: any, index: number) => ({
          id: index + 1,
          _id: v._id,
          title: v.title || `Video #${index + 1}`,
          category: v.category || "",
          videoType: (v.videoType as VideoPlatform) || "youtube",
          videoUrl: v.videoUrl || "",
          thumbnail: v.thumbnail || "",
          order: typeof v.order === "number" ? v.order : index + 1,
          status: (v.status as VideoStatus) || "Published",
          uploadedBy: v.uploadedBy || getAdminDisplayName(),
          date: v.date || "",
          time: v.time || "",
        }));
        setVideos(mapped);
        setSelectedId((prev) => (mapped.length === 0 ? null : prev && mapped.some((m) => m.id === prev) ? prev : mapped[0].id));
      }
    } catch (err) {
      console.error("Failed to fetch video highlights from backend:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchBackendVideos();
  }, []);

  const filteredRows = useMemo(() => {
    return videos.filter((item) => {
      const searchMatch = !query || `${item.title} ${item.videoType}`.toLowerCase().includes(query.toLowerCase());
      const statusMatch = statusFilter === "All Status" || item.status === statusFilter;
      const platformMatch = platformFilter === "All Platforms" || item.videoType.toLowerCase() === platformFilter.toLowerCase();
      return searchMatch && statusMatch && platformMatch;
    });
  }, [videos, query, statusFilter, platformFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const selected = useMemo(() => {
    if (!selectedId) return videos[0] || null;
    return videos.find((v) => v.id === selectedId) || null;
  }, [videos, selectedId]);

  const totalCount = videos.length;
  const publishedCount = useMemo(() => videos.filter((x) => x.status === "Published").length, [videos]);
  const draftCount = useMemo(() => videos.filter((x) => x.status === "Draft").length, [videos]);
  const youtubeCount = useMemo(() => videos.filter((x) => x.videoType === "youtube").length, [videos]);
  const instaCount = useMemo(() => videos.filter((x) => x.videoType === "instagram").length, [videos]);
  const uploadedCount = useMemo(() => videos.filter((x) => x.videoType === "upload").length, [videos]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormTitle("");
    setFormVideoType("youtube");
    setFormVideoUrl("");
    setFormThumbnail("");
    setFormStatus("Published");
    setFormOrder(videos.length > 0 ? Math.max(...videos.map((v) => v.order ?? 1)) + 1 : 1);
    setFormOrderTouched(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (item: VideoHighlightItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormVideoType(item.videoType);
    setFormVideoUrl(item.videoUrl);
    setFormThumbnail(item.thumbnail);
    setFormStatus(item.status);
    setFormOrder(item.order ?? 1);
    setFormOrderTouched(true);
    setIsEditModalOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeError = await getImageSizeError(file);
    if (sizeError) {
      showUploadError(sizeError);
      e.target.value = "";
      return;
    }

    let res: Response | null = null;
    try {
      const formData = new FormData();
      formData.append("file", file);
      res = await fetch(`${BACKEND_URL}/api/uploads`, { method: "POST", body: formData });
      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json?.data?.url || json?.url || json?.fileUrl;
        if (uploadedUrl) {
          const finalUrl = uploadedUrl.startsWith("http") ? uploadedUrl : `${BACKEND_URL}${uploadedUrl}`;
          setFormThumbnail(finalUrl);
          showSuccess("Custom thumbnail uploaded successfully!");
          return;
        }
      }
    } catch {
      res = null;
    }

    if (res) {
      const errorBody = await res.json().catch(() => null);
      showUploadError(errorBody?.message || `Upload failed (status ${res.status}).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormThumbnail(reader.result);
        showSuccess("Custom thumbnail attached!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      showError("Video file must be less than 50MB");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BACKEND_URL}/api/uploads`, { method: "POST", body: formData });
      if (res.ok) {
        const json = await res.json();
        const url = json?.data?.url || json?.url || json?.fileUrl;
        if (url) {
          const finalUrl = url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
          setFormVideoUrl(finalUrl);
          showSuccess("Video file uploaded successfully!");
          return;
        }
      }
    } catch {}

    const localUrl = URL.createObjectURL(file);
    setFormVideoUrl(localUrl);
    showSuccess("Video file attached!");
  };

  const handleSaveVideo = async () => {
    if (!formTitle.trim()) {
      showError("Please enter a video title.");
      return;
    }
    if (!formVideoUrl.trim()) {
      showError("Please provide a video URL or upload a video file.");
      return;
    }

    let finalThumbnail = formThumbnail.trim();
    if (!finalThumbnail) {
      if (formVideoType === "youtube") {
        finalThumbnail = getYouTubeThumbnail(formVideoUrl.trim());
      } else if (formVideoType === "instagram") {
        finalThumbnail = generateInstagramCover(formTitle.trim(), extractInstagramId(formVideoUrl.trim()));
      }
    }

    const ts = formatTimestamp();
    const adminName = getAdminDisplayName();

    const payload: Record<string, unknown> = {
      title: formTitle.trim(),
      videoType: formVideoType,
      videoUrl: formVideoUrl.trim(),
      thumbnail: finalThumbnail,
      status: formStatus,
      uploadedBy: adminName,
      date: ts.date,
      time: ts.time,
    };
    if (formOrderTouched) {
      payload.order = formOrder;
    }

    try {
      if (isEditModalOpen && editingId !== null) {
        const editingItem = videos.find((v) => v.id === editingId);
        if (editingItem?._id) {
          const res = await fetch(`${BACKEND_URL}/api/website/gallery/video-highlights/items/${editingItem._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        }
        setIsEditModalOpen(false);
        showSuccess(`"${formTitle.trim()}" updated successfully!`);
      } else {
        const res = await fetch(`${BACKEND_URL}/api/website/gallery/video-highlights/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        setIsAddModalOpen(false);
        showSuccess(`Video "${formTitle.trim()}" created successfully!`);
      }
      await fetchBackendVideos();
    } catch (err) {
      console.error("Failed to save video highlight:", err);
      showError("Could not save this video. Please try again.");
    }
  };

  const handleStatusChange = async (item: VideoHighlightItem, nextStatus: VideoStatus) => {
    if (!item._id) return;
    setVideos((prev) => prev.map((v) => (v.id === item.id ? { ...v, status: nextStatus } : v)));
    try {
      const res = await fetch(`${BACKEND_URL}/api/website/gallery/video-highlights/items/${item._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      showSuccess(`Status changed to ${nextStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      showError("Could not update status. Please try again.");
      await fetchBackendVideos();
    }
  };

  const handleDelete = async (item: VideoHighlightItem) => {
    const confirmed = await Swal.fire({
      title: `Delete "${item.title}"?`,
      text: "This video will be permanently removed from the website.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!confirmed.isConfirmed || !item._id) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/website/gallery/video-highlights/items/${item._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      showSuccess(`"${item.title}" deleted.`);
      if (selectedId === item.id) setSelectedId(null);
      await fetchBackendVideos();
    } catch (err) {
      console.error("Failed to delete video highlight:", err);
      showError("Could not delete this video. Please try again.");
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginatedRows.map((r) => r.id) : []);
  };

  const handleBulkDelete = async () => {
    const ids = videos.filter((v) => selectedIds.includes(v.id) && v._id).map((v) => v._id as string);
    if (ids.length === 0) return;
    const confirmed = await Swal.fire({
      title: `Delete ${ids.length} selected video(s)?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete All",
      confirmButtonColor: "#dc2626",
    });
    if (!confirmed.isConfirmed) return;
    try {
      setBulkDeleting(true);
      const res = await fetch(`${BACKEND_URL}/api/website/gallery/video-highlights/items/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      showSuccess(`${ids.length} video(s) deleted successfully!`);
      setSelectedIds([]);
      await fetchBackendVideos();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showError("Could not delete the selected videos. Please try again.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const statCards = useMemo(
    () => [
      {
        title: "TOTAL VIDEOS",
        value: totalCount,
        icon: Video,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View all videos",
        onClick: () => {
          setStatusFilter("All Status");
          setPlatformFilter("All Platforms");
          setQuery("");
        },
      },
      {
        title: "PUBLISHED",
        value: publishedCount,
        icon: Check,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        footer: "Live on website",
        onClick: () => { setStatusFilter("Published"); setCurrentPage(1); },
      },
      {
        title: "DRAFT",
        value: draftCount,
        icon: FileEdit,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#ea580c",
        footer: "Not live yet",
        onClick: () => { setStatusFilter("Draft"); setCurrentPage(1); },
      },
      {
        title: "YOUTUBE",
        value: youtubeCount,
        icon: YoutubeIcon,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
        borderColor: "#fecdd3",
        numColor: "#dc2626",
        footer: "YouTube links",
        onClick: () => { setPlatformFilter("youtube"); setCurrentPage(1); },
      },
      {
        title: "INSTAGRAM",
        value: instaCount,
        icon: InstagramIcon,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fbcfe8 100%)",
        borderColor: "#fbcfe8",
        numColor: "#db2777",
        footer: "Insta reels",
        onClick: () => { setPlatformFilter("instagram"); setCurrentPage(1); },
      },
      {
        title: "UPLOADED",
        value: uploadedCount,
        icon: UploadCloud,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        footer: "Direct file uploads",
        onClick: () => { setPlatformFilter("upload"); setCurrentPage(1); },
      },
    ],
    [totalCount, publishedCount, draftCount, youtubeCount, instaCount, uploadedCount]
  );

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]" style={{ color: "#23471d" }}>
              Video Highlights
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Manage YouTube, Instagram and uploaded reels shown in the "Video Highlights" section of the Gallery page.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            {isSyncing && (
              <span className="flex items-center gap-1.5 text-[9px] font-semibold text-[#006199] bg-[#e0f2fe] px-2.5 py-1 rounded-[4px] border border-[#bae6fd] animate-pulse">
                <Clock3 className="h-3 w-3 animate-spin" />
                Syncing...
              </span>
            )}

            <a
              href="http://localhost:3002/gallery"
              target="_blank"
              rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm active:scale-95"
            >
              <ExternalLink className="h-[12px] w-[12px] text-[#ea580c]" strokeWidth={1.7} />
              View on Website
            </a>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#dc2626] px-[14px] text-[8.5px] font-semibold text-white shadow-sm transition hover:bg-[#b91c1c] active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <Trash className="h-[12px] w-[12px] text-white" strokeWidth={1.7} />
                {bulkDeleting ? "Deleting..." : `Bulk Delete (${selectedIds.length})`}
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d] active:scale-95 cursor-pointer"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Upload New Video
            </button>
          </div>
        </div>

        <div className="mt-[12px] grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-[98px] flex-col overflow-hidden rounded-[11px] border border-[#e5e7e6] bg-white p-2 !pb-5.5 transition-all hover:translate-y-[-1px]"
                style={{
                  background: item.gradient,
                  borderColor: item.borderColor || undefined,
                  boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full ring-1 ring-black/5 bg-white/80 shadow-xs text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[8.5px] !font-semibold tracking-[0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
                      {item.title}
                    </p>
                    <div className="mt-1.5 flex items-end gap-1">
                      <span className="text-[21px] !font-semibold leading-none tracking-[-0.04em]" style={{ color: item.numColor, fontWeight: 600 }}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
                <div onClick={item.onClick} className="absolute bottom-1 left-2 right-2 flex cursor-pointer items-center justify-center gap-1 text-[8px] font-semibold text-[#293957] transition hover:text-blue-600">
                  {item.footer}
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>

        <section className="mt-[12px] grid grid-cols-1 gap-[12px] lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <div
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ecefe8] bg-[#fbfbfa] px-[12px] py-[8px]"
              style={{ borderRadius: "0px", boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by title or platform..."
                    className="h-[25px] w-[210px] rounded-[4px] border border-[#d8dce2] bg-white pl-[24px] pr-[10px] text-[8.5px] font-medium text-[#19274a] placeholder-[#8a94a6] outline-none transition focus:border-[#4B1426]"
                  />
                  <Search className="absolute left-[7px] top-[6.5px] h-3 w-3 text-[#8a94a6]" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="h-[25px] rounded-[4px] border border-[#d8dce2] bg-white px-[8px] text-[8.5px] font-semibold text-[#334155] outline-none cursor-pointer"
                >
                  <option value="All Status">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>

                <select
                  value={platformFilter}
                  onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
                  className="h-[25px] rounded-[4px] border border-[#d8dce2] bg-white px-[8px] text-[8.5px] font-semibold text-[#334155] outline-none cursor-pointer"
                >
                  <option value="All Platforms">All Platforms</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="upload">Uploaded Videos</option>
                </select>

                {(query || statusFilter !== "All Status" || platformFilter !== "All Platforms") && (
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setStatusFilter("All Status"); setPlatformFilter("All Platforms"); setCurrentPage(1); }}
                    className="flex h-[25px] items-center gap-1 rounded-[4px] border border-[#d8dce2] bg-white px-2 text-[8px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="mt-[12px] bg-white" style={{ borderRadius: "0px", boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset" }}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left font-inter">
                  <thead>
                    <tr className="bg-[#4B1426] border-b border-[#3b0f1e]">
                      <th className="rounded-tl-[6px] px-[12px] py-[6px] text-center w-[36px]">
                        <input
                          type="checkbox"
                          className="accent-white cursor-pointer"
                          checked={paginatedRows.length > 0 && paginatedRows.every((r) => selectedIds.includes(r.id))}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Order</th>
                      <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Video</th>
                      <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Platform</th>
                      <th className="px-[12px] py-[6px] whitespace-nowrap text-[8.5px] font-bold text-white uppercase tracking-wider">Updated By</th>
                      <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">Status</th>
                      <th className="rounded-tr-[6px] px-[12px] py-[6px] text-right text-[8.5px] font-bold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0ec]">
                    {paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs font-medium text-slate-500">
                          No video highlights found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((item) => {
                        const isCurrent = selectedId === item.id;
                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedId(item.id)}
                            className={`transition hover:bg-slate-50/80 cursor-pointer ${isCurrent ? "bg-[#f4faf6]" : ""}`}
                          >
                            <td className="px-[12px] py-[8px] text-center">
                              <input
                                type="checkbox"
                                className="accent-[#4B1426] cursor-pointer"
                                checked={selectedIds.includes(item.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => handleToggleSelect(item.id)}
                              />
                            </td>

                            <td className="px-[12px] py-[8px] whitespace-nowrap">
                              <span className="text-[8px] font-semibold text-[#293681]">#{item.order ?? item.id}</span>
                            </td>

                            <td className="px-[12px] py-[8px]">
                              <div className="flex items-center gap-[10px] min-w-[200px] max-w-[340px]">
                                <div
                                  onClick={(e) => { e.stopPropagation(); setPreviewVideoItem(item); }}
                                  className="group/thumb relative w-[76px] h-[44px] rounded-[6px] overflow-hidden border border-slate-200 shadow-sm bg-slate-900 cursor-pointer shrink-0"
                                >
                                  {item.videoType === "instagram" && item.thumbnail.startsWith("data:image/svg+xml") ? (
                                    <iframe
                                      src={getInstagramEmbedUrl(item.videoUrl)}
                                      loading="lazy"
                                      scrolling="no"
                                      title={item.title}
                                      className="absolute top-1/2 left-1/2 pointer-events-none"
                                      style={{ width: 400, height: 700, border: "none", transform: "translate(-50%, -50%) scale(0.19)" }}
                                    />
                                  ) : (
                                    <img
                                      src={item.thumbnail || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop"}
                                      alt=""
                                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                    />
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow group-hover/thumb:scale-110 transition-transform">
                                      <Play className="w-2.5 h-2.5 fill-[#1b5e20] text-[#1b5e20] ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-bold text-[#19274a] line-clamp-1 leading-snug">{item.title}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-[12px] py-[8px] whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[8px] font-bold uppercase ${
                                  item.videoType === "youtube"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : item.videoType === "instagram"
                                    ? "bg-pink-50 text-pink-700 border border-pink-200"
                                    : "bg-sky-50 text-sky-700 border border-sky-200"
                                }`}
                              >
                                {item.videoType === "youtube" && <YoutubeIcon className="h-3 w-3 text-red-600" />}
                                {item.videoType === "instagram" && <InstagramIcon className="h-3 w-3 text-pink-600" />}
                                {item.videoType === "upload" && <FileVideo className="h-3 w-3 text-sky-600" />}
                                {item.videoType}
                              </span>
                            </td>

                            <td className="px-[12px] py-[8px] whitespace-nowrap">
                              <div className="flex flex-col items-start leading-tight">
                                <span className="text-[9px] font-bold text-[#4B1426] whitespace-nowrap">{item.uploadedBy}</span>
                                <span className="text-[8px] font-medium text-[#64748b] mt-0.5 whitespace-nowrap">{item.date}{item.time ? `, ${item.time}` : ""}</span>
                              </div>
                            </td>

                            <td className="px-[12px] py-[8px]">
                              <select
                                key={`${item.id}-${item.status}`}
                                value={item.status}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleStatusChange(item, e.target.value as VideoStatus)}
                                className={`h-[24px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[8px] font-bold outline-none bg-no-repeat bg-[right_6px_center] shadow-xs transition ${
                                  item.status === "Published"
                                    ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                                    : "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
                                }`}
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                }}
                              >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                              </select>
                            </td>

                            <td className="px-[12px] py-[8px] text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  title="Play / View Video"
                                  onClick={(e) => { e.stopPropagation(); setPreviewVideoItem(item); }}
                                  className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-emerald-500/10 text-emerald-600 border border-emerald-400/30 transition hover:bg-emerald-500/20 active:scale-95 cursor-pointer"
                                >
                                  <Play className="h-[12px] w-[12px] fill-emerald-600 text-emerald-600 ml-0.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Edit Video"
                                  onClick={(e) => { e.stopPropagation(); handleOpenEditModal(item); }}
                                  className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 border border-blue-400/30 transition hover:bg-blue-500/20 active:scale-95 cursor-pointer"
                                >
                                  <Pencil className="h-[12px] w-[12px] text-blue-600" />
                                </button>
                                <button
                                  type="button"
                                  title="Delete Video"
                                  onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                  className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-red-500/10 text-red-600 border border-red-400/30 transition hover:bg-red-500/20 active:scale-95 cursor-pointer"
                                >
                                  <Trash2 className="h-[12px] w-[12px] text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2563eb]">
                    Total Videos: <strong className="font-bold text-[#1d4ed8]">{filteredRows.length}</strong>
                  </span>
                  <span className="text-[7.5px] text-[#8a92a0]">
                    (Showing {filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length})
                  </span>
                </div>
                <div className="flex items-center gap-[4px]">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#475569] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                  </button>
                  <span className="px-1 font-bold text-[#19274a]">{currentPage} / {totalPages}</span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#475569] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="ml-2 h-[22px] rounded-[4px] border border-[#d8dce2] bg-white px-[6px] text-[8px] font-semibold text-[#334155] outline-none cursor-pointer"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-[12px]">
            <section className="bg-white px-[14px] py-[13px]" style={{ borderRadius: "0px", boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset" }}>
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-bold text-[#19274a]">Video Details</h2>
                <Video className="h-[14px] w-[14px] text-[#59657a]" />
              </div>

              {selected ? (
                <div className="mt-[12px] space-y-3">
                  <div onClick={() => setPreviewVideoItem(selected)} className="group relative aspect-video rounded-[10px] overflow-hidden bg-slate-900 border border-slate-200 shadow cursor-pointer">
                    {selected.videoType === "instagram" && selected.thumbnail.startsWith("data:image/svg+xml") ? (
                      <iframe
                        src={getInstagramEmbedUrl(selected.videoUrl)}
                        loading="lazy"
                        scrolling="no"
                        title={selected.title}
                        className="absolute top-1/2 left-1/2 pointer-events-none"
                        style={{ width: 400, height: 700, border: "none", transform: "translate(-50%, -50%) scale(0.72)" }}
                      />
                    ) : (
                      <img src={selected.thumbnail} alt={selected.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-[#1b5e20] text-[#1b5e20] ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[8px] text-white font-bold bg-black/50 backdrop-blur-xs px-2 py-1 rounded">
                      <span className="truncate max-w-[170px]">{selected.videoType.toUpperCase()}</span>
                      <span className="flex items-center gap-0.5">Click to Play</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11.5px] font-bold text-[#19274a] leading-snug">{selected.title}</h3>
                  </div>

                  <div className="rounded-[6px] border border-slate-200 bg-slate-50 p-2 text-[8px]">
                    <div className="flex items-center justify-between text-slate-500 font-bold mb-1">
                      <span>Video Target:</span>
                      <a href={selected.videoUrl} target="_blank" rel="noreferrer" className="text-[#006199] flex items-center gap-0.5 hover:underline">
                        Open Link <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                    <p className="truncate text-slate-700 font-mono text-[7.5px]">{selected.videoUrl}</p>
                  </div>

                  <div className="space-y-1 text-[8.5px] text-[#69758c] pt-2 border-t border-slate-100">
                    <p className="flex justify-between"><span className="font-semibold">Order:</span><span className="font-bold text-slate-800">#{selected.order}</span></p>
                    <p className="flex justify-between"><span className="font-semibold">Added on:</span><span className="font-bold text-slate-800">{selected.date}{selected.time ? `, ${selected.time}` : ""}</span></p>
                    <p className="flex justify-between"><span className="font-semibold">Added by:</span><span className="font-bold text-[#4B1426]">{selected.uploadedBy}</span></p>
                    <p className="flex justify-between"><span className="font-semibold">Status:</span><span className="font-bold text-emerald-700">{selected.status}</span></p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setPreviewVideoItem(selected)} className="flex-1 inline-flex items-center justify-center gap-1 rounded-[4px] border border-emerald-300 bg-emerald-50 py-1.5 text-[8.5px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer">
                      <Play className="h-3 w-3 fill-emerald-800" />
                      Play
                    </button>
                    <button type="button" onClick={() => handleOpenEditModal(selected)} className="flex-1 inline-flex items-center justify-center gap-1 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] hover:bg-slate-50 cursor-pointer">
                      <Pencil className="h-3 w-3 text-blue-600" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(selected, selected.status === "Published" ? "Draft" : "Published")}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] hover:bg-slate-50 cursor-pointer"
                    >
                      {selected.status === "Published" ? "Unpublish" : "Publish"}
                    </button>
                    <button type="button" onClick={() => handleDelete(selected)} className="inline-flex items-center justify-center rounded-[4px] border border-rose-200 bg-rose-50 px-2 py-1.5 text-rose-700 hover:bg-rose-100 cursor-pointer">
                      <Trash2 className="h-3 w-3 text-rose-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-[12px] flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <Video className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-[11px] font-bold text-slate-700">No Video Selected</p>
                  <p className="text-[8.5px] text-slate-500 mt-1 max-w-[200px]">Select a video from the table or upload a new video to view details.</p>
                </div>
              )}
            </section>
          </aside>
        </section>

        {/* ADD / EDIT MODAL */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
          title={isEditModalOpen ? "Edit Video Highlight" : "Upload New Video Highlight"}
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95 cursor-pointer"
                style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVideo}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: "#16a34a", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px" }}
              >
                {isEditModalOpen ? "Save Changes" : "Create Video"}
              </button>
            </>
          }
        >
          <div className="space-y-4 font-inter text-slate-800">
            <div>
              <label className="block text-[9.5px] font-bold text-[#334155] uppercase tracking-wider mb-1.5">Video Platform / Source*</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setFormVideoType("youtube"); const ytThumb = getYouTubeThumbnail(formVideoUrl); if (ytThumb) setFormThumbnail(ytThumb); }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] border text-[9.5px] font-bold transition cursor-pointer ${
                    formVideoType === "youtube" ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20 shadow-xs" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <YoutubeIcon className="h-4 w-4 text-red-600" />
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormVideoType("instagram");
                    if (!formThumbnail || formThumbnail.includes("img.youtube.com")) {
                      setFormThumbnail(generateInstagramCover(formTitle, extractInstagramId(formVideoUrl)));
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] border text-[9.5px] font-bold transition cursor-pointer ${
                    formVideoType === "instagram" ? "border-pink-500 bg-pink-50 text-pink-700 ring-2 ring-pink-500/20 shadow-xs" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <InstagramIcon className="h-4 w-4 text-pink-600" />
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setFormVideoType("upload")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] border text-[9.5px] font-bold transition cursor-pointer ${
                    formVideoType === "upload" ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20 shadow-xs" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <UploadCloud className="h-4 w-4 text-blue-600" />
                  Upload Video
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[9.5px] font-bold text-[#334155] uppercase tracking-wider mb-1">
                {formVideoType === "youtube" ? "YouTube Video URL*" : formVideoType === "instagram" ? "Instagram Reel / Post URL*" : "Video File or Direct URL*"}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formVideoUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormVideoUrl(val);
                    if (formVideoType === "youtube") {
                      const ytThumb = getYouTubeThumbnail(val);
                      if (ytThumb) setFormThumbnail(ytThumb);
                    } else if (formVideoType === "instagram" && (!formThumbnail || formThumbnail.startsWith("data:image/svg+xml"))) {
                      setFormThumbnail(generateInstagramCover(formTitle, extractInstagramId(val)));
                    }
                  }}
                  placeholder={
                    formVideoType === "youtube"
                      ? "https://www.youtube.com/shorts/... or watch?v=... or youtu.be/..."
                      : formVideoType === "instagram"
                      ? "https://www.instagram.com/reel/... or /p/..."
                      : "Upload video file below or paste direct mp4 link..."
                  }
                  className="h-[32px] flex-1 rounded-[6px] border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#4B1426]"
                />
                {formVideoType === "upload" && (
                  <>
                    <input ref={videoFileInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFileUpload} />
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="h-[32px] px-3 rounded-[6px] bg-[#006199] text-white text-[9px] font-bold flex items-center gap-1 hover:bg-[#004e7a] transition cursor-pointer shrink-0"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      Browse File
                    </button>
                  </>
                )}
              </div>
              <p className="text-[8px] text-slate-400 mt-0.5">
                {formVideoType === "youtube"
                  ? "Auto-detects YouTube Shorts, Watch, Live, Embed URLs and automatically pulls HD thumbnail."
                  : formVideoType === "instagram"
                  ? "Direct link to the reel or post on Instagram."
                  : "Supports MP4, WebM, MOV formats up to 50MB."}
              </p>
            </div>

            <div>
              <label className="block text-[9.5px] font-bold text-[#334155] uppercase tracking-wider mb-1">Video Title*</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormTitle(val);
                  if (formVideoType === "instagram" && (!formThumbnail || formThumbnail.startsWith("data:image/svg+xml"))) {
                    setFormThumbnail(generateInstagramCover(val, extractInstagramId(formVideoUrl)));
                  }
                }}
                placeholder="e.g. Inauguration Highlights"
                className="h-[32px] w-full rounded-[6px] border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#4B1426]"
              />
            </div>

            <div>
              <label className="block text-[9.5px] font-bold text-[#334155] uppercase tracking-wider mb-1">Order</label>
              <input
                type="number"
                min={1}
                value={formOrder}
                onChange={(e) => { setFormOrder(Math.max(1, Number(e.target.value) || 1)); setFormOrderTouched(true); }}
                className="h-[32px] w-full rounded-[6px] border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-800 outline-none focus:border-[#4B1426]"
              />
              <p className="text-[7.5px] text-slate-400 mt-0.5">Auto-fills to the top. Change only to reorder manually.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[9.5px] font-bold text-[#334155] uppercase tracking-wider">Video Thumbnail Cover</label>
                <span className="text-[8px] text-slate-500">{formVideoType === "youtube" ? "(Auto-generated from YouTube)" : "(Upload photo or auto-cover)"}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  placeholder="Paste thumbnail image URL or click upload..."
                  className="h-[32px] flex-1 rounded-[6px] border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-[#4B1426]"
                />
                <input ref={thumbnailFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                <button
                  type="button"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className="h-[32px] px-3 rounded-[6px] border border-slate-300 bg-slate-100 text-slate-700 text-[9px] font-bold flex items-center gap-1 hover:bg-slate-200 transition cursor-pointer shrink-0"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Upload Image
                </button>
              </div>

              {(() => {
                const activeThumb =
                  formThumbnail ||
                  (formVideoType === "youtube" && extractYouTubeId(formVideoUrl)
                    ? getYouTubeThumbnail(formVideoUrl)
                    : formVideoType === "instagram"
                    ? generateInstagramCover(formTitle, extractInstagramId(formVideoUrl))
                    : "");

                return (
                  <div className="mt-2.5 rounded-[8px] border border-slate-200 bg-slate-50/80 p-2.5 flex items-center gap-3">
                    <div className="relative aspect-video w-[120px] rounded-[6px] overflow-hidden bg-slate-900 border border-slate-300 shrink-0 shadow-xs">
                      {activeThumb ? (
                        <img src={activeThumb} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[8px] text-center p-1">
                          <Video className="h-4 w-4 mb-0.5 opacity-50" />
                          <span>No Preview</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow">
                          <Play className="w-2.5 h-2.5 fill-[#1b5e20] text-[#1b5e20] ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-700">Preview:</span>
                        {activeThumb && activeThumb.includes("img.youtube.com") ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[7.5px] font-bold">
                            <YoutubeIcon className="h-2.5 w-2.5" /> YouTube HD Auto
                          </span>
                        ) : activeThumb && activeThumb.startsWith("data:image/svg+xml") ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[7.5px] font-bold">
                            <InstagramIcon className="h-2.5 w-2.5" /> Instagram Cover
                          </span>
                        ) : activeThumb ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[7.5px] font-bold">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Custom Image Uploaded
                          </span>
                        ) : (
                          <span className="text-[8px] text-slate-500 font-medium">Pending URL or upload</span>
                        )}
                      </div>
                      <p className="text-[8px] text-slate-500 leading-tight">
                        {formVideoType === "youtube"
                          ? "Auto-extracted from YouTube. You can also override with a custom image above."
                          : formVideoType === "instagram"
                          ? "Instagram cover is generated automatically, or upload a screenshot / custom cover photo."
                          : "Custom image for the directly uploaded video file."}
                      </p>
                      {formThumbnail && (
                        <button
                          type="button"
                          onClick={() => {
                            if (formVideoType === "youtube") setFormThumbnail(getYouTubeThumbnail(formVideoUrl) || "");
                            else if (formVideoType === "instagram") setFormThumbnail(generateInstagramCover(formTitle, extractInstagramId(formVideoUrl)));
                            else setFormThumbnail("");
                          }}
                          className="text-[8px] font-bold text-red-600 hover:underline cursor-pointer inline-flex items-center gap-1 pt-0.5"
                        >
                          <RotateCcw className="h-2.5 w-2.5" />
                          Reset to Auto Thumbnail
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#334155] mb-1">Status<span className="text-red-500 ml-0.5">*</span></label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as VideoStatus)}
                className={`h-[38px] w-full cursor-pointer appearance-none rounded-[4px] px-[12px] pr-[28px] text-[11px] font-bold outline-none bg-no-repeat bg-[right_10px_center] shadow-xs transition ${
                  formStatus === "Published" ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]" : "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="Published">Published (Visible on Website)</option>
                <option value="Draft">Draft (Hidden from Website)</option>
              </select>
            </div>
          </div>
        </Modal>

        {/* LIGHTBOX PREVIEW */}
        {previewVideoItem && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 font-inter" onClick={() => setPreviewVideoItem(null)}>
            <div
              className={`relative w-full rounded-[14px] bg-black shadow-2xl overflow-hidden border border-slate-800 ${
                previewVideoItem.videoType === "instagram" ? "max-w-[400px]" : "max-w-[740px]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-[8px] font-black uppercase">{previewVideoItem.videoType}</span>
                  <p className="text-[11px] font-bold truncate text-slate-200">{previewVideoItem.title}</p>
                </div>
                <button type="button" onClick={() => setPreviewVideoItem(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div
                className={`relative w-full bg-black flex items-center justify-center ${
                  previewVideoItem.videoType === "instagram" ? "h-[70vh] max-h-[600px]" : "aspect-video"
                }`}
              >
                {previewVideoItem.videoType === "youtube" && extractYouTubeId(previewVideoItem.videoUrl) ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(previewVideoItem.videoUrl)}?autoplay=1&rel=0`}
                    title={previewVideoItem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : previewVideoItem.videoType === "instagram" ? (
                  <iframe
                    src={getInstagramEmbedUrl(previewVideoItem.videoUrl)}
                    title={previewVideoItem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : previewVideoItem.videoType === "upload" && previewVideoItem.videoUrl ? (
                  <video src={previewVideoItem.videoUrl} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  <div className="p-8 text-center text-slate-300">
                    <Play className="h-10 w-10 mx-auto mb-2 text-[#4f8519]" />
                    <p className="text-[12px] font-bold">{previewVideoItem.title}</p>
                    <a
                      href={previewVideoItem.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 mt-4 px-4 py-1.5 rounded-full bg-[#4B1426] text-white text-[9.5px] font-bold hover:bg-[#3a0f1d]"
                    >
                      Open in External Tab <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 flex items-center justify-end text-[9px] text-slate-400">
                <a href={previewVideoItem.videoUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1">
                  {previewVideoItem.videoUrl} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
