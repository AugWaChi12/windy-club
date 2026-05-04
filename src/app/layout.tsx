import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://windy-club.com"),
  title: {
    default: "Windy Club — สร้าง Sticker AI ฟรี | AI Sticker Creator",
    template: "%s | Windy Club",
  },
  description:
    "สร้าง Sticker สุดน่ารักด้วย AI ฟรี! แค่พิมพ์ภาษาไทยหรืออังกฤษ AI จะวาดให้ใน 1 วินาที มี 10 สไตล์ Kawaii, Anime, 3D Clay, Neon และอื่นๆ ใช้ฟรี 3 ครั้ง/วัน",
  keywords: [
    "AI sticker",
    "สร้าง sticker",
    "sticker maker",
    "AI sticker generator",
    "สร้างสติ๊กเกอร์",
    "สติ๊กเกอร์ AI",
    "AI art",
    "kawaii sticker",
    "anime sticker",
    "Windy Club",
    "สร้างสติ๊กเกอร์ออนไลน์",
    "AI สร้างรูป",
    "สร้างสติ๊กเกอร์ฟรี",
    "sticker AI ฟรี",
  ],
  authors: [{ name: "Windy Club", url: "https://windy-club.com" }],
  creator: "Windy Club",
  publisher: "Windy Club",
  alternates: {
    canonical: "https://windy-club.com",
  },
  openGraph: {
    title: "Windy Club — สร้าง Sticker AI ฟรี ใน 1 วินาที",
    description:
      "แค่พิมพ์บอกว่าอยากได้อะไร AI จะวาด Sticker สุดน่ารักให้ทันที มี 10 สไตล์ ใช้ฟรี!",
    url: "https://windy-club.com",
    siteName: "Windy Club",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Windy Club — AI Sticker Creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Windy Club — สร้าง Sticker AI ฟรี",
    description: "สร้าง Sticker ด้วย AI ใน 1 วินาที 🎨 มี 10 สไตล์ ฟรี 3 ครั้ง/วัน",
    images: ["/og-image.png"],
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
  verification: {
    // Add Google Search Console verification when ready
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Windy Club",
              url: "https://windy-club.com",
              description:
                "สร้าง Sticker สุดน่ารักด้วย AI ฟรี แค่พิมพ์ภาษาไทย AI จะวาดให้ใน 1 วินาที",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "THB",
                  description: "ฟรี 3 ครั้ง/วัน",
                },
                {
                  "@type": "Offer",
                  price: "199",
                  priceCurrency: "THB",
                  description: "Pro Plan — 30 รูป/วัน",
                },
              ],
              featureList: [
                "AI Sticker Generation",
                "10 Art Styles",
                "Thai Language Support",
                "Animated Sticker",
                "Batch Generation",
              ],
              inLanguage: ["th", "en"],
              creator: {
                "@type": "Organization",
                name: "Windy Club",
                url: "https://windy-club.com",
              },
            }),
          }}
        />
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){try{var t=localStorage.getItem('windy-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()
        ` }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
