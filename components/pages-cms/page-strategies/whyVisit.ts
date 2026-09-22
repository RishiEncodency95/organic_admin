import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

export function syncWhyVisitSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
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

export async function saveWhyVisitSections(sectionsDraft: SectionsDraft): Promise<void> {
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
