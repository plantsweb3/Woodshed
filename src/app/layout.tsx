import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { APP } from "@/lib/constants";

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
  style: ["normal", "italic"],
});

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: `${APP.name} — ${APP.tagline}`, template: `%s · ${APP.name}` },
  description: `The opt-in space for Pieper Band of Warriors musicians who want more than the minimum. ${APP.tagline}`,
  applicationName: APP.name,
  appleWebApp: {
    capable: true,
    title: APP.shortName,
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: "#F7EFDD",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="antialiased min-h-dvh">
        <div className="fixed inset-0 -z-10 grain-overlay" aria-hidden />
        {children}
      </body>
    </html>
  );
}
