"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import typography from "../../pages/PagesTypography.module.css";
import Swal from "sweetalert2";
import { uploadApi } from "@/lib/uploadApi";
import { blogsApi } from "@/lib/blogsApi";
import RichTextEditor from "@/components/RichTextEditor";
import {
  ArrowLeft,
  Calendar,
  Check,
  Code,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Save,
  Trash2,
  Upload,
} from "lucide-react";

// SweetAlert toast matching admin dark / light style
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
  iconColor: "#4ade80",
});

function showSuccess(msg: string) {
  Toast.fire({ icon: "success", title: msg });
}

function showError(msg: string) {
  Toast.fire({ icon: "error", title: msg, iconColor: "#f87171" });
}

function showWarning(msg: string) {
  Swal.fire({
    icon: "warning",
    title: "Missing Required Field",
    text: msg,
    confirmButtonColor: "#134698",
    background: "#ffffff",
  });
}

function AddNewPostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const [blogData, setBlogData] = useState({
    title: "",
    h1Title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Expo News",
    author: "Bharat Organic Expo Admin",
    tags: "organic expo, sustainable agriculture, ayurveda",
    status: "published",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    imageAlt: "",
    ogTitle: "",
    ogDescription: "",
    canonicalTag: "",
    schemaMarkup: "",
    openGraphTags: "",
    metaKeywords: "",
    readTime: "4 min read",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [ogImagePreview, setOgImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlugDetached, setIsSlugDetached] = useState(false);

  // Schedule states
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });

  // ================= INPUT HANDLER =================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setBlogData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "status") {
        if (value === "scheduled") {
          setIsScheduled(true);
        } else {
          setIsScheduled(false);
        }
      }

      // Auto-generate slug from title if user hasn't manually edited slug
      if (name === "title" && !isSlugDetached) {
        const autoSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        updated.slug = autoSlug;
        if (!prev.metaTitle || prev.metaTitle === prev.title) {
          updated.metaTitle = value.slice(0, 65);
        }
        if (!prev.ogTitle || prev.ogTitle === prev.title) {
          updated.ogTitle = value;
        }
      }

      if (name === "slug") {
        setIsSlugDetached(true);
      }

      return updated;
    });
  };

  // ================= IMAGE HANDLERS =================
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (!blogData.imageAlt && blogData.title) {
        setBlogData((prev) => ({
          ...prev,
          imageAlt: `${blogData.title} - Bharat Organic Expo`,
        }));
      }
      // Upload immediately so real URL is available
      try {
        const uploadRes = await uploadApi.file(file, "bharat-organic/blogs");
        if (uploadRes && uploadRes.url) {
          setImagePreview(uploadRes.url);
        }
      } catch (err) {
        console.warn("Featured image background upload failed, will retry on submit:", err);
      }
    }
  };

  const handleOgImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOgImageFile(file);
      setOgImagePreview(URL.createObjectURL(file));
      try {
        const uploadRes = await uploadApi.file(file, "bharat-organic/blogs");
        if (uploadRes && uploadRes.url) {
          setOgImagePreview(uploadRes.url);
          setBlogData((prev) => ({ ...prev, ogImage: uploadRes.url }));
        }
      } catch (err) {
        console.warn("OG image background upload failed, will retry on submit:", err);
      }
    }
  };

  // Calculate word count
  const wordCount = useMemo(() => {
    const rawText = blogData.content.replace(/<[^>]*>/g, " ").trim();
    return rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  }, [blogData.content]);

  // Handle Edit Mode / Pre-populate from API or LocalStorage
  useEffect(() => {
    if (editId) {
      setIsLoading(true);
      blogsApi
        .getByIdOrSlug(editId)
        .then((res: any) => {
          const item = res?.data || res;
          if (item && item.title) {
            setBlogData({
              title: item.title || "",
              h1Title: item.h1Title || item.title || "",
              slug: item.slug || "",
              excerpt: item.excerpt || "",
              content: item.content || "",
              category: item.category || "Expo News",
              author: item.author || "Bharat Organic Expo Admin",
              tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""),
              status: item.status || "published",
              featured: Boolean(item.showOnHome ?? item.featured),
              metaTitle: item.metaTitle || item.title || "",
              metaDescription: item.metaDescription || item.excerpt || "",
              imageAlt: item.imageAlt || "",
              ogTitle: item.ogTitle || item.title || "",
              ogDescription: item.ogDescription || item.metaDescription || item.excerpt || "",
              canonicalTag: item.canonicalTag || item.canonicalUrl || "",
              schemaMarkup: typeof item.schemaMarkup === "object" ? JSON.stringify(item.schemaMarkup, null, 2) : (item.schemaMarkup || ""),
              openGraphTags: item.openGraphTags || "",
              metaKeywords: item.metaKeywords || "",
              readTime: item.readTime || "4 min read",
            });
            if (item.image) setImagePreview(item.image);
            if (item.ogImage) setOgImagePreview(item.ogImage);
            if (item.status === "scheduled" && item.scheduledDate) {
              setIsScheduled(true);
              const dt = new Date(item.scheduledDate);
              setScheduledDate(dt.toISOString().split("T")[0]);
              setScheduledTime(dt.toTimeString().slice(0, 5));
            }
          }
        })
        .catch(() => {
          // Fallback to local storage if offline
          try {
            const storedBlogs = JSON.parse(localStorage.getItem("admin_blogs_data") || "[]");
            const found = storedBlogs.find((b: any) => String(b.id) === String(editId) || b.slug === editId);
            if (found) {
              setBlogData((prev) => ({
                ...prev,
                ...found,
                author: "Bharat Organic Expo Admin",
              }));
              if (found.image) setImagePreview(found.image);
            }
          } catch {}
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [editId]);

  // ================= SUBMIT HANDLER =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blogData.title.trim()) {
      return showWarning("Please enter a blog main title.");
    }
    if (!blogData.slug.trim()) {
      return showWarning("Please provide a permalink / URL slug.");
    }
    if (!blogData.content.trim()) {
      return showWarning("Please enter the detailed blog description content.");
    }
    if (!blogData.category.trim()) {
      return showWarning("Please select or enter a blog category.");
    }
    if (!imagePreview && !imageFile && !editId) {
      return showWarning("Please upload a featured blog image.");
    }

    try {
      setIsLoading(true);

      // 1. Upload feature image if still blob URL
      let finalImageUrl = imagePreview || "";
      if (imageFile && (!finalImageUrl || finalImageUrl.startsWith("blob:"))) {
        try {
          const up = await uploadApi.file(imageFile, "bharat-organic/blogs");
          if (up && up.url) {
            finalImageUrl = up.url;
            setImagePreview(up.url);
          }
        } catch (e) {
          console.warn("Featured image upload fallback:", e);
        }
      }

      // 2. Upload OG image if still blob URL
      let finalOgImageUrl = ogImagePreview || "";
      if (ogImageFile && (!finalOgImageUrl || finalOgImageUrl.startsWith("blob:"))) {
        try {
          const upOg = await uploadApi.file(ogImageFile, "bharat-organic/blogs");
          if (upOg && upOg.url) {
            finalOgImageUrl = upOg.url;
            setOgImagePreview(upOg.url);
          }
        } catch (e) {
          console.warn("OG image upload fallback:", e);
        }
      }

      // 3. Normalize content so that any escaped tags or literal tags are clean HTML
      let normalizedContent = blogData.content.trim();
      if (/&lt;\s*\/?\s*(h[1-6]|p|div|ul|ol|li|strong|b|em|i|u|span|blockquote|br|a|img|hr)\b/i.test(normalizedContent)) {
        normalizedContent = normalizedContent
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">")
          .replace(/&quot;/gi, '"')
          .replace(/&#39;/gi, "'")
          .replace(/&amp;/gi, "&");
      }
      if (/&lt;\s*\/?\s*(h[1-6]|p|div|ul|ol|li|strong|b|em|i|u|span|blockquote|br|a|img|hr)\b/i.test(normalizedContent)) {
        normalizedContent = normalizedContent
          .replace(/&lt;/gi, "<")
          .replace(/&gt;/gi, ">");
      }
      if (!/<(h[1-6]|p|div|ul|ol|li|blockquote|br)\b/i.test(normalizedContent)) {
        normalizedContent = normalizedContent
          .split(/\n{2,}/)
          .map((b) => `<p>${b.replace(/\n/g, "<br>")}</p>`)
          .join("");
      }

      // Auto-extract excerpt from detailed description without any tags
      const plainText = normalizedContent
        .replace(/&lt;[^&]*&gt;/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
      const autoExcerpt = plainText.slice(0, 180) + (plainText.length > 180 ? "..." : "");

      // 4. Build canonical URL
      const canonicalTag =
        blogData.canonicalTag.trim() || `http://localhost:3002/blog/${blogData.slug.trim()}`;

      // 5. Build full payload with all SEO & configuration fields
      const payload: any = {
        title: blogData.title.trim(),
        h1Title: blogData.h1Title.trim() || blogData.title.trim(),
        slug: blogData.slug.trim(),
        excerpt: autoExcerpt,
        content: normalizedContent,
        category: blogData.category.trim(),
        author: "Bharat Organic Expo Admin",
        tags: blogData.tags
          ? typeof blogData.tags === "string"
            ? blogData.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
            : blogData.tags
          : [],
        status: isScheduled ? "scheduled" : blogData.status,
        showOnHome: Boolean(blogData.featured),
        featured: Boolean(blogData.featured),
        scheduledDate:
          (isScheduled || blogData.status === "scheduled") && scheduledDate
            ? `${scheduledDate}T${scheduledTime || "10:00"}:00`
            : null,
        publishDate:
          (isScheduled || blogData.status === "scheduled") && scheduledDate
            ? `${scheduledDate}T${scheduledTime || "10:00"}:00`
            : new Date().toISOString(),
        readTime: blogData.readTime || "4 min read",
        image: finalImageUrl,
        imageAlt: blogData.imageAlt.trim() || `${blogData.title} - Bharat Organic Expo`,

        // SEO Fields
        metaTitle: blogData.metaTitle.trim() || blogData.title.trim(),
        metaDescription: blogData.metaDescription.trim() || autoExcerpt,
        canonicalTag: canonicalTag,
        canonicalUrl: canonicalTag,
        ogTitle: blogData.ogTitle.trim() || blogData.title.trim(),
        ogDescription: blogData.ogDescription.trim() || blogData.metaDescription.trim() || autoExcerpt,
        ogImage: finalOgImageUrl || finalImageUrl,
        openGraphTags: blogData.openGraphTags ? blogData.openGraphTags.trim() : "",
        schemaMarkup: blogData.schemaMarkup,
        metaKeywords: blogData.metaKeywords,
      };

      // 6. Call Backend API
      let savedPost: any = null;
      if (editId) {
        savedPost = await blogsApi.update(editId, payload);
      } else {
        savedPost = await blogsApi.create(payload);
      }

      // 7. Also mirror to localStorage for instant offline/optimistic compatibility
      try {
        const storedBlogs = JSON.parse(localStorage.getItem("admin_blogs_data") || "[]");
        const newPostItem = {
          id: editId ? Number(editId) : Date.now(),
          _id: savedPost?._id || editId,
          ...payload,
          views: editId ? 1245 : 0,
          date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        };

        if (editId) {
          const idx = storedBlogs.findIndex((b: any) => String(b.id) === String(editId) || b._id === editId);
          if (idx !== -1) storedBlogs[idx] = newPostItem;
          else storedBlogs.unshift(newPostItem);
        } else {
          storedBlogs.unshift(newPostItem);
        }
        localStorage.setItem("admin_blogs_data", JSON.stringify(storedBlogs));
      } catch {}

      await Swal.fire({
        icon: "success",
        title: editId
          ? "Blog Updated!"
          : blogData.status === "scheduled"
          ? "Blog Scheduled Successfully!"
          : "Blog Story Published!",
        text:
          blogData.status === "scheduled"
            ? `"${blogData.title}" is scheduled to publish on ${scheduledDate} at ${scheduledTime}.`
            : `"${blogData.title}" has been saved successfully with full SEO configuration.`,
        confirmButtonColor: "#4B1426",
        timer: 2200,
      });

      router.push("/blogs");
    } catch (err: any) {
      console.error("Save blog post error:", err);
      showError(err?.message || "Failed to save blog post. Please check inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    setBlogData((prev) => ({ ...prev, status: "draft" }));
    showSuccess("Saved as Draft! You can continue editing.");
  };

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* ================= TOP HEADER (Matching Exhibitor List / Blogs) ================= */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              {editId ? "Update Blog Post" : "Add New Post"}
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Super Admin only — defines what every internal role can see and do.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            {/* Back to List */}
            <button
              type="button"
              onClick={() => router.push("/blogs")}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] transition hover:bg-[#ffedd5] shadow-sm"
            >
              <ArrowLeft className="h-[12px] w-[12px] text-[#ea580c]" strokeWidth={1.8} />
              Back to List
            </button>

            {/* Save Draft */}
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fecaca] bg-[#fef2f2] px-[14px] text-[8.5px] font-bold text-[#dc2626] transition hover:bg-[#fee2e2] shadow-sm"
            >
              <Save className="h-[12px] w-[12px] text-[#dc2626]" strokeWidth={2} />
              Save Draft
            </button>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#075b33] px-[16px] text-[8.5px] font-bold text-white shadow-[0_5px_12px_rgba(7,91,51,0.25)] transition hover:bg-[#054626] disabled:opacity-50"
            >
              <Check className="h-[12px] w-[12px]" strokeWidth={2.2} />
              <span>{isLoading ? "Saving..." : editId ? "Update Post" : "Publish Blog"}</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN FORM: 2 COLUMNS (1/4 LEFT, 3/4 RIGHT) ================= */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {/* ================= LEFT COLUMN: CONFIGURATION & SEO (1/4) ================= */}
          <div className="lg:col-span-1 space-y-4">
            {/* 1. CONFIGURATION CARD */}
            <div
              className="rounded-[7px] bg-white border border-[#e8e5df] p-4 text-left"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="space-y-3">
                {/* Publication Status */}
                <div>
                  <label className="block text-[8.5px] font-bold text-[#526078] uppercase tracking-wider mb-1">
                    Publication Status
                  </label>
                  <select
                    name="status"
                    value={blogData.status}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-[5px] font-bold text-[9px] uppercase tracking-wider outline-none transition ${
                      blogData.status === "published"
                        ? "bg-[#e8f5e9] border-[#a5d6a7] text-[#23714a]"
                        : blogData.status === "scheduled"
                        ? "bg-[#fef3c7] border-[#fde68a] text-[#b45309]"
                        : "bg-[#ffebee] border-[#ef9a9a] text-[#c62828]"
                    }`}
                  >
                    <option value="published">● Published (Live)</option>
                    <option value="scheduled">⏰ Scheduled (Future)</option>
                    <option value="draft">○ Draft (Hidden)</option>
                    <option value="archived">○ Archived</option>
                  </select>
                </div>

                {/* Show on Home Page Checkbox */}
                <div className="flex items-center gap-2.5 p-2.5 bg-[#fafafa] rounded-[5px] border border-[#e8e5df]">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={blogData.featured}
                    onChange={handleInputChange}
                    className="h-3.5 w-3.5 accent-[#075b33] rounded border-[#dfe4e8] cursor-pointer"
                  />
                  <label
                    htmlFor="featured"
                    className="text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wide cursor-pointer"
                  >
                    Show on Home Page
                  </label>
                </div>

                {/* Schedule for Later */}
                <div className="rounded-[5px] border border-[#e8e5df] bg-[#fafafa] p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="scheduleToggle"
                      className="flex items-center gap-1.5 text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#0284c7]" />
                      Schedule for Later
                    </label>
                    <input
                      type="checkbox"
                      id="scheduleToggle"
                      checked={isScheduled}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsScheduled(checked);
                        setBlogData((prev) => ({
                          ...prev,
                          status: checked ? "scheduled" : "published",
                        }));
                      }}
                      className="h-3.5 w-3.5 accent-[#0284c7] rounded border-[#dfe4e8] cursor-pointer"
                    />
                  </div>

                  {isScheduled && (
                    <div className="pt-2 border-t border-[#e8e5df] space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[7.5px] font-semibold text-[#64748b] uppercase mb-0.5">
                            Publish Date
                          </label>
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full px-2 py-1 text-[8.5px] font-semibold text-[#1e293b] border border-[#dfe4e8] rounded-[4px] bg-white outline-none focus:border-[#0284c7]"
                          />
                        </div>
                        <div>
                          <label className="block text-[7.5px] font-semibold text-[#64748b] uppercase mb-0.5">
                            Publish Time
                          </label>
                          <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="w-full px-2 py-1 text-[8.5px] font-semibold text-[#1e293b] border border-[#dfe4e8] rounded-[4px] bg-white outline-none focus:border-[#0284c7]"
                          />
                        </div>
                      </div>
                      <p className="text-[7.5px] font-medium text-[#0284c7] italic">
                        ⏰ Post will be published automatically on {scheduledDate ? new Date(scheduledDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "chosen date"} at {scheduledTime}.
                      </p>
                    </div>
                  )}
                </div>

                {/* Estimated Read Time */}
                <div>
                  <label className="block text-[8.5px] font-bold text-[#526078] uppercase tracking-wider mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    name="readTime"
                    value={blogData.readTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 4 min read"
                    className="w-full px-3 py-1.5 border border-[#dfe4e8] rounded-[5px] bg-white text-[9.5px] font-semibold text-[#1e293b] outline-none focus:border-[#075b33]"
                  />
                </div>
              </div>
            </div>

            {/* 2. SEO METADATA CARD */}
            <div
              className="rounded-[7px] bg-white border border-[#e8e5df] p-4 text-left"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-[#e8e5df]">
                <div className="grid h-[24px] w-[24px] place-items-center rounded-[4px] bg-blue-50 text-blue-600">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-[10px] font-bold text-[#233D4D] uppercase tracking-wider">
                  SEO Metadata
                </h2>
              </div>

              <div className="space-y-3">
                {/* Meta Title */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[8.5px] font-bold text-[#526078] uppercase tracking-wider">
                      Meta Title
                    </label>
                    <span className="text-[8px] font-bold text-[#0284c7]">
                      {blogData.metaTitle.length}/65
                    </span>
                  </div>
                  <input
                    type="text"
                    name="metaTitle"
                    value={blogData.metaTitle}
                    onChange={handleInputChange}
                    maxLength={65}
                    placeholder="Enter meta title..."
                    className="w-full px-3 py-1.5 border border-[#dfe4e8] rounded-[5px] bg-white text-[9.5px] font-semibold text-[#1e293b] outline-none focus:border-[#075b33]"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[8.5px] font-bold text-[#526078] uppercase tracking-wider">
                      Meta Description (SEO)
                    </label>
                    <span
                      className={`text-[8px] font-bold ${
                        blogData.metaDescription.length > 155 ? "text-red-500" : "text-[#0284c7]"
                      }`}
                    >
                      {blogData.metaDescription.length}/155
                    </span>
                  </div>
                  <textarea
                    name="metaDescription"
                    value={blogData.metaDescription}
                    onChange={handleInputChange}
                    maxLength={155}
                    rows={3}
                    placeholder="Brief search snippet summary..."
                    className="w-full resize-none px-3 py-1.5 border border-[#dfe4e8] rounded-[5px] bg-white text-[9.5px] font-medium text-[#1e293b] outline-none focus:border-[#075b33]"
                  />
                </div>

                {/* Canonical Tag */}
                <div>
                  <label className="block text-[8.5px] font-bold text-[#526078] uppercase tracking-wider mb-1">
                    Canonical Tag
                  </label>
                  <input
                    type="text"
                    name="canonicalTag"
                    value={blogData.canonicalTag}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com/blog-post"
                    className="w-full px-3 py-1.5 border border-[#dfe4e8] rounded-[5px] bg-white text-[9px] font-mono text-[#0284c7] outline-none focus:border-[#075b33]"
                  />
                </div>
              </div>
            </div>

            {/* 3. SOCIAL SHARING (OG) CARD */}
            <div
              className="rounded-[7px] bg-white border border-[#e8e5df] p-4 text-left"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-[#e8e5df]">
                <div className="grid h-[24px] w-[24px] place-items-center rounded-[4px] bg-blue-50 text-blue-600">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-[10px] font-bold text-[#233D4D] uppercase tracking-wider">
                  Social Sharing (OG)
                </h2>
              </div>

              <div className="space-y-3">
                {/* OG Title */}
                <div>
                  <label className="block text-[8.5px] font-bold text-[#526078] uppercase tracking-wider mb-1">
                    OG Title
                  </label>
                  <input
                    type="text"
                    name="ogTitle"
                    value={blogData.ogTitle}
                    onChange={handleInputChange}
                    placeholder="Enter social share title..."
                    className="w-full px-3 py-1.5 border border-[#dfe4e8] rounded-[5px] bg-white text-[9.5px] font-semibold text-[#1e293b] outline-none focus:border-[#075b33]"
                  />
                </div>

                {/* OG Image */}
                <div>
                  <label className="block text-[8.5px] font-bold text-[#526078] uppercase tracking-wider mb-1">
                    OG Image (Social Preview)
                  </label>
                  <div
                    onClick={() => ogFileInputRef.current?.click()}
                    className="relative cursor-pointer rounded-[6px] border-2 border-dashed border-[#dfe4e8] bg-[#fafafa] p-3 text-center transition hover:bg-slate-50"
                  >
                    <input
                      type="file"
                      ref={ogFileInputRef}
                      onChange={handleOgImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {ogImagePreview ? (
                      <div className="relative h-20 w-full overflow-hidden rounded-[4px]">
                        <img
                          src={ogImagePreview}
                          alt="OG Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="py-1 flex flex-col items-center justify-center">
                        <Upload className="h-5 w-5 text-[#94a3b8] mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#64748b]">
                          Upload OG Image
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional OG Tags */}
                <div>
                  <label className="block text-[8.5px] font-bold text-[#526078] uppercase tracking-wider mb-1">
                    Additional OG Tags
                  </label>
                  <RichTextEditor
                    value={blogData.openGraphTags}
                    onChange={(val) =>
                      setBlogData((prev) => ({ ...prev, openGraphTags: val }))
                    }
                    placeholder='<meta property="og:type" content="article" />'
                    minHeight="100px"
                    isCodeEditor={true}
                  />
                </div>
              </div>
            </div>

            {/* 4. SCHEMA MARKUP CARD */}
            <div
              className="rounded-[7px] bg-white border border-[#e8e5df] p-4 text-left"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3.5 pb-2 border-b border-[#e8e5df]">
                <div className="grid h-[24px] w-[24px] place-items-center rounded-[4px] bg-blue-50 text-blue-600">
                  <Code className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-[10px] font-bold text-[#233D4D] uppercase tracking-wider">
                  Schema Markup (JSON-LD)
                </h2>
              </div>

              <div>
                <RichTextEditor
                  value={blogData.schemaMarkup}
                  onChange={(val) =>
                    setBlogData((prev) => ({ ...prev, schemaMarkup: val }))
                  }
                  placeholder='{"@context": "https://schema.org", ...}'
                  minHeight="120px"
                  isCodeEditor={true}
                />
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: MAIN BLOG CONTENT (3/4) ================= */}
          <div className="lg:col-span-3 space-y-4">
            <div
              className="rounded-[7px] bg-white border border-[#e8e5df] overflow-hidden text-left"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
              }}
            >
              {/* Header Bar */}
              <div className="flex h-[42px] items-center justify-between border-b border-[#e8e5df] px-5 bg-[#fafafa]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-[26px] w-[26px] place-items-center rounded-[4px] bg-[#075b33] text-white shadow-xs">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-[11px] font-bold text-[#233D4D] uppercase tracking-wide">
                    Blog Primary Content
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-bold text-[#64748b] uppercase tracking-wider">
                    Words: <strong className="text-[#075b33] font-bold">{wordCount}</strong>
                  </span>
                  {isLoading && (
                    <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-[#134698] animate-pulse">
                      <div className="w-2.5 h-2.5 border-2 border-[#134698] border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  )}
                </div>
              </div>

              {/* Form Content Area */}
              <div className="p-5 space-y-4">
                {/* Horizontal: Blog Main Title, Hero Title (H1), Permalink / Slug */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Blog Main Title */}
                  <div className="md:col-span-1 space-y-1">
                    <label className="block text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider">
                      Blog Main Title <span className="text-[#dc2626]">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={blogData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog title..."
                      className="w-full px-3 py-2 border border-[#dfe4e8] rounded-[5px] text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#075b33] shadow-2xs"
                      required
                    />
                  </div>

                  {/* Hero Title (H1 for SEO) */}
                  <div className="md:col-span-1 space-y-1">
                    <label className="block text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider">
                      Hero Title (H1 for SEO)
                    </label>
                    <input
                      type="text"
                      name="h1Title"
                      value={blogData.h1Title}
                      onChange={handleInputChange}
                      placeholder="Enter hero title (H1 for SEO)..."
                      className="w-full px-3 py-2 border border-[#dfe4e8] rounded-[5px] text-[10.5px] font-medium text-[#1e293b] outline-none focus:border-[#075b33] shadow-2xs"
                    />
                  </div>

                  {/* Permalink / URL Slug */}
                  <div className="md:col-span-1 space-y-1">
                    <label className="block text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider">
                      Permalink / URL Slug <span className="text-[#dc2626]">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={blogData.slug}
                      onChange={handleInputChange}
                      placeholder="auto-generated-slug"
                      className="w-full px-3 py-2 border border-[#dfe4e8] rounded-[5px] bg-[#f8fafc] text-[10px] font-mono text-[#0284c7] outline-none focus:border-[#075b33] shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Blog Category */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider">
                    Blog Category <span className="text-[#dc2626]">*</span>
                  </label>
                  <select
                    name="category"
                    value={blogData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#dfe4e8] rounded-[5px] bg-white text-[10.5px] font-semibold text-[#1e293b] outline-none focus:border-[#075b33] shadow-2xs"
                  >
                    <option value="Expo News">Expo News</option>
                    <option value="Industry Stories">Industry Stories</option>
                    <option value="Organic Trends">Organic Trends</option>
                    <option value="Producer Guidance">Producer Guidance</option>
                    <option value="Ayurveda & Wellness">Ayurveda &amp; Wellness</option>
                    <option value="Sustainable Agriculture">Sustainable Agriculture</option>
                  </select>
                </div>

                {/* Meta Keywords (SEO) */}
                <div className="space-y-1">
                  <label className="block text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider">
                    Meta Keywords (SEO)
                  </label>
                  <textarea
                    name="metaKeywords"
                    value={blogData.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="Enter keywords separated by commas (e.g. organic farming, b2b expo, ayush exports)..."
                    rows={2}
                    className="w-full resize-none px-3 py-2 border border-[#dfe4e8] rounded-[5px] text-[10px] font-medium text-[#1e293b] outline-none focus:border-[#075b33] shadow-2xs"
                  />
                </div>

                {/* Feature Image & Image Alt Text (Horizontal 2-part card) */}
                <div className="p-3.5 rounded-[6px] border border-[#dfe4e8] bg-[#fafafa]">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Image Dropzone / Preview */}
                    <div className="w-full md:w-1/3">
                      <label className="block text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider mb-1.5">
                        Feature Image <span className="text-[#dc2626]">*</span>
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="relative aspect-video flex flex-col items-center justify-center rounded-[5px] border-2 border-dashed border-[#dfe4e8] bg-white cursor-pointer overflow-hidden transition hover:border-[#075b33]"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                        {imagePreview ? (
                          <>
                            <img
                              src={imagePreview}
                              alt="Feature preview"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center p-2 text-center">
                            <Upload className="h-6 w-6 text-[#94a3b8] mb-1" />
                            <span className="text-[8.5px] font-bold text-[#075b33] uppercase tracking-wider">
                              Upload Image
                            </span>
                            <span className="text-[7px] text-[#94a3b8] mt-0.5">
                              Recommended: 1200 × 675 px (Max 2MB)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Alt Text & Guide */}
                    <div className="w-full md:w-2/3 space-y-2">
                      <div>
                        <label className="block text-[8.5px] font-bold text-[#233D4D] uppercase tracking-wider mb-1">
                          Image Alt Text (SEO)
                        </label>
                        <input
                          type="text"
                          name="imageAlt"
                          value={blogData.imageAlt}
                          onChange={handleInputChange}
                          placeholder="Describe the image for screen readers and SEO..."
                          className="w-full px-3 py-2 border border-[#dfe4e8] rounded-[5px] bg-white text-[10px] font-medium text-[#1e293b] outline-none focus:border-[#075b33] shadow-2xs"
                        />
                      </div>
                      <p className="text-[8px] font-medium text-[#64748b]">
                        ● Helps visually impaired users and improves search ranking for image results.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detailed Blog Description * (Rich Text Editor) */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between text-left">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                      Detailed Blog Description <span className="text-[#dc2626]">*</span>
                    </label>
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[9px] font-bold rounded uppercase border border-green-100">
                      Rich Text Active
                    </span>
                  </div>

                  <div className="rounded overflow-hidden text-left">
                    <RichTextEditor
                      value={blogData.content}
                      onChange={(val) => setBlogData((prev) => ({ ...prev, content: val }))}
                      placeholder="Start writing your blog content here..."
                      minHeight="450px"
                    />
                  </div>
                </div>

                {/* Bottom Submit Action Bar */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e8e5df]">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex h-[34px] items-center justify-center gap-1.5 rounded-[6px] border border-[#fecaca] bg-[#fef2f2] px-5 text-[9.5px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition shadow-xs"
                  >
                    <Save className="h-3.5 w-3.5 text-[#dc2626]" />
                    Save as Draft
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-[34px] items-center justify-center gap-2 rounded-[6px] bg-[#075b33] px-6 text-[10px] font-bold text-white shadow-[0_5px_12px_rgba(7,91,51,0.25)] transition hover:bg-[#054626] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="h-4 w-4" strokeWidth={2.2} />
                    )}
                    <span>{editId ? "Update Blog Post" : "Publish Blog Story"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function AddNewPostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fffefb] text-[#23471d] font-bold text-sm">
          Loading Blog Editor...
        </div>
      }
    >
      <AddNewPostContent />
    </Suspense>
  );
}

