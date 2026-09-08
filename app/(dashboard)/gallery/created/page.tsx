"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  FolderClosed,
  Globe,
  ImageUp,
  Info,
  Lock,
  Shield,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";

type VisibilityType = "public" | "members" | "private";

const visibilityOptions: {
  id: VisibilityType;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
    {
      id: "public",
      title: "Public",
      subtitle: "Visible to all website visitors",
      icon: Globe,
    },
    {
      id: "members",
      title: "Members Only",
      subtitle: "Visible to registered users only",
      icon: Shield,
    },
    {
      id: "private",
      title: "Private",
      subtitle: "Visible to admins only",
      icon: Lock,
    },
  ];

function SectionHeading({
  number,
  title,
  subtitle,
  optional,
}: {
  number: string;
  title: string;
  subtitle: string;
  optional?: boolean;
}) {
  return (
    <div>
      <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#1a254b]">
        {number}. {title}
        {optional ? (
          <span className="font-semibold text-[#5d6a84]"> (Optional)</span>
        ) : null}
      </h2>
      <p className="mt-[3px] text-[11px] font-semibold text-[#60708b]">
        {subtitle}
      </p>
    </div>
  );
}

function FieldLabel({
  children,
  required,
  optional,
}: {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="mb-[5px] block text-[11px] font-extrabold text-[#24345e]">
      {children}
      {required ? <span className="ml-[2px] text-[#df3e3e]">*</span> : null}
      {optional ? (
        <span className="font-semibold text-[#627088]"> (Optional)</span>
      ) : null}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-[24px] w-[38px] rounded-full transition ${checked ? "bg-[#0b6a3b]" : "bg-[#d8dde6]"
        }`}
    >
      <span
        className={`absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow transition ${checked ? "left-[16px]" : "left-[2px]"
          }`}
      />
    </button>
  );
}

export default function UploadNewMediaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [folder, setFolder] = useState("Root (Media Library)");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("public");
  const [featured, setFeatured] = useState(false);
  const [generateWebp, setGenerateWebp] = useState(true);
  const [optimizeImage, setOptimizeImage] = useState(true);
  const [watermark, setWatermark] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      if (!title && filesArray[0]) {
        setTitle(filesArray[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const supportedFormats = useMemo(
    () => "jpg, jpeg, png, gif, webp, pdf, doc, docx, mp4, mp3, zip",
    [],
  );

  return (
    <main className="h-full min-h-0 overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[10px] pb-[24px] text-[#16233f] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
      <div className="grid min-h-full grid-rows-[52px_auto_56px] gap-[8px]">
        {/* HEADER */}
        <header className="flex min-h-0 items-start justify-between gap-[18px]">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#075b33]">
              Upload New Media
            </h1>

            <nav
              className="mt-[8px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1c2c57]"
              aria-label="Breadcrumb"
            >
              <span>Dashboard</span>
              <span className="text-[#78849a]">›</span>
              <span>Media Library</span>
              <span className="text-[#78849a]">›</span>
              <span>Upload New Media</span>
            </nav>
          </div>
        </header>

        {/* CONTENT */}
        <section className="grid min-h-0 grid-cols-[minmax(0,1.78fr)_minmax(320px,0.96fr)] items-start gap-[16px]">
          {/* LEFT */}
          <div className="grid min-h-0 auto-rows-max gap-[10px]">
            {/* Upload area */}
            <section className="min-h-0 overflow-visible rounded-[10px] border border-[#e8ebee] bg-white px-[16px] py-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionHeading
                number="1"
                title="Upload Media Files"
                subtitle="Drag & drop files here or click to browse"
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,video/*,application/pdf,audio/*"
                onChange={handleFileSelect}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-[10px] flex h-[220px] cursor-pointer items-center justify-center rounded-[8px] border border-dashed border-[#d9e6de] bg-[linear-gradient(180deg,#fbfefc_0%,#f6f8fa_100%)] transition hover:border-[#096739] hover:bg-[#f0f7f2]"
              >
                <div className="text-center">
                  <div className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-full text-[#096739]">
                    <UploadCloud className="h-[42px] w-[42px]" strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-[5px] text-[15px] font-semibold text-[#1d2432]">
                    Drag &amp; drop your files here
                  </h3>

                  <p className="mt-[3px] text-[11px] font-semibold text-[#4b5567]">
                    {selectedFiles.length > 0
                      ? "Click to select more files or replace"
                      : "or"}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-[8px] inline-flex h-[36px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#066434_0%,#03562d_100%)] px-[28px] text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(4,91,48,0.12)] transition hover:opacity-95"
                  >
                    <FolderClosed className="h-[15px] w-[15px]" strokeWidth={2.2} />
                    {selectedFiles.length > 0 ? "Add / Replace Files" : "Browse Files"}
                  </button>

                  <p className="mx-auto mt-[12px] max-w-[520px] text-[10.5px] font-semibold leading-[1.4] text-[#4d596d]">
                    Supported formats: {supportedFormats} • Max size: 10 MB
                  </p>
                </div>
              </div>

              {/* SELECTED FILES LIST */}
              {selectedFiles.length > 0 && (
                <div className="mt-[14px] space-y-[10px]">
                  <p className="text-[11.5px] font-extrabold text-[#1e2a4a]">
                    Selected Files ({selectedFiles.length}):
                  </p>

                  <div className="space-y-[8px]">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-[12px] rounded-[7px] border border-[#e2e7ec] bg-[#fbfcfd] px-[12px] py-[9px]"
                      >
                        <div className="flex min-w-0 items-center gap-[10px]">
                          <div className="grid h-[36px] w-[36px] shrink-0 place-items-center rounded-[6px] bg-emerald-100 text-[#096739]">
                            {file.type.startsWith("image/") ? (
                              <ImageUp className="h-[20px] w-[20px]" />
                            ) : (
                              <UploadCloud className="h-[20px] w-[20px]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-extrabold text-[#1e2a4a]">
                              {file.name}
                            </p>
                            <p className="text-[9.5px] font-semibold text-[#627088]">
                              {(file.size / 1024).toFixed(1)} KB • Ready to upload
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-[10px]">
                          <span className="rounded-full bg-emerald-100 px-[8px] py-[3px] text-[9px] font-extrabold text-[#066434]">
                            Ready ✓
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFiles((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="grid h-[26px] w-[26px] place-items-center rounded-[5px] text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <X className="h-[14px] w-[14px]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Media Information */}
            <section className="min-h-0 overflow-visible rounded-[10px] border border-[#e8ebee] bg-white px-[16px] py-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionHeading
                number="2"
                title="Media Information"
                subtitle=""
                optional
              />

              <div className="mt-[10px] grid grid-cols-2 gap-x-[20px] gap-y-[12px]">
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter media title"
                    className="h-[38px] w-full rounded-[7px] border border-[#dfe4ea] bg-white px-[13px] text-[11.5px] font-semibold text-[#24345e] outline-none placeholder:text-[#8b95a9]"
                  />
                </div>

                <div>
                  <FieldLabel>Alt Text (For Images)</FieldLabel>
                  <input
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Enter alt text for images (SEO)"
                    className="h-[38px] w-full rounded-[7px] border border-[#dfe4ea] bg-white px-[13px] text-[11.5px] font-semibold text-[#24345e] outline-none placeholder:text-[#8b95a9]"
                  />
                </div>

                <div>
                  <FieldLabel>Caption</FieldLabel>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter caption (optional)"
                    rows={3}
                    className="h-[72px] w-full resize-none rounded-[7px] border border-[#dfe4ea] bg-white px-[13px] py-[10px] text-[11.5px] font-semibold text-[#24345e] outline-none placeholder:text-[#8b95a9]"
                  />
                </div>

                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={3}
                    className="h-[72px] w-full resize-none rounded-[7px] border border-[#dfe4ea] bg-white px-[13px] py-[10px] text-[11.5px] font-semibold text-[#24345e] outline-none placeholder:text-[#8b95a9]"
                  />
                </div>

                <div className="col-span-2">
                  <FieldLabel>Tags</FieldLabel>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Add tags and press Enter"
                    className="h-[38px] w-[420px] max-w-full rounded-[7px] border border-[#dfe4ea] bg-white px-[13px] text-[11.5px] font-semibold text-[#24345e] outline-none placeholder:text-[#8b95a9]"
                  />
                  <p className="mt-[6px] text-[10px] font-semibold text-[#75829a]">
                    Example: moksha-sewa, compassion, seva, support
                  </p>
                </div>
              </div>
            </section>

            {/* Upload queue */}
            <section className="min-h-0 overflow-visible rounded-[10px] border border-[#e8ebee] bg-white px-[16px] py-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionHeading
                number="5"
                title="Upload Queue"
                subtitle=""
              />

              <div className="mt-[10px] flex h-[64px] items-center justify-center rounded-[8px] border border-[#e5ebf6] bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7fd_100%)] px-[20px]">
                <div className="text-center">
                  <ImageUp className="mx-auto h-[17px] w-[17px] text-[#8390a9]" strokeWidth={2.1} />
                  <p className="mt-[3px] text-[11.5px] font-bold text-[#24345e]">
                    No files in queue
                  </p>
                  <p className="mt-[1px] text-[10px] font-semibold text-[#60708b]">
                    Files you select will appear here and upload will start automatically.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="grid min-h-0 auto-rows-max gap-[10px]">
            {/* File settings */}
            <section className="min-h-0 overflow-visible rounded-[10px] border border-[#e8ebee] bg-white px-[18px] py-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionHeading
                number="3"
                title="File Settings"
                subtitle=""
              />

              <div className="mt-[10px] space-y-[12px]">
                <div>
                  <FieldLabel required>Select Folder</FieldLabel>
                  <div className="relative">
                    <FolderClosed className="pointer-events-none absolute left-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#3a4962]" strokeWidth={2} />
                    <select
                      value={folder}
                      onChange={(e) => setFolder(e.target.value)}
                      className="h-[38px] w-full appearance-none rounded-[7px] border border-[#dfe4ea] bg-white pl-[39px] pr-[36px] text-[11.5px] font-bold text-[#24345e] outline-none"
                    >
                      <option>Root (Media Library)</option>
                      <option>Blog Images</option>
                      <option>Gallery</option>
                      <option>Events</option>
                    </select>
                    <span className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[11px] text-[#5b6982]">
                      ▾
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel>File Type / Category</FieldLabel>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-[38px] w-full appearance-none rounded-[7px] border border-[#dfe4ea] bg-white px-[13px] pr-[36px] text-[11.5px] font-semibold text-[#24345e] outline-none"
                  >
                    <option value="">Select Category</option>
                    <option>Images</option>
                    <option>Documents</option>
                    <option>Videos</option>
                    <option>Audio</option>
                  </select>
                </div>

                <div>
                  <FieldLabel required>Access / Visibility</FieldLabel>
                  <div className="space-y-[10px]">
                    {visibilityOptions.map((item) => {
                      const Icon = item.icon;
                      const active = visibility == item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setVisibility(item.id)}
                          className="flex items-start gap-[11px] text-left"
                        >
                          <span
                            className={`mt-[2px] h-[16px] w-[16px] rounded-full border ${active
                              ? "border-[#0d6b3e] shadow-[inset_0_0_0_4px_#0d6b3e]"
                              : "border-[#ccd4df] bg-white"
                              }`}
                          />
                          <div className="flex gap-[10px]">
                            <div className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#f4f7f8] text-[#25324f]">
                              <Icon className="h-[13px] w-[13px]" strokeWidth={2.1} />
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold leading-none text-[#1d2748]">
                                {item.title}
                              </p>
                              <p className="mt-[6px] text-[10.5px] font-semibold leading-none text-[#66738c]">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-[16px] pt-[2px]">
                  <div>
                    <p className="text-[12px] font-bold text-[#24345e]">
                      Set as Featured <span className="font-semibold text-[#5f6c87]">(if applicable)</span>
                    </p>
                    <p className="mt-[3px] text-[10.5px] font-semibold text-[#66738c]">
                      Show this media in featured section
                    </p>
                  </div>

                  <Toggle checked={featured} onChange={() => setFeatured((prev) => !prev)} />
                </div>
              </div>
            </section>

            {/* Additional options */}
            <section className="min-h-0 overflow-visible rounded-[10px] border border-[#e8ebee] bg-white px-[18px] py-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionHeading
                number="4"
                title="Additional Options"
                subtitle=""
              />

              <div className="mt-[10px] space-y-[12px]">
                <div className="flex items-start justify-between gap-[16px]">
                  <div>
                    <p className="text-[12px] font-semibold text-[#1e2849]">Generate WebP (Image)</p>
                    <p className="mt-[3px] text-[10.5px] font-semibold text-[#66738c]">
                      Create WebP version for better performance
                    </p>
                  </div>
                  <Toggle checked={generateWebp} onChange={() => setGenerateWebp((prev) => !prev)} />
                </div>

                <div className="flex items-start justify-between gap-[16px]">
                  <div>
                    <p className="text-[12px] font-semibold text-[#1e2849]">Optimize Image</p>
                    <p className="mt-[3px] text-[10.5px] font-semibold text-[#66738c]">
                      Automatically compress and optimize images
                    </p>
                  </div>
                  <Toggle checked={optimizeImage} onChange={() => setOptimizeImage((prev) => !prev)} />
                </div>

                <div className="flex items-start justify-between gap-[16px]">
                  <div>
                    <p className="text-[12px] font-semibold text-[#1e2849]">Add Watermark</p>
                    <p className="mt-[3px] text-[10.5px] font-semibold text-[#66738c]">
                      Apply watermark to this media file
                    </p>
                  </div>
                  <Toggle checked={watermark} onChange={() => setWatermark((prev) => !prev)} />
                </div>

                <div className="mt-[2px] flex min-h-[84px] items-start gap-[12px] rounded-[8px] bg-[linear-gradient(90deg,#edf7f0_0%,#f4faf6_100%)] px-[14px] py-[12px]">
                  <div className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full border border-[#cfdece] bg-white text-[#0e693d]">
                    <Info className="h-[16px] w-[16px]" strokeWidth={2.2} />
                  </div>

                  <p className="text-[11px] font-bold leading-[1.6] text-[#293848]">
                    <span className="font-semibold text-[#1b2836]">Note:</span>{" "}
                    Your media files will be organized and stored securely. You can manage them anytime from the Media Library.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* FOOTER ACTIONS */}
        <footer className="sticky bottom-0 z-20 flex items-center justify-between gap-[18px] border-t border-[#edf1f3] bg-[#fffefb]/95 px-[8px] py-[8px] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => router.push("/gallery")}
            className="inline-flex h-[38px] items-center gap-[9px] rounded-[7px] border border-[#e1e4e8] bg-white px-[22px] text-[11px] font-bold text-[#24345e] transition hover:bg-slate-50"
          >
            <X className="h-[16px] w-[16px]" strokeWidth={2.2} />
            Cancel
          </button>

          <div className="flex items-center gap-[14px]">
            <button
              type="button"
              onClick={() => {
                alert("Saved as Draft!");
                router.push("/gallery");
              }}
              className="inline-flex h-[38px] items-center gap-[9px] rounded-[7px] border border-[#e1e4e8] bg-white px-[22px] text-[11px] font-bold text-[#24345e] transition hover:bg-slate-50"
            >
              <Bookmark className="h-[16px] w-[16px]" strokeWidth={2.1} />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Media Uploaded & Saved Successfully!");
                router.push("/gallery");
              }}
              className="inline-flex h-[38px] items-center gap-[9px] rounded-[7px] bg-[linear-gradient(180deg,#066434_0%,#03552c_100%)] px-[24px] text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(4,91,48,0.12)] transition hover:opacity-95"
            >
              <Upload className="h-[16px] w-[16px]" strokeWidth={2.1} />
              Upload &amp; Save
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
