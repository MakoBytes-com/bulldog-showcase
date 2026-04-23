import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { CTAStrip } from "@/components/CTAStrip";
import { FAQ_CATEGORIES, ALL_FAQS } from "@/lib/faqs";
import { faqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ — Bulldog's Help Center",
  description:
    "Frequently asked questions about your Bulldog/ADT account, equipment and the ADT Control app. Find instant answers on account management, system troubleshooting, and smart home features.",
  alternates: { canonical: "/about-us/faq" },
};

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqSchema(ALL_FAQS)} />

      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">FAQ</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Bulldog&rsquo;s help center.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Fast answers to the most common questions about your account, your equipment
            and the ADT Control app.
          </p>
        </Container>
      </section>

      <section className="py-14 bg-cream border-b border-zinc-200">
        <Container>
          <nav aria-label="FAQ categories" className="flex flex-wrap items-center justify-center gap-3">
            {FAQ_CATEGORIES.map((cat) => (
              <a
                key={cat.name}
                href={`#${slugify(cat.name)}`}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-brand-600 hover:text-brand-700 transition-colors"
              >
                {cat.name}
                <span className="ml-2 text-xs text-muted">({cat.faqs.length})</span>
              </a>
            ))}
          </nav>
        </Container>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <Container className="max-w-3xl space-y-16">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.name} id={slugify(cat.name)} className="scroll-mt-24">
              <h2 className="font-display text-2xl sm:text-3xl text-ink">{cat.name}</h2>
              <dl className="mt-8 space-y-8">
                {cat.faqs.map((f) => (
                  <div key={f.q} className="border-b border-zinc-200 pb-6 last:border-b-0">
                    <dt>
                      <h3 className="font-display text-xl text-ink">{f.q}</h3>
                    </dt>
                    <dd className="mt-2 text-muted leading-relaxed">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </Container>
      </section>

      <CTAStrip
        eyebrow="Still Need Help?"
        heading="Our customer-care team is standing by."
        subheading="Give us a call at (832) 585-0725 or send a message — we'll follow up within one business day."
        href="/contact"
        buttonLabel="Contact Us"
      />
    </>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
