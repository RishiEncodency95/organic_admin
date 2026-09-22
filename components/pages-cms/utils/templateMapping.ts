import type { CmsPage } from "@/lib/cmsPages";

export function getTemplateForPage(p: { type?: string; configKey?: string; title: string }): string {
  if (p.type === "home" || p.configKey === "landingPage") return "Homepage";
  return p.title;
}

export function getPageForTemplate(templateName: string, allPages: CmsPage[]): CmsPage | undefined {
  if (templateName === "Homepage" || templateName === "Home") {
    return allPages.find((p) => p.configKey === "landingPage") ?? allPages[0];
  }
  const byExactTitle = allPages.find((p) => p.title.toLowerCase() === templateName.toLowerCase());
  if (byExactTitle) return byExactTitle;
  if (templateName.includes("Contact") || templateName.includes("ADVISOR")) {
    return allPages.find((p) => p.configKey === "contactPage");
  }
  if (templateName.includes("Why Exhibit")) {
    return allPages.find((p) => p.configKey === "whyExhibitPage");
  }
  if (templateName.includes("Why Visit")) {
    return allPages.find((p) => p.configKey === "whyVisitPage");
  }
  if (templateName.includes("About")) {
    return allPages.find((p) => p.configKey === "aboutPage");
  }
  if (templateName.includes("MSME")) {
    return allPages.find((p) => p.configKey === "msmePage");
  }
  if (templateName.includes("Exhibitor List")) {
    return allPages.find((p) => p.configKey === "exhibitorsPage");
  }
  if (templateName.includes("Buyer-Seller")) {
    return allPages.find((p) => p.configKey === "buyerSellerMeetPage");
  }
  if (templateName.includes("Gallery")) {
    return allPages.find((p) => p.configKey === "galleryPage");
  }
  if (templateName.includes("Awards")) {
    return allPages.find((p) => p.configKey === "awardsPage");
  }
  if (templateName.includes("Sponsorship")) {
    return allPages.find((p) => p.configKey === "sponsorshipPage");
  }
  return undefined;
}
