import { ImageResponse } from "next/og";

export const alt = "DOCS SHOW — La bibliothèque des livres tech";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eff6ff 0%, #ffffff 52%, #dbeafe 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 1040,
            height: 510,
            display: "flex",
            alignItems: "center",
            gap: 64,
            padding: "72px",
            border: "1px solid #dbeafe",
            borderRadius: 36,
            background: "#ffffff",
            boxShadow: "0 28px 90px rgba(37, 99, 235, 0.12)",
          }}
        >
          <div
            style={{
              width: 220,
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 48,
              background: "#2563eb",
            }}
          >
            <svg width="152" height="152" viewBox="0 0 64 64" fill="none">
              <path
                d="M19 12h18l11 11v28a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z"
                fill="white"
              />
              <path
                d="M37 12v9a3 3 0 0 0 3 3h8"
                fill="#bfdbfe"
                stroke="white"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M23 33h18M23 40h18M23 47h11"
                stroke="#2563eb"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                color: "#2563eb",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 5,
              }}
            >
              APPRENDRE, UN CHAPITRE À LA FOIS
            </div>
            <div
              style={{
                color: "#111827",
                fontSize: 76,
                fontWeight: 800,
                letterSpacing: -3,
              }}
            >
              DOCS SHOW
            </div>
            <div style={{ color: "#475569", fontSize: 34 }}>
              La bibliothèque des livres tech
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
