export interface LandingSectionItem {
  title?: string;
  label?: string;
  subtitle?: string;
  value?: string;
  description?: string;
  image?: string;
  href?: string;
  buttonLabel?: string;
  buttonHref?: string;
  features?: string[];
  secondaryImage?: string;
  tertiaryImage?: string;
  quaternaryImage?: string;
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
  slides?: LandingHeroSlide[];
  items?: LandingSectionItem[];
}

export const defaultLandingSections: LandingSectionContent[] = [
  {
    key: "hero",
    name: "Hero Slider",
    enabled: true,
    eyebrow: "Moksha Sewa",
    title: "Dignity in Every Final Journey",
    subtitle: "Supporting weaker families with compassionate last-rites assistance.",
    description: "Moksha Sewa team helping a helpless family with a dignified final journey",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164944/moksha-sewa/hero-images/dignity-in-every-final-journey-bg.png",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164952/moksha-sewa/hero-images/image6.png",
    initiativeLabel: "An Initiative of Namo Gange Trust",
    buttonLabel: "Request Sewa Help",
    buttonHref: "/request-help",
      supportTitle: "We are here to support with care, respect and compassion.",
      supportDescription: "You are not alone. We are with you.",
      regionTitle: "Delhi • Ghaziabad • Noida",
      regionDescription: "Currently serving with care in",
    secondaryButtonLabel: "Support This Mission",
    secondaryButtonHref: "/donation",
    items: [
      { value: "24/7", label: "Helpline Guidance" },
      { value: "Delhi • Ghaziabad • Noida", label: "Launch Region" },
      { value: "Verified", label: "Case-Based Support" },
      { value: "Subject", label: "To Eligibility" },
    ],
  },
  {
    key: "who-we-help",
    name: "Who We Help",
    enabled: true,
    title: "Who We Help",
    items: [
      {
        title: "Unclaimed & Legally\nAuthorised Cases",
        description: "We assist with respectful last-rites after completion of all required police, hospital and authority formalities.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164996/moksha-sewa/assets/about-optimized/cremation-ritual.webp",
      },
      {
        title: "People Without Family\nor Support",
        description: "For those who have no one to stand beside them, we ensure a dignified and respectful final journey.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165001/moksha-sewa/assets/about-optimized/family-support.webp",
      },
      {
        title: "Economically Weaker\nFamilies",
        description: "Verified support for eligible families who are unable to manage essential last-rites arrangements.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165012/moksha-sewa/assets/about-optimized/prayer-hall.webp",
      },
    ],
  },
  {
    key: "practical-support",
    name: "Practical Sewa Support",
    enabled: true,
    eyebrow: "Our Sewa",
    title: "Essential Support for a\nDignified Final Journey",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    sloganTitle: "Together, We Serve with Dignity",
    immediateHelpTitle: "Need Immediate Help?",
    immediateHelpDescription: "Our team is available 24x7 to support you.",
    supportNowLabel: "Support Now",
    supportMissionTitle: "Support Our Mission",
    supportMissionDescription: "Your support can bring dignity to many final journeys.",
    description:
      "Moksha Sewa ensures that every individual—regardless of their circumstances—receives a respectful and dignified farewell with complete care and compassion.",
    items: [
      { title: "Ambulance &\nFinal Journey Van", description: "Respectful transport for the\ndeceased from hospital/home\nto cremation ground.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165188/moksha-sewa/assets/how-we-help/one.png", features: ["24x7 Availability", "Safe & Timely Transport", "Trained & Verified Partners"] },
      { title: "Cremation\nCoordination", description: "Support in arranging cremation\nground coordination and\nrequired formalities.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165198/moksha-sewa/assets/how-we-help/two.png", features: ["Cremation Ground Support", "Essential Arrangements", "Clean & Respectful Process"] },
      { title: "Ritual &\nPriest Support", description: "Priest, wood, cloth, flowers\nand all ritual essentials\narranged.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165189/moksha-sewa/assets/how-we-help/pandit.png", features: ["Experienced Priests", "Ritual Essentials", "As Per Tradition & Customs"] },
      { title: "Family &\nOn-Ground Support", description: "Guidance, volunteers and\ndocumentation assistance\nat every step.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165195/moksha-sewa/assets/how-we-help/three.png", features: ["Volunteer Support", "Documentation Help", "Emotional Support"] },
    ],
  },
  {
    key: "family-need",
    name: "Family Need",
    enabled: true,
    eyebrow: "Practical Sewa Support",
    title: "When a Family Needs Help,\nWe Arrange the Essentials",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165242/moksha-sewa/assets/manish.jpg",
    description:
      "During a difficult final journey, families may need more than arrangements—they may need guidance, coordination and someone willing to stand beside them.",
    items: [
      { title: "Verified Support", description: "For eligible cases" },
      { title: "Guided Assistance", description: "With sensitivity\nand respect" },
      { title: "Local Coordination", description: "Across the current\nservice region" },
    ],
  },
  {
    key: "how-sewa-works",
    name: "How Sewa Works",
    enabled: true,
    eyebrow: "How Sewa Works",
    title: "Support With Care, Verification & Responsibility",
    description: "A simple process. Compassionate support. Dignified final journey.",
    items: [
      { value: "01", title: "Request Sewa Help", description: "Share the basic\ncase details." },
      { value: "02", title: "Case Verification", description: "Our team reviews the need\nand applicable requirements." },
      { value: "03", title: "Sewa Coordination", description: "Required assistance is\ncoordinated based on\navailability." },
      { value: "04", title: "Dignified Final Journey", description: "The family/case receives\ncompassionate on-ground\nassistance." },
    ],
  },
  {
    key: "compassion",
    name: "Compassion Section",
    enabled: true,
    eyebrow: "CREMATION & LAST RITES SUPPORT",
    title: "When a Family Needs Help\nWe Arrange the Essentials",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165085/moksha-sewa/assets/chatgpt.png",
      phoneLabel: "Call for Help",
      phoneNumber: "9220147229",
      secondaryTitle: "Priest Support",
      secondaryDescription: "Experienced & Verified",
    description:
      "At Moksha Sewa, we support economically weaker families and legally authorised unclaimed cases with practical final-rites coordination. Our team helps coordinate transport, ritual guidance, essential materials, relief support and on-ground volunteers after verification and required formalities.",
    buttonLabel: "Request Sewa Support",
    buttonHref: "/request-help",
  },
  {
    key: "humanitarian-commitment",
    name: "Our Humanitarian Commitment",
    enabled: true,
    eyebrow: "Our Humanitarian Commitment",
    title: "No One Should Leave\nThis World Without Dignity.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165202/moksha-sewa/assets/image.png",
    items: [
      { title: "Legally Authorised Cases", description: "We support only legally authorised unclaimed cases." },
      { title: "Dignified Final Rites", description: "Every soul deserves a respectful and dignified farewell." },
      { title: "Compassionate Human Presence", description: "Our volunteers stand with care, respect and humanity." },
    ],
  },
  {
    key: "sewa-stories",
    name: "Sewa Stories",
    enabled: true,
    title: "Sewa Stories",
    items: [
      { title: "ECONOMICALLY WEAKER FAMILY", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165001/moksha-sewa/assets/about-optimized/family-support.webp" },
      { title: "ELDERLY WITHOUT SUPPORT", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165202/moksha-sewa/assets/image.png" },
      { title: "UNCLAIMED BODY CASE", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164996/moksha-sewa/assets/about-optimized/cremation-ritual.webp" },
    ],
  },
  {
    key: "support-matters",
    name: "Why Your Support Matters",
    enabled: true,
    eyebrow: "Why Your Support Matters",
    title: "A Dignified Farewell\nShould Never Depend on\na Family's Ability to Pay.",
    subtitle: "Your contribution helps extend verified last-rites assistance where support is genuinely needed.",
    description:
      "Your support helps us coordinate essential assistance, mobilise volunteers and stand beside eligible families during a difficult final journey.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164962/moksha-sewa/hero-images/support-mission-ghat.png",
    buttonLabel: "Support This Mission",
    buttonHref: "/donation",
  },
  {
    key: "join-mission",
    name: "Join The Mission",
    enabled: true,
    eyebrow: "Join The Mission",
    title: "There Is a Place for Everyone in Sewa",
    description:
      "Every act of kindness helps us bring dignity, compassion and support to those who need it most in their final journey.",
    items: [
      { title: "Give in Sewa", label: "Donate", description: "Help extend dignified final-rites\nsupport to eligible cases.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165146/moksha-sewa/assets/donation-images/donate-sewa.png", href: "/donation" },
      { title: "Serve in Sewa", label: "Volunteer", description: "Give your valuable time, presence,\nand compassionate support.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165150/moksha-sewa/assets/donation-images/volunteer-sewa.png", href: "/volunteer/register" },
      { title: "Partner in Sewa", label: "Partner", description: "CSR, institutions, hospitals, and\nvarious community partners.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165148/moksha-sewa/assets/donation-images/partner-sewa.png", href: "/partnership" },
    ],
  },
  {
    key: "support-in-action",
    name: "Your Support In Action",
    enabled: true,
    eyebrow: "Your Support In Action",
    title: "Helping Complete a Final Journey With Dignity",
    buttonLabel: "Support Our Mission",
    buttonHref: "/donation",
    items: [
      { title: "Final Journey\nTransport", description: "Safe and respectful transport of the departed to the cremation facility.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165185/moksha-sewa/assets/how-we-help/five.png" },
      { title: "Cremation\nCoordination", description: "Coordinating with crematoriums and ensuring a smooth cremation process.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165187/moksha-sewa/assets/how-we-help/four.png" },
      { title: "Ritual\nEssentials", description: "Providing essential items required for the final rites and rituals.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165018/moksha-sewa/assets/about-optimized/samagri.webp" },
      { title: "Priest & Ritual\nGuidance", description: "Arranging experienced priests who guide and conduct the final rites with respect.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165010/moksha-sewa/assets/about-optimized/pandit-ji.webp" },
      { title: "On-Ground\nSupport", description: "Our team stands beside the family, providing support and care at every step.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165001/moksha-sewa/assets/about-optimized/family-support.webp" },
    ],
  },
  {
    key: "trust-transparency",
    name: "Trust & Transparency",
    enabled: true,
    eyebrow: "Sewa With Responsibility",
    title: "Trust &\nTransparency",
    description: "Our commitment to transparency, integrity and responsible service.",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165176/moksha-sewa/assets/footer-moksha-mark.png",
    partnerLogoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164958/moksha-sewa/hero-images/namo-gange-logo.webp",
    secondaryLogoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164957/moksha-sewa/hero-images/namo-gange-logo.png",
    secondaryImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165060/moksha-sewa/assets/about-reference/story-ghat-temple.png",
    quote: "We believe in being open, accountable and answerable\nto all those who walk with us in this mission.",
    legalNotice: "Applicable registration / tax\ninformation will be displayed\nafter legal verification.",
    lowerTitle: "Transparency in every step.",
    lowerDescription: "Moksha Sewa follows responsible practices, transparency and applicable legal norms to ensure trust.",
    bottomStatement: "A mission of compassion. | A commitment to transparency. | A promise of accountability.",
    buttonLabel: "Know About The Trust",
    buttonHref: "/about",
    items: [
      { title: "About\nNamo Gange Trust", description: "Learn about our vision, mission, values, community purpose, commitment while staying connected." },
      { title: "Governance &\nPolicies", description: "Understand our governance, policies, ethical standards, accountability, and processes clearly." },
      { title: "Impact /\nReports", description: "Explore our impact, reports, case highlights, progress, outcomes and shared responsibility clearly." },
      { title: "Donation &\nRefund Policy", description: "Read about donations, fund use, refunds, policies, transparency and responsible management clearly." },
      { title: "SEWA", description: "Service with\ncompassion" },
      { title: "INTEGRITY", description: "Ethical actions,\nhonest intent" },
      { title: "TRANSPARENCY", description: "Open processes,\nclear communication" },
      { title: "ACCOUNTABILITY", description: "Answerable to all,\nalways improving" },
    ],
  },
  {
    key: "journey-glimpse",
    name: "Glimpse Of Journey",
    enabled: true,
    eyebrow: "Sewa In Action",
    title: "Moments of Compassion, Service & Dignity",
    buttonLabel: "View Sewa Gallery",
    buttonHref: "/mokshagallery",
    items: [
      { title: "On-Ground Sewa", description: "Compassionate support on the ground, ensuring every step of the journey is handled with care.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165453/moksha-sewa/assets/sewa/on_ground_image.png" },
      { title: "Volunteer Sewa", description: "Dedicated volunteers selflessly giving their time and energy to serve those in need.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165460/moksha-sewa/assets/sewa/voluteer_sewa_image.png" },
      { title: "Ritual Support", description: "Providing ritual essentials and guidance with dignity, respect and authenticity.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165457/moksha-sewa/assets/sewa/ritual_support_image.png" },
      { title: "Community Outreach", description: "Building awareness, extending care and supporting communities with empathy.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165451/moksha-sewa/assets/sewa/community_outreach_image.png" },
    ],
  },
  {
    key: "final-act",
    name: "One Final Act Of Humanity",
    enabled: true,
    eyebrow: "One Final Act of Humanity",
    title: "When No One Else Is There,\nHumanity Must Be.",
    description:
      "Stand with Moksha Sewa in helping ensure dignity, compassion and respect in the final journey of those we are able to support.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164960/moksha-sewa/hero-images/one-final-act-humanity.png",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165176/moksha-sewa/assets/footer-moksha-mark.png",
    partnerLogoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164958/moksha-sewa/hero-images/namo-gange-logo.webp",
    secondaryTitle: "Moksha Sewa",
    initiativeLabel: "A Namo Gange Trust Initiative",
    buttonLabel: "Request Sewa Help",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Support This Mission",
    secondaryButtonHref: "/donation",
  },
  {
    key: "faq",
    name: "FAQ",
    enabled: true,
    eyebrow: "Help & Information",
    title: "Frequently Asked Questions",
    description: "Find quick answers to common questions about Moksha Sewa, our services and how you can get involved.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165160/moksha-sewa/assets/faq/bg.png",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165236/moksha-sewa/assets/logo-moksha-seva.png",
    items: [
      {
        title: "Who can request Moksha Sewa support?",
        description:
          "Moksha Sewa support can be requested by families, authorised representatives, institutions and individuals who need assistance with last rites and related services.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165167/moksha-sewa/assets/faq/request.png",
      },
      {
        title: "Does Moksha Sewa assist with legally authorised unclaimed bodies?",
        description:
          "Yes. Subject to applicable legal permissions and local procedures, Moksha Sewa can assist with legally authorised unclaimed body cases.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165165/moksha-sewa/assets/faq/legally.png",
      },
      {
        title: "What cremation and last-rites assistance is available?",
        description:
          "Moksha Sewa provides assistance and coordination for cremation, transportation, essential last-rites arrangements and other support based on the circumstances.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165161/moksha-sewa/assets/faq/cremation.png",
      },
      {
        title: "Where is Moksha Sewa currently available?",
        description:
          "Moksha Sewa services are currently available in selected locations. Please contact the team to confirm availability in your area.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165173/moksha-sewa/assets/faq/where_is_moksha.png",
      },
      {
        title: "How can I become a volunteer?",
        description:
          "You can express your interest in volunteering by contacting the Moksha Sewa team and sharing your basic details and preferred area of support.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165172/moksha-sewa/assets/faq/volunteer.png",
      },
      {
        title: "How can I support Moksha Sewa through a donation?",
        description:
          "You can support Moksha Sewa through an authorised donation channel. Contact the organisation for current donation details and available donation options.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165169/moksha-sewa/assets/faq/support.png",
      },
    ],
  },
  {
    key: "footer",
    name: "Footer",
    enabled: true,
    eyebrow: "A Namo Gange Trust Initiative",
    title: "Moksha Sewa",
    subtitle: "Seva • Samman • Samarpan",
    description: "We stand with the forgotten, the unclaimed and the helpless to ensure every life's final journey is dignified, peaceful and respectful.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165175/moksha-sewa/assets/footer-ghat-sunset.png",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165176/moksha-sewa/assets/footer-moksha-mark.png",
    partnerLogoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165261/moksha-sewa/assets/namo-gange-logo.webp",
    secondaryImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165347/moksha-sewa/assets/request_support.webp",
    bottomStatement: "© 2026 Moksha Sewa. All Rights Reserved.",
    actionTitle: "Stand with dignity. Serve with compassion.",
    contactAddress: "Delhi • Ghaziabad • Noida, India",
    phoneNumber: "9220147229",
    contactEmail: "info@mokshasewa.org",
    availabilityText: "We are available\n24/7 for you",
    quickLinksTitle: "Quick Links",
    servicesTitle: "Our Services",
    initiativesTitle: "Our Initiatives",
    contactTitle: "Contact Us",
    requestTitle: "Request Support",
    requestDescription: "Share your email and our support team will contact you.",
    inputPlaceholder: "Your email address",
    submitLabel: "Send Request",
    submittedLabel: "Submitted",
    successMessage: "Thank you for reaching out. Our support team will contact you shortly.",
    secondaryButtonLabel: "Request Help",
    secondaryButtonHref: "/request-help",
    tertiaryButtonLabel: "Become a Volunteer",
    tertiaryButtonHref: "/volunteer/register",
    initiativeLabel: "An Initiative of Namo Gange Trust",
    buttonLabel: "Donate Now",
    buttonHref: "/donation",
    items: [
      { label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Gallery", href: "/mokshagallery" }, { label: "Blog", href: "/blog" }, { label: "Contact Us", href: "/contact" },
      { label: "Request Sewa Help", href: "/request-help" }, { label: "Transport Coordination", href: "/ambulanceservices" }, { label: "Ritual Material Support", href: "/furalservices" }, { label: "Priest Guidance", href: "/panditservices" }, { label: "Family Guidance", href: "/specialservices" }, { label: "Unclaimed Body Sewa", href: "/unclaimed-body-sewa" },
      { label: "Unclaimed Bodies Support", href: "/mortal-records" }, { label: "Volunteer Programme", href: "/volunteer/register" }, { label: "Awareness & Outreach", href: "/blog" },
      { title: "Compassion", description: "We serve with\nempathy and humanity." }, { title: "Dignity", description: "Every life is treated\nwith respect." }, { title: "Service", description: "We support every step\nof the final journey." }, { title: "Trust", description: "Transparent, accountable\nand responsible." }, { title: "Together", description: "United for a more\ncompassionate world." },
      { label: "Privacy Policy", href: "/privacy-policy" }, { label: "Terms & Conditions", href: "/terms" }, { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
  {
    key: "topbar",
    name: "Topbar",
    enabled: true,
    title: "Sewa Available in Delhi • Ghaziabad • Noida | 24×7 Last-Rites Assistance | Unclaimed & Needy Family Support",
    secondaryTitle: "Login",
    items: [
      { label: "User Login", href: "/login" },
      { label: "Admin Login", href: "admin" },
    ],
  },
  {
    key: "navbar",
    name: "Navbar",
    enabled: true,
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165236/moksha-sewa/assets/logo-moksha-seva.png",
    items: [
      { label: "Home", href: "/" }, { label: "About Us", href: "/about" }, { label: "Sewa & Support", href: "#services" },
      { label: "Ground Support", href: "/prayerhallservices" }, { label: "Support for Needy Families", href: "/specialservices" }, { label: "Ambulance & Body Transport", href: "/ambulanceservices" }, { label: "Ritual Material Support", href: "/furalservices" }, { label: "Priest & Ritual Guidance", href: "/panditservices" }, { label: "Unclaimed Body Sewa", href: "/unclaimed-body-sewa" },
      { label: "Our Work", href: "/mortal-records" }, { label: "Photo Gallery", href: "/mokshagallery" }, { label: "Videos", href: "/mokshavediogallery" },
      { label: "Join Us", href: "/volunteer/register" }, { label: "Become a Volunteer", href: "/volunteer/register" }, { label: "CSR Partnership", href: "/csr" }, { label: "Partner With Us", href: "/partnership" },
      { label: "Help & Information", href: "/request-help" }, { label: "How to Request Help", href: "/request-help" }, { label: "Blog & Awareness", href: "/blog" },
      { label: "Contact Us", href: "/contact" }, { label: "Request Help", href: "/request-help" }, { label: "Donate", href: "/donation" },
    ],
  },
];

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
