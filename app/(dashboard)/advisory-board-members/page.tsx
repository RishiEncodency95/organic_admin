"use client";
import { getImageSizeError, showUploadError } from "@/lib/uploadLimit";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { getBackendUrl } from "@/lib/api";
import { Input, Label } from "@/components/ui/Input";
import typography from "../pages/PagesTypography.module.css";
import { useAppSelector } from "@/store/hooks";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  Grid,
  Image as ImageIcon,
  Layers,
  List,
  MapPin,
  MoreVertical,
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
  Users,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

// SweetAlert2 theme matching admin portal dark style
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

export interface AdvisoryMemberItem {
  id: number;
  _id: string;
  name: string;
  designation: string;
  organization: string;
  location: string;
  order: number;
  image: string;
  status: "Published" | "Draft";
  updatedAt: string;
  fileSize?: string;
  updatedBy?: string;
  websiteUrl?: string;
}

// Resolved at runtime from the actual page domain — not a build-time env var, which can
// end up baked in as "localhost" if the production build wasn't given its own .env.
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
  return `${dateStr}, ${timeStr}`;
};

const formatTimestampFrom = (val?: string) => {
  if (!val) return formatTimestamp();
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
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
  } catch {
    return val;
  }
};

const INITIAL_MEMBERS: AdvisoryMemberItem[] = [
  {
    id: 1,
    _id: "adv1",
    name: "Prof. Dr. G.S. Tomar",
    designation: "PRESIDENT",
    organization: "International President of Our Ayurveda Mission, National Vice-President Arogya Bharti.",
    location: "India",
    order: 1,
    image: "/advisory-board/tomar.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "946 KB",
    websiteUrl: "",
  },
  {
    id: 2,
    _id: "adv2",
    name: "Professor (Vd.) Pradeep Kumar Prajapati",
    designation: "DIRECTOR",
    organization: "All India Institute of Ayurveda (AIIA)",
    location: "India",
    order: 2,
    image: "/advisory-board/pradeep.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "77.2 KB",
    websiteUrl: "",
  },
  {
    id: 3,
    _id: "adv3",
    name: "Dr. Naresh Kumar Chhavania",
    designation: "PRESIDENT",
    organization: "IMA AYUS",
    location: "India",
    order: 3,
    image: "/advisory-board/naresh.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "63.3 KB",
    websiteUrl: "",
  },
  {
    id: 4,
    _id: "adv4",
    name: "Dr. Kamlesh Kumar Dwivedi",
    designation: "MEMBER OF THE BOARD OF AYURVEDA",
    organization: "National Commission for Indian System of Medicine (NCISM), Ministry of Ayush",
    location: "India",
    order: 4,
    image: "/advisory-board/kamlesh.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "163 KB",
    websiteUrl: "",
  },
  {
    id: 5,
    _id: "adv5",
    name: "Prof. (Dr.) Atul Babu Varshney",
    designation: "MEMBER OF THE BOARD OF AYURVEDA",
    organization: "National Commission for Indian System of Medicine (NCISM), Ministry of Ayush",
    location: "India",
    order: 5,
    image: "/advisory-board/atul.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "58.2 KB",
    websiteUrl: "",
  },
  {
    id: 6,
    _id: "adv6",
    name: "Dr. Sandeep Marwah",
    designation: "FOUNDER OF NOIDA FILM CITY",
    organization: "Marwah Studios",
    location: "India",
    order: 6,
    image: "/advisory-board/sandeep.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "313 KB",
    websiteUrl: "",
  },
  {
    id: 7,
    _id: "adv7",
    name: "ACHARYA SHRI JAGDISHJI MAHARAJ",
    designation: "FOUNDER OF NAMO GANGE TRUST",
    organization: "Namo Gange Trust",
    location: "India",
    order: 7,
    image: "/advisory-board/jagdish.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "56.7 KB",
    websiteUrl: "",
  },
  {
    id: 8,
    _id: "adv8",
    name: "Dr. D.N. Sharma",
    designation: "VICE PRESIDENT",
    organization: "International Naturopathy Organisation (INO)",
    location: "India",
    order: 8,
    image: "/advisory-board/dnsharma.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "372 KB",
    websiteUrl: "",
  },
  {
    id: 9,
    _id: "adv9",
    name: "Dr. Rohit Bhandari",
    designation: "FOUNDER & DIRECTOR",
    organization: "The Homeo Healers Homeopathy Worldwide",
    location: "India",
    order: 9,
    image: "/advisory-board/rohit.png",
    status: "Published",
    updatedAt: "17 Sept 2026, 03:25 PM",
    updatedBy: "Vansh Chaudhary",
    fileSize: "404 KB",
    websiteUrl: "",
  },
];

