"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Zap, LogOut, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import Logo from "@/components/Logo";
import AuthModal from "@/components/AuthModal";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import { useProStore } from "@/lib/proStore";

const LINKS = [
  { href: "/",           label: "Home" },
  { href: "/explore",    label: "Explore" },
  { href: "/community",  label: "Community" },
  { href: "/tools",      label: "Guitar Tools" },
  { href: "/courses",    label: "Courses" },
  { href: "/play-along", label: "Play Along" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal]     = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K to navigate to search, Escape to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.location.href = "/explore";
      } else if (e.key === "Escape") {
        setOpen(false);
        setShowProfileMenu(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: scrolled ? 16 : 0,
          left: 0, right: 0,
          zIndex: 900,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            width: scrolled ? "calc(100% - 32px)" : "100%",
            maxWidth: scrolled ? 1200 : "100%",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: scrolled ? "0 20px" : "0 clamp(20px, 5vw, 60px)",
            borderRadius: scrolled ? 24 : 0,
            background: scrolled ? "rgba(10,10,14,0.75)" : "transparent",
            backdropFilter: scrolled ? "blur(32px) saturate(1.5)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(32px) saturate(1.5)" : "none",
            border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
            borderTop: scrolled ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
            boxShadow: scrolled ? "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
            transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div style={{ flex: 1 }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-flex" }}>
              <Logo size={28} />
            </Link>
          </div>

          {/* Center nav pills */}
          <nav className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    position: "relative",
                    padding: "8px 16px",
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#fff" : "var(--t2)",
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    letterSpacing: "-0.01em",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--t1)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "var(--t2)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14 }}>
            <Link
              href="/explore"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 100,
                fontSize: 13, fontWeight: 600, color: "var(--t2)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.05)",
                textDecoration: "none", transition: "all 0.2s"
              }}
              className="hide-mobile"
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--t2)"; }}
            >
              <Search size={14} /> Search
              <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(255,255,255,0.08)", color: "var(--t3)", fontFamily: "var(--f-mono)", marginLeft: 4 }}>⌘K</kbd>
            </Link>

            <Link
              href="/pro"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 100,
                background: "linear-gradient(135deg, rgba(245,166,35,0.22), rgba(255,138,0,0.15))",
                border: "1px solid rgba(245,166,35,0.45)",
                color: "var(--amber)",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.05em",
                textDecoration: "none",
                boxShadow: "0 0 14px rgba(245,166,35,0.15)",
                transition: "all 0.2s",
              }}
              className="hide-mobile"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow = "0 0 20px rgba(245,166,35,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 0 14px rgba(245,166,35,0.15)";
              }}
            >
              <Sparkles size={12} /> PRO
            </Link>
            
            <div className="hide-mobile">
              {status === "authenticated" ? (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "2px solid rgba(245,166,35,0.4)",
                      background: "rgba(245,166,35,0.1)",
                      overflow: "hidden",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      transition: "border-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--amber)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(245,166,35,0.4)"}
                  >
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={18} color="var(--amber)" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 16px)",
                          right: 0,
                          width: 220,
                          background: "var(--surface)",
                          backdropFilter: "blur(24px) saturate(1.5)",
                          borderRadius: 16,
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                          padding: 6,
                          zIndex: 1000,
                        }}
                      >
                        <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 2px 0", letterSpacing: "-0.01em" }}>{session.user?.name}</p>
                          <p style={{ fontSize: 12, color: "var(--t3)", margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{session.user?.email}</p>
                        </div>
                        <button
                          onClick={() => signOut()}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderRadius: 10,
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: "#ff4d4f",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,77,79,0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 20px", borderRadius: 100,
                    fontSize: 13.5, fontWeight: 700, color: "#fff",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#000"; e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "scale(1)"; }}
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "..." : "Sign In"}
                </button>
              )}
            </div>

            <Link
              href="/contribute"
              className="hide-mobile"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "9px 20px", borderRadius: 100,
                fontSize: 13.5, fontWeight: 700, color: "#000",
                background: "var(--amber)",
                border: "none", textDecoration: "none",
                boxShadow: "0 4px 14px rgba(245,166,35,0.3)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,166,35,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,166,35,0.3)"; }}
            >
              <Zap size={14} /> Contribute
            </Link>

            <button
              className="show-mobile"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Menu"}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer"
              }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mob"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", inset: 0, zIndex: 850,
              background: "rgba(5,5,10,0.98)",
              backdropFilter: "blur(40px)",
              display: "flex", flexDirection: "column",
              paddingTop: 100,
            }}
          >
            <div className="container" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 10 }}>Menu</div>
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                >
                  <Link
                    href={l.href}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "20px 0",
                      fontSize: 32,
                      fontFamily: "var(--f-display)", fontWeight: 900,
                      letterSpacing: "-0.04em",
                      color: pathname === l.href ? "#fff" : "var(--t2)",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      textDecoration: "none"
                    }}
                  >
                    {l.label}
                    <span style={{ fontSize: 18, color: "var(--amber)", opacity: pathname === l.href ? 1 : 0, transition: "opacity 0.2s" }}>●</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="container" style={{ paddingBottom: 60, display: "flex", flexDirection: "column", gap: 12 }}>
              {status === "authenticated" ? (
                <button
                  onClick={() => signOut()}
                  style={{
                    padding: "16px",
                    background: "rgba(255,77,79,0.12)",
                    border: "1px solid rgba(255,77,79,0.25)",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    color: "#ff4d4f",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={18} /> Sign Out ({session?.user?.name || "Musician"})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setOpen(false);
                    setShowAuthModal(true);
                  }}
                  style={{
                    padding: "16px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                  }}
                >
                  <User size={18} /> Sign In
                </button>
              )}
              <Link href="/explore" style={{ padding: "18px", background: "rgba(255,255,255,0.05)", borderRadius: 16, display: "flex", justifyContent: "center", gap: 8, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16 }}>
                <Search size={18} /> Search Songs
              </Link>
              <Link href="/contribute" style={{ padding: "18px", background: "var(--amber)", borderRadius: 16, display: "flex", justifyContent: "center", gap: 8, color: "#000", textDecoration: "none", fontWeight: 800, fontSize: 16 }}>
                <Zap size={18} /> Add Chords
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <ProUpgradeModal />
    </>
  );
}
