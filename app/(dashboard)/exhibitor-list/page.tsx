"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
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

export interface ExhibitorItem {
  id: number;
  _id: string;
  name: string;
  category: string;
  location: string;
  order: number;
  logo: string;
  altText: string;
  websiteUrl?: string;
  status: "Published" | "Draft";
  updatedAt: string;
  fileSize?: string;
  updatedBy?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

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

const INITIAL_EXHIBITORS: ExhibitorItem[] = [
  { id: 1, _id: "ex1", name: "THE WORLD OF MARĪCT", category: "ORGANIC FOOD", location: "India", order: 1, logo: "/exhibitors/1.jpg", altText: "THE WORLD OF MARĪCT Organic Food Exhibitor Logo", status: "Published", updatedAt: "30 May 2026, 11:30 AM", updatedBy: "Vansh Chaudhary", fileSize: "9.3 KB" },
  { id: 2, _id: "ex2", name: "SNOWFLAKZ", category: "ORGANIC FOOD", location: "India", order: 2, logo: "/exhibitors/2.jpg", altText: "SNOWFLAKZ Organic Expo Brand Logo", status: "Published", updatedAt: "30 May 2026, 10:15 AM", updatedBy: "Vansh Chaudhary", fileSize: "13.8 KB" },
  { id: 3, _id: "ex3", name: "The Pahari Life", category: "ORGANIC FOOD", location: "Himachal Pradesh", order: 3, logo: "/exhibitors/3.jpg", altText: "The Pahari Life Natural Himalayan Organic Products Logo", status: "Published", updatedAt: "29 May 2026, 04:45 PM", updatedBy: "Vansh Chaudhary", fileSize: "11.8 KB" },
  { id: 4, _id: "ex4", name: "Heritiage Oils", category: "ORGANIC FOOD", location: "India", order: 4, logo: "/exhibitors/4.jpg", altText: "Heritage Oils Cold Pressed Cooking Oils Exhibitor Logo", status: "Published", updatedAt: "29 May 2026, 02:20 PM", updatedBy: "Vansh Chaudhary", fileSize: "20.2 KB" },
  { id: 5, _id: "ex5", name: "Tripti Natural Himachal", category: "NATURAL CARE", location: "Himachal Pradesh", order: 5, logo: "/exhibitors/5.jpg", altText: "Tripti Natural Himachal Honey and Organic Care Logo", status: "Published", updatedAt: "28 May 2026, 06:10 PM", updatedBy: "Vansh Chaudhary", fileSize: "17.1 KB" },
  { id: 6, _id: "ex6", name: "FARMIYA ORGANICS", category: "AGRICULTURE", location: "India", order: 6, logo: "/exhibitors/6.jpg", altText: "FARMIYA ORGANICS Sustainable Agriculture Logo", status: "Published", updatedAt: "28 May 2026, 01:15 PM", updatedBy: "Vansh Chaudhary", fileSize: "16.3 KB" },
  { id: 7, _id: "ex7", name: "Saatwik Aaruyeda", category: "AYURVEDA", location: "India", order: 7, logo: "/exhibitors/7.jpg", altText: "Saatwik Ayurveda Traditional Herbal Products Logo", status: "Published", updatedAt: "27 May 2026, 11:05 AM", updatedBy: "Vansh Chaudhary", fileSize: "12.7 KB" },
  { id: 8, _id: "ex8", name: "The Himavan Essence", category: "AYURVEDA", location: "India", order: 8, logo: "/exhibitors/8.jpg", altText: "The Himavan Essence Essential Herbs and Oils Logo", status: "Published", updatedAt: "27 May 2026, 09:40 AM", updatedBy: "Vansh Chaudhary", fileSize: "9.8 KB" },
  { id: 9, _id: "ex9", name: "Prabhushree", category: "ORGANIC FOOD", location: "India", order: 9, logo: "/exhibitors/9.jpg", altText: "Prabhushree Pure Spices and Organic Foods Logo", status: "Published", updatedAt: "26 May 2026, 05:30 PM", updatedBy: "Vansh Chaudhary", fileSize: "9.3 KB" },
  { id: 10, _id: "ex10", name: "SPICES & HERBS", category: "ORGANIC FOOD", location: "India", order: 10, logo: "/exhibitors/10.jpg", altText: "Van Vibhuti Spices and Herbs Natural Brand Logo", status: "Published", updatedAt: "26 May 2026, 03:50 PM", updatedBy: "Vansh Chaudhary", fileSize: "11.4 KB" },
  { id: 11, _id: "ex11", name: "Etbar", category: "NATURAL CARE", location: "India", order: 11, logo: "/exhibitors/11.jpg", altText: "Etbar The Purity You Can Trust Organic Care Logo", status: "Published", updatedAt: "25 May 2026, 12:25 PM", updatedBy: "Vansh Chaudhary", fileSize: "12.7 KB" },
  { id: 12, _id: "ex12", name: "Safe Agri", category: "AGRICULTURE", location: "India", order: 12, logo: "/exhibitors/12.jpg", altText: "Safe Agri Farm Science and Organic Farming Logo", status: "Published", updatedAt: "25 May 2026, 10:00 AM", updatedBy: "Vansh Chaudhary", fileSize: "11.1 KB" },
  { id: 13, _id: "ex13", name: "SHREE HARI", category: "AYURVEDA", location: "India", order: 13, logo: "/exhibitors/13.jpg", altText: "Shree Hari Nursery and Raw Herbs Exhibitor Logo", status: "Published", updatedAt: "24 May 2026, 04:15 PM", updatedBy: "Vansh Chaudhary", fileSize: "14.5 KB" },
  { id: 14, _id: "ex14", name: "Ropuiliani", category: "ORGANIC FOOD", location: "India", order: 14, logo: "/exhibitors/14.jpg", altText: "Ropuiliani Farmers Producer Company Limited Logo", status: "Published", updatedAt: "24 May 2026, 02:40 PM", updatedBy: "Vansh Chaudhary", fileSize: "15.1 KB" },
  { id: 15, _id: "ex15", name: "VEER FITNESS", category: "HEALTH & WELLNESS", location: "India", order: 15, logo: "/exhibitors/15.jpg", altText: "VEER FITNESS Health and Sports Wellness Brand Logo", status: "Published", updatedAt: "23 May 2026, 11:55 AM", updatedBy: "Vansh Chaudhary", fileSize: "12.0 KB" },
  { id: 16, _id: "ex16", name: "Pratham Pahal", category: "AGRICULTURE", location: "India", order: 16, logo: "/exhibitors/16.jpg", altText: "Pratham Pahal Medical and Agricultural Consultancy Logo", status: "Published", updatedAt: "23 May 2026, 09:10 AM", updatedBy: "Vansh Chaudhary", fileSize: "12.5 KB" },
  { id: 17, _id: "ex17", name: "V S Natural", category: "NATURAL CARE", location: "India", order: 17, logo: "/exhibitors/17.jpg", altText: "V S Natural Agro Foods and Wellness Products Logo", status: "Published", updatedAt: "22 May 2026, 03:30 PM", updatedBy: "Vansh Chaudhary", fileSize: "11.9 KB" },
  { id: 18, _id: "ex18", name: "Viraj Agro Foods", category: "ORGANIC FOOD", location: "India", order: 18, logo: "/exhibitors/18.jpg", altText: "Viraj Agro Foods Cold Pressed Mustard Oil Logo", status: "Published", updatedAt: "22 May 2026, 01:20 PM", updatedBy: "Vansh Chaudhary", fileSize: "17.4 KB" },
  { id: 19, _id: "ex19", name: "CFEI", category: "AGRICULTURE", location: "India", order: 19, logo: "/exhibitors/19.jpg", altText: "CFEI Agri Cluster and Farmer Eco Initiative Logo", status: "Published", updatedAt: "21 May 2026, 05:45 PM", updatedBy: "Vansh Chaudhary", fileSize: "13.8 KB" },
  { id: 20, _id: "ex20", name: "PELLE NUDA", category: "NATURAL CARE", location: "India", order: 20, logo: "/exhibitors/20.jpg", altText: "PELLE NUDA Skincare with Purity Brand Logo", status: "Published", updatedAt: "21 May 2026, 11:15 AM", updatedBy: "Vansh Chaudhary", fileSize: "14.1 KB" },
  { id: 21, _id: "ex21", name: "Dadu Fresh", category: "ORGANIC FOOD", location: "India", order: 21, logo: "/exhibitors/21.jpg", altText: "Dadu Fresh Love Nature Stay Healthy Organic Logo", status: "Published", updatedAt: "20 May 2026, 04:50 PM", updatedBy: "Vansh Chaudhary", fileSize: "42.5 KB" },
  { id: 22, _id: "ex22", name: "Bhukranti", category: "AGRICULTURE", location: "India", order: 22, logo: "/exhibitors/22.jpg", altText: "Bhukranti Eco Friendly Soil Bio Fertilizer Logo", status: "Published", updatedAt: "20 May 2026, 10:30 AM", updatedBy: "Vansh Chaudhary", fileSize: "98.5 KB" },
  { id: 23, _id: "ex23", name: "Nutrelis", category: "HEALTH & WELLNESS", location: "India", order: 23, logo: "/exhibitors/23.jpg", altText: "Nutrelis Agro Food Natural Nutrition Logo", status: "Published", updatedAt: "19 May 2026, 03:40 PM", updatedBy: "Vansh Chaudhary", fileSize: "70.2 KB" },
  { id: 24, _id: "ex24", name: "Herbal Eco", category: "AYURVEDA", location: "India", order: 24, logo: "/exhibitors/24.jpg", altText: "Herbal Eco Holistic Natural Wellness Logo", status: "Published", updatedAt: "19 May 2026, 01:10 PM", updatedBy: "Vansh Chaudhary", fileSize: "40.5 KB" },
  { id: 25, _id: "ex25", name: "Khasiyat", category: "ORGANIC FOOD", location: "India", order: 25, logo: "/exhibitors/25.jpg", altText: "Khasiyat Traditional Taste Organic Food Logo", status: "Published", updatedAt: "18 May 2026, 05:25 PM", updatedBy: "Vansh Chaudhary", fileSize: "40.8 KB" },
  { id: 26, _id: "ex26", name: "Shree Ratnam", category: "AYURVEDA", location: "India", order: 26, logo: "/exhibitors/26.jpg", altText: "Shree Ratnam Herbal and Ayurveda Remedies Logo", status: "Published", updatedAt: "18 May 2026, 11:35 AM", updatedBy: "Vansh Chaudhary", fileSize: "19.5 KB" },
  { id: 27, _id: "ex27", name: "Star Holo India", category: "OTHERS", location: "India", order: 27, logo: "/exhibitors/27.jpg", altText: "Star Holo India Organic Security Packaging Logo", status: "Published", updatedAt: "17 May 2026, 04:15 PM", updatedBy: "Vansh Chaudhary", fileSize: "48.8 KB" },
  { id: 28, _id: "ex28", name: "Baiso Organics", category: "ORGANIC FOOD", location: "India", order: 28, logo: "/exhibitors/28.jpg", altText: "Baiso Organics Farm Fresh Products Logo", status: "Published", updatedAt: "17 May 2026, 09:50 AM", updatedBy: "Vansh Chaudhary", fileSize: "51.4 KB" },
  { id: 29, _id: "ex29", name: "Kaki maa", category: "ORGANIC FOOD", location: "India", order: 29, logo: "/exhibitors/29.jpg", altText: "Kaki Maa Desi Achar and Organic Condiments Logo", status: "Published", updatedAt: "16 May 2026, 02:45 PM", updatedBy: "Vansh Chaudhary", fileSize: "56.5 KB" },
  { id: 30, _id: "ex30", name: "Moorahav Organic", category: "AGRICULTURE", location: "India", order: 30, logo: "/exhibitors/30.jpg", altText: "Moorahav Organic Sustainable Crop Solutions Logo", status: "Published", updatedAt: "16 May 2026, 10:20 AM", updatedBy: "Vansh Chaudhary", fileSize: "10.4 KB" },
  { id: 31, _id: "ex31", name: "Mohan Ghee", category: "ORGANIC FOOD", location: "India", order: 31, logo: "/exhibitors/31.jpg", altText: "Mohan Ghee Traditional Bilona Cow Ghee Logo", status: "Published", updatedAt: "15 May 2026, 04:05 PM", updatedBy: "Vansh Chaudhary", fileSize: "11.1 KB" },
  { id: 32, _id: "ex32", name: "Shabari Naturals", category: "NATURAL CARE", location: "India", order: 32, logo: "/exhibitors/32.jpg", altText: "Shabari Naturals Tribal and Forest Organic Produce Logo", status: "Published", updatedAt: "15 May 2026, 11:40 AM", updatedBy: "Vansh Chaudhary", fileSize: "14.2 KB" },
  { id: 33, _id: "ex33", name: "Raheja Solar Food Processing pvt. ltd", category: "AGRICULTURE", location: "India", order: 33, logo: "/exhibitors/33.jpg", altText: "Raheja Solar Food Processing Solar Dryers Logo", status: "Published", updatedAt: "14 May 2026, 03:15 PM", updatedBy: "Vansh Chaudhary", fileSize: "39.0 KB" },
  { id: 34, _id: "ex34", name: "Shanara", category: "NATURAL CARE", location: "India", order: 34, logo: "/exhibitors/34.jpg", altText: "Shanara Herbal Beauty and Care Products Logo", status: "Published", updatedAt: "14 May 2026, 09:30 AM", updatedBy: "Vansh Chaudhary", fileSize: "27.2 KB" },
  { id: 35, _id: "ex35", name: "Good And Grow", category: "AGRICULTURE", location: "India", order: 35, logo: "/exhibitors/35.jpg", altText: "Good And Grow Bio Plant Boosters Logo", status: "Published", updatedAt: "13 May 2026, 04:20 PM", updatedBy: "Vansh Chaudhary", fileSize: "25.6 KB" },
  { id: 36, _id: "ex36", name: "E-Bio-Cares", category: "AYURVEDA", location: "India", order: 36, logo: "/exhibitors/36.jpg", altText: "E-Bio-Cares Natural Health Solutions Logo", status: "Published", updatedAt: "13 May 2026, 10:50 AM", updatedBy: "Vansh Chaudhary", fileSize: "17.3 KB" },
  { id: 37, _id: "ex37", name: "Panchtattav foods Pvt Ltd", category: "ORGANIC FOOD", location: "India", order: 37, logo: "/exhibitors/37.jpg", altText: "Panchtattav Foods Vedic Nutrition Logo", status: "Published", updatedAt: "12 May 2026, 02:35 PM", updatedBy: "Vansh Chaudhary", fileSize: "33.5 KB" },
  { id: 38, _id: "ex38", name: "Sharekhan", category: "OTHERS", location: "India", order: 38, logo: "/exhibitors/38.jpg", altText: "Sharekhan Agri Trade and Commodity Services Logo", status: "Published", updatedAt: "12 May 2026, 11:10 AM", updatedBy: "Vansh Chaudhary", fileSize: "18.4 KB" },
  { id: 39, _id: "ex39", name: "Bhartiye Crafts", category: "OTHERS", location: "India", order: 39, logo: "/exhibitors/39.jpg", altText: "Bhartiye Crafts Eco Handicrafts and Natural Utensils Logo", status: "Published", updatedAt: "11 May 2026, 04:55 PM", updatedBy: "Vansh Chaudhary", fileSize: "13.6 KB" },
  { id: 40, _id: "ex40", name: "Vinayak Group", category: "AGRICULTURE", location: "India", order: 40, logo: "/exhibitors/40.jpg", altText: "Vinayak Group Farm Mechanization and Supplies Logo", status: "Published", updatedAt: "11 May 2026, 01:25 PM", updatedBy: "Vansh Chaudhary", fileSize: "9.5 KB" },
  { id: 41, _id: "ex41", name: "Sri Yamuna Essence", category: "AYURVEDA", location: "India", order: 41, logo: "/exhibitors/41.jpg", altText: "Sri Yamuna Essence Natural Fragrance and Oils Logo", status: "Published", updatedAt: "10 May 2026, 03:40 PM", updatedBy: "Vansh Chaudhary", fileSize: "11.2 KB" },
  { id: 42, _id: "ex42", name: "Kajah Balm & Oil", category: "AYURVEDA", location: "India", order: 42, logo: "/exhibitors/42.jpg", altText: "Kajah Balm & Oil Herbal Pain Relief Formula Logo", status: "Published", updatedAt: "10 May 2026, 10:15 AM", updatedBy: "Vansh Chaudhary", fileSize: "15.4 KB" },
  { id: 43, _id: "ex43", name: "Soultatva", category: "ORGANIC FOOD", location: "India", order: 43, logo: "/exhibitors/43.jpg", altText: "Soultatva Superfoods Seeds and Nuts Brand Logo", status: "Published", updatedAt: "09 May 2026, 05:05 PM", updatedBy: "Vansh Chaudhary", fileSize: "15.9 KB" },
  { id: 44, _id: "ex44", name: "Shroonius", category: "ORGANIC FOOD", location: "India", order: 44, logo: "/exhibitors/44.jpg", altText: "Shroonius Mushroom and Functional Foods Logo", status: "Published", updatedAt: "09 May 2026, 11:30 AM", updatedBy: "Vansh Chaudhary", fileSize: "11.8 KB" },
  { id: 45, _id: "ex45", name: "Skyrr Up", category: "HEALTH & WELLNESS", location: "India", order: 45, logo: "/exhibitors/45.jpg", altText: "Skyrr Up High Protein Dairy and Wellness Logo", status: "Published", updatedAt: "08 May 2026, 02:50 PM", updatedBy: "Vansh Chaudhary", fileSize: "24.9 KB" },
  { id: 46, _id: "ex46", name: "Achyutam Aahar", category: "ORGANIC FOOD", location: "India", order: 46, logo: "/exhibitors/46.jpg", altText: "Achyutam Aahar Pure Organic Flour and Millets Logo", status: "Published", updatedAt: "08 May 2026, 09:45 AM", updatedBy: "Vansh Chaudhary", fileSize: "38.3 KB" },
  { id: 47, _id: "ex47", name: "Grunwald", category: "OTHERS", location: "India", order: 47, logo: "/exhibitors/47.jpg", altText: "Grunwald Packaging and Sustainable Machinery Logo", status: "Published", updatedAt: "07 May 2026, 04:30 PM", updatedBy: "Vansh Chaudhary", fileSize: "15.8 KB" },
  { id: 48, _id: "ex48", name: "Viridian", category: "AYURVEDA", location: "India", order: 48, logo: "/exhibitors/48.jpg", altText: "Viridian Pure Botanical Extract Nutrition Logo", status: "Published", updatedAt: "07 May 2026, 11:00 AM", updatedBy: "Vansh Chaudhary", fileSize: "3.2 KB" },
];

const CATEGORIES = [
  "ALL",
  "ORGANIC FOOD",
  "NATURAL CARE",
  "AGRICULTURE",
  "AYURVEDA",
  "HEALTH & WELLNESS",
  "OTHERS",
];

const CATEGORY_STYLES: Record<string, { badge: string; pill: string }> = {
  "ORGANIC FOOD": { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", pill: "bg-emerald-600 text-white" },
  "NATURAL CARE": { badge: "bg-cyan-50 text-cyan-700 border-cyan-200", pill: "bg-cyan-600 text-white" },
  "AGRICULTURE": { badge: "bg-green-50 text-green-700 border-green-200", pill: "bg-green-600 text-white" },
  "AYURVEDA": { badge: "bg-amber-50 text-amber-700 border-amber-200", pill: "bg-amber-600 text-white" },
  "HEALTH & WELLNESS": { badge: "bg-purple-50 text-purple-700 border-purple-200", pill: "bg-purple-600 text-white" },
  "OTHERS": { badge: "bg-slate-100 text-slate-700 border-slate-200", pill: "bg-slate-700 text-white" },
};

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

export default function ExhibitorListPage() {
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
    return "Super Admin";
  };

  const loggedInAdminName = useMemo(() => getAdminName(), [currentAdmin]);

  const [exhibitors, setExhibitors] = useState<ExhibitorItem[]>(INITIAL_EXHIBITORS);
  const [heading, setHeading] = useState("Our Previous Exhibitors");
  const [subheading, setSubheading] = useState("A Platform Trusted by Industry Leaders");
  const [headingSaved, setHeadingSaved] = useState(false);

  // Filters & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const publishedCount = useMemo(
    () => exhibitors.filter((x) => x.status === "Published").length,
    [exhibitors]
  );
  const draftCount = useMemo(
    () => exhibitors.filter((x) => x.status === "Draft").length,
    [exhibitors]
  );
  const altConfiguredCount = useMemo(
    () => exhibitors.filter((x) => x.altText && x.altText.trim().length > 0).length,
    [exhibitors]
  );

