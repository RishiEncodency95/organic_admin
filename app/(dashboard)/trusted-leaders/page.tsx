"use client";
import { getImageSizeError, showUploadError } from "@/lib/uploadLimit";

import { useMemo, useRef, useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import typography from "../pages/PagesTypography.module.css";
import { useAppSelector } from "@/store/hooks";
import { getBackendUrl } from "@/lib/api";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Grid,
  Image as ImageIcon,
  Layers,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  PartnerLogoItem,
  PartnersAndBrandsData,
  CATEGORY_KEYS,
  trustedLeadersApi,
} from "@/lib/trustedLeadersApi";

// SweetAlert2 notification setup
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

const CATEGORIES = [
  "ALL",
  "TRUSTED BY INDUSTRY LEADERS",
  "Knowledge Partners",
  "Wellness Partners",
  "Supporting Assoc.",
  "EMERGING ORGANIC BRANDS",
] as const;

type PartnerCategory = (typeof CATEGORIES)[number];

const CATEGORY_STYLES: Record<string, { badge: string; pill: string }> = {
  "TRUSTED BY INDUSTRY LEADERS": { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", pill: "bg-emerald-600 text-white" },
  "Knowledge Partners": { badge: "bg-blue-50 text-blue-700 border-blue-200", pill: "bg-blue-600 text-white" },
  "Wellness Partners": { badge: "bg-amber-50 text-amber-700 border-amber-200", pill: "bg-amber-600 text-white" },
  "Supporting Assoc.": { badge: "bg-purple-50 text-purple-700 border-purple-200", pill: "bg-purple-600 text-white" },
  "EMERGING ORGANIC BRANDS": { badge: "bg-rose-50 text-rose-700 border-rose-200", pill: "bg-rose-600 text-white" },
};

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
} as const;

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

