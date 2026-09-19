"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import typography from "../pages/PagesTypography.module.css";
import {
  ArrowRight,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Globe,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  MessageSquareText,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Quote,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  Video,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

// SweetAlert2 Toast configuration matching Exhibitor List
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

export type FeedbackType = "Visitor" | "Exhibitor" | "Buyer" | "Speaker" | "Partner";
export type FeedbackStatus = "Published" | "Pending" | "Follow Up" | "Draft";
export type FeedbackSource = "Website Form" | "Event On-Site" | "Google Reviews" | "Email" | "Others";

export interface FeedbackItem {
  id: string;
  code: string;
  name: string;
  organisation: string;
  email?: string;
  type: FeedbackType;
  location?: string;
  rating: number;
  title: string;
  comment: string;
  status: FeedbackStatus;
  date: string;
  time: string;
  source: FeedbackSource;
  event?: string;
  author?: string;
  color?: string;
  logo?: string;
}

// Initial realistic dataset matching the screenshot exactly
const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: "f-0248",
    code: "#0248",
    name: "Dr. Neha Sharma",
    organisation: "Aarogya Wellness Clinic",
    email: "dr.neha@aarogyawellness.com",
    type: "Visitor",
    location: "Gajraula",
    rating: 5,
    title: "Excellent organisation and ...",
    comment: "Excellent organisation and very helpful delegates. The variety of organic food and herbal products exceeded our expectations. Truly a world-class expo!",
    status: "Published",
    date: "18 Sep 2026",
    time: "04:12 PM",
    source: "Website Form",
    event: "Expo 2026",
    color: "#1b5e20",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0247",
    code: "#0247",
    name: "Ramesh Patel",
    organisation: "Organic India Pvt. Ltd.",
    email: "ramesh.patel@organicindia.com",
    type: "Exhibitor",
    location: "Faridabad",
    rating: 4,
    title: "Great footfall and well ...",
    comment: "Great footfall and well arranged stalls. We secured multiple prospective distributor leads within the first two days itself.",
    status: "Published",
    date: "18 Sep 2026",
    time: "11:28 AM",
    source: "Event On-Site",
    event: "Expo 2026",
    color: "#006199",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0246",
    code: "#0246",
    name: "Anita Mehra",
    organisation: "NatureLand Organics",
    email: "anita.mehra@natureland.in",
    type: "Exhibitor",
    location: "Agra",
    rating: 5,
    title: "Very well organised event ...",
    comment: "Very well organised event with high buyer engagement and seamless management support by the team throughout the trade show.",
    status: "Published",
    date: "17 Sep 2026",
    time: "06:45 PM",
    source: "Google Reviews",
    event: "Expo 2026",
    color: "#4B1426",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0245",
    code: "#0245",
    name: "Vikram Singh",
    organisation: "AgriTech Solutions",
    email: "vikram@agritechsolutions.com",
    type: "Buyer",
    location: "Haridwar",
    rating: 3,
    title: "Good platform to connect ...",
    comment: "Good platform to connect, but need more dedicated B2B session slots and smoother logistics on entry gates during peak hours.",
    status: "Pending",
    date: "17 Sep 2026",
    time: "03:20 PM",
    source: "Website Form",
    event: "Expo 2026",
    color: "#d26019",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0244",
    code: "#0244",
    name: "Pooja Verma",
    organisation: "Independent Visitor",
    email: "pooja.verma91@gmail.com",
    type: "Visitor",
    location: "New Delhi",
    rating: 4,
    title: "Learnt so much about ...",
    comment: "Learnt so much about sustainable farming, chemical-free cold pressed oils and clean foods. Keep organising such nationwide expos!",
    status: "Published",
    date: "16 Sep 2026",
    time: "01:15 PM",
    source: "Website Form",
    event: "Expo 2026",
    color: "#7c3aed",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0243",
    code: "#0243",
    name: "Sunil Khanna",
    organisation: "GreenLeaf Foods",
    email: "sunil@greenleaffoods.in",
    type: "Exhibitor",
    location: "Jaipur",
    rating: 3,
    title: "Good event, but could ...",
    comment: "Good event, but could improve registration desk logistics and WiFi bandwidth inside hall 3 for live product demos.",
    status: "Follow Up",
    date: "16 Sep 2026",
    time: "11:05 AM",
    source: "Email",
    event: "Expo 2026",
    color: "#0891b2",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0242",
    code: "#0242",
    name: "Dr. Rajesh Sinha",
    organisation: "Wellness Research Foundation",
    email: "dr.sinha@wrf-india.org",
    type: "Speaker",
    location: "Dehradun",
    rating: 5,
    title: "Wonderful audience ...",
    comment: "Wonderful audience interaction, enthusiastic queries on Ayurveda standards, and great technical stage facilities provided.",
    status: "Published",
    date: "15 Sep 2026",
    time: "07:30 PM",
    source: "Event On-Site",
    event: "Expo 2026",
    color: "#b45309",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0241",
    code: "#0241",
    name: "Kavita Rao",
    organisation: "Organic Living Store",
    email: "kavita.rao@organicliving.com",
    type: "Visitor",
    location: "Bengaluru",
    rating: 4,
    title: "Very informative and ...",
    comment: "Very informative and well-curated product displays from across India. The live tasting booths were an absolute highlight.",
    status: "Published",
    date: "15 Sep 2026",
    time: "02:10 PM",
    source: "Google Reviews",
    event: "Expo 2026",
    color: "#059669",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0240",
    code: "#0240",
    name: "Mohammed Ali",
    organisation: "Global Trade Links",
    email: "m.ali@globaltradelinks.ae",
    type: "Buyer",
    location: "Dubai, UAE",
    rating: 5,
    title: "Valuable connections ...",
    comment: "Valuable connections established with certified organic pulses and spices exporters. Extremely productive visit for our import team.",
    status: "Published",
    date: "14 Sep 2026",
    time: "05:45 PM",
    source: "Website Form",
    event: "Expo 2026",
    color: "#2563eb",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0239",
    code: "#0239",
    name: "Sonal Gupta",
    organisation: "HerbEssence Naturals",
    email: "sonal@herbessence.com",
    type: "Exhibitor",
    location: "Mumbai",
    rating: 4,
    title: "Good support from team ...",
    comment: "Good support from the organizing team, booth traffic was consistent and the visitor credentials were well verified.",
    status: "Pending",
    date: "14 Sep 2026",
    time: "12:25 PM",
    source: "Event On-Site",
    event: "Expo 2026",
    color: "#db2777",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0238",
    code: "#0238",
    name: "Deepak Joshi",
    organisation: "Himalayan Herbs Corp",
    email: "deepak@himalayanherbs.in",
    type: "Exhibitor",
    location: "Rishikesh",
    rating: 5,
    title: "High quality inquiries and genuine buyers ...",
    comment: "High quality inquiries and genuine buyers from GCC countries. Looking forward to booking a larger booth next year.",
    status: "Published",
    date: "13 Sep 2026",
    time: "03:10 PM",
    source: "Website Form",
    event: "Expo 2026",
    color: "#0d9488",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0237",
    code: "#0237",
    name: "Preeti Desai",
    organisation: "AyurVeda Life Care",
    email: "p.desai@ayurvedalifecare.com",
    type: "Speaker",
    location: "Ahmedabad",
    rating: 5,
    title: "Honoured to keynote on holistic wellness ...",
    comment: "Honoured to keynote on holistic wellness and organic certification pathways. The hospitality was top notch.",
    status: "Published",
    date: "12 Sep 2026",
    time: "04:50 PM",
    source: "Website Form",
    event: "Expo 2026",
    color: "#9333ea",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0236",
    code: "#0236",
    name: "Amitabh Banerjee",
    organisation: "BioPure Farms",
    email: "amitabh@biopurefarms.com",
    type: "Visitor",
    location: "Kolkata",
    rating: 4,
    title: "Loved the organic certifications seminar ...",
    comment: "Loved the organic certifications seminar and B2B vendor network. Clean amenities and good navigation signs.",
    status: "Published",
    date: "11 Sep 2026",
    time: "02:15 PM",
    source: "Google Reviews",
    event: "Expo 2026",
    color: "#ca8a04",
    author: "Vansh Chaudhary",
  },
  {
    id: "f-0235",
    code: "#0235",
    name: "Rajeshwari Iyer",
    organisation: "Namo Gange Volunteer",
    email: "rajeshwari@namogange.org",
    type: "Partner",
    location: "Chandigarh",
    rating: 5,
    title: "Inspiring green revolution showcase ...",
    comment: "Inspiring green revolution showcase with thousands of passionate farmers and conscious urban buyers.",
    status: "Published",
    date: "10 Sep 2026",
    time: "11:30 AM",
    source: "Event On-Site",
    event: "Expo 2026",
    color: "#e11d48",
    author: "Vansh Chaudhary",
  },
];

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

