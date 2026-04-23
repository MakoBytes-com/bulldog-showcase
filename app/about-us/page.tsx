import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/Container";
import { ConsultSection } from "@/components/ConsultSection";
import { StatsBand } from "@/components/StatsBand";
import { TestimonialsSection } from "@/components/Testimonials";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us — A Team You Can Trust",
  description:
    "Family-owned since 2010, Bulldog Security Service is the #1 ADT Authorized Dealer in Texas and #3 in the United States. A+ BBB rating and 30,000+ homes protected.",
  alternates: { canonical: "/about-us" },
};

const CORE_VALUES = [
  "People First, Always",
  "Be Human, Be Honest",
  "Act With Integrity",
  "Strive For Excellence",
  "Be Passionate",
  "Focus on Client Experience",
  "Be Service-Hearted",
  "Serve With Purpose",
  "Exceed Expectations",
  "Always Be Learning",
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">About Us</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            A team you can trust.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Family-owned and operated since 2010 — proudly the #1 ADT Authorized Dealer in
            Texas and #3 in the United States.
          </p>
        </Container>
      </section>

      {/* OUR MISSION */}
      <section className="py-16 sm:py-24 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <div className="section-label text-sm">Our Mission</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              At Bulldog, your home is our business. Protecting it is what we do.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Driven by our desire to keep our neighbors safe, our customer-first
              mentality has awarded us an A+ BBB rating. With a focus on smart security
              and an eye for innovation, we offer the convenience of a truly connected
              home — providing continued peace of mind 24/7. Our mission remains simple:
              to help keep you, your loved ones, and your property safe.
            </p>
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <Image
              src="/images/bbb-award-of-excellence.jpg"
              alt="BBB Award of Excellence 2019"
              width={400}
              height={267}
              className="rounded-lg shadow-md w-full h-auto object-cover border border-zinc-200"
              sizes="(min-width: 1024px) 400px, 100vw"
            />
            <p className="mt-4 text-sm text-muted">
              Recipient of the 2019 BBB &ldquo;Award of Excellence&rdquo; — recognizing
              our commitment to honesty, transparency and customer service.
            </p>
          </div>
        </Container>
      </section>

      {/* CORE VALUES */}
      <section className="py-16 sm:py-24 bg-cream border-y border-zinc-200">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <div className="section-label text-sm">Our Core Values</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
              The principles that guide every call, install and conversation.
            </h2>
          </div>
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CORE_VALUES.map((v, i) => (
              <li
                key={v}
                className="rounded-lg border border-zinc-200 bg-white p-5 hover:border-brand-600 transition-colors"
              >
                <div className="text-xs font-semibold text-brand-600">0{i + 1}</div>
                <div className="mt-2 font-display text-lg text-ink leading-tight">{v}</div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <StatsBand />

      {/* CTA: MEET THE TEAM */}
      <section className="py-16 sm:py-20 bg-white">
        <Container className="text-center max-w-2xl mx-auto">
          <div className="section-label text-sm">Our Leadership</div>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
            Meet the people behind Bulldog.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            From our founder Luke Elwood to the 200+ team members protecting families
            across Texas and Florida, every person who wears a Bulldog badge is
            background-checked and trained to the same high standard.
          </p>
          <Link
            href="/about-us/meet-the-team"
            className="mt-8 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-sm uppercase tracking-wider text-sm transition-colors"
          >
            Meet Bulldog&rsquo;s Leaders
            <ChevronRight className="h-4 w-4" />
          </Link>
          <p className="mt-6 text-xs text-muted">
            {SITE.legalName} · Founded {SITE.foundedYear} · Houston, TX
          </p>
        </Container>
      </section>

      <TestimonialsSection background="cream" />
      <ConsultSection />
    </>
  );
}
