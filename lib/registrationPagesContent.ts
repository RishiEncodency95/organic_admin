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
  {
    key: "book-stand-international-form-fields",
    name: "International Exhibitor Form Fields",
    enabled: true,
    title: "Exhibitor Details",
    subTitle: "International Exhibitor Registration",
    items: [
      { label: "COMPANY NAME *", placeholder: "Write Here.." },
      { label: "TYPE OF BUSINESS *", placeholder: "Select Here" },
      { label: "INDUSTRY/SECTOR *", placeholder: "Select Here" },
      { label: "WEBSITE *", placeholder: "Write Here.." },
      { label: "EXHIBITOR ADDRESS *", placeholder: "Write Here.." },
      { label: "COUNTRY *", placeholder: "Select Country" },
      { label: "STATE *", placeholder: "Select Here" },
      { label: "CITY *", placeholder: "Select Here" },
      { label: "PINCODE/Postal Code *", placeholder: "Write Here.." },
      { label: "TAX ID / VAT NO.", placeholder: "Write Here.." },
    ],
  },
  {
    key: "book-stand-form-fields",
    name: "Exhibitor Details Form Fields",
    enabled: true,
    title: "Exhibitor Details",
    subTitle: "Domestic Exhibitor Registration",
    items: [
      { label: "COMPANY NAME *", placeholder: "Write Here.." },
      { label: "TYPE OF BUSINESS *", placeholder: "Select Here" },
      { label: "INDUSTRY/SECTOR *", placeholder: "Select Here" },
      { label: "WEBSITE *", placeholder: "Write Here.." },
      { label: "EXHIBITOR ADDRESS *", placeholder: "Write Here.." },
      { label: "COUNTRY *", placeholder: "India" },
      { label: "STATE *", placeholder: "Select Here" },
      { label: "CITY *", placeholder: "Select Here" },
      { label: "PINCODE/Postal Code *", placeholder: "Write Here.." },
      { label: "LANDLINE NO.", placeholder: "Write Here.." },
    ],
  },
  {
    key: "book-stand-contact-details",
    name: "Exhibitor Contact Details",
    enabled: true,
    title: "Exhibitor Contact Details",
    subTitle: "First Contact Person Details",
    items: [
      { label: "TITLE *", placeholder: "Select Here" },
      { label: "FIRST NAME *", placeholder: "Write Here.." },
      { label: "LAST NAME *", placeholder: "Write Here.." },
      { label: "EMAIL *", placeholder: "Official Email", buttonLabel: "Get OTP" },
      { label: "DESIGNATION *", placeholder: "Write Here.." },
      { label: "MOBILE *", placeholder: "10-digit number", buttonLabel: "Get OTP" },
      { label: "ALTERNATE NO. *", placeholder: "10-digit number" },
    ],
  },
  {
    key: "book-stand-legal-agreements",
    name: "Form Legal Agreements & Checkboxes",
    enabled: true,
    title: "Exhibition Policies & Consent Agreements",
    items: [
      { title: "IHWE Stand Booking Terms", description: "I hereby confirm that the information provided is accurate. I have read and agree to the Terms & Conditions and the exhibition policy for IHWE Stand Booking." },
      { title: "Refund & Cancellation Policy", description: "I have read and agree to the Refund & Cancellation Policy for Bharat Organic Expo Stand Booking." },
      { title: "Privacy Policy Consent", description: "I have read and agree to the Privacy Policy of Bharat Organic Expo." },
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
    key: "terms-page-hero",
    name: "Terms & Conditions Hero Banner",
    enabled: true,
    eyebrow: "POLICY GUIDE",
    title: "TERMS & CONDITIONS",
    subtitle: "Bharat Organic Expo 2027",
    description: "Please read these terms carefully before proceeding.",
    buttonLabel: "Print Terms & Conditions",
  },
  {
    key: "terms-page-blocks",
    name: "Terms & Conditions Clauses (14 Items)",
    enabled: true,
    title: "Official Terms & Regulations",
    items: [
      { title: "Acceptance of Terms", description: "By accessing or using our website, registering as a visitor, exhibitor, buyer, or delegate, you agree to comply with and be bound by these Terms and Conditions." },
      { title: "Scope of Services", description: "Bharat Organic Expo 2027 is organized by Namo Gange Wellness Pvt. Ltd. to facilitate trade, exhibition, and networking in the organic and natural product sectors." },
      { title: "Registration & Confirmation", description: "All stall bookings and delegate registrations are subject to approval by the organizer. Confirmation will be issued upon realization of full payment." },
      { title: "Pricing & Applicable Taxes", description: "All stall charges, sponsorship packages, and pass fees are quoted in INR/USD as specified and are subject to applicable GST and taxes." },
      { title: "Refund & Transferability", description: "Payments made towards stall booking or delegate registration are strictly non-refundable and non-transferable except as explicitly stated in our Refund Policy." },
      { title: "Cancellation & Rescheduling", description: "The Organiser reserves the right to cancel, postpone, or alter event dates or venue due to operational requirements or Force Majeure without liability." },
      { title: "Mode of Payment", description: "Payments must be made via authorized online payment gateways, bank transfers, or demand drafts payable to Namo Gange Wellness Pvt. Ltd." },
      { title: "Failed Transactions & Disputes", description: "In case of payment failure or technical error, participants must report the issue within 7 days with proof of transaction." },
      { title: "Chargeback & Fraud Rules", description: "Unjustified chargeback requests or fraudulent activity will result in immediate cancellation of registration and legal recourse." },
      { title: "Role of Associate Partners", description: "ICOA and Namo Gange Trust act as knowledge and associate partners and carry no financial liability regarding bookings." },
      { title: "Limitation of Liability", description: "The Organiser shall not be liable for indirect, incidental, or consequential damages arising from event participation or website usage." },
      { title: "Indemnity", description: "Participants agree to indemnify and hold harmless the Organiser against any claims, losses, or damages resulting from breach of rules." },
      { title: "Force Majeure", description: "Neither party shall be held liable for failure or delay in performance caused by natural disasters, government restrictions, or pandemics." },
      { title: "Governing Law & Jurisdiction", description: "These terms are governed by the laws of India, and disputes shall be subject to the exclusive jurisdiction of courts in Delhi NCR." },
    ],
  },
];

