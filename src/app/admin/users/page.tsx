"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface UserRow {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isPro: boolean;
  stripeCustomerId: string | null;
  generations: number;
  createdAt: string;
  lastSignIn: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.email !== "supakorn@windy-club.com") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);
    await loadUsers();
    setLoading(false);
  }

  const loadUsers = useCallback(
    async (searchQuery?: string, pageNum?: number) => {
      const params = new URLSearchParams();
      if (searchQuery || search) params.set("search", searchQuery ?? search);
      params.set("page", String(pageNum ?? page));

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (data.users) setUsers(data.users);
    },
    [search, page]
  );

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    await loadUsers(search, 1);
  }

  async function handleTogglePro(userId: string) {
    setActionLoading(userId);
    setMessage("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "togglePro" }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isPro: data.isPro } : u
          )
        );
        setMessage(`${data.isPro ? "เปิด" : "ปิด"} Pro สำเร็จ`);
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetGenerations(userId: string, email: string) {
    if (!confirm(`รีเซ็ตจำนวนสร้างวันนี้ของ ${email}?`)) return;
    setActionLoading(userId);
    setMessage("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "resetGenerations" }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`รีเซ็ตสำเร็จ — ${email}`);
        await loadUsers();
      }
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-bounce-soft">👥</div>
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
          <Link
            href="/"
            className="text-sm text-violet-500 hover:underline"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-card-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link
            href="/admin"
            className="text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
          >
            👥 Admin — จัดการ Users
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs text-muted hover:text-foreground"
            >
              ← Dashboard
            </Link>
            <Link
              href="/create"
              className="text-xs text-muted hover:text-foreground"
            >
              กลับ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วย email หรือชื่อ..."
            className="flex-1 rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            ค้นหา
          </button>
        </form>

        {message && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-700 px-4 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {message}
          </div>
        )}

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-card-border bg-card p-4 text-center">
            <p className="text-2xl font-bold">{users.length}</p>
            <p className="text-xs text-muted">Users (หน้านี้)</p>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">
              {users.filter((u) => u.isPro).length}
            </p>
            <p className="text-xs text-muted">Pro Users</p>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-violet-500">
              {users.reduce((sum, u) => sum + u.generations, 0)}
            </p>
            <p className="text-xs text-muted">Total Generations</p>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">
              {users.filter((u) => u.stripeCustomerId).length}
            </p>
            <p className="text-xs text-muted">Stripe Customers</p>
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border bg-background/50">
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted">
                    User
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-xs text-muted">
                    Pro
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-xs text-muted">
                    Generations
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted hidden md:table-cell">
                    สมัคร
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted hidden lg:table-cell">
                    เข้าล่าสุด
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-xs text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-card-border last:border-0 hover:bg-card/80 transition-colors"
                  >
                    {/* User info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-8 h-8 rounded-full border border-card-border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-xs font-bold">
                            {(user.name || user.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate max-w-[200px]">
                            {user.name || "—"}
                          </p>
                          <p className="text-xs text-muted truncate max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Pro status */}
                    <td className="px-4 py-3 text-center">
                      {user.isPro ? (
                        <span className="inline-block text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                          ⭐ Pro
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Free</span>
                      )}
                    </td>

                    {/* Generations */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium">
                        {user.generations}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-xs text-muted hidden md:table-cell">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Last sign in */}
                    <td className="px-4 py-3 text-xs text-muted hidden lg:table-cell">
                      {formatDate(user.lastSignIn)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePro(user.id)}
                          disabled={actionLoading === user.id}
                          className={`text-[11px] px-3 py-1 rounded-full font-medium transition-all disabled:opacity-50 ${
                            user.isPro
                              ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                              : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                          }`}
                        >
                          {user.isPro ? "ปิด Pro" : "ให้ Pro"}
                        </button>
                        <button
                          onClick={() =>
                            handleResetGenerations(user.id, user.email)
                          }
                          disabled={actionLoading === user.id}
                          className="text-[11px] px-3 py-1 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20 transition-all disabled:opacity-50"
                        >
                          รีเซ็ต
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-muted"
                    >
                      ไม่พบ user
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              const newPage = Math.max(1, page - 1);
              setPage(newPage);
              loadUsers(search, newPage);
            }}
            disabled={page <= 1}
            className="text-xs px-4 py-2 rounded-xl border border-card-border bg-card hover:bg-background transition-colors disabled:opacity-30"
          >
            ← ก่อนหน้า
          </button>
          <span className="text-sm text-muted">หน้า {page}</span>
          <button
            onClick={() => {
              const newPage = page + 1;
              setPage(newPage);
              loadUsers(search, newPage);
            }}
            disabled={users.length < 20}
            className="text-xs px-4 py-2 rounded-xl border border-card-border bg-card hover:bg-background transition-colors disabled:opacity-30"
          >
            ถัดไป →
          </button>
        </div>
      </main>
    </div>
  );
}
