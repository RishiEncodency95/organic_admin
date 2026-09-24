import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

export function syncAboutSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get("/website/abouts/about/about-hero")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "about-hero" || sec.name === "AboutHero") {
              return {
                ...sec,
                eyebrow: data.tagline || sec.eyebrow,
                titlePrimary: data.titlePart1 || sec.titlePrimary,
                titleSecondary: data.titlePart2 || sec.titleSecondary,
                subtitle: data.subtitle || sec.subtitle,
                description: data.description || sec.description,
                image: data.image || sec.image,
                imageAlt: data.imageAlt || sec.imageAlt,
                buttonLabel: data.buttons?.[0]?.label || sec.buttonLabel,
                buttonHref: data.buttons?.[0]?.link || sec.buttonHref,
                secondaryButtonLabel: data.buttons?.[1]?.label || sec.secondaryButtonLabel,
                secondaryButtonHref: data.buttons?.[1]?.link || sec.secondaryButtonHref,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/abouts/about/home-about")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "home-about" || sec.name === "HomeAbout (Who We Are)") {
              const p = Array.isArray(data.paragraphs) ? data.paragraphs : [];
              return {
                ...sec,
                eyebrow: data.tagline || sec.eyebrow,
                title: data.title || sec.title,
                description: p[0]?.text ? `${p[0].boldLead || ""}${p[0].text}` : sec.description,
                secondaryDescription: p[1]?.text || sec.secondaryDescription,
                bottomStatement: p[2]?.text || sec.bottomStatement,
                image: data.image || sec.image,
                imageAlt: data.imageAlt || sec.imageAlt,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});
}

export async function saveAboutSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find((s) => s.key === "about-hero" || s.name === "AboutHero");
  if (heroSec) {
    await api.put("/website/abouts/about/about-hero", {
      tagline: heroSec.eyebrow,
      titlePart1: heroSec.titlePrimary,
      titlePart2: heroSec.titleSecondary,
      subtitle: heroSec.subtitle,
      description: heroSec.description,
      image: heroSec.image,
      imageAlt: heroSec.imageAlt,
      buttons: [
        { label: heroSec.buttonLabel || "", link: heroSec.buttonHref || "", style: "primary" },
        { label: heroSec.secondaryButtonLabel || "", link: heroSec.secondaryButtonHref || "", style: "secondary" },
      ],
    });
  }

  const homeAboutSec = sectionsDraft.find((s) => s.key === "home-about" || s.name === "HomeAbout (Who We Are)");
  if (homeAboutSec) {
    await api.put("/website/abouts/about/home-about", {
      tagline: homeAboutSec.eyebrow,
      title: homeAboutSec.title,
      image: homeAboutSec.image,
      imageAlt: homeAboutSec.imageAlt,
      paragraphs: [
        { boldLead: "", text: homeAboutSec.description || "" },
        { boldLead: "", text: homeAboutSec.secondaryDescription || "" },
        { boldLead: "", text: homeAboutSec.bottomStatement || "" },
      ],
    });
  }
}
