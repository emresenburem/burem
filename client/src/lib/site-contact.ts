export const SITE_URL = "https://www.buremelektronik.com";
export const WHATSAPP_NUMBER = "905322664764";
export const PHONE_NUMBER = `+${WHATSAPP_NUMBER}`;
export const PHONE_DISPLAY = "+90 532 266 47 64";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}