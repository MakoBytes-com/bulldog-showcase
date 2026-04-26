export type GoogleReviewStats = {
  rating: number;
  count: number;
  mapsUrl: string;
  stale?: boolean;
};

export type GoogleReview = {
  authorName: string;
  rating: number;
  text: string;
  publishedAtIso: string | null;
};

const FALLBACK: GoogleReviewStats = {
  rating: 5.0,
  count: 6,
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Mako+Logics+Montgomery+TX",
  stale: true,
};

/**
 * Fetches the most recent Google reviews (up to 5) for the Mako Logics
 * place. Currently used by GoogleReviewBadge to surface the rating +
 * count on /, /why-mako, /contact. Review TEXT is only present on the
 * Places API's larger field mask, but we no longer surface review
 * bodies (the testimonials feature was retired 2026-04-25).
 */
export async function fetchGoogleReviews(): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACES_PLACE_ID;
  if (!apiKey || !placeId) return [];

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=reviews`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "reviews",
        },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      reviews?: Array<{
        authorAttribution?: { displayName?: string };
        rating?: number;
        text?: { text?: string };
        originalText?: { text?: string };
        publishTime?: string;
      }>;
    };
    return (data.reviews ?? [])
      .map((r) => ({
        authorName: r.authorAttribution?.displayName?.trim() ?? "",
        rating: typeof r.rating === "number" ? r.rating : 0,
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        publishedAtIso: r.publishTime ?? null,
      }))
      .filter((r) => r.authorName && r.text && r.rating > 0);
  } catch {
    return [];
  }
}

export async function getGoogleReviewStats(): Promise<GoogleReviewStats> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACES_PLACE_ID;

  if (!apiKey || !placeId) {
    return FALLBACK;
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,googleMapsUri`,
      {
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return FALLBACK;
    }

    const data = (await res.json()) as {
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
    };

    if (typeof data.rating !== "number" || typeof data.userRatingCount !== "number") {
      return FALLBACK;
    }

    return {
      rating: data.rating,
      count: data.userRatingCount,
      mapsUrl: data.googleMapsUri ?? FALLBACK.mapsUrl,
    };
  } catch {
    return FALLBACK;
  }
}
