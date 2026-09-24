/* =========================================================
   GENERIC SECTION FIELDS EDITOR — shared helpers
   Renders an input for every scalar field a section has, so any of the
   18 section shapes in the backend (hero, footer, faq, ...) becomes
   editable without a bespoke form per section.
========================================================= */

export const SECTION_SKIP_KEYS = new Set(["_id", "key", "slides", "items", "enabled", "name"]);
export const LONG_TEXT_KEY_PATTERN = /description|shortDescription|subtitle|quote|message|statement|notice|bullets/i;
export const IMAGE_KEY_PATTERN = /image|img|logo|photo|banner|picture|bg|avatar|thumbnail/i;
export const VIDEO_KEY_PATTERN = /video|youtube|embed|vimeo|clip|mediaUrl/i;

export function humanizeKey(key: string) {
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
  if (key === "feature1") return "Key Feature 1";
  if (key === "feature2") return "Key Feature 2";
  if (key === "feature3") return "Key Feature 3";
  if (key === "shortDescription") return "Short Description";
  if (key === "description") return "Short Description";
  if (key === "titleMain") return "Title Main";
  if (key === "titleHighlight") return "Title Highlight";
  if (key === "descriptionPrefix") return "Description Prefix";
  if (key === "buttonText") return "Button Text";
  if (key === "buttonHref") return "Button Link (Href)";
  if (key === "exploreText") return "Explore Text";
  if (key === "href") return "Explore Link (Href)";
  if (key === "bgImage") return "Hero Background Banner Image (Upload / URL)";
  if (key === "image") return "Right Image (Upload / URL)";
  if (key === "iconImage") return "Top Image / Icon (Upload / URL)";
  if (key === "mapEmbedUrl") return "Map Embed URL (Google Maps 'Embed a map' link)";
  if (key === "main") return "Highlight Title";
  if (key === "sub") return "Highlight Subtitle";
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}
