import "server-only";

import { getSession } from "./session";

/**
 * Server-action / route-handler guard. Throws if the caller doesn't
 * have a real (post-2FA) admin session, returning the userId on
 * success so the action can attribute the change.
 *
 * Server actions execute in the same trust boundary as the dashboard
 * pages, but they're individually addressable — anyone can POST to a
 * server action's RSC endpoint with a forged form. Without an auth
 * gate, the (panel) layout's session check doesn't protect them.
 */
export async function requireAdminUserId(): Promise<number> {
  const session = await getSession();
  if (!session.userId) {
    throw new Error("unauthorized");
  }
  return session.userId;
}
