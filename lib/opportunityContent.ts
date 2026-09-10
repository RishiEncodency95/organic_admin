import { normalizeLandingSection, type LandingSectionContent } from "./landingContent";

export type OpportunitySectionContent = LandingSectionContent;

// ============================================================================
// 1. SPONSORSHIP OPPORTUNITIES PAGE SECTIONS
// ============================================================================
export const defaultSponsorshipSections: OpportunitySectionContent[] = [
  {
    key: "sponsorship-hero",
    name: "Sponsorship Hero & Key Stats",
    enabled: true,
    eyebrow: "SPONSORSHIP OPPORTUNITIES",
    title: "SPONSORSHIP OPPORTUNITIES",
    subtitle: "Partner. Promote. Make an Impact.",
    description: "Align your brand with India's Premier Organic Expo and connect with the right audience, build credibility and drive real impact.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    items: [
      { title: "8,000+", label: "BUSINESS VISITORS", icon: "Users" },
      { title: "200+", label: "EXHIBITORS", icon: "Store" },
      { title: "150+", label: "SPEAKERS", icon: "Presentation" },
      { title: "25+", label: "COUNTRIES", icon: "Globe" },
      { title: "UNLIMITED", label: "BUSINESS OPPORTUNITIES", icon: "Handshake" },
    ],
  },
  {
    key: "sponsorship-why",
    name: "Why Sponsor Feature Strip",
    enabled: true,
    eyebrow: "WHY SPONSOR",
    title: "Key Sponsorship Advantages",
    items: [
      { title: "Curated Meetings", label: "Relevant Connections", icon: "Users" },
      { title: "Verified Business", label: "Profiles", icon: "CheckCircle" },
      { title: "Industry Focused", label: "Networking", icon: "Target" },
      { title: "New Opportunities", label: "& Partnerships", icon: "ArrowUpRight" },
      { title: "Business Growth", label: "& Expansion", icon: "TrendingUp" },
    ],
  },
  {
    key: "sponsorship-packages",
    name: "Sponsorship Packages Grid",
    enabled: true,
    eyebrow: "OUR SPONSORSHIP PACKAGES",
    title: "OUR SPONSORSHIP PACKAGES",
    description: "Choose the package that best suits your brand goals",
    bottomStatement: "Packages can be customized as per your branding and engagement objectives.",
    items: [
      {
        title: "PLATINUM SPONSOR",
        label: "(Exclusive)",
        val: "₹10,00,000",
        color: "#1e40af",
        buttonLabel: "ENQUIRE NOW",
        buttonHref: "/contact",
        description: "Premium logo placement on all event collaterals | Speaking opportunity (15 minutes) | Stall space (24 sqm) | Branding on stage backdrop | Full page ad in show catalogue | 10 delegate passes | Social media & website recognition | Logo on visitor pre-registration emails",
      },
      {
        title: "GOLD SPONSOR",
        label: "(Limited)",
        val: "₹5,00,000",
        color: "#d97706",
        buttonLabel: "ENQUIRE NOW",
        buttonHref: "/contact",
        description: "Logo on all major collaterals | Speaking opportunity (10 minutes) | Stall space (18 sqm) | Half page ad in show catalogue | 6 delegate passes | Social media & website recognition | Logo on selected emailers",
      },
      {
        title: "SILVER SPONSOR",
        label: "(Limited)",
        val: "₹3,00,000",
        color: "#6b7280",
        buttonLabel: "ENQUIRE NOW",
        buttonHref: "/contact",
        description: "Logo on major collaterals | Stall space (12 sqm) | Quarter page ad in show catalogue | 4 delegate passes | Social media & website recognition",
      },
      {
        title: "ASSOCIATE SPONSOR",
        label: "(Multiple)",
        val: "₹1,50,000",
        color: "#2e7d32",
        buttonLabel: "ENQUIRE NOW",
        buttonHref: "/contact",
        description: "Logo on event website | Stall space (9 sqm) | Listing in show catalogue | 2 delegate passes | Social media recognition",
      },
      {
        title: "SUPPORTING SPONSOR",
        label: "(Multiple)",
        val: "₹75,000",
        color: "#b45309",
        buttonLabel: "ENQUIRE NOW",
        buttonHref: "/contact",
        description: "Logo on event website | Listing in show catalogue | 1 delegate pass",
      },
    ],
  },
  {
    key: "sponsorship-branding-impact",
    name: "Other Branding & Maximize Impact",
    enabled: true,
    eyebrow: "BRANDING & IMPACT",
    title: "Other Branding Opportunities & Brand Impact",
    subtitle: "Gain visibility across multiple platforms",
    buttonLabel: "LET'S CREATE IMPACT TOGETHER",
    buttonHref: "/contact",
    items: [
      { title: "Lanyard Sponsor", icon: "IdCard" },
      { title: "Charging Station Sponsor", icon: "Plug" },
      { title: "Badge Sponsor", icon: "Contact" },
      { title: "Wi-Fi Sponsor", icon: "Wifi" },
      { title: "Delegate Kit Sponsor", icon: "Briefcase" },
      { title: "Conference Session Sponsor", icon: "Mic" },
      { title: "Visitor Bag Sponsor", icon: "ShoppingBag" },
      { title: "Award Sponsor", icon: "Trophy" },
      { title: "Refreshment Sponsor", icon: "Coffee" },
      { title: "Hall / Zone Sponsor", icon: "MapPin" },
      { title: "Event Website", icon: "Globe" },
      { title: "Email Campaigns", icon: "Mail" },
      { title: "Social Media", icon: "Share2" },
      { title: "On-site Branding", icon: "Building2" },
      { title: "Press Coverage", icon: "Newspaper" },
      { title: "Print & Digital Media", icon: "FileText" },
      { title: "Signage & Hoardings", icon: "Presentation" },
      { title: "Visitor Promotions", icon: "Megaphone" },
    ],
  },
  {
    key: "sponsorship-cta",
    name: "Sponsorship Contact CTA",
    enabled: true,
    eyebrow: "GET IN TOUCH",
    title: "Ready to Become a Sponsor?",
    description: "Contact our team to discuss customized sponsorship packages tailored to your brand goals.",
    buttonLabel: "Contact Us Now",
    buttonHref: "/contact",
  },
];

