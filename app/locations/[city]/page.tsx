import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  Phone,
  ShieldAlert,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Container } from "@/components/Container";
import { ConsultSection } from "@/components/ConsultSection";
import { JsonLd } from "@/components/JsonLd";
import { SexOffenderLookupForm } from "@/components/SexOffenderLookupForm";
import { faqSchema, breadcrumbSchema, speakableSchema } from "@/lib/schema";
import {
  LOCATIONS,
  SATELLITES,
  getLocationBySlug,
  getSatelliteBySlug,
  getSexOffenderData,
  ALARM_DETERRENCE_NOTE,
  SEX_OFFENDER_SOURCE,
  type LocationCity,
  type SatelliteCity,
} from "@/lib/locations";

// Returns the parent + sibling satellites for a given location, used for
// internal linking on each page. For office cities, returns its satellites.
// For satellites, returns its parent + sibling satellites.
function getSiblings(loc: ResolvedLoc): {
  parent?: LocationCity;
  siblings: SatelliteCity[];
} {
  if (loc.isSatellite) {
    const parent = (loc.data as SatelliteCity);
    const parentLoc = getLocationBySlug(parent.parentSlug);
    const siblings = SATELLITES.filter(
      (s) => s.parentSlug === parent.parentSlug && s.slug !== parent.slug,
    );
    return { parent: parentLoc, siblings };
  }
  const office = loc.data as LocationCity;
  const siblings = SATELLITES.filter((s) => s.parentSlug === office.slug);
  return { siblings };
}
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ city: string }> };

// Resolved view that the template renders — covers both office cities (full
// dataset) and satellite cities (slimmer dataset, parent-office reference).
type ResolvedLoc = {
  isSatellite: boolean;
  data: LocationCity | SatelliteCity;
  parent?: LocationCity;
  // Fields needed by the template, normalized across both types.
  city: string;
  state: string;
  stateFull: string;
  metro: string;
  slug: string;
  intro: string;
  whyLocal?: string;
  neighborhoods?: string[];
  process?: string;
  faqs?: { q: string; a: string }[];
  nearby?: string[];
  offices: LocationCity["offices"];
  crimeStats?: LocationCity["crimeStats"];
};

function resolveLocation(slug: string): ResolvedLoc | null {
  const office = getLocationBySlug(slug);
  if (office) {
    return {
      isSatellite: false,
      data: office,
      city: office.city,
      state: office.state,
      stateFull: office.stateFull,
      metro: office.metro,
      slug: office.slug,
      intro: office.intro,
      whyLocal: office.whyLocal,
      neighborhoods: office.neighborhoods,
      process: office.process,
      faqs: office.faqs,
      nearby: office.nearby,
      offices: office.offices,
      crimeStats: office.crimeStats,
    };
  }
  const sat = getSatelliteBySlug(slug);
  if (!sat) return null;
  const parent = getLocationBySlug(sat.parentSlug);
  if (!parent) return null;
  return {
    isSatellite: true,
    data: sat,
    parent,
    city: sat.city,
    state: sat.state,
    stateFull: sat.stateFull,
    metro: parent.metro,
    slug: sat.slug,
    intro: sat.intro,
    offices: parent.offices,
    crimeStats: sat.crimeStats,
  };
}

