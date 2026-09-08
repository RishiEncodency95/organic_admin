import { normalizeLandingSection, type LandingSectionContent } from "./landingContent";
export type ExtraSectionContent = LandingSectionContent;
export const defaultServicesSections: ExtraSectionContent[] = [
  {
    key: "services-hero",
    name: "Services Hero",
    enabled: true,
    eyebrow: "Sewa & Support Services",
    title: "Comprehensive Final Journey Support With Care & Dignity",
    subtitle: "A humanitarian initiative of Namo Gange Trust.",
    description: "Providing compassionate, end-to-end assistance including hearse vans, priest coordination, funeral samagri, prayer hall arrangements, and family support.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164944/moksha-sewa/hero-images/dignity-in-every-final-journey-bg.png",
    buttonLabel: "Request Sewa Help",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Call Helpline",
    secondaryButtonHref: "tel:1800123456",
  },
  {
    key: "services-ambulance",
    name: "Ambulance & Hearse Van",
    enabled: true,
    eyebrow: "Transport Sewa",
    title: "Ambulance & Hearse Van Assistance",
    description: "24/7 dignified transport support across Delhi, Noida, Ghaziabad and NCR with trained drivers and hygienic vehicles.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165000/moksha-sewa/assets/about-optimized/existimage.png",
    buttonLabel: "Book Transport",
    buttonHref: "/request-help",
    items: [
      { title: "24/7 Availability", description: "Prompt response for urgent requirements." },
      { title: "Sanitised & Equipped", description: "Hygienic, respectful transport facilities." },
      { title: "Inter-City Movement", description: "State border clearance & long-distance transport." },
    ],
  },
  {
    key: "services-funeral",
    name: "Funeral Rites & Management",
    enabled: true,
    eyebrow: "Final Rites",
    title: "Dignified Funeral & Cremation Support",
    description: "Assistance with cremation ground bookings, wood or electric rites, and complete ritual management.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165060/moksha-sewa/assets/about-reference/story-ghat-temple.png",
    buttonLabel: "Learn More",
    buttonHref: "/contact",
    items: [
      { title: "Cremation Ground Slotting", description: "Coordination with electric & traditional ghats." },
      { title: "Complete Ritual Management", description: "Respectful execution as per traditions." },
    ],
  },
  {
    key: "services-pandit",
    name: "Vedic Pandit & Priest",
    enabled: true,
    eyebrow: "Spiritual Guidance",
    title: "Vedic Pandit & Priest Coordination",
    description: "Experienced Vedic priests to perform last rites, antim sanskar, and prayer ceremonies with utmost reverence.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165070/moksha-sewa/assets/about-reference/who-we-are-background-v2.png",
    items: [
      { title: "Vedic Rites", description: "Customary rituals conducted with sacred precision." },
      { title: "Multilingual Support", description: "Priests versed in regional traditions and languages." },
    ],
  },
  {
    key: "services-prayer-hall",
    name: "Prayer Hall & Samagri",
    enabled: true,
    eyebrow: "Arrangements",
    title: "Prayer Hall Booking & Samagri Kit",
    description: "Providing complete eco-friendly samagri kits and arranging prayer halls for shradhanjali or chautha.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165059/moksha-sewa/assets/about-reference/story-evening-ghat.png",
  },
  {
    key: "services-harsevan",
    name: "Harsevan & Transport Support",
    enabled: true,
    eyebrow: "Harsevan",
    title: "Harsevan Vehicle Support",
    description: "Specially dedicated vehicles for traditional carrying and respect during the procession.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165001/moksha-sewa/assets/about-optimized/family-support.webp",
  },
  {
    key: "services-decoration",
    name: "Funeral Floral Decoration",
    enabled: true,
    eyebrow: "Floral Tributes",
    title: "Floral & Vahan Decoration",
    description: "Thoughtfully designed floral tributes and vehicle decorations to honor the memory of the departed.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164983/moksha-sewa/assets/about-optimized/about-hero-new.webp",
  },
  {
    key: "services-calling-relatives",
    name: "Calling Relatives & Assistance",
    enabled: true,
    eyebrow: "Family Coordination",
    title: "Inform Relatives & Support Center",
    description: "Assisting bereaved families with broadcast notifications, venue guidance, and relative coordination.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165070/moksha-sewa/assets/about-reference/who-we-are-background-v2.png",
  },
  {
    key: "services-special",
    name: "Special Customized Services",
    enabled: true,
    eyebrow: "Custom Support",
    title: "Special Needs & Custom Assistance",
    description: "Tailored support for out-of-station families, legal documentation help, and emergency assistance.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165000/moksha-sewa/assets/about-optimized/existimage.png",
  },
];

export function mergeServicesSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultServicesSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultServicesSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 2. UNCLAIMED BODY PAGE SECTIONS
// ============================================================================
export const defaultUnclaimedBodySections: ExtraSectionContent[] = [
  {
    key: "unclaimed-hero",
    name: "Unclaimed Body Hero",
    enabled: true,
    eyebrow: "Unclaimed Body Sewa",
    title: "Ensuring Final Dignity\nFor Every Departed Soul",
    subtitle: "A Sacred Duty Undertaken By Moksha Sewa",
    description: "Standing for those who have no one. We perform final rites for authorised unclaimed bodies after strict police & legal verification.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164944/moksha-sewa/hero-images/dignity-in-every-final-journey-bg.png",
    buttonLabel: "Report Unclaimed Case",
    buttonHref: "/request-help",
  },
  {
    key: "unclaimed-what-is",
    name: "What Is Unclaimed Sewa",
    enabled: true,
    eyebrow: "Understanding The Mission",
    title: "Standing Beside The Unknown & Forgotten",
    description: "Every human life deserves a respectful farewell. Moksha Sewa coordinates with local police and hospital authorities to perform sacred rites.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164982/moksha-sewa/assets/about-optimized/a_mission.png",
    items: [
      { description: "Support proceeds only after the required verification and authorisation from the competent authority." },
      { description: "Police, hospital, municipal and legal procedures must be completed wherever applicable." },
      { description: "Case information and documents are handled responsibly, with privacy and dignity." },
    ],
  },
  {
    key: "unclaimed-process",
    name: "The Sewa Process",
    enabled: true,
    eyebrow: "The Sewa Process",
    title: "How Unclaimed Body Sewa Works",
    description: "",
    items: [
      { title: "Case Referral", description: "Case details are received from an appropriate or verifiable source." },
      { title: "Verification & Authorisation", description: "Available case information, documentation and required authorisation are reviewed before assistance is undertaken." },
      { title: "Sewa Coordination", description: "Eligible assistance is coordinated according to case requirements, applicable process and available resources." },
      { title: "Dignified Final Journey", description: "Approved support is provided with sensitivity, dignity and respect." },
    ],
  },
  {
    key: "unclaimed-final-journey",
    name: "Sewa Support",
    enabled: true,
    eyebrow: "Sewa Support",
    title: "Support for a Dignified Final Journey",
    description: "Depending on the verified case, applicable requirements and available resources, assistance may include:",
    image: "",
    items: [
      { title: "Final-Journey Transport", description: "Appropriate transport coordination where required and permitted." },
      { title: "Cremation & Last-Rites Coordination", description: "Support with eligible final-journey arrangements." },
      { title: "Ritual Essentials", description: "Basic materials required for final rites where applicable." },
      { title: "Priest / Ritual Coordination", description: "Appropriate ritual guidance or coordination where relevant." },
      { title: "On-Ground Sewa", description: "Compassionate presence and practical coordination during the final journey." },
    ],
  },
  {
    key: "unclaimed-dignity-first",
    name: "Sewa With Responsibility",
    enabled: true,
    eyebrow: "Sewa With Responsibility",
    title: "Dignity Comes First.",
    description: "Humanitarian support during a final journey requires sensitivity, privacy and responsible processes.",
    image: "",
    items: [
      { title: "Authorised Support", description: "Required legal and administrative clearances are verified before eligible assistance proceeds." },
      { title: "Privacy & Respect", description: "Sensitive case information is handled responsibly, privately and with dignity at every stage." },
      { title: "Responsible Documentation", description: "Relevant case and activity records are maintained where applicable for clear accountability." },
      { title: "No Exploitation", description: "Human dignity always takes priority over publicity, promotion or unnecessary public exposure." },
    ],
  },
  {
    key: "unclaimed-organisation",
    name: "Organisation Behind Mission",
    enabled: true,
    eyebrow: "Namo Gange Trust",
    title: "The Organisation Behind Moksha Sewa",
    description: "A Humanitarian Initiative of Namo Gange Trust.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165236/moksha-sewa/assets/logo-moksha-seva.png",
    items: [
      { title: "Governance", description: "Ethical leadership and transparent processes at every step." },
      { title: "Social Service", description: "Working for community welfare and meaningful social impact." },
      { title: "Humanitarian Action", description: "Compassionate action for people who need timely support." },
      { title: "Responsible Sewa", description: "Dignity-first support with accountability and care." },
    ],
  },
  {
    key: "unclaimed-faq",
    name: "Unclaimed Body FAQ",
    enabled: true,
    eyebrow: "Help & Information",
    title: "Frequently Asked Questions",
    description: "About Unclaimed Body Sewa",
    items: [
      { title: "What is an unclaimed body?", description: "The legal or administrative status of a deceased person is determined by competent authorities under applicable procedures. Moksha Sewa does not independently declare a body to be unclaimed." },
      { title: "Who can request Unclaimed Body Sewa?", description: "Hospital authorities, police officers, or verified social workers can notify us." },
      { title: "What documents or authorisation may be required?", description: "Police clearance certificates, official hospital handovers, and statutory waiting periods are verified." },
      { title: "What support can Moksha Sewa provide?", description: "Final-journey transport, cremation coordination, and basic ritual materials." },
      { title: "Does Moksha Sewa declare a body legally unclaimed?", description: "No, we do not declare bodies as unclaimed. We only assist cases authorised by competent authorities." },
      { title: "Where is Unclaimed Body Sewa currently available?", description: "Please contact our coordination desk for availability in your region." },
    ],
  },
  {
    key: "unclaimed-request",
    name: "Request Unclaimed Case Support",
    enabled: true,
    eyebrow: "Need Assistance With",
    title: "an Unclaimed Body Case?",
    description: "Share the available details so our team can understand the situation and review the appropriate next step.\nIf the matter is currently with a hospital, police station or other competent authority, please complete the applicable official process and obtain the required authorisation before final-journey assistance can proceed.",
    buttonLabel: "Submit Sewa Request",
    buttonHref: "/request-help",
  },
];

