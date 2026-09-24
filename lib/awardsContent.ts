import { normalizeLandingSection, type LandingSectionContent } from "./landingContent";

export type AwardsSectionContent = LandingSectionContent;

export const defaultAwardsSections: AwardsSectionContent[] = [
  {
    key: "awards-hero",
    name: "Awards Hero Banner",
    enabled: true,
    eyebrow: "BHARAT ORGANIC",
    title: "EXCELLENCE AWARDS 2027",
    subtitle: "Celebrating Excellence • Innovation • Sustainability",
    description: "Honouring the changemakers, organisations and innovations driving India's organic, natural and sustainable future.",
    date: "19 - 21 February 2027",
    location: "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA",
    image: "",
    buttonLabel: "NOMINATE NOW",
    buttonHref: "/awards/nominations",
    secondaryButtonLabel: "VIEW CATEGORIES",
    secondaryButtonHref: "#categories",
  },
  {
    key: "awards-stats",
    name: "Key Statistics Strip",
    enabled: true,
    items: [
      { title: "200+", label: "CATEGORIES", icon: "Trophy" },
      { title: "30+", label: "GRAND AWARDS", icon: "Award" },
      { title: "EXPERT", label: "JURY PANEL", icon: "Users" },
      { title: "NATIONWIDE &", label: "GLOBAL RECOGNITION", icon: "Globe2" },
      { title: "CREDIBILITY", label: "& TRANSPARENCY", icon: "Medal" },
    ],
  },
  {
    key: "awards-about",
    name: "About the Awards",
    enabled: true,
    eyebrow: "ABOUT THE AWARDS",
    title: "About the Awards",
    description: "Bharat Organic Excellence Awards 2027 recognise outstanding organisations, brands, entrepreneurs, farmers and professionals for their remarkable contribution to the growth and promotion of the organic, natural and sustainable industry.",
  },
  {
    key: "awards-categories",
    name: "Award Sector Categories",
    enabled: true,
    eyebrow: "AWARD CATEGORIES",
    title: "Award Categories",
    items: [
      {
        title: "Organic Food & Nutrition Excellence",
        image: "/assets/awards/organic_food.png",
        keyPoint1: "Organic Food Brand of the Year",
        keyPoint2: "Organic Beverage Brand of the Year",
        keyPoint3: "Nutrition Innovation Award",
        keyPoint4: "Emerging Organic Food Brand",
      },
      {
        title: "Ayush, Herbal & Wellness Excellence",
        image: "/assets/awards/ayush.png",
        keyPoint1: "Ayurveda Brand Excellence",
        keyPoint2: "Herbal Product Innovation",
        keyPoint3: "Wellness Brand of the Year",
        keyPoint4: "Traditional Wellness Excellence",
      },
      {
        title: "Organic Agriculture Excellence",
        image: "/assets/awards/organic_agriculture.png",
        keyPoint1: "Organic Farmer Excellence",
        keyPoint2: "Organic Farming Innovation",
        keyPoint3: "Bio-Input Excellence",
        keyPoint4: "Sustainable Agriculture Initiative",
      },
      {
        title: "Natural Living & Personal Care Excellence",
        image: "/assets/awards/natural.png",
        keyPoint1: "Natural Beauty Brand",
        keyPoint2: "Natural Personal Care Innovation",
        keyPoint3: "Sustainable Lifestyle Brand",
        keyPoint4: "Emerging Natural Brand",
      },
      {
        title: "GreenTech & Sustainability Excellence",
        image: "/assets/awards/greentech.png",
        keyPoint1: "GreenTech Innovation",
        keyPoint2: "Sustainable Packaging Excellence",
        keyPoint3: "AgriTech Innovation",
        keyPoint4: "Sustainability Initiative of the Year",
      },
      {
        title: "Trade, Certification & Global Business Excellence",
        image: "/assets/awards/trade.png",
        keyPoint1: "Organic Export Excellence",
        keyPoint2: "International Market Development",
        keyPoint3: "Certification & Quality Excellence",
        keyPoint4: "Organic Trade Promotion",
      },
    ],
  },
  {
    key: "awards-grand-awards",
    name: "Prestigious Grand Awards",
    enabled: true,
    eyebrow: "GRAND HONOURS",
    title: "Prestigious Grand Awards",
    items: [
      { title: "Organic Entrepreneur of the Year", image: "/assets/awards/organic_enterpreneur.png" },
      { title: "Organic Startup of the Year", image: "/assets/awards/organic_startup.png" },
      { title: "Organic Brand of the Year", image: "/assets/awards/organic_brand.png" },
      { title: "Innovation of the Year", image: "/assets/awards/innovation.png" },
      { title: "Sustainability Leadership Award", image: "/assets/awards/sustainability.png" },
      { title: "Lifetime Achievement Award", image: "/assets/awards/lifetime_achievement.png" },
    ],
  },
  {
    key: "awards-process",
    name: "Our Evaluation Process",
    enabled: true,
    eyebrow: "EVALUATION PROCESS",
    title: "Our Evaluation Process",
    items: [
      { title: "Nomination", image: "/assets/awards/nomination.png", description: "Submit your nomination online in the relevant category." },
      { title: "Eligibility Check", image: "/assets/awards/eligibility.png", description: "Our team verifies eligibility and supporting documents." },
      { title: "Evaluation", image: "/assets/awards/evaluation-jury.png", description: "Nominations are evaluated by our expert jury panel based on defined criteria." },
      { title: "Shortlisting", image: "/assets/awards/shortlisting.png", description: "Top nominees are shortlisted in each category." },
      { title: "Jury Assessment", image: "/assets/awards/evaluation-jury.png", description: "Final assessment by the jury to select the award winners." },
      { title: "Recognition", image: "/assets/awards/recognition.png", description: "Winners are honoured at the Bharat Organic Expo 2027." },
    ],
  },
  {
    key: "awards-info-columns",
    name: "Key Information Columns",
    enabled: true,
    eyebrow: "KEY DETAILS",
    title: "Information & Guidelines",
    items: [
      {
        title: "Key Dates",
        meta: "*Dates are subject to change.",
        description: "Nominations Open: 1 July 2026 | Last Date: 31 December 2026 | Shortlisting: January 2027 | Ceremony: 19–21 February 2027",
      },
      {
        title: "Who Can Apply?",
        meta: "Open to Indian & International participants.",
        description: "Companies & Brands, Startups & Entrepreneurs, Farmers & Producer Groups, Institutions & NGOs, Individuals & Professionals",
      },
      {
        title: "Why Participate?",
        description: "National & Global Recognition, Enhance Brand Value & Credibility, Networking with Industry Leaders, Business Growth Opportunities, Showcase Innovation & Impact",
      },
    ],
  },
  {
    key: "awards-cta",
    name: "Final Call To Action Banner",
    enabled: true,
    eyebrow: "BE RECOGNISED",
    title: "Be Recognised. Be Celebrated. Be Part of India's Organic Revolution.",
    description: "Nominate yourself or someone who inspires change in the organic and sustainable world.",
    date: "Deadline: 31 December 2026",
    buttonLabel: "Nominate Now",
    buttonHref: "/awards/nominations",
  },
];

