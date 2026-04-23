import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { BarChart3, Gauge, Star, Mail, Shield, Code, ExternalLink, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Bulldog Security Service — internal admin dashboard.",
  robots: { index: false, follow: false },
};

type Card = {
  title: string;
  subtitle: string;
  href: string;
  icon: typeof BarChart3;
};

const LINKS: Card[] = [
  {
    title: "Vercel Analytics",
    subtitle: "Page views · top pages · referrers",
    href: "https://vercel.com/mako-studi/bulldogsecurityservice-com/analytics",
    icon: BarChart3,
  },
  {
    title: "Vercel Speed Insights",
    subtitle: "Core Web Vitals · real-user performance",
    href: "https://vercel.com/mako-studi/bulldogsecurityservice-com/speed-insights",
    icon: Gauge,
  },
  {
    title: "Google Business Profile",
    subtitle: "Reviews, photos, questions",
    href: "https://business.google.com/dashboard",
    icon: Star,
  },
  {
    title: "Resend (Email)",
    subtitle: "Form delivery logs",
    href: "https://resend.com/emails",
    icon: Mail,
  },
  {
    title: "Cloudflare Turnstile",
    subtitle: "Captcha stats and blocked bots",
    href: "https://dash.cloudflare.com/?to=/:account/turnstile",
    icon: Shield,
  },
  {
    title: "Vercel Project",
    subtitle: "Deploys · env vars · domains",
    href: "https://vercel.com/mako-studi/bulldogsecurityservice-com",
    icon: Globe,
  },
  {
    title: "GitHub Repo",
    subtitle: "Source code · issues · commits",
    href: "https://github.com/MakoBytes-com/bulldogsecurityservice.com",
    icon: Code,
  },
];

export default function AdminDashboard() {
  const umamiShareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL;

  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-14 sm:py-16">
          <div className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white/80">
            Internal · Admin Only
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">
            Bulldog Security — Admin Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Analytics, service providers, and deployment controls — all in one place.
            This page is password-protected and excluded from search indexing.
          </p>
        </Container>
      </section>

      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <div className="section-label text-sm">Analytics — Umami</div>
              <h2 className="mt-3 font-display text-2xl text-ink">Site traffic dashboard</h2>
              <p className="mt-2 text-sm text-muted">
                Live traffic, top pages, referrers, and device breakdown. Data scoped to
                bulldogsecurityservice.com only.
              </p>
            </div>
            {umamiShareUrl && (
              <a
                href={umamiShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 whitespace-nowrap"
              >
                Open full size
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          {umamiShareUrl ? (
            <div className="relative w-full rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50">
              <iframe
                src={umamiShareUrl}
                title="Umami analytics dashboard — bulldogsecurityservice.com"
                loading="lazy"
                className="w-full h-[1000px] border-0"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-cream p-8 text-center">
              <p className="text-muted">
                Umami share URL not configured. Set{" "}
                <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-200 text-ink text-sm">
                  NEXT_PUBLIC_UMAMI_SHARE_URL
                </code>{" "}
                in Vercel env.
              </p>
            </div>
          )}
        </Container>
      </section>

      <section className="py-14 sm:py-16 bg-cream border-t border-zinc-200">
        <Container>
          <div className="mb-8">
            <div className="section-label text-sm">Service Providers</div>
            <h2 className="mt-3 font-display text-2xl text-ink">
              Quick links to every dashboard that runs this site.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LINKS.map(({ title, subtitle, href, icon: Icon }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-5 hover:border-brand-600 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-ink">{title}</h3>
                    <ExternalLink className="h-3.5 w-3.5 text-muted" />
                  </div>
                  <p className="mt-1 text-sm text-muted">{subtitle}</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 bg-white border-t border-zinc-200">
        <Container className="text-center">
          <Link href="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            ← Back to public site
          </Link>
        </Container>
      </section>
    </>
  );
}
