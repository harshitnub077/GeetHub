export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--obsidian)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
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
        @keyframes fadeInLoading {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .loading-bar {
          width: 4px;
          border-radius: 3px;
          background: var(--amber);
          transform-origin: center;
          animation: logo-wave 1.4s ease-in-out infinite;
        }
        .loading-bar:nth-child(1) { animation-delay: 0s; }
        .loading-bar:nth-child(2) { animation-delay: 0.15s; }
        .loading-bar:nth-child(3) { animation-delay: 0.3s; }
        .loading-bar:nth-child(4) { animation-delay: 0.08s; }
        .loading-bar:nth-child(5) { animation-delay: 0.22s; }
        .loading-bar:nth-child(6) { animation-delay: 0.38s; }
        .loading-text {
          animation: fadeInLoading 0.6s ease 0.2s both;
        }
      `}</style>

      {/* Waveform animation */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div className="loading-bar" style={{ height: 22 }} />
        <div className="loading-bar" style={{ height: 36 }} />
        <div className="loading-bar" style={{ height: 18 }} />
        <div className="loading-bar" style={{ height: 44 }} />
        <div className="loading-bar" style={{ height: 28 }} />
        <div className="loading-bar" style={{ height: 16 }} />
      </div>

      {/* Wordmark */}
      <div className="loading-text" style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--f-display)",
            fontWeight: 900,
            fontSize: 24,
            letterSpacing: "-0.045em",
            color: "var(--t1)",
            lineHeight: 1,
          }}
        >
          Geet<span style={{ color: "var(--amber)" }}>hub</span>
        </p>
        <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 8, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Loading…
        </p>
      </div>
    </div>
  );
}
