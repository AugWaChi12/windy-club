import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ข้อกำหนดการใช้งาน — Windy Club",
  description: "ข้อกำหนดและเงื่อนไขการใช้งาน Windy Club",
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold mb-6">ข้อกำหนดการใช้งาน (Terms of Service)</h1>
        <p className="text-sm text-muted mb-4">อัปเดตล่าสุด: 4 พฤษภาคม 2026</p>

        <section className="space-y-4 text-sm text-foreground/80">
          <h2 className="text-lg font-semibold text-foreground mt-8">1. การยอมรับข้อกำหนด</h2>
          <p>การใช้งาน Windy Club (windy-club.com) หมายความว่าคุณยอมรับข้อกำหนดเหล่านี้ทั้งหมด หากไม่ยอมรับ กรุณาหยุดใช้งาน</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">2. บริการ</h2>
          <p>Windy Club ให้บริการสร้าง Sticker ด้วย AI โดย:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>ผู้ใช้ฟรี: สร้างได้ 3 รูป/วัน, batch สูงสุด 2 รูป</li>
            <li>ผู้ใช้ Pro (฿199/เดือน): สร้างได้ 30 รูป/วัน, batch สูงสุด 4 รูป, ไม่มีโฆษณา</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">3. บัญชีผู้ใช้</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ต้องให้อีเมลจริงในการสมัคร</li>
            <li>ห้ามสร้างหลายบัญชีเพื่อหลีกเลี่ยงโควต้า (จำกัด 3 บัญชี/IP)</li>
            <li>คุณรับผิดชอบรักษาความปลอดภัยของบัญชี</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">4. เนื้อหาที่สร้าง</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sticker ที่สร้างเป็นของคุณ — ใช้ส่วนตัวหรือเชิงพาณิชย์ได้</li>
            <li>ห้ามสร้างเนื้อหาที่ผิดกฎหมาย ลามก รุนแรง หรือละเมิดลิขสิทธิ์</li>
            <li>เราขอสงวนสิทธิ์ลบเนื้อหาที่ไม่เหมาะสม</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">5. การชำระเงินและการยกเลิก</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pro Plan เรียกเก็บ ฿199/เดือน ผ่าน Stripe</li>
            <li>ยกเลิกได้ตลอดเวลา — ใช้งานได้จนสิ้นรอบบิล</li>
            <li>ไม่มีการคืนเงินสำหรับเดือนที่ใช้ไปแล้ว</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">6. ข้อจำกัดการใช้งาน</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>ห้ามใช้ bot หรือ script อัตโนมัติ</li>
            <li>ห้าม reverse engineer หรือ scrape ระบบ</li>
            <li>ห้ามใช้ในทางที่อาจสร้างความเสียหายต่อระบบ</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">7. ข้อจำกัดความรับผิดชอบ</h2>
          <p>บริการให้ &quot;ตามสภาพ&quot; (as-is) เราไม่รับประกันว่า:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>บริการจะพร้อมใช้งาน 100% ตลอดเวลา</li>
            <li>ผลลัพธ์ AI จะตรงตามที่คาดหวังทุกครั้ง</li>
            <li>ไฟล์ที่เก็บจะไม่สูญหาย (แนะนำให้ดาวน์โหลดเก็บไว้)</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground mt-8">8. การเปลี่ยนแปลง</h2>
          <p>เราอาจเปลี่ยนแปลงข้อกำหนดเหล่านี้ได้ตลอดเวลา การใช้งานต่อหลังการเปลี่ยนแปลงถือว่ายอมรับข้อกำหนดใหม่</p>

          <h2 className="text-lg font-semibold text-foreground mt-8">9. ติดต่อ</h2>
          <p>คำถามเกี่ยวกับข้อกำหนด: <a href="mailto:supakorn@windy-club.com" className="text-violet-500 hover:underline">supakorn@windy-club.com</a></p>
        </section>
      </main>
    </div>
  );
}
