import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "Servo Sürücü Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Fanuc, Siemens, Mitsubishi, Yaskawa servo sürücü tamiri. Bursa'da komponent düzeyinde arıza tespiti ve onarım.",
  canonical: "/servo-surucu-tamiri",
  title: "Servo Sürücü Tamiri",
  h1: "Servo Sürücü Tamiri",
  intro: "Endüstriyel makine ve CNC tezgâhlarda kullanılan servo sürücülerin arızalanması, üretim hattında ciddi duruşlara neden olur. Burem Elektronik, Fanuc, Siemens, Mitsubishi, Yaskawa ve diğer markalara ait servo sürücülerde komponent düzeyinde onarım hizmeti sunar.",
  commonFaults: [
    "Encoder hata ve iletişim kesintileri",
    "Aşırı akım ve aşırı yük alarmları",
    "IGBT ve güç modülü hasarı",
    "Pozisyon kaybı ve titreşim sorunları",
    "Kontrol kartı arızaları",
    "DC bus aşırı voltaj hataları",
    "Soğutma fanı ve termal koruma arızaları",
    "Rejeneratif direnç sorunları",
  ],
  repairProcess: [
    { step: "Arıza Analizi", desc: "Hata kodu ve semptomlar değerlendirilerek muhtemel arıza noktaları belirlenir." },
    { step: "Devre Testi", desc: "Güç katı, kontrol katı ve encoder arayüzü ayrı ayrı test edilir." },
    { step: "Komponent Değişimi", desc: "Hasarlı IGBT, kapasitör, optokuplör ve diğer bileşenler orijinal veya eşdeğer parçalarla değiştirilir." },
    { step: "Parametre Yükleme", desc: "Cihaza ait parametreler yüklenerek servo motor ile uyum testi yapılır." },
    { step: "Yük Altında Test", desc: "Servo sürücü gerçek yük koşullarında test edilerek onaylanır." },
  ],
  brandsModels: [
    "Fanuc α Series", "Fanuc β Series", "Siemens SIMODRIVE",
    "Siemens SINAMICS S120", "Mitsubishi MR-J4", "Mitsubishi MR-J3",
    "Yaskawa SGDV", "Yaskawa SGDM", "Lenze 9400", "Bosch Rexroth",
    "Panasonic MDDDT", "Kollmorgen", "Beckhoff AX5000",
  ],
  relatedServices: [
    { label: "Fanuc Servo Sürücü Tamiri", href: "/fanuc-servo-surucu-tamiri" },
    { label: "Mitsubishi Servo Sürücü Tamiri", href: "/mitsubishi-servo-surucu-tamiri" },
    { label: "Siemens Sürücü Tamiri", href: "/siemens-surucu-tamiri" },
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "PLC Tamiri", href: "/plc-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function ServoSurucu() {
  return <ServicePageTemplate data={data} />;
}
