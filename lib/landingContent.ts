export interface LandingSectionItem {
  title?: string;
  label?: string;
  subtitle?: string;
  value?: string;
  description?: string;
  image?: string;
  icon?: string;
  href?: string;
  buttonLabel?: string;
  buttonHref?: string;
  features?: string[];
  secondaryImage?: string;
  tertiaryImage?: string;
  quaternaryImage?: string;
  videoUrl?: string;
}

export interface LandingHeroSlide {
  title: string;
  description: string;
  image: string;
  alt: string;
  buttonLabel?: string;
  buttonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  variant?: "default" | "family-support" | "journey-prayer" | "volunteer-impact";
}

export interface LandingSectionContent {
  key: string;
  name: string;
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  logoImage?: string;
  partnerLogoImage?: string;
  secondaryLogoImage?: string;
  secondaryImage?: string;
  tertiaryImage?: string;
  quaternaryImage?: string;
  videoUrl?: string;
  secondaryVideoUrl?: string;
  quote?: string;
  legalNotice?: string;
  lowerTitle?: string;
  lowerDescription?: string;
  bottomStatement?: string;
  secondaryTitle?: string;
  secondaryDescription?: string;
  supportTitle?: string;
  supportDescription?: string;
  regionTitle?: string;
  regionDescription?: string;
  phoneLabel?: string;
  phoneNumber?: string;
  contactEmail?: string;
  contactAddress?: string;
  altPhoneNumber?: string;
  availabilityText?: string;
  actionTitle?: string;
  requestTitle?: string;
  requestDescription?: string;
  inputPlaceholder?: string;
  submitLabel?: string;
  submittedLabel?: string;
  successMessage?: string;
  initiativeLabel?: string;
  quickLinksTitle?: string;
  servicesTitle?: string;
  initiativesTitle?: string;
  contactTitle?: string;
  sloganTitle?: string;
  immediateHelpTitle?: string;
  immediateHelpDescription?: string;
  supportNowLabel?: string;
  supportMissionTitle?: string;
  supportMissionDescription?: string;
  buttonLabel?: string;
  buttonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  tertiaryButtonLabel?: string;
  tertiaryButtonHref?: string;
  tagline?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  sectionTag?: string;
  titleMain?: string;
  titleHighlight?: string;
  descriptionPrefix?: string;
  date?: string;
  location?: string;
  exploreText?: string;
  buttonText?: string;
  marqueeText?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerFeature?: string;
  formTitle?: string;
  rightTitle?: string;
  rightBottomText?: string;
  centerText1?: string;
  centerText2?: string;
  centerText3?: string;
  websiteUrl?: string;
  imageBadgeText?: string;
  headerTitle?: string;
  titlePrefix?: string;
  value?: string;
  badgeLine1?: string;
  badgeLine2?: string;
  slides?: LandingHeroSlide[];
  items?: LandingSectionItem[];
}

