import { Container } from "./Container";
import { Star } from "lucide-react";

export type Testimonial = { quote: string; name: string; location: string };

// Testimonials captured from the live site (mirrors /about-us/ and /schedule/).
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Bulldog took the time to walk us through every option and helped us design exactly the system we needed. Our tech was on time, professional, and cleaned up after himself. Couldn't ask for a better experience.",
    name: "Nathan Dixon",
    location: "Dallas, TX",
  },
  {
    quote:
      "Franklin was incredible. He explained everything in plain English, answered every question my husband had, and got us up and running the same day. We feel so much safer now.",
    name: "Nichole W.",
    location: "Houston, TX",
  },
  {
    quote:
      "I've dealt with a few security companies over the years and Bulldog is in a league of their own. Family-owned really shows in how they treat customers. Highly recommend.",
    name: "Jeff Hoffman",
    location: "Fort Worth, TX",
  },
];

export function TestimonialsSection({ background = "white" }: { background?: "white" | "cream" }) {
  return (
    <section className={background === "cream" ? "py-16 sm:py-24 bg-cream" : "py-16 sm:py-24 bg-white"}>
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="section-label text-sm">Reviews</div>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl text-ink">
            What Our Customers Say
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex gap-0.5 text-brand-600" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-ink leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-zinc-100">
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="text-sm text-muted">{t.location}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
