import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สร้าง Sticker AI ฟรี — 10 สไตล์ Kawaii, Anime, 3D Clay",
  description:
    "สร้าง Sticker สุดน่ารักด้วย AI ฟรี! พิมพ์ภาษาไทยหรืออังกฤษ เลือก 10 สไตล์ Kawaii, Anime, 3D Clay, Pixel, Neon ดาวน์โหลดทันที ใช้ฟรี 3 ครั้ง/วัน",
  alternates: {
    canonical: "https://windy-club.com/create",
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
