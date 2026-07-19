import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "ABB Sürücü Tamiri | Burem Elektronik – Bursa",
  metaDescription: "ABB ACS355, ACS550, ACS850, ACS880 inverter ve sürücü tamiri Bursa. Güç modülü, kontrol kartı ve IGBT onarımı.",
  canonical: "/abb-surucu-tamiri",
  title: "ABB Sürücü Tamiri",
  h1: "ABB Sürücü Tamiri",
  intro: "ABB ACS serisi frekans dönüştürücüler ve sürücüler, geniş güç yelpazesiyle pek çok endüstriyel uygulamada kullanılmaktadır. Burem Elektronik, ABB sürücülerinde komponent düzeyinde onarım hizmeti sağlar.",
  commonFaults: [
    "2310 – Aşırı akım hatası",
    "3210 – DC voltaj fazla",
    "3220 – DC voltaj az",
    "3130 – Giriş fazı kaybı",
    "4110 – Sürücü aşırı sıcaklık",
    "7121 – Haberleşme hatası",
    "IGBT ve güç modülü hasarı",
    "Kontrol kartı (RMIO) arızaları",
  ],
  repairProcess: [
    { step: "Fault Log İnceleme", desc: "ABB Drive Composer veya panel üzerinden fault log okunur." },
    { step: "Güç Modülü Testi", desc: "IGBT modülleri, diyot ve kondansatörler kontrol edilir." },
    { step: "Kontrol Kartı Analizi", desc: "RMIO ve diğer kontrol kartları test tezgâhında incelenir." },
    { step: "Onarım ve Kalibrasyon", desc: "Hasarlı bileşenler değiştirilir, gerekli kalibrasyonlar yapılır." },
    { step: "Yük Altında Test", desc: "ABB sürücü çeşitli yük ve hız değerlerinde test edilir." },
  ],
  brandsModels: [
    "ABB ACS355", "ABB ACS550", "ABB ACS850",
    "ABB ACS880", "ABB ACS580", "ABB ACS310",
    "ABB ACS150", "ABB ACH580", "ABB ACSM1",
    "ABB DCS800", "ABB DCS550", "ABB MNS",
  ],
  relatedServices: [
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "Siemens Sürücü Tamiri", href: "/siemens-surucu-tamiri" },
    { label: "Lenze Sürücü Tamiri", href: "/lenze-surucu-tamiri" },
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function AbbSurucu() {
  return <ServicePageTemplate data={data} />;
}
