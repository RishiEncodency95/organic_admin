"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ImagePlus, Plus, Trash2, Sparkles, AlertCircle, Check } from "lucide-react";
import { seoApi } from "@/lib/seoApi";

export interface SeoOptions {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  canonicalTag?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  openGraphTags?: string;
  schemaMarkup?: string;
  h1Tag?: string;
  breadcrumbName?: string;
  internalLinks?: { label: string; url: string }[];
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  isActive?: boolean;
}

interface SeoSettingsFormProps {
  seo?: SeoOptions;
  pageSlug?: string;
  onChange: (seo: SeoOptions) => void;
  onImageUpload?: (file: File, callback: (url: string) => void) => void;
  uploading?: boolean;
}

export default function SeoSettingsForm({
  seo = {},
  pageSlug,
  onChange,
  onImageUpload,
  uploading,
}: SeoSettingsFormProps) {
  const [generating, setGenerating] = useState(false);

  const updateField = (key: keyof SeoOptions, value: any) => {
    onChange({ ...seo, [key]: value });
  };

  const addLink = () => {
    const links = seo.internalLinks || [];
    updateField("internalLinks", [...links, { label: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    const links = [...(seo.internalLinks || [])];
    links.splice(index, 1);
    updateField("internalLinks", links);
  };

  const updateLink = (index: number, key: "label" | "url", value: string) => {
    const links = [...(seo.internalLinks || [])];
    links[index] = { ...links[index], [key]: value };
    updateField("internalLinks", links);
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      if (file.size > 100 * 1024) {
        alert(
          `Image size is ${(file.size / 1024).toFixed(
            1
          )}KB. Please upload an image under 100KB for better SEO performance and Google Core Web Vitals.`
        );
        return;
      }
      if (onImageUpload) {
        onImageUpload(file, (url) => updateField("ogImage", url));
      }
    }
  };

  const handleAutoGenerate = async () => {
    const targetSlug = pageSlug || "home";
    setGenerating(true);
    try {
      const res = await seoApi.generate(targetSlug);
      const defaults = res || {};
      onChange({
        ...seo,
        metaTitle: defaults.metaTitle || seo.metaTitle,
        metaDescription: defaults.metaDescription || seo.metaDescription,
        metaKeywords: defaults.metaKeywords || seo.metaKeywords,
        canonicalUrl: defaults.canonicalUrl || seo.canonicalUrl,
        canonicalTag: defaults.canonicalTag || seo.canonicalTag,
        ogTitle: defaults.ogTitle || defaults.metaTitle || seo.ogTitle,
        ogDescription: defaults.ogDescription || defaults.metaDescription || seo.ogDescription,
        ogImage: defaults.ogImage || seo.ogImage,
        openGraphTags: defaults.openGraphTags || seo.openGraphTags,
        schemaMarkup: defaults.schemaMarkup || seo.schemaMarkup,
        h1Tag: defaults.h1Tag || seo.h1Tag,
        breadcrumbName: defaults.breadcrumbName || seo.breadcrumbName,
        robotsIndex: defaults.robotsIndex !== false,
        robotsFollow: defaults.robotsFollow !== false,
      });
    } catch (err) {
      console.error("Auto generate failed", err);
    } finally {
      setGenerating(false);
    }
  };

  const titleLength = (seo.metaTitle || "").length;
  const descLength = (seo.metaDescription || "").length;

  let isSchemaValid: boolean | null = null;
  if (seo.schemaMarkup && seo.schemaMarkup.trim()) {
    try {
      JSON.parse(seo.schemaMarkup);
      isSchemaValid = true;
    } catch {
      isSchemaValid = false;
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-surface-border bg-surface-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Search Engine Optimization</h3>
          <p className="mt-1 text-xs text-text-muted">Control how this page appears on Google search results and social media.</p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleAutoGenerate}
          disabled={generating}
          className="flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          {generating ? "Generating..." : "Auto-Generate SEO"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="H1 Tag (Page Main Heading)"
            value={seo.h1Tag || ""}
            onChange={(e) => updateField("h1Tag", e.target.value)}
            hint="Used for SEO heading hierarchy without changing visual design."
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Meta Title"
            value={seo.metaTitle || ""}
            onChange={(e) => updateField("metaTitle", e.target.value)}
            hint={
              titleLength > 65
                ? `${titleLength}/65 characters. Exceeds recommended 65 characters.`
                : `${titleLength}/65 characters. Recommended under 65 for Google snippet.`
            }
          />
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Meta Description"
            value={seo.metaDescription || ""}
            onChange={(e) => updateField("metaDescription", e.target.value)}
            rows={3}
            hint={
              descLength > 155
                ? `${descLength}/155 characters. Exceeds recommended 155 characters.`
                : `${descLength}/155 characters. Recommended under 155 for search results.`
            }
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Meta Keywords (Comma separated)"
            value={seo.metaKeywords || ""}
            onChange={(e) => updateField("metaKeywords", e.target.value)}
          />
        </div>

        <div>
          <Input
            label="Canonical URL"
            value={seo.canonicalUrl || ""}
            onChange={(e) => {
              const val = e.target.value.trim();
              onChange({
                ...seo,
                canonicalUrl: val,
                canonicalTag: val ? `<link rel="canonical" href="${val}" />` : "",
              });
            }}
            placeholder="https://bharatorganicexpo.com"
            hint="Clean canonical link (e.g. https://bharatorganicexpo.com/why-visit)."
          />
        </div>

        <div className="sm:col-span-2 flex gap-6 mt-1">
          <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={seo.robotsIndex !== false}
              onChange={(e) => updateField("robotsIndex", e.target.checked)}
              className="rounded border-surface-border"
            />
            Index (Allow search engines to index this page)
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
            <input
              type="checkbox"
              checked={seo.robotsFollow !== false}
              onChange={(e) => updateField("robotsFollow", e.target.checked)}
              className="rounded border-surface-border"
            />
            Follow (Allow search engines to follow links)
          </label>
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Breadcrumb Name"
            value={seo.breadcrumbName || ""}
            onChange={(e) => updateField("breadcrumbName", e.target.value)}
            hint="Short label for breadcrumb navigation."
          />
        </div>

        <div className="sm:col-span-2 border-t border-surface-border pt-4 mt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Open Graph (Social Cards)</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="OG Title"
              value={seo.ogTitle || ""}
              onChange={(e) => updateField("ogTitle", e.target.value)}
              hint="Falls back to Meta Title if empty."
            />
            <Input
              label="OG Description"
              value={seo.ogDescription || ""}
              onChange={(e) => updateField("ogDescription", e.target.value)}
              hint="Falls back to Meta Description if empty."
            />
            <div className="sm:col-span-2 space-y-2">
              <Input
                label="OG Image URL"
                value={seo.ogImage || ""}
                onChange={(e) => updateField("ogImage", e.target.value)}
                hint="Image preview link when shared on social platforms (Max 100KB recommended)."
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-2.5 text-xs font-medium text-text-primary hover:bg-surface-sunken">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "Upload OG Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>
                {seo.ogImage && (
                  <img src={seo.ogImage} alt="OG Preview" className="h-10 w-16 rounded border border-surface-border object-cover" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 border-t border-surface-border pt-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Schema Markup (JSON-LD)</h4>
            {isSchemaValid === true && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                <Check className="h-3.5 w-3.5" /> Valid JSON-LD
              </span>
            )}
            {isSchemaValid === false && (
              <span className="flex items-center gap-1 text-xs font-medium text-status-danger-text">
                <AlertCircle className="h-3.5 w-3.5" /> Invalid JSON syntax
              </span>
            )}
          </div>
          <Textarea
            value={seo.schemaMarkup || ""}
            onChange={(e) => updateField("schemaMarkup", e.target.value)}
            rows={4}
            hint="Paste valid JSON-LD structured data."
          />
        </div>

        <div className="sm:col-span-2 border-t border-surface-border pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Internal Links</h4>
            <Button type="button" size="sm" variant="secondary" onClick={addLink}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Link
            </Button>
          </div>
          <div className="space-y-3">
            {(seo.internalLinks || []).map((link, idx) => (
              <div key={idx} className="flex items-end gap-3 p-2.5 bg-surface-sunken border border-surface-border rounded-lg">
                <div className="flex-1">
                  <Input label="Label / Anchor Text" value={link.label} onChange={(e) => updateLink(idx, "label", e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input label="URL" value={link.url} onChange={(e) => updateLink(idx, "url", e.target.value)} />
                </div>
                <Button type="button" variant="secondary" onClick={() => removeLink(idx)} className="h-9 w-9 p-0 shrink-0 text-status-danger-text">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
