"use server";

import { headers } from "next/headers";

import { rateLimit } from "@/lib/rate-limit";

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

/**
 * Public quote-request form. This is a pure static/public demo fork with
 * no database — the original insert into `quote_responses` plus the
 * best-effort match against `sales_leads` (so a rep would see the
 * response in-context on the lead's timeline in Mako Admin) were removed
 * along with the rest of the admin/sales CRM. This still validates the
 * submission and rate-limits it, then returns the same success copy a
 * real visitor would see — nothing is persisted.
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

  return {
    status: "success",
    message:
      "Thanks — a Bulldog Security specialist will be in touch within 24 hours.",
  };
}
