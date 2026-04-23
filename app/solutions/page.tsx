import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/Container";
import { ConsultSection } from "@/components/ConsultSection";

export const metadata: Metadata = {
  title: "Solutions — Home Security, Life Safety & Monitoring",
  description:
    "Personalized home security solutions from Bulldog Security Service — ADT-monitored cameras, motion detection, smoke and CO detection, emergency devices, and 24/7 professional monitoring.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">Solutions</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Home protection, your way.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Personalized, ADT-monitored security solutions so you can choose the
            protection <em>you</em> want — designed around your home and your family.
          </p>
        </Container>
      </section>

      {/* INTRO ROW — 3 categories with anchor links */}
      <section className="py-16 bg-cream border-b border-zinc-200">
        <Container className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnchorCard
            title="Home Security"
            body="Personalized security solutions so you can choose the protection YOU want."
            href="#security"
          />
          <AnchorCard
            title="Life Safety"
            body="Get your family out safe before a threat arises with early fire and CO detection."
            href="#safety"
          />
          <AnchorCard
            title="Monitoring Service"
            body="Enjoy peace of mind with a 24-hour nationwide monitoring network."
            href="#monitoring"
          />
        </Container>
      </section>

      {/* NEW COMMAND PANEL */}
      <section id="security" className="py-16 sm:py-24 bg-white scroll-mt-24">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="section-label text-sm">New Command Panel</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              Smarter security, one touch away.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Introducing smarter security, where you have full control of your smart home
              and automation systems with a simple touch. The ADT Command acts as the
              command center for your secured smart home and has a sleek, modern design.
              This intuitive wireless keypad lets you add indoor, outdoor and doorbell
              cameras, smart lights, locks and thermostats to your ADT system. And with
              ADT&rsquo;s mobile app, take the controls with you.
            </p>
          </div>
          <Image
            src="/images/adt-command-panel.jpg"
            alt="ADT Command panel"
            width={800}
            height={560}
            className="w-full h-auto"
            sizes="(min-width: 1024px) 600px, 100vw"
          />
        </Container>
      </section>

      {/* SECURITY CAMERAS */}
      <Section
        eyebrow="Security Cameras"
        heading="See what matters, 24/7."
        image="/images/security-cameras.jpg"
        imageAlt="ADT outdoor security camera"
        body="ADT's indoor and outdoor security cameras empower you to stay connected to your home and property 24/7 by providing a virtual 720p HD view in real-time. For added protection, a live video clip can be sent to your phone the moment motion is detected inside or outside your home. To ensure uninterrupted monitoring service, ADT's outdoor security cameras are weatherproof — designed to be snow, rain and humidity resistant."
        background="cream"
        imageCard
      />

      {/* MOTION DETECTION */}
      <Section
        eyebrow="Motion Detection"
        heading="One sensor. Thousands of square feet."
        image="/images/motion-sensor.png"
        imageAlt="ADT motion sensor"
        body="A single ADT motion sensor can cover an area as big as 35' by 40' so most homeowners only need one or two to cover multiple high-traffic areas. Movement triggers the sensor and instantly alerts ADT monitoring professionals. You can also set your system to automatically turn on the lights when the motion sensor is triggered at night. It's also important to monitor movement at entry points such as doors and windows. ADT's window and door sensors let you know if they're opened unexpectedly. For added protection, you can create an automation to activate your ADT indoor/outdoor cameras so you can see who triggered a sensor."
        reverse
      />

      {/* SMOKE & CARBON DETECTION */}
      <Section
        id="safety"
        eyebrow="Smoke &amp; Carbon Detection"
        heading="Every second counts."
        image="/images/smoke-carbon-detector.png"
        imageAlt="ADT smoke and carbon monoxide communicator"
        body="In an emergency, every second counts — it could be the difference between life and death. Our smoke communicator uses photoelectric and rise-of-heat technology to measure air density. Our carbon monoxide communicator uses electrochemical sensing technology to monitor air and carbon monoxide concentrations in your home. These early-detection mechanisms alert you the moment danger is sensed and, with ADT's monitoring service, emergency services are automatically dispatched to your home."
        background="cream"
      />

      {/* EMERGENCY DEVICES */}
      <Section
        eyebrow="Emergency Devices"
        heading="Help is a touch away — 24/7."
        image="/images/emergency-device.jpg"
        imageAlt="ADT wireless emergency device"
        body="Home or away, we help keep you protected. We provide multiple ways to quickly request police, medical or fire assistance. When you press your emergency button, an ADT agent can dispatch first responders directly to your current location. With ADT monitoring, help is a touch away — 24/7."
        reverse
      />

      {/* ADT MONITORING HELPS SAVE LIVES */}
      <section id="monitoring" className="py-16 sm:py-24 bg-brand-900 text-white scroll-mt-24">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Image
            src="/images/adt-monitoring-center.jpg"
            alt="ADT monitoring center operator"
            width={800}
            height={532}
            className="rounded-lg shadow-lg w-full h-auto object-cover"
            sizes="(min-width: 1024px) 600px, 100vw"
          />
          <div>
            <div className="section-label text-sm text-white/80">Monitoring Saves Lives</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl leading-tight">
              Six interconnected centers. One promise.
            </h2>
            <p className="mt-5 text-white/85 leading-relaxed">
              Your protection is our priority. ADT Monitoring has six strategically-placed
              interconnected monitoring centers throughout the United States to ensure
              uninterrupted protection for your home and loved ones. Being interconnected
              is important: if the center closest to you goes down for any reason, another
              center is there to provide backup — as proven during Hurricane Katrina in
              2005. In addition to 24/7 protection, ADT monitoring customers find peace of
              mind knowing they can expect shortened response times, which minimizes
              homeowner risk. Those saved moments have the power to change everything.
            </p>
          </div>
        </Container>
      </section>

      {/* TRUST MARKERS */}
      <section className="py-16 sm:py-20 bg-white border-b border-zinc-200">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <div className="section-label text-sm">Why ADT</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
              The monitoring network homeowners trust.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrustCard title="Market Experts" body="ADT has been focused on home security for over a century." />
            <TrustCard title="A Trusted Partner" body="ADT is the #1 home-security monitoring service across the United States." />
            <TrustCard title="Proven Impact" body="ADT responds to 33 million alerts a year, averaging 90,000 per day." />
            <TrustCard title="Trusted by Law" body="ADT has provided support in over 40,000 criminal cases." />
          </div>
        </Container>
      </section>

      <ConsultSection />
    </>
  );
}

