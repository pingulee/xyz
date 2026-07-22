import { ImageResponse } from "next/og";

export const alt = "롤 대리 전문 XYZ";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 78% 18%, rgba(222,176,67,.28), transparent 30%), linear-gradient(135deg, #050505 0%, #11100c 56%, #050505 100%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(222,176,67,.35)",
            borderRadius: 44,
            display: "flex",
            flexDirection: "column",
            height: 510,
            justifyContent: "space-between",
            padding: "64px 70px",
            width: 1080,
          }}
        >
          <div
            style={{
              color: "#e8c86d",
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 7,
            }}
          >
            PREMIUM RANK SERVICE
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#f8f6ef",
                display: "flex",
                fontSize: 72,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              LOL BOOSTING SPECIALIST
            </div>
            <div
              style={{
                color: "#d8ad42",
                display: "flex",
                fontSize: 112,
                fontWeight: 900,
                letterSpacing: 4,
                lineHeight: 1,
                marginTop: 18,
              }}
            >
              XYZ
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              color: "#aaa59a",
              display: "flex",
              fontSize: 22,
              justifyContent: "space-between",
              letterSpacing: 2,
            }}
          >
            <span>BOOSTING · DUO · ACCOUNT</span>
            <span>24H CONSULTING</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
