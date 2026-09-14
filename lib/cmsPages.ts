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

const routeAliases: Record<string, string> = {
  "home": "landingPage",
  "homepage": "landingPage",
  "about": "aboutPage",
  "about-us": "aboutPage",
  "about-expo": "aboutPage",
  "advisory": "advisoryPage",
  "advisory-board": "advisoryPage",
  "advisory-board-members": "advisoryPage",
  "advisory_board_member": "advisoryPage",
  "nominate-advisory": "nominateAdvisoryPage",
  "nominate-advisory-board": "nominateAdvisoryPage",
  "nominate_advisory_board": "nominateAdvisoryPage",
  "support-services": "supportServicesPage",
  "support-services-helpdesk": "supportServicesPage",
  "suport_services": "supportServicesPage",
  "blog": "blogPage",
  "blogs": "blogPage",
  "blogs-and-news": "blogPage",
  "participate-as-exhibitor": "participateAsExhibitorPage",
  "exhibition-categories": "exhibitionCategoriesPage",
  "book-a-stand": "bookAStandPage",
  "book-a-stall": "bookAStandPage",
  "visitor-registration": "visitorRegistrationPage",
  "register-as-visitor": "visitorRegistrationPage",
  "delegate-registration": "delegateRegistrationPage",
  "buyer-registration": "buyerRegistrationPage",
  "register-as-buyer": "buyerRegistrationPage",
  "sponsorship": "sponsorshipPage",
  "sponsorship-opportunities": "sponsorshipPage",
  "contact": "contactPage",
  "contact-us": "contactPage",
  "talk-to-expo-advisor": "contactPage",
  "terms": "termsAndConditionsPage",
  "terms-and-conditions": "termsAndConditionsPage",
  "privacy": "privacyPolicyPage",
  "privacy-policy": "privacyPolicyPage",
  "refund": "refundPolicyPage",
  "refund-policy": "refundPolicyPage",
  "why-visit": "whyVisitPage",
  "why-visit-organic-expo": "whyVisitPage",
  "why-exhibit": "whyExhibitPage",
  "why-exhibit-at-organic-expo": "whyExhibitPage",
  "msme": "msmePage",
  "msme-pms-scheme": "msmePage",
  "msme-eligibility-check": "msmeEligibilityCheckPage",
  "eligibility-check": "msmeEligibilityCheckPage",
  "pms-eligibility-check-calculator": "msmeEligibilityCheckPage",
  "msme-apply": "msmeApplyPage",
  "apply-for-pms-support-stepper": "msmeApplyPage",
  "exhibitor": "exhibitorsPage",
  "exhibitors": "exhibitorsPage",
  "exhibitor-list": "exhibitorsPage",
  "exhibitors-list": "exhibitorsPage",
  "buyer-seller": "buyerSellerMeetPage",
  "buyer-seller-meet": "buyerSellerMeetPage",
  "gallery": "galleryPage",
  "glimpses-and-gallery": "galleryPage",
  "awards": "awardsPage",
  "excellence-awards": "awardsPage",
  "awards-nominations": "awardsNominationPage",
  "awards-nomination-form": "awardsNominationPage",
  "nominations": "awardsNominationPage",
  "epromotion": "epromotionPage",
  "e-promotion": "epromotionPage",
  "e-promotion-opportunity": "epromotionPage",
  "e-promotion-web": "epromotionPage",
  "partnership": "partnershipPage",
  "partnership-collaboration": "partnershipPage",
  "services": "servicesPage",
  "our-services": "servicesPage",
  "exhibitor-login": "exhibitorLoginPage",
  "exhibitor-login-portal": "exhibitorLoginPage",
  "buyer-login": "buyerLoginPage",
  "buyer-login-portal": "buyerLoginPage",
  "delegates-login": "delegatesLoginPage",
  "delegates-login-portal": "delegatesLoginPage",
  "login": "userLoginPage",
  "user-login": "userLoginPage",
  "user-login-portal": "userLoginPage",
  "msme-participation-details": "msmeApplyParticipationDetailsPage",
  "pms-participation-details": "msmeApplyParticipationDetailsPage",
  "msme-payment": "msmeApplyPaymentPage",
  "pms-payment-details": "msmeApplyPaymentPage",
  "printing-branding-partner": "printingBrandingPartnerPage",
  "travel-partner": "travelPartnerPage",
  "manpower-supply-partner": "manpowerSupplyPartnerPage",
  "logistics-partner": "logisticsPartnerPage",
  "stall-design-partner": "stallDesignPartnerPage",
  "hotel-stay-partner": "hotelStayPartnerPage",
};

