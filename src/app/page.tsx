import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ Windy Club
          </h1>
          <Link
            href="/create"
            className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-purple-500 transition-colors"
          >
            เริ่มสร้าง
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs text-purple-300">
            🎉 สร้าง Sticker ฟรี 3 ครั้ง/วัน
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
            สร้าง <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Sticker</span>
            <br />ด้วย AI ใน 1 วินาที
          </h2>

          <p className="text-base text-zinc-400 max-w-md mx-auto">
            แค่พิมพ์บอกว่าอยากได้อะไร — AI จะวาด Sticker สุดน่ารักให้ทันที
          </p>

          <Link
            href="/create"
            className="inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-base font-semibold text-white hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25"
          >
            🎨 เริ่มสร้างเลย — ฟรี
          </Link>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-16 text-left">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
              <div className="text-2xl">⚡</div>
              <h3 className="text-sm font-semibold">เร็วมาก</h3>
              <p className="text-xs text-zinc-500">สร้าง Sticker ภายใน 1-2 วินาที</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
              <div className="text-2xl">🎭</div>
              <h3 className="text-sm font-semibold">5 Styles</h3>
              <p className="text-xs text-zinc-500">Kawaii, Anime, Comic, Minimal, Pixel</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-2">
              <div className="text-2xl">♾️</div>
              <h3 className="text-sm font-semibold">ไม่ซ้ำกัน</h3>
              <p className="text-xs text-zinc-500">กด Generate กี่ทีก็ได้ผลต่างกันทุกครั้ง</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-700 border-t border-zinc-800">
        © 2026 Windy Club
      </footer>
    </div>
  );
}
