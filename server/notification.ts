/**
 * Bildirim Servisi — NetGSM (SMS) ve Green API (WhatsApp)
 * Başarısız olsa dahi ana işlemi engellememeli.
 */

export interface NotifSettings {
  notifType: string | null;
  netgsmUser?: string | null;
  netgsmPass?: string | null;
  netgsmHeader?: string | null;
  greenApiInstance?: string | null;
  greenApiToken?: string | null;
  siteUrl?: string | null;
}

function normalizePhone(phone: string): string {
  // 05xxxxxxxxx → 905xxxxxxxxx
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "9" + digits;
  if (!digits.startsWith("90")) return "90" + digits;
  return digits;
}

async function sendNetGSM(
  settings: NotifSettings,
  phone: string,
  message: string
): Promise<void> {
  const { netgsmUser, netgsmPass, netgsmHeader } = settings;
  if (!netgsmUser || !netgsmPass) throw new Error("NetGSM credentials eksik");

  const params = new URLSearchParams({
    usercode: netgsmUser,
    password: netgsmPass,
    gsmno: normalizePhone(phone),
    message,
    msgheader: netgsmHeader || "BUREM",
    dil: "TR",
  });

  const res = await fetch(
    `https://api.netgsm.com.tr/sms/send/get/?${params.toString()}`
  );
  const text = await res.text();
  if (!text.startsWith("00")) {
    throw new Error(`NetGSM yanıtı: ${text}`);
  }
}

async function sendGreenAPI(
  settings: NotifSettings,
  phone: string,
  message: string
): Promise<void> {
  const { greenApiInstance, greenApiToken } = settings;
  if (!greenApiInstance || !greenApiToken)
    throw new Error("Green API credentials eksik");

  const chatId = normalizePhone(phone) + "@c.us";
  const url = `https://api.green-api.com/waInstance${greenApiInstance}/sendMessage/${greenApiToken}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Green API hatası: ${err}`);
  }
}

export async function sendNotification(
  settings: NotifSettings,
  phone: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!settings.notifType || settings.notifType === "none") {
      return { ok: true };
    }
    if (settings.notifType === "netgsm") {
      await sendNetGSM(settings, phone, message);
    } else if (settings.notifType === "greenapi") {
      await sendGreenAPI(settings, phone, message);
    }
    return { ok: true };
  } catch (err: any) {
    console.error("[notification] Bildirim gönderilemedi:", err.message);
    return { ok: false, error: err.message };
  }
}

export function buildWelcomeMessage(
  trackingNo: string,
  siteUrl: string
): string {
  return (
    `Merhaba! Cihazınız teslim alınmıştır. Takip No: ${trackingNo}. ` +
    `Servis durumunuzu ${siteUrl}/takip adresinden takip edebilirsiniz. — Burem Elektronik`
  );
}

export function buildStatusMessage(
  trackingNo: string,
  statusLabel: string,
  siteUrl: string
): string {
  return (
    `Cihazınızın servis durumu güncellendi: "${statusLabel}". ` +
    `Takip No: ${trackingNo}. ` +
    `Detay: ${siteUrl}/takip — Burem Elektronik`
  );
}
