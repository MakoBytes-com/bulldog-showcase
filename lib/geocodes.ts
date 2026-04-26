/**
 * Approximate city / ZIP centroids for the Houston metro. Used to
 * place leads on the admin map without hitting a paid geocoding API.
 *
 * Precision is intentionally coarse (city-level) — a security-sales
 * demo doesn't need rooftop accuracy and we don't have lat/lng on the
 * lead row. Per-pin random jitter is added at render time so multiple
 * leads in the same city don't stack on a single point.
 *
 * Centroids sourced from public domain US Census data.
 */

export type LatLng = { lat: number; lng: number };

// Keys are UPPERCASE city names. `state` is checked too so we don't
// pin a Texas Pasadena onto a California Pasadena (etc.).
type CityCentroid = LatLng & { state: string };

export const CITY_CENTROIDS: Record<string, CityCentroid> = {
  HOUSTON: { lat: 29.7604, lng: -95.3698, state: "TX" },
  SPRING: { lat: 30.0799, lng: -95.4172, state: "TX" },
  CYPRESS: { lat: 29.9691, lng: -95.6972, state: "TX" },
  KATY: { lat: 29.7858, lng: -95.8244, state: "TX" },
  PEARLAND: { lat: 29.5635, lng: -95.286, state: "TX" },
  SUGARLAND: { lat: 29.5994, lng: -95.6344, state: "TX" },
  "SUGAR LAND": { lat: 29.5994, lng: -95.6344, state: "TX" },
  HUMBLE: { lat: 29.9988, lng: -95.2622, state: "TX" },
  KINGWOOD: { lat: 30.0524, lng: -95.1812, state: "TX" },
  TOMBALL: { lat: 30.0972, lng: -95.6161, state: "TX" },
  CONROE: { lat: 30.3119, lng: -95.4561, state: "TX" },
  "THE WOODLANDS": { lat: 30.1659, lng: -95.4613, state: "TX" },
  WOODLANDS: { lat: 30.1659, lng: -95.4613, state: "TX" },
  PASADENA: { lat: 29.6911, lng: -95.2091, state: "TX" },
  DEER_PARK: { lat: 29.7049, lng: -95.1235, state: "TX" },
  "DEER PARK": { lat: 29.7049, lng: -95.1235, state: "TX" },
  BAYTOWN: { lat: 29.7355, lng: -94.9774, state: "TX" },
  "LA PORTE": { lat: 29.6658, lng: -95.0194, state: "TX" },
  CHANNELVIEW: { lat: 29.7766, lng: -95.1135, state: "TX" },
  ALDINE: { lat: 29.9099, lng: -95.3777, state: "TX" },
  "MISSOURI CITY": { lat: 29.6186, lng: -95.5377, state: "TX" },
  STAFFORD: { lat: 29.6161, lng: -95.5577, state: "TX" },
  ROSENBERG: { lat: 29.5572, lng: -95.8086, state: "TX" },
  RICHMOND: { lat: 29.582, lng: -95.7607, state: "TX" },
  FRIENDSWOOD: { lat: 29.5294, lng: -95.201, state: "TX" },
  WEBSTER: { lat: 29.5378, lng: -95.118, state: "TX" },
  "LEAGUE CITY": { lat: 29.5075, lng: -95.0949, state: "TX" },
  ALVIN: { lat: 29.4238, lng: -95.2441, state: "TX" },
  ANGLETON: { lat: 29.1689, lng: -95.4319, state: "TX" },
  GALVESTON: { lat: 29.3013, lng: -94.7977, state: "TX" },
  "TEXAS CITY": { lat: 29.3838, lng: -94.9027, state: "TX" },
  DICKINSON: { lat: 29.4593, lng: -95.0511, state: "TX" },
  BELLAIRE: { lat: 29.7058, lng: -95.4588, state: "TX" },
  "WEST UNIVERSITY PLACE": { lat: 29.7165, lng: -95.4329, state: "TX" },
  HEDWIG: { lat: 29.7736, lng: -95.5205, state: "TX" },
  "HEDWIG VILLAGE": { lat: 29.7736, lng: -95.5205, state: "TX" },
  "JERSEY VILLAGE": { lat: 29.8809, lng: -95.5697, state: "TX" },
  HOCKLEY: { lat: 30.0354, lng: -95.8294, state: "TX" },
  WALLER: { lat: 30.0508, lng: -95.929, state: "TX" },
  HEMPSTEAD: { lat: 30.0966, lng: -96.0775, state: "TX" },
  CROSBY: { lat: 29.911, lng: -95.0613, state: "TX" },
  HIGHLANDS: { lat: 29.819, lng: -95.0588, state: "TX" },
  "MONT BELVIEU": { lat: 29.846, lng: -94.8924, state: "TX" },
  ROSHARON: { lat: 29.3582, lng: -95.4517, state: "TX" },
  MANVEL: { lat: 29.4658, lng: -95.358, state: "TX" },
  IOWA_COLONY: { lat: 29.4419, lng: -95.4197, state: "TX" },
  "IOWA COLONY": { lat: 29.4419, lng: -95.4197, state: "TX" },
  "FRESNO": { lat: 29.5293, lng: -95.4647, state: "TX" },
  "MISSOURI": { lat: 29.6186, lng: -95.5377, state: "TX" },
  // Fallback for unknown — central Houston so the map at least
  // doesn't drop pins at (0,0) in the Atlantic.
};

const HOUSTON_FALLBACK: LatLng = { lat: 29.7604, lng: -95.3698 };

export function geocodeLead(input: {
  city: string | null;
  state: string | null;
}): LatLng | null {
  if (!input.city) return null;
  const key = input.city.toUpperCase().trim();
  const hit = CITY_CENTROIDS[key];
  if (hit && (!input.state || hit.state === input.state.toUpperCase())) {
    return { lat: hit.lat, lng: hit.lng };
  }
  return null;
}

/**
 * Adds a small deterministic jitter (~0.5mi radius) so multiple leads
 * in the same city don't stack on one point. Deterministic by id so
 * the same lead lands in the same spot on every render.
 */
export function jitter(coord: LatLng, seed: number): LatLng {
  const r = (n: number) => {
    // Mulberry32-style cheap deterministic float in [0,1)
    let x = (seed + n) * 0x9e3779b1;
    x = (x ^ (x >>> 15)) >>> 0;
    return ((x % 10_000) / 10_000);
  };
  // ~0.007 deg ≈ 0.5 mile in TX latitude
  const dLat = (r(1) - 0.5) * 0.014;
  const dLng = (r(2) - 0.5) * 0.014;
  return { lat: coord.lat + dLat, lng: coord.lng + dLng };
}

export function fallbackCenter(): LatLng {
  return HOUSTON_FALLBACK;
}
