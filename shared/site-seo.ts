export const SITE_ORIGIN = "https://www.buremelektronik.com";
export const HOME_CANONICAL_URL = `${SITE_ORIGIN}/`;
export const BRAND_LOGO_IMAGE_URL = `${SITE_ORIGIN}/burem-logo-square.png`;
export const DEFAULT_OG_IMAGE = BRAND_LOGO_IMAGE_URL;
export const BRAND_LOGO_IMAGE_ALT = "Burem Elektronik'in mavi beyaz marka logosu";
export const HOME_PAGE_TITLE = "Bursa Sürücü Tamiri | Burem Elektronik";
export const HOME_PAGE_DESCRIPTION =
  "Bursa'da inverter, servo sürücü, PLC, HMI ve endüstriyel elektronik kart tamiri. Profesyonel arıza tespiti, onarım ve test hizmeti.";

const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;

export const SITE_IDENTITY_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": ORGANIZATION_ID,
      name: "Burem Elektronik",
      telephone: "+90-532-266-47-64",
      email: "info@buremelektronik.com",
      url: `${SITE_ORIGIN}/`,
      logo: BRAND_LOGO_IMAGE_URL,
      image: BRAND_LOGO_IMAGE_URL,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Alaaddinbey Mah. 626. Sk. No:22 SAM 1 Plaza İç Kapı No:B14",
        addressLocality: "Nilüfer",
        addressRegion: "Bursa",
        addressCountry: "TR",
      },
      description: "Bursa'da inverter, servo sürücü, PLC, HMI ve endüstriyel elektronik kart tamiri.",
      areaServed: "Bursa",
      sameAs: ["https://www.instagram.com/buremelektronik"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: `${SITE_ORIGIN}/`,
      name: "Burem Elektronik",
      inLanguage: "tr-TR",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
};
