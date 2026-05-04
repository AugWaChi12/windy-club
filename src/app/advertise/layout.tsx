import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ลงโฆษณาบน Windy Club — เข้าถึงกลุ่มเป้าหมาย AI & Creative",
  description:
    "ลงโฆษณาบน Windy Club เข้าถึงกลุ่มเป้าหมายที่ชอบ AI และความน่ารัก เริ่มต้น ฿500/สัปดาห์ ส่งคำขอออนไลน์ได้ทันที",
  alternates: {
    canonical: "https://windy-club.com/advertise",
  },
};

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
