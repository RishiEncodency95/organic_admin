import { api } from "@/lib/api";
import type { SectionsDraft, SetSectionsDraft } from "./types";

export function syncAwardsSectionsFromLiveApi(setSectionsDraft: SetSectionsDraft): void {
  api.get("/website/awards/hero")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-hero" || sec.name === "Awards Hero Banner") {
              const cleanedSec = { ...sec };
              delete (cleanedSec as any).shortDescription;
              return {
                ...cleanedSec,
                enabled: data.enabled !== false,
                  eyebrow: data.eyebrow || data.tagline || sec.eyebrow || "BHARAT ORGANIC",
                  title:
                    data.title ||
                    (data.titlePrimary && data.titleSecondary
                      ? `${data.titlePrimary} ${data.titleSecondary}`
                      : sec.title || "EXCELLENCE AWARDS 2027"),
                  subtitle:
                    data.subtitle ||
                    (Array.isArray(data.highlights) && data.highlights.length > 0
                      ? data.highlights.map((h: any) => h.text || h).join(" • ")
                      : sec.subtitle || "Celebrating Excellence • Innovation • Sustainability"),
                  description:
                    data.description || data.shortDescription || sec.description || sec.shortDescription,
                  date:
                    data.date ||
                    (data.dateLine1 && data.dateLine2
                      ? `${data.dateLine1} ${data.dateLine2}`
                      : data.dateLine1 || sec.date || "19 - 21 February 2027"),
                  location:
                    data.location ||
                    (data.venueLine1 && data.venueLine2
                      ? `${data.venueLine1}, ${data.venueLine2}`
                      : data.venueLine1 || sec.location),
                  image: data.image || sec.image,
                  buttonLabel:
                    data.buttonLabel ||
                    (Array.isArray(data.buttons) && data.buttons[0]?.label) ||
                    sec.buttonLabel ||
                    "NOMINATE NOW",
                  buttonHref:
                    data.buttonHref ||
                    (Array.isArray(data.buttons) && data.buttons[0]?.href) ||
                    sec.buttonHref ||
                    "/awards/nominations",
                  secondaryButtonLabel:
                    data.secondaryButtonLabel ||
                    (Array.isArray(data.buttons) && data.buttons[1]?.label) ||
                    sec.secondaryButtonLabel ||
                    "VIEW CATEGORIES",
                  secondaryButtonHref:
                    data.secondaryButtonHref ||
                    (Array.isArray(data.buttons) && data.buttons[1]?.href) ||
                    sec.secondaryButtonHref ||
                    "#categories",
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/awards/stats")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-stats" || sec.name === "Key Statistics Strip") {
              const cleanedSec = { ...sec };
              delete (cleanedSec as any).eyebrow;
              delete (cleanedSec as any).title;
              return {
                ...cleanedSec,
                enabled: data.enabled !== false,
                items: Array.isArray(data.items) && data.items.length > 0
                  ? data.items.map((it: any, idx: number) => ({
                      id: it.id || idx + 1,
                      title: it.title ?? "",
                      label: it.label || it.subtitle || "",
                      icon: it.icon || "Trophy",
                    }))
                  : sec.items,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/awards/about")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-about" || sec.name === "About the Awards") {
              const cleanedSec = { ...sec };
              delete (cleanedSec as any).image;
              delete (cleanedSec as any).imageAlt;
              return {
                ...cleanedSec,
                enabled: data.enabled !== false,
                eyebrow: data.eyebrow || sec.eyebrow || "ABOUT THE AWARDS",
                title: data.title || sec.title || "About the Awards",
                description: data.description || data.shortDescription || sec.description,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/awards/categories")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        const rawCats = data.items || data.categories;
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-categories" || sec.name === "Award Sector Categories") {
              const cleanedSec = { ...sec };
              delete (cleanedSec as any).description;
              delete (cleanedSec as any).shortDescription;
              return {
                ...cleanedSec,
                enabled: data.enabled !== false,
                eyebrow: data.eyebrow || sec.eyebrow || "AWARD CATEGORIES",
                title: data.title || sec.title || "Award Categories",
                items: Array.isArray(rawCats) && rawCats.length > 0
                  ? rawCats.map((it: any, idx: number) => {
                      const fallbackImages = [
                        "/assets/awards/organic_food.png",
                        "/assets/awards/ayush.png",
                        "/assets/awards/organic_agriculture.png",
                        "/assets/awards/natural.png",
                        "/assets/awards/greentech.png",
                        "/assets/awards/trade.png",
                      ];
                      let finalImage = it.image || "";
                      if (!finalImage || (!finalImage.startsWith("/") && !finalImage.startsWith("http"))) {
                        if (it.icon && (it.icon.startsWith("/") || it.icon.startsWith("http"))) {
                          finalImage = it.icon;
                        } else if (it.icon) {
                          finalImage = `/assets/awards/${it.icon}.png`;
                        } else {
                          finalImage = fallbackImages[idx % fallbackImages.length];
                        }
                      }
                      return {
                        id: it.id || idx + 1,
                        title: it.title ?? "",
                        image: finalImage,
                        keyPoint1: it.keyPoint1 || it.points?.[0] || it.items?.[0] || "",
                        keyPoint2: it.keyPoint2 || it.points?.[1] || it.items?.[1] || "",
                        keyPoint3: it.keyPoint3 || it.points?.[2] || it.items?.[2] || "",
                        keyPoint4: it.keyPoint4 || it.points?.[3] || it.items?.[3] || "",
                      };
                    })
                  : sec.items,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/awards/grand-awards")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        const rawItems = data.items || data.awards;
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-grand-awards" || sec.name === "Prestigious Grand Awards") {
              const cleanedSec = { ...sec };
              delete (cleanedSec as any).description;
              delete (cleanedSec as any).shortDescription;
              const fallbackImages = [
                "/assets/awards/organic_enterpreneur.png",
                "/assets/awards/organic_startup.png",
                "/assets/awards/organic_brand.png",
                "/assets/awards/innovation.png",
                "/assets/awards/sustainability.png",
                "/assets/awards/lifetime_achievement.png",
              ];
              return {
                ...cleanedSec,
                enabled: data.enabled !== false,
                eyebrow: data.eyebrow || sec.eyebrow || "GRAND HONOURS",
                title: data.title || sec.title || "Prestigious Grand Awards",
                items: Array.isArray(rawItems) && rawItems.length > 0
                  ? rawItems.map((it: any, idx: number) => {
                      let finalImage = it.image || "";
                      if (!finalImage || (!finalImage.startsWith("/") && !finalImage.startsWith("http"))) {
                        if (it.icon && (it.icon.startsWith("/") || it.icon.startsWith("http"))) {
                          finalImage = it.icon;
                        } else if (it.icon) {
                          finalImage = `/assets/awards/${it.icon}.png`;
                        } else {
                          finalImage = fallbackImages[idx % fallbackImages.length];
                        }
                      }
                      return {
                        id: it.id || idx + 1,
                        title: it.title || it.label || "",
                        image: finalImage,
                      };
                    })
                  : sec.items,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/awards/process")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        const rawItems = data.items || data.steps;
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-process" || sec.name === "Our Evaluation Process") {
              const cleanedSec = { ...sec };
              delete (cleanedSec as any).description;
              delete (cleanedSec as any).shortDescription;
              const fallbackImages = [
                "/assets/awards/nomination.png",
                "/assets/awards/eligibility.png",
                "/assets/awards/evaluation-jury.png",
                "/assets/awards/shortlisting.png",
                "/assets/awards/evaluation-jury.png",
                "/assets/awards/recognition.png",
              ];
              return {
                ...cleanedSec,
                enabled: data.enabled !== false,
                eyebrow: data.eyebrow || sec.eyebrow || "EVALUATION PROCESS",
                title: data.title || sec.title || "Our Evaluation Process",
                items: Array.isArray(rawItems) && rawItems.length > 0
                  ? rawItems.map((it: any, idx: number) => {
                      let finalImage = it.image || "";
                      if (!finalImage || (!finalImage.startsWith("/") && !finalImage.startsWith("http"))) {
                        if (it.icon && (it.icon.startsWith("/") || it.icon.startsWith("http"))) {
                          finalImage = it.icon;
                        } else if (it.icon) {
                          finalImage = `/assets/awards/${it.icon}.png`;
                        } else {
                          finalImage = fallbackImages[idx % fallbackImages.length];
                        }
                      }
                      return {
                        id: it.id || idx + 1,
                        title: it.title || "",
                        description: it.description || it.desc || it.shortDescription || "",
                        image: finalImage,
                      };
                    })
                  : sec.items,
              };
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/awards/nomination-hero")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-nomination-hero" || sec.name === "Awards Nomination Form Hero") {
              const updatedSec = {
                ...sec,
                enabled: data.enabled !== false,
                title: data.title || sec.title || "Bharat Organic Excellence Awards 2027",
                subtitle: data.subtitle || sec.subtitle || "Celebrating Excellence • Innovation • Sustainability",
                description: data.description || data.shortDescription || sec.description || "Honouring the changemakers, organizations and innovations during india's organic, natural and sustainable future.",
                buttonLabel: data.buttonLabel || sec.buttonLabel || "Submit Nomination",
                buttonHref: data.buttonHref || sec.buttonHref || "#nomination-form",
                secondaryButtonLabel: data.secondaryButtonLabel || sec.secondaryButtonLabel || "View Categories",
                secondaryButtonHref: data.secondaryButtonHref || sec.secondaryButtonHref || "/awards",
                date: data.date || sec.date || "19 - 21 February 2027",
                location: data.location || sec.location || "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA",
                image: data.image || data.bgImage || sec.image || "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
              };
              delete (updatedSec as any).eyebrow;
              return updatedSec;
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});

  api.get("/website/awards/nomination-steps")
    .then((res: any) => {
      const data = res?.data?.data || res?.data || res;
      if (data) {
        setSectionsDraft((prev) =>
          prev.map((sec) => {
            if (sec.key === "awards-nomination-steps" || sec.name === "Nomination Submission Steps") {
              const rawItems = data.items || data.steps || [];
              if (rawItems.length > 0) {
                return {
                  ...sec,
                  enabled: data.enabled !== false,
                  title: data.title || sec.title || "THE AWARD PROCESS",
                  items: rawItems.map((it: any, idx: number) => ({
                    id: it.id ?? idx + 1,
                    num: it.num || String(idx + 1).padStart(2, "0"),
                    title: it.title || "",
                    description: it.description || it.desc || it.shortDescription || "",
                    image: it.image || "",
                  })),
                };
              }
            }
            return sec;
          })
        );
      }
    })
    .catch(() => {});
}

export async function saveAwardsSections(sectionsDraft: SectionsDraft): Promise<void> {
  const heroSec = sectionsDraft.find((s) => s.key === "awards-hero" || s.name === "Awards Hero Banner");
  if (heroSec) {
    try {
      await api.put("/website/awards/hero", {
        enabled: heroSec.enabled !== false,
        eyebrow: heroSec.eyebrow,
        tagline: heroSec.eyebrow,
        title: heroSec.title,
        subtitle: heroSec.subtitle,
        shortDescription: heroSec.shortDescription || heroSec.description,
        description: heroSec.description || heroSec.shortDescription,
        date: heroSec.date,
        location: heroSec.location,
        image: heroSec.image,
        buttonLabel: heroSec.buttonLabel,
        buttonHref: heroSec.buttonHref,
        secondaryButtonLabel: heroSec.secondaryButtonLabel,
        secondaryButtonHref: heroSec.secondaryButtonHref,
      });
    } catch (err) {
      console.error("Failed to sync awards hero to backend:", err);
    }
  }

  const statsSec = sectionsDraft.find((s) => s.key === "awards-stats" || s.name === "Key Statistics Strip");
  if (statsSec) {
    try {
      await api.put("/website/awards/stats", {
        enabled: statsSec.enabled !== false,
        eyebrow: statsSec.eyebrow || "AWARDS STATS",
        title: statsSec.title || "Key Metrics & Scale",
        items: Array.isArray(statsSec.items)
          ? statsSec.items.map((it: any, idx: number) => ({
              id: it.id || idx + 1,
              title: it.title || "",
              label: it.label || it.subtitle || "",
              subtitle: it.label || it.subtitle || "",
              icon: it.icon || "Trophy",
            }))
          : [],
      });
    } catch (err) {
      console.error("Failed to sync awards stats to backend:", err);
    }
  }

  const aboutSec = sectionsDraft.find((s) => s.key === "awards-about" || s.name === "About the Awards");
  if (aboutSec) {
    try {
      await api.put("/website/awards/about", {
        enabled: aboutSec.enabled !== false,
        eyebrow: aboutSec.eyebrow || "ABOUT THE AWARDS",
        title: aboutSec.title || "About the Awards",
        description: aboutSec.description || aboutSec.shortDescription || "",
        shortDescription: aboutSec.description || aboutSec.shortDescription || "",
      });
    } catch (err) {
      console.error("Failed to sync awards about to backend:", err);
    }
  }

  const catSec = sectionsDraft.find((s) => s.key === "awards-categories" || s.name === "Award Sector Categories");
  if (catSec) {
    try {
      await api.put("/website/awards/categories", {
        enabled: catSec.enabled !== false,
        eyebrow: catSec.eyebrow || "AWARD CATEGORIES",
        title: catSec.title || "Award Categories",
        items: Array.isArray(catSec.items)
          ? catSec.items.map((it: any, idx: number) => ({
              id: it.id || idx + 1,
              title: it.title || "",
              image: it.image || it.icon || "",
              icon: it.image || it.icon || "",
              keyPoint1: it.keyPoint1 || it.points?.[0] || it.items?.[0] || "",
              keyPoint2: it.keyPoint2 || it.points?.[1] || it.items?.[1] || "",
              keyPoint3: it.keyPoint3 || it.points?.[2] || it.items?.[2] || "",
              keyPoint4: it.keyPoint4 || it.points?.[3] || it.items?.[3] || "",
            }))
          : [],
      });
    } catch (err) {
      console.error("Failed to sync awards categories to backend:", err);
    }
  }

  const grandSec = sectionsDraft.find((s) => s.key === "awards-grand-awards" || s.name === "Prestigious Grand Awards");
  if (grandSec) {
    try {
      await api.put("/website/awards/grand-awards", {
        enabled: grandSec.enabled !== false,
        eyebrow: grandSec.eyebrow || "GRAND HONOURS",
        title: grandSec.title || "Prestigious Grand Awards",
        items: Array.isArray(grandSec.items)
          ? grandSec.items.map((it: any, idx: number) => ({
              id: it.id || idx + 1,
              title: it.title || it.label || "",
              label: it.title || it.label || "",
              image: it.image || it.icon || "",
              icon: it.image || it.icon || "",
            }))
          : [],
      });
    } catch (err) {
      console.error("Failed to sync awards grand awards to backend:", err);
    }
  }

  const processSec = sectionsDraft.find((s) => s.key === "awards-process" || s.name === "Our Evaluation Process");
  if (processSec) {
    try {
      await api.put("/website/awards/process", {
        enabled: processSec.enabled !== false,
        eyebrow: processSec.eyebrow || "EVALUATION PROCESS",
        title: processSec.title || "Our Evaluation Process",
        items: Array.isArray(processSec.items)
          ? processSec.items.map((it: any, idx: number) => ({
              id: it.id || idx + 1,
              title: it.title || "",
              description: it.description || it.desc || it.shortDescription || "",
              desc: it.description || it.desc || it.shortDescription || "",
              image: it.image || it.icon || "",
              icon: it.image || it.icon || "",
            }))
          : [],
      });
    } catch (err) {
      console.error("Failed to sync awards process to backend:", err);
    }
  }

  const nomHeroSec = sectionsDraft.find((s) => s.key === "awards-nomination-hero" || s.name === "Awards Nomination Form Hero");
  if (nomHeroSec) {
    try {
      await api.put("/website/awards/nomination-hero", {
        enabled: nomHeroSec.enabled !== false,
        eyebrow: nomHeroSec.eyebrow || "EXCELLENCE AWARDS NOMINATION",
        title: nomHeroSec.title || "Bharat Organic Excellence Awards 2027",
        subtitle: nomHeroSec.subtitle || "Celebrating Excellence • Innovation • Sustainability",
        description: nomHeroSec.description || nomHeroSec.shortDescription || "Honouring the changemakers, organizations and innovations during india's organic, natural and sustainable future.",
        buttonLabel: nomHeroSec.buttonLabel || "Submit Nomination",
        buttonHref: nomHeroSec.buttonHref || "#nomination-form",
        secondaryButtonLabel: nomHeroSec.secondaryButtonLabel || "View Categories",
        secondaryButtonHref: nomHeroSec.secondaryButtonHref || "/awards",
        date: nomHeroSec.date || "19 - 21 February 2027",
        location: nomHeroSec.location || "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA",
        image: nomHeroSec.image || "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
      });
    } catch (err) {
      console.error("Failed to sync awards nomination hero to backend:", err);
    }
  }

  const nomStepsSec = sectionsDraft.find((s) => s.key === "awards-nomination-steps" || s.name === "Nomination Submission Steps");
  if (nomStepsSec) {
    try {
      const rawItems = nomStepsSec.items || [];
      await api.put("/website/awards/nomination-steps", {
        enabled: nomStepsSec.enabled !== false,
        title: nomStepsSec.title || "THE AWARD PROCESS",
        items: rawItems.map((it: any, idx: number) => ({
          id: it.id ?? idx + 1,
          num: it.num || String(idx + 1).padStart(2, "0"),
          title: it.title || "",
          description: it.description || it.desc || it.shortDescription || "",
          desc: it.description || it.desc || it.shortDescription || "",
          shortDescription: it.shortDescription || it.description || it.desc || "",
          image: it.image || it.img || "",
          icon: it.icon || "",
        })),
      });
    } catch (err) {
      console.error("Failed to sync awards nomination steps to backend:", err);
    }
  }
}
