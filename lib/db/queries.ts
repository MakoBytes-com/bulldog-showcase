/**
 * Collection queries for Bulldog admin panel. Thin wrappers over
 * Drizzle so pages and server actions stay readable.
 */

import { asc, desc, eq } from "drizzle-orm";

import { db, schema } from "./index";

// ── Contact submissions ───────────────────────────────────────────────

export async function listSubmissions() {
  return db
    .select()
    .from(schema.contactSubmissions)
    .orderBy(desc(schema.contactSubmissions.createdAt));
}

export async function getSubmission(id: number) {
  const rows = await db
    .select()
    .from(schema.contactSubmissions)
    .where(eq(schema.contactSubmissions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function setSubmissionHandled(id: number, handled: boolean) {
  await db
    .update(schema.contactSubmissions)
    .set({ handled, updatedAt: new Date() })
    .where(eq(schema.contactSubmissions.id, id));
}

export async function setSubmissionNotes(id: number, notes: string) {
  await db
    .update(schema.contactSubmissions)
    .set({ notes, updatedAt: new Date() })
    .where(eq(schema.contactSubmissions.id, id));
}

export async function deleteSubmission(id: number) {
  await db
    .delete(schema.contactSubmissions)
    .where(eq(schema.contactSubmissions.id, id));
}

// ── Posts ─────────────────────────────────────────────────────────────

export async function listPosts() {
  return db.select().from(schema.posts).orderBy(desc(schema.posts.updatedAt));
}

export async function getPost(id: number) {
  const rows = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPostBySlug(slug: string) {
  const rows = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPublishedPosts() {
  return db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.status, "published"))
    .orderBy(desc(schema.posts.publishedAt));
}

// ── Team ──────────────────────────────────────────────────────────────

export async function listTeam() {
  return db
    .select()
    .from(schema.teamMembers)
    .orderBy(asc(schema.teamMembers.order), asc(schema.teamMembers.name));
}

export async function getTeamMember(id: number) {
  const rows = await db
    .select()
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ── FAQs ──────────────────────────────────────────────────────────────

export async function listFaqs() {
  return db
    .select()
    .from(schema.faqs)
    .orderBy(asc(schema.faqs.order), asc(schema.faqs.question));
}

/**
 * Page-scoped FAQ list. Used by public pages to render their FAQ
 * section from the DB instead of hardcoded arrays in the page source.
 * Returns rows ordered by `order` with question as a tiebreaker.
 */
export async function listFaqsByPath(pagePath: string) {
  const rows = await db
    .select({
      id: schema.faqs.id,
      question: schema.faqs.question,
      answer: schema.faqs.answer,
    })
    .from(schema.faqs)
    .where(eq(schema.faqs.pagePath, pagePath))
    .orderBy(asc(schema.faqs.order), asc(schema.faqs.question));

  return rows.map((r) => ({ q: r.question, a: r.answer }));
}

export async function getFaq(id: number) {
  const rows = await db
    .select()
    .from(schema.faqs)
    .where(eq(schema.faqs.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ── Media ─────────────────────────────────────────────────────────────

export async function listMedia() {
  return db
    .select()
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt));
}

export async function getMediaById(id: number) {
  const rows = await db
    .select()
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);
  return rows[0] ?? null;
}
