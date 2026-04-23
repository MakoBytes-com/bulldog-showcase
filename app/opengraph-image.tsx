import { ImageResponse } from "next/og";

export const alt = "Bulldog Security Service — Protect What Matters Most";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function RootOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #0061aa 0%, #003966 55%, #001321 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          Bulldog Security Service · Since 2010
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 1000,
            }}
          >
            Protect What Matters Most.
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 400,
              opacity: 0.92,
              marginTop: 28,
              maxWidth: 1000,
            }}
          >
            Family-owned ADT Authorized Dealer. 30,000+ homes protected across Texas
            &amp; Florida. Smart security, life safety, automation, 24/7 monitoring.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            opacity: 0.85,
          }}
        >
          <div>bulldogsecurityservice.com</div>
          <div style={{ fontWeight: 600 }}>#1 ADT Dealer in Texas</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
