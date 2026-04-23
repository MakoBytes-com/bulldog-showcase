import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Lightbulb, Thermometer, Video, Lock, Warehouse } from "lucide-react";
import { Container } from "@/components/Container";
import { ConsultSection } from "@/components/ConsultSection";
import { JsonLd } from "@/components/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Smart Home Automation — Lights, Locks, Thermostats & Doorbells",
  description:
    "Z-wave smart home automation from Bulldog Security Service — smart lighting, ADT Smart Thermostat, video doorbells, keyless smart deadbolts, and smart garage-door control. All managed from the ADT Control app, integrated with your security system.",
  alternates: { canonical: "/automation" },
  openGraph: {
    title: "Smart Home Automation — Bulldog Security Service",
    description: "Smart lights, thermostats, doorbells, locks and garage openers — all controlled from the ADT Control app.",
    url: `${SITE.url}/automation`,
  },
};

type Module = {
  id: string;
  icon: typeof Lightbulb;
  title: string;
  intro: string;
  heroImage: string;
  detailImage: string;
  detailBody: string;
};

const MODULES: Module[] = [
  {
    id: "lighting",
    icon: Lightbulb,
    title: "Smart Lighting",
    intro: "Never arrive to a dark home again.",
    heroImage: "/images/new-home-lighting.jpg",
    detailImage: "/images/z-wave-smart-bulb.png",
    detailBody:
      "With ADT's smart bulbs and lighting automations, you can now take your light switches with you and adjust your home's interior and exterior lighting on the go. The smart bulbs are simple to set up — just screw them into your light fixture and you're done. Automation features allow you to schedule lights to turn on, off, or dim at specific times. For added protection, ADT's smart bulbs can also be programmed to turn on as soon as the smoke alarm is triggered, making for an easier, faster escape from potential danger.",
  },
  {
    id: "climate",
    icon: Thermometer,
    title: "Climate Control",
    intro: "Turn your phone into a remote for your home.",
    heroImage: "/images/smart-thermostat.jpg",
    detailImage: "/images/thermostat-device.png",
    detailBody:
      "Control your comfort and energy costs from virtually anywhere by turning your phone into a remote. With ADT's Smart Thermostat, you can adjust, automate, schedule and monitor your home's temperature from any device. Set up and schedule custom settings such as \"at work\" or \"on vacation\" for additional energy savings. For added convenience, schedule notifications when your home is too cold or too warm — mitigating the threat of frozen pipes for good.",
  },
  {
    id: "doorbell",
    icon: Video,
    title: "Video Doorbell",
    intro: "See who's at your door — from anywhere in the world.",
    heroImage: "/images/video-doorbell.jpg",
    detailImage: "/images/doorbell-app-ui.png",
    detailBody:
      "Answer your door and speak to your guests in real-time with the ADT Video Doorbell using the ADT Control app. Built-in motion sensors detect when someone is approaching and alert you so you can see who's there. With full ADT Control app integration and on-demand live video, you can see who's at your door, talk to them, arm or disarm your system, and lock or unlock your door — from anywhere around the world.",
  },
  {
    id: "locks",
    icon: Lock,
    title: "Smart Door Locks",
    intro: "Leave your keys at home.",
    heroImage: "/images/smart-door-locks.jpg",
    detailImage: "/images/smart-locks-device.png",
    detailBody:
      "Keyless entry and virtual app controls let you lock and unlock your door with a simple touch, from anywhere in the world. Check the status of your locks remotely to confirm they're locked. Set up alerts to your phone so you always know who's coming and going.",
  },
  {
    id: "garage",
    icon: Warehouse,
    title: "Smart Garage Door",
    intro: "Never wonder if you left the garage open.",
    heroImage: "/images/smart-garage-door.jpg",
    detailImage: "/images/garage-opener-device.png",
    detailBody:
      "With ADT's smart garage door and the Control app, you can check on the door anytime from anywhere — and open or close it with a simple button. Set modes for various scenarios like \"away\" which automatically closes your door.",
  },
];

export default function AutomationPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "Smart Home Automation — Z-Wave & ADT Control",
            description:
              "Z-wave smart home automation including smart lighting, ADT Smart Thermostat, video doorbells, keyless smart deadbolt locks, and smart garage-door openers — all managed through the ADT Control app and integrated with the home security system.",
            url: `${SITE.url}/automation`,
          }),
          breadcrumbSchema([
            { name: "Home", url: SITE.url },
            { name: "Automation", url: `${SITE.url}/automation` },
          ]),
        ]}
      />
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-brand-900 text-white">
        <Image
          src="/images/new-home-lighting.jpg"
          alt="Modern two-story home at dusk with lights on"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-900/80 via-brand-900/55 to-brand-900/75" />
        <Container className="py-32 sm:py-44 lg:py-56 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight drop-shadow-md">
            Home automation, built around security.
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-lg text-white/90 drop-shadow">
            Smart lights, thermostats, doorbells, locks and garage-door openers —
            all controlled from one app, integrated with your security system.
          </p>
          <Link
            href="#consultform"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-md hover:bg-brand-700 transition-colors"
          >
            Book a Virtual Consult
          </Link>
        </Container>
      </section>

      {/* NAV ROW — anchors to each module */}
      <section className="py-10 bg-cream border-b border-zinc-200">
        <Container>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {MODULES.map((m) => (
              <Link
                key={m.id}
                href={`#${m.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-brand-600 hover:text-brand-700 transition-colors"
              >
                <m.icon className="h-4 w-4" />
                {m.title}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {MODULES.map((m, i) => (
        <section
          key={m.id}
          id={m.id}
          className={`py-16 sm:py-24 scroll-mt-24 ${i % 2 === 1 ? "bg-cream border-y border-zinc-200" : "bg-white"}`}
        >
          <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <div className="flex items-center gap-2 text-brand-600">
                <m.icon className="h-5 w-5" />
                <div className="section-label text-sm">{m.title}</div>
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
                {m.intro}
              </h2>
              <p className="mt-5 text-muted leading-relaxed">{m.detailBody}</p>
              <Link
                href="/schedule"
                className="mt-6 inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-xs uppercase tracking-wider"
              >
                Add this to your system <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className={`${i % 2 === 1 ? "lg:order-1" : ""} relative mx-auto w-full max-w-md aspect-[4/3]`}>
              <Image
                src={m.detailImage}
                alt={`${m.title} — product detail`}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 448px, 100vw"
              />
            </div>
          </Container>
        </section>
      ))}

      <ConsultSection />
    </>
  );
}
