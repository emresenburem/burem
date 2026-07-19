import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "PLC Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Siemens S7, Allen Bradley, Mitsubishi, Omron PLC tamiri Bursa. CPU kartı, I/O modülü ve güç kaynağı onarımı.",
  canonical: "/plc-tamiri",
  title: "PLC Tamiri",
  h1: "PLC (Programlanabilir Lojik Denetleyici) Tamiri",
  intro: "PLC arızaları üretim hattını tamamen durdurabilir. Burem Elektronik, Siemens S7, Allen Bradley, Mitsubishi, Omron ve diğer markalara ait PLC sistemlerinde CPU kartı, I/O modülü, güç kaynağı ve haberleşme modülü onarımı gerçekleştirir.",
  commonFaults: [
    "CPU kartı yanması veya başlatılamaması",
    "I/O modülü çıkış arızası",
    "Güç kaynağı voltaj düşüklüğü",
    "Batarya kaybı ve program silinmesi",
    "Haberleşme modülü (PROFIBUS, EtherNet/IP) arızası",
    "Racks/backplane sorunları",
    "Analog giriş/çıkış hataları",
    "Dokunmatik panel haberleşme kesintisi",
  ],
  repairProcess: [
    { step: "Program Yedekleme", desc: "Mümkünse arıza öncesinde mevcut program yedeği alınır veya müşteriden istenir." },
    { step: "Modül Testi", desc: "CPU, güç kaynağı ve tüm I/O modülleri ayrı ayrı test edilir." },
    { step: "Komponent Onarımı", desc: "Hasarlı kartlar komponent düzeyinde onarılır veya muadil modül ile değiştirilir." },
    { step: "Program Yükleme", desc: "Gerekiyorsa program yeniden yüklenerek doğrulaması yapılır." },
    { step: "Fonksiyonel Test", desc: "PLC tüm I/O kanalları ve haberleşme arabirimleri ile test edilir." },
  ],
  brandsModels: [
    "Siemens S7-300", "Siemens S7-400", "Siemens S7-1200",
    "Siemens S7-1500", "Allen Bradley ControlLogix", "Allen Bradley CompactLogix",
    "Mitsubishi Q Series", "Mitsubishi FX Series", "Omron CJ2M",
    "Omron CP1H", "Schneider Modicon M340", "Beckhoff CX",
  ],
  relatedServices: [
    { label: "HMI Panel Tamiri", href: "/hmi-operator-panel-tamiri" },
    { label: "Siemens Sürücü Tamiri", href: "/siemens-surucu-tamiri" },
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "Elektronik Kart Tamiri", href: "/endustriyel-elektronik-kart-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function PlcTamiri() {
  return <ServicePageTemplate data={data} />;
}
