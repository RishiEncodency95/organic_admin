import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

const HERO_ENDPOINT = "/website/opportunities/partnership/hero";
const isHero = (sec: Record<string, any>) => sec.key === "partnership-page-hero";

export function syncPartnershipSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(HERO_ENDPOINT)
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        // Older saves only have the three title lines; join them into the single H1 field.
        const legacyTitle = [data.titleLine1, data.titleLine2, data.titleLine3]
          .filter((x: unknown) => typeof x === "string" && x.trim())
          .join(" ")
          .trim();
        setSectionsDraft((prev) =>
          prev.map((sec) =>
            isHero(sec)
              ? {
                  ...sec,
                  eyebrow: data.badgeText || sec.eyebrow,
                  title: data.title || legacyTitle || sec.title,
                  subtitle: data.subtitle || sec.subtitle,
                  date: data.dates || sec.date,
                  location: data.location || sec.location,
                  image: data.image || sec.image,
                  imageAlt: data.imageAlt || sec.imageAlt,
                  items:
                    Array.isArray(data.stats) && data.stats.length > 0
                      ? data.stats.map((s: any) => ({
                          title: s.value || "",
                          label: s.label || "",
                          icon: s.iconKey || "Users",
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

export async function savePartnershipSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    await api.put(HERO_ENDPOINT, {
      badgeText: heroSec.eyebrow || "",
      title: heroSec.title || "",
      subtitle: heroSec.subtitle || "",
      dates: heroSec.date || "",
      location: heroSec.location || "",
      image: heroSec.image || "",
      imageAlt: heroSec.imageAlt || "",
      stats: Array.isArray(heroSec.items)
        ? heroSec.items.map((it: any) => ({
            iconKey: it.icon || "Users",
            value: it.title || "",
            label: it.label || "",
          }))
        : [],
    });
  }
}
