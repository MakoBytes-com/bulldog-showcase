import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { CTAStrip } from "@/components/CTAStrip";
import { LEADERSHIP } from "@/lib/leadership";

export const metadata: Metadata = {
  title: "Meet The Team — Bulldog's Leadership",
  description:
    "Meet the family behind Bulldog Security Service — President Luke Elwood, COO Tray Cassels, and the leadership team protecting 30,000+ homes across Texas and Florida.",
  alternates: { canonical: "/about-us/meet-the-team" },
};

export default function MeetTheTeamPage() {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">Meet The Team</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Bulldog&rsquo;s leadership.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Dedicated to helping keep you safe — led by a team with 150+ combined years
            of security industry experience.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <Container>
          <div className="space-y-20">
            {LEADERSHIP.map((leader, i) => (
              <article
                key={leader.slug}
                className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-start ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="md:col-span-4">
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-cream border border-zinc-200 shadow-sm">
                    <Image
                      src={leader.image}
                      alt={`${leader.name} — ${leader.title}`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="md:col-span-8">
                  <div className="section-label text-xs">{leader.title}</div>
                  <h2 className="mt-2 font-display text-3xl sm:text-4xl text-ink">
                    {leader.name}
                  </h2>
                  <p className="mt-5 text-muted leading-relaxed">{leader.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <CTAStrip
        eyebrow="Join Our Team"
        heading="We're hiring across Texas and Florida."
        subheading="Sales, account management, install — check out open positions and apply in under 10 minutes."
        href="/careers"
        buttonLabel="View Careers"
      />
    </>
  );
}
