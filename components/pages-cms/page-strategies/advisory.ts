import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";
import type { CmsJson, CmsRecord } from "@/lib/cmsJson";

function splitLastWord(text: string): { first: string; last: string } {
  const trimmed = (text || "").trim();
  if (!trimmed) return { first: "", last: "" };
  const words = trimmed.split(/\s+/);
  const last = words.pop() || "";
  return { first: words.length > 0 ? `${words.join(" ")} ` : "", last };
}

// The H1 is one admin field, but the website colours it in two parts: the last two words
// are always the orange line (titlePart2) and the rest is green (titlePart1). A two-word
// title puts only its last word in orange.
function splitTitleForAccent(text: string): { primary: string; accent: string } {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  const accentCount = words.length > 2 ? 2 : words.length > 1 ? 1 : 0;
  return {
    primary: words.slice(0, words.length - accentCount).join(" "),
    accent: words.slice(words.length - accentCount).join(" "),
  };
}

export function syncAdvisorySectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get("/website/advisoryhero")
    .then((res: CmsJson) => {
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
                  ? data.features.map((f: CmsJson) => ({
                      title: [f.titlePart1, f.titlePart2].filter(Boolean).join(" "),
                      subtitle: [f.descPart1, f.descPart2].filter(Boolean).join(" "),
                      icon: f.icon || "Users",
                    }))
                  : sec.items;
              const savedTitle = [data.titlePart1, data.titlePart2]
                .filter((x: unknown) => typeof x === "string" && x.trim())
                .join(" ")
                .trim();
              const { titlePrimary: _p, titleSecondary: _s, ...rest } = sec as CmsRecord;
              return {
                ...rest,
                title: savedTitle || sec.title,
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
    const { primary: titlePart1, accent: titlePart2 } = splitTitleForAccent(heroSec.title || "");
    await api.put("/website/advisoryhero", {
      titlePart1,
      titlePart2,
      subtitlePart1,
      subtitlePart2,
      description: heroSec.description,
      image: heroSec.image,
      imageAlt: heroSec.imageAlt,
      features: Array.isArray(heroSec.items)
        ? heroSec.items.map((it: CmsJson) => ({
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
