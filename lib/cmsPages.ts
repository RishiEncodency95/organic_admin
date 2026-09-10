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
  ["advisoryPage", "Advisory Board", "/advisory-board", "page"],
  ["blogPage", "Blogs & News", "/blog", "page"],
  ["whyVisitPage", "Why Visit", "/participate/why-visit", "page"],
  ["whyExhibitPage", "Why Exhibit", "/participate/why-exhibit", "page"],
  ["msmePage", "MSME PMS Scheme", "/participate/msme", "page"],
  ["exhibitorsPage", "Exhibitors List", "/exhibitors", "page"],
  ["buyerSellerMeetPage", "Buyer-Seller Meet", "/buyer-seller-meet", "page"],
  ["galleryPage", "Glimpses & Gallery", "/gallery", "page"],
  ["awardsPage", "Awards", "/awards", "page"],
  ["sponsorshipPage", "Sponsorship Opportunities", "/sponsorship", "page"],
  ["epromotionPage", "E-Promotion Web", "/e-promotion-web", "page"],
  ["partnershipPage", "Partnership / Collaboration", "/partnership", "page"],
  ["servicesPage", "Our Services", "/our-services", "page"],
  ["contactPage", "Contact Us", "/contact", "page"],
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
    const status: PageStatus = config.sections?.some((section) => section.enabled !== false) ? "Published" : "Draft";
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

export const cmsPages: CmsPage[] = [
  {
    id: 1,
    configKey: "landingPage",
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
    configKey: "aboutPage",
    title: "About Us",
    slug: "/about",
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
    configKey: "advisoryPage",
    title: "Advisory Board",
    slug: "/advisory-board",
    author: "Admin User",
    status: "Published",
    seoScore: 89,
    rating: "Good",
    updated: "Today, 11:15 AM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 4,
    configKey: "blogPage",
    title: "Blogs & News",
    slug: "/blog",
    author: "Admin User",
    status: "Published",
    seoScore: 91,
    rating: "Excellent",
    updated: "Today, 12:00 PM",
    updatedBy: "Admin User",
    type: "page",
  },

  {
    id: 6,
    configKey: "whyVisitPage",
    title: "Why Visit",
    slug: "/participate/why-visit",
    author: "Admin User",
    status: "Published",
    seoScore: 92,
    rating: "Excellent",
    updated: "Today, 12:45 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 7,
    configKey: "whyExhibitPage",
    title: "Why Exhibit",
    slug: "/participate/why-exhibit",
    author: "Admin User",
    status: "Published",
    seoScore: 91,
    rating: "Excellent",
    updated: "Today, 01:00 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 8,
    configKey: "msmePage",
    title: "MSME PMS Scheme",
    slug: "/participate/msme",
    author: "Admin User",
    status: "Published",
    seoScore: 93,
    rating: "Excellent",
    updated: "Today, 01:15 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 9,
    configKey: "exhibitorsPage",
    title: "Exhibitors List",
    slug: "/exhibitors",
    author: "Admin User",
    status: "Published",
    seoScore: 92,
    rating: "Excellent",
    updated: "Today, 01:30 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 10,
    configKey: "buyerSellerMeetPage",
    title: "Buyer-Seller Meet",
    slug: "/buyer-seller-meet",
    author: "Admin User",
    status: "Published",
    seoScore: 92,
    rating: "Excellent",
    updated: "Today, 01:45 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 11,
    configKey: "galleryPage",
    title: "Glimpses & Gallery",
    slug: "/gallery",
    author: "Admin User",
    status: "Published",
    seoScore: 92,
    rating: "Excellent",
    updated: "Today, 02:00 PM",
    updatedBy: "Admin User",
    type: "page",
  },
  {
    id: 10,
    configKey: "servicesPage",
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
    id: 11,
    configKey: "contactPage",
    title: "Contact Us",
    slug: "/contact",
    author: "Admin User",
    status: "Published",
    seoScore: 85,
    rating: "Good",
    updated: "28 May 2026, 09:15 AM",
    updatedBy: "Admin User",
    type: "page",
  },
];
