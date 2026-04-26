import qrcode from "qrcode";
import { Card, PageHeader } from "../../_components/ui";
import { getGoogleReviewStats } from "@/lib/googleReviews";
import { getReviewClicksBySource } from "@/lib/analytics/queries";
import { CopyButton } from "./CopyButton";

export const metadata = { title: "Review Campaign" };

// Cache briefly so we don't hammer the Places API on every refresh
export const revalidate = 300;

const REVIEW_URL = "https://bulldogsecurityservice.com/review";
const REVIEW_GOAL = 50;

// Channel-specific tracking URLs — each template uses its own ?src=
// so the attribution chart can tell us which channel is actually
// driving clicks.
const REVIEW_URLS = {
  postInstall: `${REVIEW_URL}?src=email-post-install`,
  longTerm: `${REVIEW_URL}?src=email-long-term`,
  sms: `${REVIEW_URL}?src=sms`,
  invoice: `${REVIEW_URL}?src=invoice`,
  qr: `${REVIEW_URL}?src=qr`,
};

const EMAIL_POST_INSTALL = `Subject: Quick favor — would you leave us a Google review?

Hi {{firstName}},

Thanks again for trusting Bulldog Security Service with {{project}} at your {{property}}. The crew really enjoyed working with you.

Would you take two minutes to leave us a Google review? It's the single biggest thing that helps neighbors and other local businesses find us when they're searching for someone they can trust to protect their home or office.

Link (opens straight to the review screen):
${REVIEW_URLS.postInstall}

Thanks again — and call anytime, day or night.

— The Bulldog Security Team
(832) 585-0725`;

const EMAIL_LONG_TERM_CLIENT = `Subject: A Google review for Bulldog — would you?

Hi {{firstName}},

You've trusted us to monitor your {{property}} for {{years}} years now. That kind of long relationship means the world to us.

We're working on growing Bulldog's visibility in local search, and Google reviews are by far the biggest lever. If you'd take two minutes to leave one, it would help families and businesses in your area find us when they need a trustworthy security partner.

${REVIEW_URLS.longTerm}

Whatever you write — even one sentence — is perfect. Thank you for being with us all these years.

— The Bulldog Security Team
(832) 585-0725`;

const SMS_SHORT = `Hi {{firstName}}, this is Bulldog Security. Quick favor — would you mind leaving us a Google review when you have a sec? Takes ~2 min: ${REVIEW_URLS.sms}  Thank you!`;

const INVOICE_FOOTER = `Happy with the work? A Google review would mean a lot to us.
${REVIEW_URLS.invoice} (or scan the QR code on the right)`;

// Human labels for the attribution chart. Unknown `?src=` values fall
// through to their raw string so new campaigns show up without a code
// change.
const SOURCE_LABELS: Record<string, string> = {
  "email-post-install": "Post-install email",
  "email-long-term": "Long-term-customer email",
  sms: "Text / SMS",
  invoice: "Invoice footer",
  qr: "QR card",
  direct: "Direct / untracked",
};

type Template = {
  id: string;
  label: string;
  when: string;
  body: string;
};

const TEMPLATES: Template[] = [
  {
    id: "post-install",
    label: "Post-install email",
    when: "Send 2-3 days after wrapping a fresh install or service call — when the work is still top-of-mind for the customer.",
    body: EMAIL_POST_INSTALL,
  },
  {
    id: "long-term-customer",
    label: "Long-term customer email",
    when: "Send to monitoring customers who've been with Bulldog multiple years. Reference the tenure — they know the work.",
    body: EMAIL_LONG_TERM_CLIENT,
  },
  {
    id: "sms-short",
    label: "Text / SMS (short)",
    when: "For customers comfortable with text. Drop in after a service call or in-person visit.",
    body: SMS_SHORT,
  },
  {
    id: "invoice-footer",
    label: "Invoice footer",
    when: "Paste at the bottom of every invoice PDF / email. Passive ask, high volume.",
    body: INVOICE_FOOTER,
  },
];

