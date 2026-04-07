export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", paddingTop: 80 }}>
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Skeleton hero header */}
        <div style={{ marginBottom: 32 }}>
          <div className="skeleton" style={{ height: 14, width: 120, borderRadius: 999, marginBottom: 20 }} />
          <div className="skeleton" style={{ height: 48, width: "55%", borderRadius: 10, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, width: "30%", borderRadius: 8 }} />
        </div>

        {/* Skeleton rows */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 12,
              border: "1px solid var(--border)", marginBottom: 8,
              opacity: 1 - i * 0.07,
            }}
          >
            <div className="skeleton" style={{ height: 14, width: `${35 + (i % 3) * 12}%` }} />
            <div className="skeleton" style={{ height: 12, width: `${18 + (i % 4) * 6}%`, marginLeft: 8 }} />
            <div style={{ marginLeft: "auto" }}>
              <div className="skeleton" style={{ height: 20, width: 56, borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
