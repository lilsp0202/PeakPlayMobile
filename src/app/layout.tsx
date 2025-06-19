import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAWrapper from "@/components/PWAWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeakPlay - Sports Training Platform",
  description: "Comprehensive sports training platform for athletes and coaches",
  keywords: ["sports", "training", "athlete", "coach", "fitness", "performance"],
  authors: [{ name: "PeakPlay Team" }],
  creator: "PeakPlay",
  publisher: "PeakPlay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  title: "PeakPlay",
  },
  openGraph: {
    type: "website",
    siteName: "PeakPlay",
    title: "PeakPlay - Sports Training Platform",
    description: "Comprehensive sports training platform for athletes and coaches",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "PeakPlay Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "PeakPlay - Sports Training Platform",
    description: "Comprehensive sports training platform for athletes and coaches",
    images: ["/icons/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icons/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-180x180.svg", sizes: "180x180" },
      { url: "/icons/apple-touch-icon-152x152.svg", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-144x144.svg", sizes: "144x144" },
      { url: "/icons/apple-touch-icon-120x120.svg", sizes: "120x120" },
      { url: "/icons/apple-touch-icon-114x114.svg", sizes: "114x114" },
      { url: "/icons/apple-touch-icon-76x76.svg", sizes: "76x76" },
      { url: "/icons/apple-touch-icon-72x72.svg", sizes: "72x72" },
      { url: "/icons/apple-touch-icon-60x60.svg", sizes: "60x60" },
      { url: "/icons/apple-touch-icon-57x57.svg", sizes: "57x57" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWAWrapper>
        <Providers>
          {children}
            <PWAInstallPrompt />
        </Providers>
        </PWAWrapper>
      </body>
    </html>
  );
}
