"use client";
import { ChangeEvent, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ImagePlus, Plus, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import SeoSettingsForm, { SeoOptions } from "@/components/ui/SeoSettingsForm";
import { settingsApi } from "@/lib/settingsApi";
import { uploadApi } from "@/lib/uploadApi";
import { ApiRequestError } from "@/lib/api";
import { Settings } from "@/lib/types";
import { defaultLandingSections, mergeLandingSections, type LandingHeroSlide, type LandingSectionContent, type LandingSectionItem } from "@/lib/landingContent";
import { defaultAboutSections, mergeAboutSections } from "@/lib/aboutContent";
import { getFallbackSeo } from "@/lib/seoFallback";
import {
  defaultServicesSections,
  defaultAmbulanceSections,
  defaultPanditSections,
  defaultFuneralSections,
  defaultFuneralDecorationSections,
  defaultPrayerHallSections,
  defaultSpecialServiceSections,
  defaultCallingRelativesSections,
  defaultHarsevanSections,
  defaultUnclaimedBodySections,
  defaultVolunteerSections,
  defaultPartnershipSections,
  defaultCSRSections,
  defaultRequestHelpSections,
  defaultDonationSections,
  defaultContactSections,
  defaultTrackSections,
  defaultPrivacySections,
  defaultTermsSections,
  defaultRefundSections,
  defaultConductSections,
} from "@/lib/extraPagesContent";


export function CollapsibleCard({ title, defaultOpen = false, children, headerAction }: { title: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode, headerAction?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-surface-border bg-surface-sunken/40 overflow-hidden mb-3">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-surface-sunken transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="text-xs font-semibold text-text-primary flex items-center gap-2">
          {isOpen ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />}
          {title}
        </p>
        {headerAction && <div onClick={e => e.stopPropagation()}>{headerAction}</div>}
      </div>
      {isOpen && (
        <div className="p-3 border-t border-surface-border">
          {children}
        </div>
      )}
    </div>
  );
}

const FOLDER = "moksha-sewa/website";


const baseRenderedFields = new Set<keyof LandingSectionContent>([
  "key",
  "name",
  "enabled",
  "eyebrow",
  "title",
  "subtitle",
  "description",
  "image",
  "buttonLabel",
  "buttonHref",
  "secondaryButtonLabel",
  "secondaryButtonHref",
  "tertiaryButtonLabel",
  "tertiaryButtonHref",
  "slides",
  "items",
]);

const extraTextFields: { key: keyof LandingSectionContent; label: string; multiline?: boolean }[] = [
  { key: "quote", label: "Quote", multiline: true },
  { key: "legalNotice", label: "Legal Notice", multiline: true },
  { key: "lowerTitle", label: "Lower Title" },
  { key: "lowerDescription", label: "Lower Description", multiline: true },
  { key: "bottomStatement", label: "Bottom Statement", multiline: true },
  { key: "secondaryTitle", label: "Secondary Title" },
  { key: "secondaryDescription", label: "Secondary Description", multiline: true },
  { key: "supportTitle", label: "Support Title", multiline: true },
  { key: "supportDescription", label: "Support Description", multiline: true },
  { key: "regionTitle", label: "Region Title" },
  { key: "regionDescription", label: "Region Description" },
  { key: "phoneLabel", label: "Phone Label" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "contactEmail", label: "Contact Email" },
  { key: "contactAddress", label: "Contact Address", multiline: true },
  { key: "availabilityText", label: "Availability Text", multiline: true },
  { key: "actionTitle", label: "Action Band Text" },
  { key: "requestTitle", label: "Request Card Title" },
  { key: "requestDescription", label: "Request Card Description", multiline: true },
  { key: "inputPlaceholder", label: "Input Placeholder" },
  { key: "submitLabel", label: "Submit Button Text" },
  { key: "submittedLabel", label: "Submitted Button Text" },
  { key: "successMessage", label: "Success Popup Message", multiline: true },
  { key: "initiativeLabel", label: "Initiative Label" },
  { key: "quickLinksTitle", label: "Quick Links Column Title" },
  { key: "servicesTitle", label: "Services Column Title" },
  { key: "initiativesTitle", label: "Initiatives Column Title" },
  { key: "contactTitle", label: "Contact Column Title" },
  { key: "sloganTitle", label: "Slogan Title" },
  { key: "immediateHelpTitle", label: "Immediate Help Title" },
  { key: "immediateHelpDescription", label: "Immediate Help Description", multiline: true },
  { key: "supportNowLabel", label: "Support Now Label" },
  { key: "supportMissionTitle", label: "Support Mission Title" },
  { key: "supportMissionDescription", label: "Support Mission Description", multiline: true },
  { key: "videoUrl", label: "Video URL" },
  { key: "secondaryVideoUrl", label: "Secondary Video URL" },
];

const extraImageFields: { key: keyof LandingSectionContent; label: string }[] = [
  { key: "logoImage", label: "Logo Image" },
  { key: "partnerLogoImage", label: "Partner Logo Image" },
  { key: "secondaryLogoImage", label: "Secondary Logo Image" },
  { key: "secondaryImage", label: "Secondary Image" },
  { key: "tertiaryImage", label: "Tertiary Image" },
  { key: "quaternaryImage", label: "Quaternary Image" },
];

const sectionSpecificRenderedFields: Record<string, (keyof LandingSectionContent)[]> = {
  hero: ["logoImage"],
  "volunteer-hero": ["secondaryImage", "logoImage"],
  footer: ["logoImage", "partnerLogoImage"],
  "trust-transparency": [
    "quote",
    "legalNotice",
    "lowerTitle",
    "lowerDescription",
    "bottomStatement",
    "logoImage",
    "partnerLogoImage",
    "secondaryLogoImage",
    "secondaryImage",
  ],
  "final-act": ["logoImage", "partnerLogoImage"],
  "family-need": ["supportTitle", "supportDescription", "regionTitle", "regionDescription"],
  compassion: ["phoneLabel", "phoneNumber", "secondaryTitle", "secondaryDescription"],
  "practical-support": [
    "sloganTitle",
    "immediateHelpTitle",
    "immediateHelpDescription",
    "supportNowLabel",
    "supportMissionTitle",
    "supportMissionDescription",
  ],
};

function updateAt<T>(items: T[], index: number, updater: (item: T) => T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? updater(item) : item));
}

