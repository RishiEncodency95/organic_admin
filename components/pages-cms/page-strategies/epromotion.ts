import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";
import type { CmsJson, CmsRecord } from "@/lib/cmsJson";

const HERO_ENDPOINT = "/website/opportunities/epromotion/hero";
const isHero = (sec: CmsRecord) => sec.key === "epromotion-hero";

// The H1 is one admin field; the website shows the first word on line 1 and the rest in
// green on line 2, so the backend keeps those two parts.
function splitFirstWord(text: string): { first: string; rest: string } {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  return { first: words[0] || "", rest: words.slice(1).join(" ") };
}

export function syncEPromotionSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(HERO_ENDPOINT)
    .then((res: CmsJson) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (!isHero(sec)) return sec;
            const title = [data.titleLine1, data.titleHighlight].filter(Boolean).join(" ") || sec.title;
            const description = [data.descriptionBold, data.descriptionText].filter(Boolean).join(" ") || sec.description;
            return {
              ...sec,
              title,
              subtitle: data.badgeText || sec.subtitle,
              description,
              image: data.image || sec.image,
              imageAlt: data.imageAlt || sec.imageAlt,
              items:
                Array.isArray(data.stats) && data.stats.length > 0
                  ? data.stats.map((s: CmsJson) => ({
                      title: s.number || "",
                      label: (s.label || "").replace(/\n/g, " "),
                      icon: s.iconKey || "Users",
                    }))
                  : sec.items,
            };
          })
        );
      }
    })
    .catch(() => {});
}

export async function saveEPromotionSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    const { first: titleLine1, rest: titleHighlight } = splitFirstWord(heroSec.title || "");
    await api.put(HERO_ENDPOINT, {
      titleLine1,
      titleHighlight,
      badgeText: heroSec.subtitle || "",
      descriptionBold: heroSec.description || "",
      descriptionText: "",
      image: heroSec.image || "",
      imageAlt: heroSec.imageAlt || "",
      stats: Array.isArray(heroSec.items)
        ? heroSec.items.map((it: CmsJson) => ({
            iconKey: it.icon || "Users",
            number: it.title || "",
            // Two-word labels are shown stacked on the website ("BUSINESS / VISITORS").
            label: String(it.label || "").trim().replace(/\s+/, "\n"),
          }))
        : [],
    });
  }
}