function AnchorCard({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-zinc-200 bg-white p-6 hover:border-brand-600 hover:shadow-md transition-all"
    >
      <h3 className="font-display text-xl text-ink group-hover:text-brand-700">{title}</h3>
      <p className="mt-3 text-sm text-muted leading-relaxed">{body}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-brand-600 font-semibold text-xs uppercase tracking-wider">
        Learn More <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function Section({
  id,
  eyebrow,
  heading,
  image,
  imageAlt,
  body,
  reverse = false,
  background = "white",
  imageCard = false,
}: {
  id?: string;
  eyebrow: string;
  heading: string;
  image: string;
  imageAlt: string;
  body: string;
  reverse?: boolean;
  background?: "white" | "cream";
  imageCard?: boolean;
}) {
  const img = (
    <Image
      src={image}
      alt={imageAlt}
      width={800}
      height={500}
      className="w-full h-auto"
      sizes="(min-width: 1024px) 600px, 100vw"
    />
  );

  return (
    <section
      id={id}
      className={`py-16 sm:py-24 scroll-mt-24 ${background === "cream" ? "bg-cream border-y border-zinc-200" : "bg-white"}`}
    >
      <Container
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
      >
        <div>
          <div
            className="section-label text-sm"
            dangerouslySetInnerHTML={{ __html: eyebrow }}
          />
          <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
            {heading}
          </h2>
          <p className="mt-5 text-muted leading-relaxed">{body}</p>
        </div>
        {imageCard ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            {img}
          </div>
        ) : (
          img
        )}
      </Container>
    </section>
  );
}

function TrustCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-cream p-5">
      <h3 className="font-display text-lg text-brand-700">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}
