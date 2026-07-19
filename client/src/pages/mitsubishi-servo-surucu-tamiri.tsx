import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "Mitsubishi Servo Sürücü Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Mitsubishi MR-J4, MR-J3, MR-E serisi servo sürücü tamiri Bursa. IGBT, kontrol kartı ve encoder arabirim onarımı.",
  canonical: "/mitsubishi-servo-surucu-tamiri",
  title: "Mitsubishi Servo Sürücü Tamiri",
  h1: "Mitsubishi Servo Sürücü Tamiri",
  intro: "Mitsubishi Electric servo sürücüler, yüksek hassasiyetli otomasyon ve CNC uygulamalarında tercih edilen güvenilir sistemlerdir. Burem Elektronik, MR-J4, MR-J3 ve MR-E serisi amplifier'larda komponent düzeyinde onarım hizmeti sunar.",
  commonFaults: [
    "AL.10 – Aşırı akım alarmı",
    "AL.16 – Encoder hata sinyali",
    "AL.17 – Bellek hatası",
    "AL.30 – Rejeneratif hata",
    "AL.32 – Aşırı hız",
    "AL.45 – Ana devre bileşen arızası",
    "IGBT modülü hasarı",
    "STO ve güvenlik devresi arızaları",
  ],
  repairProcess: [
    { step: "Alarm Kodu Okuma", desc: "Mitsubishi MR Configurator ile alarm geçmişi incelenir." },
    { step: "Güç Katı Ölçümü", desc: "IGBT, diyot modülü ve DC kondansatörler ölçülür." },
    { step: "Kontrol Kartı Analizi", desc: "CPU ve encoder arabirim devresi test edilir." },
    { step: "Onarım", desc: "Hasarlı bileşenler Mitsubishi uyumlu parçalarla değiştirilir." },
    { step: "Motor ile Test", desc: "Servo amplifier servo motor bağlı olarak hareket ve yük testinden geçirilir." },
  ],
  brandsModels: [
    "Mitsubishi MR-J4-A", "Mitsubishi MR-J4-B", "Mitsubishi MR-J4W",
    "Mitsubishi MR-J3-A", "Mitsubishi MR-J3-B", "Mitsubishi MR-E",
    "Mitsubishi MELSERVO-J5", "Mitsubishi FR-A800",
    "Mitsubishi FR-F800", "Mitsubishi FR-E800",
  ],
  relatedServices: [
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "Fanuc Servo Sürücü Tamiri", href: "/fanuc-servo-surucu-tamiri" },
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "Elektronik Kart Tamiri", href: "/endustriyel-elektronik-kart-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function MitsubishiServoSurucu() {
  return <ServicePageTemplate data={data} />;
}
