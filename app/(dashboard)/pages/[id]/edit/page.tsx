"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createHomeHero, updateHomeHero, fetchHomeHeros } from "@/store/slices/home/homeHeroSlice";
import { api } from "@/lib/api";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  AlignLeft,
  ArrowLeft,
  Bold,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FormInput,
  Globe,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Quote,
  Save,
  Sparkles,
  Strikethrough,
  Table2,
  Trash2,
  RotateCcw,
  Search,
  Underline,
  Upload,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";

import {
  cmsPages,
  cmsPagesFromSettings,
  findCmsPageByRouteKey,
  getCmsPageRouteKey,
  PUBLIC_SITE_URL,
  formatPublishDate,
  type CmsPage,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { defaultLandingSections } from "@/lib/landingContent";
import { defaultAboutSections } from "@/lib/aboutContent";
import { defaultAdvisorySections, defaultNominateAdvisorySections } from "@/lib/advisoryContent";
import { defaultBlogSections } from "@/lib/blogContent";
import { defaultParticipateAsExhibitorSections } from "@/lib/participateAsExhibitorContent";
import { defaultExhibitionCategoriesSections } from "@/lib/exhibitionCategoriesContent";
import {
  defaultBookAStandSections,
  defaultVisitorRegistrationSections,
  defaultDelegateRegistrationSections,
  defaultBuyerRegistrationSections,
  defaultTermsAndConditionsSections,
  defaultPrivacyPolicySections,
  defaultRefundPolicySections,
} from "@/lib/registrationPagesContent";
import { defaultWhyVisitSections } from "@/lib/whyVisitContent";
import { defaultWhyExhibitSections } from "@/lib/whyExhibitContent";
import {
  defaultMsmeSections,
  defaultMsmeEligibilityCheckSections,
  defaultMsmeApplySections,
  defaultMsmeParticipationDetailsSections,
  defaultMsmeApplyPaymentSections,
  defaultExhibitorLoginSections,
  defaultBuyerLoginSections,
  defaultDelegatesLoginSections,
  defaultUserLoginSections,
} from "@/lib/msmeContent";
import { defaultExhibitorsSections } from "@/lib/exhibitorsContent";
import { defaultBuyerSellerMeetSections } from "@/lib/buyerSellerMeetContent";
import { defaultGallerySections } from "@/lib/galleryContent";
import { defaultAwardsSections, defaultAwardsNominationSections } from "@/lib/awardsContent";
import { defaultContactSections } from "@/lib/contactContent";
import { defaultSponsorshipSections, defaultEPromotionSections, defaultPartnershipPageSections, defaultSubPartnershipSections } from "@/lib/opportunityContent";
import { defaultSupportServicesSections } from "@/lib/extraPagesContent";
import typography from "../../PagesTypography.module.css";
import Swal from "sweetalert2";

import {
  FieldLabel,
  TextInput,
  Textarea,
  SelectField,
  SearchableSelectField,
  Toggle,
  ToolbarButton,
  EditorToolbar,
  ImageUploadField,
  PdfUploadField,
  VideoUploadField,
} from "@/components/pages-cms/fields";
import {
  SectionTitle,
  SectionFieldsEditor,
  SectionItemsEditor,
} from "@/components/pages-cms/section-editor";
import { SeoScoreCircle, SeoRow } from "@/components/pages-cms/seo";
import { getTemplateForPage, getPageForTemplate } from "@/components/pages-cms/utils/templateMapping";
import { FEATURED_IMAGE } from "@/components/pages-cms/constants";
import type { FormState, Status, Visibility } from "@/components/pages-cms/types";


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
      console.error("Failed to upload OG image", err);
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
    const key = (page.configKey || "").toLowerCase();
    const title = (page.title || "").toLowerCase();
    const slug = (page.slug || "").toLowerCase();

    const getFallbackForPage = () => {
      if (key === "msmeeligibilitycheckpage" || slug.includes("eligibility-check")) return defaultMsmeEligibilityCheckSections;
      if (key === "msmeapplypaymentpage" || slug.includes("participate/msme/apply/payment")) return defaultMsmeApplyPaymentSections;
      if (key === "msmeapplyparticipationdetailspage" || slug.includes("participation-details")) return defaultMsmeParticipationDetailsSections;
      if (key === "msmeapplypage" || (slug.includes("participate/msme/apply") && !slug.includes("participation-details") && !slug.includes("payment"))) return defaultMsmeApplySections;
      if (key.includes("partnerpage") || (slug.includes("partnership/") && slug !== "/partnership")) return defaultSubPartnershipSections;
      if (key === "awardsnominationpage" || slug.includes("awards/nominations") || (slug.includes("nomination") && !slug.includes("advisory")) || (title.includes("nomination") && !title.includes("advisory"))) return defaultAwardsNominationSections;
      if (key === "nominateadvisorypage" || slug.includes("nominate_advisory_board")) return defaultNominateAdvisorySections;
      if (key === "supportservicespage" || slug.includes("suport_services")) return defaultSupportServicesSections;
      if (key === "aboutpage" || title.includes("about") || slug === "/about") return defaultAboutSections;
      if (key === "advisorypage" || title.includes("advisory") || slug.includes("advisory")) return defaultAdvisorySections;
      if (key === "blogpage" || title.includes("blog") || slug.includes("blog")) return defaultBlogSections;
      if (key === "participateasexhibitorpage" || title.includes("participate as exhibitor") || slug.includes("participate-as-exhibitor")) return defaultParticipateAsExhibitorSections;
      if (key === "exhibitioncategoriespage" || title.includes("exhibition categories") || slug.includes("exhibition-categories")) return defaultExhibitionCategoriesSections;
      if (key === "bookastandpage" || title.includes("book a stall") || title.includes("book a stand") || slug.includes("book-a-stand")) return defaultBookAStandSections;
      if (key === "visitorregistrationpage" || title.includes("register as visitor") || title.includes("visitor registration") || slug.includes("visitor-registration")) return defaultVisitorRegistrationSections;
      if (key === "delegateregistrationpage" || title.includes("delegate registration") || slug.includes("delegate-registration")) return defaultDelegateRegistrationSections;
      if (key === "buyerregistrationpage" || title.includes("register as buyer") || title.includes("buyer registration") || slug.includes("buyer-registration")) return defaultBuyerRegistrationSections;
      if (key === "termsandconditionspage" || title.includes("terms") || slug.includes("terms")) return defaultTermsAndConditionsSections;
      if (key === "privacypolicypage" || title.includes("privacy") || slug.includes("privacy")) return defaultPrivacyPolicySections;
      if (key === "refundpolicypage" || title.includes("refund") || slug.includes("refund")) return defaultRefundPolicySections;
      if (key === "whyvisitpage" || title.includes("why visit") || slug.includes("why-visit")) return defaultWhyVisitSections;
      if (key === "whyexhibitpage" || title.includes("why exhibit") || slug.includes("why-exhibit")) return defaultWhyExhibitSections;
      if (key === "msmepage" || title.includes("msme") || slug.includes("msme")) return defaultMsmeSections;
      if (key === "exhibitorspage" || title.includes("exhibitors") || slug.includes("exhibitors")) return defaultExhibitorsSections;
      if (key === "buyersellermeetpage" || title.includes("buyer-seller") || slug.includes("buyer-seller")) return defaultBuyerSellerMeetSections;
      if (key === "gallerypage" || title.includes("gallery") || slug.includes("gallery")) return defaultGallerySections;
      if (key === "awardspage" || title.includes("award") || slug.includes("awards")) return defaultAwardsSections;
      if (key === "sponsorshippage" || title.includes("sponsorship") || slug.includes("sponsorship")) return defaultSponsorshipSections;
      if (key === "epromotionpage" || title.includes("e-promotion") || slug.includes("e-promotion")) return defaultEPromotionSections;
      if (key === "partnershippage" || title.includes("partnership") || slug.includes("partnership")) return defaultPartnershipPageSections;
      if (key === "exhibitorloginpage" || title.includes("exhibitor login") || slug.includes("exhibitor-login")) return defaultExhibitorLoginSections;
      if (key === "buyerloginpage" || title.includes("buyer login") || slug.includes("buyer-login")) return defaultBuyerLoginSections;
      if (key === "delegatesloginpage" || title.includes("delegates login") || slug.includes("delegates-login")) return defaultDelegatesLoginSections;
      if (key === "userloginpage" || title.includes("user login") || slug.includes("/login")) return defaultUserLoginSections;
      if (key === "contactpage" || title.includes("contact") || title.includes("advisor") || slug.includes("contact")) return defaultContactSections;
      return defaultLandingSections;
    };

    const fallbackSections = getFallbackForPage();
    const stored = cfg?.sections;
    const rawSections = fallbackSections.map((fallbackItem: Record<string, any>) => {
      const savedItem = stored?.find((s: Record<string, any>) => s.key === fallbackItem.key);
      if (!savedItem) return { ...fallbackItem };
      const merged = {
        ...fallbackItem,
        ...savedItem,
        items: fallbackItem.items !== undefined ? (
          fallbackItem.items.map((item: Record<string, any>, idx: number) => ({
            ...item,
            ...(savedItem.items?.[idx] || {}),
          }))
        ) : undefined,
      };
      if (fallbackItem.key === "awards-hero" || merged.key === "awards-hero") {
        delete merged.shortDescription;
        if (!merged.date || merged.date.includes("T") || String(merged.date).trim().length < 5) {
          merged.date = "19 - 21 February 2027";
        }
      }
      if (fallbackItem.key === "awards-nomination-hero" || merged.key === "awards-nomination-hero") {
        delete merged.eyebrow;
        if (!merged.date || merged.date.includes("T") || String(merged.date).trim().length < 5) {
          merged.date = "19 - 21 February 2027";
        }
        if (!merged.location) {
          merged.location = "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA";
        }
        if (!merged.title || merged.title === "SUBMIT YOUR AWARD NOMINATION") {
          merged.title = "Bharat Organic Excellence Awards 2027";
        }
        if (!merged.subtitle || merged.subtitle === "Celebrate your brand & enterprise innovation.") {
          merged.subtitle = "Celebrating Excellence • Innovation • Sustainability";
        }
        if (!merged.description || merged.description.includes("Fill out the nomination form below")) {
          merged.description = "Honouring the changemakers, organizations and innovations during india's organic, natural and sustainable future.";
        }
      }
      if (fallbackItem.key === "awards-stats" || merged.key === "awards-stats") {
        delete merged.eyebrow;
        delete merged.title;
      }
      if (fallbackItem.key === "awards-about" || merged.key === "awards-about") {
        delete merged.image;
        delete merged.imageAlt;
      }
      if (fallbackItem.key === "awards-categories" || merged.key === "awards-categories") {
        delete merged.description;
        delete merged.shortDescription;
      }
      if (fallbackItem.key === "awards-grand-awards" || merged.key === "awards-grand-awards") {
        delete merged.description;
        delete merged.shortDescription;
      }
      if (fallbackItem.key === "awards-process" || merged.key === "awards-process") {
        delete merged.description;
        delete merged.shortDescription;
      }
      if (fallbackItem.key === "why-exhibit-hero" || merged.key === "why-exhibit-hero") {
        delete merged.date;
        delete merged.location;
        if (merged.bgImage === undefined) merged.bgImage = "";
        if (Array.isArray(merged.items)) {
          merged.items = merged.items.map((it: any, idx: number) => {
            const copy = { ...it };
            delete copy.icon;
            return {
              ...copy,
              image: copy.image || copy.img || `/uploads/icons/x${(idx % 4) + 1}.png`,
            };
          });
        }
      }
      if (fallbackItem.key === "industry-segments" || merged.key === "industry-segments") {
        delete merged.description;
        delete merged.shortDescription;
        delete merged.buttonLabel;
        delete merged.buttonHref;
      }
      if (fallbackItem.key === "testimonials-section" || merged.key === "testimonials-section") {
        delete merged.subtitle;
        delete merged.items;
      }
      if (fallbackItem.key === "audience-strip" || merged.key === "audience-strip") {
        delete merged.title;
      }
      if (fallbackItem.key === "introduction-section" || merged.key === "introduction-section") {
        delete merged.items;
        if (!merged.description2) {
          merged.description2 =
            "Designed to foster business growth, knowledge sharing, innovation, and international collaboration, Bharat Organic Expo serves as the perfect destination for discovering new products, building strategic partnerships, expanding global markets, and promoting a sustainable future.";
        }
        if (!merged.timerTitle) merged.timerTitle = "EVENT BEGINS IN";
        if (!merged.eventDate) merged.eventDate = "2027-02-19T00:00:00";
        if (merged.showTimer === undefined) merged.showTimer = true;
      }
      if (fallbackItem.key === "global-platform" || merged.key === "global-platform") {
        delete merged.subtitle;
        delete merged.title;
        delete merged.image;
        delete merged.imageAlt;
        if (!merged.keyPoint1) merged.keyPoint1 = "International Exhibitors & Global Brands";
        if (!merged.keyPoint2) merged.keyPoint2 = "Buyers, Distributors & Importers";
        if (!merged.keyPoint3) merged.keyPoint3 = "Research & Innovation | Startups";
        if (!merged.keyPoint4) merged.keyPoint4 = "Investors, Financial Institutions";
        if (!merged.keyPoint5) merged.keyPoint5 = "Government Bodies, Embassies & Policy Makers";
        merged.items = (merged.items || []).filter(
          (it: any) =>
            !/trusted brands|targeted audience|business growth/i.test(it.title || "")
        );
      }
      if (fallbackItem.key === "why-participate" || merged.key === "why-participate") {
        delete merged.subtitle;
        delete merged.title;
        delete merged.items;
        if (!merged.keyPoint1) merged.keyPoint1 = "Meet genuine buyers, distributors, retailers, and healthcare professionals";
        if (!merged.keyPoint2) merged.keyPoint2 = "Generate high-quality B2B & B2C leads with faster business conversions";
        if (!merged.keyPoint3) merged.keyPoint3 = "Launch new products with maximum visibility and market impact";
        if (!merged.keyPoint4) merged.keyPoint4 = "Expand your dealer, distributor, franchise, and export network";
        if (!merged.keyPoint5) merged.keyPoint5 = "Strengthen brand presence through live demos and media exposure";
        if (!merged.keyPoint6) merged.keyPoint6 = "Connect with investors, CEOs, doctors, and key decision-makers";
        if (!merged.keyPoint7) merged.keyPoint7 = "Achieve higher ROI with direct customer engagement and trust building";
        if (!merged.buttonLabel) merged.buttonLabel = "BOOK A STALL";
        if (!merged.buttonHref) merged.buttonHref = "/registration/book-a-stand";
        if (!merged.secondaryButtonLabel) merged.secondaryButtonLabel = "Download Brochure";
        if (!merged.secondaryButtonHref) merged.secondaryButtonHref = "/download/invited card.pdf";
        if (!merged.tertiaryButtonLabel) merged.tertiaryButtonLabel = "Why Exhibit?";
        if (!merged.tertiaryButtonHref) merged.tertiaryButtonHref = "/why-exhibit";
      }
      if (fallbackItem.key === "conference-section" || merged.key === "conference-section") {
        delete merged.subtitle;
        delete merged.title;
        delete merged.items;
        if (!merged.eyebrow) merged.eyebrow = "GLOBAL CONFERENCE & SEMINARS";
        if (!merged.titlePrimary) merged.titlePrimary = "Where Knowledge Meets";
        if (!merged.titleSecondary) merged.titleSecondary = "the Future of Organic";
        if (!merged.description) merged.description = "Join expert-led sessions, panel discussions & thought leadership talks on the latest trends shaping the future of organic, natural and sustainable living.";
        if (!merged.buttonLabel) merged.buttonLabel = "View Conference Schedule";
        if (!merged.buttonHref) merged.buttonHref = "https://arogya.namogange.org/";
        if (!merged.keyPoint1) merged.keyPoint1 = "Expert-led panel discussions & keynotes";
        if (!merged.keyPoint2) merged.keyPoint2 = "Emerging trends in organic farming & retail";
        if (!merged.keyPoint3) merged.keyPoint3 = "Sustainable business & growth strategies";
        if (!merged.stat1Title) merged.stat1Title = "19 – 21";
        if (!merged.stat1Sub) merged.stat1Sub = "FEBRUARY 2027";
        if (!merged.stat2Title) merged.stat2Title = "PRAGATI MAIDAN";
        if (!merged.stat2Sub) merged.stat2Sub = "NEW DELHI";
        if (!merged.stat3Title) merged.stat3Title = "INSIGHTS. IDEAS.";
        if (!merged.stat3Sub) merged.stat3Sub = "IMPACT.";
        if (!merged.stat4Title) merged.stat4Title = "50+ GLOBAL";
        if (!merged.stat4Sub) merged.stat4Sub = "SPEAKERS";
        if (!merged.stat5Title) merged.stat5Title = "20+ KEY";
        if (!merged.stat5Sub) merged.stat5Sub = "SESSIONS";
      }
      if (fallbackItem.key === "expo-categories" || merged.key === "expo-categories") {
        delete merged.image;
        delete merged.imageAlt;
        delete merged.title;
        delete merged.subtitle;
        if (!merged.sectionTag) merged.sectionTag = "Expo Categories";
        if (!merged.titleMain) merged.titleMain = "Explore Diverse";
        if (!merged.titleHighlight) merged.titleHighlight = "Exhibition Sectors";
        if (!merged.descriptionPrefix) merged.descriptionPrefix = "One Platform. Every Opportunity.";
        if (!merged.description) merged.description = "Bharat Organic Expo brings together the entire organic ecosystem under one roof. Explore a wide range of sectors driving sustainable living, natural wellness, ethical production and global trade.";
        if (!merged.buttonText) merged.buttonText = "VIEW ALL CATEGORIES";
        if (!merged.buttonHref) merged.buttonHref = "/exhibition-categories";
        if (!merged.exploreText) merged.exploreText = "Explore";
        if (Array.isArray(merged.items)) {
          merged.items = merged.items.map((it: any) => {
            const clean = { ...it };
            delete clean.icon;
            delete clean.desc;
            delete clean.color;
            delete clean.imageAlt;
            if (clean.description === undefined) clean.description = it.desc || "";
            if (clean.image === undefined) clean.image = "";
            if (!clean.href) clean.href = it.link || "/exhibition-categories";
            if (!clean.exploreText) clean.exploreText = "Explore";
            return clean;
          });
        }
      }
      if (fallbackItem.key === "beyond-exhibition" || merged.key === "beyond-exhibition") {
        delete merged.title;
        delete merged.subtitle;
        if (!merged.sectionTag) merged.sectionTag = "Global Organic Platform";
        if (!merged.titleMain) merged.titleMain = "Beyond An";
        if (!merged.titleHighlight) merged.titleHighlight = "Exhibition";
        if (!merged.description) merged.description = "Join India's most powerful ecosystem for the organic industry. From high-impact B2B matchmaking and leadership summits to global networking, we provide everything you need to scale your business.";
        if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";
        if (!merged.imageAlt) merged.imageAlt = "Conferences & Seminars";
        if (Array.isArray(merged.items)) {
          merged.items = merged.items.map((it: any) => ({
            title: it.title || "",
            description: it.description || it.subtitle || "",
            icon: it.icon || "Users",
          }));
        }
      }
      if (fallbackItem.key === "sponsors-attend" || merged.key === "sponsors-attend") {
        delete merged.title;
        delete merged.subtitle;
        delete merged.rightTitle;
        delete merged.rightBottomText;
        delete merged.centerText1;
        delete merged.centerText2;
        delete merged.centerText3;
        delete merged.items;
        if (!merged.titlePrefix) merged.titlePrefix = "WHY";
        if (!merged.titleHighlight) merged.titleHighlight = "ATTEND?";
        if (!merged.description) merged.description = "Explore innovations, build connections and gain insights that drive better health and stronger businesses.";
        if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";
        if (!merged.imageAlt) merged.imageAlt = "Why Attend Expo";
        if (!merged.buttonLabel) merged.buttonLabel = "REGISTER AS VISITOR!";
        if (!merged.buttonHref) merged.buttonHref = "/registration/visitor-registration";
        if (!merged.feature1Title) merged.feature1Title = "DISCOVER";
        if (!merged.feature1Desc) merged.feature1Desc = "Explore the latest organic products and eco-friendly services driving a sustainable future.";
        if (!merged.feature2Title) merged.feature2Title = "LEARN";
        if (!merged.feature2Desc) merged.feature2Desc = "Attend seminars, workshops and live demos by organic agriculture and sustainability experts.";
        if (!merged.feature3Title) merged.feature3Title = "CONNECT";
        if (!merged.feature3Desc) merged.feature3Desc = "Meet leading organic brands, manufacturers and sustainable suppliers under one roof.";
        if (!merged.feature4Title) merged.feature4Title = "SOURCE";
        if (!merged.feature4Desc) merged.feature4Desc = "Find trusted organic suppliers, distributors and eco-franchise opportunities.";
        if (!merged.feature5Title) merged.feature5Title = "GROW";
        if (!merged.feature5Desc) merged.feature5Desc = "Unlock new green business opportunities, partnerships and eco-investment possibilities.";
        if (!merged.feature6Title) merged.feature6Title = "STAY AHEAD";
        if (!merged.feature6Desc) merged.feature6Desc = "Stay updated with market trends, conscious consumer insights and future organic industry developments.";
        if (!merged.keyPoint1) merged.keyPoint1 = "Organic Distributors, Wholesalers & Retailers";
        if (!merged.keyPoint2) merged.keyPoint2 = "Eco-Importers & Exporters";
        if (!merged.keyPoint3) merged.keyPoint3 = "Ayurvedic Institutions & Wellness Centers";
        if (!merged.keyPoint4) merged.keyPoint4 = "Nutritionists, Farmers & Wellness Experts";
        if (!merged.keyPoint5) merged.keyPoint5 = "Gym Owners, Spa & Eco-Fitness Professionals";
        if (!merged.keyPoint6) merged.keyPoint6 = "Organic Farming & Natural Product Buyers";
        if (!merged.keyPoint7) merged.keyPoint7 = "Sustainable Packaging & Eco-friendly Brands";
        if (!merged.keyPoint8) merged.keyPoint8 = "Investors, Franchise Seekers & Green Business";
        if (!merged.keyPoint9) merged.keyPoint9 = "Supermarkets & Organic Grocery Chains";
        if (!merged.keyPoint10) merged.keyPoint10 = "Health-Conscious Consumers & Eco-Enthusiasts";
      }
      if (fallbackItem.key === "footer" || merged.key === "footer") {
        delete merged.title;
        delete merged.subtitle;
        delete merged.partnerLogoImage;
        delete merged.secondaryImage;
        delete merged.tertiaryImage;
        delete merged.altPhoneNumber;
        if (!merged.websiteUrl) merged.websiteUrl = "www.bharatorganicexpo.com";
        if (merged.description === undefined || merged.description.startsWith("Showcasing certified products")) {
          merged.description =
            "A global platform uniting over 500+ exhibitors from across the organic value chain, showcasing certified products, advanced agritech, sustainable practices, and the rich heritage of traditional wellness. Discover organic living with conferences and B2B opportunities.";
        }
        if (merged.logoImage === undefined || merged.logoImage.includes("km.jpg")) {
          merged.logoImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240083-112323989.png";
        }
        if (merged.leafImage === undefined) {
          merged.leafImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240457-21656484.png";
        }
        if (merged.downImage === undefined) {
          merged.downImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240816-597711504.png";
        }
        if (merged.organisedByLogo === undefined) {
          merged.organisedByLogo = "http://localhost:4000/uploads/bharat-organic_footer/1789129241128-849314126.png";
        }
        if (merged.bottomBannerImage === undefined) {
          merged.bottomBannerImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129242465-452827954.webp";
        }
        if (merged.contactAddress === undefined) merged.contactAddress = "Hall 12, Pragati Maidan, New Delhi, India 110001";
        if (merged.phoneNumber === undefined) merged.phoneNumber = "+91 96549 00525";
        if (merged.conferenceHelpline === undefined) merged.conferenceHelpline = "+91 98183 53841";
        if (merged.contactEmail === undefined) merged.contactEmail = "info@namogangewellness.com";
        if (merged.facebookUrl === undefined) merged.facebookUrl = "https://facebook.com/bharatorganicexpo";
        if (merged.twitterUrl === undefined) merged.twitterUrl = "https://twitter.com/bharatorganic";
        if (merged.linkedinUrl === undefined) merged.linkedinUrl = "https://linkedin.com/company/bharatorganicexpo";
        if (merged.instagramUrl === undefined) merged.instagramUrl = "https://instagram.com/bharatorganicexpo";
        if (merged.youtubeUrl === undefined) merged.youtubeUrl = "https://youtube.com/@bharatorganicexpo";
        if (!merged.items || merged.items.length === 0) {
          merged.items = [
            { label: "Home", href: "/" },
            { label: "About Us", href: "/about" },
            { label: "Exhibitor Registration", href: "/registration/book-a-stand" },
            { label: "Delegate Registration", href: "https://arogya.namogange.org/" },
            { label: "Conference Tracks", href: "https://arogya.namogange.org/" },
            { label: "Buyer Seller Meet", href: "/buyer-seller-meet" },
            { label: "Exhibitor List", href: "/exhibitors" },
            { label: "Blogs", href: "/blog" },
            { label: "Awards", href: "/awards" },
            { label: "Contact Us", href: "/contact" },
          ];
        }
      }
      return merged;
    });
    const finalSections = (rawSections && rawSections.length > 0 ? rawSections : fallbackSections).filter(
      (s: any) => !(s.key === "gallery-grid" || s.name === "GalleryGrid")
    );
    setSectionsDraft(finalSections.map((section: Record<string, any>) => ({ ...section })));
    setOpenSectionIndices(new Set());

    if (page.configKey === "landingPage" || page.type === "home") {
      api.get("/website/home/audience-strip")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "audience-strip"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      items: data.items.map((it: any) => ({
                        title: it.title ?? "",
                        subtitle: it.subtitle ?? "",
                        label: it.label ?? `${it.title ?? ""} ${it.subtitle ?? ""}`.trim(),
                        icon: it.icon ?? "GraduationCap",
                        color: it.color ?? "#facc15",
                      })),
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/introduction-section")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "introduction-section"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? sec.titleSecondary,
                      subtitle: data.subtitle ?? sec.subtitle,
                      description: data.description ?? sec.description,
                      description2: data.description2 ?? sec.description2,
                      buttonLabel: data.buttonLabel ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? sec.buttonHref,
                      timerTitle: data.timerTitle ?? sec.timerTitle,
                      eventDate: data.eventDate ?? sec.eventDate,
                      showTimer: data.showTimer !== false,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/global-platform")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "global-platform"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? data.badge ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? sec.titleSecondary,
                      description: data.description ?? sec.description,
                      keyPoint1:
                        data.keyPoint1 ??
                        data.listItems?.[0] ??
                        sec.keyPoint1 ??
                        "International Exhibitors & Global Brands",
                      keyPoint2:
                        data.keyPoint2 ??
                        data.listItems?.[1] ??
                        sec.keyPoint2 ??
                        "Buyers, Distributors & Importers",
                      keyPoint3:
                        data.keyPoint3 ??
                        data.listItems?.[2] ??
                        sec.keyPoint3 ??
                        "Research & Innovation | Startups",
                      keyPoint4:
                        data.keyPoint4 ??
                        data.listItems?.[3] ??
                        sec.keyPoint4 ??
                        "Investors, Financial Institutions",
                      keyPoint5:
                        data.keyPoint5 ??
                        data.listItems?.[4] ??
                        sec.keyPoint5 ??
                        "Government Bodies, Embassies & Policy Makers",
                      items:
                        Array.isArray(data.items || data.cards) &&
                        (data.items || data.cards).length > 0
                          ? (data.items || data.cards)
                              .filter(
                                (c: any) =>
                                  !/trusted brands|targeted audience|business growth/i.test(
                                    c.title || ""
                                  )
                              )
                              .map((c: any) => ({
                                title: c.title ?? "",
                                description: c.description ?? c.desc ?? "",
                              }))
                          : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/why-participate")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "why-participate"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? data.sectionTag ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? data.titleMain ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? data.titleHighlight ?? sec.titleSecondary,
                      description: data.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      buttonLabel: data.buttonLabel ?? data.buttons?.stall?.text ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? data.buttons?.stall?.link ?? sec.buttonHref,
                      secondaryButtonLabel: data.secondaryButtonLabel ?? data.buttons?.brochure?.text ?? sec.secondaryButtonLabel,
                      secondaryButtonHref: data.secondaryButtonHref ?? data.buttons?.brochure?.link ?? sec.secondaryButtonHref,
                      tertiaryButtonLabel: data.tertiaryButtonLabel ?? data.buttons?.moreInfo?.text ?? sec.tertiaryButtonLabel,
                      tertiaryButtonHref: data.tertiaryButtonHref ?? data.buttons?.moreInfo?.link ?? sec.tertiaryButtonHref,
                      keyPoint1: data.keyPoint1 ?? data.points?.[0] ?? sec.keyPoint1,
                      keyPoint2: data.keyPoint2 ?? data.points?.[1] ?? sec.keyPoint2,
                      keyPoint3: data.keyPoint3 ?? data.points?.[2] ?? sec.keyPoint3,
                      keyPoint4: data.keyPoint4 ?? data.points?.[3] ?? sec.keyPoint4,
                      keyPoint5: data.keyPoint5 ?? data.points?.[4] ?? sec.keyPoint5,
                      keyPoint6: data.keyPoint6 ?? data.points?.[5] ?? sec.keyPoint6,
                      keyPoint7: data.keyPoint7 ?? data.points?.[6] ?? sec.keyPoint7,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/conference-seminars")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "conference-section"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.eyebrow ?? data.sectionTag ?? sec.eyebrow,
                      titlePrimary: data.titlePrimary ?? data.titleMain ?? sec.titlePrimary,
                      titleSecondary: data.titleSecondary ?? data.titleHighlight ?? sec.titleSecondary,
                      description: data.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      buttonLabel: data.buttonLabel ?? data.button?.text ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? data.button?.link ?? sec.buttonHref,
                      keyPoint1: data.keyPoint1 ?? data.checklist?.[0] ?? sec.keyPoint1,
                      keyPoint2: data.keyPoint2 ?? data.checklist?.[1] ?? sec.keyPoint2,
                      keyPoint3: data.keyPoint3 ?? data.checklist?.[2] ?? sec.keyPoint3,
                      stat1Title: data.stat1Title ?? data.eventInfo?.[0]?.title ?? sec.stat1Title,
                      stat1Sub: data.stat1Sub ?? data.eventInfo?.[0]?.sub ?? sec.stat1Sub,
                      stat2Title: data.stat2Title ?? data.eventInfo?.[1]?.title ?? sec.stat2Title,
                      stat2Sub: data.stat2Sub ?? data.eventInfo?.[1]?.sub ?? sec.stat2Sub,
                      stat3Title: data.stat3Title ?? data.eventInfo?.[2]?.title ?? sec.stat3Title,
                      stat3Sub: data.stat3Sub ?? data.eventInfo?.[2]?.sub ?? sec.stat3Sub,
                      stat4Title: data.stat4Title ?? data.eventInfo?.[3]?.title ?? sec.stat4Title,
                      stat4Sub: data.stat4Sub ?? data.eventInfo?.[3]?.sub ?? sec.stat4Sub,
                      stat5Title: data.stat5Title ?? data.eventInfo?.[4]?.title ?? sec.stat5Title,
                      stat5Sub: data.stat5Sub ?? data.eventInfo?.[4]?.sub ?? sec.stat5Sub,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/expo-categories")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "expo-categories"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      sectionTag: data.sectionTag ?? sec.sectionTag,
                      titleMain: data.titleMain ?? sec.titleMain,
                      titleHighlight: data.titleHighlight ?? sec.titleHighlight,
                      descriptionPrefix: data.descriptionPrefix ?? sec.descriptionPrefix,
                      description: data.description ?? sec.description,
                      exploreText: data.exploreText ?? sec.exploreText,
                      buttonText: data.buttonText ?? sec.buttonText,
                      buttonHref: data.buttonHref ?? data.buttonLink ?? sec.buttonHref,
                      items: Array.isArray(data.items) && data.items.length > 0
                        ? data.items.map((it: any) => ({
                            title: it.title || "",
                            description: it.description ?? it.desc ?? "",
                            image: it.image || "",
                            href: it.href ?? it.link ?? "/exhibition-categories",
                            exploreText: it.exploreText || "Explore",
                          }))
                        : Array.isArray(data.categories) && data.categories.length > 0
                        ? data.categories.map((it: any) => ({
                            title: it.title || "",
                            description: it.description ?? it.desc ?? "",
                            image: it.image || "",
                            href: it.href ?? it.link ?? "/exhibition-categories",
                            exploreText: it.exploreText || "Explore",
                          }))
                        : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/beyond-exhibition")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "beyond-exhibition"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      sectionTag: data.sectionTag ?? sec.sectionTag,
                      titleMain: data.titleMain ?? sec.titleMain,
                      titleHighlight: data.titleHighlight ?? sec.titleHighlight,
                      description: data.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      items: Array.isArray(data.items) && data.items.length > 0
                        ? data.items.map((it: any) => ({
                            title: it.title || "",
                            description: it.description ?? it.subtitle ?? "",
                            icon: it.icon || "Users",
                          }))
                        : Array.isArray(data.extras) && data.extras.length > 0
                        ? data.extras.map((it: any) => ({
                            title: it.title2 ? `${it.title} ${it.title2}`.trim() : (it.title || ""),
                            description: it.description ?? it.subtitle ?? "",
                            icon: it.icon || "Users",
                          }))
                        : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/home/sponsors-attend")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "sponsors-attend"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      titlePrefix: data.titlePrefix ?? data.leftSection?.titlePrefix ?? sec.titlePrefix,
                      titleHighlight: data.titleHighlight ?? data.leftSection?.titleHighlight ?? sec.titleHighlight,
                      description: data.description ?? data.leftSection?.description ?? sec.description,
                      image: data.image ?? sec.image,
                      imageAlt: data.imageAlt ?? sec.imageAlt,
                      buttonLabel: data.buttonLabel ?? sec.buttonLabel,
                      buttonHref: data.buttonHref ?? sec.buttonHref,

                      feature1Title: data.feature1Title ?? data.leftSection?.itemsLeft?.[0]?.title ?? sec.feature1Title,
                      feature1Desc: data.feature1Desc ?? data.leftSection?.itemsLeft?.[0]?.desc ?? sec.feature1Desc,
                      feature2Title: data.feature2Title ?? data.leftSection?.itemsRight?.[0]?.title ?? sec.feature2Title,
                      feature2Desc: data.feature2Desc ?? data.leftSection?.itemsRight?.[0]?.desc ?? sec.feature2Desc,
                      feature3Title: data.feature3Title ?? data.leftSection?.itemsLeft?.[1]?.title ?? sec.feature3Title,
                      feature3Desc: data.feature3Desc ?? data.leftSection?.itemsLeft?.[1]?.desc ?? sec.feature3Desc,
                      feature4Title: data.feature4Title ?? data.leftSection?.itemsRight?.[1]?.title ?? sec.feature4Title,
                      feature4Desc: data.feature4Desc ?? data.leftSection?.itemsRight?.[1]?.desc ?? sec.feature4Desc,
                      feature5Title: data.feature5Title ?? data.leftSection?.itemsLeft?.[2]?.title ?? sec.feature5Title,
                      feature5Desc: data.feature5Desc ?? data.leftSection?.itemsLeft?.[2]?.desc ?? sec.feature5Desc,
                      feature6Title: data.feature6Title ?? data.leftSection?.itemsRight?.[2]?.title ?? sec.feature6Title,
                      feature6Desc: data.feature6Desc ?? data.leftSection?.itemsRight?.[2]?.desc ?? sec.feature6Desc,

                      keyPoint1: data.keyPoint1 ?? data.rightSection?.items?.[0]?.label ?? sec.keyPoint1,
                      keyPoint2: data.keyPoint2 ?? data.rightSection?.items?.[1]?.label ?? sec.keyPoint2,
                      keyPoint3: data.keyPoint3 ?? data.rightSection?.items?.[2]?.label ?? sec.keyPoint3,
                      keyPoint4: data.keyPoint4 ?? data.rightSection?.items?.[3]?.label ?? sec.keyPoint4,
                      keyPoint5: data.keyPoint5 ?? data.rightSection?.items?.[4]?.label ?? sec.keyPoint5,
                      keyPoint6: data.keyPoint6 ?? data.rightSection?.items?.[5]?.label ?? sec.keyPoint6,
                      keyPoint7: data.keyPoint7 ?? data.rightSection?.items?.[6]?.label ?? sec.keyPoint7,
                      keyPoint8: data.keyPoint8 ?? data.rightSection?.items?.[7]?.label ?? sec.keyPoint8,
                      keyPoint9: data.keyPoint9 ?? data.rightSection?.items?.[8]?.label ?? sec.keyPoint9,
                      keyPoint10: data.keyPoint10 ?? data.rightSection?.items?.[9]?.label ?? sec.keyPoint10,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});
    }

    if (page.configKey === "whyExhibitPage" || page.slug?.includes("why-exhibit")) {
      api.get("/website/participate/why-exhibit/hero")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "why-exhibit-hero"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      eyebrow: data.tagline ?? sec.eyebrow,
                      titlePrimary: data.titlePrefix ?? sec.titlePrimary,
                      titleSecondary: data.titleHighlight ?? sec.titleSecondary,
                      description: data.description ?? sec.description,
                      bgImage: data.bgImage ?? sec.bgImage ?? "",
                      buttonLabel: data.buttons?.[0]?.label ?? sec.buttonLabel,
                      buttonHref: data.buttons?.[0]?.href ?? sec.buttonHref,
                      secondaryButtonLabel: data.buttons?.[1]?.label ?? sec.secondaryButtonLabel,
                      secondaryButtonHref: data.buttons?.[1]?.href ?? sec.secondaryButtonHref,
                      items: Array.isArray(data.highlights) && data.highlights.length > 0
                        ? data.highlights.map((h: any, idx: number) => ({
                            main: h.main ?? sec.items?.[idx]?.main ?? "",
                            sub: h.sub ?? sec.items?.[idx]?.sub ?? "",
                            image: h.image || h.img || sec.items?.[idx]?.image || `/uploads/icons/x${(idx % 4) + 1}.png`,
                          }))
                        : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/participate/why-exhibit/stats-band")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (Array.isArray(data) && data.length > 0) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "exhibitors-stats" || sec.name === "StatsBand"
                  ? {
                      ...sec,
                      items: data.map((it: any, idx: number) => ({
                        val: it.val ?? sec.items?.[idx]?.val ?? "",
                        label: it.label ?? sec.items?.[idx]?.label ?? "",
                        icon: it.icon ?? it.iconName ?? sec.items?.[idx]?.icon ?? "Users",
                      })),
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/participate/why-exhibit/reasons")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (Array.isArray(data) && data.length > 0) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "reasons-to-exhibit" || sec.name === "ReasonsSection"
                  ? {
                      ...sec,
                      items: data.map((it: any, idx: number) => {
                        const defaultIcons = [
                          "/uploads/icons/11og.webp",
                          "/uploads/icons/12og.webp",
                          "/uploads/icons/13og.webp",
                          "/uploads/icons/14og.webp",
                          "/uploads/icons/15og.webp",
                          "/uploads/icons/i6.png",
                        ];
                        const imgVal = it.image || it.img || sec.items?.[idx]?.image || defaultIcons[idx % defaultIcons.length];
                        const featVal = Array.isArray(it.features) && it.features.length > 0
                          ? it.features
                          : Array.isArray(it.points) && it.points.length > 0
                          ? it.points
                          : sec.items?.[idx]?.features || [];
                        return {
                          title1: it.title1 ?? sec.items?.[idx]?.title1 ?? "",
                          title2: it.title2 ?? sec.items?.[idx]?.title2 ?? "",
                          description: it.description ?? sec.items?.[idx]?.description ?? "",
                          image: imgVal,
                          feature1: it.feature1 ?? featVal[0] ?? sec.items?.[idx]?.feature1 ?? "",
                          feature2: it.feature2 ?? featVal[1] ?? sec.items?.[idx]?.feature2 ?? "",
                          feature3: it.feature3 ?? featVal[2] ?? sec.items?.[idx]?.feature3 ?? "",
                          features: featVal,
                        };
                      }),
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});

      api.get("/website/participate/why-visit/segments")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          const defaultImgs = [
            "/uploads/icons/x1.webp",
            "/uploads/icons/x2.webp",
            "/uploads/icons/x3.webp",
            "/uploads/icons/x4.webp",
            "/uploads/icons/x5.webp",
            "/uploads/icons/x6.webp",
          ];
          const segList = Array.isArray(data?.segments) && data.segments.length > 0
            ? data.segments
            : null;
          if (segList && segList.length > 0) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "industry-segments" || sec.name === "IndustrySegments"
                  ? {
                      ...sec,
                      eyebrow: data.badge ?? sec.eyebrow ?? "WHAT CAN YOU SOURCE?",
                      subtitle: data.subline ?? sec.subtitle ?? "ONE EXPO • COMPLETE ECOSYSTEM",
                      title: `${data.mainTitleLine1 ?? "Explore "}${data.segmentCount ?? "6"}${data.mainTitleLine2 ?? " Major Industry Segments"}`,
                      items: segList.map((c: any, idx: number) => ({
                        num: c.num ?? `0${idx + 1}`,
                        title: c.title ?? sec.items?.[idx]?.title ?? "",
                        subtitle: c.items ?? c.subtitle ?? sec.items?.[idx]?.subtitle ?? "",
                        iconImage: c.iconImage || c.iconImg || sec.items?.[idx]?.iconImage || `/uploads/icons/x${idx + 1}og.png`,
                        image: c.image || sec.items?.[idx]?.image || defaultImgs[idx % 6],
                      })),
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});
    }

    if (page.configKey === "whyVisitPage" || page.slug?.includes("why-visit")) {
      api.get("/website/participate/why-visit/matters")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) =>
                sec.key === "why-visit-matters" || sec.name === "WhyVisitMatters"
                  ? {
                      ...sec,
                      enabled: data.enabled !== false,
                      image: data.image || data.bandImg || sec.image || "/uploads/icons/band.png",
                      imageAlt: data.imageAlt ?? sec.imageAlt ?? "Business Opportunities Under One Roof",
                      title: data.title ?? sec.title ?? "Why Your Visit Matters",
                      subtitle: data.subtitle ?? data.subline1 ?? sec.subtitle,
                      description: data.description ?? data.shortDescription ?? data.subline2 ?? sec.description,
                      shortDescription: data.shortDescription ?? data.description ?? data.subline2 ?? sec.shortDescription,
                      lowerTitle: data.lowerTitle ?? data.bannerTitle ?? sec.lowerTitle,
                      lowerDescription: data.lowerDescription ?? data.bannerDesc ?? sec.lowerDescription,
                      items: Array.isArray(data.items || data.cards) && (data.items || data.cards).length > 0
                        ? (data.items || data.cards).map((it: any, idx: number) => ({
                            num: it.num ?? `0${idx + 1}`,
                            title: it.title ?? sec.items?.[idx]?.title ?? "",
                            description: it.description ?? it.desc ?? sec.items?.[idx]?.description ?? "",
                            image: it.image || it.img || sec.items?.[idx]?.image || `/uploads/icons/v${idx + 1}og.png`,
                          }))
                        : sec.items,
                    }
                  : sec
              )
            );
          }
        })
        .catch(() => {});
    }

    if (page.configKey === "awardsPage" || page.slug?.includes("awards") || page.slug?.includes("excellence-awards")) {
      api.get("/website/awards/hero")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-hero" || sec.name === "Awards Hero Banner") {
                  const cleanedSec = { ...sec };
                  delete (cleanedSec as any).shortDescription;
                  return {
                    ...cleanedSec,
                    enabled: data.enabled !== false,
                      eyebrow: data.eyebrow || data.tagline || sec.eyebrow || "BHARAT ORGANIC",
                      title:
                        data.title ||
                        (data.titlePrimary && data.titleSecondary
                          ? `${data.titlePrimary} ${data.titleSecondary}`
                          : sec.title || "EXCELLENCE AWARDS 2027"),
                      subtitle:
                        data.subtitle ||
                        (Array.isArray(data.highlights) && data.highlights.length > 0
                          ? data.highlights.map((h: any) => h.text || h).join(" • ")
                          : sec.subtitle || "Celebrating Excellence • Innovation • Sustainability"),
                      description:
                        data.description || data.shortDescription || sec.description || sec.shortDescription,
                      date:
                        data.date ||
                        (data.dateLine1 && data.dateLine2
                          ? `${data.dateLine1} ${data.dateLine2}`
                          : data.dateLine1 || sec.date || "19 - 21 February 2027"),
                      location:
                        data.location ||
                        (data.venueLine1 && data.venueLine2
                          ? `${data.venueLine1}, ${data.venueLine2}`
                          : data.venueLine1 || sec.location),
                      image: data.image || sec.image,
                      buttonLabel:
                        data.buttonLabel ||
                        (Array.isArray(data.buttons) && data.buttons[0]?.label) ||
                        sec.buttonLabel ||
                        "NOMINATE NOW",
                      buttonHref:
                        data.buttonHref ||
                        (Array.isArray(data.buttons) && data.buttons[0]?.href) ||
                        sec.buttonHref ||
                        "/awards/nominations",
                      secondaryButtonLabel:
                        data.secondaryButtonLabel ||
                        (Array.isArray(data.buttons) && data.buttons[1]?.label) ||
                        sec.secondaryButtonLabel ||
                        "VIEW CATEGORIES",
                      secondaryButtonHref:
                        data.secondaryButtonHref ||
                        (Array.isArray(data.buttons) && data.buttons[1]?.href) ||
                        sec.secondaryButtonHref ||
                        "#categories",
                  };
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/awards/stats")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-stats" || sec.name === "Key Statistics Strip") {
                  const cleanedSec = { ...sec };
                  delete (cleanedSec as any).eyebrow;
                  delete (cleanedSec as any).title;
                  return {
                    ...cleanedSec,
                    enabled: data.enabled !== false,
                    items: Array.isArray(data.items) && data.items.length > 0
                      ? data.items.map((it: any, idx: number) => ({
                          id: it.id || idx + 1,
                          title: it.title ?? "",
                          label: it.label || it.subtitle || "",
                          icon: it.icon || "Trophy",
                        }))
                      : sec.items,
                  };
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/awards/about")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-about" || sec.name === "About the Awards") {
                  const cleanedSec = { ...sec };
                  delete (cleanedSec as any).image;
                  delete (cleanedSec as any).imageAlt;
                  return {
                    ...cleanedSec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow || sec.eyebrow || "ABOUT THE AWARDS",
                    title: data.title || sec.title || "About the Awards",
                    description: data.description || data.shortDescription || sec.description,
                  };
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/awards/categories")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            const rawCats = data.items || data.categories;
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-categories" || sec.name === "Award Sector Categories") {
                  const cleanedSec = { ...sec };
                  delete (cleanedSec as any).description;
                  delete (cleanedSec as any).shortDescription;
                  return {
                    ...cleanedSec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow || sec.eyebrow || "AWARD CATEGORIES",
                    title: data.title || sec.title || "Award Categories",
                    items: Array.isArray(rawCats) && rawCats.length > 0
                      ? rawCats.map((it: any, idx: number) => {
                          const fallbackImages = [
                            "/assets/awards/organic_food.png",
                            "/assets/awards/ayush.png",
                            "/assets/awards/organic_agriculture.png",
                            "/assets/awards/natural.png",
                            "/assets/awards/greentech.png",
                            "/assets/awards/trade.png",
                          ];
                          let finalImage = it.image || "";
                          if (!finalImage || (!finalImage.startsWith("/") && !finalImage.startsWith("http"))) {
                            if (it.icon && (it.icon.startsWith("/") || it.icon.startsWith("http"))) {
                              finalImage = it.icon;
                            } else if (it.icon) {
                              finalImage = `/assets/awards/${it.icon}.png`;
                            } else {
                              finalImage = fallbackImages[idx % fallbackImages.length];
                            }
                          }
                          return {
                            id: it.id || idx + 1,
                            title: it.title ?? "",
                            image: finalImage,
                            keyPoint1: it.keyPoint1 || it.points?.[0] || it.items?.[0] || "",
                            keyPoint2: it.keyPoint2 || it.points?.[1] || it.items?.[1] || "",
                            keyPoint3: it.keyPoint3 || it.points?.[2] || it.items?.[2] || "",
                            keyPoint4: it.keyPoint4 || it.points?.[3] || it.items?.[3] || "",
                          };
                        })
                      : sec.items,
                  };
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/awards/grand-awards")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            const rawItems = data.items || data.awards;
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-grand-awards" || sec.name === "Prestigious Grand Awards") {
                  const cleanedSec = { ...sec };
                  delete (cleanedSec as any).description;
                  delete (cleanedSec as any).shortDescription;
                  const fallbackImages = [
                    "/assets/awards/organic_enterpreneur.png",
                    "/assets/awards/organic_startup.png",
                    "/assets/awards/organic_brand.png",
                    "/assets/awards/innovation.png",
                    "/assets/awards/sustainability.png",
                    "/assets/awards/lifetime_achievement.png",
                  ];
                  return {
                    ...cleanedSec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow || sec.eyebrow || "GRAND HONOURS",
                    title: data.title || sec.title || "Prestigious Grand Awards",
                    items: Array.isArray(rawItems) && rawItems.length > 0
                      ? rawItems.map((it: any, idx: number) => {
                          let finalImage = it.image || "";
                          if (!finalImage || (!finalImage.startsWith("/") && !finalImage.startsWith("http"))) {
                            if (it.icon && (it.icon.startsWith("/") || it.icon.startsWith("http"))) {
                              finalImage = it.icon;
                            } else if (it.icon) {
                              finalImage = `/assets/awards/${it.icon}.png`;
                            } else {
                              finalImage = fallbackImages[idx % fallbackImages.length];
                            }
                          }
                          return {
                            id: it.id || idx + 1,
                            title: it.title || it.label || "",
                            image: finalImage,
                          };
                        })
                      : sec.items,
                  };
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/awards/process")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            const rawItems = data.items || data.steps;
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-process" || sec.name === "Our Evaluation Process") {
                  const cleanedSec = { ...sec };
                  delete (cleanedSec as any).description;
                  delete (cleanedSec as any).shortDescription;
                  const fallbackImages = [
                    "/assets/awards/nomination.png",
                    "/assets/awards/eligibility.png",
                    "/assets/awards/evaluation-jury.png",
                    "/assets/awards/shortlisting.png",
                    "/assets/awards/evaluation-jury.png",
                    "/assets/awards/recognition.png",
                  ];
                  return {
                    ...cleanedSec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow || sec.eyebrow || "EVALUATION PROCESS",
                    title: data.title || sec.title || "Our Evaluation Process",
                    items: Array.isArray(rawItems) && rawItems.length > 0
                      ? rawItems.map((it: any, idx: number) => {
                          let finalImage = it.image || "";
                          if (!finalImage || (!finalImage.startsWith("/") && !finalImage.startsWith("http"))) {
                            if (it.icon && (it.icon.startsWith("/") || it.icon.startsWith("http"))) {
                              finalImage = it.icon;
                            } else if (it.icon) {
                              finalImage = `/assets/awards/${it.icon}.png`;
                            } else {
                              finalImage = fallbackImages[idx % fallbackImages.length];
                            }
                          }
                          return {
                            id: it.id || idx + 1,
                            title: it.title || "",
                            description: it.description || it.desc || it.shortDescription || "",
                            image: finalImage,
                          };
                        })
                      : sec.items,
                  };
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/awards/nomination-hero")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-nomination-hero" || sec.name === "Awards Nomination Form Hero") {
                  const updatedSec = {
                    ...sec,
                    enabled: data.enabled !== false,
                    title: data.title || sec.title || "Bharat Organic Excellence Awards 2027",
                    subtitle: data.subtitle || sec.subtitle || "Celebrating Excellence • Innovation • Sustainability",
                    description: data.description || data.shortDescription || sec.description || "Honouring the changemakers, organizations and innovations during india's organic, natural and sustainable future.",
                    buttonLabel: data.buttonLabel || sec.buttonLabel || "Submit Nomination",
                    buttonHref: data.buttonHref || sec.buttonHref || "#nomination-form",
                    secondaryButtonLabel: data.secondaryButtonLabel || sec.secondaryButtonLabel || "View Categories",
                    secondaryButtonHref: data.secondaryButtonHref || sec.secondaryButtonHref || "/awards",
                    date: data.date || sec.date || "19 - 21 February 2027",
                    location: data.location || sec.location || "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA",
                    image: data.image || data.bgImage || sec.image || "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
                  };
                  delete (updatedSec as any).eyebrow;
                  return updatedSec;
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/awards/nomination-steps")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "awards-nomination-steps" || sec.name === "Nomination Submission Steps") {
                  const rawItems = data.items || data.steps || [];
                  if (rawItems.length > 0) {
                    return {
                      ...sec,
                      enabled: data.enabled !== false,
                      title: data.title || sec.title || "THE AWARD PROCESS",
                      items: rawItems.map((it: any, idx: number) => ({
                        id: it.id ?? idx + 1,
                        num: it.num || String(idx + 1).padStart(2, "0"),
                        title: it.title || "",
                        description: it.description || it.desc || it.shortDescription || "",
                        image: it.image || "",
                      })),
                    };
                  }
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});
    }

    if (page.configKey === "galleryPage" || page.slug?.includes("gallery") || page.slug?.includes("glimpses")) {
      api.get("/website/gallery/hero")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data) {
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "gallery-hero" || sec.name === "HeroSection") {
                  const updatedSec = {
                    ...sec,
                    enabled: data.enabled !== false,
                    title: data.title ?? sec.title,
                    subtitle: data.subtitle ?? sec.subtitle,
                    description: data.shortDescription || data.description || sec.description,
                    image: data.rightImage || data.image || sec.image,
                  };
                  delete (updatedSec as any).shortDescription;
                  delete (updatedSec as any).rightImage;
                  return updatedSec;
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});

      api.get("/website/gallery/counters")
        .then((res: any) => {
          const data = res?.data?.data || res?.data || res;
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setSectionsDraft((prev) =>
              prev.map((sec) => {
                if (sec.key === "gallery-counters" || sec.name === "Counters") {
                  return {
                    ...sec,
                    enabled: data.enabled !== false,
                    title: data.title || sec.title,
                    items: data.items.map((it: any) => ({
                      val: it.val || "",
                      label: it.label || "",
                      image: it.image || "",
                    })),
                  };
                }
                return sec;
              })
            );
          }
        })
        .catch(() => {});
    }

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
    const key = (page.configKey || "").toLowerCase();
    const title = (page.title || "").toLowerCase();
    const slug = (page.slug || "").toLowerCase();
    let defaults = defaultLandingSections;
    if (key === "msmeeligibilitycheckpage" || slug.includes("eligibility-check")) defaults = defaultMsmeEligibilityCheckSections;
    else if (key === "msmeapplypaymentpage" || slug.includes("participate/msme/apply/payment")) defaults = defaultMsmeApplyPaymentSections;
    else if (key === "msmeapplyparticipationdetailspage" || slug.includes("participation-details")) defaults = defaultMsmeParticipationDetailsSections;
    else if (key === "msmeapplypage" || (slug.includes("participate/msme/apply") && !slug.includes("participation-details") && !slug.includes("payment"))) defaults = defaultMsmeApplySections;
    else if (key.includes("partnerpage") || (slug.includes("partnership/") && slug !== "/partnership")) defaults = defaultSubPartnershipSections;
    else if (key === "awardsnominationpage" || slug.includes("awards/nominations")) defaults = defaultAwardsNominationSections;
    else if (key === "nominateadvisorypage" || slug.includes("nominate_advisory_board")) defaults = defaultNominateAdvisorySections;
    else if (key === "supportservicespage" || slug.includes("suport_services")) defaults = defaultSupportServicesSections;
    else if (key === "aboutpage" || title.includes("about") || slug === "/about") defaults = defaultAboutSections;
    else if (key === "advisorypage" || title.includes("advisory") || slug.includes("advisory")) defaults = defaultAdvisorySections;
    else if (key === "blogpage" || title.includes("blog") || slug.includes("blog")) defaults = defaultBlogSections;
    else if (key === "participateasexhibitorpage" || title.includes("participate as exhibitor") || slug.includes("participate-as-exhibitor")) defaults = defaultParticipateAsExhibitorSections;
    else if (key === "exhibitioncategoriespage" || title.includes("exhibition categories") || slug.includes("exhibition-categories")) defaults = defaultExhibitionCategoriesSections;
    else if (key === "bookastandpage" || title.includes("book a stall") || title.includes("book a stand") || slug.includes("book-a-stand")) defaults = defaultBookAStandSections;
    else if (key === "visitorregistrationpage" || title.includes("register as visitor") || title.includes("visitor registration") || slug.includes("visitor-registration")) defaults = defaultVisitorRegistrationSections;
    else if (key === "delegateregistrationpage" || title.includes("delegate registration") || slug.includes("delegate-registration")) defaults = defaultDelegateRegistrationSections;
    else if (key === "buyerregistrationpage" || title.includes("register as buyer") || title.includes("buyer registration") || slug.includes("buyer-registration")) defaults = defaultBuyerRegistrationSections;
    else if (key === "termsandconditionspage" || title.includes("terms") || slug.includes("terms")) defaults = defaultTermsAndConditionsSections;
    else if (key === "privacypolicypage" || title.includes("privacy") || slug.includes("privacy")) defaults = defaultPrivacyPolicySections;
    else if (key === "refundpolicypage" || title.includes("refund") || slug.includes("refund")) defaults = defaultRefundPolicySections;
    else if (key === "whyvisitpage" || title.includes("why visit") || slug.includes("why-visit")) defaults = defaultWhyVisitSections;
    else if (key === "whyexhibitpage" || title.includes("why exhibit") || slug.includes("why-exhibit")) defaults = defaultWhyExhibitSections;
    else if (key === "msmepage" || title.includes("msme") || slug.includes("msme")) defaults = defaultMsmeSections;
    else if (key === "exhibitorspage" || title.includes("exhibitors") || slug.includes("exhibitors")) defaults = defaultExhibitorsSections;
    else if (key === "buyersellermeetpage" || title.includes("buyer-seller") || slug.includes("buyer-seller")) defaults = defaultBuyerSellerMeetSections;
    else if (key === "gallerypage" || title.includes("gallery") || slug.includes("gallery")) defaults = defaultGallerySections;
    else if (key === "awardspage" || title.includes("award") || slug.includes("awards")) defaults = defaultAwardsSections;
    else if (key === "sponsorshippage" || title.includes("sponsorship") || slug.includes("sponsorship")) defaults = defaultSponsorshipSections;
    else if (key === "epromotionpage" || title.includes("e-promotion") || slug.includes("e-promotion")) defaults = defaultEPromotionSections;
    else if (key === "partnershippage" || title.includes("partnership") || slug.includes("partnership")) defaults = defaultPartnershipPageSections;
    else if (key === "exhibitorloginpage" || title.includes("exhibitor login") || slug.includes("exhibitor-login")) defaults = defaultExhibitorLoginSections;
    else if (key === "buyerloginpage" || title.includes("buyer login") || slug.includes("buyer-login")) defaults = defaultBuyerLoginSections;
    else if (key === "delegatesloginpage" || title.includes("delegates login") || slug.includes("delegates-login")) defaults = defaultDelegatesLoginSections;
    else if (key === "userloginpage" || title.includes("user login") || slug.includes("/login")) defaults = defaultUserLoginSections;
    else if (key === "contactpage" || title.includes("contact") || title.includes("advisor") || slug.includes("contact")) defaults = defaultContactSections;

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
        const heroSec = sectionsDraft.find((s) => s.key === "hero");
        if (heroSec && Array.isArray(heroSec.slides) && heroSec.slides.length > 0) {
          try {
            await api.put("/website/home/home-hero", { slides: heroSec.slides });
          } catch (err) {
            console.error("Failed to sync hero slides to backend:", err);
          }
        }

        const audienceSec = sectionsDraft.find((s) => s.key === "audience-strip");
        if (audienceSec) {
          try {
            await api.put("/website/home/audience-strip", {
              enabled: audienceSec.enabled !== false,
              items: audienceSec.items || [],
            });
          } catch (err) {
            console.error("Failed to sync audience strip to backend:", err);
          }
        }

        const introSec = sectionsDraft.find((s) => s.key === "introduction-section");
        if (introSec) {
          try {
            await api.put("/website/home/introduction-section", {
              enabled: introSec.enabled !== false,
              eyebrow: introSec.eyebrow,
              titlePrimary: introSec.titlePrimary,
              titleSecondary: introSec.titleSecondary,
              subtitle: introSec.subtitle,
              description: introSec.description,
              description2: introSec.description2,
              buttonLabel: introSec.buttonLabel,
              buttonHref: introSec.buttonHref,
              timerTitle: introSec.timerTitle,
              eventDate: introSec.eventDate,
              showTimer: introSec.showTimer !== false,
              image: introSec.image,
              imageAlt: introSec.imageAlt,
            });
          } catch (err) {
            console.error("Failed to sync introduction section to backend:", err);
          }
        }

        const globalSec = sectionsDraft.find((s) => s.key === "global-platform");
        if (globalSec) {
          try {
            await api.put("/website/home/global-platform", {
              enabled: globalSec.enabled !== false,
              eyebrow: globalSec.eyebrow,
              badge: globalSec.eyebrow,
              titlePrimary: globalSec.titlePrimary,
              titleSecondary: globalSec.titleSecondary,
              description: globalSec.description,
              keyPoint1: globalSec.keyPoint1,
              keyPoint2: globalSec.keyPoint2,
              keyPoint3: globalSec.keyPoint3,
              keyPoint4: globalSec.keyPoint4,
              keyPoint5: globalSec.keyPoint5,
              items: (globalSec.items || []).map((it: any) => ({
                title: it.title ?? "",
                description: it.description ?? it.desc ?? "",
                desc: it.description ?? it.desc ?? "",
              })),
            });
          } catch (err) {
            console.error("Failed to sync global platform to backend:", err);
          }
        }

        const whySec = sectionsDraft.find((s) => s.key === "why-participate");
        if (whySec) {
          try {
            await api.put("/website/home/why-participate", {
              enabled: whySec.enabled !== false,
              eyebrow: whySec.eyebrow,
              sectionTag: whySec.eyebrow,
              titlePrimary: whySec.titlePrimary,
              titleMain: whySec.titlePrimary,
              titleSecondary: whySec.titleSecondary,
              titleHighlight: whySec.titleSecondary,
              description: whySec.description,
              image: whySec.image,
              imageAlt: whySec.imageAlt,
              buttonLabel: whySec.buttonLabel,
              buttonHref: whySec.buttonHref,
              secondaryButtonLabel: whySec.secondaryButtonLabel,
              secondaryButtonHref: whySec.secondaryButtonHref,
              tertiaryButtonLabel: whySec.tertiaryButtonLabel,
              tertiaryButtonHref: whySec.tertiaryButtonHref,
              keyPoint1: whySec.keyPoint1,
              keyPoint2: whySec.keyPoint2,
              keyPoint3: whySec.keyPoint3,
              keyPoint4: whySec.keyPoint4,
              keyPoint5: whySec.keyPoint5,
              keyPoint6: whySec.keyPoint6,
              keyPoint7: whySec.keyPoint7,
              points: [
                whySec.keyPoint1,
                whySec.keyPoint2,
                whySec.keyPoint3,
                whySec.keyPoint4,
                whySec.keyPoint5,
                whySec.keyPoint6,
                whySec.keyPoint7,
              ].filter(Boolean),
            });
          } catch (err) {
            console.error("Failed to sync why participate to backend:", err);
          }
        }

        const confSec = sectionsDraft.find((s) => s.key === "conference-section");
        if (confSec) {
          try {
            await api.put("/website/home/conference-seminars", {
              enabled: confSec.enabled !== false,
              eyebrow: confSec.eyebrow,
              sectionTag: confSec.eyebrow,
              titlePrimary: confSec.titlePrimary,
              titleMain: confSec.titlePrimary,
              titleSecondary: confSec.titleSecondary,
              titleHighlight: confSec.titleSecondary,
              description: confSec.description,
              image: confSec.image,
              imageAlt: confSec.imageAlt,
              buttonLabel: confSec.buttonLabel,
              buttonHref: confSec.buttonHref,
              button: {
                text: confSec.buttonLabel,
                link: confSec.buttonHref,
              },
              keyPoint1: confSec.keyPoint1,
              keyPoint2: confSec.keyPoint2,
              keyPoint3: confSec.keyPoint3,
              checklist: [
                confSec.keyPoint1,
                confSec.keyPoint2,
                confSec.keyPoint3,
              ].filter(Boolean),
              stat1Title: confSec.stat1Title,
              stat1Sub: confSec.stat1Sub,
              stat2Title: confSec.stat2Title,
              stat2Sub: confSec.stat2Sub,
              stat3Title: confSec.stat3Title,
              stat3Sub: confSec.stat3Sub,
              stat4Title: confSec.stat4Title,
              stat4Sub: confSec.stat4Sub,
              stat5Title: confSec.stat5Title,
              stat5Sub: confSec.stat5Sub,
              eventInfo: [
                { icon: "Calendar", title: confSec.stat1Title, sub: confSec.stat1Sub },
                { icon: "MapPin", title: confSec.stat2Title, sub: confSec.stat2Sub },
                { icon: "Users", title: confSec.stat3Title, sub: confSec.stat3Sub },
                { icon: "Mic", title: confSec.stat4Title, sub: confSec.stat4Sub },
                { icon: "BookOpen", title: confSec.stat5Title, sub: confSec.stat5Sub },
              ],
            });
          } catch (err) {
            console.error("Failed to sync conference seminars to backend:", err);
          }
        }

        const expoSec = sectionsDraft.find((s) => s.key === "expo-categories");
        if (expoSec) {
          try {
            const cleanItems = Array.isArray(expoSec.items)
              ? expoSec.items.map((it: any) => ({
                  title: it.title || "",
                  description: it.description || "",
                  desc: it.description || "",
                  image: it.image || "",
                  href: it.href || "/exhibition-categories",
                  link: it.href || "/exhibition-categories",
                  exploreText: it.exploreText || "Explore",
                }))
              : [];

            await api.put("/website/home/expo-categories", {
              enabled: expoSec.enabled !== false,
              sectionTag: expoSec.sectionTag,
              titleMain: expoSec.titleMain,
              titleHighlight: expoSec.titleHighlight,
              descriptionPrefix: expoSec.descriptionPrefix,
              description: expoSec.description,
              exploreText: expoSec.exploreText,
              buttonText: expoSec.buttonText,
              buttonHref: expoSec.buttonHref,
              buttonLink: expoSec.buttonHref,
              items: cleanItems,
              categories: cleanItems,
            });
          } catch (err) {
            console.error("Failed to sync expo categories to backend:", err);
          }
        }

        const beyondSec = sectionsDraft.find((s) => s.key === "beyond-exhibition");
        if (beyondSec) {
          try {
            const cleanItems = Array.isArray(beyondSec.items)
              ? beyondSec.items.map((it: any) => ({
                  title: it.title || "",
                  description: it.description || it.subtitle || "",
                  subtitle: it.description || it.subtitle || "",
                  icon: it.icon || "Users",
                }))
              : [];

            await api.put("/website/home/beyond-exhibition", {
              enabled: beyondSec.enabled !== false,
              sectionTag: beyondSec.sectionTag,
              titleMain: beyondSec.titleMain,
              titleHighlight: beyondSec.titleHighlight,
              description: beyondSec.description,
              image: beyondSec.image,
              imageAlt: beyondSec.imageAlt,
              items: cleanItems,
              extras: cleanItems,
            });
          } catch (err) {
            console.error("Failed to sync beyond exhibition to backend:", err);
          }
        }

        const attendSec = sectionsDraft.find((s) => s.key === "sponsors-attend");
        if (attendSec) {
          try {
            await api.put("/website/home/sponsors-attend", {
              enabled: attendSec.enabled !== false,
              titlePrefix: attendSec.titlePrefix,
              titleHighlight: attendSec.titleHighlight,
              description: attendSec.description,
              image: attendSec.image,
              imageAlt: attendSec.imageAlt,
              buttonLabel: attendSec.buttonLabel,
              buttonHref: attendSec.buttonHref,

              feature1Title: attendSec.feature1Title,
              feature1Desc: attendSec.feature1Desc,
              feature2Title: attendSec.feature2Title,
              feature2Desc: attendSec.feature2Desc,
              feature3Title: attendSec.feature3Title,
              feature3Desc: attendSec.feature3Desc,
              feature4Title: attendSec.feature4Title,
              feature4Desc: attendSec.feature4Desc,
              feature5Title: attendSec.feature5Title,
              feature5Desc: attendSec.feature5Desc,
              feature6Title: attendSec.feature6Title,
              feature6Desc: attendSec.feature6Desc,

              keyPoint1: attendSec.keyPoint1,
              keyPoint2: attendSec.keyPoint2,
              keyPoint3: attendSec.keyPoint3,
              keyPoint4: attendSec.keyPoint4,
              keyPoint5: attendSec.keyPoint5,
              keyPoint6: attendSec.keyPoint6,
              keyPoint7: attendSec.keyPoint7,
              keyPoint8: attendSec.keyPoint8,
              keyPoint9: attendSec.keyPoint9,
              keyPoint10: attendSec.keyPoint10,
            });
          } catch (err) {
            console.error("Failed to sync sponsors and attend to backend:", err);
          }
        }
      }

      if (savingKey === "whyExhibitPage" || page.slug?.includes("why-exhibit")) {
        const whyHeroSec = sectionsDraft.find((s) => s.key === "why-exhibit-hero");
        if (whyHeroSec) {
          try {
            await api.put("/website/participate/why-exhibit/hero", {
              tagline: whyHeroSec.eyebrow,
              titlePrefix: whyHeroSec.titlePrimary,
              titleHighlight: whyHeroSec.titleSecondary,
              description: whyHeroSec.description,
              bgImage: whyHeroSec.bgImage || "",
              buttons: [
                {
                  label: whyHeroSec.buttonLabel || "Book Your Stall",
                  href: whyHeroSec.buttonHref || "/registration/book-a-stand",
                  variant: "orange",
                },
                {
                  label: whyHeroSec.secondaryButtonLabel || "Download Brochure",
                  href: whyHeroSec.secondaryButtonHref || "/download/invited card.pdf",
                  variant: "blue",
                },
              ],
              highlights: Array.isArray(whyHeroSec.items)
                ? whyHeroSec.items.map((it: any, idx: number) => {
                    const fallbackImg = `/uploads/icons/x${(idx % 4) + 1}.png`;
                    const imageVal = it.image || it.img || fallbackImg;
                    return {
                      main: it.main || "",
                      sub: it.sub || "",
                      image: imageVal,
                      img: imageVal,
                      icon: "",
                    };
                  })
                : [],
            });
          } catch (err) {
            console.error("Failed to sync why exhibit hero to backend:", err);
          }
        }

        const statsSec = sectionsDraft.find((s) => s.key === "exhibitors-stats" || s.name === "StatsBand");
        if (statsSec && Array.isArray(statsSec.items)) {
          try {
            await api.put("/website/participate/why-exhibit/stats-band", {
              title: statsSec.title || "EXPECTED IMPACT",
              items: statsSec.items.map((it: any) => ({
                val: it.val || "",
                label: it.label || "",
                icon: it.icon || "Users",
              })),
            });
          } catch (err) {
            console.error("Failed to sync stats band:", err);
          }
        }

        const reasonsSec = sectionsDraft.find((s) => s.key === "reasons-to-exhibit" || s.name === "ReasonsSection");
        if (reasonsSec && Array.isArray(reasonsSec.items)) {
          try {
            await api.put("/website/participate/why-exhibit/reasons", {
              title: reasonsSec.title || "Top Reasons to Exhibit at Bharat Organic Expo 2027",
              items: reasonsSec.items.map((it: any, idx: number) => {
                const defaultIcons = [
                  "/uploads/icons/11og.webp",
                  "/uploads/icons/12og.webp",
                  "/uploads/icons/13og.webp",
                  "/uploads/icons/14og.webp",
                  "/uploads/icons/15og.webp",
                  "/uploads/icons/i6.png",
                ];
                const imageVal = it.image || it.img || defaultIcons[idx % defaultIcons.length];
                const featList = [it.feature1, it.feature2, it.feature3].filter((f) => f && typeof f === "string" && f.trim() !== "");
                const featuresVal = featList.length > 0
                  ? featList
                  : Array.isArray(it.features) && it.features.length > 0
                  ? it.features
                  : typeof it.features === "string" && it.features.trim() !== ""
                  ? it.features.split(",").map((s: string) => s.trim()).filter(Boolean)
                  : [];
                return {
                  image: imageVal,
                  img: imageVal,
                  title1: it.title1 || "",
                  title2: it.title2 || "",
                  description: it.description || "",
                  feature1: it.feature1 || featuresVal[0] || "",
                  feature2: it.feature2 || featuresVal[1] || "",
                  feature3: it.feature3 || featuresVal[2] || "",
                  features: featuresVal,
                  points: featuresVal,
                };
              }),
            });
          } catch (err) {
            console.error("Failed to sync reasons to exhibit:", err);
          }
        }
      }

      if (savingKey === "whyVisitPage" || page.slug?.includes("why-visit")) {
        const mattersSec = sectionsDraft.find((s) => s.key === "why-visit-matters" || s.name === "WhyVisitMatters");
        if (mattersSec) {
          try {
            await api.put("/website/participate/why-visit/matters", {
              enabled: mattersSec.enabled !== false,
              image: mattersSec.image || "/uploads/icons/band.png",
              bandImg: mattersSec.image || "/uploads/icons/band.png",
              imageAlt: mattersSec.imageAlt || "Business Opportunities Under One Roof",
              title: mattersSec.title || "Why Your Visit Matters",
              subtitle: mattersSec.subtitle || "Bharat Organic Expo brings the right products, suppliers and decision-makers together,",
              subline1: mattersSec.subtitle || "Bharat Organic Expo brings the right products, suppliers and decision-makers together,",
              description: mattersSec.description || mattersSec.shortDescription || "creating real opportunities for your business growth.",
              shortDescription: mattersSec.shortDescription || mattersSec.description || "creating real opportunities for your business growth.",
              subline2: mattersSec.description || mattersSec.shortDescription || "creating real opportunities for your business growth.",
              lowerTitle: mattersSec.lowerTitle || "One Visit. Multiple Opportunities.",
              lowerDescription: mattersSec.lowerDescription || "Save time, meet the right people and take your business to the next level.",
              bannerTitle: mattersSec.lowerTitle || "One Visit. Multiple Opportunities.",
              bannerDesc: mattersSec.lowerDescription || "Save time, meet the right people and take your business to the next level.",
              items: Array.isArray(mattersSec.items)
                ? mattersSec.items.map((it: any, idx: number) => ({
                    num: it.num || `0${idx + 1}`,
                    title: it.title || "",
                    description: it.description || it.desc || "",
                    desc: it.description || it.desc || "",
                    image: it.image || it.img || `/uploads/icons/v${idx + 1}og.png`,
                    img: it.image || it.img || `/uploads/icons/v${idx + 1}og.png`,
                  }))
                : [],
              cards: Array.isArray(mattersSec.items)
                ? mattersSec.items.map((it: any, idx: number) => ({
                    num: it.num || `0${idx + 1}`,
                    title: it.title || "",
                    description: it.description || it.desc || "",
                    desc: it.description || it.desc || "",
                    image: it.image || it.img || `/uploads/icons/v${idx + 1}og.png`,
                    img: it.image || it.img || `/uploads/icons/v${idx + 1}og.png`,
                  }))
                : [],
            });
          } catch (err) {
            console.error("Failed to sync why visit matters to backend:", err);
          }
        }

        const industriesSec = sectionsDraft.find((s) => s.key === "industry-segments" || s.name === "IndustrySegments");
        if (industriesSec) {
          try {
            await api.put("/website/participate/why-visit/segments", {
              badge: industriesSec.eyebrow || "WHAT CAN YOU SOURCE?",
              subline: industriesSec.subtitle || "ONE EXPO • COMPLETE ECOSYSTEM",
              mainTitleLine1: industriesSec.title || "Explore 6 Major Industry Segments",
              segmentCount: "",
              mainTitleLine2: "",
              segments: Array.isArray(industriesSec.items)
                ? industriesSec.items.map((it: any, idx: number) => ({
                    num: it.num || `0${idx + 1}`,
                    title: it.title || "",
                    items: it.subtitle || it.items || "",
                    image: it.image || `/uploads/icons/x${idx + 1}.webp`,
                    iconImg: it.iconImage || it.iconImg || `/uploads/icons/x${idx + 1}og.png`,
                    iconImage: it.iconImage || it.iconImg || `/uploads/icons/x${idx + 1}og.png`,
                  }))
                : [],
            });
          } catch (err) {
            console.error("Failed to sync industries section to backend:", err);
          }
        }
      }

      if (savingKey === "awardsPage" || page.slug?.includes("awards") || page.slug?.includes("excellence-awards")) {
        const heroSec = sectionsDraft.find((s) => s.key === "awards-hero" || s.name === "Awards Hero Banner");
        if (heroSec) {
          try {
            await api.put("/website/awards/hero", {
              enabled: heroSec.enabled !== false,
              eyebrow: heroSec.eyebrow,
              tagline: heroSec.eyebrow,
              title: heroSec.title,
              subtitle: heroSec.subtitle,
              shortDescription: heroSec.shortDescription || heroSec.description,
              description: heroSec.description || heroSec.shortDescription,
              date: heroSec.date,
              location: heroSec.location,
              image: heroSec.image,
              buttonLabel: heroSec.buttonLabel,
              buttonHref: heroSec.buttonHref,
              secondaryButtonLabel: heroSec.secondaryButtonLabel,
              secondaryButtonHref: heroSec.secondaryButtonHref,
            });
          } catch (err) {
            console.error("Failed to sync awards hero to backend:", err);
          }
        }

        const statsSec = sectionsDraft.find((s) => s.key === "awards-stats" || s.name === "Key Statistics Strip");
        if (statsSec) {
          try {
            await api.put("/website/awards/stats", {
              enabled: statsSec.enabled !== false,
              eyebrow: statsSec.eyebrow || "AWARDS STATS",
              title: statsSec.title || "Key Metrics & Scale",
              items: Array.isArray(statsSec.items)
                ? statsSec.items.map((it: any, idx: number) => ({
                    id: it.id || idx + 1,
                    title: it.title || "",
                    label: it.label || it.subtitle || "",
                    subtitle: it.label || it.subtitle || "",
                    icon: it.icon || "Trophy",
                  }))
                : [],
            });
          } catch (err) {
            console.error("Failed to sync awards stats to backend:", err);
          }
        }

        const aboutSec = sectionsDraft.find((s) => s.key === "awards-about" || s.name === "About the Awards");
        if (aboutSec) {
          try {
            await api.put("/website/awards/about", {
              enabled: aboutSec.enabled !== false,
              eyebrow: aboutSec.eyebrow || "ABOUT THE AWARDS",
              title: aboutSec.title || "About the Awards",
              description: aboutSec.description || aboutSec.shortDescription || "",
              shortDescription: aboutSec.description || aboutSec.shortDescription || "",
            });
          } catch (err) {
            console.error("Failed to sync awards about to backend:", err);
          }
        }

        const catSec = sectionsDraft.find((s) => s.key === "awards-categories" || s.name === "Award Sector Categories");
        if (catSec) {
          try {
            await api.put("/website/awards/categories", {
              enabled: catSec.enabled !== false,
              eyebrow: catSec.eyebrow || "AWARD CATEGORIES",
              title: catSec.title || "Award Categories",
              items: Array.isArray(catSec.items)
                ? catSec.items.map((it: any, idx: number) => ({
                    id: it.id || idx + 1,
                    title: it.title || "",
                    image: it.image || it.icon || "",
                    icon: it.image || it.icon || "",
                    keyPoint1: it.keyPoint1 || it.points?.[0] || it.items?.[0] || "",
                    keyPoint2: it.keyPoint2 || it.points?.[1] || it.items?.[1] || "",
                    keyPoint3: it.keyPoint3 || it.points?.[2] || it.items?.[2] || "",
                    keyPoint4: it.keyPoint4 || it.points?.[3] || it.items?.[3] || "",
                  }))
                : [],
            });
          } catch (err) {
            console.error("Failed to sync awards categories to backend:", err);
          }
        }

        const grandSec = sectionsDraft.find((s) => s.key === "awards-grand-awards" || s.name === "Prestigious Grand Awards");
        if (grandSec) {
          try {
            await api.put("/website/awards/grand-awards", {
              enabled: grandSec.enabled !== false,
              eyebrow: grandSec.eyebrow || "GRAND HONOURS",
              title: grandSec.title || "Prestigious Grand Awards",
              items: Array.isArray(grandSec.items)
                ? grandSec.items.map((it: any, idx: number) => ({
                    id: it.id || idx + 1,
                    title: it.title || it.label || "",
                    label: it.title || it.label || "",
                    image: it.image || it.icon || "",
                    icon: it.image || it.icon || "",
                  }))
                : [],
            });
          } catch (err) {
            console.error("Failed to sync awards grand awards to backend:", err);
          }
        }

        const processSec = sectionsDraft.find((s) => s.key === "awards-process" || s.name === "Our Evaluation Process");
        if (processSec) {
          try {
            await api.put("/website/awards/process", {
              enabled: processSec.enabled !== false,
              eyebrow: processSec.eyebrow || "EVALUATION PROCESS",
              title: processSec.title || "Our Evaluation Process",
              items: Array.isArray(processSec.items)
                ? processSec.items.map((it: any, idx: number) => ({
                    id: it.id || idx + 1,
                    title: it.title || "",
                    description: it.description || it.desc || it.shortDescription || "",
                    desc: it.description || it.desc || it.shortDescription || "",
                    image: it.image || it.icon || "",
                    icon: it.image || it.icon || "",
                  }))
                : [],
            });
          } catch (err) {
            console.error("Failed to sync awards process to backend:", err);
          }
        }

        const nomHeroSec = sectionsDraft.find((s) => s.key === "awards-nomination-hero" || s.name === "Awards Nomination Form Hero");
        if (nomHeroSec) {
          try {
            await api.put("/website/awards/nomination-hero", {
              enabled: nomHeroSec.enabled !== false,
              eyebrow: nomHeroSec.eyebrow || "EXCELLENCE AWARDS NOMINATION",
              title: nomHeroSec.title || "Bharat Organic Excellence Awards 2027",
              subtitle: nomHeroSec.subtitle || "Celebrating Excellence • Innovation • Sustainability",
              description: nomHeroSec.description || nomHeroSec.shortDescription || "Honouring the changemakers, organizations and innovations during india's organic, natural and sustainable future.",
              buttonLabel: nomHeroSec.buttonLabel || "Submit Nomination",
              buttonHref: nomHeroSec.buttonHref || "#nomination-form",
              secondaryButtonLabel: nomHeroSec.secondaryButtonLabel || "View Categories",
              secondaryButtonHref: nomHeroSec.secondaryButtonHref || "/awards",
              date: nomHeroSec.date || "19 - 21 February 2027",
              location: nomHeroSec.location || "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA",
              image: nomHeroSec.image || "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
            });
          } catch (err) {
            console.error("Failed to sync awards nomination hero to backend:", err);
          }
        }

        const nomStepsSec = sectionsDraft.find((s) => s.key === "awards-nomination-steps" || s.name === "Nomination Submission Steps");
        if (nomStepsSec) {
          try {
            const rawItems = nomStepsSec.items || [];
            await api.put("/website/awards/nomination-steps", {
              enabled: nomStepsSec.enabled !== false,
              title: nomStepsSec.title || "THE AWARD PROCESS",
              items: rawItems.map((it: any, idx: number) => ({
                id: it.id ?? idx + 1,
                num: it.num || String(idx + 1).padStart(2, "0"),
                title: it.title || "",
                description: it.description || it.desc || it.shortDescription || "",
                desc: it.description || it.desc || it.shortDescription || "",
                shortDescription: it.shortDescription || it.description || it.desc || "",
                image: it.image || it.img || "",
                icon: it.icon || "",
              })),
            });
          } catch (err) {
            console.error("Failed to sync awards nomination steps to backend:", err);
          }
        }
      }

      if (savingKey === "galleryPage" || page.slug?.includes("gallery") || page.slug?.includes("glimpses")) {
        const heroSec = sectionsDraft.find((s) => s.key === "gallery-hero" || s.name === "HeroSection");
        if (heroSec) {
          try {
            await api.put("/website/gallery/hero", {
              enabled: heroSec.enabled !== false,
              title: heroSec.title,
              subtitle: heroSec.subtitle,
              shortDescription: heroSec.description || heroSec.shortDescription,
              description: heroSec.description || heroSec.shortDescription,
              rightImage: heroSec.image || heroSec.rightImage,
              image: heroSec.image || heroSec.rightImage,
            });
          } catch (err) {
            console.error("Failed to sync gallery hero to backend:", err);
          }
        }

        const countersSec = sectionsDraft.find((s) => s.key === "gallery-counters" || s.name === "Counters");
        if (countersSec) {
          try {
            await api.put("/website/gallery/counters", {
              enabled: countersSec.enabled !== false,
              title: countersSec.title || "EXPO IMPACT IN NUMBERS",
              items: Array.isArray(countersSec.items)
                ? countersSec.items.map((it: any) => ({
                    val: it.val || "",
                    label: it.label || "",
                    image: it.image || "",
                  }))
                : [],
            });
          } catch (err) {
            console.error("Failed to sync gallery counters to backend:", err);
          }
        }
      }

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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-[20px]
            flex
            shrink-0
            items-start
            justify-between
            border-b-[2px]
            border-[#293681]
            pb-[8px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-[11px]
            "
          >
            <div
              className="
                mt-[1px]
                grid
                h-[28px]
                w-[28px]
                place-items-center
                rounded-full
                bg-[#e8f4e9]
                text-[#23714a]
              "
            >
              <Edit3
                className="h-[14px] w-[14px]"
                strokeWidth={1.65}
              />
            </div>

            <div>
              <h1
                className="
                  mt-[2px]
                  text-[19px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.018em]
                  text-[#18233b]
                "
              >
                Edit Page
              </h1>

            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-[10px]
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/pages",
                )
              }
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-red-200
                bg-red-50
                px-[12px]
                text-[8.5px]
                font-semibold
                text-red-600
              "
            >
              <ArrowLeft className="h-[13px] w-[13px]" />

              Back to Pages
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/pages/${getCmsPageRouteKey(page)}`,
                )
              }
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-orange-200
                bg-orange-50
                px-[12px]
                text-[8.5px]
                font-semibold
                text-orange-600
              "
            >
              <Eye className="h-[13px] w-[13px]" />

              Preview Page
            </button>

            <button
              type="button"
              onClick={resetToWebsiteDefaults}
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-[#0f766e]
                bg-[#f0fdf4]
                px-[12px]
                text-[8.5px]
                font-semibold
                text-[#0f766e]
                hover:bg-[#dcfce7]
              "
            >
              <Sparkles className="h-[13px] w-[13px]" />

              Sync / Reset Website Data
            </button>

            <button
              type="button"
              onClick={savePage}
              disabled={saving}
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                bg-[#218DAE]
                px-[12px]
                text-[8.5px]
                font-semibold
                text-white
                shadow-sm
              "
            >
              <Save className="h-[13px] w-[13px]" />

              {saving ? "Updating..." : "Update Page"}
            </button>

            <button
              type="button"
              className="
                grid
                h-[30px]
                w-[30px]
                place-items-center
                rounded-[4px]
                border
                border-[#dedfdb]
                bg-white
                text-[#445065]
              "
            >
              <MoreVertical className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <div
          className="
            grid
            items-start
            grid-cols-[minmax(0,2.35fr)_minmax(330px,1fr)]
            gap-[10px]
          "
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section
              className="
                shrink-0
                border
                border-[#dedfdb]
                shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                bg-white
                px-[16px]
                py-[11px]
              "
            >
              <SectionTitle
                number={1}
                title="Basic Information"
              />

              <div
                className="
                  mt-[9px]
                  grid
                  grid-cols-[1.12fr_1fr_.63fr]
                  gap-x-[20px]
                  gap-y-[7px]
                "
              >
                <div>
                  <FieldLabel required>
                    Page Title
                  </FieldLabel>

                  <TextInput
                    value={
                      form.pageTitle
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "pageTitle",
                        value,
                      )
                    }
                  />

                  <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
                    {
                      form
                        .pageTitle
                        .length
                    }{" "}
                    / 100
                  </p>
                </div>

                <div>
                  <FieldLabel required>
                    URL Slug
                  </FieldLabel>

                  <div
                    className="
                      flex
                      h-[35px]
                      overflow-hidden
                      rounded-none
                      shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                      bg-white
                    "
                  >
                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        border-r
                        border-[#e5e6e2]
                        bg-[#fafaf8]
                        px-[9px]
                        text-[9.5px]
                        font-medium
                        text-[#5f6a7c]
                      "
                    >
                      {PUBLIC_SITE_URL}/
                    </div>

                    <input
                      value={
                        form.slug
                      }
                      onChange={(
                        event,
                      ) =>
                        updateField(
                          "slug",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="enter-page-slug"
                      className="
                        min-w-0
                        flex-1
                        cursor-default
                        px-[9px]
                        text-[10.5px]
                        font-medium
                        text-[#414b5e]
                        outline-none
                        placeholder:text-[#9aa0aa]
                      "
                    />
                  </div>

                  <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
                    {
                      form.slug
                        .length
                    }{" "}
                    / 80
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Select Template
                  </FieldLabel>

                  <SearchableSelectField
                    value={
                      form.template
                    }
                    placeholder="Select Template"
                    searchPlaceholder="Search page or template..."
                    onChange={(value) => {
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
                          parent: targetPage.type === "home" ? "— No Parent (Top Level) —" : "Home",
                          metaTitle: targetPage.seo?.metaTitle ?? (targetPage.type === "home" ? "Bharat Organic Expo – International Trade Fair on Organic Products" : `${targetPage.title} – Bharat Organic Expo`),
                          metaDescription: targetPage.seo?.metaDescription ?? "",
                          metaKeywords: targetPage.seo?.metaKeywords ?? "",
                          canonicalUrl: targetPage.seo?.canonicalUrl || "",
                          canonicalTag: targetPage.seo?.canonicalTag || "",
                        }));
                      }
                    }}
                    options={[
                      "Homepage",
                      "About Expo",
                      "Advisory Board Members",
                      "Nominate Advisory Board Member",
                      "Support Services Helpdesk",
                      "Blogs & News",
                      "Participate as Exhibitor",
                      "Exhibition Categories",
                      "BOOK A STALL",
                      "REGISTER AS VISITOR",
                      "DELEGATE REGISTRATION",
                      "REGISTER AS BUYER",
                      "SPONSORSHIP OPPORTUNITIES",
                      "TALK TO EXPO ADVISOR",
                      "Terms & Conditions",
                      "Privacy Policy",
                      "Refund Policy",
                      "Why Visit ORGANIC EXPO",
                      "Why Exhibit at ORGANIC EXPO?",
                      "MSME PMS Scheme",
                      "PMS Eligibility Check Calculator",
                      "Apply for PMS Support Stepper",
                      "PMS Participation Details",
                      "PMS Payment Details",
                      "Exhibitor List",
                      "Buyer-Seller Meet",
                      "Glimpses & Gallery",
                      "Excellence Awards",
                      "Awards Nomination Form",
                      "E-Promotion Opportunity",
                      "Partnership / Collaboration",
                      "Printing & Branding Partner",
                      "Travel Partner",
                      "Manpower Supply Partner",
                      "Logistics Partner",
                      "Stall Design Partner",
                      "Hotel & Stay Partner",
                      "Exhibitor Login Portal",
                      "Buyer Login Portal",
                      "Delegates Login Portal",
                      "User Login Portal",
                      "Our Services",
                      "Contact Us",
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel>
                    Page Parent
                  </FieldLabel>

                  <SelectField
                    value={
                      form.parent
                    }
                    onChange={(
                      value,
                    ) => {
                      updateField("parent", value);
                    }}
                    options={[
                      "— No Parent (Top Level) —",
                      "Home",
                      "About Expo",
                      "Advisory Board Members",
                      "Blogs & News",
                      "Why Visit ORGANIC EXPO",
                      "Why Exhibit at ORGANIC EXPO?",
                      "MSME PMS Scheme",
                      "Exhibitor List",
                      "Buyer-Seller Meet",
                      "Glimpses & Gallery",
                      "Our Services",
                      "Contact Us",
                      "BOOK A STALL",
                      "REGISTER AS VISITOR",
                      "DELEGATE REGISTRATION",
                      "REGISTER AS BUYER",
                      "SPONSORSHIP OPPORTUNITIES",
                      "Nominate Advisory Board Member",
                      "Support Services Helpdesk",
                      "PMS Eligibility Check Calculator",
                      "Apply for PMS Support Stepper",
                      "Awards Nomination Form",
                      ...pages.map((p) => p.title).filter((t) => !["Home", "About Expo", "Advisory Board Members", "Blogs & News", "Why Visit ORGANIC EXPO", "Why Exhibit at ORGANIC EXPO?", "MSME PMS Scheme", "Exhibitor List", "Buyer-Seller Meet", "Glimpses & Gallery", "Our Services", "Contact Us", "BOOK A STALL", "REGISTER AS VISITOR", "DELEGATE REGISTRATION", "REGISTER AS BUYER", "SPONSORSHIP OPPORTUNITIES", "Nominate Advisory Board Member", "Support Services Helpdesk", "PMS Eligibility Check Calculator", "Apply for PMS Support Stepper", "Awards Nomination Form"].includes(t)),
                    ]}
                  />

                  <p className="mt-[2px] text-[9px] font-medium leading-[11px] text-red-500">
                    Choose parent page
                    (if any)
                  </p>
                </div>

              </div>
            </section>

            {/* =================================================
                PAGE SECTIONS
            ================================================= */}

            <section
              className="
                flex
                shrink-0
                flex-col
                shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                bg-white
                px-[16px]
                py-[9px]
              "
            >
              <div
                className="
                  flex
                  shrink-0
                  items-start
                  justify-between
                "
              >
                <SectionTitle
                  number={2}
                  title="Page Sections"
                />

                <span className="text-[9.5px] font-semibold text-[#4B1426]">
                  {sectionsDraft.length} sections
                </span>
              </div>

              {/* EXPAND / COLLAPSE GLOBAL ACTIONS */}
              <div className="mt-[10px] flex items-center justify-between border-b border-[#f1f5f9] pb-[8px] mb-[12px]">
                <span className="text-[10.5px] font-bold text-[#1e293b]">
                  Page Landing Sections ({sectionsDraft.length})
                </span>
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    onClick={() => setOpenSectionIndices(new Set(sectionsDraft.map((_, i) => i)))}
                    className="text-[9.5px] font-semibold text-[#4B1426] hover:underline"
                  >
                    Expand All
                  </button>
                  <span className="text-[#cbd5e1]">|</span>
                  <button
                    type="button"
                    onClick={() => setOpenSectionIndices(new Set())}
                    className="text-[9.5px] font-semibold text-[#64748b] hover:underline"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* INDIVIDUAL COLLAPSIBLE SECTION CARDS */}
              {sectionsDraft.length === 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-center my-3">
                  <p className="text-[12px] font-semibold text-amber-800 mb-2">No sections currently loaded for this page.</p>
                  <button
                    type="button"
                    onClick={resetToWebsiteDefaults}
                    className="px-4 py-1.5 bg-[#4B1426] text-white text-[11px] font-bold rounded hover:bg-[#380e1c] transition-colors shadow-sm"
                  >
                    Load Live Website Defaults
                  </button>
                </div>
              )}
              <div className="flex flex-col gap-[10px]">
                {sectionsDraft.map((section, sectionIndex) => {
                  const isOpen = openSectionIndices.has(sectionIndex);

                  return (
                    <div
                      key={section._id ?? section.key ?? sectionIndex}
                      className={`rounded-[6px] border transition ${isOpen ? "border-[#4B1426] bg-[#fbfbfa]" : "border-[#cbd5e1] bg-white hover:border-[#94a3b8]"
                        }`}
                    >
                      {/* SECTION CARD HEADER */}
                      <div
                        onClick={() => toggleSectionAccordion(sectionIndex)}
                        className={`flex cursor-pointer items-center justify-between px-[14px] py-[10px] transition ${isOpen ? "bg-[#fdf2f4] border-b border-[#f5d0d6]" : "bg-[#f8fafc]"
                          }`}
                      >
                        <div className="flex items-center gap-[8px]">
                          <ChevronRight
                            className={`h-4 w-4 text-[#4B1426] transition-transform ${isOpen ? "rotate-90 text-[#3b0f1e]" : ""
                              }`}
                          />
                          <span className="font-mono text-[10px] font-bold text-[#64748b]">
                            {sectionIndex + 1}.
                          </span>
                          <span className="text-[12px] font-bold text-[#4B1426]">
                            {section.name ?? section.key}
                          </span>
                          {section.enabled === false && (
                            <span className="rounded-[4px] bg-rose-50 border border-rose-200 px-[6px] py-[1px] text-[8px] font-bold text-rose-600">
                              Disabled
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-[10px]" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-[6px]">
                            <span
                              className={`text-[9.5px] font-bold ${section.enabled !== false ? "text-[#16a34a]" : "text-[#dc2626]"
                                }`}
                            >
                              {section.enabled !== false ? "Enabled" : "Disabled"}
                            </span>
                            <Toggle
                              checked={section.enabled !== false}
                              onChange={(value) => updateSectionField(sectionIndex, "enabled", value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SECTION BODY (ONLY RENDERED WHEN OPEN) */}
                      {isOpen && (
                        <div className="flex flex-col gap-[12px] p-[14px] bg-[#fbfbfa]">
                          <SectionFieldsEditor
                            section={section}
                            onFieldChange={(key, value) => updateSectionField(sectionIndex, key, value)}
                          />

                          {Array.isArray(section.slides) && (
                            <div className="flex flex-col gap-[8px]">
                              <SectionItemsEditor
                                items={section.slides}
                                onChangeItem={(itemIndex, key, value) => {
                                  setSectionsDraft((previous) =>
                                    previous.map((sec, i) => {
                                      if (i !== sectionIndex) return sec;
                                      const slides = [...(sec.slides ?? [])];
                                      slides[itemIndex] = { ...slides[itemIndex], [key]: value };
                                      return { ...sec, slides };
                                    }),
                                  );
                                }}
                                onAddItem={() => {
                                  setSectionsDraft((previous) =>
                                    previous.map((sec, i) => {
                                      if (i !== sectionIndex) return sec;
                                      const slides = [...(sec.slides ?? [])];
                                      const blank = {
                                        title: "NEW HERO SLIDE",
                                        description: "Enter slide description...",
                                        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
                                        alt: "Hero Banner Slide",
                                        buttonLabel: "Book Your Stall",
                                        buttonHref: "/registration/book-a-stand",
                                        secondaryButtonLabel: "Register as Visitor",
                                        secondaryButtonHref: "/registration/visitor-registration",
                                      };
                                      return { ...sec, slides: [...slides, blank] };
                                    }),
                                  );
                                }}
                                onRemoveItem={(itemIndex) => {
                                  setSectionsDraft((previous) =>
                                    previous.map((sec, i) => {
                                      if (i !== sectionIndex) return sec;
                                      const slides = (sec.slides ?? []).filter((_: unknown, idx: number) => idx !== itemIndex);
                                      return { ...sec, slides };
                                    }),
                                  );
                                }}
                                sectionId={section.key}
                              />
                            </div>
                          )}

                          {Array.isArray(section.items) && section.key !== "hero" && section.key !== "introduction-section" && section.key !== "why-participate" && section.key !== "conference-section" && section.key !== "sponsors-attend" && section.key !== "testimonials-section" && (
                            <SectionItemsEditor
                              items={section.items}
                              onChangeItem={(itemIndex, key, value) => updateSectionItem(sectionIndex, itemIndex, key, value)}
                              onAddItem={() => addSectionItem(sectionIndex)}
                              onRemoveItem={(itemIndex) => removeSectionItem(sectionIndex, itemIndex)}
                              sectionId={section.key}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                SEO SETTINGS (MATCHING AddSeo UI & EDITORS)
            ================================================= */}

            <section className="bg-white border-2 border-gray-200 p-6 mb-6 shadow-lg shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      3. SEO Information
                    </h2>
                    <p className="text-[11px] text-gray-500">
                      Manage meta tags, Open Graph data, canonical URL, and schema markup for this page.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => autoGenerateSeo("local")}
                    className="px-2.5 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Auto-generate tags for Local environment (http://localhost:3002)"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Auto Generate (Local)
                  </button>
                  <button
                    type="button"
                    onClick={() => autoGenerateSeo("live")}
                    className="px-2.5 py-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Auto-generate tags for Live environment (https://bharatorganicexpo.com)"
                  >
                    <Globe className="w-3.5 h-3.5 text-green-600" />
                    Auto Generate (Live)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Page (Auto-selected & disabled) */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Select Page <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="page"
                    value={form.slug ? `/${form.slug}` : "/"}
                    disabled={true}
                    className="w-full px-3 py-2 border-2 border-gray-300 bg-gray-100 text-gray-700 focus:outline-none text-xs shadow-sm cursor-not-allowed font-medium"
                  >
                    <option value={form.slug ? `/${form.slug}` : "/"}>
                      {form.pageTitle || page.title || "Home"} ({form.slug ? `/${form.slug}` : "/"})
                    </option>
                  </select>
                </div>

                {/* Meta Title */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Meta Title
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        form.metaTitle.length > 55 ? "text-orange-500" : "text-gray-400"
                      }`}
                    >
                      {form.metaTitle.length}/65
                    </span>
                  </div>
                  <input
                    type="text"
                    name="metaTitle"
                    value={form.metaTitle}
                    maxLength={65}
                    onChange={(e) => {
                      if (e.target.value.length <= 65) {
                        updateField("metaTitle", e.target.value);
                      }
                    }}
                    placeholder="Enter meta title"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                  />
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="metaKeywords"
                    value={form.metaKeywords}
                    onChange={(e) => updateField("metaKeywords", e.target.value)}
                    placeholder="Enter meta keywords (comma separated)"
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                  />
                </div>

                {/* Meta Description */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Meta Description
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        form.metaDescription.length > 155 ? "text-red-500" : "text-gray-400"
                      }`}
                    >
                      {form.metaDescription.length}/155
                    </span>
                  </div>
                  <textarea
                    name="metaDescription"
                    value={form.metaDescription}
                    onChange={(e) => {
                      if (e.target.value.length <= 155) {
                        updateField("metaDescription", e.target.value);
                      }
                    }}
                    placeholder="Enter meta description"
                    rows={3}
                    maxLength={155}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm"
                  />
                </div>

                {/* Open Graph Tags Editor */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Open Graph Tags (HTML/Text) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="openGraphTags"
                    value={form.openGraphTags || ""}
                    onChange={(e) => updateField("openGraphTags", e.target.value)}
                    placeholder="Paste OG tags here..."
                    rows={6}
                    className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                  />
                </div>

                {/* Schema Markup Editor */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Schema Markup (JSON-LD) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="schemaMarkup"
                    value={form.schemaMarkup || ""}
                    onChange={(e) => updateField("schemaMarkup", e.target.value)}
                    placeholder="Paste JSON-LD schema here..."
                    rows={10}
                    className="w-full p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-gray-200 shadow-inner overflow-auto rounded"
                  />
                </div>

                {/* Canonical Tag Editor */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      Canonical Tag <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const p = page.slug === "/" ? "" : (page.slug?.startsWith("/") ? page.slug : `/${page.slug || ""}`);
                          const tag = `<link rel="canonical" href="http://localhost:3002${p}" />`;
                          updateField("canonicalTag", tag);
                          updateField("canonicalUrl", `http://localhost:3002${p}`);
                          if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = tag;
                        }}
                        className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer font-medium"
                      >
                        Set Local (3002)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const p = page.slug === "/" ? "" : (page.slug?.startsWith("/") ? page.slug : `/${page.slug || ""}`);
                          const tag = `<link rel="canonical" href="https://bharatorganicexpo.com${p}" />`;
                          updateField("canonicalTag", tag);
                          updateField("canonicalUrl", `https://bharatorganicexpo.com${p}`);
                          if (canonicalEditorRef.current) canonicalEditorRef.current.innerText = tag;
                        }}
                        className="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 cursor-pointer font-medium"
                      >
                        Set Live
                      </button>
                    </div>
                  </div>
                  <div className="border-2 border-gray-200">
                    <EditorToolbar targetRef={canonicalEditorRef} onCommand={execCommand} />
                    <div
                      ref={canonicalEditorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleCanonicalInput}
                      onPaste={handleCanonicalPaste}
                      className="min-h-[100px] p-3 bg-white focus:outline-none prose prose-sm max-w-none shadow-inner text-xs font-mono text-gray-800"
                      style={{ whiteSpace: "pre-wrap" }}
                      data-placeholder="Enter canonical URL or full tag..."
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Auto-generated based on current environment (Local / Live). You can also edit or paste manually anytime.
                  </p>
                </div>

                {/* OG Image Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    OG Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded p-2 text-center relative hover:bg-gray-50 transition-colors min-h-[100px] flex items-center justify-center">
                    <input
                      type="file"
                      onChange={handleOgImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/*"
                      disabled={ogUploading}
                    />
                    {ogUploading ? (
                      <div className="py-2 flex flex-col items-center">
                        <div className="w-5 h-5 border-2 border-[#134698] border-t-transparent rounded-full animate-spin mb-1" />
                        <span className="text-[10px] text-gray-500">Uploading OG Image...</span>
                      </div>
                    ) : form.ogImage || ogPreview ? (
                      <div className="relative w-full">
                        <img
                          src={ogPreview || form.ogImage}
                          alt="OG Preview"
                          className="h-24 w-full object-cover rounded shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeOgImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-20 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <Upload className="w-6 h-6 text-gray-300 mx-auto" />
                        <span className="text-[10px] text-gray-400 block mt-1 uppercase font-bold tracking-tighter">
                          Upload OG Image
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="isActive"
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) => updateField("isActive", e.target.value === "true")}
                    className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-[#134698] transition-colors text-xs shadow-sm bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                {/* Indexing / Crawlers */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px] bg-gray-50">
                    <div>
                      <p className="text-[11px] font-semibold text-[#3a4557]">
                        Allow Search Engines to Index
                      </p>
                      <p className="mt-[2px] text-[9px] font-medium text-[#8b929c]">
                        Turn off to add a noindex tag to this page.
                      </p>
                    </div>
                    <Toggle
                      checked={form.robotsIndex}
                      onChange={(value) => updateField("robotsIndex", value)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-[6px] border border-[#e5e6e2] px-[12px] py-[9px] bg-gray-50">
                    <div>
                      <p className="text-[11px] font-semibold text-[#3a4557]">
                        Allow Search Engines to Follow Links
                      </p>
                      <p className="mt-[2px] text-[9px] font-medium text-[#8b929c]">
                        Turn off to add a nofollow tag to this page.
                      </p>
                    </div>
                    <Toggle
                      checked={form.robotsFollow}
                      onChange={(value) => updateField("robotsFollow", value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                PAGE SETTINGS
            ================================================= */}

            <section
              className="
                shrink-0
                border
                border-[#dedfdb]
                shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
                bg-white
                px-[16px]
                py-[10px]
              "
            >
              <SectionTitle
                number={4}
                title="Page Settings"
              />

              <div
                className="
                  mt-[9px]
                  grid
                  grid-cols-[.82fr_.82fr_1.4fr]
                  gap-x-[24px]
                "
              >
                <div>
                  <FieldLabel>
                    Page Status
                  </FieldLabel>

                  <SelectField
                    value={
                      form.status
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "status",
                        value as Status,
                      )
                    }
                    options={[
                      "Published",
                      "Draft",
                    ]}
                  />
                </div>

                <div>
                  <FieldLabel required>
                    Author
                  </FieldLabel>

                  <SelectField
                    value={
                      form.author
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "author",
                        value,
                      )
                    }
                    options={[
                      "Admin User",
                      "Seva Team",
                    ]}
                  />
                </div>

                {/* FEATURED IMAGE */}

                <div className="row-span-2">
                  <FieldLabel>
                    Featured Image
                  </FieldLabel>

                  <div
                    className="
                      flex
                      h-[76px]
                      items-center
                      gap-[11px]
                      rounded-[6px]
                      border
                      border-[#dedfdb]
                      bg-white
                      p-[7px]
                    "
                  >
                    <div
                      className="
                        flex
                        h-[60px]
                        w-[120px]
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[5px]
                        bg-[#faf8f3]
                      "
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}

                      <img
                        src={
                          FEATURED_IMAGE
                        }
                        alt="Featured"
                        className="
                          h-full
                          w-full
                          object-contain
                          object-center
                        "
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-[#3f4c60]">
                        featured-home.jpg
                      </p>

                      <p className="mt-[1px] text-[8.5px] font-medium text-[#808894]">
                        1200x630px
                      </p>

                      <div className="mt-[5px] flex items-center gap-[10px]">
                        <button
                          type="button"
                          className="text-[8.5px] font-semibold text-[#2d8653]"
                        >
                          Change Image
                        </button>

                        <button
                          type="button"
                          className="text-[8.5px] font-semibold text-[#d25a52]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[9px]">
                  <FieldLabel>
                    Show in Navigation Menu
                  </FieldLabel>

                  <div className="flex items-start gap-[9px]">
                    <Toggle
                      checked={
                        form.showInNavigation
                      }
                      onChange={(
                        value,
                      ) =>
                        updateField(
                          "showInNavigation",
                          value,
                        )
                      }
                    />

                    <span className="max-w-[155px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
                      Show this page in
                      main navigation
                      menu
                    </span>
                  </div>
                </div>

                <div className="mt-[9px]">
                  <FieldLabel>
                    Menu Order
                  </FieldLabel>

                  <TextInput
                    value={
                      form.menuOrder
                    }
                    onChange={(
                      value,
                    ) =>
                      updateField(
                        "menuOrder",
                        value,
                      )
                    }
                  />

                  <p className="mt-[2px] text-[8.5px] font-medium leading-[11px] text-[#858c98]">
                    Set display order in
                    navigation menu.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            {/* =================================================
                PUBLISH
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-none
                border
                border-[#e7e7e3]
                bg-white
                overflow-hidden
              "
            >
              <div className="flex items-center justify-between bg-slate-50 border-b border-[#e7e7e3] px-[16px] py-[9px]">
                <h2 className="text-[14px] font-bold text-[#263148]">
                  Publish
                </h2>

                <ChevronDown className="h-[13px] w-[13px] rotate-180 text-[#596579]" />
              </div>

              <div className="px-[16px] pt-[11px] pb-[16px] space-y-[6px]">
                <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Status
                  </p>

                  <select
                    value={form.status}
                    onChange={(e) => {
                      const value = e.target.value as Status;
                      updateField("status", value);
                      Swal.fire({
                        title: "Status Updated",
                        text: `Page status changed to ${value}`,
                        icon: "success",
                        confirmButtonColor: "#218DAE",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.status === "Published"
                      ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                      : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                      }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Visibility
                  </p>

                  <select
                    value={form.visibility}
                    onChange={(e) => {
                      const value = e.target.value as Visibility;
                      updateField("visibility", value);
                      Swal.fire({
                        title: "Visibility Updated",
                        text: `Page visibility changed to ${value}`,
                        icon: "success",
                        confirmButtonColor: "#218DAE",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                    }}
                    className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.visibility === "Public"
                      ? "bg-[#e3f2fd] text-[#1565c0] border border-[#90caf9]"
                      : "bg-[#f3e5f5] text-[#7b1fa2] border border-[#ce93d8]"
                      }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Published On
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    {isEditingPublishDate ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="datetime-local"
                          value={
                            form.publishedAt
                              ? new Date(new Date(form.publishedAt).getTime() - new Date().getTimezoneOffset() * 60000)
                                  .toISOString()
                                  .slice(0, 16)
                              : ""
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              const dt = new Date(e.target.value).toISOString();
                              updateField("publishedAt", dt);
                            }
                          }}
                          className="h-[24px] px-1 text-[10px] border border-gray-300 rounded bg-white text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingPublishDate(false)}
                          className="px-1.5 py-0.5 text-[9px] font-bold bg-[#134698] text-white rounded cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    ) : (
                      <>
                        <span suppressHydrationWarning className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#293681]">
                          <CalendarDays className="h-[12px] w-[12px]" />
                          {formatPublishDate(form.publishedAt)}
                        </span>

                        <button
                          type="button"
                          onClick={() => setIsEditingPublishDate(true)}
                          className="text-[9.5px] font-semibold text-[#278650] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Last Updated
                  </p>

                  <span suppressHydrationWarning className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#4b1426]">
                    <Clock3 className="h-[12px] w-[12px]" />
                    {formatPublishDate(form.lastUpdated)}
                  </span>
                </div>

                <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
                  <p className="text-[10.5px] font-semibold text-[#5d6677]">
                    Updated By
                  </p>

                  <span suppressHydrationWarning className="flex items-center gap-[7px] text-[10px] font-medium text-orange-500">
                    <UserRound className="h-[12px] w-[12px]" />
                    {form.updatedBy || currentAdmin?.name || "Admin User"}
                  </span>
                </div>
              </div>

              <div
                className="
                  mx-[16px]
                  mb-[11px]
                  mt-[7px]
                  flex
                  h-[35px]
                  items-center
                  gap-[8px]
                  rounded-[5px]
                  bg-[#edf6ef]
                  px-[12px]
                  text-[9.5px]
                  font-semibold
                  text-[#32784e]
                "
              >
                <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border border-[#65a17b]">
                  <Check className="h-[9px] w-[9px]" />
                </span>

                This page is currently
                published.
              </div>
            </section>

            {/* =================================================
                SEO
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-none
                border
                border-[#e7e7e3]
                bg-white
                overflow-hidden
              "
            >
              <div className="flex items-center justify-between bg-slate-50 border-b border-[#e7e7e3] px-[16px] py-[9px]">
                <h2 className="text-[14px] font-bold text-[#263148]">
                  SEO Score
                </h2>

                <button
                  type="button"
                  className="flex items-center gap-[4px] text-[10px] font-bold text-[#293681] hover:underline"
                >
                  View Full SEO Analysis
                  <ChevronRight className="h-[10px] w-[10px]" />
                </button>
              </div>

              <div className="px-[16px] py-[11px]">
                <div
                  className="
                    grid
                    grid-cols-[132px_1fr]
                    items-center
                    gap-[11px]
                  "
                >
                  <div className="flex justify-center">
                    <SeoScoreCircle />
                  </div>

                  <div className="space-y-[1px] border-l border-[#eeeeea] pl-[14px]">
                    <SeoRow label="Meta Title" />
                    <SeoRow label="Meta Description" />
                    <SeoRow label="Headings" />
                    <SeoRow label="Content Quality" />
                    <SeoRow label="Internal Linking" />
                    <SeoRow label="Images (ALT Text)" />
                    <SeoRow label="Schema Markup" />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section
              className="
                shrink-0
                rounded-none
                border
                border-[#e7e7e3]
                bg-white
                px-[16px]
                py-[10px]
              "
            >
              <h2 className="text-[14px] font-bold text-[#263148]">
                Quick Actions
              </h2>

              <div
                className="
                  mt-[8px]
                  grid
                  grid-cols-2
                  gap-[7px]
                "
              >
                <button
                  type="button"
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <Copy className="h-[13px] w-[13px]" />

                  Duplicate Page
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigator
                      .clipboard
                      ?.writeText(
                        `${PUBLIC_SITE_URL}/${form.slug}`,
                      )
                  }
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <Link2 className="h-[13px] w-[13px]" />

                  Copy URL
                </button>

                <button
                  type="button"
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#efcfca]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#d44f48]
                  "
                >
                  <Trash2 className="h-[13px] w-[13px]" />

                  Move to Trash
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/pages/${getCmsPageRouteKey(page)}`,
                    )
                  }
                  className="
                    flex
                    h-[36px]
                    items-center
                    justify-center
                    gap-[7px]
                    rounded-[5px]
                    border
                    border-[#dedfdb]
                    bg-white
                    text-[10px]
                    font-semibold
                    text-[#475367]
                  "
                >
                  <ExternalLink className="h-[13px] w-[13px]" />

                  View Page
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
