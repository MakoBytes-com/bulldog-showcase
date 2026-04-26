"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { logLeadEvent } from "@/lib/db/leadEvents";

export type QuoteFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_QUOTE_STATE: QuoteFormState = {
  status: "idle",
  message: "",
};

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") || "unknown";
}

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function normalizePhone(s: string): string {
  // Strip everything but digits so phone-match against a scraped lead
  // works regardless of formatting (parens, dashes, spaces, +1).
  return s.replace(/\D/g, "");
}

/**
 * Public quote-request form. Captures the response into quote_responses
 * with the batch attribution from ?b=<code> if present, then attempts a
 * best-effort match against an existing lead by phone or street address
 * so the sales rep sees the response in-context on the lead's timeline.
 */
export async function submitQuoteAction(
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  // Honeypot — populated only by bots.
  const trap = formData.get("company_website");
  if (typeof trap === "string" && trap.length > 0) {
    return { status: "success", message: "Thanks — we'll be in touch shortly." };
  }

  const ip = await getClientIp();
  const limit = rateLimit(`quote:${ip}`, { limit: 4, windowMs: 15 * 60_000 });
  if (!limit.allowed) {
    return {
      status: "error",
      message: "Too many requests. Please wait a few minutes and try again.",
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const stateAbbr = String(formData.get("state") ?? "").trim().toUpperCase();
  const zip = String(formData.get("zip") ?? "").trim();
  const currentProvider = String(formData.get("current_provider") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const batchCodeRaw = String(formData.get("batch_code") ?? "").trim();

  if (name.length < 2) {
    return { status: "error", message: "Please enter your full name." };
  }
  if (phoneRaw.length === 0 && email.length === 0) {
    return {
      status: "error",
      message: "Please provide either a phone number or an email so we can reach you.",
    };
  }
  if (email.length > 0 && !isLikelyEmail(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const phone = phoneRaw.length > 0 ? phoneRaw : null;
  const phoneDigits = phone ? normalizePhone(phone) : null;

  // Validate the batch code exists; if it doesn't, drop attribution
  // rather than rejecting the form (a bad code shouldn't block a real
  // prospect from submitting).
  let batchCode: string | null = null;
  if (batchCodeRaw && /^[a-z0-9-]{4,32}$/i.test(batchCodeRaw)) {
    const found = await db
      .select({ code: schema.mailBatches.code })
      .from(schema.mailBatches)
      .where(eq(schema.mailBatches.code, batchCodeRaw.toLowerCase()))
      .limit(1);
    if (found.length > 0) batchCode = found[0].code;
  }

  // Best-effort match against existing leads. Phone first (most
  // reliable when present); then street-address-prefix as a fallback.
  let matchedLeadId: number | null = null;
  if (phoneDigits && phoneDigits.length >= 7) {
    // Compare on normalized digits — sales_leads.contactPhone may have
    // formatting we don't want to depend on.
    const candidates = await db
      .select({
        id: schema.salesLeads.id,
        contactPhone: schema.salesLeads.contactPhone,
      })
      .from(schema.salesLeads);
    for (const c of candidates) {
      if (!c.contactPhone) continue;
      if (normalizePhone(c.contactPhone).endsWith(phoneDigits.slice(-10))) {
        matchedLeadId = c.id;
        break;
      }
    }
  }
  if (matchedLeadId === null && address.length > 0) {
    const addrUpper = address.toUpperCase();
    const candidates = await db
      .select({
        id: schema.salesLeads.id,
        address: schema.salesLeads.address,
      })
      .from(schema.salesLeads);
    for (const c of candidates) {
      if (!c.address) continue;
      const cAddr = c.address.toUpperCase();
      if (cAddr === addrUpper || cAddr.startsWith(addrUpper.split(",")[0]!)) {
        matchedLeadId = c.id;
        break;
      }
    }
  }

  const userAgent = (await headers()).get("user-agent")?.slice(0, 400) ?? null;

  try {
    const inserted = await db
      .insert(schema.quoteResponses)
      .values({
        batchCode,
        leadId: matchedLeadId,
        name,
        email: email || null,
        phone,
        address: address || null,
        city: city || null,
        state: stateAbbr.length === 2 ? stateAbbr : null,
        zip: zip || null,
        currentProvider: currentProvider || null,
        message: message || null,
        ip: ip.slice(0, 64),
        userAgent,
      })
      .returning({ id: schema.quoteResponses.id });

    if (matchedLeadId !== null) {
      await logLeadEvent({
        leadId: matchedLeadId,
        userId: null,
        kind: "quote_response",
        detail: {
          batchCode,
          quoteResponseId: inserted[0]?.id ?? null,
          name,
          phone,
          email: email || null,
        },
      });
    }
  } catch (err) {
    console.error("[submitQuoteAction] insert failed", err);
    return {
      status: "error",
      message:
        "We couldn't submit your request. Please call (832) 585-0725 and we'll help you directly.",
    };
  }

  return {
    status: "success",
    message:
      "Thanks — a Bulldog Security specialist will be in touch within 24 hours.",
  };
}
