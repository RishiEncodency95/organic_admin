"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  Edit3,
  ExternalLink,
  Eye,
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
  UserRound,
  Video,
} from "lucide-react";

import {
  cmsPages,
  cmsPagesFromSettings,
  findCmsPageByRouteKey,
  getCmsPageRouteKey,
  PUBLIC_SITE_URL,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { defaultLandingSections } from "@/lib/landingContent";
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
  options: {label: string, value: string}[] | string[];
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
            className={isLong || typeof value === "boolean" ? "col-span-2" : ""}
          >
            <FieldLabel>{humanizeKey(key)}</FieldLabel>

            {typeof value === "boolean" ? (
              <Toggle checked={value} onChange={(next) => onFieldChange(key, next)} />
            ) : isLong ? (
              <Textarea value={value} onChange={(next) => onFieldChange(key, next)} rows={2} />
            ) : (
              <TextInput value={value} onChange={(next) => onFieldChange(key, next)} />
            )}

            {isImage && value && (
              <img
                src={value}
                alt=""
                className="mt-[6px] h-[54px] w-[90px] rounded-[4px] border border-[#e5e6e2] object-cover"
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
  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between">
        <p className="text-[10.5px] font-bold text-[#3a4557]">
          Items ({items.length})
        </p>

        <button
          type="button"
          onClick={onAddItem}
          className="flex h-[24px] items-center gap-[4px] rounded-[4px] border border-[#98bca5] bg-white px-[8px] text-[9px] font-semibold text-[#34714c]"
        >
          <Plus className="h-[10px] w-[10px]" />
          Add Item
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-[10px] font-medium text-[#8b929c]">No items yet.</p>
      )}

      {items.map((item, index) => {
        // Ensure icon field is present for items that might use it
        let defaultIcon = "";
        if (!item.icon) {
           const text = (item.title || "") + " " + (item.label || "");
           const textUpper = text.toUpperCase();
           if (textUpper.includes("HELPLINE")) defaultIcon = "users";
           else if (textUpper.includes("REGION")) defaultIcon = "building";
           else if (textUpper.includes("CASE-BASED")) defaultIcon = "smile";
           else if (textUpper.includes("ELIGIBILITY") && !textUpper.includes("BODY")) defaultIcon = "shield";
           else if (textUpper.includes("UNCLAIMED") && !textUpper.includes("BODY")) defaultIcon = "info";
           else if (textUpper.includes("PEOPLE WITHOUT")) defaultIcon = "heart";
           else if (textUpper.includes("AMBULANCE") || textUpper.includes("TRANSPORT")) defaultIcon = "van";
           else if (textUpper.includes("CREMATION")) defaultIcon = "fire";
           else if (textUpper.includes("RITUAL ESSENTIALS")) defaultIcon = "diya";
           else if (textUpper.includes("PRIEST")) defaultIcon = "priest";
           else if (textUpper.includes("ON-GROUND")) defaultIcon = "heart-hands";
           else if (textUpper.includes("NAMO GANGE")) defaultIcon = "people";
           else if (textUpper.includes("GOVERNANCE")) defaultIcon = "shield";
           else if (textUpper.includes("IMPACT") || textUpper.includes("REPORT")) defaultIcon = "report";
           else if (textUpper.includes("DONATION") || textUpper.includes("REFUND")) defaultIcon = "policy";
           else if (textUpper.includes("SEWA") && !textUpper.includes("GIVE") && !textUpper.includes("SERVE") && !textUpper.includes("PARTNER") && textUpper.length < 15) defaultIcon = "heart-hand";
           else if (textUpper.includes("INTEGRITY")) defaultIcon = "scale";
           else if (textUpper.includes("TRANSPARENCY")) defaultIcon = "eye";
           else if (textUpper.includes("ACCOUNTABILITY")) defaultIcon = "accountability";
           else if (textUpper.includes("ON-GROUND SEWA")) defaultIcon = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165452/moksha-sewa/assets/sewa/on-ground.png";
           else if (textUpper.includes("VOLUNTEER SEWA")) defaultIcon = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165459/moksha-sewa/assets/sewa/voluteer-seva.png";
           else if (textUpper.includes("RITUAL SUPPORT")) defaultIcon = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165456/moksha-sewa/assets/sewa/ritual-support.png";
           else if (textUpper.includes("COMMUNITY OUTREACH")) defaultIcon = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165449/moksha-sewa/assets/sewa/community-outreach.png";
           else if (text.includes("Economically")) defaultIcon = "heart";
           else if (text.includes("Ritual")) defaultIcon = "book-open";
           else if (text.includes("Family")) defaultIcon = "users";
           else if (text.includes("Verified")) defaultIcon = "shield";
           else if (text.includes("Guided")) defaultIcon = "heart";
           else if (text.includes("Local")) defaultIcon = "map-pin";
           else if (text.includes("Request")) defaultIcon = "clipboard";
           else if (text.includes("Verification")) defaultIcon = "verification";
           else if (text.includes("Coordination")) defaultIcon = "hands";
           else if (text.includes("Final")) defaultIcon = "diya";
           else if (text.includes("Legally")) defaultIcon = "shield-check";
           else if (text.includes("Dignified")) defaultIcon = "diya";
           else if (text.includes("Compassionate")) defaultIcon = "heart-hands";
           else if (textUpper.includes("ECONOMICALLY")) defaultIcon = "family-hands";
           else if (textUpper.includes("ELDERLY")) defaultIcon = "elderly-care";
           else if (textUpper.includes("UNCLAIMED BODY")) defaultIcon = "unclaimed-case";
           else if (textUpper.includes("FOR THOSE UNCLAIMED")) defaultIcon = "users-round";
           else if (textUpper.includes("FOR THOSE ALONE")) defaultIcon = "heart-hands";
           else if (textUpper.includes("FOR FAMILIES IN NEED")) defaultIcon = "heart-hands";
           else if (textUpper.includes("WITH DIGNITY & CARE")) defaultIcon = "shield-check";
           else if (textUpper.includes("HUMANITY FIRST")) defaultIcon = "heart-hands";
           else if (textUpper.includes("VERIFICATION & LEGAL")) defaultIcon = "scale";
           else if (textUpper.includes("TRANSPARENT SEWA")) defaultIcon = "heart-hands";
           else if (textUpper.includes("COMMUNITY POWERED")) defaultIcon = "users-round";
           else if (textUpper.includes("COMPASSION")) defaultIcon = "heart";
           else if (textUpper.includes("INTEGRITY")) defaultIcon = "shield-check";
           else if (textUpper.includes("RESPECT")) defaultIcon = "users-round";
           else if (textUpper.includes("DIGNITY")) defaultIcon = "lotus";
           else if (textUpper.includes("UNCLAIMED & AUTHORISED")) defaultIcon = "document-check";
           else if (textUpper.includes("PEOPLE WITHOUT FAMILY SUPPORT")) defaultIcon = "people";
           else if (textUpper.includes("VERIFIED FAMILIES FACING FINANCIAL HARDSHIP")) defaultIcon = "heart-hands";
           else if (textUpper.includes("WHAT") && textUpper.includes("WE DO")) defaultIcon = "give-icon";
           else if (textUpper.includes("WHY") && textUpper.includes("WE EXIST")) defaultIcon = "lotus";
           else if (textUpper.includes("WHO") && textUpper.includes("WE SERVE")) defaultIcon = "users-round";
           else if (textUpper.includes("HOW") && textUpper.includes("WE SERVE")) defaultIcon = "serve-icon";
           else if (textUpper.includes("SOCIAL SERVICE")) defaultIcon = "heart-hands";
           else if (textUpper.includes("COMMUNITY WELFARE")) defaultIcon = "users-round";
           else if (textUpper.includes("HUMANITARIAN ACTION")) defaultIcon = "globe";
           else if (textUpper.includes("RESPONSIBLE GOVERNANCE")) defaultIcon = "shield-check";
           else if (textUpper.includes("VERIFICATION")) defaultIcon = "verification";
           else if (textUpper.includes("FORMALITIES")) defaultIcon = "formalities";
           else if (textUpper.includes("DOCUMENTATION")) defaultIcon = "documentation";
           else if (textUpper.includes("PRIVACY")) defaultIcon = "privacy";
           else if (textUpper.includes("NAMO GANGE TRUST")) defaultIcon = "lotus";
           else if (textUpper.includes("FINAL-JOURNEY") || textUpper.includes("FINAL JOURNEY") || textUpper.includes("ESSENTIAL FINAL")) defaultIcon = "body";
           else if (textUpper.includes("TRANSPORTATION")) defaultIcon = "van";
           else if (textUpper.includes("RITUAL")) defaultIcon = "book-open";
           else if (textUpper.includes("FAMILY SUPPORT") || textUpper.includes("ELIGIBLE FAMILY")) defaultIcon = "family-hands";
           else if (textUpper.includes("ON-GROUND COORDINATION")) defaultIcon = "heart-hands";
           else if (textUpper.includes("SECURE & TRUSTED") || textUpper.includes("SECURE")) defaultIcon = "shield-check";
           else if (textUpper.includes("ACCOUNTABLE USE")) defaultIcon = "clipboard";
           else if (textUpper.includes("TRANSPARENCY FIRST") || textUpper.includes("TRANSPARENCY")) defaultIcon = "eye";
           else if (textUpper.includes("SEWA WITH DIGNITY")) defaultIcon = "lotus";
           else if (textUpper.includes("VOLUNTEER")) defaultIcon = "heart-hands";
           else if (textUpper.includes("SUPPORT") && textUpper.includes("MISSION")) defaultIcon = "heart-hands";
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

        return (
          <div
            key={item._id ?? index}
            className="bg-white p-[9px] border border-[#e5e6e2] shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-semibold text-[#697386]">
                Item {index + 1}
              </span>

              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                className="text-[#c04a42]"
              >
                <Trash2 className="h-[11px] w-[11px]" />
              </button>
            </div>

            <div className="mt-[6px] grid grid-cols-2 gap-[8px]">
              {fieldEntries.map(([key, value]) => (
                <div key={key}>
                  <FieldLabel>{humanizeKey(key)}</FieldLabel>

                  {key === "icon" && sectionId !== "journey-glimpse" ? (
                    <SelectField
                      value={String(value)}
                      options={[
                        { label: "None", value: "" },
                        { label: "Group of People", value: "users" },
                        { label: "Building", value: "building" },
                        { label: "Smiley Face", value: "smile" },
                        { label: "Shield", value: "shield" },
                        { label: "Phone", value: "phone" },
                        { label: "Mail", value: "mail" },
                        { label: "Map Pin", value: "map-pin" },
                        { label: "Heart", value: "heart" },
                        { label: "Star", value: "star" },
                        { label: "Check Circle", value: "check-circle" },
                        { label: "Info", value: "info" },
                        { label: "Activity", value: "activity" },
                        { label: "Ambulance", value: "ambulance" },
                        { label: "Flame", value: "flame" },
                        { label: "Book Open", value: "book-open" },
                        { label: "Clipboard", value: "clipboard" },
                        { label: "Document", value: "document" },
                        { label: "Hands", value: "hands" },
                        { label: "Heart Hands", value: "heart-hands" },
                        { label: "Shield Check", value: "shield-check" },
                        { label: "Diya", value: "diya" },
                        { label: "Family Hands", value: "family-hands" },
                        { label: "Elderly Care", value: "elderly-care" },
                        { label: "Unclaimed Case", value: "unclaimed-case" },
                        { label: "Give Icon", value: "give-icon" },
                        { label: "Serve Icon", value: "serve-icon" },
                        { label: "Partner Icon", value: "partner-icon" },
                        { label: "Users Round", value: "users-round" },
                        { label: "Lotus", value: "lotus" },
                        { label: "Document Check", value: "document-check" },
                        { label: "People", value: "people" },
                        { label: "Van", value: "van" },
                        { label: "Fire", value: "fire" },
                        { label: "Priest", value: "priest" },
                        { label: "Report", value: "report" },
                        { label: "Policy", value: "policy" },
                        { label: "Heart Hand", value: "heart-hand" },
                        { label: "Scale", value: "scale" },
                        { label: "Eye", value: "eye" },
                        { label: "Globe", value: "globe" },
                        { label: "Accountability", value: "accountability" },
                        { label: "Verification", value: "verification" },
                        { label: "Formalities", value: "formalities" },
                        { label: "Documentation", value: "documentation" },
                        { label: "Privacy", value: "privacy" },
                        { label: "Body / Final Journey", value: "body" },
                        { label: "Leaf", value: "leaf" },
                        { label: "Heart Handshake", value: "heart-handshake" }
                      ]}
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
                  ) : key === "image" || (key === "icon" && sectionId === "journey-glimpse") ? (
                    <div className="flex flex-col gap-[8px]">
                      {value && typeof value === "string" && value.startsWith("http") && (
                        <div className="h-[46px] w-[46px] shrink-0 overflow-hidden rounded-[6px] border border-[#d2d6db] bg-[#f8f9fa] shadow-sm">
                          <img src={value} alt="Preview" className="h-full w-full object-contain p-1" />
                        </div>
                      )}
                      <TextInput value={String(value)} onChange={(next) => onChangeItem(index, key, next)} />
                    </div>
                  ) : (
                    <TextInput value={String(value)} onChange={(next) => onChangeItem(index, key, next)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
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
            : "Standard Page",

        parent:
          page.type === "home"
            ? "— No Parent (Top Level) —"
            : "Home",

        metaTitle:
          page.type === "home"
            ? "Moksha Sewa – Dignity in Every Final Journey"
            : `${page.title} – Moksha Sewa`,

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
    if (!settings) return;
    setForm({
      ...initialForm,
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
    });
  }, [settings, initialForm]);

  const [sectionsDraft, setSectionsDraft] = useState<Array<Record<string, any>>>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  useEffect(() => {
    const cfg = page.configKey && settings ? settings[page.configKey] : undefined;
    const rawSections = cfg?.sections && cfg.sections.length > 0 ? cfg.sections : defaultLandingSections;
    setSectionsDraft(rawSections.map((section: Record<string, any>) => ({ ...section })));
    setActiveSectionIndex(0);
  }, [settings, page.configKey]);

  const activeSection = sectionsDraft[activeSectionIndex];

  const updateSectionField = (key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) =>
        index === activeSectionIndex ? { ...section, [key]: value } : section,
      ),
    );
  };

  const updateSectionItem = (itemIndex: number, key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== activeSectionIndex) return section;
        const items = [...(section.items ?? [])];
        items[itemIndex] = { ...items[itemIndex], [key]: value };
        return { ...section, items };
      }),
    );
  };

  const addSectionItem = () => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== activeSectionIndex) return section;
        const items = [...(section.items ?? [])];
        const sample = items[0] ?? { label: "", value: "" };
        const blank = Object.fromEntries(
          Object.entries(sample)
            .filter(([key]) => key !== "_id")
            .map(([key, value]) => [key, Array.isArray(value) ? [] : typeof value === "boolean" ? false : ""]),
        );
        return { ...section, items: [...items, blank] };
      }),
    );
  };

  const removeSectionItem = (itemIndex: number) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== activeSectionIndex) return section;
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
    <div
      className="
        w-full
        bg-white
        text-[#172238]
      "
    >
      {/* =================================================
          FOOTER SPACE RESERVED
      ================================================= */}

      <div
        className="
          flex
          flex-col
          px-[16px]
          pb-[86px]
          pt-[7px]
        "
      >
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
                    ) =>
                      updateField(
                        "template",
                        value,
                      )
                    }
                    options={[
                      "Homepage",
                      "Default",
                      "Landing Page",
                      "Service Page",
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
                    ) =>
                      updateField(
                        "parent",
                        value,
                      )
                    }
                    options={[
                      "— No Parent (Top Level) —",
                      "Home",
                      "About Us",
                      "Our Services",
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

              {/* SECTION TABS */}

              <div className="mt-[10px] flex shrink-0 flex-wrap gap-[6px]">
                {sectionsDraft.map((section, index) => (
                  <button
                    key={section._id ?? section.key ?? index}
                    type="button"
                    onClick={() => setActiveSectionIndex(index)}
                    className={`flex h-[28px] items-center gap-[5px] rounded-[5px] border px-[11px] text-[9.5px] font-semibold transition ${
                      index === activeSectionIndex
                        ? "border-[#166b40] bg-[#0d5c34] text-white"
                        : section.enabled === false
                          ? "border-[#e7e7e3] bg-[#f7f7f5] text-[#a2a8b3]"
                          : "border-[#dedfdb] bg-white text-[#465168] hover:bg-[#f7f7f4]"
                    }`}
                  >
                    {section.name ?? section.key ?? `Section ${index + 1}`}
                  </button>
                ))}
              </div>

              {/* ACTIVE SECTION EDITOR */}

              {activeSection ? (
                <div className="mt-[12px] flex flex-col gap-[12px] rounded-none border border-[#dedfdb] bg-[#fbfbfa] p-[12px]">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-bold text-[#1c5033]">
                      {activeSection.name ?? activeSection.key}
                    </p>

                    <div className="flex items-center gap-[8px]">
                      <span className="text-[9.5px] font-semibold text-[#697386]">
                        Enabled
                      </span>

                      <Toggle
                        checked={activeSection.enabled !== false}
                        onChange={(value) => updateSectionField("enabled", value)}
                      />
                    </div>
                  </div>

                  <SectionFieldsEditor
                    section={activeSection}
                    onFieldChange={updateSectionField}
                  />

                  {Array.isArray(activeSection.slides) && (
                    <div className="flex flex-col gap-[8px] pt-[8px] border-t border-[#e8e9e5]">
                      <p className="text-[11px] font-bold text-[#1c5033]">
                        Hero Carousel Slides ({activeSection.slides.length})
                      </p>
                      <SectionItemsEditor
                        items={activeSection.slides}
                        onChangeItem={(itemIndex, key, value) => {
                          setSectionsDraft((previous) =>
                            previous.map((section, index) => {
                              if (index !== activeSectionIndex) return section;
                              const slides = [...(section.slides ?? [])];
                              slides[itemIndex] = { ...slides[itemIndex], [key]: value };
                              return { ...section, slides };
                            }),
                          );
                        }}
                        onAddItem={() => {
                          setSectionsDraft((previous) =>
                            previous.map((section, index) => {
                              if (index !== activeSectionIndex) return section;
                              const slides = [...(section.slides ?? [])];
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
                              return { ...section, slides: [...slides, blank] };
                            }),
                          );
                        }}
                        onRemoveItem={(itemIndex) => {
                          setSectionsDraft((previous) =>
                            previous.map((section, index) => {
                              if (index !== activeSectionIndex) return section;
                              const slides = (section.slides ?? []).filter((_: unknown, i: number) => i !== itemIndex);
                              return { ...section, slides };
                            }),
                          );
                        }}
                        sectionId={activeSection.key}
                      />
                    </div>
                  )}

                  {Array.isArray(activeSection.items) && (
                    <SectionItemsEditor
                      items={activeSection.items}
                      onChangeItem={updateSectionItem}
                      onAddItem={addSectionItem}
                      onRemoveItem={removeSectionItem}
                      sectionId={activeSection.key}
                    />
                  )}
                </div>
              ) : (
                <p className="mt-[12px] text-[10px] font-medium text-[#8b929c]">
                  No sections found for this page yet.
                </p>
              )}
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
                    className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${
                      form.status === "Published"
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
                    className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${
                      form.visibility === "Public"
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
