import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";
import type { CmsJson, CmsRecord } from "@/lib/cmsJson";

// Old placeholder photo that ended up in saved pillar items; treat it as "no image" so the site shows its static default.
const isPlaceholderImage = (img: unknown) => typeof img === "string" && img.includes("moksha-sewa/assets/km.jpg");

export function syncAboutSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get("/website/abouts/about/about-hero")
    .then((res: CmsJson) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "about-hero" || sec.name === "AboutHero") {
              // Older saves only have the two-part title; join it into the single H1 field.
              const legacyTitle = [data.titlePart1, data.titlePart2]
                .filter((x: unknown) => typeof x === "string" && x.trim())
                .join(" ")
                .trim();
              const { titlePrimary: _p, titleSecondary: _s, ...rest } = sec as CmsRecord;
              return {
                ...rest,
                eyebrow: data.tagline || sec.eyebrow,
                title: data.title || legacyTitle || sec.title,
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
    .then((res: CmsJson) => {
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

  api.get("/website/abouts/about/four-pillars")
    .then((res: CmsJson) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "four-pillars" || sec.name === "FourPillars") {
              const pillars = Array.isArray(data.pillars) ? data.pillars : [];
              return {
                ...sec,
                enabled: typeof data.enabled === "boolean" ? data.enabled : sec.enabled,
                eyebrow: data.eyebrow || sec.eyebrow,
                title: data.title || sec.title,
                subtitle: data.subtitle || sec.subtitle,
                items: pillars.length
                  ? pillars.map((p: CmsJson) => ({
                      title: Array.isArray(p.title) ? p.title.join(" ") : p.title || "",
                      description: p.desc || "",
                      image: isPlaceholderImage(p.img) ? "" : p.img || "",
                      imageAlt: p.imgAlt || "",
                      icon: p.icon || "",
                    }))
                  : (sec.items || []).map((it: CmsJson) => ({ imageAlt: "", ...it })),
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
      title: heroSec.title,
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

  const pillarsSec = sectionsDraft.find((s) => s.key === "four-pillars" || s.name === "FourPillars");
  if (pillarsSec) {
    const items = Array.isArray(pillarsSec.items) ? pillarsSec.items : [];
    await api.put("/website/abouts/about/four-pillars", {
      enabled: pillarsSec.enabled !== false,
      eyebrow: pillarsSec.eyebrow || "",
      title: pillarsSec.title || "",
      subtitle: pillarsSec.subtitle || "",
      pillars: items.map((it: CmsJson) => ({
        title: it.title || "",
        desc: it.description || "",
        img: isPlaceholderImage(it.image) ? "" : it.image || "",
        imgAlt: it.imageAlt || "",
        icon: it.icon || "",
      })),
    });
  }
}
