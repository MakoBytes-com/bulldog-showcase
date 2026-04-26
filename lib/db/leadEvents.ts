/**
 * Activity-log writer + reader for sales leads. Every meaningful
 * mutation to a lead (status change, note edit, export, bulk action,
 * DNC toggle) writes a row here. The lead detail page reads the last
 * N rows to render a timeline.
 *
 * Failures are swallowed: an audit-log write should never break the
 * underlying action. We log to console so server logs catch it.
 */

import { desc, eq, inArray } from "drizzle-orm";

import { db, schema } from "./index";

export type LeadEventKind =
  | "status_change"
  | "note_changed"
  | "next_action_set"
  | "next_action_cleared"
  | "dnc_set"
  | "dnc_cleared"
  | "exported"
  | "bulk_status_change";

export async function logLeadEvent(input: {
  leadId: number;
  userId: number | null;
  kind: LeadEventKind;
  detail?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(schema.salesLeadEvents).values({
      leadId: input.leadId,
      userId: input.userId ?? null,
      kind: input.kind,
      detail: input.detail ?? null,
    });
  } catch (err) {
    console.error("[leadEvents] insert failed", err);
  }
}

export async function logLeadEventsBulk(input: {
  leadIds: number[];
  userId: number | null;
  kind: LeadEventKind;
  detail?: Record<string, unknown>;
}): Promise<void> {
  if (input.leadIds.length === 0) return;
  try {
    await db.insert(schema.salesLeadEvents).values(
      input.leadIds.map((leadId) => ({
        leadId,
        userId: input.userId ?? null,
        kind: input.kind,
        detail: input.detail ?? null,
      })),
    );
  } catch (err) {
    console.error("[leadEvents] bulk insert failed", err);
  }
}

export type LeadEventWithUser = {
  id: number;
  leadId: number;
  userId: number | null;
  userName: string | null;
  kind: string;
  detail: Record<string, unknown> | null;
  createdAt: Date;
};

export async function listLeadEvents(
  leadId: number,
  limit = 50,
): Promise<LeadEventWithUser[]> {
  const rows = await db
    .select({
      id: schema.salesLeadEvents.id,
      leadId: schema.salesLeadEvents.leadId,
      userId: schema.salesLeadEvents.userId,
      kind: schema.salesLeadEvents.kind,
      detail: schema.salesLeadEvents.detail,
      createdAt: schema.salesLeadEvents.createdAt,
    })
    .from(schema.salesLeadEvents)
    .where(eq(schema.salesLeadEvents.leadId, leadId))
    .orderBy(desc(schema.salesLeadEvents.createdAt))
    .limit(limit);

  if (rows.length === 0) return [];

  const userIds = Array.from(
    new Set(rows.map((r) => r.userId).filter((id): id is number => id !== null)),
  );
  const userById = new Map<number, string>();
  if (userIds.length > 0) {
    const users = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(inArray(schema.users.id, userIds));
    for (const u of users) userById.set(u.id, u.name);
  }

  return rows.map((r) => ({
    id: r.id,
    leadId: r.leadId,
    userId: r.userId,
    userName: r.userId ? userById.get(r.userId) ?? null : null,
    kind: r.kind,
    detail: (r.detail ?? null) as Record<string, unknown> | null,
    createdAt: r.createdAt,
  }));
}
