import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ImagePlus, Plus, Trash2 } from "lucide-react";

export interface SeoOptions {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  schemaMarkup?: string;
  h1Tag?: string;
  breadcrumbName?: string;
  internalLinks?: { label: string; url: string }[];
  robotsIndex?: boolean;
  robotsFollow?: boolean;
}

interface SeoSettingsFormProps {
  seo?: SeoOptions;
  onChange: (seo: SeoOptions) => void;
  onImageUpload?: (file: File, callback: (url: string) => void) => void;
  uploading?: boolean;
}

export default function SeoSettingsForm({ seo = {}, onChange, onImageUpload, uploading }: SeoSettingsFormProps) {
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
        alert(`Image size is ${(file.size / 1024).toFixed(1)}KB. Please upload an image under 100KB for better SEO performance.`);
        return;
      }
      if (onImageUpload) {
        onImageUpload(file, (url) => updateField("ogImage", url));
      }
    }
  };

  return (
    <div className="space-y-6 rounded-lg border border-surface-border bg-surface-card p-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">Search Engine Optimization</h3>
        <p className="text-xs text-text-muted mt-1">Control how this page appears on search engines and social media.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="H1 Tag (Page Main Heading)"
            value={seo.h1Tag || ""}
            onChange={(e) => updateField("h1Tag", e.target.value)}
            hint="Leave blank to use the visual default. Used only for SEO."
          />
        </div>
        
        <div className="sm:col-span-2">
          <Input
            label="Meta Title"
            value={seo.metaTitle || ""}
            onChange={(e) => updateField("metaTitle", e.target.value)}
            hint={`${(seo.metaTitle || "").length}/65 characters. Keep under 65 for best results (No limit applied).`}
          />
        </div>

        <div className="sm:col-span-2">
          <Textarea
            label="Meta Description"
            value={seo.metaDescription || ""}
            onChange={(e) => updateField("metaDescription", e.target.value)}
            rows={3}
            hint={`${(seo.metaDescription || "").length}/155 characters. Keep under 155 for best results (No limit applied).`}
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Meta Keywords (Comma separated)"
            value={seo.metaKeywords || ""}
            onChange={(e) => updateField("metaKeywords", e.target.value)}
          />
        </div>

        <Input
          label="Canonical URL"
          value={seo.canonicalUrl || ""}
          onChange={(e) => updateField("canonicalUrl", e.target.value)}
          hint="Leave blank to auto-generate."
        />

        <div className="sm:col-span-2 flex gap-6 mt-2">
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <input 
              type="checkbox" 
              checked={seo.robotsIndex !== false} 
              onChange={(e) => updateField("robotsIndex", e.target.checked)} 
              className="rounded border-surface-border"
            />
            Index (Allow search engines to index this page)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <input 
              type="checkbox" 
              checked={seo.robotsFollow !== false} 
              onChange={(e) => updateField("robotsFollow", e.target.checked)} 
              className="rounded border-surface-border"
            />
            Follow (Allow search engines to follow links)
          </label>
        </div>

        <Input
          label="Breadcrumb Name"
          value={seo.breadcrumbName || ""}
          onChange={(e) => updateField("breadcrumbName", e.target.value)}
          hint="Short name for breadcrumb navigation."
        />

        <div className="sm:col-span-2 border-t pt-4 mt-2">
          <h4 className="text-sm font-semibold mb-3">Open Graph (Social Media)</h4>
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
                hint="Image shown when sharing on social media. (Max 100KB recommended)"
              />
              <div className="flex items-center gap-3">
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-2.5 text-xs font-medium text-text-primary hover:bg-surface-sunken">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "Upload OG Image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>
                {seo.ogImage && (
                  <img src={seo.ogImage} alt="OG" className="h-10 w-16 rounded border object-cover" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2 border-t pt-4 mt-2">
          <h4 className="text-sm font-semibold mb-3">Schema Markup (JSON-LD)</h4>
          <Textarea
            label="Schema JSON"
            value={seo.schemaMarkup || ""}
            onChange={(e) => updateField("schemaMarkup", e.target.value)}
            rows={5}
            hint="Paste valid JSON-LD. Will be injected into <head>."
          />
        </div>

        <div className="sm:col-span-2 border-t pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Internal Links</h4>
            <Button type="button" size="sm" variant="secondary" onClick={addLink}>
              <Plus className="h-4 w-4 mr-1" /> Add Link
            </Button>
          </div>
          <div className="space-y-3">
            {(seo.internalLinks || []).map((link, idx) => (
              <div key={idx} className="flex items-end gap-3 p-3 bg-surface-sunken/40 border rounded-lg">
                <div className="flex-1">
                  <Input label="Label / Anchor Text" value={link.label} onChange={(e) => updateLink(idx, "label", e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input label="URL" value={link.url} onChange={(e) => updateLink(idx, "url", e.target.value)} />
                </div>
                <Button type="button" variant="ghost" onClick={() => removeLink(idx)} className="text-red-500 hover:text-red-700 h-10 w-10 p-0 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(!seo.internalLinks || seo.internalLinks.length === 0) && (
              <p className="text-xs text-text-muted italic">No internal links configured for this page.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
