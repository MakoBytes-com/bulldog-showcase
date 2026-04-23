/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://bulldogsecurityservice.com",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;
    if (path === "/") priority = 1.0;
    else if (
      path === "/solutions" ||
      path === "/automation" ||
      path === "/contact" ||
      path === "/schedule" ||
      path === "/locations"
    ) {
      priority = 0.9;
    } else if (path.startsWith("/locations/")) priority = 0.85;
    else if (path.startsWith("/about-us")) priority = 0.8;
    else if (path.startsWith("/news/")) priority = 0.6;
    else if (path === "/privacy-policy" || path === "/terms-conditions") {
      priority = 0.3;
      changefreq = "yearly";
    }
    return { loc: path, changefreq, priority, lastmod: new Date().toISOString() };
  },
  exclude: ["/admin", "/admin/*"],
  robotsTxtOptions: {
    policies: [
      // Default: allow all, block sensitive paths
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/admin/"] },
      // Explicitly welcome major AI agent crawlers — needed for AI-search
      // visibility (some bots default to NOT crawling unless allowed by name).
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "DuckAssistBot", allow: "/" },
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "YouBot", allow: "/" },
    ],
  },
};
