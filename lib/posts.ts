export type Post = {
  slug: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  category?: string;
};

// 10 most-recent posts mirrored from /news/ (captured 2026-04-22).
// Full post bodies are not ported in this first pass — the /news/[slug]
// page renders excerpt + CTA back to the homepage for now. Russell can
// add full bodies in a later content pass.
export const POSTS: Post[] = [
  {
    slug: "top-security-cameras-for-your-smart-home",
    title: "The Ultimate List Of Top Security Cameras For Your Smart Home",
    date: "2024-09-09",
    image: "/images/blog/top-security-cameras.jpg",
    excerpt:
      "A rundown of the best smart-home security cameras available today, compared on video quality, night vision, smart integration, and overall value for protecting your home.",
    category: "Cameras",
  },
  {
    slug: "5-smart-home-trends-for-futureproofing",
    title: "Future-Proof Your Home — 5 Smart Home Trends You Can't Ignore",
    date: "2024-09-06",
    image: "/images/blog/smart-home-trends-futureproofing.jpg",
    excerpt:
      "Five trends shaping how homes will be wired, automated and secured over the next decade — and what homeowners should do today to stay ahead.",
    category: "Smart Home",
  },
  {
    slug: "choosing-smart-home-lighting-for-safety",
    title: "Choosing The Right Smart Home Lighting For Safety And Style",
    date: "2024-09-05",
    image: "/images/blog/smart-home-lighting-safety.jpg",
    excerpt:
      "Smart lighting does more than set a mood — the right setup can deter intruders, automate safe paths through your home, and tie into your alarm system.",
    category: "Lighting",
  },
  {
    slug: "integrating-smart-cameras-into-your-home-security",
    title: "How To Integrate Smart Cameras Into Your Smart Home Setup",
    date: "2024-09-04",
    image: "/images/blog/integrating-smart-cameras.jpg",
    excerpt:
      "Step-by-step guidance on connecting smart cameras to your existing ADT Command panel, automation scenes, and mobile app notifications.",
    category: "Cameras",
  },
  {
    slug: "smart-lighting-ideas-for-transforming-your-living-space",
    title: "10 Innovative Smart Home Lighting Ideas",
    date: "2024-09-03",
    image: "/images/blog/smart-lighting-ideas.jpg",
    excerpt:
      "Ten practical smart-lighting ideas that transform comfort, energy use, and security — from scheduled dimming to alarm-triggered path lighting.",
    category: "Lighting",
  },
  {
    slug: "essential-features-for-smart-home-security-cameras",
    title: "Essential Features To Look For In Security Cameras",
    date: "2024-09-02",
    image: "/images/blog/essential-camera-features.jpg",
    excerpt:
      "Resolution, field of view, night vision, weatherproofing, two-way audio, and smart alerts — a checklist of what actually matters when shopping for cameras.",
    category: "Cameras",
  },
  {
    slug: "emerging-smart-home-trends-to-watch",
    title: "Emerging Smart Home Trends To Watch In The Next Decade",
    date: "2024-08-30",
    image: "/images/blog/emerging-smart-home-trends.jpg",
    excerpt:
      "AI-driven automation, voice-first interfaces, and tighter security integration are reshaping the connected home — here's what's coming.",
    category: "Smart Home",
  },
  {
    slug: "smart-home-lighting-controls-basics-to-advanced-features",
    title: "A Simplified Guide To Smart Home Lighting Controls",
    date: "2024-08-29",
    image: "/images/blog/lighting-controls.jpg",
    excerpt:
      "From basic scheduling to geo-fenced automation, this guide walks through every level of smart-lighting control and how to choose the right one.",
    category: "Lighting",
  },
  {
    slug: "top-smart-cameras-for-every-home-and-budget",
    title: "Best Smart Cameras For Every Home And Budget",
    date: "2024-08-28",
    image: "/images/blog/top-cameras-budget.jpg",
    excerpt:
      "Whether you're outfitting a first apartment or a full home, here are the best smart cameras at every price point we recommend.",
    category: "Cameras",
  },
  {
    slug: "smart-lighting-steps-for-energy-efficient-home",
    title: "5 Smart Lighting Steps For Energy Savings",
    date: "2024-08-27",
    image: "/images/blog/lighting-energy-savings.jpg",
    excerpt:
      "Five actionable steps that take smart lighting from a gimmick to real savings on your monthly electric bill.",
    category: "Lighting",
  },
];
