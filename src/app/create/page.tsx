"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const STYLES = [
  { id: "kawaii", label: "Kawaii", emoji: "🌸", desc: "น่ารัก ชิบิ พาสเทล" },
  { id: "anime", label: "Anime", emoji: "⚔️", desc: "มังงะ อนิเมะ" },
  { id: "comic", label: "Comic", emoji: "💥", desc: "การ์ตูนตะวันตก" },
  { id: "minimal", label: "Minimal", emoji: "◽", desc: "เรียบง่าย สะอาด" },
  { id: "pixel", label: "Pixel", emoji: "👾", desc: "พิกเซลอาร์ท เรโทร" },
];

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("kawaii");
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      setUser(authUser);
      setCheckingAuth(false);

      // Load saved stickers from storage
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
        body: JSON.stringify({ prompt: prompt.trim(), style, count: 1 }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgrade) setShowUpgrade(true);
        setError(data.error || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
        return;
      }

      if (data.images?.length > 0) {
        setGallery((prev) => [...data.images, ...prev]);
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, [prompt, style, user]);

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

    // Delete from Supabase Storage in background
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-zinc-400">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ Windy Club
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-xs text-zinc-500 hidden sm:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ออก
                </button>
              </>
            ) : (
              <Link href="/login" className="rounded-full bg-purple-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-purple-500">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

          {/* Left Panel - Controls */}
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">สร้าง Sticker</h1>
              <p className="text-sm text-zinc-500">พิมพ์อะไรก็ได้ AI จะสร้างให้</p>
            </div>

            {/* Prompt */}
            <div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="เช่น แมวส้มอ้วนๆ กำลังกินราเมน..."
                className="w-full h-24 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !loading) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <p className="mt-1 text-right text-xs text-zinc-600">{prompt.length}/200</p>
            </div>

            {/* Style */}
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Style</p>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      style === s.id
                        ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/50"
                        : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <p className={`text-xs font-medium ${style === s.id ? "text-purple-300" : "text-zinc-300"}`}>{s.label}</p>
                      <p className="text-[10px] text-zinc-600">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3.5 text-sm font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI กำลังวาด...
                </span>
              ) : (
                "🎨 สร้าง Sticker"
              )}
            </button>

            {/* Tip */}
            <p className="text-[11px] text-zinc-600 text-center">
              กด Generate ซ้ำได้เรื่อยๆ — ได้ผลลัพธ์ต่างกันทุกครั้ง
            </p>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {showUpgrade && (
              <div className="rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-pink-500/10 p-5 text-center space-y-3">
                <p className="text-lg">🚀</p>
                <h3 className="text-sm font-bold text-white">อัปเกรดเป็น Pro</h3>
                <p className="text-xs text-zinc-400">
                  สร้างไม่จำกัด เพียง ฿199/เดือน
                </p>
                <button
                  onClick={handleUpgrade}
                  className="rounded-full bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
                >
                  อัปเกรด Pro
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-400">
                {gallery.length > 0 ? `Sticker ของคุณ (${gallery.length})` : "Sticker จะแสดงที่นี่"}
              </h2>
              {gallery.length > 0 && (
                <button
                  onClick={() => {
                    // Delete all from storage in background
                    for (const url of gallery) {
                      fetch("/api/stickers", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url }),
                      }).catch(() => {});
                    }
                    setGallery([]);
                  }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  ล้างทั้งหมด
                </button>
              )}
            </div>

            {gallery.length === 0 && !loading ? (
              <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50">
                <div className="text-center space-y-2">
                  <p className="text-3xl">🎨</p>
                  <p className="text-sm text-zinc-600">พิมพ์อะไรสักอย่างแล้วกด Generate</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {loading && (
                  <div className="aspect-square rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="inline-block animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full" />
                      <p className="text-[11px] text-zinc-600">กำลังสร้าง...</p>
                    </div>
                  </div>
                )}
                {gallery.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="group relative aspect-square rounded-xl border border-zinc-800 overflow-hidden bg-white hover:border-purple-500/50 transition-colors"
                  >
                    <img
                      src={img}
                      alt={`Sticker ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center pb-3 gap-2">
                      <button
                        onClick={() => handleDownload(img, idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg"
                      >
                        ⬇ Save
                      </button>
                      <button
                        onClick={() => handleRemove(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
