import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";
import type { CmsJson, CmsRecord } from "@/lib/cmsJson";

const HERO_ENDPOINT = "/website/buyer-seller-meet/hero";
const isHero = (sec: CmsRecord) => sec.key === "buyer-seller-meet-hero";

export function syncBuyerSellerMeetSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
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
                  date: data.dates || sec.date,
                  location: data.venue || sec.location,
                  image: data.image ?? sec.image,
                  imageAlt: data.imageAlt || sec.imageAlt,
                  buttonLabel: data.buyerButtonLabel || sec.buttonLabel,
                  buttonHref: data.buyerButtonHref || sec.buttonHref,
                  secondaryButtonLabel: data.exhibitorButtonLabel || sec.secondaryButtonLabel,
                  secondaryButtonHref: data.exhibitorButtonHref || sec.secondaryButtonHref,
                }
              : sec
          )
        );
      }
    })
    .catch(() => {});
}

export async function saveBuyerSellerMeetSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    await api.put(HERO_ENDPOINT, {
      enabled: heroSec.enabled !== false,
      title: heroSec.title || "",
      subtitle: heroSec.subtitle || "",
      dates: heroSec.date || "",
      venue: heroSec.location || "",
      image: heroSec.image || "",
      imageAlt: heroSec.imageAlt || "",
      buyerButtonLabel: heroSec.buttonLabel || "",
      buyerButtonHref: heroSec.buttonHref || "",
      exhibitorButtonLabel: heroSec.secondaryButtonLabel || "",
      exhibitorButtonHref: heroSec.secondaryButtonHref || "",
    });
  }
}
