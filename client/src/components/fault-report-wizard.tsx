import { useState } from "react";
import { CheckCircle2, ChevronRight, ChevronLeft, MessageCircle, Loader2 } from "lucide-react";

/* ─────────────────────────────────────────────
   CİHAZ TÜRLERİ
───────────────────────────────────────────── */
const DEVICE_TYPES = [
  { id: "inverter", label: "İnverter / Frekans Dönüştürücü" },
  { id: "servo",    label: "Servo Sürücü" },
  { id: "plc",      label: "PLC" },
  { id: "hmi",      label: "HMI / Operatör Panel" },
  { id: "kart",     label: "Endüstriyel Elektronik Kart" },
  { id: "diger",    label: "Diğer" },
];

/* ─────────────────────────────────────────────
   MARKA LİSTELERİ — cihaz türüne göre
───────────────────────────────────────────── */
const BRANDS_BY_TYPE: Record<string, string[]> = {
  inverter: ["Siemens","ABB","Schneider","Danfoss","Yaskawa","Lenze","Mitsubishi","Omron","SEW-Eurodrive","Allen Bradley","Bosch Rexroth","Diğer"],
  servo:    ["Fanuc","Siemens","Yaskawa","Mitsubishi","Bosch Rexroth","Lenze","Panasonic","Beckhoff","ABB","Omron","Diğer"],
  plc:      ["Siemens","Allen Bradley","Mitsubishi","Omron","Schneider","Beckhoff","Fanuc","Diğer"],
  hmi:      ["Siemens","Mitsubishi","Omron","Schneider","Allen Bradley","Fanuc","Diğer"],
  kart:     ["Siemens","ABB","Fanuc","Yaskawa","Lenze","Mitsubishi","Schneider","SEW-Eurodrive","Bosch Rexroth","Danfoss","Omron","Diğer"],
  diger:    ["Siemens","ABB","Fanuc","Yaskawa","Lenze","Mitsubishi","Schneider","SEW-Eurodrive","Bosch Rexroth","Danfoss","Omron","Allen Bradley","Beckhoff","Panasonic","Diğer"],
};

