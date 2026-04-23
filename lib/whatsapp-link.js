const DEFAULT_WHATSAPP_NUMBER = "+18149714183";

export function getWhatsAppNumber() {
  return process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_NUMBER || DEFAULT_WHATSAPP_NUMBER;
}

export function getWhatsAppHref(message = "") {
  const rawNumber = getWhatsAppNumber();
  const sanitizedNumber = rawNumber.replace(/[^\d]/g, "");
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${sanitizedNumber}${encodedMessage}`;
}
