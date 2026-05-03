"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-card-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            ✨ Windy Club
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/create"
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              เริ่มสร้าง
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 px-4 py-1.5 text-xs text-violet-700 dark:text-violet-300 font-medium">
            🎉 สร้าง Sticker ฟรี 3 ครั้ง/วัน
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
            สร้าง{" "}
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Sticker
            </span>
            <br />ด้วย AI ใน 1 วินาที
          </h2>

          <p className="text-base text-muted max-w-md mx-auto">
            แค่พิมพ์บอกว่าอยากได้อะไร — AI จะวาด Sticker สุดน่ารักให้ทันที
          </p>

          <Link
            href="/create"
            className="inline-block rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-8 py-3.5 text-base font-semibold text-white hover:shadow-lg hover:shadow-fuchsia-500/25 hover:scale-105 transition-all"
          >
            🎨 เริ่มสร้างเลย — ฟรี
          </Link>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-16 text-left">
            <div className="rounded-2xl border border-card-border bg-card p-5 space-y-2 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg">⚡</div>
              <h3 className="text-sm font-semibold">เร็วมาก</h3>
              <p className="text-xs text-muted">สร้าง Sticker ภายใน 1-2 วินาที</p>
            </div>
            <div className="rounded-2xl border border-card-border bg-card p-5 space-y-2 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-lg">🎭</div>
              <h3 className="text-sm font-semibold">5 Styles</h3>
              <p className="text-xs text-muted">Kawaii, Anime, Comic, Minimal, Pixel</p>
            </div>
            <div className="rounded-2xl border border-card-border bg-card p-5 space-y-2 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-lg">♾️</div>
              <h3 className="text-sm font-semibold">ไม่ซ้ำกัน</h3>
              <p className="text-xs text-muted">กด Generate กี่ทีก็ได้ผลต่างกันทุกครั้ง</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted border-t border-card-border">
        © 2026 Windy Club
      </footer>
    </div>
  );
}
