import { Globe, Sparkles, Upload, X } from "lucide-react";
import type { CmsPage } from "@/lib/cmsPages";
import { EditorToolbar, Toggle } from "../fields";
import type { FormState } from "../types";

export function SeoSettingsPanel({
  form,
  updateField,
  page,
  canonicalEditorRef,
  execCommand,
  onCanonicalInput,
  onCanonicalPaste,
  ogUploading,
  ogPreview,
  onOgImageUpload,
  onRemoveOgImage,
  onAutoGenerateSeo,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  page: CmsPage;
  canonicalEditorRef: React.RefObject<HTMLDivElement | null>;
  execCommand: (command: string, value?: string | null) => void;
  onCanonicalInput: () => void;
  onCanonicalPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  ogUploading: boolean;
  ogPreview: string | null;
  onOgImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveOgImage: () => void;
  onAutoGenerateSeo: (envType: "local" | "live") => void;
}) {
  return (
    <section className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              3. SEO Information
            </h2>
            <p className="text-[11px] text-gray-500">
              Manage meta tags, Open Graph data, canonical URL, and schema markup for this page.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAutoGenerateSeo("local")}
            className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Auto-generate tags for Local environment (http://localhost:3002)"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Auto Generate (Local)
          </button>
          <button
            type="button"
            onClick={() => onAutoGenerateSeo("live")}
            className="px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Auto-generate tags for Live environment (https://bharatorganicexpo.com)"
          >
            <Globe className="w-3.5 h-3.5 text-green-600" />
            Auto Generate (Live)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Select Page (Auto-selected & disabled) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Select Page <span className="text-red-500">*</span>
          </label>
          <select
            name="page"
            value={form.slug ? `/${form.slug}` : "/"}
            disabled={true}
            className="w-full px-3 py-2 border-2 border-gray-300 bg-gray-100 text-gray-700 focus:outline-none text-xs shadow-sm cursor-not-allowed font-medium"
          >
            <option value={form.slug ? `/${form.slug}` : "/"}>
              {form.pageTitle || page.title || "Home"} ({form.slug ? `/${form.slug}` : "/"})
            </option>
          </select>
        </div>

        {/* Meta Title */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-gray-700">
              Meta Title
            </label>
            <span
              className={`text-[10px] font-bold ${
                form.metaTitle.length > 55 ? "text-orange-500" : "text-gray-400"
              }`}
            >
              {form.metaTitle.length}/65
            </span>
          </div>
          <input
            type="text"
            name="metaTitle"
            value={form.metaTitle}
            maxLength={65}
            onChange={(e) => {
              if (e.target.value.length <= 65) {
                updateField("metaTitle", e.target.value);
              }
            }}
            placeholder="Enter meta title"
            className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
          />
        </div>

        {/* Meta Keywords */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Meta Keywords
          </label>
          <input
            type="text"
            name="metaKeywords"
            value={form.metaKeywords}
            onChange={(e) => updateField("metaKeywords", e.target.value)}
            placeholder="Enter meta keywords (comma separated)"
            className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
          />
        </div>

        {/* Meta Description */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-gray-700">
              Meta Description
            </label>
            <span
              className={`text-[10px] font-bold ${
                form.metaDescription.length > 155 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {form.metaDescription.length}/155
            </span>
          </div>
          <textarea
            name="metaDescription"
            value={form.metaDescription}
            onChange={(e) => {
              if (e.target.value.length <= 155) {
                updateField("metaDescription", e.target.value);
              }
            }}
            placeholder="Enter meta description"
            rows={3}
            maxLength={155}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
          />
        </div>

        {/* Open Graph Tags Editor */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            Open Graph Tags (HTML/Text) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="openGraphTags"
            value={form.openGraphTags || ""}
            onChange={(e) => updateField("openGraphTags", e.target.value)}
            placeholder="Paste OG tags here..."
            rows={6}
            className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
          />
        </div>

        {/* Schema Markup Editor */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            Schema Markup (JSON-LD) <span className="text-red-500">*</span>
          </label>
          <textarea
            name="schemaMarkup"
            value={form.schemaMarkup || ""}
            onChange={(e) => updateField("schemaMarkup", e.target.value)}
            placeholder="Paste JSON-LD schema here..."
            rows={10}
            className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
          />
        </div>

        {/* Canonical Tag Editor */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700">
              Canonical Tag <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = page.slug === "/" ? "" : (page.slug?.startsWith("/") ? page.slug : `/${page.slug || ""}`);
                  const tag = `<link rel="canonical" href="http://localhost:3002${p}" />`;
                  updateField("canonicalTag", tag);
                  updateField("canonicalUrl", `http://localhost:3002${p}`);
                  if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = tag;
                }}
                className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer font-medium"
              >
                Set Local (3002)
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = page.slug === "/" ? "" : (page.slug?.startsWith("/") ? page.slug : `/${page.slug || ""}`);
                  const tag = `<link rel="canonical" href="https://bharatorganicexpo.com${p}" />`;
                  updateField("canonicalTag", tag);
                  updateField("canonicalUrl", `https://bharatorganicexpo.com${p}`);
                  if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = tag;
                }}
                className="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 cursor-pointer font-medium"
              >
                Set Live
              </button>
            </div>
          </div>
          <div className="border-2 border-gray-200">
            <EditorToolbar targetRef={canonicalEditorRef} onCommand={execCommand} />
            <div
              ref={canonicalEditorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={onCanonicalInput}
              onPaste={onCanonicalPaste}
              className="min-h-[100px] p-3 bg-white focus:outline-none prose prose-sm max-w-none shadow-inner text-xs font-mono text-gray-800"
              style={{ whiteSpace: "pre-wrap" }}
              data-placeholder="Enter canonical URL or full tag..."
            />
          </div>
          <p className="text-[11px] text-gray-500">
            Auto-generated based on current environment (Local / Live). You can also edit or paste manually anytime.
          </p>
        </div>

        {/* OG Image Upload */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            OG Image
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center relative hover:bg-gray-50 transition-colors min-h-[100px] flex items-center justify-center">
            <input
              type="file"
              onChange={onOgImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept="image/*"
              disabled={ogUploading}
            />
            {ogUploading ? (
              <div className="py-2 flex flex-col items-center">
                <div className="w-5 h-5 border-2 border-[#134698] border-t-transparent rounded-full animate-spin mb-1" />
                <span className="text-[10px] text-gray-500">Uploading OG Image...</span>
              </div>
            ) : form.ogImage || ogPreview ? (
              <div className="relative w-full">
                <img
                  src={ogPreview || form.ogImage}
                  alt="OG Preview"
                  className="h-24 w-full object-cover rounded shadow-sm"
                />
                <button
                  type="button"
                  onClick={onRemoveOgImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-20 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="py-2">
                <Upload className="w-6 h-6 text-gray-300 mx-auto" />
                <span className="text-[10px] text-gray-400 block mt-1 uppercase font-bold tracking-tighter">
                  Upload OG Image
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="isActive"
            value={form.isActive ? "true" : "false"}
            onChange={(e) => updateField("isActive", e.target.value === "true")}
            className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm bg-white"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Indexing / Crawlers */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px] bg-gray-50">
            <div>
              <p className="text-[11px] font-semibold text-[#3a4557]">
                Allow Search Engines to Index
              </p>
              <p className="mt-[2px] text-[9px] font-medium text-[#8b929c]">
                Turn off to add a noindex tag to this page.
              </p>
            </div>
            <Toggle
              checked={form.robotsIndex}
              onChange={(value) => updateField("robotsIndex", value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px] bg-gray-50">
            <div>
              <p className="text-[11px] font-semibold text-[#3a4557]">
                Allow Search Engines to Follow Links
              </p>
              <p className="mt-[2px] text-[9px] font-medium text-[#8b929c]">
                Turn off to add a nofollow tag to this page.
              </p>
            </div>
            <Toggle
              checked={form.robotsFollow}
              onChange={(value) => updateField("robotsFollow", value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