function mergeSections(defaults: LandingSectionContent[], saved?: LandingSectionContent[]) {
  return defaults.map((section) => {
    const existing = saved?.find((item) => item.key === section.key);
    return existing ? { ...section, ...existing } : section;
  });
}

function getPageDefaults(page: EditablePage) {
  return editablePages[page].defaults;
}

function getPageSections(page: EditablePage, saved?: LandingSectionContent[]) {
  if (page === "about") return mergeAboutSections(saved);
  if (page === "landing") return mergeLandingSections(saved);
  return mergeSections(getPageDefaults(page), saved);
}

function getPageFromSearch(value: string | null): EditablePage {
  if (value && value in editablePages) return value as EditablePage;
  return "landing";
}

type EditablePage =
  | "landing"
  | "about"
  | "services"
  | "ambulance"
  | "pandit"
  | "funeral"
  | "funeralDecoration"
  | "prayerHall"
  | "specialService"
  | "callingRelatives"
  | "harsevan"
  | "unclaimed-body"
  | "volunteer"
  | "partnership"
  | "csr"
  | "request-help"
  | "donation"
  | "contact"
  | "track"
  | "privacy-policy"
  | "terms"
  | "refund-policy"
  | "code-of-conduct";

const pageFieldMap: Record<EditablePage, keyof Pick<
  Settings,
  | "landingPage"
  | "aboutPage"
  | "servicesPage"
  | "ambulancePage"
  | "panditPage"
  | "funeralPage"
  | "funeralDecorationPage"
  | "prayerHallPage"
  | "specialServicePage"
  | "callingRelativesPage"
  | "harsevanPage"
  | "unclaimedBodyPage"
  | "volunteerPage"
  | "partnershipPage"
  | "csrPage"
  | "requestHelpPage"
  | "donationPage"
  | "contactPage"
  | "trackPage"
  | "privacyPage"
  | "termsPage"
  | "refundPage"
  | "conductPage"
>> = {
  landing: "landingPage",
  about: "aboutPage",
  services: "servicesPage",
  ambulance: "ambulancePage",
  pandit: "panditPage",
  funeral: "funeralPage",
  funeralDecoration: "funeralDecorationPage",
  prayerHall: "prayerHallPage",
  specialService: "specialServicePage",
  callingRelatives: "callingRelativesPage",
  harsevan: "harsevanPage",
  "unclaimed-body": "unclaimedBodyPage",
  volunteer: "volunteerPage",
  partnership: "partnershipPage",
  csr: "csrPage",
  "request-help": "requestHelpPage",
  donation: "donationPage",
  contact: "contactPage",
  track: "trackPage",
  "privacy-policy": "privacyPage",
  terms: "termsPage",
  "refund-policy": "refundPage",
  "code-of-conduct": "conductPage",
};

const editablePages: Record<EditablePage, { label: string; defaults: LandingSectionContent[] }> = {
  landing: { label: "Landing Page", defaults: defaultLandingSections },
  about: { label: "About Page", defaults: defaultAboutSections },
  services: { label: "Sewa Services Page", defaults: defaultServicesSections },
  ambulance: { label: "Ambulance Service", defaults: defaultAmbulanceSections },
  pandit: { label: "Pandit Service", defaults: defaultPanditSections },
  funeral: { label: "Funeral Service", defaults: defaultFuneralSections },
  funeralDecoration: { label: "Funeral Decoration", defaults: defaultFuneralDecorationSections },
  prayerHall: { label: "Prayer Hall", defaults: defaultPrayerHallSections },
  specialService: { label: "Special Service", defaults: defaultSpecialServiceSections },
  callingRelatives: { label: "Calling Relatives", defaults: defaultCallingRelativesSections },
  harsevan: { label: "Harsevan", defaults: defaultHarsevanSections },
  "unclaimed-body": { label: "Unclaimed Body Page", defaults: defaultUnclaimedBodySections },
  volunteer: { label: "Volunteer Page", defaults: defaultVolunteerSections },
  partnership: { label: "Partnership Page", defaults: defaultPartnershipSections },
  csr: { label: "CSR Page", defaults: defaultCSRSections },
  "request-help": { label: "Request Help Page", defaults: defaultRequestHelpSections },
  donation: { label: "Donation Page", defaults: defaultDonationSections },
  contact: { label: "Contact Page", defaults: defaultContactSections },
  track: { label: "Track Status Page", defaults: defaultTrackSections },
  "privacy-policy": { label: "Privacy Policy Page", defaults: defaultPrivacySections },
  terms: { label: "Terms & Conditions Page", defaults: defaultTermsSections },
  "refund-policy": { label: "Refund Policy Page", defaults: defaultRefundSections },
  "code-of-conduct": { label: "Code Of Conduct Page", defaults: defaultConductSections },
};