export function mergeUnclaimedBodySections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultUnclaimedBodySections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultUnclaimedBodySections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 3. VOLUNTEER PAGE SECTIONS
// ============================================================================
export const defaultVolunteerSections: ExtraSectionContent[] = [
  {
    key: "volunteer-hero",
    name: "Volunteer Hero",
    enabled: true,
    eyebrow: "Be Part Of The Sewa",
    title: "Offer Your Time & Heart to Serve the Final Journey",
    subtitle: "Join a Dedicated Network of Compassionate Citizens",
    description: "Volunteers are the backbone of Moksha Sewa. Help coordinate transport, support grieving families, or assist during last rites.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164963/moksha-sewa/hero-images/volunteer-elderly-woman.png",
    secondaryImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164964/moksha-sewa/hero-images/volunteer-hero-second.png",
    logoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164952/moksha-sewa/hero-images/image6.png",
    buttonLabel: "Register As Volunteer",
    buttonHref: "/volunteer/register",
  },
  {
    key: "volunteer-code",
    name: "Volunteer Code of Conduct",
    enabled: true,
    eyebrow: "Responsibility & Ethics",
    title: "Principles That Guide Every Moksha Volunteer",
    description: "We uphold strict standards of empathy, privacy, dignity, and zero commercial interest in all our activities.",
    items: [
      { title: "Empathetic Conduct", description: "Be respectful and patient with grieving families." },
      { title: "Confidentiality", description: "Protect family privacy and sensitive details at all times." },
      { title: "No Financial Transactions", description: "Volunteers never accept cash or gifts directly." },
    ],
  },
  {
    key: "volunteer-dashboard",
    name: "Volunteer Roles & System",
    enabled: true,
    eyebrow: "Flexible Ways To Help",
    title: "Choose How You Wish To Serve",
    description: "Whether on-field, on-call for emergencies, or assisting with administrative documentation, every contribution counts.",
    items: [
      { title: "Field Support", description: "Assist on ground during transport and ghat ceremonies." },
      { title: "On-Call Emergency", description: "Available for urgent calls in your local area." },
      { title: "Family Coordination", description: "Provide guidance and emotional comfort." },
    ],
  },
  {
    key: "volunteer-register",
    name: "Volunteer Registration Form Section",
    enabled: true,
    eyebrow: "Get Started Today",
    title: "Complete Your Volunteer Profile",
    description: "Fill out the registration form to be verified and added to our active volunteer roster.",
    buttonLabel: "Submit Registration",
    buttonHref: "/volunteer/register",
  },
  {
    key: "volunteer-form-content",
    name: "Volunteer Form Labels & Texts",
    enabled: true,
    items: [
      { title: "Step 1 of 3: Basic Details", description: "Please provide your basic information." },
      { title: "First Name *" },
      { title: "Last Name *" },
      { title: "Mobile Number *" },
      { title: "Email Address *" },
      { title: "Date of Birth *" },
      { title: "Gender *" },
      { title: "Blood Group" },
      { title: "Address Information" },
      { title: "Pincode *" },
      { title: "State *" },
      { title: "City *" },
      { title: "Address *" },
      { title: "Your information is safe with us." },
      { title: "Step 2 of 3: Choose Your Seva", description: "How would you like to serve?" },
      { title: "About You" },
      { title: "Why Volunteer With Us? *" },
      { title: "Skills / Experience" },
      { title: "Availability *" },
      { title: "Preferred Role *" },
      { title: "Step 3 of 3: Verification & Consent", description: "Almost there." },
      { title: "Identity Verification" },
      { title: "Upload Photograph *" },
      { title: "Upload ID Proof (Aadhaar / PAN) *" },
      { title: "I agree to the Moksha Sewa" },
      { title: "Volunteer Code of Conduct" }
    ]
  },
  {
    key: "volunteer-form-dropdowns",
    name: "Volunteer Form Dropdowns",
    enabled: true,
    items: [
      { title: "Gender Options", description: "Male, Female, Other" },
      { title: "Blood Group Options", description: "A+, A-, B+, B-, AB+, AB-, O+, O-" },
      { title: "Availability Options", description: "Weekdays, Weekends, Evenings, Emergency Support, Flexible" },
      { title: "Role Options", description: "Field Volunteer, Transport Support, Documentation, Family Coordination, Ritual Assistance" }
    ]
  },
  {
    key: "volunteer-registration-steps",
    name: "Registration Steps",
    enabled: true,
    eyebrow: "Registration Process",
    title: "How Volunteer Registration Works",
    items: [
      { title: "Fill Details", description: "Complete the form with your preferences and accurate contact details." },
      { title: "Verification", description: "Our team will review your application and reach out for a quick verification." },
      { title: "Orientation", description: "Attend a brief onboarding session to understand the code of conduct and protocols." },
      { title: "Start Sewa", description: "Begin receiving active requests and updates from the central coordination desk." },
    ]
  },
  {
    key: "volunteer-skills",
    name: "Volunteer Suggested Skills",
    enabled: true,
    eyebrow: "Suggested Skills",
    title: "Select your skills",
    items: [
      { title: "First Aid / Medical Basics" },
      { title: "Counselling / Emotional Support" },
      { title: "Logistics / Driving" },
      { title: "Coordination & Administration" },
      { title: "Social Work Experience" },
      { title: "Event Management" },
      { title: "Photography / Content" },
      { title: "Legal / Documentation" }
    ]
  },
  {
    key: "volunteer-service-areas",
    name: "Volunteer Service Areas",
    enabled: true,
    eyebrow: "Service Areas",
    title: "Select preferred areas of service",
    items: [
      { title: "Field Volunteer" },
      { title: "Hospital & Authority Coordination" },
      { title: "Cremation & Ritual Assistance" },
      { title: "Unclaimed Body Support" },
      { title: "Economically Weaker Family Support" },
      { title: "24×7 Helpline Support" },
      { title: "Ambulance / Logistics Support" },
      { title: "Documentation & Case Support" },
      { title: "Community Awareness" },
      { title: "Social Media / Digital Volunteering" },
      { title: "Photography / Videography / Content" },
      { title: "Fundraising & Donor Outreach" },
      { title: "Events & Campaign Support" }
    ]
  },
  {
    key: "volunteer-dashboard-content",
    name: "Dashboard Labels",
    enabled: true,
    eyebrow: "Volunteer Dashboard UI",
    title: "Namaste,",
    subtitle: "Here's your volunteer profile and assigned cases.",
    description: "No assignments yet — our team will reach out when a case near you needs support.",
    items: [
      { title: "Needs Your Response", description: "Active Assignments" },
      { title: "History", description: "Change Password" },
      { title: "Edit Profile", description: "assignments accepted" },
      { title: "Your Availability", description: "Case" },
      { title: "Assigned", description: "Case status:" },
      { title: "Accept", description: "Decline" },
      { title: "View Details", description: "Please respond as soon as you can" },
      { title: "Name", description: "Email" },
      { title: "Pincode", description: "State" },
      { title: "City", description: "Address" },
      { title: "Skills (comma-separated)", description: "Schedule Preference" },
      { title: "Preferred Role", description: "Cancel" },
      { title: "Save Changes", description: "Saving..." },
      { title: "Current Password", description: "New Password" },
      { title: "Confirm New Password", description: "At least 8 characters. You'll be signed out of every session after this." }
    ],
  },
];

