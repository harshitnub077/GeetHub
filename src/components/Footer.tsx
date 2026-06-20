import Link from "next/link";
import { Github, ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  const cols = [
    {
      title: "Explore",
      links: [
        { href: "/explore",                label: "Browse All Songs" },
        { href: "/explore?filter=trending", label: "Trending" },
        { href: "/explore?filter=new",      label: "New Arrivals" },
        { href: "/play-along",              label: "Play Along Mode" },
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
        { href: "/explore?genre=Folk",      label: "Folk" },
      ],
    },
    {
      title: "Community",
      links: [
        { href: "/contribute",                       label: "Contribute Chords" },
        { href: "https://github.com/harshitnub077", label: "GitHub", external: true },
      ],
    },
  ];

  const socials = [
    { href: "https://github.com/harshitnub077", Icon: Github, label: "GitHub" },
  ];

  return (
    <>
      <style>{`
        .footer-link { transition: color 0.2s; }
        .footer-link:hover { color: var(--amber) !important; }
        .footer-legal:hover { color: var(--t1) !important; }
        .footer-social {
          transition: all 0.22s var(--spring) !important;
        }
        .footer-social:hover {
          background: rgba(255,255,255,0.08) !important;
          color: var(--t1) !important;
          border-color: rgba(255,255,255,0.14) !important;
          transform: translateY(-3px) !important;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2.2fr 1fr 1fr 1fr;
          gap: 52px;
          margin-bottom: 60px;
        }
        @media(max-width:960px){ .footer-grid{ grid-template-columns: 1.5fr 1fr 1fr; } }
        @media(max-width:640px){ .footer-grid{ grid-template-columns: 1fr 1fr; } }
        @media(max-width:420px){ .footer-grid{ grid-template-columns: 1fr; } }

      `}</style>

      <footer
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          paddingTop: 72,
          paddingBottom: 40,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1600&auto=format&q=40")`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            opacity: 0.03,
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />

        {/* Top amber line */}
        <div
          style={{
            position: "absolute",
            top: 0, left: "3%", right: "3%",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(245,166,35,0.35), transparent)",
          }}
        />

        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            bottom: "-35%", left: "50%",
            transform: "translateX(-50%)",
            width: "55vw", height: "55vw",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,166,35,0.035) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="footer-grid">
            {/* ── Brand column ── */}
            <div>
              <Link href="/" style={{ display: "inline-flex", textDecoration: "none", marginBottom: 20 }}>
                <Logo size={32} />
              </Link>

              <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.78, maxWidth: 270, marginBottom: 28 }}>
                Open-source guitar chord sheets for every song. 400+ songs and growing. Play Along, Transpose, Stage Mode.
              </p>

              {/* Socials */}
              <div style={{ display: "flex", gap: 8 }}>
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
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid var(--border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--t3)", textDecoration: "none",
                    }}
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* ── Link columns ── */}
            {cols.map((col) => (
              <div key={col.title}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 20 }}>
                  {col.title}
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 13, listStyle: "none" }}>
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
                        {l.external && <ArrowUpRight size={11} style={{ opacity: 0.45 }} />}
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
              {["Terms", "Privacy", "DMCA"].map((item) => (
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
