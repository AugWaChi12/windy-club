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

const PROMPT_IDEAS = [
  { emoji: "🐱", text: "แมวส้มอ้วนๆ กำลังกินราเมน" },
  { emoji: "🐶", text: "หมาชิบะยิ้ม ใส่แว่นกันแดด" },
  { emoji: "🧑‍🚀", text: "นักบินอวกาศนั่งดื่มชานม" },
  { emoji: "🦖", text: "ไดโนเสาร์ตัวเล็กถือดอกไม้" },
  { emoji: "🐧", text: "เพนกวินใส่หมวกเชฟ ทำเค้ก" },
  { emoji: "🦊", text: "สุนัขจิ้งจอกนั่งอ่านหนังสือ" },
  { emoji: "🐻", text: "หมีน้อยนอนกอดหมอนบนเมฆ" },
  { emoji: "🐰", text: "กระต่ายถือร่มเดินกลางสายฝน" },
  { emoji: "🦄", text: "ยูนิคอร์นสีรุ้ง กินโดนัท" },
  { emoji: "🐼", text: "แพนด้าเล่นกีตาร์ในสวน" },
  { emoji: "🦉", text: "นกฮูกใส่แว่นตา อ่านคาถา" },
  { emoji: "🐸", text: "กบน้อยนั่งบนใบบัว ร้องเพลง" },
  { emoji: "🎃", text: "ฟักทองฮาโลวีนยิ้มน่ารัก" },
  { emoji: "🍣", text: "ซูชิมีหน้า กำลังโบกมือ" },
  { emoji: "☕", text: "แก้วกาแฟมีขา เดินไปทำงาน" },
  { emoji: "🌵", text: "ต้นกระบองเพชรยิ้ม ใส่หมวกคาวบอย" },
  { emoji: "🍕", text: "พิซซ่าชิ้นนึงกำลังเล่นสเก็ตบอร์ด" },
  { emoji: "🎸", text: "แมวดำเล่นกีตาร์ไฟฟ้า บนเวที" },
  { emoji: "🐉", text: "มังกรตัวเล็กพ่นไฟปิ้งมาร์ชเมลโลว์" },
  { emoji: "🧙", text: "พ่อมดแมวถือไม้กายสิทธิ์" },
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
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
      const isVideo = imageUrl.endsWith(".mp4") || imageUrl.endsWith(".webm");
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = isVideo
        ? `windy-sticker-${index + 1}.mp4`
        : `windy-sticker-${index + 1}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch {
      alert("ดาวน์โหลดไม่สำเร็จ ลองคลิกขวาแล้ว Save");
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
    if (data.alreadyPro) {
      setError("คุณเป็น Pro อยู่แล้ว!");
      return;
    }
    if (data.url) window.location.href = data.url;
  }

  async function handleManageSubscription() {
    const response = await fetch("/api/portal", { method: "POST" });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  }

  async function handleAnimate(imageUrl: string, index: number) {
    setAnimatingIndex(index);
    setError("");
    try {
      const response = await fetch("/api/animate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.upgrade) setShowUpgrade(true);
        setError(data.error || "สร้าง animation ไม่สำเร็จ");
        return;
      }
      if (data.videoUrl) {
        setGallery((prev) => {
          const updated = [...prev];
          // Insert animated version right after the original
          updated.splice(index, 0, data.videoUrl);
          return updated;
        });
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ ลองใหม่อีกครั้ง");
    } finally {
      setAnimatingIndex(null);
    }
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
            <span className="relative w-8 h-8 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none">
                <defs>
                  <linearGradient id="logo-grad-c" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill="url(#logo-grad-c)" />
                <path d="M18 22 L25 44 L32 30 L39 44 L46 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M2 20 C6 18, 10 22, 14 18" stroke="url(#logo-grad-c)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
                <path d="M0 28 C5 26, 9 30, 13 26" stroke="url(#logo-grad-c)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
                <circle cx="52" cy="12" r="5" fill="#fff" opacity="0.2" />
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
                {user.email === "supakorn@windy-club.com" && (
                  <Link
                    href="/admin"
                    className="text-[10px] bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-2.5 py-1 rounded-full font-bold hover:opacity-90 transition-opacity hidden sm:block"
                  >
                    ⚙️ Admin
                  </Link>
                )}
                {isPro && (
                  <button
                    onClick={handleManageSubscription}
                    className="text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-full font-bold hover:opacity-90 transition-opacity hidden sm:block"
                  >
                    ⭐ Pro
                  </button>
                )}
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

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 mesh-gradient">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">

          {/* Left Panel */}
          <div className="space-y-5">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl font-bold mb-1">
                <span className="inline-block animate-wiggle">🎨</span> สร้าง <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Sticker</span>
              </h1>
              <p className="text-xs text-muted">พิมพ์อะไรก็ได้ AI จะสร้างให้ทันที</p>
            </div>

            {/* Prompt */}
            <div className="animate-fade-in-up stagger-1">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="เช่น แมวส้มอ้วนๆ กำลังกินราเมน..."
                className="w-full h-24 rounded-2xl border border-card-border bg-card px-4 py-3 text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none transition-all hover:border-violet-300 dark:hover:border-violet-700"
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !loading) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const idea = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
                    setPrompt(idea.text);
                  }}
                  className="text-[11px] text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors"
                >
                  🎲 สุ่มไอเดีย
                </button>
                <p className="text-xs text-muted">{prompt.length}/200</p>
              </div>
              {/* Prompt suggestions */}
              {!prompt && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PROMPT_IDEAS.slice(0, 6).map((idea) => (
                    <button
                      key={idea.text}
                      type="button"
                      onClick={() => setPrompt(idea.text)}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-card-border bg-card hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-foreground transition-all hover:scale-105 active:scale-95"
                    >
                      {idea.emoji} {idea.text.length > 18 ? idea.text.slice(0, 18) + "…" : idea.text}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Style */}
            <div className="animate-fade-in-up stagger-2">
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Style ({STYLES.length})</p>
              <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex items-center gap-2 px-2.5 py-2.5 rounded-xl border text-left transition-all hover:scale-[1.03] active:scale-95 ${
                      style === s.id
                        ? "border-violet-500 bg-violet-500/10 dark:bg-violet-500/15 ring-2 ring-violet-500/30 shadow-md scale-[1.02]"
                        : "border-card-border bg-card hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md"
                    }`}
                  >
                    <span className={`text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br ${s.color} text-white text-xs shrink-0 shadow-sm ${style === s.id ? "animate-wiggle" : ""}`}>
                      {s.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${style === s.id ? "text-violet-600 dark:text-violet-400" : "text-foreground"}`}>{s.label}</p>
                      <p className="text-[10px] text-muted truncate">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Count */}
            <div className="animate-fade-in-up stagger-3">
              <label className="block text-xs font-semibold text-foreground mb-2">
                จำนวนรูป
                {remaining !== null && dailyLimit !== null && (
                  <span className="ml-2 text-muted font-normal">
                    (เหลือ {remaining}/{dailyLimit} วันนี้)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                {[1, 2, 4, 9].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    disabled={n > 2 && !isPro}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border hover:scale-105 active:scale-95 ${
                      count === n
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border-transparent shadow-lg shadow-violet-500/20"
                        : "bg-card border-card-border text-foreground hover:border-fuchsia-400/50 hover:shadow-md"
                    } ${n > 2 && !isPro ? "opacity-60 relative" : ""}`}
                  >
                    {n}
                    {n > 2 && !isPro && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm">
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
              className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-6 py-3.5 text-sm font-bold text-white hover:shadow-xl hover:shadow-fuchsia-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 animate-fade-in-up stagger-4 glow-violet"
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
          <div className="space-y-3">
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

            {gallery.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-card-border bg-card/30 p-8 min-h-[320px]">
                <div className="text-center space-y-4 animate-fade-in">
                  {/* Sample sticker grid preview */}
                  <div className="flex justify-center gap-3 mb-2">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-200 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 border border-pink-200/50 dark:border-pink-800/30 flex items-center justify-center text-xl animate-float stagger-1 shadow-sm">🐱</div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-200 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/20 border border-violet-200/50 dark:border-violet-800/30 flex items-center justify-center text-xl animate-float stagger-2 shadow-sm">🦊</div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-center text-xl animate-float stagger-3 shadow-sm">🐻</div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-200 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200/50 dark:border-emerald-800/30 flex items-center justify-center text-xl animate-float stagger-4 shadow-sm">🐸</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">สร้าง Sticker สุดน่ารักด้วย AI</p>
                    <p className="text-xs text-muted mt-1">พิมพ์อะไรก็ได้ทางซ้าย แล้วกดสร้าง — ผลลัพธ์จะแสดงที่นี่</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-200/50 dark:border-pink-800/30">🌸 Kawaii</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30">⚔️ Anime</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/30">🧸 3D Clay</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-200/50 dark:border-fuchsia-800/30">💡 Neon</span>
                  </div>
                </div>
                {/* House ad at bottom of empty state */}
                <div className="w-full mt-6 pt-4 border-t border-card-border/50">
                  <AdBanner position="create-top" isPro={isPro} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {loading && Array.from({ length: count }).map((_, i) => (
                  <div key={`loading-${i}`} className="aspect-square rounded-2xl border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-500/5 flex items-center justify-center animate-scale-in" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="text-center space-y-2">
                      <div className="text-2xl animate-bounce-soft" style={{ animationDelay: `${i * 0.15}s` }}>{["✨", "🎨", "🌟", "💫", "🪄", "⭐", "🎭", "🌈", "🎪"][i % 9]}</div>
                      <div className="inline-block animate-spin h-4 w-4 border-2 border-violet-500 border-t-transparent rounded-full" />
                      <p className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">{i + 1}/{count}</p>
                    </div>
                  </div>
                ))}
                {gallery.map((img, idx) => {
                  const isVideo = img.endsWith(".mp4") || img.endsWith(".webm");
                  return (
                  <div
                    key={`${img}-${idx}`}
                    className="gallery-item group relative aspect-square rounded-2xl border border-card-border overflow-hidden bg-white dark:bg-zinc-900 hover:shadow-xl hover:shadow-violet-500/15 hover:border-violet-400 dark:hover:border-violet-600 hover:scale-[1.05] hover:-rotate-1 active:scale-95 transition-all cursor-pointer"
                    style={{ animationDelay: `${idx * 0.08}s` }}
                    onClick={() => setLightboxIndex(idx)}
                  >
                    {isVideo ? (
                      <video
                        src={img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                    <img
                      src={img}
                      alt={`Sticker ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    )}
                    {isVideo && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        🎬 Animated
                      </span>
                    )}
                    {animatingIndex === idx && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <div className="text-center space-y-2">
                          <div className="inline-block animate-spin h-6 w-6 border-2 border-fuchsia-400 border-t-transparent rounded-full" />
                          <p className="text-[11px] text-white font-medium">กำลังสร้าง...</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(img, idx); }}
                        className="bg-white text-black text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg hover:bg-violet-50 active:scale-95 transition-all"
                      >
                        ⬇ Save
                      </button>
                      {!isVideo && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAnimate(img, idx); }}
                          disabled={animatingIndex !== null}
                          className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"
                        >
                          🎬 Animate
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                        className="bg-red-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Ad slot - above & below gallery */}
            {gallery.length > 0 && (
              <>
                <AdBanner position="create-top" isPro={isPro} />
                <AdBanner position="create-bottom" isPro={isPro} />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <div className="relative max-w-2xl w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-3 -right-3 z-10 bg-white dark:bg-zinc-800 text-black dark:text-white w-9 h-9 rounded-full shadow-xl flex items-center justify-center text-lg font-bold hover:bg-red-500 hover:text-white transition-colors"
            >
              ✕
            </button>

            {/* Navigation arrows */}
            {lightboxIndex > 0 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 dark:bg-zinc-800/90 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors z-10"
              >
                ‹
              </button>
            )}
            {lightboxIndex < gallery.length - 1 && (
              <button
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 dark:bg-zinc-800/90 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-lg hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors z-10"
              >
                ›
              </button>
            )}

            {/* Image/Video */}
            {(() => {
              const currentImg = gallery[lightboxIndex];
              const isVid = currentImg.endsWith(".mp4") || currentImg.endsWith(".webm");
              return isVid ? (
                <video
                  src={currentImg}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="max-h-[70vh] w-auto rounded-2xl shadow-2xl"
                />
              ) : (
                <img
                  src={currentImg}
                  alt={`Sticker ${lightboxIndex + 1}`}
                  className="max-h-[70vh] w-auto rounded-2xl shadow-2xl"
                />
              );
            })()}

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleDownload(gallery[lightboxIndex], lightboxIndex)}
                className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-full shadow-lg hover:bg-violet-50 active:scale-95 transition-all"
              >
                ⬇ Save
              </button>
              {!gallery[lightboxIndex].endsWith(".mp4") && !gallery[lightboxIndex].endsWith(".webm") && (
                <button
                  onClick={() => { handleAnimate(gallery[lightboxIndex], lightboxIndex); setLightboxIndex(null); }}
                  disabled={animatingIndex !== null}
                  className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-lg hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all"
                >
                  🎬 Animate
                </button>
              )}
              <button
                onClick={() => { handleRemove(lightboxIndex); setLightboxIndex(null); }}
                className="bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-lg hover:bg-red-600 active:scale-95 transition-all"
              >
                🗑 ลบ
              </button>
            </div>

            {/* Counter */}
            <p className="text-white/60 text-xs mt-3">{lightboxIndex + 1} / {gallery.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
