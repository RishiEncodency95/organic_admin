import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

const HERO_ENDPOINT = "/website/nominatehero";
const isHero = (sec: Record<string, any>) => sec.key === "nominate-hero";

// Backend stores the icon row as features [{ label, icon }]; the editor's generic item list
// shows them as items [{ title: label, icon }].
export function syncNominateAdvisorySectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(HERO_ENDPOINT)
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) =>
            isHero(sec)
              ? {
                  ...sec,
                  enabled: data.enabled !== false,
                  eyebrow: data.eyebrow || sec.eyebrow,
                  title: data.title || sec.title,
                  description: data.description || sec.description,
                  image: data.image || sec.image,
                  imageAlt: data.imageAlt || sec.imageAlt,
                  items:
                    Array.isArray(data.features) && data.features.length > 0
                      ? data.features.map((f: any) => ({ title: f.label || "", icon: f.icon || "" }))
                      : sec.items,
                }
              : sec
          )
        );
      }
    })
    .catch(() => {});
}

export async function saveNominateAdvisorySections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    await api.put(HERO_ENDPOINT, {
      enabled: heroSec.enabled !== false,
      eyebrow: heroSec.eyebrow || "",
      title: heroSec.title || "",
      description: heroSec.description || "",
      image: heroSec.image || "",
      imageAlt: heroSec.imageAlt || "",
      features: Array.isArray(heroSec.items)
        ? heroSec.items.map((it: any) => ({ label: it.title || "", icon: it.icon || "" }))
        : [],
    });
  }
}
