import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Shield, Sliders, Home, Flame, Zap, Eye } from "lucide-react";
import { Container } from "@/components/Container";
import { ConsultSection } from "@/components/ConsultSection";
import { StatsBand } from "@/components/StatsBand";
import { TestimonialsSection } from "@/components/Testimonials";
import { YouTubeFacade } from "@/components/YouTubeFacade";

export default function HomePage() {
  return (
    <>
      {/* ───── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-[calc(100vh-5rem)] min-h-[640px] w-full overflow-hidden bg-brand-950 text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25"
          aria-hidden="true"
        />
        <Container className="relative z-10 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-block text-xs font-semibold tracking-[0.3em] uppercase text-white/85">
              Smart Home Security · Designed By You
            </div>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
              Is Your Home Protected?
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/90 max-w-xl">
              Help keep what matters most safe — with smart security, life safety, and
              24/7 professional monitoring from the #1 ADT Authorized Dealer in Texas.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-sm uppercase tracking-wider text-sm transition-colors"
              >
                Book a Virtual Consult
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/solutions"
                className="inline-flex items-center justify-center gap-2 border border-white/70 hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-sm uppercase tracking-wider text-sm transition-colors"
              >
                Explore Solutions
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ───── 3-COLUMN INTRO ROW ───────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-cream border-b border-zinc-200">
        <Container className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Shield}
            title="Smart Home Security"
            body="Enjoy full control of your smart home and automation system with a simple touch."
            href="/solutions"
          />
          <FeatureCard
            icon={Sliders}
            title="Designed By You"
            body="Customize your new smart home system with added life-safety and automation features."
            href="/automation"
          />
          <FeatureCard
            icon={Home}
            title="Who We Are"
            body="We're a family-owned company whose mission is to help protect families like our own."
            href="/about-us"
          />
        </Container>
      </section>

      {/* ───── SETTING A NEW STANDARD ───────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="section-label text-sm">Command &amp; Control</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              Setting a new standard in smart home security.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              The ADT Command all-in-one touchscreen panel is the command center of your
              smart home — controlling your alarm, indoor, outdoor and doorbell cameras,
              smart locks, garage door, lights, and thermostats. With ADT&rsquo;s Control
              app, you can monitor and control these smart home devices, virtually, from
              anywhere in the world.
            </p>
            <Link
              href="/solutions"
              className="mt-6 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-sm uppercase tracking-wider"
            >
              Learn More <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-zinc-200 shadow-md">
            <Image
              src="/images/command-and-control.jpg"
              alt="ADT Command touchscreen panel on a marble countertop"
              width={800}
              height={520}
              className="w-full h-auto object-cover"
              sizes="(min-width: 1024px) 600px, 100vw"
            />
          </div>
        </Container>
      </section>

      {/* ───── YOU DESIGN YOUR PACKAGE ──────────────────────────── */}
      <section className="py-16 sm:py-24 bg-cream border-y border-zinc-200">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <div className="section-label text-sm">Build Your System</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
              You design your package.
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Every home is unique and people want different things. We educate you on
              your home protection and automation options, and then leave it up to you
              how you&rsquo;d like to design your new smart home. In addition to your
              core security suite of motion detectors, contacts and cameras, Bulldog
              customers enjoy the convenience of a truly connected home — adjusting
              lighting or temperature from virtually anywhere in the world.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <PackageCard
              icon={Home}
              title="Home Security"
              image="/images/home-security.jpg"
              blurb="ADT has been focused on home security for over a century."
              href="/solutions#security"
            />
            <PackageCard
              icon={Flame}
              title="Life Safety"
              image="/images/life-safety.jpg"
              blurb="From early fire and CO detection to panic buttons, we've got you covered."
              href="/solutions#safety"
            />
            <PackageCard
              icon={Zap}
              title="Automation"
              image="/images/automation.jpg"
              blurb="Manage your home on the go with ADT's home automation suite."
              href="/automation"
            />
            <PackageCard
              icon={Eye}
              title="Monitoring"
              image="/images/monitoring.jpg"
              blurb="Enjoy peace of mind with a 24-hour nationwide monitoring network."
              href="/solutions#monitoring"
            />
          </div>
        </Container>
      </section>

      {/* ───── MONITORING SAVES LIVES (Jensen story) ────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="section-label text-sm">Real Stories</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              Monitoring saves lives.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Bulldog Security installed the Jensen family&rsquo;s alarm system in August
              2018. In October 2018, the 12,000 square foot home experienced a fast-spreading
              chemical fire. Inside were Anna (wife), Colleen (mother) and their three
              dogs. Within moments, the house had engulfed in flames. Thanks to their new
              security system and the quick action of ADT&rsquo;s professional monitoring
              services, everyone was able to escape to safety.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <YouTubeFacade
              videoId="Kzl5SBETYuI"
              poster="/images/family-smiling.jpg"
              posterAlt="The Jensen family, whose home alarm helped them escape a 2018 chemical fire"
              title="Bulldog Security — The Jensen Family Story"
            />
          </div>
        </Container>
      </section>

      <StatsBand />

      {/* ───── A TEAM YOU CAN TRUST ─────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-lg overflow-hidden shadow-md">
            <Image
              src="/images/picnic-family.jpg"
              alt="A family enjoying a protected home, smiling together outside"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
              sizes="(min-width: 1024px) 600px, 100vw"
            />
          </div>
          <div>
            <div className="section-label text-sm">Who We Are</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              A team you can trust.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Being family-owned and operated, our mission has remained the same for the
              past decade — to help protect families like our own. At Bulldog,
              we&rsquo;re people just like you. Our staff is fully-vetted and each
              employee undergoes rigorous background checks before being put into the
              field. For your protection, we arm our Relocation Managers and Installation
              Specialists with photo-ID badges so you can quickly verify their identity
              and employment. For your added comfort, you can scan the QR code on the
              badge to confirm their employment in real-time.
            </p>
            <Link
              href="/about-us"
              className="mt-6 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-sm uppercase tracking-wider"
            >
              Meet the Team <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <TestimonialsSection background="cream" />
      <ConsultSection />
    </>
  );
}

// — helper components kept local since they're only used here —

function FeatureCard({
  icon: Icon,
  title,
  body,
  href,
}: {
  icon: typeof Shield;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-start text-left">
      <div className="w-12 h-12 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-xl text-ink">{title}</h3>
      <p className="mt-2 text-muted leading-relaxed">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-xs uppercase tracking-wider"
      >
        Learn More <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function PackageCard({
  icon: Icon,
  title,
  image,
  blurb,
  href,
}: {
  icon: typeof Shield;
  title: string;
  image: string;
  blurb: string;
  href: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-44 w-full">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-brand-600">
          <Icon className="h-5 w-5" />
          <h3 className="font-display text-lg text-ink">{title}</h3>
        </div>
        <p className="mt-2 text-sm text-muted flex-1">{blurb}</p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-xs uppercase tracking-wider"
        >
          Learn More <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
