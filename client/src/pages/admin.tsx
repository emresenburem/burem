import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, InsertProduct } from "@shared/schema";
import { Plus, Pencil, Trash2, X, Save, Package, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const CATEGORIES = ["İnverter", "Servo Sürücü", "PLC", "HMI", "Elektronik Kart", "Motor", "Sensör", "Diğer"];
const BRANDS     = ["Siemens", "ABB", "Fanuc", "Yaskawa", "Mitsubishi", "Lenze", "KEB", "Schneider", "Danfoss", "Omron", "SEW-Eurodrive", "Bosch Rexroth", "Beckhoff", "Allen Bradley", "Panasonic", "Diğer"];
const CONDITIONS = [{ value: "new", label: "Sıfır" }, { value: "refurbished", label: "Yenilenmiş" }, { value: "used", label: "İkinci El" }];

const EMPTY: InsertProduct = { name: "", brand: "Siemens", category: "İnverter", description: "", imageUrl: "", partNumber: "", condition: "new", inStock: true, price: null, stockQuantity: null };

function apiReq(method: string, url: string, body?: unknown) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? r.statusText);
    return r.status === 204 ? null : r.json();
  });
}

function ProductForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial: InsertProduct;
  onSave: (d: InsertProduct) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<InsertProduct>(initial);
  const set = (k: keyof InsertProduct, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const inputCls = "w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20";
  const labelCls = "mb-1 block text-xs font-medium text-muted-foreground";

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="space-y-3"
      data-testid="form-product"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Ürün Adı *</label>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ör: SINAMICS G120 Kontrol Kartı" className={inputCls} data-testid="input-product-name" />
        </div>
        <div>
          <label className={labelCls}>Marka *</label>
          <select value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} data-testid="select-brand">
            {BRANDS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Kategori *</label>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls} data-testid="select-category">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Parça No (P/N)</label>
          <input value={form.partNumber ?? ""} onChange={(e) => set("partNumber", e.target.value)} placeholder="Ör: 6SL3210-1KE21-3AF1" className={inputCls} data-testid="input-part-number" />
        </div>
        <div>
          <label className={labelCls}>Durum</label>
          <select value={form.condition ?? "new"} onChange={(e) => set("condition", e.target.value)} className={inputCls} data-testid="select-condition">
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Fiyat (TL)</label>
          <input type="number" min="0" step="1" value={form.price ?? ""} onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))} placeholder="Ör: 90000" className={inputCls} data-testid="input-price" />
        </div>
        <div>
          <label className={labelCls}>Stok Adedi</label>
          <input type="number" min="0" step="1" value={form.stockQuantity ?? ""} onChange={(e) => set("stockQuantity", e.target.value === "" ? null : Number(e.target.value))} placeholder="Ör: 1" className={inputCls} data-testid="input-stock-quantity" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Açıklama</label>
          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Kısa ürün açıklaması…" className={`${inputCls} resize-none`} data-testid="input-description" />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Görsel URL</label>
          <input value={form.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} placeholder="/products/siemens-g120.png" className={inputCls} data-testid="input-image-url" />
        </div>
        <div className="col-span-2 flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={!!form.inStock}
            onClick={() => set("inStock", !form.inStock)}
            className={`relative h-5 w-9 rounded-full transition-colors ${form.inStock ? "bg-green-500" : "bg-border"}`}
            data-testid="toggle-instock"
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.inStock ? "translate-x-4" : ""}`} />
          </button>
          <span className="text-sm text-foreground">{form.inStock ? "Stokta" : "Stok Dışı"}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors" data-testid="button-cancel">
          <X className="h-4 w-4" /> İptal
        </button>
        <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/80 transition-colors disabled:opacity-50" data-testid="button-save">
          {loading ? "Kaydediliyor…" : <><Save className="h-4 w-4" /> Kaydet</>}
        </button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; product?: Product } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const createMut = useMutation({
    mutationFn: (d: InsertProduct) => apiReq("POST", "/api/products", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/products"] }); setModal(null); showToast("Ürün eklendi!"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: InsertProduct }) => apiReq("PUT", `/api/products/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/products"] }); setModal(null); showToast("Ürün güncellendi!"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiReq("DELETE", `/api/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/products"] }); setDeleteId(null); showToast("Ürün silindi."); },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src="/logo.png" alt="Burem Elektronik" className="h-8 w-auto" />
            </Link>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/magaza" className="rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Mağazayı Gör
            </Link>
            <button
              onClick={() => setModal({ mode: "add" })}
              className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/80 transition-colors"
              data-testid="button-add-product"
            >
              <Plus className="h-4 w-4" /> Ürün Ekle
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
          Ürün Yönetimi
          <span className="ml-3 text-base font-normal text-muted-foreground">{products.length} ürün</span>
        </h1>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold">Henüz ürün yok</p>
            <button onClick={() => setModal({ mode: "add" })} className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/80 transition-colors">
              <Plus className="h-4 w-4" /> İlk Ürünü Ekle
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm" data-testid="table-products">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ürün</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground md:table-cell">Kategori</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">P/N</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stok</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-product-${p.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-lg object-contain bg-muted p-1 flex-shrink-0" />
                        ) : (
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground leading-snug">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{p.category}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">{p.partNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        p.inStock ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
                      }`}>
                        {p.inStock ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {p.inStock ? "Var" : "Yok"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal({ mode: "edit", product: p })}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          data-testid={`button-edit-${p.id}`}
                          title="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                          data-testid={`button-delete-${p.id}`}
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Ürün Ekle/Düzenle modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} data-testid="modal-product-form">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{modal.mode === "add" ? "Ürün Ekle" : "Ürünü Düzenle"}</h2>
              <button onClick={() => setModal(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <ProductForm
              initial={modal.mode === "edit" && modal.product ? { ...modal.product } : EMPTY}
              onSave={(d) => {
                if (modal.mode === "add") createMut.mutate(d);
                else if (modal.product) updateMut.mutate({ id: modal.product.id, d });
              }}
              onCancel={() => setModal(null)}
              loading={createMut.isPending || updateMut.isPending}
            />
          </div>
        </div>
      )}

      {/* Silme onay modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl" data-testid="modal-delete-confirm">
            <h2 className="text-lg font-bold text-foreground">Ürünü Sil</h2>
            <p className="mt-2 text-sm text-muted-foreground">Bu ürün kalıcı olarak silinecek. Devam etmek istiyor musunuz?</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-border bg-muted/40 py-2 text-sm font-medium hover:bg-muted transition-colors" data-testid="button-cancel-delete">İptal</button>
              <button onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50" data-testid="button-confirm-delete">
                {deleteMut.isPending ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg" data-testid="toast-success">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
