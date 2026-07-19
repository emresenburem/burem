import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "Siemens Sürücü Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Siemens SINAMICS, MICROMASTER ve SIMODRIVE sürücü tamiri Bursa. Güç modülü, kontrol kartı ve parametre onarımı.",
  canonical: "/siemens-surucu-tamiri",
  title: "Siemens Sürücü Tamiri",
  h1: "Siemens Sürücü Tamiri",
  intro: "Siemens SINAMICS, MICROMASTER ve SIMODRIVE serisi sürücüler, endüstriyel tesislerde yaygın biçimde kullanılmaktadır. Burem Elektronik, bu cihazlarda IGBT değişiminden parametre kurtarmaya kadar kapsamlı onarım hizmeti sunar.",
  commonFaults: [
    "F0001 – Aşırı akım hatası",
    "F0002 – Aşırı voltaj hatası",
    "F0003 – Düşük voltaj hatası",
    "F0004 – Sürücü aşırı sıcaklık",
    "F0011 – Motor aşırı sıcaklık",
    "F0041 – Motor arıza tanımlama",
    "Güç modülü IGBT hasarı",
    "CU (Kontrol Ünitesi) kart arızası",
  ],
  repairProcess: [
    { step: "Hata Kodu Analizi", desc: "SINAMICS/MICROMASTER hata kodu tarihçesi incelenerek arıza kökü belirlenir." },
    { step: "Güç Katı Ölçümü", desc: "IGBT modülü, diyot köprüsü ve DC bara kondansatörleri test edilir." },
    { step: "Kontrol Kartı Testi", desc: "CU kartı üzerindeki işlemci, bellek ve haberleşme devreleri incelenir." },
    { step: "Onarım", desc: "Hasarlı bileşenler Siemens uyumlu orijinal veya kaliteli muadil parçalarla değiştirilir." },
    { step: "Parametre ve Test", desc: "Cihaz parametreleri yüklenerek yük altında kapsamlı test yapılır." },
  ],
  brandsModels: [
    "SINAMICS G120", "SINAMICS G120C", "SINAMICS G120D",
    "SINAMICS S120", "SINAMICS S150", "MICROMASTER 440",
    "MICROMASTER 420", "MICROMASTER 430", "SIMODRIVE 611",
    "SINAMICS V20", "SINAMICS G110", "SINAMICS DCP",
  ],
  relatedServices: [
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "PLC Tamiri", href: "/plc-tamiri" },
    { label: "HMI Panel Tamiri", href: "/hmi-operator-panel-tamiri" },
    { label: "ABB Sürücü Tamiri", href: "/abb-surucu-tamiri" },
    { label: "Lenze Sürücü Tamiri", href: "/lenze-surucu-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function SiemensSurucu() {
  return <ServicePageTemplate data={data} />;
}
