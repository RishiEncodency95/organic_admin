import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

// Admin page config key -> slug of the /partnership/<slug> page (and its backend record).
export const SUB_PARTNERSHIP_SLUGS: Record<string, string> = {
  hotelStayPartnerPage: "hotel-stay-partner",
  travelPartnerPage: "travel-partner",
  stallDesignPartnerPage: "stall-design-partner",
  logisticsPartnerPage: "logistics-partner",
  printingBrandingPartnerPage: "printing-branding-partner",
  manpowerSupplyPartnerPage: "manpower-supply-partner",
};

const FIELDS = ["title", "subtitle", "description", "date", "location", "image", "imageAlt"] as const;
const isHero = (sec: Record<string, any>) => sec.key === "sub-partnership-hero";
const endpoint = (slug: string) => `/website/opportunities/partnership/sub-hero/${slug}`;

export function syncSubPartnershipSectionsFromLiveApi(slug: string, setSectionsDraft: SetSectionsDraft): void {
  api.get(endpoint(slug))
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (!isHero(sec)) return sec;
            const next: Record<string, any> = { ...sec };
            for (const k of FIELDS) next[k] = data[k] || sec[k] || "";
            return next;
          })
        );
      }
    })
    .catch(() => {});
}

export async function saveSubPartnershipSections(slug: string, sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find(isHero);
  if (heroSec) {
    const payload: Record<string, string> = {};
    for (const k of FIELDS) payload[k] = heroSec[k] || "";
    await api.put(endpoint(slug), payload);
  }
}