// ============================================================================
// 2. E-PROMOTION WEB OPPORTUNITIES PAGE SECTIONS
// ============================================================================
export const defaultEPromotionSections: OpportunitySectionContent[] = [
  {
    key: "epromotion-hero",
    name: "E-Promotion Hero Banner & Stats",
    enabled: true,
    eyebrow: "E-PROMOTION OPPORTUNITIES",
    title: "E-PROMOTION OPPORTUNITIES",
    subtitle: "Promote. Engage. Inspire.",
    description: "Maximize your brand visibility and connect with a highly targeted audience before, during and after the event.",
    items: [
      { title: "8,000+", label: "BUSINESS VISITORS", icon: "Users" },
      { title: "200+", label: "EXHIBITORS", icon: "Store" },
      { title: "150+", label: "SPEAKERS", icon: "Presentation" },
      { title: "25+", label: "COUNTRIES", icon: "Globe" },
      { title: "UNLIMITED", label: "BUSINESS OPPORTUNITIES", icon: "Handshake" },
    ],
  },
  {
    key: "epromotion-band",
    name: "E-Promotion Band Features",
    enabled: true,
    eyebrow: "E-PROMOTIONAL HIGHLIGHTS",
    title: "Digital & Media Reach",
    items: [
      { title: "High-Impact Digital Reach", label: "Targeted Audience", icon: "Globe" },
      { title: "Direct Email Campaigns", label: "Opt-In Subscribers", icon: "Mail" },
      { title: "Social Media Spotlights", label: "Multi-Platform Coverage", icon: "Share2" },
      { title: "Website Banner Ads", label: "Prime Visibility", icon: "Building2" },
    ],
  },
  {
    key: "epromotion-why",
    name: "Why E-Promote",
    enabled: true,
    eyebrow: "WHY CHOOSE E-PROMOTION",
    title: "WHY E-PROMOTE WITH US?",
    subtitle: "KEY BENEFITS",
    description: "Our e-promotion solutions are designed to give your brand unmatched visibility to a highly engaged and relevant audience across multiple digital touchpoints.",
    bottomStatement: "CUSTOM PACKAGES AVAILABLE: We offer customized e-promotion solutions tailored to your marketing goals and budget.",
    buttonLabel: "LET'S PROMOTE TOGETHER",
    buttonHref: "/contact",
    items: [
      { title: "High Brand Visibility", description: "Maximize your online exposure across event web portals and email campaigns." },
      { title: "Targeted Audience Reach", description: "Direct access to organic trade buyers, FPOs, and health enthusiasts." },
      { title: "Increase Brand Credibility", description: "Position your company alongside leading sustainable organic brands." },
      { title: "Drive Website Traffic & Leads", description: "High-converting links driving direct visitor traffic to your website." },
      { title: "Stronger ROI & Engagement", description: "Measurable digital campaigns ensuring optimal return on marketing investment." },
    ],
  },
  {
    key: "epromotion-opportunities",
    name: "E-Promotion Packages & Options",
    enabled: true,
    eyebrow: "OUR E-PROMOTION OPPORTUNITIES",
    title: "OUR E-PROMOTION OPPORTUNITIES",
    description: "Explore digital marketing slots to boost your event presence.",
    buttonLabel: "ENQUIRE NOW",
    buttonHref: "/contact",
    items: [
      {
        title: "EMAIL CAMPAIGN BANNER",
        description: "Place your banner in our pre-show email campaigns sent to our database of industry professionals.",
        meta: "High open rates | Direct brand exposure | Clickable to your website",
      },
      {
        title: "NEWSLETTER SPONSORSHIP",
        description: "Feature your banner in our monthly newsletters.",
        meta: "Strong brand recall | Targeted industry reach | Multiple placements",
      },
      {
        title: "WEBSITE BANNER ADVERTISING",
        description: "Display your banner on our website across high traffic pages.",
        meta: "Prime visibility | Multiple banner sizes | Link to your website",
      },
      {
        title: "SOCIAL MEDIA PROMOTION",
        description: "Get featured across our social media platforms before, during & after the event.",
        meta: "Facebook, LinkedIn, Instagram, Twitter, YouTube | High engagement | Wide reach",
      },
      {
        title: "SPONSOR EMAIL FOOTER/BANNER",
        description: "Your banner in the footer section of important event emails.",
        meta: "Consistent brand visibility | Cost-effective | Wide exposure",
      },
      {
        title: "DEDICATED EMAILER",
        description: "Stand out with a dedicated emailer sent to our verified database.",
        meta: "100% brand focus | High engagement | Detailed presentation",
      },
      {
        title: "DIGITAL PARTNERSHIP",
        description: "Associate as our Digital Partner and get premium visibility across all digital channels.",
        meta: "Branding on all digital platforms | Exclusive recognition | Lead generation benefits",
      },
      {
        title: "WEBINAR & VIRTUAL SESSION SPONSORSHIP",
        description: "Sponsor pre-event webinars and virtual sessions.",
        meta: "Thought leadership | Direct interaction | Lead capture",
      },
    ],
  },
];

