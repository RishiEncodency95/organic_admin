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
    date: "19 - 21 FEBRUARY 2027",
    location: "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    buttonLabel: "NOMINATE NOW",
    buttonHref: "/awards/nominations",
    secondaryButtonLabel: "VIEW CATEGORIES",
    secondaryButtonHref: "#categories",
  },
  {
    key: "awards-stats",
    name: "Key Statistics Strip",
    enabled: true,
    eyebrow: "AWARDS STATS",
    title: "Key Metrics & Scale",
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
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164982/moksha-sewa/assets/about-optimized/a_mission.png",
  },
  {
    key: "awards-categories",
    name: "Award Sector Categories",
    enabled: true,
    eyebrow: "AWARD CATEGORIES",
    title: "Award Categories",
    description: "Recognizing pioneering work across key sectors in the organic and wellness ecosystem.",
    items: [
      {
        title: "Organic Food & Nutrition Excellence",
        icon: "organic_food",
        description: "Organic Food Brand of the Year, Organic Beverage Brand of the Year, Nutrition Innovation Award, Emerging Organic Food Brand",
      },
      {
        title: "Ayush, Herbal & Wellness Excellence",
        icon: "ayush",
        description: "Ayurveda Brand Excellence, Herbal Product Innovation, Wellness Brand of the Year, Traditional Wellness Excellence",
      },
      {
        title: "Organic Agriculture Excellence",
        icon: "organic_agriculture",
        description: "Organic Farmer Excellence, Organic Farming Innovation, Bio-Input Excellence, Sustainable Agriculture Initiative",
      },
      {
        title: "Natural Living & Personal Care Excellence",
        icon: "natural",
        description: "Natural Beauty Brand, Natural Personal Care Innovation, Sustainable Lifestyle Brand, Emerging Natural Brand",
      },
      {
        title: "GreenTech & Sustainability Excellence",
        icon: "greentech",
        description: "GreenTech Innovation, Sustainable Packaging Excellence, AgriTech Innovation, Sustainability Initiative of the Year",
      },
      {
        title: "Trade, Certification & Global Business Excellence",
        icon: "trade",
        description: "Organic Export Excellence, International Market Development, Certification & Quality Excellence, Organic Trade Promotion",
      },
    ],
  },
  {
    key: "awards-grand-awards",
    name: "Prestigious Grand Awards",
    enabled: true,
    eyebrow: "GRAND HONOURS",
    title: "Prestigious Grand Awards",
    description: "Special categories honoring outstanding individual achievements and overall impact.",
    items: [
      { title: "Organic Entrepreneur of the Year", icon: "entrepreneur" },
      { title: "Organic Startup of the Year", icon: "startup" },
      { title: "Organic Brand of the Year", icon: "brand" },
      { title: "Innovation of the Year", icon: "innovation" },
      { title: "Sustainability Leadership Award", icon: "sustainability" },
      { title: "Lifetime Achievement Award", icon: "lifetime" },
    ],
  },
  {
    key: "awards-process",
    name: "Our Evaluation Process",
    enabled: true,
    eyebrow: "EVALUATION PROCESS",
    title: "Our Evaluation Process",
    description: "6-stage rigorous process for judging and identifying winners.",
    items: [
      { title: "Nomination", description: "Submit your nomination online in the relevant category." },
      { title: "Eligibility Check", description: "Our team verifies eligibility and supporting documents." },
      { title: "Evaluation", description: "Nominations are evaluated by our expert jury panel based on defined criteria." },
      { title: "Shortlisting", description: "Top nominees are shortlisted in each category." },
      { title: "Jury Assessment", description: "Final assessment by the jury to select the award winners." },
      { title: "Recognition", description: "Winners are honoured at the Bharat Organic Expo 2027." },
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
