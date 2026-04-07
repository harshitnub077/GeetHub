import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Caveat } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import GlobalCursor from "@/components/GlobalCursor";
import "./globals.css";

const inter = Inter({ variable: "--f-inter", subsets: ["latin"], display: "swap" });
const mono  = JetBrains_Mono({ variable: "--f-jetmono", subsets: ["latin"], display: "swap" });
const script= Caveat({ variable: "--f-caveat", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "ChordMate — Professional Guitar Chords & Play-Along Stage", template: "%s | ChordMate" },
  description: "Accelerate your music journey with 1,000,000+ studio-grade guitar chord tabs. Features real-time Play Along mode, auto-scroll, and performance-ready Stage Mode for musicians. Free forever.",
  keywords: ["guitar chords","chord tabs","play along","chordmate","free guitar tabs","chord sheets","musician tools"],
  metadataBase: new URL("https://geethub.musicians"), // Update with real domain later
  openGraph: { type:"website", siteName:"ChordMate", images:[{ url:"/og-branding.png", width:1200, height:630 }] },
  twitter: { card:"summary_large_image", site: "@chordmate" },
  robots: { index:true, follow:true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  applicationName: "ChordMate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&f[]=cabinet-grotesk@400,500,700,800,900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${mono.variable} ${script.variable}`} suppressHydrationWarning>
        <GlobalCursor />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
