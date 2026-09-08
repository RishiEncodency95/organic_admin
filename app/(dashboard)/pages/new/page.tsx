"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowLeft,
  Bold,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  FormInput,
  ImageIcon,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreVertical,
  Plus,
  Quote,
  Save,
  Settings,
  Sparkles,
  Strikethrough,
  Table2,
  Underline,
  UploadCloud,
  Video,
} from "lucide-react";
import { PUBLIC_SITE_URL } from "@/lib/cmsPages";

/* =========================================================
   TYPES
========================================================= */

type PageStatus = "Draft" | "Published";

type FormState = {
  pageTitle: string;
  slug: string;
  template: string;
  parent: string;
  metaTitle: string;
  content: string;

  status: PageStatus;
  author: string;
  showInNavigation: boolean;
  menuOrder: string;

  seoTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  robotsMeta: string;

  noIndex: boolean;
  noFollow: boolean;
  xmlSitemap: boolean;
  breadcrumb: boolean;
  passwordProtect: boolean;
};

/* =========================================================
   INITIAL STATE
========================================================= */

const initialForm: FormState = {
  pageTitle: "",
  slug: "",
  template: "",
  parent: "— No Parent (Top Level) —",
  metaTitle: "",
  content: "",

  status: "Draft",
  author: "Admin User",
  showInNavigation: true,
  menuOrder: "0",

  seoTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  robotsMeta: "Index, Follow",

  noIndex: false,
  noFollow: false,
  xmlSitemap: true,
  breadcrumb: true,
  passwordProtect: false,
};

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  number,
  title,
  description,
  icon,
  action,
}: {
  number: number;
  title: string;
  description?: string;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-[9px]">
        <div className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-[6px] bg-[#edf6eb] text-[#26764b]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-[13.5px] font-semibold leading-[16px] text-[#326448]">
            {number}. {title}
          </h2>

          {description && (
            <p className="mt-[2px] text-[10px] font-semibold leading-[12px] text-[#818996]">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   LABEL
========================================================= */

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-[4px] block text-[10.5px] font-semibold leading-[13px] text-[#465168]">
      {children}

      {required && (
        <span className="ml-[3px] text-red-500">
          *
        </span>
      )}
    </label>
  );
}

/* =========================================================
   INPUT
========================================================= */

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  rightCount = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rightCount?: boolean;
}) {
  return (
    <div>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-[32px] w-full rounded-[5px] border border-[#dedfdb] bg-white px-[10px] text-[10.5px] font-semibold text-[#414b5e] outline-none placeholder:text-[10.5px] placeholder:font-semibold placeholder:text-[#969da8] focus:border-[#91a98f]"
      />

      {rightCount && maxLength && (
        <p className="mt-[2px] text-right text-[9px] font-semibold leading-[10px] text-[#8c929c]">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-[32px] w-full cursor-pointer appearance-none rounded-[5px] border border-[#dedfdb] bg-white pl-[10px] pr-[28px] text-[10.5px] font-semibold text-[#414b5e] outline-none focus:border-[#91a98f]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Choose a template"}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-[9px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#727b88]" />
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

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
      className={`relative h-[20px] w-[37px] shrink-0 rounded-full transition ${checked
          ? "bg-[#087540]"
          : "bg-[#cfd4d0]"
        }`}
    >
      <span
        className={`absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all ${checked
            ? "left-[20px]"
            : "left-[3px]"
          }`}
      />
    </button>
  );
}

/* =========================================================
   CHECK OPTION
========================================================= */

function CheckOption({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[39px] items-start gap-[9px]">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`mt-[1px] grid h-[15px] w-[15px] shrink-0 place-items-center rounded-[3px] border transition ${checked
            ? "border-[#176a40] bg-[#176a40] text-white"
            : "border-[#cdd1cd] bg-white"
          }`}
      >
        {checked && (
          <Check className="h-[9px] w-[9px]" />
        )}
      </button>

      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold leading-[12px] text-[#455064]">
          {title}
        </p>

        <p className="mt-[2px] text-[9.5px] font-semibold leading-[11px] text-[#858c98]">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

function ToolbarButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-[27px] min-w-[27px] place-items-center rounded-[4px] px-[5px] transition ${active
          ? "bg-[#edf5ec] text-[#176b40]"
          : "text-[#455064] hover:bg-[#f4f5f2]"
        }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AddNewPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [featuredImage, setFeaturedImage] =
    useState<string | null>(null);

  const [activeFormats, setActiveFormats] =
    useState<string[]>([]);

  const update = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleTitleChange = (
    value: string,
  ) => {
    setForm((previous) => {
      const oldAutoSlug = previous.pageTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const newAutoSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      return {
        ...previous,
        pageTitle: value,
        slug:
          !previous.slug ||
            previous.slug === oldAutoSlug
            ? newAutoSlug
            : previous.slug,
      };
    });
  };

  const toggleFormat = (
    format: string,
  ) => {
    setActiveFormats((previous) =>
      previous.includes(format)
        ? previous.filter(
          (item) => item !== format,
        )
        : [...previous, format],
    );
  };

  const handleImage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (featuredImage) {
      URL.revokeObjectURL(
        featuredImage,
      );
    }

    const objectUrl =
      URL.createObjectURL(file);

    setFeaturedImage(objectUrl);
  };

  const wordCount = form.content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const saveDraft = () => {
    setForm((previous) => ({
      ...previous,
      status: "Draft",
    }));
  };

  const publishPage = () => {
    setForm((previous) => ({
      ...previous,
      status: "Published",
    }));
  };

  return (
    <div className="w-full bg-[#fffefb] text-[#172238]">
      <div className="flex flex-col px-[16px] pb-[8px] pt-[10px]">

        {/* =================================================
            TOP HEADING
        ================================================= */}

        <div className="flex h-[52px] shrink-0 items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold leading-[23px] tracking-[-0.02em] text-[#1c5033]">
              Add New Page
            </h1>

            <div className="mt-[4px] flex items-center gap-[6px] text-[10px] font-semibold text-[#6f7888]">
              <Link href="/pages" className="hover:text-[#326646] hover:underline">
                Pages &amp; CMS
              </Link>

              <ChevronRight className="h-[10px] w-[10px]" />

              <span>
                Add New Page
              </span>
            </div>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() =>
                router.back()
              }
              className="flex h-[35px] items-center gap-[6px] rounded-[6px] border border-[#dedfdb] bg-white px-[15px] text-[10.5px] font-semibold text-[#596274] transition hover:bg-[#f8f8f5]"
            >
              <ArrowLeft className="h-[12px] w-[12px]" />

              Back to Pages
            </button>

            <button
              type="button"
              onClick={saveDraft}
              className="flex h-[35px] items-center gap-[6px] rounded-[6px] border border-[#cdb879] bg-[#fffefa] px-[16px] text-[10.5px] font-semibold text-[#326646]"
            >
              <Save className="h-[12px] w-[12px]" />

              Save as Draft
            </button>

            <div className="flex h-[35px] overflow-hidden rounded-[6px] bg-[linear-gradient(135deg,#087141,#05552f)] text-white shadow-[0_4px_12px_rgba(8,88,49,0.14)]">
              <button
                type="button"
                onClick={publishPage}
                className="flex items-center gap-[6px] px-[17px] text-[10.5px] font-semibold"
              >
                <Plus className="h-[12px] w-[12px]" />

                Publish Page
              </button>

              <button
                type="button"
                className="grid w-[31px] place-items-center border-l border-white/15"
              >
                <ChevronDown className="h-[11px] w-[11px]" />
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid items-start grid-cols-[minmax(0,2.12fr)_1fr] gap-[10px]">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="flex flex-col gap-[8px]">

            {/* BASIC INFORMATION */}

            <section className="shrink-0 rounded-[7px] border border-[#e7e7e3] bg-white px-[14px] py-[10px]">
              <SectionHeader
                number={1}
                title="Basic Information"
                description="Provide the essential information about your page."
                icon={
                  <FileText className="h-[14px] w-[14px]" />
                }
              />

              <div className="mt-[9px] grid grid-cols-[1.25fr_1fr_.78fr] gap-x-[17px] gap-y-[8px]">
                <div>
                  <FieldLabel required>
                    Page Title
                  </FieldLabel>

                  <TextInput
                    value={form.pageTitle}
                    onChange={handleTitleChange}
                    placeholder="Enter page title"
                    maxLength={100}
                    rightCount
                  />
                </div>

                <div>
                  <FieldLabel required>
                    URL Slug
                  </FieldLabel>

                  <div className="flex h-[32px] overflow-hidden rounded-[5px] border border-[#dedfdb] bg-white">
                    <div className="flex shrink-0 items-center border-r border-[#e5e6e2] bg-[#fafaf8] px-[8px] text-[9.5px] font-semibold text-[#647082]">
                      {PUBLIC_SITE_URL}/
                    </div>

                    <input
                      value={form.slug}
                      maxLength={80}
                      onChange={(event) =>
                        update(
                          "slug",
                          event.target.value,
                        )
                      }
                      placeholder="enter-page-slug"
                      className="min-w-0 flex-1 px-[8px] text-[10px] font-semibold text-[#414b5e] outline-none placeholder:text-[10px] placeholder:font-semibold placeholder:text-[#969da8]"
                    />
                  </div>

                  <p className="mt-[2px] text-right text-[9px] leading-[10px] text-[#8c929c]">
                    {form.slug.length} / 80
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Select Template
                  </FieldLabel>

                  <SelectField
                    value={form.template}
                    onChange={(value) =>
                      update(
                        "template",
                        value,
                      )
                    }
                    options={[
                      "",
                      "Default Template",
                      "Landing Page",
                      "Service Page",
                      "Content Page",
                    ]}
                  />

                  <p className="mt-[3px] text-[9px] leading-[10px] text-[#8b919b]">
                    Select a layout template
                    for this page
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Page Parent
                  </FieldLabel>

                  <SelectField
                    value={form.parent}
                    onChange={(value) =>
                      update(
                        "parent",
                        value,
                      )
                    }
                    options={[
                      "— No Parent (Top Level) —",
                      "Home",
                      "About Us",
                      "Our Services",
                      "How We Help",
                    ]}
                  />

                  <p className="mt-[3px] text-[9px] leading-[10px] text-[#8b919b]">
                    Choose parent page
                    (if any)
                  </p>
                </div>

                <div className="col-span-2">
                  <FieldLabel>
                    Meta Title (for SEO)
                  </FieldLabel>

                  <TextInput
                    value={form.metaTitle}
                    onChange={(value) =>
                      update(
                        "metaTitle",
                        value,
                      )
                    }
                    placeholder="Enter meta title"
                    maxLength={160}
                    rightCount
                  />
                </div>
              </div>
            </section>

            {/* PAGE CONTENT */}

            <section className="flex shrink-0 flex-col rounded-[7px] border border-[#e7e7e3] bg-white px-[14px] py-[10px]">
              <SectionHeader
                number={2}
                title="Page Content"
                description="Create engaging content for your page."
                icon={
                  <FileText className="h-[14px] w-[14px]" />
                }
                action={
                  <button
                    type="button"
                    className="flex h-[27px] shrink-0 items-center gap-[5px] rounded-[5px] border border-[#85ae94] bg-white px-[10px] text-[9.5px] font-semibold text-[#34714c]"
                  >
                    <Bot className="h-[11px] w-[11px]" />

                    AI Assist
                  </button>
                }
              />

              <div className="mt-[7px] flex flex-col">
                <FieldLabel>
                  Content Editor
                </FieldLabel>

                <div className="flex min-h-[106px] flex-col rounded-[5px] border border-[#dedfdb] bg-white">

                  <div className="flex h-[31px] shrink-0 items-center overflow-hidden border-b border-[#e3e4e0] px-[6px]">
                    <div className="relative mr-[5px] shrink-0">
                      <select className="h-[25px] w-[88px] appearance-none rounded-[4px] border border-[#e0e1dd] bg-white pl-[8px] pr-[21px] text-[9.5px] font-semibold text-[#4e5868] outline-none">
                        <option>Paragraph</option>
                        <option>Heading 1</option>
                        <option>Heading 2</option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-[6px] top-1/2 h-[8px] w-[8px] -translate-y-1/2" />
                    </div>

                    <span className="mr-[3px] h-[19px] w-px bg-[#e5e6e2]" />

                    <ToolbarButton
                      active={activeFormats.includes("bold")}
                      onClick={() => toggleFormat("bold")}
                    >
                      <Bold className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton
                      active={activeFormats.includes("italic")}
                      onClick={() => toggleFormat("italic")}
                    >
                      <Italic className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton
                      active={activeFormats.includes("underline")}
                      onClick={() => toggleFormat("underline")}
                    >
                      <Underline className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton
                      active={activeFormats.includes("strike")}
                      onClick={() => toggleFormat("strike")}
                    >
                      <Strikethrough className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <span className="mx-[2px] h-[19px] w-px bg-[#e5e6e2]" />

                    <ToolbarButton>
                      <Quote className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <List className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <ListOrdered className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <AlignLeft className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <Link2 className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <ImageIcon className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <Video className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <ToolbarButton>
                      <Table2 className="h-[12px] w-[12px]" />
                    </ToolbarButton>

                    <div className="flex-1" />

                    <ToolbarButton>
                      <MoreVertical className="h-[12px] w-[12px]" />
                    </ToolbarButton>
                  </div>

                  <textarea
                    value={form.content}
                    onChange={(event) =>
                      update(
                        "content",
                        event.target.value,
                      )
                    }
                    placeholder="Start writing or add content..."
                    className="min-h-[65px] flex-1 resize-none px-[10px] py-[8px] text-[10.5px] font-semibold leading-[1.45] text-[#424d60] outline-none placeholder:text-[10.5px] placeholder:font-semibold placeholder:text-[#969da8]"
                  />

                  <div className="flex h-[18px] shrink-0 items-center justify-end border-t border-[#eeeeea] px-[7px] text-[9px] font-semibold text-[#8b929c]">
                    Words: {wordCount}
                  </div>
                </div>

                <div className="mt-[5px] flex h-[27px] shrink-0 items-center gap-[8px]">
                  <button
                    type="button"
                    className="flex h-[27px] items-center gap-[6px] rounded-[5px] border border-[#dedfdb] bg-white px-[11px] text-[9.5px] font-semibold text-[#477055]"
                  >
                    <ImageIcon className="h-[11px] w-[11px]" />
                    Add Media
                  </button>

                  <button
                    type="button"
                    className="flex h-[27px] items-center gap-[6px] rounded-[5px] border border-[#dedfdb] bg-white px-[11px] text-[9.5px] font-semibold text-[#477055]"
                  >
                    <FormInput className="h-[11px] w-[11px]" />
                    Add Form
                  </button>

                  <button
                    type="button"
                    className="flex h-[27px] items-center gap-[6px] rounded-[5px] border border-[#dedfdb] bg-white px-[11px] text-[9.5px] font-semibold text-[#477055]"
                  >
                    <Code2 className="h-[11px] w-[11px]" />
                    Add Shortcode
                  </button>
                </div>
              </div>
            </section>

            {/* PAGE SETTINGS */}

            <section className="shrink-0 rounded-[7px] border border-[#e7e7e3] bg-white px-[14px] py-[10px]">
              <SectionHeader
                number={3}
                title="Page Settings"
                description="Configure how your page will appear and behave."
                icon={
                  <FileText className="h-[14px] w-[14px]" />
                }
              />

              <div className="mt-[9px] grid grid-cols-[.8fr_1fr_1.38fr] gap-x-[18px]">
                <div>
                  <FieldLabel>
                    Page Status
                  </FieldLabel>

                  <SelectField
                    value={form.status}
                    onChange={(value) =>
                      update(
                        "status",
                        value as PageStatus,
                      )
                    }
                    options={[
                      "Draft",
                      "Published",
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel>
                    Author
                  </FieldLabel>

                  <SelectField
                    value={form.author}
                    onChange={(value) =>
                      update(
                        "author",
                        value,
                      )
                    }
                    options={[
                      "Admin User",
                      "Seva Team",
                    ]}
                  />
                </div>

                <div className="row-span-2">
                  <FieldLabel>
                    Featured Image
                  </FieldLabel>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="relative flex h-[92px] w-full flex-col items-center justify-center overflow-hidden rounded-[5px] border border-dashed border-[#ced3ce] bg-[#fdfefd] text-[#397753]"
                  >
                    {featuredImage ? (
                      <img
                        src={featuredImage}
                        alt="Featured preview"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <UploadCloud className="h-[20px] w-[20px]" />

                        <span className="mt-[4px] text-[9.5px] font-semibold">
                          Upload featured image
                        </span>

                        <span className="mt-[2px] text-[8.5px] font-semibold text-[#8a919a]">
                          Recommended size:
                          1200x630px
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-[10px]">
                  <FieldLabel>
                    Show in Navigation
                  </FieldLabel>

                  <div className="flex items-center gap-[7px]">
                    <Toggle
                      checked={
                        form.showInNavigation
                      }
                      onChange={(value) =>
                        update(
                          "showInNavigation",
                          value,
                        )
                      }
                    />

                    <span className="max-w-[145px] text-[9px] font-semibold leading-[11px] text-[#858c98]">
                      Show this page in main
                      navigation menu
                    </span>
                  </div>
                </div>

                <div className="mt-[10px]">
                  <FieldLabel>
                    Menu Order
                  </FieldLabel>

                  <TextInput
                    value={form.menuOrder}
                    onChange={(value) =>
                      update(
                        "menuOrder",
                        value,
                      )
                    }
                  />

                  <p className="mt-[3px] text-[9px] leading-[10px] text-[#8b919b]">
                    Set display order in
                    navigation menu.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex items-center gap-[8px] rounded-[5px] bg-[#eef6ec] px-[13px] py-[8px] text-[11.5px] font-semibold text-[#39744f]">
              <Info className="h-[14px] w-[14px] shrink-0" />

              You can save this page as draft and
              publish it later when you&apos;re ready.
            </div>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="flex flex-col gap-[8px]">

            {/* SEO SETTINGS */}

            <section className="flex shrink-0 flex-col rounded-[7px] border border-[#e7e7e3] bg-white px-[14px] py-[10px]">
              <SectionHeader
                number={4}
                title="SEO Settings"
                description="Optimize this page for search engines."
                icon={
                  <Sparkles className="h-[14px] w-[14px]" />
                }
                action={
                  <button
                    type="button"
                    className="h-[27px] shrink-0 rounded-[5px] border border-[#d9ded9] bg-[#fbfdfb] px-[10px] text-[9px] font-semibold text-[#467656]"
                  >
                    Preview Snippet
                  </button>
                }
              />

              <div className="mt-[9px] flex flex-col gap-[6px]">
                <div>
                  <FieldLabel>
                    SEO Title
                  </FieldLabel>

                  <TextInput
                    value={form.seoTitle}
                    onChange={(value) =>
                      update(
                        "seoTitle",
                        value,
                      )
                    }
                    placeholder="Enter SEO title (recommended 50-60 characters)"
                    maxLength={60}
                    rightCount
                  />
                </div>

                <div>
                  <FieldLabel>
                    Meta Description
                  </FieldLabel>

                  <textarea
                    value={form.metaDescription}
                    maxLength={160}
                    onChange={(event) =>
                      update(
                        "metaDescription",
                        event.target.value,
                      )
                    }
                    placeholder="Enter meta description (recommended 150-160 characters)"
                    className="h-[45px] w-full resize-none rounded-[5px] border border-[#dedfdb] px-[10px] py-[7px] text-[10px] font-semibold leading-[1.35] text-[#414b5e] outline-none placeholder:text-[10px] placeholder:font-semibold placeholder:text-[#969da8] focus:border-[#91a98f]"
                  />

                  <p className="mt-[2px] text-right text-[9px] leading-[10px] text-[#8c929c]">
                    {
                      form
                        .metaDescription
                        .length
                    }{" "}
                    / 160
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Focus Keyword
                  </FieldLabel>

                  <TextInput
                    value={form.focusKeyword}
                    onChange={(value) =>
                      update(
                        "focusKeyword",
                        value,
                      )
                    }
                    placeholder="Enter focus keyword"
                  />

                  <p className="mt-[2px] text-[9px] leading-[10px] text-[#8b919b]">
                    Helps improve SEO ranking for
                    this page.
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Canonical URL
                  </FieldLabel>

                  <TextInput
                    value={form.canonicalUrl}
                    onChange={(value) =>
                      update(
                        "canonicalUrl",
                        value,
                      )
                    }
                    placeholder={`${PUBLIC_SITE_URL}/${form.slug ||
                      "enter-page-slug"
                      }`}
                  />

                  <p className="mt-[2px] text-[9px] leading-[10px] text-[#8b919b]">
                    Leave empty to use default URL.
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Robots Meta
                  </FieldLabel>

                  <SelectField
                    value={form.robotsMeta}
                    onChange={(value) =>
                      update(
                        "robotsMeta",
                        value,
                      )
                    }
                    options={[
                      "Index, Follow",
                      "Noindex, Follow",
                      "Index, Nofollow",
                      "Noindex, Nofollow",
                    ]}
                  />

                  <p className="mt-[2px] text-[9px] leading-[10px] text-[#8b919b]">
                    Set how search engines should
                    crawl this page.
                  </p>
                </div>
              </div>
            </section>

            {/* ADDITIONAL OPTIONS */}

            <section className="flex shrink-0 flex-col rounded-[7px] border border-[#e7e7e3] bg-white px-[14px] py-[10px]">
              <SectionHeader
                number={5}
                title="Additional Options"
                icon={
                  <Settings className="h-[14px] w-[14px]" />
                }
              />

              <div className="mt-[9px] flex flex-col gap-[6px]">
                <CheckOption
                  checked={form.noIndex}
                  onChange={(value) =>
                    update(
                      "noIndex",
                      value,
                    )
                  }
                  title="Set this page as Noindex"
                  description="Search engines will not index this page."
                />

                <CheckOption
                  checked={form.noFollow}
                  onChange={(value) =>
                    update(
                      "noFollow",
                      value,
                    )
                  }
                  title="Set this page as Nofollow"
                  description="Search engines will not follow links on this page."
                />

                <CheckOption
                  checked={form.xmlSitemap}
                  onChange={(value) =>
                    update(
                      "xmlSitemap",
                      value,
                    )
                  }
                  title="Add this page to XML Sitemap"
                  description="Include this page in XML sitemap."
                />

                <CheckOption
                  checked={form.breadcrumb}
                  onChange={(value) =>
                    update(
                      "breadcrumb",
                      value,
                    )
                  }
                  title="Enable Breadcrumb"
                  description="Show breadcrumb navigation on this page."
                />

                <CheckOption
                  checked={
                    form.passwordProtect
                  }
                  onChange={(value) =>
                    update(
                      "passwordProtect",
                      value,
                    )
                  }
                  title="Password Protect This Page"
                  description="Restrict access to authorized users only."
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}