function AnimatedCounter({
  value,
  duration = 1200,
}: {
  value: string | number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState<string | number>(() => {
    const str = String(value);
    return str.match(/\d/) ? "0" : value;
  });
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const strVal = String(value);
    const numericMatch = strVal.match(/^([^\d.]*)([\d,.]+)(.*)$/);

    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const prefix = numericMatch[1];
    const rawNumberStr = numericMatch[2].replace(/,/g, "");
    const targetNum = parseFloat(rawNumberStr);
    const suffix = numericMatch[3];

    if (isNaN(targetNum)) {
      setDisplayValue(value);
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

export default function AdvisoryBoardMembersPage() {
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

  const [members, setMembers] = useState<AdvisoryMemberItem[]>(INITIAL_MEMBERS);
  const [tagline, setTagline] = useState("Our Ayurveda Mission");
  const [title, setTitle] = useState("Our Esteemed Advisory Board");
  const [headingSaved, setHeadingSaved] = useState(false);

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdvisoryMemberItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formOrganization, setFormOrganization] = useState("");
  const [formLocation, setFormLocation] = useState("India");
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState<"Published" | "Draft">("Published");
  const [formFileSize, setFormFileSize] = useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  // Load backend data on mount
  useEffect(() => {
    let isMounted = true;

    // Load Header
    const fetchHeader = async () => {
      try {
        let res = await fetch("/api/website/advisoryboardgrid", { cache: "no-store" }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${BACKEND_URL}/api/website/advisoryboardgrid`, { cache: "no-store" }).catch(() => null);
        }
        if (res && res.ok) {
          const json = await res.json();
          if (json.data) {
            if (json.data.tagline) setTagline(json.data.tagline);
            if (json.data.title) setTitle(json.data.title);
          }
        }
      } catch (err) {
        console.error("Failed to fetch advisory board grid header:", err);
      }
    };

    // Load Members
    const fetchMembers = async () => {
      try {
        let res = await fetch("/api/website/advisoryboardgridmember", { cache: "no-store" }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${BACKEND_URL}/api/website/advisoryboardgridmember`, { cache: "no-store" }).catch(() => null);
        }
        if (res && res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: AdvisoryMemberItem[] = json.data.map((item: any, idx: number) => ({
              id: idx + 1,
              _id: item._id || `adv_${idx + 1}`,
              name: item.name || "",
              designation: item.designation || "",
              organization: item.organization || "",
              location: item.location || "India",
              order: item.order ?? (idx + 1),
              image: item.image || "/advisory-board/tomar.png",
              status: item.status === "Draft" ? "Draft" : "Published",
              updatedAt: formatTimestampFrom(item.updatedAt),
              updatedBy: item.updatedBy || loggedInAdminName || "Vansh Chaudhary",
              fileSize: item.fileSize || "15.0 KB",
              websiteUrl: item.websiteUrl || "",
            })).sort((a: AdvisoryMemberItem, b: AdvisoryMemberItem) => a.order - b.order);

            if (isMounted) {
              setMembers(mapped);
              if (mapped.length > 0) {
                setSelectedId(mapped[0].id);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch advisory board members:", err);
      }
    };

    fetchHeader();
    fetchMembers();

    return () => {
      isMounted = false;
    };
  }, [loggedInAdminName]);

  // Selected item for right sidebar
  const selected = useMemo(() => {
    return members.find((x) => x.id === selectedId) || members[0] || INITIAL_MEMBERS[0];
  }, [members, selectedId]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return members.filter((item) => {
      if (statusFilter !== "All Status" && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesignation = item.designation.toLowerCase().includes(q);
        const matchOrg = item.organization.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        if (!matchName && !matchDesignation && !matchOrg && !matchLoc) {
          return false;
        }
      }
      return true;
    });
  }, [members, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // KPI Stats
  const statCards = useMemo(() => {
    const totalCount = members.length;
    const publishedCount = members.filter((m) => m.status === "Published").length;
    const draftCount = members.filter((m) => m.status === "Draft").length;
    const imageCount = members.filter((m) => Boolean(m.image)).length;
    const uniqueDesignations = new Set(members.map((m) => m.designation.trim()).filter(Boolean)).size;

    return [
      {
        title: "TOTAL MEMBERS",
        value: totalCount,
        suffix: "",
        icon: Users,
        tone: "emerald" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View full directory",
        onClick: () => {
          setStatusFilter("All Status");
          setSearchQuery("");
        },
      },
      {
        title: "PUBLISHED PROFILES",
        value: publishedCount,
        suffix: "",
        icon: Check,
        tone: "violet" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        footer: "View published profiles",
        onClick: () => {
          setStatusFilter("Published");
        },
      },
      {
        title: "DESIGNATIONS",
        value: uniqueDesignations,
        suffix: " Roles",
        icon: Layers,
        tone: "amber" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        footer: "Across board leadership",
        onClick: () => {
          setStatusFilter("All Status");
        },
      },
      {
        title: "PHOTO ASSETS",
        value: imageCount,
        suffix: "",
        icon: Tag,
        tone: "blue" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        footer: "View photo assets",
        onClick: () => {},
      },
      {
        title: "DRAFT / INACTIVE",
        value: draftCount,
        suffix: "",
        icon: Sparkles,
        tone: "rose" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
        borderColor: "#fecdd3",
        numColor: "#be123c",
        footer: "Review drafts",
        onClick: () => {
          setStatusFilter("Draft");
        },
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
        onClick: () => {
          window.open("http://localhost:3002/about/advisory_board_member", "_blank");
        },
      },
    ];
  }, [members]);

  // Save Header
  const handleSaveHeading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { tagline: tagline.trim(), title: title.trim() };
      let res = await fetch("/api/website/advisoryboardgrid", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${BACKEND_URL}/api/website/advisoryboardgrid`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      setHeadingSaved(true);
      showSuccess("Advisory Board section header updated successfully!");
      setTimeout(() => setHeadingSaved(false), 2500);
    } catch (err) {
      console.error("Failed to save header:", err);
      showError("Failed to update section header");
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName("");
    setFormDesignation("");
    setFormOrganization("");
    setFormLocation("India");
    setFormOrder(members.length + 1);
    setFormImage("");
    setFormStatus("Published");
    setFormFileSize("");
    setFormWebsiteUrl("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: AdvisoryMemberItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormDesignation(item.designation);
    setFormOrganization(item.organization);
    setFormLocation(item.location || "India");
    setFormOrder(item.order);
    setFormImage(item.image);
    setFormStatus(item.status);
    setFormFileSize(item.fileSize || "");
    setFormWebsiteUrl(item.websiteUrl || "");
    setIsModalOpen(true);
  };

  // Upload image helper
  const uploadImageFile = async (file: File): Promise<string> => {
    const sizeError = await getImageSizeError(file);
    if (sizeError) throw new Error(sizeError);
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "bharat-organic/advisory");

      let res = await fetch(`${BACKEND_URL}/api/uploads?folder=bharat-organic/advisory`, {
        method: "POST",
        body: formData,
      }).catch(() => null);
      let reachedServer = Boolean(res);

      if (!res) {
        res = await fetch(`/api/uploads?folder=bharat-organic/advisory`, {
          method: "POST",
          body: formData,
        }).catch(() => null);
        reachedServer = Boolean(res);
      }

      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        let finalUrl = json?.data?.url || json?.url || json?.data?.secure_url || json?.secure_url;
        if (finalUrl) {
          if (finalUrl.startsWith("http://res.cloudinary.com")) {
            finalUrl = finalUrl.replace("http://res.cloudinary.com", "https://res.cloudinary.com");
          }
          if (finalUrl.startsWith("http")) return finalUrl;
          return `${BACKEND_URL.replace(/\/$/, "")}${finalUrl.startsWith("/") ? "" : "/"}${finalUrl}`;
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

    // The server was genuinely unreachable (not a rejection) — fall back to embedding.
    console.warn("Could not reach the upload server; embedding image as a data URL instead.");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isReplace = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const activeAdmin = getAdminName();
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      const timeNow = formatTimestamp();

      let uploadedUrl: string;
      try {
        uploadedUrl = await uploadImageFile(file);
      } catch (err) {
        showUploadError(err);
        e.target.value = "";
        return;
      }

      if (isReplace && selected) {
        const updated = members.map((m) =>
          m.id === selected.id
            ? {
                ...m,
                image: uploadedUrl,
                fileSize: sizeStr,
                updatedAt: timeNow,
                updatedBy: activeAdmin,
              }
            : m
        );
        setMembers(updated);

        try {
          const payload = {
            image: uploadedUrl,
            fileSize: sizeStr,
            updatedAt: timeNow,
            updatedBy: activeAdmin,
          };
          let res = await fetch(`/api/website/advisoryboardgridmember/${selected._id || selected.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            await fetch(`${BACKEND_URL}/api/website/advisoryboardgridmember/${selected._id || selected.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          }
        } catch (err) {
          console.error("Error updating image in backend:", err);
        }

        showSuccess(`Photo for "${selected.name || "Member"}" updated by ${activeAdmin}!`);
      } else {
        setFormImage(uploadedUrl);
        setFormFileSize(sizeStr);
      }
    }
  };

  // Save Modal Form (Create or Edit)
  const handleSaveModal = async (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();

    const activeAdmin = getAdminName();
    const finalName = formName.trim() || "Advisory Board Member";
    const finalDesignation = formDesignation.trim() || "BOARD MEMBER";
    const finalOrganization = formOrganization.trim();
    const finalLocation = formLocation.trim() || "India";
    const finalImage = formImage.trim() || "/advisory-board/tomar.png";
    const finalOrder = Number(formOrder) || (editingItem ? editingItem.order : members.length + 1);
    const timeNow = formatTimestamp();

    if (editingItem) {
      const updatedList = members
        .map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: finalName,
                designation: finalDesignation,
                organization: finalOrganization,
                location: finalLocation,
                order: finalOrder,
                image: finalImage,
                status: formStatus,
                websiteUrl: formWebsiteUrl.trim(),
                updatedAt: timeNow,
                updatedBy: activeAdmin,
                fileSize: formFileSize || item.fileSize || "15.0 KB",
              }
            : item
        )
        .sort((a, b) => a.order - b.order);

      setMembers(updatedList);

      try {
        const payload = {
          name: finalName,
          designation: finalDesignation,
          organization: finalOrganization,
          location: finalLocation,
          order: finalOrder,
          image: finalImage,
          status: formStatus,
          websiteUrl: formWebsiteUrl.trim(),
          updatedAt: timeNow,
          updatedBy: activeAdmin,
          fileSize: formFileSize || editingItem.fileSize || "15.0 KB",
        };

        let res = await fetch(`/api/website/advisoryboardgridmember/${editingItem._id || editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetch(`${BACKEND_URL}/api/website/advisoryboardgridmember/${editingItem._id || editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch (err) {
        console.error("Error updating member in backend:", err);
      }

      showSuccess(`Advisory Member "${finalName}" updated successfully!`);
    } else {
      // Create new
      const newId = members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1;
      let realBackendId = `adv_${Date.now()}`;

      try {
        const payload = {
          name: finalName,
          designation: finalDesignation,
          organization: finalOrganization,
          location: finalLocation,
          order: finalOrder,
          image: finalImage,
          status: formStatus,
          websiteUrl: formWebsiteUrl.trim(),
          updatedAt: timeNow,
          updatedBy: activeAdmin,
          fileSize: formFileSize || "15.0 KB",
        };

        let res = await fetch(`/api/website/advisoryboardgridmember`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          res = await fetch(`${BACKEND_URL}/api/website/advisoryboardgridmember`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        if (res && res.ok) {
          const json = await res.json();
          if (json.data && json.data._id) {
            realBackendId = json.data._id;
          }
        }
      } catch (err) {
        console.error("Error creating member in backend:", err);
      }

      const newItem: AdvisoryMemberItem = {
        id: newId,
        _id: realBackendId,
        name: finalName,
        designation: finalDesignation,
        organization: finalOrganization,
        location: finalLocation,
        order: finalOrder,
        image: finalImage,
        status: formStatus,
        websiteUrl: formWebsiteUrl.trim(),
        updatedAt: timeNow,
        updatedBy: activeAdmin,
        fileSize: formFileSize || "15.0 KB",
      };

      const updatedList = [...members, newItem].sort((a, b) => a.order - b.order);
      setMembers(updatedList);
      setSelectedId(newId);

      showSuccess(`New Advisory Member "${finalName}" added successfully!`);
    }

    setIsModalOpen(false);
  };

  // Delete Member
  const handleDelete = async (item: AdvisoryMemberItem) => {
    const result = await Swal.fire({
      title: "Delete Member?",
      html: `<p style="color:#e2e8f0;font-size:0.9rem;">Are you sure you want to remove <strong>${item.name || "this member"}</strong> from the advisory board?<br/>This action cannot be undone.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "No, Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#374151",
    });

    if (!result.isConfirmed) return;

    const updated = members.filter((x) => x.id !== item.id);
    setMembers(updated);
    if (selectedId === item.id && updated.length > 0) {
      setSelectedId(updated[0].id);
    }

    try {
      let res = await fetch(`/api/website/advisoryboardgridmember/${item._id || item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        await fetch(`${BACKEND_URL}/api/website/advisoryboardgridmember/${item._id || item.id}`, {
          method: "DELETE",
        });
      }
    } catch (err) {
      console.error("Error deleting member in backend:", err);
    }

    showSuccess(`"${item.name || "Member"}" removed from Advisory Board.`);
  };

  // Status Change Toggle
  const handleStatusChange = async (id: number, newStatus: "Published" | "Draft") => {
    const activeAdmin = getAdminName();
    const timeNow = formatTimestamp();
    const target = members.find((x) => x.id === id);

    const updated = members.map((m) =>
      m.id === id
        ? {
            ...m,
            status: newStatus,
            updatedAt: timeNow,
            updatedBy: activeAdmin,
          }
        : m
    );
    setMembers(updated);

    if (target) {
      try {
        const payload = { status: newStatus, updatedAt: timeNow, updatedBy: activeAdmin };
        let res = await fetch(`/api/website/advisoryboardgridmember/${target._id || target.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetch(`${BACKEND_URL}/api/website/advisoryboardgridmember/${target._id || target.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch (err) {
        console.error("Error updating status in backend:", err);
      }
    }

    showSuccess(`Status updated to "${newStatus}" for ${target?.name || "Member"}`);
  };

  // Toggle Select All
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
    setSearchQuery("");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* TOP HEADING — Matching Exhibitor List & Staff Page Style */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Advisory Board Members
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Manage and organize esteemed advisory board leadership, designations, and public showcase directory.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <a
              href="http://localhost:3002/about/advisory_board_member"
              target="_blank"
              rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm"
            >
              <ExternalLink
                className="h-[12px] w-[12px] text-[#ea580c]"
                strokeWidth={1.7}
              />
              View on Website
            </a>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d]"
            >
              <Plus
                className="h-[12px] w-[12px]"
                strokeWidth={1.7}
              />
              Add New Member
            </button>
          </div>
        </div>

        {/* METRIC STATS CARDS (Exact Trusted Leaders & Exhibitor KPI Style) */}
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

        {/* SECTION HEADER EDIT BAR (Heading & Subheading Settings) */}
        <section className="mt-[14px] rounded-[6px] border border-[#cbe2fc] bg-[#f0f7ff] p-[12px] px-[14px]">
          <form onSubmit={handleSaveHeading} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
            {/* Title Info */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[5px] bg-[#0284c7] text-white">
                <Settings className="h-[16px] w-[16px]" />
              </span>
              <div>
                <h2 className="text-[11.5px] font-bold text-[#0369a1]">
                  Advisory Board Showcase Section Content
                </h2>
                <p className="text-[9px] font-medium text-[#52637a]">
                  Changes here directly update the title and subtitle on the live website advisory board section.
                </p>
              </div>
            </div>

            {/* Inputs + Button Container */}
            <div className="flex flex-1 items-end justify-end gap-2 min-w-0">
              <div className="flex-1 min-w-[130px] max-w-[200px]">
                <label className="mb-0.5 block text-[8px] font-bold uppercase tracking-wider text-[#34445f]">
                  Tagline / Sub Heading
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Our Ayurveda Mission"
                  className="h-[32px] w-full rounded-[4px] border border-[#cbd8d1] bg-white px-2 text-[10px] font-semibold text-[#142347] outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="flex-1 min-w-[150px] max-w-[240px]">
                <label className="mb-0.5 block text-[8px] font-bold uppercase tracking-wider text-[#34445f]">
                  Section Heading / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Our Esteemed Advisory Board"
                  className="h-[32px] w-full rounded-[4px] border border-[#cbd8d1] bg-white px-2 text-[10px] font-semibold text-[#142347] outline-none focus:border-[#0284c7]"
                />
              </div>

              <button
                type="submit"
                className="h-[32px] shrink-0 inline-flex items-center justify-center gap-1 rounded-[4px] bg-[#0284c7] px-3.5 text-[9.5px] font-bold text-white transition hover:bg-[#0369a1]"
              >
                {headingSaved ? <Check className="h-3 w-3 text-emerald-200" /> : null}
                {headingSaved ? "Saved!" : "Update Header"}
              </button>
            </div>
          </form>
        </section>

        {/* MAIN SPLIT CONTENT */}
        <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT COLUMN: FILTERS + TABLE / GRID */}
          <div className="min-w-0 overflow-hidden">
            {/* SEARCH & CONTROLS */}
            <div className="flex flex-wrap items-center gap-[10px]">
              <label className="relative min-w-[200px] flex-1">
                <Search className="absolute right-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#5d6b84]" />
                <input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search member by name, role, or organization..."
                  className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[14px] pr-[40px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] min-w-[120px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
              </select>

              {/* VIEW SWITCHER */}
              <div className="flex h-[40px] items-center rounded-[6px] border border-[#dfe4e8] bg-white p-1">
                <button
                  type="button"
                  title="Table View"
                  onClick={() => setViewMode("table")}
                  className={`grid h-[30px] w-[30px] place-items-center rounded-[4px] ${
                    viewMode === "table" ? "bg-[#075b33] text-white" : "text-[#586782] hover:bg-slate-100"
                  }`}
                >
                  <List className="h-[14px] w-[14px]" />
                </button>
                <button
                  type="button"
                  title="Grid View"
                  onClick={() => setViewMode("grid")}
                  className={`grid h-[30px] w-[30px] place-items-center rounded-[4px] ${
                    viewMode === "grid" ? "bg-[#075b33] text-white" : "text-[#586782] hover:bg-slate-100"
                  }`}
                >
                  <Grid className="h-[14px] w-[14px]" />
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

            {/* DATA VIEW: TABLE */}
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
                          Advisory Member
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
                          <td colSpan={6} className="py-12 text-center text-xs font-medium text-slate-500">
                            No advisory members match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((item) => {
                          const isCurrent = selectedId === item.id;
                          const adminName = item.updatedBy || loggedInAdminName || "Vansh Chaudhary";
                          const formattedDate = item.updatedAt && (item.updatedAt.includes(":") || item.updatedAt.includes("AM") || item.updatedAt.includes("PM"))
                            ? item.updatedAt
                            : `${item.updatedAt || "17 Sept 2026"}, 03:25 PM`;

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
                                  #{item.order}
                                </span>
                              </td>

                              <td className="px-[12px] py-[8px]">
                                <div className="flex min-w-[210px] items-center gap-[10px]">
                                  <div className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e4e7eb] bg-slate-50 shadow-xs">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="h-full w-full object-cover object-top"
                                    />
                                  </div>
                                  <div className="min-w-0 overflow-hidden">
                                    <span className="truncate text-[9px] font-bold text-[#4B1426] block">
                                      {item.name}
                                    </span>
                                    <span className="mt-[2px] inline-block rounded-[3px] bg-[#f0f4f8] px-[5px] py-[1px] font-mono text-[7px] font-semibold text-[#233D4D]">
                                      {item.fileSize || "15.0 KB"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* UPDATED BY COLUMN */}
                              <td className="px-[12px] py-[8px] max-w-[220px]">
                                <div className="flex flex-col">
                                  <span className="text-[8.5px] font-semibold text-[#dc2626]">
                                    {adminName}
                                  </span>
                                  <span className="text-[7.5px] font-medium text-[#64748b]">
                                    {formattedDate}
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
                                    handleStatusChange(item.id, e.target.value as "Published" | "Draft");
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
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_3px_10px_rgba(249,115,22,0.25)] hover:scale-105 active:scale-95"
                                  >
                                    <Eye className="h-[12px] w-[12px] text-orange-600" />
                                  </button>

                                  {/* Edit */}
                                  <button
                                    type="button"
                                    title="Edit Member"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEdit(item);
                                    }}
                                    className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-400/30 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95"
                                  >
                                    <Pencil className="h-[12px] w-[12px] text-blue-600" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    title="Delete Member"
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

                {/* Table Footer Stats & Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2563eb]">
                      Total Members: <strong className="font-bold text-[#1d4ed8]">{filteredRows.length}</strong>
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
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Previous Page"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`flex h-[22px] min-w-[22px] px-1.5 items-center justify-center rounded-[4px] border text-[8px] font-bold transition ${
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
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
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
                      className="ml-2 h-[22px] rounded-[4px] border border-[#d8dce2] bg-white px-[6px] text-[8px] font-semibold text-[#334155] outline-none"
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>All / page</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* GRID VIEW */
              <div className="mt-[12px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginatedRows.map((item) => {
                  const isCurrent = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`group relative flex flex-col rounded-[10px] border bg-white p-3 shadow-sm transition-all cursor-pointer ${
                        isCurrent
                          ? "border-[#075b33] ring-2 ring-[#075b33]/20"
                          : "border-[#e4e7eb] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-slate-50">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[11px] font-bold text-[#19274a]">
                            {item.name}
                          </h3>
                          <span className="mt-1 inline-block rounded-[3px] bg-[#f0f4f8] px-[5px] py-[1px] font-mono text-[7px] font-semibold text-[#233D4D]">
                            {item.fileSize || "15.0 KB"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2 text-[8px] text-gray-400">
                        <span>Order: #{item.order}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 font-bold ${
                            item.status === "Published" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: MEMBER DETAILS */}
          <aside className="space-y-[12px]">
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
                  Member Details
                </h2>
                <ChevronDown className="h-[14px] w-[14px] rotate-180 text-[#59657a]" />
              </div>

              <div className="mt-[12px]">
                {/* PHOTO PREVIEW */}
                <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden rounded-[8px] border border-[#e4e7eb] bg-slate-50 p-2 shadow-inner">
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="max-h-[150px] w-auto max-w-full rounded object-contain"
                  />
                </div>

                {/* NAME AND STATUS */}
                <div className="mt-[12px] flex items-center justify-between gap-[8px]">
                  <p className="truncate text-[11px] font-bold text-[#19274a]">
                    {selected.name}
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
                    <span className="font-semibold text-[#69758c]">Designation:</span>{" "}
                    <span className="font-bold text-[#23471d]">{selected.designation}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Organization:</span>{" "}
                    <span className="font-medium text-[#142347]">{selected.organization || "—"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Location:</span>{" "}
                    <span className="font-semibold text-[#ea580c]">{selected.location || "India"}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Display Order:</span>{" "}
                    <span className="font-bold" style={{ color: "#006199" }}>Position #{selected.order}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Updated on:</span>{" "}
                    <span className="font-semibold" style={{ color: "#4B1426" }}>
                      {selected.updatedAt && (selected.updatedAt.includes(":") || selected.updatedAt.includes("AM") || selected.updatedAt.includes("PM"))
                        ? selected.updatedAt
                        : `${selected.updatedAt || "17 Sept 2026"}, 03:25 PM`}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Updated by:</span>{" "}
                    <span className="font-semibold text-[#dc2626]">
                      {selected.updatedBy || loggedInAdminName || "Vansh Chaudhary"}
                    </span>
                  </p>
                </div>

                {/* ACTION BUTTONS (Edit / Replace / Delete) */}
                <div className="mt-[14px] grid grid-cols-3 gap-[7px]">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selected)}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-[#e0e4e8] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                  >
                    <Pencil className="h-[12px] w-[12px] text-blue-600" />
                    Edit
                  </button>

                  <input
                    type="file"
                    ref={replaceFileRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, true)}
                  />

                  <button
                    type="button"
                    onClick={() => replaceFileRef.current?.click()}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-[#e0e4e8] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                  >
                    <RefreshCw className="h-[12px] w-[12px] text-orange-600" />
                    Replace
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-red-400/30 bg-red-500/10 text-[8.5px] font-bold text-red-600 transition-all hover:bg-red-500/20 hover:border-red-400/50 active:scale-95"
                  >
                    <Trash2 className="h-[12px] w-[12px] text-red-600" />
                    Delete
                  </button>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS CARD */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[12px] font-bold text-[#19274a]">
                Quick Actions
              </h2>

              <div className="mt-[10px] grid grid-cols-2 gap-[8px]">
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex h-[36px] items-center justify-center gap-[7px] rounded-[5px] border border-[#e2e6ea] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                >
                  <Plus className="h-[13px] w-[13px] text-[#075b33]" />
                  Add Member
                </button>

                <a
                  href="http://localhost:3002/about/advisory_board_member"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-[36px] items-center justify-center gap-[7px] rounded-[5px] border border-[#e2e6ea] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50"
                >
                  <Globe className="h-[13px] w-[13px] text-[#075b33]" />
                  Live Preview
                </a>
              </div>
            </section>
          </aside>
        </section>

        {/* MODAL: ADD / EDIT MEMBER */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Advisory Member" : "New Advisory Member"}
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                onClick={() => handleSaveModal()}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{
                  background: "#16a34a",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
                }}
              >
                {editingItem ? "Save Changes" : "Create Member"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Member Name"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Prof. Dr. G.S. Tomar"
            />

            <Input
              label="Designation / Role"
              required
              value={formDesignation}
              onChange={(e) => setFormDesignation(e.target.value)}
              placeholder="e.g. PRESIDENT or DIRECTOR"
            />

            <Input
              label="Organization / Institute"
              value={formOrganization}
              onChange={(e) => setFormOrganization(e.target.value)}
              placeholder="e.g. All India Institute of Ayurveda (AIIA)"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Country / Location"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. India"
              />

              <Input
                label="Display Order #"
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as "Published" | "Draft")}
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

            <div>
              <Label required>Member Portrait Photo</Label>
              <div className="flex gap-3 items-center">
                <div className="relative flex h-[64px] w-[80px] shrink-0 items-center justify-center overflow-hidden border border-surface-border bg-surface-card p-1 shadow-xs">
                  {formImage ? (
                    <img src={formImage} alt="Member Photo" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Image URL or upload local file below"
                    className="w-full border border-surface-border bg-surface-card px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted transition-all hover:border-[#FF9D50] focus:border-[#FF9D50] focus:outline-none [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
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
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 text-slate-600" />
                          Choose Local Image
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Profile URL (Optional)"
              value={formWebsiteUrl}
              onChange={(e) => setFormWebsiteUrl(e.target.value)}
              placeholder="e.g. https://aiia.gov.in/profile"
            />
          </div>
        </Modal>
      </div>
    </main>
  );
}
