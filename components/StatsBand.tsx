import Image from "next/image";
import { Container } from "./Container";
import { SITE } from "@/lib/site";

/** The "30,000 homes and families protected" band. Dark overlay over an image. */
export function StatsBand() {
  return (
    <section className="relative py-20 sm:py-28 bg-brand-950 text-white overflow-hidden">
      <Image
        src="/images/inspectors-team.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/40 via-brand-900/35 to-brand-950/45" aria-hidden="true" />
      <Container className="relative text-center">
        <p className="font-display text-xl sm:text-2xl text-white/90">
          We have proudly helped to protect over
        </p>
        <div className="mt-3 font-display text-7xl sm:text-8xl lg:text-9xl text-white tracking-tight leading-none">
          {SITE.homesProtected}
        </div>
        <p className="mt-4 font-display text-xl sm:text-2xl text-white/90">
          homes and families since {SITE.foundedYear}
        </p>
      </Container>
    </section>
  );
}
