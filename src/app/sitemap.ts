import { MetadataRoute } from "next";

/**
 * Dynamic XML sitemap for Geethub.
 * Includes all primary public routes with priority weighting.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://geethub.dev";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/play-along`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/commit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];
}
