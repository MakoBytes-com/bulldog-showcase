import type { NextConfig } from "next";
import path from "node:path";

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const LEGACY_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/about", destination: "/about-us" },
  { source: "/about/", destination: "/about-us" },
  { source: "/meet-the-team", destination: "/about-us/meet-the-team" },
  { source: "/meet-the-team/", destination: "/about-us/meet-the-team" },
  { source: "/faq", destination: "/about-us/faq" },
  { source: "/faq/", destination: "/about-us/faq" },
  { source: "/privacy", destination: "/privacy-policy" },
  { source: "/privacy/", destination: "/privacy-policy" },
  { source: "/terms", destination: "/terms-conditions" },
  { source: "/terms/", destination: "/terms-conditions" },
  { source: "/blog", destination: "/news" },
  { source: "/blog/", destination: "/news" },
  { source: "/blog/:slug*", destination: "/news/:slug*" },
];

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
