"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createHomeHero, updateHomeHero, fetchHomeHeros } from "@/store/slices/home/homeHeroSlice";

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
  Underline,
  Upload,
  UserRound,
  Video,
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
import { defaultAdvisorySections } from "@/lib/advisoryContent";
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
import { defaultMsmeSections } from "@/lib/msmeContent";
import { defaultExhibitorsSections } from "@/lib/exhibitorsContent";
import { defaultBuyerSellerMeetSections } from "@/lib/buyerSellerMeetContent";
import { defaultGallerySections } from "@/lib/galleryContent";
import { defaultAwardsSections } from "@/lib/awardsContent";
import { defaultContactSections } from "@/lib/contactContent";
import { defaultSponsorshipSections, defaultEPromotionSections, defaultPartnershipPageSections } from "@/lib/opportunityContent";
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
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  h1Tag: string;
  breadcrumbName: string;
  schemaMarkup: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
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
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
      className="
        h-[35px]
        w-full
        cursor-default
        bg-white
        rounded-none
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
        px-[10px]
        text-[11px]
        font-medium
        text-[#414b5e]
        outline-none
        placeholder:text-[10.5px]
        placeholder:text-[#9aa0aa]
        focus:border-[#8fa98e]
      "
    />
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
        {options.map((option) => {
          const isString = typeof option === "string";
          const optValue = isString ? option : option.value;
          const optLabel = isString ? option : option.label;
          return (
            <option
              key={optValue}
              value={optValue}
            >
              {optLabel}
            </option>
          );
        })}
      </select>

      <ChevronDown
        className="
          pointer-events-none
          absolute
          right-[9px]
          top-1/2
          h-[11px]
          w-[11px]
          -translate-y-1/2
          text-[#697386]
        "
      />
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
        transition

        ${checked
          ? "bg-[#087540]"
          : "bg-[#cdd3cf]"
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
   TEXTAREA
========================================================= */

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  mono = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full cursor-default resize-none bg-white rounded-none shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)] px-[10px] py-[8px] text-[11px] font-medium text-[#414b5e] outline-none placeholder:text-[10.5px] placeholder:text-[#9aa0aa] focus:shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(143,169,142,1)] ${mono ? "font-mono text-[10px]" : ""}`}
    />
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
const IMAGE_KEY_PATTERN = /image|logo/i;

function humanizeKey(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

/* =========================================================
   IMAGE UPLOADER HELPER
========================================================= */

function ImageUploadField({
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
      const res = await uploadApi.file(file, "bharat-organic/content");
      if (res.url) {
        onChange(res.url);
      }
    } catch (err) {
      console.error("Failed to upload image", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <TextInput
          value={value}
          onChange={onChange}
          placeholder="https://... image URL"
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded border border-[#0f766e] bg-[#f0fdf4] px-1.5 py-1 text-[8.5px] font-bold text-[#0f766e] hover:bg-[#dcfce7] transition-colors">
          <Upload className="h-2.5 w-2.5" />
          {uploading ? "Uploading..." : "Upload"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      {value && typeof value === "string" && (
        <div className="relative mt-1 h-[54px] w-[90px] overflow-hidden rounded border border-[#e5e6e2] bg-[#f8fafc]">
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
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
    const entries = Object.entries(section).filter(
      ([key, value]) => !SECTION_SKIP_KEYS.has(key) && (typeof value === "string" || typeof value === "boolean"),
    );

    if (!entries.length) {
      return (
        <p className="text-[10px] font-medium text-[#8b929c]">
          This section has no editable text fields.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-x-[16px] gap-y-[10px]">
        {entries.map(([key, value]) => {
          const isLong = LONG_TEXT_KEY_PATTERN.test(key);
          const isImage = IMAGE_KEY_PATTERN.test(key);

          return (
            <div
              key={key}
              className={isLong || isImage || typeof value === "boolean" ? "col-span-2" : ""}
            >
              <FieldLabel>{humanizeKey(key)}</FieldLabel>

              {typeof value === "boolean" ? (
                <Toggle checked={value} onChange={(next) => onFieldChange(key, next)} />
              ) : isImage ? (
                <ImageUploadField
                  value={String(value)}
                  onChange={(next) => onFieldChange(key, next)}
                />
              ) : isLong ? (
                <Textarea value={String(value)} onChange={(next) => onFieldChange(key, next)} rows={2} />
              ) : (
                <TextInput value={String(value)} onChange={(next) => onFieldChange(key, next)} />
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

    const getSectionAddLabel = () => {
      if (sectionId === "hero") return "Add Hero Slide / Badge";
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
            <span className="text-[11px] font-bold text-[#0f766e]">
              {sectionId === "hero" ? "Key Statistics & Badges" :
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
            <span className="rounded-full bg-[#ccfbf1] px-[6px] py-[1px] text-[8.5px] font-bold text-[#0f766e]">
              {items.length} Total
            </span>
          </div>

          <button
            type="button"
            onClick={onAddItem}
            className="flex h-[24px] items-center gap-[4px] rounded-[4px] border border-[#98bca5] bg-white px-[8px] text-[9px] font-semibold text-[#34714c] hover:bg-[#f0fdf4]"
          >
            <Plus className="h-[10px] w-[10px]" />
            {getSectionAddLabel()}
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-[10px] font-medium text-[#8b929c]">No items added yet.</p>
        )}

        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 border border-[#f1f5f9] rounded-[6px] p-1 bg-[#fafafa]">
          {items.map((item, index) => {
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
            const itemToEdit = ("label" in item || "title" in item) && (!("icon" in item) || item.icon === "")
              ? { ...item, icon: defaultIcon }
              : item;

            const fieldEntries = Object.entries(itemToEdit).filter(
              ([key, value]) =>
                key !== "_id" &&
                (typeof value === "string" ||
                  typeof value === "number" ||
                  typeof value === "boolean" ||
                  (Array.isArray(value) && value.every((entry) => typeof entry === "string"))),
            );

            const isOpen = openIndex === index;

            return (
              <div
                key={item._id ?? index}
                className="bg-white border border-[#e2e8f0] rounded-[5px] overflow-hidden shadow-2xs transition"
              >
                <div
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex cursor-pointer items-center justify-between bg-[#f8fafc] px-[10px] py-[7px] border-b border-[#f1f5f9] hover:bg-[#f1f5f9] transition"
                >
                  <div className="flex items-center gap-[6px]">
                    <ChevronRight className={`h-3 w-3 text-[#64748b] transition-transform ${isOpen ? "rotate-90 text-[#0f766e]" : ""}`} />
                    <span className="text-[10px] font-bold text-[#0f766e]">
                      {getItemLabel(item, index)}
                      {item.value ? <span className="ml-[6px] font-semibold text-[#1e293b]">({item.value})</span> : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-[8px]" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="flex items-center gap-[3px] text-[9px] font-semibold text-[#dc2626] hover:underline"
                    >
                      <Trash2 className="h-[10px] w-[10px]" />
                      Remove
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="p-[10px] grid grid-cols-2 gap-[8px] bg-white">
                    {fieldEntries.map(([key, value]) => {
                      const isImageKey = IMAGE_KEY_PATTERN.test(key);

                      return (
                        <div key={key} className={isImageKey ? "col-span-2" : ""}>
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
                          ) : typeof value === "boolean" ? (
                            <Toggle checked={value} onChange={(next) => onChangeItem(index, key, next)} />
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
    } catch(err: any) {
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
          canonicalUrl: page.seo?.canonicalUrl ?? "",
          ogTitle: page.seo?.ogTitle ?? "",
          ogDescription: page.seo?.ogDescription ?? "",
          ogImage: page.seo?.ogImage ?? "",
          h1Tag: page.seo?.h1Tag ?? "",
          breadcrumbName: page.seo?.breadcrumbName ?? "",
          schemaMarkup: page.seo?.schemaMarkup ?? "",
          robotsIndex: page.seo?.robotsIndex ?? true,
          robotsFollow: page.seo?.robotsFollow ?? true,

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
        canonicalUrl: page.seo?.canonicalUrl ?? "",
        ogTitle: page.seo?.ogTitle ?? "",
        ogDescription: page.seo?.ogDescription ?? "",
        ogImage: page.seo?.ogImage ?? "",
        h1Tag: page.seo?.h1Tag ?? "",
        breadcrumbName: page.seo?.breadcrumbName ?? "",
        schemaMarkup: page.seo?.schemaMarkup ?? "",
        robotsIndex: page.seo?.robotsIndex ?? true,
        robotsFollow: page.seo?.robotsFollow ?? true,
        status: page.status,
        visibility: "Public",
        author: page.author,
        showInNavigation: true,
        menuOrder: page.type === "home" ? "1" : "4",
      });
    }, [page]);

    const [sectionsDraft, setSectionsDraft] = useState<Array<Record<string, any>>>([]);
    const [openSectionIndices, setOpenSectionIndices] = useState<Set<number>>(new Set([0]));

    useEffect(() => {
      const cfg = page.configKey && settings ? settings[page.configKey] : undefined;
      const key = (page.configKey || "").toLowerCase();
      const title = (page.title || "").toLowerCase();
      const slug = (page.slug || "").toLowerCase();

      const getFallbackForPage = () => {
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
        return {
          ...fallbackItem,
          ...savedItem,
          items: fallbackItem.items !== undefined ? (
            fallbackItem.items.map((item: Record<string, any>, idx: number) => ({
              ...item,
              ...(savedItem.items?.[idx] || {}),
            }))
          ) : undefined,
        };
      });
      setSectionsDraft(rawSections.map((section: Record<string, any>) => ({ ...section })));
      setOpenSectionIndices(new Set([0]));
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
      if (key === "aboutpage" || title.includes("about") || slug === "/about") defaults = defaultAboutSections;
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
              canonicalUrl: form.canonicalUrl,
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
                        if (value === "About Page" || value === "About Us") {
                          setSectionsDraft(defaultAboutSections.map((s) => ({ ...s })));
                        } else if (value === "Advisory Board") {
                          setSectionsDraft(defaultAdvisorySections.map((s) => ({ ...s })));
                        } else if (value === "Blogs & News") {
                          setSectionsDraft(defaultBlogSections.map((s) => ({ ...s })));
                        } else if (value === "Participate as Exhibitor") {
                          setSectionsDraft(defaultParticipateAsExhibitorSections.map((s) => ({ ...s })));
                        } else if (value === "Exhibition Categories") {
                          setSectionsDraft(defaultExhibitionCategoriesSections.map((s) => ({ ...s })));
                        } else if (value === "Book a Stall") {
                          setSectionsDraft(defaultBookAStandSections.map((s) => ({ ...s })));
                        } else if (value === "Register as Visitor" || value === "Visitor Registration") {
                          setSectionsDraft(defaultVisitorRegistrationSections.map((s) => ({ ...s })));
                        } else if (value === "Delegate Registration") {
                          setSectionsDraft(defaultDelegateRegistrationSections.map((s) => ({ ...s })));
                        } else if (value === "Register as Buyer" || value === "Buyer Registration") {
                          setSectionsDraft(defaultBuyerRegistrationSections.map((s) => ({ ...s })));
                        } else if (value === "Terms & Conditions") {
                          setSectionsDraft(defaultTermsAndConditionsSections.map((s) => ({ ...s })));
                        } else if (value === "Privacy Policy") {
                          setSectionsDraft(defaultPrivacyPolicySections.map((s) => ({ ...s })));
                        } else if (value === "Refund Policy") {
                          setSectionsDraft(defaultRefundPolicySections.map((s) => ({ ...s })));
                        } else if (value === "Why Visit") {
                          setSectionsDraft(defaultWhyVisitSections.map((s) => ({ ...s })));
                        } else if (value === "Why Exhibit") {
                          setSectionsDraft(defaultWhyExhibitSections.map((s) => ({ ...s })));
                        } else if (value === "MSME PMS Scheme") {
                          setSectionsDraft(defaultMsmeSections.map((s) => ({ ...s })));
                        } else if (value === "Exhibitors List") {
                          setSectionsDraft(defaultExhibitorsSections.map((s) => ({ ...s })));
                        } else if (value === "Buyer-Seller Meet") {
                          setSectionsDraft(defaultBuyerSellerMeetSections.map((s) => ({ ...s })));
                        } else if (value === "Glimpses & Gallery" || value === "Gallery") {
                          setSectionsDraft(defaultGallerySections.map((s) => ({ ...s })));
                        } else if (value === "Excellence Awards" || value === "Awards") {
                          setSectionsDraft(defaultAwardsSections.map((s) => ({ ...s })));
                        } else if (value === "Sponsorship Opportunities" || value === "Sponsorship") {
                          setSectionsDraft(defaultSponsorshipSections.map((s) => ({ ...s })));
                        } else if (value === "E-Promotion Web" || value === "E-Promotion") {
                          setSectionsDraft(defaultEPromotionSections.map((s) => ({ ...s })));
                        } else if (value === "Partnership / Collaboration" || value === "Partnership") {
                          setSectionsDraft(defaultPartnershipPageSections.map((s) => ({ ...s })));
                        } else if (value === "Contact Us" || value === "Contact") {
                          setSectionsDraft(defaultContactSections.map((s) => ({ ...s })));
                        } else if (value === "Homepage" || value === "Landing Page" || value === "Home") {
                          setSectionsDraft(defaultLandingSections.map((s) => ({ ...s })));
                        }
                      }}
                      options={[
                        "Homepage",
                        "About Page",
                        "Advisory Board",
                        "Blogs & News",
                        "Participate as Exhibitor",
                        "Exhibition Categories",
                        "Book a Stall",
                        "Register as Visitor",
                        "Delegate Registration",
                        "Register as Buyer",
                        "Sponsorship Opportunities",
                        "Talk to Expo Advisor",
                        "Terms & Conditions",
                        "Privacy Policy",
                        "Refund Policy",
                        "Why Visit",
                        "Why Exhibit",
                        "MSME PMS Scheme",
                        "Exhibitors List",
                        "Buyer-Seller Meet",
                        "Glimpses & Gallery",
                        "Excellence Awards",
                        "E-Promotion Web",
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
                        if (value === "About Us" || value === "About Page") {
                          setSectionsDraft(defaultAboutSections.map((s) => ({ ...s })));
                          updateField("template", "About Page");
                        } else if (value === "Advisory Board") {
                          setSectionsDraft(defaultAdvisorySections.map((s) => ({ ...s })));
                          updateField("template", "Advisory Board");
                        } else if (value === "Blogs & News") {
                          setSectionsDraft(defaultBlogSections.map((s) => ({ ...s })));
                          updateField("template", "Blogs & News");
                        } else if (value === "Why Visit") {
                          setSectionsDraft(defaultWhyVisitSections.map((s) => ({ ...s })));
                          updateField("template", "Why Visit");
                        } else if (value === "Why Exhibit") {
                          setSectionsDraft(defaultWhyExhibitSections.map((s) => ({ ...s })));
                          updateField("template", "Why Exhibit");
                        } else if (value === "MSME PMS Scheme") {
                          setSectionsDraft(defaultMsmeSections.map((s) => ({ ...s })));
                          updateField("template", "MSME PMS Scheme");
                        } else if (value === "Exhibitors List") {
                          setSectionsDraft(defaultExhibitorsSections.map((s) => ({ ...s })));
                          updateField("template", "Exhibitors List");
                        } else if (value === "Buyer-Seller Meet") {
                          setSectionsDraft(defaultBuyerSellerMeetSections.map((s) => ({ ...s })));
                          updateField("template", "Buyer-Seller Meet");
                        } else if (value === "Glimpses & Gallery") {
                          setSectionsDraft(defaultGallerySections.map((s) => ({ ...s })));
                          updateField("template", "Glimpses & Gallery");
                        } else if (value === "Participate as Exhibitor") {
                          setSectionsDraft(defaultParticipateAsExhibitorSections.map((s) => ({ ...s })));
                          updateField("template", "Participate as Exhibitor");
                        } else if (value === "Exhibition Categories") {
                          setSectionsDraft(defaultExhibitionCategoriesSections.map((s) => ({ ...s })));
                          updateField("template", "Exhibition Categories");
                        } else if (value === "Book a Stall") {
                          setSectionsDraft(defaultBookAStandSections.map((s) => ({ ...s })));
                          updateField("template", "Book a Stall");
                        } else if (value === "Register as Visitor" || value === "Visitor Registration") {
                          setSectionsDraft(defaultVisitorRegistrationSections.map((s) => ({ ...s })));
                          updateField("template", "Register as Visitor");
                        } else if (value === "Delegate Registration") {
                          setSectionsDraft(defaultDelegateRegistrationSections.map((s) => ({ ...s })));
                          updateField("template", "Delegate Registration");
                        } else if (value === "Register as Buyer" || value === "Buyer Registration") {
                          setSectionsDraft(defaultBuyerRegistrationSections.map((s) => ({ ...s })));
                          updateField("template", "Register as Buyer");
                        } else if (value === "Terms & Conditions") {
                          setSectionsDraft(defaultTermsAndConditionsSections.map((s) => ({ ...s })));
                          updateField("template", "Terms & Conditions");
                        } else if (value === "Privacy Policy") {
                          setSectionsDraft(defaultPrivacyPolicySections.map((s) => ({ ...s })));
                          updateField("template", "Privacy Policy");
                        } else if (value === "Refund Policy") {
                          setSectionsDraft(defaultRefundPolicySections.map((s) => ({ ...s })));
                          updateField("template", "Refund Policy");
                        } else if (value === "Excellence Awards" || value === "Awards") {
                          setSectionsDraft(defaultAwardsSections.map((s) => ({ ...s })));
                          updateField("template", "Excellence Awards");
                        } else if (value === "Sponsorship Opportunities" || value === "Sponsorship") {
                          setSectionsDraft(defaultSponsorshipSections.map((s) => ({ ...s })));
                          updateField("template", "Sponsorship Opportunities");
                        } else if (value === "E-Promotion Web" || value === "E-Promotion") {
                          setSectionsDraft(defaultEPromotionSections.map((s) => ({ ...s })));
                          updateField("template", "E-Promotion Web");
                        } else if (value === "Partnership / Collaboration" || value === "Partnership") {
                          setSectionsDraft(defaultPartnershipPageSections.map((s) => ({ ...s })));
                          updateField("template", "Partnership / Collaboration");
                        } else if (value === "Contact Us" || value === "Contact" || value === "Talk to Expo Advisor") {
                          setSectionsDraft(defaultContactSections.map((s) => ({ ...s })));
                          updateField("template", "Contact Us");
                        } else if (value === "Home") {
                          setSectionsDraft(defaultLandingSections.map((s) => ({ ...s })));
                          updateField("template", "Homepage");
                        }
                      }}
                      options={[
                        "— No Parent (Top Level) —",
                        "Home",
                        "About Us",
                        "Advisory Board",
                        "Blogs & News",
                        "Why Visit",
                        "Why Exhibit",
                        "MSME PMS Scheme",
                        "Exhibitors List",
                        "Buyer-Seller Meet",
                        "Glimpses & Gallery",
                        "Our Services",
                        "Contact Us",
                        ...pages.map((p) => p.title).filter((t) => !["Home", "About Us", "Advisory Board", "Blogs & News", "Why Visit", "Why Exhibit", "MSME PMS Scheme", "Exhibitors List", "Buyer-Seller Meet", "Glimpses & Gallery", "Our Services", "Contact Us"].includes(t)),
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
                      className="text-[9.5px] font-semibold text-[#0f766e] hover:underline"
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
                        className={`rounded-[6px] border transition ${isOpen ? "border-[#0d5c34] bg-[#fbfbfa]" : "border-[#cbd5e1] bg-white hover:border-[#94a3b8]"
                          }`}
                      >
                        {/* SECTION CARD HEADER */}
                        <div
                          onClick={() => toggleSectionAccordion(sectionIndex)}
                          className={`flex cursor-pointer items-center justify-between px-[14px] py-[10px] transition ${isOpen ? "bg-[#f0fdf4] border-b border-[#dcfce7]" : "bg-[#f8fafc]"
                            }`}
                        >
                          <div className="flex items-center gap-[8px]">
                            <ChevronRight
                              className={`h-4 w-4 text-[#0d5c34] transition-transform ${isOpen ? "rotate-90 text-[#166b40]" : ""
                                }`}
                            />
                            <span className="font-mono text-[10px] font-bold text-[#64748b]">
                              {sectionIndex + 1}.
                            </span>
                            <span className="text-[12px] font-bold text-[#1c5033]">
                              {section.name ?? section.key}
                            </span>
                            {section.enabled === false && (
                              <span className="rounded-[4px] bg-[#f1f5f9] px-[6px] py-[1px] text-[8px] font-bold text-[#94a3b8]">
                                Disabled
                              </span>
                            )}
                          </div>

                        <div className="flex items-center gap-[10px]" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-[6px]">
                            <span className="text-[9.5px] font-semibold text-[#697386]">Enabled</span>
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
                              <div className="flex flex-col gap-[8px] pt-[8px] border-t border-[#e8e9e5]">
                                <p className="text-[11px] font-bold text-[#1c5033]">
                                  Hero Carousel Slides ({section.slides.length})
                                </p>
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

                            {Array.isArray(section.items) && (
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
                SEO SETTINGS
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
                  number={3}
                  title="SEO Settings"
                />

                <div className="mt-[10px] grid grid-cols-2 gap-x-[20px] gap-y-[10px]">
                  <div className="col-span-2">
                    <FieldLabel>Meta Title</FieldLabel>
                    <TextInput
                      value={form.metaTitle}
                      onChange={(value) => updateField("metaTitle", value)}
                      placeholder="SEO title (recommended 50-60 characters)"
                    />
                  </div>

                  <div className="col-span-2">
                    <FieldLabel>Meta Description</FieldLabel>
                    <Textarea
                      value={form.metaDescription}
                      onChange={(value) => updateField("metaDescription", value)}
                      placeholder="Recommended 150-160 characters"
                      rows={3}
                    />
                  </div>

                  <div>
                    <FieldLabel>Meta Keywords</FieldLabel>
                    <TextInput
                      value={form.metaKeywords}
                      onChange={(value) => updateField("metaKeywords", value)}
                      placeholder="comma, separated, keywords"
                    />
                  </div>

                  <div>
                    <FieldLabel>Canonical URL</FieldLabel>
                    <TextInput
                      value={form.canonicalUrl}
                      onChange={(value) => updateField("canonicalUrl", value)}
                      placeholder={`${PUBLIC_SITE_URL}/${form.slug}`}
                    />
                  </div>

                  <div>
                    <FieldLabel>Open Graph Title</FieldLabel>
                    <TextInput
                      value={form.ogTitle}
                      onChange={(value) => updateField("ogTitle", value)}
                    />
                  </div>

                  <div>
                    <FieldLabel>H1 Tag</FieldLabel>
                    <TextInput
                      value={form.h1Tag}
                      onChange={(value) => updateField("h1Tag", value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <FieldLabel>Open Graph Description</FieldLabel>
                    <Textarea
                      value={form.ogDescription}
                      onChange={(value) => updateField("ogDescription", value)}
                      rows={2}
                    />
                  </div>

                  <div>
                    <FieldLabel>Open Graph Image URL</FieldLabel>
                    <TextInput
                      value={form.ogImage}
                      onChange={(value) => updateField("ogImage", value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <FieldLabel>Breadcrumb Name</FieldLabel>
                    <TextInput
                      value={form.breadcrumbName}
                      onChange={(value) => updateField("breadcrumbName", value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <FieldLabel>Schema Markup (JSON-LD)</FieldLabel>
                    <Textarea
                      value={form.schemaMarkup}
                      onChange={(value) => updateField("schemaMarkup", value)}
                      rows={3}
                      mono
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px]">
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

                  <div className="col-span-2 flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px]">
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
