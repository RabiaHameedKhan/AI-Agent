import { getWhatsAppHref } from "@/lib/whatsapp-link";

export default function WhatsAppCTA() {
  return (
    <a
      href={getWhatsAppHref("Hello, I would like to inquire about salon services.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl ring-4 ring-[#25D366]/30 transition hover:scale-105 hover:shadow-2xl"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366]/60 animate-ping" />
      <svg viewBox="0 0 32 32" className="relative z-10 h-7 w-7 fill-current" aria-hidden="true">
        <path d="M19.11 17.29c-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.14s-.69.87-.85 1.05c-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.16-1.34-.8-.71-1.35-1.59-1.5-1.86-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.6-1.45-.82-1.99-.22-.53-.44-.45-.6-.46h-.51c-.18 0-.47.07-.72.34-.24.27-.94.92-.94 2.24s.96 2.59 1.09 2.77c.13.18 1.88 2.87 4.56 4.03.64.28 1.15.44 1.54.56.65.21 1.24.18 1.71.11.52-.08 1.58-.64 1.8-1.27.22-.62.22-1.15.16-1.27-.07-.12-.24-.18-.51-.31z" />
        <path d="M16.01 3C8.84 3 3 8.83 3 16c0 2.29.6 4.53 1.73 6.51L3 29l6.67-1.69A12.96 12.96 0 0 0 16.01 29C23.17 29 29 23.17 29 16S23.17 3 16.01 3zm0 23.62a10.6 10.6 0 0 1-5.4-1.49l-.39-.23-3.96 1 1.06-3.85-.25-.4A10.58 10.58 0 1 1 16 26.62z" />
      </svg>
    </a>
  );
}
