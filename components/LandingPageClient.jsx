"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

const testimonials = [
  {
    name: "Hamna Khan",
    quote: "Every visit feels like a royal retreat. The team understood exactly what I wanted.",
  },
  {
    name: "Aamna Hameed",
    quote: "Impeccable service, elegant ambiance, and truly premium results every single time.",
  },
  {
    name: "Areeba Masooma",
    quote: "From booking to styling, Lumiere makes everything effortless and luxurious.",
  },
];

const particles = [
  { left: "12%", top: "20%", size: "h-2 w-2", delay: "0ms" },
  { left: "22%", top: "70%", size: "h-1.5 w-1.5", delay: "400ms" },
  { left: "33%", top: "38%", size: "h-2.5 w-2.5", delay: "800ms" },
  { left: "48%", top: "78%", size: "h-1.5 w-1.5", delay: "1200ms" },
  { left: "57%", top: "30%", size: "h-2 w-2", delay: "1600ms" },
  { left: "64%", top: "56%", size: "h-1.5 w-1.5", delay: "2000ms" },
  { left: "73%", top: "22%", size: "h-2 w-2", delay: "2400ms" },
  { left: "81%", top: "68%", size: "h-2.5 w-2.5", delay: "2800ms" },
  { left: "89%", top: "42%", size: "h-1.5 w-1.5", delay: "3200ms" },
];

const detailsByService = {
  Haircut: "Includes consultation, precision cut, and signature finishing.",
  "Hair Color": "Includes color consultation, premium products, and final styling.",
  Blowout: "Includes wash, blow dry, and smooth finishing for long-lasting volume.",
  Facial: "Includes cleansing, exfoliation, hydration, and soothing facial massage.",
  Manicure: "Includes cuticle care, nail shaping, buffing, and polish application.",
  Pedicure: "Includes foot soak, exfoliation, nail care, and relaxing massage.",
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M19.11 17.29c-.27-.14-1.58-.78-1.83-.87-.24-.09-.42-.14-.6.14s-.69.87-.85 1.05c-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.16-1.34-.8-.71-1.35-1.59-1.5-1.86-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.6-1.45-.82-1.99-.22-.53-.44-.45-.6-.46h-.51c-.18 0-.47.07-.72.34-.24.27-.94.92-.94 2.24s.96 2.59 1.09 2.77c.13.18 1.88 2.87 4.56 4.03.64.28 1.15.44 1.54.56.65.21 1.24.18 1.71.11.52-.08 1.58-.64 1.8-1.27.22-.62.22-1.15.16-1.27-.07-.12-.24-.18-.51-.31z" />
      <path d="M16.01 3C8.84 3 3 8.83 3 16c0 2.29.6 4.53 1.73 6.51L3 29l6.67-1.69A12.96 12.96 0 0 0 16.01 29C23.17 29 29 23.17 29 16S23.17 3 16.01 3zm0 23.62a10.6 10.6 0 0 1-5.4-1.49l-.39-.23-3.96 1 1.06-3.85-.25-.4A10.58 10.58 0 1 1 16 26.62z" />
    </svg>
  );
}

