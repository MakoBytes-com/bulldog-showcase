"use server";

import { Resend } from "resend";
import { headers } from "next/headers";
import { SITE } from "@/lib/site";
import { rateLimit } from "@/lib/rate-limit";

export type FormType = "consult" | "contact" | "schedule" | "careers";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_STATE: FormState = { status: "idle", message: "" };

type Row = { label: string; value: string };

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[form] TURNSTILE_SECRET_KEY not set — skipping captcha verification");
    return true;
  }
  if (!token) return false;
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return h.get("x-real-ip") || "unknown";
}

function isLikelyEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function labelFor(type: FormType): string {
  switch (type) {
    case "consult":
      return "Virtual Consult Request";
    case "contact":
      return "Contact Form";
    case "schedule":
      return "Service Appointment Request";
    case "careers":
      return "Career Inquiry";
  }
}

function buildRows(type: FormType, data: FormData, ip: string): Row[] {
  const rows: Row[] = [];
  const g = (k: string) => String(data.get(k) ?? "").trim();

  rows.push({ label: "Name", value: g("name") });
  if (g("email")) rows.push({ label: "Email", value: g("email") });
  rows.push({ label: "Phone", value: g("phone") || "(not provided)" });

  if (type === "consult") {
    if (g("zip")) rows.push({ label: "ZIP", value: g("zip") });
    if (g("preferredDate")) rows.push({ label: "Preferred Date", value: g("preferredDate") });
    if (g("preferredTime")) rows.push({ label: "Preferred Time", value: g("preferredTime") });
  }
  if (type === "schedule") {
    if (g("accountNumber")) rows.push({ label: "Account #", value: g("accountNumber") });
    if (g("preferredDate")) rows.push({ label: "Preferred Date", value: g("preferredDate") });
    if (g("notes")) rows.push({ label: "Notes", value: g("notes") });
  }
  if (g("message")) rows.push({ label: "Message", value: g("message") });

  rows.push({ label: "Client IP", value: ip });
  rows.push({ label: "Submitted", value: new Date().toISOString() });
  return rows;
}

export async function submitForm(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const formType = String(formData.get("formType") ?? "contact") as FormType;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("website") ?? "").trim();
  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");

  // Honeypot — bots fill every field. Silently "succeed" so they don't retry.
  if (honeypot) {
    console.warn("[form] honeypot triggered — dropping submission");
    return { status: "success", message: "Thanks — we got it. We'll reach out shortly." };
  }

  // Length guards
  if (name.length > 200 || email.length > 200 || phone.length > 50) {
    return { status: "error", message: "That looks too long. Please shorten and try again." };
  }
  if (message.length > 5000) {
    return { status: "error", message: "Your message is over the 5000-character limit." };
  }

  // Required-field rules vary by form type
  if (!name) return { status: "error", message: "Please enter your name." };
  if (!phone) return { status: "error", message: "Please enter a phone number we can reach you at." };
  if ((formType === "contact" || formType === "careers") && !message) {
    return { status: "error", message: "Please add a brief message so we know how to help." };
  }
  if (formType === "careers") {
    if (!email) return { status: "error", message: "Please enter your email address." };
    if (!isLikelyEmail(email)) {
      return { status: "error", message: "That email address doesn't look right — please double-check." };
    }
  }
  if (email && !isLikelyEmail(email)) {
    return { status: "error", message: "That email address doesn't look right — please double-check." };
  }

  // Per-IP rate limit: 3 submissions per 15 min (across all form types).
  const ip = await getClientIp();
  const rl = rateLimit(`form:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 });
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.resetMs / 60000);
    return {
      status: "error",
      message: `Too many recent submissions. Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before trying again, or call us directly at (832) 585-0725.`,
    };
  }

  const captchaOk = await verifyTurnstile(turnstileToken, ip === "unknown" ? undefined : ip);
  if (!captchaOk) {
    return { status: "error", message: "Captcha verification failed. Please reload the page and try again." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO ?? SITE.internalEmail;
  const from = process.env.CONTACT_EMAIL_FROM ?? `Bulldog Website <onboarding@resend.dev>`;

  if (!apiKey) {
    console.warn("[form] RESEND_API_KEY not set — form submission skipped");
    return {
      status: "error",
      message:
        "The form isn't fully connected yet. Please call us directly at (832) 585-0725 while we finish setup.",
    };
  }

  const rows = buildRows(formType, formData, ip);
  const subject = `[${labelFor(formType)}] ${name}`;
  const text = [`New ${labelFor(formType)} from bulldogsecurityservice.com`, "", ...rows.map((r) => `${r.label.padEnd(16)} ${r.value}`)].join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email || undefined,
      subject,
      text,
    });
    if (error) {
      console.error("[form] resend error", error);
      return {
        status: "error",
        message: "We couldn't send your message right now. Please try again — or call us directly.",
      };
    }
  } catch (err) {
    console.error("[form] resend threw", err);
    return {
      status: "error",
      message: "Something went wrong. Please try again in a moment — or call us directly.",
    };
  }

  const successCopy: Record<FormType, string> = {
    consult: "Thanks — we got your consult request. A Bulldog representative will reach out shortly to confirm your appointment.",
    contact: "Thanks — we got your message. Our customer care team will follow up shortly.",
    schedule: "Thanks — we got your service request. We'll follow up shortly to confirm your appointment.",
    careers: "Thanks — we got your interest. A member of our recruitment team will be in touch soon.",
  };

  return { status: "success", message: successCopy[formType] };
}
