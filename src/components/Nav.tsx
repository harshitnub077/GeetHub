"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Zap, Music2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/",           label: "Home" },
  { href: "/explore",    label: "Explore" },
  { href: "/play-along", label: "Play Along" },
  { href: "/commit",     label: "Contribute" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 900,
          height: 64,
          display: "flex",
          alignItems: "center",
          background: scrolled
            ? "rgba(6,6,8,0.88)"
            : "rgba(6,6,8,0.5)",
          backdropFilter: "blur(28px) saturate(1.3)",
          WebkitBackdropFilter: "blur(28px) saturate(1.3)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.07)"
            : "1px solid transparent",
          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg, rgba(240,154,34,0.18) 0%, rgba(240,154,34,0.06) 100%)",
              border: "1px solid rgba(240,154,34,0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V5l12-2v13" stroke="#f09a22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="#f09a22" strokeWidth="2"/>
                <circle cx="18" cy="16" r="3" stroke="#f09a22" strokeWidth="2"/>
              </svg>
            </div>
            <span style={{
              fontFamily: "var(--f-display)",
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: "-0.04em",
              color: "var(--t1)",
            }}>
              Geet<span style={{ color: "var(--amber)" }}>hub</span>
            </span>
          </Link>

          {/* ── Center Nav ── */}
          <nav style={{ display: "flex", gap: 28 }} className="hide-mobile">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname === l.href ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* ── Right ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/explore" className="btn btn-ghost btn-sm hide-mobile" aria-label="Search songs" style={{ gap: 6 }}>
              <Search size={14} /> Search
            </Link>
            <Link href="/commit" className="btn btn-primary btn-sm hide-mobile" aria-label="Contribute chords" style={{ gap: 6 }}>
              <Zap size={14} /> Contribute
            </Link>

            {/* Mobile hamburger */}
            <button
              className="btn btn-surface btn-icon show-mobile"
              onClick={() => setOpen(o => !o)}
              aria-label="Menu"
              style={{ color: "var(--t1)", width: 40, height: 40 }}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -28 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 850,
              background: "rgba(6,6,8,0.97)",
              backdropFilter: "blur(24px)",
              display: "flex",
              flexDirection: "column",
              paddingTop: 74,
            }}
          >
            {/* Amber top accent */}
            <div style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--amber), transparent)",
              opacity: 0.35,
            }} />

            <div className="container" style={{ paddingTop: 36, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.065, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={l.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 0",
                      fontSize: 28,
                      fontFamily: "var(--f-display)",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      color: pathname === l.href ? "var(--amber)" : "var(--t1)",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      transition: "color 0.2s",
                    }}
                  >
                    {l.label}
                    <span style={{ fontSize: 18, color: "var(--t3)" }}>→</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="container" style={{ paddingBottom: 48, display: "flex", gap: 12 }}>
              <Link href="/explore" className="btn btn-ghost btn-lg btn-full" style={{ flex: 1 }}>
                <Search size={16} /> Search Songs
              </Link>
              <Link href="/commit" className="btn btn-primary btn-lg btn-full" style={{ flex: 1 }}>
                <Zap size={16} /> Add Chords
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
