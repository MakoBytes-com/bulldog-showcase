/**
 * Vercel team identifiers — both the slug (mutable, used for dashboard
 * URLs) and the team ID (immutable, used for API calls).
 *
 * The team ID is stable across renames; the slug is env-driven so a
 * future team rename in the Vercel dashboard is a config-only change
 * (set NEXT_PUBLIC_VERCEL_TEAM_SLUG and redeploy — no code edits).
 *
 * Both values are PUBLIC — they appear in dashboard URLs and the
 * `.vercel/project.json` of every linked project. Not secrets.
 */

export const VERCEL_TEAM_ID = "team_TkkoMwEd3Iu2Hv4Ybic1JAMD";

export const VERCEL_TEAM_SLUG =
  process.env.NEXT_PUBLIC_VERCEL_TEAM_SLUG ?? "mako-studi";

export const VERCEL_DASHBOARD_BASE = `https://vercel.com/${VERCEL_TEAM_SLUG}`;
