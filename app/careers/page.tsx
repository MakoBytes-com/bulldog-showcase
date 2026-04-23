import type { Metadata } from "next";
import Image from "next/image";
import { ChevronRight, Briefcase, GraduationCap, Scale, DollarSign, Heart } from "lucide-react";
import { Container } from "@/components/Container";
import { CareersForm } from "@/components/forms/CareersForm";

export const metadata: Metadata = {
  title: "Careers — Join Bulldog Security Service",
  description:
    "Join a family-owned, nationally-growing ADT Authorized Dealer. Full-time sales, account management and install roles across TX and FL with competitive comp, paid training and benefits.",
  alternates: { canonical: "/careers" },
};

const PILLARS = [
  {
    icon: Briefcase,
    title: "Career Advancement",
    body:
      "We're BIG on making sure there are a plethora of career advancement opportunities for every employee. With Bulldog's rapid growth, new opportunities are constantly becoming available across the US.",
  },
  {
    icon: GraduationCap,
    title: "Proven Training",
    body:
      "It's OK if you don't have a background in home security — we teach you everything you need to know. Our experts have created proven training modules to get you up to speed quickly.",
  },
  {
    icon: Scale,
    title: "Work / Life Balance",
    body:
      "Spending time with family is important. That's why we've created — and continue to maintain — a supportive and healthy work environment that enables our employees to balance work and personal responsibilities.",
  },
  {
    icon: DollarSign,
    title: "Competitive Compensation",
    body:
      "Get paid what you deserve for your hard work each week. We offer competitive compensation packages and paid time off because we believe in the importance of spending time with your family.",
  },
  {
    icon: Heart,
    title: "Benefits",
    body:
      "We believe in helping protect our own. After 60 days of employment, we welcome our employees to apply for our generous health benefits to ensure you and your family are covered.",
  },
];

type JobListing = {
  title: string;
  type: string;
  locations: { city: string; applyUrl: string }[];
  description: string;
  qualifications: string[];
  compensation: string;
};

