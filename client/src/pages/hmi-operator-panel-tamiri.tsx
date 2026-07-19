import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "HMI Operatör Panel Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Siemens, Proface, Weintek, Mitsubishi HMI ve operatör panel tamiri Bursa. Ekran, dokunmatik ve kontrol kartı onarımı.",
  canonical: "/hmi-operator-panel-tamiri",
  title: "HMI Operatör Panel Tamiri",
  h1: "HMI ve Operatör Panel Tamiri",
  intro: "Endüstriyel dokunmatik ekranlar ve operatör panelleri, üretim hattının göz ve eli konumundadır. Burem Elektronik, Siemens, Proface, Weintek, Mitsubishi ve diğer markalara ait HMI cihazlarında ekran, dokunmatik yüzey ve kontrol kartı onarımı sunar.",
  commonFaults: [
    "Ekran görüntü bozukluğu veya parlaklık kaybı",
    "Dokunmatik yüzey tepkisizliği",
    "Backlight arızası",
    "Haberleşme bağlantısı kopuklukları",
    "Güç kaynağı sorunları",
    "CF kart veya flash bellek arızası",
    "Kontrol kartı hasarı",
    "Ekran renk kayması ve çizgilenmesi",
  ],
  repairProcess: [
    { step: "Görsel İnceleme", desc: "Ekran, kasa ve konektörler fiziksel hasar açısından incelenir." },
    { step: "Ekran Testi", desc: "LCD panel, arka aydınlatma ve dokunmatik katman ayrı ayrı test edilir." },
    { step: "Kart Analizi", desc: "Kontrol ve güç kartları osiloskop ile analiz edilir." },
    { step: "Parça Değişimi", desc: "LCD, dokunmatik film, backlight ya da kontrol kartı değiştirilir." },
    { step: "Yazılım Testi", desc: "HMI yazılımı yüklenerek tüm ekran ve haberleşme fonksiyonları test edilir." },
  ],
  brandsModels: [
    "Siemens KTP700", "Siemens KTP900", "Siemens TP1500",
    "Siemens MP377", "Proface GP4000", "Proface GP3000",
    "Weintek MT8000", "Mitsubishi GOT1000", "Mitsubishi GOT2000",
    "Allen Bradley PanelView", "Schneider Magelis", "Omron NB Series",
  ],
  relatedServices: [
    { label: "PLC Tamiri", href: "/plc-tamiri" },
    { label: "Siemens Sürücü Tamiri", href: "/siemens-surucu-tamiri" },
    { label: "Elektronik Kart Tamiri", href: "/endustriyel-elektronik-kart-tamiri" },
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function HmiTamiri() {
  return <ServicePageTemplate data={data} />;
}
