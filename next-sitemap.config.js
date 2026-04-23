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
      path === "/schedule"
    ) {
      priority = 0.9;
    } else if (path.startsWith("/about-us")) priority = 0.8;
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
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/admin/"] },
    ],
  },
};
