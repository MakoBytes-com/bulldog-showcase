import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { ContactForm } from "@/components/forms/ContactForm";
import { OFFICES, HQ, PHONES, SITE } from "@/lib/site";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — We're Here to Help",
  description:
    "Get in touch with Bulldog Security Service. 8 offices across Texas and Florida, a (832) 585-0725 customer-care line, and a 24-hour online form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">Contact</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            We&rsquo;re here to help.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Our customer-care team is standing by — via phone, text, email, or the form
            below. So we can best assist you, please provide as much information as possible.
          </p>
        </Container>
      </section>

      {/* CHANNELS + HQ */}
      <section className="py-14 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <ChannelCard
            icon={MapPin}
            label="Corporate HQ"
            lines={[
              HQ.street,
              HQ.street2 ?? "",
              `${HQ.city}, ${HQ.state} ${HQ.zip}`,
            ].filter(Boolean)}
          />
          <ChannelCard
            icon={Phone}
            label={PHONES.main.label}
            lines={[PHONES.main.number]}
            href={PHONES.main.href}
          />
          <ChannelCard
            icon={MessageCircle}
            label={PHONES.text.label}
            lines={[PHONES.text.number]}
            href={PHONES.text.href}
          />
          <ChannelCard
            icon={Mail}
            label="Email Us"
            lines={[SITE.email]}
            href={`mailto:${SITE.email}`}
          />
        </Container>
      </section>

      {/* COO QUOTE + FORM */}
      <section className="py-16 sm:py-24 bg-cream border-y border-zinc-200">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="relative rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-sm aspect-square max-w-sm mx-auto lg:mx-0">
              <Image
                src="/images/team/tray-cassels.png"
                alt="Tray Cassels — Chief Operating Officer"
                fill
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="mt-6 max-w-md mx-auto lg:mx-0">
              <div className="section-label text-sm">From Our COO</div>
              <blockquote className="mt-3 font-display text-xl text-ink leading-snug">
                &ldquo;Being family owned, we hold ourselves to a high standard when it
                comes to customer satisfaction.&rdquo;
              </blockquote>
              <div className="mt-3 text-sm font-semibold text-brand-700">
                Tray Cassels — Chief Operating Officer
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-lg bg-white border border-zinc-200 shadow-sm p-6 sm:p-8">
              <div className="section-label text-sm">Get In Touch</div>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl text-ink">
                Send us a message.
              </h2>
              <p className="mt-2 text-sm text-muted">
                Bulldog is the #1 ADT Authorized Dealer in TX and #3 in the United States.
              </p>
              <div className="mt-6">
                <ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ALL OFFICES */}
      <section className="py-16 sm:py-24 bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <div className="section-label text-sm">Offices</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
              Proudly helping to protect families in TX and FL.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OFFICES.map((o) => (
              <address
                key={o.label}
                className={`not-italic rounded-lg border ${o.isHq ? "border-brand-600 bg-brand-50" : "border-zinc-200 bg-cream"} p-5`}
              >
                <div className={`text-xs font-semibold uppercase tracking-wider ${o.isHq ? "text-brand-700" : "text-brand-600"}`}>
                  {o.label}
                </div>
                <div className="mt-2 text-sm text-ink space-y-0.5">
                  <div>{o.street}</div>
                  {o.street2 && <div>{o.street2}</div>}
                  <div>
                    {o.city}, {o.state} {o.zip}
                  </div>
                </div>
                {o.phone && (
                  <a href={o.phoneHref} className="mt-3 inline-block text-sm font-semibold text-brand-700 hover:text-brand-800">
                    {o.phone}
                  </a>
                )}
              </address>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function ChannelCard({
  icon: Icon,
  label,
  lines,
  href,
}: {
  icon: typeof Phone;
  label: string;
  lines: string[];
  href?: string;
}) {
  const inner = (
    <div className="h-full rounded-lg border border-zinc-200 bg-cream p-5 hover:border-brand-600 hover:bg-brand-50 transition-colors">
      <div className="flex items-center gap-2 text-brand-600">
        <Icon className="h-5 w-5" />
        <div className="text-xs font-semibold uppercase tracking-wider">{label}</div>
      </div>
      <div className="mt-3 text-ink font-semibold leading-snug">
        {lines.map((l) => (
          <div key={l} className="break-words">{l}</div>
        ))}
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block h-full">{inner}</a>
  ) : (
    <div className="block h-full">{inner}</div>
  );
}
