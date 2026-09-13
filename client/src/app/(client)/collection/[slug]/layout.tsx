import type { Metadata } from 'next';
import { fetchCategoryBySlug, buildBreadcrumbJsonLd } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);

  if (!category?.name) {
    return { title: 'Danh mục không tồn tại | PC Store', robots: { index: false } };
  }

  const description =
    `Mua ${category.name} chính hãng với giá tốt nhất tại PC Store. ` +
    `Đa dạng sản phẩm, bảo hành uy tín, giao hàng nhanh, hỗ trợ trả góp 0%.`;

  return {
    title: `${category.name} - PC Store | Mua ${category.name} chính hãng giá tốt`,
    description: (category.description && category.description.slice(0, 160)) || description,
    alternates: { canonical: `/collection/${slug}` },
    openGraph: {
      title: `${category.name} chính hãng | PC Store`,
      description,
      type: 'website',
      locale: 'vi_VN',
    },
  };
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await fetchCategoryBySlug(slug);

  const breadcrumb = category?.name
    ? buildBreadcrumbJsonLd([{ name: category.name, path: `/collection/${slug}` }])
    : null;

  return (
    <>
      {breadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c'),
          }}
        />
      )}
      {children}
    </>
  );
}
