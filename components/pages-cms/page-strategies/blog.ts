import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";
import type { CmsJson, CmsRecord } from "@/lib/cmsJson";

const HERO_ENDPOINT = "/website/bloghero";
const isHero = (sec: CmsRecord) => sec.key === "blog-hero";

export function syncBlogSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(HERO_ENDPOINT)
    .then((res: CmsJson) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        // Older saves only have the two-part title; join it into the single H1 field.
        const legacyTitle = [data.titlePart1, data.titlePart2]
          .filter((x: unknown) => typeof x === "string" && x.trim())
          .join(" ")
          .trim();
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (!isHero(sec)) return sec;
            const { titlePrimary: _p, titleSecondary: _s, ...rest } = sec as CmsRecord;
            return {
              ...rest,
              eyebrow: data.tagline || sec.eyebrow,
              title: data.title || legacyTitle || sec.title,
              subtitle: data.subtitle || sec.subtitle,
              description: data.description || sec.description,
              image: data.image || sec.image,
              imageAlt: data.imageAlt || sec.imageAlt,
            };
          })
        );
      }
    })
    .catch(() => {});
}

export async function saveBlogSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    await api.put(HERO_ENDPOINT, {
      tagline: heroSec.eyebrow || "",
      title: heroSec.title || "",
      subtitle: heroSec.subtitle || "",
      description: heroSec.description || "",
      image: heroSec.image || "",
      imageAlt: heroSec.imageAlt || "",
    });
  }
}
