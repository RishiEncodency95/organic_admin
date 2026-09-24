import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

function splitFirstWord(text: string): { first: string; rest: string } {
  const trimmed = (text || "").trim();
  if (!trimmed) return { first: "", rest: "" };
  const words = trimmed.split(/\s+/);
  const first = words.shift() || "";
  return { first, rest: words.join(" ") };
}

export function syncSponsorshipSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get("/website/opportunities/sponsorship/hero")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "sponsorship-hero" || sec.name === "Sponsorship Hero & Key Stats") {
              const title = [data.titleLine1, data.titleHighlight].filter(Boolean).join(" ") || sec.title;
              const description = [data.descriptionBold, data.descriptionText].filter(Boolean).join(" ") || sec.description;
              const items =
                Array.isArray(data.stats) && data.stats.length > 0
                  ? data.stats.map((s: any) => ({
                      title: s.number || "",
                      label: (s.label || "").replace(/\n/g, " "),
                      icon: s.iconKey || "Users",
                    }))
                  : sec.items;
              return {
                ...sec,
                title,
                subtitle: data.badgeText || sec.subtitle,
                description,
                image: data.image || sec.image,
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

export async function saveSponsorshipSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(
    (s) => s.key === "sponsorship-hero" || s.name === "Sponsorship Hero & Key Stats"
  );
  if (heroSec) {
    const { first: titleLine1, rest: titleHighlight } = splitFirstWord(heroSec.title || "");
    await api.put("/website/opportunities/sponsorship/hero", {
      titleLine1,
      titleHighlight,
      badgeText: heroSec.subtitle,
      descriptionBold: heroSec.description,
      descriptionText: "",
      image: heroSec.image,
      stats: Array.isArray(heroSec.items)
        ? heroSec.items.map((it: any) => ({
            iconKey: it.icon || "Users",
            number: it.title || "",
            label: it.label || "",
          }))
        : [],
    });
  }
}
