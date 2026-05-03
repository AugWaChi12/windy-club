"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const STYLES = [
  { id: "kawaii", label: "Kawaii", emoji: "🌸" },
  { id: "anime", label: "Anime", emoji: "⚔️" },
  { id: "comic", label: "Comic", emoji: "💥" },
  { id: "minimal", label: "Minimal", emoji: "◽" },
  { id: "pixel", label: "Pixel", emoji: "👾" },
];

const COUNTS = [2, 4, 6, 8];

export default function CreatePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("kawaii");
  const [count, setCount] = useState(4);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setCheckingAuth(false);
    });
  }, []);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError("");
    setShowUpgrade(false);
    setImages([]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, count }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errData = data;
        if (errData.upgrade) {
          setShowUpgrade(true);
        }
        setError(errData.error || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
        return;
      }

      setImages(data.images);
    } catch {
      setError("ไม่สามารถเชื่อมต่อได้ ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(imageUrl: string, index: number) {
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `windy-sticker-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("ดาวน์โหลดไม่สำเร็จ ลองคลิกขวาแล้ว Save Image");
    }
  }

  async function handleDownloadAll() {
    for (let i = 0; i < images.length; i++) {
      await handleDownload(images[i], i);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  async function handleUpgrade() {
    const response = await fetch("/api/checkout", { method: "POST" });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Windy Club
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-zinc-500">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-zinc-400 hover:text-zinc-600"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">สร้าง Sticker ✨</h1>

        {/* Prompt Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              อธิบาย Sticker ที่อยากได้
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="เช่น แมวส้มอ้วนๆ น่ารัก, หมาชิบะยิ้ม, แพนด้ากินไผ่..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-base bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={200}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleGenerate();
              }}
            />
            <p className="mt-1 text-xs text-zinc-400">{prompt.length}/200</p>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">เลือก Style</label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    style === s.id
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-purple-300"
                  }`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">จำนวน Sticker</label>
            <div className="flex gap-2">
              {COUNTS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    count === c
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-purple-300"
                  }`}
                >
                  {c} ตัว
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full rounded-xl bg-purple-600 px-6 py-3 text-lg font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                กำลังสร้าง... (รอสักครู่)
              </span>
            ) : (
              "🎨 สร้าง Sticker"
            )}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {showUpgrade && (
            <div className="rounded-xl border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/30 p-6 text-center space-y-3">
              <h3 className="text-lg font-bold">🚀 อัปเกรดเป็น Pro</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                สร้าง Sticker ไม่จำกัด ไม่มี watermark เพียง ฿199/เดือน
              </p>
              <button
                onClick={handleUpgrade}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                อัปเกรด Pro — ฿199/เดือน
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {images.length > 0 && (
          <div className="mt-10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Sticker ของคุณ 🎉</h2>
              <button
                onClick={handleDownloadAll}
                className="text-sm font-medium text-purple-600 hover:text-purple-700"
              >
                ⬇️ ดาวน์โหลดทั้งหมด
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white">
                  <img
                    src={img}
                    alt={`Sticker ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDownload(img, idx)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs px-3 py-1 rounded-full"
                  >
                    ⬇️ Save
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
