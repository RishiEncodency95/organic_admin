export type Status =
  | "Draft"
  | "Published";

export type Visibility =
  | "Public"
  | "Private";

export type FormState = {
  pageTitle: string;
  slug: string;
  template: string;
  parent: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  canonicalTag: string;
  openGraphTags: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  h1Tag: string;
  breadcrumbName: string;
  schemaMarkup: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  isActive: boolean;
  status: Status;
  visibility: Visibility;
  author: string;
  publishedAt: string;
  lastUpdated: string;
  updatedBy: string;
  showInNavigation: boolean;
  menuOrder: string;
};
