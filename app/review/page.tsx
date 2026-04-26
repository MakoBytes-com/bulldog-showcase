import type { Metadata } from "next";

import { ReviewRedirect } from "./ReviewRedirect";

export const metadata: Metadata = {
  title: "Leave a Google Review — Bulldog Security Service",
  robots: { index: false, follow: false },
};

// Always re-evaluate so the ?src= tracking event fires on every visit
// rather than being cached.
export const dynamic = "force-dynamic";

/**
 * Redirect target for review-campaign asks. Visitors land here from
 * email / SMS / invoice / QR with a ?src=<channel> param. We fire a
 * "Review Link Clicked" analytics event on the client (so the channel
 * attribution chart in /admin/review-campaign populates), then bounce
 * them to Google's write-a-review screen.
 *
 * If GOOGLE_PLACES_PLACE_ID is set, we go to the direct write-review
 * URL. Otherwise we fall back to a Google Maps search for the brand
 * name — visitors land in Maps, pick the right listing, and write
 * from there.
 */
function buildTarget(): string {
  const placeId = process.env.GOOGLE_PLACES_PLACE_ID;
  if (placeId) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
  }
  return "https://www.google.com/maps/search/?api=1&query=Bulldog+Security+Service";
}

export default async function ReviewRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  const source = (src ?? "direct").trim().slice(0, 60) || "direct";
  const target = buildTarget();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e2b5c] to-[#0b1a2e] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <span className="font-display text-3xl font-semibold text-white">
          Bulldog
        </span>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[#cfd9e5]">
          Sending you to Google&hellip;
        </p>
        <p className="mt-8 text-sm text-[#cfd9e5]">
          Thanks for taking a minute to leave a review. If your browser
          doesn&rsquo;t redirect automatically:
        </p>
        <a
          href={target}
          className="mt-4 rounded-lg border border-[#3a94d6] bg-[#006fb9] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3a94d6]"
        >
          Open the Google review screen →
        </a>
        <ReviewRedirect target={target} source={source} />
      </div>
    </div>
  );
}
