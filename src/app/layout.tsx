import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GlobalCursor from "@/components/GlobalCursor";
import "./globals.css";

// JetBrains Mono via next/font (for chords/code)
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Geethub — Every Song, Every Chord",
    template: "%s | Geethub",
  },
  description:
    "Authentic guitar chord sheets with real-time Play Along, chord simplification, and stage mode. Open-source musician's platform.",
  keywords: [
    "guitar chords", "chord tabs", "play along", "geethub",
    "free guitar tabs", "bollywood chords", "chord sheets", "musician tools",
  ],
  metadataBase: new URL("https://geethub.dev"),
  openGraph: {
    title: "Geethub — Every Song, Every Chord",
    description: "Authentic guitar chord sheets with real-time Play Along.",
    url: "https://geethub.dev",
    siteName: "Geethub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Geethub — Every Song, Every Chord",
    site: "@geethubdev",
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
  applicationName: "Geethub",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

import SessionProvider from "@/components/SessionProvider";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Plus Jakarta Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
        {/* Preconnect for Unsplash images */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className={mono.variable} suppressHydrationWarning>
        <SessionProvider>
          <GlobalCursor />
          <Nav />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
