import Image from "next/image";
import { Container } from "./Container";
import { ConsultForm } from "./forms/ConsultForm";

/**
 * The "Book a Virtual Consult" section that repeats on Home, Solutions,
 * Automation, and About Us pages on the live site. World-map image
 * (homeform2) sits behind a brand-tinted panel.
 */
export function ConsultSection({ id = "consultform" }: { id?: string }) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return (
    <section id={id} className="relative py-20 sm:py-28 bg-brand-900 text-white overflow-hidden">
      <Image
        src="/images/form-bg-world-map.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/45 via-brand-900/35 to-brand-950/50" aria-hidden="true" />
      <Container className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="section-label text-xs text-white/80">Book a Virtual Consult</div>
          <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl leading-tight">
            Protect what matters most — free virtual assessment.
          </h2>
          <p className="mt-5 text-white/85 max-w-lg leading-relaxed">
            We&rsquo;re providing VIRTUAL home security assessments, free of charge, to
            homeowners looking to understand their home protection options. Schedule
            time with an expert today.
          </p>
        </div>
        <div className="rounded-lg bg-brand-950/60 backdrop-blur-sm border border-white/15 p-6 sm:p-8">
          <ConsultForm turnstileSiteKey={turnstileSiteKey} />
        </div>
      </Container>
    </section>
  );
}