export function mergeVolunteerSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultVolunteerSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultVolunteerSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 4. PARTNERSHIP PAGE SECTIONS
// ============================================================================
export const defaultPartnershipSections: ExtraSectionContent[] = [
  {
    key: "partnership-hero",
    name: "Partnership Hero",
    enabled: true,
    eyebrow: "Collaborate With Us",
    title: "Partnering To Expand Dignified Last Rites Across Regions",
    subtitle: "Hospitals, NGOs, Municipalities & Social Organizations",
    description: "Join hands with Moksha Sewa to streamline unclaimed body handling, ambulance networks, and subsidised family support.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165302/moksha-sewa/assets/partnership/hero.png",
    buttonLabel: "Become A Partner",
    buttonHref: "#partner-form",
    secondaryButtonLabel: "Explore Partnerships",
    secondaryButtonHref: "#partnership-network",
    items: [
      { title: "Shared Purpose", description: "Working together for a common mission.", value: "People" },
      { title: "Defined Roles", description: "Clear understanding of responsibilities.", value: "ShieldCheck" },
      { title: "Responsible Coordination", description: "Collaborating with care, process and accountability.", value: "Handshake" },
      { title: "Human Dignity", description: "Respect and compassion at the heart of every action.", value: "HeartHands" },
    ],
  },
  {
    key: "partnership-process",
    name: "How Partnership Works",
    enabled: true,
    eyebrow: "Seamless Integration",
    title: "A Transparent & Structured Collaboration Model",
    description: "From MoU signing to real-time case tracking, we ensure accountability and complete compliance.",
    bottomStatement: "Submitting an enquiry does not itself create or imply a formal partnership.",
    items: [
      { title: "Connect", description: "Tell us about your organisation\nand interest.", value: "Chat" },
      { title: "Explore", description: "We assess mission and\ncollaboration alignment.", value: "Search" },
      { title: "Define", description: "Scope, responsibilities and\nprocesses are clarified.", value: "Clipboard" },
      { title: "Collaborate", description: "Approved activities proceed\nwithin the agreed framework.", value: "Handshake" },
    ],
  },
  {
    key: "partnership-responsibility",
    name: "Institutional Responsibility",
    enabled: true,
    eyebrow: "Accountability First",
    title: "High Standards Of Compliance & Ethics",
    description: "Every partnership operates within strict legal permissions and transparent auditing frameworks.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165000/moksha-sewa/assets/about-optimized/existimage.png",
    buttonLabel: "Know Namo Gange Trust",
    buttonHref: "#",
    secondaryTitle: "Moksha Sewa",
    secondaryDescription: "A Namo Gange Trust Initiative",
    sloganTitle: "A Journey to Healthy World...",
    items: [
      { title: "Dignity First", description: "Human dignity\nremains central.", value: "HeartHands" },
      { title: "Defined Roles", description: "Roles and expectations\nare clearly understood.", value: "Clipboard" },
      { title: "Privacy &\nAccountability", description: "Information is handled\nresponsibly.", value: "Lock" },
      { title: "Responsible\nRepresentation", description: "Partnerships are represented\nonly after approval.", value: "People" },
      { title: "NAMO GANGE\nTRUST", value: "Building" },
      { title: "MOKSHA\nSEWA", value: "Lotus" },
      { title: "RESPONSIBLE\nPARTNERSHIPS", value: "Handshake" },
      { title: "HUMANITARIAN\nSEWA", value: "HeartHands" },
    ],
  },
  {
    key: "partnership-network",
    name: "Partnership Network",
    enabled: true,
    eyebrow: "Our Ecosystem",
    title: "Building A Compassionate Network",
    description: "Connecting hospitals, mortuaries, police departments, cremation grounds, and ground volunteers.",
    secondaryDescription: "We are building a coordinated ecosystem where institutions, communities and professionals work together to ensure that no one is denied a dignified final journey due to a lack of resources, support or guidance.",
    buttonLabel: "Explore a Partnership",
    buttonHref: "#partnership-enquiry",
    bottomStatement: "Potential partner categories do not imply an existing affiliation, endorsement or formal partnership with any institution or authority.",
    items: [
      { title: "Hospitals &\nInstitutions", description: "Explore appropriate referral\nand coordination pathways\nfor eligible cases.", value: "Hospital" },
      { title: "NGOs &\nCommunity Networks", description: "Strengthen community reach,\nreferrals and humanitarian\ncoordination for families.", value: "Community" },
      { title: "Service & Professional\nPartners", description: "Contribute logistics and\nfinal-journey services or\nrelevant professional expertise.", value: "Gear" },
      { title: "Volunteer &\nSupport Networks", description: "Create suitable opportunities\nfor organised participation\nand community Sewa.", value: "Volunteer" },
    ],
  },
  {
    key: "partnership-enquiry",
    name: "Partnership Form Section",
    enabled: true,
    eyebrow: "Reach Out",
    title: "Submit Your Partnership Proposal",
    description: "Fill in your institution details and our team will get in touch shortly.",
    legalNotice: "Moksha Sewa partnerships are structured strictly for humanitarian service, transparency and non-commercial impact. Submitting an enquiry does not constitute a formal agreement.",
    submitLabel: "Submit Partnership Enquiry",
    quote: "Your information is secure and will only be used for partnership communication.",
    items: [
      { title: "Purpose-Driven Partnerships", description: "We collaborate with organisations that share our commitment to dignity and humanitarian service.", value: "People" },
      { title: "Clear Roles & Responsibility", description: "Partnerships are built on transparency, defined roles and mutual understanding.", value: "ShieldCheck" },
      { title: "Responsible & Accountable", description: "We ensure all collaboration follows due process, privacy and accountability standards.", value: "Handshake" },
      { title: "Mission First", description: "Every partnership supports our mission to ensure dignity in the final journey of those in need.", value: "HeartHands" },
    ],
  },
  {
    key: "partnership-faq",
    name: "Partnership FAQ",
    enabled: true,
    eyebrow: "Questions",
    title: "Partnership FAQs",
    description: "Explore how your organisation, services or network can contribute to responsible humanitarian Sewa.",
    subtitle: "Partnership Questions",
    secondaryTitle: "Frequently Asked Questions",
    items: [
      { title: "Shared Purpose", description: "Work together for a common mission and responsible Sewa.", value: "People" },
      { title: "Responsible Collaboration", description: "Defined roles, clear processes and mutual accountability.", value: "ShieldCheck" },
      { title: "Trust & Transparency", description: "Collaboration built on honesty, privacy and responsible communication.", value: "Handshake" },
      { title: "Human Dignity First", description: "Every partnership is guided by respect, dignity and compassion.", value: "HeartHands" },
      { title: "Who can partner with Moksha Sewa?", description: "We welcome partnerships from hospitals, institutions, NGOs, service providers, professional organisations and community networks that share our commitment to dignity and humanitarian service." },
      { title: "What types of partnerships are possible?", description: "Partnerships may include institutional coordination, service partnership, community collaboration, professional support, volunteer engagement and other mission-aligned collaborations." },
      { title: "Does submitting an enquiry make us an official partner?", description: "No. Submitting an enquiry does not create or imply any formal partnership. All partnerships are subject to review, mutual agreement and applicable requirements." },
      { title: "How are partnership roles and responsibilities defined?", description: "Where a partnership is explored further, roles, responsibilities, communication protocols and expectations are clearly defined and mutually agreed upon." },
    ],
  },
  {
    key: "partnership-cta",
    name: "Partnership Final CTA",
    enabled: true,
    eyebrow: "Join Hands",
    title: "Let's Build a Partnership That Creates Meaningful Impact.",
    description: "Start a conversation today. Together, we can serve with greater purpose.",
    buttonLabel: "Become a Partner",
    buttonHref: "#partnership-enquiry",
    secondaryButtonLabel: "Start a Conversation",
    secondaryButtonHref: "#partnership-enquiry",
  },
];

