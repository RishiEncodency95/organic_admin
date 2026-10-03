import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

const HERO_ENDPOINT = "/website/exhibitors/hero";
const isHero = (sec: Record<string, any>) => sec.key === "exhibitors-hero";

const HERO_FIELDS = [
  "eyebrow", "title", "description", "date", "location", "buttonLabel", "buttonHref",
  "secondaryButtonLabel", "secondaryButtonHref", "image", "imageAlt",
] as const;

export function syncExhibitorsSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(HERO_ENDPOINT)
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (!isHero(sec)) return sec;
            const next: Record<string, any> = { ...sec, enabled: data.enabled !== false };
            for (const k of HERO_FIELDS) next[k] = data[k] || sec[k];
            return next;
          })
        );
      }
    })
    .catch(() => {});
}

export async function saveExhibitorsSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    const payload: Record<string, any> = { enabled: heroSec.enabled !== false };
    for (const k of HERO_FIELDS) payload[k] = heroSec[k] || "";
    await api.put(HERO_ENDPOINT, payload);
  }
}
