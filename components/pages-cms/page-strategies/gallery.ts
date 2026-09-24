import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

export function syncGallerySectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
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

export async function saveGallerySections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find((s) => s.key === "gallery-hero" || s.name === "HeroSection");
  if (heroSec) {
    await api.put("/website/gallery/hero", {
      enabled: heroSec.enabled !== false,
      title: heroSec.title,
      subtitle: heroSec.subtitle,
      shortDescription: heroSec.description || heroSec.shortDescription,
      description: heroSec.description || heroSec.shortDescription,
      rightImage: heroSec.image || heroSec.rightImage,
      image: heroSec.image || heroSec.rightImage,
    });
  }

  const countersSec = sectionsDraft.find((s) => s.key === "gallery-counters" || s.name === "Counters");
  if (countersSec) {
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
  }
}
