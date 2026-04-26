import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sql as drizzleSql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { logError } from "@/lib/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Error-spike alert cron.
 *
 * Scans `error_events` from the last LOOKBACK_MIN minutes, groups by
 * fingerprint, and emails Russell for any group whose count >=
 * SPIKE_THRESHOLD that we haven't already alerted on within
 * COOLDOWN_MIN. Sent alerts are recorded in `error_alerts` so we don't
 * re-page on the same fingerprint while it's still firing.
 *
 * Triggered every 5 minutes by Vercel Cron (vercel.json) — we only need
 * to be roughly responsive, not real-time. Also callable manually with a
 * Bearer CRON_SECRET for testing.
 */
const LOOKBACK_MIN = 5;
const SPIKE_THRESHOLD = 3;
const COOLDOWN_MIN = 30;
const MAX_FINGERPRINTS_PER_EMAIL = 5;

// Hardcoded destination: spike alerts are operational paging for the
// Bulldog admin team directly. Override via env if you want a different
// recipient than the public contact email.
const ALERTS_TO = process.env.ALERTS_EMAIL_TO ?? "info@bdsnation.com";
const FROM_EMAIL = process.env.CONTACT_EMAIL_FROM ?? "info@bdsnation.com";

const SITE_URL = "https://bulldogsecurityservice.com";

function isAuthorized(req: Request): boolean {
  if (req.headers.get("x-vercel-cron") !== null) return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

type SpikeRow = {
  fingerprint: string;
  module: string;
  message: string;
  count: number;
  sample_path: string | null;
  last_seen: Date;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    // Group recent errors by fingerprint, only those above threshold,
    // and only those NOT already alerted within the cooldown window.
    const rows = await db.execute<SpikeRow>(drizzleSql`
      SELECT
        e.fingerprint,
        max(e.module)        AS module,
        max(e.message)       AS message,
        count(*)::int        AS count,
        max(e.context->>'path') AS sample_path,
        max(e.occurred_at)   AS last_seen
      FROM error_events e
      LEFT JOIN error_alerts a ON a.fingerprint = e.fingerprint
      WHERE e.occurred_at > NOW() - INTERVAL '${drizzleSql.raw(String(LOOKBACK_MIN))} minutes'
        AND (a.last_alerted_at IS NULL
             OR a.last_alerted_at < NOW() - INTERVAL '${drizzleSql.raw(String(COOLDOWN_MIN))} minutes')
      GROUP BY e.fingerprint
      HAVING count(*) >= ${SPIKE_THRESHOLD}
      ORDER BY count(*) DESC
      LIMIT ${MAX_FINGERPRINTS_PER_EMAIL}
    `);

    const spikes = (rows as unknown as { rows: SpikeRow[] }).rows ?? (rows as unknown as SpikeRow[]);

    if (!spikes || spikes.length === 0) {
      return NextResponse.json({ ok: true, spikes: 0 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      logError(
        "cron/error-alerts",
        "Detected spikes but RESEND_API_KEY not set — skipping email",
        { count: spikes.length },
      );
      return NextResponse.json({ ok: false, error: "RESEND_API_KEY not set" }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const subjectCount = spikes.length === 1 ? "1 error spike" : `${spikes.length} error spikes`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0e2b5c; max-width: 640px;">
        <h1 style="font-size: 20px; margin: 0 0 8px;">${escapeHtml(subjectCount)} on bulldogsecurityservice.com</h1>
        <p style="color: #475569; margin: 0 0 20px; font-size: 14px;">
          ${spikes.length} error fingerprint${spikes.length === 1 ? "" : "s"} fired ${SPIKE_THRESHOLD}+ times in the last ${LOOKBACK_MIN} minutes.
          See full detail in the dashboard.
        </p>
        ${spikes
          .map(
            (s) => `
          <div style="border: 1px solid #cfd9e5; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; background: #f8fafc;">
            <div style="font-size: 13px; color: #334155; margin-bottom: 4px;">
              <strong>${escapeHtml(s.module)}</strong> &middot; ${s.count} hit${s.count === 1 ? "" : "s"} in last ${LOOKBACK_MIN}m${s.sample_path ? ` &middot; ${escapeHtml(s.sample_path)}` : ""}
            </div>
            <div style="font-family: ui-monospace, Menlo, monospace; font-size: 13px; color: #0e2b5c; word-break: break-word;">
              ${escapeHtml(s.message.slice(0, 280))}
            </div>
          </div>
        `,
          )
          .join("")}
        <p style="margin-top: 24px;">
          <a href="${SITE_URL}/admin/errors" style="background: #006fb9; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Open errors dashboard</a>
        </p>
        <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
          Each fingerprint will not re-alert for ${COOLDOWN_MIN} minutes after this email, even if it keeps firing.
          Resolve in /admin/errors to silence permanently.
        </p>
      </div>
    `;

    const textLines = [
      `${spikes.length} error spike${spikes.length === 1 ? "" : "s"} on bulldogsecurityservice.com (last ${LOOKBACK_MIN} minutes):`,
      "",
      ...spikes.map(
        (s) =>
          `  - ${s.module} : ${s.count} hits${s.sample_path ? ` (path: ${s.sample_path})` : ""}\n    ${s.message.slice(0, 280)}`,
      ),
      "",
      `Open dashboard: ${SITE_URL}/admin/errors`,
    ];

    await resend.emails.send({
      from: `Bulldog Security Site <${FROM_EMAIL}>`,
      to: [ALERTS_TO],
      subject: `[Bulldog] ${subjectCount} on the site`,
      html,
      text: textLines.join("\n"),
    });

    // Record / refresh alert state for each fingerprint we just paged on.
    for (const s of spikes) {
      await db
        .insert(schema.errorAlerts)
        .values({
          fingerprint: s.fingerprint,
          alertCount: 1,
        })
        .onConflictDoUpdate({
          target: schema.errorAlerts.fingerprint,
          set: {
            lastAlertedAt: drizzleSql`NOW()`,
            alertCount: drizzleSql`error_alerts.alert_count + 1`,
          },
        });
    }

    return NextResponse.json({
      ok: true,
      spikes: spikes.length,
      fingerprints: spikes.map((s) => ({
        fingerprint: s.fingerprint,
        module: s.module,
        count: s.count,
      })),
    });
  } catch (err) {
    logError("cron/error-alerts", "spike check failed", err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
