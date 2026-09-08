"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Clock3,
  Eye,
  Globe2,
  Image as ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Save,
  Send,
  Strikethrough,
  Underline,
  Undo2,
  Upload,
  Video,
} from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition ${checked ? "bg-[#0b6a3b]" : "bg-[#d7dde6]"
        }`}
    >
      <span
        className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${checked ? "left-[18px]" : "left-[2px]"
          }`}
      />
    </button>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-[6px] block text-[11px] font-semibold text-[#24345e]">
      {children}
      {required ? <span className="ml-[2px] text-[#dc3c3c]">*</span> : null}
    </label>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[9px] border border-[#e7e9ec] bg-white px-[16px] py-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
      <h2 className="text-[14px] font-semibold text-[#17234a]">{title}</h2>
      <div className="mt-[12px]">{children}</div>
    </section>
  );
}

export default function AddNewPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [status, setStatus] = useState("Draft");
  const [visibility, setVisibility] = useState("Public");
  const [publishMode, setPublishMode] = useState<"now" | "later">("now");
  const [publishDate, setPublishDate] = useState("02 Jun 2026");
  const [publishTime, setPublishTime] = useState("10:00 AM");

  const [comments, setComments] = useState(true);
  const [homepage, setHomepage] = useState(true);
  const [awareness, setAwareness] = useState(false);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");

  const wordCount = useMemo(
    () => (content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0),
    [content],
  );

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
    }
  };

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        <header className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#075b33]">
              Add New Post
            </h1>
            <nav className="mt-[10px] flex items-center gap-[8px] text-[11px] font-semibold text-[#1d2b58]">
              <span
                onClick={() => router.push("/")}
                className="cursor-pointer transition hover:text-[#075b33]"
              >
                Dashboard
              </span>
              <span className="text-[#7b8597]">›</span>
              <span
                onClick={() => router.push("/blogs")}
                className="cursor-pointer transition hover:text-[#075b33]"
              >
                Blog &amp; Awareness
              </span>
              <span className="text-[#7b8597]">›</span>
              <span className="text-[#075b33]">Add New Post</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => router.push("/blogs")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-[15px] w-[15px]" />
              Back to Blog &amp; Awareness
            </button>

            <button
              type="button"
              onClick={() => router.push("/blogs")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Save className="h-[15px] w-[15px]" />
              Save Draft
            </button>
          </div>
        </header>

        <section className="mt-[16px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1.72fr)_minmax(350px,0.92fr)]">
          <div className="space-y-[12px]">
            <Panel title="1. Post Details">
              <div className="space-y-[14px]">
                <div>
                  <FieldLabel required>Title</FieldLabel>
                  <div className="relative">
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value.slice(0, 150))}
                      placeholder="Enter an engaging title"
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] pr-[54px] text-[10.5px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                    />
                    <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[8.5px] font-semibold text-[#6d7890]">
                      {title.length}/150
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[18px]">
                  <div>
                    <FieldLabel required>Category</FieldLabel>
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                    >
                      <option value="">Select Category</option>
                      <option>Moksha Sewa</option>
                      <option>Awareness</option>
                      <option>Stories</option>
                      <option>Guidance</option>
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Tags</FieldLabel>
                    <input
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                      placeholder="Add tags and press Enter"
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] text-[10.5px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                    />
                    <p className="mt-[5px] text-[8.8px] font-semibold text-[#728096]">
                      E.g. moksha-sewa, awareness, dignity, support
                    </p>
                  </div>
                </div>

                <div>
                  <FieldLabel>Excerpt (Short Description)</FieldLabel>
                  <textarea
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value.slice(0, 250))}
                    placeholder="Write a short summary of the post..."
                    className="h-[72px] w-full resize-none rounded-[6px] border border-[#dfe4e8] bg-white px-[13px] py-[10px] text-[10.5px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                  />
                  <div className="mt-[5px] flex justify-end">
                    <span className="text-[8.5px] font-semibold text-[#6d7890]">
                      {excerpt.length}/250
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel>Featured Image</FieldLabel>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {uploadedImage ? (
                    <div className="relative overflow-hidden rounded-[7px] border border-[#d6dde2] bg-white p-[8px]">
                      <img
                        src={uploadedImage}
                        alt="Uploaded cover"
                        className="h-[180px] w-full rounded-[5px] object-cover"
                      />
                      <div className="mt-[8px] flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-[#075b33]">
                          ✓ Image Uploaded Successfully
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-[4px] border border-[#dfe4e8] bg-white px-[10px] py-[4px] text-[8.5px] font-semibold text-[#35445f] hover:bg-slate-50"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-[7px] border border-dashed border-[#d6dde2] bg-[#fffefc] transition hover:bg-slate-50"
                    >
                      <ImageIcon className="h-[34px] w-[34px] text-[#176f45]" strokeWidth={1.7} />
                      <p className="mt-[9px] text-[10.5px] font-semibold text-[#49566e]">
                        Drag &amp; drop image here or
                      </p>
                      <span className="mt-[8px] inline-flex h-[32px] items-center gap-[7px] rounded-[5px] border border-[#cfe0d4] bg-white px-[12px] text-[8.8px] font-semibold text-[#14683d]">
                        <Upload className="h-[12px] w-[12px]" />
                        Browse Files
                      </span>
                      <p className="mt-[10px] text-[8.5px] font-semibold text-[#718096]">
                        Recommended size: 1200 × 675 px (JPG, PNG, WebP)
                      </p>
                      <p className="mt-[3px] text-[8.5px] font-semibold text-[#718096]">
                        Max file size: 2 MB
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel required>Content</FieldLabel>
                  <div className="overflow-hidden rounded-[6px] border border-[#dfe4e8] bg-white">
                    <div className="flex min-h-[40px] flex-wrap items-center gap-[11px] border-b border-[#e7e9ec] px-[12px] text-[#2f3c56]">
                      <button type="button" className="inline-flex items-center gap-[8px] text-[9.5px] font-semibold">
                        Paragraph
                        <ChevronDown className="h-[12px] w-[12px]" />
                      </button>

                      <Bold className="h-[14px] w-[14px]" />
                      <Italic className="h-[14px] w-[14px]" />
                      <Underline className="h-[14px] w-[14px]" />
                      <Strikethrough className="h-[14px] w-[14px]" />

                      <span className="h-[18px] w-px bg-[#e1e5e9]" />

                      <Quote className="h-[14px] w-[14px]" />
                      <List className="h-[14px] w-[14px]" />
                      <ListOrdered className="h-[14px] w-[14px]" />
                      <AlignLeft className="h-[14px] w-[14px]" />
                      <AlignCenter className="h-[14px] w-[14px]" />
                      <AlignRight className="h-[14px] w-[14px]" />
                      <Link2 className="h-[14px] w-[14px]" />
                      <ImageIcon className="h-[14px] w-[14px]" />
                      <Video className="h-[14px] w-[14px]" />
                      <ChevronDown className="h-[11px] w-[11px]" />
                      <CircleHelp className="h-[14px] w-[14px]" />

                      <span className="h-[18px] w-px bg-[#e1e5e9]" />

                      <Undo2 className="h-[14px] w-[14px]" />
                      <Redo2 className="h-[14px] w-[14px] text-slate-400" />
                    </div>

                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="Write your content here..."
                      className="h-[122px] w-full resize-none bg-white px-[14px] py-[12px] text-[10.5px] font-semibold text-[#2d3b58] outline-none placeholder:text-[#8d97aa]"
                    />

                    <div className="flex h-[28px] items-center border-t border-[#e7e9ec] px-[12px]">
                      <span className="text-[8.5px] font-semibold text-[#66738b]">
                        Word count: {wordCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="SEO Preview">
              <div className="rounded-[7px] border border-[#e4e8eb] bg-white px-[18px] py-[14px]">
                <div className="flex items-start gap-[10px]">
                  <div className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <Globe2 className="h-[15px] w-[15px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-[#35445f]">mokshasewa.org</p>
                    <p className="mt-[2px] text-[8.5px] font-semibold text-[#5f6c82]">
                      https://www.mokshasewa.org/{slug.trim() || "your-post-url"}
                    </p>
                  </div>
                </div>

                <p className="mt-[10px] text-[14px] font-semibold text-[#233b8c]">
                  {metaTitle.trim() || title.trim() || "Your Post Title Will Appear Here"}
                </p>

                <p className="mt-[5px] text-[9px] font-semibold leading-[1.45] text-[#4f5d72]">
                  {metaDescription.trim() ||
                    excerpt.trim() ||
                    "This is how your post may appear in search engine results. Make it compelling to get more clicks."}
                </p>
              </div>
            </Panel>
          </div>

          <div className="space-y-[12px]">
            <Panel title="2. Publish Settings">
              <div className="space-y-[14px]">
                <div>
                  <FieldLabel required>Status</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-[14px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-amber-400" />
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[34px] pr-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                    >
                      <option>Draft</option>
                      <option>Published</option>
                      <option>Scheduled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel required>Visibility</FieldLabel>
                  <div className="relative">
                    <Globe2 className="absolute left-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#59657a]" />
                    <select
                      value={visibility}
                      onChange={(event) => setVisibility(event.target.value)}
                      className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[36px] pr-[12px] text-[10.5px] font-semibold text-[#2f3d58] outline-none"
                    >
                      <option>Public</option>
                      <option>Members Only</option>
                      <option>Private</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-[12px]">
                  <button
                    type="button"
                    onClick={() => setPublishMode("now")}
                    className="flex w-full items-start gap-[10px] text-left"
                  >
                    <span
                      className={`mt-[1px] h-[16px] w-[16px] shrink-0 rounded-full border ${publishMode === "now"
                          ? "border-[#0b6a3b] shadow-[inset_0_0_0_4px_#0b6a3b]"
                          : "border-[#ccd4df] bg-white"
                        }`}
                    />
                    <div>
                      <p className="text-[10.5px] font-semibold text-[#24345e]">Publish Immediately</p>
                      <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                        Post will be published right away
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPublishMode("later")}
                    className="flex w-full items-start gap-[10px] text-left"
                  >
                    <span
                      className={`mt-[1px] h-[16px] w-[16px] shrink-0 rounded-full border ${publishMode === "later"
                          ? "border-[#0b6a3b] shadow-[inset_0_0_0_4px_#0b6a3b]"
                          : "border-[#ccd4df] bg-white"
                        }`}
                    />
                    <div>
                      <p className="text-[10.5px] font-semibold text-[#24345e]">Schedule for Later</p>
                      <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                        Choose a future date &amp; time
                      </p>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-[10px]">
                  <div className="relative">
                    <input
                      value={publishDate}
                      onChange={(event) => setPublishDate(event.target.value)}
                      disabled={publishMode !== "later"}
                      className="h-[36px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] pr-[34px] text-[9.5px] font-semibold text-[#35445f] outline-none disabled:bg-[#fafafa] disabled:text-[#77839a]"
                    />
                    <CalendarDays className="absolute right-[10px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#59657a]" />
                  </div>

                  <div className="relative">
                    <input
                      value={publishTime}
                      onChange={(event) => setPublishTime(event.target.value)}
                      disabled={publishMode !== "later"}
                      className="h-[36px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[11px] pr-[34px] text-[9.5px] font-semibold text-[#35445f] outline-none disabled:bg-[#fafafa] disabled:text-[#77839a]"
                    />
                    <Clock3 className="absolute right-[10px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#59657a]" />
                  </div>
                </div>

                <div className="flex min-h-[38px] items-center gap-[9px] rounded-[6px] border border-[#d9e7f5] bg-[linear-gradient(90deg,#f2f8ff,#f7fbff)] px-[12px]">
                  <Info className="h-[14px] w-[14px] shrink-0 text-[#4a93d7]" />
                  <p className="text-[8.8px] font-semibold text-[#52627b]">
                    <span className="text-[#32435f]">Tip:</span> Publish at the right time to reach more people.
                  </p>
                </div>
              </div>
            </Panel>

            <Panel title="3. Additional Settings">
              <div className="space-y-[12px]">
                <div className="flex items-center justify-between gap-[14px]">
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#24345e]">Allow Comments</p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                      Allow users to comment on this post
                    </p>
                  </div>
                  <Toggle checked={comments} onChange={() => setComments((v) => !v)} />
                </div>

                <div className="flex items-center justify-between gap-[14px]">
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#24345e]">Show in Homepage</p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                      Display this post in homepage/featured section
                    </p>
                  </div>
                  <Toggle checked={homepage} onChange={() => setHomepage((v) => !v)} />
                </div>

                <div className="flex items-center justify-between gap-[14px]">
                  <div>
                    <p className="text-[10.5px] font-semibold text-[#24345e]">
                      Mark as Awareness Campaign
                    </p>
                    <p className="mt-[3px] text-[9px] font-semibold text-[#6d7890]">
                      Highlight this post as part of awareness initiatives
                    </p>
                  </div>
                  <Toggle checked={awareness} onChange={() => setAwareness((v) => !v)} />
                </div>
              </div>
            </Panel>

            <Panel title="4. SEO Settings (Optional)">
              <div className="space-y-[13px]">
                <div>
                  <FieldLabel>Meta Title</FieldLabel>
                  <div className="relative">
                    <input
                      value={metaTitle}
                      onChange={(event) => setMetaTitle(event.target.value.slice(0, 60))}
                      placeholder="Enter meta title"
                      className="h-[38px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] pr-[48px] text-[10px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                    />
                    <span className="absolute right-[9px] top-1/2 -translate-y-1/2 text-[8px] font-semibold text-[#6d7890]">
                      {metaTitle.length}/60
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel>Meta Description</FieldLabel>
                  <div className="relative">
                    <textarea
                      value={metaDescription}
                      onChange={(event) => setMetaDescription(event.target.value.slice(0, 160))}
                      placeholder="Enter meta description"
                      className="h-[72px] w-full resize-none rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] py-[10px] pb-[22px] text-[10px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                    />
                    <span className="absolute bottom-[7px] right-[9px] text-[8px] font-semibold text-[#6d7890]">
                      {metaDescription.length}/160
                    </span>
                  </div>
                </div>

                <div>
                  <FieldLabel>URL Slug</FieldLabel>
                  <input
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="Enter URL slug"
                    className="h-[38px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#2f3d58] outline-none placeholder:text-[#8d97aa]"
                  />
                  <p className="mt-[5px] text-[8.5px] font-semibold text-[#728096]">
                    E.g. dignity-in-every-final-journey
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </section>

        <footer className="sticky bottom-0 z-20 mt-[12px] flex min-h-[58px] items-center justify-end gap-[10px] border-t border-[#edf0f2] bg-[#fffefb]/95 px-[8px] py-[8px] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => router.push("/blogs")}
            className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[20px] text-[10px] font-semibold text-[#273655] transition hover:bg-slate-50"
          >
            <Eye className="h-[14px] w-[14px]" />
            Preview Post
          </button>

          <button
            type="button"
            onClick={() => router.push("/blogs")}
            className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
          >
            <Send className="h-[14px] w-[14px]" />
            Publish Post
            <ChevronDown className="h-[13px] w-[13px]" />
          </button>
        </footer>
      </div>
    </main>
  );
}
