import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronRight, ChevronLeft, MessageCircle, Mail, Loader2, Zap, Cpu, LayoutGrid, Monitor, CircuitBoard, HelpCircle } from "lucide-react";

/* ── veri ── */
const DEVICE_TYPES = [
  { id: "inverter", label: "İnverter / Frekans Dönüştürücü", Icon: Zap },
  { id: "servo",    label: "Servo Sürücü",                   Icon: Cpu },
  { id: "plc",      label: "PLC",                            Icon: LayoutGrid },
  { id: "hmi",      label: "HMI / Operatör Panel",           Icon: Monitor },
  { id: "kart",     label: "Elektronik Kart",                Icon: CircuitBoard },
  { id: "diger",    label: "Diğer",                          Icon: HelpCircle },
];

const BRANDS_BY_TYPE: Record<string, string[]> = {
  inverter: ["Siemens","ABB","Schneider","Danfoss","Yaskawa","Lenze","Mitsubishi","Omron","SEW-Eurodrive","Allen Bradley","Bosch Rexroth","Diğer"],
  servo:    ["Fanuc","Siemens","Yaskawa","Mitsubishi","Bosch Rexroth","Lenze","Panasonic","Beckhoff","ABB","Omron","Diğer"],
  plc:      ["Siemens","Allen Bradley","Mitsubishi","Omron","Schneider","Beckhoff","Fanuc","Diğer"],
  hmi:      ["Siemens","Mitsubishi","Omron","Schneider","Allen Bradley","Fanuc","Diğer"],
  kart:     ["Siemens","ABB","Fanuc","Yaskawa","Lenze","Mitsubishi","Schneider","SEW-Eurodrive","Bosch Rexroth","Danfoss","Omron","Diğer"],
  diger:    ["Siemens","ABB","Fanuc","Yaskawa","Lenze","Mitsubishi","Schneider","SEW-Eurodrive","Bosch Rexroth","Danfoss","Omron","Allen Bradley","Beckhoff","Panasonic","Diğer"],
};

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

const WA_NUMBER = "905322664764";

interface State {
  deviceType: string; deviceLabel: string;
  brand: string; model: string; modelCustom: string;
  errorCode: string; faultDesc: string;
  name: string; phone: string; userEmail: string;
}
const INIT: State = { deviceType:"",deviceLabel:"",brand:"",model:"",modelCustom:"",errorCode:"",faultDesc:"",name:"",phone:"",userEmail:"" };

/* ── input styles ── */
const inp = "w-full bg-transparent border-b border-foreground/20 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/60 transition-colors";
const sel = "w-full bg-background border border-foreground/20 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-foreground/50 transition-colors";

