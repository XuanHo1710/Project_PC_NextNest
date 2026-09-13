import type { Metadata } from 'next';
import { fetchProductBySlug, buildProductJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product?.name) {
    return { title: 'Sản phẩm không tồn tại | PC Store', robots: { index: false } };
  }

  const price = Number(product.defaultVariant?.price ?? product.newPrice ?? product.price ?? 0);
  const description =
    `Mua ${product.name} chính hãng giá ${price.toLocaleString('vi-VN')}đ. ` +
    `${(product.subDescription || product.description || 'Bảo hành chính hãng, giao hàng nhanh toàn quốc.').replace(/<[^>]*>/g, ' ').slice(0, 150)}`;

  return {
    title: `${product.name} - Giá ${price.toLocaleString('vi-VN')}đ | PC Store`,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: `${product.name} - ${price.toLocaleString('vi-VN')}đ`,
      description,
      type: 'website',
      locale: 'vi_VN',
    },
  };
}

export default async function ProductLayout({
  children,
  params,
}: Props & { children: React.ReactNode }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  const jsonLds = [
    buildProductJsonLd(product ?? {}, slug),
    buildBreadcrumbJsonLd([
      ...(product?.category?.name
        ? [{ name: product.category.name, path: `/collection/${product.category.slug}` }]
        : []),
      { name: product?.name || slug, path: `/product/${slug}` },
    ]),
  ].filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLds).replace(/</g, '\\u003c'),
        }}
      />
      {children}
    </>
  );
}
