"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";

function FloatingEmoji({ emoji, className }: { emoji: string; className: string }) {
  return (
    <span className={`absolute text-2xl select-none pointer-events-none ${className}`}>
      {emoji}
    </span>
  );
}

function AdSlot({ type = "banner", className = "" }: { type?: "banner" | "square"; className?: string }) {
  return (
    <div className={`ad-slot ad-slot-${type} ${className}`} data-ad-slot={type}>
      <span className="text-xs text-muted/40 select-none">Ad Space</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <FloatingEmoji emoji="✨" className="top-[15%] left-[10%] animate-float stagger-1 opacity-30" />
        <FloatingEmoji emoji="🌸" className="top-[25%] right-[15%] animate-float stagger-2 opacity-25" />
        <FloatingEmoji emoji="💫" className="top-[60%] left-[5%] animate-float stagger-3 opacity-20" />
        <FloatingEmoji emoji="🎨" className="top-[70%] right-[10%] animate-float stagger-4 opacity-25" />
        <FloatingEmoji emoji="⭐" className="top-[40%] left-[85%] animate-float stagger-5 opacity-20" />
        <FloatingEmoji emoji="🦋" className="top-[80%] left-[50%] animate-float stagger-1 opacity-20" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-card-border backdrop-blur-xl bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
            ✨ Windy Club
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-full border border-card-border px-4 py-1.5 text-xs font-medium text-foreground hover:border-violet-400 transition-all"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/create"
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 hover:scale-105 transition-all"
            >
              เริ่มสร้าง
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-xl space-y-8">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-4 py-1.5 text-xs text-violet-700 dark:text-violet-300 font-medium">
            <span className="animate-bounce-soft inline-block">🎉</span> สร้าง Sticker ฟรี 3 ครั้ง/วัน
          </div>

          {/* Hero */}
          <h2 className="animate-fade-in-up stagger-1 text-4xl font-bold tracking-tight sm:text-5xl leading-tight opacity-0">
            สร้าง{" "}
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-gradient inline-block">
              Sticker
            </span>
            <br />ด้วย AI ใน 1 วินาที
          </h2>

          <p className="animate-fade-in-up stagger-2 text-base text-muted max-w-md mx-auto opacity-0">
            แค่พิมพ์บอกว่าอยากได้อะไร — AI จะวาด Sticker สุดน่ารักให้ทันที
            <br />
            <span className="text-xs">รองรับภาษาไทย 🇹🇭</span>
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up stagger-3 opacity-0">
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-8 py-4 text-base font-semibold text-white hover:shadow-xl hover:shadow-fuchsia-500/30 hover:scale-105 transition-all animate-gradient"
            >
              <span className="group-hover:animate-wiggle inline-block text-xl">🎨</span>
              เริ่มสร้างเลย — ฟรี
            </Link>
          </div>

          {/* Sample stickers preview */}
          <div className="animate-fade-in-up stagger-4 opacity-0 flex justify-center gap-4 pt-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-200 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 border border-pink-200 dark:border-pink-800/30 flex items-center justify-center text-2xl animate-float stagger-1 shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30">
              🐱
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-200 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20 border border-violet-200 dark:border-violet-800/30 flex items-center justify-center text-2xl animate-float stagger-2 shadow-lg shadow-violet-200/50 dark:shadow-violet-900/30">
              🦊
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800/30 flex items-center justify-center text-2xl animate-float stagger-3 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
              🐻
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-200 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800/30 flex items-center justify-center text-2xl animate-float stagger-4 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
              🐸
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-200 to-sky-100 dark:from-sky-900/30 dark:to-sky-800/20 border border-sky-200 dark:border-sky-800/30 flex items-center justify-center text-2xl animate-float stagger-5 shadow-lg shadow-sky-200/50 dark:shadow-sky-900/30">
              🐧
            </div>
          </div>

          {/* Ad slot - below hero */}
          <div className="animate-fade-in-up stagger-5 opacity-0 pt-6">
            <AdSlot type="banner" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-12 text-left">
            <div className="animate-fade-in-up stagger-1 opacity-0 rounded-2xl border border-card-border bg-card p-5 space-y-2 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 hover:scale-[1.02] transition-all group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg group-hover:animate-wiggle transition-transform shadow-md shadow-amber-200/50 dark:shadow-amber-900/30">⚡</div>
              <h3 className="text-sm font-semibold">เร็วมาก</h3>
              <p className="text-xs text-muted">สร้าง Sticker ภายใน 1-2 วินาที</p>
            </div>
            <div className="animate-fade-in-up stagger-2 opacity-0 rounded-2xl border border-card-border bg-card p-5 space-y-2 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 hover:scale-[1.02] transition-all group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-lg group-hover:animate-wiggle transition-transform shadow-md shadow-pink-200/50 dark:shadow-pink-900/30">🎭</div>
              <h3 className="text-sm font-semibold">5 Styles</h3>
              <p className="text-xs text-muted">Kawaii, Anime, Comic, Minimal, Pixel</p>
            </div>
            <div className="animate-fade-in-up stagger-3 opacity-0 rounded-2xl border border-card-border bg-card p-5 space-y-2 hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 hover:scale-[1.02] transition-all group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg group-hover:animate-wiggle transition-transform shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30">♾️</div>
              <h3 className="text-sm font-semibold">ไม่ซ้ำกัน</h3>
              <p className="text-xs text-muted">กด Generate กี่ทีก็ได้ผลต่างกันทุกครั้ง</p>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="animate-fade-in-up stagger-4 opacity-0 pt-8">
            <div className="rounded-3xl border-2 border-violet-300/50 dark:border-violet-600/30 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-500/5 dark:via-fuchsia-500/5 dark:to-pink-500/5 p-8 space-y-4 hover:shadow-xl hover:shadow-violet-200/30 dark:hover:shadow-violet-900/20 transition-all">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20 px-3 py-1 rounded-full">
                <span className="animate-sparkle">✨</span> Pro Plan
              </div>
              <h3 className="text-xl font-bold">฿199<span className="text-sm font-normal text-muted">/เดือน</span></h3>
              <ul className="text-sm text-muted space-y-1.5 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> สร้างได้ 30 รูป/วัน</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Batch สูงสุด 4 รูปพร้อมกัน</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> ไม่มีโฆษณา</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> AI สร้างท่าทางหลากหลาย</li>
              </ul>
              <Link
                href="/create"
                className="inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
              >
                ทดลองฟรี →
              </Link>
            </div>
          </div>

          {/* Ad slot - bottom of page */}
          <div className="animate-fade-in-up stagger-5 opacity-0 pt-4">
            <AdSlot type="banner" />
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-muted border-t border-card-border">
        <p>© 2026 Windy Club — AI Sticker Creator</p>
        <p className="mt-1 text-muted/50">Made with 💜 in Thailand</p>
      </footer>
    </div>
  );
}
