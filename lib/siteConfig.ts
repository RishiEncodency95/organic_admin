/**
 * The website the SEO screens are about. Names and addresses shown on those screens come from here,
 * so nothing about another project is written into the screens themselves. Change them from the
 * environment (see .env.example), not in code:
 *
 *   NEXT_PUBLIC_SEO_AUDIT_ORIGIN  the site that is audited (must match SEO_AUDIT_ORIGIN on the backend)
 *   NEXT_PUBLIC_SEO_SITE_NAME     the brand name shown in titles and file names
 *
 * Once an audit exists, the screens prefer the address the backend reports for the audited site.
 */

const FALLBACK_ORIGIN = "https://bharatorganicexpo.com";
const FALLBACK_NAME = "Bharat Organic Expo";

function toOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? `${url.protocol}//${url.host}` : null;
  } catch {
    return null;
  }
}

export const SITE_ORIGIN = toOrigin(process.env.NEXT_PUBLIC_SEO_AUDIT_ORIGIN) ?? FALLBACK_ORIGIN;
export const SITE_HOST = new URL(SITE_ORIGIN).hostname;
export const SITE_NAME = process.env.NEXT_PUBLIC_SEO_SITE_NAME?.trim() || FALLBACK_NAME;
export const SITE_ID = SITE_NAME.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** "moksha-voyage-seo-audit-report.csv" */
export const downloadName = (what: string, extension: string) => `${SITE_ID}-${what}.${extension}`;
