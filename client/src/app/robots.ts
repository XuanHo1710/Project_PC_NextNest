import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/auth',
          '/profile',
          '/cart',
          '/payment',
          '/checkout',
          '/order-success',
          '/chat',
          '/api/',
          '/test-order',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