export function generateStaticParams() {
  return [
    ...LOCATIONS.map((l) => ({ city: l.slug })),
    ...SATELLITES.map((s) => ({ city: s.slug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const loc = resolveLocation(city);
  if (!loc) return {};
  return {
    title: `Home Security in ${loc.city}, ${loc.state} — Bulldog Security Service`,
    description: `ADT-monitored home security and smart-home automation in ${loc.city}, ${loc.stateFull}. Local techs, real ${loc.metro} office, 24/7 monitoring.${loc.crimeStats?.burglary ? ` ${loc.crimeStats.burglary.count.toLocaleString()} burglaries reported in ${loc.city} in ${loc.crimeStats.year}.` : ""}`,
    alternates: { canonical: `/locations/${loc.slug}` },
  };
}

export default async function LocationPage({ params }: Props) {
  const { city } = await params;
  const loc = resolveLocation(city);
  if (!loc) notFound();

  const hq = loc.offices[0];
  const burglariesPerWeek = loc.crimeStats?.burglary
    ? Math.round((loc.crimeStats.burglary.count / 52) * 10) / 10
    : null;
  const burglariesPerDay = loc.crimeStats?.burglary
    ? Math.round((loc.crimeStats.burglary.count / 365) * 10) / 10
    : null;
  const siblings = getSiblings(loc);

  // LocalBusiness schema for SEO local-pack
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SecuritySystemInstaller",
    name: `${SITE.name} — ${loc.city}`,
    image: `${SITE.url}/api/og?title=${encodeURIComponent(loc.city)}`,
    "@id": `${SITE.url}/locations/${loc.slug}`,
    url: `${SITE.url}/locations/${loc.slug}`,
    telephone: hq.phone || SITE.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: hq.street2 ? `${hq.street}, ${hq.street2}` : hq.street,
      addressLocality: hq.city,
      addressRegion: hq.state,
      postalCode: hq.zip,
      addressCountry: "US",
    },
    areaServed: { "@type": "City", name: `${loc.city}, ${loc.state}` },
    parentOrganization: {
      "@type": "Organization",
      name: SITE.legalName,
      url: SITE.url,
    },
  };

  const allSchemas: object[] = [
    localBusinessSchema,
    breadcrumbSchema([
      { name: "Home", url: SITE.url },
      { name: "Locations", url: `${SITE.url}/locations` },
      { name: `${loc.city}, ${loc.state}`, url: `${SITE.url}/locations/${loc.slug}` },
    ]),
    speakableSchema(["h1", "h2", "h3"]),
  ];
  if (loc.faqs && loc.faqs.length > 0) {
    allSchemas.push(faqSchema(loc.faqs));
  }

  return (
    <>
      <JsonLd data={allSchemas} />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-brand-800 to-brand-900 text-white">
        <Container className="py-20 sm:py-28 lg:py-32 text-center">
          <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-white/80">
            Locations · {loc.metro}
          </div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Home Security in {loc.city}, {loc.state}
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-lg text-white/90">
            ADT-monitored security and smart-home automation, installed by a local
            {loc.city} crew from a real {loc.city} office.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#consultform"
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              Book a Virtual Consult
            </Link>
            {hq.phone && (
              <a
                href={hq.phoneHref}
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/15 transition-colors"
              >
                <Phone className="h-4 w-4" /> {hq.phone}
              </a>
            )}
          </div>
        </Container>
      </section>

      {/* INTRO + OFFICE SIDEBAR */}
      <section className="py-16 sm:py-20 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
              About Bulldog in {loc.city}
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              Local techs. {loc.isSatellite ? `Served from our ${loc.parent?.city} office.` : "Local office."} Real ADT monitoring.
            </h2>
            <p className="mt-5 text-muted leading-relaxed">{loc.intro}</p>
            {loc.whyLocal && (
              <p className="mt-4 text-muted leading-relaxed">{loc.whyLocal}</p>
            )}
            {loc.isSatellite && loc.parent && (
              <p className="mt-4 text-sm text-muted leading-relaxed">
                Looking for our nearest office?{" "}
                <Link href={`/locations/${loc.parent.slug}`} className="font-semibold text-brand-700 hover:text-brand-800 underline">
                  See the {loc.parent.city} location page →
                </Link>
              </p>
            )}
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-24 self-start">
            <div className="rounded-lg border border-zinc-200 bg-cream p-6">
              <div className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
                {loc.offices.length === 1 ? "Closest Office" : "Local Offices"}
              </div>
              <div className="mt-4 space-y-5">
                {loc.offices.map((o) => (
                  <div key={`${o.label}-${o.zip}`}>
                    <div className="flex items-center gap-2 font-display text-lg text-ink">
                      <MapPin className="h-4 w-4 text-brand-600" />
                      {o.label}
                      {o.isHq && (
                        <span className="ml-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          HQ
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-muted leading-relaxed">
                      {o.street}
                      {o.street2 && <>, {o.street2}</>}
                      <br />
                      {o.city}, {o.state} {o.zip}
                    </div>
                    {o.phone && o.phoneHref && (
                      <a
                        href={o.phoneHref}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        <Phone className="h-3.5 w-3.5" /> {o.phone}
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${o.street} ${o.street2 || ""} ${o.city} ${o.state} ${o.zip}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-brand-700 hover:text-brand-800 underline"
                    >
                      Get directions →
                    </a>
                  </div>
                ))}
              </div>
              <Link
                href="#consultform"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-brand-700 transition-colors"
              >
                Request a Free Consult <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </Container>
      </section>

      {/* CRIME STATS */}
      {loc.crimeStats && (
        <section className="py-16 sm:py-20 bg-cream border-y border-zinc-200">
          <Container>
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-brand-600">
                <ShieldAlert className="h-5 w-5" />
                <div className="text-sm font-display font-semibold uppercase tracking-[0.2em]">
                  Why It Matters in {loc.city}
                </div>
              </div>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
                {loc.city} crime, by the numbers.
              </h2>
            </div>

            {loc.crimeStats.note ? (
              <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-display text-lg text-ink">
                      Local FBI UCR data is not currently published for {loc.city}.
                    </div>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                      {loc.crimeStats.note}
                    </p>
                    <p className="mt-3 text-sm text-muted leading-relaxed">
                      Regardless of the headline numbers, every Bulldog system in {loc.city}{" "}
                      ships with 24/7 ADT monitoring, cellular signal path and battery
                      backup — so your alarm reaches the central station even when power
                      and internet are out.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {loc.crimeStats.burglary && (
                    <StatCard
                      label="Reported burglaries"
                      value={loc.crimeStats.burglary.count.toLocaleString()}
                      sub={`${loc.crimeStats.burglary.ratePer100k.toLocaleString()} per 100k residents · ${loc.crimeStats.year}`}
                    />
                  )}
                  {loc.crimeStats.propertyCrime && (
                    <StatCard
                      label="Total property crimes"
                      value={loc.crimeStats.propertyCrime.count.toLocaleString()}
                      sub={`${loc.crimeStats.propertyCrime.ratePer100k.toLocaleString()} per 100k · vs US avg ${loc.crimeStats.nationalAvgPropertyCrimeRate.toLocaleString()}`}
                    />
                  )}
                  {loc.crimeStats.burglary && loc.crimeStats.stateAvgBurglaryRate && (
                    <StatCard
                      label={`vs ${loc.state} state avg`}
                      value={`${Math.round((loc.crimeStats.burglary.ratePer100k / loc.crimeStats.stateAvgBurglaryRate) * 100 - 100)}%`}
                      sub={`${loc.city} burglary rate vs the ${loc.stateFull} statewide rate of ${loc.crimeStats.stateAvgBurglaryRate}/100k`}
                      tone={
                        loc.crimeStats.burglary.ratePer100k > loc.crimeStats.stateAvgBurglaryRate
                          ? "high"
                          : "low"
                      }
                    />
                  )}
                </div>

                {burglariesPerWeek && burglariesPerDay && (
                  <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 text-ink">
                    <p className="leading-relaxed">
                      That works out to roughly{" "}
                      <strong className="text-brand-700">
                        {burglariesPerWeek.toLocaleString()} burglaries per week
                      </strong>{" "}
                      — about{" "}
                      <strong className="text-brand-700">
                        {burglariesPerDay.toLocaleString()} every day
                      </strong>{" "}
                      reported in {loc.city} alone. {ALARM_DETERRENCE_NOTE}
                    </p>
                  </div>
                )}
              </>
            )}

            <p className="mt-4 text-xs text-muted">
              Source: {loc.crimeStats.source}.{" "}
              {loc.crimeStats.note ? "" : `Population: ${loc.crimeStats.population.toLocaleString()}.`}{" "}
              Stats reflect city limits only and don&rsquo;t include surrounding metro
              areas. Individual neighborhood risk varies — ask us for a free walkthrough.
            </p>
          </Container>
        </section>
      )}

      {/* WHAT WE INSTALL + NEIGHBORHOODS */}
      <section className="py-16 sm:py-20 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
              What We Install in {loc.city}
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              Every Bulldog package, available locally.
            </h2>
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Home Security", href: "/solutions#security" },
                { title: "Life Safety", href: "/solutions#safety" },
                { title: "24/7 Monitoring", href: "/solutions#monitoring" },
                { title: "Smart Lighting", href: "/automation#lighting" },
                { title: "Climate Control", href: "/automation#climate" },
                { title: "Video Doorbell", href: "/automation#doorbell" },
                { title: "Smart Door Locks", href: "/automation#locks" },
                { title: "Smart Garage Door", href: "/automation#garage" },
              ].map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="flex items-center gap-2 rounded-md border border-zinc-200 bg-cream px-4 py-3 text-sm font-semibold text-ink hover:border-brand-600 hover:text-brand-700 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>

            {loc.process && (
              <div className="mt-10">
                <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
                  How installs run in {loc.city}
                </div>
                <p className="mt-3 text-muted leading-relaxed">{loc.process}</p>
              </div>
            )}
          </div>

          {loc.neighborhoods && loc.neighborhoods.length > 0 ? (
            <div className="lg:col-span-5">
              <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
                Neighborhoods & areas served
              </div>
              <h3 className="mt-3 font-display text-2xl text-ink">
                We cover the {loc.metro} area.
              </h3>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {loc.neighborhoods.map((n) => {
                  const sat = SATELLITES.find((s) => s.city === n);
                  if (sat) {
                    return (
                      <li key={n}>
                        <Link
                          href={`/locations/${sat.slug}`}
                          className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-ink hover:border-brand-600 hover:text-brand-700 transition-colors"
                        >
                          <Building2 className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
                          {n}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li
                      key={n}
                      className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-ink"
                    >
                      <Building2 className="h-3.5 w-3.5 text-brand-600 flex-shrink-0" />
                      {n}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="lg:col-span-5">
              <PublicSafetyCard state={loc.state} stateFull={loc.stateFull} city={loc.city} slug={loc.slug} />
            </div>
          )}
        </Container>
      </section>

      {/* PUBLIC SAFETY RESOURCES — full-width on office cities since they have the
          right-column neighborhoods grid; satellite pages already get the card
          inline above. */}
      {loc.neighborhoods && loc.neighborhoods.length > 0 && (
        <section className="pb-16 sm:pb-20 bg-white">
          <Container className="max-w-3xl">
            <PublicSafetyCard state={loc.state} stateFull={loc.stateFull} city={loc.city} slug={loc.slug} />
          </Container>
        </section>
      )}

      {/* FAQS */}
      {loc.faqs && loc.faqs.length > 0 && (
        <section className="py-16 sm:py-20 bg-cream border-y border-zinc-200">
          <Container className="max-w-3xl">
            <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
              Common questions
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink leading-tight">
              Questions we hear from {loc.city} customers.
            </h2>
            <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
              {loc.faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-6 font-display text-lg text-ink">
                    {f.q}
                    <ChevronRight className="h-5 w-5 text-brand-600 flex-shrink-0 mt-1 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-muted leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* SIBLING CITIES — for satellites: link back to parent + other satellites
          in the same metro. Office cities use the NEARBY CITIES block below. */}
      {loc.isSatellite && siblings.parent && (
        <section className="py-12 sm:py-16 bg-white">
          <Container>
            <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
              Other {siblings.parent.metro} locations
            </div>
            <h3 className="mt-3 font-display text-2xl text-ink">More cities we cover from {siblings.parent.city}</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/locations/${siblings.parent.slug}`}
                className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                {siblings.parent.city} (main office)
              </Link>
              {siblings.siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/locations/${s.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-cream px-3 py-1 text-sm text-ink hover:border-brand-600 hover:text-brand-700 transition-colors"
                >
                  {s.city}
                </Link>
              ))}
              <Link
                href="/locations"
                className="inline-flex items-center gap-1 rounded-full border border-brand-600 px-3 py-1 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                View all locations <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* NEARBY CITIES — office-city block */}
      {loc.nearby && loc.nearby.length > 0 && (
        <section className="py-12 sm:py-16 bg-white">
          <Container>
            <div className="text-sm font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
              Also serving the {loc.metro} area
            </div>
            <h3 className="mt-3 font-display text-2xl text-ink">Nearby cities</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {loc.nearby.map((n) => {
                const sat = SATELLITES.find((s) => s.city === n);
                if (sat) {
                  return (
                    <Link
                      key={n}
                      href={`/locations/${sat.slug}`}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-cream px-3 py-1 text-sm text-ink hover:border-brand-600 hover:text-brand-700 transition-colors"
                    >
                      {n}
                    </Link>
                  );
                }
                return (
                  <span
                    key={n}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-cream px-3 py-1 text-sm text-ink"
                  >
                    {n}
                  </span>
                );
              })}
              <Link
                href="/locations"
                className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                View all locations <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Container>
        </section>
      )}

      <ConsultSection />
    </>
  );
}

// Discrete public-safety callout — links out to the official state sex offender
// registry. Bulldog stores nothing; the form is a one-click pass-through.
function PublicSafetyCard({
  state,
  stateFull,
  city,
  slug,
}: {
  state: string;
  stateFull: string;
  city: string;
  slug: string;
}) {
  const registryName =
    state === "TX"
      ? "Texas DPS"
      : state === "FL"
        ? "FDLE"
        : "the National Sex Offender Public Website";
  const so = getSexOffenderData(slug);
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <div className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-brand-600">
        Public Safety Resources
      </div>
      <h3 className="mt-2 font-display text-xl text-ink leading-tight">
        Check the sex offender registry for your {city} address.
      </h3>
      {so && (
        <div className="mt-3 rounded-md border border-zinc-200 bg-cream px-3 py-2.5 text-sm text-ink">
          <span className="font-semibold">{so.count.toLocaleString()}</span> registered offenders in {city} city limits ·{" "}
          <span className="font-semibold">1 per {so.ratio.toLocaleString()}</span> residents
        </div>
      )}
      <p className="mt-3 text-sm text-muted leading-relaxed">
        The official {stateFull} registry ({registryName}) has a public, address-searchable
        map. Enter your ZIP below and we&rsquo;ll open the official registry in a new tab —
        Bulldog doesn&rsquo;t store or transmit your address.
      </p>
      <SexOffenderLookupForm state={state} city={city} />
      {so && (
        <p className="mt-3 text-[11px] text-muted leading-relaxed">
          Source: {SEX_OFFENDER_SOURCE}.
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "high" | "low";
}) {
  const valueColor =
    tone === "high" ? "text-red-600" : tone === "low" ? "text-emerald-700" : "text-brand-700";
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-2 font-display text-4xl leading-none ${valueColor}`}>{value}</div>
      <div className="mt-2 text-xs text-muted leading-relaxed">{sub}</div>
    </div>
  );
}
