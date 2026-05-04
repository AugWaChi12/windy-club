"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const POSITIONS: Record<string, string> = {
  "home-hero": "หน้าแรก — Hero Banner",
  "create-top": "หน้าสร้าง — บน Gallery",
  "create-bottom": "หน้าสร้าง — ใต้ Gallery",
};

interface AdRequest {
  id: string;
  user_id: string;
  brand_name: string;
  contact_email: string;
  contact_line: string | null;
  position: string;
  link_url: string;
  image_url: string;
  duration: string;
  note: string | null;
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export default function AdminAdRequestsPage() {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<string>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.email !== "supakorn@windy-club.com") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    await loadRequests();
    setLoading(false);
  }

  async function loadRequests(status?: string) {
    const filterStatus = status ?? filter;
    const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
    const res = await fetch(`/api/ad-requests${params}`);
    const data = await res.json();
    if (data.requests) setRequests(data.requests);
  }

  async function handleAction(requestId: string, action: "approve" | "reject") {
    const confirmMsg =
      action === "approve"
        ? "อนุมัติคำขอนี้? (โฆษณาจะขึ้นบนเว็บทันที)"
        : "ปฏิเสธคำขอนี้?";

    if (!confirm(confirmMsg)) return;

    setActionLoading(requestId);
    setMessage("");
    try {
      const res = await fetch("/api/ad-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action,
          adminNote: adminNotes[requestId] || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(
          action === "approve" ? "✅ อนุมัติแล้ว — โฆษณาขึ้นบนเว็บแล้ว" : "❌ ปฏิเสธแล้ว"
        );
        await loadRequests();
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleFilterChange(newFilter: string) {
    setFilter(newFilter);
    await loadRequests(newFilter);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-bounce-soft">📋</div>
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
          <Link href="/" className="text-sm text-violet-500 hover:underline">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-card-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/admin"
            className="text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
          >
            📋 Admin — คำขอโฆษณา
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs text-muted hover:text-foreground">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "pending", label: `⏳ รอตรวจสอบ${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
            { value: "approved", label: "✅ อนุมัติแล้ว" },
            { value: "rejected", label: "❌ ปฏิเสธ" },
            { value: "all", label: "📁 ทั้งหมด" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`text-xs px-4 py-2 rounded-full border transition-all ${
                filter === f.value
                  ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold"
                  : "border-card-border bg-card text-muted hover:border-violet-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        )}

        {/* Requests list */}
        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-card-border p-12 text-center">
            <p className="text-muted text-sm">
              {filter === "pending" ? "ไม่มีคำขอรอตรวจสอบ 🎉" : "ไม่มีคำขอ"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`rounded-2xl border bg-card p-5 space-y-4 transition-all ${
                  req.status === "pending"
                    ? "border-amber-300 dark:border-amber-700"
                    : req.status === "approved"
                    ? "border-emerald-300 dark:border-emerald-700"
                    : "border-card-border opacity-70"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start gap-4">
                  {/* Banner preview */}
                  <div className="w-32 h-[44px] rounded-lg overflow-hidden border border-card-border shrink-0 bg-white dark:bg-gray-900">
                    <img
                      src={req.image_url}
                      alt={req.brand_name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold">{req.brand_name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          req.status === "pending"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                            : req.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                        }`}
                      >
                        {req.status === "pending" ? "⏳ รอตรวจสอบ" : req.status === "approved" ? "✅ อนุมัติ" : "❌ ปฏิเสธ"}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-muted">
                        📍 {POSITIONS[req.position] || req.position} • 📅 {req.duration}
                      </p>
                      <p className="text-xs text-muted">
                        📧 {req.contact_email}
                        {req.contact_line && ` • LINE: ${req.contact_line}`}
                      </p>
                      <p className="text-xs text-muted truncate">
                        🔗{" "}
                        <a
                          href={req.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-500 hover:underline"
                        >
                          {req.link_url}
                        </a>
                      </p>
                      {req.note && (
                        <p className="text-xs text-muted">💬 {req.note}</p>
                      )}
                      <p className="text-[10px] text-muted">
                        ส่งเมื่อ{" "}
                        {new Date(req.created_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin actions for pending */}
                {req.status === "pending" && (
                  <div className="border-t border-card-border pt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-muted mb-1">
                        หมายเหตุถึงผู้ลงโฆษณา (optional)
                      </label>
                      <input
                        type="text"
                        value={adminNotes[req.id] || ""}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        placeholder="เช่น: ชำระเงินมาที่... / รูปไม่ตรง spec กรุณาส่งใหม่"
                        className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(req.id, "approve")}
                        disabled={actionLoading === req.id}
                        className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                      >
                        ✅ อนุมัติ (ขึ้นโฆษณาเลย)
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "reject")}
                        disabled={actionLoading === req.id}
                        className="rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        ❌ ปฏิเสธ
                      </button>
                    </div>
                  </div>
                )}

                {/* Show admin note for reviewed */}
                {req.admin_note && req.status !== "pending" && (
                  <div className="border-t border-card-border pt-3">
                    <p className="text-xs text-muted">
                      💬 Admin: {req.admin_note}
                      {req.reviewed_at && (
                        <span className="ml-2">
                          ({new Date(req.reviewed_at).toLocaleDateString("th-TH", { month: "short", day: "numeric" })})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
