import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--obsidian)", textAlign:"center", paddingTop:60 }}>
      {/* Ambient glow */}
      <div style={{ position:"fixed", top:"30%", left:"50%", transform:"translateX(-50%)", width:"50vw", height:"50vw", borderRadius:"50%", background:"rgba(245,166,35,0.05)", filter:"blur(100px)", pointerEvents:"none" }}/>

      <div className="container" style={{ position:"relative", zIndex:1 }}>
        {/* Big 404 */}
        <p style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(80px,18vw,160px)", lineHeight:1, letterSpacing:"-0.05em", color:"transparent", WebkitTextStroke:"2px rgba(245,166,35,0.3)", marginBottom:0 }}>
          404
        </p>

        {/* Guitar strings as the 0 */}
        <div style={{ marginBottom:32 }}>
          <svg viewBox="0 0 200 40" style={{ width:"min(200px, 50vw)", height:"auto" }}>
            {[6,14,22,30].map((y,i)=>(
              <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="rgba(245,166,35,0.3)" strokeWidth="1.5"/>
            ))}
            {/* fret */}
            <line x1="100" y1="0" x2="100" y2="40" stroke="rgba(245,166,35,0.5)" strokeWidth="2"/>
            {/* dot */}
            <circle cx="100" cy="20" r="5" fill="var(--amber)" fillOpacity="0.8"/>
          </svg>
        </div>

        <h1 style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(24px,4vw,40px)", marginBottom:12 }}>
          This page dropped out of tune
        </h1>
        <p style={{ fontSize:16, color:"var(--t2)", maxWidth:380, margin:"0 auto 36px", lineHeight:1.7 }}>
          The page you're looking for doesn't exist — maybe it was transposed to a different key.
        </p>

        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/" className="btn btn-primary btn-lg">Go Home</Link>
          <Link href="/explore" className="btn btn-ghost btn-lg">Browse Songs</Link>
        </div>
      </div>
    </div>
  );
}
