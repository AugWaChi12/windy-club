"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Ad {
  id: string;
  image_url: string;
  link_url: string;
  title: string;
}

const ROTATION_INTERVAL_MS = 5000;
const HOUSE_AD_ROTATION_MS = 6000;

// Default house ads shown when no real ads exist
const HOUSE_ADS = [
  {
    id: "house-pro",
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    emoji: "⭐",
    title: "อัปเกรด Pro",
    desc: "สร้างได้ 30 รูป/วัน + Batch 4 รูป + ไม่มีโฆษณา",
    cta: "฿199/เดือน →",
    href: "/create",
  },
  {
    id: "house-animate",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    emoji: "🎬",
    title: "Animated Sticker ใหม่!",
    desc: "เปลี่ยน Sticker ของคุณให้เป็นวิดีโอเคลื่อนไหว — Pro เท่านั้น",
    cta: "ลองเลย →",
    href: "/create",
  },
  {
    id: "house-styles",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    emoji: "🎨",
    title: "10 Styles ให้เลือก",
    desc: "Kawaii · Anime · 3D Clay · Neon · Pixel · Watercolor · อื่นๆ",
    cta: "สร้างฟรี →",
    href: "/create",
  },
  {
    id: "house-advertise",
    gradient: "from-blue-400 via-indigo-500 to-violet-500",
    emoji: "📢",
    title: "ลงโฆษณากับ Windy Club",
    desc: "เข้าถึงกลุ่มเป้าหมายชอบ AI + ความน่ารัก — เริ่ม ฿500/สัปดาห์",
    cta: "ดูรายละเอียด →",
    href: "/advertise",
  },
];

function HouseAdBanner({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * HOUSE_ADS.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HOUSE_ADS.length);
    }, HOUSE_AD_ROTATION_MS);
    return () => clearInterval(interval);
  }, []);

  const ad = HOUSE_ADS[index];

  return (
    <div className={`ad-slot overflow-hidden relative ${className}`}>
      <Link href={ad.href} className="block w-full">
        <div
          className={`w-full rounded-xl bg-gradient-to-r ${ad.gradient} p-[1px] transition-all duration-500`}
        >
          <div className="w-full rounded-xl bg-background/90 dark:bg-background/80 backdrop-blur-sm px-3 py-2 flex items-center gap-2.5">
            <span className="text-lg shrink-0">{ad.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">{ad.title}</p>
              <p className="text-[10px] text-muted truncate hidden sm:block">{ad.desc}</p>
            </div>
            <span
              className={`shrink-0 text-[10px] font-bold bg-gradient-to-r ${ad.gradient} text-white px-2.5 py-0.5 rounded-full whitespace-nowrap`}
            >
              {ad.cta}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function AdBanner({
  position,
  isPro = false,
  className = "",
}: {
  position: string;
  isPro?: boolean;
  className?: string;
}) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isPro) return;
    fetch(`/api/ads?position=${encodeURIComponent(position)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ads?.length > 0) {
          setAds(data.ads);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [position, isPro]);

  // Rotate ads
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [ads.length]);

  // Track impression
  const trackClick = useCallback(
    (adId: string) => {
      fetch("/api/ads/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      }).catch(() => {});
    },
    []
  );

  // Pro users: no ads
  if (isPro) return null;

  // No ads available: show house ads
  if (loaded && ads.length === 0) {
    return <HouseAdBanner className={className} />;
  }

  if (!loaded || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <div className={`ad-slot ad-slot-banner overflow-hidden relative ${className}`}>
      <a
        href={currentAd.link_url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        onClick={() => trackClick(currentAd.id)}
        className="block w-full h-full"
      >
        <img
          src={currentAd.image_url}
          alt={currentAd.title}
          className="w-full h-full object-cover rounded-xl transition-opacity duration-500"
        />
      </a>
      {/* Rotation dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {ads.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-violet-500 w-3"
                  : "bg-foreground/20"
              }`}
            />
          ))}
        </div>
      )}
      {/* Tiny ad label */}
      <span className="absolute top-1 right-2 text-[9px] text-muted/40">AD</span>
    </div>
  );
}
