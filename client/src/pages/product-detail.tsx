import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { Product } from "@shared/schema";
import BuremFooter from "@/components/ui/footer";
import StoreHeader from "@/components/store-header";
import StoreProductCard from "@/components/store-product-card";
import { SEO } from "@/components/seo";
import { PHONE_NUMBER } from "@/lib/site-contact";
import {
  absoluteUrl,
  conditionLabel,
  productAbsoluteUrl,
  productPath,
  productWhatsAppLink,
} from "@/lib/product-utils";

function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = useMemo<Record<string, unknown>>(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      ...(product.description ? { description: product.description } : {}),
      ...(product.imageUrl ? { image: [absoluteUrl(product.imageUrl)] } : {}),
      ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
      ...(product.category ? { category: product.category } : {}),
      ...(product.partNumber ? { sku: product.partNumber, productID: product.partNumber } : {}),
    }),
    [product],
  );

  return (
    <SEO
      title={`${product.name} | Burem Elektronik`}
      description={
        product.description ??
        `${product.brand} ${product.category} yedek parçası${product.partNumber ? ` — ${product.partNumber}` : ""}.`
      }
      canonical={productPath(product)}
      ogTitle={`${product.name} | Burem Elektronik`}
      ogDescription={product.description ?? `${product.brand} yedek parçası`}
      ogType="product"
      ogImage={product.imageUrl ?? undefined}
      ogImageAlt={product.name}
      jsonLd={jsonLd}
    />
  );
}

function DetailSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="aspect-[4/3] rounded-[28px] bg-muted" />
          <div className="space-y-4">
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-12 w-4/5 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
          </div>
        </div>
      </div>
    </main>
  );
}

function NotFoundProduct() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center md:px-6">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-muted-foreground/50">
        <Package className="h-10 w-10" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Mağaza / 404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Ürün bulunamadı</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Bu ürün kaldırılmış veya bağlantı artık geçerli değil. Katalogdan başka bir parça arayabilirsiniz.
      </p>
      <Link
        href="/magaza"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background"
      >
        <ArrowLeft className="h-4 w-4" />
        Mağazaya dön
      </Link>
    </main>
  );
}

function ProductInfo({ product }: { product: Product }) {
  const condition = conditionLabel(product.condition);

  return (
    <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft md:p-8">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
        <span>{product.brand}</span>
        <span className="h-1 w-1 rounded-full bg-primary/40" />
        <span className="text-muted-foreground">{product.category}</span>
      </div>

      <h1
        className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl"
        style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
      >
        {product.name}
      </h1>

      <div className="mt-5 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
            product.inStock
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {product.inStock ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {product.inStock ? "Stokta" : "Stok Dışı"}
        </span>
        {condition && (
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
            {condition}
          </span>
        )}
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
        <div className="bg-background p-4">
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Marka</dt>
          <dd className="mt-1 text-sm font-bold text-foreground">{product.brand}</dd>
        </div>
        <div className="bg-background p-4">
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Kategori</dt>
          <dd className="mt-1 text-sm font-bold text-foreground">{product.category}</dd>
        </div>
        <div className="col-span-2 bg-background p-4">
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Parça / model numarası</dt>
          <dd className="mt-1 break-all font-mono text-sm font-bold text-foreground">
            {product.partNumber || "Belirtilmemiş"}
          </dd>
        </div>
      </dl>

      {product.description && (
        <div className="mt-7 border-t border-border pt-6">
          <h2 className="text-sm font-bold">Ürün açıklaması</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>
      )}

      <div className="mt-7 space-y-3">
        <a
          href={productWhatsAppLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#20ba5a]"
          data-testid={`button-detail-wa-${product.id}`}
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp’tan Fiyat Sor
        </a>
        <a
          href={`tel:${PHONE_NUMBER}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-5 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Phone className="h-4 w-4" />
          Telefonla ara
        </a>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Uyumluluk veya stok durumu için satın almadan önce model numaranızı WhatsApp üzerinden ekibimize iletebilirsiniz.
        </p>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/magaza/urun/:id/:seoSlug");
  const productId = params?.id;

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: [`/api/products/${productId ?? ""}`],
    enabled: Boolean(productId),
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: Boolean(product),
  });

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(
        (item) =>
          item.id !== product.id &&
          (item.brand === product.brand || item.category === product.category),
      )
      .slice(0, 4);
  }, [allProducts, product]);

  return (
    <>
      {product ? (
        <ProductJsonLd product={product} />
      ) : (
        <SEO
          title="Ürün detayı | Burem Elektronik"
          description="Burem Elektronik yedek parça ürün detayları."
          canonical="/magaza"
        />
      )}

      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader />
        {isLoading ? (
          <DetailSkeleton />
        ) : isError || !product ? (
          <NotFoundProduct />
        ) : (
          <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
            <Link
              href="/magaza"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              data-testid="link-back-to-store"
            >
              <ArrowLeft className="h-4 w-4" />
              Mağazaya dön
            </Link>

            <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative overflow-hidden rounded-[28px] border border-border bg-muted shadow-soft">
                <div className="aspect-[4/3]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      data-testid={`img-product-detail-${product.id}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/40">
                      <Package className="h-20 w-20" />
                    </div>
                  )}
                </div>
              </div>
              <ProductInfo product={product} />
            </div>

            {similarProducts.length > 0 && (
              <section className="mt-16 border-t border-border pt-10" data-testid="section-similar-products">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Size uygun olabilir</p>
                  <h2
                    className="mt-2 text-2xl font-bold tracking-tight"
                    style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}
                  >
                    Benzer ürünler
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {similarProducts.map((item) => (
                    <StoreProductCard key={item.id} product={item} />
                  ))}
                </div>
              </section>
            )}

            <p className="mt-10 text-center text-xs text-muted-foreground">
              Ürün bağlantısı: {productAbsoluteUrl(product)}
            </p>
          </main>
        )}
        <BuremFooter />
      </div>
    </>
  );
}