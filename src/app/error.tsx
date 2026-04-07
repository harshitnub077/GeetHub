"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--obsidian)", textAlign:"center", paddingTop:60 }}>
      <div className="container" style={{ position:"relative", zIndex:1 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(255,92,92,0.12)", border:"2px solid rgba(255,92,92,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:32 }}>
          🎸
        </div>
        <h1 style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(26px,4vw,42px)", marginBottom:12 }}>
          Something broke a string
        </h1>
        <p style={{ fontSize:15, color:"var(--t2)", maxWidth:380, margin:"0 auto 32px", lineHeight:1.7 }}>
          An unexpected error occurred. Try refreshing or go back to safety.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre style={{ fontSize:12, color:"var(--red)", background:"rgba(255,92,92,0.07)", padding:"12px 16px", borderRadius:8, textAlign:"left", maxWidth:560, margin:"0 auto 24px", overflowX:"auto", border:"1px solid rgba(255,92,92,0.2)", fontFamily:"var(--f-mono)", lineHeight:1.6 }}>
            {error.message}
          </pre>
        )}
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => reset()} className="btn btn-primary btn-lg">Try Again</button>
          <Link href="/" className="btn btn-ghost btn-lg">Go Home</Link>
        </div>
      </div>
    </div>
  );
}
