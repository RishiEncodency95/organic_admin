"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileCode,
  Save,
  Upload,
  Trash2,
  FileText,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Info,
  AlertTriangle,
  Plus,
  Share2,
} from "lucide-react";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import typography from "../pages/PagesTypography.module.css";

const FacebookIcon = ({ size = 16, color = "#1877F2" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 16, color = "#E4405F" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 16, color = "#000000" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = ({ size = 16, color = "#FF0000" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill={color} />
  </svg>
);

const LinkedinIcon = ({ size = 16, color = "#0A66C2" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// SweetAlert2 theme matching admin portal dark style from Exhibitor List
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

interface SeoFile {
  _id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  size: number;
  uploadedAt: string;
}

// Custom Toggle matching Pages Edit Section 3 & 4
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative
        h-[20px]
        w-[38px]
        shrink-0
        rounded-full
        transition-colors
        duration-200
        cursor-pointer
        ${checked ? "bg-[#16a34a]" : "bg-[#dc2626]"}
      `}
    >
      <span
        className={`
          absolute
          top-[3px]
          h-[14px]
          w-[14px]
          rounded-full
          bg-white
          shadow-sm
          transition-all
          duration-200
          ${checked ? "left-[21px]" : "left-[3px]"}
        `}
      />
    </button>
  );
}

export default function AdvancedSeoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [scripts, setScripts] = useState({
    headerScripts: "",
    footerScripts: "",
  });
  const [seoFiles, setSeoFiles] = useState<SeoFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [allowIndex, setAllowIndex] = useState(true);
  const [allowFollow, setAllowFollow] = useState(true);

  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://www.facebook.com/bharatorganicexpo",
    instagram: "https://www.instagram.com/bharatorganicexpo",
    twitter: "https://x.com/organicexpoin",
    youtube: "https://www.youtube.com/@bharatorganicexpo",
    linkedin: "https://www.linkedin.com/company/bharatorganicexpo/",
  });
  const [savingSocial, setSavingSocial] = useState(false);

  const headerRef = useRef<HTMLTextAreaElement>(null);
  const footerRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsPageLoading(true);
      const response = await api.get<any>("/seo-settings/advanced");
      const data = response?.data || response;
      if (data) {
        setScripts({
          headerScripts: data.headerScripts || "",
          footerScripts: data.footerScripts || "",
        });
        setSeoFiles(data.seoFiles || []);
        if (data.socialLinks) {
          setSocialLinks({
            facebook: data.socialLinks.facebook || "",
            instagram: data.socialLinks.instagram || "",
            twitter: data.socialLinks.twitter || "",
            youtube: data.socialLinks.youtube || "",
            linkedin: data.socialLinks.linkedin || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching Advanced SEO settings:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setScripts((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveScripts = async () => {
    try {
      setIsLoading(true);
      const response = await api.put<any>("/seo-settings/scripts", {
        ...scripts,
        socialLinks,
      });
      const data = response?.data || response;

      showSuccess("Global tracking scripts & social links saved successfully!");

      if (data) {
        setScripts({
          headerScripts: data.headerScripts ?? scripts.headerScripts,
          footerScripts: data.footerScripts ?? scripts.footerScripts,
        });
        if (data.socialLinks) {
          setSocialLinks((prev) => ({
            ...prev,
            ...data.socialLinks,
          }));
        }
      }
    } catch (error: any) {
      showError(error?.message || "Failed to update global scripts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    try {
      setSavingSocial(true);
      const response = await api.put<any>("/seo-settings/social-links", socialLinks);
      const data = response?.data || response;

      showSuccess("Social media links saved successfully!");

      if (data) {
        setSocialLinks((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (error: any) {
      showError(error?.message || "Failed to update social media links");
    } finally {
      setSavingSocial(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!["xml", "html", "txt"].includes(ext)) {
      showError("Only .xml, .html, and .txt files are allowed for SEO verification & crawlers.");
      return;
    }

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.postForm<any>("/seo-settings/upload-file", formData);
      const data = response?.data || response;

      if (Array.isArray(data)) {
        setSeoFiles(data);
      } else {
        await fetchData();
      }

      showSuccess(`${file.name} uploaded successfully and active at root!`);
    } catch (error: any) {
      showError(error?.message || "File upload failed. Please try again.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    const result = await Swal.fire({
      title: "Delete this SEO file?",
      html: `<p style="color:#e2e8f0;font-size:0.9rem;">Are you sure you want to permanently delete <strong>${fileName}</strong> from server storage?<br/>Crawlers requesting this root path will receive a 404.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete File",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#374151",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.delete<any>(`/seo-settings/file/${fileId}`);
      const data = response?.data || response;
      if (Array.isArray(data)) {
        setSeoFiles(data);
      } else {
        setSeoFiles((prev) => prev.filter((f) => f._id !== fileId && f.fileName !== fileId));
      }

      showSuccess(`"${fileName}" deleted successfully.`);
    } catch (error: any) {
      showError(error?.message || "Failed to delete file.");
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveScripts();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scripts]);

  // Quick Template Injectors
  const insertGtmTemplate = (env: "local" | "live") => {
    const gtmId = env === "local" ? "GTM-TEST001" : "GTM-BOE2027";
    const headSnippet = `<!-- Google Tag Manager (${env.toUpperCase()}) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->`;

    const bodySnippet = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

    setScripts((prev) => ({
      ...prev,
      headerScripts: prev.headerScripts ? `${prev.headerScripts}\n\n${headSnippet}` : headSnippet,
      footerScripts: prev.footerScripts ? `${prev.footerScripts}\n\n${bodySnippet}` : bodySnippet,
    }));
    showSuccess(`Injected Google Tag Manager snippet (${env.toUpperCase()})`);
  };

  if (isPageLoading) {
    return (
      <main className={`${typography.pages} h-full min-h-0 w-full flex flex-col items-center justify-center bg-[#fffefb]`}>
        <div className="w-10 h-10 border-4 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Loading Advanced SEO Settings...
        </p>
      </main>
    );
  }

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* =========================================================
            TOP HEADING — Matching Staff & Exhibitor List Style
        ========================================================= */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Advanced SEO Settings
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Super Admin only — configure global tracking scripts, search crawler verifications, and root files.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <a
              href="http://localhost:3002/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm cursor-pointer"
            >
              <Globe className="h-[12px] w-[12px] text-[#ea580c]" strokeWidth={1.7} />
              View Live Sitemap
            </a>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#e2e6ea] bg-white px-[14px] text-[8.5px] font-semibold text-[#33415b] transition hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              <Plus className="h-[12px] w-[12px] text-[#075b33]" strokeWidth={1.7} />
              Upload Root File
            </button>

            <button
              type="button"
              onClick={handleSaveScripts}
              disabled={isLoading}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d] disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <div className="h-[12px] w-[12px] border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-[12px] w-[12px]" strokeWidth={1.7} />
              )}
              Save All Scripts
              <span className="ml-1 text-[8px] bg-white/20 px-1 py-0.2 rounded font-mono hidden sm:inline">
                Ctrl+S
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================
            MAIN SPLIT CONTENT:
            LEFT: lg:col-span-2 (Exact Design House width)
            RIGHT: lg:col-span-1 (Exact Design House width)
        ========================================================= */}
        <section className="mt-[14px] grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* =========================================================
              LEFT COLUMN: SCRIPT EDITORS (lg:col-span-2)
          ========================================================= */}
          <div className="lg:col-span-2 min-w-0 space-y-6">
            <section className="bg-white border-2 border-gray-200 p-6 shadow-lg shrink-0 rounded-none">
              {/* Header inside Box */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      1. Global Script Injection & Tracking
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Manage meta tags, Open Graph globals, Google Tag Manager, Analytics & Meta Pixel for live layout.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => insertGtmTemplate("local")}
                    className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Auto-generate tags for Local environment (http://localhost:3002)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Auto Generate (Local)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertGtmTemplate("live")}
                    className="px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Auto-generate tags for Live environment (https://bharatorganicexpo.com)"
                  >
                    <Globe className="w-3.5 h-3.5 text-green-600" />
                    Auto Generate (Live)
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 gap-4">
                {/* Target Scope Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Target Scope <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={true}
                    className="w-full px-3 py-2 border-2 border-gray-300 bg-gray-100 text-gray-700 focus:outline-none text-xs shadow-sm cursor-not-allowed font-medium"
                  >
                    <option value="global">
                      Global Injection (All Pages & Dynamic Routes — bharatorganicexpo.com)
                    </option>
                  </select>
                  <p className="mt-1 text-[10px] text-gray-400">
                    Injected in the root Next.js document layout to guarantee persistent tracking across all page navigations.
                  </p>
                </div>

                {/* Header Scripts Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-800">
                      Header Scripts (Inside &lt;head&gt;) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {scripts.headerScripts.length} chars | {scripts.headerScripts.split("\n").length} lines
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(scripts.headerScripts, "header")}
                        className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer font-medium flex items-center gap-1"
                      >
                        {copiedField === "header" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied Tag!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Tag</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={headerRef}
                    name="headerScripts"
                    value={scripts.headerScripts}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                    placeholder="<!-- Paste Google Tag Manager (head snippet), Google Analytics (gtag.js), or Meta Pixel code -->
<script>
  // Example global header tracking
</script>"
                    spellCheck="false"
                  />
                  <p className="text-[11px] text-gray-500">
                    Paste Google Tag Manager (head snippet), Google Analytics (gtag.js), or Meta Pixel code.
                  </p>
                </div>

                {/* Footer Scripts Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-800">
                      Footer Scripts (Before &lt;/body&gt;) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {scripts.footerScripts.length} chars | {scripts.footerScripts.split("\n").length} lines
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(scripts.footerScripts, "footer")}
                        className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer font-medium flex items-center gap-1"
                      >
                        {copiedField === "footer" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied Tag!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Tag</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={footerRef}
                    name="footerScripts"
                    value={scripts.footerScripts}
                    onChange={handleInputChange}
                    rows={8}
                    className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                    placeholder="<!-- Scripts that should load after page content (Chat widgets, Hotjar, conversion tracking) -->
<noscript><iframe src='https://www.googletagmanager.com/ns.html?id=GTM-BOE2027' height='0' width='0' style='display:none;visibility:hidden'></iframe></noscript>"
                    spellCheck="false"
                  />
                  <p className="text-[11px] text-gray-500">
                    Scripts that should load after page content (Chat widgets, Hotjar, conversion tracking).
                  </p>
                </div>

                {/* Indexing / Crawlers Toggles matching Page Edit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px] bg-gray-50">
                    <div>
                      <p className="text-[11px] font-semibold text-[#3a4557]">
                        Allow Search Engines to Index
                      </p>
                      <p className="mt-[2px] text-[9px] font-medium text-[#8b929c]">
                        Turn off to add a noindex tag to global layout.
                      </p>
                    </div>
                    <Toggle
                      checked={allowIndex}
                      onChange={(value) => setAllowIndex(value)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px] bg-gray-50">
                    <div>
                      <p className="text-[11px] font-semibold text-[#3a4557]">
                        Allow Search Engines to Follow Links
                      </p>
                      <p className="mt-[2px] text-[9px] font-medium text-[#8b929c]">
                        Turn off to add a nofollow tag to global layout.
                      </p>
                    </div>
                    <Toggle
                      checked={allowFollow}
                      onChange={(value) => setAllowFollow(value)}
                    />
                  </div>
                </div>

                {/* Save Global Scripts Button Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Scripts are saved directly to database and injected dynamically in layout.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveScripts}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-[#4B1426] hover:bg-[#3a0f1d] text-white font-bold text-xs rounded transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
                  >
                    {isLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Scripts</span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* =========================================================
              RIGHT COLUMN: FILE UPLOADS (lg:col-span-1)
          ========================================================= */}
          <div className="lg:col-span-1 min-w-0 space-y-6">
            <section className="bg-white border-2 border-gray-200 p-6 shadow-lg shrink-0 rounded-none">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      2. Static SEO & Root Files
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Verification & crawler files served at root domain.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active on Live Site
                </span>
              </div>

              {/* Upload Drag & Drop Area matching OG Image Upload style */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Upload Static Files (.xml, .html, .txt)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded p-6 text-center relative transition-all cursor-pointer ${
                    isDragging
                      ? "border-[#134698] bg-blue-50/50 scale-[0.99]"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    accept=".xml,.html,.txt"
                  />

                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-600 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-105">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-800">
                        Click to upload
                      </span>{" "}
                      <span className="text-xs text-gray-500">or drag and drop</span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Sitemap, Robots.txt, Google Verification HTML
                    </p>
                  </div>

                  {uploadingFile && (
                    <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center rounded space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-semibold text-blue-700">Uploading file to server root...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-[11px] font-bold text-[#134698] uppercase tracking-wider">
                    Active Files ({seoFiles.length})
                  </h3>
                  <span className="text-[10px] text-gray-400 font-semibold">Direct Root Access</span>
                </div>

                {seoFiles.length === 0 ? (
                  <div className="py-8 text-center bg-gray-50 rounded border-2 border-dashed border-gray-200">
                    <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                      No files uploaded yet
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Upload your sitemap.xml, robots.txt, or verification files above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {seoFiles.map((file) => (
                      <div
                        key={file._id || file.fileName}
                        className="flex items-center justify-between p-3 border border-gray-200 bg-white hover:border-blue-300 transition-all rounded-none"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-gray-100 rounded text-gray-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                            <FileText className="w-4 h-4 text-[#0284c7]" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-900 truncate">
                              {file.originalName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9.5px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                                Serving at root
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`${backendUrl}/seo-files/${file.fileName}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Open file in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file._id || file.fileName, file.originalName)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notice Callout matching Page Edit */}
              <div className="mt-5 p-3.5 bg-orange-50 border-l-4 border-orange-500 rounded-none">
                <div className="flex items-center gap-1.5 text-orange-900 text-xs font-bold uppercase tracking-tight mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  <span>Notice</span>
                </div>
                <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                  Files uploaded here are served directly from the root domain (e.g.,{" "}
                  <code className="bg-orange-100 px-1 py-0.5 rounded font-mono text-[10px]">
                    bharatorganicexpo.com/sitemap.xml
                  </code>
                  ) for search crawlers and search console verification.
                </p>
              </div>
            </section>

            {/* =========================================================
                SECTION 3: SOCIAL MEDIA LINKS & FLOATING SIDEBAR
            ========================================================= */}
            <section className="bg-white border-2 border-gray-200 p-6 shadow-lg shrink-0 rounded-none">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded text-blue-600">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      3. Social Media Links
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Syncs with floating sidebar & website footer.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSocialLinks}
                  disabled={savingSocial}
                  className="px-3.5 py-1.5 bg-[#134698] hover:bg-[#0f3777] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingSocial ? "Saving..." : "Save Links"}
                </button>
              </div>

              <div className="space-y-4">
                {/* Facebook */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                      <FacebookIcon size={12} color="#1877F2" />
                    </span>
                    Facebook URL
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={socialLinks.facebook}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, facebook: e.target.value })
                      }
                      placeholder="https://www.facebook.com/yourpage"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-9 font-mono"
                    />
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2 text-gray-400 hover:text-blue-600 p-1"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Instagram */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F]">
                      <InstagramIcon size={12} color="#E4405F" />
                    </span>
                    Instagram URL
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={socialLinks.instagram}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, instagram: e.target.value })
                      }
                      placeholder="https://www.instagram.com/yourpage"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-9 font-mono"
                    />
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2 text-gray-400 hover:text-pink-600 p-1"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Twitter / X */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-900">
                      <TwitterIcon size={12} color="#000000" />
                    </span>
                    Twitter / X URL
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={socialLinks.twitter}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, twitter: e.target.value })
                      }
                      placeholder="https://x.com/yourpage"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-9 font-mono"
                    />
                    {socialLinks.twitter && (
                      <a
                        href={socialLinks.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2 text-gray-400 hover:text-gray-900 p-1"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* YouTube */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#FF0000]/10 flex items-center justify-center text-[#FF0000]">
                      <YoutubeIcon size={12} color="#FF0000" />
                    </span>
                    YouTube URL
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={socialLinks.youtube}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, youtube: e.target.value })
                      }
                      placeholder="https://www.youtube.com/@yourchannel"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-9 font-mono"
                    />
                    {socialLinks.youtube && (
                      <a
                        href={socialLinks.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2 text-gray-400 hover:text-red-600 p-1"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2]">
                      <LinkedinIcon size={12} color="#0A66C2" />
                    </span>
                    LinkedIn URL
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={socialLinks.linkedin}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, linkedin: e.target.value })
                      }
                      placeholder="https://www.linkedin.com/company/yourpage"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-9 font-mono"
                    />
                    {socialLinks.linkedin && (
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-2 text-gray-400 hover:text-blue-700 p-1"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSaveSocialLinks}
                  disabled={savingSocial}
                  className="w-full py-2 bg-[#134698] hover:bg-[#0f3777] text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingSocial ? "Saving Changes..." : "Save Social Media Links"}
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
