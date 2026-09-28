"use client";
import { getImageSizeError, showUploadError } from "@/lib/uploadLimit";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import CropImageModal from "@/components/gallery/CropImageModal";
import SkeletonBentoView from "@/components/gallery/SkeletonBentoView";
import GalleryPagination from "@/components/gallery/GalleryPagination";
import { Input, Label } from "@/components/ui/Input";
import typography from "../pages/PagesTypography.module.css";
import { useAppSelector } from "@/store/hooks";
import { getBackendUrl } from "@/lib/api";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crop,
  Download,
  ExternalLink,
  Eye,
  FileImage,
  FileText,
  Filter,
  FolderClosed,
  Globe,
  Grid,
  HardDrive,
  Image as ImageIcon,
  Layers,
  LayoutTemplate,
  List,
  MoreVertical,
  Music2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

// SweetAlert2 theme matching admin portal dark style with zero shadow
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
  iconColor: "#4ade80",
  customClass: {
    popup: "swal-toast-popup",
    title: "swal-toast-title",
  },
  didOpen: (toast) => {
    toast.style.boxShadow = "none";
    (toast.style as any).webkitBoxShadow = "none";
    toast.style.filter = "none";
  },
});

function showSuccess(message: string) {
  Toast.fire({ icon: "success", title: message });
}

function showError(message: string) {
  Toast.fire({ icon: "error", title: message, iconColor: "#f87171" });
}

function showInfo(message: string) {
  Toast.fire({ icon: "info", title: message, iconColor: "#60a5fa" });
}

export type MediaStatus = "Published" | "Draft";

export interface MediaItem {
  id: number;
  _id?: string;
  order?: number;
  title: string;
  imageAlt?: string;
  year: string;
  category: string;
  size?: string;
  uploadedBy: string;
  date: string;
  time: string;
  status: MediaStatus;
  image: string;
}

// Initial default categories from the live website gallery
const INITIAL_CATEGORIES: string[] = [
  "Inauguration",
  "Scientific Sessions",
  "Panel Discussions",
  "Speakers",
  "Workshops",
  "Exhibition (Expo)",
  "Cultural Programs",
  "Awards",
  "Networking",
];

// Initial default years from the live website gallery
const INITIAL_YEARS: string[] = [
  "2026",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
];

const INITIAL_MEDIA: MediaItem[] = [];

// Resolves to the correct production API host at runtime (based on the domain the page
// is actually loaded from) rather than trusting a build-time env var that may have been
// baked in from a local .env file — see lib/api.ts's getBackendUrl for the full rationale.
const BACKEND_URL = getBackendUrl();

const formatTimestamp = () => {
  const d = new Date();
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date: dateStr, time: timeStr, full: `${dateStr}, ${timeStr}` };
};