// ============================================================================
// 3. PARTNERSHIP & COLLABORATION PAGE SECTIONS
// ============================================================================
export const defaultPartnershipPageSections: OpportunitySectionContent[] = [
  {
    key: "partnership-page-hero",
    name: "Partnership Hero & Key Metrics",
    enabled: true,
    eyebrow: "PARTNERSHIP / COLLABORATION",
    title: "Let's Grow Organic. Together.",
    subtitle: "Partner with Bharat Organic Expo 2027 and be a part of India's leading platform for organic business, innovation, wellness and sustainability.",
    date: "19 – 21 February 2027",
    location: "Bharat Mandapam, New Delhi",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    items: [
      { title: "8,000+", label: "VISITORS / DELEGATES", icon: "Users" },
      { title: "200+", label: "EXHIBITORS", icon: "Store" },
      { title: "1,000+", label: "GLOBAL BUYERS", icon: "Globe" },
      { title: "65+", label: "EXPERT SPEAKERS", icon: "UserCheck" },
      { title: "B2B", label: "MEETINGS", icon: "Briefcase" },
    ],
  },
  {
    key: "partnership-page-opportunities",
    name: "Partnership Categories & Benefits Grid",
    enabled: true,
    eyebrow: "COLLABORATION CATEGORIES",
    title: "PARTNERSHIP OPPORTUNITIES",
    subtitle: "Our Partner Categories & Benefits",
    description: "Choose a category that fits your business goals and unlock exclusive advantages.",
    items: [
      {
        title: "HOTEL & STAY PARTNER",
        num: "01",
        href: "/partnership/hotel-stay-partner",
        description: "Brand visibility on official platforms | Direct access to exhibitors & delegates | Priority partner listing | Business inquiries & repeat bookings | Exclusive partner rates",
      },
      {
        title: "TRAVEL PARTNER",
        num: "02",
        href: "/partnership/travel-partner",
        description: "Featured as official travel partner | Exposure to global exhibitors & buyers | Lead generation opportunities | Association with premium event | Referral business opportunities",
      },
      {
        title: "STALL DESIGN & FABRICATION",
        num: "03",
        href: "/partnership/stall-design-partner",
        description: "Official branding on event collaterals | High visibility at venue | Access to exhibitors for stall needs | Repeat business potential | Showcase portfolio to global brands",
      },
      {
        title: "LOGISTICS PARTNER",
        num: "04",
        href: "/partnership/logistics-partner",
        description: "Listed as official logistics partner | International partner recognition | Continuous business opportunities | Access to exhibitors logistics needs | Long-term contracts",
      },
      {
        title: "PRINTING & BRANDING",
        num: "05",
        href: "/partnership/printing-branding-partner",
        description: "Branding across event materials | On-site branding opportunities | High footfall audience visibility | Year-round referrals | Association with globally recognized event",
      },
      {
        title: "MANPOWER SUPPLY PARTNER",
        num: "06",
        href: "/partnership/manpower-supply-partner",
        description: "Recognition as manpower supply partner | Networking with delegates & exhibitors | Brand exposure at venue | Long-term collaboration opportunities | Enhance brand credibility",
      },
    ],
  },
  {
    key: "partnership-page-why",
    name: "Why Partner With Us & Key Benefits",
    enabled: true,
    eyebrow: "WHY PARTNER",
    title: "WHY PARTNER WITH BHARAT ORGANIC EXPO 2027?",
    subtitle: "KEY BENEFITS",
    description: "Connect with a highly targeted audience, build brand trust and showcase your expertise to thousands of visitors, industry leaders and decision makers.",
    items: [
      { title: "Build Brand Trust", description: "Establish authority and credibility in the organic sector.", icon: "Shield" },
      { title: "Generate Quality Leads", description: "Direct connections with decision makers & high-value trade buyers.", icon: "MapPin" },
      { title: "Expand Business Network", description: "Connect with international delegations & industry leaders.", icon: "Network" },
      { title: "Long-term Brand Value", description: "Sustained brand presence before, during & after the expo.", icon: "ClipboardList" },
      { title: "High Brand Visibility", description: "Prominent logo placement across all event media & venue.", icon: "Eye" },
      { title: "Targeted Audience Reach", description: "Engage thousands of active buyers and industry professionals.", icon: "Users" },
      { title: "Increase Brand Credibility", description: "Official endorsement & high-trust association.", icon: "ShieldCheck" },
      { title: "Drive Website Traffic & Leads", description: "Digital referral traffic through portal & social campaigns.", icon: "TrendingUp" },
      { title: "Stronger ROI & Engagement", description: "Maximised commercial outcomes and long-term partnerships.", icon: "Award" },
    ],
  },
  {
    key: "partnership-page-enquiry",
    name: "Partnership Enquiry Form",
    enabled: true,
    eyebrow: "EXPRESS INTEREST",
    title: "Submit Partnership Enquiry",
    subtitle: "Talk to Partnership Desk",
    description: "Submit your proposal details and our team will get in touch with you shortly.",
    buttonLabel: "Submit Proposal",
    items: [
      { title: "Phone", description: "+91 96549 00525 / +91 11 1234 5678", icon: "Phone" },
      { title: "Email", description: "info@namogangewellness.com", icon: "Mail" },
      { title: "Office Location", description: "Namo Gange Trust, New Delhi, India", icon: "MapPin" },
    ],
  },
];

export function mergeSponsorshipSections(sections?: OpportunitySectionContent[]): OpportunitySectionContent[] {
  if (!sections?.length) return defaultSponsorshipSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultSponsorshipSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export function mergeEPromotionSections(sections?: OpportunitySectionContent[]): OpportunitySectionContent[] {
  if (!sections?.length) return defaultEPromotionSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultEPromotionSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export function mergePartnershipPageSections(sections?: OpportunitySectionContent[]): OpportunitySectionContent[] {
  if (!sections?.length) return defaultPartnershipPageSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPartnershipPageSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}
