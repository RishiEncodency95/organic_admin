import {
  Activity,
  BarChart3,
  BellRing,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  DatabaseBackup,
  FileSearch,
  FileText,
  GalleryHorizontalEnd,
  Gauge,
  Handshake,
  History,
  LayoutDashboard,
  Link2,
  ListTree,
  LockKeyhole,
  Mail,
  MessageSquare,
  Route,
  SearchCheck,
  Settings,
  ShieldCheck,
  Star,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  disabled?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main Navigation",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "General Enquiries", href: "/general-enquiries", icon: Mail },
      { label: "Communication / Follow-ups", href: "/communication", icon: MessageSquare, badge: "NEW" },
    ],
  },
  {
    title: "Expo Registrations & Leads",
    items: [
      { label: "Exhibitors & Stand Bookings", href: "/engagement-leads", icon: Building2, badge: "48" },
      { label: "Buyer Registrations", href: "/forms-submissions", icon: BriefcaseBusiness, badge: "125" },
      { label: "Visitor Registrations", href: "/requests", icon: Users, badge: "210" },
      { label: "Sponsorships & Partners", href: "/enquiries?category=csr", icon: Handshake, badge: "36" },
      { label: "Newsletter Subscribers", href: "/newsletter", icon: Mail, badge: "342" },
    ],
  },
  {
    title: "Content Management",
    items: [
      { label: "Pages & CMS", href: "/pages", icon: FileText },
      { label: "Services Management", href: "/services", icon: BriefcaseBusiness },
      { label: "Blog & Insights", href: "/blogs", icon: BookOpenText },
      { label: "Media Library", href: "/gallery", icon: GalleryHorizontalEnd },
      { label: "Exhibitor List", href: "/exhibitor-list", icon: Building2 },
      { label: "Testimonials", href: "/testimonials", icon: MessageSquare },
      { label: "FAQs", href: "/faqs", icon: MessageSquare },
      { label: "Navigation Menus", href: "/navigation-menus", icon: ListTree },
    ],
  },
  {
    title: "SEO & Performance",
    items: [
      { label: "SEO Audit", href: "/seo", icon: SearchCheck, badge: "NEW" },
      { label: "Audited Pages", href: "/auditpage", icon: FileSearch },
      { label: "SEO Center", href: "/reports", icon: SearchCheck },
      { label: "Google Search Console", icon: BarChart3, disabled: true },
      { label: "Analytics Dashboard", icon: Gauge, disabled: true },
      { label: "Performance Center", icon: Activity, disabled: true },
      { label: "Site Health Monitor", icon: ShieldCheck, disabled: true },
      { label: "Schema Manager", icon: FileSearch, disabled: true },
      { label: "Redirects Manager", href: "/redirects", icon: Route },
      { label: "Internal Linking", icon: Link2, disabled: true },
    ],
  },
  {
    title: "Reputation Management",
    items: [
      { label: "Google Reviews", href: "/google-reviews", icon: Star, badge: "NEW" },
      { label: "Review Analytics", icon: BarChart3, disabled: true },
      { label: "Response Templates", icon: MessageSquare, disabled: true },
      { label: "Review Alerts", icon: BellRing, disabled: true },
      { label: "Reputation Settings", icon: Settings, disabled: true },
    ],
  },
  {
    title: "System & Security",
    items: [
      { label: "Users & Roles", href: "/roles", icon: Users },
      { label: "Staff Management", href: "/staff", icon: UserCog },
      { label: "Security Center", href: "/system-services", icon: LockKeyhole },
      { label: "Backups & Restore", icon: DatabaseBackup, disabled: true },
      { label: "Audit Logs", href: "/audit-log", icon: History },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
