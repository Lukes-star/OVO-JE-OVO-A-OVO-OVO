import emailjs from "@emailjs/browser";

export interface OrderEmailParams {
  to_email: string;
  customer_name: string;
  order_id: string;
  total_formatted: string;
  items_text: string;
  cancel_url: string;
  address: string;
  city: string;
  phone: string;
}

export interface BexSlipEmailParams {
  to_email: string;
  customer_name: string;
  order_id: string;
  bex_image_url: string;
  admin_message: string;
}

function getEnv() {
  return {
    SERVICE_ID:  import.meta.env.VITE_EMAILJS_SERVICE_ID  as string | undefined,
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined,
    BEX_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_BEX_TEMPLATE_ID as string | undefined,
    PUBLIC_KEY:  import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string | undefined,
  };
}

export async function sendOrderConfirmationEmail(params: OrderEmailParams): Promise<void> {
  const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } = getEnv();
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn("[Email] EmailJS nije konfigurisan. Dodaj VITE_EMAILJS_* u .env");
    return;
  }
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, params as Record<string, unknown>, { publicKey: PUBLIC_KEY });
}

export async function sendBexSlipEmail(params: BexSlipEmailParams): Promise<void> {
  const { SERVICE_ID, BEX_TEMPLATE_ID, PUBLIC_KEY } = getEnv();
  const tmpl = BEX_TEMPLATE_ID || getEnv().TEMPLATE_ID;
  if (!SERVICE_ID || !tmpl || !PUBLIC_KEY) {
    throw new Error("EmailJS nije konfigurisan. Proveri VITE_EMAILJS_* env varijable.");
  }
  await emailjs.send(SERVICE_ID, tmpl, params as Record<string, unknown>, { publicKey: PUBLIC_KEY });
}
