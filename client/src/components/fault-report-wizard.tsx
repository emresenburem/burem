import { useState } from "react";
import { CheckCircle2, ChevronRight, ChevronLeft, MessageCircle } from "lucide-react";

const DEVICE_TYPES = [
  { id: "inverter", label: "İnverter / Frekans Dönüştürücü" },
  { id: "servo", label: "Servo Sürücü" },
  { id: "plc", label: "PLC" },
  { id: "hmi", label: "HMI / Operatör Panel" },
  { id: "kart", label: "Endüstriyel Elektronik Kart" },
  { id: "diger", label: "Diğer" },
];

const BRANDS: Record<string, string[]> = {
  inverter: ["Siemens", "ABB", "Lenze", "Schneider", "Danfoss", "Yaskawa", "Omron", "Mitsubishi", "SEW", "Diğer"],
  servo: ["Fanuc", "Siemens", "Mitsubishi", "Yaskawa", "Bosch Rexroth", "Lenze", "Panasonic", "Kollmorgen", "Diğer"],
  plc: ["Siemens", "Allen Bradley", "Mitsubishi", "Omron", "Schneider", "Beckhoff", "Diğer"],
  hmi: ["Siemens", "Proface", "Weintek", "Mitsubishi", "Allen Bradley", "Schneider", "Omron", "Diğer"],
  kart: ["Siemens", "ABB", "Fanuc", "Lenze", "Yaskawa", "Diğer"],
  diger: ["Diğer"],
};

const WA_NUMBER = "905322664764";

const STEP_LABELS = ["Cihaz Türü", "Marka & Model", "Arıza Detayı"];

interface WizardState {
  deviceType: string;
  deviceLabel: string;
  brand: string;
  model: string;
  errorCode: string;
  faultDesc: string;
  name: string;
  phone: string;
}

const INIT: WizardState = {
  deviceType: "",
  deviceLabel: "",
  brand: "",
  model: "",
  errorCode: "",
  faultDesc: "",
  name: "",
  phone: "",
};

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done = current > step;
        const active = current === step;
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              <span
                className={`mt-1 text-[10px] leading-tight text-center whitespace-nowrap ${
                  active ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 ${done ? "bg-green-500" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FaultReportWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardState>(INIT);
  const [sent, setSent] = useState(false);

  const set = (k: keyof WizardState, v: string) =>
    setData((d) => ({ ...d, [k]: v }));

  const canNext1 = !!data.deviceType;
  const canNext2 = !!data.brand && !!data.model.trim();
  const canSend = !!data.faultDesc.trim() && !!data.name.trim();

  function buildWAMessage() {
    const lines = [
      "🔧 *Arıza Bildirimi — Burem Elektronik*",
      "",
      `📦 *Cihaz Türü:* ${data.deviceLabel}`,
      `🏷️ *Marka:* ${data.brand}`,
      `🔩 *Model:* ${data.model}`,
      data.errorCode ? `⚠️ *Hata Kodu:* ${data.errorCode}` : null,
      "",
      `📋 *Arıza Açıklaması:*\n${data.faultDesc}`,
      "",
      `👤 *Ad Soyad:* ${data.name}`,
      data.phone ? `📞 *Telefon:* ${data.phone}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
  }

  function handleSend() {
    window.open(buildWAMessage(), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  function reset() {
    setData(INIT);
    setStep(1);
    setSent(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center" data-testid="wizard-success">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
          <MessageCircle className="h-7 w-7 text-green-500" />
        </div>
        <p className="text-lg font-semibold">WhatsApp açıldı!</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Mesajı göndermek için WhatsApp'ta "Gönder" tuşuna basın. En kısa sürede dönüş yapacağız.
        </p>
        <button
          onClick={reset}
          className="mt-2 rounded-full border border-border bg-muted px-5 py-2 text-sm font-medium hover:bg-accent transition-colors"
          data-testid="button-wizard-reset"
        >
          Yeni Bildirim
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5" data-testid="wizard-fault-report">
      <StepIndicator current={step} />

      {/* Step 1 — Cihaz Türü */}
      {step === 1 && (
        <div className="space-y-2" data-testid="wizard-step-1">
          <p className="text-sm text-muted-foreground mb-3">Arızalı cihazın türünü seçin:</p>
          <div className="grid grid-cols-2 gap-2">
            {DEVICE_TYPES.map((dt) => (
              <button
                key={dt.id}
                onClick={() => { set("deviceType", dt.id); set("deviceLabel", dt.label); }}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium transition-colors ${
                  data.deviceType === dt.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted/40 hover:bg-muted text-foreground"
                }`}
                data-testid={`button-device-${dt.id}`}
              >
                {dt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!canNext1}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity disabled:opacity-40"
            data-testid="button-wizard-next-1"
          >
            Devam <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 2 — Marka & Model */}
      {step === 2 && (
        <div className="space-y-3" data-testid="wizard-step-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Marka *</label>
            <select
              value={data.brand}
              onChange={(e) => set("brand", e.target.value)}
              className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
              data-testid="select-brand"
            >
              <option value="">Seçin...</option>
              {(BRANDS[data.deviceType] ?? BRANDS.diger).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Model *</label>
            <input
              type="text"
              value={data.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Ör: SINAMICS G120, ACS550..."
              className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
              data-testid="input-model"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Hata Kodu (varsa)</label>
            <input
              type="text"
              value={data.errorCode}
              onChange={(e) => set("errorCode", e.target.value)}
              placeholder="Ör: F0001, AL.10..."
              className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
              data-testid="input-error-code"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              data-testid="button-wizard-back-2"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canNext2}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity disabled:opacity-40"
              data-testid="button-wizard-next-2"
            >
              Devam <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Arıza Detayı & İletişim */}
      {step === 3 && (
        <div className="space-y-3" data-testid="wizard-step-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Arıza Açıklaması *</label>
            <textarea
              value={data.faultDesc}
              onChange={(e) => set("faultDesc", e.target.value)}
              placeholder="Cihazın belirtileri, ne zaman başladığı, varsa denenen işlemler..."
              rows={4}
              className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30 resize-none"
              data-testid="textarea-fault-desc"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Ad Soyad *</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ad Soyad"
                className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                data-testid="input-wizard-name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Telefon</label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="05xx..."
                className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                data-testid="input-wizard-phone"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 rounded-2xl border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              data-testid="button-wizard-back-3"
            >
              <ChevronLeft className="h-4 w-4" /> Geri
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20ba5a] transition-colors disabled:opacity-40"
              data-testid="button-wizard-send"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp'tan Gönder
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center leading-snug">
            Bilgileriniz yalnızca arızanızı değerlendirmek amacıyla kullanılır.
          </p>
        </div>
      )}
    </div>
  );
}
