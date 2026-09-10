import { normalizeLandingSection, type LandingSectionContent } from "./landingContent";

export type ContactSectionContent = LandingSectionContent;

export const defaultContactSections: ContactSectionContent[] = [
  {
    key: "contact-hero",
    name: "Contact Hero Banner & Quick Info",
    enabled: true,
    eyebrow: "CONTACT US",
    title: "Let's Grow Organic Together",
    subtitle: "We're here to answer your questions, help exhibitors, guide visitors, and support partners.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164944/moksha-sewa/hero-images/dignity-in-every-final-journey-bg.png",
    items: [
      {
        title: "Visit Us",
        description: "Pragati Maidan, New Delhi - 110001, India",
        icon: "MapPin",
      },
      {
        title: "Email Us",
        description: "info@namogangewellness.com",
        icon: "Mail",
      },
      {
        title: "Call Us",
        description: "+91 96549 00525, +91 11 1234 5678",
        icon: "Phone",
      },
      {
        title: "Office Hours",
        description: "Mon - Sat: 9:00 AM - 6:00 PM (Sunday: Closed)",
        icon: "Clock",
      },
    ],
  },
  {
    key: "contact-form",
    name: "Contact Message Form & Expo Advisor",
    enabled: true,
    eyebrow: "REACH OUT TO US",
    title: "Send Us a Message",
    subtitle: "Talk to Expo Advisor",
    description: "Fill out the form below and our team will get back to you promptly.",
    buttonLabel: "Send Message",
    items: [
      {
        title: "General Inquiries",
        description: "Any questions? We're happy to help.",
        icon: "MessageCircle",
      },
      {
        title: "Partnerships & Sponsorships",
        description: "Let's build something meaningful together.",
        icon: "Handshake",
      },
      {
        title: "Speaker & Paper Queries",
        description: "Interested in speaking or presenting?",
        icon: "Mic",
      },
      {
        title: "Media & Press",
        description: "For media collaborations and interviews.",
        icon: "Camera",
      },
      {
        title: "Event Support",
        description: "Need help with registration or events?",
        icon: "Headphones",
      },
    ],
  },
  {
    key: "contact-bottom",
    name: "Map Location & Newsletter Subscription",
    enabled: true,
    eyebrow: "FIND US & SUBSCRIBE",
    title: "Find Us Here & Stay Updated!",
    subtitle: "Subscribe to our newsletter and never miss an update.",
    description: "Pragati Maidan, New Delhi - 110001, India",
    buttonLabel: "Get Directions",
    secondaryButtonLabel: "Subscribe",
  },
];

export function mergeContactSections(sections?: ContactSectionContent[]): ContactSectionContent[] {
  if (!sections?.length) return defaultContactSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultContactSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    return normalizeLandingSection({ ...fallback, ...saved, items, enabled: saved.enabled !== false }, fallback);
  });
}
