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

const splashScript = `
(function(){
  var s=document.createElement('div');
  s.id='tc-splash';
  s.innerHTML='<img src="/logo-wit.png" width="180" style="opacity:.95" alt=""/><div style="display:flex;gap:6px"><div class="sd"></div><div class="sd" style="animation-delay:.2s"></div><div class="sd" style="animation-delay:.4s"></div></div>';
  s.style.cssText='position:fixed;inset:0;z-index:9999;background:#840562;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px';
  var style=document.createElement('style');
  style.textContent='.sd{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.5);animation:sp 1.2s ease-in-out infinite}@keyframes sp{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1)}}';
  document.head.appendChild(style);
  document.body.appendChild(s);
})();
`;

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
        {/* Splash aanmaken buiten React tree zodat hydration niet conflicteert */}
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
      </head>
      <body className="min-h-full">
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
