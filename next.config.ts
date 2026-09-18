import type { NextConfig } from "next";

let apiOrigin = "http://localhost:4001";
try {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith("http")) {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
  }
} catch {
  apiOrigin = "http://localhost:4001";
}

let siteOrigin = "http://localhost:3002";
try {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")) {
    siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL).origin;
  }
} catch {
  siteOrigin = "http://localhost:3002";
}

const isProd = process.env.NODE_ENV === "production";
const scriptSrcEval = isProd ? "" : " 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${scriptSrcEval} 'wasm-unsafe-eval'`,
  "worker-src 'self' blob: data:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob: http:",
  "media-src 'self' https://res.cloudinary.com https://api.bharatorganicexpo.com http://localhost:4001 http://localhost:4000 http://localhost:3001 blob: data:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin} https://api.bharatorganicexpo.com https://bharatorganicexpo.com https://*.bharatorganicexpo.com http://localhost:4001 http://localhost:4000 https://res.cloudinary.com https://lottie.host https://cdn.jsdelivr.net blob: data:`,
  `frame-src 'self' ${siteOrigin} http://localhost:3002 https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://instagram.com`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/testimonial_videos",
        destination: "/testimonial-videos",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${apiOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
