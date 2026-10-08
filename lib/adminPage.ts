import { NAV_SECTIONS, type NavItem } from "@/components/layout/navigation";

/*
 * Tells the backend which admin page a request comes from, for the Activity Log:
 * X-Admin-Page is the page URL, X-Admin-Module its sidebar menu name (e.g. "Dropdown Manager").
 */

const flatten = (items: NavItem[]): NavItem[] => items.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);

// Menu pages with their names; "↳" items are modals of another page, not pages
const ROUTES = NAV_SECTIONS.flatMap((section) => flatten(section.items))
  .filter((item) => item.href && !item.label.startsWith("↳"))
  .map((item) => ({ path: item.href!.split("?")[0], label: item.label }))
  .sort((a, b) => b.path.length - a.path.length);

const titleFromPath = (path: string) =>
  path
    .split("/")
    .filter(Boolean)
    .filter((part) => !/^[a-f0-9]{24}$/i.test(part))
    .slice(0, 2)
    .join(" ")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

// Header values must be plain ASCII
const ascii = (text: string) => text.replace(/[^\x20-\x7E]/g, "").trim();

export function adminPageHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const { pathname, search } = window.location;
  const match = ROUTES.find((r) => (r.path === "/" ? pathname === "/" : pathname === r.path || pathname.startsWith(`${r.path}/`)));
  return {
    "X-Admin-Page": ascii(`${pathname}${search}`).slice(0, 300),
    "X-Admin-Module": ascii(match?.label ?? titleFromPath(pathname)).slice(0, 80),
  };
}