export default async function ReviewCampaignPage() {
  const [stats, clicksBySource, qrDataUrl] = await Promise.all([
    getGoogleReviewStats(),
    getReviewClicksBySource(),
    qrcode.toDataURL(REVIEW_URLS.qr, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 440,
      color: { dark: "#0b1a2e", light: "#ffffff" },
    }),
  ]);
  const remaining = Math.max(0, REVIEW_GOAL - stats.count);
  const progressPct = Math.min(100, Math.round((stats.count / REVIEW_GOAL) * 100));
  const totalClicks = clicksBySource.reduce((sum, r) => sum + r.count, 0);
  const placeWired =
    Boolean(process.env.GOOGLE_PLACES_API_KEY) &&
    Boolean(process.env.GOOGLE_PLACES_PLACE_ID);

  return (
    <div>
      <PageHeader
        title="Review Campaign"
        subtitle="Grow the Google-review count. Ask templates, trackable link, QR card."
      />

      {/* Progress tile */}
      <Card className="mb-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#7a8aa0]">
              Current vs. goal
            </div>
            <div className="mt-1 text-3xl font-semibold text-white">
              {stats.count}{" "}
              <span className="text-[#7a8aa0]">/ {REVIEW_GOAL}</span>
            </div>
            <div className="mt-1 text-sm text-[#cfd9e5]">
              {placeWired
                ? `${stats.rating.toFixed(1)} / 5.0 · ${
                    remaining === 0
                      ? "Goal hit."
                      : `${remaining} reviews to hit ${REVIEW_GOAL}.`
                  }`
                : "Not yet wired to Google Places — set GOOGLE_PLACES_API_KEY + GOOGLE_PLACES_PLACE_ID in Vercel env to pull live stats."}
            </div>
          </div>
          <a
            href={stats.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#4fa8e0] underline-offset-4 hover:underline"
          >
            View on Google Maps ↗
          </a>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#0b1a2e]">
          <div
            className="h-full bg-[#3a94d6] transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-4 text-xs text-[#7a8aa0]">
          Why 50: that&rsquo;s roughly the floor where Google&rsquo;s
          AggregateRating star snippets start materially lifting organic
          click-through. Pace target: ~8&ndash;10 asks per week, ~30%
          conversion rate on long-term happy customers.
        </p>
      </Card>

      {/* Attribution — which channel drives clicks */}
      <Card className="mb-6 p-6">
        <h3 className="mb-1 text-base font-semibold text-white">
          Channel attribution (30d)
        </h3>
        <p className="mb-4 text-xs text-[#7a8aa0]">
          Every template below uses its own tracking link, so clicks get
          attributed to the channel that sent them. Use this to double
          down on whichever channel is actually working. &ldquo;Direct /
          untracked&rdquo; covers anyone copying the bare{" "}
          <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">
            /review
          </code>{" "}
          link without the{" "}
          <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">
            ?src=
          </code>
          {" "}suffix.
        </p>
        {totalClicks === 0 ? (
          <p className="text-sm text-[#7a8aa0]">
            No review-link clicks yet. Once you send the first ask using
            a template below, clicks will start populating this chart.
          </p>
        ) : (
          <div className="space-y-2">
            {clicksBySource.map((row) => {
              const label = SOURCE_LABELS[row.source] ?? row.source;
              const pct = Math.round((row.count / totalClicks) * 100);
              return (
                <div key={row.source}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-[#cfd9e5]">{label}</span>
                    <span className="font-mono text-[12px] text-[#7a8aa0]">
                      {row.count.toLocaleString()} click
                      {row.count === 1 ? "" : "s"} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#0b1a2e]">
                    <div
                      className="h-full bg-[#3a94d6] transition-[width]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-2 text-[11px] text-[#7a8aa0]">
              Total: {totalClicks.toLocaleString()} click
              {totalClicks === 1 ? "" : "s"} across{" "}
              {clicksBySource.length} channel
              {clicksBySource.length === 1 ? "" : "s"}.
            </p>
          </div>
        )}
      </Card>

      {/* The Link + QR */}
      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_auto]">
        <Card className="p-6">
          <h3 className="mb-1 text-base font-semibold text-white">
            The short link
          </h3>
          <p className="mb-4 text-xs text-[#7a8aa0]">
            Click it yourself to test. Sends visitors straight to
            Google&rsquo;s write-review screen for Bulldog Security
            Service. We track every click as a{" "}
            <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">
              Review Link Clicked
            </code>{" "}
            event in /admin/analytics so you can see which channels are working.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#1d3554] bg-[#0b1a2e] px-4 py-2 font-mono text-sm text-white transition hover:border-[#3a94d6]"
            >
              {REVIEW_URL}
            </a>
            <CopyButton value={REVIEW_URL} label="Copy link" />
          </div>
        </Card>

        <Card className="flex flex-col items-center p-6">
          <h3 className="mb-3 text-sm font-semibold text-white">QR card</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="Scannable QR code that opens the Bulldog Security review link"
            width={220}
            height={220}
            className="rounded-lg bg-white p-3"
          />
          <a
            href={qrDataUrl}
            download="bulldog-review-qr.png"
            className="mt-4 text-sm text-[#4fa8e0] underline-offset-4 hover:underline"
          >
            Download PNG ↓
          </a>
          <p className="mt-2 max-w-[220px] text-center text-[11px] text-[#7a8aa0]">
            Print on business cards, leave at the front desk, or add to
            an email signature.
          </p>
        </Card>
      </div>

      {/* Templates */}
      <Card className="p-6">
        <h3 className="mb-1 text-base font-semibold text-white">
          Ask templates
        </h3>
        <p className="mb-6 text-xs text-[#7a8aa0]">
          Replace{" "}
          <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">
            {"{{firstName}}"}
          </code>
          ,{" "}
          <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">
            {"{{project}}"}
          </code>
          ,{" "}
          <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">
            {"{{property}}"}
          </code>
          , and{" "}
          <code className="rounded bg-[#0b1a2e] px-1 py-0.5 font-mono text-[11px] text-[#4fa8e0]">
            {"{{years}}"}
          </code>{" "}
          by hand before sending — personalization is what makes these land.
        </p>

        <div className="space-y-6">
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-[#1d3554] bg-[#0b1a2e] p-5"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-white">{t.label}</h4>
                <CopyButton value={t.body} label="Copy" />
              </div>
              <p className="mb-3 text-xs text-[#7a8aa0]">{t.when}</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-[#0a1422] p-4 font-mono text-[13px] leading-relaxed text-[#cfd9e5]">
                {t.body}
              </pre>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
