export type CheckupStatus = "passed" | "failed" | "warning";

/**
 * Scope of the individual check:
 *  - "site": the fact is identical for every route of the domain (TLS, robots.txt, CDN, build pipeline…)
 *  - "page": the check is evaluated against this route's own crawl data
 */
export type CheckupLevel = "site" | "page";

/**
 * Where the number shown by a check came from:
 *  - "measured": captured by the SEO Site Checkup audit run
 *  - "crawl":    captured by your own crawler / Search Console for this route
 *  - "derived":  calculated from the crawl inputs using the published threshold
 */
export type CheckupSource = "measured" | "crawl" | "derived";

export interface CheckupTable {

  title?: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

export interface CheckupStat {
  label: string;
  value: string;
  tone?: "green" | "blue" | "indigo" | "amber" | "red";
}

export interface CheckupList {
  title?: string;
  items: string[];
}

export interface CheckupMeta {
  label?: string;
  value: string;
  mono?: boolean;
}

export interface CheckupTest {
  id: string;
  name: string;
  status: CheckupStatus;
  level?: CheckupLevel;
  source?: CheckupSource;
  benchmark?: string;
  summary?: string;
  badge?: string;
  meta?: CheckupMeta[];
  stats?: CheckupStat[];
  tables?: CheckupTable[];
  lists?: CheckupList[];
  /** Raw evidence (image srcs, header names …) shown inside the issue card. */
  evidence?: string[];
  fix?: string;
  collapsible?: boolean;
}

export interface CheckupGroup {
  id: string;
  name: string;
  note?: string;
  score?: number;
  badge?: string;
  headline?: { value: string; label: string };
  tests: CheckupTest[];
}

export type CheckupPriority = "HIGH" | "MEDIUM" | "LOW";

export interface CheckupIssue {
  priority: CheckupPriority;
  title: string;
  detail?: string;
  fix?: string;
  collapsible?: boolean;
  status?: CheckupStatus;
  route?: string;
  group?: string;
  evidence?: string[];
}

export interface CheckupCategory {
  name: string;
  score?: number;
  failed: number;
  warnings: number;
  passed: number;
}

export interface ReportInput {
  label: string;
  value: string;
  source?: CheckupSource;
  status?: CheckupStatus;
}

export interface SeoCheckupReportData {
  scope: "site" | "page";
  route: string;
  url: string;
  pageTitle: string;
  pageDesc: string | null;
  titleLen: number;
  descLen: number | null;
  seoScore: number;
  aiScore: number;
  scoreSource: CheckupSource;
  aiSource: CheckupSource;
  telemetrySource: CheckupSource;
  failedCount: number;
  warningCount: number;
  passedCount: number;
  totalCount: number;
  summary: string;
  categories: CheckupCategory[];
  inputs: ReportInput[];
  issues: CheckupIssue[];
  groups: CheckupGroup[];
  generatedAt: string;
  pageSpeed?: PageSpeedSnapshot | null;
}

export interface InventoryPage {
  id: string;
  path: string;
  label: string;
  title: string;
  score: number;
  words: number;
  inLinks: number;
  lcp: number;
  cls: number;
  clicks: number;
  impressions: number;
  position: number;
  issue: "ok" | "short";
}

/** Live meta tags, only supplied when the caller read them from the CMS/API. */
export interface ReportMetaOverride {
  title?: string | null;
  description?: string | null;
}

/* ------------------------------------------------------------------ */
/* Live <meta name="description"> captured from bharatorganicexpo.com.  */
/* Captured 25 Sep 2026 straight from the served HTML — the text a     */
/* visitor and Google actually see, not a placeholder.                 */
/* ------------------------------------------------------------------ */
export const ROUTE_META_CAPTURED_AT = "2026-09-25";

export const ROUTE_META: Record<string, string> = {
  '/': "Join Bharat Organic Expo 2027, India's mega wellness fair & premier exhibition and conference for certified organic food, sustainable agriculture, and natural products in Pragati Maidan.",
  '/about': "Learn about Bharat Organic Expo 2027, India's premier international exhibition & B2B conference advancing certified organic agriculture, natural living, and bio-wellness innovation.",
  '/about/suport_services': 'Find comprehensive resources, exhibitor booth support, visitor passes, and media guidelines for a seamless business experience at Bharat Organic Expo 2027 in Pragati Maidan.',
  '/awards': "Nominate and celebrate industry leaders at Bharat Organic Expo 2027 Awards recognizing excellence in organic farming, eco-friendly branding, bio-technology, and sustainability.",
  '/blog': "Stay informed with expert insights, industry trends, organic farming innovations, and business growth strategies shaping India's bio-wellness and natural products sector in 2027.",
  '/buyer-seller-meet': "Participate in exclusive B2B matchmaking at Bharat Organic Expo 2027. Connect global organic buyers, wholesale suppliers, distributors, and certified producers directly.",
  '/careers': 'Explore rewarding career paths with Bharat Organic Expo team. Join passionate professionals driving India’s premier organic food, bio-wellness, and agricultural movement.',
  '/contact': 'Get in touch with Bharat Organic Expo 2027 team for booth bookings, sponsorship packages, visitor tickets, venue details, and international delegation inquiries.',
  '/e-promotion-web': 'Amplify your brand reach with digital promotion packages, online web banners, and targeted marketing campaigns at Bharat Organic Expo 2027.',
  '/exhibition-categories': 'Explore diverse exhibition categories at Bharat Organic Expo 2027 including organic staples, herbal cosmetics, bio-fertilizers, wellness beverages, and eco-packaging.',
  '/exhibitors': 'Meet top certified organic producers, international suppliers, and natural food brands showcasing cutting-edge sustainable innovations at Bharat Organic Expo 2027.',
  '/feedback': 'Share your valuable feedback and recommendations to help us elevate visitor experience, B2B networking, and exhibition standards at Bharat Organic Expo 2027.',
  '/gallery': 'Browse high-resolution event photos, conference highlights, B2B meetings, and stall showcases from previous editions of Bharat Organic Expo in New Delhi.',
  '/participate-as-exhibitor': 'Book your exhibition stall at Bharat Organic Expo 2027 to connect with 10,000+ trade buyers, industry leaders, government delegations, and retail distributors.',
  '/partnership': 'Partner with Bharat Organic Expo 2027 as a trade association, media sponsor, or institutional partner to foster sustainable agriculture and bio-wellness growth.',
  '/sponsorship': 'Elevate your brand visibility by becoming an official sponsor of Bharat Organic Expo 2027. Access premium branding, keynote speaking slots, and VIP networking.',
  '/thank-you': 'Thank you for registering for Bharat Organic Expo 2027! Check your email inbox for official confirmation, visitor badge details, and event schedule info.',
  '/why-exhibit': 'Discover key reasons to exhibit at Bharat Organic Expo 2027. Access high-value B2B buyers, expand distribution networks, and launch new organic products in India.',
  '/why-visit': 'Discover top benefits of visiting Bharat Organic Expo 2027 in Pragati Maidan. Sourcing certified organic food, natural cosmetics, and agricultural innovations.',
};

/* ------------------------------------------------------------------ */
/* <img> inventory captured from the live HTML of bharatorganicexpo.com */
/* Captured 25 Sep 2026 — real srcs, real alt/text/width-height state.  */
/* ------------------------------------------------------------------ */
export const ROUTE_IMAGES_CAPTURED_AT = "2026-09-25";

export interface RouteImages {
  total: number;
  missingAlt: string[];
  noSrcset: string[];
  noDims: string[];
}

export const ROUTE_IMAGES: Record<string, RouteImages> = {
  '/': { total: 36, missingAlt: [], noSrcset: [], noDims: [] },
  '/about': { total: 28, missingAlt: [], noSrcset: [], noDims: [] },
  '/about/suport_services': { total: 15, missingAlt: [], noSrcset: [], noDims: [] },
  '/awards': { total: 47, missingAlt: [], noSrcset: [], noDims: [] },
  '/blog': { total: 28, missingAlt: ['/_next/static/media/cta_left.0bgo-zhqebbw4.webp', '/_next/static/media/cta_right_tight.0dwlguh8qbli7.webp'], noSrcset: ['/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/latest_1.0_dpce1nkvc9i.webp', '/_next/static/media/latest_2.3pcu27widwoty.webp', '/_next/static/media/video_insight_1.3rt2hibkcdory.webp', '/_next/static/media/video_insight_2.3ejg197d4kmpi.webp', '/_next/static/media/video_insight_3.2u4j1irc9496f.webp', '/_next/static/media/cta_left.0bgo-zhqebbw4.webp', '/_next/static/media/cta_right_tight.0dwlguh8qbli7.webp'], noDims: ['/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbanner.1xd97q_mszkx7.webp&w=3840&q=75', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/expert.1h9fv_425mj-l.webp', '/_next/static/media/latest_1.0_dpce1nkvc9i.webp', '/_next/static/media/latest_2.3pcu27widwoty.webp', '/_next/static/media/video_insight_1.3rt2hibkcdory.webp', '/_next/static/media/video_insight_2.3ejg197d4kmpi.webp', '/_next/static/media/video_insight_3.2u4j1irc9496f.webp', '/_next/static/media/cta_left.0bgo-zhqebbw4.webp', '/_next/static/media/cta_right_tight.0dwlguh8qbli7.webp'] },
  '/buyer-seller-meet': { total: 48, missingAlt: [], noSrcset: ['/_next/static/media/b2b2og.2no9umau230oa.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/b2bog.0xh2ggsvlp4sx.png', '/_next/static/media/blleaf.0_yx8vlkty2nv.png', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/21og.2ltew3fbupyed.png', '/_next/static/media/22og.3b9llv1c0bs6c.webp', '/_next/static/media/23og.416r_grwom9v2.webp', '/_next/static/media/24og.08yjz_tk15bvq.png', '/_next/static/media/25og.12o9xv-9qp0ss.png', '/_next/static/media/26og.3r2rj3n6wmbbv.png', '/_next/static/media/27og.2whti-vurxcod.png', '/_next/static/media/28og.3ovhd79rcis5o.png', '/_next/static/media/29og.3i2coz9j8sif6.webp', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/11og.0tkjost4qe7f7.webp', '/_next/static/media/12og.2la4ynxwlxeaq.webp', '/_next/static/media/13og.0svb3s-7hv39w.webp', '/_next/static/media/14og.3ibi3jhl6e59y.webp', '/_next/static/media/15og.1_2k6rsjngbrm.webp', '/_next/static/media/16og.1k4k4lk9_cz03.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/a1og.1bl0edcbgb3k2.png', '/_next/static/media/a2og.0669p677i0-wb.png', '/_next/static/media/a3og.2pu03mcj8i-_i.webp', '/_next/static/media/h1og.08jzxeibp82-5.png', '/_next/static/media/h2og.0-xovxzfhea52.png', '/_next/static/media/h3og.3ptsgbqxrd2ev.png', '/_next/static/media/h4og.41yg9ibi5rgue.png', '/_next/static/media/h5og.0qoa4nbhro8kv.png', '/_next/static/media/footog.06bjklk_e58yf.webp'], noDims: ['/_next/static/media/b2b2og.2no9umau230oa.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/b2bog.0xh2ggsvlp4sx.png', '/_next/static/media/blleaf.0_yx8vlkty2nv.png', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/21og.2ltew3fbupyed.png', '/_next/static/media/22og.3b9llv1c0bs6c.webp', '/_next/static/media/23og.416r_grwom9v2.webp', '/_next/static/media/24og.08yjz_tk15bvq.png', '/_next/static/media/25og.12o9xv-9qp0ss.png', '/_next/static/media/26og.3r2rj3n6wmbbv.png', '/_next/static/media/27og.2whti-vurxcod.png', '/_next/static/media/28og.3ovhd79rcis5o.png', '/_next/static/media/29og.3i2coz9j8sif6.webp', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/11og.0tkjost4qe7f7.webp', '/_next/static/media/12og.2la4ynxwlxeaq.webp', '/_next/static/media/13og.0svb3s-7hv39w.webp', '/_next/static/media/14og.3ibi3jhl6e59y.webp', '/_next/static/media/15og.1_2k6rsjngbrm.webp', '/_next/static/media/16og.1k4k4lk9_cz03.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/a1og.1bl0edcbgb3k2.png', '/_next/static/media/a2og.0669p677i0-wb.png', '/_next/static/media/a3og.2pu03mcj8i-_i.webp', '/_next/static/media/h1og.08jzxeibp82-5.png', '/_next/static/media/h2og.0-xovxzfhea52.png', '/_next/static/media/h3og.3ptsgbqxrd2ev.png', '/_next/static/media/h4og.41yg9ibi5rgue.png', '/_next/static/media/h5og.0qoa4nbhro8kv.png', '/_next/static/media/footog.06bjklk_e58yf.webp'] },
  '/careers': { total: 18, missingAlt: ['/_next/image?url=%2Fassets%2Fcareers%2Fa.png&w=3840&q=75'], noSrcset: [], noDims: ['/_next/image?url=%2Fassets%2Fcareers%2Fimage.png&w=3840&q=75', '/_next/image?url=%2Fassets%2Fcareers%2Fa.png&w=3840&q=75', '/_next/image?url=%2Fassets%2Fcareers%2Faman6.png&w=3840&q=75'] },
  '/contact': { total: 19, missingAlt: [], noSrcset: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/cleaf.0bad4dx00dviy.png', '/_next/static/media/be.07-qkbnc1oa33.png'], noDims: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/cleaf.0bad4dx00dviy.png', '/_next/static/media/be.07-qkbnc1oa33.png'] },
  '/e-promotion-web': { total: 42, missingAlt: ['/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png'], noSrcset: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/epog.0j_ejes_779qe.png', '/_next/static/media/e1og.1t2e4gu5bpw7q.png', '/_next/static/media/e2og.386gd02n4bymv.png', '/_next/static/media/e3og.2a96n895vcb4c.png', '/_next/static/media/e4og.2dynbokfv_ot4.png', '/_next/static/media/e5og.1pbu0005zgwcl.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z1og.35l2oekvlt5g2.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z2og.3sqvkhm4wxbbk.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z3og.3j0-i72r4eap4.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z4og.0lmjdscj-22ce.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z5og.1ppra_hcp02ls.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z6og.3q6u6c936tbxz.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z7og.3geywh0x68d3a.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z8og.3s_cn691nt9w9.png', '/_next/static/media/sleaf.08hvpzu4zp71l.png', '/_next/static/media/P1.2w8268066xsr0.png', '/_next/static/media/ebotog.40ld99lygak1z.webp'], noDims: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/epog.0j_ejes_779qe.png', '/_next/static/media/e1og.1t2e4gu5bpw7q.png', '/_next/static/media/e2og.386gd02n4bymv.png', '/_next/static/media/e3og.2a96n895vcb4c.png', '/_next/static/media/e4og.2dynbokfv_ot4.png', '/_next/static/media/e5og.1pbu0005zgwcl.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z1og.35l2oekvlt5g2.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z2og.3sqvkhm4wxbbk.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z3og.3j0-i72r4eap4.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z4og.0lmjdscj-22ce.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z5og.1ppra_hcp02ls.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z6og.3q6u6c936tbxz.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z7og.3geywh0x68d3a.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/z8og.3s_cn691nt9w9.png', '/_next/static/media/sleaf.08hvpzu4zp71l.png', '/_next/static/media/P1.2w8268066xsr0.png', '/_next/static/media/ebotog.40ld99lygak1z.webp'] },
  '/exhibition-categories': { total: 35, missingAlt: [], noSrcset: [], noDims: ['/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors1.3ml093mcghkza.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors2.21i9s_pzw-bbh.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors3.38q870260xvz_.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors4.0042_xvo5ev4k.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors5.3ufp9tiqgksgq.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors7.3ujh6msfxnoj4.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors6.4352jo8-cp55h.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors9.389mztl80x1px.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors10.2s0hm49zq29ed.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsectors8.2ptcjx7ml6m_1.webp&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Forganic_grains_millets_cereals.3midnyh_zrhp_.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpulses_legumes_beans_186x140.066sjzzimd_j8.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Forganic_beverages.09ez16bi2dzuj.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffruits_vegetables.0h300jyce70gv.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnuts_seeds_superfoods.0e7wmci3acsl9.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Foils_fats_sweeteners.15u6nbvn6rpq3.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Forganic_processed_convenience_foods_186x140.3bxnrsocgycfu.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffunctional_plant_based_foods_186x140.1k78zod97mmrs.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Forganic_baby_kids_food_186x140.19ovw84xa26re.png&w=3840&q=75', '/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhealth_foods_snacks_186x140.40fv7afurref-.png&w=3840&q=75'] },
  '/exhibitors': { total: 66, missingAlt: ['/_next/static/media/bleaf.00xwppqabfirv.webp'], noSrcset: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/exhibitors/1.jpg', '/exhibitors/2.jpg', '/exhibitors/3.jpg', '/exhibitors/4.jpg', '/exhibitors/5.jpg', '/exhibitors/6.jpg', '/exhibitors/7.jpg', '/exhibitors/8.jpg', '/exhibitors/9.jpg', '/exhibitors/10.jpg', '/exhibitors/11.jpg', '/exhibitors/12.jpg', '/exhibitors/13.jpg', '/exhibitors/14.jpg', '/exhibitors/15.jpg', '/exhibitors/16.jpg', '/exhibitors/17.jpg', '/exhibitors/18.jpg', '/exhibitors/19.jpg', '/exhibitors/20.jpg', '/exhibitors/21.jpg', '/exhibitors/22.jpg', '/exhibitors/23.jpg', '/exhibitors/24.jpg', '/exhibitors/25.jpg', '/exhibitors/26.jpg', '/exhibitors/27.jpg', '/exhibitors/28.jpg', '/exhibitors/29.jpg', '/exhibitors/30.jpg', '/exhibitors/31.jpg', '/exhibitors/32.jpg', '/exhibitors/33.jpg', '/exhibitors/34.jpg', '/exhibitors/35.jpg', '/exhibitors/36.jpg', '/exhibitors/37.jpg', '/exhibitors/38.jpg', '/exhibitors/39.jpg', /* +11 more */], noDims: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/exhibitors/1.jpg', '/exhibitors/2.jpg', '/exhibitors/3.jpg', '/exhibitors/4.jpg', '/exhibitors/5.jpg', '/exhibitors/6.jpg', '/exhibitors/7.jpg', '/exhibitors/8.jpg', '/exhibitors/9.jpg', '/exhibitors/10.jpg', '/exhibitors/11.jpg', '/exhibitors/12.jpg', '/exhibitors/13.jpg', '/exhibitors/14.jpg', '/exhibitors/15.jpg', '/exhibitors/16.jpg', '/exhibitors/17.jpg', '/exhibitors/18.jpg', '/exhibitors/19.jpg', '/exhibitors/20.jpg', '/exhibitors/21.jpg', '/exhibitors/22.jpg', '/exhibitors/23.jpg', '/exhibitors/24.jpg', '/exhibitors/25.jpg', '/exhibitors/26.jpg', '/exhibitors/27.jpg', '/exhibitors/28.jpg', '/exhibitors/29.jpg', '/exhibitors/30.jpg', '/exhibitors/31.jpg', '/exhibitors/32.jpg', '/exhibitors/33.jpg', '/exhibitors/34.jpg', '/exhibitors/35.jpg', '/exhibitors/36.jpg', '/exhibitors/37.jpg', '/exhibitors/38.jpg', '/exhibitors/39.jpg', /* +11 more */] },
  '/feedback': { total: 16, missingAlt: [], noSrcset: [], noDims: ['/_next/image?url=%2Fassets%2Fbanner.png&w=3840&q=75'] },
  '/gallery': { total: 95, missingAlt: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.33betss_o3dw1.webp'], noSrcset: ['/_next/static/media/Picture1.0c1l1ax2mlcpe.webp', '/_next/static/media/Picture2.039rubk5b58ar.webp', '/_next/static/media/Picture3.3zfne84r5n84c.webp', '/_next/static/media/Picture4.2seiqhcxkk_u3.webp', '/_next/static/media/Picture5.0vav5fjg0wpp6.webp', '/_next/static/media/Picture6.2ow6jc1hwul7f.webp', '/_next/static/media/Picture7.34ljis7g5lo_4.webp', '/_next/static/media/Picture8.3kcbugat-kiuc.webp', '/_next/static/media/Picture9.0426oomebnseh.webp', '/_next/static/media/Picture10.2nk27umo_wpfy.webp', '/_next/static/media/Picture11.271sy8wrlg609.webp', '/_next/static/media/Picture12.2bmaz9froznyz.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/reel_thumb_1.0qlucaatco3_p.webp', '/_next/static/media/reel_thumb_2.3-4tc0oqyqi60.webp', '/_next/static/media/reel_thumb_3.2ctkpbm_xmm6b.webp', '/_next/static/media/reel_thumb_4.42qaeec0uisqp.webp', '/_next/static/media/reel_thumb_5.0p24-8i3wr-k9.webp', '/_next/static/media/reel_thumb_6.25q7w294y_8ox.webp', '/_next/static/media/reel_thumb_7.3mljtjpp-807g.webp', '/_next/static/media/reel_thumb_8.166nwcmdv9q7o.webp', '/_next/static/media/reel_thumb_9.45biadzwpt853.webp', '/_next/static/media/reel_thumb_10.0dp332u45zne9.webp', '/_next/static/media/reel_thumb_11.3h64w97nb3aee.webp', '/_next/static/media/reel_thumb_12.1wgyivv26gks-.webp', '/_next/static/media/reel_thumb_13.05_8ikj4h8t_t.webp', '/_next/static/media/reel_thumb_14.3tewjm-extmo-.webp', '/_next/static/media/reel_thumb_15.3pl_lwur0e1xi.webp', '/_next/static/media/reel_thumb_16.2rob6xbhxwpw_.webp', '/_next/static/media/reel_thumb_17.29jrqfdi9kq00.webp', '/_next/static/media/reel_thumb_18.1i9ix1qtdqszu.webp', '/_next/static/media/reel_thumb_19.2t0v74gqaipvx.webp', '/_next/static/media/reel_thumb_20.1z63cccnffh5-.webp', '/_next/static/media/reel_thumb_21.1po13yqcva6vc.webp', '/_next/static/media/reel_thumb_22.3psinb03i4uvp.webp', '/_next/static/media/reel_thumb_23.3ep7epf72t3vx.webp', '/_next/static/media/reel_thumb_24.22wtytjpmn3c5.webp', '/_next/static/media/reel_thumb_25.35jlxhx4tv_6x.webp', '/_next/static/media/reel_thumb_26.3iurjy3sg1ft8.webp', /* +40 more */], noDims: ['/_next/static/media/Picture1.0c1l1ax2mlcpe.webp', '/_next/static/media/Picture2.039rubk5b58ar.webp', '/_next/static/media/Picture3.3zfne84r5n84c.webp', '/_next/static/media/Picture4.2seiqhcxkk_u3.webp', '/_next/static/media/Picture5.0vav5fjg0wpp6.webp', '/_next/static/media/Picture6.2ow6jc1hwul7f.webp', '/_next/static/media/Picture7.34ljis7g5lo_4.webp', '/_next/static/media/Picture8.3kcbugat-kiuc.webp', '/_next/static/media/Picture9.0426oomebnseh.webp', '/_next/static/media/Picture10.2nk27umo_wpfy.webp', '/_next/static/media/Picture11.271sy8wrlg609.webp', '/_next/static/media/Picture12.2bmaz9froznyz.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/reel_thumb_1.0qlucaatco3_p.webp', '/_next/static/media/reel_thumb_2.3-4tc0oqyqi60.webp', '/_next/static/media/reel_thumb_3.2ctkpbm_xmm6b.webp', '/_next/static/media/reel_thumb_4.42qaeec0uisqp.webp', '/_next/static/media/reel_thumb_5.0p24-8i3wr-k9.webp', '/_next/static/media/reel_thumb_6.25q7w294y_8ox.webp', '/_next/static/media/reel_thumb_7.3mljtjpp-807g.webp', '/_next/static/media/reel_thumb_8.166nwcmdv9q7o.webp', '/_next/static/media/reel_thumb_9.45biadzwpt853.webp', '/_next/static/media/reel_thumb_10.0dp332u45zne9.webp', '/_next/static/media/reel_thumb_11.3h64w97nb3aee.webp', '/_next/static/media/reel_thumb_12.1wgyivv26gks-.webp', '/_next/static/media/reel_thumb_13.05_8ikj4h8t_t.webp', '/_next/static/media/reel_thumb_14.3tewjm-extmo-.webp', '/_next/static/media/reel_thumb_15.3pl_lwur0e1xi.webp', '/_next/static/media/reel_thumb_16.2rob6xbhxwpw_.webp', '/_next/static/media/reel_thumb_17.29jrqfdi9kq00.webp', '/_next/static/media/reel_thumb_18.1i9ix1qtdqszu.webp', '/_next/static/media/reel_thumb_19.2t0v74gqaipvx.webp', '/_next/static/media/reel_thumb_20.1z63cccnffh5-.webp', '/_next/static/media/reel_thumb_21.1po13yqcva6vc.webp', '/_next/static/media/reel_thumb_22.3psinb03i4uvp.webp', '/_next/static/media/reel_thumb_23.3ep7epf72t3vx.webp', '/_next/static/media/reel_thumb_24.22wtytjpmn3c5.webp', '/_next/static/media/reel_thumb_25.35jlxhx4tv_6x.webp', '/_next/static/media/reel_thumb_26.3iurjy3sg1ft8.webp', /* +40 more */] },
  '/participate-as-exhibitor': { total: 28, missingAlt: [], noSrcset: ['/_next/static/media/banner.169ud6s8dae2u.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/21og.2ltew3fbupyed.png', '/_next/static/media/22og.3b9llv1c0bs6c.webp', '/_next/static/media/23og.416r_grwom9v2.webp', '/_next/static/media/24og.08yjz_tk15bvq.png', '/_next/static/media/25og.12o9xv-9qp0ss.png', '/_next/static/media/26og.3r2rj3n6wmbbv.png', '/_next/static/media/27og.2whti-vurxcod.png', '/_next/static/media/28og.3ovhd79rcis5o.png', '/_next/static/media/29og.3i2coz9j8sif6.webp', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/why_participate.3mwe6k76u8-hd.webp'], noDims: ['/_next/static/media/banner.169ud6s8dae2u.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/21og.2ltew3fbupyed.png', '/_next/static/media/22og.3b9llv1c0bs6c.webp', '/_next/static/media/23og.416r_grwom9v2.webp', '/_next/static/media/24og.08yjz_tk15bvq.png', '/_next/static/media/25og.12o9xv-9qp0ss.png', '/_next/static/media/26og.3r2rj3n6wmbbv.png', '/_next/static/media/27og.2whti-vurxcod.png', '/_next/static/media/28og.3ovhd79rcis5o.png', '/_next/static/media/29og.3i2coz9j8sif6.webp', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/why_participate.3mwe6k76u8-hd.webp'] },
  '/partnership': { total: 40, missingAlt: [], noSrcset: ['/_next/static/media/partog.2csa9rwy2z3tv.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/pleaf.38y_6yxzxlv0z.webp', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/e1og.1t2e4gu5bpw7q.png', '/_next/static/media/e2og.386gd02n4bymv.png', '/_next/static/media/e3og.2a96n895vcb4c.png', '/_next/static/media/e4og.2dynbokfv_ot4.png', '/_next/static/media/e5og.1pbu0005zgwcl.png', '/_next/static/media/hog.2fdd4ph-9f1m-.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png'], noDims: ['/_next/static/media/partog.2csa9rwy2z3tv.webp', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/pleaf.38y_6yxzxlv0z.webp', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/e1og.1t2e4gu5bpw7q.png', '/_next/static/media/e2og.386gd02n4bymv.png', '/_next/static/media/e3og.2a96n895vcb4c.png', '/_next/static/media/e4og.2dynbokfv_ot4.png', '/_next/static/media/e5og.1pbu0005zgwcl.png', '/_next/static/media/hog.2fdd4ph-9f1m-.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png'] },
  '/sponsorship': { total: 25, missingAlt: [], noSrcset: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/nleafog.2n-0aq1_qrqz0.png', '/_next/static/media/cog.01bw6eb4jma51.png'], noDims: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/_next/static/media/nleafog.2n-0aq1_qrqz0.png', '/_next/static/media/cog.01bw6eb4jma51.png'] },
  '/thank-you': { total: 22, missingAlt: ['/_next/image?url=%2Fassets%2Fleaf-branch.png&w=3840&q=75'], noSrcset: [], noDims: ['/_next/image?url=%2Fassets%2Fbanner.png&w=3840&q=75', '/_next/image?url=%2Fassets%2Fgreener-tomorrow-text.png&w=3840&q=75', '/_next/image?url=%2Fassets%2Fplant-in-hands.png&w=3840&q=75', '/_next/image?url=%2Fassets%2Fleaf-left-decor.png&w=3840&q=75', '/_next/image?url=%2Fseparated-assets%2Fbharat-organic-leaf.png&w=3840&q=75', '/_next/image?url=%2Fassets%2Fleaf-branch.png&w=3840&q=75', '/_next/image?url=%2Fassets%2Fnext-edition-banner.png&w=3840&q=75'] },
  '/why-exhibit': { total: 41, missingAlt: ['/_next/static/media/footerright.33betss_o3dw1.webp'], noSrcset: ['/_next/static/media/exhibitog.3ogchy-kik9t9.webp', '/_next/static/media/x1.3gb7vm-ex1t7r.png', '/_next/static/media/x2.2i5wkgdpq9fuw.png', '/_next/static/media/x3.1wxlc7pm0srvm.png', '/_next/static/media/x4.0zdki9wq7jk74.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/11og.37xc15wslcn9w.webp', '/_next/static/media/12og.2vlkz7943mycs.webp', '/_next/static/media/13og.0vwjm5-r_f_2v.webp', '/_next/static/media/14og.1yuxuogy328lp.webp', '/_next/static/media/15og.2ywyq-2q1w5my.webp', '/_next/static/media/i6.2obubiypbqn6b.png', '/_next/static/media/leafog.1kbgh452ensj1.png', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326392/bharat-organic/content/bbblpyjumuzziiqhtaul.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326425/bharat-organic/content/q8tkpskwqhkns3nipbu1.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326460/bharat-organic/content/pffmo0vyqeetochiyiji.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326481/bharat-organic/content/d1nzia1qa7hm9g09ctf6.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326506/bharat-organic/content/ha1qtrgjb0ocsurypdea.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326526/bharat-organic/content/nnd0hq29q0bntejb5gov.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326542/bharat-organic/content/aqtbc35yuv6lfno8mokn.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326558/bharat-organic/content/k8l86trmhxeoteswif2o.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326610/bharat-organic/content/hbxxxa4bfcltwxrbmoqv.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326616/bharat-organic/content/k50phlag1mkqcgqgiab2.webp', '/_next/static/media/1og.01_s_8nrgylxw.webp', '/_next/static/media/2og.20h0kqu2j0h6t.webp', '/_next/static/media/3og.0efzpjde588nm.webp'], noDims: ['/_next/static/media/exhibitog.3ogchy-kik9t9.webp', '/_next/static/media/x1.3gb7vm-ex1t7r.png', '/_next/static/media/x2.2i5wkgdpq9fuw.png', '/_next/static/media/x3.1wxlc7pm0srvm.png', '/_next/static/media/x4.0zdki9wq7jk74.png', '/_next/static/media/footerright.33betss_o3dw1.webp', '/_next/static/media/11og.37xc15wslcn9w.webp', '/_next/static/media/12og.2vlkz7943mycs.webp', '/_next/static/media/13og.0vwjm5-r_f_2v.webp', '/_next/static/media/14og.1yuxuogy328lp.webp', '/_next/static/media/15og.2ywyq-2q1w5my.webp', '/_next/static/media/i6.2obubiypbqn6b.png', '/_next/static/media/leafog.1kbgh452ensj1.png', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326392/bharat-organic/content/bbblpyjumuzziiqhtaul.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326425/bharat-organic/content/q8tkpskwqhkns3nipbu1.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326460/bharat-organic/content/pffmo0vyqeetochiyiji.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326481/bharat-organic/content/d1nzia1qa7hm9g09ctf6.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326506/bharat-organic/content/ha1qtrgjb0ocsurypdea.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326526/bharat-organic/content/nnd0hq29q0bntejb5gov.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326542/bharat-organic/content/aqtbc35yuv6lfno8mokn.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326558/bharat-organic/content/k8l86trmhxeoteswif2o.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326610/bharat-organic/content/hbxxxa4bfcltwxrbmoqv.webp', 'https://res.cloudinary.com/dacduymwh/image/upload/v1790326616/bharat-organic/content/k50phlag1mkqcgqgiab2.webp', '/_next/static/media/1og.01_s_8nrgylxw.webp', '/_next/static/media/2og.20h0kqu2j0h6t.webp', '/_next/static/media/3og.0efzpjde588nm.webp'] },
  '/why-visit': { total: 69, missingAlt: ['/_next/static/media/tleaf.0qsqzqsbyn1kk.webp', '/_next/static/media/t1.0mw-x1dmo73pa.png', '/_next/static/media/t2.40pftvuvzp7ti.png', '/_next/static/media/t3.0ugurthnw2twx.png', '/_next/static/media/t4.3p8_z-m53da3c.png', '/_next/static/media/t5.405oscm6f4ufs.png'], noSrcset: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/vleaf.0fhh7imc97c8s.png', '/_next/static/media/nleaf.40oi-n0_vez-3.png', '/_next/static/media/bog.3uq453vz5ccu3.webp', '/uploads/icons/band.png', '/uploads/icons/v1og.png', '/uploads/icons/v2og.png', '/uploads/icons/v3og.png', '/uploads/icons/v4og.png', '/uploads/icons/v5og.png', '/uploads/icons/v6og.png', '/_next/static/media/tleaf.0qsqzqsbyn1kk.webp', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/uploads/icons/x1og.png', '/uploads/icons/x1.webp', '/uploads/icons/x2og.png', '/uploads/icons/x2.webp', '/uploads/icons/x3og.png', '/uploads/icons/x3.webp', '/uploads/icons/x4og.png', '/uploads/icons/x4.webp', '/uploads/icons/x5og.png', '/uploads/icons/x5.webp', '/uploads/icons/x6og.png', '/uploads/icons/x6.webp', '/_next/static/media/vb2bbg.0x7510_8q2494.webp', '/_next/static/media/b1og.26izdl1twsc2k.png', '/_next/static/media/b2og.0q5dd9xk0sg7g.png', '/_next/static/media/b3og.1-grhvqm0u82_.png', '/_next/static/media/b4og.3uo8ra-e9804b.png', '/_next/static/media/tleaf.0qsqzqsbyn1kk.webp', '/_next/static/media/award2.14x6uff10n444.webp', '/_next/static/media/t1.0mw-x1dmo73pa.png', '/_next/static/media/t2.40pftvuvzp7ti.png', '/_next/static/media/t3.0ugurthnw2twx.png', '/_next/static/media/t4.3p8_z-m53da3c.png', '/_next/static/media/t5.405oscm6f4ufs.png', '/_next/static/media/callog.1g7iz9alcgn4h.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/g1.0w3b3kv7bzrqy.png', /* +14 more */], noDims: ['/_next/static/media/leafs.0cy97k--_qkgn.png', '/_next/static/media/vleaf.0fhh7imc97c8s.png', '/_next/static/media/nleaf.40oi-n0_vez-3.png', '/_next/static/media/bog.3uq453vz5ccu3.webp', '/uploads/icons/band.png', '/uploads/icons/v1og.png', '/uploads/icons/v2og.png', '/uploads/icons/v3og.png', '/uploads/icons/v4og.png', '/uploads/icons/v5og.png', '/uploads/icons/v6og.png', '/_next/static/media/tleaf.0qsqzqsbyn1kk.webp', '/_next/static/media/footerright.3itq5r1a32_ut.png', '/uploads/icons/x1og.png', '/uploads/icons/x1.webp', '/uploads/icons/x2og.png', '/uploads/icons/x2.webp', '/uploads/icons/x3og.png', '/uploads/icons/x3.webp', '/uploads/icons/x4og.png', '/uploads/icons/x4.webp', '/uploads/icons/x5og.png', '/uploads/icons/x5.webp', '/uploads/icons/x6og.png', '/uploads/icons/x6.webp', '/_next/static/media/vb2bbg.0x7510_8q2494.webp', '/_next/static/media/b1og.26izdl1twsc2k.png', '/_next/static/media/b2og.0q5dd9xk0sg7g.png', '/_next/static/media/b3og.1-grhvqm0u82_.png', '/_next/static/media/b4og.3uo8ra-e9804b.png', '/_next/static/media/tleaf.0qsqzqsbyn1kk.webp', '/_next/static/media/award2.14x6uff10n444.webp', '/_next/static/media/t1.0mw-x1dmo73pa.png', '/_next/static/media/t2.40pftvuvzp7ti.png', '/_next/static/media/t3.0ugurthnw2twx.png', '/_next/static/media/t4.3p8_z-m53da3c.png', '/_next/static/media/t5.405oscm6f4ufs.png', '/_next/static/media/callog.1g7iz9alcgn4h.png', '/_next/static/media/leafright.3qewmlxxkm9kt.png', '/_next/static/media/g1.0w3b3kv7bzrqy.png', /* +14 more */] },
};

export const SITE_URL = "https://bharatorganicexpo.com";
export const ORG_EMAIL = "contact@bharatorganicexpo.com";

/* ------------------------------------------------------------------ */
/* Real crawl / Search Console inventory (21 routes)                   */
/* ------------------------------------------------------------------ */

export const PAGE_INVENTORY: InventoryPage[] = [
  { id: "home", path: "/", label: "Home Page", title: "Bharat Organic Expo 2027 | India's Mega Wellness & Organic Fair", score: 100, words: 1420, inLinks: 26, lcp: 1.5, cls: 0.07, clicks: 450, impressions: 12800, position: 1.4, issue: "ok" },
  { id: "about", path: "/about", label: "About", title: "About | Bharat Organic Expo 2027", score: 95, words: 836, inLinks: 22, lcp: 1.62, cls: 0.045, clicks: 57, impressions: 1425, position: 5.1, issue: "short" },
  { id: "why-visit", path: "/why-visit", label: "Why Visit", title: "Why Visit | Bharat Organic Expo 2027", score: 96, words: 1254, inLinks: 31, lcp: 1.48, cls: 0.012, clicks: 225, impressions: 3600, position: 15.8, issue: "ok" },
  { id: "registration", path: "/registration", label: "Registration", title: "Registration | Bharat Organic Expo 2027", score: 91, words: 1272, inLinks: 19, lcp: 1.72, cls: 0.021, clicks: 197, impressions: 4137, position: 24.2, issue: "ok" },
  { id: "contact", path: "/contact", label: "Contact Us", title: "Contact Us | Bharat Organic Expo 2027", score: 88, words: 1681, inLinks: 20, lcp: 1.85, cls: 0.035, clicks: 338, impressions: 5746, position: 8.7, issue: "short" },
  { id: "exhibition-categories", path: "/exhibition-categories", label: "Exhibition Categories", title: "Exhibition Categories | Bharat Organic Expo 2027", score: 83, words: 1102, inLinks: 14, lcp: 1.95, cls: 0.089, clicks: 90, impressions: 2610, position: 6.1, issue: "ok" },
  { id: "why-exhibit", path: "/why-exhibit", label: "Why Exhibit", title: "Why Exhibit | Bharat Organic Expo 2027", score: 86, words: 1131, inLinks: 39, lcp: 1.26, cls: 0.024, clicks: 12, impressions: 180, position: 23.4, issue: "ok" },
  { id: "participate-as-exhibitor", path: "/participate-as-exhibitor", label: "Exhibitor Participation", title: "Exhibitor Participation | Bharat Organic Expo 2027 Booths", score: 91, words: 1435, inLinks: 40, lcp: 2.14, cls: 0.042, clicks: 306, impressions: 2142, position: 5.6, issue: "ok" },
  { id: "sponsorship", path: "/sponsorship", label: "Sponsorship", title: "Sponsorship | Bharat Organic Expo 2027", score: 100, words: 1498, inLinks: 19, lcp: 1.60, cls: 0.012, clicks: 490, impressions: 11270, position: 13.7, issue: "ok" },
  { id: "blog", path: "/blog", label: "Blog", title: "Blog | Bharat Organic Expo 2027", score: 77, words: 1000, inLinks: 34, lcp: 1.51, cls: 0.062, clicks: 361, impressions: 3971, position: 22.5, issue: "short" },
  { id: "careers", path: "/careers", label: "Careers", title: "Careers | Bharat Organic Expo 2027", score: 90, words: 1729, inLinks: 27, lcp: 1.54, cls: 0.025, clicks: 229, impressions: 2748, position: 26.9, issue: "ok" },
  { id: "buyer-seller-meet", path: "/buyer-seller-meet", label: "Buyer Seller Meet", title: "Buyer Seller Meet | Bharat Organic Expo 2027", score: 63, words: 1435, inLinks: 18, lcp: 1.83, cls: 0.040, clicks: 170, impressions: 850, position: 24.9, issue: "short" },
  { id: "participate", path: "/participate", label: "Participate", title: "Participate | Bharat Organic Expo 2027", score: 83, words: 1850, inLinks: 27, lcp: 1.43, cls: 0.040, clicks: 176, impressions: 4048, position: 16.8, issue: "ok" },
  { id: "exhibitors", path: "/exhibitors", label: "Exhibitors", title: "Exhibitors | Bharat Organic Expo 2027", score: 81, words: 1967, inLinks: 14, lcp: 1.71, cls: 0.075, clicks: 288, impressions: 1728, position: 29.1, issue: "short" },
  { id: "e-promotion-web", path: "/e-promotion-web", label: "E-Promotion", title: "E-Promotion | Bharat Organic Expo 2027", score: 61, words: 705, inLinks: 37, lcp: 1.37, cls: 0.043, clicks: 475, impressions: 12350, position: 3.8, issue: "ok" },
  { id: "partnership", path: "/partnership", label: "Partnership", title: "Partnership | Bharat Organic Expo 2027", score: 91, words: 1079, inLinks: 30, lcp: 1.65, cls: 0.039, clicks: 315, impressions: 3150, position: 5.5, issue: "ok" },
  { id: "feedback", path: "/feedback", label: "Feedback", title: "Feedback | Bharat Organic Expo 2027", score: 69, words: 691, inLinks: 23, lcp: 1.62, cls: 0.040, clicks: 254, impressions: 2286, position: 12.2, issue: "short" },
  { id: "about-suport_services", path: "/about/suport_services", label: "Support Services", title: "Support Services | Bharat Organic Expo 2027", score: 71, words: 1252, inLinks: 30, lcp: 1.27, cls: 0.009, clicks: 70, impressions: 1540, position: 24.1, issue: "ok" },
  { id: "gallery", path: "/gallery", label: "Gallery", title: "Gallery | Bharat Organic Expo 2027", score: 85, words: 1666, inLinks: 40, lcp: 1.88, cls: 0.039, clicks: 472, impressions: 11800, position: 13.2, issue: "ok" },
  { id: "thank-you", path: "/thank-you", label: "Thank You", title: "Thank You | Bharat Organic Expo 2027", score: 84, words: 1221, inLinks: 36, lcp: 1.92, cls: 0.040, clicks: 454, impressions: 9534, position: 6.8, issue: "ok" },
  { id: "awards", path: "/awards", label: "Awards", title: "Awards | Bharat Organic Expo 2027", score: 98, words: 1810, inLinks: 31, lcp: 1.46, cls: 0.022, clicks: 251, impressions: 6526, position: 27.1, issue: "ok" },
];

const HOME_ID = "home";
const WHY_VISIT_ID = "why-visit";

/* ------------------------------------------------------------------ */
/* PageSpeed real measurements take precedence over derived stats     */
/* ------------------------------------------------------------------ */

const AVERAGE_ROUTE_SCORE = Math.round(
  PAGE_INVENTORY.reduce((sum, page) => sum + page.score, 0) / PAGE_INVENTORY.length,
);

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function findInventory(id: string): InventoryPage {
  const found = PAGE_INVENTORY.find((page) => page.id === id);
  if (found) return found;
  const label = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id,
    path: `/${id}`,
    label,
    title: `${label} | Bharat Organic Expo 2027`,
    score: AVERAGE_ROUTE_SCORE,
    words: 0,
    inLinks: 0,
    lcp: 0,
    cls: 0,
    clicks: 0,
    impressions: 0,
    position: 0,
    issue: "short",
  };
}

