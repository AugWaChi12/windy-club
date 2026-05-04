"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === "supakorn@windy-club.com") {
        setIsAdmin(true);
        setEmail(user.email);
      }
      setLoading(false);
    });
  }, [supabase.auth]);

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
          <Link href="/" className="text-sm text-violet-500 hover:underline">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      href: "/admin/users",
      icon: "👥",
      title: "จัดการ Users",
      desc: "ดูรายชื่อ, toggle Pro, รีเซ็ต generations",
      gradient: "from-violet-500 to-fuchsia-500",
    },
    {
      href: "/admin/ads",
      icon: "📢",
      title: "จัดการโฆษณา",
      desc: "เพิ่ม/ลบ/แก้ไข banner ads",
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-card-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted hidden sm:block">{email}</span>
            <Link
              href="/create"
              className="text-xs text-muted hover:text-foreground"
            >
              ← กลับ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Windy Club <span className="text-violet-500">Admin</span>
          </h1>
          <p className="text-sm text-muted">
            จัดการ users, โฆษณา, และระบบต่างๆ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-card-border bg-card p-6 hover:border-violet-400 dark:hover:border-violet-600 hover:shadow-lg hover:shadow-violet-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h2 className="text-lg font-bold mb-1 group-hover:text-violet-500 transition-colors">
                {item.title}
              </h2>
              <p className="text-xs text-muted">{item.desc}</p>
              <div
                className={`mt-4 inline-block text-[10px] px-3 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                เข้าจัดการ →
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
