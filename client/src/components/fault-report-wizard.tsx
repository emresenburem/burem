import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChevronRight, ChevronLeft, MessageCircle,
  Loader2, Zap, Cpu, LayoutGrid, Monitor, CircuitBoard, HelpCircle,
  Mail,
} from "lucide-react";

/* ─────────────────────────────────────────────
   CİHAZ TÜRLERİ
───────────────────────────────────────────── */
const DEVICE_TYPES = [
  { id: "inverter", label: "İnverter",          sub: "Frekans Dönüştürücü", Icon: Zap },
  { id: "servo",    label: "Servo Sürücü",       sub: "Servo amplifikatör",  Icon: Cpu },
  { id: "plc",      label: "PLC",                sub: "Lojik kontrolör",     Icon: LayoutGrid },
  { id: "hmi",      label: "HMI Panel",          sub: "Operatör paneli",     Icon: Monitor },
  { id: "kart",     label: "Elektronik Kart",    sub: "Güç / kontrol kartı", Icon: CircuitBoard },
  { id: "diger",    label: "Diğer",              sub: "Belirtmek istiyorum", Icon: HelpCircle },
];

/* ─────────────────────────────────────────────
   MARKA LİSTELERİ
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
   MODEL LİSTELERİ
───────────────────────────────────────────── */
const MODELS: Record<string, Record<string, string[]>> = {
  inverter: {
    "Siemens": ["MICROMASTER 410","MICROMASTER 420","MICROMASTER 430","MICROMASTER 440","SINAMICS V20","SINAMICS G110","SINAMICS G120","SINAMICS G120C","SINAMICS G120D","SINAMICS G120P","SINAMICS G130","SINAMICS G150","SINAMICS G180","SINAMICS S120","SINAMICS S150"],
    "ABB": ["ACS55","ACS150","ACS310","ACS355","ACS380","ACS480","ACS510","ACS550","ACS580","ACS800","ACS850","ACS880","ACS2000","ACS6000","ACH550","ACQ810","DCS550","DCS800"],
    "Schneider": ["Altivar 12 (ATV12)","Altivar 21 (ATV21)","Altivar 31 (ATV31)","Altivar 32 (ATV32)","Altivar 61 (ATV61)","Altivar 71 (ATV71)","Altivar 310 (ATV310)","Altivar 312 (ATV312)","Altivar 320 (ATV320)","Altivar 340 (ATV340)","Altivar 610 (ATV610)","Altivar 630 (ATV630)","Altivar 650 (ATV650)","Altivar 660 (ATV660)","Altivar 680 (ATV680)","Altivar 930 (ATV930)","Altivar 950 (ATV950)"],
    "Danfoss": ["VLT Micro Drive FC 51","VLT HVAC Drive FC 102","VLT Refrigeration Drive FC 103","VLT AQUA Drive FC 202","VLT AutomationDrive FC 301","VLT AutomationDrive FC 302","VLT DriveMotor FCP 106","VLT DriveMotor FCM 106","VLT 2800","VLT 5000","VLT 6000","VACON 10","VACON 20","VACON 100","VACON 100 FLOW","VACON 100 INDUSTRIAL","VACON NXL","VACON NXP"],
    "Yaskawa": ["J1000","V1000","A1000","H1000","U1000","L1000A","GA500","GA700","GA800","P1000","CIMR-G7 (G7)","CIMR-F7 (F7)","CIMR-E7 (E7)","VS Mini J7"],
    "Lenze": ["8200 vector","8400 BaseLine","8400 StateLine","8400 HighLine","8400 TopLine","i500","i550","i700","E94","SMVector","MC1000"],
    "Mitsubishi": ["FR-D700 (FR-D720/FR-D740)","FR-D720S","FR-D820","FR-D840","FR-E700 (FR-E720/FR-E740)","FR-E800","FR-F700 (FR-F720/FR-F740)","FR-F800","FR-A700 (FR-A720/FR-A740)","FR-A800","FR-A800Plus"],
    "Omron": ["3G3JV","3G3MV","3G3RV","3G3FV","MX2","RX","V1000 (Omron)","J1000 (Omron)"],
    "SEW-Eurodrive": ["MOVITRAC B","MOVITRAC LTE-B","MOVITRAC MC07","MOVITRAC advanced","MOVIDRIVE B","MOVIDRIVE modular","MDX60B","MDX61B","MCV40A","MOVIMOT","MOVI-C CONTROLLER"],
    "Allen Bradley": ["PowerFlex 4","PowerFlex 4M","PowerFlex 40","PowerFlex 40P","PowerFlex 400","PowerFlex 523","PowerFlex 525","PowerFlex 527","PowerFlex 753","PowerFlex 755","PowerFlex 6000","PowerFlex 7000"],
    "Bosch Rexroth": ["EcoDrive DKC01","EcoDrive DKC02","EcoDrive DKC03","EcoDrive DKC11","Frequency Converter FV","Sytronix SvP 7020"],
  },
  servo: {
    "Fanuc": ["αiSV 4","αiSV 20","αiSV 40","αiSV 80","αiSV 160","αiSV 360","αiSP 15","αiSP 30","αiSP 45","βiSV 20","βiSV 40","βiSV 80","βiSP 11","βiSP 22","A06B-6130 serisi","A06B-6140 serisi","A06B-6141 serisi","A06B-6160 serisi","A06B-6164 serisi","A06B-6200 serisi","A06B-6240 serisi","A06B-6250 serisi"],
    "Siemens": ["SINAMICS S120","SINAMICS S210","SIMODRIVE 611","SIMODRIVE 611A","SIMODRIVE 611D","SIMODRIVE 611U","SIMOVERT MASTERDRIVES MC"],
    "Yaskawa": ["Sigma-5 (SGDV)","Sigma-7 (SGD7S)","SGD7W","SGD7C","SGD7F","SGDV serisi","SGDS serisi"],
    "Mitsubishi": ["MR-J2S-10A","MR-J2S-20A","MR-J2S-40A","MR-J2S-70A","MR-J2S-100A","MR-J2S-200A","MR-J3-10A","MR-J3-20A","MR-J3-40A","MR-J3-70A","MR-J3-100A","MR-J3-200A","MR-J3-350A","MR-J4-10A","MR-J4-20A","MR-J4-40A","MR-J4-70A","MR-J4-100A","MR-J4-200A","MR-J4-350A","MR-JE-10A","MR-JE-20A","MR-JE-40A","MR-JE-70A","MR-JE-100A","MR-J5-10G","MR-J5-20G","MR-J5-40G","MR-J5-70G","MR-J5-100G","MR-J5-200G"],
    "Bosch Rexroth": ["IndraDrive C HCS01","IndraDrive C HCS02","IndraDrive C HCS03","IndraDrive M HMS01","IndraDrive M HMS02","IndraDrive M HMD01","IndraDrive Mi KCU02","IndraDrive Mi KSM","EcoDrive DKC01","EcoDrive DKC02","EcoDrive DKC03","EcoDrive DKC11"],
    "Lenze": ["9300 servo PLC","ECSxSxxx","i700 servo","S300"],
    "Panasonic": ["MINAS A4 (MQMD/MSMD)","MINAS A5 (MADDT/MBDDT)","MINAS A5B","MINAS A5N","MINAS A5E","MINAS A6 (MADLN/MBDLN)","MINAS A6B","MINAS A6N","MINAS A6 Multi-Network","MINAS E (MSMD/MQMA)","MINAS E1","LIQI"],
    "Beckhoff": ["AX5101","AX5106","AX5112","AX5118","AX5125","AX5140","AX5160","AX5172","AX5190","AX5191","AX5192","AX8206","AX8640"],
    "ABB": ["ACSM1","MicroFlex e150","MicroFlex e190","MotiFlex e180","MultiFlex"],
    "Omron": ["Accurax G5","1S serisi","R88D-KN serisi","R88D-GT serisi"],
  },
  plc: {
    "Siemens": ["LOGO!","SIMATIC S7-200","SIMATIC S7-200 SMART","SIMATIC S7-300 CPU 312","SIMATIC S7-300 CPU 314","SIMATIC S7-300 CPU 315","SIMATIC S7-300 CPU 317","SIMATIC S7-300 CPU 319","SIMATIC S7-400 CPU 412","SIMATIC S7-400 CPU 414","SIMATIC S7-400 CPU 416","SIMATIC S7-400 CPU 417","SIMATIC S7-1200 CPU 1211C","SIMATIC S7-1200 CPU 1212C","SIMATIC S7-1200 CPU 1214C","SIMATIC S7-1200 CPU 1215C","SIMATIC S7-1500 CPU 1511","SIMATIC S7-1500 CPU 1513","SIMATIC S7-1500 CPU 1515","SIMATIC S7-1500 CPU 1516","SIMATIC S7-1500 CPU 1518","SIMATIC ET 200S","SIMATIC ET 200M","SIMATIC ET 200SP"],
    "Allen Bradley": ["MicroLogix 1000","MicroLogix 1100","MicroLogix 1200","MicroLogix 1400","MicroLogix 1500","SLC 5/01","SLC 5/02","SLC 5/03","SLC 5/04","SLC 5/05","CompactLogix L16E","CompactLogix L23E","CompactLogix L27ERM","CompactLogix L30ER","CompactLogix L32E","CompactLogix L33ER","CompactLogix L36ERM","ControlLogix L61","ControlLogix L62","ControlLogix L63","ControlLogix L64","ControlLogix L65","PLC-5/10","PLC-5/20","PLC-5/30","PLC-5/40","PLC-5/80"],
    "Mitsubishi": ["MELSEC FX1S","MELSEC FX1N","MELSEC FX2N","MELSEC FX3U","MELSEC FX3G","MELSEC FX3GC","MELSEC FX3UC","MELSEC FX5U","MELSEC FX5UC","MELSEC Q00","MELSEC Q01","MELSEC Q02H","MELSEC Q06H","MELSEC Q13H","MELSEC Q26H","MELSEC L02S","MELSEC L06K","MELSEC L26CPU","MELSEC iQ-R04","MELSEC iQ-R08","MELSEC iQ-R16","MELSEC iQ-R32","MELSEC iQ-R120"],
    "Omron": ["CP1E","CP1H","CP1L","CP2E","CJ1M","CJ2M","CJ2H","CS1D","CS1H","CS1G","NX1P2","NX102","NX102-9020","NJ101","NJ301","NJ501","NX7 serisi"],
    "Schneider": ["Twido","Modicon M221","Modicon M241","Modicon M251","Modicon M262","Modicon M340","Modicon M580","Modicon Premium TSX 57","Modicon Quantum 140"],
    "Beckhoff": ["CX5120","CX5130","CX5140","CX5160","CX5180","CX2020","CX2030","CX2040","CX2042","CX2062","CX8080","CX8190","CX9020","CX7028","CX7000","BK9050","EK1100","EK1101"],
    "Fanuc": ["FANUC PMC-SA1","FANUC PMC-SB7","FANUC PMC-SD","FANUC PMC-SL"],
  },
  hmi: {
    "Siemens": ["SIMATIC KP400 Comfort","SIMATIC KTP400 Basic","SIMATIC KTP700 Basic","SIMATIC KTP900 Basic","SIMATIC KTP1200 Basic","SIMATIC TP700 Comfort","SIMATIC TP900 Comfort","SIMATIC TP1200 Comfort","SIMATIC TP1500 Comfort","SIMATIC TP177A","SIMATIC TP177B","SIMATIC TP277","SIMATIC MP277","SIMATIC MP377","SIMATIC IPC277D","SIMATIC IPC477D"],
    "Mitsubishi": ["GOT1000 GT10","GOT1000 GT11","GOT1000 GT12","GOT1000 GT15","GOT2000 GT21","GOT2000 GT23","GOT2000 GT25","GOT2000 GT27"],
    "Omron": ["NS5-SQ10-V2","NS8-TV00-V2","NS10-TV00-V2","NS12-TS00-V2","NS15-TX01-V2","NB3Q-TW00B","NB5Q-TW00B","NB7W-TW00B","NB10W-TW00B","NA5-7W","NA5-9W","NA5-12W","NA5-15W"],
    "Schneider": ["Magelis XBT-N","Magelis XBT-RT","Magelis XBT-GT","Magelis XBT-GK","Magelis GTO","Magelis GTU","Magelis HMISTO511","Magelis HMISTU855","Magelis HMIGTO2310","Magelis HMIGTU"],
    "Allen Bradley": ["PanelView 300 Micro","PanelView 550","PanelView 600","PanelView 900","PanelView 1000","PanelView 1200","PanelView 1400","PanelView Plus 6 / 7 400","PanelView Plus 6 / 7 600","PanelView Plus 6 / 7 700","PanelView Plus 6 / 7 900","PanelView Plus 6 / 7 1000","PanelView Plus 6 / 7 1250","PanelView Plus 6 / 7 1500"],
    "Fanuc": ["FANUC iHMI","Proface GP3000 (OEM)","Proface GP4000 (OEM)"],
  },
  kart: {
    "Siemens": ["SINAMICS güç kartı","SINAMICS kontrol kartı (CU320/CU310/CU230)","MICROMASTER 440 kontrol kartı","SIMOVERT kontrol kartı","SIMATIC I/O modülü","SIMATIC CPU kartı"],
    "ABB": ["SINT4130C","RINT5614C","RDCU-02C","RMIO","REFU-04","ACS800 kontrol kartı","ACS550 kontrol kartı","ACS880 kontrol kartı"],
    "Fanuc": ["A20B-xxxx servo kontrol kartı","A16B-xxxx anakart","A06B-6xxx sürücü kartı","A87L-0001 ekran kartı","A02B-xxxx güç kartı"],
    "Yaskawa": ["ETP616185 kontrol kartı","ETP001285","YPHT31085","GA700 kontrol kartı","A1000 kontrol kartı"],
    "Lenze": ["8200 kontrol kartı","i700 kontrol kartı","E94 I/O kartı"],
    "Mitsubishi": ["FR-A800 kontrol kartı","MR-J4 servo kontrol kartı","Q02H CPU kartı","FX3U anakart"],
    "Schneider": ["ATV71 kontrol kartı","ATV630 kontrol kartı","Modicon M340 CPU kartı"],
    "SEW-Eurodrive": ["MOVITRAC B kontrol kartı","MOVIDRIVE B opsiyonel kartı","MDX kontrol kartı"],
    "Bosch Rexroth": ["IndraDrive kontrol kartı (CSB01)","IndraDrive güç kartı (HMS01)","EcoDrive DKC kontrol modülü"],
    "Danfoss": ["FC 302 kontrol kartı","VACON NXP kontrol kartı","VLT kontrol kartı"],
    "Omron": ["MX2 kontrol kartı","RX kontrol kartı","Accurax G5 kontrol kartı"],
  },
};

