import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Plus, X, Save, CheckCircle2, AlertCircle, Loader2,
  MessageSquare, Settings, LogOut, Package, Wrench,
  Clock, Truck, Search, Trash2, ChevronDown,
} from "lucide-react";

/* ── Tipler ── */
interface ServiceRecord {
  id: string;
  trackingNo: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  faultDescription: string;
  status: number;
  technicianNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ServiceSettings {
  notifType: string;
  netgsmUser?: string;
  netgsmPass?: string;
  netgsmHeader?: string;
  greenApiInstance?: string;
  greenApiToken?: string;
  siteUrl?: string;
}

const STATUS_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Teslim Alındı",           color: "text-blue-600",   bg: "bg-blue-500/10 border-blue-500/30" },
  2: { label: "Arıza Tespiti",           color: "text-purple-600", bg: "bg-purple-500/10 border-purple-500/30" },
  3: { label: "Müşteri Onayı Bekleniyor",color: "text-yellow-600", bg: "bg-yellow-500/10 border-yellow-500/30" },
  4: { label: "Parça Bekleniyor",        color: "text-orange-600", bg: "bg-orange-500/10 border-orange-500/30" },
  5: { label: "Onarım & Yük Testinde",   color: "text-cyan-600",   bg: "bg-cyan-500/10 border-cyan-500/30" },
  6: { label: "Teslimata Hazır",         color: "text-green-600",  bg: "bg-green-500/10 border-green-500/30" },
};

/* ── API yardımcı ── */
async function apiReq(method: string, url: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 401) throw new Error("__UNAUTHORIZED__");
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error ?? res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

