import { Cormorant_Garamond, Jost } from "next/font/google";
import Navbar from "@/components/Navbar";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Lumiere Royal Salon",
  description: "Royal luxury salon experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#FDFAF5] text-[#2C2C2C]">
        <AuthProvider>
          <Navbar />
          {children}
          <WhatsAppCTA />
        </AuthProvider>
      </body>
    </html>
  );
}
