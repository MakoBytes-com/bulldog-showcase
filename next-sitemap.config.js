/**
 * Showcase fork — disallow everything. This is a frozen portfolio
 * snapshot, not the real site. Crawlers should not index it and the
 * sitemap should be empty so no URLs leak into search.
 */
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://bulldog-showcase.vercel.app",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ["/*"],
  robotsTxtOptions: {
    policies: [{ userAgent: "*", disallow: "/" }],
  },
};
