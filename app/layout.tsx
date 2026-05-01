import type { Metadata } from "next";
import { headers } from "next/headers";
import { Mulish, Baskervville, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";
import { DemoPill } from "@/components/DemoPill";
import { SITE } from "@/lib/site";
import { organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/schema";

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

const baskervville = Baskervville({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-baskervville",
  display: "swap",
});

const frank = Frank_Ruhl_Libre({
  subsets: ["latin"],
  variable: "--font-frank",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Protect What Matters Most`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Bulldog Security Service — a family-owned ADT Authorized Dealer protecting 30,000+ homes across Texas and Florida. Smart home security, life safety, automation and 24/7 professional monitoring.",
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  generator: "Next.js",
  keywords: [
    "ADT authorized dealer",
    "home security Houston",
    "home security Texas",
    "smart home security",
    "ADT Command",
    "ADT Pulse",
    "home automation",
    "24/7 monitoring",
    "security cameras",
    "smart door locks",
    "video doorbell",
    "smart thermostat",
    "alarm system Houston",
    "alarm system Dallas",
    "alarm system Austin",
    "alarm system San Antonio",
    "alarm system Orlando",
    "alarm system Tampa",
    "life safety",
    "smoke and carbon detection",
  ],
  category: "Home Security",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Protect What Matters Most`,
    description:
      "Family-owned ADT Authorized Dealer. 30,000+ homes protected since 2010. Smart home security, life safety, automation, and 24/7 monitoring across TX and FL.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ADT Authorized Dealer`,
    description:
      "30,000+ homes protected. Smart security, life safety, automation and 24/7 ADT monitoring across Texas and Florida.",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: SITE.url },
  formatDetection: { telephone: true, address: true, email: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Skip the public-site chrome (TopBar / Header / Footer / JSON-LD /
  // Umami) on /admin/* — admins shouldn't see the customer-facing
  // header bar around their dashboard. The pathname comes from the
  // x-pathname header set by middleware.ts.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html
      lang="en"
      className={`${mulish.variable} ${baskervville.variable} ${frank.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-ink">
        {isAdmin ? (
          <main className="flex-1 flex flex-col">{children}</main>
        ) : (
          <>
            <DemoPill realUrl="https://bulldogsecurityservice.com" />
            <JsonLd data={[organizationSchema(), localBusinessSchema(), websiteSchema()]} />
            <TopBar />
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <UmamiAnalytics />
          </>
        )}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
