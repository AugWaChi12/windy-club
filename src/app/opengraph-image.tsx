import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Windy Club — AI Sticker Creator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #ec4899 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "32px",
            padding: "48px 64px",
            maxWidth: "900px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
          }}
        >
          {/* Logo + Title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #d946ef, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              W
            </div>
            <span
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                background: "linear-gradient(90deg, #7c3aed, #d946ef, #ec4899)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Windy Club
            </span>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "28px",
              color: "#374151",
              marginTop: "0",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            สร้าง Sticker สุดน่ารักด้วย AI ใน 1 วินาที
          </p>

          {/* Features row */}
          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            {["🎨 10 Styles", "🇹🇭 ภาษาไทย", "⚡ ฟรี 3 ครั้ง/วัน", "🎬 Animated"].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "100px",
                    backgroundColor: "#f3f0ff",
                    fontSize: "18px",
                    color: "#7c3aed",
                    fontWeight: "600",
                  }}
                >
                  {feature}
                </div>
              )
            )}
          </div>
        </div>

        {/* URL */}
        <p
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.8)",
            marginTop: "24px",
          }}
        >
          windy-club.com
        </p>
      </div>
    ),
    { ...size }
  );
}