  const statCards = useMemo(
    () => [
      {
        title: "TOTAL EXHIBITORS",
        value: exhibitors.length,
        suffix: "",
        icon: Building2,
        tone: "emerald" as const,
        gradient:
          "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
        borderColor: "#bbf7d0",
        numColor: "#15803d",
        footer: "View full directory",
        onClick: () => setStatusFilter("All Status"),
      },
      {
        title: "PUBLISHED BRANDS",
        value: publishedCount,
        suffix: "",
        icon: Check,
        tone: "violet" as const,
        gradient:
          "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
        borderColor: "#ddd6fe",
        numColor: "#6d28d9",
        footer: "View published brands",
        onClick: () => setStatusFilter("Published"),
      },
      {
        title: "LOGO ASSETS",
        value: exhibitors.length,
        suffix: "",
        icon: ImageIcon,
        tone: "amber" as const,
        gradient:
          "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
        borderColor: "#fed7aa",
        numColor: "#c2410c",
        footer: "View logo assets",
        onClick: () => setStatusFilter("All Status"),
      },
      {
        title: "SEO ALT TAGS",
        value: altConfiguredCount,
        suffix: "",
        icon: Tag,
        tone: "blue" as const,
        gradient:
          "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
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
        gradient:
          "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
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
        gradient:
          "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
        borderColor: "#99f6e4",
        numColor: "#0f766e",
        footer: "Live on website",
        onClick: () => window.open("http://localhost:3002/exhibitors", "_blank"),
      },
    ],
    [exhibitors, publishedCount, draftCount, altConfiguredCount]
  );
  const [selectedId, setSelectedId] = useState<number>(14); // Default to Ropuiliani
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExhibitorItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedAlt, setCopiedAlt] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("ORGANIC FOOD");
  const [formLocation, setFormLocation] = useState("India");
  const [formOrder, setFormOrder] = useState(49);
  const [formLogo, setFormLogo] = useState("");
  const [formAltText, setFormAltText] = useState("");
  const [formStatus, setFormStatus] = useState<"Published" | "Draft">("Published");
  const [formWebsiteUrl, setFormWebsiteUrl] = useState("");
  const [formFileSize, setFormFileSize] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);

  // Load persistence and fetch live data from backend (sorted by order ascending: 1, 2, 3...)
  useEffect(() => {
    try {
      const savedExhibitors = localStorage.getItem("bharat_exhibitor_list_data");
      if (savedExhibitors) {
        const parsed = JSON.parse(savedExhibitors);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((item: ExhibitorItem) => ({
            ...item,
            updatedAt:
              item.updatedAt && (item.updatedAt.includes(":") || item.updatedAt.includes("AM") || item.updatedAt.includes("PM"))
                ? item.updatedAt
                : `${item.updatedAt || "30 May 2026"}, 11:30 AM`,
            updatedBy: item.updatedBy || loggedInAdminName,
          }));
          const sorted = normalized.sort((a: ExhibitorItem, b: ExhibitorItem) => a.order - b.order);
          setExhibitors(sorted);
        }
      }
      const savedHeading = localStorage.getItem("bharat_exhibitor_heading");
      if (savedHeading) setHeading(savedHeading);
      const savedSubheading = localStorage.getItem("bharat_exhibitor_subheading");
      if (savedSubheading) setSubheading(savedSubheading);
    } catch {
      // ignore
    }

    // Fetch live exhibitors and header from backend API with robust fallback
    const fetchBackendData = async () => {
      try {
        let itemsRes = await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/items`).catch(() => null);
        if (!itemsRes || !itemsRes.ok) {
          itemsRes = await fetch(`/api/website/participate/exhibitor-list/items`).catch(() => null);
        }

        let headerRes = await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/header`).catch(() => null);
        if (!headerRes || !headerRes.ok) {
          headerRes = await fetch(`/api/website/participate/exhibitor-list/header`).catch(() => null);
        }

        if (itemsRes && itemsRes.ok) {
          const json = await itemsRes.json().catch(() => null);
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            const mapped: ExhibitorItem[] = json.data.map((item: any, idx: number) => ({
              id: typeof item.order === "number" ? item.order : idx + 1,
              _id: item._id,
              name: item.name || item.title || "Exhibitor",
              category: item.category || "ORGANIC FOOD",
              location: item.location || "India",
              order: typeof item.order === "number" ? item.order : idx + 1,
              logo: item.logo || item.image || "/exhibitors/1.jpg",
              altText: item.altText || `${item.name || item.title} Logo`,
              status: (item.status === "Draft" ? "Draft" : "Published") as "Published" | "Draft",
              websiteUrl: item.websiteUrl || "",
              updatedAt: item.updatedAt ? formatTimestampFrom(item.updatedAt) : formatTimestamp(),
              updatedBy: item.updatedBy || loggedInAdminName,
              fileSize: item.fileSize || "15.0 KB",
            }));
            const sorted = mapped.sort((a, b) => a.order - b.order);
            setExhibitors(sorted);
            try {
              localStorage.setItem("bharat_exhibitor_list_data", JSON.stringify(sorted));
            } catch {}
          }
        }

        if (headerRes && headerRes.ok) {
          const json = await headerRes.json().catch(() => null);
          if (json && json.data) {
            if (json.data.title) {
              setHeading(json.data.title);
              try {
                localStorage.setItem("bharat_exhibitor_heading", json.data.title);
              } catch {}
            }
            if (json.data.subtitle) {
              setSubheading(json.data.subtitle);
              try {
                localStorage.setItem("bharat_exhibitor_subheading", json.data.subtitle);
              } catch {}
            }
          }
        }
      } catch (err) {
        console.error("Failed to load exhibitors from backend:", err);
      }
    };

    fetchBackendData();
  }, [loggedInAdminName]);

  const handleSaveHeading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("bharat_exhibitor_heading", heading);
      localStorage.setItem("bharat_exhibitor_subheading", subheading);

      const payload = JSON.stringify({ title: heading, subtitle: subheading });
      let saved = false;
      try {
        const res = await fetch(`/api/website/participate/exhibitor-list/header`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        if (res.ok) saved = true;
      } catch {}

      if (!saved) {
        await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/header`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
      }
    } catch (err) {
      console.error("Save heading error:", err);
    }
    setHeadingSaved(true);
    showSuccess("Section Heading & Subheading updated successfully!");
    setTimeout(() => setHeadingSaved(false), 3000);
  };

  // Filtered rows (always sorted by order ascending: #1 at top, latest #49 at bottom)
  const filteredRows = useMemo(() => {
    const list = exhibitors.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.altText.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
    return list.sort((a, b) => a.order - b.order);
  }, [exhibitors, searchQuery, statusFilter]);

  // Paginated rows
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Selected item for right details panel
  const selected = useMemo(() => {
    return exhibitors.find((item) => item.id === selectedId) || exhibitors[0];
  }, [exhibitors, selectedId]);

  const defaultCloudinaryLogo = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("ORGANIC FOOD");
    setFormLocation("India");
    setFormOrder(exhibitors.length + 1);
    setFormLogo(defaultCloudinaryLogo);
    setFormAltText("Exhibitor Brand Logo - Bharat Organic Expo");
    setFormStatus("Published");
    setFormWebsiteUrl("");
    setFormFileSize("15.0 KB");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item: ExhibitorItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormLocation(item.location);
    setFormOrder(item.order);
    setFormLogo(item.logo);
    setFormAltText(item.altText);
    setFormStatus(item.status);
    setFormWebsiteUrl(item.websiteUrl || "");
    setFormFileSize(item.fileSize || "");
    setIsModalOpen(true);
  };

  const [isUploading, setIsUploading] = useState(false);

  // Upload file helper (Cloudinary / Backend API)
  const uploadImageFile = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "bharat-organic/exhibitors");

      let res = await fetch(`${BACKEND_URL}/api/uploads?folder=bharat-organic/exhibitors`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        res = await fetch(`/api/uploads?folder=bharat-organic/exhibitors`, {
          method: "POST",
          body: formData,
        });
      }

      if (res.ok) {
        const json = await res.json();
        const finalUrl = json.data?.url || json.url || json.data?.secure_url || json.secure_url;
        if (finalUrl) {
          if (finalUrl.startsWith("http")) return finalUrl;
          return `${BACKEND_URL.replace(/\/$/, "")}${finalUrl.startsWith("/") ? "" : "/"}${finalUrl}`;
        }
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
    } finally {
      setIsUploading(false);
    }
    return URL.createObjectURL(file);
  };

  // Handle Logo Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isReplace = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const activeAdmin = getAdminName();
      const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      const timeNow = formatTimestamp();
      
      const uploadedUrl = await uploadImageFile(file);

      if (isReplace && selected) {
        const updated = exhibitors.map((ex) =>
          ex.id === selected.id
            ? {
                ...ex,
                logo: uploadedUrl,
                image: uploadedUrl,
                fileSize: sizeStr,
                updatedAt: timeNow,
                updatedBy: activeAdmin,
              }
            : ex
        );
        setExhibitors(updated);
        try {
          localStorage.setItem("bharat_exhibitor_list_data", JSON.stringify(updated));
        } catch {}

        try {
          const payload = {
            logo: uploadedUrl,
            image: uploadedUrl,
            fileSize: sizeStr,
            updatedAt: timeNow,
            updatedBy: activeAdmin,
          };
          let res = await fetch(`/api/website/participate/exhibitor-list/items/${selected._id || selected.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/items/${selected._id || selected.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          }
        } catch (err) {
          console.error("Error updating logo in backend:", err);
        }

        showSuccess(`Logo for "${selected.name || "Exhibitor"}" updated by ${activeAdmin}!`);
      } else {
        setFormLogo(uploadedUrl);
        setFormFileSize(sizeStr);
        if (!formAltText) {
          setFormAltText(`${formName || "Exhibitor"} Brand Logo - Bharat Organic Expo`);
        }
      }
    }
  };

  // Save Modal Form
  const handleSaveModal = async (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();

    const activeAdmin = getAdminName();
    const finalName = formName.trim() || "Exhibitor Brand";
    const finalLogo = formLogo.trim() || "/exhibitors/1.jpg";
    const finalAlt = formAltText.trim() || `${finalName} Brand Logo - Bharat Organic Expo Exhibitor`;
    const finalOrder = Number(formOrder) || (editingItem ? editingItem.order : exhibitors.length + 1);
    const timeNow = formatTimestamp();

    if (editingItem) {
      const updatedList = exhibitors
        .map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                name: finalName,
                title: finalName,
                category: formCategory,
                location: formLocation.trim() || "India",
                order: finalOrder,
                logo: finalLogo,
                image: finalLogo,
                altText: finalAlt,
                status: formStatus,
                websiteUrl: formWebsiteUrl.trim(),
                updatedAt: timeNow,
                updatedBy: activeAdmin,
                fileSize: formFileSize || item.fileSize || "15.0 KB",
              }
            : item
        )
        .sort((a, b) => a.order - b.order);
      setExhibitors(updatedList);
      try {
        localStorage.setItem("bharat_exhibitor_list_data", JSON.stringify(updatedList));
      } catch {}

      try {
        const payload = {
          name: finalName,
          title: finalName,
          category: formCategory,
          location: formLocation.trim() || "India",
          order: finalOrder,
          logo: finalLogo,
          image: finalLogo,
          altText: finalAlt,
          status: formStatus,
          websiteUrl: formWebsiteUrl.trim(),
          updatedAt: timeNow,
          updatedBy: activeAdmin,
          fileSize: formFileSize || editingItem.fileSize || "15.0 KB",
        };
        let res = await fetch(`/api/website/participate/exhibitor-list/items/${editingItem._id || editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/items/${editingItem._id || editingItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch (err) {
        console.error("Error updating exhibitor in backend:", err);
      }

      showSuccess(`Exhibitor "${finalName}" updated successfully!`);
    } else {
      const newId = exhibitors.length > 0 ? Math.max(...exhibitors.map((x) => x.id)) + 1 : 1;
      let realBackendId = `ex${newId}`;

      try {
        const payload = {
          name: finalName,
          title: finalName,
          category: formCategory,
          location: formLocation.trim() || "India",
          order: finalOrder,
          logo: finalLogo,
          image: finalLogo,
          altText: finalAlt,
          status: formStatus,
          websiteUrl: formWebsiteUrl.trim(),
          updatedAt: timeNow,
          updatedBy: activeAdmin,
          fileSize: formFileSize || "15.0 KB",
        };
        let res = await fetch(`/api/website/participate/exhibitor-list/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          res = await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data._id) {
            realBackendId = json.data._id;
          }
        }
      } catch (err) {
        console.error("Error creating exhibitor in backend:", err);
      }

      const newItem: ExhibitorItem = {
        id: newId,
        _id: realBackendId,
        name: finalName,
        category: formCategory,
        location: formLocation.trim() || "India",
        order: finalOrder,
        logo: finalLogo,
        altText: finalAlt,
        status: formStatus,
        websiteUrl: formWebsiteUrl.trim(),
        updatedAt: timeNow,
        updatedBy: activeAdmin,
        fileSize: formFileSize || "15.0 KB",
      };
      const updatedList = [...exhibitors, newItem].sort((a, b) => a.order - b.order);
      setExhibitors(updatedList);
      setSelectedId(newId);
      try {
        localStorage.setItem("bharat_exhibitor_list_data", JSON.stringify(updatedList));
      } catch {}

      showSuccess(`New Exhibitor "${finalName}" added successfully!`);
    }

    setIsModalOpen(false);
  };

  // Delete Exhibitor (SweetAlert2 Yes / No Confirmation)
  const handleDelete = async (item: ExhibitorItem) => {
    const result = await Swal.fire({
      title: "Delete Exhibitor?",
      html: `<p style="color:#e2e8f0;font-size:0.9rem;">Are you sure you want to remove <strong>${item.name || "this exhibitor"}</strong> from the directory?<br/>This action cannot be undone.</p>`,
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

    const updated = exhibitors.filter((x) => x.id !== item.id);
    setExhibitors(updated);
    try {
      localStorage.setItem("bharat_exhibitor_list_data", JSON.stringify(updated));
    } catch {}
    if (selectedId === item.id && updated.length > 0) {
      setSelectedId(updated[0].id);
    }

    try {
      let res = await fetch(`/api/website/participate/exhibitor-list/items/${item._id || item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/items/${item._id || item.id}`, {
          method: "DELETE",
        });
      }
    } catch (err) {
      console.error("Error deleting exhibitor in backend:", err);
    }

    showSuccess(`"${item.name || "Exhibitor"}" removed from Exhibitor List.`);
  };

  // Quick Status Toggle / Change
  const handleStatusChange = async (id: number, newStatus: "Published" | "Draft") => {
    const activeAdmin = getAdminName();
    const timeNow = formatTimestamp();
    const target = exhibitors.find((x) => x.id === id);

    const updated = exhibitors.map((ex) =>
      ex.id === id
        ? {
            ...ex,
            status: newStatus,
            updatedAt: timeNow,
            updatedBy: activeAdmin,
          }
        : ex
    );
    setExhibitors(updated);
    try {
      localStorage.setItem("bharat_exhibitor_list_data", JSON.stringify(updated));
    } catch {}

    if (target) {
      try {
        const payload = { status: newStatus, updatedAt: timeNow, updatedBy: activeAdmin };
        let res = await fetch(`/api/website/participate/exhibitor-list/items/${target._id || target.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await fetch(`${BACKEND_URL}/api/website/participate/exhibitor-list/items/${target._id || target.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
      } catch (err) {
        console.error("Error updating status in backend:", err);
      }
    }

    showSuccess(`Status updated to "${newStatus}" for ${target?.name || "Exhibitor"}`);
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
    setSelectedCategory("ALL");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* TOP HEADING — Matching Staff & Team Members Style */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Exhibitor List
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Super Admin only — defines what every internal role can see and do.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <a
              href="http://localhost:3002/exhibitors"
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
              Add New Exhibitor
            </button>
          </div>
        </div>

        {/* METRIC STATS CARDS (Matching Dashboard KPI Style) */}
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
        <section
          className="mt-[14px] rounded-[6px] border border-[#cbe2fc] bg-[#f0f7ff] p-[12px] px-[14px]"
          style={{
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
          }}
        >
          <form onSubmit={handleSaveHeading} className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
            {/* Title Info */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[5px] bg-[#0284c7] text-white shadow-sm">
                <Settings className="h-[16px] w-[16px]" />
              </span>
              <div>
                <h2 className="text-[11.5px] font-bold text-[#0369a1]">
                  Exhibitors Showcase Section Content
                </h2>
                <p className="text-[9px] font-medium text-[#52637a]">
                  Changes here directly update the title and subtitle on the live website exhibitors page.
                </p>
              </div>
            </div>

            {/* Inputs + Button Container - Compact & Auto-fitting */}
            <div className="flex flex-1 items-end justify-end gap-2 min-w-0">
              <div className="flex-1 min-w-[130px] max-w-[180px]">
                <label className="mb-0.5 block text-[8px] font-bold uppercase tracking-wider text-[#34445f]">
                  Heading
                </label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. Our Previous Exhibitors"
                  className="h-[32px] w-full rounded-[4px] border border-[#cbd8d1] bg-white px-2 text-[10px] font-semibold text-[#142347] outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="flex-1 min-w-[150px] max-w-[210px]">
                <label className="mb-0.5 block text-[8px] font-bold uppercase tracking-wider text-[#34445f]">
                  Sub Heading
                </label>
                <input
                  type="text"
                  value={subheading}
                  onChange={(e) => setSubheading(e.target.value)}
                  placeholder="e.g. A Platform Trusted by Industry Leaders"
                  className="h-[32px] w-full rounded-[4px] border border-[#cbd8d1] bg-white px-2 text-[10px] font-semibold text-[#142347] outline-none focus:border-[#0284c7]"
                />
              </div>

              <button
                type="submit"
                className="h-[32px] shrink-0 inline-flex items-center justify-center gap-1 rounded-[4px] bg-[#0284c7] px-3.5 text-[9.5px] font-bold text-white shadow-sm transition hover:bg-[#0369a1]"
              >
                {headingSaved ? <Check className="h-3 w-3 text-emerald-200" /> : null}
                {headingSaved ? "Saved!" : "Update Header"}
              </button>
            </div>
          </form>
        </section>



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
                  placeholder="Search exhibitor by name..."
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

            {/* EXHIBITORS DATA: TABLE VIEW */}
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
                          Exhibitor
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
                            No exhibitors match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((item) => {
                          const isCurrent = selectedId === item.id;
                          const adminName = item.updatedBy || loggedInAdminName || "Super Admin";
                          const formattedDate = item.updatedAt && (item.updatedAt.includes(":") || item.updatedAt.includes("AM") || item.updatedAt.includes("PM"))
                            ? item.updatedAt
                            : `${item.updatedAt || "12 Sept 2026"}, 04:30 PM`;

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
                                      src={item.logo}
                                      alt={item.altText}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0 overflow-hidden">
                                    <span className="truncate text-[8.5px] font-semibold text-[#4B1426] block">
                                      {item.name}
                                    </span>
                                    <span className="mt-[2px] inline-block rounded-[3px] bg-[#f0f4f8] px-[5px] py-[1px] font-mono text-[7px] font-semibold text-[#233D4D]">
                                      {item.fileSize || "14 KB"}
                                    </span>
                                  </div>
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

                              {/* STATUS DROPDOWN — Styled Native Select identical to CMS publish dropdown */}
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

                              {/* ACTIONS — Glassmorphism Effect matching Staff page */}
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
                                    title="Edit Exhibitor"
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
                                    title="Delete Exhibitor"
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

                {/* Table Footer Stats & Pagination (Staff style) */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2563eb]">
                      Total Exhibitors: <strong className="font-bold text-[#1d4ed8]">{filteredRows.length}</strong>
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
                      <option value={48}>All (48) / page</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* GRID VIEW (Similar to Website Card Showcase) */
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
                          src={item.logo}
                          alt={item.altText}
                          className="max-h-[80px] max-w-full object-contain"
                        />
                      </div>
                      <p className="mt-2 text-center text-[10px] font-bold text-[#19274a] line-clamp-1">
                        {item.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR: EXHIBITOR DETAILS (Exact Media Library Style) */}
          <aside className="space-y-[12px]">
            {/* EXHIBITOR DETAILS CARD */}
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
                  Exhibitor Details
                </h2>
                <ChevronDown className="h-[14px] w-[14px] rotate-180 text-[#59657a]" />
              </div>

              <div className="mt-[12px]">
                {/* LOGO PREVIEW CONTAINER */}
                <div className="relative flex h-[140px] w-full items-center justify-center rounded-[8px] border border-[#e4e7eb] bg-white p-3 shadow-inner">
                  <img
                    src={selected.logo}
                    alt={selected.altText}
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
                    <span className="font-semibold text-[#69758c]">Display Order:</span>{" "}
                    <span className="font-bold" style={{ color: "#006199" }}>Position #{selected.order}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#69758c]">Updated on:</span>{" "}
                    <span className="font-semibold" style={{ color: "#4B1426" }}>
                      {selected.updatedAt && (selected.updatedAt.includes(":") || selected.updatedAt.includes("AM") || selected.updatedAt.includes("PM"))
                        ? selected.updatedAt
                        : `${selected.updatedAt || "30 May 2026"}, 11:30 AM`}
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
                        navigator.clipboard?.writeText(selected.altText);
                        setCopiedAlt(true);
                        setTimeout(() => setCopiedAlt(false), 2000);
                      }}
                      className="text-[8px] font-semibold text-[#075b33] hover:underline"
                    >
                      {copiedAlt ? "Copied!" : "Copy Tag"}
                    </button>
                  </div>
                  <div className="rounded-[6px] border border-[#e2e6ea] bg-[#fbfcfd] p-2">
                    <p className="text-[8.5px] font-medium leading-[1.4] text-[#475569] break-words">
                      {selected.altText}
                    </p>
                  </div>
                </div>

                {/* LOGO URL */}
                <div className="mt-[10px]">
                  <p className="mb-[4px] text-[9px] font-semibold text-[#34425e]">Logo Asset URL:</p>
                  <div className="flex items-center gap-[8px] rounded-[6px] border border-[#e2e6ea] bg-[#fbfcfd] px-[9px] py-[7px]">
                    <p className="min-w-0 flex-1 truncate text-[8px] font-semibold leading-[1.35] text-[#59657a]">
                      {selected.logo}
                    </p>
                    <Copy
                      className="h-[13px] w-[13px] shrink-0 text-[#60708a] cursor-pointer hover:text-[#075b33]"
                      onClick={() => {
                        navigator.clipboard?.writeText(selected.logo);
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
                  Add Exhibitor
                </button>

                <a
                  href="http://localhost:3002/exhibitors"
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

        {/* MODAL: ADD / EDIT EXHIBITOR (Matching Staff New Account Modal UI & Animations) */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Edit Exhibitor" : "New Exhibitor"}
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
                {editingItem ? "Save Changes" : "Create Account"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Ropuiliani"
            />

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
              <Label required>Exhibitor Logo</Label>
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
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Logo Alt Tag (SEO & Accessibility)"
              required
              value={formAltText}
              onChange={(e) => setFormAltText(e.target.value)}
              placeholder="e.g. Ropuiliani Organic Food Exhibitor Logo - Bharat Organic Expo"
              hint="Unique for every exhibitor. Embedded into HTML <img alt='...'> tag for image SEO and screen readers."
            />
          </div>
        </Modal>
      </div>
    </main>
  );
}
