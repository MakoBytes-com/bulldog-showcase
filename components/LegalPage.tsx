import { Container } from "./Container";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, updated, children }: Props) {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-14 sm:py-18">
          <div className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white/80">
            {eyebrow}
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-white/80">Last updated: {updated}</p>
        </Container>
      </section>

      <section className="py-14 sm:py-20 bg-white">
        <Container className="max-w-3xl prose-legal space-y-5 text-ink leading-relaxed">
          {children}
        </Container>
      </section>
    </>
  );
}
