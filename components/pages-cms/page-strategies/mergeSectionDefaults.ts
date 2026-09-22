/**
 * Merges one fallback section template item with the corresponding
 * saved section (if any), applying per-section-key cleanup so the
 * editor never shows stale/renamed fields from older content shapes.
 */
export function mergeSectionWithSavedData(
  fallbackItem: Record<string, any>,
  savedItem: Record<string, any> | undefined,
): Record<string, any> {
  if (!savedItem) return { ...fallbackItem };
  const merged: Record<string, any> = {
    ...fallbackItem,
    ...savedItem,
    items: fallbackItem.items !== undefined ? (
      fallbackItem.items.map((item: Record<string, any>, idx: number) => ({
        ...item,
        ...(savedItem.items?.[idx] || {}),
      }))
    ) : undefined,
  };
  if (fallbackItem.key === "awards-hero" || merged.key === "awards-hero") {
    delete merged.shortDescription;
    if (!merged.date || merged.date.includes("T") || String(merged.date).trim().length < 5) {
      merged.date = "19 - 21 February 2027";
    }
  }
  if (fallbackItem.key === "awards-nomination-hero" || merged.key === "awards-nomination-hero") {
    delete merged.eyebrow;
    if (!merged.date || merged.date.includes("T") || String(merged.date).trim().length < 5) {
      merged.date = "19 - 21 February 2027";
    }
    if (!merged.location) {
      merged.location = "Hall 12, Bharat Mandapam, PRAGATI MAIDAN, NEW DELHI, INDIA";
    }
    if (!merged.title || merged.title === "SUBMIT YOUR AWARD NOMINATION") {
      merged.title = "Bharat Organic Excellence Awards 2027";
    }
    if (!merged.subtitle || merged.subtitle === "Celebrate your brand & enterprise innovation.") {
      merged.subtitle = "Celebrating Excellence • Innovation • Sustainability";
    }
    if (!merged.description || merged.description.includes("Fill out the nomination form below")) {
      merged.description = "Honouring the changemakers, organizations and innovations during india's organic, natural and sustainable future.";
    }
  }
  if (fallbackItem.key === "awards-stats" || merged.key === "awards-stats") {
    delete merged.eyebrow;
    delete merged.title;
  }
  if (fallbackItem.key === "awards-about" || merged.key === "awards-about") {
    delete merged.image;
    delete merged.imageAlt;
  }
  if (fallbackItem.key === "awards-categories" || merged.key === "awards-categories") {
    delete merged.description;
    delete merged.shortDescription;
  }
  if (fallbackItem.key === "awards-grand-awards" || merged.key === "awards-grand-awards") {
    delete merged.description;
    delete merged.shortDescription;
  }
  if (fallbackItem.key === "awards-process" || merged.key === "awards-process") {
    delete merged.description;
    delete merged.shortDescription;
  }
  if (fallbackItem.key === "why-exhibit-hero" || merged.key === "why-exhibit-hero") {
    delete merged.date;
    delete merged.location;
    if (merged.bgImage === undefined) merged.bgImage = "";
    if (Array.isArray(merged.items)) {
      merged.items = merged.items.map((it: any, idx: number) => {
        const copy = { ...it };
        delete copy.icon;
        return {
          ...copy,
          image: copy.image || copy.img || `/uploads/icons/x${(idx % 4) + 1}.png`,
        };
      });
    }
  }
  if (fallbackItem.key === "industry-segments" || merged.key === "industry-segments") {
    delete merged.description;
    delete merged.shortDescription;
    delete merged.buttonLabel;
    delete merged.buttonHref;
  }
  if (fallbackItem.key === "testimonials-section" || merged.key === "testimonials-section") {
    delete merged.subtitle;
    delete merged.items;
  }
  if (fallbackItem.key === "audience-strip" || merged.key === "audience-strip") {
    delete merged.title;
  }
  if (fallbackItem.key === "introduction-section" || merged.key === "introduction-section") {
    delete merged.items;
    if (!merged.description2) {
      merged.description2 =
        "Designed to foster business growth, knowledge sharing, innovation, and international collaboration, Bharat Organic Expo serves as the perfect destination for discovering new products, building strategic partnerships, expanding global markets, and promoting a sustainable future.";
    }
    if (!merged.timerTitle) merged.timerTitle = "EVENT BEGINS IN";
    if (!merged.eventDate) merged.eventDate = "2027-02-19T00:00:00";
    if (merged.showTimer === undefined) merged.showTimer = true;
  }
  if (fallbackItem.key === "global-platform" || merged.key === "global-platform") {
    delete merged.subtitle;
    delete merged.title;
    delete merged.image;
    delete merged.imageAlt;
    if (!merged.keyPoint1) merged.keyPoint1 = "International Exhibitors & Global Brands";
    if (!merged.keyPoint2) merged.keyPoint2 = "Buyers, Distributors & Importers";
    if (!merged.keyPoint3) merged.keyPoint3 = "Research & Innovation | Startups";
    if (!merged.keyPoint4) merged.keyPoint4 = "Investors, Financial Institutions";
    if (!merged.keyPoint5) merged.keyPoint5 = "Government Bodies, Embassies & Policy Makers";
    merged.items = (merged.items || []).filter(
      (it: any) =>
        !/trusted brands|targeted audience|business growth/i.test(it.title || "")
    );
  }
  if (fallbackItem.key === "why-participate" || merged.key === "why-participate") {
    delete merged.subtitle;
    delete merged.title;
    delete merged.items;
    if (!merged.keyPoint1) merged.keyPoint1 = "Meet genuine buyers, distributors, retailers, and healthcare professionals";
    if (!merged.keyPoint2) merged.keyPoint2 = "Generate high-quality B2B & B2C leads with faster business conversions";
    if (!merged.keyPoint3) merged.keyPoint3 = "Launch new products with maximum visibility and market impact";
    if (!merged.keyPoint4) merged.keyPoint4 = "Expand your dealer, distributor, franchise, and export network";
    if (!merged.keyPoint5) merged.keyPoint5 = "Strengthen brand presence through live demos and media exposure";
    if (!merged.keyPoint6) merged.keyPoint6 = "Connect with investors, CEOs, doctors, and key decision-makers";
    if (!merged.keyPoint7) merged.keyPoint7 = "Achieve higher ROI with direct customer engagement and trust building";
    if (!merged.buttonLabel) merged.buttonLabel = "BOOK A STALL";
    if (!merged.buttonHref) merged.buttonHref = "/registration/book-a-stand";
    if (!merged.secondaryButtonLabel) merged.secondaryButtonLabel = "Download Brochure";
    if (!merged.secondaryButtonHref) merged.secondaryButtonHref = "/download/invited card.pdf";
    if (!merged.tertiaryButtonLabel) merged.tertiaryButtonLabel = "Why Exhibit?";
    if (!merged.tertiaryButtonHref) merged.tertiaryButtonHref = "/why-exhibit";
  }
  if (fallbackItem.key === "conference-section" || merged.key === "conference-section") {
    delete merged.subtitle;
    delete merged.title;
    delete merged.items;
    if (!merged.eyebrow) merged.eyebrow = "GLOBAL CONFERENCE & SEMINARS";
    if (!merged.titlePrimary) merged.titlePrimary = "Where Knowledge Meets";
    if (!merged.titleSecondary) merged.titleSecondary = "the Future of Organic";
    if (!merged.description) merged.description = "Join expert-led sessions, panel discussions & thought leadership talks on the latest trends shaping the future of organic, natural and sustainable living.";
    if (!merged.buttonLabel) merged.buttonLabel = "View Conference Schedule";
    if (!merged.buttonHref) merged.buttonHref = "https://arogya.namogange.org/";
    if (!merged.keyPoint1) merged.keyPoint1 = "Expert-led panel discussions & keynotes";
    if (!merged.keyPoint2) merged.keyPoint2 = "Emerging trends in organic farming & retail";
    if (!merged.keyPoint3) merged.keyPoint3 = "Sustainable business & growth strategies";
    if (!merged.stat1Title) merged.stat1Title = "19 – 21";
    if (!merged.stat1Sub) merged.stat1Sub = "FEBRUARY 2027";
    if (!merged.stat2Title) merged.stat2Title = "PRAGATI MAIDAN";
    if (!merged.stat2Sub) merged.stat2Sub = "NEW DELHI";
    if (!merged.stat3Title) merged.stat3Title = "INSIGHTS. IDEAS.";
    if (!merged.stat3Sub) merged.stat3Sub = "IMPACT.";
    if (!merged.stat4Title) merged.stat4Title = "50+ GLOBAL";
    if (!merged.stat4Sub) merged.stat4Sub = "SPEAKERS";
    if (!merged.stat5Title) merged.stat5Title = "20+ KEY";
    if (!merged.stat5Sub) merged.stat5Sub = "SESSIONS";
  }
  if (fallbackItem.key === "expo-categories" || merged.key === "expo-categories") {
    delete merged.image;
    delete merged.imageAlt;
    delete merged.title;
    delete merged.subtitle;
    if (!merged.sectionTag) merged.sectionTag = "Expo Categories";
    if (!merged.titleMain) merged.titleMain = "Explore Diverse";
    if (!merged.titleHighlight) merged.titleHighlight = "Exhibition Sectors";
    if (!merged.descriptionPrefix) merged.descriptionPrefix = "One Platform. Every Opportunity.";
    if (!merged.description) merged.description = "Bharat Organic Expo brings together the entire organic ecosystem under one roof. Explore a wide range of sectors driving sustainable living, natural wellness, ethical production and global trade.";
    if (!merged.buttonText) merged.buttonText = "VIEW ALL CATEGORIES";
    if (!merged.buttonHref) merged.buttonHref = "/exhibition-categories";
    if (!merged.exploreText) merged.exploreText = "Explore";
    if (Array.isArray(merged.items)) {
      merged.items = merged.items.map((it: any) => {
        const clean = { ...it };
        delete clean.icon;
        delete clean.desc;
        delete clean.color;
        delete clean.imageAlt;
        if (clean.description === undefined) clean.description = it.desc || "";
        if (clean.image === undefined) clean.image = "";
        if (!clean.href) clean.href = it.link || "/exhibition-categories";
        if (!clean.exploreText) clean.exploreText = "Explore";
        return clean;
      });
    }
  }
  if (fallbackItem.key === "beyond-exhibition" || merged.key === "beyond-exhibition") {
    delete merged.title;
    delete merged.subtitle;
    if (!merged.sectionTag) merged.sectionTag = "Global Organic Platform";
    if (!merged.titleMain) merged.titleMain = "Beyond An";
    if (!merged.titleHighlight) merged.titleHighlight = "Exhibition";
    if (!merged.description) merged.description = "Join India's most powerful ecosystem for the organic industry. From high-impact B2B matchmaking and leadership summits to global networking, we provide everything you need to scale your business.";
    if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";
    if (!merged.imageAlt) merged.imageAlt = "Conferences & Seminars";
    if (Array.isArray(merged.items)) {
      merged.items = merged.items.map((it: any) => ({
        title: it.title || "",
        description: it.description || it.subtitle || "",
        icon: it.icon || "Users",
      }));
    }
  }
  if (fallbackItem.key === "sponsors-attend" || merged.key === "sponsors-attend") {
    delete merged.title;
    delete merged.subtitle;
    delete merged.rightTitle;
    delete merged.rightBottomText;
    delete merged.centerText1;
    delete merged.centerText2;
    delete merged.centerText3;
    delete merged.items;
    if (!merged.titlePrefix) merged.titlePrefix = "WHY";
    if (!merged.titleHighlight) merged.titleHighlight = "ATTEND?";
    if (!merged.description) merged.description = "Explore innovations, build connections and gain insights that drive better health and stronger businesses.";
    if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/moksha-sewa/assets/km.jpg";
    if (!merged.imageAlt) merged.imageAlt = "Why Attend Expo";
    if (!merged.buttonLabel) merged.buttonLabel = "REGISTER AS VISITOR!";
    if (!merged.buttonHref) merged.buttonHref = "/registration/visitor-registration";
    if (!merged.feature1Title) merged.feature1Title = "DISCOVER";
    if (!merged.feature1Desc) merged.feature1Desc = "Explore the latest organic products and eco-friendly services driving a sustainable future.";
    if (!merged.feature2Title) merged.feature2Title = "LEARN";
    if (!merged.feature2Desc) merged.feature2Desc = "Attend seminars, workshops and live demos by organic agriculture and sustainability experts.";
    if (!merged.feature3Title) merged.feature3Title = "CONNECT";
    if (!merged.feature3Desc) merged.feature3Desc = "Meet leading organic brands, manufacturers and sustainable suppliers under one roof.";
    if (!merged.feature4Title) merged.feature4Title = "SOURCE";
    if (!merged.feature4Desc) merged.feature4Desc = "Find trusted organic suppliers, distributors and eco-franchise opportunities.";
    if (!merged.feature5Title) merged.feature5Title = "GROW";
    if (!merged.feature5Desc) merged.feature5Desc = "Unlock new green business opportunities, partnerships and eco-investment possibilities.";
    if (!merged.feature6Title) merged.feature6Title = "STAY AHEAD";
    if (!merged.feature6Desc) merged.feature6Desc = "Stay updated with market trends, conscious consumer insights and future organic industry developments.";
    if (!merged.keyPoint1) merged.keyPoint1 = "Organic Distributors, Wholesalers & Retailers";
    if (!merged.keyPoint2) merged.keyPoint2 = "Eco-Importers & Exporters";
    if (!merged.keyPoint3) merged.keyPoint3 = "Ayurvedic Institutions & Wellness Centers";
    if (!merged.keyPoint4) merged.keyPoint4 = "Nutritionists, Farmers & Wellness Experts";
    if (!merged.keyPoint5) merged.keyPoint5 = "Gym Owners, Spa & Eco-Fitness Professionals";
    if (!merged.keyPoint6) merged.keyPoint6 = "Organic Farming & Natural Product Buyers";
    if (!merged.keyPoint7) merged.keyPoint7 = "Sustainable Packaging & Eco-friendly Brands";
    if (!merged.keyPoint8) merged.keyPoint8 = "Investors, Franchise Seekers & Green Business";
    if (!merged.keyPoint9) merged.keyPoint9 = "Supermarkets & Organic Grocery Chains";
    if (!merged.keyPoint10) merged.keyPoint10 = "Health-Conscious Consumers & Eco-Enthusiasts";
  }
  if (fallbackItem.key === "footer" || merged.key === "footer") {
    delete merged.title;
    delete merged.subtitle;
    delete merged.partnerLogoImage;
    delete merged.secondaryImage;
    delete merged.tertiaryImage;
    delete merged.altPhoneNumber;
    if (!merged.websiteUrl) merged.websiteUrl = "www.bharatorganicexpo.com";
    if (merged.description === undefined || merged.description.startsWith("Showcasing certified products")) {
      merged.description =
        "A global platform uniting over 500+ exhibitors from across the organic value chain, showcasing certified products, advanced agritech, sustainable practices, and the rich heritage of traditional wellness. Discover organic living with conferences and B2B opportunities.";
    }
    if (merged.logoImage === undefined || merged.logoImage.includes("km.jpg")) {
      merged.logoImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240083-112323989.png";
    }
    if (merged.leafImage === undefined) {
      merged.leafImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240457-21656484.png";
    }
    if (merged.downImage === undefined) {
      merged.downImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240816-597711504.png";
    }
    if (merged.organisedByLogo === undefined) {
      merged.organisedByLogo = "http://localhost:4000/uploads/bharat-organic_footer/1789129241128-849314126.png";
    }
    if (merged.bottomBannerImage === undefined) {
      merged.bottomBannerImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129242465-452827954.webp";
    }
    if (merged.contactAddress === undefined) merged.contactAddress = "Hall 12, Pragati Maidan, New Delhi, India 110001";
    if (merged.phoneNumber === undefined) merged.phoneNumber = "+91 96549 00525";
    if (merged.conferenceHelpline === undefined) merged.conferenceHelpline = "+91 98183 53841";
    if (merged.contactEmail === undefined) merged.contactEmail = "info@namogangewellness.com";
    if (merged.facebookUrl === undefined) merged.facebookUrl = "https://facebook.com/bharatorganicexpo";
    if (merged.twitterUrl === undefined) merged.twitterUrl = "https://twitter.com/bharatorganic";
    if (merged.linkedinUrl === undefined) merged.linkedinUrl = "https://linkedin.com/company/bharatorganicexpo";
    if (merged.instagramUrl === undefined) merged.instagramUrl = "https://instagram.com/bharatorganicexpo";
    if (merged.youtubeUrl === undefined) merged.youtubeUrl = "https://youtube.com/@bharatorganicexpo";
    if (!merged.items || merged.items.length === 0) {
      merged.items = [
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
      ];
    }
  }
  return merged;
}
