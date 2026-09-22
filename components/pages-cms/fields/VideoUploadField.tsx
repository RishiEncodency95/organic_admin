"use client";

import { useState } from "react";
import { ExternalLink, Trash2, Upload } from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";
import { TextInput } from "./TextInput";

export function VideoUploadField({
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
      const res: any = await uploadApi.file(file, "bharat-organic/videos");
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload video", err);
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
          placeholder="https://... video URL or upload"
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#7c3aed] bg-[#f5f3ff] px-2.5 py-1.5 text-[9px] font-bold text-[#6d28d9] hover:bg-[#ede9fe] transition-colors shadow-2xs">
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload Video"}
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            title="Remove Video"
            className="flex shrink-0 items-center gap-1 rounded border border-[#fca5a5] bg-[#fef2f2] px-2 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition-colors shadow-2xs"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        ) : null}
      </div>
      {displayUrl && (
        <div className="flex items-center gap-2 bg-white p-1.5 rounded border border-[#e2e8f0] text-[9.5px]">
          <span className="font-bold text-[#6d28d9] bg-[#ede9fe] px-1.5 py-0.5 rounded">Active Video</span>
          <a href={displayUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-0.5 truncate font-mono">
            <ExternalLink className="h-3 w-3 inline" /> {value}
          </a>
        </div>
      )}
    </div>
  );
}
