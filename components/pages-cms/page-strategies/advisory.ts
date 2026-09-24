import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

function splitLastWord(text: string): { first: string; last: string } {
  const trimmed = (text || "").trim();
  if (!trimmed) return { first: "", last: "" };
  const words = trimmed.split(/\s+/);
  const last = words.pop() || "";
  return { first: words.length > 0 ? `${words.join(" ")} ` : "", last };
}

export function syncAdvisorySectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get("/website/advisoryhero")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "advisory-hero" || sec.name === "AdvisoryHero") {
              const subtitle =
                data.subtitlePart1 !== undefined || data.subtitlePart2 !== undefined
                  ? `${data.subtitlePart1 || ""}${data.subtitlePart2 || ""}`.trim()
                  : sec.subtitle;
              const items =
                Array.isArray(data.features) && data.features.length > 0
                  ? data.features.map((f: any) => ({
                      title: [f.titlePart1, f.titlePart2].filter(Boolean).join(" "),
                      subtitle: [f.descPart1, f.descPart2].filter(Boolean).join(" "),
                      icon: f.icon || "Users",
                    }))
                  : sec.items;
              return {
                ...sec,
                titlePrimary: data.titlePart1 || sec.titlePrimary,
                titleSecondary: data.titlePart2 || sec.titleSecondary,
                subtitle,
                description: data.description || sec.description,
                image: data.image || sec.image,
                imageAlt: data.imageAlt || sec.imageAlt,
                items,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});
}

export async function saveAdvisorySections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find((s) => s.key === "advisory-hero" || s.name === "AdvisoryHero");
  if (heroSec) {
    const { first: subtitlePart1, last: subtitlePart2 } = splitLastWord(heroSec.subtitle || "");
    await api.put("/website/advisoryhero", {
      titlePart1: heroSec.titlePrimary,
      titlePart2: heroSec.titleSecondary,
      subtitlePart1,
      subtitlePart2,
      description: heroSec.description,
      image: heroSec.image,
      imageAlt: heroSec.imageAlt,
      features: Array.isArray(heroSec.items)
        ? heroSec.items.map((it: any) => ({
            icon: it.icon || "Users",
            titlePart1: it.title || "",
            titlePart2: "",
            descPart1: it.subtitle || "",
            descPart2: "",
          }))
        : [],
    });
  }
}
