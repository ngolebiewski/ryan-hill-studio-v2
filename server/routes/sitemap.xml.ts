type Series = {
  slug: string;
  updatedAt?: string;
};

type Artwork = {
  slug: string;
  updatedAt?: string;
};

export const routeRules = {
  "/sitemap.xml": {
    cache: {
      maxAge: 60 * 60 * 24 * 7, // 7 days cache (good for portfolio sites)
    },
  },
};

export default defineEventHandler(async () => {
  const baseUrl = "https://ryanhill.studio";

  const [artworks, series] = await Promise.all([
    $fetch<Artwork[]>("/api/artworks").catch(() => []),
    $fetch<Series[]>("/api/series").catch(() => []),
  ]);

  const staticPages = [
    {
      url: "/",
      priority: "1.0",
      lastmod: new Date().toISOString(),
    },
    {
      url: "/about",
      priority: "1.0",
      lastmod: new Date().toISOString(),
    },
    {
      url: "/cv",
      priority: "1.0",
      lastmod: new Date().toISOString(),
    },
    {
      url: "/contact",
      priority: "1.0",
      lastmod: new Date().toISOString(),
    },
  ];

  const seriesPages = series.map((s) => ({
    url: `/series/${s.slug}`,
    priority: "0.7",
    lastmod: s.updatedAt || new Date().toISOString(),
  }));

  const artworkPages = artworks.map((a) => ({
    url: `/artwork/${a.slug}`,
    priority: "0.5",
    lastmod: a.updatedAt || new Date().toISOString(),
  }));

  const allPages = [...staticPages, ...seriesPages, ...artworkPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("")}
</urlset>`;

  return xml;
});