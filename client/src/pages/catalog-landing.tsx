import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import type { ProductWithImages } from "@shared/schema";
import { slugifyProductPart } from "@shared/product-seo";
import StoreHeader from "@/components/store-header";
import BuremFooter from "@/components/ui/footer";
import StoreProductCard from "@/components/store-product-card";
import { SEO } from "@/components/seo";

export default function CatalogLandingPage() {
  const [brandRoute, brandParams] = useRoute("/magaza/marka/:slug");
  const [, categoryParams] = useRoute("/magaza/kategori/:slug");
  const isBrand = Boolean(brandRoute);
  const slug = brandParams?.slug ?? categoryParams?.slug ?? "";
  const { data = [], isLoading } = useQuery<ProductWithImages[]>({ queryKey: ["/api/products"] });
  const products = useMemo(() => data.filter((p) => slugifyProductPart(isBrand ? p.brand : p.category) === slug),
    [data, isBrand, slug]);
  const label = products[0] ? (isBrand ? products[0].brand : products[0].category) : slug;
  const title = isBrand ? `${label} Yedek Parçaları | Burem Elektronik` : `${label} Yedek Parçalar | Burem Elektronik`;
  const canonical = `/magaza/${isBrand ? "marka" : "kategori"}/${encodeURIComponent(slug)}`;

  return <div className="min-h-screen bg-background text-foreground">
    <SEO title={title} description={`${label} için yayındaki endüstriyel yedek parçalar.`} canonical={canonical} />
    <StoreHeader />
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <nav aria-label="İçerik yolu" className="mb-6 text-sm text-muted-foreground">
        <Link href="/magaza">Yedek Parça Kataloğu</Link><span aria-hidden="true"> / </span><span>{label}</span>
      </nav>
      <h1 className="text-3xl font-bold">{isBrand ? `${label} Yedek Parçaları` : `${label} Yedek Parçalar`}</h1>
      {isLoading ? <p role="status">Ürünler yükleniyor…</p> : products.length ?
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => <StoreProductCard key={product.id} product={product} />)}
        </div> : <p className="py-12">Bu sayfada şu anda yayında ürün bulunmuyor.</p>}
    </main>
    <BuremFooter />
  </div>;
}
