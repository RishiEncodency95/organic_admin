import { LandingSectionContent } from "./landingContent";

export const defaultAdvisorySections: LandingSectionContent[] = [
  {
    key: "advisory-hero",
    name: "AdvisoryHero",
    enabled: true,
    eyebrow: "GUIDING. INSPIRING. TRANSFORMING.",
    titlePrimary: "ADVISORY",
    titleSecondary: "BOARD MEMBERS",
    subtitle: "GUIDING. INSPIRING. TRANSFORMING.",
    description: "Our Advisory Board comprises distinguished leaders, industry experts, and visionaries who bring strategic guidance, deep expertise and a shared commitment to drive Bharat Organic Expo towards a sustainable, innovative and impactful future.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Bharat Organic Expo 2027 Advisory Board Members",
    items: [
      { title: "LEADING VISIONARIES", subtitle: "From diverse industries", icon: "Users" },
      { title: "STRATEGIC GUIDANCE", subtitle: "For sustainable growth", icon: "Award" },
      { title: "INDUSTRY EXPERTISE", subtitle: "Driving innovation & impact", icon: "Lightbulb" },
      { title: "COLLABORATIVE LEADERSHIP", subtitle: "Building a stronger organic ecosystem", icon: "Handshake" },
    ],
  },
  {
    key: "chairman-message",
    name: "ChairmanMessage",
    enabled: true,
    eyebrow: "CHAIRMAN'S MESSAGE",
    title: "Leading Together for a Healthier Tomorrow",
    subtitle: "Chairman, Bharat Organic Expo 2027",
    description: "At Bharat Organic Expo 2027, we believe in the power of collaboration, innovation, and sustainability.",
    secondaryDescription: "This platform brings together visionaries, experts, and changemakers to create a lasting impact on health and organic wellness.",
    quote: "A global platform for innovation and collaboration in the organic, health & wellness industry. We aim to empower communities, promote sustainable practices, and drive transformative growth by connecting visionaries and eco-conscious enterprises worldwide.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg",
    imageAlt: "Mr. Vijay Sharma - Chairman",
    authorName: "Mr. Vijay Sharma",
    authorDesignation: "Chairman, Bharat Organic Expo 2027",
  },
  {
    key: "advisory-grid",
    name: "AdvisoryBoardGrid",
    enabled: true,
    eyebrow: "Our Ayurveda Mission",
    title: "Our Esteemed Advisory Board",
    items: [
      {
        title: "Prof. Dr. G.S. Tomar",
        label: "PRESIDENT",
        description: "International President of Our Ayurveda Mission, National Vice-President Arogya Bharti.",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "Professor (Vd.) Pradeep Kumar Prajapati",
        label: "DIRECTOR",
        description: "All India Institute of Ayurveda (AIIA)",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "Dr. Naresh Kumar Chhavania",
        label: "PRESIDENT",
        description: "IMA AYUS",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "Dr. Kamlesh Kumar Dwivedi",
        label: "MEMBER OF THE BOARD OF AYURVEDA",
        description: "National Commission for Indian System of Medicine (NCISM), Ministry of Ayush",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "Prof. (Dr.) Atul Babu Varshney",
        label: "MEMBER OF THE BOARD OF AYURVEDA",
        description: "National Commission for Indian System of Medicine (NCISM), Ministry of Ayush",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "Dr. Sandeep Marwah",
        label: "FOUNDER OF NOIDA FILM CITY",
        description: "Marwah Studios",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "ACHARYA SHRI JAGDISHJI MAHARAJ",
        label: "FOUNDER OF NAMO GANGE TRUST",
        description: "",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "Dr. D.N. Sharma",
        label: "VICE PRESIDENT",
        description: "International Naturopathy Organisation (INO)",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      },
      {
        title: "Dr. Rohit Bhandari",
        label: "FOUNDER & DIRECTOR",
        description: "The Homeo Healers Homeopathy Worldwide",
        location: "India",
        image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg"
      }
    ],
  },
  {
    key: "why-join-advisory",
    name: "WhyJoinAdvisory",
    enabled: true,
    eyebrow: "WHY JOIN",
    title: "The Advisory Board?",
    description: "Be at the forefront of transformative initiatives in the Health & Organic Wellness industry.",
    items: [
      { title: "Shape the Future", description: "Contribute to strategic discussions and help build a healthier world.", icon: "Target" },
      { title: "Global Influence", description: "Engage with leaders and experts from across the globe.", icon: "Globe2" },
      { title: "Thought Leadership", description: "Position yourself as a trusted voice in the health & organic ecosystem.", icon: "Lightbulb" },
      { title: "Drive Impact", description: "Catalyze innovation, sustainability, and industry growth.", icon: "ShieldCheck" },
    ],
  },
  {
    key: "nominate-banner",
    name: "NominateBanner",
    enabled: true,
    eyebrow: "BE PART OF A TRANSFORMATIVE JOURNEY",
    title: "Nominate for the Advisory Board",
    description: "Help us bring the right leaders together to catalyze innovation, sustainability, and industry growth. By nominating experts to our Advisory Board, you contribute directly to shaping the future of organic wellness, driving impactful policies, and fostering a global network dedicated to a sustainable tomorrow.",
    buttonLabel: "Nominate Now",
    buttonHref: "/about/nominate_advisory_board",
    items: [
      { title: "STRONGER LEADERSHIP", icon: "Users" },
      { title: "SUSTAINABLE FUTURE", icon: "Leaf" },
      { title: "INNOVATION DRIVEN", icon: "Lightbulb" },
      { title: "INDUSTRY GROWTH", icon: "TrendingUp" },
    ]
  },
  {
    key: "advisory-partners",
    name: "AdvisoryPartners",
    enabled: true,
    eyebrow: "COLLABORATING ORGANIZATIONS",
    title: "INSTITUTIONAL & INDUSTRY PARTNERS",
    items: [
      { label: "ORGANIZED BY", title: "Namo Gange Trust" },
      { label: "IN ASSOCIATION WITH", title: "Indian Organic Association" },
      { label: "SUPPORTED BY", title: "COMING SOON" },
      { label: "KNOWLEDGE PARTNER", title: "COMING SOON" },
    ],
  },
];