export function mergePartnershipSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultPartnershipSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPartnershipSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 5. CSR PAGE SECTIONS
// ============================================================================
export const defaultCSRSections: ExtraSectionContent[] = [
  {
    key: "csr-hero",
    name: "CSR Hero",
    enabled: true,
    eyebrow: "Corporate Social Responsibility",
    title: "Empower Dignified Final Rites Support\nThrough Corporate CSR",
    subtitle: "Fulfilling Social Impact With Complete Tax Exemption & Audits",
    description: "Partner with Namo Gange Trust's Moksha Sewa initiative to sponsor hearse vans, cremation kits, and unclaimed body rites.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165101/moksha-sewa/assets/csr/csr-hero-photo.jpg",
    buttonLabel: "Discuss a CSR Partnership",
    buttonHref: "#csr-enquiry",
    secondaryButtonLabel: "Request Organisation Profile",
    secondaryButtonHref: "#organisation",
    items: [
      { title: "Defined Scope", value: "Target" },
      { title: "Due Diligence", value: "ShieldCheck" },
      { title: "Documentation", value: "ClipboardCheck" },
      { title: "Impact Reporting", value: "Report" },
      { title: "Strengthen essential", description: "final-journey assistance", value: "HeartHands" },
      { title: "Stand beside eligible", description: "& verified families", value: "People" },
      { title: "Build long-term,", description: "responsible partnerships", value: "Handshake" },
      { title: "Create measurable", description: "human impact", value: "ClipboardCheck" }
    ]
  },
  {
    key: "csr-support-journey",
    name: "CSR Support Journey",
    enabled: true,
    eyebrow: "Where Your CSR Support Helps",
    title: "Meaningful Support at a Deeply Human Moment.",
    description: "CSR collaborations can help strengthen essential final-journey\nassistance for eligible and verified humanitarian cases.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165112/moksha-sewa/assets/csr/meaningful-support-bg.jpg",
    bottomStatement: "Important Note:\nSupport is case-based and subject to verification, applicable formalities, availability and the mutually agreed project scope.",
    items: [
      { title: "Final-Journey\nTransport", description: "Dignified and respectful\ntransport for the departed.", value: "Ambulance", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165105/moksha-sewa/assets/csr/journey-1.jpg" },
      { title: "Cremation &\nLast-Rites Support", description: "Coordination of cremation\nand last-rites with care.", value: "Fire", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165106/moksha-sewa/assets/csr/journey-2.jpg" },
      { title: "Ritual\nEssentials", description: "Providing essential materials\nrequired for rituals.", value: "Ritual", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165107/moksha-sewa/assets/csr/journey-3.jpg" },
      { title: "Family\nGuidance", description: "Supporting families with guidance\nand necessary formalities.", value: "Family", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165109/moksha-sewa/assets/csr/journey-4.jpg" },
      { title: "On-Ground\nAssistance", description: "On-ground support with compassion,\ndignity and respect.", value: "HeartHands", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165110/moksha-sewa/assets/csr/journey-5.jpg" }
    ]
  },
  {
    key: "csr-compliance",
    name: "Compliance & 80G Tax Exemption",
    enabled: true,
    eyebrow: "100% Tax Benefit",
    title: "80G & 12A Certified Legal Compliance",
    description: "All corporate donations receive tax deduction benefits under Section 80G with audited utilization certificates.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165099/moksha-sewa/assets/csr/compliance-photo.jpg",
    supportTitle: "Rigorous Due Diligence",
    supportDescription: "We strictly adhere to ethical practices, maintaining transparency and compliance in every project.",
    bottomStatement: "Transparent operations\nsupported by robust audits",
    buttonLabel: "Request Compliance Information",
    buttonHref: "#csr-enquiry",
    items: [
      { title: "Due Diligence", description: "Applicable organisational\nand project documentation\nis reviewed.", value: "DocumentSearch" },
      { title: "Defined Scope", description: "Objectives, responsibilities,\nbudgets and deliverables\nare mutually defined.", value: "Target" },
      { title: "Documentation", description: "Relevant activity and\nutilisation records are\nmaintained as applicable.", value: "Folder" },
      { title: "Reporting", description: "Programme and impact\nreporting is provided\naccording to the agreed\nframework.", value: "Report" },
    ],
  },
  {
    key: "csr-responsibility",
    name: "Institutional Governance",
    enabled: true,
    eyebrow: "The Organisation Behind Moksha Sewa",
    title: "Institutional Responsibility\nBehind the Mission.",
    description: "Moksha Sewa is an initiative of Namo Gange Trust.\nThrough this institutional framework, the initiative\nseeks to build responsible humanitarian collaborations\ncentred on dignity, service and accountability.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165104/moksha-sewa/assets/csr/institutional-responsibility-bg.jpg",
    partnerLogoImage: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164958/moksha-sewa/hero-images/namo-gange-logo.webp",
    buttonLabel: "Know Namo Gange Trust",
    buttonHref: "#",
    supportTitle: "Our Institutional Pillars",
    items: [
      { title: "Governance", description: "Upholding transparent systems,\nethical practices and strong\ninstitutional governance.", value: "Institution" },
      { title: "Social Service", description: "Working for community welfare\nand creating inclusive, compassionate\nand meaningful social impact.", value: "People" },
      { title: "Humanitarian Action", description: "Extending timely support and relief\nto those in need with dignity,\ncare and respect.", value: "HeartHands" },
      { title: "Responsible Partnerships", description: "Building accountable partnerships\nthat create sustainable impact\nand long-term shared value.", value: "Handshake" }
    ]
  },
  {
    key: "csr-models",
    name: "CSR Engagement Models",
    enabled: true,
    eyebrow: "Custom Models",
    title: "Flexible Sponsorship & Grant Programs",
    description: "Sponsor a Hearse Van, adopt a cremation zone, or fund unclaimed body support campaigns.",
    image: "/assets/csr/engagement-models-bg.png",
    buttonLabel: "Discuss a CSR Partnership",
    buttonHref: "#csr-enquiry",
    items: [
      { title: "Project Partnership", description: "Support a defined humanitarian programme with mutually agreed objectives, scope and reporting.", value: "Handshake", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165114/moksha-sewa/assets/csr/model-project.jpg" },
      { title: "Employee Volunteering", description: "Create suitable opportunities for employees to contribute their time, skills and participation.", value: "People", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165116/moksha-sewa/assets/csr/model-volunteering.jpg" },
      { title: "Institutional Partnership", description: "Collaborate through hospitals, institutions, organisations and community networks where appropriate.", value: "Institution", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165113/moksha-sewa/assets/csr/model-institutional.jpg" },
    ],
  },
  {
    key: "csr-enquiry",
    name: "CSR Enquiry Form Section",
    enabled: true,
    eyebrow: "Corporate Inquiry",
    title: "Connect With Our CSR Leadership Team",
    description: "Share your company's CSR priorities and we will create a tailored proposal.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165136/moksha-sewa/assets/csr/responsible-partnership-conversation.png",
    contactTitle: "CSR Partnership Enquiry",
    phoneNumber: "+91 92201 47229",
    contactEmail: "csr@mokshasewa.org",
    contactAddress: "Delhi • Ghaziabad • Noida",
    submitLabel: "Submit CSR Enquiry",
    submittedLabel: "Inquiry Submitted",
    supportDescription: "For CSR, institutional and corporate partnership enquiries.",
    secondaryTitle: "Thank you!",
    secondaryDescription: "Your CSR partnership enquiry has been received. Our team will review the information and respond through the contact details provided.",
    legalNotice: "I consent to being contacted regarding this enquiry and acknowledge the Privacy Policy.",
    items: [
      { title: "Meaningful\\nImpact", description: "Support dignified\\nhumanitarian\\ninitiatives.", value: "Handshake" },
      { title: "Responsible\\nCollaboration", description: "Built on trust, compliance\\nand accountability.", value: "ShieldCheck" },
      { title: "Community\\nDriven", description: "Strengthen support\\nwhere it's needed\\nmost.", value: "People" },
      { title: "Transparent\\nReporting", description: "Clear updates and\\nimpact reporting\\nas agreed.", value: "Report" },
    ],
  },
  {
    key: "csr-cta",
    name: "CSR Final Call To Action",
    enabled: true,
    eyebrow: "Take Action",
    title: "Make Final Journey Dignity Part Of Your Corporate Legacy",
    description: "Join us in bringing compassion and accountability to those in need.",
    image: "/assets/csr/final-cta-bg.png",
    buttonLabel: "Request Proposal",
    buttonHref: "#csr-enquiry",
    secondaryButtonLabel: "Request Organisation Profile",
    secondaryButtonHref: "#organisation",
  },
];

export function mergeCSRSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultCSRSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultCSRSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 6. REQUEST HELP PAGE SECTIONS
// ============================================================================
export const defaultRequestHelpSections: ExtraSectionContent[] = [
  {
    key: "request-help-hero",
    name: "Request Help Hero",
    enabled: true,
    eyebrow: "Emergency Assistance",
    title: "Request Cremation Assistance",
    subtitle: "We Are Here To Stand Beside You In Your Hour Of Need",
    description: "We are here to support you with compassion, dignity and care in your time of need.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165000/moksha-sewa/assets/about-optimized/existimage.png",
    phoneLabel: "Helpline Number",
    phoneNumber: "+91 9220147229",
    buttonLabel: "Call Helpline Now",
    buttonHref: "tel:+919220147229",
  },
  {
    key: "request-help-form",
    name: "Request Form Details",
    enabled: true,
    eyebrow: "Submit Details",
    title: "Request Assistance",
    description: "Please fill in accurate information to help our emergency coordinators dispatch prompt support.",
    secondaryTitle: "Why Families Trust Moksha Sewa",
    secondaryDescription: "Compassionate guidance, verified coordination and confidential support at every step.",
    submitLabel: "Request Assistance Now",
    submittedLabel: "Request Received",
    secondaryButtonLabel: "Already submitted? Track your request →",
    secondaryButtonHref: "/track",
    bottomStatement: "॥ अन्तिम सेवा, हमारी श्रद्धा और आपका विश्वास ॥",
    legalNotice: "I consent to Moksha Sewa using these details only to provide the requested cremation assistance.",
    supportTitle: "In Sewa, we find peace. In supporting each other, we honor life.",
    supportDescription: "With Sewa in our heart, we walk with you in this journey.",
    quote: "Your information is safe and secure with us. We provide confidential support.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165420/moksha-sewa/assets/route-optimized/request-trust-ritual.webp",
    items: [
      { title: "24/7 Immediate Support", description: "We are available round the clock whenever you need us." },
      { title: "Verified & Compassionate Team", description: "Trained professionals you can trust, with experience and empathy." },
      { title: "Transparent Guidance", description: "Clear information, an honest process and no hidden charges." },
      { title: "Dignified & Respectful Service", description: "Every service is carried out with dignity, care and respect." },
    ],
  },
  {
    key: "request-help-faq",
    name: "Request Help FAQ",
    enabled: true,
    eyebrow: "Quick Answers",
    title: "Need Quick Clarity?",
    items: [
      { title: "How fast is the response?", description: "Emergency requests are reviewed immediately upon call or submission." },
      { title: "Is there any cost involved?", description: "Support is subsidized or free for verified needy families & unclaimed cases." },
    ],
  },
];

export function mergeRequestHelpSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultRequestHelpSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultRequestHelpSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 7. DONATION PAGE SECTIONS
// ============================================================================
export const defaultDonationSections: ExtraSectionContent[] = [
  {
    key: "donation-hero",
    name: "Donation Hero",
    enabled: true,
    eyebrow: "Support The Mission",
    title: "Your Contribution Restores\nSacred Dignity To Human Life",
    subtitle: "100% Tax Exempted Under Section 80G",
    description: "Support free ambulance movement, woodless cremation, priest samagri kits, and unclaimed body rites.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164932/moksha-sewa/hero-images/3.png",
    buttonLabel: "Donate Now",
    buttonHref: "#donation-form",
  },
  {
    key: "donation-causes",
    name: "Donation Causes",
    enabled: true,
    eyebrow: "Choose A Cause",
    title: "Direct Impact Causes You Can Support",
    description: "Select specific areas of service to direct your donation.",
    items: [
      {
        title: "Support a Final Journey",
        description: "Indicative contribution toward verified last-rites assistance and related programme needs.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165250/moksha-sewa/assets/namo-gange/vol2.png",
        value: "1100",
        features: ["Case support", "Most needed", "Mission fund", "General support"]
      },
      {
        title: "Last-Rites Assistance",
        description: "Indicative contribution toward essential ritual materials and case-based support.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165251/moksha-sewa/assets/namo-gange/vol3.png",
        value: "2100",
        label: "MISSION NEED",
        features: ["Ritual support", "Guidance", "Materials", "Case care"]
      },
      {
        title: "Transport Support",
        description: "Indicative contribution toward ambulance or hearse-van coordination for verified cases.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165253/moksha-sewa/assets/namo-gange/vol4.png",
        value: "5100",
        features: ["Readiness", "Transport care", "Helpline support", "Coordination"]
      },
      {
        title: "Family Relief Support",
        description: "Indicative contribution toward food, water and basic relief where verified need exists.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165258/moksha-sewa/assets/namo-gange/vol5.png",
        value: "11000",
        features: ["Meal support", "Family relief", "Essentials", "Community care"]
      },
    ],
  },
  {
    key: "donation-tax-benefit",
    name: "80G Tax Exemption Info",
    enabled: true,
    eyebrow: "Tax Benefits",
    title: "Save Tax While Serving Humanity",
    description: "Instant 80G tax exemption receipts generated automatically upon successful payment.",
  },
  {
    key: "donation-stats",
    name: "Donation Quick Stats",
    enabled: true,
    eyebrow: "Quick Stats",
    title: "Donation Impact Numbers",
    items: [
      { value: "Verified", label: "Case Support" },
      { value: "Delhi • Ghaziabad • Noida", label: "Launch Region" },
      { value: "Need-Based", label: "Relief Assistance" },
      { value: "Trust-Led", label: "Sewa Mission" },
    ]
  },
  {
    key: "donation-faq",
    name: "Donation FAQ",
    enabled: true,
    eyebrow: "Help & Information",
    title: "Frequently Asked Questions",
    items: [
      { title: "Will I receive a receipt for my donation?", description: "Yes. A donation receipt is generated for every contribution and emailed to you — please keep it for your records." },
      { title: "Is my contribution tax-exempt?", description: "Yes. All contributions made to Namo Gange Trust are eligible for tax exemption under Section 80G of the Income Tax Act." },
      { title: "How are the funds utilized?", description: "Your support goes directly toward the specific cause you select—whether for cremation rites, ambulance coordination, or essential relief." },
      { title: "Is my payment information secure?", description: "Yes. Payments are processed through encrypted, secure payment gateways — your card and bank details are never stored on our servers." },
      { title: "Can I set up a monthly donation?", description: "Yes — choose ‘Monthly’ while donating and our team will coordinate recurring contributions on your behalf." },
    ]
  },
];

export function mergeDonationSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultDonationSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultDonationSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 8. CONTACT PAGE SECTIONS
// ============================================================================
export const defaultContactSections: ExtraSectionContent[] = [
  {
    key: "contact-hero",
    name: "Contact Hero",
    enabled: true,
    eyebrow: "Contact Us",
    title: "We Are Here To Assist You\n24 Hours A Day",
    subtitle: "Reach Out For Help, Inquiries, Or Volunteer Guidance",
    description: "Connect with our central coordination desk in Delhi NCR via phone, email, or office visit.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165070/moksha-sewa/assets/about-reference/who-we-are-background-v2.png",
    phoneLabel: "24/7 Helpline",
    phoneNumber: "1800123456",
    contactEmail: "info@mokshasewa.org",
    contactAddress: "Namo Gange Trust, Delhi • Ghaziabad • Noida",
  },
  {
    key: "contact-info",
    name: "Contact Info & Channels",
    enabled: true,
    eyebrow: "Direct Contact",
    title: "Our Operational Desks",
    description: "Get in touch with specific departments directly.",
    items: [
      { title: "Emergency Helpline", description: "Available 24x7 for immediate support." },
      { title: "Volunteer Desk", description: "For volunteer onboarding and queries." },
      { title: "CSR & Partner Desk", description: "For institutional collaborations." },
    ],
  },
  {
    key: "contact-form",
    name: "Contact Form Section",
    enabled: true,
    eyebrow: "Send Message",
    title: "Leave Us A Message",
    description: "Fill out the contact form and our team will respond within 2 hours.",
    buttonLabel: "Send message",
    items: [
      { title: "First name *", description: "Rahul" },
      { title: "Last name *", description: "Sharma" },
      { title: "Email address *", description: "rahul@example.com" },
      { title: "Phone number *", description: "Enter 10 digit mobile number" },
      { title: "Subject *", description: "What do you need help with?" },
      { title: "Message *", description: "Share the details — city, timing, and what you need arranged." },
    ]
  },
  {
    key: "contact-faq",
    name: "Contact FAQ",
    enabled: true,
    eyebrow: "Helpful Info",
    title: "Common Inquiries",
    items: [
      { title: "Where are services available?", description: "Currently serving Delhi, Ghaziabad, Noida and surrounding NCR areas." },
    ],
  },
  {
    key: "contact-locations",
    name: "Office Locations",
    enabled: true,
    eyebrow: "Our Presence",
    title: "Office Locations",
    description: "Find our head office and regional branches.",
    items: [
      { title: "Head Office", subtitle: "Ghaziabad, Uttar Pradesh", description: "12/52, Site - 2, Sunrise Industrial Area, Mohan Nagar, Sahibabad, Ghaziabad, Uttar Pradesh, India", value: "+91 98183 53841", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165096/moksha-sewa/assets/contact/im.png" },
      { title: "London Office", subtitle: "Luton, England", description: "Registration address: 6 Liddel Close, Luton, Bedfordshire, United Kingdom LU3 1TW", value: "+44 7429 519276", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165092/moksha-sewa/assets/contact/en.png" },
    ]
  },
];

export function mergeContactSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultContactSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultContactSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// ============================================================================
// 9. TRACK PAGE SECTIONS
// ============================================================================
export const defaultTrackSections: ExtraSectionContent[] = [
  {
    key: "track-hero",
    name: "Track Status Hero",
    enabled: true,
    eyebrow: "Track Status",
    title: "Track Case Or Request Progress In Real-Time",
    subtitle: "Transparent & Accountable Verification System",
    description: "Enter your Request Number or Case ID to view live verification, volunteer assignment, and completion status.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165000/moksha-sewa/assets/about-optimized/existimage.png",
  },
  {
    key: "track-info",
    name: "Track Info & Guidance",
    enabled: true,
    eyebrow: "How It Works",
    title: "Complete Transparency At Every Milestone",
    description: "Every step is logged from initial intake to final certificate upload.",
  },
  {
    key: "track-how-it-works",
    name: "Track Process Steps",
    enabled: true,
    eyebrow: "How It Works",
    title: "The Tracking Process",
    items: [
      { title: "Initial Request", description: "Information collected and case registered." },
      { title: "Verification", description: "Details verified by our coordination desk." },
      { title: "Assignment", description: "Volunteer or vehicle allocated to the case." },
      { title: "In Progress", description: "Active on-ground coordination and assistance." },
      { title: "Completed", description: "Support successfully provided and documented." },
    ]
  }
];

export function mergeTrackSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultTrackSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultTrackSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

// Generated Services Content
export const defaultAmbulanceSections: ExtraSectionContent[] = [
  {
    key: "ambulance-hero",
    name: "Ambulance Hero",
    enabled: true,
    eyebrow: "24×7 Last Journey Support",
    title: "Ambulance & Hearse\nSupport with Dignity",
    description: "Namo Gange coordinates ambulance and hearse support for eligible last-journey cases with dignified transfer, calm guidance and timely assistance, subject to verification and availability.",
    image: "/ambulance/hero-ambulance.webp",
    buttonLabel: "Call for Ambulance",
    buttonHref: "tel:+919654900525",
    secondaryButtonLabel: "Request Support",
    secondaryButtonHref: "/request-help",
    bottomStatement: "Serving families with compassion, respect and timely support.",
  },
  {
    key: "ambulance-highlights",
    name: "Ambulance Highlights",
    enabled: true,
    items: [
      { title: "24/7 Availability", description: "Always here, day or night. Whenever you need us.", label: "clock" },
      { title: "Respectful Transport", description: "Dignified ambulance and hearse van for last journey.", label: "ambulance" },
      { title: "Trained Support Team", description: "Compassionate and skilled team you can trust.", label: "team" },
      { title: "Fast Response", description: "Quick response to reach you as soon as possible.", label: "timer" }
    ],
  },
  {
    key: "ambulance-how-it-works",
    name: "Ambulance How It Works",
    enabled: true,
    title: "How It Works",
    items: [
      { title: "Call or Request", description: "Contact us anytime by call or request online.", label: "phone" },
      { title: "We Respond", description: "Our team reaches you quickly.", label: "ambulance" },
      { title: "We Assist", description: "We handle transport and support with care.", label: "hands" },
      { title: "Dignified Last Journey", description: "We ensure a respectful and peaceful last journey.", label: "leaf" }
    ],
  },
  {
    key: "ambulance-support",
    name: "Ambulance Support Section",
    enabled: true,
    title: "We Stand With You\nWhen It Matters Most",
    description: "In your most difficult moments, we stand beside you. Our ambulance and hearse support services are designed to bring relief, care and dignity.",
    image: "/ambulance/family-support.webp",
    items: [
      { title: "Ambulance for emergency & non-emergency transfer" },
      { title: "Hearse van for last journey with full respect" },
      { title: "Help with basic coordination & arrangements" },
      { title: "Respectful support at the ghat and during rituals" }
    ],
    buttonLabel: "We Are Here For You",
    buttonHref: "tel:+919654900525",
    secondaryDescription: "Support team standing with a family",
  },
  {
    key: "ambulance-stories",
    name: "Ambulance Stories",
    enabled: true,
    items: [
      { title: "Always Ready", description: "Ambulance available 24×7 at all locations.", image: "/ambulance/story-always-ready.webp", label: "clock" },
      { title: "Careful & Respectful", description: "Trained team ensures safe and dignified transfer.", image: "/ambulance/story-respectful-transfer.webp", label: "hands" },
      { title: "Compassionate Support", description: "We stand with families with empathy and care.", image: "/ambulance/story-family-care.webp", label: "family" }
    ],
  },
  {
    key: "ambulance-receive",
    name: "Ambulance What Families Receive",
    enabled: true,
    title: "What Families Receive",
    items: [
      { title: "Ambulance Support", description: "24×7 ambulance service for quick and safe transfer.", label: "ambulance" },
      { title: "Hearse Van Support", description: "Dignified hearse van for last journey transport.", label: "ambulance" },
      { title: "Ritual Coordination", description: "Basic ritual support and puja samagri assistance.", label: "ritual" },
      { title: "On-Ground Assistance", description: "Help with ghat entry, arrangements & support.", label: "team" },
      { title: "Emergency Contact Support", description: "Dedicated helpline for immediate guidance.", label: "phone" }
    ],
  },
  {
    key: "ambulance-trust",
    name: "Ambulance Why Families Trust Us",
    enabled: true,
    title: "Why Families Trust Namo Gange",
    items: [
      { title: "Sewa with Respect", description: "24×7 service with dignity and care.", label: "leaf" },
      { title: "Trusted by Families", description: "Thousands of families trust our sewa.", label: "family" },
      { title: "Transparent & Honest", description: "No hidden charges. Complete transparency.", label: "shield" },
      { title: "Wide Service Network", description: "Help across Delhi • Ghaziabad • Noida and nearby regions.", label: "pin" },
      { title: "End-to-End Support", description: "From first call to final ritual support.", label: "support" }
    ],
  },
  {
    key: "ambulance-donation",
    name: "Ambulance Donation CTA",
    enabled: true,
    title: "Your Donation Brings Peace",
    description: "Your kind contribution helps us provide ambulance, hearse and last-journey support to families who cannot afford it. Together, we can bring comfort, dignity and peace in their most difficult moments.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    buttonLabel: "Donate for Ambulance Service",
    buttonHref: "/donation",
    secondaryButtonLabel: "Support Our Sewa",
    secondaryButtonHref: "tel:+919654900525",
    secondaryTitle: "Every\nContribution\nBrings Peace",
  },
];

export function mergeAmbulanceSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultAmbulanceSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultAmbulanceSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultPanditSections: ExtraSectionContent[] = [
  {
    key: "pandit-hero",
    name: "Pandit Hero",
    enabled: true,
    title: "Priest Support",
    subtitle: "For a Dignified Final Journey.",
    description: "Experienced Pandit Ji's guide your family with compassion, clarity and reverence in every sacred ritual of your loved one's journey.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165283/moksha-sewa/assets/panditservices/hero-real.png",
    buttonLabel: "Request Priest Support",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Donate for Ritual Support",
    secondaryButtonHref: "/donation",
  },
  {
    key: "pandit-highlights",
    name: "Pandit Highlights",
    enabled: true,
    items: [
      { title: "Experienced Pandit Ji", description: "Learned and compassionate guidance", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165275/moksha-sewa/assets/panditservices/feature-pandit.png" },
      { title: "Vedic Guidance", description: "Guidance based on Hindu traditions", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165279/moksha-sewa/assets/panditservices/feature-vedic.png" },
      { title: "Ritual Planning", description: "Complete ritual planning and coordination", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165276/moksha-sewa/assets/panditservices/feature-planning.png" },
      { title: "Regional Traditions", description: "Rituals according to family customs", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165277/moksha-sewa/assets/panditservices/feature-traditions.png" }
    ],
  },
  {
    key: "pandit-how-it-works",
    name: "Pandit How It Works",
    enabled: true,
    title: "How It Works",
    items: [
      { title: "Call or Request Support", label: "phone" },
      { title: "Pandit Ji Consultation", label: "team" },
      { title: "Ritual Arrangement", label: "hands" },
      { title: "Guidance Through Every Ceremony", label: "hands" }
    ],
  },
  {
    key: "pandit-support",
    name: "Pandit Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "pandit-stories",
    name: "Pandit Stories",
    enabled: true,
    title: "Ritual Support at Every Step",
    items: [
      { title: "Pre-Ritual Consultation", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165285/moksha-sewa/assets/panditservices/ritual-1.png" },
      { title: "Antim Sanskar Vidhi", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165286/moksha-sewa/assets/panditservices/ritual-2.png" },
      { title: "Mukhagni Guidance", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165288/moksha-sewa/assets/panditservices/ritual-3.png" },
      { title: "Asthi Visarjan", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165289/moksha-sewa/assets/panditservices/ritual-4.png" },
      { title: "Pind Daan", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165290/moksha-sewa/assets/panditservices/ritual-5.png" },
      { title: "Tehrvi & Shanti Paath", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165291/moksha-sewa/assets/panditservices/ritual-6.png" }
    ],
  },
  {
    key: "pandit-receive",
    name: "Pandit What Families Receive",
    enabled: true,
    title: "Pandit Ji Roles",
    items: [
      { title: "Samagri Guidance", description: "Right samagri for every sacred ritual.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165293/moksha-sewa/assets/panditservices/roles-1.png" },
      { title: "Prayer Hall Ceremony", description: "Rituals conducted with peace and reverence.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165294/moksha-sewa/assets/panditservices/roles-2.png" },
      { title: "Family Ritual Explanation", description: "Simple guidance at every sacred step.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165295/moksha-sewa/assets/panditservices/roles-3.png" },
      { title: "Post-Ritual Support", description: "Guidance for remaining rituals and timelines.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165296/moksha-sewa/assets/panditservices/roles-4.png" }
    ],
  },
  {
    key: "pandit-trust",
    name: "Pandit Why Families Trust Us",
    enabled: true,
    title: "Why Families Trust Us",
    items: [
      { title: "Compassionate Guidance", description: "Care, sensitivity and respect in every moment.", label: "heart" },
      { title: "Authentic Hindu Rituals", description: "Rituals performed according to Shastra and tradition.", label: "om" },
      { title: "Support Beyond Ceremony", description: "Continued spiritual guidance after the ceremony.", label: "handshake" }
    ],
  },
  {
    key: "pandit-donation",
    name: "Pandit Donation CTA",
    enabled: true,
    title: "Your Support Helps Families Receive Dignified & Sacred Final Rites",
    description: "Every act of kindness becomes a blessing for many.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165284/moksha-sewa/assets/panditservices/hero.png",
    buttonLabel: "Donate for Ritual Support",
    buttonHref: "/donation",
  },
];

export function mergePanditSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultPanditSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPanditSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultFuneralSections: ExtraSectionContent[] = [
  {
    key: "funeral-hero",
    name: "Funeral Hero",
    enabled: true,
    title: "Wood & Ritual Items",
    subtitle: "Arranged With Deep Respect.",
    description: "At Moksha Sewa, we understand the financial and emotional burden of the final rites. We help eligible families coordinate cremation wood, shroud cloth (Kafan), flowers, lamps, and essential prayer items subject to verification and availability.",
    image: "/woodrituals/hero.webp",
    buttonLabel: "Request Wood & Items",
    buttonHref: "/request-help",
  },
  {
    key: "funeral-highlights",
    name: "Funeral Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "funeral-how-it-works",
    name: "Funeral How It Works",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "funeral-support",
    name: "Funeral Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "funeral-stories",
    name: "Funeral Stories",
    enabled: true,
    items: [],
  },
  {
    key: "funeral-receive",
    name: "Funeral What Families Receive",
    enabled: true,
    title: "What We Arrange",
    items: [
      { title: "Cremation Wood", description: "We provide sufficient dry wood required for a complete and respectful cremation ceremony, subject to verification and availability.", image: "/woodrituals/cremation-wood.webp" },
      { title: "Shroud & Flowers", description: "Pure white shroud cloth, garlands and fresh flowers are arranged carefully to honour the departed soul with dignity and purity.", image: "/woodrituals/shroud-flowers.webp" },
      { title: "Prayer Items", description: "Ghee, sandalwood, incense, earthen lamps and essential Pooja Samagri are carefully arranged for the final rites and prayers.", image: "/woodrituals/prayer-items.webp" }
    ],
  },
  {
    key: "funeral-trust",
    name: "Funeral Why Families Trust Us",
    enabled: true,
    title: "“We believe that no family should have to worry about the expenses of a final farewell while grieving the loss of their loved one.”",
    description: "Our volunteers work tirelessly to ensure that every necessary item reaches the cremation ground on time. You mourn in peace, let us handle the arrangements.",
    items: [],
  },
  {
    key: "funeral-donation",
    name: "Funeral Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeFuneralSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultFuneralSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultFuneralSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultFuneralDecorationSections: ExtraSectionContent[] = [
  {
    key: "funeralDecoration-hero",
    name: "Funeral Decoration Hero",
    enabled: true,
    title: "Funeral Decoration",
    subtitle: "A Beautiful Final Journey.",
    description: "We believe in bidding farewell with utmost respect and serenity. Our volunteers arrange traditional floral decorations for the hearse van, pyre, and prayer hall using fresh and sacred flowers to honor the departed soul.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165195/moksha-sewa/assets/how-we-help/three.png",
    buttonLabel: "Request Decoration",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919999999999",
  },
  {
    key: "funeralDecoration-highlights",
    name: "Funeral Decoration Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "funeralDecoration-how-it-works",
    name: "Funeral Decoration How It Works",
    enabled: true,
    title: "Our Decoration Services",
    items: [
      { title: "Hearse Van Decoration", description: "Elegant and respectful floral decoration for the ambulance or hearse van, creating a dignified setting for the final journey.", label: "florist" },
      { title: "Pyre & Pathway Setup", description: "Fresh flowers and sacred leaves are arranged around the cremation area to create a peaceful and respectful environment.", label: "leaf" },
      { title: "Prayer Hall Serenity", description: "Calming floral arrangements for the Shanti Path and prayer area, creating a serene atmosphere for family and grieving guests.", label: "nature" }
    ],
  },
  {
    key: "funeralDecoration-support",
    name: "Funeral Decoration Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "funeralDecoration-stories",
    name: "Funeral Decoration Stories",
    enabled: true,
    items: [],
  },
  {
    key: "funeralDecoration-receive",
    name: "Funeral Decoration What Families Receive",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "funeralDecoration-trust",
    name: "Funeral Decoration Why Families Trust Us",
    enabled: true,
    title: "&quot;Flowers speak the language of peace, honoring a beautiful life that has moved on.&quot;",
    description: "Our volunteers carefully handpick fresh flowers, ensuring the final journey of your loved one is surrounded by purity, respect, and unconditional love.",
    items: [],
  },
  {
    key: "funeralDecoration-donation",
    name: "Funeral Decoration Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeFuneralDecorationSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultFuneralDecorationSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultFuneralDecorationSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultPrayerHallSections: ExtraSectionContent[] = [
  {
    key: "prayerHall-hero",
    name: "Prayer Hall Hero",
    enabled: true,
    title: "Ground & Prayer Support",
    subtitle: "Creating A Space For Peace.",
    description: "Finding the right place to grieve and pray is essential. We assist with cremation-ground coordination, setting up serene prayer halls, and providing calm guidance for the entire family.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165319/moksha-sewa/assets/prayerhallservices/hero-real.png",
    buttonLabel: "Request Support",
    buttonHref: "/request-help",
    secondaryButtonLabel: "Donate for Support",
    secondaryButtonHref: "/donation",
  },
  {
    key: "prayerHall-highlights",
    name: "Prayer Hall Highlights",
    enabled: true,
    items: [
      { title: "Ground Coordination", description: "Seamless coordination with ground staff and family members.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165310/moksha-sewa/assets/prayerhallservices/feature-ground.png" },
      { title: "Prayer Setup", description: "Serene prayer arrangements prepared with care and respect.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165316/moksha-sewa/assets/prayerhallservices/feature-setup.png" },
      { title: "Family Support", description: "Gentle guidance and assistance for family members throughout.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165309/moksha-sewa/assets/prayerhallservices/feature-family.png" },
      { title: "Peaceful Environment", description: "A calm and respectful space for prayer, mourning and remembrance.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165312/moksha-sewa/assets/prayerhallservices/feature-peace.png" }
    ],
  },
  {
    key: "prayerHall-how-it-works",
    name: "Prayer Hall How It Works",
    enabled: true,
    title: "How It Works",
    items: [
      { title: "Call or Request Support", label: "phone" },
      { title: "Ground Coordination", label: "building" },
      { title: "Prayer Hall Setup", label: "florist" },
      { title: "Guidance During Ceremony", label: "hands" }
    ],
  },
  {
    key: "prayerHall-support",
    name: "Prayer Hall Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "prayerHall-stories",
    name: "Prayer Hall Stories",
    enabled: true,
    title: "Our Complete Support",
    items: [
      { title: "Ground Booking", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165329/moksha-sewa/assets/prayerhallservices/support-1.png" },
      { title: "Floral Setup", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165330/moksha-sewa/assets/prayerhallservices/support-2.png" },
      { title: "Seating Arrangements", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165332/moksha-sewa/assets/prayerhallservices/support-3.png" },
      { title: "Audio & Mic Setup", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165333/moksha-sewa/assets/prayerhallservices/support-4.png" },
      { title: "Pandit Ji Coordination", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165334/moksha-sewa/assets/prayerhallservices/support-5.png" },
      { title: "Guest Management", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165335/moksha-sewa/assets/prayerhallservices/support-6.png" }
    ],
  },
  {
    key: "prayerHall-receive",
    name: "Prayer Hall What Families Receive",
    enabled: true,
    title: "Ground Support Roles",
    items: [
      { title: "Venue Coordination", description: "Suitable venue coordination for every sacred ritual.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165323/moksha-sewa/assets/prayerhallservices/roles-1.png" },
      { title: "Setup & Decor", description: "Peaceful arrangements prepared with care and dignity.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165325/moksha-sewa/assets/prayerhallservices/roles-2.png" },
      { title: "Guest Assistance", description: "Clear and compassionate guidance for guests at every step.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165326/moksha-sewa/assets/prayerhallservices/roles-3.png" },
      { title: "Post-Prayer Cleanup", description: "Respectful clearing and coordination after rituals conclude.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165328/moksha-sewa/assets/prayerhallservices/roles-4.png" }
    ],
  },
  {
    key: "prayerHall-trust",
    name: "Prayer Hall Why Families Trust Us",
    enabled: true,
    title: "Why Families Trust Us",
    items: [
      { title: "Compassionate Guidance", description: "Care, sensitivity and respect in every moment.", label: "heart" },
      { title: "Authentic Arrangements", description: "Setups tailored carefully to Shastra and family traditions.", label: "om" },
      { title: "Support Beyond Ceremony", description: "Continued guidance and support even after the ceremony.", label: "handshake" }
    ],
  },
  {
    key: "prayerHall-donation",
    name: "Prayer Hall Donation CTA",
    enabled: true,
    title: "Your Support Helps Families Receive Dignified & Sacred Final Rites",
    description: "Every act of kindness becomes a blessing for many.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165320/moksha-sewa/assets/prayerhallservices/hero.png",
    buttonLabel: "Donate for Support",
    buttonHref: "/donation",
  },
];

export function mergePrayerHallSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultPrayerHallSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPrayerHallSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultSpecialServiceSections: ExtraSectionContent[] = [
  {
    key: "specialService-hero",
    name: "Special Service Hero",
    enabled: true,
    eyebrow: "Extended Family Support",
    title: "Family Support",
    subtitle: "Standing Beside You.",
    description: "Beyond the final rites, Moksha Sewa helps eligible families with case-based guidance, relief coordination and compassionate support, subject to verification and availability.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165157/moksha-sewa/assets/family-support/hero-bg-2.png",
    buttonLabel: "Request Support",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919220147229",
  },
  {
    key: "specialService-highlights",
    name: "Special Service Highlights",
    enabled: true,
    items: [
      { title: "Emotional Support", description: "Counseling and a sympathetic ear for grieving families.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165435/moksha-sewa/assets/serving/counseling-support.png" },
      { title: "Tehravi Khana", description: "Respectful management of the 13th-day meal for grieving families.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165439/moksha-sewa/assets/serving/food-essentials.png" },
      { title: "Formalities", description: "Help with death certificates and important legal procedures.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165436/moksha-sewa/assets/serving/document-assistance.png" },
      { title: "Ambulance", description: "Transport support for eligible cases after required verification.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165438/moksha-sewa/assets/serving/emergency-transport.png" },
      { title: "Eligibility Based", description: "Assistance is provided subject to verification and availability.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165433/moksha-sewa/assets/serving/community-outreach.png" },
      { title: "Hospital Care", description: "On-ground help and coordination during hospital discharge formalities.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165440/moksha-sewa/assets/serving/hospital-support.png" },
      { title: "Ground Help", description: "Volunteers support and guide families carefully at every step.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165442/moksha-sewa/assets/serving/on-ground-support.png" },
      { title: "Remote Reach", description: "Extending compassionate and dignified support to remote areas.", image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165447/moksha-sewa/assets/serving/rural-remote-reach.png" }
    ],
  },
  {
    key: "specialService-how-it-works",
    name: "Special Service How It Works",
    enabled: true,
    title: "How We Extend Our Help",
    items: [
      { title: "Contact Us", description: "Reach out through our 24x7 helpline whenever your family needs help.", label: "phone" },
      { title: "Needs Assessment", description: "We understand your family's emotional, practical and financial needs.", label: "comment" },
      { title: "Arrange Support", description: "We arrange meals, paperwork and compassionate support for your family.", label: "clipboard" },
      { title: "Ongoing Care", description: "Our support continues beyond the cremation ground with care each step.", label: "users" }
    ],
  },
  {
    key: "specialService-support",
    name: "Special Service Support Section",
    enabled: true,
    title: "Empowered by <br class=\"hidden lg:block\" /><span class=\"text-[#9A6A31]\">Namo Gange Volunteers</span>",
    description: "Our widespread network of dedicated volunteers is always ready to mobilize. They step forward to organize meals, manage hospital formalities, and support grieving families.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165001/moksha-sewa/assets/about-optimized/family-support.webp",
    items: [],
  },
  {
    key: "specialService-stories",
    name: "Special Service Stories",
    enabled: true,
    items: [],
  },
  {
    key: "specialService-receive",
    name: "Special Service What Families Receive",
    enabled: true,
    eyebrow: "Holistic Support System",
    title: "An Extended Family <br /><span class=\"text-[#9A6A31]\">For Those Who Need One</span>",
    description: "\"Our service does not end at the cremation ground. We believe in providing holistic support that helps a family get back on its feet while remembering their departed with love and peace.\"",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165440/moksha-sewa/assets/serving/hospital-support.png",
    buttonLabel: "Know More About Our Work",
    buttonHref: "/contact",
    items: [
      { title: "Sympathetic ear for intense grief and trauma" },
      { title: "Assistance with death certificates and formalities" },
      { title: "Relief coordination for verified family needs" },
      { title: "Assistance subject to eligibility and availability" }
    ],
  },
  {
    key: "specialService-trust",
    name: "Special Service Why Families Trust Us",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "specialService-donation",
    name: "Special Service Donation CTA",
    enabled: true,
    title: "Your Support Helps Us <br />Feed Grieving Families",
    description: "By donating, you help us organize Tehravi Khana and provide continued assistance for families who cannot afford the post-cremation rituals and meals.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165435/moksha-sewa/assets/serving/counseling-support.png",
    buttonLabel: "Donate to Moksha Sewa",
    buttonHref: "/donation",
    secondaryButtonLabel: "Support Our Seva",
    secondaryButtonHref: "/volunteer/register",
  },
];

export function mergeSpecialServiceSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultSpecialServiceSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultSpecialServiceSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultCallingRelativesSections: ExtraSectionContent[] = [
  {
    key: "callingRelatives-hero",
    name: "Calling Relatives Hero",
    enabled: true,
    title: "Family & Relative Support",
    subtitle: "Compassionate Communication.",
    description: "In times of sudden loss, making phone calls to inform relatives can be emotionally draining. Our compassionate volunteers take this burden off your shoulders, respectfully notifying all extended family members and friends.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165435/moksha-sewa/assets/serving/counseling-support.png",
    buttonLabel: "Request Assistance",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919999999999",
  },
  {
    key: "callingRelatives-highlights",
    name: "Calling Relatives Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "callingRelatives-how-it-works",
    name: "Calling Relatives How It Works",
    enabled: true,
    title: "How We Assist You",
    items: [
      { title: "Respectful Notifications", description: "We thoughtfully convey the news and Antim Sanskar details to relatives and friends with sensitivity, clarity and complete respect.", label: "users" },
      { title: "Coordinating Arrivals", description: "We help guide relatives travelling from outside the city so they receive timely information and can reach the family without confusion.", label: "connect" },
      { title: "Emotional Shielding", description: "We reduce the immediate family's emotional burden by handling repeated communication with relatives and friends in a calm manner.", label: "empathize" }
    ],
  },
  {
    key: "callingRelatives-support",
    name: "Calling Relatives Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "callingRelatives-stories",
    name: "Calling Relatives Stories",
    enabled: true,
    items: [],
  },
  {
    key: "callingRelatives-receive",
    name: "Calling Relatives What Families Receive",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "callingRelatives-trust",
    name: "Calling Relatives Why Families Trust Us",
    enabled: true,
    title: "&quot;You have lost someone precious. Focus on saying goodbye, let us handle the words for the rest.&quot;",
    description: "Our volunteers step in as your extended family, offering support that lets you grieve without the added burden of coordination and communication.",
    items: [],
  },
  {
    key: "callingRelatives-donation",
    name: "Calling Relatives Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeCallingRelativesSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultCallingRelativesSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultCallingRelativesSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultHarsevanSections: ExtraSectionContent[] = [
  {
    key: "harsevan-hero",
    name: "Harsevan Hero",
    enabled: true,
    title: "Hearse Van (Shav Vahan)",
    subtitle: "For a Dignified Final Journey.",
    description: "The final journey should be carried out with the utmost dignity. We help coordinate Hearse Van (Shav Vahan) support for eligible cases, subject to verification, location and availability.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165438/moksha-sewa/assets/serving/emergency-transport.png",
    buttonLabel: "Request Hearse Van",
    buttonHref: "/request-help",
    secondaryButtonLabel: "24x7 Helpline",
    secondaryButtonHref: "tel:+919999999999",
  },
  {
    key: "harsevan-highlights",
    name: "Harsevan Highlights",
    enabled: true,
    items: [],
  },
  {
    key: "harsevan-how-it-works",
    name: "Harsevan How It Works",
    enabled: true,
    title: "How We Assist You",
    items: [
      { title: "Immediate Availability", description: "Our hearse vans are coordinated promptly across service areas to provide timely and dignified transportation when families need support.", label: "car" },
      { title: "Professional Drivers", description: "Experienced and empathetic drivers understand the sensitivity of the moment and ensure every journey is handled carefully and respectfully.", label: "wheel" },
      { title: "Seamless Coordination", description: "Our volunteers help coordinate between the family, hospital and cremation ground to reduce confusion and unnecessary logistical burden.", label: "phone" }
    ],
  },
  {
    key: "harsevan-support",
    name: "Harsevan Support Section",
    enabled: true,
    title: "",
    description: "",
    image: "",
    items: [],
  },
  {
    key: "harsevan-stories",
    name: "Harsevan Stories",
    enabled: true,
    items: [],
  },
  {
    key: "harsevan-receive",
    name: "Harsevan What Families Receive",
    enabled: true,
    title: "",
    items: [],
  },
  {
    key: "harsevan-trust",
    name: "Harsevan Why Families Trust Us",
    enabled: true,
    title: "&quot;We ensure their final journey is as peaceful and dignified as the life they lived.&quot;",
    description: "You should never have to worry about transportation logistics while mourning. Moksha Sewa stands ready to help you navigate this difficult time.",
    items: [],
  },
  {
    key: "harsevan-donation",
    name: "Harsevan Donation CTA",
    enabled: true,
    title: "",
    description: "",
    buttonLabel: "",
    buttonHref: "",
    secondaryButtonLabel: "",
    secondaryButtonHref: "",
  },
];

export function mergeHarsevanSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultHarsevanSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultHarsevanSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}


// ============================================================================
// 10. LEGAL PAGES SECTIONS
// ============================================================================

export const defaultPrivacySections: ExtraSectionContent[] = [
  {
    key: "privacy-hero",
    name: "Privacy Policy Hero",
    enabled: true,
    eyebrow: "Legal Information",
    title: "Privacy Policy",
    subtitle: "Your privacy is important to us.",
    description: "This Privacy Policy explains how Moksha Sewa (an initiative of Namo Gange Trust) collects, uses, protects, and shares your personal information when you visit our website or use our services.",
    items: [
      { label: "Effective Date", value: "17 August 2026" },
      { label: "Last Updated", value: "17 August 2026" },
      { label: "Governing Law", value: "Laws of India" },
      { label: "Applies To", value: "Website & All Services" }
    ],
  },
  {
    key: "privacy-content",
    name: "Privacy Content",
    enabled: true,
    items: [
      { title: "About Moksha Sewa", description: "Moksha Sewa provides humanitarian assistance relating to dignified final-rites support, particularly for eligible economically weaker families and legally authorised unclaimed cases.\n\nOur services include ambulance/hearse-van coordination, cremation-ground support, wood, cloth, flowers and ritual-material assistance, priest and ritual guidance, family guidance, hospital and ground coordination, food and basic-essentials assistance, volunteer support and documentation guidance.\n\nAll assistance is subject to case verification, availability and applicable legal, police, hospital, municipal and other competent-authority requirements." },
      { title: "Information We Collect", description: "We collect only the information that is necessary for providing our services and improving our experience.\n\n• Name, mobile number, email address\n• Communication preferences\n• City/location and address or service location where required\n• Nature of assistance required and details of the case\n• Documents or details required for legal / authority formalities" },
      { title: "How We Use Your Information", description: "We may use your personal information to:\n\n• Respond to requests for Seva assistance.\n• Verify and assess assistance requests.\n• Coordinate eligible support with families, volunteers, hospitals, cremation grounds and authorities.\n• Maintain records relating to donations, assistance and enquiries.\n• Prevent fraud, misuse and unauthorised activity." },
      { title: "Your Privacy Rights", description: "Subject to applicable law, you may have the following rights regarding your personal data:\n\n• Right to be Informed\n• Right to Access\n• Right to Correction\n• Right to Erasure\n• Right to Withdraw Consent" }
    ]
  },
  {
    key: "privacy-contact",
    name: "Privacy Contact Block",
    enabled: true,
    title: "Have Questions About Your Privacy?",
    description: "If you have any questions, requests or concerns regarding this policy or your personal information, please contact our Grievance Officer.",
    buttonLabel: "Contact Us",
    buttonHref: "/contact"
  },
  {
    key: "privacy-sidebar",
    name: "Sidebar Items",
    enabled: true,
    items: [
      {
        title: "Our Commitment",
        description: "We are committed to transparency and protecting your personal information.\n\nWe collect only what we need and use it responsibly to serve humanity.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165338/moksha-sewa/assets/privacy-policy/our_commitment.webp"
      }
    ]
  }
];

export function mergePrivacySections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultPrivacySections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultPrivacySections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultTermsSections: ExtraSectionContent[] = [
  {
    key: "terms-hero",
    name: "Terms & Conditions Hero",
    enabled: true,
    eyebrow: "Legal Information",
    title: "Terms & Conditions",
    subtitle: "Please read these terms carefully.",
    description: "These terms govern your use of the Moksha Sewa platform and services.",
    items: [
      { label: "Effective Date", value: "17 August 2026" },
      { label: "Last Updated", value: "17 August 2026" },
      { label: "Governing Law", value: "Laws of India" },
      { label: "Applies To", value: "Website & All Services" }
    ],
  },
  {
    key: "terms-content",
    name: "Terms Content",
    enabled: true,
    items: [
      { title: "Acceptance of Terms", description: "By accessing or using the Moksha Sewa website and our services, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use our website or services." },
      { title: "About Moksha Sewa", description: "Moksha Sewa, an initiative of Namo Gange Trust, is dedicated to providing dignified final-rites support and humanitarian assistance to eligible individuals and families, especially for unclaimed and underprivileged cases. Our services are subject to verification, availability and applicable laws." },
      { title: "Use of Our Website", description: "You agree to use our website only for lawful purposes and in a manner that does not infringe the rights of, restrict or inhibit anyone else's use. You must not attempt to gain unauthorized access, interfere with the functioning of the website or introduce harmful code." },
      { title: "Our Services", description: "Services include assistance with ambulance/hearse-van, cremation-ground support, ritual materials, priest guidance, documentation support, food and basic-essentials assistance, volunteer support and related humanitarian services. All services are subject to verification, availability and legal requirements." },
      { title: "Eligibility", description: "Our services are intended for individuals/families in genuine need. We may request information and documents for verification. We reserve the right to accept or decline any request at our sole discretion." },
      { title: "User Responsibilities", description: "You agree to provide accurate, complete and current information. You must not misuse our services, provide false information or engage in any activity that may harm our organisation, beneficiaries, volunteers or service partners." },
      { title: "Requests for Assistance", description: "All requests are subject to verification and availability of resources. Assistance will be provided in accordance with our policies, priorities and capacity. We do not guarantee immediate or specific outcomes." },
      { title: "Donations & Payments", description: "Donations are voluntary and non-refundable. Transactions are processed securely through authorised payment gateways. We do not store your card details, CVV, UPI PIN or net-banking passwords." },
      { title: "Volunteer Engagement", description: "Volunteers must act with compassion, integrity and respect. We reserve the right to accept, assign or terminate volunteer participation based on suitability and conduct." },
      { title: "Content & Intellectual Property", description: "All content on this website, including text, images, logos and graphics, is the property of Moksha Sewa or its licensors. You may not copy, reproduce or use our content without prior written permission." }
    ]
  },
  {
    key: "terms-contact",
    name: "Terms Contact Block",
    enabled: true,
    title: "Questions About These Terms?",
    description: "If you have any questions about these Terms & Conditions, please reach out to us.",
    buttonLabel: "Contact Us",
    buttonHref: "/contact"
  },
  {
    key: "terms-sidebar",
    name: "Sidebar Items",
    enabled: true,
    items: [
      {
        title: "Our Commitment",
        description: "We are committed to transparency and upholding these guidelines for all users.\n\nPlease read carefully before engaging with our services.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165338/moksha-sewa/assets/privacy-policy/our_commitment.webp"
      }
    ]
  }
];

export function mergeTermsSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultTermsSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultTermsSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultRefundSections: ExtraSectionContent[] = [
  {
    key: "refund-hero",
    name: "Refund Policy Hero",
    enabled: true,
    eyebrow: "Legal Information",
    title: "Refund Policy",
    subtitle: "Please read our refund terms carefully",
    description: "At Moksha Sewa, we ensure complete transparency in all our donation and transaction processes. This Refund Policy explains the conditions under which refunds may be considered.",
    items: [
      { label: "Effective Date", value: "17 August 2026" },
      { label: "Last Updated", value: "17 August 2026" },
      { label: "Governing Law", value: "Laws of India" },
      { label: "Applies To", value: "Donations & Transactions" }
    ],
  },
  {
    key: "refund-content",
    name: "Main Sections",
    enabled: true,
    items: [
      { title: "General Donation Policy", description: "As a charitable organisation, Moksha Sewa depends entirely on voluntary donations to fund our humanitarian services. Because these funds are immediately allocated to active cases, ambulance fuel, ritual materials, and daily operations, donations are generally considered final and non-refundable." },
      { title: "Accidental Multiple Deductions", description: "If due to a technical error, network issue, or gateway glitch, your account is charged multiple times for a single donation attempt, you are eligible for a refund of the duplicate amount(s)." },
      { title: "Erroneous Donation Amount", description: "If you accidentally typed a significantly higher amount than intended (e.g., entering ₹10,000 instead of ₹1,000) and notify us immediately within 24 hours, we may review the request on a case-by-case basis." },
      { title: "How to Request a Refund", description: "To request a refund for an accidental or duplicate transaction, you must write to us at info@mokshasewa.org within 3 days (72 hours) of the transaction." },
      { title: "Processing Time", description: "Once a refund is approved by our finance committee, it will be initiated back to the original payment source (credit card, debit card, UPI, or bank account). This process typically takes 7-10 working days, depending on your bank or payment provider." },
      { title: "Tax Exemption (80G) Certificates", description: "If an 80G tax exemption receipt has already been generated and dispatched to you for a specific donation, that donation cannot be refunded under any circumstances, as the transaction has already been legally recorded for tax purposes." }
    ]
  },
  {
    key: "refund-premium-cards",
    name: "Premium Cards",
    enabled: true,
    items: [
      { title: "How to Request a Refund", label: "Simple steps to request your refund hassle-free.", description: "To request a refund, contact us within 7 days of the transaction with your:\n• Full name\n• Transaction ID / Receipt\n• Reason for refund\n• Supporting details (if any)" },
      { title: "Refund Process & Timeline", label: "Know how long it takes to get your refund.", description: "Once your request is reviewed and approved, refunds will be processed within 7–10 working days to the original payment method.", image: "https://images.unsplash.com/photo-1501139083538-0139583c060f?q=80&w=900&auto=format&fit=crop" },
      { title: "Mode of Refund", label: "Refunds through your original payment method.", description: "Refunds will be made using the same method through which the original payment was made." },
      { title: "Chargebacks", label: "Understand the impact of chargebacks on future donations.", description: "Initiating a chargeback without contacting us first may affect your ability to make future donations and will incur additional charges, which will be deducted from the refundable amount (if any).", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=900&auto=format&fit=crop" }
    ]
  },
  {
    key: "refund-addendum-sections",
    name: "Addendum Sections",
    enabled: true,
    items: [
      { title: "Partial Refunds", description: "In certain situations, a partial refund may be considered at our sole discretion depending on the nature of the request and the services or benefits provided." },
      { title: "Changes to This Policy", description: "We may update this Refund Policy from time to time. The updated version will be posted on our website." },
      { title: "Grievance / Contact", description: "For any refund-related queries or grievances, please contact us." }
    ]
  },
  {
    key: "refund-contact",
    name: "Refund Contact Block",
    enabled: true,
    title: "Questions About Refunds?",
    description: "If you have any questions about this Refund Policy, please reach out to us.",
    buttonLabel: "Contact Us",
    buttonHref: "/contact"
  },
  {
    key: "refund-intro",
    name: "Introduction Text",
    enabled: true,
    description: "Moksha Sewa (an initiative of Namo Gange Trust) is a non-profit organisation. Donations made to support our humanitarian activities are voluntary and non-refundable except as provided in this Refund Policy."
  },
  {
    key: "refund-sidebar",
    name: "Sidebar Items",
    enabled: true,
    items: [
      {
        title: "Note",
        description: "Refunds are processed only in eligible cases as per this policy.\n\nWe request you to read this policy carefully before making any donation or payment."
      },
      {
        title: "Our Commitment",
        description: "We are committed to transparency and accountability in managing all donations.\n\nEvery contribution directly supports our mission to serve humanity.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165338/moksha-sewa/assets/privacy-policy/our_commitment.webp"
      }
    ]
  }
];

export function mergeRefundSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultRefundSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultRefundSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}

export const defaultConductSections: ExtraSectionContent[] = [
  {
    key: "conduct-hero",
    name: "Code of Conduct Hero",
    enabled: true,
    eyebrow: "Ethical Standards",
    title: "Code of Conduct",
    subtitle: "Principles That Guide Every Action",
    description: "We uphold strict standards of empathy, privacy, dignity, and zero commercial interest in all our humanitarian activities. This Code applies to all staff, volunteers, and partners.",
    items: [
      { label: "Effective Date", value: "17 August 2026" },
      { label: "Applies To", value: "All Volunteers" },
      { label: "Governing Law", value: "Laws of India" },
      { label: "Scope", value: "Field & Online Conduct" }
    ],
  },
  {
    key: "conduct-content",
    name: "Code of Conduct Content",
    enabled: true,
    items: [
      { title: "Dignity and Respect", description: "Every individual, regardless of their background, caste, religion, or economic status, must be treated with absolute dignity and respect, especially during their final journey." },
      { title: "Empathetic Conduct", description: "Be respectful, calm, and patient with grieving families. Ensure that your tone, words, and actions offer comfort and do not add to their distress." },
      { title: "Strict Confidentiality", description: "Protect family privacy and sensitive case details at all times. Do not share personal information, photos, or details on social media or with unauthorized persons without explicit consent." },
      { title: "Zero Financial Transactions", description: "Volunteers and ground staff must never demand, request, or accept cash, gifts, or favors directly from families. All donations must be routed through official channels." },
      { title: "Legal Compliance", description: "Never bypass legal procedures. Ensure that required police clearances, hospital death certificates, and municipal authorizations are obtained before proceeding with any final rites." },
      { title: "Non-Discrimination", description: "Assistance is provided purely on the basis of humanitarian need. We do not discriminate against any community, faith, gender, or nationality." },
      { title: "Reporting Violations", description: "Any breach of this Code of Conduct must be reported immediately to the central coordination desk for strict disciplinary action." }
    ]
  },
  {
    key: "conduct-contact",
    name: "Code of Conduct Contact",
    enabled: true,
    title: "Report a Violation",
    description: "If you witness a violation of our Code of Conduct, please report it immediately to our Grievance Officer.",
    buttonLabel: "Contact Us",
    buttonHref: "/contact"
  },
  {
    key: "conduct-sidebar",
    name: "Sidebar Items",
    enabled: true,
    items: [
      {
        title: "Our Commitment",
        description: "We are committed to maintaining a respectful, safe, and supportive environment.\n\nBy engaging with our community, you agree to uphold these values.",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165338/moksha-sewa/assets/privacy-policy/our_commitment.webp"
      }
    ]
  }
];

export function mergeConductSections(sections?: ExtraSectionContent[]): ExtraSectionContent[] {
  if (!sections?.length) return defaultConductSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultConductSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}
