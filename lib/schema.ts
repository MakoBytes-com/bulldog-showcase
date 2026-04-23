import { SITE, HQ, PHONES, SOCIAL } from "./site";

const SERVICE_AREA_CITIES = [
  "Houston",
  "Dallas",
  "Fort Worth",
  "Austin",
  "San Antonio",
  "Orlando",
  "Tampa",
];

export const SERVICES = [
  "Home Security Systems",
  "Life Safety (Smoke & CO Detection)",
  "Home Automation",
  "24/7 Professional Monitoring",
  "Security Cameras",
  "Video Doorbells",
  "Smart Door Locks",
  "Smart Thermostats",
  "Smart Lighting",
  "Smart Garage Door Control",
  "Motion Detection",
  "Emergency Devices",
];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/images/bulldog-logo.png`,
    email: SITE.email,
    telephone: PHONES.main.number,
    foundingDate: String(SITE.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${HQ.street}, ${HQ.street2 ?? ""}`.trim().replace(/,\s*$/, ""),
      addressLocality: HQ.city,
      addressRegion: HQ.state,
      postalCode: HQ.zip,
      addressCountry: "US",
    },
    sameAs: [SOCIAL.facebook, SOCIAL.linkedin, SOCIAL.yelp],
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SecuritySystemInstaller",
    "@id": `${SITE.url}/#localbusiness`,
    name: SITE.name,
    image: `${SITE.url}/images/bulldog-logo.png`,
    url: SITE.url,
    telephone: PHONES.main.number,
    email: SITE.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${HQ.street}, ${HQ.street2 ?? ""}`.trim().replace(/,\s*$/, ""),
      addressLocality: HQ.city,
      addressRegion: HQ.state,
      postalCode: HQ.zip,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.011,
      longitude: -95.504,
    },
    areaServed: SERVICE_AREA_CITIES.map((c) => ({ "@type": "City", name: c })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Home Security & Automation Services",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s },
      })),
    },
    sameAs: [SOCIAL.facebook, SOCIAL.linkedin, SOCIAL.yelp],
  };
}

export function serviceSchema(opts: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: { "@id": `${SITE.url}/#organization` },
    areaServed: SERVICE_AREA_CITIES.map((c) => ({ "@type": "City", name: c })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

// WebSite schema with SearchAction — eligible for Google sitelinks search box.
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": `${SITE.url}/#organization` },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

// ItemList schema for collection pages (e.g. /locations index).
export function itemListSchema(opts: {
  name: string;
  url: string;
  items: { name: string; url: string; description?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    url: opts.url,
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: item.url,
      name: item.name,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    image: opts.image,
    datePublished: opts.datePublished,
    url: opts.url,
    author: { "@type": "Organization", name: opts.author ?? SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: `${SITE.url}/images/bulldog-logo.png` },
    },
  };
}
