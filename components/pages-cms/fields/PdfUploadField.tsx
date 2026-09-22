"use client";

import { useState } from "react";
import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";
import { TextInput } from "./TextInput";

export function PdfUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/brochures");
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload PDF", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const displayUrl = value
    ? value.startsWith("http")
      ? value
      : value.startsWith("/")
        ? `http://localhost:4000${value}`
        : `http://localhost:4000/${value}`
    : "";

  return (
    <div className="flex flex-col gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
      <div className="flex items-center gap-1.5">
        <TextInput
          value={value}
          onChange={onChange}
          placeholder="https://... or click Upload PDF"
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#2563eb] bg-[#eff6ff] px-2.5 py-1.5 text-[9px] font-bold text-[#1d4ed8] hover:bg-[#dbeafe] transition-colors shadow-2xs">
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload PDF"}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            title="Remove PDF"
            className="flex shrink-0 items-center gap-1 rounded border border-[#fca5a5] bg-[#fef2f2] px-2 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition-colors shadow-2xs"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        ) : null}
      </div>

      {value && typeof value === "string" ? (
        <div className="flex items-center gap-3 bg-white p-2 rounded border border-[#e2e8f0]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-red-50 border border-red-200 text-red-600 font-bold text-[10px]">
            <FileText className="h-4 w-4 text-red-600" />
          </div>

          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                Brochure PDF
              </span>
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[9px] font-semibold text-blue-600 hover:underline"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                View / Test PDF
              </a>
            </div>
            <p className="text-[8.5px] text-[#64748b] truncate font-mono">
              {value}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-[9px] text-[#94a3b8] italic flex items-center gap-1 px-1">
          <FileText className="h-3 w-3 text-[#cbd5e1]" />
          No PDF file attached. Paste a file URL or click "Upload PDF".
        </div>
      )}
    </div>
  );
}
