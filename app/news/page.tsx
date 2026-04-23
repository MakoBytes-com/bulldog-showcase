import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { POSTS } from "@/lib/posts";
import { ConsultSection } from "@/components/ConsultSection";

export const metadata: Metadata = {
  title: "News & Insights",
  description:
    "The latest from Bulldog Security Service — smart home trends, security camera reviews, lighting automation ideas, and practical guides for protecting your home.",
  alternates: { canonical: "/news" },
};

export default function NewsIndexPage() {
  return (
    <>
      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <div className="section-label text-xs text-white/80">News</div>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
            Insights from the team.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Smart home trends, camera comparisons, lighting ideas, and practical guides
            to help you get more out of your Bulldog security system.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POSTS.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col rounded-lg border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/news/${post.slug}`} className="block relative h-48 w-full bg-cream">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  {post.category && (
                    <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                      {post.category}
                    </div>
                  )}
                  <h2 className="mt-2 font-display text-xl text-ink leading-snug">
                    <Link href={`/news/${post.slug}`} className="hover:text-brand-700">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-muted flex-1 leading-relaxed">{post.excerpt}</p>
                  <div className="mt-4 text-xs text-muted">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <ConsultSection />
    </>
  );
}
