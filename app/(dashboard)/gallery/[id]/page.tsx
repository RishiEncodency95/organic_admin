"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  CircleHelp,
  FolderClosed,
  FolderCog,
  FolderOpen,
  FolderPlus,
  Globe,
  GripVertical,
  Lock,
  Shield,
  X,
} from "lucide-react";

type VisibilityType = "public" | "members" | "private";

const visibilityCards: {
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

const folderGuidelines = [
  {
    title: "Use clear and consistent folder names.",
    text: "This helps in quick identification.",
    icon: FolderCog,
  },
  {
    title: "Avoid creating too many sub-folders.",
    text: "Keep the structure simple and logical.",
    icon: FolderOpen,
  },
  {
    title: "Keep related media in the same folder.",
    text: "This improves content management.",
    icon: GripVertical,
  },
  {
    title: "Use descriptive names for better SEO.",
    text: "Folder names may impact SEO indirectly.",
    icon: FolderClosed,
  },
];

const quickTips = [
  "You can create unlimited folders.",
  "Drag & drop files to move between folders.",
  "Rename or delete folders anytime.",
  "Set permissions to control access.",
  "Organized folders make content updates faster.",
];

function SectionTitle({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="text-[14px] font-semibold tracking-[-0.01em] text-[#18224d]">
        {number}. {title}
      </h2>
      <p className="mt-[2px] text-[10px] font-semibold text-[#5e6b86]">
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
    <label className="mb-[5px] block text-[12px] font-bold text-[#24345e]">
      {children}
      {required ? <span className="ml-[2px] text-[#e03a3a]">*</span> : null}
      {optional ? <span className="font-semibold text-[#5f6c87]"> (Optional)</span> : null}
    </label>
  );
}

export default function AddNewFolderPage() {
  const router = useRouter();
  const [folderName, setFolderName] = useState("");
  const [parentFolder, setParentFolder] = useState("Root (Media Library)");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<VisibilityType>("public");
  const [featured, setFeatured] = useState(false);

  const previewName = useMemo(
    () => folderName.trim() || "Folder Name",
    [folderName],
  );

  const previewDescription = useMemo(
    () => description.trim() || "Description will appear here",
    [description],
  );

  return (
    <main className="h-full min-h-0 overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[12px] pb-[24px] text-[#16233f] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
      <div className="min-h-full w-full">
        {/* Header */}
        <header className="flex items-start justify-between gap-[18px]">
          <div className="min-w-0">
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#075b33]">
              Add New Folder
            </h1>

            <nav
              className="mt-[7px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1c2c57]"
              aria-label="Breadcrumb"
            >
              <span>Dashboard</span>
              <span className="text-[#7a859a]">›</span>
              <span>Media Library</span>
              <span className="text-[#7a859a]">›</span>
              <span>Add New Folder</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-[14px] pt-[2px]">
            <button
              type="button"
              onClick={() => router.push("/gallery")}
              className="inline-flex h-[40px] items-center gap-[9px] rounded-[7px] border border-[#e1e4e8] bg-white px-[20px] text-[11.5px] font-bold text-[#24345e] shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition hover:bg-[#f8fafc]"
            >
              <ArrowLeft className="h-[16px] w-[16px]" strokeWidth={2.2} />
              Back to Media Library
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Folder Created Successfully!");
                router.push("/gallery");
              }}
              className="inline-flex h-[40px] items-center gap-[9px] rounded-[7px] bg-[linear-gradient(180deg,#066434_0%,#03552c_100%)] px-[22px] text-[11.5px] font-bold text-white shadow-[0_8px_18px_rgba(4,91,48,0.12)] transition hover:opacity-95"
            >
              <FolderPlus className="h-[16px] w-[16px]" strokeWidth={2.2} />
              Create Folder
            </button>
          </div>
        </header>

        {/* Content */}
        <section className="mt-[16px] grid items-start gap-[16px] xl:grid-cols-[minmax(0,1.95fr)_minmax(330px,0.95fr)]">
          {/* Left Column */}
          <div className="space-y-[12px]">
            {/* Section 1 */}
            <section className="rounded-[10px] border border-[#e8ebee] bg-white px-[16px] py-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionTitle
                number="1"
                title="Folder Information"
                subtitle="Create a new folder to organize your media files."
              />

              <div className="mt-[14px] grid grid-cols-2 gap-x-[18px] gap-y-[12px]">
                <div>
                  <FieldLabel required>Folder Name</FieldLabel>
                  <input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    className="h-[38px] w-full rounded-[7px] border border-[#dfe3e8] bg-white px-[14px] text-[11.5px] font-semibold text-[#24345e] outline-none placeholder:text-[#8c96ab]"
                  />
                  <p className="mt-[4px] text-[10px] font-semibold text-[#60708b]">
                    Choose a clear and meaningful name for the folder.
                  </p>
                </div>

                <div>
                  <FieldLabel optional>Parent Folder</FieldLabel>
                  <div className="relative">
                    <FolderClosed className="pointer-events-none absolute left-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#36445f]" strokeWidth={2} />
                    <select
                      value={parentFolder}
                      onChange={(e) => setParentFolder(e.target.value)}
                      className="h-[38px] w-full appearance-none rounded-[7px] border border-[#dfe3e8] bg-white pl-[40px] pr-[38px] text-[11.5px] font-bold text-[#24345e] outline-none"
                    >
                      <option>Root (Media Library)</option>
                      <option>Events</option>
                      <option>Blog Images</option>
                      <option>Gallery</option>
                    </select>
                    <span className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] text-[#56657f]">
                      ▾
                    </span>
                  </div>
                  <p className="mt-[4px] text-[10px] font-semibold text-[#60708b]">
                    Select parent folder to create a sub-folder.
                  </p>
                </div>

                <div className="col-span-2">
                  <FieldLabel optional>Folder Description</FieldLabel>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter folder description"
                    rows={3}
                    className="h-[68px] w-full resize-none rounded-[7px] border border-[#dfe3e8] bg-white px-[14px] py-[9px] text-[11.5px] font-semibold text-[#24345e] outline-none placeholder:text-[#8c96ab]"
                  />
                  <p className="mt-[4px] text-[10px] font-semibold text-[#60708b]">
                    Describe the purpose of this folder.
                  </p>
                </div>
              </div>

              <div className="mt-[12px] flex h-[42px] items-center gap-[10px] rounded-[7px] bg-[linear-gradient(90deg,#eef7f1_0%,#f4faf6_100%)] px-[14px]">
                <div className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full border border-[#cadece] bg-white text-[#0d6b3e]">
                  <CircleHelp className="h-[16px] w-[16px]" strokeWidth={2.2} />
                </div>
                <p className="text-[10.5px] font-bold text-[#2d3b4a]">
                  <span className="font-semibold text-[#1b2836]">Note:</span>{" "}
                  Folders help you keep your media files organized and easy to find.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="rounded-[10px] border border-[#e8ebee] bg-white px-[16px] py-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionTitle
                number="2"
                title="Folder Settings"
                subtitle="Configure settings and permissions for this folder."
              />

              <div className="mt-[14px]">
                <FieldLabel required>Access / Visibility</FieldLabel>

                <div className="grid grid-cols-3 gap-[12px]">
                  {visibilityCards.map((item) => {
                    const Icon = item.icon;
                    const active = visibility === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setVisibility(item.id)}
                        className={`relative flex h-[60px] items-center gap-[12px] rounded-[8px] border px-[12px] text-left transition ${active
                          ? "border-[#8fc5a8] bg-[#f5fbf7] shadow-[inset_0_0_0_1px_rgba(29,117,72,0.08)]"
                          : "border-[#e2e6ea] bg-white"
                          }`}
                      >
                        <span
                          className={`absolute left-[10px] top-[10px] h-[14px] w-[14px] rounded-full border ${active
                            ? "border-[#0d6b3e] shadow-[inset_0_0_0_4px_#0d6b3e]"
                            : "border-[#ced5df] bg-white"
                            }`}
                        />
                        <div
                          className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full ${active ? "bg-[#e8f5ec] text-[#09663a]" : "bg-[#f7f8fa] text-[#2d3649]"
                            }`}
                        >
                          <Icon className="h-[17px] w-[17px]" strokeWidth={2.1} />
                        </div>

                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold text-[#18224d]">
                            {item.title}
                          </div>
                          <div className="mt-[2px] text-[9.5px] font-semibold text-[#67748d]">
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-[12px] flex items-center justify-between gap-[20px]">
                  <div>
                    <p className="text-[12px] font-bold text-[#24345e]">
                      Set as Featured Folder <span className="font-semibold text-[#5f6c87]">(Optional)</span>
                    </p>
                    <p className="mt-[2px] text-[9.5px] font-semibold text-[#60708b]">
                      Show this folder in featured section (if applicable)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFeatured((prev) => !prev)}
                    className={`relative h-[22px] w-[36px] rounded-full transition ${featured ? "bg-[#0d6b3e]" : "bg-[#d7dce5]"
                      }`}
                    aria-pressed={featured}
                  >
                    <span
                      className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition ${featured ? "left-[16px]" : "left-[2px]"
                        }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="rounded-[10px] border border-[#e8ebee] bg-white px-[16px] py-[14px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <SectionTitle
                number="3"
                title="Folder Preview"
                subtitle="This is how the folder will appear in the media library."
              />

              <div className="mt-[10px] flex h-[72px] items-center rounded-[9px] border border-[#edf0f3] bg-[#fffefc] px-[18px]">
                <div className="grid h-[46px] w-[46px] place-items-center rounded-[10px] bg-[#fff9dc]">
                  <FolderClosed className="h-[28px] w-[28px] fill-[#f6c61b] text-[#ebb611]" strokeWidth={1.8} />
                </div>

                <div className="ml-[14px] min-w-0">
                  <h3 className="truncate text-[12px] font-semibold text-[#1c2946]">
                    {previewName}
                  </h3>
                  <p className="mt-[2px] truncate text-[10px] font-semibold text-[#697791]">
                    {previewDescription}
                  </p>
                  <p className="mt-[4px] text-[9.5px] font-bold text-[#77839a]">
                    0 Files <span className="mx-[8px]">•</span> Created on 31 May 2026
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="grid min-h-0 grid-rows-[minmax(0,1.04fr)_minmax(0,0.82fr)] gap-[8px]">
            <section className="min-h-0 overflow-hidden rounded-[10px] border border-[#e8ebee] bg-white px-[18px] py-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#18224d]">
                Folder Guidelines
              </h3>
              <p className="mt-[4px] text-[11px] font-semibold text-[#66738c]">
                Follow these best practices for better organization.
              </p>

              <div className="mt-[14px] space-y-[12px]">
                {folderGuidelines.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex gap-[14px]">
                      <div className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[8px] bg-[#eef7f0] text-[#2b7d50]">
                        <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10.5px] font-semibold leading-[1.35] text-[#20304f]">
                          {item.title}
                        </p>
                        <p className="mt-[2px] text-[9.5px] font-semibold leading-[1.35] text-[#66738c]">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="min-h-0 overflow-hidden rounded-[10px] border border-[#e8ebee] bg-white px-[18px] py-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.02)]">
              <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#18224d]">
                Quick Tips
              </h3>
              <p className="mt-[4px] text-[11px] font-semibold text-[#66738c]">
                Tips for managing your media library effectively.
              </p>

              <div className="mt-[12px] rounded-[8px] border border-[#edf1f5] bg-[#fbfcfe] px-[18px] py-[12px]">
                <ul className="space-y-[9px]">
                  {quickTips.map((tip) => (
                    <li
                      key={tip}
                      className="grid grid-cols-[8px_1fr] gap-[10px] text-[10.5px] font-semibold leading-[1.4] text-[#27355b]"
                    >
                      <span className="pt-[1px] text-[10px] text-[#1a2851]">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </section>

        {/* Footer actions */}
        <footer className="sticky bottom-0 z-20 mt-[16px] flex items-center justify-between gap-[18px] border-t border-[#edf1f3] bg-[#fffefb]/95 px-[8px] py-[10px] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => router.push("/gallery")}
            className="inline-flex h-[38px] items-center gap-[9px] rounded-[7px] border border-[#e1e4e8] bg-white px-[20px] text-[11px] font-bold text-[#24345e] transition hover:bg-[#f8fafc]"
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
              className="inline-flex h-[38px] items-center gap-[9px] rounded-[7px] border border-[#e1e4e8] bg-white px-[22px] text-[11px] font-bold text-[#24345e] transition hover:bg-[#f8fafc]"
            >
              <Bookmark className="h-[16px] w-[16px]" strokeWidth={2.1} />
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => {
                alert("Folder Created Successfully!");
                router.push("/gallery");
              }}
              className="inline-flex h-[38px] items-center gap-[9px] rounded-[7px] bg-[linear-gradient(180deg,#066434_0%,#03552c_100%)] px-[22px] text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(4,91,48,0.12)] transition hover:opacity-95"
            >
              <FolderPlus className="h-[16px] w-[16px]" strokeWidth={2.2} />
              Create Folder
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
