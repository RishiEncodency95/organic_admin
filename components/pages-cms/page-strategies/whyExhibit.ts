import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

export function syncWhyExhibitSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
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

export async function saveWhyExhibitSections(sectionsDraft: SectionsDraft): Promise<void> {
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
