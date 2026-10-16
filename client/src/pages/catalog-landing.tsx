import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { ChevronRight } from "lucide-react";
import type { ProductWithImages } from "@shared/schema";
import { slugifyProductPart } from "@shared/product-seo";
import { optimizedProductImageUrl } from "@/lib/product-utils";
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
  const heroProduct = products.find((product) => product.images?.[0]?.imageUrl || product.imageUrl);
  const heroImage = heroProduct?.images?.[0]?.imageUrl ?? heroProduct?.imageUrl;

  return <div className="min-h-screen bg-[#f6f6f4] text-foreground">
    <SEO title={title} description={`${label} için yayındaki endüstriyel yedek parçalar.`} canonical={canonical} />
    <StoreHeader />
    <section className="relative isolate overflow-hidden border-b border-slate-200 bg-[#f1f2f0]">
      {heroImage && <img src={optimizedProductImageUrl(heroImage, 1100)} alt="" aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[58%] object-cover opacity-20 mix-blend-multiply [mask-image:linear-gradient(to_right,transparent,black_42%)]" />}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#f1f2f0_0%,rgba(241,242,240,.94)_42%,rgba(241,242,240,.14)_100%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <nav aria-label="İçerik yolu" className="mb-5 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/magaza" className="transition-colors hover:text-slate-900">Yedek Parça Kataloğu</Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="font-semibold text-slate-800">{label}</span>
        </nav>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Burem Elektronik · {isBrand ? "Marka" : "Kategori"}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-[38px]">{isBrand ? `${label} Yedek Parçaları` : `${label} Yedek Parçalar`}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          {isLoading ? "Ürünler yükleniyor…" : `${products.length} yayınlanmış ürün`}
        </p>
      </div>
    </section>
    <main className="mx-auto max-w-7xl px-4 py-7 md:px-6">
      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"><div className="aspect-[.9] animate-pulse rounded-xl bg-white" /><div className="aspect-[.9] animate-pulse rounded-xl bg-white" /></div> : products.length ?
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => <StoreProductCard key={product.id} product={product} />)}
        </div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-muted-foreground">Bu sayfada şu anda yayında ürün bulunmuyor.</p>}
    </main>
    <BuremFooter />
  </div>;
}
