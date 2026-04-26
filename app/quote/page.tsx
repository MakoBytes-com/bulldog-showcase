import type { Metadata } from "next";
import { ShieldCheck, Phone, Award, BadgeCheck } from "lucide-react";

import { Container } from "@/components/Container";

import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Get a Free Quote — Bulldog Security Service",
  description:
    "Request a no-obligation security quote from Houston's #1 ADT Authorized Dealer. We'll match the rate of any current competitor contract.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ b?: string }>;
}) {
  const { b } = await searchParams;
  const batchCode =
    typeof b === "string" && /^[a-z0-9-]{4,32}$/i.test(b)
      ? b.toLowerCase()
      : "";

  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-14 sm:py-20">
          <div className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Request a Quote
          </div>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Free, no-obligation security quote.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Tell us about your home or business and a Bulldog Security
            specialist will call you within 24 hours with a tailored quote.
            Already with another provider? We&rsquo;ll match your current
            contract rate.
          </p>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                Why Bulldog
              </div>
              <h2 className="mt-3 font-display text-3xl text-ink">
                Houston&rsquo;s most trusted name in residential and commercial
                security.
              </h2>
              <ul className="mt-6 space-y-4">
                <Benefit
                  icon={Award}
                  title="#1 ADT Authorized Dealer in Texas"
                  body="And #3 nationally — backed by ADT's six-decade reputation and 24/7 monitoring centers."
                />
                <Benefit
                  icon={BadgeCheck}
                  title="Family-owned, locally operated"
                  body="8 offices across Texas and Florida. Real people answer your calls."
                />
                <Benefit
                  icon={ShieldCheck}
                  title="Whole-home protection"
                  body="Cameras, smart locks, video doorbells, lighting, life-safety — installed and integrated."
                />
                <Benefit
                  icon={Phone}
                  title="Prefer to talk now?"
                  body={
                    <>
                      Call{" "}
                      <a
                        href="tel:+18325850725"
                        className="font-semibold text-brand-700 hover:text-brand-800"
                      >
                        (832) 585-0725
                      </a>{" "}
                      Mon&ndash;Fri 8a&ndash;6p, Sat 9a&ndash;3p.
                    </>
                  }
                />
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-4 border-y border-zinc-200 py-5 text-center">
                <Stat value="A+" label="BBB rating" />
                <Stat value="4.4★" label="Google" />
                <Stat value="20+" label="Years" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-lg border border-zinc-200 bg-cream p-6 shadow-sm sm:p-8">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                  Get my free quote
                </div>
                <h2 className="mt-3 font-display text-2xl text-ink sm:text-3xl">
                  Tell us a little about you.
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Takes 60 seconds. No credit card. We&rsquo;ll never share
                  your information.
                </p>
                <div className="mt-6">
                  <QuoteForm initialBatchCode={batchCode} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function Benefit({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-sm text-muted">{body}</div>
      </div>
    </li>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl text-brand-700">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}