/* ─────────────────────────────────────────────
   MODEL LİSTELERİ — [cihazTürü][marka]
   Her "Diğer" markası serbest metin kutusuna düşer.
───────────────────────────────────────────── */
const MODELS: Record<string, Record<string, string[]>> = {

  /* ──── İNVERTER ──── */
  inverter: {
    "Siemens": [
      "MICROMASTER 410","MICROMASTER 420","MICROMASTER 430","MICROMASTER 440",
      "SINAMICS V20","SINAMICS G110","SINAMICS G120","SINAMICS G120C",
      "SINAMICS G120D","SINAMICS G120P","SINAMICS G130","SINAMICS G150",
      "SINAMICS G180","SINAMICS S120","SINAMICS S150",
    ],
    "ABB": [
      "ACS55","ACS150","ACS310","ACS355","ACS380","ACS480",
      "ACS510","ACS550","ACS580","ACS800","ACS850","ACS880",
      "ACS2000","ACS6000","ACH550","ACQ810","DCS550","DCS800",
    ],
    "Schneider": [
      "Altivar 12 (ATV12)","Altivar 21 (ATV21)","Altivar 31 (ATV31)","Altivar 32 (ATV32)",
      "Altivar 61 (ATV61)","Altivar 71 (ATV71)","Altivar 310 (ATV310)","Altivar 312 (ATV312)",
      "Altivar 320 (ATV320)","Altivar 340 (ATV340)","Altivar 610 (ATV610)",
      "Altivar 630 (ATV630)","Altivar 650 (ATV650)","Altivar 660 (ATV660)",
      "Altivar 680 (ATV680)","Altivar 930 (ATV930)","Altivar 950 (ATV950)",
    ],
    "Danfoss": [
      "VLT Micro Drive FC 51","VLT HVAC Drive FC 102","VLT Refrigeration Drive FC 103",
      "VLT AQUA Drive FC 202","VLT AutomationDrive FC 301","VLT AutomationDrive FC 302",
      "VLT DriveMotor FCP 106","VLT DriveMotor FCM 106",
      "VLT 2800","VLT 5000","VLT 6000",
      "VACON 10","VACON 20","VACON 100","VACON 100 FLOW","VACON 100 INDUSTRIAL",
      "VACON NXL","VACON NXP",
    ],
    "Yaskawa": [
      "J1000","V1000","A1000","H1000","U1000","L1000A",
      "GA500","GA700","GA800","P1000",
      "CIMR-G7 (G7)","CIMR-F7 (F7)","CIMR-E7 (E7)","VS Mini J7",
    ],
    "Lenze": [
      "8200 vector","8400 BaseLine","8400 StateLine","8400 HighLine","8400 TopLine",
      "i500","i550","i700","E94","SMVector","MC1000",
    ],
    "Mitsubishi": [
      "FR-D700 (FR-D720/FR-D740)","FR-D720S","FR-D820","FR-D840",
      "FR-E700 (FR-E720/FR-E740)","FR-E800",
      "FR-F700 (FR-F720/FR-F740)","FR-F800",
      "FR-A700 (FR-A720/FR-A740)","FR-A800","FR-A800Plus",
    ],
    "Omron": [
      "3G3JV","3G3MV","3G3RV","3G3FV",
      "MX2","RX","V1000 (Omron)","J1000 (Omron)",
    ],
    "SEW-Eurodrive": [
      "MOVITRAC B","MOVITRAC LTE-B","MOVITRAC MC07",
      "MOVITRAC advanced","MOVIDRIVE B","MOVIDRIVE modular",
      "MDX60B","MDX61B","MCV40A","MOVIMOT","MOVI-C CONTROLLER",
    ],
    "Allen Bradley": [
      "PowerFlex 4","PowerFlex 4M","PowerFlex 40","PowerFlex 40P",
      "PowerFlex 400","PowerFlex 523","PowerFlex 525","PowerFlex 527",
      "PowerFlex 753","PowerFlex 755","PowerFlex 6000","PowerFlex 7000",
    ],
    "Bosch Rexroth": [
      "EcoDrive DKC01","EcoDrive DKC02","EcoDrive DKC03","EcoDrive DKC11",
      "Frequency Converter FV","Sytronix SvP 7020",
    ],
  },

  /* ──── SERVO SÜRÜCÜ ──── */
  servo: {
    "Fanuc": [
      "αiSV 4","αiSV 20","αiSV 40","αiSV 80","αiSV 160","αiSV 360",
      "αiSP 15","αiSP 30","αiSP 45",
      "βiSV 20","βiSV 40","βiSV 80","βiSP 11","βiSP 22",
      "A06B-6130 serisi","A06B-6140 serisi","A06B-6141 serisi",
      "A06B-6160 serisi","A06B-6164 serisi","A06B-6200 serisi",
      "A06B-6240 serisi","A06B-6250 serisi",
    ],
    "Siemens": [
      "SINAMICS S120","SINAMICS S210",
      "SIMODRIVE 611","SIMODRIVE 611A","SIMODRIVE 611D","SIMODRIVE 611U",
      "SIMOVERT MASTERDRIVES MC",
    ],
    "Yaskawa": [
      "Sigma-5 (SGDV)","Sigma-7 (SGD7S)","SGD7W","SGD7C","SGD7F",
      "SGDV serisi","SGDS serisi",
    ],
    "Mitsubishi": [
      "MR-J2S-10A","MR-J2S-20A","MR-J2S-40A","MR-J2S-70A","MR-J2S-100A","MR-J2S-200A",
      "MR-J3-10A","MR-J3-20A","MR-J3-40A","MR-J3-70A","MR-J3-100A","MR-J3-200A","MR-J3-350A",
      "MR-J4-10A","MR-J4-20A","MR-J4-40A","MR-J4-70A","MR-J4-100A","MR-J4-200A","MR-J4-350A",
      "MR-JE-10A","MR-JE-20A","MR-JE-40A","MR-JE-70A","MR-JE-100A",
      "MR-J5-10G","MR-J5-20G","MR-J5-40G","MR-J5-70G","MR-J5-100G","MR-J5-200G",
    ],
    "Bosch Rexroth": [
      "IndraDrive C HCS01","IndraDrive C HCS02","IndraDrive C HCS03",
      "IndraDrive M HMS01","IndraDrive M HMS02","IndraDrive M HMD01",
      "IndraDrive Mi KCU02","IndraDrive Mi KSM",
      "EcoDrive DKC01","EcoDrive DKC02","EcoDrive DKC03","EcoDrive DKC11",
    ],
    "Lenze": [
      "9300 servo PLC","ECSxSxxx","i700 servo","S300",
    ],
    "Panasonic": [
      "MINAS A4 (MQMD/MSMD)","MINAS A5 (MADDT/MBDDT)","MINAS A5B","MINAS A5N","MINAS A5E",
      "MINAS A6 (MADLN/MBDLN)","MINAS A6B","MINAS A6N","MINAS A6 Multi-Network",
      "MINAS E (MSMD/MQMA)","MINAS E1","LIQI",
    ],
    "Beckhoff": [
      "AX5101","AX5106","AX5112","AX5118","AX5125","AX5140",
      "AX5160","AX5172","AX5190","AX5191","AX5192",
      "AX8206","AX8640",
    ],
    "ABB": [
      "ACSM1","MicroFlex e150","MicroFlex e190","MotiFlex e180","MultiFlex",
    ],
    "Omron": [
      "Accurax G5","1S serisi","R88D-KN serisi","R88D-GT serisi",
    ],
  },

  /* ──── PLC ──── */
  plc: {
    "Siemens": [
      "LOGO!",
      "SIMATIC S7-200","SIMATIC S7-200 SMART",
      "SIMATIC S7-300 CPU 312","SIMATIC S7-300 CPU 314","SIMATIC S7-300 CPU 315",
      "SIMATIC S7-300 CPU 317","SIMATIC S7-300 CPU 319",
      "SIMATIC S7-400 CPU 412","SIMATIC S7-400 CPU 414","SIMATIC S7-400 CPU 416","SIMATIC S7-400 CPU 417",
      "SIMATIC S7-1200 CPU 1211C","SIMATIC S7-1200 CPU 1212C","SIMATIC S7-1200 CPU 1214C","SIMATIC S7-1200 CPU 1215C",
      "SIMATIC S7-1500 CPU 1511","SIMATIC S7-1500 CPU 1513","SIMATIC S7-1500 CPU 1515","SIMATIC S7-1500 CPU 1516","SIMATIC S7-1500 CPU 1518",
      "SIMATIC ET 200S","SIMATIC ET 200M","SIMATIC ET 200SP",
    ],
    "Allen Bradley": [
      "MicroLogix 1000","MicroLogix 1100","MicroLogix 1200","MicroLogix 1400","MicroLogix 1500",
      "SLC 5/01","SLC 5/02","SLC 5/03","SLC 5/04","SLC 5/05",
      "CompactLogix L16E","CompactLogix L23E","CompactLogix L27ERM",
      "CompactLogix L30ER","CompactLogix L32E","CompactLogix L33ER","CompactLogix L36ERM",
      "ControlLogix L61","ControlLogix L62","ControlLogix L63","ControlLogix L64","ControlLogix L65",
      "PLC-5/10","PLC-5/20","PLC-5/30","PLC-5/40","PLC-5/80",
    ],
    "Mitsubishi": [
      "MELSEC FX1S","MELSEC FX1N","MELSEC FX2N","MELSEC FX3U","MELSEC FX3G","MELSEC FX3GC","MELSEC FX3UC",
      "MELSEC FX5U","MELSEC FX5UC",
      "MELSEC Q00","MELSEC Q01","MELSEC Q02H","MELSEC Q06H","MELSEC Q13H","MELSEC Q26H",
      "MELSEC L02S","MELSEC L06K","MELSEC L26CPU",
      "MELSEC iQ-R04","MELSEC iQ-R08","MELSEC iQ-R16","MELSEC iQ-R32","MELSEC iQ-R120",
    ],
    "Omron": [
      "CP1E","CP1H","CP1L","CP2E",
      "CJ1M","CJ2M","CJ2H",
      "CS1D","CS1H","CS1G",
      "NX1P2","NX102","NX102-9020",
      "NJ101","NJ301","NJ501",
      "NX7 serisi",
    ],
    "Schneider": [
      "Twido","Modicon M221","Modicon M241","Modicon M251","Modicon M262",
      "Modicon M340","Modicon M580",
      "Modicon Premium TSX 57","Modicon Quantum 140",
    ],
    "Beckhoff": [
      "CX5120","CX5130","CX5140","CX5160","CX5180",
      "CX2020","CX2030","CX2040","CX2042","CX2062",
      "CX8080","CX8190","CX9020",
      "CX7028","CX7000",
      "BK9050","EK1100","EK1101",
    ],
    "Fanuc": [
      "FANUC PMC-SA1","FANUC PMC-SB7","FANUC PMC-SD","FANUC PMC-SL",
    ],
  },

  /* ──── HMI ──── */
  hmi: {
    "Siemens": [
      "SIMATIC KP400 Comfort","SIMATIC KTP400 Basic","SIMATIC KTP700 Basic","SIMATIC KTP900 Basic","SIMATIC KTP1200 Basic",
      "SIMATIC TP700 Comfort","SIMATIC TP900 Comfort","SIMATIC TP1200 Comfort","SIMATIC TP1500 Comfort",
      "SIMATIC TP177A","SIMATIC TP177B","SIMATIC TP277",
      "SIMATIC MP277","SIMATIC MP377",
      "SIMATIC IPC277D","SIMATIC IPC477D",
    ],
    "Mitsubishi": [
      "GOT1000 GT10","GOT1000 GT11","GOT1000 GT12","GOT1000 GT15",
      "GOT2000 GT21","GOT2000 GT23","GOT2000 GT25","GOT2000 GT27",
    ],
    "Omron": [
      "NS5-SQ10-V2","NS8-TV00-V2","NS10-TV00-V2","NS12-TS00-V2","NS15-TX01-V2",
      "NB3Q-TW00B","NB5Q-TW00B","NB7W-TW00B","NB10W-TW00B",
      "NA5-7W","NA5-9W","NA5-12W","NA5-15W",
    ],
    "Schneider": [
      "Magelis XBT-N","Magelis XBT-RT","Magelis XBT-GT","Magelis XBT-GK",
      "Magelis GTO","Magelis GTU",
      "Magelis HMISTO511","Magelis HMISTU855","Magelis HMIGTO2310","Magelis HMIGTU",
    ],
    "Allen Bradley": [
      "PanelView 300 Micro","PanelView 550","PanelView 600","PanelView 900","PanelView 1000","PanelView 1200","PanelView 1400",
      "PanelView Plus 6 / 7 400","PanelView Plus 6 / 7 600","PanelView Plus 6 / 7 700","PanelView Plus 6 / 7 900","PanelView Plus 6 / 7 1000","PanelView Plus 6 / 7 1250","PanelView Plus 6 / 7 1500",
    ],
    "Fanuc": [
      "FANUC iHMI","Proface GP3000 (OEM)","Proface GP4000 (OEM)",
    ],
  },

  /* ──── ELEKTRONİK KART ──── */
  kart: {
    "Siemens": [
      "SINAMICS güç kartı","SINAMICS kontrol kartı (CU320/CU310/CU230)",
      "MICROMASTER 440 kontrol kartı","SIMOVERT kontrol kartı",
      "SIMATIC I/O modülü","SIMATIC CPU kartı",
    ],
    "ABB": [
      "SINT4130C","RINT5614C","RDCU-02C","RMIO","REFU-04",
      "ACS800 kontrol kartı","ACS550 kontrol kartı","ACS880 kontrol kartı",
    ],
    "Fanuc": [
      "A20B-xxxx servo kontrol kartı","A16B-xxxx anakart","A06B-6xxx sürücü kartı",
      "A87L-0001 ekran kartı","A02B-xxxx güç kartı",
    ],
    "Yaskawa": [
      "ETP616185 kontrol kartı","ETP001285","YPHT31085","GA700 kontrol kartı","A1000 kontrol kartı",
    ],
    "Lenze": [
      "8200 kontrol kartı","i700 kontrol kartı","E94 I/O kartı",
    ],
    "Mitsubishi": [
      "FR-A800 kontrol kartı","MR-J4 servo kontrol kartı","Q02H CPU kartı","FX3U anakart",
    ],
    "Schneider": [
      "ATV71 kontrol kartı","ATV630 kontrol kartı","Modicon M340 CPU kartı",
    ],
    "SEW-Eurodrive": [
      "MOVITRAC B kontrol kartı","MOVIDRIVE B opsiyonel kartı","MDX kontrol kartı",
    ],
    "Bosch Rexroth": [
      "IndraDrive kontrol kartı (CSB01)","IndraDrive güç kartı (HMS01)",
      "EcoDrive DKC kontrol modülü",
    ],
    "Danfoss": [
      "FC 302 kontrol kartı","VACON NXP kontrol kartı","VLT kontrol kartı",
    ],
    "Omron": [
      "MX2 kontrol kartı","RX kontrol kartı","Accurax G5 kontrol kartı",
    ],
  },
};

