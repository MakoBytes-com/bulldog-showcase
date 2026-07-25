import type { NextConfig } from "next";
import path from "node:path";

// Content Security Policy — this showcase forks bulldogsecurityservice.com's
// codebase, so it carries the same Vercel Analytics/Speed Insights, Umami,
// Turnstile, and YouTube-facade code paths (most are dormant here — no
// TURNSTILE/UMAMI env vars are set on this Vercel project — but the CSP
// allows them so the demo doesn't break if those env vars are ever added).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cloud.umami.is https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://challenges.cloudflare.com",
  "font-src 'self' data:",
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com https://cloud.umami.is https://challenges.cloudflare.com",
  "media-src 'self'",
  "frame-src 'self' https://challenges.cloudflare.com https://www.youtube-nocookie.com",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: csp },
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
