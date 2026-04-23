import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0061aa 0%, #003966 100%)",
          color: "white",
          fontFamily: "Georgia, serif",
          fontSize: 88,
          fontWeight: 700,
          letterSpacing: -2,
          borderRadius: 32,
        }}
      >
        BDS
      </div>
    ),
    { ...size },
  );
}
