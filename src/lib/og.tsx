import { ImageResponse } from "next/og";
import { CATEGORY_META, type Command } from "@/lib/types";
import { SITE_ACCENT, SITE_BG, SITE_FG, SITE_KICKER, SITE_MUTED, SITE_URL } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

const common = {
  width: "100%",
  height: "100%",
  display: "flex",
  position: "relative" as const,
  backgroundColor: SITE_BG,
  color: SITE_FG,
  fontFamily: "sans-serif",
  padding: "72px 76px",
  boxSizing: "border-box" as const,
};

function MiniGraph() {
  const dots = [0, 1, 2, 3, 4];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0px",
        opacity: 0.7,
      }}
    >
      {dots.map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 99,
              backgroundColor: i === 4 ? SITE_ACCENT : "#3a3a40",
            }}
          />
          {i < dots.length - 1 && (
            <div style={{ width: 46, height: 2, backgroundColor: "#26262b" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function BrandCard() {
  return (
    <div style={{ ...common, flexDirection: "column", justifyContent: "space-between" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: SITE_ACCENT,
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            git
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: SITE_MUTED,
            }}
          >
            {SITE_KICKER}
          </div>
        </div>
        <div style={{ fontSize: 18, color: SITE_MUTED }}>{SITE_URL.replace("https://", "")}</div>
      </div>

      {/* headline */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            maxWidth: 880,
          }}
        >
          Every git command,
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: SITE_ACCENT }}>opened up</span>
          <span> from the inside.</span>
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 26,
            lineHeight: 1.5,
            color: SITE_MUTED,
            maxWidth: 820,
          }}
        >
          Plain explanations, animated visuals of the internals, guided walkthroughs, and the
          aliases the pros type every day.
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #232327",
          paddingTop: 28,
        }}
      >
        <MiniGraph />
        <div style={{ fontSize: 18, color: SITE_MUTED, fontFamily: "monospace" }}>
          28 commands · 28 visuals · 2 learner modes
        </div>
      </div>
    </div>
  );
}

function CommandCard({ command }: { command: Command }) {
  const meta = CATEGORY_META[command.category];
  return (
    <div style={{ ...common, flexDirection: "column", justifyContent: "space-between" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: 19,
            fontWeight: 600,
            color: SITE_MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}
        >
          <span style={{ color: SITE_ACCENT }}>●</span> {meta.label}
        </div>
        <div style={{ fontSize: 18, color: SITE_MUTED, fontFamily: "monospace" }}>{SITE_KICKER}</div>
      </div>

      {/* headline */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "auto",
            maxWidth: 900,
            borderRadius: 14,
            backgroundColor: SITE_ACCENT,
            color: "#fff",
            fontFamily: "monospace",
            fontSize: 30,
            fontWeight: 700,
            padding: "10px 26px",
          }}
        >
          {command.command}
        </div>
        <div style={{ marginTop: 30, fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.08 }}>
          {`${command.name}.`}
        </div>
        <div style={{ marginTop: 4, color: SITE_MUTED, fontSize: 40 }}>{command.syntax}</div>
        <div
          style={{
            marginTop: 24,
            fontSize: 24,
            lineHeight: 1.5,
            color: SITE_MUTED,
            maxWidth: 900,
          }}
        >
          {command.tagline}
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #232327",
          paddingTop: 28,
        }}
      >
        <MiniGraph />
        <div style={{ fontSize: 18, color: SITE_MUTED, fontFamily: "monospace" }}>
          {`git-in-depth · ${command.slug}`}
        </div>
      </div>
    </div>
  );
}

export function brandOG() {
  return new ImageResponse(<BrandCard />, { ...OG_SIZE });
}

export function commandOG(command: Command) {
  return new ImageResponse(<CommandCard command={command} />, {
    ...OG_SIZE,
  });
}