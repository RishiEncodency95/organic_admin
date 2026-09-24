import { FieldLabel, ImageUploadField, PdfUploadField, TextInput, Textarea, Toggle, VideoUploadField } from "../fields";
import {
  IMAGE_KEY_PATTERN,
  LONG_TEXT_KEY_PATTERN,
  SECTION_SKIP_KEYS,
  VIDEO_KEY_PATTERN,
  humanizeKey,
} from "./sectionFieldHelpers";

export function SectionFieldsEditor({
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
      if (
        (section.key === "why-exhibit-hero" || section.name === "HeroSection") &&
        (key === "date" || key === "location")
      ) {
        return false;
      }
      if (
        (section.key === "industry-segments" || section.name === "IndustrySegments") &&
        (key === "description" || key === "shortDescription" || key === "buttonLabel" || key === "buttonHref")
      ) {
        return false;
      }
      if (
        (section.key === "why-visit-matters" || section.name === "WhyVisitMatters") &&
        key === "eyebrow"
      ) {
        return false;
      }
      if (
        (section.key === "testimonials-section" || section.name === "TestimonialsSection") &&
        (key === "subtitle" || key === "description" || key === "shortDescription")
      ) {
        return false;
      }
      if (
        (section.key === "awards-hero" || section.name === "Awards Hero Banner") &&
        key === "shortDescription"
      ) {
        return false;
      }
      if (
        (section.key === "awards-stats" || section.name === "Key Statistics Strip") &&
        (key === "eyebrow" || key === "title")
      ) {
        return false;
      }
      if (
        (section.key === "awards-about" || section.name === "About the Awards") &&
        (key === "image" || key === "imageAlt")
      ) {
        return false;
      }
      if (
        (section.key === "awards-categories" || section.name === "Award Sector Categories") &&
        (key === "description" || key === "shortDescription")
      ) {
        return false;
      }
      if (
        (section.key === "awards-grand-awards" || section.name === "Prestigious Grand Awards") &&
        (key === "description" || key === "shortDescription")
      ) {
        return false;
      }
      if (
        (section.key === "awards-process" || section.name === "Our Evaluation Process") &&
        (key === "description" || key === "shortDescription")
      ) {
        return false;
      }
      if (
        (section.key === "awards-nomination-hero" || section.name === "Awards Nomination Form Hero") &&
        key === "eyebrow"
      ) {
        return false;
      }
      if (
        (section.key === "gallery-hero" || section.name === "HeroSection") &&
        (key === "shortDescription" || key === "rightImage")
      ) {
        return false;
      }
      if (
        (section.key === "about-hero" || section.name === "AboutHero") &&
        key === "secondaryImage"
      ) {
        return false;
      }
      if (
        (section.key === "home-about" || section.name === "HomeAbout (Who We Are)") &&
        key === "secondaryImage"
      ) {
        return false;
      }
      if (
        (section.key === "advisory-hero" || section.name === "AdvisoryHero") &&
        key === "secondaryImage"
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
        const isLong = LONG_TEXT_KEY_PATTERN.test(key) || key === "mapEmbedUrl";
        const isImage = IMAGE_KEY_PATTERN.test(key) && !/alt/i.test(key);
        const isVideo = VIDEO_KEY_PATTERN.test(key) && key !== "mapEmbedUrl";
        const isPdf =
          (section.key === "why-participate" && key === "secondaryButtonHref") ||
          /brochure|pdf/i.test(key) ||
          (typeof value === "string" && /\.pdf$/i.test(value));
        const isDate =
          section.key !== "awards-hero" &&
          section.key !== "awards-nomination-hero" &&
          /date|time/i.test(key) &&
          typeof value === "string";
        const fieldLimit = isLong ? 450 : 140;
        const label =
          (section.key === "about-hero" || section.name === "AboutHero") && key === "image"
            ? "Background Image (Upload)"
            : (section.key === "home-about" || section.name === "HomeAbout (Who We Are)") && key === "image"
              ? "Left Image (Upload)"
              : (section.key === "advisory-hero" || section.name === "AdvisoryHero") && key === "image"
                ? "Background Image (Upload)"
                : (section.key === "sponsorship-hero" || section.name === "Sponsorship Hero & Key Stats") && key === "image"
                  ? "Background Image (Upload)"
                  : humanizeKey(key);

        return (
          <div
            key={key}
            className={isLong || isImage || isVideo || isPdf || typeof value === "boolean" || /^keyPoint/i.test(key) || /alt/i.test(key) ? "col-span-2" : ""}
          >
            <FieldLabel>{label}</FieldLabel>

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
              <>
                <Textarea
                  value={String(value)}
                  onChange={(next: string) => onFieldChange(key, next)}
                  rows={key === "mapEmbedUrl" ? 2 : 3}
                  noLimit={section.key === "why-visit-matters" || key === "mapEmbedUrl"}
                />
                {key === "mapEmbedUrl" && (
                  <p className="mt-1 text-[9px] text-[#64748b]">
                    Google Maps → Share → Embed a map → paste the full &lt;iframe&gt; code or just the src link here.
                  </p>
                )}
              </>
            ) : (
              <TextInput
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
                maxLength={section.key === "why-visit-matters" ? 5000 : 120}
                hideLimit={section.key === "why-visit-matters"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
