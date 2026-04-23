import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/Container";
import { ConsultSection } from "@/components/ConsultSection";
import { JsonLd } from "@/components/JsonLd";
import { TX_LOCATIONS, FL_LOCATIONS, LOCATIONS, SATELLITES } from "@/lib/locations";
import { itemListSchema, breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Locations — 47 City Service Areas Across Texas & Florida",
  description: `Bulldog Security Service has ${LOCATIONS.length} regional offices and serves ${LOCATIONS.length + SATELLITES.length} cities across Texas and Florida — Houston, Austin, Dallas, Fort Worth, San Antonio, Orlando, Tampa and 40 surrounding metro cities. ADT-monitored security with local techs.`,
  alternates: { canonical: "/locations" },
  openGraph: {
    title: "Bulldog Security Locations — Texas & Florida",
    description: `${LOCATIONS.length} regional offices, ${LOCATIONS.length + SATELLITES.length} cities served. Local ADT-monitored security across TX and FL.`,
    url: `${SITE.url}/locations`,
  },
};

export default function LocationsIndexPage() {
  const allCities = [
    ...LOCATIONS.map((l) => ({
      name: `${l.city}, ${l.state}`,
      url: `${SITE.url}/locations/${l.slug}`,
      description: `Bulldog Security Service ${l.metro} office`,
    })),
    ...SATELLITES.map((s) => ({
      name: `${s.city}, ${s.state}`,
      url: `${SITE.url}/locations/${s.slug}`,
    })),
  ];

  return (
    <>
      <JsonLd
        data={[
          itemListSchema({
            name: "Bulldog Security Service — Locations",
            url: `${SITE.url}/locations`,
            items: allCities,
          }),
          breadcrumbSchema([
            { name: "Home", url: SITE.url },
            { name: "Locations", url: `${SITE.url}/locations` },
          ]),
        ]}
      />
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand-800 to-brand-900 text-white">
        <Container className="py-24 sm:py-32 text-center">
          <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-white/80">
            Locations
          </div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Cities we serve.
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-lg text-white/90">
            Bulldog Security Service operates {LOCATIONS.length} regional offices across Texas
            and Florida — protecting more than 30,000 homes and families with ADT-monitored
            systems and local techs.
          </p>
        </Container>
      </section>

      {/* TEXAS REGION */}
      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <RegionHeader title="Texas" subtitle={`${TX_LOCATIONS.length} offices serving the state`} />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TX_LOCATIONS.map((loc) => (
              <LocationCard key={loc.slug} loc={loc} />
            ))}
          </div>
        </Container>
      </section>

      {/* FLORIDA REGION */}
      <section className="py-16 sm:py-20 bg-cream border-y border-zinc-200">
        <Container>
          <RegionHeader title="Florida" subtitle={`${FL_LOCATIONS.length} offices serving the state`} />
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FL_LOCATIONS.map((loc) => (
              <LocationCard key={loc.slug} loc={loc} />
            ))}
          </div>
        </Container>
      </section>

      <ConsultSection />
    </>
  );
}

function RegionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
        Region
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-4">
        <h2 className="font-display text-3xl sm:text-4xl text-ink leading-tight">{title}</h2>
        <span className="text-sm text-muted">{subtitle}</span>
      </div>
    </div>
  );
}

function LocationCard({ loc }: { loc: (typeof LOCATIONS)[number] }) {
  const hq = loc.offices[0];
  return (
    <Link
      href={`/locations/${loc.slug}`}
      className="group flex flex-col rounded-lg border border-zinc-200 bg-white p-6 hover:border-brand-600 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600">
            <MapPin className="h-3.5 w-3.5" />
            {loc.metro}
          </div>
          <h3 className="mt-2 font-display text-2xl text-ink leading-tight group-hover:text-brand-700 transition-colors">
            {loc.city}, {loc.state}
          </h3>
        </div>
        {hq.isHq && (
          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            HQ
          </span>
        )}
      </div>

      <div className="mt-4 text-sm text-muted leading-relaxed">
        {hq.street}
        {hq.street2 && <>, {hq.street2}</>}
        <br />
        {hq.city}, {hq.state} {hq.zip}
      </div>

      {hq.phone && (
        <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          <Phone className="h-3.5 w-3.5" /> {hq.phone}
        </div>
      )}

      {loc.offices.length > 1 && (
        <div className="mt-2 text-xs text-muted">
          + {loc.offices.length - 1} more office{loc.offices.length > 2 ? "s" : ""} in {loc.city}
        </div>
      )}

      <div className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-brand-600 group-hover:text-brand-700">
        View location <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
