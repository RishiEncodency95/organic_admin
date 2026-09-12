export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002").replace(/\/$/, "");

export type PageStatus = "Published" | "Draft";

export type PageType = "home" | "page" | "people";

export interface CmsPage {
  configKey?: string;
  id: number;
  title: string;
  slug: string;
  author: string;
  status: PageStatus;
  seoScore: number;
  rating: "Excellent" | "Good" | "Needs Work";
  updated: string;
  updatedBy: string;
  type: PageType;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    h1Tag?: string;
    breadcrumbName?: string;
    schemaMarkup?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    canonicalTag?: string;
    openGraphTags?: string;
    isActive?: boolean;
  };
}
export function getCmsPageRouteKey(page: Pick<CmsPage, "title">): string {
  return page.title
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findCmsPageByRouteKey(pages: CmsPage[], routeKey?: string): CmsPage | undefined {
  if (!routeKey) return undefined;
  const decoded = decodeURIComponent(routeKey).toLowerCase().trim();
  const numericId = Number(decoded);
  return pages.find((page) => {
    if (Number.isInteger(numericId) && page.id === numericId) return true;
    if (getCmsPageRouteKey(page) === decoded) return true;
    if (page.configKey && page.configKey.toLowerCase() === decoded) return true;
    const cleanSlug = page.slug.replace(/^\//, "").toLowerCase();
    if (cleanSlug && cleanSlug === decoded) return true;
    return false;
  });
}

type SettingsPageConfig = {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    h1Tag?: string;
    breadcrumbName?: string;
    schemaMarkup?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    canonicalTag?: string;
    openGraphTags?: string;
    isActive?: boolean;
  };
  sections?: Array<{ enabled?: boolean }>;
};

const pageDefinitions = [
  ["landingPage", "Home", "/", "home"],
  ["aboutPage", "About Expo", "/about", "page"],
  ["advisoryPage", "Advisory Board Members", "/about/advisory_board_member", "page"],
  ["nominateAdvisoryPage", "Nominate Advisory Board Member", "/about/nominate_advisory_board", "page"],
  ["supportServicesPage", "Support Services Helpdesk", "/about/suport_services", "page"],
  ["blogPage", "Blogs & News", "/blog", "page"],
  ["participateAsExhibitorPage", "Participate as Exhibitor", "/participate-as-exhibitor", "page"],
  ["exhibitionCategoriesPage", "Exhibition Categories", "/exhibition-categories", "page"],
  ["bookAStandPage", "BOOK A STALL", "/registration/book-a-stand", "page"],
  ["visitorRegistrationPage", "REGISTER AS VISITOR", "/registration/visitor-registration", "page"],
  ["delegateRegistrationPage", "DELEGATE REGISTRATION", "/registration/delegate-registration", "page"],
  ["buyerRegistrationPage", "REGISTER AS BUYER", "/registration/buyer-registration", "page"],
  ["sponsorshipPage", "SPONSORSHIP OPPORTUNITIES", "/sponsorship", "page"],
  ["contactPage", "TALK TO EXPO ADVISOR", "/contact", "page"],
  ["termsAndConditionsPage", "Terms & Conditions", "/registration/terms-and-conditions", "page"],
  ["privacyPolicyPage", "Privacy Policy", "/registration/privacy-policy", "page"],
  ["refundPolicyPage", "Refund Policy", "/registration/refund-policy", "page"],
  ["whyVisitPage", "Why Visit ORGANIC EXPO", "/participate/why-visit", "page"],
  ["whyExhibitPage", "Why Exhibit at ORGANIC EXPO?", "/participate/why-exhibit", "page"],
  ["msmePage", "MSME PMS Scheme", "/participate/msme", "page"],
  ["msmeEligibilityCheckPage", "PMS Eligibility Check Calculator", "/participate/msme/eligibility-check", "page"],
  ["msmeApplyPage", "Apply for PMS Support Stepper", "/participate/msme/apply", "page"],
  ["exhibitorsPage", "Exhibitor List", "/exhibitors", "page"],
  ["buyerSellerMeetPage", "Buyer-Seller Meet", "/buyer-seller-meet", "page"],
  ["galleryPage", "Glimpses & Gallery", "/gallery", "page"],
  ["awardsPage", "Excellence Awards", "/awards", "page"],
  ["awardsNominationPage", "Awards Nomination Form", "/awards/nominations", "page"],
  ["epromotionPage", "E-Promotion Opportunity", "/e-promotion-web", "page"],
  ["partnershipPage", "Partnership / Collaboration", "/partnership", "page"],
  ["servicesPage", "Our Services", "/our-services", "page"],
] as const;

function seoScore(config: SettingsPageConfig): number {
  const seo = config.seo ?? {};
  const checks = [
    Boolean(seo.metaTitle?.trim()),
    Boolean(seo.metaDescription?.trim()),
    Boolean(seo.h1Tag?.trim()),
    Boolean(seo.schemaMarkup?.trim()),
    seo.robotsIndex !== false,
    Boolean(config.sections?.length),
    Boolean(config.sections?.some((section) => section.enabled !== false)),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function cmsPagesFromSettings(settings: Record<string, unknown>): CmsPage[] {
  const updatedAt = typeof settings.updatedAt === "string" ? new Date(settings.updatedAt) : new Date();
  return pageDefinitions.map(([key, title, slug, type], index) => {
    const config = (settings[key] as SettingsPageConfig | undefined) ?? {};
    const score = seoScore(config);
    const status: PageStatus = config.sections && config.sections.length > 0
      ? (config.sections.some((section) => section.enabled !== false) ? "Published" : "Draft")
      : "Published";
    return {
      id: index + 1,
      configKey: key,
      title,
      slug,
      author: "Admin User",
      status,
      seoScore: score,
      rating: score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Work",
      updated: updatedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      updatedBy: "Admin User",
      type,
      seo: config.seo,
    };
  });
}

export function getCmsPageDefinition(id: number) {
  const definition = pageDefinitions[id - 1];
  if (!definition) return null;
  const [configKey, title, slug, type] = definition;
  return { configKey, title, slug, type };
}

export const cmsPages: CmsPage[] = cmsPagesFromSettings({});
