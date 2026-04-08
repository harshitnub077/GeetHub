import Link from "next/link";
import { Music2, Github, Youtube, Twitter, Instagram, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const cols = [
    {
      title: "Explore",
      links: [
        { href: "/explore",               label: "Browse All Songs" },
        { href: "/explore?filter=trending",label: "Trending" },
        { href: "/explore?filter=new",    label: "New Arrivals" },
        { href: "/play-along",            label: "Play Along Mode" },
      ],
    },
    {
      title: "Genres",
      links: [
        { href: "/explore?genre=Bollywood", label: "Bollywood" },
        { href: "/explore?genre=Rock",      label: "Rock" },
        { href: "/explore?genre=Pop",       label: "Pop" },
        { href: "/explore?genre=Classical", label: "Classical" },
        { href: "/explore?genre=Jazz",      label: "Jazz" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "/commit", label: "Contribute Chords" },
        { href: "https://github.com/harshitnub077", label: "GitHub", external: true },
      ],
    },
  ];

  const socials = [
    { href: "https://github.com/harshitnub077", Icon: Github,    label: "GitHub" },
    { href: "#", Icon: Youtube,   label: "YouTube" },
    { href: "#", Icon: Twitter,   label: "Twitter" },
    { href: "#", Icon: Instagram, label: "Instagram" },
  ];

  return (
    <>
      <style>{`
        .footer-link { transition: color 0.2s; }
        .footer-link:hover { color: var(--amber) !important; }
        .footer-legal:hover { color: var(--t1) !important; }
        .footer-social:hover {
          background: rgba(255,255,255,0.08) !important;
          color: var(--t1) !important;
          border-color: rgba(255,255,255,0.12) !important;
          transform: translateY(-2px);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 56px;
        }
        @media(max-width: 900px){ .footer-grid{ grid-template-columns: 1.5fr 1fr 1fr; } }
        @media(max-width: 600px){ .footer-grid{ grid-template-columns: 1fr 1fr; } }
        @media(max-width: 420px){ .footer-grid{ grid-template-columns: 1fr; } }
      `}</style>

      <footer style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        paddingTop: 64,
        paddingBottom: 36,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute",
          top: 0, left: "5%", right: "5%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(240,154,34,0.3), transparent)",
        }} />

        {/* Subtle glow */}
        <div style={{
          position: "absolute",
          bottom: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,154,34,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="footer-grid">
            {/* Brand column */}
            <div>
              <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20, textDecoration: "none" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(240,154,34,0.18), rgba(240,154,34,0.06))",
                  border: "1px solid rgba(240,154,34,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18V5l12-2v13" stroke="#f09a22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" stroke="#f09a22" strokeWidth="2" />
                    <circle cx="18" cy="16" r="3" stroke="#f09a22" strokeWidth="2" />
                  </svg>
                </div>
                <span style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-0.04em", color: "var(--t1)" }}>
                  Geet<span style={{ color: "var(--amber)" }}>hub</span>
                </span>
              </Link>

              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.75, maxWidth: 270, marginBottom: 28 }}>
                The open-source home for guitar, ukulele & piano chords. 50,000+ songs.
                Play Along. Transpose. Perform.
              </p>

              {/* Social links */}
              <div style={{ display: "flex", gap: 9 }}>
                {socials.map(({ href, Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="footer-social"
                    style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--t3)", textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {cols.map(col => (
              <div key={col.title}>
                <p style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "var(--t3)", marginBottom: 18,
                }}>
                  {col.title}
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none" }}>
                  {col.links.map((l: any) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="footer-link"
                        target={l.external ? "_blank" : undefined}
                        rel={l.external ? "noopener noreferrer" : undefined}
                        style={{
                          fontSize: 14,
                          color: "var(--t2)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {l.label}
                        {l.external && <ArrowUpRight size={11} style={{ opacity: 0.5 }} />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ height: 1, background: "var(--border)", marginBottom: 28 }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <p style={{ fontSize: 13, color: "var(--t3)" }}>
              © {new Date().getFullYear()} Geethub. Open source. Made with ♥ for guitarists worldwide.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Terms", "Privacy", "DMCA"].map(item => (
                <Link
                  key={item}
                  href="#"
                  className="footer-legal"
                  style={{ fontSize: 13, color: "var(--t3)", textDecoration: "none", transition: "color 0.2s" }}
                >
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
