import { ServicePageTemplate } from "@/components/service-page-template";

const data = {
  metaTitle: "Bursa Sürücü Tamiri | Burem Elektronik",
  metaDescription: "Bursa'da inverter, servo sürücü, PLC, HMI ve endüstriyel elektronik kart tamiri. Profesyonel arıza tespiti, onarım ve test hizmeti.",
  canonical: "/bursa-surucu-tamiri",
  title: "Bursa Sürücü Tamiri",
  h1: "Bursa Sürücü Tamiri",
  intro: "Burem Elektronik, Bursa'da faaliyet gösteren endüstriyel elektronik tamir atölyesidir. İnverter, servo sürücü, PLC, HMI ve güç kartı onarımı konusunda uzmanlaşmış ekibimiz, arızalı cihazınızı doğru teşhisle kısa sürede tekrar hizmete sokar.",
  commonFaults: [
    "Aşırı akım (OC) ve aşırı voltaj (OV) hataları",
    "IGBT ve güç modülü arızaları",
    "Kontrol kartı ve sürücü devresi hasarları",
    "Kapasitör, fan ve soğutma sistemi arızaları",
    "Parametre kaybı ve yazılım hataları",
    "Ekran ve operatör panel arızaları",
    "Haberleşme (Modbus, Profibus, CANopen) sorunları",
    "Güç kaynağı ve DC bara arızaları",
  ],
  repairProcess: [
    { step: "Arıza Bildirimi", desc: "Cihazınızın marka, model ve hata kodunu WhatsApp veya telefon üzerinden iletebilirsiniz." },
    { step: "Teknik İnceleme", desc: "Cihaz laboratuvarımıza alındıktan sonra komponent düzeyinde arıza tespiti yapılır." },
    { step: "Maliyet Bildirimi", desc: "Onay vermeden önce tamir maliyeti tarafınıza bildirilir." },
    { step: "Onarım ve Test", desc: "Gerekli bileşenler değiştirilerek cihaz yük altında test edilir." },
    { step: "Teslim", desc: "Onarım tamamlanan cihaz kargo veya elden teslim edilir." },
  ],
  brandsModels: [
    "Siemens SINAMICS", "ABB ACS", "Lenze 8400", "Yaskawa CIMR",
    "Schneider Altivar", "Danfoss VLT", "Mitsubishi FR", "Omron MX2",
    "Fanuc α/β Series", "SEW Eurodrive", "Control Techniques", "Parker",
  ],
  relatedServices: [
    { label: "İnverter Tamiri", href: "/inverter-tamiri" },
    { label: "Servo Sürücü Tamiri", href: "/servo-surucu-tamiri" },
    { label: "PLC Tamiri", href: "/plc-tamiri" },
    { label: "HMI Panel Tamiri", href: "/hmi-operator-panel-tamiri" },
    { label: "Elektronik Kart Tamiri", href: "/endustriyel-elektronik-kart-tamiri" },
    { label: "Siemens Sürücü Tamiri", href: "/siemens-surucu-tamiri" },
    { label: "ABB Sürücü Tamiri", href: "/abb-surucu-tamiri" },
  ],
};

export default function BursaSurucu() {
  return <ServicePageTemplate data={data} />;
}
