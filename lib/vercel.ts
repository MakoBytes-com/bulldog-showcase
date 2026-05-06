/**
 * Vercel API client for the admin dashboard's "Recent Deployments"
 * card. Reads ADMIN_VERCEL_TOKEN + VERCEL_PROJECT_ID + VERCEL_TEAM_ID
 * from the env. Falls back gracefully if the token is unset so the
 * dashboard still renders without it.
 *
 * Note: env var is intentionally NOT named VERCEL_TOKEN — that name
 * is reserved by Vercel's own CLI, which auto-authenticates with
 * whatever's in VERCEL_TOKEN during the build process. Using a
 * different name keeps our admin-dashboard token isolated from the
 * CLI's auth flow.
 *
 * Token: create at https://vercel.com/account/tokens scoped to the
 * mako-studi team (read scope is sufficient — we never mutate).
 * Project + team IDs are hardcoded as defaults below.
 */

const VERCEL_API = "https://api.vercel.com";

// bulldogsecurityservice-com on Vercel — public identifiers, safe to hardcode.
// Override via env if the project is ever moved or the team is renamed.
const DEFAULT_PROJECT_ID = "prj_dnOD9ClmUUk362EXku5KSeGqAHMf";
const DEFAULT_TEAM_SLUG = "mako-studi";

export type VercelDeployment = {
  uid: string;
  url: string;
  inspectorUrl: string | null;
  state: string; // QUEUED | BUILDING | INITIALIZING | READY | ERROR | CANCELED
  target: string | null; // "production" | "preview" | null
  createdAt: number; // unix ms
  commitMessage: string | null;
  commitSha: string | null;
  commitAuthor: string | null;
};

export type RecentDeploymentsResult =
  | { ok: true; deployments: VercelDeployment[] }
  | { ok: false; reason: string };

export async function getRecentDeployments(
  limit = 6,
): Promise<RecentDeploymentsResult> {
  const token = process.env.ADMIN_VERCEL_TOKEN;
  if (!token) {
    return {
      ok: false,
      reason:
        "ADMIN_VERCEL_TOKEN env var not set. Create a token at https://vercel.com/account/tokens (read scope, mako-studi team), then add it as ADMIN_VERCEL_TOKEN (NOT VERCEL_TOKEN — that name collides with Vercel CLI auth).",
    };
  }

  const projectId = process.env.VERCEL_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const teamSlug = process.env.VERCEL_TEAM_SLUG ?? DEFAULT_TEAM_SLUG;

  const url = new URL(`${VERCEL_API}/v6/deployments`);
  url.searchParams.set("projectId", projectId);
  url.searchParams.set("slug", teamSlug);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("target", "production");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        ok: false,
        reason: `Vercel API ${res.status}: ${body.slice(0, 200)}`,
      };
    }
    const data = (await res.json()) as {
      deployments?: Array<{
        uid: string;
        url: string;
        inspectorUrl?: string;
        state: string;
        target?: string | null;
        createdAt?: number;
        meta?: {
          githubCommitMessage?: string;
          githubCommitSha?: string;
          githubCommitAuthorName?: string;
        };
      }>;
    };

    const deployments: VercelDeployment[] = (data.deployments ?? []).map(
      (d) => ({
        uid: d.uid,
        url: d.url,
        inspectorUrl: d.inspectorUrl ?? null,
        state: d.state,
        target: d.target ?? null,
        createdAt: d.createdAt ?? 0,
        commitMessage: d.meta?.githubCommitMessage ?? null,
        commitSha: d.meta?.githubCommitSha ?? null,
        commitAuthor: d.meta?.githubCommitAuthorName ?? null,
      }),
    );

    return { ok: true, deployments };
  } catch (err) {
    return { ok: false, reason: `Vercel API fetch failed: ${String(err)}` };
  }
}

/**
 * Human-readable relative time, plain English (matches Mako Admin's
 * dashboard preference). e.g. "3 minutes ago", "2 hours ago",
 * "Yesterday", "3 days ago".
 */
export function relativeTime(unixMs: number): string {
  if (!unixMs) return "—";
  const diff = Date.now() - unixMs;
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 30) return `${day} days ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
  return new Date(unixMs).toLocaleDateString("en-US");
}
