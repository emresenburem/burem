import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "Lenze Sürücü Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Lenze 8400, i550, SMV, E82EV sürücü tamiri Bursa. Güç kartı, kontrol kartı ve IGBT onarımı.",
  canonical: "/lenze-surucu-tamiri",
  title: "Lenze Sürücü Tamiri",
  h1: "Lenze Sürücü Tamiri",
  intro: "Lenze sürücüleri, tekstil, ambalaj ve konveyör sistemlerinde yaygın biçimde tercih edilmektedir. Burem Elektronik, Lenze 8400, i550, SMV ve E82EV serisi sürücülerde komponent düzeyinde onarım sunar.",
  commonFaults: [
    "LP1 – Güç kartı arızası",
    "OU – DC bara aşırı voltaj",
    "OC – Aşırı akım",
    "OH – Aşırı sıcaklık",
    "PH – Faz kaybı",
    "IGBT sürücü devresi hasarı",
    "E84 keypad ve haberleşme arızaları",
    "Güç kaynağı kart arızaları",
  ],
  repairProcess: [
    { step: "Hata Kodu Analizi", desc: "Lenze Diagnostics aracılığıyla ya da manuel olarak hata kodu okunur." },
    { step: "Güç Katı Testi", desc: "IGBT köprüsü, diyot ve DC kondansatörler test edilir." },
    { step: "Kontrol Kartı İncelemesi", desc: "Kontrol ve haberleşme kartları ayrı ayrı test edilir." },
    { step: "Onarım", desc: "Hasarlı bileşenler Lenze uyumlu parçalarla değiştirilir." },
    { step: "Fonksiyonel Test", desc: "Sürücü parametreler yüklenerek motor ile yük altında test edilir." },
  ],
  brandsModels: [
    "Lenze 8400 BaseLine", "Lenze 8400 StateLine", "Lenze 8400 TopLine",
    "Lenze i550", "Lenze i650", "Lenze SMV",
    "Lenze E82EV", "Lenze 9400", "Lenze 8200",
    "Lenze ACU", "Lenze ECS Servo",
  ],
  relatedServices: [
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "ABB Sürücü Tamiri", href: "/abb-surucu-tamiri" },
    { label: "Siemens Sürücü Tamiri", href: "/siemens-surucu-tamiri" },
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function LenzeSurucu() {
  return <ServicePageTemplate data={data} />;
}