export function mergeAwardsSections(sections?: AwardsSectionContent[]): AwardsSectionContent[] {
  if (!sections?.length) return defaultAwardsSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultAwardsSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultAwardsNominationSections: AwardsSectionContent[] = [
  {
    key: "awards-nomination-hero",
    name: "Awards Nomination Form Hero",
    enabled: true,
    title: "Bharat Organic Excellence Awards 2027",
    subtitle: "Celebrating Excellence • Innovation • Sustainability",
    description: "Honouring the changemakers, organizations and innovations during india's organic, natural and sustainable future.",
    date: "19 - 21 February 2027",
    location: "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA",
    image: "",
    buttonLabel: "Submit Nomination",
    buttonHref: "#nomination-form",
    secondaryButtonLabel: "View Categories",
    secondaryButtonHref: "/awards",
  },
  {
    key: "awards-nomination-steps",
    name: "Nomination Submission Steps",
    enabled: true,
    title: "THE AWARD PROCESS",
    items: [
      { num: "01", title: "Nomination", description: "Submit your nomination online in the relevant category.", image: "/assets/awards/nomination.png" },
      { num: "02", title: "Eligibility Check", description: "Our team verifies eligibility and supporting documents.", image: "/assets/awards/eligibility.png" },
      { num: "03", title: "Evaluation", description: "Nominations are evaluated by our expert jury panel based on defined criteria.", image: "/assets/awards/evaluation-jury.png" },
      { num: "04", title: "Shortlisting", description: "Top nominees are shortlisted in each category.", image: "/assets/awards/shortlisting.png" },
      { num: "05", title: "Jury Assessment", description: "Final assessment by the jury to select the award winners.", image: "/assets/awards/evaluation-jury.png" },
      { num: "06", title: "Recognition", description: "Winners are honoured at the Bharat Organic Expo 2027.", image: "/assets/awards/recognition.png" },
    ],
  },
];