// 5. PRIVACY POLICY PAGE SECTIONS
export const defaultPrivacyPolicySections: LandingSectionContent[] = [
  {
    key: "privacy-page-hero",
    name: "Privacy Policy Hero Banner",
    enabled: true,
    eyebrow: "POLICY GUIDE",
    title: "PRIVACY POLICY",
    subtitle: "Bharat Organic Expo 2027",
    description: "Please read these terms carefully before proceeding.",
    buttonLabel: "Print Privacy Policy",
  },
  {
    key: "privacy-page-blocks",
    name: "Privacy Policy Clauses (14 Items)",
    enabled: true,
    title: "Data Protection & Privacy Terms",
    items: [
      { title: "Scope & Applicability", description: "This policy applies to all visitors, exhibitors, buyers, sponsors, delegates and partners engaging with Bharat Organic Expo 2027 through our website, registration forms, emails or events." },
      { title: "User Rights", description: "You have the right to access, update, correct or request deletion of your personal data by contacting us." },
      { title: "Legal Basis for Processing", description: "We process personal data in accordance with applicable Indian laws including IT Act, 2000 and for legitimate business purposes." },
      { title: "Cookies & Tracking Technologies", description: "We use cookies and analytics tools to enhance user experience. You can manage cookie preferences in your browser settings." },
      { title: "Categories of Information", description: "Personal, business, financial, technical and usage data collected for event execution and communication." },
      { title: "Third-Party Platforms", description: "Our website may contain links to third-party sites. We are not responsible for their privacy practices or content." },
      { title: "Purpose of Data Processing", description: "To manage registrations, communicate updates, facilitate networking, improve experience and ensure smooth event operations." },
      { title: "Children's Privacy", description: "Our services are intended for business professionals. We do not knowingly collect data from individuals below 18 years." },
      { title: "Data Sharing & Disclosure", description: "Data may be shared with event partners, service providers and authorities where necessary and with your consent." },
      { title: "Limitation of Liability", description: "We are not liable for indirect or consequential damages arising from the use or inability to use our services." },
      { title: "Data Security Measures", description: "We implement robust security practices to protect your data against unauthorized access, alteration, disclosure or destruction." },
      { title: "Amendments to Policy", description: "We may update this policy from time to time. Changes will be effective upon posting on our website." },
      { title: "Data Retention Policy", description: "Personal data is retained only as long as necessary for event execution, legal compliance and legitimate business purposes." },
      { title: "Governing Law & Jurisdiction", description: "This policy is governed by the laws of India. Jurisdiction lies with the courts in Delhi NCR, India." },
    ],
  },
];