const JOBS: JobListing[] = [
  {
    title: "Account Manager",
    type: "Full-Time",
    locations: [
      {
        city: "Spring, TX",
        applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2121477",
      },
    ],
    description:
      "Our Account Managers develop and nurture new and existing relationships with Realtor partners in an effort to obtain a healthy pipeline of qualified referrals. You'll be responsible for contacting your referrals, explaining the benefits of our Realtor Partner Program, and selling them on the value of our home security solutions over the phone. You'll be expected to meet and exceed weekly sales goals and complete various administrative duties that correspond with your role as needed. This division of Bulldog has grown over 500% in 2018 and continues to offer opportunities to advance.",
    qualifications: [
      "2–3 years inside sales / account management experience",
      "Excellent customer service, relationship management & communication skills",
      "High-energy, results-oriented professional with drive to succeed",
      "Team-oriented individual seeking a long-term career",
      "Intermediate computer skills",
      "Solid work history with superior attendance",
      "Excellent written and verbal skills",
      "High school diploma or GED",
      "English/Spanish bilingual is a plus",
    ],
    compensation: "Average of $45,000–$50,000+ in the first year (base, incentives, bonuses).",
  },
  {
    title: "Sales Consultant",
    type: "Full-Time",
    locations: [
      { city: "Austin, TX", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2181095" },
      { city: "Dallas, TX", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2181090" },
      { city: "Fort Worth, TX", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2181091" },
      { city: "Houston (North), TX", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2181086" },
      { city: "Houston (South), TX", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2181087" },
      { city: "Houston (West), TX", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2181089" },
      { city: "San Antonio, TX", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2181092" },
      { city: "Orlando, FL", applyUrl: "https://recruiting.myapps.paychex.com/appone/MainInfoReq.asp?R_ID=2584767&B_ID=91" },
    ],
    description:
      "Our Sales Consultants assess the home security needs of new homeowners and craft personalized solutions while providing top-tier customer service. From the moment you walk through the door of a new home, your job is to build trust through credibility so you can close more deals. Regardless of your background, we provide you with the tools you need — alongside best-in-class PAID training that thoroughly teaches you everything you need to know about home security.",
    qualifications: [
      "1–3 years sales experience in a performance-driven environment",
      "Excellent customer service, presentation & communication skills",
      "High-energy, results-oriented professional",
      "Team-oriented individual seeking a long-term career",
      "Valid driver's license and reliable personal transportation",
      "Current vehicle insurance",
      "Ability to pass a background check",
      "Ability to maintain a 12:00 pm – 8:00 pm Monday–Friday schedule",
    ],
    compensation: "$1,000 hiring bonus after the first 60 days. Average $5,000/month in year one (base, incentives, bonuses).",
  },
];

export default function CareersPage() {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">Careers</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            A rewarding career — dedicated to helping protect others.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Based in Houston, we&rsquo;re one of the largest ADT Authorized Dealers in the
            nation. We&rsquo;ve been protecting our neighbors across Texas for over a decade
            and recently expanded into Florida — with big plans for national expansion.
          </p>
        </Container>
      </section>

      {/* FOUNDER QUOTE */}
      <section className="py-16 sm:py-20 bg-white">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4">
            <Image
              src="/images/team/luke-elwood.png"
              alt="Luke Elwood, President &amp; CEO"
              width={400}
              height={500}
              className="rounded-lg shadow-md w-full h-auto object-cover border border-zinc-200 bg-cream"
              sizes="(min-width: 1024px) 400px, 100vw"
            />
          </div>
          <div className="lg:col-span-8">
            <div className="section-label text-sm">From Our Founder</div>
            <blockquote className="mt-4 font-display text-2xl sm:text-3xl text-ink leading-snug">
              &ldquo;Bulldog has been about family since day one. Owned by brothers and led
              by family and friends who share a passion to help others, our priority
              continues to be providing a family-oriented workplace for our employees. We
              believe in taking care of our employees — in every sense of the word.&rdquo;
            </blockquote>
            <div className="mt-6 text-sm font-semibold text-brand-700">
              Luke Elwood — President &amp; CEO
            </div>
          </div>
        </Container>
      </section>

      {/* 5 PILLARS */}
      <section className="py-16 sm:py-24 bg-cream border-y border-zinc-200">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <div className="section-label text-sm">Join Our Growing National Team</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
              Why Bulldog.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="w-11 h-11 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-xl text-ink">{p.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg bg-white border border-zinc-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <Stat label="Ranking" value="#1 ADT Dealer in South Central US" />
            <Stat label="National Position" value="#3 ADT Dealer in the US" />
            <Stat label="Recognition" value="2019 BBB Award of Excellence" />
          </div>
        </Container>
      </section>

      {/* OPEN POSITIONS */}
      <section id="recruitment" className="py-16 sm:py-24 bg-white scroll-mt-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <div className="section-label text-sm">Open Positions</div>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
              Interested in joining our team?
            </h2>
          </div>

          <div className="mt-12 space-y-8">
            {JOBS.map((job) => (
              <article key={job.title} className="rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-brand-600 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/80">{job.type}</div>
                    <h3 className="font-display text-2xl">{job.title}</h3>
                  </div>
                  <div className="text-sm text-white/85">{job.locations.length} location{job.locations.length === 1 ? "" : "s"}</div>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <p className="text-muted leading-relaxed">{job.description}</p>
                  <div>
                    <h4 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">Qualifications</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted">
                      {job.qualifications.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-md bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-900">
                    <span className="font-semibold">Compensation: </span>{job.compensation}
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink text-sm uppercase tracking-wider mb-3">Apply</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.locations.map((loc) => (
                        <a
                          key={loc.city}
                          href={loc.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-sm bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
                        >
                          Apply — {loc.city}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* CONTACT RECRUITMENT */}
      <section className="py-16 sm:py-24 bg-cream border-t border-zinc-200">
        <Container className="max-w-2xl">
          <div className="section-label text-sm text-center">Contact Recruitment</div>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink text-center">
            Have questions? Reach out directly.
          </h2>
          <div className="mt-10 rounded-lg bg-white border border-zinc-200 shadow-sm p-6 sm:p-8">
            <CareersForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
          </div>
        </Container>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="section-label text-xs">{label}</div>
      <div className="mt-2 font-display text-lg text-ink leading-snug">{value}</div>
    </div>
  );
}
