import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InsertProduct, Product, ProductImage, ProductWithImages } from "@shared/schema";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Link } from "wouter";
import { adminRequest, ensureAdminCsrfToken } from "@/lib/admin-auth";
import { SEO } from "@/components/seo";
import { formatProductPrice } from "@/lib/product-utils";

const CATEGORIES = ["İnverter", "Servo Sürücü", "PLC", "HMI", "Elektronik Kart", "Motor", "Sensör", "Diğer"];
const BRANDS = ["Siemens", "ABB", "Fanuc", "Yaskawa", "Mitsubishi", "Lenze", "Schneider", "Danfoss", "Omron", "SEW-Eurodrive", "Bosch Rexroth", "Beckhoff", "Allen Bradley", "Panasonic", "Diğer"];
const CONDITIONS = [
  { value: "new", label: "Sıfır" },
  { value: "refurbished", label: "Yenilenmiş" },
  { value: "used", label: "İkinci El" },
];
const MAX_IMAGES = 8;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const EMPTY: InsertProduct = {
  name: "",
  brand: "Siemens",
  category: "İnverter",
  description: "",
  imageUrl: "",
  partNumber: "",
  price: null,
  currency: "TRY",
  condition: "new",
  inStock: true,
};

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
};

type UploadProgress = (progress: number) => void;

const apiReq = adminRequest;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Görsel okunamadı"));
    reader.readAsDataURL(file);
  });
}

