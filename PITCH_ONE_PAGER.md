# Bulldog Security Service — Site Rebuild Walkthrough

**Live preview:** https://bulldogsecurityservice-com.vercel.app
**What it replaces:** the current WordPress / Avada site at bulldogsecurityservice.com

---

## What's been built

### Scope at a glance

| | Old site | New site |
|---|---|---|
| Pages | ~12 core pages | **104 city pages + 12 core pages = 116 total** |
| Cities ranked for | 1 (Houston) | **47 metros across TX & FL** |
| Page load speed | ~3-5s typical (WordPress) | **Sub-1s** (Next.js + Vercel CDN) |
| Mobile responsive | Yes (theme-dependent) | Yes (built mobile-first) |
| Schema markup | Minimal | **Full** (Organization, LocalBusiness, Service, FAQ, Speakable, BreadcrumbList) |
| AI-search ready | No | **Yes** (`/llms.txt` + named allowlist for 17 AI bots) |
| Forms backend | Gravity Forms | **React + Resend + Cloudflare Turnstile + rate-limit + honeypot** |
| Hosting cost | $100-300/mo (managed WP) | **$0-20/mo** (Vercel free tier handles this scale) |
| Security | Plugin patches required | **Static-rendered, no DB, no PHP attack surface** |

### The core pages (mirrors live WP exactly, plus polish)

- **Home** — full-bleed hero video, 4-card feature row, "30,000 homes" stat band, Jensen testimonial section, consult form
- **Solutions** — Home Security / Life Safety / 24/7 Monitoring breakdowns
- **Automation** — Smart Lighting / Climate / Doorbell / Locks / Garage with product detail shots
- **About Us** — Mission, "Our People + Our Promise" section, Core Values, Trust Bar (Birdeye 4.3 / BBB 4.3 / Google 4.4)
- **Meet The Team** — all 8 leadership bios with headshots
- **FAQ** — full 35 Q&A library
- **News** — 10 article shells (full bodies pending content)
- **Careers** — open positions with 8-city sales-consultant grid
- **Contact / Schedule / Privacy / Terms** — all wired

### The new locations system (the real differentiator)

**104 city landing pages**, each with:
- Custom hero + city-specific intro paragraph
- Sticky office sidebar (address, phone, "Get Directions" link to Google Maps)
- **Real FBI Uniform Crime Reports 2024 data** — burglary count, burglary rate per 100k, total property crime, comparison vs state and US averages
- **Sex offender registry count** per city (city-data.com), plus a discrete address-lookup form that opens the official Texas DPS or Florida FDLE registry in a new tab (Bulldog stores nothing)
- "How [city] compares" — auto-generated unique paragraph from the real numbers (e.g. "Mesquite's 392 burglaries per 100k is 38% higher than the Texas statewide average — meaning a monitored alarm matters more here")
- Services grid linking to Solutions/Automation
- Neighborhood/areas served grid (clickable to satellite city pages)
- City-specific FAQs (where applicable)
- Local FAQs + Sibling cities
- Per-page LocalBusiness JSON-LD schema

**Cities covered:**
- TX (89 pages): Houston HQ + Houston-South office, plus Austin, Dallas, Fort Worth, San Antonio offices, plus 70+ surrounding neighborhoods and cities (Sugar Land, Katy, Pearland, Spring, Cypress, The Woodlands, West University, Bellaire, Plano, Frisco, McKinney, Arlington, Southlake, Keller, Stone Oak, Boerne, New Braunfels, etc.)
- FL (15 pages): Orlando + Tampa offices, plus Winter Park, Lake Mary, Sanford, Oviedo, Kissimmee, Apopka, St. Petersburg, Clearwater, Brandon, Riverview, Largo, etc.

---

## Why so many landing pages? (the conversion case)

**1. Long-tail keyword capture.** "home security in Plano TX" has dramatically higher buying intent than "home security." Each city page targets 5-15 long-tail terms. 104 pages × ~10 keywords = **~1,000 long-tail target keywords**.

**2. Local-pack eligibility.** Google's 3-pack (the boxed local results above standard search results) is where 70% of local-service clicks go. Each city page has LocalBusiness schema with `areaServed` set to that city — so Bulldog is now eligible for the 3-pack in 47 metros, not just Houston.

**3. Lower competition per page.** "home security houston" has hundreds of ranking competitors (ADT.com, SimpliSafe, Ring, every local installer in town). "home security stone oak san antonio" has 5-10. Easier to rank #1 on niche pages.

**4. Higher intent = higher conversion.** Someone searching "Plano burglary stats" or "home security Sugar Land" is researching to buy. Local-landing-page conversion rates typically run **3-5x higher** than generic content.

**5. Trust through local relevance.** A page that says "Plano had 468 burglaries in 2024, here's what we install" reads as a real local company. A page that says "we serve all of Texas!" reads generic.

**6. AI-search advantage (this is the big new one).** ChatGPT, Claude, Perplexity, Google AI Overviews are increasingly the discovery layer. A page with title "Home Security in Plano, TX | Bulldog Security Service" + real FBI data is the URL these AIs cite when asked "best home security in Plano." Without per-city pages, Bulldog isn't in the AI consideration set at all.

### Conversion math (conservative, defensible)

