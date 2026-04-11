"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function GlobalCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide native cursor globally
    document.documentElement.style.cursor = "none";

    gsap.set(dot,  { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(ring, { xPercent: -50, yPercent: -50, opacity: 0 });

    const xDot  = gsap.quickTo(dot,  "x", { duration: 0.05, ease: "none" });
    const yDot  = gsap.quickTo(dot,  "y", { duration: 0.05, ease: "none" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
      if (!visible) {
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        setVisible(true);
      }
    };

    const onLeave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    const onEnter = () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 });

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    // ── Hover states for interactive elements ──
    const onElEnter = () => {
      gsap.to(ring, { scale: 2.2, borderColor: "rgba(245,166,35,0.7)", borderWidth: "1px", duration: 0.3, ease: "power2.out" });
      gsap.to(dot,  { scale: 0,   duration: 0.2 });
    };
    const onElLeave = () => {
      gsap.to(ring, { scale: 1, borderColor: "rgba(255,255,255,0.25)", borderWidth: "1px", duration: 0.3, ease: "power2.out" });
      gsap.to(dot,  { scale: 1, duration: 0.2 });
    };
    const onElDown = () => {
      gsap.to(ring, { scale: 1.5, duration: 0.1 });
      gsap.to(dot,  { scale: 3, opacity: 0.3, duration: 0.15 });
    };
    const onElUp   = () => {
      gsap.to(ring, { scale: 2.2, duration: 0.15 });
      gsap.to(dot,  { scale: 0,   opacity: 1,  duration: 0.15 });
    };

    const attach = () => {
      document.querySelectorAll("a, button, [role=button], .interactive, input, textarea, select, label").forEach(el => {
        el.addEventListener("mouseenter", onElEnter);
        el.addEventListener("mouseleave", onElLeave);
        el.addEventListener("mousedown",  onElDown);
        el.addEventListener("mouseup",    onElUp);
      });
    };
    attach();

    // Re-attach after any DOM mutation (SPA navigation)
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      obs.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 38, height: 38,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.25)",
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: "difference",
          willChange: "transform",
        }}
      />
      {/* Sharp dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: 7, height: 7,
          borderRadius: "50%",
          background: "#fff",
          pointerEvents: "none",
          zIndex: 100000,
          willChange: "transform",
        }}
      />
    </>
  );
}