export default function TrustedLeadersPage() {
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

  const [partnersData, setPartnersData] = useState<PartnersAndBrandsData>({
    industryLeadersLogos: [],
    knowledgeLogos: [],
    wellnessLogos: [],
    supportingLogos: [],
    emergingBrandsLogos: [],
  });

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PartnerCategory>("ALL");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerLogoItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<string>("TRUSTED BY INDUSTRY LEADERS");
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formLogo, setFormLogo] = useState("");
  const [formAltText, setFormAltText] = useState("");
  const [formStatus, setFormStatus] = useState<"Published" | "Draft">("Published");
  const [formFileSize, setFormFileSize] = useState("35.0 KB");
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  // Load from backend API and local storage
  const loadData = async () => {
    try {
      const savedData = localStorage.getItem("bharat_partners_brands_data");
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed && typeof parsed === "object") {
            setPartnersData(parsed);
          }
        } catch {}
      }

      const data = await trustedLeadersApi.get();
      if (data) {
        setPartnersData(data);
        try {
          localStorage.setItem("bharat_partners_brands_data", JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.error("Error loading partners:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save changes helper
  const saveToBackend = async (newData: PartnersAndBrandsData) => {
    setPartnersData(newData);
    try {
      localStorage.setItem("bharat_partners_brands_data", JSON.stringify(newData));
    } catch {}
    const success = await trustedLeadersApi.update(newData);
    if (!success) {
      showError("Could not sync changes to server.");
    }
  };

  // Flatten all categories into a single combined array for filtering and display
  const allPartnersList = useMemo(() => {
    const list: PartnerLogoItem[] = [];

    (partnersData.industryLeadersLogos || []).forEach((item, idx) => {
      list.push({
        ...item,
        category: "TRUSTED BY INDUSTRY LEADERS",
        order: typeof item.order === "number" ? item.order : idx + 1,
        updatedBy: item.updatedBy || loggedInAdminName,
        updatedAt: item.updatedAt || "12 Sept 2026, 4:22 PM",
        fileSize: item.fileSize || "34.9 KB",
      });
    });

    (partnersData.knowledgeLogos || []).forEach((item, idx) => {
      list.push({
        ...item,
        category: "Knowledge Partners",
        order: typeof item.order === "number" ? item.order : idx + 1,
        updatedBy: item.updatedBy || loggedInAdminName,
        updatedAt: item.updatedAt || "12 Sept 2026, 3:30 PM",
        fileSize: item.fileSize || "34.9 KB",
      });
    });

    (partnersData.wellnessLogos || []).forEach((item, idx) => {
      list.push({
        ...item,
        category: "Wellness Partners",
        order: typeof item.order === "number" ? item.order : idx + 1,
        updatedBy: item.updatedBy || loggedInAdminName,
        updatedAt: item.updatedAt || "12 Sept 2026, 3:30 PM",
        fileSize: item.fileSize || "66.0 KB",
      });
    });

    (partnersData.supportingLogos || []).forEach((item, idx) => {
      list.push({
        ...item,
        category: "Supporting Assoc.",
        order: typeof item.order === "number" ? item.order : idx + 1,
        updatedBy: item.updatedBy || loggedInAdminName,
        updatedAt: item.updatedAt || "12 Sept 2026, 3:30 PM",
        fileSize: item.fileSize || "35.9 KB",
      });
    });

    (partnersData.emergingBrandsLogos || []).forEach((item, idx) => {
      list.push({
        ...item,
        category: "EMERGING ORGANIC BRANDS",
        order: typeof item.order === "number" ? item.order : idx + 1,
        updatedBy: item.updatedBy || loggedInAdminName,
        updatedAt: item.updatedAt || "12 Sept 2026, 3:30 PM",
        fileSize: item.fileSize || "65.1 KB",
      });
    });

    return list.sort((a, b) => a.order - b.order);
  }, [partnersData, loggedInAdminName]);

  // Set initial selected item when list loads
  useEffect(() => {
    if (allPartnersList.length > 0 && !selectedId) {
      setSelectedId(allPartnersList[0].id);
    }
  }, [allPartnersList, selectedId]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    return {
      ALL: allPartnersList.length,
      "TRUSTED BY INDUSTRY LEADERS": (partnersData.industryLeadersLogos || []).length,
      "Knowledge Partners": (partnersData.knowledgeLogos || []).length,
      "Wellness Partners": (partnersData.wellnessLogos || []).length,
      "Supporting Assoc.": (partnersData.supportingLogos || []).length,
      "EMERGING ORGANIC BRANDS": (partnersData.emergingBrandsLogos || []).length,
    };
  }, [allPartnersList, partnersData]);

  // Statistics
  const totalCount = allPartnersList.length;
  const publishedCount = useMemo(
    () => allPartnersList.filter((x) => x.status === "Published").length,
    [allPartnersList]
  );
  const draftCount = useMemo(
    () => allPartnersList.filter((x) => x.status === "Draft").length,
    [allPartnersList]
  );
  const altConfiguredCount = useMemo(
    () => allPartnersList.filter((x) => x.imageAlt && x.imageAlt.trim().length > 0).length,
    [allPartnersList]
  );

  // 6 Metric Stat Cards
  const statCards = useMemo(
    () => [
      {
        title: "TOTAL PARTNERS",
        value: totalCount,
        suffix: "",
        icon: Building2,
        tone: "emerald" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View full directory",
        onClick: () => {
          setStatusFilter("All Status");
          setSelectedCategory("ALL");
        },
      },
      {
        title: "PUBLISHED BRANDS",
        value: publishedCount,
        suffix: "",
        icon: Check,
        tone: "violet" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        footer: "View published brands",
        onClick: () => setStatusFilter("Published"),
      },
      {
        title: "CATEGORIES",
        value: 5,
        suffix: " Rails",
        icon: Layers,
        tone: "amber" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        footer: "Across 5 marquee rails",
        onClick: () => setSelectedCategory("ALL"),
      },
      {
        title: "SEO ALT TAGS",
        value: altConfiguredCount,
        suffix: "",
        icon: Tag,
        tone: "blue" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        footer: "View SEO tags",
        onClick: () => setStatusFilter("All Status"),
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
        onClick: () => window.open("http://localhost:3002/", "_blank"),
      },
    ],
    [totalCount, publishedCount, draftCount, altConfiguredCount]
  );

  // Filtered rows
  const filteredRows = useMemo(() => {
    const list = allPartnersList.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.imageAlt && item.imageAlt.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "All Status" || item.status === statusFilter;

      return matchesCategory && matchesSearch && matchesStatus;
    });
    return list.sort((a, b) => a.order - b.order);
  }, [allPartnersList, selectedCategory, searchQuery, statusFilter]);

  // Paginated rows
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Selected item for right details drawer
  const selected = useMemo(() => {
    return allPartnersList.find((item) => item.id === selectedId) || allPartnersList[0] || {
      id: "demo-1",
      name: "Industry Partner 1",
      category: "TRUSTED BY INDUSTRY LEADERS",
      order: 1,
      image: "/partners/logo1.png",
      imageAlt: "Industry Partner 1 Logo",
      status: "Published" as const,
      updatedAt: "12 Sept 2026, 4:22 PM",
      updatedBy: "Vansh Chaudhary",
      fileSize: "34.9 KB",
    };
  }, [allPartnersList, selectedId]);

  // Upload file helper
  const uploadImageFile = async (file: File): Promise<string> => {
    const sizeError = await getImageSizeError(file);
    if (sizeError) throw new Error(sizeError);
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "bharat-organic/partners");

      const backendUrl = getBackendUrl();
      let res = await fetch(`${backendUrl}/api/uploads?folder=bharat-organic/partners`, {
        method: "POST",
        body: formData,
      }).catch(() => null);
      let reachedServer = Boolean(res);

      if (!res) {
        res = await fetch(`/api/uploads?folder=bharat-organic/partners`, {
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
          return `${backendUrl.replace(/\/$/, "")}${finalUrl.startsWith("/") ? "" : "/"}${finalUrl}`;
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
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload in Modal or Quick Replace
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isReplace = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const activeAdmin = loggedInAdminName;
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
        const targetKey = CATEGORY_KEYS[selected.category];
        if (!targetKey) return;

        const currentList = [...(partnersData[targetKey] || [])];
        const updatedList = currentList.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                image: uploadedUrl,
                fileSize: sizeStr,
                updatedAt: timeNow,
                updatedBy: activeAdmin,
              }
            : item
        );

        const updatedData = {
          ...partnersData,
          [targetKey]: updatedList,
        };

        await saveToBackend(updatedData);
        showSuccess(`Logo for "${selected.name || "Partner"}" updated by ${activeAdmin}!`);
      } else {
        setFormLogo(uploadedUrl);
        setFormFileSize(sizeStr);
        if (!formAltText) {
          setFormAltText(`${formName || "Partner"} Brand Logo - Bharat Organic Expo`);
        }
      }
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName("");
    const defaultCat = selectedCategory !== "ALL" ? selectedCategory : "TRUSTED BY INDUSTRY LEADERS";
    setFormCategory(defaultCat);
    const existingCount = allPartnersList.filter((x) => x.category === defaultCat).length;
    setFormOrder(existingCount + 1);
    setFormLogo("/partners/logo1.png");
    setFormAltText("Brand Partner Logo - Bharat Organic Expo");
    setFormStatus("Published");
    setFormFileSize("35.0 KB");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: PartnerLogoItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormOrder(item.order);
    setFormLogo(item.image);
    setFormAltText(item.imageAlt);
    setFormStatus(item.status);
    setFormFileSize(item.fileSize || "35.0 KB");
    setIsModalOpen(true);
  };

  // Save Modal Form
  const handleSaveModal = async (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();

    const activeAdmin = loggedInAdminName;
    const finalName = formName.trim() || "Brand Partner";
    const finalLogo = formLogo.trim() || "/partners/logo1.png";
    const finalAlt = formAltText.trim() || `${finalName} Brand Logo - Bharat Organic Expo`;
    const finalOrder = Number(formOrder) || (editingItem ? editingItem.order : allPartnersList.length + 1);
    const timeNow = formatTimestamp();

    const targetKey = CATEGORY_KEYS[formCategory];
    if (!targetKey) {
      showError("Invalid category selected.");
      return;
    }

    if (editingItem) {
      const oldKey = CATEGORY_KEYS[editingItem.category];
      const updatedData = { ...partnersData };

      if (oldKey === targetKey) {
        const list = [...(partnersData[targetKey] || [])];
        const idx = list.findIndex((x) => x.id === editingItem.id);
        if (idx !== -1) {
          list[idx] = {
            ...list[idx],
            name: finalName,
            category: formCategory,
            image: finalLogo,
            imageAlt: finalAlt,
            order: finalOrder,
            status: formStatus,
            fileSize: formFileSize || editingItem.fileSize || "35.0 KB",
            updatedAt: timeNow,
            updatedBy: activeAdmin,
          };
          updatedData[targetKey] = list;
        }
      } else {
        // Moved across categories
        if (oldKey) {
          updatedData[oldKey] = (partnersData[oldKey] || []).filter((x) => x.id !== editingItem.id);
        }
        const targetList = [...(partnersData[targetKey] || [])];
        targetList.push({
          id: editingItem.id,
          name: finalName,
          category: formCategory,
          image: finalLogo,
          imageAlt: finalAlt,
          order: finalOrder,
          status: formStatus,
          fileSize: formFileSize || editingItem.fileSize || "35.0 KB",
          updatedAt: timeNow,
          updatedBy: activeAdmin,
        });
        updatedData[targetKey] = targetList;
      }

      await saveToBackend(updatedData);
      showSuccess(`Partner "${finalName}" updated successfully!`);
    } else {
      const newId = `partner-${Date.now()}`;
      const newItem: PartnerLogoItem = {
        id: newId,
        name: finalName,
        category: formCategory,
        image: finalLogo,
        imageAlt: finalAlt,
        order: finalOrder,
        status: formStatus,
        fileSize: formFileSize || "35.0 KB",
        updatedAt: timeNow,
        updatedBy: activeAdmin,
      };

      const targetList = [...(partnersData[targetKey] || []), newItem];
      const updatedData = {
        ...partnersData,
        [targetKey]: targetList,
      };

      await saveToBackend(updatedData);
      setSelectedId(newId);
      showSuccess(`New Partner "${finalName}" added to ${formCategory}!`);
    }

    setIsModalOpen(false);
  };

  // Delete Partner with SweetAlert2
  const handleDelete = async (item: PartnerLogoItem) => {
    const result = await Swal.fire({
      title: "Delete Partner?",
      html: `<p style="color:#e2e8f0;font-size:0.9rem;">Are you sure you want to remove <strong>${item.name || "this partner"}</strong> from the directory?<br/>This action cannot be undone.</p>`,
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

    const targetKey = CATEGORY_KEYS[item.category];
    if (!targetKey) return;

    const currentList = [...(partnersData[targetKey] || [])];
    const updatedList = currentList.filter((x) => x.id !== item.id);
    const updatedData = {
      ...partnersData,
      [targetKey]: updatedList,
    };

    await saveToBackend(updatedData);

    if (selectedId === item.id) {
      const remaining = allPartnersList.filter((x) => x.id !== item.id);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      }
    }

    showSuccess(`"${item.name || "Partner"}" removed from directory.`);
  };

  // Quick Status Change
  const handleStatusChange = async (item: PartnerLogoItem, newStatus: "Published" | "Draft") => {
    const activeAdmin = loggedInAdminName;
    const timeNow = formatTimestamp();
    const targetKey = CATEGORY_KEYS[item.category];
    if (!targetKey) return;

    const currentList = [...(partnersData[targetKey] || [])];
    const updatedList = currentList.map((x) =>
      x.id === item.id
        ? {
            ...x,
            status: newStatus,
            updatedAt: timeNow,
            updatedBy: activeAdmin,
          }
        : x
    );

    const updatedData = {
      ...partnersData,
      [targetKey]: updatedList,
    };

    await saveToBackend(updatedData);
    showSuccess(`Status updated to "${newStatus}" for ${item.name || "Partner"}`);
  };

  // Toggle Select All
  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedRows.map((r) => r.id));
    }
  };

  const handleToggleRowSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* TOP HEADING — Matching Exhibitor List Style */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Trusted Leaders &amp; Brand Partners
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Super Admin only — defines what every internal role can see and do.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <a
              href="http://localhost:3002"
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
              Add New Partner / Brand
            </button>
          </div>
        </div>

        {/* METRIC STATS CARDS (Exact Exhibitor List KPI Style) */}
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

        {/* CATEGORY SELECTOR PILLS — Matches user specification: ALL (37), TRUSTED BY INDUSTRY LEADERS (11), etc. */}
        <div className="mt-[14px] flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat as keyof typeof categoryCounts] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`inline-flex h-[32px] shrink-0 items-center gap-1.5 rounded-[5px] px-3 text-[9px] font-bold transition-all ${
                  isSelected
                    ? "bg-[#233D4D] text-white shadow-xs"
                    : "border border-[#e2e8f0] bg-white text-[#334155] hover:bg-slate-50"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[8px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#f1f5f9] text-[#475569]"
                  }`}
                >
                  {count}
                </span>
              </button>
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
                  placeholder="Search partner by name or tag..."
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

            {/* PARTNERS DATA: TABLE VIEW */}
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
                        <th
                          className="py-[6px] pr-[12px] text-[8.5px] font-bold text-white uppercase tracking-wider"
                          style={{ paddingLeft: "52px" }}
                        >
                          Partner &amp; Logo
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
                            No partners match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((item) => {
                          const isCurrent = selectedId === item.id;
                          const adminName = item.updatedBy || loggedInAdminName;
                          const formattedDate = item.updatedAt || "12 Sept 2026, 4:22 PM";

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
                                  <div className="relative flex h-[36px] w-[54px] shrink-0 items-center justify-center rounded-[4px] border border-[#e4e7eb] bg-white p-1 shadow-xs">
                                    <img
                                      src={item.image}
                                      alt={item.imageAlt}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0 overflow-hidden">
                                    <span className="truncate text-[8.5px] font-semibold text-[#4B1426] block">
                                      {item.name}
                                    </span>
                                    <span className="mt-[2px] inline-block rounded-[3px] bg-[#f0f4f8] px-[5px] py-[1px] font-mono text-[7px] font-semibold text-[#233D4D]">
                                      {item.fileSize || "35.0 KB"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* CATEGORY BADGE */}
                              <td className="px-[12px] py-[8px]">
                                <span
                                  className={`inline-block rounded-[4px] border px-[6px] py-[2px] text-[7.5px] font-bold ${
                                    CATEGORY_STYLES[item.category]?.badge || "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {item.category}
                                </span>
                              </td>

                              {/* UPDATED BY COLUMN */}
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

                              {/* STATUS SELECT DROPDOWN */}
                              <td className="px-[12px] py-[8px]">
                                <select
                                  key={`${item.id}-${item.status}`}
                                  value={item.status}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    handleStatusChange(item, e.target.value as "Published" | "Draft");
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

                              {/* ACTIONS — Glassmorphism Effect */}
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
                                    title="Edit Partner"
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
                                    title="Delete Partner"
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
                      Total Partners: <strong className="font-bold text-[#1d4ed8]">{filteredRows.length}</strong>
                    </span>
                    <span className="text-[7.5px] text-[#8a92a0]">
                      (Showing {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length})
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
                      <option value={50}>All (37) / page</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* GRID VIEW */
              <div className="mt-[12px] grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {paginatedRows.map((item) => {
                  const isCurrent = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`group relative flex flex-col items-center justify-center rounded-[10px] border bg-white p-3 shadow-sm transition-all cursor-pointer ${
                        isCurrent
                          ? "border-[#075b33] ring-2 ring-[#075b33]/20"
                          : "border-[#e4e7eb] hover:border-slate-300"
                      }`}
                    >
                      <div className="relative flex h-[90px] w-full items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.imageAlt}
                          className="max-h-[80px] max-w-full object-contain"
                        />
                      </div>
                      <p className="mt-2 text-center text-[10px] font-bold text-[#19274a] line-clamp-1">
                        {item.name}
                      </p>
                      <span className="mt-1 text-[7.5px] font-medium text-[#64748b]">
                        {item.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: PARTNER DETAILS (Exact Exhibitor List Style) */}
          <aside className="space-y-[12px]">
            {/* PARTNER DETAILS CARD */}
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
                  Partner Details
                </h2>
                <ChevronDown className="h-[14px] w-[14px] rotate-180 text-[#59657a]" />
              </div>

              <div className="mt-[12px]">
                {/* LOGO PREVIEW CONTAINER */}
                <div className="relative flex h-[140px] w-full items-center justify-center rounded-[8px] border border-[#e4e7eb] bg-white p-3 shadow-inner">
                  <img
                    src={selected.image}
                    alt={selected.imageAlt}
                    className="max-h-[110px] max-w-full object-contain"
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
                    <span className="font-semibold text-[#69758c]">Brand Name:</span>{" "}
                    <span className="font-bold text-[#142347]">{selected.name}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Category:</span>{" "}
                    <span className="font-bold text-[#0284c7]">{selected.category}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Display Order:</span>{" "}
                    <span className="font-bold" style={{ color: "#006199" }}>Position #{selected.order}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Updated on:</span>{" "}
                    <span className="font-semibold" style={{ color: "#4B1426" }}>
                      {selected.updatedAt || "12 Sept 2026, 4:22 PM"}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Updated by:</span>{" "}
                    <span className="font-semibold" style={{ color: "#dc2626" }}>
                      {selected.updatedBy || loggedInAdminName}
                    </span>
                  </p>
                </div>

                {/* LOGO ALT TEXT TAG DISPLAY */}
                <div className="mt-[12px]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-bold text-[#34425e]">Logo Alt Tag (SEO):</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(selected.imageAlt);
                        setCopiedAlt(true);
                        setTimeout(() => setCopiedAlt(false), 2000);
                      }}
                      className="text-[8px] font-semibold text-[#075b33] hover:underline cursor-pointer"
                    >
                      {copiedAlt ? "Copied!" : "Copy Tag"}
                    </button>
                  </div>
                  <div className="rounded-[6px] border border-[#e2e6ea] bg-[#fbfcfd] p-2">
                    <p className="text-[8.5px] font-medium leading-[1.4] text-[#475569] break-words">
                      {selected.imageAlt}
                    </p>
                  </div>
                </div>

                {/* LOGO URL */}
                <div className="mt-[10px]">
                  <p className="mb-[4px] text-[9px] font-semibold text-[#34425e]">Logo Asset URL:</p>
                  <div className="flex items-center gap-[8px] rounded-[6px] border border-[#e2e6ea] bg-[#fbfcfd] px-[9px] py-[7px]">
                    <p className="min-w-0 flex-1 truncate text-[8px] font-semibold leading-[1.35] text-[#59657a]">
                      {selected.image}
                    </p>
                    <Copy
                      className="h-[13px] w-[13px] shrink-0 text-[#60708a] cursor-pointer hover:text-[#075b33]"
                      onClick={() => {
                        navigator.clipboard?.writeText(selected.image);
                        setCopiedUrl(true);
                        setTimeout(() => setCopiedUrl(false), 2000);
                      }}
                    />
                  </div>
                  {copiedUrl && (
                    <span className="text-[8px] font-medium text-emerald-600">URL copied to clipboard!</span>
                  )}
                </div>

                {/* ACTION BUTTONS (Edit / Replace / Delete) */}
                <div className="mt-[14px] grid grid-cols-3 gap-[7px]">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selected)}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-[#e0e4e8] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50 cursor-pointer"
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
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-[#e0e4e8] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50 cursor-pointer"
                  >
                    <RefreshCw className="h-[12px] w-[12px] text-orange-600" />
                    Replace
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selected)}
                    className="inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[5px] border border-red-400/30 bg-red-500/10 text-[8.5px] font-bold text-red-600 transition-all hover:bg-red-500/20 hover:border-red-400/50 active:scale-95 cursor-pointer"
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
                  className="inline-flex h-[36px] items-center justify-center gap-[7px] rounded-[5px] border border-[#e2e6ea] bg-white text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50 cursor-pointer"
                >
                  <Plus className="h-[13px] w-[13px] text-[#075b33]" />
                  Add Partner
                </button>

                <a
                  href="http://localhost:3002"
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

        {/* MODAL: ADD / EDIT PARTNER */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Partner" : "Add New Partner"}
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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
                onClick={() => handleSaveModal()}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{
                  background: "#16a34a",
                  borderRadius: "4px",
                  boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
                }}
              >
                {editingItem ? "Save Changes" : "Create Partner"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Brand / Partner Name"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Industry Partner 1"
            />

            <div>
              <Label required>Category (Marquee Rail)</Label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="h-[38px] w-full rounded-[4px] border border-surface-border bg-surface-card px-[12px] text-[11px] font-bold text-[#142347] outline-none [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,rgba(27,31,35,0.15)_0px_0px_0px_1px]"
              >
                <option value="TRUSTED BY INDUSTRY LEADERS">TRUSTED BY INDUSTRY LEADERS</option>
                <option value="Knowledge Partners">Knowledge Partners</option>
                <option value="Wellness Partners">Wellness Partners</option>
                <option value="Supporting Assoc.">Supporting Assoc.</option>
                <option value="EMERGING ORGANIC BRANDS">EMERGING ORGANIC BRANDS</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Display Order #"
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(Number(e.target.value))}
              />

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
            </div>

            <div>
              <Label required>Partner Logo</Label>
              <div className="flex gap-3 items-center">
                <div className="relative flex h-[64px] w-[80px] shrink-0 items-center justify-center overflow-hidden border border-surface-border bg-surface-card p-1 shadow-xs">
                  {formLogo ? (
                    <img src={formLogo} alt="Logo Preview" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-slate-300" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    placeholder="Image URL or select file below"
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
                      className="inline-flex h-[28px] items-center gap-1.5 border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[11px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:opacity-50 active:scale-95 cursor-pointer"
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
              label="Logo Alt Tag (SEO & Accessibility)"
              required
              value={formAltText}
              onChange={(e) => setFormAltText(e.target.value)}
              placeholder="e.g. Namo Gange Partner Logo - Bharat Organic Expo"
              hint="Unique for every partner brand. Embedded into HTML <img alt='...'> tag for image SEO."
            />
          </div>
        </Modal>
      </div>
    </main>
  );
}
