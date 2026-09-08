import type { NextConfig } from "next";

const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").origin;
const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://mokshasewa.org").origin;
const scriptSrcEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${scriptSrcEval}`,
  "style-src 'self' 'unsafe-inline'",
  // https: (not just 'self') for map tiles (react-leaflet / OpenStreetMap) and Cloudinary media.
  "img-src 'self' data: https:",
  "media-src 'self' https://res.cloudinary.com",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} https://res.cloudinary.com`,
  // Live-preview iframe embeds the public site (moksha_clone_voyage).
  `frame-src ${siteOrigin}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
