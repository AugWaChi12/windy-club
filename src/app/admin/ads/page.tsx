"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  position: string;
  is_active: boolean;
  impressions: number;
  clicks: number;
  created_at: string;
}

const POSITIONS = [
  { value: "home-hero", label: "หน้าแรก — Hero" },
  { value: "create-top", label: "หน้าสร้าง — บน Gallery" },
  { value: "create-bottom", label: "หน้าสร้าง — ใต้ Gallery" },
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link_url: "",
    position: "home-hero",
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    checkAdminAndLoadAds();
  }, []);

  async function checkAdminAndLoadAds() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== "supakorn@windy-club.com") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    await loadAds();
    setLoading(false);
  }

  async function loadAds() {
    const res = await fetch("/api/ads?position=all");
    // Since our GET only returns by position, let's fetch all positions
    const allAds: Ad[] = [];
    for (const pos of POSITIONS) {
      const r = await fetch(`/api/ads?position=${pos.value}`);
      const data = await r.json();
      if (data.ads) allAds.push(...data.ads);
    }
    setAds(allAds);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const fileName = `ads/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage
        .from("stickers")
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (error) {
        setMessage(`อัปโหลดไม่สำเร็จ: ${error.message}`);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from("stickers")
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!formData.title || !formData.image_url || !formData.link_url) {
      setMessage("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    const res = await fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("เพิ่มโฆษณาสำเร็จ ✓");
      setFormData({ title: "", image_url: "", link_url: "", position: "home-hero" });
      await loadAds();
    } else {
      setMessage(`Error: ${data.error}`);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    await fetch("/api/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !currentStatus }),
    });
    setAds((prev) =>
      prev.map((ad) => (ad.id === id ? { ...ad, is_active: !currentStatus } : ad))
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบโฆษณานี้?")) return;
    await fetch("/api/ads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-bounce-soft">⚙️</div>
          <p className="text-muted text-sm">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <p className="text-4xl">🔒</p>
          <p className="text-muted">เฉพาะ Admin เท่านั้น</p>
          <Link href="/" className="text-sm text-violet-500 hover:underline">กลับหน้าแรก</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-card-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            ⚙️ Admin — จัดการโฆษณา
          </Link>
          <Link href="/create" className="text-xs text-muted hover:text-foreground">
            ← กลับ
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Add new ad form */}
        <div className="rounded-2xl border border-card-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-bold">➕ เพิ่มโฆษณาใหม่</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">ชื่อโฆษณา</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="เช่น: ร้าน ABC สัปดาห์ที่ 1"
                  className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ตำแหน่ง</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData((f) => ({ ...f, position: e.target.value }))}
                  className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">URL ลิงก์ปลายทาง</label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData((f) => ({ ...f, link_url: e.target.value }))}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">รูปภาพโฆษณา (728×90px แนะนำ)</label>
              <div className="flex gap-3 items-end">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await handleImageUpload(file);
                    if (url) setFormData((f) => ({ ...f, image_url: url }));
                  }}
                  className="flex-1 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 dark:file:bg-violet-500/20 dark:file:text-violet-300"
                />
                {uploading && <span className="text-xs text-muted animate-pulse">อัปโหลด...</span>}
              </div>
              {formData.image_url && (
                <div className="mt-2 rounded-xl border border-card-border overflow-hidden">
                  <img src={formData.image_url} alt="Preview" className="w-full h-20 object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2 text-sm font-semibold text-white hover:scale-105 transition-all"
              >
                เพิ่มโฆษณา
              </button>
              {message && (
                <span className={`text-xs ${message.includes("Error") ? "text-red-500" : "text-emerald-500"}`}>
                  {message}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Existing ads list */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📋 โฆษณาทั้งหมด ({ads.length})</h2>

          {ads.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-card-border p-8 text-center">
              <p className="text-muted text-sm">ยังไม่มีโฆษณา — เพิ่มจากฟอร์มด้านบน</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className={`rounded-2xl border bg-card p-4 flex items-center gap-4 transition-all ${
                    ad.is_active ? "border-emerald-300 dark:border-emerald-700" : "border-card-border opacity-60"
                  }`}
                >
                  {/* Preview */}
                  <div className="w-24 h-14 rounded-lg overflow-hidden border border-card-border shrink-0">
                    <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ad.title}</p>
                    <p className="text-xs text-muted truncate">{ad.link_url}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] text-muted">
                        📍 {POSITIONS.find((p) => p.value === ad.position)?.label || ad.position}
                      </span>
                      <span className="text-[10px] text-muted">👁 {ad.impressions || 0}</span>
                      <span className="text-[10px] text-muted">👆 {ad.clicks || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(ad.id, ad.is_active)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                        ad.is_active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300"
                      }`}
                    >
                      {ad.is_active ? "✓ เปิด" : "ปิด"}
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="text-xs px-2 py-1 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
