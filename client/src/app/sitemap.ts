import type { MetadataRoute } from 'next';
import {
  siteUrl,
  fetchSitemapProducts,
  fetchSitemapCategories,
  fetchSitemapBrands,
} from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/home`, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/search`, changeFrequency: 'daily', priority: 0.5 },
  ];

  const [products, categories, brands] = await Promise.all([
    fetchSitemapProducts().catch(() => []),
    fetchSitemapCategories().catch(() => []),
    fetchSitemapBrands().catch(() => []),
  ]);

  return [
    ...staticRoutes,
    ...(categories || [])
      .filter((c) => c?.slug)
      .map((c) => ({
        url: `${siteUrl}/collection/${c.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
    ...(brands || [])
      .filter((b) => b?.slug)
      .map((b) => ({
        url: `${siteUrl}/brand/${b.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ...(products || [])
      .filter((p) => p?.slug)
      .map((p) => ({
        url: `${siteUrl}/product/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })),
  ];
}
