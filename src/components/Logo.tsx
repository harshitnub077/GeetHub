export default function Logo({ size = 32 }: { size?: number }) {
  const fontSize = Math.max(16, size * 0.7);
  
  return (
    <div 
      style={{ 
        display: "inline-flex", 
        alignItems: "center",
        userSelect: "none",
        fontFamily: "'Arial Black', 'Arial', sans-serif",
        fontWeight: 900,
        fontSize: fontSize,
        letterSpacing: "-0.05em"
      }}
    >
      <span style={{ color: "#ffffff", paddingRight: "1px" }}>Geet</span>
      <div 
        style={{ 
          background: "#ff9900", // Exact reference orange
          color: "#000000", 
          padding: "3px 7px", 
          borderRadius: 8,     
          marginLeft: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1
        }}
      >
        hub
      </div>
    </div>
  );
}
