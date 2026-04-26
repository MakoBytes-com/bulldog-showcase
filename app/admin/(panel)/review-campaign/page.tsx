import Image from "next/image";
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
  postProject: `${REVIEW_URL}?src=email-post-project`,
  longTerm: `${REVIEW_URL}?src=email-long-term`,
  sms: `${REVIEW_URL}?src=sms`,
  invoice: `${REVIEW_URL}?src=invoice`,
  qr: `${REVIEW_URL}?src=qr`,
};

const EMAIL_POST_PROJECT = `Subject: Quick favor — would you leave us a Google review?

Hi {{firstName}},

Thanks again for letting Bulldog handle {{project}}. Running this for you has been a pleasure.

One quick favor: if the work has felt as good on your end as it has on ours, would you leave us a Google review? It genuinely helps other Houston businesses find us — and right now we're actively trying to close the review-volume gap with the bigger MSPs in the area.

Link (opens straight to the review screen):
${REVIEW_URLS.postProject}

Appreciate it — and call anytime.

— Russell
Bulldog Security Service
(832) 585-0725`;

const EMAIL_LONG_TERM_CLIENT = `Subject: A Google review for Bulldog — would you?

Hi {{firstName}},

You've been with us for {{years}} years — longer than most marriages last. So I'll keep this short.

We're working on our visibility in the Houston search results. The single biggest lever is Google reviews. If you'd take two minutes to leave one, it would mean a lot.

${REVIEW_URLS.longTerm}

Whatever you write — even one sentence — is perfect. Thank you.

— Russell
Bulldog Security Service
(832) 585-0725`;

const SMS_SHORT = `Hey {{firstName}}, quick favor — would you leave Bulldog a Google review when you get a sec? Takes ~2 min, link here: ${REVIEW_URLS.sms}  Thanks! — Russell`;

const INVOICE_FOOTER = `Happy with the work? A Google review would mean the world.
${REVIEW_URLS.invoice} (or scan the QR code on the right)`;

// Human labels for the attribution chart. Unknown `?src=` values fall
// through to their raw string so new campaigns show up without a code
// change.
const SOURCE_LABELS: Record<string, string> = {
  "email-post-project": "Post-project email",
  "email-long-term": "Long-term-client email",
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
    id: "post-project",
    label: "Post-project email",
    when: "Send 2-3 days after wrapping a specific piece of work — install, migration, recovery, anything the client remembers clearly.",
    body: EMAIL_POST_PROJECT,
  },
  {
    id: "long-term-client",
    label: "Long-term client email",
    when: "Send to clients who've been with Bulldog multi-year. Reference the tenure — they know the work.",
    body: EMAIL_LONG_TERM_CLIENT,
  },
  {
    id: "sms-short",
    label: "Text / SMS (short)",
    when: "For clients you text casually. Drop it in after a call or in-person visit.",
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
  const [stats, clicksBySource] = await Promise.all([
    getGoogleReviewStats(),
    getReviewClicksBySource(),
  ]);
  const remaining = Math.max(0, REVIEW_GOAL - stats.count);
  const progressPct = Math.min(100, Math.round((stats.count / REVIEW_GOAL) * 100));
  const totalClicks = clicksBySource.reduce((sum, r) => sum + r.count, 0);

  return (
    <div>
      <PageHeader
        title="Review Campaign"
        subtitle="Close the Google-review gap. Ask templates, trackable link, QR card."
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
              {stats.rating.toFixed(1)} / 5.0 ·{" "}
              {remaining === 0
                ? "Goal hit."
                : `${remaining} reviews to hit ${REVIEW_GOAL}.`}
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
          Why 50: competitors like Braintek have 351+ Google reviews. 50 is the
          floor where AggregateRating star snippets start materially lifting
          organic CTR. Pace target: ~8-10 asks per week, ~30% conversion rate
          on long-term happy clients.
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
            Click it yourself to test. Sends visitors straight to Google&rsquo;s
            write-review screen for Bulldog Security Service. We track every click as a{" "}
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
          <Image
            src="/review/qr.png"
            alt="Scannable QR code that opens the Bulldog review link"
            width={220}
            height={220}
            unoptimized
            className="rounded-lg bg-white p-3"
          />
          <a
            href="/review/qr.png"
            download="mako-review-qr.png"
            className="mt-4 text-sm text-[#4fa8e0] underline-offset-4 hover:underline"
          >
            Download PNG ↓
          </a>
          <p className="mt-2 text-[11px] text-[#7a8aa0]">Print on business cards, drop at the front desk, or add to an email signature.</p>
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
