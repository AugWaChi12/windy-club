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

  // No ads available: show placeholder with advertise link
  if (loaded && ads.length === 0) {
    return (
      <div className={`ad-slot ad-slot-banner ${className}`}>
        <Link
          href="/advertise"
          className="flex items-center gap-2 text-xs text-muted/60 hover:text-violet-500 transition-colors"
        >
          <span>📢</span>
          <span>ลงโฆษณาที่นี่</span>
        </Link>
      </div>
    );
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
