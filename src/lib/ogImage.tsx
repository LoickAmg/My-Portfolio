import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

const COLORS = {
  background: "#0a0d18",
  ink: "#eef1f8",
  inkMuted: "rgba(238, 241, 248, 0.62)",
  accent: "#4d6bff",
};

// Satori (moteur d'ImageResponse) ne lit pas le WOFF2 : les deux polices sont
// lues en OTF, non modifiées, depuis src/app/fonts/og.
async function loadFont(file: string): Promise<Buffer> {
  return readFile(join(process.cwd(), "src/app/fonts/og", file));
}

export async function renderOgImage(): Promise<ImageResponse> {
  const [display, text] = await Promise.all([loadFont("Stardom-Regular.otf"), loadFont("Satoshi-Medium.otf")]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: COLORS.background,
          color: COLORS.ink,
        }}
      >
        <div style={{ width: 14, height: "100%", background: COLORS.accent }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Satoshi",
              fontSize: 24,
              letterSpacing: 6,
              color: COLORS.inkMuted,
            }}
          >
            PORTFOLIO / 2026
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Stardom", fontSize: 176, lineHeight: 1 }}>Mahouna</div>
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontFamily: "Satoshi",
                fontSize: 40,
                color: COLORS.inkMuted,
              }}
            >
              Ingénieur IA & architecture logicielle
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", padding: "0 72px 64px 0" }}>
          <svg width="120" height="120" viewBox="0 0 32 32">
            <polygon points="16,2 30,16 16,30 2,16" fill="none" stroke={COLORS.accent} strokeWidth="2.4" />
            <polygon points="16,10 22,16 16,22 10,16" fill={COLORS.accent} />
          </svg>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Stardom", data: display, style: "normal", weight: 400 },
        { name: "Satoshi", data: text, style: "normal", weight: 500 },
      ],
    },
  );
}
