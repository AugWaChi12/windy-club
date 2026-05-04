"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";
import { AdBanner } from "@/components/ad-banner";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

function FloatingEmoji({ emoji, className }: { emoji: string; className: string }) {
  return (
    <span className={`absolute text-2xl select-none pointer-events-none ${className}`}>
      {emoji}
    </span>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      setUser(authUser);
    });
  }, [supabase.auth]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden mesh-gradient">
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
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none">
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill="url(#logo-grad)" />
                <path d="M18 22 L25 44 L32 30 L39 44 L46 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M2 20 C6 18, 10 22, 14 18" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
                <path d="M0 28 C5 26, 9 30, 13 26" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
                <circle cx="52" cy="12" r="5" fill="#fff" opacity="0.2" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Windy Club
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link
                href="/create"
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 hover:scale-105 transition-all"
              >
                เริ่มสร้าง
              </Link>
            ) : (
              <>
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
              </>
            )}
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
          <h2 className="animate-fade-in-up stagger-1 text-4xl font-bold tracking-tight sm:text-6xl leading-tight opacity-0">
            สร้าง{" "}
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent animate-gradient inline-block drop-shadow-sm">
              Sticker
            </span>
            <br />
            <span className="text-3xl sm:text-5xl">ด้วย AI ใน 1 วินาที</span>
          </h2>

          <p className="animate-fade-in-up stagger-2 text-lg text-muted max-w-md mx-auto opacity-0">
            แค่พิมพ์บอกว่าอยากได้อะไร — AI จะวาด Sticker สุดน่ารักให้ทันที
            <br />
            <span className="text-sm mt-1 inline-block">รองรับภาษาไทย 🇹🇭</span>
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up stagger-3 opacity-0">
            <Link
              href="/create"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-10 py-4 text-lg font-semibold text-white hover:shadow-2xl hover:shadow-fuchsia-500/40 hover:scale-105 transition-all animate-gradient glow-violet"
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
            <AdBanner position="home-hero" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
            <div className="animate-fade-in-up stagger-1 opacity-0 rounded-2xl border border-card-border glass-card p-6 space-y-3 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 hover:scale-[1.03] transition-all group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl group-hover:animate-wiggle transition-transform shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">⚡</div>
              <h3 className="text-base font-bold">เร็วมาก</h3>
              <p className="text-sm text-muted">สร้าง Sticker ภายใน 1-2 วินาที</p>
            </div>
            <div className="animate-fade-in-up stagger-2 opacity-0 rounded-2xl border border-card-border glass-card p-6 space-y-3 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 hover:scale-[1.03] transition-all group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xl group-hover:animate-wiggle transition-transform shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30">🎭</div>
              <h3 className="text-base font-bold">10 Styles</h3>
              <p className="text-sm text-muted">Kawaii, Anime, 3D Clay, Neon, Watercolor...</p>
            </div>
            <div className="animate-fade-in-up stagger-3 opacity-0 rounded-2xl border border-card-border glass-card p-6 space-y-3 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 hover:scale-[1.03] transition-all group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xl group-hover:animate-wiggle transition-transform shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">♾️</div>
              <h3 className="text-base font-bold">ไม่ซ้ำกัน</h3>
              <p className="text-sm text-muted">กด Generate กี่ทีก็ได้ผลต่างกันทุกครั้ง</p>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="animate-fade-in-up stagger-4 opacity-0 pt-8">
            <div className="rounded-3xl border-2 border-violet-300/50 dark:border-violet-600/30 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-500/5 dark:via-fuchsia-500/5 dark:to-pink-500/5 p-8 space-y-5 hover:shadow-2xl hover:shadow-violet-200/40 dark:hover:shadow-violet-900/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20 px-3 py-1 rounded-full">
                  <span className="animate-sparkle">✨</span> Pro Plan
                </div>
                <h3 className="text-2xl font-bold">฿199<span className="text-sm font-normal text-muted">/เดือน</span></h3>
                <ul className="text-sm text-muted space-y-2 text-left max-w-xs mx-auto">
                  <li className="flex items-center gap-2"><span className="text-emerald-500 text-base">✓</span> สร้างได้ 30 รูป/วัน</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500 text-base">✓</span> Batch สูงสุด 4 รูปพร้อมกัน</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500 text-base">✓</span> ไม่มีโฆษณา</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-500 text-base">✓</span> AI สร้างท่าทางหลากหลาย</li>
                </ul>
                <Link
                  href="/create"
                  className="inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-sm font-bold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                >
                  ทดลองฟรี →
                </Link>
              </div>
            </div>
          </div>

          {/* Ad slot - bottom of page */}
          <div className="animate-fade-in-up stagger-5 opacity-0 pt-4">
            <AdBanner position="home-hero" />
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-muted border-t border-card-border space-y-1">
        <p>© 2026 Windy Club — AI Sticker Creator</p>
        <p className="text-muted/50">Made with 💜 in Thailand</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link href="/advertise" className="text-violet-500 hover:underline">📢 ลงโฆษณากับเรา</Link>
          <span className="text-card-border">•</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <span className="text-card-border">•</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
