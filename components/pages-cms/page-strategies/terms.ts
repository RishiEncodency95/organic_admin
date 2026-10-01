import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

const TERMS_HERO_ENDPOINT = "/website/registration/terms/terms-hero";
const isTermsHero = (sec: Record<string, any>) =>
  sec.key === "terms-page-hero" || sec.name === "Terms & Conditions Hero Banner";

export function syncTermsSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get(TERMS_HERO_ENDPOINT)
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) =>
            isTermsHero(sec)
              ? {
                  ...sec,
                  enabled: data.enabled !== false,
                  eyebrow: data.eyebrow || sec.eyebrow,
                  title: data.title || sec.title,
                  subtitle: data.subtitle || sec.subtitle,
                  description: data.description || sec.description,
                  buttonLabel: data.buttonLabel || sec.buttonLabel,
                  image: data.image || sec.image,
                  imageAlt: data.imageAlt || sec.imageAlt,
                }
              : sec
          )
        );
      }
    })
    .catch(() => {});
}

export async function saveTermsSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isTermsHero);
  if (heroSec) {
    await api.put(TERMS_HERO_ENDPOINT, {
      enabled: heroSec.enabled !== false,
      eyebrow: heroSec.eyebrow || "",
      title: heroSec.title || "",
      subtitle: heroSec.subtitle || "",
      description: heroSec.description || "",
      buttonLabel: heroSec.buttonLabel || "",
      image: heroSec.image || "",
      imageAlt: heroSec.imageAlt || "",
    });
  }
}
