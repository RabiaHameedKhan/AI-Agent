import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getWhatsAppHref, getWhatsAppNumber } from "@/lib/whatsapp-link";
import ContactForm from "./ContactForm";

export default async function ContactPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const whatsappNumber = getWhatsAppNumber();
  const whatsappHref = getWhatsAppHref("Hello, I would like to contact Lumiere Salon.");

  return (
    <main className="min-h-screen bg-[#FDFAF5] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <section className="rounded-2xl bg-gradient-to-br from-[#2D0E28] via-[#4A1942] to-[#7B3F74] p-8 text-[#FDFAF5] shadow-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-[#E8D5A3]">Contact Lumiere</p>
          <h1 className="mt-3 text-5xl text-[#C9A84C] [font-family:var(--font-cormorant)]">We are here for you</h1>
          <p className="mt-4 text-sm text-[#FDFAF5]/85">
            Share your beauty goals, preferred services, or appointment questions. Our team will get back shortly.
          </p>

          <div className="mt-8 space-y-3 text-sm">
            <p>Hours: Mon-Sat 9am-7pm</p>
            <p>Address: 123 Beauty Lane</p>
            <a href={whatsappHref} className="block underline decoration-[#C9A84C]/70 underline-offset-4">
              WhatsApp: {whatsappNumber}
            </a>
            <a href="https://instagram.com/YOUR_HANDLE" className="block underline decoration-[#C9A84C]/70 underline-offset-4">
              Instagram: @lumieresalon
            </a>
          </div>
        </section>

        <ContactForm />
      </div>
    </main>
  );
}
