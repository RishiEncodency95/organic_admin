import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

export function syncHomeSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
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
                            image: c.image ?? "",
                            imageAlt: c.imageAlt ?? "",
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

export async function saveHomeSections(sectionsDraft: SectionsDraft): Promise<void> {
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
          image: it.image ?? "",
          imageAlt: it.imageAlt ?? "",
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
