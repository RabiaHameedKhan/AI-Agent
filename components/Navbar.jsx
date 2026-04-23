"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { getWhatsAppHref } from "@/lib/whatsapp-link";

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";
  const whatsappHref = getWhatsAppHref("Hello, I would like to book an appointment.");

  const authLinks = [
    { label: "Dashboard", href: "/dashboard" },
    ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  async function handleLogout() {
    await signOut({ callbackUrl: "/signin" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#C9A84C]/35 bg-[#4A1942]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-4xl font-semibold tracking-wide text-[#C9A84C] [font-family:var(--font-cormorant)]"
        >
          Lumière
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm tracking-wide text-[#FDFAF5] transition hover:text-[#E8D5A3]"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated &&
            authLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm tracking-wide text-[#E8D5A3] transition hover:text-[#FDFAF5]"
              >
                {link.label}
              </Link>
            ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#C9A84C] px-4 py-2 text-sm font-semibold text-[#4A1942] transition hover:bg-[#E8D5A3]"
          >
            WhatsApp Us
          </a>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#C9A84C]/60 px-4 py-2 text-sm font-medium text-[#FDFAF5] transition hover:border-[#E8D5A3] hover:text-[#E8D5A3]"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/signin"
              className="rounded-full border border-[#C9A84C]/60 px-4 py-2 text-sm font-medium text-[#FDFAF5] transition hover:border-[#E8D5A3] hover:text-[#E8D5A3]"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-[#FDFAF5] md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Open navigation menu</span>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-[#C9A84C]/20 bg-[#4A1942]/95 transition-all duration-300 md:hidden ${
          isOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-1 px-4 py-4">
          {publicLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-[#FDFAF5] transition hover:bg-[#7B3F74]/50"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated &&
            authLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-[#E8D5A3] transition hover:bg-[#7B3F74]/50"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-lg bg-[#C9A84C] px-3 py-2 text-center font-semibold text-[#4A1942]"
            onClick={() => setIsOpen(false)}
          >
            WhatsApp Us
          </a>

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="block w-full rounded-lg border border-[#C9A84C]/60 px-3 py-2 text-center text-[#FDFAF5]"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/signin"
              className="block rounded-lg border border-[#C9A84C]/60 px-3 py-2 text-center text-[#FDFAF5]"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