function uploadProductImage(productId: string, file: File, onProgress: UploadProgress) {
  return new Promise<ProductImage>(async (resolve, reject) => {
    try {
      onProgress(8);
      const dataUrl = await readFileAsDataUrl(file);
      onProgress(20);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/admin/products/${encodeURIComponent(productId)}/images`);
      xhr.withCredentials = true;
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("X-CSRF-Token", await ensureAdminCsrfToken());
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.max(20, Math.round((event.loaded / event.total) * 100)));
        } else {
          onProgress(65);
        }
      };
      xhr.onerror = () => reject(new Error("Görsel yüklenemedi"));
      xhr.onload = () => {
        const payload = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress(100);
          resolve(payload as ProductImage);
        } else {
          reject(new Error(payload.error ?? "Görsel yüklenemedi"));
        }
      };
      xhr.send(JSON.stringify({ dataUrl }));
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Görsel yüklenemedi"));
    }
  });
}

function validateImageFile(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) {
    return "Sadece PNG, JPEG, WebP veya GIF yükleyebilirsiniz.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Her görsel 6 MB'dan küçük olmalıdır.";
  }
  return null;
}

function normalizePriceInput(value: InsertProduct["price"]) {
  const input = String(value ?? "").trim();
  if (!input) return null;

  const commaIndex = input.lastIndexOf(",");
  const dotIndex = input.lastIndexOf(".");
  let normalized = input;

  if (commaIndex >= 0 && dotIndex >= 0) {
    const decimalSeparator = commaIndex > dotIndex ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? /\./g : /,/g;
    normalized = input.replace(thousandsSeparator, "").replace(decimalSeparator, ".");
  } else if (commaIndex >= 0) {
    const fraction = input.slice(commaIndex + 1);
    normalized = fraction.length <= 2
      ? `${input.slice(0, commaIndex).replace(/,/g, "")}.${fraction}`
      : input.replace(/,/g, "");
  } else if (dotIndex >= 0) {
    const fraction = input.slice(dotIndex + 1);
    normalized = fraction.length <= 2
      ? input
      : input.replace(/\./g, "");
  }

  if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Fiyatı en fazla iki ondalık basamakla girin. Örnek: 12.500,50");
  }

  return Number(normalized).toFixed(2);
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputCls = "w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiReq("POST", "/api/admin/login", { username, password, totp: totp || undefined });
      onSuccess();
    } catch (error) {
      setError(error instanceof Error && error.message === "__UNAUTHORIZED__"
        ? "Giriş bilgileri hatalı"
        : error instanceof Error ? error.message : "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SEO
        title="Yönetici Girişi | Burem Elektronik"
        description="Burem Elektronik yönetici paneli."
        canonical="/admin"
        robots="noindex,nofollow,noarchive"
      />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Burem Elektronik" className="mx-auto mb-4 h-12 w-auto" />
          <h1 className="text-xl font-bold">Ürün Yönetimi Girişi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Yönetici bilgilerinizle giriş yapın</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Kullanıcı adı" className={inputCls} data-testid="input-admin-user" />
          <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Şifre" className={inputCls} data-testid="input-admin-pass" />
          <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={totp} onChange={(event) => setTotp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="2FA kodu (varsa)" className={inputCls} data-testid="input-admin-totp" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background transition-colors hover:bg-foreground/80 disabled:opacity-60" data-testid="button-login">
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProductForm({
  initial,
  product,
  onSave,
  onCancel,
  loading,
  onNotify,
}: {
  initial: InsertProduct;
  product?: ProductWithImages;
  onSave: (data: InsertProduct, pending: PendingImage[], onProgress: (id: string, progress: number) => void) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  onNotify: (message: string) => void;
}) {
  const [form, setForm] = useState<InsertProduct>(initial);
  const [images, setImages] = useState<ProductImage[]>(() => product?.images ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; name: string; progress: number }[]>([]);
  const [legacyVisible, setLegacyVisible] = useState(Boolean(initial.imageUrl) && !product?.images?.length);
  const [legacyRemoved, setLegacyRemoved] = useState(false);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyImageId, setBusyImageId] = useState<string | null>(null);
  const pendingUrls = useRef(new Set<string>());

  const set = (key: keyof InsertProduct, value: unknown) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const inputCls = "w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20";
  const labelCls = "mb-1 block text-xs font-medium text-muted-foreground";
  const visibleLegacy = legacyVisible && !legacyRemoved;
  const imageCount = images.length + pendingImages.length + (visibleLegacy ? 1 : 0);
  const productImageAlt = (index?: number) => {
    const base = form.partNumber ? `${form.name} — Parça no ${form.partNumber}` : form.name || "Ürün görseli";
    return index === undefined ? base : `${base} — ${index + 1}. görsel`;
  };

  useEffect(() => {
    pendingImages.forEach((image) => pendingUrls.current.add(image.previewUrl));
  }, [pendingImages]);

  useEffect(() => {
    return () => {
      pendingUrls.current.forEach((url) => URL.revokeObjectURL(url));
      pendingUrls.current.clear();
    };
  }, []);

  async function uploadForExistingProduct(file: File) {
    if (!product?.id) return;
    const uploadId = `${file.name}-${file.lastModified}-${Math.random()}`;
    setUploadingFiles((current) => [...current, { id: uploadId, name: file.name, progress: 0 }]);
    setImageError("");
    try {
      const uploaded = await uploadProductImage(product.id, file, (progress) => {
        setUploadingFiles((current) => current.map((item) => item.id === uploadId ? { ...item, progress } : item));
      });
      setImages((current) => [...current, uploaded]);
      if (uploaded.isPrimary) {
        set("imageUrl", uploaded.imageUrl);
        setLegacyVisible(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Görsel yüklenemedi";
      setImageError(message);
      onNotify(`Hata: ${message}`);
    } finally {
      setUploadingFiles((current) => current.filter((item) => item.id !== uploadId));
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    const available = MAX_IMAGES - imageCount - uploadingFiles.length;
    if (available <= 0) {
      const message = `Bir üründe en fazla ${MAX_IMAGES} görsel olabilir.`;
      setImageError(message);
      onNotify(`Hata: ${message}`);
      return;
    }

    const accepted: File[] = [];
    for (const file of selectedFiles.slice(0, available)) {
      const validationError = validateImageFile(file);
      if (validationError) {
        setImageError(`${file.name}: ${validationError}`);
        onNotify(`Hata: ${file.name}: ${validationError}`);
        continue;
      }
      accepted.push(file);
    }

    if (selectedFiles.length > available) {
      const message = `En fazla ${MAX_IMAGES} görsel eklenebilir; fazla dosyalar alınmadı.`;
      setImageError(message);
      onNotify(`Hata: ${message}`);
    }

    if (product?.id) {
      for (const file of accepted) {
        await uploadForExistingProduct(file);
      }
      return;
    }

    setPendingImages((current) => [
      ...current,
      ...accepted.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
      })),
    ]);
    setImageError("");
  }

  function removePending(id: string) {
    setPendingImages((current) => {
      const image = current.find((item) => item.id === id);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        pendingUrls.current.delete(image.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function movePending(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pendingImages.length) return;
    setPendingImages((current) => {
      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered;
    });
  }

  async function makePrimary(image: ProductImage) {
    if (!product?.id || image.isPrimary) return;
    setBusyImageId(image.id);
    try {
      const updated = await apiReq(
        "PUT",
        `/api/admin/products/${encodeURIComponent(product.id)}/images/${encodeURIComponent(image.id)}/primary`,
      ) as ProductImage;
      setImages((current) => current.map((item) => ({ ...item, isPrimary: item.id === updated.id })));
      set("imageUrl", updated.imageUrl);
      setLegacyVisible(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kapak görseli değiştirilemedi";
      setImageError(message);
      onNotify(`Hata: ${message}`);
    } finally {
      setBusyImageId(null);
    }
  }

  async function deleteImage(image: ProductImage) {
    if (!product?.id) return;
    setBusyImageId(image.id);
    try {
      await apiReq(
        "DELETE",
        `/api/admin/products/${encodeURIComponent(product.id)}/images/${encodeURIComponent(image.id)}`,
      );
      const remaining = images.filter((item) => item.id !== image.id);
      if (image.isPrimary && remaining.length > 0) {
        setImages(remaining.map((item, index) => ({ ...item, isPrimary: index === 0 })));
        set("imageUrl", remaining[0].imageUrl);
      } else {
        setImages(remaining);
        if (image.isPrimary) set("imageUrl", "");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Görsel silinemedi";
      setImageError(message);
      onNotify(`Hata: ${message}`);
    } finally {
      setBusyImageId(null);
    }
  }

  async function moveImage(index: number, direction: -1 | 1) {
    if (!product?.id) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const previous = images;
    const reordered = [...images];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setImages(reordered);
    try {
      await apiReq(
        "PUT",
        `/api/admin/products/${encodeURIComponent(product.id)}/images/reorder`,
        { imageIds: reordered.map((image) => image.id) },
      );
    } catch (error) {
      setImages(previous);
      const message = error instanceof Error ? error.message : "Görsel sıralanamadı";
      setImageError(message);
      onNotify(`Hata: ${message}`);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (uploadingFiles.length > 0) {
      const message = "Devam etmeden önce görsel yüklemelerinin tamamlanmasını bekleyin.";
      setImageError(message);
      onNotify(`Hata: ${message}`);
      return;
    }

    setSaving(true);
    try {
      await onSave(form, pendingImages, (id, progress) => {
        setPendingImages((current) => current.map((image) => image.id === id ? { ...image, progress } : image));
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ürün kaydedilemedi";
      setImageError(message);
      onNotify(`Hata: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-product">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Ürün Adı *</label>
          <input required value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="Ör: SINAMICS G120 Kontrol Kartı" className={inputCls} data-testid="input-product-name" />
        </div>
        <div>
          <label className={labelCls}>Marka *</label>
          <select value={form.brand} onChange={(event) => set("brand", event.target.value)} className={inputCls} data-testid="select-brand">
            {BRANDS.map((brand) => <option key={brand}>{brand}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Kategori *</label>
          <select value={form.category} onChange={(event) => set("category", event.target.value)} className={inputCls} data-testid="select-category">
            {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Parça No (P/N)</label>
          <input value={form.partNumber ?? ""} onChange={(event) => set("partNumber", event.target.value)} placeholder="Ör: 6SL3210-1KE21-3AF1" className={inputCls} data-testid="input-part-number" />
        </div>
        <div>
          <label className={labelCls}>Fiyat ve döviz birimi</label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={form.price ?? ""}
              onChange={(event) => set("price", event.target.value)}
              placeholder="Ör: 12.500,50"
              className={`${inputCls} min-w-0 flex-1`}
              data-testid="input-product-price"
            />
            <select
              value={form.currency ?? "TRY"}
              onChange={(event) => set("currency", event.target.value)}
              className={`${inputCls} w-[8.5rem] shrink-0`}
              aria-label="Fiyat döviz birimi"
              data-testid="select-product-currency"
            >
              <option value="TRY">₺ Türk Lirası</option>
              <option value="USD">$ Amerikan Doları</option>
            </select>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">İsteğe bağlı · iki ondalık basamağa kadar</p>
        </div>
        <div>
          <label className={labelCls}>Durum</label>
          <select value={form.condition ?? "new"} onChange={(event) => set("condition", event.target.value)} className={inputCls} data-testid="select-condition">
            {CONDITIONS.map((condition) => <option key={condition.value} value={condition.value}>{condition.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Açıklama</label>
          <textarea value={form.description ?? ""} onChange={(event) => set("description", event.target.value)} rows={3} placeholder="Kısa ürün açıklaması…" className={`${inputCls} resize-none`} data-testid="input-description" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Kapak görseli URL’si (geriye dönük uyumluluk)</label>
          <input
            value={form.imageUrl ?? ""}
            onChange={(event) => {
              set("imageUrl", event.target.value);
              if (event.target.value.trim()) {
                setLegacyRemoved(false);
                setLegacyVisible(true);
              }
            }}
            placeholder="https://res.cloudinary.com/…"
            className={inputCls}
            data-testid="input-image-url"
          />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-muted/20 p-4" aria-label="Ürün görselleri">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold">Ürün görselleri</h3>
            <p className="mt-1 text-xs text-muted-foreground">Kapak görseli kartlarda kullanılır. Görselleri kaydırmadan yukarı/aşağı butonlarıyla sıralayabilirsiniz.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${imageCount >= MAX_IMAGES ? "bg-amber-100 text-amber-700" : "bg-background text-muted-foreground"}`}>
            {imageCount}/{MAX_IMAGES} görsel
          </span>
        </div>

        <label className={`mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-bold transition-colors ${
          imageCount >= MAX_IMAGES || uploadingFiles.length > 0
            ? "cursor-not-allowed border-border text-muted-foreground/50"
            : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
        }`}>
          {uploadingFiles.length > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploadingFiles.length > 0 ? "Görseller yükleniyor…" : "Birden fazla görsel seç"}
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleImageUpload}
            disabled={imageCount >= MAX_IMAGES || uploadingFiles.length > 0}
            className="sr-only"
            data-testid="input-image-files"
          />
        </label>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">PNG, JPEG, WebP veya GIF · görsel başına maksimum 6 MB</p>

        {imageError && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600" role="alert">{imageError}</p>}

        {uploadingFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadingFiles.map((file) => (
              <div key={file.id} className="rounded-lg bg-background px-3 py-2">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="truncate">{file.name}</span>
                  <span className="font-bold text-primary">{file.progress}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${file.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {(visibleLegacy || images.length > 0 || pendingImages.length > 0) && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {visibleLegacy && (
              <div className="relative overflow-hidden rounded-xl border-2 border-primary bg-background p-2">
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  {form.imageUrl ? <img src={form.imageUrl} alt={productImageAlt()} className="h-full w-full object-contain" /> : <Package className="m-auto h-full w-8 text-muted-foreground/40" />}
                </div>
                <span className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary"><Star className="h-3 w-3 fill-current" /> Kapak görseli</span>
                <button
                  type="button"
                  onClick={() => {
                    setLegacyRemoved(true);
                    set("imageUrl", "");
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" /> Kaldır
                </button>
              </div>
            )}

            {images.map((image, index) => (
              <div key={image.id} className={`relative overflow-hidden rounded-xl border-2 bg-background p-2 ${image.isPrimary ? "border-primary" : "border-transparent"}`}>
                <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                  <img src={image.imageUrl} alt={productImageAlt(index)} className="h-full w-full object-contain" />
                </div>
                {image.isPrimary ? (
                  <span className="mt-2 flex items-center gap-1 text-[10px] font-bold text-primary"><Star className="h-3 w-3 fill-current" /> Kapak görseli</span>
                ) : (
                  <button type="button" onClick={() => makePrimary(image)} disabled={busyImageId === image.id} className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
                    {busyImageId === image.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Star className="h-3 w-3" />} Kapak yap
                  </button>
                )}
                <div className="mt-2 flex gap-1">
                  <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0 || busyImageId === image.id} className="flex flex-1 items-center justify-center rounded-lg border border-border py-1 text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label={`${index + 1}. görseli yukarı taşı`}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1 || busyImageId === image.id} className="flex flex-1 items-center justify-center rounded-lg border border-border py-1 text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label={`${index + 1}. görseli aşağı taşı`}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => deleteImage(image)} disabled={busyImageId === image.id} className="flex flex-1 items-center justify-center rounded-lg border border-border py-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30" aria-label={`${index + 1}. görseli sil`}>
                    {busyImageId === image.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            ))}

            {pendingImages.map((image, index) => (
              <div key={image.id} className="relative overflow-hidden rounded-xl border-2 border-dashed border-primary/40 bg-background p-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <img src={image.previewUrl} alt={productImageAlt(images.length + index)} className="h-full w-full object-contain" />
                  <div className="absolute inset-x-2 bottom-2 h-1.5 overflow-hidden rounded-full bg-white/70">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${image.progress}%` }} />
                  </div>
                </div>
                <span className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${index === 0 && !visibleLegacy ? "text-primary" : "text-muted-foreground"}`}>
                  {index === 0 && !visibleLegacy && <><Star className="h-3 w-3 fill-current" /> Kapak adayı</>}
                  <span className="truncate">{image.file.name}</span>
                </span>
                <div className="mt-2 flex gap-1">
                  <button type="button" onClick={() => movePending(index, -1)} disabled={index === 0} className="flex flex-1 items-center justify-center rounded-lg border border-border py-1 text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label={`${index + 1}. bekleyen görseli yukarı taşı`}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => movePending(index, 1)} disabled={index === pendingImages.length - 1} className="flex flex-1 items-center justify-center rounded-lg border border-border py-1 text-muted-foreground hover:bg-muted disabled:opacity-30" aria-label={`${index + 1}. bekleyen görseli aşağı taşı`}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => removePending(image.id)} className="flex flex-1 items-center justify-center rounded-lg border border-border py-1 text-muted-foreground hover:bg-muted hover:text-red-500" aria-label={`${index + 1}. bekleyen görseli kaldır`}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button type="button" role="switch" aria-checked={!!form.inStock} onClick={() => set("inStock", !form.inStock)} className={`relative h-5 w-9 rounded-full transition-colors ${form.inStock ? "bg-green-500" : "bg-border"}`} data-testid="toggle-instock">
          <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.inStock ? "translate-x-4" : ""}`} />
        </button>
        <span className="text-sm text-foreground">{form.inStock ? "Stokta" : "Stok Dışı"}</span>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted" data-testid="button-cancel">
          <X className="h-4 w-4" /> İptal
        </button>
        <button type="submit" disabled={loading || saving || uploadingFiles.length > 0} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/80 disabled:opacity-50" data-testid="button-save">
          {loading || saving ? "Kaydediliyor…" : <><Save className="h-4 w-4" /> Kaydet</>}
        </button>
      </div>
    </form>
  );
}

function ProductDashboard({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; product?: ProductWithImages } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const { data: products = [], isLoading } = useQuery<ProductWithImages[]>({ queryKey: ["/api/products"] });

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3500);
  }

  const createMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiReq("POST", "/api/products", data) as Promise<Product>,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertProduct }) => apiReq("PUT", `/api/products/${encodeURIComponent(id)}`, data) as Promise<Product>,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiReq("DELETE", `/api/products/${encodeURIComponent(id)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setDeleteId(null);
      showToast("Ürün silindi.");
    },
    onError: (error) => showToast(`Hata: ${error instanceof Error ? error.message : "Ürün silinemedi"}`),
  });

  async function saveProduct(data: InsertProduct, pending: PendingImage[], onProgress: (id: string, progress: number) => void) {
    const normalizedData = { ...data, price: normalizePriceInput(data.price) };
    const saved = modal?.mode === "add"
      ? await createMutation.mutateAsync(normalizedData)
      : modal?.product
        ? await updateMutation.mutateAsync({ id: modal.product.id, data: normalizedData })
        : null;

    if (!saved) throw new Error("Ürün kaydı oluşturulamadı");

    const failedUploads: string[] = [];
    for (const image of pending) {
      try {
        await uploadProductImage(saved.id, image.file, (progress) => onProgress(image.id, progress));
      } catch {
        failedUploads.push(image.file.name);
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    setModal(null);
    if (failedUploads.length > 0) {
      showToast(`Ürün kaydedildi; ${failedUploads.length} görsel yüklenemedi.`);
    } else {
      showToast(modal?.mode === "add" ? "Ürün eklendi!" : "Ürün güncellendi!");
    }
  }

  async function handleLogout() {
    await apiReq("POST", "/api/admin/logout").catch(() => {});
    onLogout();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Ürün Yönetimi | Burem Elektronik"
        description="Burem Elektronik ürün yönetimi."
        canonical="/admin"
        robots="noindex,nofollow,noarchive"
      />
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logo.png" alt="Burem Elektronik" className="h-8 w-auto" />
            </Link>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/magaza" className="hidden rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted sm:block">Mağazayı Gör</Link>
            <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" data-testid="button-logout">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Çıkış</span>
            </button>
            <button onClick={() => setModal({ mode: "add" })} className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-foreground/80" data-testid="button-add-product">
              <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Ürün Ekle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
          Ürün Yönetimi <span className="ml-3 text-base font-normal text-muted-foreground">{products.length} ürün</span>
        </h1>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />)}</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold">Henüz ürün yok</p>
            <button onClick={() => setModal({ mode: "add" })} className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background">
              <Plus className="h-4 w-4" /> İlk Ürünü Ekle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] text-sm" data-testid="table-products">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ürün</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">P/N</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fiyat</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stok</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-muted/20" data-testid={`row-product-${product.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-10 w-10 flex-shrink-0 rounded-lg bg-muted object-contain p-1" /> : <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted"><Package className="h-5 w-5 text-muted-foreground/40" /></div>}
                        <div><p className="font-medium leading-snug">{product.name}</p><p className="text-xs text-muted-foreground">{product.brand}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.partNumber ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatProductPrice(product.price, product.currency) ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${product.inStock ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>{product.inStock ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}{product.inStock ? "Var" : "Yok"}</span></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-1">
                      <button onClick={() => setModal({ mode: "edit", product })} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" data-testid={`button-edit-${product.id}`} title="Düzenle"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(product.id)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500" data-testid={`button-delete-${product.id}`} title="Sil"><Trash2 className="h-4 w-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()} data-testid="modal-product-form">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{modal.mode === "add" ? "Ürün Ekle" : "Ürünü Düzenle"}</h2>
              <button onClick={() => setModal(null)} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <ProductForm
              initial={
                modal.mode === "edit" && modal.product
                  ? {
                      ...modal.product,
                      currency: modal.product.currency === "USD" ? "USD" : "TRY",
                    }
                  : EMPTY
              }
              product={modal.product}
              onSave={saveProduct}
              onCancel={() => setModal(null)}
              loading={createMutation.isPending || updateMutation.isPending}
              onNotify={showToast}
            />
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl" data-testid="modal-delete-confirm">
            <h2 className="text-lg font-bold">Ürünü Sil</h2>
            <p className="mt-2 text-sm text-muted-foreground">Bu ürün ve ilişkili görsel kayıtları kalıcı olarak silinecek. Devam etmek istiyor musunuz?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-border bg-muted/40 py-2 text-sm font-medium hover:bg-muted" data-testid="button-cancel-delete">İptal</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" data-testid="button-confirm-delete">{deleteMutation.isPending ? "Siliniyor…" : "Sil"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-[9999] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-center text-sm font-medium text-background shadow-lg" role="status"><CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />{toast}</div>}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    apiReq("GET", "/api/admin/me")
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return <><SEO title="Yönetici Girişi | Burem Elektronik" description="Burem Elektronik yönetici paneli." canonical="/admin" robots="noindex,nofollow,noarchive" /><div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></>;
  }
  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;
  return <ProductDashboard onLogout={() => setAuthed(false)} />;
}