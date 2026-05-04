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
  title: "Windy Club — AI Sticker Creator",
  description: "สร้าง Sticker สุดน่ารักด้วย AI ง่ายๆ แค่พิมพ์ รองรับภาษาไทย 10 สไตล์ ฟรี 3 ครั้ง/วัน",
  keywords: ["AI sticker", "สร้าง sticker", "sticker maker", "AI art", "kawaii sticker", "Windy Club"],
  authors: [{ name: "Windy Club" }],
  openGraph: {
    title: "Windy Club — AI Sticker Creator",
    description: "สร้าง Sticker สุดน่ารักด้วย AI ง่ายๆ แค่พิมพ์ ฟรี!",
    url: "https://windy-club.com",
    siteName: "Windy Club",
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windy Club — AI Sticker Creator",
    description: "สร้าง Sticker ด้วย AI ใน 1 วินาที 🎨",
  },
  robots: { index: true, follow: true },
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
