import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "Fanuc Servo Sürücü Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Fanuc α, β ve αi serisi servo sürücü tamiri Bursa. CNC tezgâh servo amplifier onarımı, IGBT ve encoder devre tamir.",
  canonical: "/fanuc-servo-surucu-tamiri",
  title: "Fanuc Servo Sürücü Tamiri",
  h1: "Fanuc Servo Sürücü Tamiri",
  intro: "Fanuc servo amplifier'lar, CNC tezgâhların en kritik bileşenleri arasındadır. Burem Elektronik, Fanuc α, αi ve β serisi servo sürücülerde komponent düzeyinde arıza tespiti ve onarım hizmeti sunar.",
  commonFaults: [
    "SV006 / SV007 – Aşırı hız ve akım hataları",
    "SV008 – Encoder hata sinyali",
    "SV012 – Güç kaynağı besleme hatası",
    "SV023 – Faz akım dengesizliği",
    "IGBT modülü kısa devresi",
    "Regeneratif deşarj devresi arızası",
    "Encoder arabirim devresi hasarı",
    "Güç kaynağı kartı arızaları",
  ],
  repairProcess: [
    { step: "Alarm Kodu Okuma", desc: "CNC ekranındaki alarm numaraları kayıt altına alınır ve arıza yönü belirlenir." },
    { step: "Amplifier Söküm ve Muayene", desc: "Servo amplifier tamamen sökülür; güç ve kontrol kartları ayrı ayrı incelenir." },
    { step: "IGBT ve Güç Katı Testi", desc: "IGBT modülleri, diyot köprüsü ve DC kondansatörler ölçülür." },
    { step: "Onarım", desc: "Hasarlı bileşenler Fanuc uyumlu parçalarla değiştirilir." },
    { step: "CNC Test", desc: "Amplifier tezgâha monte edilerek eksen hareketi ve yük altında test yapılır." },
  ],
  brandsModels: [
    "Fanuc α Series (A06B-6xxx)", "Fanuc αi Series (A06B-6xxx)",
    "Fanuc β Series (A06B-6xxx)", "Fanuc βi Series",
    "Fanuc POWER MATE", "Fanuc Series 0i",
    "Fanuc Series 16i/18i/21i", "Fanuc Series 30i/31i/32i",
  ],
  relatedServices: [
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "Mitsubishi Servo Sürücü Tamiri", href: "/mitsubishi-servo-surucu-tamiri" },
    { label: "Elektronik Kart Tamiri", href: "/endustriyel-elektronik-kart-tamiri" },
    { label: "PLC Tamiri", href: "/plc-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function FanucServoSurucu() {
  return <ServicePageTemplate data={data} />;
}