/* ── Login ekranı ── */
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await apiReq("POST", "/api/admin/login", { username: user, password: pass });
      onSuccess();
    } catch (e: any) {
      setErr(e.message === "__UNAUTHORIZED__" ? "Kullanıcı adı veya şifre hatalı" : e.message);
    } finally { setLoading(false); }
  };

  const inp = "w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Burem Elektronik" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold">Servis Paneli Girişi</h1>
          <p className="text-sm text-muted-foreground mt-1">Yönetici bilgilerinizle giriş yapın</p>
        </div>
        <form onSubmit={handle} className="space-y-3">
          <input required value={user} onChange={e => setUser(e.target.value)} placeholder="Kullanıcı adı" className={inp} data-testid="input-admin-user" />
          <input required type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Şifre" className={inp} data-testid="input-admin-pass" />
          {err && <p className="text-sm text-red-500">{err}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background hover:bg-foreground/80 transition-colors disabled:opacity-60"
            data-testid="button-login"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Yeni kayıt formu ── */
const EMPTY_FORM = { customerName: "", customerPhone: "", deviceModel: "", faultDescription: "", technicianNote: "", sendNotif: true };

function NewRecordModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const inp = "w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20";
  const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await apiReq("POST", "/api/service", {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        deviceModel: form.deviceModel,
        faultDescription: form.faultDescription,
        technicianNote: form.technicianNote || null,
        sendNotif: form.sendNotif,
      });
      onSaved();
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()} data-testid="modal-new-record">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Yeni Servis Kaydı</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handle} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Müşteri Adı *</label>
              <input required value={form.customerName} onChange={e => set("customerName", e.target.value)} placeholder="Ad Soyad" className={inp} />
            </div>
            <div>
              <label className={lbl}>Telefon *</label>
              <input required value={form.customerPhone} onChange={e => set("customerPhone", e.target.value)} placeholder="05xx xxx xx xx" className={inp} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Cihaz Modeli *</label>
              <input required value={form.deviceModel} onChange={e => set("deviceModel", e.target.value)} placeholder="Örn: Siemens Sinamics G120" className={inp} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Arıza Açıklaması *</label>
              <textarea required value={form.faultDescription} onChange={e => set("faultDescription", e.target.value)} rows={3} placeholder="Arıza belirtisi…" className={`${inp} resize-none`} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Teknisyen Notu (opsiyonel)</label>
              <input value={form.technicianNote} onChange={e => set("technicianNote", e.target.value)} placeholder="İlk inceleme notu…" className={inp} />
            </div>
          </div>
          {/* Bildirim checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.sendNotif} onChange={e => set("sendNotif", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-green-500" />
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Müşteriye karşılama mesajı gönder (SMS/WhatsApp)
            </span>
          </label>
          {err && <p className="text-sm text-red-500">{err}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <X className="h-4 w-4" /> İptal
            </button>
            <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/80 disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Kaydediliyor…</> : <><Save className="h-4 w-4" /> Kaydet & Takip No Üret</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Ayarlar sayfası ── */
function SettingsPanel({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<ServiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  useState(() => {
    apiReq("GET", "/api/service/settings").then(d => { setSettings(d); setLoading(false); }).catch(() => setLoading(false));
  });

  const set = (k: keyof ServiceSettings, v: string) => setSettings(s => s ? { ...s, [k]: v } : s);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true); setErr("");
    try {
      await apiReq("PUT", "/api/service/settings", settings);
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const inp = "w-full rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20";
  const lbl = "mb-1 block text-xs font-medium text-muted-foreground";

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" /> Geri
        </button>
        <h2 className="text-xl font-bold">Bildirim Ayarları</h2>
      </div>
      {loading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</div> : (
        <form onSubmit={save} className="max-w-xl space-y-5">
          <div>
            <label className={lbl}>Bildirim Türü</label>
            <select value={settings?.notifType ?? "none"} onChange={e => set("notifType", e.target.value)} className={inp}>
              <option value="none">Bildirim Gönderme</option>
              <option value="netgsm">NetGSM (SMS)</option>
              <option value="greenapi">Green API (WhatsApp)</option>
            </select>
          </div>

          {settings?.notifType === "netgsm" && (
            <div className="space-y-3 rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">NetGSM Ayarları</p>
              <div><label className={lbl}>Kullanıcı Adı</label><input value={settings?.netgsmUser ?? ""} onChange={e => set("netgsmUser", e.target.value)} placeholder="NetGSM kullanıcı adı" className={inp} /></div>
              <div><label className={lbl}>Şifre</label><input type="password" value={settings?.netgsmPass ?? ""} onChange={e => set("netgsmPass", e.target.value)} placeholder="NetGSM şifre" className={inp} /></div>
              <div><label className={lbl}>Mesaj Başlığı</label><input value={settings?.netgsmHeader ?? ""} onChange={e => set("netgsmHeader", e.target.value)} placeholder="BUREM" className={inp} /></div>
            </div>
          )}

          {settings?.notifType === "greenapi" && (
            <div className="space-y-3 rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Green API Ayarları</p>
              <div><label className={lbl}>Instance ID</label><input value={settings?.greenApiInstance ?? ""} onChange={e => set("greenApiInstance", e.target.value)} placeholder="1234567890" className={inp} /></div>
              <div><label className={lbl}>API Token</label><input type="password" value={settings?.greenApiToken ?? ""} onChange={e => set("greenApiToken", e.target.value)} placeholder="Token" className={inp} /></div>
            </div>
          )}

          <div><label className={lbl}>Site URL (bildirim linkinde kullanılır)</label><input value={settings?.siteUrl ?? ""} onChange={e => set("siteUrl", e.target.value)} placeholder="https://www.buremelektronik.com" className={inp} /></div>

          {err && <p className="text-sm text-red-500">{err}</p>}
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/80 disabled:opacity-50">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Kaydediliyor…</> : <><Save className="h-4 w-4" /> Kaydet</>}
          </button>
          {saved && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Ayarlar kaydedildi.</p>}
        </form>
      )}
    </div>
  );
}

/* ── Ana panel ── */
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [newModal, setNewModal] = useState(false);
  const [page, setPage] = useState<"list" | "settings">("list");
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notifChecks, setNotifChecks] = useState<Record<string, boolean>>({});
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: records = [], isLoading } = useQuery<ServiceRecord[]>({
    queryKey: ["/api/service"],
    queryFn: () => apiReq("GET", "/api/service"),
  });

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3500); }

  const handleStatusUpdate = async (record: ServiceRecord, newStatus: number) => {
    setUpdatingId(record.id);
    try {
      await apiReq("PUT", `/api/service/${record.id}`, {
        status: newStatus,
        technicianNote: noteInputs[record.id] ?? record.technicianNote,
        sendNotif: notifChecks[record.id] ?? false,
      });
      qc.invalidateQueries({ queryKey: ["/api/service"] });
      showToast("Durum güncellendi!");
    } catch (e: any) { showToast("Hata: " + e.message); }
    finally { setUpdatingId(null); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiReq("DELETE", `/api/service/${id}`);
      qc.invalidateQueries({ queryKey: ["/api/service"] });
      setDeletingId(null);
      showToast("Kayıt silindi.");
    } catch (e: any) { showToast("Hata: " + e.message); }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    onLogout();
  };

  const navCls = "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/"><img src="/logo.png" alt="Burem Elektronik" className="h-8 w-auto" /></Link>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">Servis Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page === "settings" ? "list" : "settings")}
              className={`${navCls} ${page === "settings" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
              <Settings className="h-4 w-4" /> Ayarlar
            </button>
            <Link href="/takip" className={`${navCls} text-muted-foreground hover:bg-muted hover:text-foreground`} target="_blank">
              Takip Sayfası
            </Link>
            <button onClick={handleLogout} className={`${navCls} text-muted-foreground hover:bg-muted hover:text-foreground`}>
              <LogOut className="h-4 w-4" /> Çıkış
            </button>
            {page === "list" && (
              <button onClick={() => setNewModal(true)}
                className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:bg-foreground/80 transition-colors"
                data-testid="button-new-record">
                <Plus className="h-4 w-4" /> Yeni Kayıt
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {page === "settings" ? (
          <SettingsPanel onBack={() => setPage("list")} />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, var(--font-sans)" }}>
                Servis Kayıtları
                <span className="ml-3 text-base font-normal text-muted-foreground">{records.length} kayıt</span>
              </h1>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 py-16 text-muted-foreground justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Yükleniyor…
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-24 text-center">
                <Package className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-lg font-semibold">Henüz kayıt yok</p>
                <button onClick={() => setNewModal(true)} className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-foreground/80 transition-colors">
                  <Plus className="h-4 w-4" /> İlk Kaydı Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map(rec => {
                  const s = STATUS_LABELS[rec.status] ?? STATUS_LABELS[1];
                  const isUpdating = updatingId === rec.id;
                  const sendNotif = notifChecks[rec.id] ?? false;
                  const note = noteInputs[rec.id] ?? (rec.technicianNote ?? "");
                  const date = new Date(rec.updatedAt).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

                  return (
                    <div key={rec.id} className="rounded-2xl border border-border bg-card overflow-hidden" data-testid={`row-service-${rec.id}`}>
                      {/* Üst satır */}
                      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-sm font-bold">{rec.trackingNo}</span>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.color}`}>{s.label}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{rec.deviceModel} — {rec.customerName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{rec.customerPhone} · {date}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Durum seçici */}
                          <div className="relative">
                            <select
                              value={rec.status}
                              disabled={isUpdating}
                              onChange={e => handleStatusUpdate(rec, parseInt(e.target.value))}
                              className="appearance-none rounded-xl border border-border bg-muted/40 pl-3 pr-8 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer disabled:opacity-50"
                              data-testid={`select-status-${rec.id}`}
                            >
                              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          </div>
                          <button onClick={() => setDeletingId(rec.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                            data-testid={`button-delete-${rec.id}`} title="Sil">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Alt satır: Arıza, not, bildirim */}
                      <div className="border-t border-border bg-muted/20 px-5 py-3 space-y-2">
                        <p className="text-xs text-muted-foreground line-clamp-1">{rec.faultDescription}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            value={note}
                            onChange={e => setNoteInputs(n => ({ ...n, [rec.id]: e.target.value }))}
                            placeholder="Teknisyen notu ekle…"
                            className="flex-1 min-w-[180px] rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-foreground/20"
                            data-testid={`input-note-${rec.id}`}
                          />
                          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-muted-foreground">
                            <input type="checkbox" checked={sendNotif}
                              onChange={e => setNotifChecks(n => ({ ...n, [rec.id]: e.target.checked }))}
                              className="h-3.5 w-3.5 rounded accent-green-500" />
                            <MessageSquare className="h-3 w-3" /> Müşteriye bildir
                          </label>
                          {(note !== (rec.technicianNote ?? "") || sendNotif) && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(rec, rec.status)}
                              className="flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
                            >
                              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                              Kaydet
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Yeni kayıt modal */}
      {newModal && (
        <NewRecordModal
          onClose={() => setNewModal(false)}
          onSaved={() => {
            setNewModal(false);
            qc.invalidateQueries({ queryKey: ["/api/service"] });
            showToast("Kayıt oluşturuldu! Takip no üretildi.");
          }}
        />
      )}

      {/* Silme onayı */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold">Kaydı Sil</h2>
            <p className="mt-2 text-sm text-muted-foreground">Bu servis kaydı kalıcı olarak silinecek.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 rounded-xl border border-border bg-muted/40 py-2 text-sm font-medium hover:bg-muted">İptal</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600">Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-green-400" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ── Ana export ── */
export default function AdminServisPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Oturum kontrolü
  useState(() => {
    apiReq("GET", "/api/admin/me")
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  });

  if (authed === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}
