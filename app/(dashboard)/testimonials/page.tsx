"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { getBackendUrl } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import { Input, Label, Textarea } from "@/components/ui/Input";
import typography from "../pages/PagesTypography.module.css";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  Grid,
  List,
  MapPin,
  MessageCircleMore,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Trash2,
  Globe,
  Upload,
  User,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";

// Resolved at runtime from the actual page domain — not a build-time env var, which can
// end up baked in as "localhost" if the production build wasn't given its own .env.
const BACKEND_URL = getBackendUrl();

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

// ─── Format Date & Time (e.g. 14 Sep 2026, 11:25 AM) ───
const formatDateTime = (inputDate?: string | Date) => {
  let d: Date;
  if (!inputDate) {
    d = new Date();
  } else if (inputDate instanceof Date) {
    d = inputDate;
  } else {
    d = new Date(inputDate);
    if (isNaN(d.getTime())) {
      return inputDate;
    }
  }

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

  return `${dateStr}, ${timeStr}`;
};

// ─── Initials Generator (Matching Frontend Testimonials Carousel) ───
const getInitials = (name: string) => {
  if (!name || typeof name !== "string") return "";
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  const cleanWords = words.filter(
    (w) => !["dr.", "dr", "mr.", "mr", "ms.", "ms", "prof.", "prof"].includes(w.toLowerCase())
  );
  const targetWords = cleanWords.length >= 2 ? cleanWords : words;
  const first = targetWords[0][0];
  const last = targetWords[targetWords.length - 1][0];
  return (first + last).toUpperCase();
};

// ─── Initials / Logo Circular Badge Component ───
function InitialsBadge({
  name,
  color = "#1b5e20",
  logo,
  size = 36,
  textSize = 12,
}: {
  name: string;
  color?: string;
  logo?: string;
  size?: number;
  textSize?: number;
}) {
  if (logo && logo.trim() !== "") {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full border border-[#e4e7eb] shadow-xs bg-white"
        style={{ width: size, height: size }}
      >
        <img src={logo} alt={name} className="h-full w-full object-cover rounded-full" />
      </div>
    );
  }

  const initials = getInitials(name) || "BO";
  const activeColor = color || "#1b5e20";

  return (
    <div
      className="relative shrink-0 flex items-center justify-center rounded-full font-bold uppercase tracking-wider font-poppins border-[2px] border-white shadow-sm transition-transform"
      style={{
        width: size,
        height: size,
        fontSize: textSize,
        color: activeColor,
        background: `linear-gradient(135deg, #ffffff 0%, ${activeColor}15 100%)`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1.5px #e2e8f0",
      }}
    >
      {initials}
    </div>
  );
}

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

export type TestimonialStatus = "Published" | "Pending Review" | "Hidden";

export interface Testimonial {
  id: number;
  _id?: string;
  name: string; // company1 in backend
  role: string; // company2 in backend
  location: string; // location in backend
  message: string; // quote in backend
  rating: number;
  status: TestimonialStatus;
  date: string;
  author: string;
  color: string;
  logo?: string;
  logoText?: string;
}

const COLOR_PRESETS = [
  { label: "Forest Green", value: "#1b5e20" },
  { label: "Gujarat Orange", value: "#d26019" },
  { label: "Deep Jade", value: "#00643b" },
  { label: "Dark Olive", value: "#23471d" },
  { label: "Kairana Green", value: "#164429" },
  { label: "Ocean Blue", value: "#0284c7" },
  { label: "Burgundy", value: "#4B1426" },
  { label: "Royal Purple", value: "#7c3aed" },
];

const INITIAL_TESTIMONIALS: Testimonial[] = [];

function RatingStars({ value, size = 11 }: { value: number; size?: number }) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1.6}
          className={
            index < rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-300"
          }
        />
      ))}
    </div>
  );
}

