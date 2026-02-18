import fs from "node:fs";
import { GUIDE_POSTS } from "../src/utils/guideData.js";

const SITE_URL = "https://nohuguide.com";
const LASTMOD = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/national", changefreq: "weekly", priority: "0.9" },
  { path: "/basic", changefreq: "weekly", priority: "0.9" },
  { path: "/target", changefreq: "weekly", priority: "0.9" },
  { path: "/guide", changefreq: "daily", priority: "0.9" },
  { path: "/privacy", changefreq: "monthly", priority: "0.6" },
  { path: "/terms", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

const guideRoutes = GUIDE_POSTS.map((post) => ({
  path: `/guide/${post.id}`,
  changefreq: "monthly",
  priority: "0.8",
}));

const urls = [...staticRoutes, ...guideRoutes]
  .map(
    ({ path, changefreq, priority }) => `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync("public/sitemap.xml", xml, "utf8");
console.log(`Generated sitemap with ${staticRoutes.length + guideRoutes.length} URLs.`);
