"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-provider";
import { AdBanner } from "@/components/ad-banner";
import type { User } from "@supabase/supabase-js";

const STYLES = [
  { id: "kawaii", label: "Kawaii", emoji: "🌸", desc: "น่ารัก ชิบิ พาสเทล", color: "from-pink-400 to-rose-400" },
  { id: "anime", label: "Anime", emoji: "⚔️", desc: "มังงะ อนิเมะ", color: "from-blue-400 to-indigo-400" },
  { id: "comic", label: "Comic", emoji: "💥", desc: "การ์ตูนตะวันตก", color: "from-amber-400 to-orange-400" },
  { id: "minimal", label: "Minimal", emoji: "◽", desc: "เรียบง่าย สะอาด", color: "from-gray-400 to-slate-400" },
  { id: "pixel", label: "Pixel", emoji: "👾", desc: "พิกเซลอาร์ท เรโทร", color: "from-emerald-400 to-teal-400" },
  { id: "watercolor", label: "Watercolor", emoji: "🎨", desc: "สีน้ำ นุ่มนวล", color: "from-cyan-400 to-sky-400" },
  { id: "retro", label: "Retro", emoji: "🌈", desc: "ย้อนยุค 70s groovy", color: "from-orange-400 to-red-400" },
  { id: "doodle", label: "Doodle", emoji: "✏️", desc: "วาดมือ ขีดเขียน", color: "from-stone-400 to-neutral-500" },
  { id: "threed", label: "3D Clay", emoji: "🧸", desc: "3D น่ารัก สไตล์ Pixar", color: "from-violet-400 to-purple-400" },
  { id: "neon", label: "Neon", emoji: "💡", desc: "นีออนเรืองแสง", color: "from-fuchsia-400 to-pink-500" },
];

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("kawaii");
  const [count, setCount] = useState(1);
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      setUser(authUser);
      setCheckingAuth(false);

      if (authUser) {
        fetch("/api/stickers")
          .then((res) => res.json())
          .then((data) => {
            if (data.images?.length > 0) {
              setGallery(data.images);
            }
          })
          .catch(() => {});
      }
    });
  }, [supabase.auth]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError("");
    setShowUpgrade(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, count }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgrade) setShowUpgrade(true);
        setError(data.error || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
        if (data.remaining !== undefined) setRemaining(data.remaining);
        if (data.dailyLimit !== undefined) setDailyLimit(data.dailyLimit);
        return;
      }

      if (data.images?.length > 0) {
        setGallery((prev) => [...data.images, ...prev]);
      }
      if (data.remaining !== undefined) setRemaining(data.remaining);
      if (data.dailyLimit !== undefined) setDailyLimit(data.dailyLimit);
      if (data.isPro !== undefined) setIsPro(data.isPro);
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [prompt, style, count, user]);

  async function handleDownload(imageUrl: string, index: number) {
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `windy-sticker-${index + 1}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      alert("ดาวน์โหลดไม่สำเร็จ ลองคลิกขวาแล้ว Save Image");
    }
  }

  function handleRemove(index: number) {
    const imageUrl = gallery[index];
    setGallery((prev) => prev.filter((_, i) => i !== index));
    fetch("/api/stickers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: imageUrl }),
    }).catch(() => {});
  }

  async function handleUpgrade() {
    const response = await fetch("/api/checkout", { method: "POST" });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce-soft">🎨</div>
          <div className="animate-pulse text-muted text-sm">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-card-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="relative w-7 h-7 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
                <defs>
                  <linearGradient id="logo-grad-c" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" stroke="url(#logo-grad-c)" strokeWidth="2.5" fill="none" className="logo-ring" />
                <path d="M10 20 C10 14, 16 8, 22 12 C20 16, 18 18, 16 20 C14 18, 12 16, 10 20Z" fill="url(#logo-grad-c)" opacity="0.9" />
                <circle cx="20" cy="10" r="2" fill="url(#logo-grad-c)" opacity="0.6" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Windy Club
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-xs text-muted hidden sm:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  ออก
                </button>
              </>
            ) : (
              <Link href="/login" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">

          {/* Left Panel */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                🎨 สร้าง <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Sticker</span>
              </h1>
              <p className="text-sm text-muted">พิมพ์อะไรก็ได้ AI จะสร้างให้ทันที</p>
            </div>

            {/* Prompt */}
            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="เช่น แมวส้มอ้วนๆ กำลังกินราเมน..."
                className="w-full h-28 rounded-2xl border border-card-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-colors"
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !loading) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <p className="mt-1 text-right text-xs text-muted">{prompt.length}/200</p>
            </div>

            {/* Style */}
            <div>
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Style ({STYLES.length})</p>
              <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex items-center gap-2 px-2.5 py-2.5 rounded-xl border text-left transition-all ${
                      style === s.id
                        ? "border-violet-500 bg-violet-500/10 dark:bg-violet-500/15 ring-2 ring-violet-500/30 shadow-sm scale-[1.02]"
                        : "border-card-border bg-card hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm"
                    }`}
                  >
                    <span className={`text-lg w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-white text-xs shrink-0`}>
                      {s.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${style === s.id ? "text-violet-600 dark:text-violet-400" : "text-foreground"}`}>{s.label}</p>
                      <p className="text-[10px] text-muted truncate">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Count */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                จำนวนรูป
                {remaining !== null && dailyLimit !== null && (
                  <span className="ml-2 text-muted font-normal">
                    (เหลือ {remaining}/{dailyLimit} วันนี้)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    disabled={n > 2 && !showUpgrade && remaining !== null && remaining < n}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                      count === n
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-md"
                        : "bg-card border-card-border text-foreground hover:border-fuchsia-400/50"
                    } ${n > 2 ? "opacity-60 relative" : ""}`}
                  >
                    {n}
                    {n > 2 && (
                      <span className="absolute -top-1 -right-1 text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1 rounded-full">
                        Pro
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-4 text-sm font-bold text-white hover:shadow-lg hover:shadow-fuchsia-500/25 hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI กำลังวาด {count > 1 ? `${count} รูป` : ""}...
                </span>
              ) : (
                `🎨 สร้าง ${count > 1 ? `${count} Stickers` : "Sticker"}`
              )}
            </button>

            <p className="text-[11px] text-muted text-center">
              กดซ้ำได้เรื่อยๆ — ได้ผลลัพธ์ต่างกันทุกครั้ง ✨
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3">
                <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
              </div>
            )}

            {showUpgrade && (
              <div className="animate-scale-in rounded-2xl border-2 border-violet-400/30 bg-gradient-to-b from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/10 p-5 text-center space-y-3">
                <p className="text-2xl animate-bounce-soft">🚀</p>
                <h3 className="text-sm font-bold">อัปเกรดเป็น Pro</h3>
                <p className="text-xs text-muted">
                  สร้าง 30 รูป/วัน เพียง ฿199/เดือน
                </p>
                <button
                  onClick={handleUpgrade}
                  className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-xs font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                >
                  อัปเกรด Pro ✨
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted">
                {gallery.length > 0 ? (
                  <>🖼 Sticker ของคุณ <span className="inline-flex items-center justify-center bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 rounded-full px-2 py-0.5 text-[10px] font-bold ml-1">{gallery.length}</span></>
                ) : "Sticker จะแสดงที่นี่"}
              </h2>
              {gallery.length > 0 && (
                <button
                  onClick={() => {
                    for (const url of gallery) {
                      fetch("/api/stickers", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url }),
                      }).catch(() => {});
                    }
                    setGallery([]);
                  }}
                  className="text-xs text-muted hover:text-red-500 transition-colors"
                >
                  🗑 ล้างทั้งหมด
                </button>
              )}
            </div>

            {/* Ad slot - top of gallery */}
            <AdBanner position="create-top" isPro={isPro} className="mb-4" />

            {gallery.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-72 rounded-2xl border-2 border-dashed border-card-border bg-card/50 decoration-dots">
                <div className="text-center space-y-3 animate-fade-in">
                  <p className="text-5xl animate-float">🎨</p>
                  <p className="text-sm text-muted">พิมพ์อะไรสักอย่างแล้วกด Generate</p>
                  <p className="text-xs text-muted/60">Sticker จะแสดงตรงนี้ ✨</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {loading && (
                  <div className="aspect-square rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-500/5 flex items-center justify-center animate-scale-in">
                    <div className="text-center space-y-3">
                      <div className="text-3xl animate-bounce-soft">✨</div>
                      <div className="inline-block animate-spin h-5 w-5 border-2 border-violet-500 border-t-transparent rounded-full" />
                      <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">กำลังสร้าง...</p>
                    </div>
                  </div>
                )}
                {gallery.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="gallery-item group relative aspect-square rounded-2xl border border-card-border overflow-hidden bg-white dark:bg-zinc-900 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-400 dark:hover:border-violet-600 hover:scale-[1.03] transition-all"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <img
                      src={img}
                      alt={`Sticker ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                      <button
                        onClick={() => handleDownload(img, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 bg-white text-black text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg hover:bg-violet-50"
                      >
                        ⬇ Save
                      </button>
                      <button
                        onClick={() => handleRemove(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 bg-red-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ad slot - bottom of gallery */}
            <AdBanner position="create-bottom" isPro={isPro} className="mt-4" />
          </div>
        </div>
      </main>
    </div>
  );
}