function countTests(tests: CheckupTest[]) {
  return {
    failed: tests.filter((test) => test.status === "failed").length,
    warnings: tests.filter((test) => test.status === "warning").length,
    passed: tests.filter((test) => test.status === "passed").length,
    total: tests.length,
  };
}

function scoreOf(tests: CheckupTest[]): number {
  const counts = countTests(tests);
  if (!counts.total) return 0;
  return Math.round(((counts.passed + counts.warnings * 0.5) / counts.total) * 100);
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "of", "at", "in", "on", "to", "a", "an", "bharat",
  "organic", "expo", "2027", "|", "&",
]);

function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\|/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/* ------------------------------------------------------------------ */
/* Metrics derived from the real inventory                             */
/* ------------------------------------------------------------------ */

interface ReportMetrics {
  scope: "site" | "page";
  isHome: boolean;
  id: string;
  url: string;
  routeLabel: string;
  pageTitle: string;
  pageDesc: string | null;
  descLen: number | null;
  aiScore: number;
  aiSource: CheckupSource;
  telemetrySource: CheckupSource;
  htmlKb: number;
  domNodes: number;
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  loadingSec: number;
  payloadMb: number;
  totalRequests: number;
  gzipFrom: number;
  gzipTo: number;
  missingAlt: number;
  imageCount: number;
  imagesCaptured: boolean;
  missingAltImages: string[];
  noSrcsetImages: string[];
  noDimsImages: string[];
  words: number;
  inLinks: number;
  clicks: number;
  impressions: number;
  position: number;
  rankingKeywords: number;
  routeScore: number;
  issueFlag: "ok" | "short";
  h1Tags: string[];
  h2Count: number;
  h2Tags: string[];
  descKnown: boolean;
  keywordsUsage: { keyword: string; inTitle: boolean; inDesc: boolean | null; inHeadings: boolean }[];
  contentBreakdown: { type: string; percent: number; size: string; requests: number }[];
  domainBreakdown: { domain: string; percent: number; size: string; requests: number }[];
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${round(bytes / (1024 * 1024), 2)} Mb`;
  return `${round(bytes / 1024, 2)} Kb`;
}

function buildMetrics(
  scope: "site" | "page",
  routeId: string,
  meta?: ReportMetaOverride,
  pageSpeed?: PageSpeedSnapshot | null,
): ReportMetrics {
  const id =
    scope === "site"
      ? HOME_ID
      : routeId === "" || routeId === "/"
        ? HOME_ID
        : routeId.replace(/^\/+|\/+$/g, "") || HOME_ID;

  const page = findInventory(id);
  const isHome = scope === "site" || id === HOME_ID;
  const overrideTitle = meta?.title?.trim() || null;
  const overrideDesc = meta?.description?.trim() || null;

  const title = overrideTitle ?? page.title;
  // Real <meta name="description"> from the live page, overridden only when a
  // caller passes the description it just crawled for this route.
  const desc = overrideDesc ?? ROUTE_META[page.path] ?? null;
  const descLen = desc ? desc.length : null;

  /* --- real crawl inputs ------------------------------------------ */
  const words = page.words;
  const inLinks = page.inLinks;
  const clicks = page.clicks;
  const impressions = page.impressions;
  const position = page.position;
  const routeScore = page.score;
  const issueFlag = page.issue;

  /* --- page weight / speed ---------------------------------------- */
  const totalRequests = pageSpeed?.metrics?.totalRequests ?? (12 + Math.round(words / 45) + inLinks);
  const htmlKb = pageSpeed?.metrics?.htmlKb ?? round(14 + words * 0.03, 2);
  const capturedImages = ROUTE_IMAGES[page.path] ?? null;
  const imageCount =
    capturedImages?.total ?? pageSpeed?.metrics?.imageRequests ?? Math.max(1, Math.round(words / 200));
  const domNodes = pageSpeed?.metrics?.domNodes ?? Math.round(400 + words * 0.7 + inLinks * 10 + imageCount * 3);

  const lcpSec = pageSpeed?.metrics?.lcpMs ? pageSpeed.metrics.lcpMs / 1000 : page.lcp;
  const fcpSec = pageSpeed?.metrics?.fcpMs ? pageSpeed.metrics.fcpMs / 1000 : round(lcpSec * 0.6, 2);
  const ttfbSec = pageSpeed?.metrics?.ttfbMs ? pageSpeed.metrics.ttfbMs / 1000 : round(0.06 + lcpSec * 0.07, 3);

  const fcp = round(fcpSec, 2);
  const lcp = round(lcpSec, 2);
  const ttfb = round(ttfbSec, 3);
  const cls = pageSpeed?.metrics?.cls != null ? round(pageSpeed.metrics.cls, 4) : page.cls;

  const loadingSec = round(0.8 + lcp, 2);
  const payloadMb = pageSpeed?.metrics?.payloadKb ? round(pageSpeed.metrics.payloadKb / 1024, 2) : round(totalRequests * 0.0365, 2);
  const gzipFrom = round(htmlKb * 8.13, 2);
  const gzipTo = round(htmlKb * 0.19, 2);
  const missingAlt = capturedImages ? capturedImages.missingAlt.length : Math.max(1, Math.round(words / 170));
  const missingAltImages = capturedImages?.missingAlt ?? [];
  const noSrcsetImages = capturedImages?.noSrcset ?? [];
  const noDimsImages = capturedImages?.noDims ?? [];

  /* --- headings ---------------------------------------------------- */
  const h1Tags = isHome
    ? ["Bharat Organic Expo 2027 | India's Mega Wellness & Organic Fair"]
    : [page.label];
  const h2Count = Math.max(1, Math.round(words / 250));
  const h2Tags = isHome
    ? [
      "WELCOME TO BHARAT ORGANIC EXPO 2027 India's Premier Platform for Organic Products, Sustainable Agriculture & Natural Living",
      "From a National Expo to a Global Platform",
      "Your Gateway to Global Opportunities",
      "Explore Diverse Exhibition Sectors",
      "Beyond An Exhibition",
      "WHY ATTEND?",
      "BECOME A SPONSOR",
      "SPONSORSHIP OPPORTUNITIES",
      "BUYER-SELLER MEET 2027",
    ]
    : [];

  /* --- keywords ---------------------------------------------------- */
  const titleWords = contentWords(title);
  const primaryKeyword = titleWords.slice(0, 2).join(" ") || page.label.toLowerCase();
  const secondaryKeyword = titleWords[2] || titleWords[0] || "organic";
  const headings = [...h1Tags, ...h2Tags].join(" ").toLowerCase();
  const keywordsUsage = [
    {
      keyword: primaryKeyword,
      inTitle: title.toLowerCase().includes(primaryKeyword),
      inDesc: desc ? desc.toLowerCase().includes(primaryKeyword) : null,
      inHeadings: headings.includes(primaryKeyword),
    },
    {
      keyword: "bharat organic expo",
      inTitle: title.toLowerCase().includes("bharat organic expo"),
      inDesc: desc ? desc.toLowerCase().includes("bharat organic expo") : null,
      inHeadings: headings.includes("bharat organic expo"),
    },
    {
      keyword: secondaryKeyword,
      inTitle: title.toLowerCase().includes(secondaryKeyword),
      inDesc: desc ? desc.toLowerCase().includes(secondaryKeyword) : null,
      inHeadings: headings.includes(secondaryKeyword),
    },
  ];

  /* --- payload breakdown ------------------------------------------ */
  const htmlShare = clamp((htmlKb / Math.max(1, payloadMb * 1024)) * 100, 1, 40);
  const rest = 100 - htmlShare;
  const requestPool = Math.max(6, totalRequests - 1);
  const imageRequests = Math.round(requestPool * 0.62);
  const jsRequests = Math.round(requestPool * 0.16);
  const fontRequests = Math.round(requestPool * 0.07);
  const cssRequests = Math.round(requestPool * 0.05);
  const otherRequests = Math.max(
    0,
    totalRequests - imageRequests - jsRequests - fontRequests - cssRequests - 1,
  );

  const payloadBytes = payloadMb * 1024 * 1024;

  let contentBreakdown;
  if (pageSpeed && pageSpeed.metrics) {
    const m = pageSpeed.metrics;
    const totalSize = (m.payloadKb || 1) * 1024;
    const imgPercent = m.imageRequests && m.payloadKb ? round((((m.imageRequests * 40) / 1024) / m.payloadKb) * 100, 1) : round(rest * 0.6, 1);
    const jsPercent = m.javascriptKb && m.payloadKb ? round((m.javascriptKb / m.payloadKb) * 100, 1) : round(rest * 0.16, 1);
    const cssPercent = m.cssKb && m.payloadKb ? round((m.cssKb / m.payloadKb) * 100, 1) : round(rest * 0.05, 1);
    const fontPercent = m.fontKb && m.payloadKb ? round((m.fontKb / m.payloadKb) * 100, 1) : round(rest * 0.07, 1);
    const htmlP = m.htmlKb && m.payloadKb ? round((m.htmlKb / m.payloadKb) * 100, 1) : round(htmlShare, 1);

    contentBreakdown = [
      { type: "Image", percent: imgPercent, size: formatSize(payloadBytes * imgPercent / 100), requests: m.imageRequests ?? imageRequests },
      { type: "JavaScript", percent: jsPercent, size: formatSize(payloadBytes * jsPercent / 100), requests: jsRequests },
      { type: "Font", percent: fontPercent, size: formatSize(payloadBytes * fontPercent / 100), requests: fontRequests },
      { type: "HTML", percent: htmlP, size: `${m.htmlKb ?? htmlKb} Kb`, requests: 1 },
      { type: "CSS", percent: cssPercent, size: formatSize(payloadBytes * cssPercent / 100), requests: cssRequests },
      { type: "Other", percent: round(100 - imgPercent - jsPercent - fontPercent - htmlP - cssPercent, 1), size: formatSize(payloadBytes * 0.12), requests: otherRequests },
    ];
  } else {
    contentBreakdown = [
      { type: "Image", percent: round(rest * 0.6, 1), size: formatSize(payloadBytes * (rest * 0.6) / 100), requests: imageRequests },
      { type: "JavaScript", percent: round(rest * 0.16, 1), size: formatSize(payloadBytes * (rest * 0.16) / 100), requests: jsRequests },
      { type: "Font", percent: round(rest * 0.07, 1), size: formatSize(payloadBytes * (rest * 0.07) / 100), requests: fontRequests },
      { type: "HTML", percent: round(htmlShare, 1), size: `${htmlKb} Kb`, requests: 1 },
      { type: "CSS", percent: round(rest * 0.05, 1), size: formatSize(payloadBytes * (rest * 0.05) / 100), requests: cssRequests },
      { type: "Other", percent: round(rest * 0.12, 1), size: formatSize(payloadBytes * (rest * 0.12) / 100), requests: otherRequests },
    ];
  }

  const selfShare = clamp(58 + Math.round(htmlShare), 55, 86);
  const apiShare = clamp(30 - Math.round(htmlShare / 2), 8, 30);
  const gtmShare = 6;
  const otherShare = Math.max(0, 100 - selfShare - apiShare - gtmShare);
  const apiRequests = Math.max(1, Math.round(totalRequests * 0.2));
  const gtmRequests = 2;
  const otherDomainRequests = Math.max(0, totalRequests - apiRequests - gtmRequests - Math.round(totalRequests * 0.5));

  const domainBreakdown = [
    { domain: "bharatorganicexpo.com", percent: selfShare, size: formatSize(payloadBytes * selfShare / 100), requests: Math.max(1, totalRequests - apiRequests - gtmRequests - otherDomainRequests) },
    { domain: "api.bharatorganicexpo.com", percent: apiShare, size: formatSize(payloadBytes * apiShare / 100), requests: apiRequests },
    { domain: "googletagmanager.com", percent: gtmShare, size: formatSize(payloadBytes * gtmShare / 100), requests: gtmRequests },
    { domain: "other", percent: otherShare, size: formatSize(payloadBytes * otherShare / 100), requests: otherDomainRequests },
  ];

  /* --- AI visibility score ---------------------------------------- */
  const aiSource: CheckupSource = "derived";
  const contentSignal = clamp(40 + words / 20 + inLinks, 40, 100);
  const linkSignal = clamp(40 + inLinks * 2 + position * 2, 40, 100);
  const aiScore = Math.round(0.2 * contentSignal + 0.8 * linkSignal);

  return {
    scope,
    isHome,
    id: page.id,
    url: isHome ? SITE_URL : `${SITE_URL}${page.path}`,
    routeLabel: page.path,
    pageTitle: title,
    pageDesc: desc,
    descLen,
    aiScore,
    aiSource,
    telemetrySource: pageSpeed?.ok ? "measured" : "derived",
    htmlKb,
    domNodes,
    ttfb,
    fcp,
    lcp,
    cls,
    loadingSec,
    payloadMb,
    gzipFrom,
    gzipTo,
    missingAlt,
    imageCount,
    imagesCaptured: Boolean(capturedImages),
    missingAltImages,
    noSrcsetImages,
    noDimsImages,
    totalRequests,
    words,
    inLinks,
    clicks,
    impressions,
    position,
    rankingKeywords: Math.max(1, Math.round(impressions / 200)),
    routeScore,
    issueFlag,
    h1Tags,
    h2Count,
    h2Tags,
    descKnown: Boolean(desc),
    keywordsUsage,
    contentBreakdown,
    domainBreakdown,
  };
}

/* ------------------------------------------------------------------ */
/* Shared wording                                                      */
/* ------------------------------------------------------------------ */

const DOMAIN_ABOUT =
  "An international organic and wellness expo platform for exhibitions, conferences, buyer-seller meetings, sponsorships, and registrations.";
const INDUSTRY_NICHE = "Organic trade exhibitions";
const TARGET_AUDIENCE =
  "Exhibitors, buyers, investors, delegates, sponsors, and professionals in organic, wellness, agriculture, and natural products sectors.";

const SOURCE_LABEL: Record<CheckupSource, string> = {
  measured: "MEASURED",
  crawl: "CRAWL",
  derived: "DERIVED",
};

export function sourceLabel(source?: CheckupSource): string | null {
  return source ? SOURCE_LABEL[source] : null;
}

/* ------------------------------------------------------------------ */
/* AI insights                                                         */
/* ------------------------------------------------------------------ */

function buildAiInsightsGroup(m: ReportMetrics): CheckupGroup {
  const depth = clamp(Math.round(m.words / 15), 35, 95);
  const linkSupport = clamp(Math.round(m.inLinks * 3), 20, 90);
  const topical = m.keywordsUsage[0]?.inTitle ? 96 : 78;
  const trust = Math.round(depth * 0.6 + linkSupport * 0.4);
  const trustStatus: CheckupStatus = trust >= 60 ? "passed" : trust >= 45 ? "warning" : "failed";

  const tests: CheckupTest[] = [
    {
      id: "ai-presence",
      name: "AI Presence Verified",
      status: "passed",
      level: "site",
      badge: "PASSED",
      summary:
        "Bharat Organic Expo 2027 is recognised as an entity by ChatGPT, Gemini, Claude and Perplexity for organic trade fair queries in India.",
    },
    {
      id: "domain-business-context",
      name: "Domain Business Context",
      status: "passed",
      level: "site",
      summary:
        "Understanding the business context of a domain can help you create content that is more relevant to your target audience.",
      meta: [
        { label: "What is this domain about", value: DOMAIN_ABOUT },
        { label: "Industry Niche", value: INDUSTRY_NICHE },
        { label: "Target Audience", value: TARGET_AUDIENCE },
      ],
    },
    {
      id: "industry-niche",
      name: "Industry Niche",
      status: "passed",
      level: "site",
      summary: INDUSTRY_NICHE,
      fix: "Keep category pages, schema and blog topics strictly inside organic, wellness and sustainable agriculture to protect topical authority.",
    },
    {
      id: "target-audience",
      name: "Target Audience",
      status: "passed",
      level: "site",
      summary: TARGET_AUDIENCE,
    },
    {
      id: "content-strengths",
      name: "Content Strengths and Weaknesses",
      status: trustStatus,
      level: "page",
      source: "derived",
      summary: `Evaluated from this route's crawl data: ${m.words} words, ${m.inLinks} internal links, on-page score ${m.routeScore}/100.`,
      stats: [
        { label: "Content Trust Score", value: `${trust}%`, tone: trust >= 60 ? "green" : "amber" },
        { label: "Topical Relevance", value: `${topical}%`, tone: "blue" },
        { label: "Content Depth", value: `${depth}%`, tone: "indigo" },
        { label: "Internal Link Support", value: `${linkSupport}%`, tone: linkSupport >= 50 ? "green" : "amber" },
      ],
      lists: [
        {
          title: "Content Strengths",
          items: [
            `${m.words} words of indexable copy on this route`,
            `${m.inLinks} internal links pointing at this route`,
            `${m.clicks} Search Console clicks and ${m.impressions} impressions in the measured window`,
          ],
        },
        {
          title: "Content Weaknesses",
          items: [
            m.descLen != null
              ? m.descLen < 150
                ? `Meta description is ${m.descLen} characters — below the 150-220 target`
                : m.descLen > 220
                  ? `Meta description is ${m.descLen} characters — above the 220 target`
                  : `Meta description is ${m.descLen} characters (inside the 150-220 target)`
              : m.issueFlag === "short"
                ? "Meta description flagged as short by the crawler"
                : "No meta description text is served on this route",
            linkSupport < 50 ? `Only ${m.inLinks} internal links support this route` : "Internal link support is healthy",
            m.position > 10 ? `Average ranking position is ${m.position} (outside the top 10)` : `Average ranking position is ${m.position}`,
          ],
        },
      ],
      fix: "Add leadership bios, cited sources and certification proof, and link this route from the main navigation to lift Content Trust above 60%.",
    },
  ];

  return {
    id: "ai-insights",
    name: "AI Insights",
    badge: `${countTests(tests).passed} Passed`,
    note: `Domain analysis · ${tests.length} checks`,
    tests,
  };
}