const allDefaultSections = [
  ...defaultLandingSections,
  ...defaultAboutSections,
  ...defaultServicesSections,
  ...defaultAmbulanceSections,
  ...defaultPanditSections,
  ...defaultFuneralSections,
  ...defaultFuneralDecorationSections,
  ...defaultPrayerHallSections,
  ...defaultSpecialServiceSections,
  ...defaultCallingRelativesSections,
  ...defaultHarsevanSections,
  ...defaultUnclaimedBodySections,
  ...defaultVolunteerSections,
  ...defaultPartnershipSections,
  ...defaultCSRSections,
  ...defaultRequestHelpSections,
  ...defaultDonationSections,
  ...defaultContactSections,
  ...defaultTrackSections,
  ...defaultPrivacySections,
  ...defaultTermsSections,
  ...defaultRefundSections,
  ...defaultConductSections,
];

const fallbackSectionByKey = new Map(allDefaultSections.map((section) => [section.key, section]));
const genericFieldLimits: Partial<Record<keyof LandingSectionContent, number>> = {
  name: 100,
  eyebrow: 200,
  title: 300,
  subtitle: 500,
  description: 3000,
  quote: 3000,
  legalNotice: 1000,
  lowerTitle: 200,
  lowerDescription: 1000,
  bottomStatement: 1000,
  secondaryTitle: 200,
  secondaryDescription: 1000,
  supportTitle: 500,
  supportDescription: 500,
  regionTitle: 200,
  regionDescription: 200,
  phoneLabel: 100,
  phoneNumber: 50,
  contactEmail: 200,
  contactAddress: 500,
  availabilityText: 300,
  actionTitle: 200,
  requestTitle: 200,
  requestDescription: 1000,
  inputPlaceholder: 150,
  submitLabel: 100,
  submittedLabel: 100,
  successMessage: 1000,
  initiativeLabel: 200,
  quickLinksTitle: 100,
  servicesTitle: 100,
  initiativesTitle: 100,
  contactTitle: 100,
  sloganTitle: 200,
  immediateHelpTitle: 200,
  immediateHelpDescription: 500,
  supportNowLabel: 100,
  supportMissionTitle: 200,
  supportMissionDescription: 1000,
  buttonLabel: 100,
  secondaryButtonLabel: 100,
  tertiaryButtonLabel: 100,
};

const itemFieldLimits: Partial<Record<keyof LandingSectionItem, number>> = {
  title: 300,
  label: 200,
  value: 100,
  description: 1500,
};

const slideFieldLimits: Partial<Record<keyof LandingHeroSlide, number>> = {
  title: 300,
  description: 800,
  alt: 300,
  buttonLabel: 100,
  secondaryButtonLabel: 100,
};

function limitFromFallback(value: string | undefined, generic: number) {
  return value ? Math.max(value.length, generic) : generic;
}

function getSectionFieldLimit(sectionKey: string, key: keyof LandingSectionContent) {
  return limitFromFallback(fallbackSectionByKey.get(sectionKey)?.[key] as string | undefined, genericFieldLimits[key] ?? 160);
}

function getItemFieldLimit(sectionKey: string, itemIndex: number, key: keyof LandingSectionItem) {
  return limitFromFallback(fallbackSectionByKey.get(sectionKey)?.items?.[itemIndex]?.[key] as string | undefined, itemFieldLimits[key] ?? 120);
}

function getSlideFieldLimit(slideIndex: number, key: keyof LandingHeroSlide) {
  return limitFromFallback(fallbackSectionByKey.get("hero")?.slides?.[slideIndex]?.[key] as string | undefined, slideFieldLimits[key] ?? 120);
}

