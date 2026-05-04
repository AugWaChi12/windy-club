"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-provider";
import type { User } from "@supabase/supabase-js";

const AD_POSITIONS = [
  { value: "home-hero", name: "หน้าแรก — Hero Banner", size: "728×90", views: "ทุกคนเห็น", price: "฿500/สัปดาห์" },
  { value: "create-top", name: "หน้าสร้าง — บน Gallery", size: "728×90", views: "ผู้ใช้งาน", price: "฿800/สัปดาห์" },
  { value: "create-bottom", name: "หน้าสร้าง — ใต้ Gallery", size: "728×90", views: "ผู้ใช้งาน", price: "฿800/สัปดาห์" },
];

const DURATIONS = [
  { value: "1 week", label: "1 สัปดาห์" },
  { value: "2 weeks", label: "2 สัปดาห์" },
  { value: "1 month", label: "1 เดือน" },
];

interface AdRequest {
  id: string;
  brand_name: string;
  position: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  image_url: string;
}

export default function AdvertisePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [myRequests, setMyRequests] = useState<AdRequest[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [form, setForm] = useState({
    brandName: "",
    contactEmail: "",
    contactLine: "",
    position: "home-hero",
    linkUrl: "",
    imageUrl: "",
    duration: "1 week",
    note: "",
  });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      setUser(authUser);
      if (authUser) {
        setForm((f) => ({ ...f, contactEmail: authUser.email || "" }));
        loadMyRequests();
      }
    });
  }, [supabase.auth]);

  async function loadMyRequests() {
    const res = await fetch("/api/ad-requests");
    const data = await res.json();
    if (data.requests) setMyRequests(data.requests);
  }

  async function handleImageUpload(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setMessage("ไฟล์ใหญ่เกิน 2MB");
      setMessageType("error");
      return;
    }

    setUploading(true);
    try {
      const fileName = `ad-requests/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage
        .from("stickers")
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (error) {
        setMessage(`อัปโหลดไม่สำเร็จ: ${error.message}`);
        setMessageType("error");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("stickers")
        .getPublicUrl(fileName);

      setForm((f) => ({ ...f, imageUrl: urlData.publicUrl }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.brandName || !form.contactEmail || !form.linkUrl || !form.imageUrl) {
      setMessage("กรุณากรอกข้อมูลให้ครบ (ชื่อแบรนด์, อีเมล, URL, รูป)");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/ad-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "เกิดข้อผิดพลาด");
        setMessageType("error");
        return;
      }

      setMessage("ส่งคำขอสำเร็จ! เราจะตรวจสอบและตอบกลับภายใน 24 ชม.");
      setMessageType("success");
      setForm({
        brandName: "",
        contactEmail: user?.email || "",
        contactLine: "",
        position: "home-hero",
        linkUrl: "",
        imageUrl: "",
        duration: "1 week",
        note: "",
      });
      setShowForm(false);
      await loadMyRequests();
    } finally {
      setSubmitting(false);
    }
  }

  function statusBadge(status: string) {
    switch (status) {
      case "pending":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 font-medium">
            ⏳ รอตรวจสอบ
          </span>
        );
      case "approved":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-medium">
            ✅ อนุมัติ
          </span>
        );
      case "rejected":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 font-medium">
            ❌ ไม่ผ่าน
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b border-card-border backdrop-blur-xl bg-background/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            ✨ Windy Club
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <span className="text-xs text-muted hidden sm:block">{user.email}</span>
            ) : (
              <Link href="/login" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-16">
        {/* Hero */}
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
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-bold">📍 ตำแหน่งโฆษณา</h2>
          <div className="grid gap-3">
            {AD_POSITIONS.map((pos) => (
              <div
                key={pos.value}
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
        <div className="mt-12 space-y-4">
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

        {/* CTA / Form */}
        <div className="mt-12">
          {!user ? (
            <div className="rounded-3xl border-2 border-violet-300/50 dark:border-violet-600/30 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/5 dark:to-fuchsia-500/5 p-8 text-center space-y-4">
              <p className="text-3xl">🔐</p>
              <h3 className="text-lg font-bold">เข้าสู่ระบบเพื่อส่งคำขอ</h3>
              <p className="text-sm text-muted">ลงชื่อเข้าใช้แล้วมาส่งคำขอลงโฆษณาได้ทันที</p>
              <Link
                href="/login"
                className="inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          ) : !showForm ? (
            <div className="rounded-3xl border-2 border-violet-300/50 dark:border-violet-600/30 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/5 dark:to-fuchsia-500/5 p-8 text-center space-y-4">
              <p className="text-3xl">📝</p>
              <h3 className="text-lg font-bold">พร้อมลงโฆษณา?</h3>
              <p className="text-sm text-muted">
                อัปโหลดรูป banner, ใส่ลิงก์ แล้วส่งคำขอ — เราจะตรวจสอบภายใน 24 ชม.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
              >
                ส่งคำขอลงโฆษณา
              </button>
            </div>
          ) : (
            /* Ad Request Form */
            <div className="rounded-2xl border border-card-border bg-card p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">📝 ส่งคำขอลงโฆษณา</h2>
                <button onClick={() => setShowForm(false)} className="text-xs text-muted hover:text-foreground">
                  ✕ ปิด
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Brand name */}
                <div>
                  <label className="block text-xs font-semibold mb-1">ชื่อแบรนด์ / ธุรกิจ *</label>
                  <input
                    type="text"
                    value={form.brandName}
                    onChange={(e) => setForm((f) => ({ ...f, brandName: e.target.value }))}
                    placeholder="เช่น: ร้าน Kawaii Shop"
                    className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    maxLength={100}
                  />
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">อีเมลติดต่อ *</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">LINE ID (ถ้ามี)</label>
                    <input
                      type="text"
                      value={form.contactLine}
                      onChange={(e) => setForm((f) => ({ ...f, contactLine: e.target.value }))}
                      placeholder="@lineid"
                      className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* Position & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">ตำแหน่งที่ต้องการ *</label>
                    <select
                      value={form.position}
                      onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                      className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {AD_POSITIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.name} — {p.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">ระยะเวลา</label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {DURATIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Link URL */}
                <div>
                  <label className="block text-xs font-semibold mb-1">URL ลิงก์ปลายทาง *</label>
                  <input
                    type="url"
                    value={form.linkUrl}
                    onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                    placeholder="https://yoursite.com"
                    className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold mb-1">อัปโหลดรูป Banner * <span className="font-normal text-muted">(728×90px แนะนำ, ไม่เกิน 2MB)</span></label>
                  <div className="flex gap-3 items-end">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleImageUpload(file);
                      }}
                      className="flex-1 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 dark:file:bg-violet-500/20 dark:file:text-violet-300"
                    />
                    {uploading && <span className="text-xs text-muted animate-pulse">อัปโหลด...</span>}
                  </div>
                  {form.imageUrl && (
                    <div className="mt-3 rounded-xl border border-card-border overflow-hidden">
                      <img src={form.imageUrl} alt="Preview" className="w-full max-h-24 object-contain bg-white dark:bg-gray-900" />
                      <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-300">
                        ✓ อัปโหลดสำเร็จ
                      </div>
                    </div>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-semibold mb-1">หมายเหตุเพิ่มเติม</label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="รายละเอียดเพิ่มเติม, ช่วงเวลาที่ต้องการ ฯลฯ"
                    className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none h-20"
                    maxLength={500}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-40"
                >
                  {submitting ? "กำลังส่ง..." : "📤 ส่งคำขอลงโฆษณา"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            messageType === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300"
          }`}>
            {message}
          </div>
        )}

        {/* My Requests */}
        {user && myRequests.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg font-bold">📋 คำขอของฉัน</h2>
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl border border-card-border bg-card p-4 flex items-center gap-4"
                >
                  <div className="w-20 h-12 rounded-lg overflow-hidden border border-card-border shrink-0 bg-white dark:bg-gray-900">
                    <img src={req.image_url} alt={req.brand_name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{req.brand_name}</p>
                      {statusBadge(req.status)}
                    </div>
                    <p className="text-xs text-muted">
                      {AD_POSITIONS.find((p) => p.value === req.position)?.name || req.position}
                      {" • "}
                      {new Date(req.created_at).toLocaleDateString("th-TH", { month: "short", day: "numeric" })}
                    </p>
                    {req.admin_note && req.status !== "pending" && (
                      <p className="text-xs text-muted mt-1">💬 {req.admin_note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flow info */}
        <div className="mt-12 space-y-4">
          <h2 className="text-lg font-bold">📌 ขั้นตอนการลงโฆษณา</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { step: "1", icon: "📝", title: "ส่งคำขอ", desc: "กรอกข้อมูล + อัปโหลด banner" },
              { step: "2", icon: "🔍", title: "ตรวจสอบ", desc: "เราจะ review ภายใน 24 ชม." },
              { step: "3", icon: "💳", title: "ชำระเงิน", desc: "โอนตามราคาที่ตกลง" },
              { step: "4", icon: "🚀", title: "โฆษณาขึ้น!", desc: "แสดงบนเว็บทันที" },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-card-border bg-card p-4 text-center space-y-1">
                <p className="text-2xl">{s.icon}</p>
                <p className="text-xs font-bold">{s.title}</p>
                <p className="text-[10px] text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted border-t border-card-border">
        <p>© 2026 Windy Club — AI Sticker Creator</p>
      </footer>
    </div>
  );
}