export const defaultLandingSections: LandingSectionContent[] = [
  {
    key: "hero",
    name: "HeroSection",
    enabled: true,
    tagline: "ORGANIC FOOD & BEVERAGES",
    titlePrimary: "PURE & CERTIFIED",
    titleSecondary: "ORGANIC STAPLES",
    subtitle: "Taste the purity of nature.",
    description: "Discover a diverse range of certified organic staples, farm-fresh produce, healthy snacks, and plant-based drinks.",
    date: "19-21 FEBRUARY 2027",
    location: "PRAGATI MAIDAN, NEW DELHI",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Bharat Organic Expo 2027 Hero Banner",
    buttonLabel: "Book Your Stall",
    buttonHref: "/registration/book-a-stand",
    secondaryButtonLabel: "Register as Visitor",
    secondaryButtonHref: "/registration/visitor-registration",
    slides: [
      {
        title: "PURE & CERTIFIED ORGANIC STAPLES",
        description: "Discover a diverse range of certified organic staples, farm-fresh produce, healthy snacks, and plant-based drinks.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Organic Food & Beverages",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        title: "BOOST YOUR IMMUNITY",
        description: "Explore premium natural dietary supplements, organic protein powders, and powerful superfoods to fuel your everyday life.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Superfoods",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        title: "CLEAN & CRUELTY FREE COSMETICS",
        description: "Source top-tier organic skincare, vegan cosmetics, and non-toxic personal hygiene products that care for you and the planet.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Natural Beauty",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        title: "INNOVATING AGRICULTURE",
        description: "Experience the latest in organic seeds, bio-fertilizers, agri-tech innovations, and vertical farming solutions.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Smart & Sustainable Farming",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        title: "ANCIENT WISDOM MODERN HEALING",
        description: "Immerse yourself in authentic Ayurvedic therapies, holistic herbal supplements, essential oils, and detox solutions.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Herbal Wellness & Ayurveda",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        title: "EXPERIENCE THE MEGA EVENT",
        description: "Join thousands of experts, buyers, and exhibitors at the most anticipated organic and wellness mega event of the year.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Live Expo & Networking",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
    ],
    items: [
      { label: "Exhibitors", value: "500+" },
      { label: "Trade Visitors", value: "50,000+" },
      { label: "Exhibition Space", value: "20,000 Sq.m" },
      { label: "Participating Countries", value: "25+" },
    ],
  },
  {
    key: "audience-strip",
    name: "AudienceStrip",
    enabled: true,
    title: "WHO SHOULD VISIT & EXHIBIT",
    items: [
      { label: "Organic Farmers & Producers" },
      { label: "Retailers, Wholesalers & Distributors" },
      { label: "Exporters & Importers" },
      { label: "B2B Bulk Buyers & Supermarkets" },
      { label: "General Public & Wellness Enthusiasts" },
    ],
  },
  {
    key: "introduction-section",
    name: "IntroductionSection",
    enabled: true,
    eyebrow: "WELCOME TO BHARAT ORGANIC EXPO",
    titlePrimary: "INDIA'S LARGEST ORGANIC",
    titleSecondary: "NATURAL & AYUSH EXPO 2027",
    subtitle: "India's Premier Platform for Organic Products, Sustainable Agriculture & Natural Living",
    description: "Bharat Organic Expo brings together organic producers, brands, technology innovators, exporters and buyers under one grand roof at Pragati Maidan.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Bharat Organic Expo 2027 Introduction",
    buttonLabel: "Explore Exhibition",
    buttonHref: "/about",
    items: [
      { title: "Direct Farm to Market Access", description: "Empowering organic farmers with direct consumer and B2B buyer connections." },
      { title: "Global Export Opportunities", description: "Connecting Indian organic brands with international delegations." },
      { title: "Sustainable AgriTech Solutions", description: "Showcasing bio-fertilizers, natural farming inputs and green technology." },
    ],
  },
  {
    key: "global-platform",
    name: "GlobalPlatform",
    enabled: true,
    title: "GLOBAL PLATFORM FOR ORGANIC TRADE",
    subtitle: "Connecting over 25+ countries in India's premier organic gathering.",
    description: "Empowering exporters, trade councils, and sustainable food producers with global market access.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Global Organic Platform",
    items: [
      { label: "International Delegations", value: "35+" },
      { label: "Global Organic Brands", value: "120+" },
      { label: "B2B Matchmaking Deals", value: "₹500 Cr+" },
    ],
  },
  {
    key: "why-participate",
    name: "WhyParticipate",
    enabled: true,
    title: "WHY PARTICIPATE & EXHIBIT",
    subtitle: "Unlock massive growth opportunities for your organic brand.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Why Participate in Expo",
    items: [
      { title: "Brand Exposure", description: "Present your products to over 50,000+ targeted trade visitors." },
      { title: "B2B Matchmaking", description: "Pre-scheduled one-on-one meetings with verified bulk buyers and exporters." },
      { title: "Market Expansion", description: "Launch new organic products and expand retail distribution channels." },
      { title: "Knowledge Sharing", description: "Gain insights from global organic certification and policy experts." },
    ],
  },
  {
    key: "conference-section",
    name: "ConferenceSection",
    enabled: true,
    title: "CONFERENCES, SEMINARS & WORKSHOPS",
    subtitle: "3 Days of Knowledge Exchange and Expert Keynotes",
    description: "Engage in insightful discussions led by top organic scientists, policy makers, and successful organic entrepreneurs.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Conferences & Seminars",
    buttonLabel: "View Conference Agenda",
    buttonHref: "/buyer-seller-meet",
    items: [
      { title: "Organic Certification Standards", description: "Keynote by APEDA & NOP Certification Authorities." },
      { title: "Natural Farming Innovations", description: "Practical insights into bio-inputs and soil health enhancement." },
      { title: "Export & Trade Regulations", description: "Navigating international compliance and export logistics." },
    ],
  },
  {
    key: "expo-categories",
    name: "ExpoCategories",
    enabled: true,
    sectionTag: "EXPO CATEGORIES",
    titleMain: "Explore Diverse",
    titleHighlight: "Exhibition Sectors",
    descriptionPrefix: "One Platform. Every Opportunity.",
    description: "Bharat Organic Expo brings together the entire organic ecosystem under one roof.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Expo Categories",
    exploreText: "Explore",
    buttonText: "VIEW ALL CATEGORIES",
    items: [
      { title: "Organic Food & Beverages", description: "Certified organic staples, grains, healthy snacks, and juices.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg" },
      { title: "AYUSH, Ayurveda & Herbal", description: "Ayurvedic medicines, supplements, teas, and herbal solutions.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg" },
      { title: "Natural Farming & Bio-Inputs", description: "Bio-fertilizers, organic seeds, manures, and pest management.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg" },
      { title: "Natural Beauty & Personal Care", description: "Eco-friendly skincare, vegan cosmetics, and personal hygiene.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg" },
      { title: "AgriTech & Green Innovations", description: "Smart farming technology, irrigation, and processing machines.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg" },
      { title: "Sustainable Packaging", description: "Biodegradable, eco-friendly, and recyclable packaging materials.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg" },
    ],
  },
  {
    key: "beyond-exhibition",
    name: "BeyondExhibition",
    enabled: true,
    sectionTag: "Global Organic Platform",
    titleMain: "Beyond An",
    titleHighlight: "Exhibition",
    title: "BEYOND EXHIBITION HIGHLIGHTS",
    subtitle: "More than just an exhibition — an immersive organic experience.",
    description: "Join India's most powerful ecosystem for the organic industry. From high-impact B2B matchmaking and leadership summits to global networking, we provide everything you need to scale your business.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Conferences & Seminars",
    items: [
      { title: "GLOBAL CONFERENCES", description: "Gain actionable insights and explore emerging trends with global industry experts.", icon: "Users" },
      { title: "LEADERSHIP SUMMITS", description: "Engage with top policymakers and CEOs driving sustainable change.", icon: "Briefcase" },
      { title: "ORGANIC AWARDS", description: "Celebrate excellence and recognize pioneering brands in the organic sector.", icon: "Award" },
      { title: "STARTUP SHOWCASE", description: "Discover innovative startups pitching groundbreaking green technologies.", icon: "Sparkles" },
      { title: "B2B MEETINGS", description: "Network with top distributors and build lasting global partnerships.", icon: "Handshake" },
      { title: "GLOBAL DELEGATION", description: "Connect with international delegates to expand your market reach.", icon: "Globe" },
      { title: "SUSTAINABILITY WORKSHOPS", description: "Learn practical implementations for zero-waste and eco-friendly practices.", icon: "Leaf" },
      { title: "PRODUCT LAUNCHPAD", description: "Witness the exclusive unveiling of the latest natural and organic innovations.", icon: "Rocket" },
    ],
  },
  {
    key: "sponsors-attend",
    name: "SponsorsAndAttend",
    enabled: true,
    titlePrefix: "WHY",
    titleHighlight: "ATTEND?",
    title: "OUR PROMINENT SPONSORS & PARTNERS",
    subtitle: "Supported by leading ministries, associations, and organic pioneers.",
    description: "Explore innovations, build connections and gain insights that drive better health and stronger businesses.",
    rightTitle: "WHO SHOULD ATTEND?",
    rightBottomText: "Whether you're sourcing, learning or networking — this is the place to be!",
    centerText1: "ONE PLATFORM.",
    centerText2: "ORGANIC",
    centerText3: "OPPORTUNITIES.",
    buttonLabel: "REGISTER AS VISITOR!",
    buttonHref: "/registration/visitor-registration",
  },
  {
    key: "become-sponsor",
    name: "BecomeSponsor",
    enabled: true,
    title: "BECOME A SPONSOR",
    subtitle: "Maximize your brand visibility at India's largest organic gathering.",
    description: "Position your brand as a leader in sustainability and green living.",
    buttonLabel: "Apply for Sponsorship",
    buttonHref: "/sponsorship",
  },
  {
    key: "sponsorship-categories",
    name: "SponsorshipCategories",
    enabled: true,
    headerTitle: "SPONSORSHIP OPPORTUNITIES",
    title: "SPONSORSHIP TIERS & PACKAGES",
    subtitle: "Tailored sponsorship packages designed for high brand impact.",
    bannerTitle: "LIMITED SPONSORSHIP SLOTS AVAILABLE",
    bannerSubtitle: "Secure your category before it's gone!",
    bannerFeature: "Featured sponsors get exclusive media coverage & brand promotions.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Bharat Organic Expo - B2B Exhibition and Conference",
    badgeLine1: "GO ORGANIC",
    badgeLine2: "GO BETTER",
    titlePrefix: "ELEVATE YOUR BRAND PRESENCE",
    titleHighlight: "AT BHARAT ORGANIC EXPO 2027",
    description: "Build meaningful connections and grow your business with India's biggest organic show.",
    formTitle: "INTERESTED IN SPONSORING?",
    buttonLabel: "BROCHURE",
    buttonHref: "/download/invited card.pdf",
    secondaryButtonLabel: "ANY QUERY?",
    secondaryButtonHref: "/contact",
    tertiaryButtonLabel: "TALK TO US",
    tertiaryButtonHref: "tel:+919654900525",
    items: [
      { title: "Title Sponsor", value: "Exclusive", description: "Maximum visibility & brand exclusivity across all promotional materials." },
      { title: "Powered By Sponsor", value: "Category Tier", description: "Align your brand as the power behind BOE with prime lounge & main stage branding." },
      { title: "Associate Sponsor", value: "High Impact", description: "High-impact visibility & brand recognition across expo halls." },
      { title: "Conference Sponsor", value: "Knowledge Tier", description: "Brand association with 20+ global knowledge sessions & workshops." },
    ],
  },
  {
    key: "partners-brands",
    name: "PartnersAndBrands",
    enabled: true,
    title: "PARTNERS & SUPPORTING ORGANIZATIONS",
    subtitle: "Collaborating for a healthier and greener planet.",
  },
  {
    key: "buyer-seller-meet",
    name: "BuyerSellerMeet",
    enabled: true,
    title: "INTERNATIONAL B2B BUYER-SELLER MEET",
    subtitle: "Pre-scheduled One-on-One Business Matchmaking",
    description: "Direct business interactions between international buyers, Indian exporters, and certified organic producers.",
    buttonLabel: "Register for B2B Meet",
    buttonHref: "/buyer-seller-meet",
    items: [
      { value: "01", title: "Buyer Registration", description: "Submit your sourcing requirements online." },
      { value: "02", title: "Matchmaking & Scheduling", description: "Get matched with verified organic suppliers." },
      { value: "03", title: "One-on-One Meetings", description: "Conduct business meetings at designated B2B lounges." },
    ],
  },
  {
    key: "testimonials-carousel",
    name: "TestimonialsCarousel",
    enabled: true,
    title: "WHAT EXHIBITORS & VISITORS SAY",
    subtitle: "Feedback from past editions of Bharat Organic Expo.",
    items: [
      { title: "Ramesh Sharma", label: "Organic Farmer & Exporter", description: "Bharat Organic Expo gave us direct access to international buyers. Our export deals doubled in 3 days!" },
      { title: "Priya Kapoor", label: "CEO, NaturePure Foods", description: "The quality of trade visitors and organization at Pragati Maidan was world-class. Outstanding ROI!" },
      { title: "Ankit Nair", label: "Retail Distributor", description: "An incredible array of new organic brands and agri-tech innovations. Highly recommended for every trader!" },
    ],
  },
  {
    key: "latest-insights",
    name: "LatestInsights",
    enabled: true,
    title: "LATEST NEWS & ORGANIC INSIGHTS",
    subtitle: "Stay updated with recent trends in organic farming, certification, and trade.",
    buttonLabel: "View All Articles",
    buttonHref: "/blog",
  },
  {
    key: "topbar",
    name: "Topbar",
    enabled: true,
    title: "Bharat Organic Expo 2027",
    marqueeText: "500+ SPEAKERS CONFIRMED • EARLY BIRD DISCOUNT ENDING SOON! • JOIN 50,000+ PROFESSIONALS FROM 25+ COUNTRIES",
    phoneNumber: "+91 96549 00525",
    contactEmail: "info@namogangewellness.com",
  },
  {
    key: "navbar",
    name: "Header Navigation",
    enabled: true,
    title: "Bharat Organic Expo",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    buttonLabel: "Book Your Stall",
    buttonHref: "/registration/book-a-stand",
    secondaryButtonLabel: "Register as Visitor",
    secondaryButtonHref: "/registration/visitor-registration",
    items: [
      { label: "Home", href: "/" },
      { label: "About Expo", href: "/about" },
      { label: "Why Exhibit", href: "/why-exhibit" },
      { label: "Why Visit", href: "/why-visit" },
      { label: "Exhibition Sectors", href: "/exhibition-categories" },
      { label: "B2B Buyer Seller Meet", href: "/buyer-seller-meet" },
      { label: "Sponsorship", href: "/sponsorship" },
      { label: "Partnership", href: "/partnership" },
      { label: "Blog & News", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    key: "footer",
    name: "Footer & Social Links",
    enabled: true,
    title: "BHARAT ORGANIC EXPO 2027",
    subtitle: "A global platform uniting over 500+ exhibitors from across the organic value chain.",
    description: "Showcasing certified products, advanced agritech, sustainable practices, and the rich heritage of traditional wellness.",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    partnerLogoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    secondaryImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    tertiaryImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    contactAddress: "Hall 12, Pragati Maidan, New Delhi, India 110001",
    phoneNumber: "+91 96549 00525",
    altPhoneNumber: "+91 98183 53841",
    contactEmail: "info@namogangewellness.com",
    websiteUrl: "www.bharatorganicexpo.com",
    items: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Exhibitor Registration", href: "/registration/book-a-stand" },
      { label: "Delegate Registration", href: "https://arogya.namogange.org/" },
      { label: "Conference Tracks", href: "https://arogya.namogange.org/" },
      { label: "Buyer Seller Meet", href: "/buyer-seller-meet" },
      { label: "Exhibitor List", href: "/exhibitors" },
      { label: "Blogs", href: "/blog" },
      { label: "Awards", href: "/awards" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
];

export { defaultAboutSections } from "./aboutContent";

export function mergeLandingSections(sections?: LandingSectionContent[]): LandingSectionContent[] {
  if (!sections?.length) return defaultLandingSections;
  const byKey = new Map(sections.map((section) => [section.key, section]));
  return defaultLandingSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (
      fallback.key === "join-mission" &&
      saved &&
      (saved.title === "Stand With Moksha Sewa" ||
        saved.description === "Support the mission as a donor, volunteer or partner." ||
        saved.items?.some((item) => item.image?.startsWith("/assets/about-optimized/")))
    ) {
      return fallback;
    }
    if (!saved) return fallback;
    const items = fallback.items?.length
      ? fallback.key === "navbar"
        ? [
            ...fallback.items.map((item) => ({
              ...item,
              ...(saved.items?.find((savedItem) => savedItem.href === item.href || savedItem.label === item.label) ?? {}),
            })),
            ...(saved.items?.filter(
              (savedItem) =>
                !fallback.items?.some((item) => item.href === savedItem.href || item.label === savedItem.label)
            ) ?? []),
          ]
        : [
            ...fallback.items.map((item, index) => ({ ...item, ...(saved.items?.[index] ?? {}) })),
            ...(saved.items?.slice(fallback.items.length) ?? []),
          ]
      : saved.items;
    const slides = fallback.slides?.length
      ? [
          ...fallback.slides.map((slide, index) => ({ ...slide, ...(saved.slides?.[index] ?? {}) })),
          ...(saved.slides?.slice(fallback.slides.length) ?? []),
        ]
      : saved.slides;
    return normalizeLandingSection({ ...fallback, ...saved, items, slides, enabled: saved.enabled !== false }, fallback);
  });
}

const genericTextLimits: Partial<Record<keyof LandingSectionContent, number>> = {
  name: 80,
  eyebrow: 70,
  title: 120,
  subtitle: 140,
  description: 260,
  quote: 260,
  legalNotice: 200,
  lowerTitle: 90,
  lowerDescription: 220,
  bottomStatement: 240,
  secondaryTitle: 80,
  secondaryDescription: 140,
  supportTitle: 160,
  supportDescription: 120,
  regionTitle: 90,
  regionDescription: 90,
  phoneLabel: 40,
  phoneNumber: 24,
  contactEmail: 100,
  contactAddress: 180,
  altPhoneNumber: 24,
  availabilityText: 120,
  actionTitle: 90,
  requestTitle: 90,
  requestDescription: 180,
  inputPlaceholder: 70,
  submitLabel: 40,
  submittedLabel: 40,
  successMessage: 180,
  initiativeLabel: 90,
  quickLinksTitle: 50,
  servicesTitle: 50,
  initiativesTitle: 50,
  contactTitle: 50,
  buttonLabel: 40,
  secondaryButtonLabel: 40,
  tertiaryButtonLabel: 40,
  sloganTitle: 90,
  immediateHelpTitle: 70,
  immediateHelpDescription: 120,
  supportNowLabel: 40,
  supportMissionTitle: 70,
  supportMissionDescription: 140,
};

const itemTextLimits: Partial<Record<keyof LandingSectionItem, number>> = {
  title: 120,
  label: 70,
  subtitle: 120,
  value: 50,
  description: 260,
};

const slideTextLimits: Partial<Record<keyof LandingHeroSlide, number>> = {
  title: 110,
  description: 160,
  alt: 180,
  buttonLabel: 40,
  secondaryButtonLabel: 40,
};

function withEllipsis(value: string) {
  const truncated = value
    .trimEnd()
    .replace(/[.\u2026]+$/g, "");
  return `${truncated}...`;
}

function truncateText(value: string | undefined, limit: number, fallback?: string) {
  if (!value) return value;
  const next = value.trim();
  const fallbackText = fallback?.trim();
  if (fallbackText && next.startsWith(fallbackText) && next.slice(fallbackText.length).trim()) {
    return withEllipsis(fallbackText);
  }
  if (value.length <= limit) return value;
  return withEllipsis(value.slice(0, Math.max(0, limit - 3)));
}

function limitFromFallback(value: string | undefined, generic: number) {
  return value ? Math.max(value.length, generic) : generic;
}

export function normalizeLandingSection(section: LandingSectionContent, fallback: LandingSectionContent): LandingSectionContent {
  const normalized: LandingSectionContent = { ...section };
  (Object.keys(genericTextLimits) as (keyof LandingSectionContent)[]).forEach((key) => {
    const value = normalized[key];
    if (typeof value === "string") {
      const fallbackValue = fallback[key] as string | undefined;
      const limit = limitFromFallback(fallbackValue, genericTextLimits[key] ?? 160);
      (normalized as unknown as Record<string, unknown>)[key] = truncateText(value, limit, fallbackValue);
    }
  });

  normalized.items = section.items?.map((item, index) => {
    const fallbackItem = fallback.items?.[index];
    const next = { ...item };
    (Object.keys(itemTextLimits) as (keyof LandingSectionItem)[]).forEach((key) => {
      const value = next[key];
      if (typeof value === "string") {
        const fallbackValue = fallbackItem?.[key] as string | undefined;
        (next as unknown as Record<string, unknown>)[key] = truncateText(
          value,
          limitFromFallback(fallbackValue, itemTextLimits[key] ?? 120),
          fallbackValue
        );
      }
    });
    next.features = item.features?.map((feature, featureIndex) =>
      truncateText(feature, limitFromFallback(fallbackItem?.features?.[featureIndex], 80), fallbackItem?.features?.[featureIndex]) ?? ""
    );
    return next;
  });

  normalized.slides = section.slides?.map((slide, index) => {
    const fallbackSlide = fallback.slides?.[index];
    const next = { ...slide };
    (Object.keys(slideTextLimits) as (keyof LandingHeroSlide)[]).forEach((key) => {
      const value = next[key];
      if (typeof value === "string") {
        const fallbackValue = fallbackSlide?.[key] as string | undefined;
        (next as Record<string, unknown>)[key] = truncateText(
          value,
          limitFromFallback(fallbackValue, slideTextLimits[key] ?? 120),
          fallbackValue
        );
      }
    });
    return next;
  });

  return normalized;
}
