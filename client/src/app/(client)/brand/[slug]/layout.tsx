import type { Metadata } from 'next';
import { fetchBrandBySlug } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);

  if (!brand?.name) {
    return { title: 'Thương hiệu không tồn tại | PC Store', robots: { index: false } };
  }

  const description = `Khám phá sản phẩm ${brand.name} chính hãng tại PC Store. Giá tốt, bảo hành uy tín, giao hàng nhanh toàn quốc.`;

  return {
    title: `${brand.name} - PC Store | Sản phẩm ${brand.name} chính hãng`,
    description: (brand.description && brand.description.slice(0, 160)) || description,
    alternates: { canonical: `/brand/${slug}` },
    openGraph: {
      title: `${brand.name} chính hãng | PC Store`,
      description,
      type: 'website',
      locale: 'vi_VN',
    },
  };
}