// 6. REFUND POLICY PAGE SECTIONS
export const defaultRefundPolicySections: LandingSectionContent[] = [
  {
    key: "refund-page-hero",
    name: "Refund Policy Hero Banner",
    enabled: true,
    eyebrow: "POLICY GUIDE",
    title: "REFUND & CANCELLATION POLICY",
    subtitle: "Bharat Organic Expo 2027",
    description: "Please read these terms carefully before proceeding.",
    buttonLabel: "Print Refund Policy",
  },
  {
    key: "refund-page-blocks",
    name: "Refund & Cancellation Rules (13 Items)",
    enabled: true,
    title: "Refund & Cancellation Clauses",
    items: [
      { title: "Scope of Policy", description: "This Refund & Cancellation Policy governs all payments made towards Exhibition Stall Booking, Sponsorship Packages, Buyer / Seller Registration, Delegate Registration, Seminar / Conference Participation and ICOA Buyer Membership." },
      { title: "General Refund Policy", description: "All payments made to Namo Gange Wellness Pvt. Ltd. are strictly non-refundable and non-transferable. By making payment, the Participant acknowledges and agrees to this policy." },
      { title: "No Refund Scenarios", description: "No refund shall be provided under any circumstances including but not limited to: cancellation by participant, non-attendance (no-show), partial participation or early exit, change in business plans, priorities, or schedule, dissatisfaction with business outcomes or networking results." },
      { title: "Event Rescheduling / Modification", description: "The Organiser reserves the right to reschedule, modify, or change venue or format of the Event. In such cases, the registration/booking shall remain valid for the revised event and no refund shall be applicable." },
      { title: "Event Cancellation by Organiser", description: "In rare circumstances, if the Event is cancelled, the Organiser may, at its sole discretion, offer credit for future events or provide alternative participation benefits. Refunds, if any, shall be at the sole discretion of the Organiser and not a matter of right." },
      { title: "Payment Errors / Duplicate Transactions", description: "In case of duplicate payment, excess payment, or technical error during transaction, the Participant must notify within 7 (seven) days of the transaction. After verification, eligible excess amount may be adjusted or refunded." },
      { title: "Refund Processing (If Applicable)", description: "Approved refunds (if any) shall be processed within a reasonable time frame through the original mode of payment, subject to banking norms." },
      { title: "Non-Transferability", description: "Registration, booking, or membership is non-transferable. Substitution of participant is not allowed without prior written approval." },
      { title: "Role of Associate Partners", description: "ICOA and Namo Gange Trust act only as facilitation / knowledge partners. They shall not be responsible for refunds, payment disputes, or financial claims. All refund-related matters shall be handled solely by the Organiser." },
      { title: "Chargebacks & Disputes", description: "Initiating a chargeback without valid grounds shall be treated as breach of agreement. The Organiser reserves the right to suspend participation, recover dues through legal means, and initiate appropriate legal proceedings." },
      { title: "Force Majeure", description: "No refund or liability shall arise due to natural disasters, government restrictions, pandemic, or unforeseen circumstances." },
      { title: "Limitation of Liability", description: "The Organiser shall not be liable for indirect or consequential losses, business loss, missed opportunities, or damages." },
      { title: "Governing Law & Jurisdiction", description: "This Policy shall be governed by the laws of India. Subject to exclusive jurisdiction of Courts in Delhi NCR, India." },
    ],
  },
];
