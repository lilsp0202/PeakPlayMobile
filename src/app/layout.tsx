import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAWrapper from "@/components/PWAWrapper";
import CookieConsent from "@/components/CookieConsent";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://peakplay.vercel.app'),
  title: {
    default: "PeakPlay - Athlete Development Platform",
    template: "%s | PeakPlay",
  },
  description: "Track your sports performance, connect with professional coaches, and elevate your game with AI-powered insights.",
  keywords: ["sports", "training", "athlete", "coaching", "performance", "cricket", "fitness"],
  authors: [{ name: "PeakPlay Team" }],
  creator: "PeakPlay",
  publisher: "PeakPlay",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PeakPlay",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://peakplay.com",
    siteName: "PeakPlay",
    title: "PeakPlay - Athlete Development Platform",
    description: "Track your sports performance and connect with professional coaches",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PeakPlay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PeakPlay - Athlete Development Platform",
    description: "Track your sports performance and connect with professional coaches",
    images: ["/og-image.png"],
    creator: "@peakplay",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="PeakPlay" />
        <meta name="apple-mobile-web-app-title" content="PeakPlay" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        <style>{`
          :root {
            color-scheme: light only !important;
          }
          * {
            color-scheme: light only !important;
          }
        `}</style>
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA splash screens for iOS */}
        <link rel="apple-touch-startup-image" href="/splash/iphone-x.svg" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-xr.svg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone-12.svg" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/ipad-pro-11.svg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}>
        <PWAWrapper>
          <Providers>
            {children}
            <CookieConsent />
          </Providers>
          <PWAInstallPrompt />
        </PWAWrapper>
        
        {/* Google Analytics - only loads after cookie consent */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                    cookie_flags: 'SameSite=None;Secure'
                  });
                  // Default to denied
                  gtag('consent', 'default', {
                    'analytics_storage': 'denied'
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