function ServiceDetailsModal({ service, onClose }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-[#C9A84C]/50 bg-[#FDFAF5] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">{service.category || "Service"}</p>
            <h3 className="text-4xl text-[#4A1942] [font-family:var(--font-cormorant)]">{service.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#C9A84C]/60 px-3 py-1 text-xs font-semibold text-[#4A1942]"
          >
            Close
          </button>
        </div>

        <p className="mt-4 text-[#2C2C2C]/85">{service.description}</p>
        <p className="mt-3 text-[#2C2C2C]/80">
          {detailsByService[service.name] || "Personalized premium treatment by expert stylists."}
        </p>

        <div className="mt-6 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#4A1942]/70">Duration</p>
            <p className="text-lg font-semibold text-[#4A1942]">{service.duration_minutes} mins</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#4A1942]/70">Price</p>
            <p className="text-lg font-semibold text-[#C9A84C]">${service.price}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#4A1942]/70">Category</p>
            <p className="text-lg font-semibold text-[#4A1942]">{service.category || "Salon"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPageClient({ services = [] }) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [selectedService, setSelectedService] = useState(null);
  const [authMessage, setAuthMessage] = useState("");

  const serviceCards = useMemo(() => services, [services]);

  function handleServiceClick(service) {
    if (!isAuthenticated) {
      setAuthMessage("Please sign in first to view full service details.");
      return;
    }
    setAuthMessage("");
    setSelectedService(service);
  }

  return (
    <main id="home">
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-gradient-to-br from-[#2D0E28] via-[#4A1942] to-[#7B3F74] px-6 py-20 text-center">
        {particles.map((particle) => (
          <span
            key={`${particle.left}-${particle.top}`}
            className={`absolute ${particle.size} rounded-full bg-[#E8D5A3]/60 blur-[0.5px] animate-pulse`}
            style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
          />
        ))}
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="mb-3 tracking-[0.35em] text-[#E8D5A3]">ROYAL LUXURY SALON</p>
          <h1 className="text-6xl font-semibold leading-none text-[#C9A84C] sm:text-7xl lg:text-8xl [font-family:var(--font-cormorant)]">
            Lumiere
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#FDFAF5]/90 sm:text-xl">
            Elevated beauty rituals, timeless elegance, and personalized care for your signature look.
          </p>
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-7 py-3 text-sm font-semibold tracking-wide text-[#4A1942] transition hover:bg-[#E8D5A3]"
          >
            <WhatsAppIcon />
            Chat With Us on WhatsApp
          </a>
        </div>
      </section>

      <section id="services" className="bg-[#FDFAF5] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-4xl text-[#4A1942] [font-family:var(--font-cormorant)] sm:text-5xl">
            Our Services
          </h2>

          {authMessage && (
            <p className="mb-6 text-center text-sm text-[#4A1942]">
              {authMessage}{" "}
              <Link href="/signin?callbackUrl=%2F%23services" className="font-semibold text-[#7B3F74] underline">
                Sign in
              </Link>
            </p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceClick(service)}
                className="rounded-2xl border border-[#C9A84C]/60 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-2xl font-semibold text-[#4A1942] [font-family:var(--font-cormorant)]">
                  {service.name}
                </h3>
                <p className="mt-3 text-sm text-[#2C2C2C]/80">{service.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-[#F5ECD7] px-3 py-1 text-xs font-semibold text-[#4A1942]">
                    {service.duration_minutes} mins
                  </span>
                  <p className="text-xl font-semibold text-[#C9A84C]">${service.price}</p>
                </div>
                <p className="mt-4 text-xs uppercase tracking-wider text-[#4A1942]/70">Tap for details</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-[#F5ECD7] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#C9A84C]">About Lumiere</p>
              <h2 className="mt-3 text-5xl text-[#4A1942] [font-family:var(--font-cormorant)]">A Royal Salon Experience</h2>
              <p className="mt-4 text-[#2C2C2C]/85">
                Lumiere Salon was crafted for clients who want more than a basic appointment. We combine luxury ambiance,
                expert techniques, and personalized consultation to deliver beauty services that feel special every time.
              </p>
              <p className="mt-3 text-[#2C2C2C]/85">
                From precision hair artistry to restorative skincare and nail rituals, our team focuses on confidence,
                comfort, and consistency.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-[#C9A84C]/45 bg-white p-5">
                <p className="text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">10+ Years</p>
                <p className="mt-2 text-sm text-[#2C2C2C]/80">Luxury beauty expertise and premium care.</p>
              </article>
              <article className="rounded-2xl border border-[#C9A84C]/45 bg-white p-5">
                <p className="text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">5000+</p>
                <p className="mt-2 text-sm text-[#2C2C2C]/80">Satisfied clients served with personalized treatments.</p>
              </article>
              <article className="rounded-2xl border border-[#C9A84C]/45 bg-white p-5 sm:col-span-2">
                <p className="text-3xl text-[#4A1942] [font-family:var(--font-cormorant)]">Curated Team</p>
                <p className="mt-2 text-sm text-[#2C2C2C]/80">
                  Certified stylists, colorists, and skin experts dedicated to delivering elegant, reliable results.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-[#FDFAF5] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center text-4xl text-[#4A1942] [font-family:var(--font-cormorant)] sm:text-5xl">
            Client Love
          </h2>
          <div className="flex snap-x gap-6 overflow-x-auto pb-2">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="min-w-[280px] flex-1 snap-start rounded-2xl border border-[#C9A84C]/50 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex text-[#C9A84C]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>*</span>
                  ))}
                </div>
                <p className="text-[#2C2C2C]/85">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-lg font-semibold text-[#4A1942] [font-family:var(--font-cormorant)]">
                  {item.name}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#4A1942] px-6 py-14 text-[#FDFAF5]">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-3xl text-[#C9A84C] [font-family:var(--font-cormorant)]">Lumiere</h3>
            <p className="mt-3 text-sm text-[#FDFAF5]/80">Where elegance meets modern beauty artistry.</p>
          </div>
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[#E8D5A3]">Hours</h4>
            <p className="mt-3 text-sm">Mon-Sat: 9am-7pm</p>
          </div>
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[#E8D5A3]">Visit Us</h4>
            <p className="mt-3 text-sm">45 Queen Avenue, Royal District</p>
          </div>
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[#E8D5A3]">Connect</h4>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-sm hover:text-[#E8D5A3]"
            >
              WhatsApp
            </a>
            <a
              href="https://instagram.com/YOUR_HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm hover:text-[#E8D5A3]"
            >
              Instagram
            </a>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-[#C9A84C]/30 pt-6 text-center text-xs text-[#FDFAF5]/70">
          Copyright {new Date().getFullYear()} Lumiere Salon. By Rabia Khan. All rights reserved.
        </p>
      </footer>

      <ServiceDetailsModal service={selectedService} onClose={() => setSelectedService(null)} />
    </main>
  );
}