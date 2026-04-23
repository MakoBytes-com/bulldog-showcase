import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { JsonLd } from "@/components/JsonLd";
import { CTAStrip } from "@/components/CTAStrip";
import { POSTS } from "@/lib/posts";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import { SITE } from "@/lib/site";
import { ChevronLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/news/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `${SITE.url}/news/${post.slug}`,
      images: [{ url: `${SITE.url}${post.image}`, width: 1200, height: 630 }],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.excerpt,
            url: `${SITE.url}/news/${post.slug}`,
            image: `${SITE.url}${post.image}`,
            datePublished: post.date,
          }),
          breadcrumbSchema([
            { name: "Home", url: SITE.url },
            { name: "News", url: `${SITE.url}/news` },
            { name: post.title, url: `${SITE.url}/news/${post.slug}` },
          ]),
        ]}
      />

      <section className="bg-brand-900 text-white">
        <Container className="py-16 sm:py-20">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            All News
          </Link>
          {post.category && (
            <div className="mt-6 section-label text-xs text-white/80">{post.category}</div>
          )}
          <h1 className="mt-3 font-display text-3xl sm:text-5xl leading-tight max-w-3xl">
            {post.title}
          </h1>
          <div className="mt-4 text-sm text-white/75">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </Container>
      </section>

      <section className="py-14 bg-white">
        <Container className="max-w-3xl">
          <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-zinc-200 bg-cream">
            <Image
              src={post.image}
              alt={`${post.title} — Bulldog Security Service article featured image`}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>

          <div className="mt-10 space-y-6 text-ink leading-relaxed text-lg">
            <p>{post.excerpt}</p>
            <p className="text-muted">
              This article is part of the Bulldog Security News archive. The full post is
              being migrated to our new platform. In the meantime, if you&rsquo;d like to
              discuss how any of these ideas apply to your own home,{" "}
              <Link href="/schedule" className="text-brand-600 hover:text-brand-700 underline">
                schedule a free virtual consult
              </Link>{" "}
              — we&rsquo;re happy to walk you through options at no obligation.
            </p>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="py-14 bg-cream border-y border-zinc-200">
          <Container>
            <div className="section-label text-sm">More from the team</div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl text-ink">Related posts</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/news/${p.slug}`}
                  className="group flex flex-col rounded-lg border border-zinc-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40 w-full bg-cream">
                    <Image
                      src={p.image}
                      alt={`${p.title} — related Bulldog Security Service article`}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg text-ink group-hover:text-brand-700">{p.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CTAStrip />
    </>
  );
}