/* ─────────────────────────────────────────────
   SABİTLER
───────────────────────────────────────────── */
const WA_NUMBER = "905322664764";

interface WizardState {
  deviceType: string; deviceLabel: string;
  brand: string; model: string; modelCustom: string;
  errorCode: string; faultDesc: string;
  name: string; phone: string; userEmail: string;
}
const INIT: WizardState = {
  deviceType: "", deviceLabel: "", brand: "", model: "", modelCustom: "",
  errorCode: "", faultDesc: "", name: "", phone: "", userEmail: "",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

/* ─────────────────────────────────────────────
   ADIM GÖSTERGESİ
───────────────────────────────────────────── */
const STEPS = ["Cihaz Türü", "Marka & Model", "Bildirim"];

function StepBar({ current }: { current: number }) {
  return (
    <div className="mb-7">
      <div className="flex items-center">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done   = current > n;
          const active = current === n;
          return (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  done   ? "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                  : active ? "bg-white text-black shadow-[0_0_16px_rgba(255,255,255,0.2)]"
                  : "bg-white/8 text-white/40 border border-white/10"
                }`}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : n}
                  {active && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-white/20" />
                  )}
                </div>
                <span className={`mt-1.5 text-[10px] font-medium leading-none whitespace-nowrap ${
                  active ? "text-white" : done ? "text-green-400" : "text-white/30"
                }`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative flex-1 mx-2 mb-4">
                  <div className="h-px w-full bg-white/10" />
                  <motion.div
                    className="absolute inset-0 h-px bg-green-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: done ? 1 : 0 }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SHARED INPUT STYLE
───────────────────────────────────────────── */
const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors";
const selectCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors";

/* ─────────────────────────────────────────────
   ANA BİLEŞEN
───────────────────────────────────────────── */
export function FaultReportWizard() {
  const [step,       setStep]       = useState(1);
  const [direction,  setDirection]  = useState(1);
  const [data,       setData]       = useState<WizardState>(INIT);
  const [sentVia,    setSentVia]    = useState<"whatsapp" | "email" | null>(null);
  const [sending,    setSending]    = useState(false);
  const [emailError, setEmailError] = useState("");

  const go = (n: number) => { setDirection(n > step ? 1 : -1); setStep(n); };
  const set = (k: keyof WizardState, v: string) => setData(d => ({ ...d, [k]: v }));

  const modelList    = MODELS[data.deviceType]?.[data.brand] ?? [];
  const isCustom     = data.model === "__custom__";
  const effectModel  = isCustom ? data.modelCustom.trim() : data.model;
  const effectBrand  = data.brand === "Diğer" ? data.modelCustom : data.brand;

  const canNext2 = !!data.brand && !!effectModel;
  const canBase  = !!data.faultDesc.trim() && !!data.name.trim();
  const canEmail = canBase && !!data.userEmail.trim();

  function waMessage() {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent([
      "🔧 *Arıza Bildirimi — Burem Elektronik*", "",
      `📦 *Cihaz Türü:* ${data.deviceLabel}`,
      `🏷️ *Marka:* ${effectBrand}`,
      `🔩 *Model:* ${effectModel}`,
      data.errorCode ? `⚠️ *Hata Kodu:* ${data.errorCode}` : null, "",
      `📋 *Arıza Açıklaması:*\n${data.faultDesc}`, "",
      `👤 *Ad Soyad:* ${data.name}`,
      data.phone ? `📞 *Telefon:* ${data.phone}` : null,
    ].filter(Boolean).join("\n"))}`;
  }

  function handleWA() {
    window.open(waMessage(), "_blank", "noopener,noreferrer");
    setSentVia("whatsapp");
  }

  async function handleEmail() {
    if (!data.userEmail.trim()) { setEmailError("E-posta adresinizi girin."); return; }
    setEmailError(""); setSending(true);
    try {
      const res = await fetch("/api/fault-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceLabel: data.deviceLabel, brand: effectBrand, model: effectModel, errorCode: data.errorCode, faultDesc: data.faultDesc, name: data.name, phone: data.phone, userEmail: data.userEmail }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setEmailError(d.error || "Mail gönderilemedi, tekrar deneyin.");
        setSending(false); return;
      }
    } catch {
      setEmailError("Bağlantı hatası, tekrar deneyin.");
      setSending(false); return;
    }
    setSending(false); setSentVia("email");
  }

  function reset() { setData(INIT); setStep(1); setSentVia(null); setSending(false); setEmailError(""); }

  /* ── BAŞARILI ── */
  if (sentVia) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center"
        data-testid="wizard-success"
      >
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${sentVia === "whatsapp" ? "bg-[#25D366]/15" : "bg-blue-500/15"}`}>
          {sentVia === "whatsapp"
            ? <MessageCircle className="h-8 w-8 text-[#25D366]" />
            : <Mail className="h-8 w-8 text-blue-400" />
          }
        </div>
        <div>
          <p className="text-lg font-bold text-white">
            {sentVia === "whatsapp" ? "WhatsApp Açıldı!" : "Mesajınız İletildi!"}
          </p>
          <p className="mt-1.5 text-sm text-white/50 max-w-xs">
            {sentVia === "whatsapp"
              ? "Hazırlanan mesajı göndermek için WhatsApp'ta \"Gönder\" tuşuna basın."
              : "Arıza bildiriminiz info@buremelektronik.com adresine gönderildi. En kısa sürede dönüş yapacağız."
            }
          </p>
        </div>
        <button
          onClick={reset}
          className="mt-1 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          data-testid="button-wizard-reset"
        >
          Yeni Bildirim
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mt-5" data-testid="wizard-fault-report">
      <StepBar current={step} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >

            {/* ─── ADIM 1: Cihaz Türü ─── */}
            {step === 1 && (
              <div data-testid="wizard-step-1">
                <p className="mb-3 text-xs text-white/40 font-medium uppercase tracking-wider">Arızalı cihazın türünü seçin</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEVICE_TYPES.map(({ id, label, sub, Icon }) => {
                    const active = data.deviceType === id;
                    return (
                      <button
                        key={id}
                        onClick={() => { set("deviceType", id); set("deviceLabel", label + " / " + sub); set("brand", ""); set("model", ""); set("modelCustom", ""); }}
                        className={`group relative flex flex-col gap-1.5 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                          active
                            ? "border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                            : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/6"
                        }`}
                        data-testid={`button-device-${id}`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${active ? "bg-white text-black" : "bg-white/8 text-white/50 group-hover:bg-white/12 group-hover:text-white/70"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold leading-tight ${active ? "text-white" : "text-white/70"}`}>{label}</p>
                          <p className={`text-[11px] leading-tight mt-0.5 ${active ? "text-white/50" : "text-white/30"}`}>{sub}</p>
                        </div>
                        {active && (
                          <div className="absolute top-2.5 right-2.5">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => go(2)}
                  disabled={!data.deviceType}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-black hover:bg-white/90 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                  data-testid="button-wizard-next-1"
                >
                  Devam <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* ─── ADIM 2: Marka & Model ─── */}
            {step === 2 && (
              <div className="space-y-3" data-testid="wizard-step-2">
                {/* Seçilen cihaz chip */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/60">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    {data.deviceLabel}
                  </span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Marka *</label>
                  <select
                    value={data.brand}
                    onChange={e => { set("brand", e.target.value); set("model", ""); set("modelCustom", ""); }}
                    className={selectCls}
                    data-testid="select-brand"
                  >
                    <option value="">Marka seçin...</option>
                    {(BRANDS_BY_TYPE[data.deviceType] ?? []).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                {data.brand && data.brand !== "Diğer" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Model *</label>
                    {modelList.length > 0 ? (
                      <>
                        <select
                          value={data.model}
                          onChange={e => { set("model", e.target.value); set("modelCustom", ""); }}
                          className={selectCls}
                          data-testid="select-model"
                        >
                          <option value="">Model seçin...</option>
                          {modelList.map(m => <option key={m} value={m}>{m}</option>)}
                          <option value="__custom__">Listede yok / Manuel giriş</option>
                        </select>
                        {isCustom && (
                          <input
                            type="text" value={data.modelCustom}
                            onChange={e => set("modelCustom", e.target.value)}
                            placeholder="Model adını yazın..."
                            className={`mt-2 ${inputCls}`}
                            data-testid="input-model-custom"
                          />
                        )}
                      </>
                    ) : (
                      <input type="text" value={data.modelCustom}
                        onChange={e => { set("modelCustom", e.target.value); set("model", "__custom__"); }}
                        placeholder="Ör: SINAMICS G120, ACS550..."
                        className={inputCls} data-testid="input-model" />
                    )}
                  </div>
                )}

                {data.brand === "Diğer" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Marka adı *</label>
                      <input type="text" value={data.modelCustom}
                        onChange={e => { set("modelCustom", e.target.value); set("model", "__custom__"); }}
                        placeholder="Marka..." className={inputCls} data-testid="input-brand-custom" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Model *</label>
                      <input type="text" value={data.model === "__custom__" ? "" : data.model}
                        onChange={e => set("model", e.target.value)}
                        placeholder="Model..." className={inputCls} data-testid="input-model-other" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Hata Kodu <span className="normal-case font-normal">(varsa)</span></label>
                  <input type="text" value={data.errorCode}
                    onChange={e => set("errorCode", e.target.value)}
                    placeholder="Ör: F0001, AL.10, Err01..."
                    className={inputCls} data-testid="input-error-code" />
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => go(1)} className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors" data-testid="button-wizard-back-2">
                    <ChevronLeft className="h-4 w-4" /> Geri
                  </button>
                  <button onClick={() => go(3)} disabled={!canNext2}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-black hover:bg-white/90 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    data-testid="button-wizard-next-2">
                    Devam <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── ADIM 3: Arıza Detayı & Gönderim ─── */}
            {step === 3 && (
              <div className="space-y-4" data-testid="wizard-step-3">
                {/* Özet chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[data.deviceLabel.split(" / ")[0], effectBrand, effectModel].filter(Boolean).map((v, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-xs text-white/50">
                      <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" /> {v}
                    </span>
                  ))}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Arıza Açıklaması *</label>
                  <textarea value={data.faultDesc} onChange={e => set("faultDesc", e.target.value)}
                    placeholder="Cihazın belirtileri, ne zaman başladığı, varsa denenen işlemler..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                    data-testid="textarea-fault-desc" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Ad Soyad *</label>
                    <input type="text" value={data.name} onChange={e => set("name", e.target.value)}
                      placeholder="Ad Soyad" className={inputCls} data-testid="input-wizard-name" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white/40 uppercase tracking-wider">Telefon</label>
                    <input type="tel" value={data.phone} onChange={e => set("phone", e.target.value)}
                      placeholder="05xx..." className={inputCls} data-testid="input-wizard-phone" />
                  </div>
                </div>

                {/* Gönderim seçenekleri */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Nasıl iletmek istersiniz?</p>

                  {/* WhatsApp */}
                  <button onClick={handleWA} disabled={!canBase}
                    className="group flex w-full items-center gap-3.5 rounded-2xl border border-[#25D366]/25 bg-[#25D366]/8 px-4 py-3.5 text-left transition-all hover:border-[#25D366]/50 hover:bg-[#25D366]/15 disabled:opacity-30 disabled:cursor-not-allowed"
                    data-testid="button-wizard-whatsapp">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366]/20 transition-colors group-hover:bg-[#25D366]/30">
                      <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">WhatsApp ile Gönder</p>
                      <p className="text-xs text-white/40">Hazır mesaj açılır, siz onaylarsınız</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-white/20 flex-shrink-0 group-hover:text-white/40 transition-colors" />
                  </button>

                  {/* E-posta */}
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 space-y-2.5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                        <Mail className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">E-posta ile Gönder</p>
                        <p className="text-xs text-white/40">info@buremelektronik.com adresine iletilir</p>
                      </div>
                    </div>
                    <input type="email" value={data.userEmail}
                      onChange={e => { set("userEmail", e.target.value); setEmailError(""); }}
                      placeholder="E-posta adresiniz (yanıt için)..."
                      className={inputCls}
                      data-testid="input-user-email" />
                    {emailError && <p className="text-xs text-red-400" data-testid="text-email-error">{emailError}</p>}
                    <button onClick={handleEmail} disabled={!canEmail || sending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      data-testid="button-wizard-email">
                      {sending ? <><Loader2 className="h-4 w-4 animate-spin" /> Gönderiliyor...</> : "Maili Gönder"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => go(2)} className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors" data-testid="button-wizard-back-3">
                    <ChevronLeft className="h-3.5 w-3.5" /> Geri
                  </button>
                  <p className="text-[11px] text-white/25 leading-snug">
                    Bilgileriniz yalnızca arızanızı değerlendirmek amacıyla kullanılır.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
