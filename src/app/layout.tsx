import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Flying Dev — Doorstep Mobile Repair in Delhi NCR",
    template: "%s | Flying Dev",
  },
  description:
    "Screen, battery and charging-port repairs at your doorstep across Delhi, Noida, Gurugram, Ghaziabad and Faridabad. Genuine parts, 6-month warranty, fixed prices up front.",
  keywords: [
    "mobile repair Delhi",
    "doorstep phone repair NCR",
    "screen replacement Noida",
    "battery replacement Gurugram",
  ],
  openGraph: {
    title: "Flying Dev — Doorstep Mobile Repair in Delhi NCR",
    description:
      "Fixed prices, genuine parts, 6-month warranty. A technician comes to you.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#2F5BEA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppButton
          number={(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918587949104").replace(/\D/g, "")}
        />
      </body>
    </html>
  );
}