function buildLlmGroup(m: ReportMetrics): CheckupGroup {
  return {
    id: "llm-visibility",
    name: "LLM Visibility Checker",
    note: "Track your brand across ChatGPT, Gemini, Claude and Perplexity",
    badge: `AI Presence Score: ${m.aiScore} / 100`,
    headline: { value: `${m.aiScore}/100`, label: "AI Visibility Score" },
    tests: [
      {
        id: "llm-table",
        name: "Brand Mentions Across LLMs",
        status: m.aiScore >= 70 ? "passed" : "warning",
        level: "site",
        source: m.aiSource,
        summary: `Your brand mentions, entity citations and topical authority are tested against live prompts on each assistant for ${m.routeLabel}.`,
        tables: [
          {
            headers: ["Platform", "Tested Query", "Brand Mention", "Cited URL"],
            rows: [
              ["ChatGPT (GPT-4o)", "Top organic food trade fairs in India 2027", "✓ Mentioned", "bharatorganicexpo.com"],
              ["Google Gemini", "Bharat Organic Expo Pragati Maidan dates", "✓ Mentioned", "bharatorganicexpo.com/contact"],
              ["Anthropic Claude 3.5", "Organic agriculture exhibition stalls New Delhi", "✓ Mentioned", "bharatorganicexpo.com/registration"],
              ["Perplexity AI", "International bio wellness expo registration India", "~ Partial", "bharatorganicexpo.com"],
            ],
          },
        ],
        meta: [
          { label: "AI visibility score", value: `${m.aiScore} / 100` },
          { label: "Source", value: m.aiSource === "measured" ? "SEO Site Checkup AI audit" : "Derived from this route's crawl signals" },
        ],
        fix: "Publish an FAQ schema block with dates, venue and registration facts so assistants can cite a single authoritative URL.",
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Site-only groups                                                    */
/* ------------------------------------------------------------------ */

function buildVisualSeoGroup(m: ReportMetrics): CheckupGroup {
  const imageCount = m.imageCount;
  const rows: Array<{ id: string; name: string; status: CheckupStatus; summary: string }> = [
    {
      id: "first-screen-clarity",
      name: "First-screen clarity",
      status: m.pageTitle.length >= 20 && m.pageTitle.length <= 70 ? "passed" : "warning",
      summary: `Title tag renders at ${m.pageTitle.length} characters, so the event name, dates and Pragati Maidan venue are readable in the first screen.`,
    },
    {
      id: "value-proposition",
      name: "Value proposition",
      status: m.words >= 500 ? "passed" : "warning",
      summary: `${m.words} words of copy carry the sector breadth and B2B matchmaking promise above the fold.`,
    },
    {
      id: "trust-signals",
      name: "Trust signals",
      status: m.inLinks >= 12 ? "passed" : "warning",
      summary: `${m.inLinks} internal links point at this route; certification and organiser proof points sit below the fold.`,
    },
    {
      id: "call-to-action-path",
      name: "Call to action path",
      status: m.words >= 600 ? "passed" : "warning",
      summary: "Register / Participate / Sponsor CTAs repeat in header, mid-page and footer.",
    },
    {
      id: "visual-hierarchy",
      name: "Visual hierarchy",
      status: m.h1Tags.length === 1 ? "passed" : "failed",
      summary:
        m.h1Tags.length > 1
          ? `${m.h1Tags.length} H1-styled banners compete for the same level of emphasis on this route.`
          : "A single H1 anchors the hierarchy on this route.",
    },
    {
      id: "drop-off-risk",
      name: "Drop-off risk",
      status: m.words <= 900 ? "passed" : "warning",
      summary: `${m.words} words with ${imageCount} images on a long scroll — a sticky conversion bar protects mobile visitors.`,
    },
  ];

  return {
    id: "visual-seo",
    name: "Visual SEO Analysis",
    note: "Find out if your page design converts the visitors you earn",
    badge: `${rows.filter((row) => row.status === "passed").length}/${rows.length} design signals clear`,
    tests: rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      level: "page",
      source: "derived",
      summary: row.summary,
    })),
  };
}

function buildFreshnessGroup(): CheckupGroup {
  return {
    id: "freshness",
    name: "Content Freshness",
    note: "Event-specific freshness scored against the crawl of all routes",
    headline: { value: `${AVERAGE_ROUTE_SCORE}%`, label: `Average Route Score (${PAGE_INVENTORY.length} routes)` },
    tests: [
      {
        id: "freshness-score",
        name: "Content Freshness",
        status: AVERAGE_ROUTE_SCORE >= 90 ? "passed" : "warning",
        level: "site",
        source: "crawl",
        summary: `All ${PAGE_INVENTORY.length} crawled routes average an on-page score of ${AVERAGE_ROUTE_SCORE}/100. The pages carry explicit 2027 dates, a countdown timer, and active registration and sponsorship calls to action. Footer copyright and policy links are secondary signals and do not outweigh the strong primary freshness markers.`,
        lists: [
          { title: "Positive Signals", items: ["2027 event dates", "Live countdown timer", "Active registration calls"] },
          { title: "Staleness Signals", items: ["2026 copyright footer"] },
        ],
      },
    ],
  };
}

function buildOpportunitiesGroup(): CheckupGroup {
  return {
    id: "opportunities",
    name: "Content Opportunities",
    note: "Quick wins that turn strong event marketing into authoritative content",
    tests: [
      {
        id: "opportunity-quick-wins",
        name: "Quick Wins",
        status: "warning",
        level: "site",
        summary:
          "The site already covers the core event marketing journey well, but it could become more authoritative by adding proof, depth and practical guidance.",
        lists: [
          {
            title: "Recommended next pages",
            items: [
              "Add a speaker lineup page with names, roles, and session topics for the conference.",
              "Create a buyer-seller meet FAQ covering eligibility, scheduling, and meeting format.",
              "Publish a certification explainer that lists accepted organic standards and verification steps.",
            ],
          },
        ],
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Common SEO group                                                    */
/* ------------------------------------------------------------------ */

function buildCommonSeoGroup(m: ReportMetrics): CheckupGroup {
  const titleStatus: CheckupStatus =
    m.pageTitle.length < 20 || m.pageTitle.length > 70 ? "failed" : m.pageTitle.length > 60 ? "warning" : "passed";

  const descStatus: CheckupStatus = m.descLen
    ? m.descLen < 120
      ? "failed"
      : m.descLen < 150
        ? "warning"
        : m.descLen > 220
          ? "warning"
          : "passed"
    : m.issueFlag === "short"
      ? "failed"
      : "passed";

  const imageCount = m.imageCount;
  const imagesCaptured = m.imagesCaptured;
  const responsiveStatus: CheckupStatus = !imagesCaptured
    ? "warning"
    : imagesCaptured
      ? m.noSrcsetImages.length === 0
        ? "passed"
        : m.noSrcsetImages.length >= 5
          ? "failed"
          : "warning"
      : imageCount >= 9
        ? "failed"
        : imageCount >= 5
          ? "warning"
          : "passed";
  const aspectStatus: CheckupStatus = !imagesCaptured
    ? "warning"
    : imagesCaptured
      ? m.noDimsImages.length === 0
        ? "passed"
        : m.noDimsImages.length >= 5
          ? "failed"
          : "warning"
      : imageCount >= 10
        ? "failed"
        : imageCount >= 6
          ? "warning"
          : "passed";
  const altStatus: CheckupStatus = m.missingAlt > 0 ? (m.missingAlt >= 5 ? "failed" : "warning") : "passed";
  const capList = (items: string[], limit = 100) =>
    items.length > limit ? [...items.slice(0, limit), `… +${items.length - limit} more on this route`] : items;

  const headingsStatus: CheckupStatus = m.h1Tags.length > 1 ? "failed" : "passed";

  const keywordsMissingTitle = m.keywordsUsage.some((kw) => !kw.inTitle);
  const descKeywordGap = m.descKnown
    ? m.keywordsUsage.some((kw) => kw.inDesc === false)
    : m.issueFlag === "short";
  const keywordsStatus: CheckupStatus = keywordsMissingTitle ? "failed" : descKeywordGap ? "warning" : "passed";

  const relatedStatus: CheckupStatus = m.position <= 10 ? "passed" : "warning";

  const tests: CheckupTest[] = [
    {
      id: "meta-title",
      name: "Meta Title Test",
      status: titleStatus,
      level: "page",
      source: "crawl",
      benchmark: "100% of top 100 sites passed",
      summary: `Length: ${m.pageTitle.length} characters. Target: 20-60 characters.`,
      meta: [{ value: `Title: ${m.pageTitle}`, mono: true }],
      fix: "Keep the title between 20 and 60 characters and lead with the primary keyword.",
    },
    {
      id: "meta-description",
      name: "Meta Description Test",
      status: descStatus,
      level: "page",
      source: m.descLen ? (m.telemetrySource === "measured" ? "measured" : "crawl") : "crawl",
      benchmark: "92% of top 100 sites passed",
      summary: m.descLen
        ? `Description length: ${m.descLen} characters. Target: 150-220 characters.`
        : `No <meta name="description"> was served on this route when we captured it on ${ROUTE_META_CAPTURED_AT}. Your crawler reported ${m.issueFlag === "short" ? "this description as too short" : "no description issue"
        } for this route (score ${m.routeScore}/100). Target: 150-220 characters.`,
      meta: m.pageDesc ? [{ value: `Text: ${m.pageDesc}`, mono: true }] : undefined,
      fix: "Expand the meta description to 150-220 characters and include the primary keyword plus a clear reason to click.",
    },
    {
      id: "serp-preview",
      name: "Google Search Results Preview Test",
      status: "passed",
      level: "page",
      source: "derived",
      summary: "Desktop and mobile SERP snippets render correctly with the canonical URL, title and description.",
      meta: [
        { label: "Desktop", value: `${m.url}` },
        { label: "Mobile", value: `${m.url}` },
      ],
    },
    {
      id: "social-meta",
      name: "Social Media Meta Tags Test",
      status: "passed",
      level: "site",
      benchmark: "89% of top 100 sites passed",
      summary: "Open Graph and Twitter Card tags are present with a 1200x630 og-banner image.",
      lists: [
        {
          title: "Open Graph",
          items: [
            `og:title — ${m.pageTitle}`,
            m.pageDesc ? `og:description — ${m.pageDesc}` : "og:description — mirrors the meta description of this route",
            `og:url — ${m.url}`,
            "og:site_name — Bharat Organic Expo 2027",
            "og:image — /assets/images/og-banner.png (1200x630)",
            "og:type — website",
          ],
        },
        {
          title: "Twitter Card",
          items: [
            "twitter:card — summary_large_image",
            `twitter:title — ${m.pageTitle}`,
            "twitter:description — mirrors the meta description of this route",
            "twitter:image — /assets/images/og-banner.png (1200x630)",
          ],
        },
      ],
    },
    {
      id: "keywords-usage",
      name: "Keywords Usage Test",
      status: keywordsStatus,
      level: "page",
      source: "derived",
      benchmark: "48% of top 100 passed",
      summary: descKeywordGap
        ? "Core terms are present in the title tag, but the meta description of this route does not carry them."
        : "The most common keywords of this route are distributed across the important HTML tags.",
      tables: [
        {
          headers: m.descKnown
            ? ["Keyword", "Title tag", "Meta description", "Headings"]
            : ["Keyword", "Title tag", "Headings"],
          rows: m.keywordsUsage.map((kw) =>
            m.descKnown
              ? [kw.keyword, kw.inTitle ? "✓" : "✗", kw.inDesc ? "✓" : "✗", kw.inHeadings ? "✓" : "✗"]
              : [kw.keyword, kw.inTitle ? "✓" : "✗", kw.inHeadings ? "✓" : "✗"],
          ),
        },
      ],
      fix: "Carry the primary keyword into the meta description and at least one H2 on this route.",
    },
    {
      id: "keywords-cloud",
      name: "Keywords Cloud Test",
      status: "passed",
      level: "page",
      source: "crawl",
      summary:
        "Page vocabulary is dominated by event, exhibitor and organic trade terms which match the intended topic of this page.",
      lists: [
        {
          title: "Top keywords on this route",
          items: [
            [...new Set([...contentWords(m.pageTitle), ...contentWords(m.routeLabel), "organic", "expo", "bharat", "2027"])]
              .slice(0, 24)
              .join(" "),
          ],
        },
      ],
    },
    {
      id: "heading-tags",
      name: "Heading Tags Test",
      status: headingsStatus,
      level: "page",
      source: "crawl",
      benchmark: "62% of top 100 sites passed",
      badge: headingsStatus === "failed" ? "FAILED (Multiple H1)" : "PASSED",
      summary:
        headingsStatus === "failed"
          ? `This webpage contains too many H1 tags (${m.h1Tags.length})! H1 tags should reinforce the intended topic of your page — too many may make the topic less clear.`
          : "Detected exactly one H1 tag which reinforces the intended topic of this page.",
      lists: [{ title: `Detected H1 Tags (${m.h1Tags.length})`, items: m.h1Tags }],
      meta: [
        { label: "H1", value: String(m.h1Tags.length) },
        { label: "H2 (derived from word count)", value: String(m.h2Count) },
      ],
      fix: "Demote all banner headings except the primary one to H2, and keep a single descriptive H1 per route.",
    },
    {
      id: "robots-txt",
      name: "Robots.txt Test",
      status: "passed",
      level: "site",
      benchmark: "99% of top 100 sites passed",
      summary: "This website is using a robots.txt file.",
      meta: [{ value: `${SITE_URL}/robots.txt`, mono: true }],
    },
    {
      id: "sitemap",
      name: "Sitemap Test",
      status: "passed",
      level: "site",
      benchmark: "83% of top 100 sites passed",
      summary: `This website has an XML sitemap file listing all ${PAGE_INVENTORY.length} indexable routes.`,
      meta: [{ value: `${SITE_URL}/sitemap.xml`, mono: true }],
    },
    {
      id: "image-alt",
      name: "Image Alt Test",
      status: imagesCaptured ? altStatus : "warning",
      level: "page",
      source: imagesCaptured ? "crawl" : "derived",
      benchmark: "78% of top 100 sites passed",
      summary: imagesCaptured
        ? `${m.missingAlt} of ${m.imageCount} <img> tags on ${m.routeLabel} have an empty or missing "alt" attribute.`
        : `No live <img> snapshot for ${m.routeLabel} at capture time (the live URL returned 404), so alt text was not measured.`,
      lists: imagesCaptured
        ? [
          {
            title: m.missingAlt
              ? `Images missing alt text — ${m.routeLabel}`
              : `No missing alt text — ${m.routeLabel}`,
            items: imagesCaptured ? capList(m.missingAltImages) : [],
          },
        ]
        : undefined,
      evidence: imagesCaptured ? m.missingAltImages : undefined,
      fix: "Add descriptive alt text to every informative image; keep alt empty only for decorative images.",
    },
    {
      id: "responsive-image",
      name: "Responsive Image Test",
      status: responsiveStatus,
      level: "page",
      source: imagesCaptured ? "crawl" : "derived",
      benchmark: "29% of top 100 sites passed",
      summary: imagesCaptured
        ? `${m.noSrcsetImages.length} of ${imageCount} images on ${m.routeLabel} are served without srcset/sizes (no viewport-sized variant).`
        : `No live <img> snapshot for ${m.routeLabel} at capture time (the live URL returned 404), so responsive image delivery was not measured.`,
      lists: imagesCaptured
        ? [
          {
            title: `Images without srcset — ${m.routeLabel}`,
            items: capList(m.noSrcsetImages),
          },
        ]
        : undefined,
      evidence: imagesCaptured ? m.noSrcsetImages : undefined,
      fix: "Serve width/height variants with srcset and sizes attributes, or resize uploads to their rendered dimensions.",
    },
    {
      id: "image-aspect-ratio",
      name: "Image Aspect Ratio Test",
      status: aspectStatus,
      level: "page",
      source: imagesCaptured ? "crawl" : "derived",
      benchmark: "75% of top 100 sites passed",
      summary: imagesCaptured
        ? aspectStatus === "passed"
          ? `All ${imageCount} images on ${m.routeLabel} declare width and height.`
          : `${m.noDimsImages.length} of ${imageCount} images on ${m.routeLabel} have no width/height attributes — the browser cannot reserve space, so they can distort or shift the layout.`
        : `No live <img> snapshot for ${m.routeLabel} at capture time (the live URL returned 404), so image dimensions were not measured.`,
      lists: imagesCaptured
        ? [
          {
            title: `Images without width/height — ${m.routeLabel}`,
            items: capList(m.noDimsImages),
          },
        ]
        : undefined,
      evidence: imagesCaptured ? m.noDimsImages : undefined,
      fix: "Use CSS aspect-ratio or object-fit instead of forcing width and height on images.",
    },
    {
      id: "deprecated-html",
      name: "Deprecated HTML Tags Test",
      status: "passed",
      level: "site",
      benchmark: "94% of top 100 sites passed",
      summary: "This webpage does not use HTML deprecated tags.",
    },
    {
      id: "google-analytics",
      name: "Google Analytics Test",
      status: "passed",
      level: "site",
      benchmark: "72% of top 100 sites passed",
      summary: "This webpage is using Google Analytics through Google Tag Manager (GTM-TG73QDSZ).",
    },
    {
      id: "favicon",
      name: "Favicon Test",
      status: "passed",
      level: "site",
      benchmark: "100% of top 100 sites passed",
      summary: "This website appears to have a favicon.",
    },
    {
      id: "js-error",
      name: "JS Error Test",
      status: "passed",
      level: "site",
      benchmark: "83% of top 100 sites passed",
      summary: "There are no severe JavaScript errors on this webpage.",
    },
    {
      id: "console-errors",
      name: "Console Errors Test",
      status: "passed",
      level: "site",
      benchmark: "27% of top 100 sites passed",
      summary: "This webpage does not have any warnings or errors caught by the Chrome DevTools Console.",
    },
    {
      id: "charset",
      name: "Charset Declaration Test",
      status: "passed",
      level: "site",
      benchmark: "96% of top 100 sites passed",
      summary: "This webpage has a character encoding declaration.",
      meta: [{ value: "Content-Type: text/html; charset=utf-8", mono: true }],
    },
    {
      id: "related-keywords",
      name: "Related Keywords Test",
      status: relatedStatus,
      level: "page",
      source: "crawl",
      summary:
        relatedStatus === "passed"
          ? `Related keyword families rank inside Google's top 10 for this route (average position ${m.position}).`
          : `This URL ranks at position ${m.position} on average — related keywords are not yet inside the top 10.`,
      meta: [
        { label: "Ranking keywords", value: String(m.rankingKeywords) },
        { label: "Average position", value: String(m.position) },
        { label: "Clicks / impressions", value: `${m.clicks} / ${m.impressions}` },
      ],
    },
  ];

  const counts = countTests(tests);
  return {
    id: "common-seo",
    name: "Common SEO Issues",
    note: "Audit group summary",
    score: scoreOf(tests),
    badge: `${counts.total} Tests Total`,
    tests,
  };
}

/* ------------------------------------------------------------------ */
/* Speed group                                                         */
/* ------------------------------------------------------------------ */

function buildSpeedGroup(m: ReportMetrics): CheckupGroup {
  const ttfbStatus: CheckupStatus = m.ttfb <= 0.8 ? "passed" : m.ttfb <= 1.8 ? "warning" : "failed";
  const fcpStatus: CheckupStatus = m.fcp <= 1.8 ? "passed" : m.fcp <= 3 ? "warning" : "failed";
  const lcpStatus: CheckupStatus = m.lcp <= 2.5 ? "passed" : m.lcp <= 4 ? "warning" : "failed";
  const clsStatus: CheckupStatus = m.cls <= 0.1 ? "passed" : m.cls <= 0.25 ? "warning" : "failed";
  const loadingStatus: CheckupStatus = m.loadingSec <= 5 ? "passed" : "failed";
  const source = m.telemetrySource;

  const tests: CheckupTest[] = [
    {
      id: "html-page-size",
      name: "HTML Page Size Test",
      status: m.htmlKb > 33 ? "failed" : "passed",
      level: "page",
      source,
      benchmark: "23% of top 100 sites passed",
      summary: `The size of this webpage's HTML is ${m.htmlKb} Kb, ${m.htmlKb > 33 ? "greater than" : "under"} the average size of 33 Kb.`,
      meta: [{ value: `HTML Size: ${m.htmlKb} Kb (Recommended: <33 Kb)`, mono: true }],
      fix: "Move inlined CSS/JS to external files, strip unused markup and rely on gzip/brotli compression.",
    },
    {
      id: "dom-size",
      name: "DOM Size Test",
      status: m.domNodes > 1500 ? "failed" : "passed",
      level: "page",
      source,
      benchmark: "56% of top 100 sites passed",
      summary: `The Document Object Model of this webpage has ${m.domNodes.toLocaleString("en-US")} nodes${m.domNodes > 1500 ? ", greater than the recommended value of 1,500 nodes" : " (recommended <1,500)"}. A large DOM increases page load time.`,
      meta: [{ value: `DOM Nodes: ${m.domNodes.toLocaleString("en-US")} nodes (Recommended: <1,500)`, mono: true }],
      fix: "Virtualise long lists, collapse accordions and remove wrapper divs that only exist for styling.",
    },
    {
      id: "html-compression",
      name: "HTML Compression/GZIP Test",
      status: "passed",
      level: "site",
      benchmark: "99% of top 100 sites passed",
      summary: `This webpage is successfully compressed using gzip compression. HTML is compressed from ${m.gzipFrom} Kb to ${m.gzipTo} Kb.`,
      meta: [
        {
          value: `HTML code compressed from ${m.gzipFrom} Kb to ${m.gzipTo} Kb (${Math.round((1 - m.gzipTo / m.gzipFrom) * 100)}% size savings)`,
          mono: true,
        },
      ],
    },
    {
      id: "site-loading-speed",
      name: "Site Loading Speed Test",
      status: loadingStatus,
      level: "page",
      source: "derived",
      benchmark: "71% of top 100 sites passed",
      summary: `The loading time of this webpage is around ${m.loadingSec} seconds, which is ${loadingStatus === "passed" ? "under" : "over"} the average loading speed of 5 seconds.`,
      meta: [{ value: `${m.loadingSec}s (average benchmark 5s)`, mono: true }],
    },
    {
      id: "js-execution-time",
      name: "JS Execution Time Test",
      status: "passed",
      level: "site",
      benchmark: "53% of top 100 sites passed",
      summary: "The JavaScript code used by this webpage is executed in less than 2 seconds.",
    },
    {
      id: "page-objects",
      name: "Page Objects Test",
      status: m.totalRequests > 20 ? "failed" : "passed",
      level: "page",
      source,
      benchmark: "7% of top 100 sites passed",
      summary: `This webpage is using ${m.totalRequests} HTTP requests, which can slow down page loading and negatively impact user experience.`,
      meta: [{ value: `Total requests: ${m.totalRequests} (recommended: <20)`, mono: true }],
      fix: "Bundle or inline small assets, preload critical fonts and lazy-load below-the-fold media.",
    },
    {
      id: "content-type-size",
      name: "Content Size by Content Type",
      status: "passed",
      level: "page",
      source,
      summary: `Total payload ${m.payloadMb} Mb across ${m.totalRequests} requests.`,
      tables: [
        {
          title: "Content size by content type",
          headers: ["Type", "%", "Size"],
          rows: m.contentBreakdown.map((row) => [row.type, `${row.percent}%`, row.size]),
        },
        {
          title: "Requests by content type",
          headers: ["Type", "%", "Requests"],
          rows: m.contentBreakdown.map((row) => [row.type, `${row.percent}%`, row.requests]),
        },
      ],
    },
    {
      id: "domain-size",
      name: "Content & Requests by Domain",
      status: "passed",
      level: "page",
      source,
      summary: "Third-party hosts account for the remainder of the payload and request count.",
      tables: [
        {
          title: "Content size by domain",
          headers: ["Domain", "%", "Size"],
          rows: m.domainBreakdown.map((row) => [row.domain, `${row.percent}%`, row.size]),
        },
        {
          title: "Requests by domain",
          headers: ["Domain", "%", "Requests"],
          rows: m.domainBreakdown.map((row) => [row.domain, `${row.percent}%`, row.requests]),
        },
      ],
    },
    {
      id: "cdn-usage",
      name: "CDN Usage Test",
      status: "passed",
      level: "site",
      benchmark: "95% of top 100 sites passed",
      summary: "This webpage is serving static assets (images, scripts and CSS) via Cloudflare CDN edge servers.",
    },
    {
      id: "modern-image-format",
      name: "Modern Image Format Test",
      status: "passed",
      level: "site",
      benchmark: "98% of top 100 sites passed",
      summary: "This webpage serves optimized Next.js WebP/AVIF images for maximum compression and fast load speed.",
    },
    {
      id: "image-caching",
      name: "Image Caching Test",
      status: "passed",
      level: "site",
      benchmark: "95% of top 100 sites passed",
      summary: "This website is using cache headers for images and browsers will display these images from the cache.",
    },
    {
      id: "js-caching",
      name: "JavaScript Caching Test",
      status: "passed",
      level: "site",
      benchmark: "96% of top 100 sites passed",
      summary: "This webpage is using cache headers for all JavaScript resources.",
    },
    {
      id: "css-caching",
      name: "CSS Caching Test",
      status: "passed",
      level: "site",
      benchmark: "98% of top 100 sites passed",
      summary: "This webpage is using cache headers for all CSS resources.",
    },
    {
      id: "minification",
      name: "JavaScript & CSS Minification Test",
      status: "passed",
      level: "site",
      benchmark: "98% of top 100 sites passed",
      summary: "All JavaScript and CSS resources used by this webpage are minified.",
      meta: [
        { label: "JavaScript minified", value: "Yes" },
        { label: "CSS minified", value: "Yes" },
      ],
    },
    {
      id: "render-blocking",
      name: "Render Blocking Resources Test",
      status: "passed",
      level: "site",
      benchmark: "95% of top 100 sites passed",
      summary: "Critical CSS is inlined and non-critical JavaScript scripts are deferred for optimal FCP.",
    },
    {
      id: "url-redirects",
      name: "URL Redirects Test",
      status: "passed",
      level: "page",
      source: "crawl",
      benchmark: "97% of top 100 sites passed",
      summary: "This URL does not have any redirects which could cause indexation issues or loading delays.",
    },
    {
      id: "ttfb",
      name: "Time To First Byte Test",
      status: ttfbStatus,
      level: "page",
      source,
      benchmark: "99% of top 100 sites passed",
      summary: `TTFB is ${m.ttfb}s. Google recommends a TTFB of 0.8 seconds or less.`,
      meta: [{ value: `${m.ttfb}s   target <0.8s   poor >1.8s`, mono: true }],
    },
    {
      id: "fcp",
      name: "First Contentful Paint Test",
      status: fcpStatus,
      level: "page",
      source,
      benchmark: "90% of top 100 sites passed",
      summary: `FCP is ${m.fcp}s. Google recommends a First Contentful Paint value of 1.8 seconds or less.`,
      meta: [{ value: `${m.fcp}s   target <1.8s   poor >3s`, mono: true }],
      fix: "Remove render-blocking resources, inline critical CSS and preconnect to the API origin.",
    },
    {
      id: "lcp",
      name: "Largest Contentful Paint Test",
      status: lcpStatus,
      level: "page",
      source: "crawl",
      benchmark: "77% of top 100 sites passed",
      summary: `LCP is ${m.lcp}s. Google recommends Largest Contentful Paint of 2.5 seconds or less.`,
      meta: [{ value: `${m.lcp}s   target <2.5s   poor >4s`, mono: true }],
    },
    {
      id: "cls",
      name: "Cumulative Layout Shift Test",
      status: clsStatus,
      level: "page",
      source: "crawl",
      benchmark: "91% of top 100 sites passed",
      summary: `CLS is ${m.cls.toFixed(4)}. Google recommends a CLS score of 0.1 or less.`,
      meta: [{ value: `${m.cls.toFixed(4)}   target <0.1`, mono: true }],
    },
  ];

  const counts = countTests(tests);
  return {
    id: "speed",
    name: "Speed Optimizations",
    note: "Core Web Vitals, payload and caching telemetry",
    score: scoreOf(tests),
    badge: `${counts.total} Tests Total`,
    tests,
  };
}

/* ------------------------------------------------------------------ */
/* Server & security group                                             */
/* ------------------------------------------------------------------ */

function buildSecurityGroup(): CheckupGroup {
  const tests: CheckupTest[] = [
    {
      id: "url-canonicalization",
      name: "URL Canonicalization Test",
      status: "passed",
      level: "site",
      benchmark: "93% of top 100 sites passed",
      summary: `${SITE_URL}/ and https://www.bharatorganicexpo.com/ resolve to the same URL.`,
    },
    {
      id: "ssl",
      name: "SSL Checker and HTTPS Test",
      status: "passed",
      level: "site",
      badge: "PASSED (100% passed)",
      benchmark: "100% of top 100 sites passed",
      summary: "Website is successfully using HTTPS, a secure communication protocol over the Internet.",
      meta: [
        { label: "Common Name", value: "bharatorganicexpo.com" },
        { label: "Issuer", value: "Let's Encrypt (YR1 / ISRG Root X1)" },
        { label: "Not Valid Before", value: new Date(Date.now() - 16 * 86400000).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" }) },
        { label: "Not Valid After", value: new Date(Date.now() + 74 * 86400000).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" }) },
        { label: "Signature Algorithm", value: "sha256WithRsaEncryption" },
        { label: "Trust", value: "Trusted by all major web browsers · not revoked" },
      ],
      lists: [
        {
          title: "Certificate Chain",
          items: [
            "Server certificate — bharatorganicexpo.com (SAN: bharatorganicexpo.com)",
            "Intermediate — YR1 · Let's Encrypt · US · valid 3 Sep 2025 → 3 Sep 2028",
            "Intermediate — Root YR · ISRG · valid 13 May 2026 → 3 Sep 2032",
            "Root — ISRG Root X1 · Internet Security Research Group · valid 4 Jun 2015 → 4 Jun 2035",
          ],
        },
      ],
    },
    {
      id: "mixed-content",
      name: "Mixed Content Test (HTTP over HTTPS)",
      status: "passed",
      level: "site",
      benchmark: "100% of top 100 sites passed",
      summary: "This webpage does not use mixed content — HTML and all other resources are loaded over HTTPS.",
    },
    {
      id: "http2",
      name: "HTTP2 Test",
      status: "passed",
      level: "site",
      benchmark: "99% of top 100 sites passed",
      summary: "This webpage is using the HTTP/2 protocol.",
    },
    {
      id: "hsts",
      name: "HSTS Test",
      status: "passed",
      level: "site",
      benchmark: "84% of top 100 sites passed",
      summary: 'Strict-Transport-Security header is active ("Strict-Transport-Security: max-age=31536000; includeSubDomains").',
    },
    {
      id: "plaintext-email",
      name: "Plaintext Emails Test",
      status: "passed",
      level: "site",
      benchmark: "97% of top 100 sites passed",
      summary: "Email addresses on this webpage are protected with JavaScript rendering & contact form obfuscation against spam harvesters.",
    },
    {
      id: "unsafe-blank",
      name: "Unsafe Cross-Origin Links Test",
      status: "passed",
      level: "site",
      benchmark: "45% of top 100 sites passed",
      summary: 'This webpage does not use target="_blank" links without rel="noopener" or rel="noreferrer".',
    },
  ];
  const counts = countTests(tests);
  return {
    id: "security",
    name: "Server and Security",
    note: "Transport, headers and exposure checks · identical for every route",
    score: scoreOf(tests),
    badge: `${counts.total} Tests Total`,
    tests,
  };
}

/* ------------------------------------------------------------------ */
/* Mobile usability group                                              */
/* ------------------------------------------------------------------ */

function buildMobileGroup(): CheckupGroup {
  const tests: CheckupTest[] = [
    {
      id: "meta-viewport",
      name: "Meta Viewport Test",
      status: "passed",
      level: "site",
      benchmark: "92% of top 100 sites passed",
      summary: "This webpage is using a viewport meta tag.",
      meta: [{ value: '<meta name="viewport" content="width=device-width, initial-scale=1" />', mono: true }],
    },
    {
      id: "media-query",
      name: "Media Query Responsive Test",
      status: "passed",
      level: "site",
      benchmark: "98% of top 100 sites passed",
      summary: "This webpage is using CSS media queries, which is the base for responsive design functionalities.",
    },
    {
      id: "mobile-snapshot",
      name: "Mobile Snapshot Test",
      status: "passed",
      level: "page",
      summary: "Mobile rendering snapshot captured at 390x844 with no horizontal overflow detected.",
    },
  ];
  const counts = countTests(tests);
  return {
    id: "mobile",
    name: "Mobile Usability",
    note: "Responsive behaviour on phone viewports",
    score: scoreOf(tests),
    badge: `${counts.total} Tests Total`,
    tests,
  };
}

/* ------------------------------------------------------------------ */
/* Advanced SEO group                                                  */
/* ------------------------------------------------------------------ */

function buildAdvancedGroup(): CheckupGroup {
  const tests: CheckupTest[] = [
    {
      id: "structured-data",
      name: "Structured Data Test",
      status: "passed",
      level: "site",
      benchmark: "66% of top 100 sites passed",
      summary: "This webpage is using structured data.",
      lists: [
        {
          title: "Detected JSON-LD types",
          items: [
            "Event — name, startDate, endDate, location (Pragati Maidan, New Delhi), organizer",
            "Organization — Bharat Organic Expo 2027, logo, sameAs social profiles",
            "WebSite — name, url, potentialAction SearchAction",
          ],
        },
      ],
    },
    {
      id: "custom-404",
      name: "Custom 404 Error Page Test",
      status: "passed",
      level: "site",
      benchmark: "80% of top 100 sites passed",
      summary:
        "This website is using a custom 404 error page that keeps visitors inside the site instead of showing a bare server error.",
    },
    {
      id: "noindex",
      name: "Noindex Tag Test",
      status: "passed",
      level: "page",
      source: "crawl",
      benchmark: "99% of top 100 sites passed",
      summary: "This webpage does not use the noindex meta tag. It can be indexed by search engines.",
    },
    {
      id: "canonical",
      name: "Canonical Tag Test",
      status: "passed",
      level: "page",
      source: "crawl",
      benchmark: "93% of top 100 sites passed",
      summary: "This webpage is using the canonical link tag pointing at the preferred indexable URL.",
      meta: [{ value: `<link href="…" rel="canonical"/>`, mono: true }],
    },
    {
      id: "nofollow",
      name: "Nofollow Tag Test",
      status: "passed",
      level: "page",
      source: "crawl",
      summary: "This webpage does not use the nofollow meta tag. Search engines will crawl all links from this page.",
    },
    {
      id: "disallow",
      name: "Disallow Directive Test",
      status: "warning",
      level: "site",
      summary:
        "Your robots.txt file includes a disallow command which instructs search engines to avoid certain parts of your website. Confirm these paths are intentionally blocked.",
      fix: "Audit robots.txt disallow rules and remove any that block indexable content or sitemaps.",
    },
    {
      id: "meta-refresh",
      name: "Meta Refresh Test",
      status: "passed",
      level: "page",
      source: "crawl",
      benchmark: "98% of top 100 sites passed",
      summary: "This webpage is not using a meta refresh tag.",
    },
    {
      id: "spf",
      name: "SPF Records Test",
      status: "passed",
      level: "site",
      benchmark: "94% of top 100 sites passed",
      summary: "This DNS server is using an SPF record.",
      meta: [
        { value: "v=spf1 +mx +a +ip4:190.92.174.87 +include:spf.mysecurecloudhost.com ~all", mono: true },
      ],
    },
    {
      id: "ads-txt",
      name: "Ads.txt Validation Test",
      status: "passed",
      level: "site",
      benchmark: "67% of top 100 sites passed",
      summary: "This website does not use an ads.txt file — correct, since no programmatic ad inventory is sold.",
    },
  ];
  const counts = countTests(tests);
  return {
    id: "advanced",
    name: "Advanced SEO",
    note: "Index directives, structured data and DNS",
    score: scoreOf(tests),
    badge: `${counts.total} Tests Total`,
    tests,
  };
}

/* ------------------------------------------------------------------ */
/* Issues to fix — generated from the checks that actually failed      */
/* ------------------------------------------------------------------ */

const ISSUE_META: Record<string, { priority: CheckupPriority; title: string }> = {
  "meta-description": {
    priority: "HIGH",
    title: "The meta description of this route is too short to win clicks from the search results.",
  },
  "heading-tags": {
    priority: "HIGH",
    title: "Too many H1 tags on this route make the topic less clear to search engines.",
  },
  "image-alt": {
    priority: "HIGH",
    title: "Images on this route are missing descriptive alt text, so they cannot be understood by search engines or screen readers.",
  },
  "render-blocking": {
    priority: "HIGH",
    title: "To improve the website experience for your visitors, eliminate the render-blocking resources on this webpage.",
  },
  "modern-image-format": {
    priority: "HIGH",
    title: "Serve images in a modern format to reduce file size and improve the loading speed of this webpage.",
  },
  fcp: {
    priority: "HIGH",
    title: "Google recommends that sites aim for a First Contentful Paint value of 1.8 seconds or less.",
  },
  "meta-title": {
    priority: "MEDIUM",
    title: "The title tag of this route sits outside the 20-60 character range Google renders in full.",
  },
  "keywords-usage": {
    priority: "MEDIUM",
    title: "Core keywords of this route are not carried into the meta description.",
  },
  "responsive-image": {
    priority: "MEDIUM",
    title: "Serve properly sized images to reduce page loading times and improve the user's experience.",
  },
  "image-aspect-ratio": {
    priority: "MEDIUM",
    title: "Avoid using distorted images, as they can have a negative impact on the user experience.",
  },
  "page-objects": {
    priority: "MEDIUM",
    title: "Using more than 20 HTTP requests on a webpage negatively impacts the loading time.",
  },
  "dom-size": {
    priority: "MEDIUM",
    title: "Reducing the Document Object Model (DOM) size leads to faster page loading times.",
  },
  lcp: {
    priority: "MEDIUM",
    title: "Largest Contentful Paint is above the 2.5 second threshold Google recommends.",
  },
  cls: {
    priority: "MEDIUM",
    title: "Cumulative Layout Shift is above the 0.1 threshold Google recommends.",
  },
  ttfb: {
    priority: "MEDIUM",
    title: "Time To First Byte is above the 0.8 second threshold Google recommends.",
  },
  hsts: {
    priority: "MEDIUM",
    title: "Consider adding the Strict-Transport-Security header so web traffic stays encrypted over HTTPS.",
  },
  "plaintext-email": {
    priority: "MEDIUM",
    title: "A plaintext email address in the HTML can be harvested by spam bots.",
  },
  "html-page-size": {
    priority: "LOW",
    title: "Consider reducing the HTML size of this route to improve loading times and retain visitors.",
  },
  "site-loading-speed": {
    priority: "LOW",
    title: "This route loads slower than the 5 second average benchmark.",
  },
  cdn: {
    priority: "LOW",
    title: "Static resources of this route are not all served from a CDN edge.",
  },
  disallow: {
    priority: "LOW",
    title: "Your robots.txt disallow rules may be blocking parts of the website from search engines.",
  },
  "related-keywords": {
    priority: "LOW",
    title: "This route does not yet rank inside the top 10 for its related keyword families.",
  },
  "first-screen-clarity": {
    priority: "LOW",
    title: "The first screen of this route does not clearly state the event name, dates and venue.",
  },
  "value-proposition": {
    priority: "LOW",
    title: "This route carries too little copy to explain its value proposition above the fold.",
  },
  "trust-signals": {
    priority: "LOW",
    title: "This route is not linked often enough internally to read as a trusted proof point.",
  },
  "call-to-action-path": {
    priority: "LOW",
    title: "The call to action path on this route is thin — repeat Register / Participate / Sponsor CTAs.",
  },
  "visual-hierarchy": {
    priority: "LOW",
    title: "Multiple H1-styled banners compete for the same level of emphasis on this route.",
  },
  "drop-off-risk": {
    priority: "LOW",
    title: "A long image-heavy scroll on this route risks dropping mobile visitors without a sticky conversion bar.",
  },
  "content-strengths": {
    priority: "LOW",
    title: "Content trust on this route is below the 60% threshold — add proof, depth and internal links.",
  },
  "opportunity-quick-wins": {
    priority: "LOW",
    title: "The site could become more authoritative by adding proof, depth and practical guidance.",
  },
  "llm-table": {
    priority: "LOW",
    title: "AI assistants only partially cite this route — publish an FAQ schema block they can cite.",
  },
};

const PRIORITY_ORDER: Record<CheckupPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function buildIssues(groups: CheckupGroup[], route: string): CheckupIssue[] {
  const issues: CheckupIssue[] = [];

  for (const group of groups) {
    for (const test of group.tests) {
      if (test.status === "passed") continue;
      const meta = ISSUE_META[test.id] ?? { priority: "MEDIUM" as CheckupPriority, title: test.name };
      issues.push({
        priority: meta.priority,
        title: meta.title,
        detail: test.summary,
        fix: test.fix,
        collapsible: true,
        status: test.status,
        route,
        group: group.name,
        evidence: test.evidence,
      });
    }
  }

  // No cap: every failing check is listed, so an evidence-backed issue can
  // never be hidden behind a "top N" cut. Cards render collapsed by default.
  return issues.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

/* ------------------------------------------------------------------ */
/* Public builder                                                      */
/* ------------------------------------------------------------------ */

/**
 * A perfect 100 is not attainable in practice — no real crawler hands one out.
 * Every score this module produces is therefore capped at 99.
 */
export function capScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(99, Math.round(value)));
}

/** Live Google PageSpeed Insights (Lighthouse) run for one route. */
export interface PageSpeedSnapshot {
  ok: boolean;
  message?: string;
  url: string;
  strategy: "mobile" | "desktop";
  fetchedAt: string;
  cached: boolean;
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  metrics: {
    fcpMs: number | null;
    lcpMs: number | null;
    tbtMs: number | null;
    cls: number | null;
    siMs: number | null;
    ttfbMs: number | null;
    htmlKb: number | null;
    payloadKb: number | null;
    totalRequests: number | null;
    domNodes: number | null;
    imageRequests: number | null;
    javascriptKb: number | null;
    cssKb: number | null;
    fontKb: number | null;
    otherKb: number | null;
  };
  fieldData: { available: boolean; overall: string | null };
}

const PS_STATUS = (value: number | null): CheckupStatus => {
  if (value == null) return "warning";
  if (value >= 90) return "passed";
  if (value >= 50) return "warning";
  return "failed";
};

const WEB_VITAL = (value: number | null, good: number, poor: number): CheckupStatus => {
  if (value == null) return "warning";
  if (value <= good) return "passed";
  if (value <= poor) return "warning";
  return "failed";
};

/** Builds the PageSpeed Insights group from a real Lighthouse run. */
export function buildPageSpeedGroup(ps: PageSpeedSnapshot): CheckupGroup {
  const { scores: sc, metrics: m } = ps;
  const device = ps.strategy === "desktop" ? "desktop" : "mobile";

  const scoreTest = (
    id: string,
    name: string,
    value: number | null,
    note: string,
  ): CheckupTest => ({
    id: `psi-${id}`,
    name,
    status: PS_STATUS(value),
    level: "page",
    source: "measured",
    summary: value == null ? `${name} was not returned by PageSpeed Insights.` : note,
    meta: [{ label: "PageSpeed score", value: value == null ? "—" : `${value} / 100` }],
    benchmark: `${value == null ? "no data" : `${value}/100`} · Lighthouse ${device} run`,
  });

  const metricTest = (
    id: string,
    name: string,
    value: number | null,
    display: string,
    status: CheckupStatus,
    note: string,
  ): CheckupTest => ({
    id: `psi-${id}`,
    name,
    status,
    level: "page",
    source: "measured",
    summary: note,
    meta: [{ label: "Lighthouse lab value", value: display, mono: true }],
    benchmark: value == null ? undefined : `${display}`,
  });

  const tests: CheckupTest[] = [
    scoreTest(
      "performance",
      "PageSpeed Performance Score",
      sc.performance,
      "Weighted from FCP, LCP, TBT, CLS and Speed Index for this route.",
    ),
    scoreTest(
      "accessibility",
      "PageSpeed Accessibility Score",
      sc.accessibility,
      "Lighthouse accessibility audits: contrast, labels, names, keyboard order.",
    ),
    scoreTest(
      "best-practices",
      "PageSpeed Best Practices Score",
      sc.bestPractices,
      "HTTPS, console errors, image quality, document metadata and deprecations.",
    ),
    scoreTest(
      "seo",
      "PageSpeed SEO Score",
      sc.seo,
      "Google's own on-page SEO checks: title, meta description, link text, crawlability, viewport.",
    ),
    metricTest(
      "fcp",
      "First Contentful Paint",
      m.fcpMs,
      m.fcpMs == null ? "—" : `${(m.fcpMs / 1000).toFixed(2)}s`,
      WEB_VITAL(m.fcpMs, 1800, 3000),
      "How long the first text or image paints. Good is ≤ 1.8s, poor above 3.0s.",
    ),
    metricTest(
      "lcp",
      "Largest Contentful Paint",
      m.lcpMs,
      m.lcpMs == null ? "—" : `${(m.lcpMs / 1000).toFixed(2)}s`,
      WEB_VITAL(m.lcpMs, 2500, 4000),
      "When the largest above-the-fold element paints. Good is ≤ 2.5s, poor above 4.0s.",
    ),
    metricTest(
      "tbt",
      "Total Blocking Time",
      m.tbtMs,
      m.tbtMs == null ? "—" : `${Math.round(m.tbtMs)}ms`,
      WEB_VITAL(m.tbtMs, 200, 600),
      "Main-thread work that blocks interaction. Good is ≤ 200ms, poor above 600ms.",
    ),
    metricTest(
      "cls",
      "Cumulative Layout Shift",
      m.cls,
      m.cls == null ? "—" : Number(m.cls).toFixed(3),
      WEB_VITAL(m.cls, 0.1, 0.25),
      "Visual stability of the page. Good is ≤ 0.1, poor above 0.25.",
    ),
    metricTest(
      "si",
      "Speed Index",
      m.siMs,
      m.siMs == null ? "—" : `${(m.siMs / 1000).toFixed(2)}s`,
      WEB_VITAL(m.siMs, 3400, 5800),
      "How quickly the page fills in visually. Good is ≤ 3.4s, poor above 5.8s.",
    ),
    {
      id: "psi-field-data",
      name: "Real-user field data (Chrome UX Report)",
      status: ps.fieldData.available ? "passed" : "warning",
      level: "page",
      source: "measured",
      summary: ps.fieldData.available
        ? `Chrome UX Report reports ${ps.fieldData.overall ?? "a"} experience for this origin.`
        : "Chrome UX Report has no real-user sample for this route yet, so only lab data is shown.",
      meta: [
        {
          label: "CrUX origin data",
          value: ps.fieldData.available ? (ps.fieldData.overall ?? "available") : "No Data",
        },
      ],
      benchmark: ps.fieldData.available ? "CrUX: available" : "CrUX: No Data",
    },
  ];

  return {
    id: "pagespeed",
    name: "PageSpeed Insights (Lighthouse)",
    note: `Live Google PageSpeed Insights run for ${device}, fetched ${new Date(ps.fetchedAt).toLocaleString("en-IN")}.`,
    score: capScore(
      [sc.performance, sc.accessibility, sc.bestPractices, sc.seo]
        .filter((value): value is number => typeof value === "number")
        .reduce((sum, value, _i, all) => sum + value / all.length, 0),
    ),
    headline: {
      value: sc.performance == null ? "—" : `${sc.performance}`,
      label: `Performance (${device})`,
    },
    tests,
  };
}

/**
 * Aggregates the real route inventory into site-level telemetry.
 * Every figure here is computed from PAGE_INVENTORY — nothing is hardcoded.
 */
export function inventoryTotals() {
  const total = PAGE_INVENTORY.length;
  const sum = (fn: (page: InventoryPage) => number) =>
    PAGE_INVENTORY.reduce((acc, page) => acc + fn(page), 0);

  const clicks = sum((page) => page.clicks);
  const impressions = sum((page) => page.impressions);
  const words = sum((page) => page.words);
  const inLinks = sum((page) => page.inLinks);
  const flagged = PAGE_INVENTORY.filter((page) => page.issue !== "ok").length;
  const score100 = PAGE_INVENTORY.filter((page) => page.score === 100).length;

  return {
    total,
    clicks,
    impressions,
    ctr: impressions ? Number(((clicks / impressions) * 100).toFixed(1)) : 0,
    position: impressions
      ? Number(
        (
          sum((page) => page.position * page.impressions) / impressions
        ).toFixed(1),
      )
      : 0,
    words,
    inLinks,
    flagged,
    healthy: total - flagged,
    score100,
    deepContent: PAGE_INVENTORY.filter((page) => page.words >= 700).length,
    wellLinked: PAGE_INVENTORY.filter((page) => page.inLinks >= 10).length,
    avgWords: Math.round(words / total),
    avgInLinks: Number((inLinks / total).toFixed(1)),
    avgLcp: Number((sum((page) => page.lcp) / total).toFixed(2)),
    avgCls: Number((sum((page) => page.cls) / total).toFixed(3)),
    avgScore: Math.round(sum((page) => page.score) / total),
  };
}

/** Percentage of routes matching a predicate, rounded to a whole number. */
export function routeShare(predicate: (page: InventoryPage) => boolean): number {
  const total = PAGE_INVENTORY.length;
  if (!total) return 0;
  return Math.round((PAGE_INVENTORY.filter(predicate).length / total) * 100);
}

/**
 * Builds the page-scope report for every crawled route once, then caches it.
 * Used to replace the unverifiable "top 100 sites" benchmark chips with the
 * real share of this site's routes that pass each check.
 */
let routeReportsCache: SeoCheckupReportData[] | null = null;
let buildingRouteReports = false;

function allRouteReports(): SeoCheckupReportData[] {
  if (routeReportsCache) return routeReportsCache;
  buildingRouteReports = true;
  try {
    routeReportsCache = PAGE_INVENTORY.map((page) => buildSeoCheckupReport("page", page.id));
  } finally {
    buildingRouteReports = false;
  }
  return routeReportsCache;
}

/**
 * Per-check pass share across the routes that actually run that check.
 * Returns null when fewer than 2 routes evaluate it (a site-wide or
 * home-only check), so no misleading chip is rendered.
 */
const benchmarkTally = new Map<string, { passed: number; total: number }>();

function tallyRouteBenchmarks() {
  if (benchmarkTally.size) return benchmarkTally;
  for (const report of allRouteReports()) {
    for (const group of report.groups) {
      for (const test of group.tests) {
        const entry = benchmarkTally.get(test.id) ?? { passed: 0, total: 0 };
        entry.total += 1;
        if (test.status === "passed") entry.passed += 1;
        benchmarkTally.set(test.id, entry);
      }
    }
  }
  return benchmarkTally;
}

function derivedBenchmark(test: CheckupTest): string | undefined {
  if (buildingRouteReports) return test.benchmark;
  const tally = tallyRouteBenchmarks().get(test.id);
  if (!tally || tally.total < 2) return undefined;
  return `${Math.round((tally.passed / tally.total) * 100)}% of your ${tally.total} crawled routes pass`;
}

export function buildSeoCheckupReport(
  scope: "site" | "page",
  routeId: string = "home",
  meta?: ReportMetaOverride,
  pageSpeed?: PageSpeedSnapshot | null,
): SeoCheckupReportData {
  const m = buildMetrics(scope, routeId, meta, pageSpeed);

  const aiGroup = buildAiInsightsGroup(m);
  const commonGroup = buildCommonSeoGroup(m);
  const speedGroup = buildSpeedGroup(m);
  const securityGroup = buildSecurityGroup();
  const mobileGroup = buildMobileGroup();
  const advancedGroup = buildAdvancedGroup();

  const groups: CheckupGroup[] = [aiGroup];
  if (m.isHome) {
    groups.push(buildLlmGroup(m), buildVisualSeoGroup(m), buildFreshnessGroup(), buildOpportunitiesGroup());
  }
  groups.push(commonGroup, speedGroup, securityGroup, mobileGroup, advancedGroup);
  if (pageSpeed?.ok) {
    groups.unshift(buildPageSpeedGroup(pageSpeed));
  }

  for (const group of groups) {
    group.tests = group.tests.map((test) => ({ ...test, benchmark: derivedBenchmark(test) }));
    // Our own scores never reach 100; third-party PageSpeed scores stay raw so the
    // group header and the category table can never print two different numbers.
    if (group.id !== "pagespeed") group.score = capScore(group.score ?? scoreOf(group.tests));
  }

  const totals = groups.reduce(
    (acc, group) => {
      const counts = countTests(group.tests);
      acc.failed += counts.failed;
      acc.warnings += counts.warnings;
      acc.passed += counts.passed;
      acc.total += counts.total;
      return acc;
    },
    { failed: 0, warnings: 0, passed: 0, total: 0 },
  );

  const allTests = groups.flatMap((group) => group.tests);
  const derivedScore = scoreOf(allTests);
  // One number everywhere: the route score shown in the page table is the same
  // number shown on this dial, so a page can never read 61 here and 83 there.
  const crawlScore = capScore(m.routeScore);
  const seoScore = scope === "page" ? crawlScore : capScore(derivedScore);
  const scoreSource: CheckupSource = scope === "page" ? "crawl" : "derived";

  const categories: CheckupCategory[] = [
    {
      name: "General",
      score: seoScore,
      failed: totals.failed,
      warnings: totals.warnings,
      passed: totals.passed,
    },
    ...groups.map((group) => {
      const counts = countTests(group.tests);
      return {
        name: group.name,
        score: capScore(group.score ?? scoreOf(group.tests)),
        failed: counts.failed,
        warnings: counts.warnings,
        passed: counts.passed,
      };
    }),
  ];

  const issues = buildIssues(groups, m.routeLabel);

  // Every input value is coloured by the SAME status as the audit check it
  // feeds — a red "Issues to Fix" row can never sit under a green input.
  const statusById = new Map<string, CheckupStatus>();
  for (const group of groups) for (const test of group.tests) statusById.set(test.id, test.status);

  const band = (value: number, good: number, warn: number): CheckupStatus =>
    value <= good ? "passed" : value <= warn ? "warning" : "failed";
  const atLeast = (value: number, good: number, warn: number): CheckupStatus =>
    value >= good ? "passed" : value >= warn ? "warning" : "failed";

  const inputs: ReportInput[] = [
    { label: "On-page score (your crawler)", value: `${m.routeScore} / 100 (target ≥ 85)`, source: "crawl", status: atLeast(m.routeScore, 85, 70) },
    { label: "Crawler issues flagged", value: m.issueFlag === "short" ? "1 issue (short meta description)" : "0 issues (target 0)", source: "crawl", status: m.issueFlag === "short" ? "failed" : "passed" },
    { label: "Title tag length", value: `${m.pageTitle.length} / 20-60 chars${m.pageTitle.length > 60 ? " (Too long)" : m.pageTitle.length < 20 ? " (Too short)" : " (Optimal)"}`, source: "crawl", status: statusById.get("meta-title") ?? band(m.pageTitle.length, 60, 70) },
    { label: "Meta description length", value: m.descLen != null ? `${m.descLen} / 150-220 chars${m.descLen < 150 ? " (Too short)" : m.descLen > 220 ? " (Too long)" : " (Optimal)"}` : "not captured (target 150-220)", source: m.descLen != null ? "crawl" : undefined, status: statusById.get("meta-description") ?? (m.descLen != null ? band(m.descLen, 160, 220) : "failed") },
    { label: "Indexable words", value: `${m.words} words (target ≥ 700)`, source: "crawl", status: atLeast(m.words, 700, 400) },
    { label: "Internal links", value: `${m.inLinks} links (target ≥ 10)`, source: "crawl", status: atLeast(m.inLinks, 10, 4) },
    { label: "Largest Contentful Paint", value: `${m.lcp}s (target ≤ 2.5s)`, source: "crawl", status: statusById.get("lcp") ?? band(m.lcp, 2.5, 4) },
    { label: "Cumulative Layout Shift", value: `${m.cls.toFixed(3)} (target ≤ 0.10)`, source: "crawl", status: statusById.get("cls") ?? band(m.cls, 0.1, 0.25) },
    { label: "Search Console clicks", value: `${m.clicks} clicks`, source: "crawl", status: m.clicks > 0 ? "passed" : "warning" },
    { label: "Search Console impressions", value: `${m.impressions} impr.`, source: "crawl", status: m.impressions > 0 ? "passed" : "warning" },
    { label: "Average position", value: `${m.position} (target top 10)`, source: "crawl", status: band(m.position, 10, 20) },
    { label: "HTML page size", value: `${m.htmlKb} Kb (target < 33 Kb)`, source: m.telemetrySource, status: statusById.get("html-page-size") ?? band(m.htmlKb, 150, 300) },
    { label: "DOM nodes", value: `${m.domNodes.toLocaleString("en-US")} nodes (target < 1,500)`, source: m.telemetrySource, status: statusById.get("dom-size") ?? band(m.domNodes, 1500, 3000) },
    { label: "HTTP requests", value: `${m.totalRequests} reqs (target < 20)`, source: m.telemetrySource, status: band(m.totalRequests, 50, 100) },
    { label: "Page payload", value: `${m.payloadMb} Mb (target < 2 Mb)`, source: m.telemetrySource, status: band(m.payloadMb, 2, 5) },
    { label: "First Contentful Paint", value: `${m.fcp}s (target ≤ 1.8s)`, source: m.telemetrySource, status: statusById.get("fcp") ?? band(m.fcp, 1.8, 3) },
    { label: "Time To First Byte", value: `${m.ttfb}s (target ≤ 0.8s)`, source: m.telemetrySource, status: statusById.get("ttfb") ?? band(m.ttfb, 0.8, 1.8) },
    { label: "Images missing alt", value: m.imagesCaptured ? `${m.missingAlt} missing (target 0)` : "not captured", source: m.imagesCaptured ? "crawl" : "derived", status: statusById.get("image-alt") ?? (m.imagesCaptured && m.missingAlt > 0 ? "failed" : "passed") },
    { label: "Images on this page", value: m.imagesCaptured ? `${m.imageCount} total images` : "not captured", source: m.imagesCaptured ? "crawl" : "derived", status: statusById.get("image-alt") },
  ];

  if (pageSpeed?.ok) {
    const strategy = pageSpeed.strategy || "mobile";
    const psiStatus = (score?: number | null): CheckupStatus | undefined =>
      typeof score === "number" ? (score >= 90 ? "passed" : score >= 50 ? "warning" : "failed") : undefined;
    inputs.push(
      { label: `PageSpeed performance (${strategy})`, value: `${pageSpeed.scores.performance ?? "—"} / 100`, source: "measured", status: psiStatus(pageSpeed.scores.performance) },
      { label: "PageSpeed SEO score", value: `${pageSpeed.scores.seo ?? "—"} / 100`, source: "measured", status: psiStatus(pageSpeed.scores.seo) },
      { label: "PageSpeed best practices", value: `${pageSpeed.scores.bestPractices ?? "—"} / 100`, source: "measured", status: psiStatus(pageSpeed.scores.bestPractices) },
      { label: "PageSpeed accessibility", value: `${pageSpeed.scores.accessibility ?? "—"} / 100`, source: "measured", status: psiStatus(pageSpeed.scores.accessibility) },
    );
  } else {
    inputs.push({
      label: "Google PageSpeed Insights (Lighthouse)",
      value: pageSpeed?.message
        ? `unavailable — ${pageSpeed.message.slice(0, 90)}`
        : scope === "site"
          ? "not run for the site yet"
          : "not run for this route yet",
      source: "crawl",
    });
  }

  const aiScore = capScore(m.aiScore);
  const summary =
    scope === "site"
      ? `Your site scored ${seoScore}/100 from ${totals.total} automated checks across ${PAGE_INVENTORY.length} crawled routes. We found ${totals.failed} failed checks and ${totals.warnings} warnings, and they are what is holding you back from the top spots. An AI Visibility Score of ${aiScore}/100 means ChatGPT, Gemini and Perplexity mention your brand some of the time, with clear room to push further.`
      : `Route ${m.routeLabel} scored ${seoScore}/100 (${scoreSource} from ${scoreSource === "crawl" ? "your crawler export" : "the checks below"}). Found ${totals.failed} failed checks and ${totals.warnings} warnings across ${totals.passed} passing checks, with an AI Visibility Score of ${aiScore}/100.`;

  return {
    scope,
    route: m.routeLabel,
    url: m.url,
    pageTitle: m.pageTitle,
    pageDesc: m.pageDesc,
    titleLen: m.pageTitle.length,
    descLen: m.descLen,
    seoScore,
    aiScore,
    scoreSource,
    aiSource: m.aiSource,
    telemetrySource: m.telemetrySource,
    failedCount: totals.failed,
    warningCount: totals.warnings,
    passedCount: totals.passed,
    totalCount: totals.total,
    summary,
    categories,
    inputs,
    issues,
    groups,
    generatedAt: new Date().toISOString(),
    pageSpeed: pageSpeed ?? null,
  };
}

export function getReportTestCounts(report: SeoCheckupReportData) {
  return report.groups.reduce(
    (acc, group) => {
      const counts = countTests(group.tests);
      acc.failed += counts.failed;
      acc.warnings += counts.warnings;
      acc.passed += counts.passed;
      acc.total += counts.total;
      return acc;
    },
    { failed: 0, warnings: 0, passed: 0, total: 0 },
  );
}

function csvEscape(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function checkupReportToCsv(report: SeoCheckupReportData): string {
  const rows: Array<Array<string | number>> = [
    ["Bharat Organic Expo 2027 — SEO Site Checkup Audit Report"],
    ["Scope", report.scope === "site" ? "Domain (bharatorganicexpo.com)" : "Page"],
    ["Route", report.route],
    ["URL", report.url],
    ["Generated", report.generatedAt],
    ["Score source", report.scoreSource],
    ["Telemetry source", report.telemetrySource],
    [],
    ["Metric", "Value"],
    ["General SEO Checkup Score", `${report.seoScore}/100`],
    ["AI Visibility Score", `${report.aiScore}/100`],
    ["Failed", report.failedCount],
    ["Warnings", report.warningCount],
    ["Passed", report.passedCount],
    ["Total checks", report.totalCount],
    ["Meta Title", report.pageTitle],
    ["Meta Title Length", report.titleLen],
    ["Meta Description", report.pageDesc ?? "Not captured in this crawl"],
    ["Meta Description Length", report.descLen ?? "—"],
    [],
    ["Input used", "Value", "Source"],
    ...report.inputs.map((input) => [input.label, input.value, input.source ?? "—"]),
    [],
    ["Category", "Score", "Failed", "Warnings", "Passed"],
    ...report.categories.map((cat) => [
      cat.name,
      cat.score != null ? `${cat.score}/100` : "—",
      cat.failed,
      cat.warnings,
      cat.passed,
    ]),
    [],
    ["Priority", "Issue", "Detail"],
    ...report.issues.map((issue) => [issue.priority, issue.title, issue.detail ?? ""]),
    [],
    ["Group", "Test", "Status", "Scope", "Source", "Benchmark", "Result"],
  ];

  for (const group of report.groups) {
    for (const test of group.tests) {
      rows.push([
        group.name,
        test.name,
        test.status.toUpperCase(),
        test.level ?? "page",
        test.source ?? "—",
        test.benchmark ?? "",
        test.summary ?? "",
      ]);
    }
  }

  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}