function TextField({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  const lengthHint = maxLength ? `${(value ?? "").length}/${maxLength} characters (Recommended length). No strict limit applied.` : undefined;
  if (multiline) {
    return <Textarea label={label} value={value ?? ""} rows={3} hint={lengthHint} onChange={(event) => onChange(event.target.value)} />;
  }
  return <Input label={label} value={value ?? ""} hint={lengthHint} onChange={(event) => onChange(event.target.value)} />;
}

function ImageField({
  label,
  value,
  altValue,
  hint = "Paste existing public path or upload a new image.",
  uploading,
  onChange,
  onAltChange,
  onUpload,
}: {
  label: string;
  value?: string;
  altValue?: string;
  hint?: string;
  uploading?: boolean;
  onChange: (value: string) => void;
  onAltChange?: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  const [metadata, setMetadata] = useState<{ w: number, h: number, size: number, type: string } | null>(null);

  const imgUrl = useMemo(() => {
    if (!value) return "";
    return value.startsWith('/') ? `http://localhost:3000${value}` : value;
  }, [value]);

  useEffect(() => {
    if (imgUrl) {
      const img = new Image();
      img.onload = () => {
        setMetadata((prev) => {
          if (prev && prev.size > 0) return prev;
          if (prev && prev.w === img.width && prev.h === img.height) return prev;
          return { w: img.width, h: img.height, size: 0, type: 'existing' };
        });
      };
      img.src = imgUrl;
    }
  }, [imgUrl]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setMetadata({ w: img.width, h: img.height, size: file.size, type: file.type });
          onUpload(file);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-surface-border p-3 bg-surface-card shadow-sm">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</label>
        {metadata && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-surface-sunken text-text-muted">
            {metadata.w}×{metadata.h}{metadata.size > 0 ? ` • ${(metadata.size / 1024).toFixed(1)}KB • ${metadata.type.split('/')[1]?.toUpperCase()}` : ''}
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Input placeholder="Image URL" value={value ?? ""} onChange={(event) => onChange(event.target.value)} hint={hint} />
          {onAltChange && (
            <Input placeholder="Alt Text (Required for SEO)" value={altValue ?? ""} onChange={(event) => onAltChange(event.target.value)} />
          )}
        </div>
        <div className="flex flex-col items-center gap-2">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imgUrl} 
              alt={altValue ?? ""} 
              className="h-16 w-24 rounded border border-surface-border object-cover" 
            />
          ) : (
            <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed border-surface-border bg-surface-sunken">
              <span className="text-[10px] text-text-muted">No Image</span>
            </div>
          )}
          <label className="inline-flex h-7 w-full cursor-pointer items-center justify-center gap-1.5 rounded border border-surface-border bg-surface-card px-2 text-[10px] font-medium text-text-primary hover:bg-surface-sunken">
            <ImagePlus className="h-3 w-3" />
            {uploading ? "Uploading" : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
        </div>
      </div>
    </div>
  );
}

function MoreSectionFields({
  section,
  uploadingKey,
  onTextChange,
  onImageChange,
  onImageUpload,
}: {
  section: LandingSectionContent;
  uploadingKey: string | null;
  onTextChange: (key: keyof LandingSectionContent, value: string) => void;
  onImageChange: (key: keyof LandingSectionContent, value: string) => void;
  onImageUpload: (key: keyof LandingSectionContent, file: File) => void;
}) {
  const renderedFields = new Set<keyof LandingSectionContent>([
    ...baseRenderedFields,
    ...(sectionSpecificRenderedFields[section.key] ?? []),
  ]);
  const textFields = extraTextFields.filter((field) => !renderedFields.has(field.key));
  const imageFields = extraImageFields.filter((field) => !renderedFields.has(field.key));

  return (
    <details className="mt-6 border-t border-surface-border pt-4">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-text-muted">
        More editable fields
      </summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {textFields.map((field) => (
          <div key={field.key} className={field.multiline ? "sm:col-span-2" : undefined}>
            <TextField
              label={field.label}
              value={section[field.key] as string | undefined}
              multiline={field.multiline}
              maxLength={getSectionFieldLimit(section.key, field.key)}
              onChange={(value) => onTextChange(field.key, value)}
            />
          </div>
        ))}
        {imageFields.map((field) => (
          <ImageField
            key={field.key}
            label={field.label}
            value={section[field.key] as string | undefined}
            uploading={uploadingKey === `${section.key}:${field.key}`}
            onChange={(value) => onImageChange(field.key, value)}
            onUpload={(file) => onImageUpload(field.key, file)}
          />
        ))}
      </div>
    </details>
  );
}

export default function WebsitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [settings, setSettings] = useState<Settings | null>(null);
  const initialPage = getPageFromSearch(searchParams.get("page"));
  const [activePage, setActivePage] = useState<EditablePage>(initialPage);
  const [sections, setSections] = useState<LandingSectionContent[]>(editablePages[initialPage].defaults);
  const [activeKey, setActiveKey] = useState(searchParams.get("section") ?? editablePages[initialPage].defaults[0]?.key ?? "hero");
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Local SEO state for the current page
  const [seoState, setSeoState] = useState<SeoOptions>({});

  useEffect(() => {
    const pageParam = getPageFromSearch(searchParams.get("page"));
    const sectionParam = searchParams.get("section");
    if (pageParam || sectionParam) {
      setActivePage(pageParam);
      const nextSections = getPageSections(pageParam, settings?.[pageFieldMap[pageParam]]?.sections);
      setSections(nextSections);
      setActiveKey(sectionParam ?? nextSections[0]?.key ?? "hero");
      const fallbackSeo = getFallbackSeo(pageParam) || {};
      const dbSeo = settings?.[pageFieldMap[pageParam]]?.seo || {};
      setSeoState({ ...fallbackSeo, ...dbSeo });
    }
  }, [searchParams, settings]);

  useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        setSettings(data);
        setSections(getPageSections(initialPage, data[pageFieldMap[initialPage]]?.sections));
        const fallbackSeo = getFallbackSeo(initialPage) || {};
        const dbSeo = data[pageFieldMap[initialPage]]?.seo || {};
        setSeoState({ ...fallbackSeo, ...dbSeo });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [initialPage]);

  const activeSection = useMemo(
    () => sections.find((section) => section.key === activeKey) ?? sections[0],
    [activeKey, sections]
  );

  const setSection = (key: string, updater: (section: LandingSectionContent) => LandingSectionContent) => {
    setSections((current) => current.map((section) => (section.key === key ? updater(section) : section)));
  };

  const uploadImage = async (target: string, file: File, onDone: (url: string) => void) => {
    setUploadingKey(target);
    setMessage(null);
    try {
      const result = await uploadApi.file(file, FOLDER);
      onDone(result.url);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not upload image." });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...settings, [pageFieldMap[activePage]]: { sections, seo: seoState } };
      const updated = await settingsApi.update(payload);
      setSettings(updated);
      const updatedSections = updated[pageFieldMap[activePage]]?.sections;
      setSections(getPageSections(activePage, updatedSections));
      setMessage({ type: "success", text: `${editablePages[activePage].label} content saved.` });
    } catch (err) {
      setMessage({ type: "error", text: (err as any).message || "Could not save website content." });
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setSections(editablePages[activePage].defaults);
    setActiveKey(editablePages[activePage].defaults[0]?.key ?? "hero");
  };

  const restoreAndSaveDefaults = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const defaults = editablePages[activePage].defaults;
      const payload = { ...settings, [pageFieldMap[activePage]]: { sections: defaults, seo: seoState } };
      const updated = await settingsApi.update(payload);
      setSettings(updated);
      const updatedSections = updated[pageFieldMap[activePage]]?.sections;
      setSections(getPageSections(activePage, updatedSections));
      setActiveKey(defaults[0]?.key ?? "hero");
      setMessage({ type: "success", text: `Original ${editablePages[activePage].label.toLowerCase()} content restored and saved.` });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not restore website content." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !activeSection) {
    return <div className="flex min-h-[40vh] items-center justify-center text-text-muted">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Website</h1>
            <p className="text-xs text-text-muted">Landing and About page section content and images. Layout stays unchanged on the website.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="website-page-select" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Page
            </label>
            <select
              id="website-page-select"
              value={activePage}
              onChange={(event) => {
                const nextPage = event.target.value as EditablePage;
                router.push(`${pathname}?page=${nextPage}`);
              }}
              className="rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs font-medium text-text-primary outline-none ring-0 transition focus:border-accent"
            >
              {Object.entries(editablePages).map(([key, page]) => (
                <option key={key} value={key}>
                  {page.label}
                </option>
              ))}
            </select>

            <div className="mx-2 h-4 w-px bg-surface-border"></div>

            <button
              onClick={() => setActiveTab("content")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "content" ? "bg-accent text-white" : "text-text-muted hover:bg-surface-sunken"}`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === "seo" ? "bg-accent text-white" : "text-text-muted hover:bg-surface-sunken"}`}
            >
              SEO Settings
            </button>

            {activeTab === "content" && (
              <>
                <div className="mx-2 h-4 w-px bg-surface-border"></div>
                <label htmlFor="landing-section-select" className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  Section
                </label>
                <select
                  id="landing-section-select"
                  value={activeKey}
                  onChange={(event) => {
                    router.push(`${pathname}?page=${activePage}&section=${event.target.value}`);
                  }}
                  className="rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs font-medium text-text-primary outline-none ring-0 transition focus:border-accent"
                >
                  {sections.map((section) => (
                    <option key={section.key} value={section.key}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={resetDefaults}>Reset Defaults</Button>
          <Button type="button" variant="secondary" onClick={restoreAndSaveDefaults} loading={saving}>Restore Original</Button>
          <Button type="button" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Save {editablePages[activePage].label}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg border p-3 text-xs font-medium ${message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {activeTab === "seo" ? (
        <SeoSettingsForm
          seo={seoState}
          onChange={setSeoState}
          uploading={uploadingKey === "seo:ogImage"}
          onImageUpload={(file, callback) => uploadImage("seo:ogImage", file, callback)}
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-surface-border pb-3">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">{activeSection.name}</h2>
                <p className="text-[11px] text-text-muted">Section key: {activeSection.key}</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <input
                  type="checkbox"
                  checked={activeSection.enabled !== false}
                  onChange={(event) => setSection(activeSection.key, (section) => ({ ...section, enabled: event.target.checked }))}
                />
                Visible
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextField label="Admin Section Name" value={activeSection.name} maxLength={getSectionFieldLimit(activeSection.key, "name")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, name: value }))} />
              <TextField label="Eyebrow / Small Heading" value={activeSection.eyebrow} maxLength={getSectionFieldLimit(activeSection.key, "eyebrow")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, eyebrow: value }))} />
              <div className="sm:col-span-2">
                <TextField label={activeSection.key === "hero" ? "H1 (Main Title)" : "Main Title"} value={activeSection.title} maxLength={getSectionFieldLimit(activeSection.key, "title")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, title: value }))} multiline />
              </div>
              <div className="sm:col-span-2">
                <TextField label="Subtitle" value={activeSection.subtitle} maxLength={getSectionFieldLimit(activeSection.key, "subtitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, subtitle: value }))} multiline />
              </div>
              <div className="sm:col-span-2">
                <TextField label="Description" value={activeSection.description} maxLength={getSectionFieldLimit(activeSection.key, "description")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, description: value }))} multiline />
              </div>
              {(activeSection.key === "hero" || activeSection.key === "volunteer-hero") && (
                <div className="sm:col-span-2">
                  <ImageField
                    label="Hero Logo"
                    hint="This is the logo shown in the hero section above the title."
                    value={activeSection.logoImage}
                    uploading={uploadingKey === `${activeSection.key}:logo`}
                    onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, logoImage: value }))}
                    onUpload={(file) => uploadImage(`${activeSection.key}:logo`, file, (url) => setSection(activeSection.key, (section) => ({ ...section, logoImage: url })))}
                  />
                </div>
              )}
              <ImageField
                label={activeSection.key === "hero" ? "Hero Background Image (not logo)" : activeSection.key === "volunteer-hero" ? "Hero Slide 1 Image" : "Section Image"}
                hint={activeSection.key === "hero" ? "This controls the hero background/fallback image. Use Hero Logo above for the logo." : undefined}
                value={activeSection.image}
                uploading={uploadingKey === `${activeSection.key}:section`}
                onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, image: value }))}
                onUpload={(file) => uploadImage(`${activeSection.key}:section`, file, (url) => setSection(activeSection.key, (section) => ({ ...section, image: url })))}
              />
              <ImageField
                label={activeSection.key === "volunteer-hero" ? "Hero Slide 2 Image" : "Secondary Image"}
                value={activeSection.secondaryImage}
                uploading={uploadingKey === `${activeSection.key}:secondary`}
                onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryImage: value }))}
                onUpload={(file) => uploadImage(`${activeSection.key}:secondary`, file, (url) => setSection(activeSection.key, (section) => ({ ...section, secondaryImage: url })))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Primary Button Text" value={activeSection.buttonLabel} maxLength={getSectionFieldLimit(activeSection.key, "buttonLabel")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, buttonLabel: value }))} />
                <TextField label="Primary Button Link" value={activeSection.buttonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, buttonHref: value }))} />
                <TextField label="Secondary Button Text" value={activeSection.secondaryButtonLabel} maxLength={getSectionFieldLimit(activeSection.key, "secondaryButtonLabel")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryButtonLabel: value }))} />
                <TextField label="Secondary Button Link" value={activeSection.secondaryButtonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryButtonHref: value }))} />
                <TextField label="Third Button Text" value={activeSection.tertiaryButtonLabel} maxLength={getSectionFieldLimit(activeSection.key, "tertiaryButtonLabel")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, tertiaryButtonLabel: value }))} />
                <TextField label="Third Button Link" value={activeSection.tertiaryButtonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, tertiaryButtonHref: value }))} />
              </div>
            </div>

            {activePage === "landing" && activeSection.key === "hero" && (
              <div className="mt-6 border-t border-surface-border pt-4">
                <div className="mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Hero Slides</h3>
                  <p className="mt-1 text-[11px] text-text-muted">Each slide controls its own image, message, accessibility text, and buttons.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setSection(activeSection.key, (section) => ({
                      ...section,
                      slides: [
                        ...(section.slides ?? []),
                        {
                          title: "New Hero Slide",
                          description: "Add slide description.",
                          image: section.slides?.[0]?.image || "/hero-images/dignity-in-every-final-journey-bg.png",
                          alt: "Hero slide image",
                          buttonLabel: "Learn More",
                          buttonHref: "/",
                          variant: "default",
                        },
                      ],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Slide
                </Button>
                <div className="space-y-3">
                  {(activeSection.slides ?? []).map((slide: LandingHeroSlide, slideIndex: number) => (
                    <CollapsibleCard key={`hero-slide-${slideIndex}`} title={`Slide ${slideIndex + 1}`}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <TextField label="H1 (Slide Title)" value={slide.title} multiline maxLength={getSlideFieldLimit(slideIndex, "title")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, title: value })) }))} />
                        </div>
                        <div className="sm:col-span-2">
                          <TextField label="Slide Description" value={slide.description} multiline maxLength={getSlideFieldLimit(slideIndex, "description")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, description: value })) }))} />
                        </div>
                        <TextField label="Image Alt Text" value={slide.alt} maxLength={getSlideFieldLimit(slideIndex, "alt")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, alt: value })) }))} />
                        <label className="space-y-1.5 text-xs font-medium text-text-secondary">
                          Layout Variant
                          <select value={slide.variant ?? "default"} onChange={(event) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, variant: event.target.value as LandingHeroSlide["variant"] })) }))} className="h-10 w-full rounded-lg border border-surface-border bg-surface-card px-3 text-sm text-text-primary outline-none focus:border-accent">
                            <option value="default">Default</option>
                            <option value="family-support">Family Support</option>
                            <option value="journey-prayer">Journey Prayer</option>
                            <option value="volunteer-impact">Volunteer Impact</option>
                          </select>
                        </label>
                        <ImageField label="Slide Image" value={slide.image} uploading={uploadingKey === `hero:slide:${slideIndex}`} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, image: value })) }))} onUpload={(file) => uploadImage(`hero:slide:${slideIndex}`, file, (url) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, image: url })) })))} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <TextField label="Primary Button Text" value={slide.buttonLabel} maxLength={getSlideFieldLimit(slideIndex, "buttonLabel")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, buttonLabel: value })) }))} />
                          <TextField label="Primary Button Link" value={slide.buttonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, buttonHref: value })) }))} />
                          <TextField label="Secondary Button Text" value={slide.secondaryButtonLabel} maxLength={getSlideFieldLimit(slideIndex, "secondaryButtonLabel")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, secondaryButtonLabel: value })) }))} />
                          <TextField label="Secondary Button Link" value={slide.secondaryButtonHref} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, slides: updateAt(section.slides ?? [], slideIndex, (current) => ({ ...current, secondaryButtonHref: value })) }))} />
                        </div>
                      </div>
                    </CollapsibleCard>
                  ))}
                </div>
              </div>
            )}

            {activePage === "landing" && activeSection.key === "footer" && (
              <div className="mt-6 border-t border-surface-border pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Footer Logos</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ImageField label="Moksha Sewa Logo" value={activeSection.logoImage} uploading={uploadingKey === "footer:logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, logoImage: value }))} onUpload={(file) => uploadImage("footer:logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, logoImage: url })))} />
                  <ImageField label="Namo Gange Trust Logo" value={activeSection.partnerLogoImage} uploading={uploadingKey === "footer:partner-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: value }))} onUpload={(file) => uploadImage("footer:partner-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: url })))} />
                </div>
              </div>
            )}

            {activePage === "landing" && activeSection.key === "trust-transparency" && (
              <div className="mt-6 border-t border-surface-border pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Trust &amp; Transparency Details</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2"><TextField label="Mission Quote" value={activeSection.quote} multiline maxLength={getSectionFieldLimit(activeSection.key, "quote")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, quote: value }))} /></div>
                  <div className="sm:col-span-2"><TextField label="Legal Notice" value={activeSection.legalNotice} multiline maxLength={getSectionFieldLimit(activeSection.key, "legalNotice")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, legalNotice: value }))} /></div>
                  <TextField label="Lower Section Title" value={activeSection.lowerTitle} maxLength={getSectionFieldLimit(activeSection.key, "lowerTitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, lowerTitle: value }))} />
                  <TextField label="Bottom Statement" value={activeSection.bottomStatement} multiline maxLength={getSectionFieldLimit(activeSection.key, "bottomStatement")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, bottomStatement: value }))} />
                  <div className="sm:col-span-2"><TextField label="Lower Section Description" value={activeSection.lowerDescription} multiline maxLength={getSectionFieldLimit(activeSection.key, "lowerDescription")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, lowerDescription: value }))} /></div>
                  <ImageField label="Moksha Sewa Logo" value={activeSection.logoImage} uploading={uploadingKey === "trust:logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, logoImage: value }))} onUpload={(file) => uploadImage("trust:logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, logoImage: url })))} />
                  <ImageField label="Namo Gange Logo" value={activeSection.partnerLogoImage} uploading={uploadingKey === "trust:partner-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: value }))} onUpload={(file) => uploadImage("trust:partner-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: url })))} />
                  <ImageField label="Namo Gange Trust Logo" value={activeSection.secondaryLogoImage} uploading={uploadingKey === "trust:secondary-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryLogoImage: value }))} onUpload={(file) => uploadImage("trust:secondary-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, secondaryLogoImage: url })))} />
                  <ImageField label="Sacred River Ghat Image" value={activeSection.secondaryImage} uploading={uploadingKey === "trust:secondary-image"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryImage: value }))} onUpload={(file) => uploadImage("trust:secondary-image", file, (url) => setSection(activeSection.key, (section) => ({ ...section, secondaryImage: url })))} />
                </div>
              </div>
            )}

            {activePage === "landing" && activeSection.key === "final-act" && (
              <div className="mt-6 border-t border-surface-border pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Section Logos</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ImageField label="Moksha Sewa Logo" value={activeSection.logoImage} uploading={uploadingKey === "final-act:logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, logoImage: value }))} onUpload={(file) => uploadImage("final-act:logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, logoImage: url })))} />
                  <ImageField label="Namo Gange Logo" value={activeSection.partnerLogoImage} uploading={uploadingKey === "final-act:partner-logo"} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: value }))} onUpload={(file) => uploadImage("final-act:partner-logo", file, (url) => setSection(activeSection.key, (section) => ({ ...section, partnerLogoImage: url })))} />
                </div>
              </div>
            )}

            {activePage === "landing" && (activeSection.key === "family-need" || activeSection.key === "compassion" || activeSection.key === "practical-support") && (
              <div className="mt-6 border-t border-surface-border pt-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Additional Visible Content</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {activeSection.key === "family-need" && <>
                    <TextField label="Support Message" value={activeSection.supportTitle} multiline maxLength={getSectionFieldLimit(activeSection.key, "supportTitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, supportTitle: value }))} />
                    <TextField label="Support Submessage" value={activeSection.supportDescription} multiline maxLength={getSectionFieldLimit(activeSection.key, "supportDescription")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, supportDescription: value }))} />
                    <TextField label="Region Intro" value={activeSection.regionDescription} maxLength={getSectionFieldLimit(activeSection.key, "regionDescription")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, regionDescription: value }))} />
                    <TextField label="Region Name" value={activeSection.regionTitle} maxLength={getSectionFieldLimit(activeSection.key, "regionTitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, regionTitle: value }))} />
                  </>}
                  {activeSection.key === "compassion" && <>
                    <TextField label="Phone CTA Label" value={activeSection.phoneLabel} maxLength={getSectionFieldLimit(activeSection.key, "phoneLabel")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, phoneLabel: value }))} />
                    <TextField label="Phone Number" value={activeSection.phoneNumber} maxLength={getSectionFieldLimit(activeSection.key, "phoneNumber")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, phoneNumber: value }))} />
                    <TextField label="Trust Card Title" value={activeSection.secondaryTitle} maxLength={getSectionFieldLimit(activeSection.key, "secondaryTitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryTitle: value }))} />
                    <TextField label="Trust Card Description" value={activeSection.secondaryDescription} maxLength={getSectionFieldLimit(activeSection.key, "secondaryDescription")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, secondaryDescription: value }))} />
                  </>}
                  {activeSection.key === "practical-support" && <>
                    <TextField label="Slogan" value={activeSection.sloganTitle} maxLength={getSectionFieldLimit(activeSection.key, "sloganTitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, sloganTitle: value }))} />
                    <TextField label="Immediate Help Title" value={activeSection.immediateHelpTitle} maxLength={getSectionFieldLimit(activeSection.key, "immediateHelpTitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, immediateHelpTitle: value }))} />
                    <TextField label="Immediate Help Description" value={activeSection.immediateHelpDescription} multiline maxLength={getSectionFieldLimit(activeSection.key, "immediateHelpDescription")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, immediateHelpDescription: value }))} />
                    <TextField label="Support Mission Title" value={activeSection.supportMissionTitle} maxLength={getSectionFieldLimit(activeSection.key, "supportMissionTitle")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, supportMissionTitle: value }))} />
                    <TextField label="Support Mission Description" value={activeSection.supportMissionDescription} multiline maxLength={getSectionFieldLimit(activeSection.key, "supportMissionDescription")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, supportMissionDescription: value }))} />
                    <TextField label="Support Now Label" value={activeSection.supportNowLabel} maxLength={getSectionFieldLimit(activeSection.key, "supportNowLabel")} onChange={(value) => setSection(activeSection.key, (section) => ({ ...section, supportNowLabel: value }))} />
                  </>}
                </div>
              </div>
            )}

            <MoreSectionFields
              section={activeSection}
              uploadingKey={uploadingKey}
              onTextChange={(field, value) =>
                setSection(activeSection.key, (section) => ({
                  ...section,
                  [field]: value,
                }))
              }
              onImageChange={(field, value) =>
                setSection(activeSection.key, (section) => ({
                  ...section,
                  [field]: value,
                }))
              }
              onImageUpload={(field, file) =>
                uploadImage(`${activeSection.key}:${field}`, file, (url) =>
                  setSection(activeSection.key, (section) => ({
                    ...section,
                    [field]: url,
                  }))
                )
              }
            />

            <div className="mt-6 border-t border-surface-border pt-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Cards / FAQs / Stats</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setSection(activeSection.key, (section) => ({
                      ...section,
                      items: [...(section.items ?? []), { title: "New Item", description: "" }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {(activeSection.items ?? []).map((item: LandingSectionItem, itemIndex: number) => (
                  <CollapsibleCard key={`${activeSection.key}-${itemIndex}`} title={`Item ${itemIndex + 1}`} headerAction={<div className="flex items-center justify-between">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: (section.items ?? []).filter((_, index) => index !== itemIndex),
                          }))
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button></div>}><div className="grid gap-3 sm:grid-cols-2">
                      <TextField
                        label="Title / Question"
                        value={item.title}
                        maxLength={getItemFieldLimit(activeSection.key, itemIndex, "title")}
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, title: value })),
                          }))
                        }
                      />
                      <TextField
                        label="Label"
                        value={item.label}
                        maxLength={getItemFieldLimit(activeSection.key, itemIndex, "label")}
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, label: value })),
                          }))
                        }
                      />
                      <TextField
                        label="Value"
                        value={item.value}
                        maxLength={getItemFieldLimit(activeSection.key, itemIndex, "value")}
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, value })),
                          }))
                        }
                      />
                      <TextField
                        label="Link"
                        value={item.href}
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, href: value })),
                          }))
                        }
                      />
                      <TextField
                        label="Button Label"
                        value={item.buttonLabel}
                        maxLength={getItemFieldLimit(activeSection.key, itemIndex, "buttonLabel")}
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, buttonLabel: value })),
                          }))
                        }
                      />
                      <TextField
                        label="Button Link"
                        value={item.buttonHref}
                        onChange={(value) =>
                          setSection(activeSection.key, (section) => ({
                            ...section,
                            items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, buttonHref: value })),
                          }))
                        }
                      />
                      <div className="sm:col-span-2">
                        <TextField
                          label="Description / Answer"
                          value={item.description}
                          multiline
                          maxLength={getItemFieldLimit(activeSection.key, itemIndex, "description")}
                          onChange={(value) =>
                            setSection(activeSection.key, (section) => ({
                              ...section,
                              items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, description: value })),
                            }))
                          }
                        />
                      </div>
                      {activeSection.key === "practical-support" && (
                        <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
                          {[0, 1, 2].map((featureIndex) => (
                            <TextField
                              key={featureIndex}
                              label={`Feature ${featureIndex + 1}`}
                              value={item.features?.[featureIndex]}
                              maxLength={80}
                              onChange={(value) =>
                                setSection(activeSection.key, (section) => ({
                                  ...section,
                                  items: updateAt(section.items ?? [], itemIndex, (current) => ({
                                    ...current,
                                    features: updateAt(current.features ?? [], featureIndex, () => value),
                                  })),
                                }))
                              }
                            />
                          ))}
                        </div>
                      )}
                      <div className="sm:col-span-2">
                        <ImageField
                          label="Item Image 1 (Main)"
                          value={item.image}
                          uploading={uploadingKey === `${activeSection.key}:item:${itemIndex}`}
                          onChange={(value) =>
                            setSection(activeSection.key, (section) => ({
                              ...section,
                              items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, image: value })),
                            }))
                          }
                          onUpload={(file) =>
                            uploadImage(`${activeSection.key}:item:${itemIndex}`, file, (url) =>
                              setSection(activeSection.key, (section) => ({
                                ...section,
                                items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, image: url })),
                              }))
                            )
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <ImageField
                          label="Item Image 2"
                          value={item.secondaryImage}
                          uploading={uploadingKey === `${activeSection.key}:item:${itemIndex}:secondary`}
                          onChange={(value) =>
                            setSection(activeSection.key, (section) => ({
                              ...section,
                              items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, secondaryImage: value })),
                            }))
                          }
                          onUpload={(file) =>
                            uploadImage(`${activeSection.key}:item:${itemIndex}:secondary`, file, (url) =>
                              setSection(activeSection.key, (section) => ({
                                ...section,
                                items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, secondaryImage: url })),
                              }))
                            )
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <ImageField
                          label="Item Image 3"
                          value={item.tertiaryImage}
                          uploading={uploadingKey === `${activeSection.key}:item:${itemIndex}:tertiary`}
                          onChange={(value) =>
                            setSection(activeSection.key, (section) => ({
                              ...section,
                              items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, tertiaryImage: value })),
                            }))
                          }
                          onUpload={(file) =>
                            uploadImage(`${activeSection.key}:item:${itemIndex}:tertiary`, file, (url) =>
                              setSection(activeSection.key, (section) => ({
                                ...section,
                                items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, tertiaryImage: url })),
                              }))
                            )
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <ImageField
                          label="Item Image 4"
                          value={item.quaternaryImage}
                          uploading={uploadingKey === `${activeSection.key}:item:${itemIndex}:quaternary`}
                          onChange={(value) =>
                            setSection(activeSection.key, (section) => ({
                              ...section,
                              items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, quaternaryImage: value })),
                            }))
                          }
                          onUpload={(file) =>
                            uploadImage(`${activeSection.key}:item:${itemIndex}:quaternary`, file, (url) =>
                              setSection(activeSection.key, (section) => ({
                                ...section,
                                items: updateAt(section.items ?? [], itemIndex, (current) => ({ ...current, quaternaryImage: url })),
                              }))
                            )
                          }
                        />
                      </div>
                    </div></CollapsibleCard>))}</div></div></Card>
        </div>
      )}
    </div>
  );
}