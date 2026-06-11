import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import ServiceWorker from "@/components/ServiceWorker";
import PushManager from "@/components/PushManager";
import InstallBanner from "@/components/InstallBanner";
import SplashRemover from "@/components/Splash";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Telecombinatie Toolbox",
  description: "Jouw centrale platform voor alle winkels",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TC Toolbox",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${geistSans.variable} h-full`}>
      <head>
        <meta name="theme-color" content="#840562" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
      </head>
      <body className="min-h-full">
        {/* Splash: statische HTML, zichtbaar vóór JS laadt */}
        <div
          id="tc-splash"
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            backgroundColor: "#840562",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "24px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wit.png" alt="" width={180} style={{ opacity: 0.95 }} />
          <div style={{ display: "flex", gap: "6px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.5)",
                animation: `splashPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
        <SplashRemover />
        <ServiceWorker />
        <InstallBanner />
        <SessionProvider>
          <PushManager />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