// Animated Numeric Counter for KPI Cards
function AnimatedCounter({ value, duration = 1200 }: { value: string | number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState<string>("0");
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const strVal = String(value);
    const numericMatch = strVal.match(/^([^0-9]*)([0-9.,]+)([^0-9]*)$/);

    if (!numericMatch) {
      setDisplayValue(strVal);
      return;
    }

    const prefix = numericMatch[1];
    const rawNumberStr = numericMatch[2].replace(/,/g, "");
    const targetNum = parseFloat(rawNumberStr);
    const suffix = numericMatch[3];

    if (isNaN(targetNum)) {
      setDisplayValue(strVal);
      return;
    }

    if (targetNum === 0) {
      setDisplayValue(`${prefix}0${suffix}`);
      return;
    }

    const hasComma = numericMatch[2].includes(",");
    const decimalPlaces = (rawNumberStr.split(".")[1] || "").length;

    let animationFrameId: number | null = null;

    const startCounting = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentNum = targetNum * easeProgress;
        let formattedNum = currentNum.toFixed(decimalPlaces);

        if (hasComma) {
          const parts = formattedNum.split(".");
          parts[0] = parseInt(parts[0], 10).toLocaleString();
          formattedNum = parts.join(".");
        }

        setDisplayValue(`${prefix}${formattedNum}${suffix}`);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver !== "undefined") {
      const el = spanRef.current;
      if (!el) {
        startCounting();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounting();
            } else {
              setDisplayValue(`${prefix}0${suffix}`);
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(el);

      return () => {
        observer.disconnect();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    } else {
      startCounting();
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, [value, duration]);

  return <span ref={spanRef}>{displayValue}</span>;
}

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
} as const;

export default function MediaLibraryPage() {
  const router = useRouter();
  const currentAdmin = useAppSelector((state) => state.auth.admin);

  const getAdminName = (): string => {
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
      try {
        const rawUser = localStorage.getItem("admin_user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          if (parsed?.name && typeof parsed.name === "string" && parsed.name.trim().length > 0) {
            return parsed.name.trim();
          }
        }
      } catch {}
    }
    return "Vansh Chaudhary";
  };

  const loggedInAdminName = useMemo(() => getAdminName(), [currentAdmin]);

  // Categories and Years state (with localStorage persistence)
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [years, setYears] = useState<string[]>(INITIAL_YEARS);

  // New item input state for Category & Year Modal
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [newYearInput, setNewYearInput] = useState("");
  const [isCategoryYearModalOpen, setIsCategoryYearModalOpen] = useState(false);

  // Media items state (starts clean with 0 static items)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // 12 matches the public Gallery / Glimpses page's own PAGE_SIZE and bento
  // layout cycle (frontend/app/components/gallery/GalleryGrid.tsx), so a full
  // admin page always maps 1:1 onto one live bento layout.
  const [pageSize, setPageSize] = useState<number>(12);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "skeleton">("table");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Activities");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  // Form states for upload / edit (Static fields as requested: Title, Year, Category, Status, Image)
  const [formTitle, setFormTitle] = useState("");
  const [formImageAlt, setFormImageAlt] = useState("");
  const [formOrder, setFormOrder] = useState(1);
  // Only true once the admin actually edits the Order box — until then we don't send an
  // order at all, so the backend places the new upload at the top on its own.
  const [formOrderTouched, setFormOrderTouched] = useState(false);
  const [formYear, setFormYear] = useState("2026");
  const [formCategory, setFormCategory] = useState("Inauguration");
  const [formStatus, setFormStatus] = useState<MediaStatus>("Published");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formFileSize, setFormFileSize] = useState("250 KB");

  // Crop modal state — reused both for the file picked in the Upload/Edit modal
  // ("form" context) and for cropping an already-published asset from the right
  // sidebar ("existing" context, which re-uploads + saves immediately).
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropContext, setCropContext] = useState<"form" | "existing" | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Load from localStorage and backend MongoDB on mount
  useEffect(() => {
    try {
      const savedCats = localStorage.getItem("bharat_gallery_categories");
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      }
      const savedYears = localStorage.getItem("bharat_gallery_years");
      if (savedYears) {
        const parsed = JSON.parse(savedYears);
        if (Array.isArray(parsed) && parsed.length > 0) setYears(parsed);
      }
      const savedMedia = localStorage.getItem("bharat_media_library_items");
      if (savedMedia) {
        const parsed = JSON.parse(savedMedia);
        const clean = Array.isArray(parsed)
          ? parsed.filter((item: any) => !item.image?.includes("images.unsplash.com"))
          : [];
        setMediaItems(clean);
        if (clean.length > 0) setSelectedId(clean[0].id);
        else setSelectedId(null);
      }
    } catch {}

    const fetchBackendData = async () => {
      try {
        const [metaRes, itemsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/website/gallery/meta`).catch(() => null),
          fetch(`${BACKEND_URL}/api/website/gallery/items`).catch(() => null),
        ]);

        if (metaRes && metaRes.ok) {
          const metaJson = await metaRes.json();
          if (metaJson.data) {
            if (Array.isArray(metaJson.data.categories) && metaJson.data.categories.length > 0) {
              setCategories(metaJson.data.categories);
              saveCatsToLocal(metaJson.data.categories);
            }
            if (Array.isArray(metaJson.data.years) && metaJson.data.years.length > 0) {
              setYears(metaJson.data.years);
              saveYearsToLocal(metaJson.data.years);
            }
          }
        }

        if (itemsRes && itemsRes.ok) {
          const itemsJson = await itemsRes.json();
          if (Array.isArray(itemsJson.data)) {
            const clean = itemsJson.data.filter((item: any) => !item.image?.includes("images.unsplash.com"));
            const mapped: MediaItem[] = clean.map((item: any, idx: number) => ({
              // Must be unique per row: selection, delete and React keys all rely on it, and `order` repeats.
              id: idx + 1,
              _id: item._id,
              order: typeof item.order === "number" ? item.order : idx + 1,
              title: item.title,
              imageAlt: item.imageAlt || "",
              year: item.year,
              category: item.category,
              size: item.size || "",
              uploadedBy: item.uploadedBy || "Vansh Chaudhary",
              date: item.date || "12 Sept 2026",
              time: item.time || "10:30 AM",
              status: item.status || "Published",
              image: item.image,
            }));
            setMediaItems(mapped);
            saveMediaToLocal(mapped);
            if (mapped.length > 0) {
              setSelectedId(mapped[0].id);
            } else {
              setSelectedId(null);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching gallery backend data:", err);
      }
    };

    fetchBackendData();
  }, []);

  const saveMediaToLocal = (items: MediaItem[]) => {
    try {
      localStorage.setItem("bharat_media_library_items", JSON.stringify(items));
    } catch {}
  };

  const saveCatsToLocal = (cats: string[]) => {
    try {
      localStorage.setItem("bharat_gallery_categories", JSON.stringify(cats));
    } catch {}
  };

  const saveYearsToLocal = (yrs: string[]) => {
    try {
      localStorage.setItem("bharat_gallery_years", JSON.stringify(yrs));
    } catch {}
  };

  // Add Category handler
  const handleAddCategory = () => {
    const val = newCategoryInput.trim();
    if (!val) return;
    if (categories.includes(val)) {
      showInfo("This category already exists!");
      return;
    }
    const updated = [...categories, val];
    setCategories(updated);
    saveCatsToLocal(updated);
    fetch(`${BACKEND_URL}/api/website/gallery/meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: updated }),
    }).catch(() => null);
    setNewCategoryInput("");
    showSuccess(`Category "${val}" added!`);
  };

  // Remove Category handler
  const handleRemoveCategory = (cat: string) => {
    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    saveCatsToLocal(updated);
    fetch(`${BACKEND_URL}/api/website/gallery/meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories: updated }),
    }).catch(() => null);
    showSuccess(`Category "${cat}" removed.`);
  };

  // Add Year handler
  const handleAddYear = () => {
    const val = newYearInput.trim();
    if (!val) return;
    if (years.includes(val)) {
      showInfo("This year already exists!");
      return;
    }
    const updated = [val, ...years];
    setYears(updated);
    saveYearsToLocal(updated);
    fetch(`${BACKEND_URL}/api/website/gallery/meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ years: updated }),
    }).catch(() => null);
    setNewYearInput("");
    showSuccess(`Year "${val}" added!`);
  };

  // Remove Year handler
  const handleRemoveYear = (yr: string) => {
    const updated = years.filter((y) => y !== yr);
    setYears(updated);
    saveYearsToLocal(updated);
    fetch(`${BACKEND_URL}/api/website/gallery/meta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ years: updated }),
    }).catch(() => null);
    showSuccess(`Year "${yr}" removed.`);
  };

  // Upload helper directly to Cloudinary CDN (or backend local upload)
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const sizeError = await getImageSizeError(file);
    if (sizeError) throw new Error(sizeError);
    try {
      setIsUploading(true);
      const targetFolder = `bharat-organic/gallery/${formYear || "2026"}/${(formCategory || "general").toLowerCase().replace(/\s+/g, "-")}`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", targetFolder);

      // Primary: Use relative endpoint /api/uploads (proxied by Next.js to backend port 4001)
      let res = await fetch(`/api/uploads?folder=${encodeURIComponent(targetFolder)}`, {
        method: "POST",
        body: formData,
      }).catch(() => null);
      let reachedServer = Boolean(res);

      // Secondary fallback: Direct to BACKEND_URL (only worth retrying if the first attempt
      // never reached a server at all — a real rejection from the server, like the image
      // being over the configured size limit, would fail identically here too).
      if (!res) {
        res = await fetch(`${BACKEND_URL}/api/uploads?folder=${encodeURIComponent(targetFolder)}`, {
          method: "POST",
          body: formData,
        }).catch(() => null);
        reachedServer = Boolean(res);
      }

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        const finalUrl = json?.data?.url || json?.url || json?.data?.secure_url || json?.secure_url;
        if (finalUrl) {
          return finalUrl;
        }
      }

      // The server responded but rejected the upload (e.g. over the configured max image
      // size) — surface the real reason instead of silently degrading to a base64 embed.
      if (reachedServer && res) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.message || `Upload failed (status ${res.status}).`);
      }
    } finally {
      setIsUploading(false);
    }

    // The server was genuinely unreachable (not a rejection) — fall back to embedding the
    // file directly so the admin doesn't lose their work over a transient network blip.
    console.warn("Could not reach the upload server; embedding image as a data URL instead.");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // Stat calculations
  const totalFiles = mediaItems.length;
  const publishedCount = useMemo(() => mediaItems.filter((x) => x.status === "Published").length, [mediaItems]);
  const draftCount = useMemo(() => mediaItems.filter((x) => x.status === "Draft").length, [mediaItems]);
  const currentYearCount = useMemo(() => mediaItems.filter((x) => x.year === "2025" || x.year === "2026").length, [mediaItems]);

  const statCards = useMemo(
    () => [
      {
        title: "TOTAL PHOTOS",
        value: totalFiles,
        suffix: "",
        icon: ImageIcon,
        tone: "emerald" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View all photos",
        onClick: () => {
          setSelectedCategory("All Activities");
          setSelectedYear("All Years");
        },
      },
      {
        title: "PUBLISHED ASSETS",
        value: publishedCount,
        suffix: "",
        icon: Check,
        tone: "violet" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        footer: "View published",
        onClick: () => setStatusFilter("Published"),
      },
      {
        title: "ACTIVE CATEGORIES",
        value: categories.length,
        suffix: "",
        icon: Tag,
        tone: "amber" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        footer: "Manage categories",
        onClick: () => setIsCategoryYearModalOpen(true),
      },
      {
        title: "EVENT YEARS",
        value: years.length,
        suffix: "",
        icon: Calendar,
        tone: "blue" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        footer: "Manage years",
        onClick: () => setIsCategoryYearModalOpen(true),
      },
      {
        title: "DRAFT ASSETS",
        value: draftCount,
        suffix: "",
        icon: Sparkles,
        tone: "rose" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
        borderColor: "#fecdd3",
        numColor: "#be123c",
        footer: "Review drafts",
        onClick: () => setStatusFilter("Draft"),
      },
      {
        title: "WEBSITE STATUS",
        value: "Active",
        suffix: "",
        icon: Globe,
        tone: "teal" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
        borderColor: "#99f6e4",
        numColor: "#0f766e",
        footer: "Live on website",
        onClick: () => window.open("http://localhost:3002/gallery", "_blank"),
      },
    ],
    [totalFiles, publishedCount, draftCount, categories.length, years.length]
  );

  // Filtered rows
  const filteredRows = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.year.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === "All Activities" || item.category === selectedCategory;
      const matchesYr = selectedYear === "All Years" || item.year === selectedYear;
      const matchesStatus = statusFilter === "All Status" || item.status === statusFilter;

      return matchesSearch && matchesCat && matchesYr && matchesStatus;
    });
  }, [mediaItems, searchQuery, selectedCategory, selectedYear, statusFilter]);

  // Paginated rows
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Selected item for right details panel
  const selected = useMemo(() => {
    return mediaItems.find((item) => item.id === selectedId) || mediaItems[0] || null;
  }, [mediaItems, selectedId]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Activities");
    setSelectedYear("All Years");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRows.map((x) => x.id));
    }
  };

  const handleToggleRowSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredRows.map((x) => x.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const [bulkDeleting, setBulkDeleting] = useState(false);

  /** Deletes the given items from the backend and local state. No confirmation — callers must confirm first. */
  const deleteItemsBulk = async (targets: MediaItem[]) => {
    setBulkDeleting(true);
    // One request per chunk of ids — per-item DELETE calls hit the backend's 100 req/min rate limit.
    const CHUNK_SIZE = 500;
    const deletedIds = new Set<number>();
    let failed = 0;

    targets.filter((item) => !item._id).forEach((item) => deletedIds.add(item.id));
    const serverTargets = targets.filter((item) => item._id);

    for (let i = 0; i < serverTargets.length; i += CHUNK_SIZE) {
      const chunk = serverTargets.slice(i, i + CHUNK_SIZE);
      const res = await fetch(`${BACKEND_URL}/api/website/gallery/items/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: chunk.map((item) => item._id) }),
      }).catch(() => null);

      if (res && res.ok) {
        chunk.forEach((item) => deletedIds.add(item.id));
      } else {
        failed += chunk.length;
      }
    }
    const succeeded = deletedIds.size;

    const updated = mediaItems.filter((x) => !deletedIds.has(x.id));
    setMediaItems(updated);
    saveMediaToLocal(updated);
    setSelectedIds([]);
    if (selectedId !== null && deletedIds.has(selectedId)) {
      setSelectedId(updated[0]?.id ?? null);
    }
    setBulkDeleting(false);

    if (failed === 0) {
      showSuccess(`${succeeded} photo${succeeded === 1 ? "" : "s"} deleted from Media Library.`);
    } else {
      Swal.fire({
        title: "Some deletes failed",
        text: `${succeeded} deleted successfully, ${failed} failed. Try again for the remaining items.`,
        icon: "warning",
        confirmButtonColor: "#218DAE",
        background: "#1e2433",
        color: "#f8fafc",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const targets = mediaItems.filter((x) => selectedIds.includes(x.id));

    const confirm = await Swal.fire({
      title: `Delete ${targets.length} photo${targets.length === 1 ? "" : "s"}?`,
      text: "These photo assets will be permanently removed from the Media Library and from the live website.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, Delete ${targets.length}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      background: "#1e2433",
      color: "#f8fafc",
      customClass: {
        popup: "swal-toast-popup",
      },
    });
    if (!confirm.isConfirmed) return;
    await deleteItemsBulk(targets);
  };

  /** Deletes every photo currently matching the search box / dropdown filters, in one click — no need to tick checkboxes first. */
  const handleBulkDeleteFiltered = async () => {
    const targets = filteredRows;
    const noFilterActive =
      searchQuery.trim() === "" &&
      selectedCategory === "All Activities" &&
      selectedYear === "All Years" &&
      statusFilter === "All Status";

    if (targets.length === 0) {
      Swal.fire({
        title: "Nothing to delete",
        text: "No photos match the current search/filter.",
        icon: "info",
        confirmButtonColor: "#218DAE",
        background: "#1e2433",
        color: "#f8fafc",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: `Delete ${targets.length} photo${targets.length === 1 ? "" : "s"}?`,
      html: noFilterActive
        ? `<p style="color:#fca5a5;font-weight:700;">No search/filter is active — this will delete <u>ALL ${targets.length}</u> photos in the Media Library.</p>`
        : `<p>These ${targets.length} photos match your current search/filter and will be permanently removed from the Media Library and the live website.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, Delete ${targets.length}`,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      background: "#1e2433",
      color: "#f8fafc",
      customClass: {
        popup: "swal-toast-popup",
      },
    });
    if (!confirm.isConfirmed) return;
    await deleteItemsBulk(targets);
  };

  // Status Change
  const handleStatusChange = async (id: number, newStatus: MediaStatus) => {
    const target = mediaItems.find((x) => x.id === id);
    if (target?._id) {
      await fetch(`${BACKEND_URL}/api/website/gallery/items/${target._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => null);
    }

    const updated = mediaItems.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setMediaItems(updated);
    saveMediaToLocal(updated);
    showSuccess(`Status updated to "${newStatus}" for ${target?.title || "Photo"}`);
  };

  // Delete media item
  const handleDelete = async (item: MediaItem) => {
    const confirm = await Swal.fire({
      title: `Delete "${item.title}"?`,
      text: "This photo asset will be removed from the Media Library.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      background: "#1e2433",
      color: "#f8fafc",
      customClass: {
        popup: "swal-toast-popup",
      },
    });

    if (confirm.isConfirmed) {
      if (item._id) {
        await fetch(`${BACKEND_URL}/api/website/gallery/items/${item._id}`, {
          method: "DELETE",
        }).catch(() => null);
      }
      const updated = mediaItems.filter((x) => x.id !== item.id);
      setMediaItems(updated);
      saveMediaToLocal(updated);
      if (selectedId === item.id && updated.length > 0) {
        setSelectedId(updated[0].id);
      }
      showSuccess(`"${item.title}" removed from Media Library.`);
    }
  };

  // Open Upload Modal
  const handleOpenUploadModal = () => {
    setFormTitle("");
    setFormImageAlt("");
    // Preview only — order is a simple counter (1, 2, 3...); new uploads get the next number
    // after the current highest, matching what the backend will assign if left untouched.
    setFormOrder(mediaItems.length > 0 ? Math.max(...mediaItems.map((x) => x.order ?? 1)) + 1 : 1);
    setFormOrderTouched(false);
    setFormYear(years[0] || "2026");
    setFormCategory(categories[0] || "Inauguration");
    setFormStatus("Published");
    setFormImageUrl("");
    setFormFileSize("250 KB");
    setIsUploadModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormImageAlt(item.imageAlt || "");
    setFormOrder(item.order ?? 1);
    setFormOrderTouched(true);
    setFormYear(item.year);
    setFormCategory(item.category);
    setFormStatus(item.status);
    setFormImageUrl(item.image);
    setFormFileSize(item.size || "250 KB");
    setIsEditModalOpen(true);
  };

  // Handle Create Media Submission (Synced with MongoDB Backend)
  const handleCreateMedia = async () => {
    if (!formImageUrl) {
      showError("Please choose an image to upload first!");
      return;
    }

    const finalTitle = formTitle.trim() || formCategory || "Photo Asset";
    const ts = formatTimestamp();

    try {
      const payload: Record<string, unknown> = {
        title: finalTitle,
        imageAlt: formImageAlt.trim(),
        year: formYear,
        category: formCategory,
        image: formImageUrl,
        uploadedBy: loggedInAdminName,
        status: formStatus,
        date: ts.date,
        time: ts.time,
      };
      // Only send an explicit order when the admin actually edited the box — otherwise
      // leave it out so the backend auto-places the new upload at the top of the list.
      if (formOrderTouched) {
        payload.order = formOrder;
      }

      const res = await fetch(`${BACKEND_URL}/api/website/gallery/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let newItem: MediaItem;
      if (res.ok) {
        const json = await res.json();
        const serverItem = json.data;
        newItem = {
          id: mediaItems.length > 0 ? Math.max(...mediaItems.map((x) => x.id)) + 1 : 1,
          _id: serverItem._id,
          order: typeof serverItem.order === "number" ? serverItem.order : formOrder,
          title: serverItem.title || finalTitle,
          imageAlt: serverItem.imageAlt || formImageAlt.trim(),
          year: serverItem.year || formYear,
          category: serverItem.category || formCategory,
          size: formFileSize || "250 KB",
          uploadedBy: serverItem.uploadedBy || loggedInAdminName,
          date: serverItem.date || ts.date,
          time: serverItem.time || ts.time,
          status: serverItem.status || formStatus,
          image: serverItem.image || formImageUrl,
        };
      } else {
        newItem = {
          id: mediaItems.length > 0 ? Math.max(...mediaItems.map((x) => x.id)) + 1 : 1,
          order: formOrder,
          title: finalTitle,
          imageAlt: formImageAlt.trim(),
          year: formYear,
          category: formCategory,
          size: formFileSize || "250 KB",
          uploadedBy: loggedInAdminName,
          date: ts.date,
          time: ts.time,
          status: formStatus,
          image: formImageUrl,
        };
      }

      const updated = [newItem, ...mediaItems];
      setMediaItems(updated);
      saveMediaToLocal(updated);
      setSelectedId(newItem.id);
      setIsUploadModalOpen(false);
      showSuccess(`"${finalTitle}" uploaded successfully!`);
    } catch (err) {
      console.error("Failed to save media item:", err);
      const newItem: MediaItem = {
        id: mediaItems.length > 0 ? Math.max(...mediaItems.map((x) => x.id)) + 1 : 1,
        order: formOrder,
        title: finalTitle,
        imageAlt: formImageAlt.trim(),
        year: formYear,
        category: formCategory,
        size: formFileSize || "250 KB",
        uploadedBy: loggedInAdminName,
        date: ts.date,
        time: ts.time,
        status: formStatus,
        image: formImageUrl,
      };
      const updated = [newItem, ...mediaItems];
      setMediaItems(updated);
      saveMediaToLocal(updated);
      setSelectedId(newItem.id);
      setIsUploadModalOpen(false);
      showSuccess(`"${finalTitle}" uploaded successfully!`);
    }
  };

  // Handle Edit Media Submission
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const ts = formatTimestamp();
    const finalTitle = formTitle.trim() || formCategory || editingItem.title;

    if (editingItem._id) {
      await fetch(`${BACKEND_URL}/api/website/gallery/items/${editingItem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          imageAlt: formImageAlt.trim(),
          order: formOrder,
          year: formYear,
          category: formCategory,
          status: formStatus,
          image: formImageUrl || editingItem.image,
          uploadedBy: loggedInAdminName,
          date: ts.date,
          time: ts.time,
        }),
      }).catch(() => null);
    }

    const updated = mediaItems.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            title: finalTitle,
            imageAlt: formImageAlt.trim(),
            order: formOrder,
            year: formYear,
            category: formCategory,
            status: formStatus,
            image: formImageUrl || item.image,
            size: formFileSize || item.size,
            uploadedBy: loggedInAdminName,
            date: ts.date,
            time: ts.time,
          }
        : item
    );

    setMediaItems(updated);
    saveMediaToLocal(updated);
    setIsEditModalOpen(false);
    showSuccess(`"${finalTitle}" updated successfully!`);
  };

  // Quick Replace Image File
  const handleQuickReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selected) {
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      const ts = formatTimestamp();
      let newUrl: string;
      try {
        newUrl = await uploadToCloudinary(file);
      } catch (err) {
        showUploadError(err);
        e.target.value = "";
        return;
      }
      if (selected._id) {
        await fetch(`${BACKEND_URL}/api/website/gallery/items/${selected._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: newUrl,
            uploadedBy: loggedInAdminName,
            date: ts.date,
            time: ts.time,
          }),
        }).catch(() => null);
      }
      const updated = mediaItems.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              image: newUrl,
              size: sizeStr,
              uploadedBy: loggedInAdminName,
              date: ts.date,
              time: ts.time,
            }
          : item
      );
      setMediaItems(updated);
      saveMediaToLocal(updated);
      showSuccess("Photo asset replaced on Cloudinary CDN!");
    }
  };

  // Opens the crop modal for the image currently in the Upload/Edit form.
  const handleOpenCropForForm = () => {
    if (!formImageUrl) return;
    setCropContext("form");
    setCropImageSrc(formImageUrl);
    setIsCropModalOpen(true);
  };

  // Opens the crop modal for an already-published asset selected in the right sidebar.
  const handleOpenCropForExisting = () => {
    if (!selected) return;
    setCropContext("existing");
    setCropImageSrc(selected.image);
    setIsCropModalOpen(true);
  };

  const handleCloseCropModal = () => {
    setIsCropModalOpen(false);
    setCropContext(null);
    setCropImageSrc(null);
  };

  // Uploads the cropped result and, depending on context, either fills the open
  // form (new upload / edit-in-progress) or saves it straight to the already
  // published asset — mirroring handleQuickReplace's persistence logic.
  const handleCropApplied = async (file: File) => {
    let newUrl: string;
    try {
      newUrl = await uploadToCloudinary(file);
    } catch (err) {
      showUploadError(err);
      return;
    }

    if (cropContext === "form") {
      setFormImageUrl(newUrl);
      setFormFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      showSuccess("Photo cropped and uploaded!");
    } else if (cropContext === "existing" && selected) {
      const ts = formatTimestamp();
      if (selected._id) {
        await fetch(`${BACKEND_URL}/api/website/gallery/items/${selected._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: newUrl,
            uploadedBy: loggedInAdminName,
            date: ts.date,
            time: ts.time,
          }),
        }).catch(() => null);
      }
      const updated = mediaItems.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              image: newUrl,
              size: `${(file.size / 1024).toFixed(1)} KB`,
              uploadedBy: loggedInAdminName,
              date: ts.date,
              time: ts.time,
            }
          : item
      );
      setMediaItems(updated);
      saveMediaToLocal(updated);
      showSuccess("Cropped photo saved to Cloudinary CDN!");
    }

    handleCloseCropModal();
  };

  // Dragging a photo onto another in the Skeleton layout view swaps their
  // `order` values — the same field that determines each photo's position
  // (and therefore its bento slot) on the live Gallery / Glimpses page.
  const handleSwapOrder = async (itemA: MediaItem, itemB: MediaItem) => {
    const orderA = itemA.order ?? 0;
    const orderB = itemB.order ?? 0;

    const updated = mediaItems
      .map((item) => {
        if (item.id === itemA.id) return { ...item, order: orderB };
        if (item.id === itemB.id) return { ...item, order: orderA };
        return item;
      })
      .sort((a, b) => (b.order ?? 0) - (a.order ?? 0));

    setMediaItems(updated);
    saveMediaToLocal(updated);

    await Promise.all(
      [
        itemA._id ? { id: itemA._id, order: orderB } : null,
        itemB._id ? { id: itemB._id, order: orderA } : null,
      ]
        .filter((x): x is { id: string; order: number } => x !== null)
        .map((x) =>
          fetch(`${BACKEND_URL}/api/website/gallery/items/${x.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: x.order }),
          }).catch(() => null)
        )
    );

    showSuccess("Layout position swapped!");
  };

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* TOP HEADING — Matching Staff & Exhibitor List Style */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Media Library
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Upload, organize, and manage photo assets, gallery categories, and past expo event media.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            {/* 1. LIVE WEBSITE PREVIEW BUTTON (Aage/First) */}
            <a
              href="http://localhost:3002/gallery"
              target="_blank"
              rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm active:scale-95"
            >
              <ExternalLink className="h-[12px] w-[12px] text-[#ea580c]" strokeWidth={1.7} />
              View on Website
            </a>

            {/* 2. ADD CATEGORY & YEAR BUTTON (Second, Blue #006199 bg, White text) */}
            <button
              type="button"
              onClick={() => setIsCategoryYearModalOpen(true)}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#006199] px-[14px] text-[8.5px] font-semibold text-white shadow-sm transition hover:bg-[#005180] active:scale-95"
              style={{ backgroundColor: "#006199", color: "#ffffff" }}
            >
              <Tag className="h-[12px] w-[12px] text-white" strokeWidth={1.7} />
              Add Category & Year
            </button>

            {/* 3. UPLOAD NEW MEDIA BUTTON */}
            <button
              type="button"
              onClick={handleOpenUploadModal}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d] active:scale-95"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Upload New Media
            </button>

            {/* 4. BULK DELETE (deletes everything matching the current search/filter) */}
            <button
              type="button"
              onClick={handleBulkDeleteFiltered}
              disabled={bulkDeleting}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#dc2626] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(220,38,38,0.3)] transition hover:bg-[#b91c1c] active:scale-95 disabled:opacity-60"
              title="Deletes every photo matching the current search/filter"
            >
              <Trash2 className="h-[12px] w-[12px]" strokeWidth={1.7} />
              {bulkDeleting ? "Deleting..." : `Bulk Delete${searchQuery || selectedCategory !== "All Activities" || selectedYear !== "All Years" || statusFilter !== "All Status" ? ` (${filteredRows.length})` : ""}`}
            </button>
          </div>
        </div>

        {/* METRIC STATS CARDS (Exact Match to Exhibitor List KPI Cards) */}
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
                  boxShadow:
                    "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div
                    className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${
                      toneClass[item.tone as keyof typeof toneClass]
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[8.5px] !font-semibold tracking-[0.01em] text-slate-900"
                      style={{
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {item.title}
                    </p>

                    <div className="mt-1.5 flex items-end gap-1">
                      <span
                        className="text-[21px] !font-semibold leading-none tracking-[-0.04em]"
                        style={{
                          color: item.numColor,
                          fontWeight: 600,
                        }}
                      >
                        <AnimatedCounter value={item.value} />
                      </span>

                      {item.suffix && (
                        <span className="mb-0.5 text-[9.5px] font-bold">
                          {item.suffix}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  onClick={item.onClick}
                  className="absolute bottom-1 left-2 right-2 flex cursor-pointer items-center justify-center gap-1 text-[8px] font-semibold text-[#293957] transition hover:text-blue-600"
                >
                  {item.footer}
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN SPLIT CONTENT */}
        <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_310px]">
          {/* LEFT COLUMN: FILTERS + TABLE / GRID */}
          <div className="min-w-0 overflow-hidden">
            {/* SEARCH & SECONDARY CONTROLS */}
            <div className="flex flex-wrap items-center gap-[10px]">
              <label className="relative min-w-[200px] flex-1">
                <Search className="absolute right-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#5d6b84]" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search photos by title, category, year..."
                  className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[14px] pr-[40px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
                />
              </label>

              {/* YEAR SELECT FILTER */}
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option value="All Years">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* CATEGORY SELECT FILTER */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] min-w-[140px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option value="All Activities">All Activities</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* STATUS FILTER */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option value="All Status">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>

              {/* VIEW SWITCHER: TABLE / GRID */}
              <div className="flex items-center gap-[4px] rounded-[6px] border border-[#dfe4e8] bg-white p-[3px]">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex h-[32px] w-[32px] items-center justify-center rounded-[4px] transition ${
                    viewMode === "table"
                      ? "bg-[#233D4D] text-white shadow-xs"
                      : "text-[#59657a] hover:bg-slate-100"
                  }`}
                  title="Table View"
                >
                  <List className="h-[15px] w-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex h-[32px] w-[32px] items-center justify-center rounded-[4px] transition ${
                    viewMode === "grid"
                      ? "bg-[#233D4D] text-white shadow-xs"
                      : "text-[#59657a] hover:bg-slate-100"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-[15px] w-[15px]" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("skeleton")}
                  className={`flex h-[32px] w-[32px] items-center justify-center rounded-[4px] transition ${
                    viewMode === "skeleton"
                      ? "bg-[#233D4D] text-white shadow-xs"
                      : "text-[#59657a] hover:bg-slate-100"
                  }`}
                  title="Live Website Layout Preview"
                >
                  <LayoutTemplate className="h-[15px] w-[15px]" />
                </button>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-[40px] items-center justify-center gap-[6px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#35445f] shrink-0 hover:bg-slate-50"
              >
                <RefreshCw className="h-[13px] w-[13px]" />
                Clear
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="mt-[10px] flex flex-wrap items-center gap-[10px] rounded-[6px] border border-[#fecaca] bg-[#fef2f2] px-[12px] py-[8px]">
                <span className="text-[10.5px] font-bold text-[#991b1b]">
                  {selectedIds.length} of {filteredRows.length} selected
                </span>
                {selectedIds.length < filteredRows.length && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="text-[10px] font-semibold text-[#218DAE] hover:underline"
                  >
                    Select all {filteredRows.length} matching this filter
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[10px] font-semibold text-[#64748b] hover:underline"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="ml-auto inline-flex h-[32px] items-center justify-center gap-[6px] rounded-[6px] bg-[#dc2626] px-[14px] text-[10.5px] font-bold text-white shrink-0 hover:bg-[#b91c1c] disabled:opacity-60"
                >
                  <Trash2 className="h-[13px] w-[13px]" />
                  {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
                </button>
              </div>
            )}

            {/* MEDIA DATA: TABLE VIEW */}
            {viewMode === "table" ? (
              <div className="mt-[12px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] bg-white border border-[#e8e5df]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] border-collapse text-left">
                    <thead>
                      <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                        <th className="w-[42px] rounded-tl-[6px] px-[12px] py-[6px] text-center">
                          <input
                            type="checkbox"
                            className="accent-[#233D4D]"
                            checked={paginatedRows.length > 0 && selectedIds.length === paginatedRows.length}
                            onChange={handleToggleSelectAll}
                          />
                        </th>
                        <th className="px-[12px] py-[6px] whitespace-nowrap text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Photo Asset
                        </th>
                        <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Updated By
                        </th>
                        <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Status
                        </th>
                        <th className="rounded-tr-[6px] px-[12px] py-[6px] text-right text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#f0f0ec]">
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-xs font-medium text-slate-500">
                            No photos match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((item) => {
                          const isCurrent = selectedId === item.id;
                          const adminName = item.uploadedBy || loggedInAdminName || "Super Admin";
                          const formattedDate = `${item.date || "12 Sept 2026"}, ${item.time || "04:30 PM"}`;

                          return (
                            <tr
                              key={item.id}
                              onClick={() => setSelectedId(item.id)}
                              className={`transition hover:bg-slate-50/80 cursor-pointer ${
                                isCurrent ? "bg-[#f4faf6]" : ""
                              }`}
                            >
                              <td className="px-[12px] py-[8px] text-center">
                                <input
                                  type="checkbox"
                                  className="accent-[#233D4D]"
                                  checked={selectedIds.includes(item.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() => handleToggleRowSelect(item.id)}
                                />
                              </td>

                              <td className="px-[12px] py-[8px] whitespace-nowrap">
                                <span className="text-[8px] font-semibold text-[#293681]">
                                  #{item.order ?? item.id}
                                </span>
                              </td>

                              <td className="px-[12px] py-[8px]">
                                <div className="relative flex h-[36px] w-[54px] shrink-0 items-center justify-center rounded-[4px] border border-[#e4e7eb] bg-[#f8fafc] p-0.5 shadow-xs overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.title || "Photo Asset"}
                                    className="h-full w-full object-cover rounded-[2px]"
                                  />
                                </div>
                              </td>

                              <td className="px-[12px] py-[8px]">
                                <div className="flex flex-col items-start gap-[2px]">
                                  <span className="text-[8.5px] font-semibold text-[#006199]">
                                    {item.category}
                                  </span>
                                  <span className="inline-flex items-center rounded-[3px] bg-[#fff7ed] border border-[#fed7aa] px-[5px] py-[0.5px] text-[7.5px] font-bold text-[#c2410c]">
                                    {item.year}
                                  </span>
                                </div>
                              </td>

                              {/* UPDATED BY COLUMN WITH ADMIN NAME & DATE */}
                              <td className="px-[12px] py-[8px] max-w-[280px]">
                                <div className="flex flex-col">
                                  <span className="text-[8.5px] font-semibold text-[#dc2626]">
                                    {adminName}
                                  </span>
                                  <span className="text-[7.5px] font-medium text-[#64748b]">
                                    {formattedDate}
                                  </span>
                                </div>
                              </td>

                              {/* STATUS DROPDOWN — Styled Native Select identical to Exhibitor list */}
                              <td className="px-[12px] py-[8px]">
                                <select
                                  key={`${item.id}-${item.status}`}
                                  value={item.status}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    handleStatusChange(item.id, e.target.value as MediaStatus);
                                  }}
                                  className={`h-[24px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[8px] font-bold outline-none bg-no-repeat bg-[right_6px_center] shadow-xs transition ${
                                    item.status === "Published"
                                      ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                                      : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                                  }`}
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                  }}
                                >
                                  <option value="Published" className="bg-white text-[#23714a] font-bold">
                                    Published
                                  </option>
                                  <option value="Draft" className="bg-white text-[#c62828] font-bold">
                                    Draft
                                  </option>
                                </select>
                              </td>

                              {/* ACTIONS — Glassmorphism Effect matching Exhibitor List */}
                              <td className="px-[12px] py-[8px] text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View (Orange Glassmorphism) */}
                                  <button
                                    type="button"
                                    title="View Details"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedId(item.id);
                                    }}
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_3px_10px_rgba(249,115,22,0.25)] hover:scale-105 active:scale-95"
                                  >
                                    <Eye className="h-[12px] w-[12px] text-orange-600" />
                                  </button>

                                  {/* Edit (Blue Glassmorphism) */}
                                  <button
                                    type="button"
                                    title="Edit Photo"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEdit(item);
                                    }}
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-400/30 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95"
                                  >
                                    <Pencil className="h-[12px] w-[12px] text-blue-600" />
                                  </button>

                                  {/* Delete (Red Glassmorphism) */}
                                  <button
                                    type="button"
                                    title="Delete Photo"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item);
                                    }}
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-red-500/10 text-red-600 backdrop-blur-md border border-red-400/30 shadow-[0_2px_6px_rgba(220,38,38,0.12)] transition-all hover:bg-red-500/20 hover:border-red-400/50 hover:shadow-[0_3px_10px_rgba(220,38,38,0.25)] hover:scale-105 active:scale-95"
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

                <GalleryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalCount={filteredRows.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            ) : viewMode === "skeleton" ? (
              /* SKELETON / LIVE LAYOUT VIEW — mirrors the public Gallery /
                 Glimpses page's bento layout exactly, filled photos draggable
                 onto each other to swap their live display position. */
              <div className="mt-[12px] rounded-[7px] bg-white border border-[#e8e5df] p-3">
                <SkeletonBentoView
                  items={paginatedRows}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onSwapOrder={handleSwapOrder}
                />
                <GalleryPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalCount={filteredRows.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            ) : (
              /* GRID VIEW */
              <div className="mt-[12px] rounded-[7px] bg-white border border-[#e8e5df] p-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {paginatedRows.map((item) => {
                  const isCurrent = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`group relative flex flex-col items-center justify-center rounded-[10px] border bg-white p-2.5 shadow-sm transition-all cursor-pointer ${
                        isCurrent
                          ? "border-[#075b33] ring-2 ring-[#075b33]/20"
                          : "border-[#e4e7eb] hover:border-slate-300"
                      }`}
                    >
                      <div className="relative flex h-[110px] w-full items-center justify-center overflow-hidden rounded-[6px] bg-slate-50">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 rounded-[4px] bg-black/60 px-1.5 py-0.5 text-[7.5px] font-bold text-white backdrop-blur-xs">
                          {item.year}
                        </span>
                      </div>
                      <p className="mt-2 text-center text-[9.5px] font-bold text-[#19274a] line-clamp-1 w-full">
                        {item.title}
                      </p>
                      <span className="text-[8px] font-semibold text-[#006199]">
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
              <GalleryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalCount={filteredRows.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: MEDIA DETAILS (Exact Match to Exhibitor List Right Panel) */}
          <aside className="space-y-[12px]">
            {/* MEDIA DETAILS CARD */}
            <section
              className="bg-white px-[14px] py-[13px]"
              style={{
                borderRadius: "0px",
                boxShadow:
                  "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset",
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-bold text-[#19274a]">
                  Photo Details
                </h2>
                <ChevronDown className="h-[14px] w-[14px] rotate-180 text-[#59657a]" />
              </div>

              {selected ? (
                <div className="mt-[12px]">
                  {/* PREVIEW CONTAINER */}
                  <div className="relative flex h-[140px] w-full items-center justify-center rounded-[8px] border border-[#e4e7eb] bg-white p-2 shadow-inner overflow-hidden">
                    <img
                      src={selected.image}
                      alt={selected.title}
                      className="max-h-[125px] max-w-full object-contain rounded-[4px]"
                    />
                  </div>

                  {/* TITLE AND STATUS */}
                  <div className="mt-[12px] flex items-center justify-between gap-[8px]">
                    <p className="truncate text-[11px] font-bold text-[#19274a]">
                      {selected.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-[4px] px-[8px] py-[2px] text-[8.5px] font-bold ${
                        selected.status === "Published"
                          ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                          : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                      }`}
                    >
                      {selected.status}
                    </span>
                  </div>

                  {/* DETAILS LIST */}
                  <div className="mt-[12px] space-y-[7px] text-[9px]">
                    <p>
                      <span className="font-semibold text-[#69758c]">Category:</span>{" "}
                      <span className="font-bold" style={{ color: "#006199" }}>
                        {selected.category}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-[#69758c]">Event Year:</span>{" "}
                      <span className="font-bold text-[#c2410c]">{selected.year}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-[#69758c]">Updated on:</span>{" "}
                      <span className="font-semibold" style={{ color: "#4B1426" }}>
                        {selected.date}, {selected.time}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-[#69758c]">Updated by:</span>{" "}
                      <span className="font-semibold" style={{ color: "#dc2626" }}>
                        {selected.uploadedBy || loggedInAdminName}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold text-[#69758c]">Alt Text:</span>{" "}
                      <span className="font-semibold text-[#34425e]">
                        {selected.imageAlt || selected.title}
                      </span>
                    </p>
                  </div>

                  {/* ASSET URL DISPLAY WITH COPY BUTTON */}
                  <div className="mt-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] font-bold text-[#34425e]">Asset CDN URL:</p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(selected.image);
                          showSuccess("Asset CDN URL copied to clipboard!");
                        }}
                        className="inline-flex items-center gap-1 text-[8px] font-bold text-[#0284c7] hover:underline"
                      >
                        <Copy className="h-2.5 w-2.5" />
                        Copy URL
                      </button>
                    </div>
                    <div className="rounded-[4px] border border-[#e4e7eb] bg-[#f8fafc] px-2.5 py-1.5 font-mono text-[7.5px] text-[#475569] break-all select-all">
                      {selected.image}
                    </div>
                  </div>

                  {/* ACTIONS: EDIT, CROP, REPLACE, DELETE */}
                  <div className="mt-[14px] grid grid-cols-2 gap-2 border-t border-[#f0f2f5] pt-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(selected)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] shadow-xs transition hover:bg-slate-50"
                    >
                      <Pencil className="h-3 w-3 text-blue-600" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenCropForExisting}
                      className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] shadow-xs transition hover:bg-slate-50"
                    >
                      <Crop className="h-3 w-3 text-violet-600" />
                      Crop
                    </button>

                    <input
                      type="file"
                      ref={replaceFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleQuickReplace}
                    />

                    <button
                      type="button"
                      onClick={() => replaceFileRef.current?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3 w-3 text-emerald-600 ${isUploading ? "animate-spin" : ""}`} />
                      {isUploading ? "Uploading..." : "Replace"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(selected)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-rose-200 bg-rose-50 py-1.5 text-[8.5px] font-bold text-rose-700 shadow-xs transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-3 w-3 text-rose-600" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-[12px] flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2.5">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#19274a]">No Photo Selected</p>
                  <p className="text-[8.5px] text-[#69758c] mt-1 max-w-[210px] leading-relaxed">
                    Upload a photo using the button below or select an asset from the table.
                  </p>
                </div>
              )}
            </section>

            {/* QUICK ACTIONS CARD */}
            <section
              className="bg-white px-[14px] py-[13px]"
              style={{
                borderRadius: "0px",
                boxShadow:
                  "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset",
              }}
            >
              <h2 className="text-[12px] font-bold text-[#19274a]">
                Quick Actions
              </h2>

              <div className="mt-[10px] grid grid-cols-2 gap-[8px]">
                <button
                  type="button"
                  onClick={handleOpenUploadModal}
                  className="flex h-[32px] items-center justify-center gap-[6px] rounded-[5px] bg-[#4B1426] text-[8.5px] font-bold text-white shadow-xs transition hover:bg-[#3a0f1d] active:scale-95"
                >
                  <Plus className="h-3 w-3" />
                  Upload Photo
                </button>

                <a
                  href="http://localhost:3002/gallery"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-[32px] items-center justify-center gap-[6px] rounded-[5px] border border-[#cbd5e1] bg-white text-[8.5px] font-bold text-[#334155] shadow-xs transition hover:bg-slate-50 active:scale-95"
                >
                  <ExternalLink className="h-3 w-3 text-[#ea580c]" />
                  Live Preview
                </a>
              </div>
            </section>
          </aside>
        </section>

        {/* MODAL 1: ADD / EDIT PHOTO MODAL (Exact match to "New Exhibitor" modal UI & animations) */}
        <Modal
          isOpen={isUploadModalOpen || isEditModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? "Edit Media Asset" : "Upload New Media Asset"}
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
                style={{
                  background: "#fff1f2",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isEditModalOpen) handleSaveEdit();
                  else handleCreateMedia();
                }}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "#16a34a",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
                }}
              >
                {isEditModalOpen ? "Save Changes" : "Create Asset"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            {/* TITLE (Optional) */}
            <Input
              label="Title (Optional)"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Grand Inaugural Ceremony (Defaults to Category)"
            />

            {/* ALT TEXT (Optional) */}
            <Input
              label="Image Alt Text (Optional)"
              value={formImageAlt}
              onChange={(e) => setFormImageAlt(e.target.value)}
              placeholder="Describe the photo for screen readers & SEO (Defaults to Title)"
            />

            {/* ORDER — auto-filled with the next position, editable to reorder manually */}
            <div>
              <Label>Order</Label>
              <input
                type="number"
                min={1}
                value={formOrder}
                onChange={(e) => {
                  setFormOrder(Math.max(1, Number(e.target.value) || 1));
                  setFormOrderTouched(true);
                }}
                className="h-[38px] w-full rounded-[4px] border border-surface-border bg-surface-card px-[12px] text-[11px] font-semibold text-[#1e293b] outline-none transition-all hover:border-[#FF9D50] focus:border-[#FF9D50] [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
              />
            </div>

            {/* SELECT YEAR & SELECT CATEGORY GRID */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label required>Select Year</Label>
                <select
                  value={formYear}
                  onChange={(e) => setFormYear(e.target.value)}
                  className="h-[38px] w-full cursor-pointer appearance-none rounded-[4px] px-[12px] pr-[28px] text-[11px] font-semibold text-[#1e293b] outline-none border border-surface-border bg-surface-card bg-no-repeat bg-[right_10px_center] transition-all hover:border-[#FF9D50] focus:border-[#FF9D50] [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  {years.map((yr) => (
                    <option key={yr} value={yr} className="bg-white text-[#1e293b]">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label required>Select Category</Label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="h-[38px] w-full cursor-pointer appearance-none rounded-[4px] px-[12px] pr-[28px] text-[11px] font-semibold text-[#1e293b] outline-none border border-surface-border bg-surface-card bg-no-repeat bg-[right_10px_center] transition-all hover:border-[#FF9D50] focus:border-[#FF9D50] [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-[#1e293b]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STATUS DROPDOWN */}
            <div>
              <Label>Status</Label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as MediaStatus)}
                className={`h-[38px] w-full cursor-pointer appearance-none rounded-[4px] px-[12px] pr-[28px] text-[11px] font-bold outline-none bg-no-repeat bg-[right_10px_center] shadow-xs transition ${
                  formStatus === "Published"
                    ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                    : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="Published" className="bg-white text-[#23714a] font-bold">
                  Published
                </option>
                <option value="Draft" className="bg-white text-[#c62828] font-bold">
                  Draft
                </option>
              </select>
            </div>

            {/* FILE UPLOAD SECTION (Exact match to "New Exhibitor" modal UI) */}
            <div>
              <Label required>Media Photo File (Cloudinary CDN)</Label>
              <div className="flex gap-3 items-center">
                <div className="relative flex h-[64px] w-[80px] shrink-0 items-center justify-center overflow-hidden border border-surface-border bg-surface-card p-1 shadow-xs rounded-[4px]">
                  {formImageUrl ? (
                    <img src={formImageUrl} alt="Preview" className="h-full w-full object-cover rounded-[2px]" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/ldlcnnhz/... or choose file"
                    className="w-full border border-surface-border bg-surface-card px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted transition-all hover:border-[#FF9D50] focus:border-[#FF9D50] focus:outline-none [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!formTitle) setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
                          setFormFileSize(`${(file.size / 1024).toFixed(1)} KB`);
                          try {
                            const cloudUrl = await uploadToCloudinary(file);
                            setFormImageUrl(cloudUrl);
                            showSuccess("Image uploaded!");
                          } catch (err) {
                            showUploadError(err);
                            e.target.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-[28px] items-center gap-1.5 border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[11px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:opacity-50 active:scale-95"
                      style={{
                        borderRadius: "4px",
                        boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px",
                      }}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="h-3 w-3 text-slate-600 animate-spin" />
                          Uploading to Cloudinary...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 text-slate-600" />
                          Choose Local Image
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isUploading || !formImageUrl}
                      onClick={handleOpenCropForForm}
                      className="inline-flex h-[28px] items-center gap-1.5 border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[11px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:opacity-50 active:scale-95"
                      style={{
                        borderRadius: "4px",
                        boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px",
                      }}
                    >
                      <Crop className="h-3 w-3 text-violet-600" />
                      Crop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>

        {/* MODAL: CROP PHOTO (shared by the Upload/Edit form and the right-sidebar "Crop" action) */}
        <CropImageModal
          isOpen={isCropModalOpen}
          imageSrc={cropImageSrc}
          onCancel={handleCloseCropModal}
          onCropped={handleCropApplied}
        />

        {/* MODAL 2: MANAGE CATEGORIES & YEARS MODAL */}
        <Modal
          isOpen={isCategoryYearModalOpen}
          onClose={() => setIsCategoryYearModalOpen(false)}
          title="Manage Categories & Years"
          size="md"
          footer={
            <button
              type="button"
              onClick={() => setIsCategoryYearModalOpen(false)}
              className="inline-flex h-[32px] items-center gap-1.5 px-[16px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "#16a34a",
                borderRadius: "4px",
                boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
              }}
            >
              Done / Close
            </button>
          }
        >
          <div className="space-y-4">
            {/* SECTION 1: PHOTO CATEGORIES / ACTIVITIES */}
            <div className="rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[12px] font-bold text-[#0f172a]">
                    Photo Categories / Activities
                  </h3>
                  <p className="text-[9.5px] text-[#64748b]">
                    Manage categories visible on the gallery frontend & dropdowns
                  </p>
                </div>
                <span className="rounded-[4px] bg-[#e0f2fe] px-2 py-0.5 text-[8.5px] font-bold text-[#0284c7]">
                  {categories.length} Total
                </span>
              </div>

              {/* Existing Categories Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3 max-h-[120px] overflow-y-auto p-1">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#cbe2fc] bg-white px-2 py-1 text-[10px] font-semibold text-[#0369a1] shadow-xs"
                  >
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete Category"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Category Input & Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  placeholder="Enter new category name (e.g. VIP Dinner)..."
                  className="flex-1 h-[34px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[11px] font-medium text-[#1e293b] outline-none focus:border-[#FF9D50] [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="h-[34px] px-3.5 rounded-[4px] bg-[#0284c7] text-white text-[10px] font-bold hover:bg-[#0369a1] transition shadow-xs flex items-center gap-1 active:scale-95"
                >
                  <Plus className="h-3 w-3" />
                  Add Category
                </button>
              </div>
            </div>

            {/* SECTION 2: EVENT YEARS */}
            <div className="rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-[12px] font-bold text-[#0f172a]">
                    Event Years
                  </h3>
                  <p className="text-[9.5px] text-[#64748b]">
                    Manage years available for past expo editions
                  </p>
                </div>
                <span className="rounded-[4px] bg-[#fed7aa] px-2 py-0.5 text-[8.5px] font-bold text-[#c2410c]">
                  {years.length} Total
                </span>
              </div>

              {/* Existing Years Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3 p-1">
                {years.map((yr) => (
                  <span
                    key={yr}
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#fed7aa] bg-white px-2.5 py-1 text-[10px] font-bold text-[#c2410c] shadow-xs"
                  >
                    <span>{yr}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveYear(yr)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Delete Year"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add New Year Input & Button */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddYear();
                    }
                  }}
                  placeholder="Enter new year (e.g. 2027)..."
                  className="flex-1 h-[34px] px-3 rounded-[4px] border border-[#cbd5e1] bg-white text-[11px] font-medium text-[#1e293b] outline-none focus:border-[#FF9D50] [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
                />
                <button
                  type="button"
                  onClick={handleAddYear}
                  className="h-[34px] px-3.5 rounded-[4px] bg-[#ea580c] text-white text-[10px] font-bold hover:bg-[#c2410c] transition shadow-xs flex items-center gap-1 active:scale-95"
                >
                  <Plus className="h-3 w-3" />
                  Add Year
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}