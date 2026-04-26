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
  uniqueIndex,
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

// ── Sales leads (scraped prospects) ───────────────────────────────────
//
// Single row per scraped prospect. `source` distinguishes home sales
// from business filings; `external_id` is the source's unique key
// (e.g. county doc number, SOS file number) so we can dedupe across
// reruns of the scraper.
//
// Compliance flags live on every row so the panel can refuse to wire
// up a "Call" button for a lead that hasn't been DNC-scrubbed, or
// that's been internally marked Do Not Contact (anyone who told a
// previous Bulldog rep "stop"). dnc_scrubbed_at is null until a real
// DNC scrub has been run; null means "do not call yet."

export const leadSource = pgEnum("enum_sales_leads_source", [
  "home-sale",
  "business-filing",
]);

export const leadStatus = pgEnum("enum_sales_leads_status", [
  "new",
  "saved",
  "mailed",
  "contacted",
  "quoted",
  "won",
  "dead",
]);

export const salesLeads = pgTable(
  "sales_leads",
  {
    id: serial("id").primaryKey(),
    source: leadSource("source").notNull(),
    externalId: varchar("external_id", { length: 200 }).notNull(),

    // Person / business name + mailing address. Address is the property
    // for home sales (since the buyer just moved in) or the registered
    // agent / principal office for businesses.
    name: varchar("name", { length: 200 }).notNull(),
    address: varchar("address", { length: 200 }),
    city: varchar("city", { length: 80 }),
    state: varchar("state", { length: 4 }),
    zip: varchar("zip", { length: 12 }),

    // Optional contact data — almost always null at scrape time.
    // Populated later via skip-trace, web-form opt-in, or manual lookup.
    contactPhone: varchar("contact_phone", { length: 32 }),
    contactEmail: varchar("contact_email", { length: 200 }),

    // Source-specific payload (sale price, deed type, business type,
    // filing date, principal officer name, etc.). Exact shape depends
    // on the scraper that wrote the row.
    metadata: jsonb("metadata"),

    // Compliance gates. Both must be reviewed before any phone outreach.
    dncScrubbedAt: timestamp("dnc_scrubbed_at", { withTimezone: true }),
    dncFlagged: boolean("dnc_flagged").notNull().default(false),
    internalDoNotContact: boolean("internal_do_not_contact").notNull().default(false),
    consentToCall: boolean("consent_to_call").notNull().default(false),

    // Workflow
    status: leadStatus("status").notNull().default("new"),
    notes: text("notes"),
    assignedToUserId: integer("assigned_to_user_id"),
    nextActionAt: timestamp("next_action_at", { withTimezone: true }),

    scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Dedupe key — a single source row can never appear twice. UNIQUE
    // index so onConflictDoNothing in the scraper can target it.
    uniqueIndex("uniq_sales_leads_source_extid").on(t.source, t.externalId),
    // Sorting by recency for the list views.
    index("idx_sales_leads_scraped_at").on(t.scrapedAt.desc()),
    // Status filter for the saved-leads + pipeline tabs.
    index("idx_sales_leads_status").on(t.status),
  ],
);

// Per-lead activity log. Every status change, note edit, export, DNC
// toggle, and bulk action writes a row here so a sales rep can see
// exactly what happened to a lead and when. user_id is null for system
// events (e.g. an automated re-enrichment writing back HCAD data);
// otherwise it's the admin user who triggered the action. detail holds
// kind-specific payload (e.g. {from: "new", to: "mailed"} for a status
// change, or {batchSize: 23} for a bulk export).
export const salesLeadEvents = pgTable(
  "sales_lead_events",
  {
    id: serial("id").primaryKey(),
    leadId: integer("lead_id").notNull(),
    userId: integer("user_id"),
    kind: varchar("kind", { length: 40 }).notNull(),
    detail: jsonb("detail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_sales_lead_events_lead").on(t.leadId, t.createdAt.desc()),
  ],
);

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

// Competitor Intel — aggregated public reputation stats per competitor
// from BBB Business Profiles. Powers the Competitor Intel tab in the
// sales panel; used to write canvasser scripts and ad copy that
// honestly addresses pain points customers report about competitors.
// Not used for individual targeting — that's pretexting and we don't
// do it (see /admin/sales/about for the rationale).
export const competitorIntel = pgTable("competitor_intel", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  bbbUrl: varchar("bbb_url", { length: 500 }).notNull(),

  bbbRating: varchar("bbb_rating", { length: 8 }), // A+, B, etc
  bbbAccredited: boolean("bbb_accredited"),
  accreditedSince: varchar("accredited_since", { length: 32 }),
  totalComplaints: integer("total_complaints"),
  totalReviews: integer("total_reviews"),
  averageReviewRating: numeric("average_review_rating"), // 1.0-5.0
  yearsInBusiness: integer("years_in_business"),

  // Editable notes — Russell can write the "what to say" angle for each
  // competitor based on their complaint patterns.
  pitchNotes: text("pitch_notes"),

  scrapedAt: timestamp("scraped_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Individual scraped customer complaints from BBB. Powers the
// "Recent complaints" feed under each competitor in the panel.
// Refreshed weekly via the scrape-competitors cron; deduped by
// (competitor_slug, body_hash) so re-scrapes don't double up.
export const competitorComplaints = pgTable(
  "competitor_complaints",
  {
    id: serial("id").primaryKey(),
    competitorSlug: varchar("competitor_slug", { length: 80 }).notNull(),
    bodyHash: varchar("body_hash", { length: 64 }).notNull(),
    filedDate: varchar("filed_date", { length: 16 }), // MM/DD/YYYY as-shown
    complaintType: varchar("complaint_type", { length: 80 }),
    status: varchar("status", { length: 40 }),
    body: text("body").notNull(),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uniq_competitor_complaint").on(t.competitorSlug, t.bodyHash),
    index("idx_competitor_complaint_slug").on(t.competitorSlug),
    index("idx_competitor_complaint_filed").on(t.filedDate),
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
export type SalesLead = typeof salesLeads.$inferSelect;
export type NewSalesLead = typeof salesLeads.$inferInsert;
export type CompetitorIntel = typeof competitorIntel.$inferSelect;
export type NewCompetitorIntel = typeof competitorIntel.$inferInsert;
export type CompetitorComplaint = typeof competitorComplaints.$inferSelect;
export type NewCompetitorComplaint = typeof competitorComplaints.$inferInsert;
export type SalesLeadEvent = typeof salesLeadEvents.$inferSelect;
export type NewSalesLeadEvent = typeof salesLeadEvents.$inferInsert;
