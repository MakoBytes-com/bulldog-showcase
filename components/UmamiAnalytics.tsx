import Script from "next/script";

/**
 * Umami analytics tracking script.
 * Only renders when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set, so the component
 * is a no-op until the env var lands in Vercel. No partial-wire state.
 *
 * Uses next/script with strategy="afterInteractive" so it doesn't block
 * page render or hurt Core Web Vitals.
 */
export function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const scriptSrc =
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ??
    "https://cloud.umami.is/script.js";

  if (!websiteId) return null;

  return (
    <Script
      src={scriptSrc}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
