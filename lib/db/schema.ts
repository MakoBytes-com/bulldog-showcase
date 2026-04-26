/**
 * Drizzle schema for Bulldog admin panel — single source of truth for
 * every table the site reads from Neon. New tables and columns get
 * added here (plus a matching migration if needed) and Drizzle
 * generates the typed query surface.
 *
 * Adapted from the Makologics Makopanel schema (2026-04-25). MSP-only
 * tables (caseStudies, complianceTasks, clientLogos, leads, blogTopicIdeas)
 * were dropped; post + FAQ categories were re-themed for a residential /
 * commercial security company.
 */

import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// Enums — exact literal sets provisioned in the DB.
export const userRole = pgEnum("enum_users_role", ["admin", "editor"]);

export const postCategory = pgEnum("enum_posts_category", [
  "Home Security",
  "Business Security",
  "Smart Home",
  "Industry News",
  "Tips & Guides",
]);
export const postStatus = pgEnum("enum_posts_status", ["draft", "published"]);

export const faqCategory = pgEnum("enum_faqs_category", [
  "general",
  "monitoring",
  "cameras",
  "smart-home",
  "commercial",
]);

// Users — Bulldog-owned columns plus TOTP fields. totp_secret is
// stored encrypted (see lib/auth/secretCrypto.ts); never read raw
// from the DB by the admin UI.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  role: userRole("role").notNull(),
  passwordHash: varchar("password_hash"),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  totpSecret: text("totp_secret"),
  totpEnrolledAt: timestamp("totp_enrolled_at", { withTimezone: true }),
  passwordResetTokenHash: varchar("password_reset_token_hash"),
  passwordResetExpiresAt: timestamp("password_reset_expires_at", {
    withTimezone: true,
  }),
  passwordResetRequestedAt: timestamp("password_reset_requested_at", {
    withTimezone: true,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const userRecoveryCodes = pgTable("user_recovery_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  codeHash: varchar("code_hash").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull(),
  excerpt: varchar("excerpt"),
  category: postCategory("category"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  readingMinutes: numeric("reading_minutes"),
  coverImageId: integer("cover_image_id"),
  contentMd: text("content_md"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  status: postStatus("_status"),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  role: varchar("role"),
  location: varchar("location"),
  order: numeric("order"),
  photoId: integer("photo_id"),
  photoUrl: varchar("photo_url"),
  bio: varchar("bio"),
  email: varchar("email"),
  linkedIn: varchar("linked_in"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question").notNull(),
  answer: varchar("answer").notNull(),
  category: faqCategory("category"),
  pagePath: varchar("page_path"),
  order: numeric("order"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  company: varchar("company"),
  serviceNeed: varchar("service_need"),
  orgSize: varchar("org_size"),
  industry: varchar("industry"),
  message: varchar("message"),
  handled: boolean("handled"),
  notes: varchar("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

// Analytics — one row per page view. Populated by the client tracker
// in components/PageViewTracker.tsx posting to /api/pv. Bots are
// filtered out at the API boundary via the `isbot` package before
// insert, so this table reflects human traffic only.
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: varchar("path").notNull(),
  referrer: varchar("referrer"),
  userAgent: varchar("user_agent"),
  sessionId: varchar("session_id").notNull(),
  ip: varchar("ip"),
  country: varchar("country"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Analytics events — human-readable names fired by ConversionEvents
// ("Phone Call — Header", "Schedule Click — Sticky Mobile Bar", etc.).
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  path: varchar("path").notNull(),
  sessionId: varchar("session_id").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Error events — server-side errors captured by logError/logWarn.
// Fingerprint groups identical (module + message) errors so the
// admin dashboard can show them as Sentry-style aggregated rows.
export const errorLevel = pgEnum("enum_error_events_level", ["error", "warn"]);

export const errorEvents = pgTable("error_events", {
  id: serial("id").primaryKey(),
  level: errorLevel("level").notNull(),
  module: varchar("module").notNull(),
  message: varchar("message").notNull(),
  fingerprint: varchar("fingerprint").notNull(),
  stack: text("stack"),
  path: varchar("path"),
  userAgent: varchar("user_agent"),
  context: jsonb("context"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: integer("resolved_by"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
});

export const errorAlerts = pgTable("error_alerts", {
  fingerprint: varchar("fingerprint").primaryKey(),
  lastAlertedAt: timestamp("last_alerted_at", { withTimezone: true }).notNull().defaultNow(),
  alertCount: integer("alert_count").notNull(),
});

// Distributed rate-limiter store. One row per attempt; checked by
// COUNT(*) within a window for a given bucket_key (e.g.
// "login:ip:1.2.3.4", "login:email:foo@bar.com"). Rows older than the
// longest-relevant window are pruned probabilistically by the limiter.
// Replaces the previous in-memory Map limiter which was bypassable on
// a multi-instance Vercel deploy by distributing attempts across cold
// starts.
export const rateLimitAttempts = pgTable(
  "rate_limit_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    bucketKey: varchar("bucket_key", { length: 200 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_rl_bucket_time").on(t.bucketKey, t.occurredAt.desc()),
    index("idx_rl_occurred_at").on(t.occurredAt),
  ],
);

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  alt: varchar("alt"),
  caption: varchar("caption"),
  url: varchar("url"),
  thumbnailUrl: varchar("thumbnail_u_r_l"),
  filename: varchar("filename"),
  mimeType: varchar("mime_type"),
  filesize: numeric("filesize"),
  width: numeric("width"),
  height: numeric("height"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type Media = typeof media.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type ErrorEvent = typeof errorEvents.$inferSelect;
export type NewErrorEvent = typeof errorEvents.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
