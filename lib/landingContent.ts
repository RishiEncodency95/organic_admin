export interface LandingSectionItem {
  title?: string;
  label?: string;
  subtitle?: string;
  value?: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  href?: string;
  exploreText?: string;
  buttonLabel?: string;
  buttonHref?: string;
  features?: string[];
  secondaryImage?: string;
  tertiaryImage?: string;
  quaternaryImage?: string;
  videoUrl?: string;
  tag?: string;
  name?: string;
  role?: string;
  quote?: string;
  duration?: string;
  meta?: string;
  count?: number;
  location?: string;
  date?: string;
  readTime?: string;
  main?: string;
  sub?: string;
  num?: string;
  title1?: string;
  title2?: string;
  val?: string;
  desc?: string;
  companyName1?: string;
  companyName2?: string;
  initials?: string;
  question?: string;
  answer?: string;
  category?: string;
  year?: string;
  rating?: number;
}

export interface LandingHeroSlide {
  title: string;
  tagline?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  subtitle?: string;
  description: string;
  date?: string;
  location?: string;
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
  primaryButton?: string;
  secondaryButton?: string;
  primaryButtonHref?: string;
  headingBefore?: string;
  headingHighlight?: string;
  leftCardTitle?: string;
  leftCardDescription?: string;
  rightCardTitle?: string;
  rightCardDescription?: string;
  supportText?: string;
  services?: string[];
  disclaimerTitle?: string;
  disclaimerText?: string;
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
  authorName?: string;
  authorDesignation?: string;
  headerTitle?: string;
  titlePrefix?: string;
  value?: string;
  badgeLine1?: string;
  badgeLine2?: string;
  description2?: string;
  timerTitle?: string;
  eventDate?: string;
  showTimer?: boolean;
  keyPoint1?: string;
  keyPoint2?: string;
  keyPoint3?: string;
  keyPoint4?: string;
  keyPoint5?: string;
  keyPoint6?: string;
  keyPoint7?: string;
  stat1Title?: string;
  stat1Sub?: string;
  stat2Title?: string;
  stat2Sub?: string;
  stat3Title?: string;
  stat3Sub?: string;
  stat4Title?: string;
  stat4Sub?: string;
  stat5Title?: string;
  stat5Sub?: string;
  slides?: LandingHeroSlide[];
  items?: LandingSectionItem[];
  [key: string]: any;
}

