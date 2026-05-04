import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว — Windy Club",
  description: "นโยบายความเป็นส่วนตัวของ Windy Club",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-card-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            ✨ Windy Club
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1 className="text-2xl font-bold mb-6">นโยบายความเป็นส่วนตัว (Privacy Policy)</h1>
        <p className="text-sm text-muted mb-4">อัปเดตล่าสุด: 4 พฤษภาคม 2026</p>

        <section className="space-y-4 text-sm text-foreground/80">
          <h2 className="text-lg font-semibold text-foreground mt-8">1. ข้อมูลที่เราเก็บ</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>ข้อมูลบัญชี:</strong> อีเมล (จากการสมัครหรือ Google OAuth)</li>
            <li><strong>ข้อมูลการใช้งาน:</strong> prompt ที่พิมพ์, สไตล์ที่เลือก, จำนวนรูปที่สร้าง, IP address</li>
            <li><strong>ข้อมูลการชำระเงิน:</strong> จัดการผ่าน Stripe — เราไม่เก็บเลขบัตรเครดิต</li>
            <li><strong>ไฟล์ Sticker:</strong> รูปที่สร้างจะเก็บใน Supabase Storage ภายใต้บัญชีของคุณ</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">2. การใช้ข้อมูล</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ให้บริการสร้าง Sticker ด้วย AI</li>
            <li>ติดตามโควต้าการใช้งานรายวัน</li>
            <li>ป้องกันการใช้งานในทางที่ผิด (IP limiting)</li>
            <li>ปรับปรุงคุณภาพบริการ</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">3. การแชร์ข้อมูล</h2>
          <p>เราไม่ขาย ไม่เช่า ไม่แชร์ข้อมูลส่วนตัวของคุณกับบุคคลที่สาม ยกเว้น:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Stripe:</strong> สำหรับจัดการการชำระเงิน</li>
            <li><strong>Supabase:</strong> สำหรับเก็บข้อมูลและไฟล์</li>
            <li><strong>Replicate:</strong> สำหรับสร้างภาพ AI (ส่งเฉพาะ prompt ไม่มีข้อมูลส่วนตัว)</li>
            <li><strong>Groq:</strong> สำหรับแปลและปรับปรุง prompt</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">4. ความปลอดภัย</h2>
          <p>เราใช้ HTTPS, Row Level Security, และ server-side authentication เพื่อปกป้องข้อมูลของคุณ</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">5. Cookies</h2>
          <p>เราใช้ cookies สำหรับ:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>รักษาสถานะ login (session cookie)</li>
            <li>จำธีม (light/dark) ที่เลือก</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">6. สิทธิ์ของคุณ</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ลบบัญชีและข้อมูลทั้งหมด — ติดต่อ supakorn@windy-club.com</li>
            <li>ขอดูข้อมูลที่เราเก็บเกี่ยวกับคุณ</li>
            <li>ยกเลิกการสมัคร Pro ได้ตลอดเวลา</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">7. ติดต่อ</h2>
          <p>หากมีคำถาม ติดต่อ: <a href="mailto:supakorn@windy-club.com" className="text-violet-500 hover:underline">supakorn@windy-club.com</a></p>
        </section>
      </main>
    </div>
  );
}