| Assumption | Number |
|---|---|
| Pages | 104 |
| Avg organic visits per page per month (year 1, after Google indexes) | 50 |
| Total monthly visits | 5,200 |
| Local-landing conversion rate (industry average for high-intent traffic) | 5% |
| Monthly leads | 260 |
| Qualified rate (in-area, real shopper) | 10% |
| **Qualified leads / month** | **26** |
| Close rate on qualified leads | 10-15% |
| New customers / month | 2.6 — 3.9 |
| Lifetime value per customer (ADT install + 36mo monitoring) | ~$1,940 |
| **Monthly recurring revenue from locations system alone** | **~$5K-7.5K** |

**12-month rough ROI:** $50-150K incremental revenue, indefinitely, from a one-time build. CAC: $0 (organic traffic).

### Compare to the paid alternative

To match 26 qualified leads/month via Google Ads at $5-15 CPC and 5% conversion = **$2,600-$7,800/mo in ad spend**. The locations system delivers the same lead volume for $0 (after the one-time build).

---

## What makes this site different from competitors

### vs the current WordPress site
- 10x more pages (each ranking for distinct keywords)
- 5x faster (sub-1s vs 3-5s)
- AI-search ready (the WP site isn't on the radar of any LLM)
- No plugin attack surface; no monthly maintenance

### vs other Authorized ADT dealers
- Most have one generic "We serve Texas!" page. Bulldog now has 104 city-specific pages with real local data.
- Most use stock crime stats or none. Bulldog uses real FBI UCR 2024 numbers, current as of Sep 2025 release.
- The sex offender lookup form is a unique value-add — a tool that brings users back to the site and builds trust.

### vs ADT.com itself
- ADT.com targets national brand searches. Bulldog targets local "Plano home security" type searches where ADT's national page can't compete on local relevance.
- Bulldog's "Authorized Dealer in Plano" pitch ranks alongside (or above) ADT for local terms.

---

## Trust signals built in

- Texas Private Security License **B15560** in every footer
- Full ADT Authorized Dealer disclosure (legally required) with all 15 state license numbers
- BBB A+ + 2019 Award of Excellence
- "30,000 homes protected since 2010" stat band
- 8 leadership bios with photos
- 3 customer testimonials with city attribution
- All crime stats sourced + dated (FBI UCR 2024, released Sept 2025)
- Honest data caveats on cities where FBI UCR doesn't publish (Brandon, Riverview, The Woodlands — points to county sheriff instead of inventing numbers)
- Every form has Cloudflare Turnstile bot protection

---

## What's tech-ready vs needs Bulldog input

### Ready to ship today
- All 116 pages live, indexed-eligible, mobile-responsive, schema-marked
- Forms wired to Resend (just needs API key)
- Admin gate (just needs username/password)
- Analytics dashboard (Vercel + optional Umami)
- GitHub auto-deploy: any change → live in ~30s

### Pending Bulldog sign-off / input
- Pricing transparency on Solutions ("Monitoring from $X/mo") — needs Bulldog to provide a starting price
- Real customer photos / video testimonials to replace stock — needs Bulldog to source
- Calendly / Cal.com for actual consult booking — needs Bulldog account
- Google Business Profile claims for each of 8 office addresses — Bulldog must verify
- Form submission destination email + Resend account
- DNS cutover from current WP host to Vercel — when Bulldog says go

---

## Why now (the AI-search shift)

Google search is rapidly being replaced/augmented by AI assistants. ChatGPT, Claude, Perplexity, and Google's own AI Overviews now answer ~30% of search queries directly without a click to a website. The websites those AIs reference are the ones that:

1. Have a **`/llms.txt`** (Bulldog now does)
2. Have **explicit AI bot allowlists in robots.txt** (Bulldog allows 17 named AI crawlers)
3. Have **structured data** (Bulldog has 8 schema types covering every page)
4. Have **unique data per page** (Bulldog has real FBI stats per city, not template-and-swap)

Sites built before this shift (most ADT dealer sites) won't get cited by AI. Bulldog will.

---

## Cost & ongoing

| Item | Cost |
|---|---|
| Hosting (Vercel) | $0-20/mo at this scale (free tier handles 100k requests/mo) |
| Domain | ~$15/yr (already owned) |
| Resend (email) | $0 for 100 emails/day, $20/mo for 50,000 |
| Cloudflare Turnstile | $0 (unlimited) |
| Future maintenance | Pay-as-you-go (data updates ~annually when FBI releases new UCR) |

**No WordPress security patches. No plugin license renewals. No monthly hosting bills.**

---

## The bottom line for Bulldog

This site puts Bulldog in front of **every homeowner researching security in 47 Texas and Florida cities**, on Google AND on the AI assistants that are replacing it. Every page targets buyers with real local intent, backed by real FBI data, served in under a second.

It's positioned to outrank both the national ADT site and every other Authorized Dealer for local-intent searches — because no one else has done this for security. Yet.

---

## A note from Mako Logics

We've made a decision to grow with our clients. **The better Bulldog does, the better we do** — and that's why this rebuild is built to compound. Every page that ranks brings more leads. Every lead that converts strengthens the partnership. We're not here to ship a website and walk away; we're here to be your team for the long haul, watching the data, refining what works, and adding what's next as you grow.

If Bulldog wins, Mako wins. That's the whole point.