/* ─────────────────────────────────────────────
   SABİTLER
───────────────────────────────────────────── */
const WA_NUMBER = "905322664764";
const STEP_LABELS = ["Cihaz Türü", "Marka & Model", "Arıza Detayı"];

interface WizardState {
  deviceType:  string;
  deviceLabel: string;
  brand:       string;
  model:       string;
  modelCustom: string;
  errorCode:   string;
  faultDesc:   string;
  name:        string;
  phone:       string;
  userEmail:   string;
}

const INIT: WizardState = {
  deviceType: "", deviceLabel: "", brand: "",
  model: "", modelCustom: "", errorCode: "",
  faultDesc: "", name: "", phone: "", userEmail: "",
};

/* ─────────────────────────────────────────────
   YARDIMCI: adım göstergesi
───────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done   = current > step;
        const active = current === step;
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done   ? "bg-green-500 text-white"
                : active ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              <span className={`mt-1 text-[10px] leading-tight text-center whitespace-nowrap ${
                active ? "text-foreground font-semibold" : "text-muted-foreground"
              }`}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 transition-colors ${done ? "bg-green-500" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANA BILEŞEN
───────────────────────────────────────────── */
export function FaultReportWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardState>(INIT);
  const [sentVia, setSentVia] = useState<"whatsapp" | "email" | null>(null);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");

  const set = (k: keyof WizardState, v: string) =>
    setData((d) => ({ ...d, [k]: v }));

  const modelList: string[] = (() => {
    const typeModels = MODELS[data.deviceType];
    if (!typeModels) return [];
    return typeModels[data.brand] ?? [];
  })();

  const isCustomModel  = data.model === "__custom__";
  const effectiveModel = isCustomModel ? data.modelCustom.trim() : data.model;
  const effectiveBrand = data.brand === "Diğer" ? data.modelCustom : data.brand;

  const canNext1   = !!data.deviceType;
  const canNext2   = !!data.brand && !!effectiveModel;
  const canBase    = !!data.faultDesc.trim() && !!data.name.trim();
  const canEmail   = canBase && !!data.userEmail.trim();

  function buildWAMessage() {
    const lines = [
      "🔧 *Arıza Bildirimi — Burem Elektronik*", "",
      `📦 *Cihaz Türü:* ${data.deviceLabel}`,
      `🏷️ *Marka:* ${effectiveBrand}`,
      `🔩 *Model:* ${effectiveModel}`,
      data.errorCode ? `⚠️ *Hata Kodu:* ${data.errorCode}` : null, "",
      `📋 *Arıza Açıklaması:*\n${data.faultDesc}`, "",
      `👤 *Ad Soyad:* ${data.name}`,
      data.phone ? `📞 *Telefon:* ${data.phone}` : null,
    ].filter(Boolean).join("\n");
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines)}`;
  }

  function handleWhatsApp() {
    window.open(buildWAMessage(), "_blank", "noopener,noreferrer");
    setSentVia("whatsapp");
  }

  async function handleEmail() {
    if (!data.userEmail.trim()) {
      setEmailError("E-posta adresinizi girin.");
      return;
    }
    setEmailError("");
    setSending(true);
    try {
      const res = await fetch("/api/fault-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceLabel: data.deviceLabel,
          brand:       effectiveBrand,
          model:       effectiveModel,
          errorCode:   data.errorCode,
          faultDesc:   data.faultDesc,
          name:        data.name,
          phone:       data.phone,
          userEmail:   data.userEmail,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setEmailError(d.error || "Mail gönderilemedi, lütfen tekrar deneyin.");
        setSending(false);
        return;
      }
    } catch {
      setEmailError("Bağlantı hatası, lütfen tekrar deneyin.");
      setSending(false);
      return;
    }
    setSending(false);
    setSentVia("email");
  }

  function reset() { setData(INIT); setStep(1); setSentVia(null); setSending(false); setEmailError(""); }

  /* ── BAŞARILI ── */
  if (sentVia) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center" data-testid="wizard-success">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
          <CheckCircle2 className="h-7 w-7 text-green-500" />
        </div>
        {sentVia === "whatsapp" ? (
          <>
            <p className="text-lg font-semibold">WhatsApp açıldı!</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Hazırlanan mesajı göndermek için WhatsApp'ta <strong>"Gönder"</strong> tuşuna basın.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold">Mesajınız iletildi!</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Arıza bildiriminiz <strong>info@buremelektronik.com</strong> adresine gönderildi. En kısa sürede dönüş yapacağız.
            </p>
          </>
        )}
        <button
          onClick={reset}
          className="mt-3 rounded-full border border-border bg-muted px-5 py-2 text-sm font-medium hover:bg-accent transition-colors"
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

      {/* ── ADIM 1 — Cihaz Türü ── */}
      {step === 1 && (
        <div className="space-y-2" data-testid="wizard-step-1">
          <p className="text-sm text-muted-foreground mb-3">Arızalı cihazın türünü seçin:</p>
          <div className="grid grid-cols-2 gap-2">
            {DEVICE_TYPES.map((dt) => (
              <button
                key={dt.id}
                onClick={() => {
                  set("deviceType", dt.id);
                  set("deviceLabel", dt.label);
                  set("brand", "");
                  set("model", "");
                  set("modelCustom", "");
                }}
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

      {/* ── ADIM 2 — Marka & Model ── */}
      {step === 2 && (
        <div className="space-y-3" data-testid="wizard-step-2">
          {/* Marka */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Marka *</label>
            <select
              value={data.brand}
              onChange={(e) => {
                set("brand", e.target.value);
                set("model", "");
                set("modelCustom", "");
              }}
              className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
              data-testid="select-brand"
            >
              <option value="">Marka seçin...</option>
              {(BRANDS_BY_TYPE[data.deviceType] ?? []).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Model — marka seçiliyse göster */}
          {data.brand && data.brand !== "Diğer" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Model *</label>
              {modelList.length > 0 ? (
                <>
                  <select
                    value={data.model}
                    onChange={(e) => { set("model", e.target.value); set("modelCustom", ""); }}
                    className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                    data-testid="select-model"
                  >
                    <option value="">Model seçin...</option>
                    {modelList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="__custom__">Listede yok / Manuel giriş</option>
                  </select>
                  {isCustomModel && (
                    <input
                      type="text"
                      value={data.modelCustom}
                      onChange={(e) => set("modelCustom", e.target.value)}
                      placeholder="Model adını yazın..."
                      className="mt-2 w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                      data-testid="input-model-custom"
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={data.modelCustom}
                  onChange={(e) => { set("modelCustom", e.target.value); set("model", "__custom__"); }}
                  placeholder="Ör: SINAMICS G120, ACS550..."
                  className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                  data-testid="input-model"
                />
              )}
            </div>
          )}

          {/* Diğer marka serbest giriş */}
          {data.brand === "Diğer" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Marka adı *</label>
                <input
                  type="text"
                  value={data.modelCustom}
                  onChange={(e) => { set("modelCustom", e.target.value); set("model", "__custom__"); }}
                  placeholder="Marka adı..."
                  className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                  data-testid="input-brand-custom"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Model *</label>
                <input
                  type="text"
                  value={data.model === "__custom__" ? "" : data.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="Model adı..."
                  className="w-full rounded-2xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                  data-testid="input-model-other"
                />
              </div>
            </div>
          )}

          {/* Hata kodu */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Hata Kodu (varsa)</label>
            <input
              type="text"
              value={data.errorCode}
              onChange={(e) => set("errorCode", e.target.value)}
              placeholder="Ör: F0001, AL.10, Err01..."
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

      {/* ── ADIM 3 — Arıza Detayı & İletişim ── */}
      {step === 3 && (
        <div className="space-y-3" data-testid="wizard-step-3">
          {/* Seçilen bilgiler özet */}
          <div className="flex flex-wrap gap-1.5">
            {[data.deviceLabel, effectiveBrand, effectiveModel]
              .filter(Boolean)
              .map((v, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {v}
                </span>
              ))}
          </div>

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

          {/* Geri butonu */}
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            data-testid="button-wizard-back-3"
          >
            <ChevronLeft className="h-4 w-4" /> Geri
          </button>

          {/* ─── Gönderim seçenekleri ─── */}
          <div className="rounded-2xl border border-border bg-muted/20 p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nasıl iletmek istersiniz?</p>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              disabled={!canBase}
              className="flex w-full items-center gap-3 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-left hover:bg-[#25D366]/20 transition-colors disabled:opacity-40"
              data-testid="button-wizard-whatsapp"
            >
              <MessageCircle className="h-5 w-5 flex-shrink-0 text-[#25D366]" />
              <div>
                <p className="text-sm font-semibold text-foreground">WhatsApp ile Gönder</p>
                <p className="text-xs text-muted-foreground">Hazır mesajla WhatsApp açılır, siz onaylarsınız</p>
              </div>
            </button>

            {/* E-posta */}
            <div className={`rounded-xl border transition-colors ${data.userEmail ? "border-blue-500/40 bg-blue-500/10" : "border-border bg-muted/30"}`}>
              <div className="flex items-center gap-3 px-4 pt-3">
                <svg className="h-5 w-5 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-foreground">E-posta ile Gönder</p>
                  <p className="text-xs text-muted-foreground">info@buremelektronik.com adresine iletilir</p>
                </div>
              </div>
              <div className="px-4 pb-3 pt-2 space-y-2">
                <input
                  type="email"
                  value={data.userEmail}
                  onChange={(e) => { set("userEmail", e.target.value); setEmailError(""); }}
                  placeholder="E-posta adresiniz (yanıt için)"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  data-testid="input-user-email"
                />
                {emailError && (
                  <p className="text-xs text-red-500" data-testid="text-email-error">{emailError}</p>
                )}
                <button
                  onClick={handleEmail}
                  disabled={!canEmail || sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40"
                  data-testid="button-wizard-email"
                >
                  {sending
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Gönderiliyor...</>
                    : "Maili Gönder"
                  }
                </button>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center leading-snug">
            Bilgileriniz yalnızca arızanızı değerlendirmek amacıyla kullanılır.
          </p>
        </div>
      )}
    </div>
  );
}
