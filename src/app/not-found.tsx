import Link from "next/link";
import { Search, ArrowLeft, Music2 } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--obsidian)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: 64,
        paddingInline: "clamp(20px, 5vw, 64px)",
      }}
    >
      <style>{`
        @keyframes logo-wave {
          0%,100% { transform: scaleY(0.35); }
          20% { transform: scaleY(1); }
          40% { transform: scaleY(0.65); }
          60% { transform: scaleY(0.88); }
          80% { transform: scaleY(0.45); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nf-404 {
          font-family: var(--f-display);
          font-weight: 900;
          font-size: clamp(120px, 20vw, 240px);
          letter-spacing: -0.08em;
          line-height: 0.9;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.06);
          background: linear-gradient(
            180deg,
            rgba(255,255,255,0.06) 0%,
            rgba(245,166,35,0.04) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          user-select: none;
          animation: fadeUp 0.8s ease both;
        }
        .nf-wave-bar {
          width: 5px;
          border-radius: 3px;
          background: var(--amber);
          transform-origin: center;
          opacity: 0.6;
          animation: logo-wave 1.6s ease-in-out infinite;
        }
        .nf-wave-bar:nth-child(1) { animation-delay: 0.0s; }
        .nf-wave-bar:nth-child(2) { animation-delay: 0.18s; }
        .nf-wave-bar:nth-child(3) { animation-delay: 0.35s; }
        .nf-wave-bar:nth-child(4) { animation-delay: 0.1s; }
        .nf-wave-bar:nth-child(5) { animation-delay: 0.28s; }
        .nf-content { animation: fadeUp 0.9s ease 0.15s both; }
      `}</style>

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw", height: "60vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%", left: "20%",
          width: "30vw", height: "30vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,111,205,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, black 0%, transparent 90%)",
          opacity: 0.4,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Giant 404 */}
        <div className="nf-404">404</div>

        {/* Waveform instead of sad face */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            marginTop: -16,
            marginBottom: 36,
          }}
        >
          <div className="nf-wave-bar" style={{ height: 20 }} />
          <div className="nf-wave-bar" style={{ height: 36 }} />
          <div className="nf-wave-bar" style={{ height: 16 }} />
          <div className="nf-wave-bar" style={{ height: 44 }} />
          <div className="nf-wave-bar" style={{ height: 26 }} />
        </div>

        <div className="nf-content">
          <p
            style={{
              fontFamily: "var(--f-display)",
              fontWeight: 900,
              fontSize: "clamp(24px, 4vw, 40px)",
              letterSpacing: "-0.04em",
              marginBottom: 14,
              color: "var(--t1)",
            }}
          >
            This page went off-key.
          </p>
          <p style={{ fontSize: 16, color: "var(--t2)", maxWidth: 380, margin: "0 auto 44px", lineHeight: 1.75 }}>
            Looks like this page doesn&apos;t exist. Try searching for a song instead — we&apos;ve got 19,500+ waiting.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-ghost btn-lg" style={{ gap: 8 }}>
              <ArrowLeft size={16} /> Back Home
            </Link>
            <Link href="/explore" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
              <Search size={16} /> Find a Song
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
