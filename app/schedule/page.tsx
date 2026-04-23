import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ScheduleForm } from "@/components/forms/ScheduleForm";
import { StatsBand } from "@/components/StatsBand";
import { TestimonialsSection } from "@/components/Testimonials";
import { SERVICE_WINDOW } from "@/lib/site";
import { CalendarClock } from "lucide-react";

export const metadata: Metadata = {
  title: "Schedule A Service",
  description:
    "Book service on existing Bulldog/ADT equipment or schedule your install. We'll follow up shortly to confirm your appointment. Service windows: Mon–Fri, 12–5 pm.",
  alternates: { canonical: "/schedule" },
};

export default function SchedulePage() {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">Schedule A Service</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Book online now.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Whether you need service on existing equipment or to schedule the completion
            of your install, we&rsquo;re here to help. Fill out the form below and
            we&rsquo;ll follow up shortly to confirm your appointment.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20 bg-cream border-b border-zinc-200">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="rounded-lg bg-white border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-2 text-brand-600">
                <CalendarClock className="h-5 w-5" />
                <div className="section-label text-sm">Service Windows</div>
              </div>
              <h3 className="mt-3 font-display text-2xl text-ink">{SERVICE_WINDOW}</h3>
              <p className="mt-3 text-sm text-muted leading-relaxed">
                Secure your slot today — we&rsquo;ll confirm availability within one
                business day.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-lg bg-white border border-zinc-200 shadow-sm p-6 sm:p-8">
              <div className="section-label text-sm">Book Online Now</div>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl text-ink">
                Secure your slot today.
              </h2>
              <div className="mt-6">
                <ScheduleForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <StatsBand />
      <TestimonialsSection />
    </>
  );
}
