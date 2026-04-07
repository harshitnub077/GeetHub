"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { href: "/",          label: "Home" },
  { href: "/explore",   label: "Explore" },
  { href: "/play-along",label: "Play Along" },
  { href: "/commit",    label: "Contribute" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* ── Desktop / top bar ── */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 900,
          height: 60,
          display: "flex",
          alignItems: "center",
          background: scrolled ? "rgba(9,9,14,0.9)" : "rgba(9,9,14,0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          transition: "all 0.3s",
        }}
      >
        <div className="container" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
            {/* SVG Logo */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(245,166,35,0.12)" stroke="rgba(245,166,35,0.25)" strokeWidth="1"/>
              {/* Guitar headstock shape */}
              <rect x="14" y="4" width="4" height="22" rx="2" fill="#F5A623"/>
              <rect x="9" y="7" width="14" height="3" rx="1.5" fill="#F5A623" fillOpacity=".5"/>
              {/* tuning peg circles */}
              <circle cx="9"  cy="7"  r="2" fill="#F5A623" fillOpacity=".7"/>
              <circle cx="23" cy="7"  r="2" fill="#F5A623" fillOpacity=".7"/>
              <circle cx="9"  cy="12" r="1.5" fill="#F5A623" fillOpacity=".4"/>
              <circle cx="23" cy="12" r="1.5" fill="#F5A623" fillOpacity=".4"/>
              {/* fret markers */}
              <circle cx="16" cy="14" r="1.8" fill="#09090e"/>
              <circle cx="16" cy="20" r="1.3" fill="#09090e" fillOpacity=".6"/>
            </svg>

            <span style={{
              fontFamily: "var(--f-display)",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: "-0.03em",
              color: "var(--t1)",
            }}>
              Geet<span style={{ color:"var(--amber)" }}>hub</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav style={{ display:"flex", gap:32 }} className="hide-mobile">
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

          {/* Right */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Link href="/explore" className="btn btn-surface btn-sm hide-mobile" style={{ gap:6 }}>
              <Search size={14}/> Search
            </Link>
            <Link href="/commit" className="btn btn-primary btn-sm hide-mobile" style={{ gap:6 }}>
              <Zap size={14}/> Contribute
            </Link>

            {/* mobile hamburger */}
            <button
              className="btn btn-surface btn-icon show-mobile"
              onClick={() => setOpen(o => !o)}
              aria-label="Menu"
              style={{ color:"var(--t1)" }}
            >
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity:0, y:-20 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-20 }}
            transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
            style={{
              position:"fixed", inset:0, zIndex:850,
              background:"var(--obsidian)",
              display:"flex", flexDirection:"column",
              paddingTop: 70,
            }}
          >
            {/* amber line top */}
            <div style={{ height:2, background:"linear-gradient(90deg,transparent,var(--amber),transparent)", opacity:.4 }}/>

            <div className="container" style={{ paddingTop:32, flex:1, display:"flex", flexDirection:"column", gap:4 }}>
              {LINKS.map((l,i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity:0, x:-20 }}
                  animate={{ opacity:1, x:0 }}
                  transition={{ delay:i*0.06, duration:0.3, ease:[0.16,1,0.3,1] }}
                >
                  <Link
                    href={l.href}
                    style={{
                      display:"block",
                      padding:"18px 0",
                      fontSize: 28,
                      fontFamily:"var(--f-display)",
                      fontWeight:900,
                      color: pathname===l.href ? "var(--amber)" : "var(--t1)",
                      borderBottom:"1px solid var(--border)",
                      letterSpacing:"-0.02em",
                    }}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="container" style={{ paddingBottom:40, display:"flex", gap:12 }}>
              <Link href="/explore" className="btn btn-ghost btn-lg btn-full">Search Songs</Link>
              <Link href="/commit" className="btn btn-primary btn-lg btn-full">+ Add Chords</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
