"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createHomeHero, updateHomeHero, fetchHomeHeros } from "@/store/slices/home/homeHeroSlice";
import { api } from "@/lib/api";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { uploadApi } from "@/lib/uploadApi";

import {
  cmsPages,
  cmsPagesFromSettings,
  findCmsPageByRouteKey,
  getCmsPageRouteKey,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import typography from "../../PagesTypography.module.css";
import Swal from "sweetalert2";

import { getTemplateForPage, getPageForTemplate } from "@/components/pages-cms/utils/templateMapping";
import {
  resolveDefaultSectionsForPage,
  resolveResetDefaultsForPage,
  mergeSectionWithSavedData,
  syncHomeSectionsFromLiveApi,
  saveHomeSections,
  syncWhyExhibitSectionsFromLiveApi,
  saveWhyExhibitSections,
  syncWhyVisitSectionsFromLiveApi,
  saveWhyVisitSections,
  syncAwardsSectionsFromLiveApi,
  saveAwardsSections,
  syncGallerySectionsFromLiveApi,
  saveGallerySections,
  syncPageSeoFromLiveApi,
  savePageCore,
} from "@/components/pages-cms/page-strategies";
import type { FormState } from "@/components/pages-cms/types";
import {
  EditPageHeader,
  BasicInfoPanel,
  PageSectionsPanel,
  SeoSettingsPanel,
  PageSettingsPanel,
  PublishPanel,
  SeoScorePanel,
  QuickActionsPanel,
} from "@/components/pages-cms/panels";


/* =========================================================
   MAIN PAGE
========================================================= */

export default function CmsEditPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const dispatch = useAppDispatch();
  const { data: homeHeros } = useAppSelector((state) => state.homeHero);
  const currentAdmin = useAppSelector((state) => state.auth.admin);

  useEffect(() => {
    dispatch(fetchHomeHeros());
  }, [dispatch]);

  const [isEditingPublishDate, setIsEditingPublishDate] = useState(false);

  const handleHeroApi = async (action: 'add' | 'edit', section: any) => {
    const form = new FormData();
    form.append("tagline", section.tagline || "");
    form.append("titlePrimary", section.titlePrimary || "");
    form.append("titleSecondary", section.titleSecondary || "");
    form.append("subtitle", section.subtitle || "");
    form.append("description", section.description || "");
    form.append("date", section.date || "");
    form.append("location", section.location || "");
    form.append("button1Name", section.buttonLabel || "");
    form.append("button1Link", section.buttonHref || "");
    form.append("button2Name", section.secondaryButtonLabel || "");
    form.append("button2Link", section.secondaryButtonHref || "");

    try {
      if (action === 'add') {
        await dispatch(createHomeHero(form)).unwrap();
        Swal.fire({ title: "Success", text: "Added to Home Hero API", icon: "success", timer: 1500 });
      } else {
        const id = homeHeros?.[0]?._id;
        if (id) {
          await dispatch(updateHomeHero({ id, formData: form })).unwrap();
          Swal.fire({ title: "Success", text: "Updated Home Hero API", icon: "success", timer: 1500 });
        } else {
          Swal.fire({ title: "Error", text: "No existing hero found to edit. Click Add instead.", icon: "error" });
        }
      }
      dispatch(fetchHomeHeros());
    } catch (err: any) {
      Swal.fire({ title: "Error", text: err || "API failed", icon: "error" });
    }
  };

  const [pages, setPages] = useState(cmsPages);
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);

  const initialResolved = useMemo(() => {
    return findCmsPageByRouteKey(cmsPages, params.id) ?? cmsPages[0];
  }, [params.id]);

  const [activeConfigKey, setActiveConfigKey] = useState<string>(
    () => initialResolved.configKey || "landingPage"
  );

  const lastParamIdRef = useRef(params.id);

  useEffect(() => {
    if (lastParamIdRef.current !== params.id) {
      lastParamIdRef.current = params.id;
      const found = findCmsPageByRouteKey(pages, params.id);
      if (found?.configKey) {
        setActiveConfigKey(found.configKey);
      }
    }
  }, [params.id, pages]);

  const page = useMemo(() => {
    if (activeConfigKey) {
      const byKey = pages.find((p) => p.configKey === activeConfigKey);
      if (byKey) return byKey;
    }
    return findCmsPageByRouteKey(pages, params.id) ?? pages[0] ?? cmsPages[0];
  }, [activeConfigKey, pages, params.id]);

  useEffect(() => {
    settingsApi.get().then((value) => {
      const raw = value as unknown as Record<string, any>;
      setSettings(raw);
      setPages(cmsPagesFromSettings(raw));
    }).catch(() => undefined);
  }, []);

  const pageConfig = page.configKey && settings ? settings[page.configKey] : undefined;

  const initialForm =
    useMemo<FormState>(
      () => ({
        pageTitle:
          page.title,

        slug:
          page.slug === "/"
            ? ""
            : page.slug.replace(
              /^\//,
              "",
            ),

        template: getTemplateForPage(page),

        parent:
          page.type === "home"
            ? "— No Parent (Top Level) —"
            : "Home",

        metaTitle:
          page.type === "home"
            ? "Bharat Organic Expo – International Trade Fair on Organic Products"
            : `${page.title} – Bharat Organic Expo`,

        metaDescription: page.seo?.metaDescription ?? "",
        metaKeywords: page.seo?.metaKeywords ?? "",
        canonicalUrl:
          page.seo?.canonicalUrl ||
          (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
            : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`),
        canonicalTag:
          page.seo?.canonicalTag ||
          `<link rel="canonical" href="${
            page.seo?.canonicalUrl ||
            (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
              ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
              : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`)
          }" />`,
        openGraphTags: page.seo?.openGraphTags ?? "",
        ogTitle: page.seo?.ogTitle ?? "",
        ogDescription: page.seo?.ogDescription ?? "",
        ogImage: page.seo?.ogImage ?? "",
        h1Tag: page.seo?.h1Tag ?? "",
        breadcrumbName: page.seo?.breadcrumbName ?? "",
        schemaMarkup: page.seo?.schemaMarkup ?? "",
        robotsIndex: page.seo?.robotsIndex ?? true,
        robotsFollow: page.seo?.robotsFollow ?? true,
        isActive: page.seo?.isActive ?? (page.status === "Published"),

        status:
          page.status,

        visibility:
          pageConfig?.visibility || page.visibility || "Public",

        author:
          page.author,

        publishedAt:
          pageConfig?.publishedAt || page.publishedAt || new Date().toISOString(),

        lastUpdated:
          pageConfig?.lastUpdated || page.lastUpdated || new Date().toISOString(),

        updatedBy:
          pageConfig?.updatedBy || page.updatedBy || currentAdmin?.name || "Admin User",

        showInNavigation:
          true,

        menuOrder:
          page.type === "home"
            ? "1"
            : "4",
      }),
      [page.configKey, pageConfig, currentAdmin],
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      initialForm,
    );

  useEffect(() => {
    setForm({
      pageTitle: page.title,
      slug: page.slug === "/" ? "" : page.slug.replace(/^\//, ""),
      template: getTemplateForPage(page),
      parent: page.type === "home" ? "— No Parent (Top Level) —" : "Home",
      metaTitle: page.seo?.metaTitle ?? (page.type === "home" ? "Bharat Organic Expo – International Trade Fair on Organic Products" : `${page.title} – Bharat Organic Expo`),
      metaDescription: page.seo?.metaDescription ?? "",
      metaKeywords: page.seo?.metaKeywords ?? "",
      canonicalUrl:
        page.seo?.canonicalUrl ||
        (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
          : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`),
      canonicalTag:
        page.seo?.canonicalTag ||
        `<link rel="canonical" href="${
          page.seo?.canonicalUrl ||
          (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://localhost:3002${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
            : `https://bharatorganicexpo.com${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`)
        }" />`,
      openGraphTags: page.seo?.openGraphTags ?? "",
      ogTitle: page.seo?.ogTitle ?? "",
      ogDescription: page.seo?.ogDescription ?? "",
      ogImage: page.seo?.ogImage ?? "",
      h1Tag: page.seo?.h1Tag ?? "",
      breadcrumbName: page.seo?.breadcrumbName ?? "",
      schemaMarkup: page.seo?.schemaMarkup ?? "",
      robotsIndex: page.seo?.robotsIndex ?? true,
      robotsFollow: page.seo?.robotsFollow ?? true,
      isActive: page.seo?.isActive ?? (page.status === "Published"),
      status: pageConfig?.status || page.status,
      visibility: pageConfig?.visibility || page.visibility || "Public",
      author: page.author,
      publishedAt: pageConfig?.publishedAt || page.publishedAt || new Date().toISOString(),
      lastUpdated: pageConfig?.lastUpdated || page.lastUpdated || new Date().toISOString(),
      updatedBy: pageConfig?.updatedBy || page.updatedBy || currentAdmin?.name || "Admin User",
      showInNavigation: true,
      menuOrder: page.type === "home" ? "1" : "4",
    });
  }, [page.configKey, pageConfig, currentAdmin]);

  const [sectionsDraft, setSectionsDraft] = useState<Array<Record<string, any>>>([]);
  const [openSectionIndices, setOpenSectionIndices] = useState<Set<number>>(new Set());

  const canonicalEditorRef = useRef<HTMLDivElement | null>(null);
  const [ogUploading, setOgUploading] = useState(false);
  const [ogPreview, setOgPreview] = useState<string | null>(null);

  useEffect(() => {
    if (canonicalEditorRef.current) {
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const defaultSiteUrl = isLocal ? "http://localhost:3002" : "https://bharatorganicexpo.com";
      const pagePath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
      const defaultTag = `<link rel="canonical" href="${defaultSiteUrl}${pagePath}" />`;

      const target = (form.canonicalTag || form.canonicalUrl || defaultTag).trim();
      const currentText = canonicalEditorRef.current.innerText.trim();
      if (target && currentText !== target && !canonicalEditorRef.current.contains(document.activeElement)) {
        canonicalEditorRef.current.innerText = target;
      }
    }
  }, [form.canonicalTag, form.canonicalUrl, page.slug]);

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    if (canonicalEditorRef.current) {
      canonicalEditorRef.current.focus();
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleCanonicalInput = () => {
    if (canonicalEditorRef.current) {
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleCanonicalPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    if (canonicalEditorRef.current) {
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOgPreview(URL.createObjectURL(file));
    setOgUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/seo");
      const url = res?.url || res?.data?.url;
      if (url) {
        updateField("ogImage", url);
      }
    } catch (err) {
      Swal.fire({
        title: "Upload Failed",
        text: err instanceof Error ? err.message : "Could not upload the image.",
        icon: "error",
        confirmButtonColor: "#218DAE",
      });
    } finally {
      setOgUploading(false);
    }
  };

  const removeOgImage = () => {
    updateField("ogImage", "");
    setOgPreview(null);
  };

  const autoGenerateSeo = async (envType: "local" | "live") => {
    const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
    try {
      const res: any = await api.post("/seo/generate", {
        page: pageKey,
        envType,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      });
      const gen = res?.data?.data || res?.data || res;
      if (gen) {
        updateField("canonicalUrl", gen.canonicalUrl || "");
        updateField("canonicalTag", gen.canonicalTag || "");
        updateField("openGraphTags", gen.openGraphTags || "");
        updateField("schemaMarkup", gen.schemaMarkup || "");
        if (!form.metaTitle && gen.metaTitle) updateField("metaTitle", gen.metaTitle);
        if (!form.metaDescription && gen.metaDescription) updateField("metaDescription", gen.metaDescription);
        if (!form.metaKeywords && gen.metaKeywords) updateField("metaKeywords", gen.metaKeywords);
        if (!form.ogImage && gen.ogImage) updateField("ogImage", gen.ogImage);

        if (canonicalEditorRef.current) {
          canonicalEditorRef.current.innerText = gen.canonicalTag || gen.canonicalUrl || "";
        }

        Swal.fire({
          title: `Auto-Generated for ${envType.toUpperCase()}`,
          text: `Canonical, OG Tags & Schema markup generated for ${
            envType === "local" ? "http://localhost:3002" : "https://bharatorganicexpo.com"
          }. You can edit any field manually anytime!`,
          icon: "success",
          timer: 2500,
          confirmButtonColor: "#134698",
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: "Generation Failed",
        text: err?.message || "Failed to auto-generate SEO tags",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const cfg = page.configKey && settings ? settings[page.configKey] : undefined;
    const fallbackSections = resolveDefaultSectionsForPage(page);
    const stored = cfg?.sections;
    const rawSections = fallbackSections.map((fallbackItem: Record<string, any>) =>
      mergeSectionWithSavedData(fallbackItem, stored?.find((s: Record<string, any>) => s.key === fallbackItem.key))
    );
    const finalSections = (rawSections && rawSections.length > 0 ? rawSections : fallbackSections).filter(
      (s: any) => !(s.key === "gallery-grid" || s.name === "GalleryGrid")
    );
    setSectionsDraft(finalSections.map((section: Record<string, any>) => ({ ...section })));
    setOpenSectionIndices(new Set());

    if (page.configKey === "landingPage" || page.type === "home") {
      syncHomeSectionsFromLiveApi(setSectionsDraft);
    }

    if (page.configKey === "whyExhibitPage" || page.slug?.includes("why-exhibit")) {
      syncWhyExhibitSectionsFromLiveApi(setSectionsDraft);
    }

    if (page.configKey === "whyVisitPage" || page.slug?.includes("why-visit")) {
      syncWhyVisitSectionsFromLiveApi(setSectionsDraft);
    }

    if (page.configKey === "awardsPage" || page.slug?.includes("awards") || page.slug?.includes("excellence-awards")) {
      syncAwardsSectionsFromLiveApi(setSectionsDraft);
    }

    if (page.configKey === "galleryPage" || page.slug?.includes("gallery") || page.slug?.includes("glimpses")) {
      syncGallerySectionsFromLiveApi(setSectionsDraft);
    }

    syncPageSeoFromLiveApi(page, setForm, canonicalEditorRef);
  }, [settings, page]);

  const toggleSectionAccordion = (index: number) => {
    setOpenSectionIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const updateSectionField = (sectionIndex: number, key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) =>
        index === sectionIndex ? { ...section, [key]: value } : section,
      ),
    );
  };

  const updateSectionItem = (sectionIndex: number, itemIndex: number, key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = [...(section.items ?? [])];
        items[itemIndex] = { ...items[itemIndex], [key]: value };
        return { ...section, items };
      }),
    );
  };

  const addSectionItem = (sectionIndex: number) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = [...(section.items ?? [])];
        if (section.key === "why-exhibit-hero") {
          const blankHighlight = {
            main: "New Highlight",
            sub: "Feature",
            image: `/uploads/icons/x${(items.length % 4) + 1}.png`,
          };
          return { ...section, items: [...items, blankHighlight] };
        }
        if (section.key === "audience-strip") {
          const blankAudience = {
            title: "NEW AUDIENCE",
            subtitle: "TARGET GROUP",
            icon: "GraduationCap",
            color: "#facc15",
            label: "NEW AUDIENCE TARGET GROUP",
          };
          return { ...section, items: [...items, blankAudience] };
        }
        if (section.key === "expo-categories") {
          const blankCategory = {
            title: "New Exhibition Sector",
            description: "Enter sector description...",
            image: "",
            href: "/exhibition-categories",
            exploreText: "Explore",
          };
          return { ...section, items: [...items, blankCategory] };
        }
        if (section.key === "beyond-exhibition") {
          const blankItem = {
            title: "NEW HIGHLIGHT / AWARD",
            description: "Enter description...",
            icon: "Award",
          };
          return { ...section, items: [...items, blankItem] };
        }
        if (section.key === "footer") {
          const blankLink = {
            label: "New Link",
            href: "/",
          };
          return { ...section, items: [...items, blankLink] };
        }
        const defaultItemTemplate: Record<string, any> = {
          title: "",
          subtitle: "",
          description: "",
          label: "",
          value: "",
          icon: "",
          image: "",
          buttonLabel: "",
          buttonHref: "",
          question: "",
          answer: "",
          href: "",
          category: "",
          year: "",
        };
        if (items[0]) {
          Object.keys(items[0]).forEach((k) => {
            if (k !== "_id" && !(k in defaultItemTemplate)) {
              defaultItemTemplate[k] = "";
            }
          });
        }
        return { ...section, items: [...items, defaultItemTemplate] };
      }),
    );
  };

  const removeSectionItem = (sectionIndex: number, itemIndex: number) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = (section.items ?? []).filter((_: unknown, i: number) => i !== itemIndex);
        return { ...section, items };
      }),
    );
  };

  const updateField = <
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K],
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      }),
    );
  };

  const resetToWebsiteDefaults = () => {
    const defaults = resolveResetDefaultsForPage(page);
    setSectionsDraft(defaults.map((s) => ({ ...s })));
    Swal.fire({
      title: "Reset to Website Content",
      text: "Page sections have been reset to match the exact live website defaults.",
      icon: "success",
      timer: 1800,
      confirmButtonColor: "#0f766e",
    });
  };

  const savePage = async () => {
    if (!settings || !page.configKey) return;
    setSaving(true);
    const savingKey = page.configKey;
    setActiveConfigKey(savingKey);
    try {
      if (savingKey === "landingPage" || page.type === "home") {
        await saveHomeSections(sectionsDraft);
      }

      if (savingKey === "whyExhibitPage" || page.slug?.includes("why-exhibit")) {
        await saveWhyExhibitSections(sectionsDraft);
      }

      if (savingKey === "whyVisitPage" || page.slug?.includes("why-visit")) {
        await saveWhyVisitSections(sectionsDraft);
      }

      if (savingKey === "awardsPage" || page.slug?.includes("awards") || page.slug?.includes("excellence-awards")) {
        await saveAwardsSections(sectionsDraft);
      }

      if (savingKey === "galleryPage" || page.slug?.includes("gallery") || page.slug?.includes("glimpses")) {
        await saveGallerySections(sectionsDraft);
      }

      const updated = await savePageCore({
        savingKey,
        sectionsDraft,
        form,
        settings,
        currentAdmin,
        page,
        canonicalEditorRef,
        setForm,
      });

      const raw = updated as unknown as Record<string, any>;
      setSettings(raw);
      setPages(cmsPagesFromSettings(raw));
      setActiveConfigKey(savingKey);
      Swal.fire({
        title: "Page Updated",
        text: `Changes to "${form.pageTitle || page.title}" have been saved successfully.`,
        icon: "success",
        confirmButtonColor: "#218DAE",
        timer: 2000,
      });
    } catch (err) {
      Swal.fire({
        title: "Save Failed",
        text: err instanceof Error ? err.message : "Could not save this page.",
        icon: "error",
        confirmButtonColor: "#218DAE",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (value: string) => {
    updateField("template", value);
    const targetPage = getPageForTemplate(value, pages);
    if (targetPage && targetPage.configKey) {
      setActiveConfigKey(targetPage.configKey);
      const newRouteKey = getCmsPageRouteKey(targetPage);
      lastParamIdRef.current = newRouteKey;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/pages/${newRouteKey}/edit`);
      }
      router.replace(`/pages/${newRouteKey}/edit`, { scroll: false });
      setForm((prev) => ({
        ...prev,
        pageTitle: targetPage.title,
        slug: targetPage.slug === "/" ? "" : targetPage.slug.replace(/^\//, ""),
        template: getTemplateForPage(targetPage),
        parent: targetPage.type === "home" ? "\u2014 No Parent (Top Level) \u2014" : "Home",
        metaTitle: targetPage.seo?.metaTitle ?? (targetPage.type === "home" ? "Bharat Organic Expo \u2013 International Trade Fair on Organic Products" : `${targetPage.title} \u2013 Bharat Organic Expo`),
        metaDescription: targetPage.seo?.metaDescription ?? "",
        metaKeywords: targetPage.seo?.metaKeywords ?? "",
        canonicalUrl: targetPage.seo?.canonicalUrl || "",
        canonicalTag: targetPage.seo?.canonicalTag || "",
      }));
    }
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex flex-col px-[18px] pb-[16px] pt-[14px]">
        <EditPageHeader
          onBack={() => router.push("/pages")}
          onPreview={() => router.push(`/pages/${getCmsPageRouteKey(page)}`)}
          onSyncReset={resetToWebsiteDefaults}
          onSave={savePage}
          saving={saving}
        />

        <div
          className="
            grid
            items-start
            grid-cols-[minmax(0,2.35fr)_minmax(330px,1fr)]
            gap-[10px]
          "
        >
          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            <BasicInfoPanel
              form={form}
              updateField={updateField}
              pages={pages}
              onTemplateChange={handleTemplateChange}
            />

            <PageSectionsPanel
              sectionsDraft={sectionsDraft}
              setSectionsDraft={setSectionsDraft}
              openSectionIndices={openSectionIndices}
              setOpenSectionIndices={setOpenSectionIndices}
              toggleSectionAccordion={toggleSectionAccordion}
              updateSectionField={updateSectionField}
              updateSectionItem={updateSectionItem}
              addSectionItem={addSectionItem}
              removeSectionItem={removeSectionItem}
              resetToWebsiteDefaults={resetToWebsiteDefaults}
            />

            <SeoSettingsPanel
              form={form}
              updateField={updateField}
              page={page}
              canonicalEditorRef={canonicalEditorRef}
              execCommand={execCommand}
              onCanonicalInput={handleCanonicalInput}
              onCanonicalPaste={handleCanonicalPaste}
              ogUploading={ogUploading}
              ogPreview={ogPreview}
              onOgImageUpload={handleOgImageUpload}
              onRemoveOgImage={removeOgImage}
              onAutoGenerateSeo={autoGenerateSeo}
            />

            <PageSettingsPanel
              form={form}
              updateField={updateField}
            />
          </div>

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            <PublishPanel
              form={form}
              updateField={updateField}
              isEditingPublishDate={isEditingPublishDate}
              setIsEditingPublishDate={setIsEditingPublishDate}
              currentAdminName={currentAdmin?.name}
            />

            <SeoScorePanel />

            <QuickActionsPanel
              form={form}
              onViewPage={() => router.push(`/pages/${getCmsPageRouteKey(page)}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
