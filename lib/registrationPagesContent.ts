import { LandingSectionContent } from "./landingContent";

// 1. BOOK A STALL PAGE SECTIONS
export const defaultBookAStandSections: LandingSectionContent[] = [
  {
    key: "book-stand-hero",
    name: "Book a Stall Hero",
    enabled: true,
    eyebrow: "EXHIBITION STALL BOOKING",
    title: "Book Your Exhibition Stand",
    description: "Showcase your organic products & innovations to 15,000+ industry professionals—fill the form and get a customized stall for your brand.",
  },
  {
    key: "book-stand-banner",
    name: "Global Platform Features",
    enabled: true,
    items: [
      { title: "Global Platform", description: "Uniting the organic, natural, and sustainable industries", icon: "Globe" },
      { title: "Trusted Brands", description: "Connect with India's top organic brands & manufacturers", icon: "ShieldCheck" },
      { title: "Targeted Audience", description: "Engage with qualified buyers, distributors & decision makers", icon: "Target" },
      { title: "Business Growth", description: "Expand your market & accelerate your organic growth", icon: "TrendingUp" },
    ],
  },
  {
    key: "book-stand-premier-edition",
    name: "Premier Edition Info",
    enabled: true,
    eyebrow: "Premier Edition of",
    title: "Bharat Organic Expo 2027 (Global Edition)",
    description: "Step into Bharat Organic Expo 2027, a leading global platform uniting the organic, natural, and sustainable industries under one roof. Whether you are discovering eco-friendly innovations or a corporate buyer seeking meaningful business connections, Organic Expo offers a high-value, curated experience with India's most trusted organic brands and manufacturers.",
    subtitle: "Register now and be part of a powerful global movement in sustainable living.",
  },
  {
    key: "book-stand-categories",
    name: "Choose Exhibitor Category",
    enabled: true,
    title: "Choose Exhibitor Category",
    items: [
      { title: "Domestic Exhibitor", description: "For exhibitors based in India", buttonLabel: "Register Now" },
      { title: "International Exhibitor", description: "For exhibitors based outside India", buttonLabel: "Register Now" },
    ],
  },
];

// 2. VISITOR REGISTRATION PAGE SECTIONS
export const defaultVisitorRegistrationSections: LandingSectionContent[] = [
  {
    key: "visitor-hero",
    name: "Visitor Registration Hero",
    enabled: true,
    eyebrow: "VISITOR REGISTRATION",
    title: "REGISTER AS A VISITOR",
    subtitle: "Free Pass for Trade Professionals & Organic Enthusiasts",
    description: "Get instant badge access to India's largest organic expo, conferences, and live product showcases.",
    date: "19–21 February 2027",
    location: "Bharat Mandapam, New Delhi",
    buttonLabel: "GET YOUR PASS NOW",
  },
  {
    key: "visitor-types",
    name: "Visitor Registration Types",
    enabled: true,
    title: "SELECT YOUR VISITOR CATEGORY",
    items: [
      { title: "General Trade Visitor", description: "For retailers, distributors, organic store owners, and industry professionals." },
      { title: "Corporate / Bulk Delegation", description: "For companies sending 3 or more representatives." },
      { title: "International Visitor", description: "For overseas buyers, international trade delegates, and media." },
    ],
  },
];

// 3. BUYER REGISTRATION PAGE SECTIONS
export const defaultBuyerRegistrationSections: LandingSectionContent[] = [
  {
    key: "buyer-hero",
    name: "Buyer Registration Hero",
    enabled: true,
    eyebrow: "BHARAT ORGANIC EXPO",
    title: "REGISTER AS A BUYER",
    subtitle: "Discover. Source. Connect.",
    description: "Exclusive portal for verified bulk buyers, procurement heads, exporters, and retail chain buyers.",
    date: "19–21 February 2027",
    location: "PRAGATI MAIDAN, NEW DELHI",
    buttonLabel: "REGISTER AS A BUYER",
  },
  {
    key: "buyer-categories",
    name: "Buyer Categories & Benefits",
    enabled: true,
    title: "WHO CAN REGISTER AS A BUYER?",
    items: [
      { title: "Domestic Trade Buyers", description: "Supermarket chains, e-commerce platforms, organic distributors." },
      { title: "International Buyers", description: "Global importers, distribution houses, organic trade agencies." },
      { title: "VIP Buyer Privileges", description: "Access to VIP Lounge, pre-booked 1-on-1 meetings, complimentary catalog." },
    ],
  },
];

// 3B. DELEGATE REGISTRATION PAGE SECTIONS
export const defaultDelegateRegistrationSections: LandingSectionContent[] = [
  {
    key: "delegate-hero",
    name: "Delegate Registration Hero",
    enabled: true,
    eyebrow: "BHARAT ORGANIC EXPO",
    title: "REGISTER AS A DELEGATE",
    subtitle: "Access All 3 Days of Conferences, Seminars & Networking",
    description: "Join international speakers, government officials, research scientists, and industry leaders at the Organic World Conference 2027.",
    date: "19–21 February 2027",
    location: "PRAGATI MAIDAN, NEW DELHI",
    buttonLabel: "REGISTER AS DELEGATE NOW",
  },
  {
    key: "delegate-benefits",
    name: "Delegate Pass Privileges & Inclusions",
    enabled: true,
    title: "DELEGATE PASS INCLUSIONS",
    items: [
      { title: "All Conference Sessions", description: "Entry to keynotes, panel discussions, and technical paper presentations." },
      { title: "Official Delegate Kit & Catalog", description: "Receive official conference bag, proceedings, and exhibitor directory." },
      { title: "Networking Lunch & Refreshments", description: "Complimentary lunch and high-tea on all 3 event days." },
    ],
  },
];

// 4. TERMS & CONDITIONS PAGE SECTIONS
export const defaultTermsAndConditionsSections: LandingSectionContent[] = [
  {
    key: "terms-page",
    name: "Terms & Conditions Header & Content",
    enabled: true,
    title: "TERMS & CONDITIONS",
    subtitle: "Official Regulations & Stall Booking Policy",
    description: "Please read the following terms and conditions carefully before booking your stall or registering for Bharat Organic Expo 2027.",
  },
];

// 5. PRIVACY POLICY PAGE SECTIONS
export const defaultPrivacyPolicySections: LandingSectionContent[] = [
  {
    key: "privacy-page",
    name: "Privacy Policy Header & Content",
    enabled: true,
    title: "PRIVACY POLICY",
    subtitle: "Data Protection & Privacy Notice",
    description: "We are committed to safeguarding your personal data and privacy across all our web platforms and registration forms.",
  },
];

// 6. REFUND POLICY PAGE SECTIONS
export const defaultRefundPolicySections: LandingSectionContent[] = [
  {
    key: "refund-page",
    name: "Refund Policy Header & Content",
    enabled: true,
    title: "REFUND & CANCELLATION POLICY",
    subtitle: "Booking Cancellation & Fee Refund Guidelines",
    description: "Guidelines detailing stall cancellation terms, non-refundable deposit conditions, and refund processing timelines.",
  },
];
