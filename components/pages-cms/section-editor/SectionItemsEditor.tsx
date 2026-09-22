"use client";

import { useRef, useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { FieldLabel, ImageUploadField, SelectField, TextInput, Textarea, Toggle, VideoUploadField } from "../fields";
import { IMAGE_KEY_PATTERN, LONG_TEXT_KEY_PATTERN, VIDEO_KEY_PATTERN, humanizeKey } from "./sectionFieldHelpers";

/* =========================================================
   GENERIC SECTION ITEMS EDITOR
   Handles the repeatable "items" list every section can have (stat
   cards, FAQ entries, links, ...) — add / remove / edit each item's
   own scalar fields generically.
========================================================= */

export function SectionItemsEditor({
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
    iconImage: 0.8,
    image: 0.9,
    img: 1.1,
    tagline: 1.2,
    titlePrimary: 2,
    titleSecondary: 3,
    title1: 3.1,
    title2: 3.2,
    title: 4,
    subtitle: 4.5,
    name: 6,
    main: 6.2,
    sub: 6.4,
    label: 7,
    description: 8,
    shortDescription: 8,
    keyPoint1: 8.01,
    keyPoint2: 8.02,
    keyPoint3: 8.03,
    keyPoint4: 8.04,
    feature1: 8.1,
    feature2: 8.2,
    feature3: 8.3,
    features: 8.4,
    points: 8.5,
    num: 8.8,
    date: 9,
    location: 10,
    alt: 13,
    buttonLabel: 14,
    buttonHref: 15,
    secondaryButtonLabel: 16,
    secondaryButtonHref: 17,
    icon: 18,
  };

  const getSectionAddLabel = () => {
    if (sectionId === "hero") return "Add Hero Slide";
    if (sectionId === "why-exhibit-hero") return "Add Hero Highlight Block";
    if (sectionId === "why-visit-hero") return "Add Impact Stat Counter";
    if (sectionId === "why-visit-matters") return "Add Opportunity Card";
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
    const mainTitle = item.name || item.title || item.label || (item.title1 ? `${item.title1} ${item.title2 || ""}`.trim() : null) || item.question || item.tagline || item.companyName1;
    if (mainTitle) return String(mainTitle);
    if (sectionId === "why-exhibit-hero") return item.main ? `${item.main} ${item.sub || ""}`.trim() : `Highlight Block ${index + 1}`;
    if (sectionId === "why-visit-hero") return item.label ? `${item.val || ""} ${item.label}`.trim() : `Stat Counter ${index + 1}`;
    if (sectionId === "why-visit-matters") return item.title ? String(item.title) : `Opportunity Card ${index + 1}`;
    if (sectionId === "reasons-to-exhibit") return item.title1 ? `${item.title1} ${item.title2 || ""}`.trim() : `Reason Block ${index + 1}`;
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

        {sectionId !== "audience-strip" && sectionId !== "beyond-exhibition" && sectionId !== "reasons-to-exhibit" && sectionId !== "industry-segments" && (
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
          } else if (sectionId === "why-exhibit-hero") {
            delete itemToEdit.icon;
            delete itemToEdit.img;
            const defaultImg = `/uploads/icons/x${(index % 4) + 1}.png`;
            if (!itemToEdit.image) {
              itemToEdit.image = item.img || defaultImg;
            }
          } else if (sectionId === "reasons-to-exhibit") {
            delete itemToEdit.icon;
            delete itemToEdit.img;
            delete itemToEdit.descLines;
            delete itemToEdit.points;
            delete itemToEdit.features;

            const defaultIcons = [
              "/uploads/icons/11og.webp",
              "/uploads/icons/12og.webp",
              "/uploads/icons/13og.webp",
              "/uploads/icons/14og.webp",
              "/uploads/icons/15og.webp",
              "/uploads/icons/i6.png",
            ];
            const defaultDescs = [
              "Meet thousands of qualified buyers, importers, distributors and decision-makers from around the world.",
              "Showcase your brand to a highly targeted audience and stand out in the competitive market.",
              "Build valuable connections with industry leaders, partners and potential collaborators.",
              "Introduce new organic products, technologies and solutions to the right audience.",
              "Pre-scheduled B2B meetings to generate quality leads and new business.",
              "Explore new markets, increase exports and drive long-term business growth.",
            ];
            const defaultFeatures = [
              ["Access new global markets", "Connect with key buyers", "Increase international reach"],
              ["High brand recall", "Media & PR exposure", "Digital promotions"],
              ["New partnerships", "Business alliances", "Long-term relationships"],
              ["Product launches", "Live demonstrations", "Market validation"],
              ["One-to-one meetings", "Targeted matchmaking", "Better conversions"],
              ["Increase revenue", "Expand customer base", "Sustainable growth"],
            ];

            const defaultImg = defaultIcons[index % defaultIcons.length];
            if (!itemToEdit.image) {
              itemToEdit.image = item.img || item.image || defaultImg;
            }
            if (itemToEdit.description === undefined) {
              itemToEdit.description = item.description || defaultDescs[index % defaultDescs.length];
            }
            const currentFeatures = Array.isArray(item.features) && item.features.length > 0
              ? item.features
              : Array.isArray(item.points) && item.points.length > 0
              ? item.points
              : defaultFeatures[index % defaultFeatures.length];

            if (itemToEdit.feature1 === undefined) itemToEdit.feature1 = item.feature1 ?? currentFeatures[0] ?? "";
            if (itemToEdit.feature2 === undefined) itemToEdit.feature2 = item.feature2 ?? currentFeatures[1] ?? "";
            if (itemToEdit.feature3 === undefined) itemToEdit.feature3 = item.feature3 ?? currentFeatures[2] ?? "";
          } else if (sectionId === "why-visit-matters") {
            delete itemToEdit.icon;
            delete itemToEdit.img;
            delete itemToEdit.desc;
            const defaultImgs = [
              "/uploads/icons/v1og.png",
              "/uploads/icons/v2og.png",
              "/uploads/icons/v3og.png",
              "/uploads/icons/v4og.png",
              "/uploads/icons/v5og.png",
              "/uploads/icons/v6og.png",
            ];
            if (!itemToEdit.image) {
              itemToEdit.image = item.img || item.image || defaultImgs[index % defaultImgs.length];
            }
            if (itemToEdit.description === undefined) {
              itemToEdit.description = item.description || item.desc || "";
            }
            if (itemToEdit.num === undefined) {
              itemToEdit.num = item.num || `0${index + 1}`;
            }
          } else if (sectionId === "industry-segments") {
            delete itemToEdit.icon;
            delete itemToEdit.color;
            delete itemToEdit.imageAlt;
            delete itemToEdit.desc;
            delete itemToEdit.description;
            const defaultBgImgs = [
              "/uploads/icons/x1.webp",
              "/uploads/icons/x2.webp",
              "/uploads/icons/x3.webp",
              "/uploads/icons/x4.webp",
              "/uploads/icons/x5.webp",
              "/uploads/icons/x6.webp",
            ];
            const defaultIconImgs = [
              "/uploads/icons/x1og.png",
              "/uploads/icons/x2og.png",
              "/uploads/icons/x3og.png",
              "/uploads/icons/x4og.png",
              "/uploads/icons/x5og.png",
              "/uploads/icons/x6og.png",
            ];
            if (!itemToEdit.iconImage) {
              itemToEdit.iconImage = item.iconImage || item.iconImg || defaultIconImgs[index % defaultIconImgs.length];
            }
            if (!itemToEdit.image) {
              itemToEdit.image = item.image || defaultBgImgs[index % defaultBgImgs.length];
            }
            if (itemToEdit.subtitle === undefined) itemToEdit.subtitle = item.subtitle || item.items || "";
          } else if (sectionId === "gallery-counters") {
            delete itemToEdit.icon;
            delete itemToEdit.iconKey;
            const galDefaultImgs = [
              "/uploads/icons/gal1.png",
              "/uploads/icons/gal2.png",
              "/uploads/icons/gal3.png",
              "/uploads/icons/gal4.png",
              "/uploads/icons/gal5.png",
              "/uploads/icons/gal6.png",
            ];
            if (!itemToEdit.image) {
              itemToEdit.image = item.image || galDefaultImgs[index % galDefaultImgs.length];
            }
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
                !(sectionId === "why-exhibit-hero" && key === "icon") &&
                !(sectionId === "expo-categories" && key === "icon") &&
                !(sectionId === "industry-segments" && key === "icon") &&
                !(sectionId === "why-visit-matters" && key === "icon") &&
                !(sectionId === "awards-health-camp" && key === "icon") &&
                !(sectionId === "awards-categories" && (key === "icon" || key === "description" || key === "shortDescription" || key === "cardBg" || key === "points" || key === "items")) &&
                !(sectionId === "awards-grand-awards" && (key === "icon" || key === "description" || key === "shortDescription" || key === "label")) &&
                !(sectionId === "awards-process" && key === "icon") &&
                !(sectionId === "gallery-counters" && (key === "icon" || key === "iconKey")) &&
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

                {sectionId !== "reasons-to-exhibit" && sectionId !== "industry-segments" && (
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
                )}
              </div>

              {isOpen && (
                <div className="p-[12px] grid grid-cols-2 gap-[10px] bg-white">
                  {fieldEntries.map(([key, value]) => {
                    const isImageKey = IMAGE_KEY_PATTERN.test(key);
                    const isVideoKey = VIDEO_KEY_PATTERN.test(key);
                    const isLong = (LONG_TEXT_KEY_PATTERN.test(key) || Array.isArray(value)) && !key.startsWith("feature");

                    return (
                      <div key={key} className={isImageKey || isVideoKey || isLong ? "col-span-2 w-full" : "col-span-1"}>
                        <FieldLabel>
                          {sectionId === "industry-segments" && key === "image"
                            ? "Main Image (Upload / URL)"
                            : sectionId === "industry-segments" && key === "iconImage"
                              ? "Top Image / Icon (Upload / URL)"
                              : sectionId === "awards-categories" && key === "image"
                                ? "Category Icon / Image (Upload / URL)"
                                : sectionId === "awards-grand-awards" && key === "image"
                                  ? "Award Icon / Image (Upload / URL)"
                                  : sectionId === "awards-process" && key === "image"
                                    ? "Process Icon / Image (Upload / URL)"
                                    : humanizeKey(key)}
                        </FieldLabel>

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
                            defaultValue={
                              sectionId === "why-exhibit-hero"
                                ? `/uploads/icons/x${(index % 4) + 1}.png`
                                : sectionId === "reasons-to-exhibit"
                                  ? [
                                      "/uploads/icons/11og.webp",
                                      "/uploads/icons/12og.webp",
                                      "/uploads/icons/13og.webp",
                                      "/uploads/icons/14og.webp",
                                      "/uploads/icons/15og.webp",
                                      "/uploads/icons/i6.png",
                                    ][index % 6]
                                  : sectionId === "why-visit-matters"
                                    ? [
                                        "/uploads/icons/v1og.png",
                                        "/uploads/icons/v2og.png",
                                        "/uploads/icons/v3og.png",
                                        "/uploads/icons/v4og.png",
                                        "/uploads/icons/v5og.png",
                                        "/uploads/icons/v6og.png",
                                      ][index % 6]
                                    : sectionId === "industry-segments"
                                      ? key === "iconImage"
                                        ? [
                                            "/uploads/icons/x1og.png",
                                            "/uploads/icons/x2og.png",
                                            "/uploads/icons/x3og.png",
                                            "/uploads/icons/x4og.png",
                                            "/uploads/icons/x5og.png",
                                            "/uploads/icons/x6og.png",
                                          ][index % 6]
                                        : [
                                            "/uploads/icons/x1.webp",
                                            "/uploads/icons/x2.webp",
                                            "/uploads/icons/x3.webp",
                                            "/uploads/icons/x4.webp",
                                            "/uploads/icons/x5.webp",
                                            "/uploads/icons/x6.webp",
                                          ][index % 6]
                                      : undefined
                            }
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
                          <Textarea
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                            rows={3}
                            noLimit={sectionId === "why-visit-matters" || sectionId === "industry-segments"}
                          />
                        ) : (
                          <TextInput
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                            maxLength={(sectionId === "why-visit-matters" || sectionId === "industry-segments") ? 5000 : 120}
                            hideLimit={sectionId === "why-visit-matters" || sectionId === "industry-segments"}
                          />
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