export function FaultReportWizard() {
  const [step, setStep] = useState(1);
  const [dir,  setDir]  = useState(1);
  const [data, setData] = useState<State>(INIT);
  const [sentVia,    setSentVia]    = useState<"whatsapp"|"email"|null>(null);
  const [sending,    setSending]    = useState(false);
  const [emailError, setEmailError] = useState("");

  const go  = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };
  const set = (k: keyof State, v: string) => setData(d => ({ ...d, [k]: v }));

  const models      = MODELS[data.deviceType]?.[data.brand] ?? [];
  const isCustom    = data.model === "__custom__";
  const effModel    = isCustom ? data.modelCustom.trim() : data.model;
  const effBrand    = data.brand === "Diğer" ? data.modelCustom : data.brand;

  const okNext2     = !!data.brand && !!effModel;
  const okBase      = !!data.faultDesc.trim() && !!data.name.trim();
  const okEmail     = okBase && !!data.userEmail.trim();

  function waUrl() {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent([
      "🔧 *Arıza Bildirimi — Burem Elektronik*","",
      `📦 *Cihaz Türü:* ${data.deviceLabel}`,
      `🏷️ *Marka:* ${effBrand}`,
      `🔩 *Model:* ${effModel}`,
      data.errorCode ? `⚠️ *Hata Kodu:* ${data.errorCode}` : null,"",
      `📋 *Arıza Açıklaması:*\n${data.faultDesc}`,"",
      `👤 *Ad Soyad:* ${data.name}`,
      data.phone ? `📞 *Telefon:* ${data.phone}` : null,
    ].filter(Boolean).join("\n"))}`;
  }

  function handleWA() {
    window.open(waUrl(), "_blank", "noopener,noreferrer");
    setSentVia("whatsapp");
  }

  async function handleEmail() {
    if (!data.userEmail.trim()) { setEmailError("E-posta adresinizi girin."); return; }
    setEmailError(""); setSending(true);
    try {
      const res = await fetch("/api/fault-report", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ deviceLabel:data.deviceLabel, brand:effBrand, model:effModel, errorCode:data.errorCode, faultDesc:data.faultDesc, name:data.name, phone:data.phone, userEmail:data.userEmail }),
      });
      if (!res.ok) { const d = await res.json().catch(()=>({})); setEmailError(d.error||"Gönderilemedi."); setSending(false); return; }
    } catch { setEmailError("Bağlantı hatası."); setSending(false); return; }
    setSending(false); setSentVia("email");
  }

  function reset() { setData(INIT); setStep(1); setSentVia(null); setSending(false); setEmailError(""); }

  /* success */
  if (sentVia) return (
    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="py-10 text-center space-y-3" data-testid="wizard-success">
      <div className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full ${sentVia==="whatsapp"?"bg-[#25D366]/15":"bg-blue-500/10"}`}>
        {sentVia==="whatsapp" ? <MessageCircle className="h-7 w-7 text-[#25D366]"/> : <Mail className="h-7 w-7 text-blue-400"/>}
      </div>
      <p className="font-semibold text-foreground">{sentVia==="whatsapp" ? "WhatsApp açıldı!" : "Mesajınız iletildi!"}</p>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {sentVia==="whatsapp"
          ? "Mesajı göndermek için WhatsApp'ta \"Gönder\" tuşuna basın."
          : "info@buremelektronik.com adresine gönderildi. En kısa sürede dönüş yapacağız."}
      </p>
      <button onClick={reset} className="mt-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors" data-testid="button-wizard-reset">
        Yeni bildirim
      </button>
    </motion.div>
  );

  /* step progress bar */
  const pct = step === 1 ? 0 : step === 2 ? 50 : 100;

  return (
    <div className="mt-6" data-testid="wizard-fault-report">

      {/* ── sade üst bant ── */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
          <span className={step >= 1 ? "text-foreground font-medium" : ""}>Cihaz Türü</span>
          <span className={step >= 2 ? "text-foreground font-medium" : ""}>Marka & Model</span>
          <span className={step >= 3 ? "text-foreground font-medium" : ""}>Bildirim</span>
        </div>
        <div className="relative h-0.5 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-foreground rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={step} custom={dir}
          variants={{ enter: (d:number)=>({x:d>0?24:-24,opacity:0}), center:{x:0,opacity:1}, exit:(d:number)=>({x:d>0?-24:24,opacity:0}) }}
          initial="enter" animate="center" exit="exit"
          transition={{duration:0.2,ease:"easeOut"}}
        >

          {/* ── ADIM 1 ── */}
          {step === 1 && (
            <div data-testid="wizard-step-1">
              <p className="text-xs text-muted-foreground mb-4">Arızalı cihazın türünü seçin</p>
              <div className="space-y-1.5">
                {DEVICE_TYPES.map(({ id, label, Icon }) => {
                  const active = data.deviceType === id;
                  return (
                    <button key={id} onClick={() => { set("deviceType",id); set("deviceLabel",label); set("brand",""); set("model",""); set("modelCustom",""); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        active ? "bg-foreground text-background" : "bg-foreground/5 hover:bg-foreground/10 text-foreground"
                      }`} data-testid={`button-device-${id}`}>
                      <Icon className={`h-4 w-4 flex-shrink-0 ${active ? "opacity-80" : "opacity-40"}`} />
                      <span className="text-sm font-medium">{label}</span>
                      {active && <CheckCircle2 className="ml-auto h-4 w-4 opacity-70" />}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => go(2)} disabled={!data.deviceType}
                className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-20"
                data-testid="button-wizard-next-1">
                Devam <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── ADIM 2 ── */}
          {step === 2 && (
            <div className="space-y-5" data-testid="wizard-step-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Marka *</label>
                <div className="flex flex-wrap gap-1.5">
                  {(BRANDS_BY_TYPE[data.deviceType]??[]).map(b => (
                    <button key={b} onClick={() => { set("brand",b); set("model",""); set("modelCustom",""); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        data.brand===b ? "bg-foreground text-background border-foreground" : "border-foreground/20 text-foreground/70 hover:border-foreground/50 hover:text-foreground"
                      }`} data-testid={`button-brand-${b}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {data.brand && data.brand !== "Diğer" && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Model *</label>
                  {models.length > 0 ? (
                    <>
                      <select value={data.model} onChange={e => { set("model",e.target.value); set("modelCustom",""); }} className={sel} data-testid="select-model">
                        <option value="">Seçin...</option>
                        {models.map(m => <option key={m} value={m}>{m}</option>)}
                        <option value="__custom__">Listede yok / Manuel giriş</option>
                      </select>
                      {isCustom && (
                        <input type="text" value={data.modelCustom} onChange={e => set("modelCustom",e.target.value)}
                          placeholder="Model adını yazın..." className={`mt-3 ${inp}`} data-testid="input-model-custom" />
                      )}
                    </>
                  ) : (
                    <input type="text" value={data.modelCustom} onChange={e => { set("modelCustom",e.target.value); set("model","__custom__"); }}
                      placeholder="Ör: SINAMICS G120..." className={inp} data-testid="input-model" />
                  )}
                </div>
              )}

              {data.brand === "Diğer" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Marka adı *</label>
                    <input type="text" value={data.modelCustom} onChange={e => { set("modelCustom",e.target.value); set("model","__custom__"); }}
                      placeholder="Marka..." className={inp} data-testid="input-brand-custom" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Model *</label>
                    <input type="text" value={data.model==="__custom__"?"":data.model} onChange={e => set("model",e.target.value)}
                      placeholder="Model..." className={inp} data-testid="input-model-other" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-muted-foreground mb-2">Hata Kodu <span className="opacity-50">(varsa)</span></label>
                <input type="text" value={data.errorCode} onChange={e => set("errorCode",e.target.value)}
                  placeholder="F0001, AL.10, Err01..." className={inp} data-testid="input-error-code" />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => go(1)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-foreground/15 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="button-wizard-back-2">
                  <ChevronLeft className="h-4 w-4" /> Geri
                </button>
                <button onClick={() => go(3)} disabled={!okNext2}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-20 transition-opacity"
                  data-testid="button-wizard-next-2">
                  Devam <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── ADIM 3 ── */}
          {step === 3 && (
            <div className="space-y-5" data-testid="wizard-step-3">
              {/* özet */}
              <div className="flex flex-wrap gap-1.5">
                {[data.deviceLabel, effBrand, effModel].filter(Boolean).map((v,i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground bg-foreground/5 border border-foreground/10 rounded-full px-2.5 py-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" /> {v}
                  </span>
                ))}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-2">Arıza Açıklaması *</label>
                <textarea value={data.faultDesc} onChange={e => set("faultDesc",e.target.value)} rows={3}
                  placeholder="Cihazın belirtileri, ne zaman başladığı..."
                  className={`${inp} resize-none`} data-testid="textarea-fault-desc" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Ad Soyad *</label>
                  <input type="text" value={data.name} onChange={e => set("name",e.target.value)} placeholder="Ad Soyad" className={inp} data-testid="input-wizard-name" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Telefon</label>
                  <input type="tel" value={data.phone} onChange={e => set("phone",e.target.value)} placeholder="05xx..." className={inp} data-testid="input-wizard-phone" />
                </div>
              </div>

              {/* gönderim seçenekleri */}
              <div className="pt-1 space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Nasıl iletmek istersiniz?</p>

                <button onClick={handleWA} disabled={!okBase}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20ba5a] transition-colors disabled:opacity-30"
                  data-testid="button-wizard-whatsapp">
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp ile Gönder</span>
                  <span className="ml-auto text-xs font-normal opacity-70">Hazır mesaj açılır</span>
                </button>

                <div className="rounded-xl border border-foreground/10 overflow-hidden">
                  <div className="px-4 py-3 flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-semibold">E-posta ile Gönder</span>
                    <span className="ml-auto text-xs text-muted-foreground">info@buremelektronik.com</span>
                  </div>
                  <div className="px-4 pb-4 space-y-2 border-t border-foreground/8">
                    <input type="email" value={data.userEmail} onChange={e => { set("userEmail",e.target.value); setEmailError(""); }}
                      placeholder="E-posta adresiniz..." className={`mt-3 ${inp}`} data-testid="input-user-email" />
                    {emailError && <p className="text-xs text-red-500" data-testid="text-email-error">{emailError}</p>}
                    <button onClick={handleEmail} disabled={!okEmail||sending}
                      className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-25 transition-opacity"
                      data-testid="button-wizard-email">
                      {sending ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Gönderiliyor...</span> : "Gönder"}
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => go(2)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-wizard-back-3">
                <ChevronLeft className="h-3.5 w-3.5" /> Geri
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
