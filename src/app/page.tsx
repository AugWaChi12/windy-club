import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Windy Club
        </h1>
        <Link
          href="/create"
          className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
        >
          สร้าง Sticker
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl space-y-8">
          <div className="text-6xl">🎨✨</div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            สร้าง <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Sticker</span> สุดน่ารัก
            <br />ด้วย AI
          </h2>

          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            แค่พิมพ์บอก AI ว่าอยากได้ sticker แบบไหน — ได้ sticker set พร้อมใช้ภายในวินาที
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create"
              className="rounded-full bg-purple-600 px-8 py-3 text-lg font-semibold text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/25"
            >
              เริ่มสร้างเลย — ฟรี
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
              <div className="text-2xl">⚡</div>
              <h3 className="font-semibold">เร็วมาก</h3>
              <p className="text-sm text-zinc-500">สร้าง sticker set ภายใน 30 วินาที</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
              <div className="text-2xl">🎭</div>
              <h3 className="font-semibold">หลาย Style</h3>
              <p className="text-sm text-zinc-500">Kawaii, Anime, Comic, Minimal, Pixel Art</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
              <div className="text-2xl">📲</div>
              <h3 className="font-semibold">ใช้ได้ทุกที่</h3>
              <p className="text-sm text-zinc-500">LINE, WhatsApp, Telegram, Discord</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
        © 2026 Windy Club. All rights reserved.
      </footer>
    </div>
  );
}
