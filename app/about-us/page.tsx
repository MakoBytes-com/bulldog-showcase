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
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-brand-900 text-white">
        <Image
          src="/images/about-hero-house-care.jpg"
          alt="Hands surrounding a wooden home figurine — symbolic of protecting what matters"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-900/80 via-brand-900/55 to-brand-900/75" />
        <Container className="py-32 sm:py-44 lg:py-56 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight drop-shadow-md">
            A team you can trust.
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-lg text-white/90 drop-shadow">
            Family-owned and operated since 2010 — the #1 ADT Authorized Dealer in
            Texas and #3 in the United States.
          </p>
          <Link
            href="#consultform"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            Book a Virtual Consult
          </Link>
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
              home — providing continued peace of mind 24/7. Our mission is simple: to
              help keep you, your loved ones, and your property safe.
            </p>
            <p className="mt-4 text-muted leading-relaxed">
              Our job is to help protect what is most important to you, and we take that
              job very seriously. We take the time to get to know our customers so we
              can craft personalized security programs to address their unique needs.
              From initial inspection to continued customer care, our priority remains
              the same — helping to protect what matters most to <em>you</em>.
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

      {/* OUR PEOPLE + OUR PROMISE — green section per live WP */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[rgba(10,102,36,0.95)] to-[#132d13] text-white">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 p-8 sm:p-10">
            <div className="section-label text-sm text-white/80">Our People</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl leading-tight">
              Our greatest strength.
            </h2>
            <p className="mt-5 text-white/90 leading-relaxed">
              At Bulldog, our people are our greatest strength. We have a uniquely
              family-oriented culture full of passionate people who care about helping
              others. We&rsquo;re moms. Dads. Grandparents. Recent grads. We&rsquo;re
              people just like you — committed to serving our community by helping to
              protect our neighbors.
            </p>
          </div>
          <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 p-8 sm:p-10">
            <div className="section-label text-sm text-white/80">Our Promise</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl leading-tight">
              We treat your home like our own.
            </h2>
            <p className="mt-5 text-white/90 leading-relaxed">
              Helping to protect what matters most to you is what matters most to us. At
              Bulldog, we promise to always treat your family, your pets and your home
              like our very own. We&rsquo;ll put you first and provide expert,
              personalized advice. We&rsquo;ll always be honest, transparent and kind.
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
