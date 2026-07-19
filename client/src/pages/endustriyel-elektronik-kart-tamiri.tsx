import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "Endüstriyel Elektronik Kart Tamiri | Burem Elektronik – Bursa",
  metaDescription: "CNC, PLC, inverter ve güç kartı tamiri Bursa. Komponent düzeyinde PCB onarımı, SMPS ve sürücü devresi tamir.",
  canonical: "/endustriyel-elektronik-kart-tamiri",
  title: "Endüstriyel Elektronik Kart Tamiri",
  h1: "Endüstriyel Elektronik Kart Tamiri",
  intro: "Endüstriyel kontrol kartları, güç kaynakları ve sürücü devreleri, çevresel etkenler ve uzun ömürlü kullanım nedeniyle arızalanabilir. Burem Elektronik, komponent düzeyinde PCB onarımı ile bu kartların yeniden işler hâle getirilmesini sağlar.",
  commonFaults: [
    "Yanmış veya kırık SMD komponentler",
    "Güç kaynağı (SMPS) arızaları",
    "Sürücü entegre hasarı (IGBT, MOSFET)",
    "Korozyon ve nem kaynaklı hasar",
    "Mikrokontrolör ve DSP arızaları",
    "Optokuplör ve izolatör hataları",
    "Hat filtresi ve bobin hasarı",
    "PCB iz kopukluğu",
  ],
  repairProcess: [
    { step: "Görsel ve Termal Analiz", desc: "Kart termal kamera ve görsel inceleme ile taranır." },
    { step: "In-Circuit Test", desc: "Aktif ve pasif bileşenler devre üzerinde ölçülür." },
    { step: "Komponent Değişimi", desc: "Hasarlı SMD ve THT bileşenler BGA/SMD istasyonunda değiştirilir." },
    { step: "Kart Temizleme", desc: "Korozyon ve kirlilik ultrasonik yıkama ile giderilir." },
    { step: "Fonksiyonel Test", desc: "Kart cihaz üzerinde ya da simülatörle test edilerek onaylanır." },
  ],
  brandsModels: [
    "Siemens kontrol kartları", "ABB sürücü kartları", "Fanuc servo amplifier kartları",
    "Lenze güç kartları", "Yaskawa kontrol kartları", "CNC güç kaynakları",
    "SMPS güç kartları", "Motor sürücü devreleri", "PLC I/O modülleri",
    "Robotik sistem kartları", "UPS kontrol kartları", "Kaynak makinesi kartları",
  ],
  relatedServices: [
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "PLC Tamiri", href: "/plc-tamiri" },
    { label: "HMI Panel Tamiri", href: "/hmi-operator-panel-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function ElektronikKartTamiri() {
  return <ServicePageTemplate data={data} />;
}
