import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";

type Props = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  href?: string;
  buttonLabel?: string;
};

export function CTAStrip({
  eyebrow = "Get Started",
  heading = "Ready to protect what matters most?",
  subheading = "Schedule a free virtual consultation and we'll help you design the right system for your home.",
  href = "/schedule",
  buttonLabel = "Book a Virtual Consult",
}: Props) {
  return (
    <section className="relative bg-brand-700 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950" aria-hidden="true" />
      <Container className="relative py-14 sm:py-20 text-center">
        <div className="section-label text-xs text-white/80">{eyebrow}</div>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl max-w-3xl mx-auto">
          {heading}
        </h2>
        {subheading && (
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">{subheading}</p>
        )}
        <Link
          href={href}
          className="mt-8 inline-flex items-center justify-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold px-7 py-3.5 rounded-sm uppercase tracking-wider text-sm transition-colors"
        >
          {buttonLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Container>
    </section>
  );
}
