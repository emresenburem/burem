import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "İnverter Tamiri | Burem Elektronik – Bursa",
  metaDescription: "Siemens, ABB, Lenze, Danfoss, Schneider inverter tamiri Bursa. Güç modülü, kontrol kartı ve kapasitör değişimi.",
  canonical: "/inverter-tamiri",
  title: "İnverter Tamiri",
  h1: "İnverter (Frekans Dönüştürücü) Tamiri",
  intro: "İnverterler (frekans dönüştürücüler), endüstriyel motor kontrolünün temel bileşenidir. Burem Elektronik, tüm güç aralıklarındaki inverter arızalarını komponent düzeyinde teşhis ederek onarır; Siemens, ABB, Lenze, Danfoss ve daha birçok markayı kapsar.",
  commonFaults: [
    "Aşırı akım (OC) hatası ve IGBT kısa devresi",
    "DC bara aşırı voltaj alarmı",
    "Güç modülü yanması",
    "Elektrolit kapasitör kuruması veya patlaması",
    "Kontrol kartı haberleşme arızaları",
    "Çıkış fazı kaybı ve dengesizliği",
    "Soğutma fanı arızası",
    "Güç kaynağı (SMPS) arızaları",
  ],
  repairProcess: [
    { step: "Ön Değerlendirme", desc: "Hata kodu, çalışma saati ve son semptomlar alınır." },
    { step: "Güç Katı Testi", desc: "IGBT, diyot köprüsü ve DC kondansatörler ölçülür." },
    { step: "Kontrol Kartı Analizi", desc: "İşlemci, DSP ve çevre birimleri kapsamlı biçimde incelenir." },
    { step: "Onarım", desc: "Hasarlı bileşenler değiştirilir, yazılım gerekiyorsa yeniden yüklenir." },
    { step: "Tam Yük Testi", desc: "Motor bağlı olarak çeşitli frekans ve yük değerlerinde test yapılır." },
  ],
  brandsModels: [
    "Siemens MICROMASTER 440", "Siemens SINAMICS G120", "ABB ACS550",
    "ABB ACS850", "Lenze 8400", "Lenze i550", "Danfoss VLT 2800",
    "Danfoss FC302", "Schneider Altivar 31", "Schneider Altivar 71",
    "Yaskawa V1000", "Yaskawa A1000", "Omron 3G3MX2",
  ],
  relatedServices: [
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "ABB Sürücü Tamiri", href: "/abb-surucu-tamiri" },
    { label: "Lenze Sürücü Tamiri", href: "/lenze-surucu-tamiri" },
    { label: "Siemens Sürücü Tamiri", href: "/siemens-surucu-tamiri" },
    { label: "PLC Tamiri", href: "/plc-tamiri" },
    { label: "Bursa Sürücü Tamiri", href: "/bursa-surucu-tamiri" },
  ],
};

export default function InverterTamiri() {
  return <ServicePageTemplate data={data} />;
}
