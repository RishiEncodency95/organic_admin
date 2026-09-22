import type { Dispatch, RefObject, SetStateAction } from "react";
import { api } from "@/lib/api";
import { settingsApi } from "@/lib/settingsApi";
import type { CmsPage } from "@/lib/cmsPages";
import type { FormState } from "../types";
import type { SectionsDraft } from "./types";

/** Refreshes the SEO form fields from the backend's live SEO record for this page. */
export function syncPageSeoFromLiveApi(
  page: CmsPage,
  setForm: Dispatch<SetStateAction<FormState>>,
  canonicalEditorRef: RefObject<HTMLDivElement | null>,
): void {
  const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
  const isLocalEnv = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  api.get(`/seo/${pageKey}?envType=${isLocalEnv ? "local" : "live"}`)
    .then((res: any) => {
      const seoData = res?.data?.data || res?.data || res;
      if (seoData) {
        const defaultSiteUrl = isLocalEnv ? "http://localhost:3002" : "https://bharatorganicexpo.com";
        const pagePath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
        const defaultTag = `<link rel="canonical" href="${defaultSiteUrl}${pagePath}" />`;

        const canonicalVal = (seoData.canonicalTag || seoData.canonicalUrl || defaultTag).trim();
        const match = canonicalVal.match(/href=["']([^"']+)["']/i);
        const cleanUrl = match ? match[1] : canonicalVal.replace(/<[^>]*>/g, "").trim() || `${defaultSiteUrl}${pagePath}`;

        setForm((prev) => ({
          ...prev,
          metaTitle: seoData.metaTitle || prev.metaTitle,
          metaDescription: seoData.metaDescription || prev.metaDescription,
          metaKeywords: seoData.metaKeywords || prev.metaKeywords,
          canonicalUrl: cleanUrl,
          canonicalTag: canonicalVal,
          openGraphTags: seoData.openGraphTags || prev.openGraphTags,
          schemaMarkup: seoData.schemaMarkup || prev.schemaMarkup,
          ogTitle: seoData.ogTitle || prev.ogTitle,
          ogDescription: seoData.ogDescription || prev.ogDescription,
          ogImage: seoData.ogImage || prev.ogImage,
          robotsIndex: seoData.robotsIndex !== undefined ? seoData.robotsIndex : prev.robotsIndex,
          robotsFollow: seoData.robotsFollow !== undefined ? seoData.robotsFollow : prev.robotsFollow,
          isActive: seoData.isActive !== undefined ? seoData.isActive : prev.isActive,
        }));

        if (canonicalEditorRef.current) {
          canonicalEditorRef.current.innerText = canonicalVal;
        }
      }
    })
    .catch(() => {});
}

/**
 * Persists the page's settings-doc fields (sections, publish info,
 * status, SEO block) and syncs the SEO record to the backend.
 * Returns the raw updated settings object for the caller to apply
 * to its own state (setSettings / setPages / setActiveConfigKey).
 */
export async function savePageCore({
  savingKey,
  sectionsDraft,
  form,
  settings,
  currentAdmin,
  page,
  canonicalEditorRef,
  setForm,
}: {
  savingKey: string;
  sectionsDraft: SectionsDraft;
  form: FormState;
  settings: Record<string, any> | null;
  currentAdmin: { name?: string; email?: string } | null | undefined;
  page: CmsPage;
  canonicalEditorRef: RefObject<HTMLDivElement | null>;
  setForm: Dispatch<SetStateAction<FormState>>;
}): Promise<Record<string, any>> {
  const current = settings?.[savingKey] ?? {};
  const now = new Date().toISOString();
  const adminName = currentAdmin?.name || currentAdmin?.email || "Admin User";
  const finalPublishDate = form.publishedAt || current.publishedAt || now;

  const updated = await settingsApi.update({
    [savingKey]: {
      ...current,
      sections: sectionsDraft.length ? sectionsDraft : current.sections,
      publishedAt: finalPublishDate,
      lastUpdated: now,
      updatedBy: adminName,
      status: form.status,
      visibility: form.visibility,
      seo: {
        ...current.seo,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        metaKeywords: form.metaKeywords,
        canonicalUrl: form.canonicalUrl || form.canonicalTag,
        canonicalTag: form.canonicalTag || form.canonicalUrl,
        openGraphTags: form.openGraphTags,
        ogTitle: form.ogTitle,
        ogDescription: form.ogDescription,
        ogImage: form.ogImage,
        h1Tag: form.h1Tag,
        breadcrumbName: form.breadcrumbName,
        schemaMarkup: form.schemaMarkup,
        robotsIndex: form.robotsIndex,
        robotsFollow: form.robotsFollow,
      },
    },
  } as any);

  setForm((prev) => ({
    ...prev,
    publishedAt: finalPublishDate,
    lastUpdated: now,
    updatedBy: adminName,
  }));

  // Sync SEO data directly to backend database
  const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
  const isLocalHost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  const defaultSite = isLocalHost ? "http://localhost:3002" : "https://bharatorganicexpo.com";
  const pPath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
  const defTag = `<link rel="canonical" href="${defaultSite}${pPath}" />`;

  const editorText = canonicalEditorRef.current?.innerText?.trim();
  const finalCanonicalTag = (editorText || form.canonicalTag || form.canonicalUrl || defTag).trim();
  const match = finalCanonicalTag.match(/href=["']([^"']+)["']/i);
  const finalCanonicalUrl = match ? match[1] : finalCanonicalTag.replace(/<[^>]*>/g, "").trim() || `${defaultSite}${pPath}`;

  try {
    await api.put(`/seo/${pageKey}`, {
      page: pageKey,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      metaKeywords: form.metaKeywords,
      canonicalUrl: finalCanonicalUrl,
      canonicalTag: finalCanonicalTag,
      openGraphTags: form.openGraphTags,
      schemaMarkup: form.schemaMarkup,
      ogTitle: form.ogTitle,
      ogDescription: form.ogDescription,
      ogImage: form.ogImage,
      robotsIndex: form.robotsIndex,
      robotsFollow: form.robotsFollow,
      isActive: form.isActive,
      updatedBy: adminName,
    });
  } catch (seoErr) {
    console.error("Failed to sync SEO to backend:", seoErr);
  }

  return updated;
}