export const defaultLandingSections: LandingSectionContent[] = [
  {
    key: "topbar",
    name: "Topbar & Header Contact",
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
    key: "hero",
    name: "Hero Carousel Slides",
    enabled: true,
    slides: [
      {
        tagline: "ORGANIC FOOD & BEVERAGES",
        titlePrimary: "PURE & CERTIFIED",
        titleSecondary: "ORGANIC STAPLES",
        subtitle: "Taste the purity of nature.",
        title: "PURE & CERTIFIED ORGANIC STAPLES",
        description: "Discover a diverse range of certified organic staples, farm-fresh produce, healthy snacks, and plant-based drinks.",
        date: "19-21 FEBRUARY 2027",
        location: "PRAGATI MAIDAN, NEW DELHI",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Organic Food & Beverages",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        tagline: "SUPERFOODS",
        titlePrimary: "BOOST YOUR",
        titleSecondary: "IMMUNITY",
        subtitle: "Health straight from the earth.",
        title: "BOOST YOUR IMMUNITY",
        description: "Explore premium natural dietary supplements, organic protein powders, and powerful superfoods to fuel your everyday life.",
        date: "19-21 FEBRUARY 2027",
        location: "PRAGATI MAIDAN, NEW DELHI",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Superfoods",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        tagline: "NATURAL BEAUTY",
        titlePrimary: "CLEAN & CRUELTY",
        titleSecondary: "FREE COSMETICS",
        subtitle: "Radiance without the chemicals.",
        title: "CLEAN & CRUELTY FREE COSMETICS",
        description: "Source top-tier organic skincare, vegan cosmetics, and non-toxic personal hygiene products that care for you and the planet.",
        date: "19-21 FEBRUARY 2027",
        location: "PRAGATI MAIDAN, NEW DELHI",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Natural Beauty",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        tagline: "SMART & SUSTAINABLE FARMING",
        titlePrimary: "INNOVATING",
        titleSecondary: "AGRICULTURE",
        subtitle: "Empowering farmers with green tech.",
        title: "INNOVATING AGRICULTURE",
        description: "Experience the latest in organic seeds, bio-fertilizers, agri-tech innovations, and vertical farming solutions.",
        date: "19-21 FEBRUARY 2027",
        location: "PRAGATI MAIDAN, NEW DELHI",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Smart & Sustainable Farming",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        tagline: "HERBAL WELLNESS & AYURVEDA",
        titlePrimary: "ANCIENT WISDOM",
        titleSecondary: "MODERN HEALING",
        subtitle: "Balance your mind, body, and soul.",
        title: "ANCIENT WISDOM MODERN HEALING",
        description: "Immerse yourself in authentic Ayurvedic therapies, holistic herbal supplements, essential oils, and detox solutions.",
        date: "19-21 FEBRUARY 2027",
        location: "PRAGATI MAIDAN, NEW DELHI",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Herbal Wellness & Ayurveda",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
      {
        tagline: "LIVE EXPO & NETWORKING",
        titlePrimary: "EXPERIENCE THE",
        titleSecondary: "MEGA EVENT",
        subtitle: "Connect with industry leaders.",
        title: "EXPERIENCE THE MEGA EVENT",
        description: "Join thousands of experts, buyers, and exhibitors at the most anticipated organic and wellness mega event of the year.",
        date: "19-21 FEBRUARY 2027",
        location: "PRAGATI MAIDAN, NEW DELHI",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
        alt: "Live Expo & Networking",
        buttonLabel: "Book Your Stall",
        buttonHref: "/registration/book-a-stand",
        secondaryButtonLabel: "Register as Visitor",
        secondaryButtonHref: "/registration/visitor-registration",
      },
    ],
  },
  {
    key: "audience-strip",
    name: "AudienceStrip",
    enabled: true,
    items: [
      { title: "UNIVERSITY", subtitle: "ACADEMIC PARTNERS", icon: "GraduationCap", color: "text-orange-500", label: "UNIVERSITY ACADEMIC PARTNERS" },
      { title: "HEALTHCARE", subtitle: "LEADERS", icon: "Stethoscope", color: "text-[#3b8c2a]", label: "HEALTHCARE LEADERS" },
      { title: "GOVERNMENT", subtitle: "BODIES", icon: "Landmark", color: "text-blue-500", label: "GOVERNMENT BODIES" },
      { title: "AYUSH", subtitle: "INDUSTRY", icon: "Leaf", color: "text-green-600", label: "AYUSH INDUSTRY" },
      { title: "INTERNATIONAL", subtitle: "BUYERS", icon: "Globe", color: "text-indigo-600", label: "INTERNATIONAL BUYERS" },
      { title: "HOSPITAL & CLINIC", subtitle: "PROCUREMENT TEAMS", icon: "Building2", color: "text-red-500", label: "HOSPITAL & CLINIC PROCUREMENT TEAMS" },
    ],
  },
  {
    key: "introduction-section",
    name: "IntroductionSection",
    enabled: true,
    eyebrow: "INTRODUCTION",
    titlePrimary: "WELCOME TO BHARAT ORGANIC EXPO",
    titleSecondary: "2027",
    subtitle: "India's Premier Platform for Organic Products, Sustainable Agriculture & Natural Living",
    description: "Bharat Organic Expo 2027 is India's leading international exhibition dedicated to organic products, sustainable agriculture, natural wellness, eco-friendly innovations, and green business opportunities. The Expo brings together manufacturers, exhibitors, buyers, importers, exporters, investors, government organizations, industry experts, startups, researchers, and global delegates under one dynamic platform.",
    description2: "Designed to foster business growth, knowledge sharing, innovation, and international collaboration, Bharat Organic Expo serves as the perfect destination for discovering new products, building strategic partnerships, expanding global markets, and promoting a sustainable future.",
    buttonLabel: "Explore Exhibition",
    buttonHref: "/about",
    timerTitle: "EVENT BEGINS IN",
    eventDate: "2027-02-19T00:00:00",
    showTimer: true,
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Bharat Organic Expo 2027 Introduction",
  },
  {
    key: "global-platform",
    name: "GlobalPlatform",
    enabled: true,
    eyebrow: "FROM INDIA TO THE WORLD",
    titlePrimary: "From a National Expo to a",
    titleSecondary: "Global Platform",
    description: "Bharat Organic Expo is India's most influential platform connecting organic products, people and possibilities.",
    keyPoint1: "International Exhibitors & Global Brands",
    keyPoint2: "Buyers, Distributors & Importers",
    keyPoint3: "Research & Innovation | Startups",
    keyPoint4: "Investors, Financial Institutions",
    keyPoint5: "Government Bodies, Embassies & Policy Makers",
    items: [
      {
        title: "GLOBAL CONNECTIONS",
        description: "Connect with global leaders in organic trade and sustainable business. Expand your network across international markets to build long-term, profitable relationships.",
      },
      {
        title: "INTERNATIONAL ALLIANCES",
        description: "Forge strategic alliances with prominent international organizations, trade bodies, and embassies to unlock massive cross-border trade opportunities.",
      },
      {
        title: "POLICY & KNOWLEDGE",
        description: "Engage directly with global policy makers, researchers, and leaders driving regulatory changes and sustainability standards in the organic ecosystem.",
      },
      {
        title: "INVESTMENT & INNOVATION",
        description: "Discover high-growth investment opportunities and explore cutting-edge, innovative solutions presented by dynamic startups in the wellness industry.",
      },
    ],
  },
  {
    key: "why-participate",
    name: "WhyParticipate",
    enabled: true,
    eyebrow: "WHY PARTICIPATE",
    titlePrimary: "Your Gateway to",
    titleSecondary: "Global Opportunities",
    description: "Bharat Organic Expo 2027 is a leading platform for organic products, natural health, fitness, Ayurveda, and sustainable innovation—bringing together top brands, buyers, investors, and industry leaders from India and worldwide.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Why Participate in Expo",
    buttonLabel: "BOOK A STALL",
    buttonHref: "/registration/book-a-stand",
    secondaryButtonLabel: "Download Brochure",
    secondaryButtonHref: "/download/invited card.pdf",
    tertiaryButtonLabel: "Why Exhibit?",
    tertiaryButtonHref: "/why-exhibit",
    keyPoint1: "Meet genuine buyers, distributors, retailers, and healthcare professionals",
    keyPoint2: "Generate high-quality B2B & B2C leads with faster business conversions",
    keyPoint3: "Launch new products with maximum visibility and market impact",
    keyPoint4: "Expand your dealer, distributor, franchise, and export network",
    keyPoint5: "Strengthen brand presence through live demos and media exposure",
    keyPoint6: "Connect with investors, CEOs, doctors, and key decision-makers",
    keyPoint7: "Achieve higher ROI with direct customer engagement and trust building",
  },
  {
    key: "conference-section",
    name: "ConferenceSection",
    enabled: true,
    eyebrow: "GLOBAL CONFERENCE & SEMINARS",
    titlePrimary: "Where Knowledge Meets",
    titleSecondary: "the Future of Organic",
    description: "Join expert-led sessions, panel discussions & thought leadership talks on the latest trends shaping the future of organic, natural and sustainable living.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Conference and Seminars",
    buttonLabel: "View Conference Schedule",
    buttonHref: "https://arogya.namogange.org/",
    keyPoint1: "Expert-led panel discussions & keynotes",
    keyPoint2: "Emerging trends in organic farming & retail",
    keyPoint3: "Sustainable business & growth strategies",
    stat1Title: "19 – 21",
    stat1Sub: "FEBRUARY 2027",
    stat2Title: "PRAGATI MAIDAN",
    stat2Sub: "NEW DELHI",
    stat3Title: "INSIGHTS. IDEAS.",
    stat3Sub: "IMPACT.",
    stat4Title: "50+ GLOBAL",
    stat4Sub: "SPEAKERS",
    stat5Title: "20+ KEY",
    stat5Sub: "SESSIONS",
  },
  {
    key: "expo-categories",
    name: "ExpoCategories",
    enabled: true,
    sectionTag: "Expo Categories",
    titleMain: "Explore Diverse",
    titleHighlight: "Exhibition Sectors",
    descriptionPrefix: "One Platform. Every Opportunity.",
    description: " Bharat Organic Expo brings together the entire organic ecosystem under one roof. Explore a wide range of sectors driving sustainable living, natural wellness, ethical production and global trade.",
    exploreText: "Explore",
    buttonText: "VIEW ALL CATEGORIES",
    buttonHref: "/exhibition-categories",
    items: [
      { title: "Organic Food & Beverages", description: "Wide range of certified organic foods, beverages, healthy snacks, grains, pulses, and ingredients.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "AYUSH, Ayurveda & Herba", description: "Ayurvedic medicines, herbal supplements, essential oils, teas, wellness products and holistic solutions.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "Organic Natural Farming", description: "Natural farming practices, organic cultivation methods, innovations and farm-to-market solutions.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "Organic Inputs, Seeds & Bio- Inputs", description: "Bio-fertilisers, organic manures, soil enhancers, pesticides and high-quality seeds.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "Dairy, Livestock & Allied", description: "Organic dairy products, livestock nutrition, animal health solutions and sustainable practices.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "Natural Beauty & Personal Care", description: "Herbal skincare, haircare, personal care and eco-friendly beauty products.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "Nutraceuticals & Functional Nutrition", description: "Dietary supplements, functional foods, immunity boosters and wellness nutrition products.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "Sustainable Packaging & Processing", description: "Eco-friendly, biodegradable, recyclable and sustainable packaging solutions.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "AgriTech, GreenTech & Innovation", description: "Innovative agri technologies, smart farming, irrigation, farm mechanization and digital solutions.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
      { title: "Certification, Export, Trade & Services", description: "Exporters, importers, trade associations and global business opportunities for organic products.", image: "", href: "/exhibition-categories", exploreText: "Explore" },
    ],
  },
  {
    key: "beyond-exhibition",
    name: "BeyondExhibition",
    enabled: true,
    sectionTag: "Global Organic Platform",
    titleMain: "Beyond An",
    titleHighlight: "Exhibition",
    description: "Join India's most powerful ecosystem for the organic industry. From high-impact B2B matchmaking and leadership summits to global networking, we provide everything you need to scale your business.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Conferences & Seminars",
    items: [
      { title: "GLOBAL CONFERENCES", description: "Gain actionable insights and explore emerging trends with global industry experts.", icon: "Users" },
      { title: "LEADERSHIP SUMMITS", description: "Engage with top policymakers and CEOs driving sustainable change.", icon: "Briefcase" },
      { title: "ORGANIC AWARDS", description: "Celebrate excellence and recognize pioneering brands in the organic sector.", icon: "Award" },
      { title: "STARTUP SHOWCASE", description: "Discover innovative startups pitching groundbreaking green technologies.", icon: "Lightbulb" },
      { title: "B2B MEETINGS", description: "Network with top distributors and build lasting global partnerships.", icon: "Handshake" },
      { title: "GLOBAL DELEGATION", description: "Connect with international delegates to expand your market reach.", icon: "Globe" },
      { title: "SUSTAINABILITY WORKSHOPS", description: "Learn practical implementations for zero-waste and eco-friendly practices.", icon: "Leaf" },
      { title: "PRODUCT LAUNCHPAD", description: "Witness the exclusive unveiling of the latest natural and organic innovations.", icon: "Store" },
    ],
  },
  {
    key: "sponsors-attend",
    name: "SponsorsAndAttend",
    enabled: true,
    titlePrefix: "WHY",
    titleHighlight: "ATTEND?",
    description: "Explore innovations, build connections and gain insights that drive better health and stronger businesses.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Why Attend Expo",
    buttonLabel: "REGISTER AS VISITOR!",
    buttonHref: "/registration/visitor-registration",
    feature1Title: "DISCOVER",
    feature1Desc: "Explore the latest organic products and eco-friendly services driving a sustainable future.",
    feature2Title: "LEARN",
    feature2Desc: "Attend seminars, workshops and live demos by organic agriculture and sustainability experts.",
    feature3Title: "CONNECT",
    feature3Desc: "Meet leading organic brands, manufacturers and sustainable suppliers under one roof.",
    feature4Title: "SOURCE",
    feature4Desc: "Find trusted organic suppliers, distributors and eco-franchise opportunities.",
    feature5Title: "GROW",
    feature5Desc: "Unlock new green business opportunities, partnerships and eco-investment possibilities.",
    feature6Title: "STAY AHEAD",
    feature6Desc: "Stay updated with market trends, conscious consumer insights and future organic industry developments.",
    keyPoint1: "Organic Distributors, Wholesalers & Retailers",
    keyPoint2: "Eco-Importers & Exporters",
    keyPoint3: "Ayurvedic Institutions & Wellness Centers",
    keyPoint4: "Nutritionists, Farmers & Wellness Experts",
    keyPoint5: "Gym Owners, Spa & Eco-Fitness Professionals",
    keyPoint6: "Organic Farming & Natural Product Buyers",
    keyPoint7: "Sustainable Packaging & Eco-friendly Brands",
    keyPoint8: "Investors, Franchise Seekers & Green Business",
    keyPoint9: "Supermarkets & Organic Grocery Chains",
    keyPoint10: "Health-Conscious Consumers & Eco-Enthusiasts",
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
    eyebrow: "Pre-Scheduled Meetings",
    titlePrefix: "BUYER-SELLER",
    titleHighlight: "MEET 2027",
    subtitle: "Bridging the gap between Organic Buyers and Sustainable Brands",
    description: "Join India's most exclusive B2B networking platform for the organic sector. Our highly curated Buyer-Seller Meet brings together certified farmers, eco-friendly product manufacturers, and top-tier global buyers. Pre-schedule your 1-on-1 meetings to secure bulk orders and forge lasting partnerships in the booming sustainable market.",
    buttonLabel: "Register Now",
    buttonHref: "/registration/buyer-registration",
    secondaryButtonLabel: "View Schedule",
    secondaryButtonHref: "/schedule",
    items: [
      { title: "VERIFIED ORGANIC BUYERS", description: "Pre-vetted buyers actively sourcing organic products." },
      { title: "1-ON-1 B2B MEETINGS", description: "Direct pre-scheduled matchmaking sessions." },
      { title: "LUCRATIVE GREEN OPPORTUNITIES", description: "Access high-value commercial deals." },
      { title: "EXPAND GLOBAL REACH", description: "Connect with international distributors and importers." },
    ],
  },
  {
    key: "testimonials-carousel",
    name: "TestimonialsCarousel",
    enabled: true,
    eyebrow: "FEEDBACK & REVIEWS",
    titlePrimary: "WHAT OUR EXHIBITORS & VISITORS SAY",
    titleSecondary: "ABOUT EXPO",
    subtitle: "Real Stories from Organic Producers, Buyers & Industry Leaders",
    description: "Hear how participating in Bharat Organic Expo transformed business growth and expanded network connections for past attendees.",
    items: [
      { name: "Rajesh Sharma", role: "Founder, GreenEarth Organics", quote: "Bharat Organic Expo delivered exceptional B2B buyer leads. We finalized supply contracts with two major retail chains during the event!", rating: 5 },
      { name: "Dr. Ananya Roy", role: "Research Director, AyurLife Products", quote: "The conference sessions and technical workshops were top-notch. It's the best platform in India to stay updated on organic certifications.", rating: 5 },
      { name: "Michael Vance", role: "International Importer, UK Organic Trade", quote: "We connected with over 30 certified organic suppliers in a single venue. The pre-scheduled Buyer-Seller Meet was incredibly well organized.", rating: 5 },
    ],
  },
  {
    key: "latest-insights",
    name: "LatestInsights",
    enabled: true,
    eyebrow: "NEWS & BLOGS",
    titlePrimary: "LATEST NEWS & INSIGHTS",
    titleSecondary: "2027",
    subtitle: "Stay Updated with Organic Market Trends, Articles & Event Announcements",
    description: "Read expert articles, industry growth reports, policy updates, and press releases curated by organic industry specialists.",
    items: [
      { title: "Bharat Organic Expo 2026: India's Organic Industry Comes Together", label: "Expo News", description: "Discover the brands, farmers, buyers and innovators bringing India's organic ecosystem together at Bharat Organic Expo 2026." },
      { title: "Why India's Organic Industry Is Ready for Its Next Growth Phase", label: "Industry Insight", description: "Explore the market trends, consumer demand and business opportunities shaping India's organic food and natural products sector." },
      { title: "Sustainable Farming Practices Shaping a Better Tomorrow", label: "Sustainable Future", description: "Discover regenerative agriculture, natural farming and sustainable practices helping create a healthier agricultural ecosystem." },
    ],
  },
  {
    key: "footer",
    name: "Footer & Social Links",
    enabled: true,
    description:
      "A global platform uniting over 500+ exhibitors from across the organic value chain, showcasing certified products, advanced agritech, sustainable practices, and the rich heritage of traditional wellness. Discover organic living with conferences and B2B opportunities.",
    logoImage: "http://localhost:4000/uploads/bharat-organic_footer/1789129240083-112323989.png",
    leafImage: "http://localhost:4000/uploads/bharat-organic_footer/1789129240457-21656484.png",
    downImage: "http://localhost:4000/uploads/bharat-organic_footer/1789129240816-597711504.png",
    organisedByLogo: "http://localhost:4000/uploads/bharat-organic_footer/1789129241128-849314126.png",
    bottomBannerImage: "http://localhost:4000/uploads/bharat-organic_footer/1789129242465-452827954.webp",
    websiteUrl: "www.bharatorganicexpo.com",
    contactAddress: "Hall 12, Pragati Maidan, New Delhi, India 110001",
    phoneNumber: "+91 96549 00525",
    conferenceHelpline: "+91 98183 53841",
    contactEmail: "info@namogangewellness.com",
    facebookUrl: "https://facebook.com/bharatorganicexpo",
    twitterUrl: "https://twitter.com/bharatorganic",
    linkedinUrl: "https://linkedin.com/company/bharatorganicexpo",
    instagramUrl: "https://instagram.com/bharatorganicexpo",
    youtubeUrl: "https://youtube.com/@bharatorganicexpo",
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
  return section;
}
