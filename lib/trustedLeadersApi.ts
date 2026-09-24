import { getBackendUrl } from "./api";

export interface PartnerLogoItem {
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  category: string;
  order: number;
  status: "Published" | "Draft";
  updatedAt?: string;
  updatedBy?: string;
  fileSize?: string;
}

export interface PartnersAndBrandsData {
  _id?: string;
  industryLeadersLogos: PartnerLogoItem[];
  knowledgeLogos: PartnerLogoItem[];
  wellnessLogos: PartnerLogoItem[];
  supportingLogos: PartnerLogoItem[];
  emergingBrandsLogos: PartnerLogoItem[];
}

// Resolved at runtime from the actual page domain — not a build-time env var, which can
// end up baked in as "localhost" if the production build wasn't given its own .env.
const BACKEND_URL = getBackendUrl();

export const CATEGORY_KEYS: Record<string, keyof Omit<PartnersAndBrandsData, "_id">> = {
  "TRUSTED BY INDUSTRY LEADERS": "industryLeadersLogos",
  "Knowledge Partners": "knowledgeLogos",
  "Wellness Partners": "wellnessLogos",
  "Supporting Assoc.": "supportingLogos",
  "EMERGING ORGANIC BRANDS": "emergingBrandsLogos",
};

export const trustedLeadersApi = {
  get: async (): Promise<PartnersAndBrandsData | null> => {
    try {
      let res = await fetch(`${BACKEND_URL}/api/v1/website/home/partners-brands`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`/api/v1/website/home/partners-brands`).catch(() => null);
      }
      if (res && res.ok) {
        const json = await res.json().catch(() => null);
        if (json && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.error("Failed to fetch trusted leaders from backend:", err);
    }
    return null;
  },

  update: async (data: PartnersAndBrandsData): Promise<boolean> => {
    const payload = JSON.stringify({
      industryLeadersLogos: data.industryLeadersLogos,
      knowledgeLogos: data.knowledgeLogos,
      wellnessLogos: data.wellnessLogos,
      supportingLogos: data.supportingLogos,
      emergingBrandsLogos: data.emergingBrandsLogos,
    });

    try {
      let res = await fetch(`${BACKEND_URL}/api/v1/website/home/partners-brands`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`/api/v1/website/home/partners-brands`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: payload,
        }).catch(() => null);
      }

      return Boolean(res && res.ok);
    } catch (err) {
      console.error("Failed to update trusted leaders:", err);
      return false;
    }
  },
};
