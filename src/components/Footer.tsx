import Link from "next/link";

export default function Footer() {
  const cols = [
    { title: "Explore", links: [
      { href:"/explore",                  label:"Browse Songs" },
      { href:"/explore?filter=trending",  label:"Trending" },
      { href:"/explore?filter=new",       label:"New Arrivals" },
      { href:"/play-along",               label:"Play Along Mode" },
    ]},
    { title: "Genres", links: [
      { href:"/explore?genre=Bollywood",  label:"Bollywood" },
      { href:"/explore?genre=Rock",       label:"Rock" },
      { href:"/explore?genre=Pop",        label:"Pop" },
      { href:"/explore?genre=Classical",  label:"Classical" },
    ]},
    { title: "Community", links: [
      { href:"/commit",  label:"Contribute Chords" },
    ]},
  ];

  return (
    <>
      <style>{`
        .footer-link:hover { color: var(--amber) !important; }
        .footer-legal:hover { color: var(--t2) !important; }
        .footer-social:hover { background: rgba(255,255,255,0.08) !important; color: var(--t1) !important; }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
        @media(max-width:767px){ .footer-grid{ grid-template-columns:1fr 1fr; } }
        @media(max-width:480px){ .footer-grid{ grid-template-columns:1fr; } }
      `}</style>

      <footer style={{ background:"var(--surface)", borderTop:"1px solid var(--border)", paddingTop:56, paddingBottom:32 }}>
        {/* Amber string line */}
        <div style={{ height:2, background:"linear-gradient(90deg,transparent,var(--amber),transparent)", opacity:0.18, marginBottom:48 }}/>

        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:16, textDecoration:"none" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="rgba(245,166,35,0.12)" stroke="rgba(245,166,35,0.25)" strokeWidth="1"/>
                  <rect x="14" y="4" width="4" height="22" rx="2" fill="#F5A623"/>
                  <rect x="9" y="7" width="14" height="3" rx="1.5" fill="#F5A623" fillOpacity=".5"/>
                  <circle cx="9"  cy="7"  r="2"   fill="#F5A623" fillOpacity=".7"/>
                  <circle cx="23" cy="7"  r="2"   fill="#F5A623" fillOpacity=".7"/>
                  <circle cx="9"  cy="12" r="1.5" fill="#F5A623" fillOpacity=".4"/>
                  <circle cx="23" cy="12" r="1.5" fill="#F5A623" fillOpacity=".4"/>
                  <circle cx="16" cy="14" r="1.8" fill="#09090e"/>
                  <circle cx="16" cy="20" r="1.3" fill="#09090e" fillOpacity=".6"/>
                </svg>
                <span style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:20, letterSpacing:"-0.03em", color:"var(--t1)" }}>
                  Geet<span style={{ color:"var(--amber)" }}>hub</span>
                </span>
              </Link>
              <p style={{ fontSize:14, color:"var(--t2)", lineHeight:1.7, maxWidth:280 }}>
                The open-source home for guitar, ukulele &amp; piano chords. 50,000+ songs. Play Along. Transpose. Perform.
              </p>
              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                {[
                  { href:"https://github.com/harshitnub077", label:"GH",  emoji:"⌥" },
                  { href:"#", label:"YT",  emoji:"▶" },
                  { href:"#", label:"TW",  emoji:"✦" },
                  { href:"#", label:"IG",  emoji:"◉" },
                ].map(({ href, label, emoji }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="footer-social"
                    style={{ width:36, height:36, borderRadius:9, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"var(--t2)", textDecoration:"none", transition:"all 0.2s" }}
                  >
                    {emoji}
                  </a>
                ))}
              </div>
            </div>

            {cols.map(col => (
              <div key={col.title}>
                <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.07em", textTransform:"uppercase", color:"var(--t3)", marginBottom:16 }}>
                  {col.title}
                </p>
                <ul style={{ display:"flex", flexDirection:"column", gap:10, listStyle:"none" }}>
                  {col.links.map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="footer-link" style={{ fontSize:14, color:"var(--t2)", textDecoration:"none", transition:"color 0.2s" }}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ height:1, background:"var(--border)", marginBottom:24 }}/>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <p style={{ fontSize:13, color:"var(--t3)" }}>
              © {new Date().getFullYear()} Geethub. Open source. Made with ♥ for guitarists worldwide.
            </p>
            <div style={{ display:"flex", gap:14 }}>
              {["Terms","Privacy","DMCA"].map(item => (
                <Link key={item} href="#" className="footer-legal" style={{ fontSize:13, color:"var(--t3)", textDecoration:"none", transition:"color 0.2s" }}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
