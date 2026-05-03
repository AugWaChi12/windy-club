"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/create";
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("สมัครสำเร็จ! ตรวจสอบอีเมลเพื่อยืนยัน");
      }
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Windy Club
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </h1>
            <p className="text-sm text-zinc-500">
              {mode === "login"
                ? "เข้าสู่ระบบเพื่อสร้าง Sticker"
                : "สมัครฟรี สร้าง Sticker ได้ 3 ครั้ง/วัน"}
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-zinc-500">หรือ</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="อีเมล"
              required
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {message && <p className="text-green-500 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? "กำลังดำเนินการ..."
                : mode === "login"
                ? "เข้าสู่ระบบ"
                : "สมัครสมาชิก"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            {mode === "login" ? (
              <>
                ยังไม่มีบัญชี?{" "}
                <button onClick={() => setMode("signup")} className="text-purple-600 font-medium hover:underline">
                  สมัครเลย
                </button>
              </>
            ) : (
              <>
                มีบัญชีแล้ว?{" "}
                <button onClick={() => setMode("login")} className="text-purple-600 font-medium hover:underline">
                  เข้าสู่ระบบ
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