// ─── Rating Stars Component ───
function RatingStars({ value, size = 11 }: { value: number; size?: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        return (
          <span
            key={star}
            className="inline-block transition-transform hover:scale-110"
            style={{ fontSize: size, lineHeight: 1 }}
          >
            {filled ? (
              <span className="text-[#f59e0b]">★</span>
            ) : (
              <span className="text-[#e2e8f0]">★</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ─── Date Matching Helpers for Choose Date / Custom Date ───
const parseItemDate = (dateStr?: string): { day: number; month: number; year: number } | null => {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const monthKey = parts[1].toLowerCase().slice(0, 3);
    const month = months[monthKey];
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && month !== undefined && !isNaN(year)) {
      return { day, month, year };
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  }
  return null;
};

const parseIsoDate = (isoStr?: string): { day: number; month: number; year: number } | null => {
  if (!isoStr) return null;
  const parts = isoStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return { day, month, year };
    }
  }
  return null;
};

const isSameDay = (
  d1: { day: number; month: number; year: number },
  d2: { day: number; month: number; year: number }
) => {
  return d1.day === d2.day && d1.month === d2.month && d1.year === d2.year;
};

function AnimatedCounter({
  value,
  duration = 1000,
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

export default function FeedbackReviewsPage() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<"all" | "testimonials" | "videos" | "google">("all");

  // Main data state
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>("f-0248");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [datePreset, setDatePreset] = useState<string>("");
  const [customDate, setCustomDate] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClearDate = () => {
    setDatePreset("");
    setCustomDate("");
    setIsDatePickerOpen(false);
    setCurrentPage(1);
  };

  const getDateFilterLabel = () => {
    if (customDate) {
      const parsed = parseIsoDate(customDate);
      if (parsed) {
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];
        return `${parsed.day} ${monthNames[parsed.month]} ${parsed.year}`;
      }
      return customDate;
    }
    if (datePreset === "today") return "Today (18 Sep)";
    if (datePreset === "yesterday") return "Yesterday (17 Sep)";
    if (datePreset === "last7") return "Last 7 Days";
    if (datePreset === "expo") return "Expo Week";
    return "Choose Date";
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<FeedbackItem | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<FeedbackItem>>({
    name: "",
    organisation: "",
    email: "",
    type: "Visitor",
    rating: 5,
    title: "",
    comment: "",
    status: "Published",
    source: "Website Form",
    event: "Expo 2026",
  });

  // Metric Stat Cards configuration matching Exhibitor List
  const statCards = useMemo(
    () => [
      {
        title: "TOTAL FEEDBACK",
        value: 248,
        suffix: "",
        icon: Building2,
        tone: "emerald" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        trend: "↑ 18.6% vs last month",
        footer: "View full directory",
        onClick: () => {
          setActiveTab("all");
          setStatusFilter("All Status");
          setTypeFilter("All Types");
          setRatingFilter("All Ratings");
          setCurrentPage(1);
        },
      },
      {
        title: "AVERAGE RATING",
        value: 4.6,
        suffix: "/ 5",
        icon: Check,
        tone: "violet" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        trend: "↑ 0.3 vs last month",
        footer: "View published brands",
        onClick: () => {
          setRatingFilter("5 Star");
          setCurrentPage(1);
        },
      },
      {
        title: "TESTIMONIALS",
        value: 96,
        suffix: "",
        icon: Star,
        tone: "amber" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        trend: "↑ 22.4% vs last month",
        footer: "View logo assets",
        onClick: () => {
          setActiveTab("testimonials");
          setCurrentPage(1);
        },
      },
      {
        title: "VIDEO STORIES",
        value: 38,
        suffix: "",
        icon: Video,
        tone: "blue" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
        borderColor: "#bae6fd",
        numColor: "#0284c7",
        trend: "↑ 26.7% vs last month",
        footer: "View SEO tags",
        onClick: () => {
          setActiveTab("videos");
          setCurrentPage(1);
        },
      },
      {
        title: "GOOGLE REVIEWS",
        value: 114,
        suffix: "",
        icon: Globe,
        tone: "rose" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
        borderColor: "#fecdd3",
        numColor: "#be123c",
        trend: "↑ 15.2% vs last month",
        footer: "Review drafts",
        onClick: () => {
          setActiveTab("google");
          setCurrentPage(1);
        },
      },
      {
        title: "NEEDS FOLLOW-UP",
        value: 18,
        suffix: "",
        icon: Clock,
        tone: "teal" as const,
        gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
        borderColor: "#99f6e4",
        numColor: "#0f766e",
        trend: "↓ 12.5% vs last month",
        footer: "Live on website",
        onClick: () => {
          setStatusFilter("Follow Up");
          setCurrentPage(1);
        },
      },
    ],
    []
  );

  // Filtered rows calculation
  const filteredRows = useMemo(() => {
    return feedbackList.filter((item) => {
      // Tab filter
      if (activeTab === "testimonials" && item.rating < 4) return false;
      if (activeTab === "videos" && item.source !== "Event On-Site") return false;
      if (activeTab === "google" && item.source !== "Google Reviews") return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.organisation.toLowerCase().includes(q) ||
          item.comment.toLowerCase().includes(q) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          item.code.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Type dropdown filter
      if (typeFilter !== "All Types" && item.type !== typeFilter) {
        return false;
      }

      // Rating dropdown filter
      if (ratingFilter !== "All Ratings") {
        const starNum = parseInt(ratingFilter[0], 10);
        if (!isNaN(starNum) && item.rating !== starNum) {
          return false;
        }
      }

      // Status dropdown filter
      if (statusFilter !== "All Status" && item.status !== statusFilter) {
        return false;
      }

      // Event dropdown filter
      if (eventFilter !== "All Events" && item.event && item.event !== eventFilter) {
        return false;
      }

      // Date filter (Presets & Custom Date Picker)
      if (customDate) {
        const target = parseIsoDate(customDate);
        const itemD = parseItemDate(item.date);
        if (!target || !itemD || !isSameDay(target, itemD)) {
          return false;
        }
      } else if (datePreset === "today") {
        const itemD = parseItemDate(item.date);
        if (!itemD || !isSameDay(itemD, { day: 18, month: 8, year: 2026 })) {
          return false;
        }
      } else if (datePreset === "yesterday") {
        const itemD = parseItemDate(item.date);
        if (!itemD || !isSameDay(itemD, { day: 17, month: 8, year: 2026 })) {
          return false;
        }
      } else if (datePreset === "last7") {
        const itemD = parseItemDate(item.date);
        if (!itemD || itemD.year !== 2026 || itemD.month !== 8 || itemD.day < 12 || itemD.day > 18) {
          return false;
        }
      } else if (datePreset === "expo") {
        const itemD = parseItemDate(item.date);
        if (!itemD || itemD.year !== 2026 || itemD.month !== 8 || itemD.day < 10 || itemD.day > 18) {
          return false;
        }
      }

      return true;
    });
  }, [
    feedbackList,
    activeTab,
    searchQuery,
    typeFilter,
    ratingFilter,
    statusFilter,
    eventFilter,
    datePreset,
    customDate,
  ]);

  // Paginated Rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Select all handler
  const isAllSelected = paginatedRows.length > 0 && paginatedRows.every((item) => selectedIds.includes(item.id));
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const pageIds = paginatedRows.map((item) => item.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("All Types");
    setRatingFilter("All Ratings");
    setStatusFilter("All Status");
    setEventFilter("All Events");
    setDatePreset("");
    setCustomDate("");
    setIsDatePickerOpen(false);
    setCurrentPage(1);
    showInfo("Filters reset to default.");
  };

  // Status Change directly on table row
  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    showSuccess(`Status changed to ${newStatus}`);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      name: "",
      organisation: "",
      email: "",
      type: "Visitor",
      rating: 5,
      title: "",
      comment: "",
      status: "Published",
      source: "Website Form",
      event: "Expo 2026",
    });
    setIsAddModalOpen(true);
  };

  // Save new feedback
  const handleSaveCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name?.trim() || !formData.comment?.trim()) {
      showError("Please enter name and feedback comment.");
      return;
    }

    const newCode = `#0${249 + feedbackList.length}`;
    const d = new Date();
    const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    const newItem: FeedbackItem = {
      id: `f-${Date.now()}`,
      code: newCode,
      name: formData.name.trim(),
      organisation: formData.organisation?.trim() || "Individual",
      email: formData.email?.trim() || "",
      type: (formData.type as FeedbackType) || "Visitor",
      rating: formData.rating || 5,
      title: formData.title?.trim() || formData.comment.slice(0, 30) + "...",
      comment: formData.comment.trim(),
      status: (formData.status as FeedbackStatus) || "Published",
      date: dateStr,
      time: timeStr,
      source: (formData.source as FeedbackSource) || "Website Form",
      event: formData.event || "Expo 2026",
    };

    setFeedbackList([newItem, ...feedbackList]);
    setIsAddModalOpen(false);
    showSuccess("New feedback added successfully!");
  };

  // Open Edit Modal
  const handleOpenEdit = (item: FeedbackItem) => {
    setActiveItem(item);
    setFormData({ ...item });
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeItem) return;
    if (!formData.name?.trim() || !formData.comment?.trim()) {
      showError("Please enter name and feedback comment.");
      return;
    }
    setFeedbackList((prev) =>
      prev.map((item) =>
        item.id === activeItem.id
          ? {
              ...item,
              name: formData.name || item.name,
              organisation: formData.organisation || item.organisation,
              email: formData.email || item.email,
              type: (formData.type as FeedbackType) || item.type,
              rating: formData.rating || item.rating,
              title: formData.title || item.title,
              comment: formData.comment || item.comment,
              status: (formData.status as FeedbackStatus) || item.status,
              source: (formData.source as FeedbackSource) || item.source,
            }
          : item
      )
    );
    setIsEditModalOpen(false);
    showSuccess("Feedback updated successfully!");
  };

  // Delete Feedback
  const handleDelete = (item: FeedbackItem) => {
    Swal.fire({
      title: "Delete Feedback?",
      text: `Are you sure you want to delete feedback from ${item.name}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setFeedbackList((prev) => prev.filter((i) => i.id !== item.id));
        showSuccess(`Feedback ${item.code} deleted.`);
      }
    });
  };

  // Export dataset as CSV
  const handleExport = () => {
    const headers = ["ID", "Name", "Organisation", "Email", "Type", "Rating", "Status", "Date", "Time", "Source", "Comment"];
    const rows = filteredRows.map((item) => [
      `"${item.code}"`,
      `"${item.name}"`,
      `"${item.organisation}"`,
      `"${item.email || ""}"`,
      `"${item.type}"`,
      item.rating,
      `"${item.status}"`,
      `"${item.date}"`,
      `"${item.time}"`,
      `"${item.source}"`,
      `"${item.comment.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `feedback_reviews_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess(`Exported ${filteredRows.length} feedback records to CSV.`);
  };

  // Helper for badge colors
  const getTypeBadgeClass = (type: FeedbackType) => {
    switch (type) {
      case "Visitor":
        return "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]";
      case "Exhibitor":
        return "bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]";
      case "Buyer":
        return "bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe]";
      case "Speaker":
        return "bg-[#eef2ff] text-[#4f46e5] border border-[#c7d2fe]";
      case "Partner":
        return "bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  const getStatusBadgeClass = (status: FeedbackStatus) => {
    switch (status) {
      case "Published":
        return "bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]";
      case "Pending":
        return "bg-[#fffbeb] text-[#d97706] border border-[#fde68a]";
      case "Follow Up":
        return "bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]";
      case "Draft":
        return "bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1]";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Render 5 stars helper
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-[2px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-[12px] w-[12px] ${
              star <= rating
                ? "text-[#f59e0b] fill-[#f59e0b]"
                : "text-[#e2e8f0] fill-[#f1f5f9]"
            }`}
          />
        ))}
      </div>
    );
  };

  // Right card box-shadow matching Exhibitor List exact CSS
  const exhibitorCardShadow = {
    boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(209, 213, 219) 0px 0px 0px 1px inset",
  };

  // Metric card box shadow
  const metricCardShadow = {
    boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
  };

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* TOP HEADING — Matching Exhibitor List Style */}
        <div className="mb-[16px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Feedback & Reviews
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Manage visitor, exhibitor and partner feedback, reviews and testimonials.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            {/* 1. EXPORT BUTTON (Matching View on Website Style: Peach #fff7ed bg, #fed7aa border, #ea580c text) */}
            <button
              type="button"
              onClick={handleExport}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="h-[12px] w-[12px] text-[#ea580c]" strokeWidth={1.7} />
              Export
            </button>

            {/* 2. FILTERS BUTTON (Matching Add Category & Year Style: Blue #006199 bg, White text) */}
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all search & filter terms"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#006199] px-[14px] text-[8.5px] font-semibold text-white shadow-sm transition hover:bg-[#005180] active:scale-95 cursor-pointer"
              style={{ backgroundColor: "#006199", color: "#ffffff" }}
            >
              <SlidersHorizontal className="h-[12px] w-[12px] text-white" strokeWidth={1.7} />
              Filters
            </button>

            {/* 3. ADD FEEDBACK BUTTON (Matching Upload New Media Style: Maroon #4B1426 bg, White text, 12px shadow) */}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d] active:scale-95 cursor-pointer"
              style={{ backgroundColor: "#4B1426", color: "#ffffff" }}
            >
              <Plus className="h-[12px] w-[12px] text-white" strokeWidth={1.7} />
              Add Feedback
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION WITH ACTIVE GREEN UNDERLINE */}
        <div className="mb-[14px] flex items-center gap-[28px] border-b border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(1);
            }}
            className={`relative pb-[9px] text-[10.5px] font-bold transition-all cursor-pointer ${
              activeTab === "all" ? "text-[#075b33]" : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            All Feedback
            {activeTab === "all" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#075b33]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("testimonials");
              setCurrentPage(1);
            }}
            className={`relative pb-[9px] text-[10.5px] font-bold transition-all cursor-pointer ${
              activeTab === "testimonials" ? "text-[#075b33]" : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            Testimonials
            {activeTab === "testimonials" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#075b33]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("videos");
              setCurrentPage(1);
            }}
            className={`relative pb-[9px] text-[10.5px] font-bold transition-all cursor-pointer ${
              activeTab === "videos" ? "text-[#075b33]" : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            Video Stories
            {activeTab === "videos" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#075b33]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("google");
              setCurrentPage(1);
            }}
            className={`relative pb-[9px] text-[10.5px] font-bold transition-all cursor-pointer ${
              activeTab === "google" ? "text-[#075b33]" : "text-[#64748b] hover:text-[#1e293b]"
            }`}
          >
            Google Reviews
            {activeTab === "google" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#075b33]" />
            )}
          </button>
        </div>

        {/* METRIC STATS CARDS (Matching Exhibitor List Style) */}
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

                    <div className="mt-1.5 flex items-end justify-between">
                      <div className="flex items-end gap-1">
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
                          <span className="mb-0.5 text-[9.5px] font-bold text-[#64748b]">
                            {item.suffix}
                          </span>
                        )}
                      </div>

                      {/* Micro trend indicator */}
                      <span
                        className={`mb-0.5 text-[7.5px] font-bold flex items-center gap-0.5 ${
                          item.trend.startsWith("↓")
                            ? "text-[#dc2626]"
                            : "text-[#16a34a]"
                        }`}
                      >
                        {item.trend.split(" ")[0]} {item.trend.split(" ")[1]}
                      </span>
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

        {/* SEARCH & FILTERS CONTROLS BAR */}
        <div className="mt-[14px] flex flex-wrap items-center gap-[10px]">
          {/* Search by name, company, email or keywords */}
          <label className="relative min-w-[240px] flex-1">
            <Search className="absolute left-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#8b95a7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, company, email or keywords..."
              className="h-[36px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[34px] pr-[14px] text-[10px] font-medium text-[#273655] outline-none placeholder:text-[#8b95a7] focus:border-[#075b33]"
            />
          </label>

          {/* All Types */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[36px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[9.5px] font-semibold text-[#2a3855] outline-none cursor-pointer hover:border-slate-300"
          >
            <option>All Types</option>
            <option>Visitor</option>
            <option>Exhibitor</option>
            <option>Buyer</option>
            <option>Speaker</option>
            <option>Partner</option>
          </select>

          {/* All Ratings */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[36px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[9.5px] font-semibold text-[#2a3855] outline-none cursor-pointer hover:border-slate-300"
          >
            <option>All Ratings</option>
            <option>5 Star</option>
            <option>4 Star</option>
            <option>3 Star</option>
            <option>2 Star</option>
            <option>1 Star</option>
          </select>

          {/* All Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[36px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[9.5px] font-semibold text-[#2a3855] outline-none cursor-pointer hover:border-slate-300"
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Pending</option>
            <option>Follow Up</option>
          </select>

          {/* All Events */}
          <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[36px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[9.5px] font-semibold text-[#2a3855] outline-none cursor-pointer hover:border-slate-300"
          >
            <option>All Events</option>
            <option>Expo 2026</option>
            <option>Summit 2025</option>
            <option>Trade Meet 2026</option>
          </select>

          {/* Choose Date with Custom Date Picker & Presets */}
          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`flex h-[36px] items-center gap-2 rounded-[6px] border px-[12px] text-[9.5px] font-semibold transition cursor-pointer ${
                customDate || datePreset
                  ? "border-[#075b33] bg-[#f0fdf4] text-[#075b33] shadow-xs"
                  : "border-[#dfe4e8] bg-white text-[#2a3855] hover:border-slate-300"
              }`}
            >
              <Calendar
                className={`h-[13px] w-[13px] shrink-0 ${
                  customDate || datePreset ? "text-[#075b33]" : "text-[#64748b]"
                }`}
              />
              <span className="whitespace-nowrap">{getDateFilterLabel()}</span>
              {customDate || datePreset ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearDate();
                  }}
                  title="Clear date filter"
                  className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-emerald-200/60 text-[#075b33]"
                >
                  <X className="h-3 w-3" />
                </span>
              ) : (
                <ChevronDown className="h-3 w-3 text-[#64748b] opacity-60 ml-0.5" />
              )}
            </button>

            {/* POPOVER DROPDOWN FOR DATE SELECTION */}
            {isDatePickerOpen && (
              <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-[240px] rounded-[8px] border border-[#d1d5db] bg-white p-3 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold text-[#19274a]">Choose Date</span>
                  {(customDate || datePreset) && (
                    <button
                      type="button"
                      onClick={handleClearDate}
                      className="text-[8px] font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* QUICK PRESETS */}
                <div className="mt-2 space-y-1">
                  {[
                    { label: "All Dates", value: "" },
                    { label: "Today (18 Sep 2026)", value: "today" },
                    { label: "Yesterday (17 Sep 2026)", value: "yesterday" },
                    { label: "Last 7 Days (12–18 Sep)", value: "last7" },
                    { label: "Expo Week (10–18 Sep)", value: "expo" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        setDatePreset(preset.value);
                        setCustomDate("");
                        setIsDatePickerOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-[4px] px-2 py-1.5 text-[9px] font-semibold transition cursor-pointer ${
                        datePreset === preset.value && !customDate
                          ? "bg-[#075b33] text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{preset.label}</span>
                      {datePreset === preset.value && !customDate && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>

                {/* CUSTOM DATE PICKER */}
                <div className="mt-3 border-t border-slate-100 pt-2.5">
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Select Custom Date
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => {
                      setCustomDate(e.target.value);
                      setDatePreset("custom");
                      setCurrentPage(1);
                    }}
                    className="h-[32px] w-full rounded-[5px] border border-slate-300 bg-slate-50/50 px-2 text-[9.5px] font-semibold text-slate-800 outline-none focus:border-[#075b33] focus:bg-white cursor-pointer"
                  />
                </div>

                <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="rounded-[4px] bg-[#075b33] px-3 py-1 text-[8.5px] font-bold text-white shadow-xs hover:bg-[#064e2b] cursor-pointer"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex h-[36px] items-center justify-center gap-1.5 rounded-[6px] border border-[#fecaca] bg-[#fef2f2] px-[14px] text-[9.5px] font-semibold text-[#dc2626] transition hover:bg-[#fee2e2] hover:border-[#fca5a5] active:scale-95 shadow-xs cursor-pointer"
          >
            <RotateCcw className="h-[12px] w-[12px] text-[#dc2626]" />
            Reset
          </button>
        </div>

        {/* MAIN SPLIT CONTENT */}
        <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_310px]">
          {/* LEFT COLUMN: TABLE & PAGINATION */}
          <div className="min-w-0 overflow-hidden">
            <div className="overflow-hidden rounded-[8px] border border-[#e4e7eb] bg-white shadow-xs">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[920px] border-collapse text-left">
                  <thead>
                    <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                      <th className="w-[42px] rounded-tl-[6px] px-[12px] py-[6px] text-center">
                        <input
                          type="checkbox"
                          className="accent-[#233D4D] cursor-pointer"
                          checked={paginatedRows.length > 0 && selectedIds.length === paginatedRows.length}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th className="w-[50px] px-[12px] py-[6px] whitespace-nowrap text-[8.5px] font-bold text-white uppercase tracking-wider">
                        S.No.
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
                      <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                        Feedback / Title
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
                        <td colSpan={9} className="py-12 text-center text-xs font-medium text-slate-500">
                          No feedback entries match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((item, index) => {
                        const isCurrent = selectedId === item.id;
                        const serialNumber = (currentPage - 1) * pageSize + index + 1;

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
                                onChange={() => toggleSelectItem(item.id)}
                              />
                            </td>

                            <td className="px-[12px] py-[8px] whitespace-nowrap">
                              <span className="text-[8.5px] font-semibold text-[#293681]">
                                {serialNumber}
                              </span>
                            </td>

                            <td className="px-[12px] py-[8px]">
                              <div className="flex items-center gap-[10px] min-w-[200px]">
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
                                    {item.organisation}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* LOCATION COLUMN */}
                            <td className="px-[12px] py-[8px] whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-[#0f766e]">
                                  <MapPin className="h-3 w-3 text-[#d26019] shrink-0" />
                                  <span>{item.location || "Haridwar"}</span>
                                </div>
                                <span className="text-[7.5px] font-semibold text-[#64748b] pl-4">
                                  {item.type}
                                </span>
                              </div>
                            </td>

                            {/* RATING */}
                            <td className="px-[12px] py-[8px] whitespace-nowrap">
                              <div className="flex items-center gap-[6px]">
                                <RatingStars value={item.rating} size={11} />
                                <span className="text-[8.5px] font-bold text-[#b45309]">
                                  {item.rating.toFixed(1)}
                                </span>
                              </div>
                            </td>

                            {/* FEEDBACK / TITLE */}
                            <td className="px-[12px] py-[8px] max-w-[200px]">
                              <p className="line-clamp-1 text-[8.5px] font-medium text-[#475569] italic" title={item.comment}>
                                "{item.title || item.comment}"
                              </p>
                            </td>

                            {/* UPDATED BY COLUMN */}
                            <td className="px-[12px] py-[8px] whitespace-nowrap">
                              <div className="flex flex-col items-start leading-tight">
                                <span className="text-[9px] font-bold text-[#dc2626] whitespace-nowrap">
                                  {item.author || "Vansh Chaudhary"}
                                </span>
                                <span className="text-[8px] font-medium text-[#64748b] mt-0.5 whitespace-nowrap">
                                  {item.date}, {item.time}
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
                                  handleStatusChange(item.id, e.target.value as FeedbackStatus);
                                }}
                                className={`h-[24px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[8px] font-bold outline-none bg-no-repeat bg-[right_6px_center] shadow-xs transition ${
                                  item.status === "Published"
                                    ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                                    : item.status === "Pending"
                                    ? "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]"
                                    : item.status === "Follow Up"
                                    ? "bg-[#fff1f2] text-[#c62828] border border-[#fecdd3]"
                                    : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                                }`}
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                }}
                              >
                                <option value="Published" className="bg-white text-[#23714a] font-bold">
                                  Published
                                </option>
                                <option value="Pending" className="bg-white text-[#b78103] font-bold">
                                  Pending
                                </option>
                                <option value="Follow Up" className="bg-white text-[#c62828] font-bold">
                                  Follow Up
                                </option>
                                <option value="Draft" className="bg-white text-[#64748b] font-bold">
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
                                    setActiveItem(item);
                                    setIsViewModalOpen(true);
                                  }}
                                  className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_3px_10px_rgba(249,115,22,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                  <Eye className="h-[12px] w-[12px] text-orange-600" />
                                </button>

                                {/* Edit */}
                                <button
                                  type="button"
                                  title="Edit Feedback"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(item);
                                  }}
                                  className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-400/30 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                  <Pencil className="h-[12px] w-[12px] text-blue-600" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  title="Delete Feedback"
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
                    Total Feedback: <strong className="font-bold text-[#1d4ed8]">{filteredRows.length}</strong>
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
          </div>

          {/* RIGHT SIDEBAR: METRICS & WIDGETS */}
          <aside className="space-y-[12px]">
            {/* WIDGET 1: RATING DISTRIBUTION */}
            <section
              className="rounded-[6px] bg-white p-[14px]"
              style={exhibitorCardShadow}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-[#0f172a]">
                  Rating Distribution
                </h3>
                <button
                  type="button"
                  onClick={() => showInfo("Generating comprehensive ratings report...")}
                  className="flex items-center gap-1 text-[8px] font-semibold text-[#059669] hover:underline cursor-pointer"
                >
                  View Report →
                </button>
              </div>

              <div className="space-y-2">
                {/* 5 Star */}
                <div className="flex items-center gap-2 text-[8px]">
                  <span className="flex w-[48px] items-center gap-1 font-semibold text-[#334155]">
                    <span className="text-[#f59e0b]">★</span> 5 Star
                  </span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                    <div className="h-full rounded-full bg-[#10b981]" style={{ width: "62.9%" }} />
                  </div>
                  <span className="w-[62px] text-right font-medium text-[#64748b]">
                    156 (62.9%)
                  </span>
                </div>

                {/* 4 Star */}
                <div className="flex items-center gap-2 text-[8px]">
                  <span className="flex w-[48px] items-center gap-1 font-semibold text-[#334155]">
                    <span className="text-[#f59e0b]">★</span> 4 Star
                  </span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                    <div className="h-full rounded-full bg-[#93c5fd]" style={{ width: "21.8%" }} />
                  </div>
                  <span className="w-[62px] text-right font-medium text-[#64748b]">
                    54 (21.8%)
                  </span>
                </div>

                {/* 3 Star */}
                <div className="flex items-center gap-2 text-[8px]">
                  <span className="flex w-[48px] items-center gap-1 font-semibold text-[#334155]">
                    <span className="text-[#f59e0b]">★</span> 3 Star
                  </span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                    <div className="h-full rounded-full bg-[#fbbf24]" style={{ width: "9.7%" }} />
                  </div>
                  <span className="w-[62px] text-right font-medium text-[#64748b]">
                    24 (9.7%)
                  </span>
                </div>

                {/* 2 Star */}
                <div className="flex items-center gap-2 text-[8px]">
                  <span className="flex w-[48px] items-center gap-1 font-semibold text-[#334155]">
                    <span className="text-[#f59e0b]">★</span> 2 Star
                  </span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                    <div className="h-full rounded-full bg-[#fb923c]" style={{ width: "3.2%" }} />
                  </div>
                  <span className="w-[62px] text-right font-medium text-[#64748b]">
                    8 (3.2%)
                  </span>
                </div>

                {/* 1 Star */}
                <div className="flex items-center gap-2 text-[8px]">
                  <span className="flex w-[48px] items-center gap-1 font-semibold text-[#334155]">
                    <span className="text-[#ef4444]">★</span> 1 Star
                  </span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
                    <div className="h-full rounded-full bg-[#f87171]" style={{ width: "2.4%" }} />
                  </div>
                  <span className="w-[62px] text-right font-medium text-[#64748b]">
                    6 (2.4%)
                  </span>
                </div>
              </div>
            </section>

            {/* WIDGET 2: FEEDBACK SOURCES (DONUT CHART) */}
            <section
              className="rounded-[6px] bg-white p-[14px]"
              style={exhibitorCardShadow}
            >
              <h3 className="mb-3 text-[11px] font-bold text-[#0f172a]">
                Feedback Sources
              </h3>

              <div className="flex items-center justify-between gap-3">
                {/* SVG DONUT */}
                <div className="relative flex h-[90px] w-[90px] shrink-0 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background track */}
                    <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                    {/* Website Form (45.2% -> 39.7) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="4.5"
                      strokeDasharray="39.7 88"
                      strokeDashoffset="0"
                    />
                    {/* Event On-Site (27.4% -> 24.1) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#3b82f6"
                      strokeWidth="4.5"
                      strokeDasharray="24.1 88"
                      strokeDashoffset="-39.7"
                    />
                    {/* Google Reviews (15.3% -> 13.5) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#06b6d4"
                      strokeWidth="4.5"
                      strokeDasharray="13.5 88"
                      strokeDashoffset="-63.8"
                    />
                    {/* Email (7.3% -> 6.4) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#f97316"
                      strokeWidth="4.5"
                      strokeDasharray="6.4 88"
                      strokeDashoffset="-77.3"
                    />
                    {/* Others (4.8% -> 4.3) */}
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#f43f5e"
                      strokeWidth="4.5"
                      strokeDasharray="4.3 88"
                      strokeDashoffset="-83.7"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[14px] font-extrabold leading-none text-[#0f172a]">
                      248
                    </span>
                    <span className="text-[7.5px] font-medium text-[#64748b]">Total</span>
                  </div>
                </div>

                {/* LEGEND LIST */}
                <div className="flex-1 space-y-1.5 text-[8px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-[#334155]">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#10b981]" />
                      Website Form
                    </span>
                    <span className="font-semibold text-[#64748b]">112 (45.2%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-[#334155]">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#3b82f6]" />
                      Event On-Site
                    </span>
                    <span className="font-semibold text-[#64748b]">68 (27.4%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-[#334155]">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#06b6d4]" />
                      Google Reviews
                    </span>
                    <span className="font-semibold text-[#64748b]">38 (15.3%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-[#334155]">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#f97316]" />
                      Email
                    </span>
                    <span className="font-semibold text-[#64748b]">18 (7.3%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-[#334155]">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#f43f5e]" />
                      Others
                    </span>
                    <span className="font-semibold text-[#64748b]">12 (4.8%)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* WIDGET 3: QUICK ACTIONS */}
            <section
              className="rounded-[6px] bg-white p-[14px]"
              style={exhibitorCardShadow}
            >
              <h3 className="mb-2 text-[11px] font-bold text-[#0f172a]">
                Quick Actions
              </h3>

              <div className="divide-y divide-[#f1f5f9]">
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex w-full items-center justify-between py-2 text-[8.5px] font-semibold text-[#334155] transition hover:text-[#075b33] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-[12px] w-[12px] text-[#075b33]" />
                    Add New Feedback
                  </span>
                  <ArrowRight className="h-[11px] w-[11px] text-slate-400" />
                </button>

                <Link
                  href="/testimonials"
                  className="flex w-full items-center justify-between py-2 text-[8.5px] font-semibold text-[#334155] transition hover:text-[#075b33]"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-[12px] w-[12px] text-[#2563eb]" />
                    Manage Testimonials
                  </span>
                  <ArrowRight className="h-[11px] w-[11px] text-slate-400" />
                </Link>

                <Link
                  href="/testimonial-videos"
                  className="flex w-full items-center justify-between py-2 text-[8.5px] font-semibold text-[#334155] transition hover:text-[#075b33]"
                >
                  <span className="flex items-center gap-2">
                    <Video className="h-[12px] w-[12px] text-[#dc2626]" />
                    Manage Video Stories
                  </span>
                  <ArrowRight className="h-[11px] w-[11px] text-slate-400" />
                </Link>

                <Link
                  href="/google-reviews"
                  className="flex w-full items-center justify-between py-2 text-[8.5px] font-semibold text-[#334155] transition hover:text-[#075b33]"
                >
                  <span className="flex items-center gap-2">
                    <Star className="h-[12px] w-[12px] text-[#f59e0b]" />
                    Sync Google Reviews
                  </span>
                  <ArrowRight className="h-[11px] w-[11px] text-slate-400" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("Follow Up");
                    showInfo("Filtered entries requiring follow up.");
                  }}
                  className="flex w-full items-center justify-between py-2 text-[8.5px] font-semibold text-[#334155] transition hover:text-[#075b33] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-[12px] w-[12px] text-[#ea580c]" />
                    Follow-up Reminders
                  </span>
                  <ArrowRight className="h-[11px] w-[11px] text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="flex w-full items-center justify-between py-2 text-[8.5px] font-semibold text-[#334155] transition hover:text-[#075b33] cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-[12px] w-[12px] text-[#059669]" />
                    Export Reports
                  </span>
                  <ArrowRight className="h-[11px] w-[11px] text-slate-400" />
                </button>
              </div>
            </section>

            {/* WIDGET 4: NEED HELP? */}
            <section
              className="rounded-[6px] border border-[#bbf7d0] bg-[#f0fdf4] p-[14px]"
              style={exhibitorCardShadow}
            >
              <div className="flex items-start gap-2.5">
                <div className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full bg-[#15803d] text-white">
                  <Headphones className="h-[16px] w-[16px]" />
                </div>
                <div>
                  <h4 className="text-[10.5px] font-bold text-[#14532d]">
                    Need Help?
                  </h4>
                  <p className="text-[8px] font-medium text-[#166534]">
                    For any assistance, contact our team.
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-[8.5px]">
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 font-semibold text-[#15803d] transition hover:underline"
                >
                  <Phone className="h-[12px] w-[12px]" />
                  +91 98765 43210
                </a>
                <a
                  href="mailto:support@bharatorganicexpo.com"
                  className="flex items-center gap-2 font-semibold text-[#15803d] transition hover:underline"
                >
                  <Mail className="h-[12px] w-[12px]" />
                  support@bharatorganicexpo.com
                </a>
              </div>
            </section>
          </aside>
        </section>

        {/* BOTTOM FOOTER CREDITS MATCHING THE SCREENSHOT */}
        <footer className="mt-8 flex flex-wrap items-center justify-between border-t border-[#e2e8f0] pt-4 text-[8px] text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="text-[#ea580c] font-bold">⊙</span>
            <span>Together, we bring dignity to every final journey.</span>
            <span className="font-semibold text-slate-700">© 2026 Bharat Organic Expo. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-600">An Initiative of Namo Gange Trust</span>
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Terms & Conditions</Link>
            <Link href="#" className="hover:underline">Support</Link>
          </div>
        </footer>
      </div>

      {/* MODAL 1: ADD NEW FEEDBACK (Matching New Staff Account Modal Design) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Feedback"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95 cursor-pointer"
              style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveCreate()}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ background: "#16a34a", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px" }}
            >
              Save Feedback
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Full Name"
            required
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Neha Sharma"
          />

          <Input
            label="Organisation / Company"
            value={formData.organisation || ""}
            onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
            placeholder="e.g. Aarogya Wellness Clinic"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. info@company.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="User Type"
              value={formData.type || "Visitor"}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as FeedbackType })}
            >
              <option value="Visitor">Visitor</option>
              <option value="Exhibitor">Exhibitor</option>
              <option value="Buyer">Buyer</option>
              <option value="Speaker">Speaker</option>
              <option value="Partner">Partner</option>
            </Select>

            <Select
              label="Rating (Stars)"
              value={formData.rating || 5}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            >
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★☆</option>
              <option value={3}>3 Stars ★★★☆☆</option>
              <option value={2}>2 Stars ★★☆☆☆</option>
              <option value={1}>1 Star ★☆☆☆☆</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              value={formData.status || "Published"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as FeedbackStatus })}
            >
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Draft">Draft</option>
            </Select>

            <Select
              label="Source"
              value={formData.source || "Website Form"}
              onChange={(e) => setFormData({ ...formData, source: e.target.value as FeedbackSource })}
            >
              <option value="Website Form">Website Form</option>
              <option value="Event On-Site">Event On-Site</option>
              <option value="Google Reviews">Google Reviews</option>
              <option value="Email">Email</option>
              <option value="Others">Others</option>
            </Select>
          </div>

          <Input
            label="Feedback Title / One-Liner"
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Excellent organisation and stalls ..."
          />

          <Textarea
            label="Full Feedback Comment"
            required
            rows={3}
            value={formData.comment || ""}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Enter detailed feedback or review text..."
          />
        </div>
      </Modal>

      {/* MODAL 2: EDIT FEEDBACK (Matching New Staff Account Modal Design) */}
      <Modal
        isOpen={isEditModalOpen && Boolean(activeItem)}
        onClose={() => setIsEditModalOpen(false)}
        title={activeItem ? `Edit Feedback (${activeItem.code})` : "Edit Feedback"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95 cursor-pointer"
              style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveEdit()}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ background: "#16a34a", borderRadius: "4px", boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px" }}
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Full Name"
            required
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Dr. Neha Sharma"
          />

          <Input
            label="Organisation / Company"
            value={formData.organisation || ""}
            onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
            placeholder="e.g. Aarogya Wellness Clinic"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. info@company.com"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="User Type"
              value={formData.type || "Visitor"}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as FeedbackType })}
            >
              <option value="Visitor">Visitor</option>
              <option value="Exhibitor">Exhibitor</option>
              <option value="Buyer">Buyer</option>
              <option value="Speaker">Speaker</option>
              <option value="Partner">Partner</option>
            </Select>

            <Select
              label="Rating (Stars)"
              value={formData.rating || 5}
              onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            >
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★☆</option>
              <option value={3}>3 Stars ★★★☆☆</option>
              <option value={2}>2 Stars ★★☆☆☆</option>
              <option value={1}>1 Star ★☆☆☆☆</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              value={formData.status || "Published"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as FeedbackStatus })}
            >
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Draft">Draft</option>
            </Select>

            <Select
              label="Source"
              value={formData.source || "Website Form"}
              onChange={(e) => setFormData({ ...formData, source: e.target.value as FeedbackSource })}
            >
              <option value="Website Form">Website Form</option>
              <option value="Event On-Site">Event On-Site</option>
              <option value="Google Reviews">Google Reviews</option>
              <option value="Email">Email</option>
              <option value="Others">Others</option>
            </Select>
          </div>

          <Input
            label="Feedback Title / One-Liner"
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Excellent organisation and stalls ..."
          />

          <Textarea
            label="Full Feedback Comment"
            required
            rows={3}
            value={formData.comment || ""}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Enter detailed feedback or review text..."
          />
        </div>
      </Modal>

      {/* MODAL 3: VIEW FEEDBACK DETAILS */}
      {isViewModalOpen && activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[520px] rounded-[10px] bg-white p-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#0f172a]">
                  Feedback Details
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[8px] font-bold text-[#64748b]">
                  {activeItem.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* User meta box */}
              <div className="flex items-start justify-between rounded-[8px] bg-slate-50 p-3">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-900">
                    {activeItem.name}
                  </h4>
                  <p className="text-[9px] font-medium text-slate-600">
                    {activeItem.organisation}
                  </p>
                  {activeItem.email && (
                    <p className="text-[8px] text-slate-500">{activeItem.email}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center rounded-[4px] px-[8px] py-[2px] text-[8px] font-bold leading-none ${getTypeBadgeClass(
                      activeItem.type
                    )}`}
                  >
                    {activeItem.type}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-[4px] px-[8px] py-[2px] text-[8px] font-bold leading-none ${getStatusBadgeClass(
                      activeItem.status
                    )}`}
                  >
                    {activeItem.status}
                  </span>
                </div>
              </div>

              {/* Rating & Date */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-700">Rating:</span>
                  {renderStars(activeItem.rating)}
                  <span className="text-[9px] font-bold text-amber-600">
                    ({activeItem.rating}.0 / 5)
                  </span>
                </div>

                <div className="text-right text-[8px] text-slate-500">
                  Received on {activeItem.date} at {activeItem.time}
                </div>
              </div>

              {/* Feedback comment */}
              <div>
                <p className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500">
                  Feedback Summary:
                </p>
                <p className="mt-1 text-[10.5px] font-semibold text-slate-800">
                  "{activeItem.title}"
                </p>
                <div className="mt-2 rounded-[6px] border border-slate-200 bg-white p-3 text-[9.5px] leading-relaxed text-slate-700">
                  {activeItem.comment}
                </div>
              </div>

              {/* Source & Event Info */}
              <div className="grid grid-cols-2 gap-2 text-[8px] text-slate-600">
                <div className="rounded border border-slate-200 p-2">
                  <span className="font-bold text-slate-500">Collection Source:</span>{" "}
                  <span className="font-semibold text-slate-800">{activeItem.source}</span>
                </div>
                <div className="rounded border border-slate-200 p-2">
                  <span className="font-bold text-slate-500">Associated Event:</span>{" "}
                  <span className="font-semibold text-slate-800">{activeItem.event || "Expo 2026"}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(activeItem);
                }}
                className="flex items-center gap-1 h-[30px] rounded-[5px] border border-slate-300 px-3.5 text-[8.5px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Pencil className="h-3 w-3 text-blue-600" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="h-[30px] rounded-[5px] bg-[#075b33] px-4 text-[8.5px] font-semibold text-white hover:bg-[#064e2b] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
