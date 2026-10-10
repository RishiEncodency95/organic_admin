import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";
import type { CmsJson, CmsRecord } from "@/lib/cmsJson";

const HERO_ENDPOINT = "/website/exhibition-categories/hero";
const isHero = (sec: CmsRecord) => sec.key === "exhibition-hero";

// Backend stores the stats bar as features [{ value, label }]; the editor's generic item
// list shows them as items [{ title: value, subtitle: label }].
export function syncExhibitionCategoriesSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(HERO_ENDPOINT)
    .then((res: CmsJson) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) =>
            isHero(sec)
              ? {
                  ...sec,
                  enabled: data.enabled !== false,
                  title: data.title || sec.title,
                  subtitle: data.subtitle || sec.subtitle,
                  description: data.description || sec.description,
                  image: data.image || sec.image,
                  items:
                    Array.isArray(data.features) && data.features.length > 0
                      ? data.features.map((f: CmsJson) => ({ title: f.value || "", subtitle: f.label || "" }))
                      : sec.items,
                }
              : sec
          )
        );
      }
    })
    .catch(() => {});
}

export async function saveExhibitionCategoriesSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    await api.put(HERO_ENDPOINT, {
      enabled: heroSec.enabled !== false,
      title: heroSec.title || "",
      subtitle: heroSec.subtitle || "",
      description: heroSec.description || "",
      image: heroSec.image || "",
      features: Array.isArray(heroSec.items)
        ? heroSec.items.map((it: CmsJson) => ({ value: it.title || "", label: it.subtitle || "" }))
        : [],
    });
  }
}
