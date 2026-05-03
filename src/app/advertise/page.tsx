"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-provider";

const AD_POSITIONS = [
  { name: "หน้าแรก — Hero Banner", size: "728×90", views: "ทุกคนเห็น", price: "฿500/สัปดาห์" },
  { name: "หน้าสร้าง — บน Gallery", size: "728×90", views: "ผู้ใช้งาน", price: "฿800/สัปดาห์" },
  { name: "หน้าสร้าง — ใต้ Gallery", size: "728×90", views: "ผู้ใช้งาน", price: "฿800/สัปดาห์" },
];

export default function AdvertisePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b border-card-border backdrop-blur-xl bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            ✨ Windy Club
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium">
            📢 โฆษณากับเรา
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold">
            ลงโฆษณาบน{" "}
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Windy Club
            </span>
          </h1>

          <p className="text-muted max-w-md mx-auto">
            เข้าถึงกลุ่มเป้าหมายที่ชอบความน่ารัก สร้างสรรค์ และ AI —
            โฆษณาของคุณจะถูกแสดงวนลูปตลอดเวลาที่ผู้ใช้งานอยู่ในเว็บ
          </p>
        </div>

        {/* Positions */}
        <div className="mt-12 space-y-4 animate-fade-in-up stagger-2 opacity-0">
          <h2 className="text-lg font-bold">📍 ตำแหน่งโฆษณา</h2>
          <div className="grid gap-3">
            {AD_POSITIONS.map((pos) => (
              <div
                key={pos.name}
                className="flex items-center justify-between rounded-2xl border border-card-border bg-card p-4 hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all"
              >
                <div>
                  <p className="text-sm font-semibold">{pos.name}</p>
                  <p className="text-xs text-muted">{pos.size} • {pos.views}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{pos.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 space-y-4 animate-fade-in-up stagger-3 opacity-0">
          <h2 className="text-lg font-bold">✨ ทำไมต้องลงโฆษณากับเรา</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
              <p className="text-sm font-semibold">🎯 กลุ่มเป้าหมายชัด</p>
              <p className="text-xs text-muted">คนรุ่นใหม่ที่ชอบ AI, ความน่ารัก, สติ๊กเกอร์</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
              <p className="text-sm font-semibold">🔄 หมุนวนอัตโนมัติ</p>
              <p className="text-xs text-muted">โฆษณาสลับหมุนทุก 5 วินาที ไม่น่าเบื่อ</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
              <p className="text-sm font-semibold">📊 รายงานผล</p>
              <p className="text-xs text-muted">ดู impressions และ clicks ได้ตลอด</p>
            </div>
            <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
              <p className="text-sm font-semibold">💰 ราคาเป็นมิตร</p>
              <p className="text-xs text-muted">เริ่มต้นเพียง ฿500/สัปดาห์</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 animate-fade-in-up stagger-4 opacity-0">
          <div className="rounded-3xl border-2 border-violet-300/50 dark:border-violet-600/30 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/5 dark:to-fuchsia-500/5 p-8 text-center space-y-4">
            <p className="text-3xl">📧</p>
            <h3 className="text-lg font-bold">สนใจลงโฆษณา?</h3>
            <p className="text-sm text-muted">
              ส่งรายละเอียดมาที่อีเมลด้านล่าง เราจะตอบกลับภายใน 24 ชั่วโมง
            </p>
            <a
              href="mailto:supakorn@windy-club.com?subject=สนใจลงโฆษณาบน Windy Club"
              className="inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
            >
              supakorn@windy-club.com
            </a>
            <p className="text-xs text-muted">
              หรือส่ง banner (ขนาด 728×90px) พร้อมลิงก์ที่ต้องการให้คลิกไป
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted border-t border-card-border">
        <p>© 2026 Windy Club — AI Sticker Creator</p>
      </footer>
    </div>
  );
}
