import { Container } from "./Container";
import { JsonLd } from "./JsonLd";
import { faqSchema } from "@/lib/schema";
import type { FAQ } from "@/lib/faqs";

type Props = {
  heading?: string;
  eyebrow?: string;
  intro?: string;
  faqs: FAQ[];
  compact?: boolean;
};

/**
 * Renders an FAQ section with Schema.org FAQPage JSON-LD.
 * Q&A pattern is a high-signal format for SEO and LLM retrieval.
 */
export function FAQSection({
  heading = "Frequently Asked Questions",
  eyebrow = "FAQ",
  intro,
  faqs,
  compact = false,
}: Props) {
  if (faqs.length === 0) return null;

  return (
    <section className={compact ? "py-16 sm:py-20 bg-cream" : "py-16 sm:py-24 bg-white"}>
      <JsonLd data={faqSchema(faqs)} />
      <Container className="max-w-3xl">
        <div className="section-label text-sm">{eyebrow}</div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl text-ink">{heading}</h2>
        {intro && <p className="mt-4 text-muted">{intro}</p>}

        <dl className="mt-10 space-y-8">
          {faqs.map((f) => (
            <div key={f.q} className="border-b border-zinc-200 pb-6 last:border-b-0">
              <dt>
                <h3 className="font-display text-xl text-ink">{f.q}</h3>
              </dt>
              <dd className="mt-2 text-muted leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
