import 'server-only';

export const siteUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
).replace(/\/$/, '');

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Server-side fetch against the public gateway endpoints.
 * Cached via Next.js data cache (revalidate) so crawlers always see HTML.
 */
async function fetchEnvelope<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/client${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export interface SeoProduct {
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
  subDescription?: string;
  images?: unknown;
  price?: number;
  newPrice?: number;
  discount?: number;
  stock?: number;
  avgRating?: number;
  totalRatings?: number;
  brand?: { name?: string; slug?: string } | null;
  category?: { name?: string; slug?: string } | null;
  defaultVariant?: { price?: number; discount?: number; images?: string[] } | null;
}

export const fetchProductBySlug = (slug: string) =>
  fetchEnvelope<SeoProduct>(`/product/slug/${encodeURIComponent(slug)}`, 300);

export interface SeoTaxonomy {
  _id?: string;
  name?: string;
  slug?: string;
  description?: string;
}

export const fetchCategoryBySlug = (slug: string) =>
  fetchEnvelope<SeoTaxonomy>(`/category/slug/${encodeURIComponent(slug)}`, 600);

export const fetchBrandBySlug = (slug: string) =>
  fetchEnvelope<SeoTaxonomy>(`/brand/slug/${encodeURIComponent(slug)}`, 600);

interface Paginated<T> {
  data?: T[];
  pagination?: { totalItems?: number; totalPages?: number };
}

/** Paged listing used by sitemap.ts (bounded to avoid runaway crawls). */
async function fetchPaged<T>(
  path: string,
  maxPages = 10,
  limit = 100,
): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const chunk = await fetchEnvelope<Paginated<T> | T[]>(
      `${path}${path.includes('?') ? '&' : '?'}page=${page}&limit=${limit}`,
      3600,
    );
    if (!chunk) break;
    const items = Array.isArray(chunk) ? chunk : chunk.data ?? [];
    if (!Array.isArray(items) || items.length === 0) break;
    out.push(...items);
    if (items.length < limit) break;
  }
  return out;
}

export const fetchSitemapProducts = () =>
  fetchPaged<{ slug?: string; updatedAt?: string }>('/product');
export const fetchSitemapCategories = () =>
  fetchPaged<SeoTaxonomy>('/category', 2);
export const fetchSitemapBrands = () => fetchPaged<SeoTaxonomy>('/brand', 2);

function pickPrice(p: SeoProduct): number {
  return Number(
    p.defaultVariant?.price ?? p.newPrice ?? p.price ?? 0,
  );
}

function pickImage(p: SeoProduct): string | undefined {
  if (p.defaultVariant?.images?.[0]) return p.defaultVariant.images[0];
  if (typeof p.images === 'string') return p.images;
  if (Array.isArray(p.images)) {
    const first = p.images.find((i) => typeof i === 'string' && i);
    if (first) return first as string;
    const nested = p.images[0] as { url?: string } | undefined;
    if (nested?.url) return nested.url;
  }
  return '/logo.jpg';
}

function stripHtml(input?: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildProductJsonLd(p: SeoProduct, slug: string) {
  if (!p?._id && !p?.name) return null;
  const price = pickPrice(p);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description:
      stripHtml(p.subDescription || p.description).slice(0, 300) ||
      `Mua ${p.name} chính hãng giá tốt tại PC Store`,
    sku: p._id,
    image: [pickImage(p)],
    brand: p.brand?.name ? { '@type': 'Brand', name: p.brand.name } : undefined,
    category: p.category?.name,
    aggregateRating:
      p.totalRatings && p.totalRatings > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: p.avgRating || 0,
            reviewCount: p.totalRatings,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/product/${slug}`,
      priceCurrency: 'VND',
      price,
      availability:
        (p.stock ?? 1) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path?: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path ? `${siteUrl}${item.path}` : undefined,
    })),
  };
}
