"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createHomeHero, updateHomeHero, fetchHomeHeros } from "@/store/slices/home/homeHeroSlice";
import { api } from "@/lib/api";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  AlignLeft,
  ArrowLeft,
  Bold,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FormInput,
  Globe,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Quote,
  Save,
  Sparkles,
  Strikethrough,
  Table2,
  Trash2,
  RotateCcw,
  Underline,
  Upload,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";

import {
  cmsPages,
  cmsPagesFromSettings,
  findCmsPageByRouteKey,
  getCmsPageRouteKey,
  PUBLIC_SITE_URL,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { defaultLandingSections } from "@/lib/landingContent";
import { defaultAboutSections } from "@/lib/aboutContent";
import { defaultAdvisorySections, defaultNominateAdvisorySections } from "@/lib/advisoryContent";
import { defaultBlogSections } from "@/lib/blogContent";
import { defaultParticipateAsExhibitorSections } from "@/lib/participateAsExhibitorContent";
import { defaultExhibitionCategoriesSections } from "@/lib/exhibitionCategoriesContent";
import {
  defaultBookAStandSections,
  defaultVisitorRegistrationSections,
  defaultDelegateRegistrationSections,
  defaultBuyerRegistrationSections,
  defaultTermsAndConditionsSections,
  defaultPrivacyPolicySections,
  defaultRefundPolicySections,
} from "@/lib/registrationPagesContent";
import { defaultWhyVisitSections } from "@/lib/whyVisitContent";
import { defaultWhyExhibitSections } from "@/lib/whyExhibitContent";
import { defaultMsmeSections, defaultMsmeEligibilityCheckSections, defaultMsmeApplySections } from "@/lib/msmeContent";
import { defaultExhibitorsSections } from "@/lib/exhibitorsContent";
import { defaultBuyerSellerMeetSections } from "@/lib/buyerSellerMeetContent";
import { defaultGallerySections } from "@/lib/galleryContent";
import { defaultAwardsSections, defaultAwardsNominationSections } from "@/lib/awardsContent";
import { defaultContactSections } from "@/lib/contactContent";
import { defaultSponsorshipSections, defaultEPromotionSections, defaultPartnershipPageSections } from "@/lib/opportunityContent";
import { defaultSupportServicesSections } from "@/lib/extraPagesContent";
import typography from "../../PagesTypography.module.css";
import Swal from "sweetalert2";

/* =========================================================
   FEATURED IMAGE
========================================================= */

const FEATURED_IMAGE =
  "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";

/* =========================================================
   TYPES
========================================================= */

type Status =
  | "Draft"
  | "Published";

type Visibility =
  | "Public"
  | "Private";

type FormState = {
  pageTitle: string;
  slug: string;
  template: string;
  parent: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  canonicalTag: string;
  openGraphTags: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  h1Tag: string;
  breadcrumbName: string;
  schemaMarkup: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  isActive: boolean;
  status: Status;
  visibility: Visibility;
  author: string;
  showInNavigation: boolean;
  menuOrder: string;
};

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      className="
        mb-[5px]
        block
        cursor-default
        text-[11px]
        font-semibold
        leading-[14px]
        text-black
      "
    >
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
   TEXT INPUT
========================================================= */

function TextInput({
  value,
  onChange,
  placeholder,
  maxLength = 120,
  hideLimit = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  hideLimit?: boolean;
}) {
  const currentLength = (value || "").length;
  const maxAllowed = hideLimit ? 5000 : Math.max(currentLength, maxLength);
  const isAtLimit = !hideLimit && currentLength >= maxAllowed;

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        maxLength={maxAllowed}
        placeholder={placeholder}
        onChange={(event) => {
          if (event.target.value.length <= maxAllowed) {
            onChange(event.target.value);
          }
        }}
        className={`
          h-[35px]
          w-full
          cursor-default
          bg-white
          rounded-none
          shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
          pl-[10px]
          ${hideLimit ? "pr-[10px]" : "pr-[62px]"}
          text-[11px]
          font-medium
          text-[#414b5e]
          outline-none
          placeholder:text-[10.5px]
          placeholder:text-[#9aa0aa]
          focus:border-[#8fa98e]
        `}
      />
      {!hideLimit && (
        <span
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded ${isAtLimit
              ? "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]"
              : "bg-[#f1f5f9] text-[#64748b]"
            }`}
        >
          {currentLength}/{maxAllowed}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string, value: string }[] | string[];
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="
          h-[35px]
          w-full
          cursor-pointer
          appearance-none
          bg-white
          rounded-none
          shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
          pl-[10px]
          pr-[28px]
          text-[11px]
          font-medium
          text-[#414b5e]
          outline-none
          focus:border-[#8fa98e]
        "
      >
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const lbl = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[8px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#64748b]" />
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-[8px]">
      <div
        className="
          grid
          h-[24px]
          w-[24px]
          shrink-0
          place-items-center
          rounded-[5px]
          bg-[#ecf5eb]
          text-[#2f7950]
        "
      >
        <FileText
          className="h-[13px] w-[13px]"
          strokeWidth={1.8}
        />
      </div>

      <h2
        className="
          text-[13px]
          font-bold
          text-[#293681]
        "
      >
        {number}. {title}
      </h2>
    </div>
  );
}

/* =========================================================
   TOOLBAR BUTTON
========================================================= */

function ToolbarButton({
  children,
  active = false,
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
      className={`
        grid
        h-[30px]
        min-w-[30px]
        place-items-center
        rounded-[4px]
        px-[5px]
        transition

        ${active
          ? "bg-[#edf5ec] text-[#166b40]"
          : "text-[#435065] hover:bg-[#f5f6f3]"
        }
      `}
    >
      {children}
    </button>
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
  onChange: (
    value: boolean,
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`
        relative
        h-[20px]
        w-[38px]
        shrink-0
        rounded-full
        transition-colors
        duration-200
        cursor-pointer
        ${checked
          ? "bg-[#16a34a]"
          : "bg-[#dc2626]"
        }
      `}
    >
      <span
        className={`
          absolute
          top-[3px]
          h-[14px]
          w-[14px]
          rounded-full
          bg-white
          shadow-sm
          transition-all
          duration-200
          ${checked
            ? "left-[21px]"
            : "left-[3px]"
          }
        `}
      />
    </button>
  );
}

/* =========================================================
   EDITOR TOOLBAR (MATCHING AddSeo)
========================================================= */

function EditorToolbar({
  targetRef,
  onCommand,
}: {
  targetRef: React.RefObject<HTMLDivElement | null>;
  onCommand: (command: string, value?: string | null) => void;
}) {
  return (
    <div className="border-b-2 border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      <button
        type="button"
        onClick={() => onCommand("bold")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 font-bold shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => onCommand("italic")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 italic shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => onCommand("underline")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 underline shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Underline"
      >
        U
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => onCommand("justifyLeft")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Left"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => onCommand("justifyCenter")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Center"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => onCommand("justifyRight")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Align Right"
      >
        ≡
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => onCommand("insertUnorderedList")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => onCommand("insertOrderedList")}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Numbered List"
      >
        1. List
      </button>
      <div className="w-px h-5 bg-gray-300 mx-1" />
      <select
        onChange={(e) => onCommand("formatBlock", e.target.value)}
        className="px-2 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 focus:outline-none"
        defaultValue=""
      >
        <option value="">Normal</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
        <option value="h5">H5</option>
        <option value="h6">H6</option>
      </select>
      <button
        type="button"
        onClick={() => {
          const url = prompt("Enter URL:");
          if (url) onCommand("createLink", url);
        }}
        className="px-3 py-1 border-2 border-gray-300 bg-white hover:bg-gray-100 shadow-sm rounded text-xs text-gray-800 transition-colors"
        title="Insert Link"
      >
        🔗
      </button>
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono = false,
  maxLength = 450,
  noLimit = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
  maxLength?: number;
  noLimit?: boolean;
}) {
  const currentLength = (value || "").length;
  const initialLengthRef = useRef<number | null>(null);
  if (initialLengthRef.current === null) {
    initialLengthRef.current = currentLength > 0 ? currentLength : maxLength;
  }
  const maxAllowed = noLimit ? 10000 : initialLengthRef.current;
  const isAtLimit = !noLimit && currentLength >= maxAllowed;

  return (
    <div className="relative w-full">
      <textarea
        value={value}
        maxLength={noLimit ? undefined : maxAllowed}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => {
          if (noLimit || event.target.value.length <= maxAllowed) {
            onChange(event.target.value);
          }
        }}
        className={`w-full cursor-text resize-y bg-white rounded-none shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)] px-[10px] py-[8px] text-[11px] font-medium text-[#414b5e] outline-none placeholder:text-[10.5px] placeholder:text-[#9aa0aa] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(143,169,142,1)] ${mono ? "font-mono text-[10px]" : ""}`}
      />
      {!noLimit && (
        <span
          className={`absolute right-2 bottom-2.5 pointer-events-none px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded ${isAtLimit
              ? "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]"
              : "bg-[#f1f5f9] text-[#64748b]"
            }`}
        >
          {currentLength}/{maxAllowed}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   GENERIC SECTION FIELDS EDITOR
   Renders an input for every scalar field a section has, so any of the
   18 section shapes in the backend (hero, footer, faq, ...) becomes
   editable without a bespoke form per section.
========================================================= */

const SECTION_SKIP_KEYS = new Set(["_id", "key", "slides", "items", "enabled", "name"]);
const LONG_TEXT_KEY_PATTERN = /description|subtitle|quote|message|statement|notice/i;
const IMAGE_KEY_PATTERN = /image|img|logo|photo|banner|picture|bg|avatar|thumbnail/i;
const VIDEO_KEY_PATTERN = /video|youtube|embed|vimeo|clip|mediaUrl/i;

function humanizeKey(key: string) {
  if (key === "keyPoint1") return "Key Point 1";
  if (key === "keyPoint2") return "Key Point 2";
  if (key === "keyPoint3") return "Key Point 3";
  if (key === "keyPoint4") return "Key Point 4";
  if (key === "keyPoint5") return "Key Point 5";
  if (key === "keyPoint6") return "Key Point 6";
  if (key === "keyPoint7") return "Key Point 7";
  if (key === "keyPoint8") return "Key Point 8";
  if (key === "keyPoint9") return "Key Point 9";
  if (key === "keyPoint10") return "Key Point 10";
  if (key === "titlePrefix") return "Title Prefix";
  if (key === "feature1Title") return "Feature 1: Title (DISCOVER)";
  if (key === "feature1Desc") return "Feature 1: Description";
  if (key === "feature2Title") return "Feature 2: Title (LEARN)";
  if (key === "feature2Desc") return "Feature 2: Description";
  if (key === "feature3Title") return "Feature 3: Title (CONNECT)";
  if (key === "feature3Desc") return "Feature 3: Description";
  if (key === "feature4Title") return "Feature 4: Title (SOURCE)";
  if (key === "feature4Desc") return "Feature 4: Description";
  if (key === "feature5Title") return "Feature 5: Title (GROW)";
  if (key === "feature5Desc") return "Feature 5: Description";
  if (key === "feature6Title") return "Feature 6: Title (STAY AHEAD)";
  if (key === "feature6Desc") return "Feature 6: Description";
  if (key === "secondaryButtonHref") return "Secondary Button Href (Upload Brochure PDF)";
  if (key === "stat1Title") return "Stat 1: Date Range";
  if (key === "stat1Sub") return "Stat 1: Month & Year";
  if (key === "stat2Title") return "Stat 2: Venue";
  if (key === "stat2Sub") return "Stat 2: City";
  if (key === "stat3Title") return "Stat 3: Tagline Line 1";
  if (key === "stat3Sub") return "Stat 3: Tagline Line 2";
  if (key === "stat4Title") return "Stat 4: Speaker Count";
  if (key === "stat4Sub") return "Stat 4: Speaker Label";
  if (key === "stat5Title") return "Stat 5: Session Count";
  if (key === "stat5Sub") return "Stat 5: Session Label";
  if (key === "sectionTag") return "Section Tag";
  if (key === "titleMain") return "Title Main";
  if (key === "titleHighlight") return "Title Highlight";
  if (key === "descriptionPrefix") return "Description Prefix";
  if (key === "buttonText") return "Button Text";
  if (key === "buttonHref") return "Button Link (Href)";
  if (key === "exploreText") return "Explore Text";
  if (key === "href") return "Explore Link (Href)";
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

/* =========================================================
   IMAGE UPLOADER HELPER (EDIT / UPLOAD / DELETE / PREVIEW)
========================================================= */

function ImageUploadField({
  value,
  onChange,
  defaultValue,
}: {
  value: string;
  onChange: (url: string) => void;
  defaultValue?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/content");
      const uploadedUrl = res?.url || res?.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const handleReset = () => {
    if (defaultValue) {
      onChange(defaultValue);
    }
  };

  const isDifferentFromDefault = Boolean(defaultValue && value !== defaultValue);

  return (
    <div className="flex flex-col gap-2 p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px]">
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex-1 min-w-[140px]">
          <TextInput
            value={value}
            onChange={onChange}
            placeholder="https://... image URL"
            hideLimit={true}
          />
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#0f766e] bg-[#f0fdf4] px-2 py-1.5 text-[9px] font-bold text-[#0f766e] hover:bg-[#dcfce7] transition-colors shadow-2xs">
          <Upload className="h-3 w-3" />
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            title="Remove/Delete image"
            className="flex shrink-0 items-center gap-1 rounded border border-[#fca5a5] bg-[#fef2f2] px-2 py-1.5 text-[9px] font-bold text-[#dc2626] hover:bg-[#fee2e2] transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            Delete Image
          </button>
        ) : null}
        {isDifferentFromDefault && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default original image"
            className="flex shrink-0 items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[9px] font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 text-amber-700" />
            Reset Image
          </button>
        )}
      </div>

      {value && typeof value === "string" ? (() => {
        const displayUrl = value.startsWith("http")
          ? value
          : value.startsWith("/")
            ? `http://localhost:4000${value}`
            : `http://localhost:4000/${value}`;

        return (
          <div className="flex items-center gap-3 bg-white p-1.5 rounded border border-[#e2e8f0]">
            <div className="relative h-[60px] w-[100px] shrink-0 overflow-hidden rounded border border-[#cbd5e1] bg-black/5 group">
              <img
                src={displayUrl}
                alt="Background Preview"
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={handleRemove}
                title="Delete Image"
                className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow cursor-pointer"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold text-[#0f766e] bg-[#ccfbf1] px-1.5 py-0.5 rounded">
                  Active Image
                </span>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-0.5 text-[8.5px] font-medium text-[#2563eb] hover:underline"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  View Full
                </a>
                {isDifferentFromDefault && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[8.5px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer transition-colors ml-auto"
                    title="Reset to default image"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    Reset to Default
                  </button>
                )}
              </div>
              <p className="text-[8.5px] text-[#64748b] truncate font-mono">
                {value}
              </p>
            </div>
          </div>
        );
      })() : (
        <div className="text-[9px] text-[#94a3b8] italic flex items-center justify-between gap-1 px-1">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3 text-[#cbd5e1]" />
            No image set. Upload, paste a URL, or click Reset.
          </span>
          {isDifferentFromDefault && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-[9px] font-bold text-amber-700 hover:underline cursor-pointer not-italic"
            >
              <RotateCcw className="h-3 w-3" />
              Restore Default Image
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PdfUploadField({
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

function VideoUploadField({
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

function SectionFieldsEditor({
  section,
  onFieldChange,
}: {
  section: Record<string, any>;
  onFieldChange: (key: string, value: unknown) => void;
}) {
  if (section.key === "footer" || section.name === "Footer & Social Links") {
    return (
      <div className="flex flex-col gap-4">
        {/* Description (About Bharat Organic Expo in Footer Left Column) */}
        <div className="flex flex-col gap-1.5 bg-white p-3 border border-[#e2e8f0] rounded-[6px]">
          <FieldLabel required>Footer Description</FieldLabel>
          <Textarea
            value={
              section.description !== undefined && !section.description.startsWith("Showcasing certified products")
                ? String(section.description)
                : "A global platform uniting over 500+ exhibitors from across the organic value chain, showcasing certified products, advanced agritech, sustainable practices, and the rich heritage of traditional wellness. Discover organic living with conferences and B2B opportunities."
            }
            onChange={(next) => onFieldChange("description", next)}
            rows={4}
            noLimit={true}
            placeholder="A global platform uniting over 500+ exhibitors from across the organic value chain..."
          />
        </div>

        {/* 5 Image Uploads with Previews & Reset */}
        <div className="bg-white p-3 border border-[#e2e8f0] rounded-[6px] flex flex-col gap-3">
          <div className="text-[11px] font-bold text-[#1e40af] border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <span>Footer Images & Decorations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Main Logo Image</FieldLabel>
              <ImageUploadField
                value={String(section.logoImage || "")}
                onChange={(next) => onFieldChange("logoImage", next)}
                defaultValue="http://localhost:4000/uploads/bharat-organic_footer/1789129240083-112323989.png"
              />
            </div>
            <div>
              <FieldLabel>Left Leaf Decoration Image</FieldLabel>
              <ImageUploadField
                value={String(section.leafImage || "")}
                onChange={(next) => onFieldChange("leafImage", next)}
                defaultValue="http://localhost:4000/uploads/bharat-organic_footer/1789129240457-21656484.png"
              />
            </div>
            <div>
              <FieldLabel>Down / Mandala Pattern Image</FieldLabel>
              <ImageUploadField
                value={String(section.downImage || "")}
                onChange={(next) => onFieldChange("downImage", next)}
                defaultValue="http://localhost:4000/uploads/bharat-organic_footer/1789129240816-597711504.png"
              />
            </div>
            <div>
              <FieldLabel>Organised By Logo Image</FieldLabel>
              <ImageUploadField
                value={String(section.organisedByLogo || "")}
                onChange={(next) => onFieldChange("organisedByLogo", next)}
                defaultValue="http://localhost:4000/uploads/bharat-organic_footer/1789129241128-849314126.png"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Bottom Nature / Event Banner Image</FieldLabel>
              <ImageUploadField
                value={String(section.bottomBannerImage || "")}
                onChange={(next) => onFieldChange("bottomBannerImage", next)}
                defaultValue="http://localhost:4000/uploads/bharat-organic_footer/1789129242465-452827954.webp"
              />
            </div>
          </div>
        </div>

        {/* Contact Information (GET IN TOUCH) */}
        <div className="bg-white p-3 border border-[#e2e8f0] rounded-[6px] flex flex-col gap-3">
          <div className="text-[11px] font-bold text-[#1e40af] border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <span>Get In Touch (Contact Information)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Phone Number</FieldLabel>
              <TextInput
                value={String(section.phoneNumber || "")}
                onChange={(next) => onFieldChange("phoneNumber", next)}
                placeholder="+91 96549 00525"
                hideLimit={true}
              />
            </div>
            <div>
              <FieldLabel required>Contact Email</FieldLabel>
              <TextInput
                value={String(section.contactEmail || "")}
                onChange={(next) => onFieldChange("contactEmail", next)}
                placeholder="info@namogangewellness.com"
                hideLimit={true}
              />
            </div>
            <div>
              <FieldLabel required>Website URL</FieldLabel>
              <TextInput
                value={String(section.websiteUrl || "")}
                onChange={(next) => onFieldChange("websiteUrl", next)}
                placeholder="www.bharatorganicexpo.com"
                hideLimit={true}
              />
            </div>
            <div>
              <FieldLabel>Conference Helpline (Phone)</FieldLabel>
              <TextInput
                value={String(section.conferenceHelpline || section.altPhoneNumber || "")}
                onChange={(next) => {
                  onFieldChange("conferenceHelpline", next);
                  onFieldChange("altPhoneNumber", next);
                }}
                placeholder="+91 98183 53841"
                hideLimit={true}
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel required>Contact Address</FieldLabel>
              <TextInput
                value={String(section.contactAddress || "")}
                onChange={(next) => onFieldChange("contactAddress", next)}
                placeholder="Hall 12, Pragati Maidan, New Delhi, India 110001"
                hideLimit={true}
              />
            </div>
          </div>
        </div>

        {/* CONNECT WITH US (Social Media Links) */}
        <div className="bg-white p-3 border border-[#e2e8f0] rounded-[6px] flex flex-col gap-3">
          <div className="text-[11px] font-bold text-[#1e40af] border-b border-gray-100 pb-1.5 flex items-center gap-2">
            <span>Connect With Us (Social Media Links)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Facebook URL</FieldLabel>
              <TextInput
                value={String(section.facebookUrl || "")}
                onChange={(next) => onFieldChange("facebookUrl", next)}
                placeholder="https://facebook.com/bharatorganicexpo"
                hideLimit={true}
              />
            </div>
            <div>
              <FieldLabel>Instagram URL</FieldLabel>
              <TextInput
                value={String(section.instagramUrl || "")}
                onChange={(next) => onFieldChange("instagramUrl", next)}
                placeholder="https://instagram.com/bharatorganicexpo"
                hideLimit={true}
              />
            </div>
            <div>
              <FieldLabel>Twitter / X URL</FieldLabel>
              <TextInput
                value={String(section.twitterUrl || "")}
                onChange={(next) => onFieldChange("twitterUrl", next)}
                placeholder="https://twitter.com/bharatorganic"
                hideLimit={true}
              />
            </div>
            <div>
              <FieldLabel>YouTube URL</FieldLabel>
              <TextInput
                value={String(section.youtubeUrl || "")}
                onChange={(next) => onFieldChange("youtubeUrl", next)}
                placeholder="https://youtube.com/@bharatorganicexpo"
                hideLimit={true}
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>LinkedIn URL</FieldLabel>
              <TextInput
                value={String(section.linkedinUrl || "")}
                onChange={(next) => onFieldChange("linkedinUrl", next)}
                placeholder="https://linkedin.com/company/bharatorganicexpo"
                hideLimit={true}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  const entries = Object.entries(section).filter(
    ([key, value]) => {
      if (SECTION_SKIP_KEYS.has(key)) return false;
      if ((section.key === "audience-strip" || section.name === "AudienceStrip") && key === "title") return false;
      if (
        (section.key === "global-platform" || section.name === "GlobalPlatform") &&
        (key === "subtitle" || key === "title" || key === "image" || key === "imageAlt")
      ) {
        return false;
      }
      if (
        (section.key === "why-participate" || section.name === "WhyParticipate") &&
        (key === "subtitle" || key === "title")
      ) {
        return false;
      }
      if (
        (section.key === "conference-section" || section.name === "ConferenceSection") &&
        (key === "subtitle" || key === "title")
      ) {
        return false;
      }
      if (
        (section.key === "expo-categories" || section.name === "ExpoCategories") &&
        (key === "image" || key === "imageAlt" || key === "title" || key === "subtitle")
      ) {
        return false;
      }
      if (
        (section.key === "beyond-exhibition" || section.name === "BeyondExhibition") &&
        (key === "title" || key === "subtitle")
      ) {
        return false;
      }
      if (
        (section.key === "sponsors-attend" || section.name === "SponsorsAndAttend") &&
        (key === "title" || key === "subtitle" || key === "rightTitle" || key === "rightBottomText" || key === "centerText1" || key === "centerText2" || key === "centerText3")
      ) {
        return false;
      }
      return typeof value === "string" || typeof value === "boolean";
    },
  );

  if (!entries.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-x-[16px] gap-y-[10px]">
      {entries.map(([key, value]) => {
        const isLong = LONG_TEXT_KEY_PATTERN.test(key);
        const isImage = IMAGE_KEY_PATTERN.test(key) && !/alt/i.test(key);
        const isVideo = VIDEO_KEY_PATTERN.test(key);
        const isPdf =
          (section.key === "why-participate" && key === "secondaryButtonHref") ||
          /brochure|pdf/i.test(key) ||
          (typeof value === "string" && /\.pdf$/i.test(value));
        const isDate = /date|time/i.test(key) && typeof value === "string";
        const fieldLimit = isLong ? 450 : 140;

        return (
          <div
            key={key}
            className={isLong || isImage || isVideo || isPdf || typeof value === "boolean" || /^keyPoint/i.test(key) || /alt/i.test(key) ? "col-span-2" : ""}
          >
            <FieldLabel>{humanizeKey(key)}</FieldLabel>

            {typeof value === "boolean" ? (
              <Toggle checked={value} onChange={(next: boolean) => onFieldChange(key, next)} />
            ) : isVideo ? (
              <VideoUploadField
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
              />
            ) : isImage ? (
              <ImageUploadField
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
              />
            ) : isPdf ? (
              <PdfUploadField
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
              />
            ) : isDate ? (
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={
                    String(value).includes("T")
                      ? String(value).slice(0, 16)
                      : String(value)
                  }
                  onChange={(e) => onFieldChange(key, e.target.value)}
                  className="h-[34px] rounded border border-[#cbd5e1] px-2.5 text-[12px] bg-white text-[#1e293b] focus:border-[#0f766e] focus:outline-none"
                />
                <span className="text-[10px] text-[#64748b]">Select date and time for live countdown timer</span>
              </div>
            ) : isLong ? (
              <Textarea value={String(value)} onChange={(next: string) => onFieldChange(key, next)} rows={3} />
            ) : (
              <TextInput
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
                maxLength={120}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   GENERIC SECTION ITEMS EDITOR
   Handles the repeatable "items" list every section can have (stat
   cards, FAQ entries, links, ...) — add / remove / edit each item's
   own scalar fields generically.
========================================================= */

function SectionItemsEditor({
  items,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  sectionId,
}: {
  items: Array<Record<string, any>>;
  onChangeItem: (index: number, key: string, value: unknown) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  sectionId?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleToggle = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
      setTimeout(() => {
        itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  const FIELD_ORDER_PRIORITY: Record<string, number> = {
    tagline: 1,
    titlePrimary: 2,
    titleSecondary: 3,
    subtitle: 4,
    title: 5,
    name: 6,
    label: 7,
    description: 8,
    date: 9,
    location: 10,
    image: 11,
    img: 12,
    alt: 13,
    buttonLabel: 14,
    buttonHref: 15,
    secondaryButtonLabel: 16,
    secondaryButtonHref: 17,
    icon: 18,
  };

  const getSectionAddLabel = () => {
    if (sectionId === "hero") return "Add Hero Slide";
    if (sectionId === "audience-strip") return "Add Target Audience Group";
    if (sectionId === "introduction-section") return "Add Feature Highlight";
    if (sectionId === "global-platform") return "Add Platform Metric / Highlight";
    if (sectionId === "why-participate") return "Add Exhibitor Benefit";
    if (sectionId === "conference-section") return "Add Seminar / Workshop Session";
    if (sectionId === "expo-categories") return "Add Exhibition Category Sector";
    if (sectionId === "beyond-exhibition") return "Add Excellence Award Category";
    if (sectionId === "sponsorship-categories") return "Add Sponsorship Package Tier";
    if (sectionId === "buyer-seller-meet") return "Add B2B Matchmaking Feature";
    if (sectionId === "testimonials-carousel") return "Add Review / Testimonial";
    if (sectionId === "navbar") return "Add Header Navigation Link";
    if (sectionId === "footer") return "Add Footer Link / Information";
    return "Add New Section Block";
  };

  const getItemLabel = (item: Record<string, any>, index: number) => {
    const mainTitle = item.name || item.title || item.label || item.question || item.tagline || item.companyName1;
    if (mainTitle) return String(mainTitle);
    if (sectionId === "hero") return `Hero Slide ${index + 1}`;
    if (sectionId === "audience-strip") return `Audience Group ${index + 1}`;
    if (sectionId === "conference-section") return `Session ${index + 1}`;
    if (sectionId === "expo-categories") return `Sector ${index + 1}`;
    if (sectionId === "beyond-exhibition") return `Award Category ${index + 1}`;
    if (sectionId === "sponsorship-categories") return `Sponsorship Tier ${index + 1}`;
    if (sectionId === "testimonials-carousel") return `Review ${index + 1}`;
    if (sectionId === "navbar" || sectionId === "footer") return `Link ${index + 1}`;
    return `Block ${index + 1}`;
  };

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-[8px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-[11px] font-bold text-[#1e40af]">
            {sectionId === "hero" ? "Hero Carousel Slides" :
              sectionId === "audience-strip" ? "Target Audience List" :
                sectionId === "introduction-section" ? "Key Feature Cards" :
                  sectionId === "global-platform" ? "Platform Highlights & Deals" :
                    sectionId === "why-participate" ? "Exhibitor Benefits List" :
                      sectionId === "conference-section" ? "Seminar & Workshop Sessions" :
                        sectionId === "expo-categories" ? "Exhibition Category Cards" :
                          sectionId === "beyond-exhibition" ? "Event Highlights & Awards" :
                            sectionId === "sponsorship-categories" ? "Sponsorship Packages & Tiers" :
                              sectionId === "buyer-seller-meet" ? "Matchmaking Process Steps" :
                                sectionId === "testimonials-carousel" ? "Exhibitor & Visitor Reviews" :
                                  sectionId === "navbar" ? "Header Navigation Links" :
                                    sectionId === "footer" ? "Footer Quick Links" : "Section Content Blocks"}
          </span>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-[7px] py-[1px] text-[8.5px] font-bold text-blue-700">
            {items.length} Total
          </span>
        </div>

        {sectionId !== "audience-strip" && sectionId !== "beyond-exhibition" && (
          <button
            type="button"
            onClick={onAddItem}
            className="flex h-[24px] items-center gap-[4px] rounded-[4px] border border-blue-200 bg-white px-[8px] text-[9px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-[10px] w-[10px]" />
            {getSectionAddLabel()}
          </button>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-[10px] font-medium text-[#8b929c]">No items added yet.</p>
      )}

      <div className="space-y-3 pt-1">
        {items.map((item, index) => {
          let itemToEdit = { ...item };
          if (sectionId === "expo-categories") {
            delete itemToEdit.icon;
            delete itemToEdit.desc;
            delete itemToEdit.color;
            delete itemToEdit.imageAlt;
            if (itemToEdit.description === undefined) itemToEdit.description = item.desc || "";
            if (itemToEdit.image === undefined) itemToEdit.image = "";
            if (!itemToEdit.exploreText) itemToEdit.exploreText = "Explore";
            if (!itemToEdit.href) itemToEdit.href = item.link || "/exhibition-categories";
          } else if (sectionId === "beyond-exhibition") {
            delete itemToEdit.subtitle;
            delete itemToEdit.title2;
            delete itemToEdit.color;
            delete itemToEdit.image;
            delete itemToEdit.imageAlt;
            if (itemToEdit.description === undefined) itemToEdit.description = item.subtitle || "";
            if (!itemToEdit.icon) itemToEdit.icon = "Users";
          } else {
            let defaultIcon = "";
            if (!item.icon) {
              const text = (item.title || "") + " " + (item.label || "");
              const textUpper = text.toUpperCase();
              if (textUpper.includes("HELPLINE")) defaultIcon = "users";
              else if (textUpper.includes("REGION")) defaultIcon = "building";
              else if (textUpper.includes("VOLUNTEER")) defaultIcon = "heart-hands";
              else if (textUpper.includes("SUPPORT")) defaultIcon = "heart-hands";
              else if (text.toUpperCase().includes("GIVE")) defaultIcon = "give-icon";
              else if (text.toUpperCase().includes("SERVE")) defaultIcon = "serve-icon";
              else if (text.toUpperCase().includes("PARTNER")) defaultIcon = "partner-icon";
            }
            itemToEdit = ("label" in item || "title" in item) && (!("icon" in item) || item.icon === "")
              ? { ...item, icon: defaultIcon }
              : item;
          }

          const fieldEntries = Object.entries(itemToEdit)
            .filter(
              ([key, value]) =>
                key !== "_id" &&
                key !== "img" &&
                key !== "status" &&
                !(sectionId === "expo-categories" && key === "icon") &&
                (typeof value === "string" ||
                  typeof value === "number" ||
                  typeof value === "boolean" ||
                  (Array.isArray(value) && value.every((entry) => typeof entry === "string")))
            )
            .sort(([a], [b]) => (FIELD_ORDER_PRIORITY[a] || 99) - (FIELD_ORDER_PRIORITY[b] || 99));

          const isOpen = openIndex === index;

          return (
            <div
              key={item._id ?? index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-2xs transition"
            >
              <div
                onClick={() => handleToggle(index)}
                className="flex cursor-pointer items-center justify-between bg-[#f8fafc] px-[12px] py-[8px] border-b border-[#f1f5f9] hover:bg-[#f1f5f9] transition"
              >
                <div className="flex items-center gap-[6px]">
                  <ChevronRight className={`h-3.5 w-3.5 text-[#64748b] transition-transform ${isOpen ? "rotate-90 text-[#1e40af]" : ""}`} />
                  <span className="text-[11px] font-bold text-[#1e40af]">
                    {getItemLabel(item, index)}
                    {item.value ? <span className="ml-[6px] font-semibold text-[#1e293b]">({item.value})</span> : ""}
                  </span>
                </div>

                <div className="flex items-center gap-[8px]" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    className="flex items-center gap-[3px] text-[9.5px] font-semibold text-[#dc2626] hover:underline"
                  >
                    <Trash2 className="h-[11px] w-[11px]" />
                    Remove
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="p-[12px] grid grid-cols-2 gap-[10px] bg-white">
                  {fieldEntries.map(([key, value]) => {
                    const isImageKey = IMAGE_KEY_PATTERN.test(key);
                    const isVideoKey = VIDEO_KEY_PATTERN.test(key);
                    const isLong = LONG_TEXT_KEY_PATTERN.test(key);

                    return (
                      <div key={key} className={isImageKey || isVideoKey || isLong ? "col-span-2" : ""}>
                        <FieldLabel>{humanizeKey(key)}</FieldLabel>

                        {key === "icon" && sectionId !== "journey-glimpse" ? (
                          <SelectField
                            value={String(value)}
                            options={[
                              { label: "None", value: "" },
                              { label: "Group of People (Users)", value: "Users" },
                              { label: "Store / Exhibitor", value: "Store" },
                              { label: "Presentation / Speaker", value: "Presentation" },
                              { label: "Building / Company (Building2)", value: "Building2" },
                              { label: "Globe / International", value: "Globe" },
                              { label: "Leaf / Organic", value: "Leaf" },
                              { label: "Graduation Cap / Academic", value: "GraduationCap" },
                              { label: "Stethoscope / Healthcare", value: "Stethoscope" },
                              { label: "Landmark / Government", value: "Landmark" },
                              { label: "Shield Check / Verified", value: "ShieldCheck" },
                              { label: "Handshake / Partnership", value: "Handshake" },
                              { label: "Target / Vision", value: "Target" },
                              { label: "Trending Up / Growth", value: "TrendingUp" },
                              { label: "Award / Achievement", value: "Award" },
                              { label: "Medal / Honour", value: "Medal" },
                              { label: "Lightbulb / Innovation", value: "Lightbulb" },
                              { label: "Mic / Speaker", value: "Mic" },
                              { label: "Calendar / Dates", value: "CalendarDays" },
                              { label: "Eye / View", value: "Eye" },
                              { label: "Sprout / Plant", value: "Sprout" },
                              { label: "Heart Pulse / Health", value: "HeartPulse" },
                              { label: "Trophy / Winner", value: "Trophy" },
                              { label: "Megaphone / Visibility", value: "Megaphone" },
                              { label: "User Check / Verified User", value: "UserCheck" },
                              { label: "Briefcase / Business", value: "Briefcase" },
                              { label: "Sparkles / Magic", value: "Sparkles" },
                              { label: "Zap / Fast", value: "Zap" },
                              { label: "ID Card / Lanyard", value: "IdCard" },
                              { label: "Plug / Charging", value: "Plug" },
                              { label: "Contact / Badge", value: "Contact" },
                              { label: "Wi-Fi / Internet", value: "Wifi" },
                              { label: "Shopping Bag / Visitor Bag", value: "ShoppingBag" },
                              { label: "Coffee / Refreshment", value: "Coffee" },
                              { label: "Newspaper / Press", value: "Newspaper" },
                              { label: "File Text / Print", value: "FileText" },
                              { label: "Camera / Media", value: "Camera" },
                              { label: "Headphones / Support", value: "Headphones" },
                              { label: "Message Circle / Chat", value: "MessageCircle" },
                              { label: "Clock / Time", value: "Clock" },
                              { label: "Phone", value: "Phone" },
                              { label: "Mail", value: "Mail" },
                              { label: "Map Pin", value: "MapPin" },
                              { label: "Heart", value: "Heart" },
                              { label: "Star", value: "Star" },
                              { label: "Check Circle", value: "CheckCircle" },
                              { label: "Info", value: "Info" },
                            ]}
                            onChange={(next) => onChangeItem(index, key, next)}
                          />
                        ) : isVideoKey ? (
                          <VideoUploadField
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                          />
                        ) : isImageKey ? (
                          <ImageUploadField
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                          />
                        ) : Array.isArray(value) ? (
                          <TextInput
                            value={value.join(", ")}
                            onChange={(next) =>
                              onChangeItem(
                                index,
                                key,
                                next.split(",").map((entry) => entry.trim()).filter(Boolean),
                              )
                            }
                            placeholder="comma, separated, values"
                          />
                        ) : key === "color" ? (
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <TextInput
                                value={String(value)}
                                onChange={(next) => onChangeItem(index, key, next)}
                                placeholder="e.g. #facc15 or text-orange-500"
                              />
                            </div>
                            <input
                              type="color"
                              value={
                                String(value).startsWith("#") && String(value).length === 7
                                  ? String(value)
                                  : "#facc15"
                              }
                              onChange={(e) => onChangeItem(index, key, e.target.value)}
                              className="h-[34px] w-[38px] cursor-pointer rounded border border-[#cbd5e1] p-0.5 bg-white shrink-0"
                              title="Pick a color"
                            />
                          </div>
                        ) : typeof value === "boolean" ? (
                          <Toggle checked={value} onChange={(next) => onChangeItem(index, key, next)} />
                        ) : isLong ? (
                          <Textarea value={String(value)} onChange={(next) => onChangeItem(index, key, next)} rows={3} />
                        ) : (
                          <TextInput value={String(value)} onChange={(next) => onChangeItem(index, key, next)} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SEO CIRCLE
========================================================= */

function SeoScoreCircle() {
  return (
    <div
      className="
        relative
        h-[108px]
        w-[108px]
        shrink-0
      "
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r="49"
          fill="none"
          stroke="#edf0eb"
          strokeWidth="9"
        />

        <circle
          cx="60"
          cy="60"
          r="49"
          fill="none"
          stroke="#218DAE"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="307.87"
          strokeDashoffset="24.63"
        />
      </svg>

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
        "
      >
        <div className="flex items-end">
          <span
            className="
              text-[29px]
              font-bold
              tracking-[-0.04em]
              text-[#17304a]
            "
          >
            92
          </span>

          <span
            className="
              mb-[5px]
              text-[8px]
              font-semibold
              text-[#697386]
            "
          >
            /100
          </span>
        </div>

        <span
          className="
            mt-[-2px]
            text-[8.5px]
            font-semibold
            text-[#147042]
          "
        >
          Excellent
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SEO ROW
========================================================= */

function SeoRow({
  label,
}: {
  label: string;
}) {
  return (
    <div
      className="
        flex
        h-[21px]
        items-center
        justify-between
        gap-3
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-[7px]
        "
      >
        <span
          className="
            grid
            h-[13px]
            w-[13px]
            shrink-0
            place-items-center
            rounded-[3px]
            bg-[#147242]
            text-white
          "
        >
          <Check
            className="h-[8px] w-[8px]"
            strokeWidth={2.5}
          />
        </span>

        <span
          className="
            truncate
            text-[10px]
            font-medium
            text-[#435066]
          "
        >
          {label}
        </span>
      </div>

      <span
        className="
          text-[9.5px]
          font-semibold
          text-[#28854e]
        "
      >
        Good
      </span>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function CmsEditPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const dispatch = useAppDispatch();
  const { data: homeHeros } = useAppSelector((state) => state.homeHero);

  useEffect(() => {
    dispatch(fetchHomeHeros());
  }, [dispatch]);

  const handleHeroApi = async (action: 'add' | 'edit', section: any) => {
    const form = new FormData();
    form.append("tagline", section.tagline || "");
    form.append("titlePrimary", section.titlePrimary || "");
    form.append("titleSecondary", section.titleSecondary || "");
    form.append("subtitle", section.subtitle || "");
    form.append("description", section.description || "");
    form.append("date", section.date || "");
    form.append("location", section.location || "");
    form.append("button1Name", section.buttonLabel || "");
    form.append("button1Link", section.buttonHref || "");
    form.append("button2Name", section.secondaryButtonLabel || "");
    form.append("button2Link", section.secondaryButtonHref || "");

    try {
      if (action === 'add') {
        await dispatch(createHomeHero(form)).unwrap();
        Swal.fire({ title: "Success", text: "Added to Home Hero API", icon: "success", timer: 1500 });
      } else {
        const id = homeHeros?.[0]?._id;
        if (id) {
          await dispatch(updateHomeHero({ id, formData: form })).unwrap();
          Swal.fire({ title: "Success", text: "Updated Home Hero API", icon: "success", timer: 1500 });
        } else {
          Swal.fire({ title: "Error", text: "No existing hero found to edit. Click Add instead.", icon: "error" });
        }
      }
      dispatch(fetchHomeHeros());
    } catch (err: any) {
      Swal.fire({ title: "Error", text: err || "API failed", icon: "error" });
    }
  };

  const [pages, setPages] = useState(cmsPages);
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);

  const page = findCmsPageByRouteKey(pages, params.id) ?? pages[0] ?? cmsPages[0];

  useEffect(() => {
    settingsApi.get().then((value) => {
      const raw = value as unknown as Record<string, any>;
      setSettings(raw);
      setPages(cmsPagesFromSettings(raw));
    }).catch(() => undefined);
  }, []);

  const pageConfig = page.configKey && settings ? settings[page.configKey] : undefined;

  const initialForm =
    useMemo<FormState>(
      () => ({
        pageTitle:
          page.title,

        slug:
          page.slug === "/"
            ? ""
            : page.slug.replace(
              /^\//,
              "",
            ),

        template:
          page.type === "home"
            ? "Homepage"
            : page.configKey === "aboutPage"
              ? "About Page"
              : page.configKey === "advisoryPage"
                ? "Advisory Board"
                : page.configKey === "blogPage"
                  ? "Blogs & News"
                  : page.configKey === "whyVisitPage"
                    ? "Why Visit"
                    : page.configKey === "whyExhibitPage"
                      ? "Why Exhibit"
                      : page.configKey === "msmePage"
                        ? "MSME PMS Scheme"
                        : page.configKey === "exhibitorsPage"
                          ? "Exhibitors List"
                          : page.configKey === "buyerSellerMeetPage"
                            ? "Buyer-Seller Meet"
                            : page.configKey === "galleryPage"
                              ? "Glimpses & Gallery"
                              : page.configKey === "awardsPage"
                                ? "Excellence Awards"
                                : page.configKey === "sponsorshipPage"
                                  ? "Sponsorship Opportunities"
                                  : page.configKey === "epromotionPage"
                                    ? "E-Promotion Web"
                                    : page.configKey === "partnershipPage"
                                      ? "Partnership / Collaboration"
                                      : page.configKey === "servicesPage"
                                        ? "Our Services"
                                        : page.configKey === "contactPage"
                                          ? "Contact Us"
                                          : "Standard Page",

        parent:
          page.type === "home"
            ? "— No Parent (Top Level) —"
            : "Home",

        metaTitle:
          page.type === "home"
            ? "Bharat Organic Expo – International Trade Fair on Organic Products"
            : `${page.title} – Bharat Organic Expo`,

        metaDescription: page.seo?.metaDescription ?? "",
        metaKeywords: page.seo?.metaKeywords ?? "",
        canonicalUrl:
          page.seo?.canonicalUrl ||
          (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
            : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`),
        canonicalTag:
          page.seo?.canonicalTag ||
          `<link rel="canonical" href="${
            page.seo?.canonicalUrl ||
            (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
              ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
              : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`)
          }" />`,
        openGraphTags: page.seo?.openGraphTags ?? "",
        ogTitle: page.seo?.ogTitle ?? "",
        ogDescription: page.seo?.ogDescription ?? "",
        ogImage: page.seo?.ogImage ?? "",
        h1Tag: page.seo?.h1Tag ?? "",
        breadcrumbName: page.seo?.breadcrumbName ?? "",
        schemaMarkup: page.seo?.schemaMarkup ?? "",
        robotsIndex: page.seo?.robotsIndex ?? true,
        robotsFollow: page.seo?.robotsFollow ?? true,
        isActive: page.seo?.isActive ?? (page.status === "Published"),

        status:
          page.status,

        visibility:
          "Public",

        author:
          page.author,

        showInNavigation:
          true,

        menuOrder:
          page.type === "home"
            ? "1"
            : "4",
      }),
      [page],
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      initialForm,
    );

  useEffect(() => {
    setForm({
      pageTitle: page.title,
      slug: page.slug === "/" ? "" : page.slug.replace(/^\//, ""),
      template:
        page.type === "home"
          ? "Homepage"
          : page.configKey === "aboutPage"
            ? "About Page"
            : page.configKey === "advisoryPage"
              ? "Advisory Board"
              : page.configKey === "blogPage"
                ? "Blogs & News"
                : page.configKey === "whyVisitPage"
                  ? "Why Visit"
                  : page.configKey === "whyExhibitPage"
                    ? "Why Exhibit"
                    : page.configKey === "msmePage"
                      ? "MSME PMS Scheme"
                      : page.configKey === "exhibitorsPage"
                        ? "Exhibitors List"
                        : page.configKey === "buyerSellerMeetPage"
                          ? "Buyer-Seller Meet"
                          : page.configKey === "galleryPage"
                            ? "Glimpses & Gallery"
                            : page.configKey === "awardsPage"
                              ? "Excellence Awards"
                              : page.configKey === "sponsorshipPage"
                                ? "Sponsorship Opportunities"
                                : page.configKey === "epromotionPage"
                                  ? "E-Promotion Web"
                                  : page.configKey === "partnershipPage"
                                    ? "Partnership / Collaboration"
                                    : page.configKey === "servicesPage"
                                      ? "Our Services"
                                      : page.configKey === "contactPage"
                                        ? "Contact Us"
                                        : "Standard Page",
      parent: page.type === "home" ? "— No Parent (Top Level) —" : "Home",
      metaTitle: page.seo?.metaTitle ?? "",
      metaDescription: page.seo?.metaDescription ?? "",
      metaKeywords: page.seo?.metaKeywords ?? "",
      canonicalUrl:
        page.seo?.canonicalUrl ||
        (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
          : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`),
      canonicalTag:
        page.seo?.canonicalTag ||
        `<link rel="canonical" href="${
          page.seo?.canonicalUrl ||
          (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
            : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`)
        }" />`,
      openGraphTags: page.seo?.openGraphTags ?? "",
      ogTitle: page.seo?.ogTitle ?? "",
      ogDescription: page.seo?.ogDescription ?? "",
      ogImage: page.seo?.ogImage ?? "",
      h1Tag: page.seo?.h1Tag ?? "",
      breadcrumbName: page.seo?.breadcrumbName ?? "",
      schemaMarkup: page.seo?.schemaMarkup ?? "",
      robotsIndex: page.seo?.robotsIndex ?? true,
      robotsFollow: page.seo?.robotsFollow ?? true,
      isActive: page.seo?.isActive ?? (page.status === "Published"),
      status: page.status,
      visibility: "Public",
      author: page.author,
      showInNavigation: true,
      menuOrder: page.type === "home" ? "1" : "4",
    });
  }, [page]);

  const [sectionsDraft, setSectionsDraft] = useState<Array<Record<string, any>>>([]);
  const [openSectionIndices, setOpenSectionIndices] = useState<Set<number>>(new Set());

  const canonicalEditorRef = useRef<HTMLDivElement | null>(null);
  const [ogUploading, setOgUploading] = useState(false);
  const [ogPreview, setOgPreview] = useState<string | null>(null);

  useEffect(() => {
    if (canonicalEditorRef.current) {
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const defaultSiteUrl = isLocal ? "http://localhost:3002" : "https://bharatorganicexpo.com";
      const pagePath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
      const defaultTag = `<link rel="canonical" href="${defaultSiteUrl}${pagePath}" />`;

      const target = (form.canonicalTag || form.canonicalUrl || defaultTag).trim();
      const currentText = canonicalEditorRef.current.innerText.trim();
      if (target && currentText !== target && !canonicalEditorRef.current.contains(document.activeElement)) {
        canonicalEditorRef.current.innerText = target;
      }
    }
  }, [form.canonicalTag, form.canonicalUrl, page.slug]);

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    if (canonicalEditorRef.current) {
      canonicalEditorRef.current.focus();
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleCanonicalInput = () => {
    if (canonicalEditorRef.current) {
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleCanonicalPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    if (canonicalEditorRef.current) {
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOgPreview(URL.createObjectURL(file));
    setOgUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/seo");
      const url = res?.url || res?.data?.url;
      if (url) {
        updateField("ogImage", url);
      }
    } catch (err) {
      console.error("Failed to upload OG image", err);
    } finally {
      setOgUploading(false);
    }
  };

  const removeOgImage = () => {
    updateField("ogImage", "");
    setOgPreview(null);
  };

  const autoGenerateSeo = async (envType: "local" | "live") => {
    const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
    try {
      const res: any = await api.post("/seo/generate", {
        page: pageKey,
        envType,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      });
      const gen = res?.data?.data || res?.data || res;
      if (gen) {
        updateField("canonicalUrl", gen.canonicalUrl || "");
        updateField("canonicalTag", gen.canonicalTag || "");
        updateField("openGraphTags", gen.openGraphTags || "");
        updateField("schemaMarkup", gen.schemaMarkup || "");
        if (!form.metaTitle && gen.metaTitle) updateField("metaTitle", gen.metaTitle);
        if (!form.metaDescription && gen.metaDescription) updateField("metaDescription", gen.metaDescription);
        if (!form.metaKeywords && gen.metaKeywords) updateField("metaKeywords", gen.metaKeywords);
        if (!form.ogImage && gen.ogImage) updateField("ogImage", gen.ogImage);

        if (canonicalEditorRef.current) {
          canonicalEditorRef.current.innerText = gen.canonicalTag || gen.canonicalUrl || "";
        }

        Swal.fire({
          title: `Auto-Generated for ${envType.toUpperCase()}`,
          text: `Canonical, OG Tags & Schema markup generated for ${
            envType === "local" ? "http://localhost:3002" : "https://bharatorganicexpo.com"
          }. You can edit any field manually anytime!`,
          icon: "success",
          timer: 2500,
          confirmButtonColor: "#134698",
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: "Generation Failed",
        text: err?.message || "Failed to auto-generate SEO tags",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const cfg = page.configKey && settings ? settings[page.configKey] : undefined;
    const key = (page.configKey || "").toLowerCase();
    const title = (page.title || "").toLowerCase();
    const slug = (page.slug || "").toLowerCase();

    const getFallbackForPage = () => {
      if (key === "msmeeligibilitycheckpage" || slug.includes("eligibility-check")) return defaultMsmeEligibilityCheckSections;
      if (key === "msmeapplypage" || slug.includes("participate/msme/apply")) return defaultMsmeApplySections;
      if (key === "awardsnominationpage" || slug.includes("awards/nominations")) return defaultAwardsNominationSections;
      if (key === "nominateadvisorypage" || slug.includes("nominate_advisory_board")) return defaultNominateAdvisorySections;
      if (key === "supportservicespage" || slug.includes("suport_services")) return defaultSupportServicesSections;
      if (key === "aboutpage" || title.includes("about") || slug === "/about") return defaultAboutSections;
      if (key === "advisorypage" || title.includes("advisory") || slug.includes("advisory")) return defaultAdvisorySections;
      if (key === "blogpage" || title.includes("blog") || slug.includes("blog")) return defaultBlogSections;
      if (key === "participateasexhibitorpage" || title.includes("participate as exhibitor") || slug.includes("participate-as-exhibitor")) return defaultParticipateAsExhibitorSections;
      if (key === "exhibitioncategoriespage" || title.includes("exhibition categories") || slug.includes("exhibition-categories")) return defaultExhibitionCategoriesSections;
      if (key === "bookastandpage" || title.includes("book a stall") || title.includes("book a stand") || slug.includes("book-a-stand")) return defaultBookAStandSections;
      if (key === "visitorregistrationpage" || title.includes("register as visitor") || title.includes("visitor registration") || slug.includes("visitor-registration")) return defaultVisitorRegistrationSections;
      if (key === "delegateregistrationpage" || title.includes("delegate registration") || slug.includes("delegate-registration")) return defaultDelegateRegistrationSections;
      if (key === "buyerregistrationpage" || title.includes("register as buyer") || title.includes("buyer registration") || slug.includes("buyer-registration")) return defaultBuyerRegistrationSections;
      if (key === "termsandconditionspage" || title.includes("terms") || slug.includes("terms")) return defaultTermsAndConditionsSections;
      if (key === "privacypolicypage" || title.includes("privacy") || slug.includes("privacy")) return defaultPrivacyPolicySections;
      if (key === "refundpolicypage" || title.includes("refund") || slug.includes("refund")) return defaultRefundPolicySections;
      if (key === "whyvisitpage" || title.includes("why visit") || slug.includes("why-visit")) return defaultWhyVisitSections;
      if (key === "whyexhibitpage" || title.includes("why exhibit") || slug.includes("why-exhibit")) return defaultWhyExhibitSections;
      if (key === "msmepage" || title.includes("msme") || slug.includes("msme")) return defaultMsmeSections;
      if (key === "exhibitorspage" || title.includes("exhibitors") || slug.includes("exhibitors")) return defaultExhibitorsSections;
      if (key === "buyersellermeetpage" || title.includes("buyer-seller") || slug.includes("buyer-seller")) return defaultBuyerSellerMeetSections;
      if (key === "gallerypage" || title.includes("gallery") || slug.includes("gallery")) return defaultGallerySections;
      if (key === "awardspage" || title.includes("award") || slug.includes("awards")) return defaultAwardsSections;
      if (key === "sponsorshippage" || title.includes("sponsorship") || slug.includes("sponsorship")) return defaultSponsorshipSections;
      if (key === "epromotionpage" || title.includes("e-promotion") || slug.includes("e-promotion")) return defaultEPromotionSections;
      if (key === "partnershippage" || title.includes("partnership") || slug.includes("partnership")) return defaultPartnershipPageSections;
      if (key === "contactpage" || title.includes("contact") || title.includes("advisor") || slug.includes("contact")) return defaultContactSections;
      return defaultLandingSections;
    };

    const fallbackSections = getFallbackForPage();
    const stored = cfg?.sections;
    const rawSections = fallbackSections.map((fallbackItem: Record<string, any>) => {
      const savedItem = stored?.find((s: Record<string, any>) => s.key === fallbackItem.key);
      if (!savedItem) return { ...fallbackItem };
      const merged = {
        ...fallbackItem,
        ...savedItem,
        items: fallbackItem.items !== undefined ? (
          fallbackItem.items.map((item: Record<string, any>, idx: number) => ({
            ...item,
            ...(savedItem.items?.[idx] || {}),
          }))
        ) : undefined,
      };
      if (fallbackItem.key === "audience-strip" || merged.key === "audience-strip") {
        delete merged.title;
      }
      if (fallbackItem.key === "introduction-section" || merged.key === "introduction-section") {
        delete merged.items;
        if (!merged.description2) {
          merged.description2 =
            "Designed to foster business growth, knowledge sharing, innovation, and international collaboration, Bharat Organic Expo serves as the perfect destination for discovering new products, building strategic partnerships, expanding global markets, and promoting a sustainable future.";
        }
        if (!merged.timerTitle) merged.timerTitle = "EVENT BEGINS IN";
        if (!merged.eventDate) merged.eventDate = "2027-02-19T00:00:00";
        if (merged.showTimer === undefined) merged.showTimer = true;
      }
      if (fallbackItem.key === "global-platform" || merged.key === "global-platform") {
        delete merged.subtitle;
        delete merged.title;
        delete merged.image;
        delete merged.imageAlt;
        if (!merged.keyPoint1) merged.keyPoint1 = "International Exhibitors & Global Brands";
        if (!merged.keyPoint2) merged.keyPoint2 = "Buyers, Distributors & Importers";
        if (!merged.keyPoint3) merged.keyPoint3 = "Research & Innovation | Startups";
        if (!merged.keyPoint4) merged.keyPoint4 = "Investors, Financial Institutions";
        if (!merged.keyPoint5) merged.keyPoint5 = "Government Bodies, Embassies & Policy Makers";
        merged.items = (merged.items || []).filter(
          (it: any) =>
            !/trusted brands|targeted audience|business growth/i.test(it.title || "")
        );
      }
      if (fallbackItem.key === "why-participate" || merged.key === "why-participate") {
        delete merged.subtitle;
        delete merged.title;
        delete merged.items;
        if (!merged.keyPoint1) merged.keyPoint1 = "Meet genuine buyers, distributors, retailers, and healthcare professionals";
        if (!merged.keyPoint2) merged.keyPoint2 = "Generate high-quality B2B & B2C leads with faster business conversions";
        if (!merged.keyPoint3) merged.keyPoint3 = "Launch new products with maximum visibility and market impact";
        if (!merged.keyPoint4) merged.keyPoint4 = "Expand your dealer, distributor, franchise, and export network";
        if (!merged.keyPoint5) merged.keyPoint5 = "Strengthen brand presence through live demos and media exposure";
        if (!merged.keyPoint6) merged.keyPoint6 = "Connect with investors, CEOs, doctors, and key decision-makers";
        if (!merged.keyPoint7) merged.keyPoint7 = "Achieve higher ROI with direct customer engagement and trust building";
        if (!merged.buttonLabel) merged.buttonLabel = "BOOK A STALL";
        if (!merged.buttonHref) merged.buttonHref = "/registration/book-a-stand";
        if (!merged.secondaryButtonLabel) merged.secondaryButtonLabel = "Download Brochure";
        if (!merged.secondaryButtonHref) merged.secondaryButtonHref = "/download/invited card.pdf";
        if (!merged.tertiaryButtonLabel) merged.tertiaryButtonLabel = "Why Exhibit?";
        if (!merged.tertiaryButtonHref) merged.tertiaryButtonHref = "/why-exhibit";
      }
      if (fallbackItem.key === "conference-section" || merged.key === "conference-section") {
        delete merged.subtitle;
        delete merged.title;
        delete merged.items;
        if (!merged.eyebrow) merged.eyebrow = "GLOBAL CONFERENCE & SEMINARS";
        if (!merged.titlePrimary) merged.titlePrimary = "Where Knowledge Meets";
        if (!merged.titleSecondary) merged.titleSecondary = "the Future of Organic";
        if (!merged.description) merged.description = "Join expert-led sessions, panel discussions & thought leadership talks on the latest trends shaping the future of organic, natural and sustainable living.";
        if (!merged.buttonLabel) merged.buttonLabel = "View Conference Schedule";
        if (!merged.buttonHref) merged.buttonHref = "https://arogya.namogange.org/";
        if (!merged.keyPoint1) merged.keyPoint1 = "Expert-led panel discussions & keynotes";
        if (!merged.keyPoint2) merged.keyPoint2 = "Emerging trends in organic farming & retail";
        if (!merged.keyPoint3) merged.keyPoint3 = "Sustainable business & growth strategies";
        if (!merged.stat1Title) merged.stat1Title = "19 – 21";
        if (!merged.stat1Sub) merged.stat1Sub = "FEBRUARY 2027";
        if (!merged.stat2Title) merged.stat2Title = "PRAGATI MAIDAN";
        if (!merged.stat2Sub) merged.stat2Sub = "NEW DELHI";
        if (!merged.stat3Title) merged.stat3Title = "INSIGHTS. IDEAS.";
        if (!merged.stat3Sub) merged.stat3Sub = "IMPACT.";
        if (!merged.stat4Title) merged.stat4Title = "50+ GLOBAL";
        if (!merged.stat4Sub) merged.stat4Sub = "SPEAKERS";
        if (!merged.stat5Title) merged.stat5Title = "20+ KEY";
        if (!merged.stat5Sub) merged.stat5Sub = "SESSIONS";
      }
      if (fallbackItem.key === "expo-categories" || merged.key === "expo-categories") {
        delete merged.image;
        delete merged.imageAlt;
        delete merged.title;
        delete merged.subtitle;
        if (!merged.sectionTag) merged.sectionTag = "Expo Categories";
        if (!merged.titleMain) merged.titleMain = "Explore Diverse";
        if (!merged.titleHighlight) merged.titleHighlight = "Exhibition Sectors";
        if (!merged.descriptionPrefix) merged.descriptionPrefix = "One Platform. Every Opportunity.";
        if (!merged.description) merged.description = "Bharat Organic Expo brings together the entire organic ecosystem under one roof. Explore a wide range of sectors driving sustainable living, natural wellness, ethical production and global trade.";
        if (!merged.buttonText) merged.buttonText = "VIEW ALL CATEGORIES";
        if (!merged.buttonHref) merged.buttonHref = "/exhibition-categories";
        if (!merged.exploreText) merged.exploreText = "Explore";
        if (Array.isArray(merged.items)) {
          merged.items = merged.items.map((it: any) => {
            const clean = { ...it };
            delete clean.icon;
            delete clean.desc;
            delete clean.color;
            delete clean.imageAlt;
            if (clean.description === undefined) clean.description = it.desc || "";
            if (clean.image === undefined) clean.image = "";
            if (!clean.href) clean.href = it.link || "/exhibition-categories";
            if (!clean.exploreText) clean.exploreText = "Explore";
            return clean;
          });
        }
      }
      if (fallbackItem.key === "beyond-exhibition" || merged.key === "beyond-exhibition") {
        delete merged.title;
        delete merged.subtitle;
        if (!merged.sectionTag) merged.sectionTag = "Global Organic Platform";
        if (!merged.titleMain) merged.titleMain = "Beyond An";
        if (!merged.titleHighlight) merged.titleHighlight = "Exhibition";
        if (!merged.description) merged.description = "Join India's most powerful ecosystem for the organic industry. From high-impact B2B matchmaking and leadership summits to global networking, we provide everything you need to scale your business.";
        if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";
        if (!merged.imageAlt) merged.imageAlt = "Conferences & Seminars";
        if (Array.isArray(merged.items)) {
          merged.items = merged.items.map((it: any) => ({
            title: it.title || "",
            description: it.description || it.subtitle || "",
            icon: it.icon || "Users",
          }));
        }
      }
      if (fallbackItem.key === "sponsors-attend" || merged.key === "sponsors-attend") {
        delete merged.title;
        delete merged.subtitle;
        delete merged.rightTitle;
        delete merged.rightBottomText;
        delete merged.centerText1;
        delete merged.centerText2;
        delete merged.centerText3;
        delete merged.items;
        if (!merged.titlePrefix) merged.titlePrefix = "WHY";
        if (!merged.titleHighlight) merged.titleHighlight = "ATTEND?";
        if (!merged.description) merged.description = "Explore innovations, build connections and gain insights that drive better health and stronger businesses.";
        if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";
        if (!merged.imageAlt) merged.imageAlt = "Why Attend Expo";
        if (!merged.buttonLabel) merged.buttonLabel = "REGISTER AS VISITOR!";
        if (!merged.buttonHref) merged.buttonHref = "/registration/visitor-registration";
        if (!merged.feature1Title) merged.feature1Title = "DISCOVER";
        if (!merged.feature1Desc) merged.feature1Desc = "Explore the latest organic products and eco-friendly services driving a sustainable future.";
        if (!merged.feature2Title) merged.feature2Title = "LEARN";
        if (!merged.feature2Desc) merged.feature2Desc = "Attend seminars, workshops and live demos by organic agriculture and sustainability experts.";
        if (!merged.feature3Title) merged.feature3Title = "CONNECT";
        if (!merged.feature3Desc) merged.feature3Desc = "Meet leading organic brands, manufacturers and sustainable suppliers under one roof.";
        if (!merged.feature4Title) merged.feature4Title = "SOURCE";
        if (!merged.feature4Desc) merged.feature4Desc = "Find trusted organic suppliers, distributors and eco-franchise opportunities.";
        if (!merged.feature5Title) merged.feature5Title = "GROW";
        if (!merged.feature5Desc) merged.feature5Desc = "Unlock new green business opportunities, partnerships and eco-investment possibilities.";
        if (!merged.feature6Title) merged.feature6Title = "STAY AHEAD";
        if (!merged.feature6Desc) merged.feature6Desc = "Stay updated with market trends, conscious consumer insights and future organic industry developments.";
        if (!merged.keyPoint1) merged.keyPoint1 = "Organic Distributors, Wholesalers & Retailers";
        if (!merged.keyPoint2) merged.keyPoint2 = "Eco-Importers & Exporters";
        if (!merged.keyPoint3) merged.keyPoint3 = "Ayurvedic Institutions & Wellness Centers";
        if (!merged.keyPoint4) merged.keyPoint4 = "Nutritionists, Farmers & Wellness Experts";
        if (!merged.keyPoint5) merged.keyPoint5 = "Gym Owners, Spa & Eco-Fitness Professionals";
        if (!merged.keyPoint6) merged.keyPoint6 = "Organic Farming & Natural Product Buyers";
        if (!merged.keyPoint7) merged.keyPoint7 = "Sustainable Packaging & Eco-friendly Brands";
        if (!merged.keyPoint8) merged.keyPoint8 = "Investors, Franchise Seekers & Green Business";
        if (!merged.keyPoint9) merged.keyPoint9 = "Supermarkets & Organic Grocery Chains";
        if (!merged.keyPoint10) merged.keyPoint10 = "Health-Conscious Consumers & Eco-Enthusiasts";
      }
      if (fallbackItem.key === "footer" || merged.key === "footer") {
        delete merged.title;
        delete merged.subtitle;
        delete merged.partnerLogoImage;
        delete merged.secondaryImage;
        delete merged.tertiaryImage;
        delete merged.altPhoneNumber;
        if (!merged.websiteUrl) merged.websiteUrl = "www.bharatorganicexpo.com";
        if (merged.description === undefined || merged.description.startsWith("Showcasing certified products")) {
          merged.description =
            "A global platform uniting over 500+ exhibitors from across the organic value chain, showcasing certified products, advanced agritech, sustainable practices, and the rich heritage of traditional wellness. Discover organic living with conferences and B2B opportunities.";
        }
        if (merged.logoImage === undefined || merged.logoImage.includes("km.jpg")) {
          merged.logoImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240083-112323989.png";
        }
        if (merged.leafImage === undefined) {
          merged.leafImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240457-21656484.png";
        }
        if (merged.downImage === undefined) {
          merged.downImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240816-597711504.png";
        }
        if (merged.organisedByLogo === undefined) {
          merged.organisedByLogo = "http://localhost:4000/uploads/bharat-organic_footer/1789129241128-849314126.png";
        }
        if (merged.bottomBannerImage === undefined) {
          merged.bottomBannerImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129242465-452827954.webp";
        }
        if (merged.contactAddress === undefined) merged.contactAddress = "Hall 12, Pragati Maidan, New Delhi, India 110001";
        if (merged.phoneNumber === undefined) merged.phoneNumber = "+91 96549 00525";
        if (merged.conferenceHelpline === undefined) merged.conferenceHelpline = "+91 98183 53841";
        if (merged.contactEmail === undefined) merged.contactEmail = "info@namogangewellness.com";
        if (merged.facebookUrl === undefined) merged.facebookUrl = "https://facebook.com/bharatorganicexpo";
        if (merged.twitterUrl === undefined) merged.twitterUrl = "https://twitter.com/bharatorganic";
        if (merged.linkedinUrl === undefined) merged.linkedinUrl = "https://linkedin.com/company/bharatorganicexpo";
        if (merged.instagramUrl === undefined) merged.instagramUrl = "https://instagram.com/bharatorganicexpo";
        if (merged.youtubeUrl === undefined) merged.youtubeUrl = "https://youtube.com/@bharatorganicexpo";
        if (!merged.items || merged.items.length === 0) {
          merged.items = [
            { label: "Home", href: "/" },
            { label: "About Us", href: "/about" },
            { label: "Exhibitor Registration", href: "/registration/book-a-stand" },
            { label: "Delegate Registration", href: "https://arogya.namogange.org/" },
            { label: "Conference Tracks", href: "https://arogya.namogange.org/" },
            { label: "Buyer Seller Meet", href: "/buyer-seller-meet" },
            { label: "Exhibitor List", href: "/exhibitors" },
            { label: "Blogs", href: "/blog" },
            { label: "Awards", href: "/awards" },
            { label: "Contact Us", href: "/contact" },
          ];
        }
      }
      return merged;
    });
    setSectionsDraft(rawSections.map((section: Record<string, any>) => ({ ...section })));
    setOpenSectionIndices(new Set());

    if (page.configKey === "landingPage" || page.type === "home") {
      api.get("/website/home/audience-strip")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "audience-strip"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      items: data.items.map((it: any) => ({
                        title: it.title ?? "",
                        subtitle: it.subtitle ?? "",
                        label: it.label ?? `${it.title ?? ""} ${it.subtitle ?? ""}`.trim(),
                        icon: it.icon ?? "GraduationCap",
                        color: it.color ?? "#facc15",
                      })),
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/introduction-section")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "introduction-section"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? sec.titleSecondary,
                      subtitle: data.subtitle ?? sec.subtitle,
                      description: data.description ?? sec.description,
                      description2: data.description2 ?? sec.description2,
                      buttonLabel: data.buttonLabel ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? sec.buttonHref,
                      timerTitle: data.timerTitle ?? sec.timerTitle,
                      eventDate: data.eventDate ?? sec.eventDate,
                      showTimer: data.showTimer !== false,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/global-platform")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "global-platform"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? data.badge ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? sec.titleSecondary,
                      description: data.description ?? sec.description,
                      keyPoint1:
                        data.keyPoint1 ??
                        data.listItems?.[0] ??
                        sec.keyPoint1 ??
                        "International Exhibitors & Global Brands",
                      keyPoint2:
                        data.keyPoint2 ??
                        data.listItems?.[1] ??
                        sec.keyPoint2 ??
                        "Buyers, Distributors & Importers",
                      keyPoint3:
                        data.keyPoint3 ??
                        data.listItems?.[2] ??
                        sec.keyPoint3 ??
                        "Research & Innovation | Startups",
                      keyPoint4:
                        data.keyPoint4 ??
                        data.listItems?.[3] ??
                        sec.keyPoint4 ??
                        "Investors, Financial Institutions",
                      keyPoint5:
                        data.keyPoint5 ??
                        data.listItems?.[4] ??
                        sec.keyPoint5 ??
                        "Government Bodies, Embassies & Policy Makers",
                      items:
                        Array.isArray(data.items || data.cards) &&
                        (data.items || data.cards).length > 0
                          ? (data.items || data.cards)
                              .filter(
                                (c: any) =>
                                  !/trusted brands|targeted audience|business growth/i.test(
                                    c.title || ""
                                  )
                              )
                              .map((c: any) => ({
                                title: c.title ?? "",
                                description: c.description ?? c.desc ?? "",
                              }))
                          : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/why-participate")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "why-participate"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? data.sectionTag ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? data.titleMain ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? data.titleHighlight ?? sec.titleSecondary,
                      description: data.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      buttonLabel: data.buttonLabel ?? data.buttons?.stall?.text ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? data.buttons?.stall?.link ?? sec.buttonHref,
                      secondaryButtonLabel: data.secondaryButtonLabel ?? data.buttons?.brochure?.text ?? sec.secondaryButtonLabel,
                      secondaryButtonHref: data.secondaryButtonHref ?? data.buttons?.brochure?.link ?? sec.secondaryButtonHref,
                      tertiaryButtonLabel: data.tertiaryButtonLabel ?? data.buttons?.moreInfo?.text ?? sec.tertiaryButtonLabel,
                      tertiaryButtonHref: data.tertiaryButtonHref ?? data.buttons?.moreInfo?.link ?? sec.tertiaryButtonHref,
                      keyPoint1: data.keyPoint1 ?? data.points?.[0] ?? sec.keyPoint1,
                      keyPoint2: data.keyPoint2 ?? data.points?.[1] ?? sec.keyPoint2,
                      keyPoint3: data.keyPoint3 ?? data.points?.[2] ?? sec.keyPoint3,
                      keyPoint4: data.keyPoint4 ?? data.points?.[3] ?? sec.keyPoint4,
                      keyPoint5: data.keyPoint5 ?? data.points?.[4] ?? sec.keyPoint5,
                      keyPoint6: data.keyPoint6 ?? data.points?.[5] ?? sec.keyPoint6,
                      keyPoint7: data.keyPoint7 ?? data.points?.[6] ?? sec.keyPoint7,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/conference-seminars")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "conference-section"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? data.sectionTag ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? data.titleMain ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? data.titleHighlight ?? sec.titleSecondary,
                      description: data.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      buttonLabel: data.buttonLabel ?? data.button?.text ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? data.button?.link ?? sec.buttonHref,
                      keyPoint1: data.keyPoint1 ?? data.checklist?.[0] ?? sec.keyPoint1,
                      keyPoint2: data.keyPoint2 ?? data.checklist?.[1] ?? sec.keyPoint2,
                      keyPoint3: data.keyPoint3 ?? data.checklist?.[2] ?? sec.keyPoint3,
                      stat1Title: data.stat1Title ?? data.eventInfo?.[0]?.title ?? sec.stat1Title,
                      stat1Sub: data.stat1Sub ?? data.eventInfo?.[0]?.sub ?? sec.stat1Sub,
                      stat2Title: data.stat2Title ?? data.eventInfo?.[1]?.title ?? sec.stat2Title,
                      stat2Sub: data.stat2Sub ?? data.eventInfo?.[1]?.sub ?? sec.stat2Sub,
                      stat3Title: data.stat3Title ?? data.eventInfo?.[2]?.title ?? sec.stat3Title,
                      stat3Sub: data.stat3Sub ?? data.eventInfo?.[2]?.sub ?? sec.stat3Sub,
                      stat4Title: data.stat4Title ?? data.eventInfo?.[3]?.title ?? sec.stat4Title,
                      stat4Sub: data.stat4Sub ?? data.eventInfo?.[3]?.sub ?? sec.stat4Sub,
                      stat5Title: data.stat5Title ?? data.eventInfo?.[4]?.title ?? sec.stat5Title,
                      stat5Sub: data.stat5Sub ?? data.eventInfo?.[4]?.sub ?? sec.stat5Sub,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/expo-categories")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "expo-categories"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      sectionTag: data.sectionTag ?? sec.sectionTag,
                      titleMain: data.titleMain ?? sec.titleMain,
                      titleHighlight: data.titleHighlight ?? sec.titleHighlight,
                      descriptionPrefix: data.descriptionPrefix ?? sec.descriptionPrefix,
                      description: data.description ?? sec.description,
                      exploreText: data.exploreText ?? sec.exploreText,
                      buttonText: data.buttonText ?? sec.buttonText,
                      buttonHref: data.buttonHref ?? data.buttonLink ?? sec.buttonHref,
                      items: Array.isArray(data.items) && data.items.length > 0
                        ? data.items.map((it: any) => ({
                            title: it.title || "",
                            description: it.description ?? it.desc ?? "",
                            image: it.image || "",
                            href: it.href ?? it.link ?? "/exhibition-categories",
                            exploreText: it.exploreText || "Explore",
                          }))
                        : Array.isArray(data.categories) && data.categories.length > 0
                        ? data.categories.map((it: any) => ({
                            title: it.title || "",
                            description: it.description ?? it.desc ?? "",
                            image: it.image || "",
                            href: it.href ?? it.link ?? "/exhibition-categories",
                            exploreText: it.exploreText || "Explore",
                          }))
                        : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/beyond-exhibition")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "beyond-exhibition"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      sectionTag: data.sectionTag ?? sec.sectionTag,
                      titleMain: data.titleMain ?? sec.titleMain,
                      titleHighlight: data.titleHighlight ?? sec.titleHighlight,
                      description: data.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      items: Array.isArray(data.items) && data.items.length > 0
                        ? data.items.map((it: any) => ({
                            title: it.title || "",
                            description: it.description ?? it.subtitle ?? "",
                            icon: it.icon || "Users",
                          }))
                        : Array.isArray(data.extras) && data.extras.length > 0
                        ? data.extras.map((it: any) => ({
                            title: it.title2 ? `${it.title} ${it.title2}`.trim() : (it.title || ""),
                            description: it.description ?? it.subtitle ?? "",
                            icon: it.icon || "Users",
                          }))
                        : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/sponsors-attend")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "sponsors-attend"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      titlePrefix: data.titlePrefix ?? data.leftSection?.titlePrefix ?? sec.titlePrefix,
                      titleHighlight: data.titleHighlight ?? data.leftSection?.titleHighlight ?? sec.titleHighlight,
                      description: data.description ?? data.leftSection?.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      buttonLabel: data.buttonLabel ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? sec.buttonHref,

                      feature1Title: data.feature1Title ?? data.leftSection?.itemsLeft?.[0]?.title ?? sec.feature1Title,
                      feature1Desc: data.feature1Desc ?? data.leftSection?.itemsLeft?.[0]?.desc ?? sec.feature1Desc,
                      feature2Title: data.feature2Title ?? data.leftSection?.itemsRight?.[0]?.title ?? sec.feature2Title,
                      feature2Desc: data.feature2Desc ?? data.leftSection?.itemsRight?.[0]?.desc ?? sec.feature2Desc,
                      feature3Title: data.feature3Title ?? data.leftSection?.itemsLeft?.[1]?.title ?? sec.feature3Title,
                      feature3Desc: data.feature3Desc ?? data.leftSection?.itemsLeft?.[1]?.desc ?? sec.feature3Desc,
                      feature4Title: data.feature4Title ?? data.leftSection?.itemsRight?.[1]?.title ?? sec.feature4Title,
                      feature4Desc: data.feature4Desc ?? data.leftSection?.itemsRight?.[1]?.desc ?? sec.feature4Desc,
                      feature5Title: data.feature5Title ?? data.leftSection?.itemsLeft?.[2]?.title ?? sec.feature5Title,
                      feature5Desc: data.feature5Desc ?? data.leftSection?.itemsLeft?.[2]?.desc ?? sec.feature5Desc,
                      feature6Title: data.feature6Title ?? data.leftSection?.itemsRight?.[2]?.title ?? sec.feature6Title,
                      feature6Desc: data.feature6Desc ?? data.leftSection?.itemsRight?.[2]?.desc ?? sec.feature6Desc,

                      keyPoint1: data.keyPoint1 ?? data.rightSection?.items?.[0]?.label ?? sec.keyPoint1,
                      keyPoint2: data.keyPoint2 ?? data.rightSection?.items?.[1]?.label ?? sec.keyPoint2,
                      keyPoint3: data.keyPoint3 ?? data.rightSection?.items?.[2]?.label ?? sec.keyPoint3,
                      keyPoint4: data.keyPoint4 ?? data.rightSection?.items?.[3]?.label ?? sec.keyPoint4,
                      keyPoint5: data.keyPoint5 ?? data.rightSection?.items?.[4]?.label ?? sec.keyPoint5,
                      keyPoint6: data.keyPoint6 ?? data.rightSection?.items?.[5]?.label ?? sec.keyPoint6,
                      keyPoint7: data.keyPoint7 ?? data.rightSection?.items?.[6]?.label ?? sec.keyPoint7,
                      keyPoint8: data.keyPoint8 ?? data.rightSection?.items?.[7]?.label ?? sec.keyPoint8,
                      keyPoint9: data.keyPoint9 ?? data.rightSection?.items?.[8]?.label ?? sec.keyPoint9,
                      keyPoint10: data.keyPoint10 ?? data.rightSection?.items?.[9]?.label ?? sec.keyPoint10,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});
    }

    const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
    const isLocalEnv = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    api.get(`/seo/${pageKey}?envType=${isLocalEnv ? "local" : "live"}`)
      .then((res: any) => {
        const seoData = res?.data?.data || res?.data || res;
        if (seoData) {
          const defaultSiteUrl = isLocalEnv ? "http://localhost:3002" : "https://bharatorganicexpo.com";
          const pagePath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
          const defaultTag = `<link rel="canonical" href="${defaultSiteUrl}${pagePath}" />`;

          const canonicalVal = (seoData.canonicalTag || seoData.canonicalUrl || defaultTag).trim();
          const match = canonicalVal.match(/href=["']([^"']+)["']/i);
          const cleanUrl = match ? match[1] : canonicalVal.replace(/<[^>]*>/g, "").trim() || `${defaultSiteUrl}${pagePath}`;

          setForm((prev) => ({
            ...prev,
            metaTitle: seoData.metaTitle || prev.metaTitle,
            metaDescription: seoData.metaDescription || prev.metaDescription,
            metaKeywords: seoData.metaKeywords || prev.metaKeywords,
            canonicalUrl: cleanUrl,
            canonicalTag: canonicalVal,
            openGraphTags: seoData.openGraphTags || prev.openGraphTags,
            schemaMarkup: seoData.schemaMarkup || prev.schemaMarkup,
            ogTitle: seoData.ogTitle || prev.ogTitle,
            ogDescription: seoData.ogDescription || prev.ogDescription,
            ogImage: seoData.ogImage || prev.ogImage,
            robotsIndex: seoData.robotsIndex !== undefined ? seoData.robotsIndex : prev.robotsIndex,
            robotsFollow: seoData.robotsFollow !== undefined ? seoData.robotsFollow : prev.robotsFollow,
            isActive: seoData.isActive !== undefined ? seoData.isActive : prev.isActive,
          }));

          if (canonicalEditorRef.current) {
            canonicalEditorRef.current.innerText = canonicalVal;
          }
        }
      })
      .catch(() => {});
  }, [settings, page]);

  const toggleSectionAccordion = (index: number) => {
    setOpenSectionIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const updateSectionField = (sectionIndex: number, key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) =>
        index === sectionIndex ? { ...section, [key]: value } : section,
      ),
    );
  };

  const updateSectionItem = (sectionIndex: number, itemIndex: number, key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = [...(section.items ?? [])];
        items[itemIndex] = { ...items[itemIndex], [key]: value };
        return { ...section, items };
      }),
    );
  };

  const addSectionItem = (sectionIndex: number) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = [...(section.items ?? [])];
        if (section.key === "audience-strip") {
          const blankAudience = {
            title: "NEW AUDIENCE",
            subtitle: "TARGET GROUP",
            icon: "GraduationCap",
            color: "#facc15",
            label: "NEW AUDIENCE TARGET GROUP",
          };
          return { ...section, items: [...items, blankAudience] };
        }
        if (section.key === "expo-categories") {
          const blankCategory = {
            title: "New Exhibition Sector",
            description: "Enter sector description...",
            image: "",
            href: "/exhibition-categories",
            exploreText: "Explore",
          };
          return { ...section, items: [...items, blankCategory] };
        }
        if (section.key === "beyond-exhibition") {
          const blankItem = {
            title: "NEW HIGHLIGHT / AWARD",
            description: "Enter description...",
            icon: "Award",
          };
          return { ...section, items: [...items, blankItem] };
        }
        if (section.key === "footer") {
          const blankLink = {
            label: "New Link",
            href: "/",
          };
          return { ...section, items: [...items, blankLink] };
        }
        const defaultItemTemplate: Record<string, any> = {
          title: "",
          subtitle: "",
          description: "",
          label: "",
          value: "",
          icon: "",
          image: "",
          buttonLabel: "",
          buttonHref: "",
          question: "",
          answer: "",
          href: "",
          category: "",
          year: "",
        };
        if (items[0]) {
          Object.keys(items[0]).forEach((k) => {
            if (k !== "_id" && !(k in defaultItemTemplate)) {
              defaultItemTemplate[k] = "";
            }
          });
        }
        return { ...section, items: [...items, defaultItemTemplate] };
      }),
    );
  };

  const removeSectionItem = (sectionIndex: number, itemIndex: number) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = (section.items ?? []).filter((_: unknown, i: number) => i !== itemIndex);
        return { ...section, items };
      }),
    );
  };

  const updateField = <
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K],
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      }),
    );
  };

  const resetToWebsiteDefaults = () => {
    const key = (page.configKey || "").toLowerCase();
    const title = (page.title || "").toLowerCase();
    const slug = (page.slug || "").toLowerCase();
    let defaults = defaultLandingSections;
    if (key === "msmeeligibilitycheckpage" || slug.includes("eligibility-check")) defaults = defaultMsmeEligibilityCheckSections;
    else if (key === "msmeapplypage" || slug.includes("participate/msme/apply")) defaults = defaultMsmeApplySections;
    else if (key === "awardsnominationpage" || slug.includes("awards/nominations")) defaults = defaultAwardsNominationSections;
    else if (key === "nominateadvisorypage" || slug.includes("nominate_advisory_board")) defaults = defaultNominateAdvisorySections;
    else if (key === "supportservicespage" || slug.includes("suport_services")) defaults = defaultSupportServicesSections;
    else if (key === "aboutpage" || title.includes("about") || slug === "/about") defaults = defaultAboutSections;
    else if (key === "advisorypage" || title.includes("advisory") || slug.includes("advisory")) defaults = defaultAdvisorySections;
    else if (key === "blogpage" || title.includes("blog") || slug.includes("blog")) defaults = defaultBlogSections;
    else if (key === "participateasexhibitorpage" || title.includes("participate as exhibitor") || slug.includes("participate-as-exhibitor")) defaults = defaultParticipateAsExhibitorSections;
    else if (key === "exhibitioncategoriespage" || title.includes("exhibition categories") || slug.includes("exhibition-categories")) defaults = defaultExhibitionCategoriesSections;
    else if (key === "bookastandpage" || title.includes("book a stall") || title.includes("book a stand") || slug.includes("book-a-stand")) defaults = defaultBookAStandSections;
    else if (key === "visitorregistrationpage" || title.includes("register as visitor") || title.includes("visitor registration") || slug.includes("visitor-registration")) defaults = defaultVisitorRegistrationSections;
    else if (key === "delegateregistrationpage" || title.includes("delegate registration") || slug.includes("delegate-registration")) defaults = defaultDelegateRegistrationSections;
    else if (key === "buyerregistrationpage" || title.includes("register as buyer") || title.includes("buyer registration") || slug.includes("buyer-registration")) defaults = defaultBuyerRegistrationSections;
    else if (key === "termsandconditionspage" || title.includes("terms") || slug.includes("terms")) defaults = defaultTermsAndConditionsSections;
    else if (key === "privacypolicypage" || title.includes("privacy") || slug.includes("privacy")) defaults = defaultPrivacyPolicySections;
    else if (key === "refundpolicypage" || title.includes("refund") || slug.includes("refund")) defaults = defaultRefundPolicySections;
    else if (key === "whyvisitpage" || title.includes("why visit") || slug.includes("why-visit")) defaults = defaultWhyVisitSections;
    else if (key === "whyexhibitpage" || title.includes("why exhibit") || slug.includes("why-exhibit")) defaults = defaultWhyExhibitSections;
    else if (key === "msmepage" || title.includes("msme") || slug.includes("msme")) defaults = defaultMsmeSections;
    else if (key === "exhibitorspage" || title.includes("exhibitors") || slug.includes("exhibitors")) defaults = defaultExhibitorsSections;
    else if (key === "buyersellermeetpage" || title.includes("buyer-seller") || slug.includes("buyer-seller")) defaults = defaultBuyerSellerMeetSections;
    else if (key === "gallerypage" || title.includes("gallery") || slug.includes("gallery")) defaults = defaultGallerySections;
    else if (key === "awardspage" || title.includes("award") || slug.includes("awards")) defaults = defaultAwardsSections;
    else if (key === "sponsorshippage" || title.includes("sponsorship") || slug.includes("sponsorship")) defaults = defaultSponsorshipSections;
    else if (key === "epromotionpage" || title.includes("e-promotion") || slug.includes("e-promotion")) defaults = defaultEPromotionSections;
    else if (key === "partnershippage" || title.includes("partnership") || slug.includes("partnership")) defaults = defaultPartnershipPageSections;
    else if (key === "contactpage" || title.includes("contact") || title.includes("advisor") || slug.includes("contact")) defaults = defaultContactSections;

    setSectionsDraft(defaults.map((s) => ({ ...s })));
    Swal.fire({
      title: "Reset to Website Content",
      text: "Page sections have been reset to match the exact live website defaults.",
      icon: "success",
      timer: 1800,
      confirmButtonColor: "#0f766e",
    });
  };

  const savePage = async () => {
    if (!settings || !page.configKey) return;
    setSaving(true);
    try {
      if (page.configKey === "landingPage" || page.type === "home") {
        const heroSec = sectionsDraft.find((s) => s.key === "hero");
        if (heroSec && Array.isArray(heroSec.slides) && heroSec.slides.length > 0) {
          try {
            await api.put("/website/home/home-hero", { slides: heroSec.slides });
          } catch (err) {
            console.error("Failed to sync hero slides to backend:", err);
          }
        }

        const audienceSec = sectionsDraft.find((s) => s.key === "audience-strip");
        if (audienceSec) {
          try {
            await api.put("/website/home/audience-strip", {
              enabled: audienceSec.enabled !== false,
              items: audienceSec.items || [],
            });
          } catch (err) {
            console.error("Failed to sync audience strip to backend:", err);
          }
        }

        const introSec = sectionsDraft.find((s) => s.key === "introduction-section");
        if (introSec) {
          try {
            await api.put("/website/home/introduction-section", {
              enabled: introSec.enabled !== false,
              eyebrow: introSec.eyebrow,
              titlePrimary: introSec.titlePrimary,
              titleSecondary: introSec.titleSecondary,
              subtitle: introSec.subtitle,
              description: introSec.description,
              description2: introSec.description2,
              buttonLabel: introSec.buttonLabel,
              buttonHref: introSec.buttonHref,
              timerTitle: introSec.timerTitle,
              eventDate: introSec.eventDate,
              showTimer: introSec.showTimer !== false,
              image: introSec.image,
              imageAlt: introSec.imageAlt,
            });
          } catch (err) {
            console.error("Failed to sync introduction section to backend:", err);
          }
        }

        const globalSec = sectionsDraft.find((s) => s.key === "global-platform");
        if (globalSec) {
          try {
            await api.put("/website/home/global-platform", {
              enabled: globalSec.enabled !== false,
              eyebrow: globalSec.eyebrow,
              badge: globalSec.eyebrow,
              titlePrimary: globalSec.titlePrimary,
              titleSecondary: globalSec.titleSecondary,
              description: globalSec.description,
              keyPoint1: globalSec.keyPoint1,
              keyPoint2: globalSec.keyPoint2,
              keyPoint3: globalSec.keyPoint3,
              keyPoint4: globalSec.keyPoint4,
              keyPoint5: globalSec.keyPoint5,
              items: (globalSec.items || []).map((it: any) => ({
                title: it.title ?? "",
                description: it.description ?? it.desc ?? "",
                desc: it.description ?? it.desc ?? "",
              })),
            });
          } catch (err) {
            console.error("Failed to sync global platform to backend:", err);
          }
        }

        const whySec = sectionsDraft.find((s) => s.key === "why-participate");
        if (whySec) {
          try {
            await api.put("/website/home/why-participate", {
              enabled: whySec.enabled !== false,
              eyebrow: whySec.eyebrow,
              sectionTag: whySec.eyebrow,
              titlePrimary: whySec.titlePrimary,
              titleMain: whySec.titlePrimary,
              titleSecondary: whySec.titleSecondary,
              titleHighlight: whySec.titleSecondary,
              description: whySec.description,
              image: whySec.image,
              imageAlt: whySec.imageAlt,
              buttonLabel: whySec.buttonLabel,
              buttonHref: whySec.buttonHref,
              secondaryButtonLabel: whySec.secondaryButtonLabel,
              secondaryButtonHref: whySec.secondaryButtonHref,
              tertiaryButtonLabel: whySec.tertiaryButtonLabel,
              tertiaryButtonHref: whySec.tertiaryButtonHref,
              keyPoint1: whySec.keyPoint1,
              keyPoint2: whySec.keyPoint2,
              keyPoint3: whySec.keyPoint3,
              keyPoint4: whySec.keyPoint4,
              keyPoint5: whySec.keyPoint5,
              keyPoint6: whySec.keyPoint6,
              keyPoint7: whySec.keyPoint7,
              points: [
                whySec.keyPoint1,
                whySec.keyPoint2,
                whySec.keyPoint3,
                whySec.keyPoint4,
                whySec.keyPoint5,
                whySec.keyPoint6,
                whySec.keyPoint7,
              ].filter(Boolean),
            });
          } catch (err) {
            console.error("Failed to sync why participate to backend:", err);
          }
        }

        const confSec = sectionsDraft.find((s) => s.key === "conference-section");
        if (confSec) {
          try {
            await api.put("/website/home/conference-seminars", {
              enabled: confSec.enabled !== false,
              eyebrow: confSec.eyebrow,
              sectionTag: confSec.eyebrow,
              titlePrimary: confSec.titlePrimary,
              titleMain: confSec.titlePrimary,
              titleSecondary: confSec.titleSecondary,
              titleHighlight: confSec.titleSecondary,
              description: confSec.description,
              image: confSec.image,
              imageAlt: confSec.imageAlt,
              buttonLabel: confSec.buttonLabel,
              buttonHref: confSec.buttonHref,
              button: {
                text: confSec.buttonLabel,
                link: confSec.buttonHref,
              },
              keyPoint1: confSec.keyPoint1,
              keyPoint2: confSec.keyPoint2,
              keyPoint3: confSec.keyPoint3,
              checklist: [
                confSec.keyPoint1,
                confSec.keyPoint2,
                confSec.keyPoint3,
              ].filter(Boolean),
              stat1Title: confSec.stat1Title,
              stat1Sub: confSec.stat1Sub,
              stat2Title: confSec.stat2Title,
              stat2Sub: confSec.stat2Sub,
              stat3Title: confSec.stat3Title,
              stat3Sub: confSec.stat3Sub,
              stat4Title: confSec.stat4Title,
              stat4Sub: confSec.stat4Sub,
              stat5Title: confSec.stat5Title,
              stat5Sub: confSec.stat5Sub,
              eventInfo: [
                { icon: "Calendar", title: confSec.stat1Title, sub: confSec.stat1Sub },
                { icon: "MapPin", title: confSec.stat2Title, sub: confSec.stat2Sub },
                { icon: "Users", title: confSec.stat3Title, sub: confSec.stat3Sub },
                { icon: "Mic", title: confSec.stat4Title, sub: confSec.stat4Sub },
                { icon: "BookOpen", title: confSec.stat5Title, sub: confSec.stat5Sub },
              ],
            });
          } catch (err) {
            console.error("Failed to sync conference seminars to backend:", err);
          }
        }

        const expoSec = sectionsDraft.find((s) => s.key === "expo-categories");
        if (expoSec) {
          try {
            const cleanItems = Array.isArray(expoSec.items)
              ? expoSec.items.map((it: any) => ({
                  title: it.title || "",
                  description: it.description || "",
                  desc: it.description || "",
                  image: it.image || "",
                  href: it.href || "/exhibition-categories",
                  link: it.href || "/exhibition-categories",
                  exploreText: it.exploreText || "Explore",
                }))
              : [];

            await api.put("/website/home/expo-categories", {
              enabled: expoSec.enabled !== false,
              sectionTag: expoSec.sectionTag,
              titleMain: expoSec.titleMain,
              titleHighlight: expoSec.titleHighlight,
              descriptionPrefix: expoSec.descriptionPrefix,
              description: expoSec.description,
              exploreText: expoSec.exploreText,
              buttonText: expoSec.buttonText,
              buttonHref: expoSec.buttonHref,
              buttonLink: expoSec.buttonHref,
              items: cleanItems,
              categories: cleanItems,
            });
          } catch (err) {
            console.error("Failed to sync expo categories to backend:", err);
          }
        }

        const beyondSec = sectionsDraft.find((s) => s.key === "beyond-exhibition");
        if (beyondSec) {
          try {
            const cleanItems = Array.isArray(beyondSec.items)
              ? beyondSec.items.map((it: any) => ({
                  title: it.title || "",
                  description: it.description || it.subtitle || "",
                  subtitle: it.description || it.subtitle || "",
                  icon: it.icon || "Users",
                }))
              : [];

            await api.put("/website/home/beyond-exhibition", {
              enabled: beyondSec.enabled !== false,
              sectionTag: beyondSec.sectionTag,
              titleMain: beyondSec.titleMain,
              titleHighlight: beyondSec.titleHighlight,
              description: beyondSec.description,
              image: beyondSec.image,
              imageAlt: beyondSec.imageAlt,
              items: cleanItems,
              extras: cleanItems,
            });
          } catch (err) {
            console.error("Failed to sync beyond exhibition to backend:", err);
          }
        }

        const attendSec = sectionsDraft.find((s) => s.key === "sponsors-attend");
        if (attendSec) {
          try {
            await api.put("/website/home/sponsors-attend", {
              enabled: attendSec.enabled !== false,
              titlePrefix: attendSec.titlePrefix,
              titleHighlight: attendSec.titleHighlight,
              description: attendSec.description,
              image: attendSec.image,
              imageAlt: attendSec.imageAlt,
              buttonLabel: attendSec.buttonLabel,
              buttonHref: attendSec.buttonHref,

              feature1Title: attendSec.feature1Title,
              feature1Desc: attendSec.feature1Desc,
              feature2Title: attendSec.feature2Title,
              feature2Desc: attendSec.feature2Desc,
              feature3Title: attendSec.feature3Title,
              feature3Desc: attendSec.feature3Desc,
              feature4Title: attendSec.feature4Title,
              feature4Desc: attendSec.feature4Desc,
              feature5Title: attendSec.feature5Title,
              feature5Desc: attendSec.feature5Desc,
              feature6Title: attendSec.feature6Title,
              feature6Desc: attendSec.feature6Desc,

              keyPoint1: attendSec.keyPoint1,
              keyPoint2: attendSec.keyPoint2,
              keyPoint3: attendSec.keyPoint3,
              keyPoint4: attendSec.keyPoint4,
              keyPoint5: attendSec.keyPoint5,
              keyPoint6: attendSec.keyPoint6,
              keyPoint7: attendSec.keyPoint7,
              keyPoint8: attendSec.keyPoint8,
              keyPoint9: attendSec.keyPoint9,
              keyPoint10: attendSec.keyPoint10,
            });
          } catch (err) {
            console.error("Failed to sync sponsors and attend to backend:", err);
          }
        }
      }

      const current = settings[page.configKey] ?? {};
      const updated = await settingsApi.update({
        [page.configKey]: {
          ...current,
          sections: sectionsDraft.length ? sectionsDraft : current.sections,
          seo: {
            ...current.seo,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
            metaKeywords: form.metaKeywords,
            canonicalUrl: form.canonicalUrl || form.canonicalTag,
            canonicalTag: form.canonicalTag || form.canonicalUrl,
            openGraphTags: form.openGraphTags,
            ogTitle: form.ogTitle,
            ogDescription: form.ogDescription,
            ogImage: form.ogImage,
            h1Tag: form.h1Tag,
            breadcrumbName: form.breadcrumbName,
            schemaMarkup: form.schemaMarkup,
            robotsIndex: form.robotsIndex,
            robotsFollow: form.robotsFollow,
          },
        },
      } as any);

      // Sync SEO data directly to backend database
      const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
      const isLocalHost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const defaultSite = isLocalHost ? "http://localhost:3002" : "https://bharatorganicexpo.com";
      const pPath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
      const defTag = `<link rel="canonical" href="${defaultSite}${pPath}" />`;

      const editorText = canonicalEditorRef.current?.innerText?.trim();
      const finalCanonicalTag = (editorText || form.canonicalTag || form.canonicalUrl || defTag).trim();
      const match = finalCanonicalTag.match(/href=["']([^"']+)["']/i);
      const finalCanonicalUrl = match ? match[1] : finalCanonicalTag.replace(/<[^>]*>/g, "").trim() || `${defaultSite}${pPath}`;

      try {
        await api.put(`/seo/${pageKey}`, {
          page: pageKey,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          metaKeywords: form.metaKeywords,
          canonicalUrl: finalCanonicalUrl,
          canonicalTag: finalCanonicalTag,
          openGraphTags: form.openGraphTags,
          schemaMarkup: form.schemaMarkup,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          ogImage: form.ogImage,
          robotsIndex: form.robotsIndex,
          robotsFollow: form.robotsFollow,
          isActive: form.isActive,
          updatedBy: "Admin User",
        });
      } catch (seoErr) {
        console.error("Failed to sync SEO to backend:", seoErr);
      }

      const raw = updated as unknown as Record<string, any>;
      setSettings(raw);
      setPages(cmsPagesFromSettings(raw));
      Swal.fire({
        title: "Page Updated",
        text: "Your changes have been saved successfully.",
        icon: "success",
        confirmButtonColor: "#218DAE",
        timer: 2000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-[20px]
            flex
            shrink-0
            items-start
            justify-between
            border-b-[2px]
            border-[#293681]
            pb-[8px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-[11px]
            "
          >
            <div
              className="
                mt-[1px]
                grid
                h-[28px]
                w-[28px]
                place-items-center
                rounded-full
                bg-[#e8f4e9]
                text-[#23714a]
              "
            >
              <Edit3
                className="h-[14px] w-[14px]"
                strokeWidth={1.65}
              />
            </div>

            <div>
              <h1
                className="
                  mt-[2px]
                  text-[19px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.018em]
                  text-[#18233b]
                "
              >
                Edit Page
              </h1>

            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-[10px]
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/pages",
                )
              }
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-red-200
                bg-red-50
                px-[12px]
                text-[8.5px]
                font-semibold
                text-red-600
              "
            >
              <ArrowLeft className="h-[13px] w-[13px]" />

              Back to Pages
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/pages/${getCmsPageRouteKey(page)}`,
                )
              }
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-orange-200
                bg-orange-50
                px-[12px]
                text-[8.5px]
                font-semibold
                text-orange-600
              "
            >
              <Eye className="h-[13px] w-[13px]" />

              Preview Page
            </button>

            <button
              type="button"
              onClick={resetToWebsiteDefaults}
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-[#0f766e]
                bg-[#f0fdf4]
                px-[12px]
                text-[8.5px]
                font-semibold
                text-[#0f766e]
                hover:bg-[#dcfce7]
              "
            >
              <Sparkles className="h-[13px] w-[13px]" />

              Sync / Reset Website Data
            </button>

            <button
              type="button"
              onClick={savePage}
              disabled={saving}
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                bg-[#218DAE]
                px-[12px]
                text-[8.5px]
                font-semibold
                text-white
                shadow-sm
              "
            >
              <Save className="h-[13px] w-[13px]" />

              {saving ? "Updating..." : "Update Page"}
            </button>

            <button
              type="button"
              className="
                grid
                h-[30px]
                w-[30px]
                place-items-center
                rounded-[4px]
                border
                border-[#dedfdb]
                bg-white
                text-[#445065]
              "
            >
              <MoreVertical className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <div
          className="
            grid
            items-start
            grid-cols-[minmax(0,2.35fr)_minmax(330px,1fr)]
            gap-[10px]
          "
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section
              className="
                shrink-0
                border
                border-[#dedfdb]
                shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                bg-white
                px-[16px]
                py-[11px]
              "
            >
              <SectionTitle
                number={1}
                title="Basic Information"
              />

              <div
                className="
                  mt-[9px]
                  grid
                  grid-cols-[1.12fr_1fr_.63fr]
                  gap-x-[20px]
                  gap-y-[7px]
                "
              >
                <div>
                  <FieldLabel required>
                    Page Title
                  </FieldLabel>

                  <TextInput
                    value={
                      form.pageTitle
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "pageTitle",
                        value,
                      )
                    }
                  />

                  <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
                    {
                      form
                        .pageTitle
                        .length
                    }{" "}
                    / 100
                  </p>
                </div>

                <div>
                  <FieldLabel required>
                    URL Slug
                  </FieldLabel>

                  <div
                    className="
                      flex
                      h-[35px]
                      overflow-hidden
                      rounded-none
                      shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                      bg-white
                    "
                  >
                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        border-r
                        border-[#e5e6e2]
                        bg-[#fafaf8]
                        px-[9px]
                        text-[9.5px]
                        font-medium
                        text-[#5f6a7c]
                      "
                    >
                      {PUBLIC_SITE_URL}/
                    </div>

                    <input
                      value={
                        form.slug
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "slug",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="enter-page-slug"
                      className="
                        min-w-0
                        flex-1
                        cursor-default
                        px-[9px]
                        text-[10.5px]
                        font-medium
                        text-[#414b5e]
                        outline-none
                        placeholder:text-[#9aa0aa]
                      "
                    />
                  </div>

                  <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
                    {
                      form.slug
                        .length
                    }{" "}
                    / 80
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Select Template
                  </FieldLabel>

                  <SelectField
                    value={
                      form.template
                    }
                    onChange={(
                      value,
                    ) => {
                      updateField("template", value);
                      if (value === "Nominate Advisory Board Member" || value === "Nominate Advisory Board") {
                        setSectionsDraft(defaultNominateAdvisorySections.map((s) => ({ ...s })));
                      } else if (value === "Support Services Helpdesk") {
                        setSectionsDraft(defaultSupportServicesSections.map((s) => ({ ...s })));
                      } else if (value === "PMS Eligibility Check Calculator") {
                        setSectionsDraft(defaultMsmeEligibilityCheckSections.map((s) => ({ ...s })));
                      } else if (value === "Apply for PMS Support Stepper") {
                        setSectionsDraft(defaultMsmeApplySections.map((s) => ({ ...s })));
                      } else if (value === "Awards Nomination Form") {
                        setSectionsDraft(defaultAwardsNominationSections.map((s) => ({ ...s })));
                      } else if (value === "About Expo" || value === "About Page" || value === "About Us") {
                        setSectionsDraft(defaultAboutSections.map((s) => ({ ...s })));
                      } else if (value === "Advisory Board Members" || value === "Advisory Board") {
                        setSectionsDraft(defaultAdvisorySections.map((s) => ({ ...s })));
                      } else if (value === "Blogs & News") {
                        setSectionsDraft(defaultBlogSections.map((s) => ({ ...s })));
                      } else if (value === "Participate as Exhibitor") {
                        setSectionsDraft(defaultParticipateAsExhibitorSections.map((s) => ({ ...s })));
                      } else if (value === "Exhibition Categories") {
                        setSectionsDraft(defaultExhibitionCategoriesSections.map((s) => ({ ...s })));
                      } else if (value === "BOOK A STALL" || value === "Book a Stall" || value === "Book a Stand") {
                        setSectionsDraft(defaultBookAStandSections.map((s) => ({ ...s })));
                      } else if (value === "REGISTER AS VISITOR" || value === "Register as Visitor" || value === "Visitor Registration") {
                        setSectionsDraft(defaultVisitorRegistrationSections.map((s) => ({ ...s })));
                      } else if (value === "DELEGATE REGISTRATION" || value === "Delegate Registration") {
                        setSectionsDraft(defaultDelegateRegistrationSections.map((s) => ({ ...s })));
                      } else if (value === "REGISTER AS BUYER" || value === "Register as Buyer" || value === "Buyer Registration") {
                        setSectionsDraft(defaultBuyerRegistrationSections.map((s) => ({ ...s })));
                      } else if (value === "Terms & Conditions") {
                        setSectionsDraft(defaultTermsAndConditionsSections.map((s) => ({ ...s })));
                      } else if (value === "Privacy Policy") {
                        setSectionsDraft(defaultPrivacyPolicySections.map((s) => ({ ...s })));
                      } else if (value === "Refund Policy") {
                        setSectionsDraft(defaultRefundPolicySections.map((s) => ({ ...s })));
                      } else if (value.includes("Why Visit")) {
                        setSectionsDraft(defaultWhyVisitSections.map((s) => ({ ...s })));
                      } else if (value.includes("Why Exhibit")) {
                        setSectionsDraft(defaultWhyExhibitSections.map((s) => ({ ...s })));
                      } else if (value === "MSME PMS Scheme") {
                        setSectionsDraft(defaultMsmeSections.map((s) => ({ ...s })));
                      } else if (value.includes("Exhibitor")) {
                        setSectionsDraft(defaultExhibitorsSections.map((s) => ({ ...s })));
                      } else if (value === "Buyer-Seller Meet") {
                        setSectionsDraft(defaultBuyerSellerMeetSections.map((s) => ({ ...s })));
                      } else if (value === "Glimpses & Gallery" || value === "Gallery") {
                        setSectionsDraft(defaultGallerySections.map((s) => ({ ...s })));
                      } else if (value.includes("Awards")) {
                        setSectionsDraft(defaultAwardsSections.map((s) => ({ ...s })));
                      } else if (value.includes("SPONSORSHIP") || value.includes("Sponsorship")) {
                        setSectionsDraft(defaultSponsorshipSections.map((s) => ({ ...s })));
                      } else if (value.includes("E-Promotion")) {
                        setSectionsDraft(defaultEPromotionSections.map((s) => ({ ...s })));
                      } else if (value === "Partnership / Collaboration" || value === "Partnership") {
                        setSectionsDraft(defaultPartnershipPageSections.map((s) => ({ ...s })));
                      } else if (value.includes("Contact") || value.includes("EXPO ADVISOR")) {
                        setSectionsDraft(defaultContactSections.map((s) => ({ ...s })));
                      } else if (value === "Homepage" || value === "Landing Page" || value === "Home") {
                        setSectionsDraft(defaultLandingSections.map((s) => ({ ...s })));
                      }
                    }}
                    options={[
                      "Homepage",
                      "About Expo",
                      "Advisory Board Members",
                      "Nominate Advisory Board Member",
                      "Support Services Helpdesk",
                      "Blogs & News",
                      "Participate as Exhibitor",
                      "Exhibition Categories",
                      "BOOK A STALL",
                      "REGISTER AS VISITOR",
                      "DELEGATE REGISTRATION",
                      "REGISTER AS BUYER",
                      "SPONSORSHIP OPPORTUNITIES",
                      "TALK TO EXPO ADVISOR",
                      "Terms & Conditions",
                      "Privacy Policy",
                      "Refund Policy",
                      "Why Visit ORGANIC EXPO",
                      "Why Exhibit at ORGANIC EXPO?",
                      "MSME PMS Scheme",
                      "PMS Eligibility Check Calculator",
                      "Apply for PMS Support Stepper",
                      "Exhibitor List",
                      "Buyer-Seller Meet",
                      "Glimpses & Gallery",
                      "Excellence Awards",
                      "Awards Nomination Form",
                      "E-Promotion Opportunity",
                      "Partnership / Collaboration",
                      "Our Services",
                      "Contact Us",
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel>
                    Page Parent
                  </FieldLabel>

                  <SelectField
                    value={
                      form.parent
                    }
                    onChange={(
                      value,
                    ) => {
                      updateField("parent", value);
                      if (value === "Nominate Advisory Board Member" || value.includes("Nominate")) {
                        setSectionsDraft(defaultNominateAdvisorySections.map((s) => ({ ...s })));
                      } else if (value === "Support Services Helpdesk" || value.includes("Support")) {
                        setSectionsDraft(defaultSupportServicesSections.map((s) => ({ ...s })));
                      } else if (value === "PMS Eligibility Check Calculator" || value.includes("Eligibility")) {
                        setSectionsDraft(defaultMsmeEligibilityCheckSections.map((s) => ({ ...s })));
                      } else if (value === "Apply for PMS Support Stepper" || value.includes("Apply")) {
                        setSectionsDraft(defaultMsmeApplySections.map((s) => ({ ...s })));
                      } else if (value === "Awards Nomination Form" || value.includes("Awards Nomination")) {
                        setSectionsDraft(defaultAwardsNominationSections.map((s) => ({ ...s })));
                      } else if (value.includes("About")) {
                        setSectionsDraft(defaultAboutSections.map((s) => ({ ...s })));
                      } else if (value.includes("Advisory")) {
                        setSectionsDraft(defaultAdvisorySections.map((s) => ({ ...s })));
                      } else if (value.includes("Blog")) {
                        setSectionsDraft(defaultBlogSections.map((s) => ({ ...s })));
                      } else if (value.includes("Participate as Exhibitor")) {
                        setSectionsDraft(defaultParticipateAsExhibitorSections.map((s) => ({ ...s })));
                      } else if (value.includes("Categories")) {
                        setSectionsDraft(defaultExhibitionCategoriesSections.map((s) => ({ ...s })));
                      } else if (value.includes("BOOK A STALL") || value.includes("Book")) {
                        setSectionsDraft(defaultBookAStandSections.map((s) => ({ ...s })));
                      } else if (value.includes("VISITOR") || value.includes("Visitor")) {
                        setSectionsDraft(defaultVisitorRegistrationSections.map((s) => ({ ...s })));
                      } else if (value.includes("DELEGATE") || value.includes("Delegate")) {
                        setSectionsDraft(defaultDelegateRegistrationSections.map((s) => ({ ...s })));
                      } else if (value.includes("BUYER") || value.includes("Buyer Reg")) {
                        setSectionsDraft(defaultBuyerRegistrationSections.map((s) => ({ ...s })));
                      } else if (value.includes("Terms")) {
                        setSectionsDraft(defaultTermsAndConditionsSections.map((s) => ({ ...s })));
                      } else if (value.includes("Privacy")) {
                        setSectionsDraft(defaultPrivacyPolicySections.map((s) => ({ ...s })));
                      } else if (value.includes("Refund")) {
                        setSectionsDraft(defaultRefundPolicySections.map((s) => ({ ...s })));
                      } else if (value.includes("Why Visit")) {
                        setSectionsDraft(defaultWhyVisitSections.map((s) => ({ ...s })));
                      } else if (value.includes("Why Exhibit")) {
                        setSectionsDraft(defaultWhyExhibitSections.map((s) => ({ ...s })));
                      } else if (value.includes("MSME PMS")) {
                        setSectionsDraft(defaultMsmeSections.map((s) => ({ ...s })));
                      } else if (value.includes("Exhibitor")) {
                        setSectionsDraft(defaultExhibitorsSections.map((s) => ({ ...s })));
                      } else if (value.includes("Buyer-Seller")) {
                        setSectionsDraft(defaultBuyerSellerMeetSections.map((s) => ({ ...s })));
                      } else if (value.includes("Glimpses") || value.includes("Gallery")) {
                        setSectionsDraft(defaultGallerySections.map((s) => ({ ...s })));
                      } else if (value.includes("Awards")) {
                        setSectionsDraft(defaultAwardsSections.map((s) => ({ ...s })));
                      } else if (value.includes("SPONSORSHIP") || value.includes("Sponsorship")) {
                        setSectionsDraft(defaultSponsorshipSections.map((s) => ({ ...s })));
                      } else if (value.includes("E-Promotion")) {
                        setSectionsDraft(defaultEPromotionSections.map((s) => ({ ...s })));
                      } else if (value.includes("Partnership")) {
                        setSectionsDraft(defaultPartnershipPageSections.map((s) => ({ ...s })));
                      } else if (value.includes("Services")) {
                        setSectionsDraft(defaultSupportServicesSections.map((s) => ({ ...s })));
                      } else if (value.includes("Contact") || value.includes("EXPO ADVISOR")) {
                        setSectionsDraft(defaultContactSections.map((s) => ({ ...s })));
                      } else if (value.includes("Home") || value.includes("Landing")) {
                        setSectionsDraft(defaultLandingSections.map((s) => ({ ...s })));
                      }
                    }}
                    options={[
                      "— No Parent (Top Level) —",
                      "Home",
                      "About Expo",
                      "Advisory Board Members",
                      "Blogs & News",
                      "Why Visit ORGANIC EXPO",
                      "Why Exhibit at ORGANIC EXPO?",
                      "MSME PMS Scheme",
                      "Exhibitor List",
                      "Buyer-Seller Meet",
                      "Glimpses & Gallery",
                      "Our Services",
                      "Contact Us",
                      "BOOK A STALL",
                      "REGISTER AS VISITOR",
                      "DELEGATE REGISTRATION",
                      "REGISTER AS BUYER",
                      "SPONSORSHIP OPPORTUNITIES",
                      "Nominate Advisory Board Member",
                      "Support Services Helpdesk",
                      "PMS Eligibility Check Calculator",
                      "Apply for PMS Support Stepper",
                      "Awards Nomination Form",
                      ...pages.map((p) => p.title).filter((t) => !["Home", "About Expo", "Advisory Board Members", "Blogs & News", "Why Visit ORGANIC EXPO", "Why Exhibit at ORGANIC EXPO?", "MSME PMS Scheme", "Exhibitor List", "Buyer-Seller Meet", "Glimpses & Gallery", "Our Services", "Contact Us", "BOOK A STALL", "REGISTER AS VISITOR", "DELEGATE REGISTRATION", "REGISTER AS BUYER", "SPONSORSHIP OPPORTUNITIES", "Nominate Advisory Board Member", "Support Services Helpdesk", "PMS Eligibility Check Calculator", "Apply for PMS Support Stepper", "Awards Nomination Form"].includes(t)),
                    ]}
                  />

                  <p className="mt-[2px] text-[9px] font-medium leading-[11px] text-red-500">
                    Choose parent page
                    (if any)
                  </p>
                </div>

              </div>
            </section>

            {/* =================================================
                PAGE SECTIONS
            ================================================= */}

            <section
              className="
                flex
                shrink-0
                flex-col
                shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                bg-white
                px-[16px]
                py-[9px]
              "
            >
              <div
                className="
                  flex
                  shrink-0
                  items-start
                  justify-between
                "
              >
                <SectionTitle
                  number={2}
                  title="Page Sections"
                />

                <span className="text-[9.5px] font-semibold text-[#4B1426]">
                  {sectionsDraft.length} sections
                </span>
              </div>

              {/* EXPAND / COLLAPSE GLOBAL ACTIONS */}
              <div className="mt-[10px] flex items-center justify-between border-b border-[#f1f5f9] pb-[8px] mb-[12px]">
                <span className="text-[10.5px] font-bold text-[#1e293b]">
                  Page Landing Sections ({sectionsDraft.length})
                </span>
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    onClick={() => setOpenSectionIndices(new Set(sectionsDraft.map((_, i) => i)))}
                    className="text-[9.5px] font-semibold text-[#4B1426] hover:underline"
                  >
                    Expand All
                  </button>
                  <span className="text-[#cbd5e1]">|</span>
                  <button
                    type="button"
                    onClick={() => setOpenSectionIndices(new Set())}
                    className="text-[9.5px] font-semibold text-[#64748b] hover:underline"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* INDIVIDUAL COLLAPSIBLE SECTION CARDS */}
              <div className="flex flex-col gap-[10px]">
                {sectionsDraft.map((section, sectionIndex) => {
                  const isOpen = openSectionIndices.has(sectionIndex);

                  return (
                    <div
                      key={section._id ?? section.key ?? sectionIndex}
                      className={`rounded-[6px] border transition ${isOpen ? "border-[#4B1426] bg-[#fbfbfa]" : "border-[#cbd5e1] bg-white hover:border-[#94a3b8]"
                        }`}
                    >
                      {/* SECTION CARD HEADER */}
                      <div
                        onClick={() => toggleSectionAccordion(sectionIndex)}
                        className={`flex cursor-pointer items-center justify-between px-[14px] py-[10px] transition ${isOpen ? "bg-[#fdf2f4] border-b border-[#f5d0d6]" : "bg-[#f8fafc]"
                          }`}
                      >
                        <div className="flex items-center gap-[8px]">
                          <ChevronRight
                            className={`h-4 w-4 text-[#4B1426] transition-transform ${isOpen ? "rotate-90 text-[#3b0f1e]" : ""
                              }`}
                          />
                          <span className="font-mono text-[10px] font-bold text-[#64748b]">
                            {sectionIndex + 1}.
                          </span>
                          <span className="text-[12px] font-bold text-[#4B1426]">
                            {section.name ?? section.key}
                          </span>
                          {section.enabled === false && (
                            <span className="rounded-[4px] bg-rose-50 border border-rose-200 px-[6px] py-[1px] text-[8px] font-bold text-rose-600">
                              Disabled
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-[10px]" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-[6px]">
                            <span
                              className={`text-[9.5px] font-bold ${section.enabled !== false ? "text-[#16a34a]" : "text-[#dc2626]"
                                }`}
                            >
                              {section.enabled !== false ? "Enabled" : "Disabled"}
                            </span>
                            <Toggle
                              checked={section.enabled !== false}
                              onChange={(value) => updateSectionField(sectionIndex, "enabled", value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION BODY (ONLY RENDERED WHEN OPEN) */}
                      {isOpen && (
                        <div className="flex flex-col gap-[12px] p-[14px] bg-[#fbfbfa]">
                          <SectionFieldsEditor
                            section={section}
                            onFieldChange={(key, value) => updateSectionField(sectionIndex, key, value)}
                          />

                          {Array.isArray(section.slides) && (
                            <div className="flex flex-col gap-[8px]">
                              <SectionItemsEditor
                                items={section.slides}
                                onChangeItem={(itemIndex, key, value) => {
                                  setSectionsDraft((previous) =>
                                    previous.map((sec, i) => {
                                      if (i !== sectionIndex) return sec;
                                      const slides = [...(sec.slides ?? [])];
                                      slides[itemIndex] = { ...slides[itemIndex], [key]: value };
                                      return { ...sec, slides };
                                    }),
                                  );
                                }}
                                onAddItem={() => {
                                  setSectionsDraft((previous) =>
                                    previous.map((sec, i) => {
                                      if (i !== sectionIndex) return sec;
                                      const slides = [...(sec.slides ?? [])];
                                      const blank = {
                                        title: "NEW HERO SLIDE",
                                        description: "Enter slide description...",
                                        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
                                        alt: "Hero Banner Slide",
                                        buttonLabel: "Book Your Stall",
                                        buttonHref: "/registration/book-a-stand",
                                        secondaryButtonLabel: "Register as Visitor",
                                        secondaryButtonHref: "/registration/visitor-registration",
                                      };
                                      return { ...sec, slides: [...slides, blank] };
                                    }),
                                  );
                                }}
                                onRemoveItem={(itemIndex) => {
                                  setSectionsDraft((previous) =>
                                    previous.map((sec, i) => {
                                      if (i !== sectionIndex) return sec;
                                      const slides = (sec.slides ?? []).filter((_: unknown, idx: number) => idx !== itemIndex);
                                      return { ...sec, slides };
                                    }),
                                  );
                                }}
                                sectionId={section.key}
                              />
                            </div>
                          )}

                          {Array.isArray(section.items) && section.key !== "hero" && section.key !== "introduction-section" && section.key !== "why-participate" && section.key !== "conference-section" && section.key !== "sponsors-attend" && (
                            <SectionItemsEditor
                              items={section.items}
                              onChangeItem={(itemIndex, key, value) => updateSectionItem(sectionIndex, itemIndex, key, value)}
                              onAddItem={() => addSectionItem(sectionIndex)}
                              onRemoveItem={(itemIndex) => removeSectionItem(sectionIndex, itemIndex)}
                              sectionId={section.key}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                SEO SETTINGS (MATCHING AddSeo UI & EDITORS)
            ================================================= */}

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
                    onClick={() => autoGenerateSeo("local")}
                    className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Auto-generate tags for Local environment (http://localhost:3002)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Auto Generate (Local)
                  </button>
                  <button
                    type="button"
                    onClick={() => autoGenerateSeo("live")}
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
                      onInput={handleCanonicalInput}
                      onPaste={handleCanonicalPaste}
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
                      onChange={handleOgImageUpload}
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
                          onClick={removeOgImage}
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

            {/* =================================================
                PAGE SETTINGS
            ================================================= */}

            <section
              className="
                shrink-0
                border
                border-[#dedfdb]
                shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                bg-white
                px-[16px]
                py-[10px]
              "
            >
              <SectionTitle
                number={4}
                title="Page Settings"
              />

              <div
                className="
                  mt-[9px]
                  grid
                  grid-cols-[.82fr_.82fr_1.4fr]
                  gap-x-[24px]
                "
              >
                <div>
                  <FieldLabel>
                    Page Status
                  </FieldLabel>

                  <SelectField
                    value={
                      form.status
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "status",
                        value as Status,
                      )
                    }
                    options={[
                      "Published",
                      "Draft",
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel required>
                    Author
                  </FieldLabel>

                  <SelectField
                    value={
                      form.author
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
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

                {/* FEATURED IMAGE */}

                <div className="row-span-2">
                  <FieldLabel>
                    Featured Image
                  </FieldLabel>

                  <div
                    className="
                      flex
                      h-[76px]
                      items-center
                      gap-[11px]
                      rounded-[6px]
                      border
                      border-[#dedfdb]
                      bg-white
                      p-[7px]
                    "
                  >
                    <div
                      className="
                        flex
                        h-[60px]
                        w-[120px]
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[5px]
                        bg-[#faf8f3]
                      "
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}

                      <img
                        src={
                          FEATURED_IMAGE
                        }
                        alt="Featured"
                        className="
                          h-full
                          w-full
                          object-contain
                          object-center
                        "
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-[#3f4c60]">
                        featured-home.jpg
                      </p>

                      <p className="mt-[1px] text-[8.5px] font-medium text-[#808894]">
                        1200x630px
                      </p>

                      <div className="mt-[5px] flex items-center gap-[10px]">
                        <button
                          type="button"
                          className="text-[8.5px] font-semibold text-[#2d8653]"
                        >
                          Change Image
                        </button>

                        <button
                          type="button"
                          className="text-[8.5px] font-semibold text-[#d25a52]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[9px]">
                  <FieldLabel>
                    Show in Navigation Menu
                  </FieldLabel>

                  <div className="flex items-start gap-[9px]">
                    <Toggle
                      checked={
                        form.showInNavigation
                      }
                      onChange={(
                        value,
                      ) =>
                        updateField(
                          "showInNavigation",
                          value,
                        )
                      }
                    />

                    <span className="max-w-[155px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
                      Show this page in
                      main navigation
                      menu
                    </span>
                  </div>
                </div>

                <div className="mt-[9px]">
                  <FieldLabel>
                    Menu Order
                  </FieldLabel>

                  <TextInput
                    value={
                      form.menuOrder
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "menuOrder",
                        value,
                      )
                    }
                  />

                  <p className="mt-[2px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
                    Set display order in
                    navigation menu.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            {/* =================================================
                PUBLISH
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-none
                border
                border-[#e7e7e3]
                bg-white
                overflow-hidden
              "
            >
              <div className="flex items-center justify-between bg-slate-50 border-b border-[#e7e7e3] px-[16px] py-[9px]">
                <h2 className="text-[14px] font-bold text-[#263148]">
                  Publish
                </h2>

                <ChevronDown className="h-[13px] w-[13px] rotate-180 text-[#596579]" />
              </div>

              <div className="px-[16px] pt-[11px] pb-[16px] space-y-[6px]">
                <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Status
                  </p>

                  <select
                    value={form.status}
                    onChange={(e) => {
                      const value = e.target.value as Status;
                      updateField("status", value);
                      Swal.fire({
                        title: "Status Updated",
                        text: `Page status changed to ${value}`,
                        icon: "success",
                        confirmButtonColor: "#218DAE",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.status === "Published"
                      ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                      : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                      }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Visibility
                  </p>

                  <select
                    value={form.visibility}
                    onChange={(e) => {
                      const value = e.target.value as Visibility;
                      updateField("visibility", value);
                      Swal.fire({
                        title: "Visibility Updated",
                        text: `Page visibility changed to ${value}`,
                        icon: "success",
                        confirmButtonColor: "#218DAE",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.visibility === "Public"
                      ? "bg-[#e3f2fd] text-[#1565c0] border border-[#90caf9]"
                      : "bg-[#f3e5f5] text-[#7b1fa2] border border-[#ce93d8]"
                      }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Published On
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#293681]">
                      <CalendarDays className="h-[12px] w-[12px]" />

                      20 May 2026,
                      10:30 AM
                    </span>

                    <button
                      type="button"
                      className="text-[9.5px] font-semibold text-[#278650]"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Last Updated
                  </p>

                  <span className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#4b1426]">
                    <Clock3 className="h-[12px] w-[12px]" />

                    20 May 2026,
                    10:45 AM
                  </span>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Updated By
                  </p>

                  <span className="flex items-center gap-[7px] text-[10px] font-medium text-orange-500">
                    <UserRound className="h-[12px] w-[12px]" />

                    Admin User
                  </span>
                </div>
              </div>

              <div
                className="
                  mx-[16px]
                  mb-[11px]
                  mt-[7px]
                  flex
                  h-[35px]
                  items-center
                  gap-[8px]
                  rounded-[5px]
                  bg-[#edf6ef]
                  px-[12px]
                  text-[9.5px]
                  font-semibold
                  text-[#32784e]
                "
              >
                <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border border-[#65a17b]">
                  <Check className="h-[9px] w-[9px]" />
                </span>

                This page is currently
                published.
              </div>
            </section>

            {/* =================================================
                SEO
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-none
                border
                border-[#e7e7e3]
                bg-white
                overflow-hidden
              "
            >
              <div className="flex items-center justify-between bg-slate-50 border-b border-[#e7e7e3] px-[16px] py-[9px]">
                <h2 className="text-[14px] font-bold text-[#263148]">
                  SEO Score
                </h2>

                <button
                  type="button"
                  className="flex items-center gap-[4px] text-[10px] font-bold text-[#293681] hover:underline"
                >
                  View Full SEO Analysis
                  <ChevronRight className="h-[10px] w-[10px]" />
                </button>
              </div>

              <div className="px-[16px] py-[11px]">
                <div
                  className="
                    grid
                    grid-cols-[132px_1fr]
                    items-center
                    gap-[11px]
                  "
                >
                  <div className="flex justify-center">
                    <SeoScoreCircle />
                  </div>

                  <div className="space-y-[1px] border-l border-[#eeeeea] pl-[14px]">
                    <SeoRow label="Meta Title" />
                    <SeoRow label="Meta Description" />
                    <SeoRow label="Headings" />
                    <SeoRow label="Content Quality" />
                    <SeoRow label="Internal Linking" />
                    <SeoRow label="Images (ALT Text)" />
                    <SeoRow label="Schema Markup" />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-none
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[10px]
              "
            >
              <h2 className="text-[14px] font-bold text-[#263148]">
                Quick Actions
              </h2>

              <div
                className="
                  mt-[8px]
                  grid
                  grid-cols-2
                  gap-[7px]
                "
              >
                <button
                  type="button"
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <Copy className="h-[13px] w-[13px]" />

                  Duplicate Page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigator
                      .clipboard
                      ?.writeText(
                        `${PUBLIC_SITE_URL}/${form.slug}`,
                      )
                  }
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <Link2 className="h-[13px] w-[13px]" />

                  Copy URL
                </button>

                <button
                  type="button"
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#efcfca]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#d44f48]
                  "
                >
                  <Trash2 className="h-[13px] w-[13px]" />

                  Move to Trash
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/pages/${getCmsPageRouteKey(page)}`,
                    )
                  }
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <ExternalLink className="h-[13px] w-[13px]" />

                  View Page
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