export function findCmsPageByRouteKey(pages: CmsPage[], routeKey?: string): CmsPage | undefined {
  if (!routeKey) return undefined;
  const decoded = decodeURIComponent(routeKey).toLowerCase().trim();
  const numericId = Number(decoded);

  // 1. Numeric ID
  if (Number.isInteger(numericId)) {
    const byId = pages.find((p) => p.id === numericId);
    if (byId) return byId;
  }

  // 2. Direct alias mapping
  const aliasConfigKey = routeAliases[decoded];
  if (aliasConfigKey) {
    const byAlias = pages.find((p) => p.configKey?.toLowerCase() === aliasConfigKey.toLowerCase());
    if (byAlias) return byAlias;
  }

  // 3. Exact route key from title
  const byTitleRouteKey = pages.find((p) => getCmsPageRouteKey(p) === decoded);
  if (byTitleRouteKey) return byTitleRouteKey;

  // 4. Exact configKey
  const byConfigKey = pages.find((p) => p.configKey && p.configKey.toLowerCase() === decoded);
  if (byConfigKey) return byConfigKey;

  // 5. Full slug match (e.g. /participate/why-exhibit or participate/why-exhibit)
  const bySlug = pages.find((p) => {
    const cleanSlug = p.slug.replace(/^\//, "").toLowerCase();
    return cleanSlug && cleanSlug === decoded;
  });
  if (bySlug) return bySlug;

  // 6. Last segment of slug (e.g. "why-exhibit" matches "/participate/why-exhibit")
  const byLastSegment = pages.find((p) => {
    const cleanSlug = p.slug.replace(/^\//, "").toLowerCase();
    const lastPart = cleanSlug.split("/").pop()?.toLowerCase();
    return lastPart && lastPart === decoded;
  });
  if (byLastSegment) return byLastSegment;

  // 7. Slug with slashes converted to hyphens
  const byHyphenatedSlug = pages.find((p) => {
    const cleanSlug = p.slug.replace(/^\//, "").toLowerCase().replace(/\//g, "-");
    return cleanSlug && cleanSlug === decoded;
  });
  if (byHyphenatedSlug) return byHyphenatedSlug;

  // 8. Loose / partial search on routeKey or title
  const byPartial = pages.find((p) => {
    const pageRouteKey = getCmsPageRouteKey(p);
    return pageRouteKey.includes(decoded) || decoded.includes(pageRouteKey);
  });
  if (byPartial) return byPartial;

  return undefined;
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
  ["whyExhibitPage", "Why Exhibit at ORGANIC EXPO?", "/why-exhibit", "page"],
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
  ["exhibitorLoginPage", "Exhibitor Login Portal", "/exhibitor-login", "page"],
  ["buyerLoginPage", "Buyer Login Portal", "/buyer-login", "page"],
  ["delegatesLoginPage", "Delegates Login Portal", "/delegates-login", "page"],
  ["userLoginPage", "User Login Portal", "/login", "page"],
  ["msmeApplyParticipationDetailsPage", "PMS Participation Details", "/participate/msme/apply/participation-details", "page"],
  ["msmeApplyPaymentPage", "PMS Payment Details", "/participate/msme/apply/payment", "page"],
  ["printingBrandingPartnerPage", "Printing & Branding Partner", "/partnership/printing-branding-partner", "page"],
  ["travelPartnerPage", "Travel Partner", "/partnership/travel-partner", "page"],
  ["manpowerSupplyPartnerPage", "Manpower Supply Partner", "/partnership/manpower-supply-partner", "page"],
  ["logisticsPartnerPage", "Logistics Partner", "/partnership/logistics-partner", "page"],
  ["stallDesignPartnerPage", "Stall Design Partner", "/partnership/stall-design-partner", "page"],
  ["hotelStayPartnerPage", "Hotel & Stay Partner", "/partnership/hotel-stay-partner", "page"],
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