export default function TestimonialsManagementPage() {
  const router = useRouter();
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
          if (parsed?.user?.name && typeof parsed.user.name === "string" && parsed.user.name.trim().length > 0) {
            return parsed.user.name.trim();
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

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [rating, setRating] = useState("All Ratings");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Add / Edit Modal Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formMessage, setFormMessage] = useState("");
  const [formStatus, setFormStatus] = useState<TestimonialStatus>("Published");
  const [formColor, setFormColor] = useState("#1b5e20");
  const [formLogo, setFormLogo] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Settings Modal Rules
  const [autoApprove, setAutoApprove] = useState(true);
  const [minRatingToDisplay, setMinRatingToDisplay] = useState("4.0");

  // ─── Fetch Testimonials from Backend on Mount ───
  const fetchBackendTestimonials = async () => {
    try {
      setIsSyncing(true);
      const res = await fetch(`${BACKEND_URL}/api/website/home/testimonials-carousel`);
      if (!res.ok) return;
      const json = await res.json();
      const rawList = json?.data?.testimonials;
      if (Array.isArray(rawList)) {
        const mapped: Testimonial[] = rawList.map((t: any, index: number) => ({
          id: index + 1,
          _id: t._id,
          name: t.company1 || `Reviewer #${index + 1}`,
          role: t.company2 || "Exhibitor",
          location: t.location || "India",
          message: t.quote || "",
          rating: 5,
          status: (t.status as TestimonialStatus) || "Published",
          date: t.date || t.addedOn || (t.createdAt ? formatDateTime(t.createdAt) : formatDateTime()),
          author: t.author || getAdminDisplayName(),
          color: t.color || "#1b5e20",
          logo: t.logo || "",
          logoText: t.logoText || "",
        }));
        setTestimonials(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        } else {
          setSelectedId(null);
        }
      }
    } catch (err) {
      console.error("Failed to load testimonials from backend:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchBackendTestimonials();
  }, []);

  // ─── Save Changes to Backend API (PUT /api/website/home/testimonials-carousel) ───
  const saveToBackend = async (updatedList: Testimonial[]) => {
    try {
      setIsSyncing(true);
      const payload = {
        testimonials: updatedList.map((t) => ({
          ...(t._id ? { _id: t._id } : {}),
          company1: t.name,
          company2: t.role,
          location: t.location || "",
          quote: t.message,
          color: t.color || "#1b5e20",
          logo: t.logo || "",
          logoText: t.logoText || "",
          status: t.status,
          author: t.author || getAdminDisplayName(),
          date: t.date || formatDateTime(),
          addedOn: t.date || formatDateTime(),
        })),
      };

      const res = await fetch(`${BACKEND_URL}/api/website/home/testimonials-carousel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error("Failed to save testimonials to backend:", err);
      showError("Could not sync with backend. Saved in local view.");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Unique list of locations for filtering
  const locationsList = useMemo(() => {
    const set = new Set<string>();
    testimonials.forEach((t) => {
      if (t.location && t.location.trim()) {
        set.add(t.location.trim());
      }
    });
    return Array.from(set);
  }, [testimonials]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return testimonials.filter((item) => {
      const searchMatch =
        !query ||
        `${item.name} ${item.role} ${item.message} ${item.location}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const statusMatch = status === "All Status" || item.status === status;
      const locationMatch =
        locationFilter === "All Locations" ||
        item.location.toLowerCase() === locationFilter.toLowerCase();

      const ratingMatch =
        rating === "All Ratings" ||
        Math.round(item.rating) === Number(rating.replace(" Stars", "").replace(" Star", ""));

      return searchMatch && statusMatch && locationMatch && ratingMatch;
    });
  }, [testimonials, query, status, locationFilter, rating]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Selected item object
  const selected = useMemo(() => {
    if (!selectedId) return testimonials[0] || null;
    return testimonials.find((t) => t.id === selectedId) || null;
  }, [testimonials, selectedId]);

  // Stat calculations
  const totalCount = testimonials.length;
  const publishedCount = useMemo(
    () => testimonials.filter((x) => x.status === "Published").length,
    [testimonials]
  );
  const pendingCount = useMemo(
    () => testimonials.filter((x) => x.status === "Pending Review").length,
    [testimonials]
  );
  const hiddenCount = useMemo(
    () => testimonials.filter((x) => x.status === "Hidden").length,
    [testimonials]
  );

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormName("");
    setFormRole("Exhibitor");
    setFormLocation("");
    setFormRating(5);
    setFormMessage("");
    setFormStatus("Published");
    setFormColor("#1b5e20");
    setFormLogo("");
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: Testimonial) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormRole(item.role);
    setFormLocation(item.location || "");
    setFormRating(item.rating || 5);
    setFormMessage(item.message);
    setFormStatus(item.status);
    setFormColor(item.color || "#1b5e20");
    setFormLogo(item.logo || "");
    setIsEditModalOpen(true);
  };

  // Handle Logo File Upload — uploads to Cloudinary/the backend's upload
  // endpoint and stores the returned short CDN URL, the same way Gallery's
  // Media Library does. This used to read the file as a base64 data URI and
  // save THAT directly, which meant every testimonial's logo was a
  // 300KB–2MB text blob sitting in the database; since the homepage embeds
  // all published testimonials into its server-rendered payload, that
  // alone was adding several megabytes to every single homepage load.
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError("Image size must be less than 2MB");
      e.target.value = "";
      return;
    }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "bharat-organic/testimonials");

      let res = await fetch(`/api/uploads?folder=${encodeURIComponent("bharat-organic/testimonials")}`, {
        method: "POST",
        body: formData,
      }).catch(() => null);

      if (!res) {
        res = await fetch(`${BACKEND_URL}/api/uploads?folder=${encodeURIComponent("bharat-organic/testimonials")}`, {
          method: "POST",
          body: formData,
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        throw new Error(`Upload failed${res ? ` (status ${res.status})` : " — could not reach the upload server"}.`);
      }

      const json = await res.json().catch(() => null);
      const url = json?.data?.url || json?.url || json?.data?.secure_url || json?.secure_url;
      if (!url) throw new Error("Upload server did not return an image URL.");

      setFormLogo(url);
      showSuccess("Logo photo uploaded successfully!");
    } catch (err: any) {
      showError(err?.message || "Could not upload logo photo. Please try again.");
    } finally {
      setIsUploadingLogo(false);
      e.target.value = "";
    }
  };

  // Save Testimonial (Add or Edit)
  const handleSaveTestimonial = async () => {
    if (!formName.trim()) {
      showError("Please enter reviewer name.");
      return;
    }
    if (!formLocation.trim()) {
      showError("Please enter location (e.g. Haridwar, Gujarat, New Delhi).");
      return;
    }
    if (!formMessage.trim()) {
      showError("Please enter testimonial quote or message.");
      return;
    }

    const nowFormatted = formatDateTime();
    const adminName = getAdminDisplayName();

    let updatedList: Testimonial[] = [];

    if (isEditModalOpen && editingId !== null) {
      updatedList = testimonials.map((t) =>
        t.id === editingId
          ? {
              ...t,
              name: formName.trim(),
              role: formRole.trim() || "Exhibitor",
              location: formLocation.trim(),
              rating: formRating,
              message: formMessage.trim(),
              status: formStatus,
              color: formColor,
              logo: formLogo.trim(),
              author: adminName,
              date: nowFormatted,
            }
          : t
      );
      setTestimonials(updatedList);
      setIsEditModalOpen(false);
      showSuccess(`"${formName.trim()}" updated successfully!`);
    } else {
      const nextId =
        testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.id)) + 1 : 1;
      const newTestimonial: Testimonial = {
        id: nextId,
        name: formName.trim(),
        role: formRole.trim() || "Exhibitor",
        location: formLocation.trim(),
        rating: formRating,
        message: formMessage.trim(),
        status: formStatus,
        date: nowFormatted,
        author: adminName,
        color: formColor,
        logo: formLogo.trim(),
      };

      updatedList = [newTestimonial, ...testimonials];
      setTestimonials(updatedList);
      setSelectedId(nextId);
      setIsAddModalOpen(false);
      showSuccess(`Testimonial from "${formName.trim()}" created successfully!`);
    }

    await saveToBackend(updatedList);
  };

  // KPI stat cards matching Media Library
  const statCards = useMemo(
    () => [
      {
        title: "TOTAL REVIEWS",
        value: totalCount,
        suffix: "",
        icon: MessageCircleMore,
        tone: "emerald" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View all reviews",
        onClick: () => {
          setStatus("All Status");
          setLocationFilter("All Locations");
          setRating("All Ratings");
          setQuery("");
        },
      },
      {
        title: "PUBLISHED REVIEWS",
        value: publishedCount,
        suffix: "",
        icon: Check,
        tone: "violet" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        footer: "View published",
        onClick: () => {
          setStatus("Published");
          setCurrentPage(1);
        },
      },
      {
        title: "PENDING REVIEW",
        value: pendingCount,
        suffix: "",
        icon: Clock3,
        tone: "amber" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        footer: "Review pending",
        onClick: () => {
          setStatus("Pending Review");
          setCurrentPage(1);
        },
      },
      {
        title: "AVERAGE RATING",
        value:
          testimonials.length > 0
            ? (
                testimonials.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
                testimonials.length
              ).toFixed(1)
            : "0.0",
        suffix: "/ 5",
        icon: Star,
        tone: "blue" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        footer: "View 5-star reviews",
        onClick: () => {
          setRating("5 Stars");
          setCurrentPage(1);
        },
      },
      {
        title: "HIDDEN REVIEWS",
        value: hiddenCount,
        suffix: "",
        icon: EyeOff,
        tone: "rose" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
        borderColor: "#fecdd3",
        numColor: "#be123c",
        footer: "View hidden",
        onClick: () => {
          setStatus("Hidden");
          setCurrentPage(1);
        },
      },
      {
        title: "WEBSITE STATUS",
        value: "Live",
        suffix: "",
        icon: Globe,
        tone: "teal" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
        borderColor: "#99f6e4",
        numColor: "#0f766e",
        footer: "Live on website",
        onClick: () => window.open("http://localhost:3002", "_blank"),
      },
    ],
    [totalCount, publishedCount, pendingCount, hiddenCount]
  );

  // Status change handler
  const handleStatusChange = async (id: number, newStatus: TestimonialStatus) => {
    const adminName = getAdminDisplayName();
    const nowFormatted = formatDateTime();
    const updatedList = testimonials.map((item) =>
      item.id === id
        ? { ...item, status: newStatus, author: adminName, date: nowFormatted }
        : item
    );
    setTestimonials(updatedList);
    showSuccess(`Status updated to ${newStatus}`);
    await saveToBackend(updatedList);
  };

  // Delete handler with SweetAlert2 confirmation
  const handleDelete = (item: Testimonial) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Testimonial from "${item.name}" will be deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updatedList = testimonials.filter((t) => t.id !== item.id);
        setTestimonials(updatedList);
        if (selectedId === item.id) {
          setSelectedId(updatedList[0]?.id || null);
        }
        showSuccess(`"${item.name}" testimonial removed.`);
        await saveToBackend(updatedList);
      }
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRows.map((r) => r.id));
    }
  };

  const handleToggleRowSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setStatus("All Status");
    setLocationFilter("All Locations");
    setRating("All Ratings");
    setCurrentPage(1);
  };

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* TOP HEADING */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Testimonials Management
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Manage attendee feedback, speaker quotes, location tags, and initials badges for the live website carousel.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            {/* SYNC INDICATOR */}
            {isSyncing && (
              <span className="flex items-center gap-1.5 text-[9px] font-semibold text-[#006199] bg-[#e0f2fe] px-2.5 py-1 rounded-[4px] border border-[#bae6fd] animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Syncing with Backend...
              </span>
            )}

            {/* 1. LIVE WEBSITE PREVIEW BUTTON */}
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm active:scale-95"
            >
              <ExternalLink className="h-[12px] w-[12px] text-[#ea580c]" strokeWidth={1.7} />
              View on Website
            </a>

            {/* 2. SETTINGS BUTTON */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#006199] px-[14px] text-[8.5px] font-semibold text-white shadow-sm transition hover:bg-[#005180] active:scale-95 cursor-pointer"
              style={{ backgroundColor: "#006199", color: "#ffffff" }}
            >
              <Settings className="h-[12px] w-[12px] text-white" strokeWidth={1.7} />
              Settings
            </button>

            {/* 3. ADD NEW TESTIMONIAL BUTTON */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d] active:scale-95 cursor-pointer"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Add New Testimonial
            </button>
          </div>
        </div>

        {/* METRIC STATS CARDS */}
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
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search testimonials by name, role, quote or location..."
                  className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[14px] pr-[40px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
                />
              </label>

              {/* STATUS FILTER */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Published">Published</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Hidden">Hidden</option>
              </select>

              {/* LOCATION FILTER (Replaced Category with Location) */}
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] min-w-[130px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                {locationsList.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>

              {/* RATING FILTER */}
              <select
                value={rating}
                onChange={(e) => {
                  setRating(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none cursor-pointer"
              >
                <option value="All Ratings">All Ratings</option>
                <option value="5 Stars">5 Stars</option>
                <option value="4 Stars">4 Stars</option>
                <option value="3 Stars">3 Stars</option>
                <option value="2 Stars">2 Stars</option>
                <option value="1 Star">1 Star</option>
              </select>

              {/* VIEW SWITCHER: TABLE / GRID */}
              <div className="flex items-center gap-[4px] rounded-[6px] border border-[#dfe4e8] bg-white p-[3px]">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`flex h-[32px] w-[32px] items-center justify-center rounded-[4px] transition cursor-pointer ${
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
                  className={`flex h-[32px] w-[32px] items-center justify-center rounded-[4px] transition cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#233D4D] text-white shadow-xs"
                      : "text-[#59657a] hover:bg-slate-100"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-[15px] w-[15px]" />
                </button>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-[40px] items-center justify-center gap-[6px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#35445f] shrink-0 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className="h-[13px] w-[13px]" />
                Clear
              </button>
            </div>

            {/* TESTIMONIALS DATA: TABLE VIEW */}
            {viewMode === "table" ? (
              <div className="mt-[12px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] bg-white border border-[#e8e5df]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] border-collapse text-left">
                    <thead>
                      <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                        <th className="w-[42px] rounded-tl-[6px] px-[12px] py-[6px] text-center">
                          <input
                            type="checkbox"
                            className="accent-[#233D4D] cursor-pointer"
                            checked={paginatedRows.length > 0 && selectedIds.length === paginatedRows.length}
                            onChange={handleToggleSelectAll}
                          />
                        </th>
                        <th className="px-[12px] py-[6px] whitespace-nowrap text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Testimonials Name
                        </th>
                        <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-[12px] py-[6px] whitespace-nowrap text-[8.5px] font-bold text-white uppercase tracking-wider">
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
                          <td colSpan={8} className="py-12 text-center text-xs font-medium text-slate-500">
                            No testimonials match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((item) => {
                          const isCurrent = selectedId === item.id;

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
                                  className="accent-[#233D4D] cursor-pointer"
                                  checked={selectedIds.includes(item.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() => handleToggleRowSelect(item.id)}
                                />
                              </td>

                              <td className="px-[12px] py-[8px] whitespace-nowrap">
                                <span className="text-[8px] font-semibold text-[#293681]">
                                  #{item.id}
                                </span>
                              </td>

                              <td className="px-[12px] py-[8px]">
                                <div className="flex items-center gap-[10px] min-w-[200px]">
                                  {/* Initials Badge Circle / Optional Logo */}
                                  <InitialsBadge
                                    name={item.name}
                                    color={item.color}
                                    logo={item.logo}
                                    size={32}
                                    textSize={10.5}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p
                                      className="text-[10.5px] font-bold truncate"
                                      style={{ color: item.color || "#19274a" }}
                                    >
                                      {item.name}
                                    </p>
                                    <p className="text-[8px] font-semibold text-[#4B1426] truncate">
                                      {item.role}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* LOCATION COLUMN (Replaces Category) */}
                              <td className="px-[12px] py-[8px] whitespace-nowrap">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-[#0f766e]">
                                  <MapPin className="h-3 w-3 text-[#d26019] shrink-0" />
                                  <span>{item.location || "Haridwar"}</span>
                                </div>
                              </td>

                              <td className="px-[12px] py-[8px] whitespace-nowrap">
                                <div className="flex items-center gap-[6px]">
                                  <RatingStars value={item.rating} size={11} />
                                  <span className="text-[8.5px] font-bold text-[#b45309]">
                                    {item.rating.toFixed(1)}
                                  </span>
                                </div>
                              </td>

                              {/* UPDATED BY COLUMN */}
                              <td className="px-[12px] py-[8px] whitespace-nowrap">
                                <div className="flex flex-col items-start leading-tight">
                                  <span className="text-[9px] font-bold text-[#dc2626] whitespace-nowrap">
                                    {item.author || getAdminDisplayName()}
                                  </span>
                                  <span className="text-[8px] font-medium text-[#64748b] mt-0.5 whitespace-nowrap">
                                    {item.date}
                                  </span>
                                </div>
                              </td>

                              {/* STATUS DROPDOWN */}
                              <td className="px-[12px] py-[8px]">
                                <select
                                  key={`${item.id}-${item.status}`}
                                  value={item.status}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    handleStatusChange(item.id, e.target.value as TestimonialStatus);
                                  }}
                                  className={`h-[24px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[8px] font-bold outline-none bg-no-repeat bg-[right_6px_center] shadow-xs transition ${
                                    item.status === "Published"
                                      ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                                      : item.status === "Pending Review"
                                      ? "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
                                      : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                                  }`}
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                  }}
                                >
                                  <option value="Published" className="bg-white text-[#23714a] font-bold">
                                    Published
                                  </option>
                                  <option value="Pending Review" className="bg-white text-[#b78103] font-bold">
                                    Pending Review
                                  </option>
                                  <option value="Hidden" className="bg-white text-[#c62828] font-bold">
                                    Hidden
                                  </option>
                                </select>
                              </td>

                              {/* ACTIONS */}
                              <td className="px-[12px] py-[8px] text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View */}
                                  <button
                                    type="button"
                                    title="View Details"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedId(item.id);
                                    }}
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_3px_10px_rgba(249,115,22,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    <Eye className="h-[12px] w-[12px] text-orange-600" />
                                  </button>

                                  {/* Edit */}
                                  <button
                                    type="button"
                                    title="Edit Testimonial"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditModal(item);
                                    }}
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-400/30 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                                  >
                                    <Pencil className="h-[12px] w-[12px] text-blue-600" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    title="Delete Testimonial"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item);
                                    }}
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-red-500/10 text-red-600 backdrop-blur-md border border-red-400/30 shadow-[0_2px_6px_rgba(220,38,38,0.12)] transition-all hover:bg-red-500/20 hover:border-red-400/50 hover:shadow-[0_3px_10px_rgba(220,38,38,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
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

                {/* Table Footer Stats & Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2563eb]">
                      Total Testimonials: <strong className="font-bold text-[#1d4ed8]">{filteredRows.length}</strong>
                    </span>
                    <span className="text-[7.5px] text-[#8a92a0]">
                      (Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-[4px]">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`flex h-[22px] min-w-[22px] px-1.5 items-center justify-center rounded-[4px] border text-[8px] font-bold transition cursor-pointer ${
                          currentPage === pageNum
                            ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs"
                            : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>

                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-2 h-[22px] rounded-[4px] border border-[#d8dce2] bg-white px-[6px] text-[8px] font-semibold text-[#334155] outline-none cursor-pointer"
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* GRID VIEW MATCHING CARD AESTHETIC */
              <div className="mt-[12px] grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {paginatedRows.map((item) => {
                  const isCurrent = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`group relative flex flex-col rounded-[12px] border bg-white p-3.5 shadow-sm transition-all cursor-pointer ${
                        isCurrent
                          ? "border-[#1b5e20] ring-2 ring-[#1b5e20]/25 shadow-md"
                          : "border-[#e4e7eb] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <InitialsBadge
                          name={item.name}
                          color={item.color}
                          logo={item.logo}
                          size={40}
                          textSize={13}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[11px] font-bold truncate"
                            style={{ color: item.color || "#19274a" }}
                          >
                            {item.name}
                          </p>
                          <span className="text-[8.5px] font-semibold text-[#4B1426] truncate block">
                            {item.role}
                          </span>
                          <span className="flex items-center gap-1 text-[8px] font-bold text-[#d26019] mt-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {item.location}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 rounded-[3px] px-1.5 py-0.5 text-[7.5px] font-bold ${
                            item.status === "Published"
                              ? "bg-[#e8f5e9] text-[#23714a]"
                              : item.status === "Pending Review"
                              ? "bg-[#fff8e1] text-[#b78103]"
                              : "bg-[#ffebee] text-[#c62828]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-2.5 text-[8.5px] font-medium text-[#475569] line-clamp-3 leading-relaxed italic bg-slate-50/70 p-2 rounded-[5px] border border-slate-100">
                        "{item.message}"
                      </p>

                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[8px]">
                        <div className="flex items-center gap-1">
                          <RatingStars value={item.rating} size={10} />
                          <span className="font-bold text-[#b45309]">{item.rating.toFixed(1)}</span>
                        </div>
                        <span className="font-semibold text-[#dc2626]">{item.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: TESTIMONIAL DETAILS & METRICS */}
          <aside className="space-y-[12px]">
            {/* CARD 1: TESTIMONIAL DETAILS CARD */}
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
                  Testimonial Details
                </h2>
                <ChevronDown className="h-[14px] w-[14px] rotate-180 text-[#59657a]" />
              </div>

              {selected ? (
                <div className="mt-[12px]">
                  {/* PREVIEW CONTAINER */}
                  <div className="relative flex flex-col items-center justify-center rounded-[8px] border border-[#e4e7eb] bg-[#fafbfc] p-4 shadow-inner">
                    <InitialsBadge
                      name={selected.name}
                      color={selected.color}
                      logo={selected.logo}
                      size={54}
                      textSize={18}
                    />
                    <p
                      className="mt-2.5 text-[12px] font-bold text-center"
                      style={{ color: selected.color || "#19274a" }}
                    >
                      {selected.name}
                    </p>
                    <p className="text-[9px] font-semibold text-[#4B1426] text-center">
                      {selected.role}
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#d26019]">
                      <MapPin className="h-3 w-3" />
                      <span>{selected.location}</span>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1">
                      <RatingStars value={selected.rating} size={11} />
                      <span className="text-[9px] font-bold text-[#b45309]">
                        {selected.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* QUOTE BOX */}
                  <div className="mt-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-[8.5px] font-medium leading-[1.45] text-[#334155] italic">
                    "{selected.message}"
                  </div>

                  {/* STATUS & COLOR PILL */}
                  <div className="mt-[10px] flex items-center justify-between gap-[8px]">
                    <span className="flex items-center gap-1.5 text-[8.5px] font-semibold text-[#475569]">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: selected.color || "#1b5e20" }}
                      />
                      Badge Theme
                    </span>
                    <span
                      className={`shrink-0 rounded-[4px] px-[8px] py-[2px] text-[8.5px] font-bold ${
                        selected.status === "Published"
                          ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                          : selected.status === "Pending Review"
                          ? "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
                          : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                      }`}
                    >
                      {selected.status}
                    </span>
                  </div>

                  {/* DETAILS LIST */}
                  <div className="mt-[12px] space-y-[7px] text-[9px]">
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Location:</span>
                      <span className="font-bold flex items-center gap-1 text-[#0f766e]">
                        <MapPin className="h-2.5 w-2.5 text-[#d26019]" />
                        {selected.location}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Rating:</span>
                      <span className="font-bold text-[#b45309]">
                        {selected.rating} / 5 Stars
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Added on:</span>
                      <span className="font-semibold" style={{ color: "#4B1426" }}>
                        {selected.date}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Added by:</span>
                      <span className="font-semibold" style={{ color: "#dc2626" }}>
                        {selected.author || getAdminDisplayName()}
                      </span>
                    </p>
                  </div>

                  {/* ACTIONS: EDIT, STATUS TOGGLE, DELETE */}
                  <div className="mt-[14px] flex items-center gap-2 border-t border-[#f0f2f5] pt-3">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selected)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] shadow-xs transition hover:bg-slate-50 cursor-pointer"
                    >
                      <Pencil className="h-3 w-3 text-blue-600" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const nextStatus: TestimonialStatus =
                          selected.status === "Published" ? "Hidden" : "Published";
                        handleStatusChange(selected.id, nextStatus);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] shadow-xs transition hover:bg-slate-50 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3 text-emerald-600" />
                      {selected.status === "Published" ? "Hide" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(selected)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-rose-200 bg-rose-50 py-1.5 text-[8.5px] font-bold text-rose-700 shadow-xs transition hover:bg-rose-100 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 text-rose-600" />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-[12px] flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2.5">
                    <MessageCircleMore className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#19274a]">No Testimonial Selected</p>
                  <p className="text-[8.5px] text-[#69758c] mt-1 max-w-[210px] leading-relaxed">
                    Select a testimonial from the table to view its full details and manage its status.
                  </p>
                </div>
              )}
            </section>
          </aside>
        </section>

        {/* ========================================================== */}
        {/* MODAL 1: ADD / EDIT TESTIMONIAL MODAL                      */}
        {/* ========================================================== */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
          }}
          title={isEditModalOpen ? "Edit Testimonial" : "Add New Testimonial"}
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95 cursor-pointer"
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
                onClick={handleSaveTestimonial}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{
                  background: "#16a34a",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
                }}
              >
                {isEditModalOpen ? "Save Changes" : "Create Testimonial"}
              </button>
            </>
          }
        >
          <div className="space-y-3.5">
            {/* NAME & ROLE / DESIGNATION GRID */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Reviewer Full Name"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Achaspati Kulwant or Dr. Meera Sharma"
              />
              <Input
                label="Role / Designation"
                required
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                placeholder="e.g. Chancellor, University of Patanjali"
              />
            </div>

            {/* LOCATION & STATUS GRID (Replaced Category with Location) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  label="Location"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Haridwar, New Delhi, Gujarat..."
                />
              </div>

              <div>
                <Label required>Status</Label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TestimonialStatus)}
                  className={`h-[38px] w-full cursor-pointer appearance-none rounded-[4px] px-[12px] pr-[28px] text-[11px] font-bold outline-none bg-no-repeat bg-[right_10px_center] shadow-xs transition ${
                    formStatus === "Published"
                      ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                      : formStatus === "Pending Review"
                      ? "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
                      : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="Published">Published (Visible on Home Carousel)</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Hidden">Hidden (Do not show)</option>
                </select>
              </div>
            </div>

            {/* INITIALS BADGE & LOGO UPLOAD IN ONE ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* LEFT: Initials Badge Preview & Theme Color */}
              <div className="rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-3 flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Initials Badge & Color</Label>
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider">
                      {formLogo ? "Logo Active" : `Badge: ${getInitials(formName) || "BO"}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Live Circle Badge */}
                    <div className="shrink-0 flex flex-col items-center">
                      <InitialsBadge
                        name={formName}
                        color={formColor}
                        logo={formLogo}
                        size={46}
                        textSize={15}
                      />
                    </div>

                    {/* Color presets */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[8.5px] font-semibold text-slate-600 mb-1">
                        <Palette className="h-2.5 w-2.5 text-[#23471d]" />
                        <span>Accent Color:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 items-center mb-1.5">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            type="button"
                            onClick={() => setFormColor(preset.value)}
                            className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                              formColor.toLowerCase() === preset.value.toLowerCase()
                                ? "border-slate-800 ring-2 ring-slate-400 scale-110"
                                : "border-white"
                            }`}
                            style={{ backgroundColor: preset.value }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                      <label className="inline-flex items-center gap-1 cursor-pointer border border-[#cbd5e1] rounded-[4px] px-1.5 py-0.5 bg-white text-[8.5px] font-medium text-slate-600 shadow-xs">
                        <span>Custom:</span>
                        <input
                          type="color"
                          value={formColor}
                          onChange={(e) => setFormColor(e.target.value)}
                          className="h-3.5 w-4 cursor-pointer border-none bg-transparent"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Logo / Photo (Optional) */}
              <div className="rounded-[6px] border border-[#e2e8f0] bg-white p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Logo / Photo (Optional)</Label>
                    {formLogo && (
                      <button
                        type="button"
                        onClick={() => setFormLogo("")}
                        className="text-[8.5px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        ✕ Remove (Use Initials)
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        disabled={isUploadingLogo}
                        onClick={() => logoFileInputRef.current?.click()}
                        className="inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-2.5 text-[9.5px] font-semibold text-[#1e293b] hover:bg-slate-100 cursor-pointer active:scale-95 shadow-xs disabled:opacity-50"
                      >
                        <Upload className={`h-3 w-3 text-emerald-600 ${isUploadingLogo ? "animate-spin" : ""}`} />
                        {isUploadingLogo ? "Uploading..." : "Upload"}
                      </button>

                      <input
                        type="text"
                        value={formLogo}
                        onChange={(e) => setFormLogo(e.target.value)}
                        placeholder="Or paste image URL..."
                        className="w-full h-[30px] rounded-[4px] border border-[#cbd5e1] px-2 text-[10px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#0284c7]"
                      />
                    </div>
                    <p className="text-[8px] text-slate-500 leading-tight">
                      Leave blank to auto-use First & Last name initials ({getInitials(formName) || "AK"}).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RATING SELECTION */}
            <div>
              <Label required>Rating (1 to 5 Stars)</Label>
              <div className="flex items-center gap-3 mt-1 p-2 rounded-[4px] border border-surface-border bg-surface-card">
                <div className="flex items-center gap-1.5 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormRating(s)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star
                        size={20}
                        strokeWidth={1.8}
                        className={
                          s <= formRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-300"
                        }
                      />
                    </button>
                  ))}
                </div>
                <span className="text-[12px] font-bold text-[#b45309]">
                  {formRating}.0 / 5.0 Stars
                </span>
              </div>
            </div>

            {/* TESTIMONIAL MESSAGE */}
            <div>
              <Textarea
                label="Testimonial Quote / Message"
                required
                rows={3}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Share the review, attendee experience or quote here..."
              />
            </div>
          </div>
        </Modal>

        {/* ========================================================== */}
        {/* MODAL 2: SETTINGS MODAL                                    */}
        {/* ========================================================== */}
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="Testimonial Display Settings"
          size="md"
          footer={
            <div className="flex w-full items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsModalOpen(false);
                  showSuccess("Settings saved successfully!");
                }}
                className="inline-flex h-[32px] items-center gap-1.5 px-[16px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{
                  background: "#16a34a",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
                }}
              >
                Done / Save
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-3.5 space-y-3">
              <h3 className="text-[12px] font-bold text-[#0f172a]">
                Live Carousel Display Rules
              </h3>

              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5">
                <div>
                  <p className="text-[11px] font-bold text-[#1e293b]">Auto-Publish New Testimonials</p>
                  <p className="text-[9px] text-[#64748b]">Automatically make newly created testimonials visible on the website</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="h-4 w-4 accent-[#0b6a3b] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#1e293b]">Min Rating For Carousel</p>
                  <p className="text-[9px] text-[#64748b]">Only show testimonials with this rating or higher</p>
                </div>
                <select
                  value={minRatingToDisplay}
                  onChange={(e) => setMinRatingToDisplay(e.target.value)}
                  className="h-[30px] rounded-[4px] border border-[#cbd5e1] bg-white px-2 text-[10px] font-bold text-[#1e293b] outline-none cursor-pointer"
                >
                  <option value="5.0">5.0 Stars only</option>
                  <option value="4.0">4.0 Stars & above</option>
                  <option value="3.0">3.0 Stars & above</option>
                  <option value="1.0">All ratings</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}
