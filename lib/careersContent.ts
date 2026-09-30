import { LandingSectionContent } from "./landingContent";

// CAREERS PAGE SECTIONS (/careers). Job cards themselves come from Careers > Jobs.
export const defaultCareersSections: LandingSectionContent[] = [
  {
    key: "careers-hero",
    name: "Careers Hero",
    enabled: true,
    eyebrow: "CAREER",
    title: "Be Part of Something Bigger",
    description: "Build your career with Bharat Organic Expo and contribute to a sustainable, healthier and more conscious tomorrow.",
    badgeText: "Join the people who connect business, nature and a better tomorrow.",
    image: "",
    imageAlt: "Professionals networking at a sustainable organic expo",
    items: [
      { title: "Meaningful Work" },
      { title: "Collaborative Team" },
      { title: "Growth Opportunities" },
      { title: "Real Impact" },
    ],
  },
  {
    key: "careers-openings",
    name: "Current Openings",
    enabled: true,
    title: "Current Openings",
    description: "Explore exciting opportunities and find the right role for you.",
    emptyTitle: "No open positions at the moment",
    emptyDescription: "We are not hiring for any specific roles right now. But we are always on the lookout for passionate individuals who want to make a difference.",
    emptyNote: "We will keep your profile on file and reach out when a suitable opportunity arises.",
  },
  {
    key: "careers-why-work",
    name: "Why Work With Us",
    enabled: true,
    title: "Why Work With Us?",
    description: "At Bharat Organic Expo, you’ll grow with a purpose-driven team and be part of a movement that creates lasting change.",
    items: [
      { title: "Purpose-Driven Work" },
      { title: "Inclusive Environment" },
      { title: "Learn from Industry Experts" },
      { title: "Be Part of a Global Platform" },
    ],
  },
  {
    key: "careers-bottom-banner",
    name: "Bottom Banner",
    enabled: true,
    image: "",
    imageAlt: "Don't see the right role? We are always looking for passionate individuals.",
  },
];
