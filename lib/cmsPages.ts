export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mokshasewa.org").replace(/\/$/, "");

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

export function findCmsPageByRouteKey(pages: CmsPage[], routeKey: string): CmsPage | undefined {
  const numericId = Number(routeKey);
  return pages.find((page) =>
    (Number.isInteger(numericId) && page.id === numericId) || getCmsPageRouteKey(page) === routeKey.toLowerCase(),
  );
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
  };
  sections?: Array<{ enabled?: boolean }>;
};

const pageDefinitions = [
  ["landingPage", "Home", "/", "home"],
  ["aboutPage", "About Us", "/about", "page"],
  ["servicesPage", "Our Services", "/our-services", "page"],
  ["ambulancePage", "Ambulance Sewa", "/ambulanceservices", "page"],
  ["panditPage", "Vedic Pandit", "/panditservices", "page"],
  ["funeralPage", "Funeral Management", "/furalservices", "page"],
  ["funeralDecorationPage", "Funeral Decoration", "/furaldecoration", "page"],
  ["prayerHallPage", "Prayer Hall", "/prayerhallservices", "page"],
  ["specialServicePage", "Special Services", "/specialservices", "page"],
  ["callingRelativesPage", "Calling Relatives", "/callingrelativesservices", "page"],
  ["harsevanPage", "Harsevan Support", "/harsevanservices", "page"],
  ["unclaimedBodyPage", "Unclaimed Body Sewa", "/unclaimed-body-sewa", "people"],
  ["volunteerPage", "Volunteer", "/volunteer/register", "people"],
  ["partnershipPage", "Partnership", "/partnership", "people"],
  ["csrPage", "CSR", "/csr", "people"],
  ["requestHelpPage", "Request Sewa Help", "/request-help", "people"],
  ["donationPage", "Donation", "/donation", "page"],
  ["contactPage", "Contact Us", "/contact", "page"],
  ["trackPage", "Track Status", "/track", "page"],
  ["privacyPage", "Privacy Policy", "/privacy-policy", "page"],
  ["termsPage", "Terms & Conditions", "/terms", "page"],
  ["refundPage", "Refund Policy", "/refund-policy", "page"],
  ["conductPage", "Code of Conduct", "/code-of-conduct", "page"],
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
  return pageDefinitions.flatMap(([key, title, slug, type], index) => {
    const config = settings[key] as SettingsPageConfig | undefined;
    if (!config) return [];
    const score = seoScore(config);
    const status: PageStatus = config.sections?.some((section) => section.enabled !== false) ? "Published" : "Draft";
    return [{
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
    }];
  });
}

export function getCmsPageDefinition(id: number) {
  const definition = pageDefinitions[id - 1];
  if (!definition) return null;
  const [configKey, title, slug, type] = definition;
  return { configKey, title, slug, type };
}

export const cmsPages: CmsPage[] = [
  {
    id: 1,
    title: "Home",
    slug: "/",
    author: "Admin User",
    status: "Published",
    seoScore: 92,
    rating: "Excellent",
    updated: "Today, 10:45 AM",
    updatedBy: "Admin User",
    type: "home",
  },
  {
    id: 2,
    title: "About Us",
    slug: "/about-us",
    author: "Admin User",
    status: "Published",
    seoScore: 88,
    rating: "Good",
    updated: "Yesterday, 04:30 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 3,
    title: "Our Services",
    slug: "/our-services",
    author: "Admin User",
    status: "Published",
    seoScore: 90,
    rating: "Excellent",
    updated: "28 May 2026, 11:20 AM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 4,
    title: "How We Help",
    slug: "/how-we-help",
    author: "Seva Team",
    status: "Published",
    seoScore: 85,
    rating: "Good",
    updated: "28 May 2026, 09:15 AM",
    updatedBy: "Seva Team",
    type: "people",
  },
  {
    id: 5,
    title: "Who We Help",
    slug: "/who-we-help",
    author: "Admin User",
    status: "Published",
    seoScore: 87,
    rating: "Good",
    updated: "27 May 2026, 06:40 PM",
    updatedBy: "Admin User",
    type: "people",
  },
  {
    id: 6,
    title: "How Moksha Sewa Works",
    slug: "/how-sewa-works",
    author: "Admin User",
    status: "Published",
    seoScore: 89,
    rating: "Good",
    updated: "27 May 2026, 02:10 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 7,
    title: "Request Sewa Help",
    slug: "/request-sewa-help",
    author: "Seva Team",
    status: "Published",
    seoScore: 84,
    rating: "Good",
    updated: "26 May 2026, 05:25 PM",
    updatedBy: "Admin Team",
    type: "people",
  },
  {
    id: 8,
    title: "Sewa & Support",
    slug: "/sewa-support",
    author: "Seva Team",
    status: "Published",
    seoScore: 86,
    rating: "Good",
    updated: "26 May 2026, 10:30 AM",
    updatedBy: "Seva Team",
    type: "page",
  },
  {
    id: 9,
    title: "Our Work",
    slug: "/our-work",
    author: "Admin User",
    status: "Published",
    seoScore: 83,
    rating: "Good",
    updated: "25 May 2026, 04:45 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 10,
    title: "Join Us",
    slug: "/join-us",
    author: "Admin User",
    status: "Draft",
    seoScore: 72,
    rating: "Needs Work",
    updated: "24 May 2026, 01:30 PM",
    updatedBy: "Admin User",
    type: "people",
  },
];
