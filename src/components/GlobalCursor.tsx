"use client";

/**
 * GlobalCursor — Custom GSAP-powered cursor overlay.
 *
 * Renders a dot + trailing ring that follows the mouse.
 * Disabled on touch/mobile devices (hover: none media query).
 * Plays subtle audio plucks on interactive element hover for tactile feedback.
 *
 * @module GlobalCursor
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function GlobalCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only display on non-touch
    if (window.matchMedia("(hover: none)").matches) return;

    const cursor = cursorRef.current;
    const ring = ringRef.current;
    if (!cursor || !ring) return;

    // Default GSAP settings
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    const speed = 0.15;

    const xTo = gsap.quickTo(ring, "x", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.8, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Move dot instantly
      gsap.to(cursor, { x: mouse.x, y: mouse.y, duration: 0, ease: "none" });
      // Queue quickTo for the ring
      xTo(mouse.x);
      yTo(mouse.y);
    };

    window.addEventListener("mousemove", onMove);

    // Audio Context Setup
    let audioCtx: AudioContext | null = null;
    const playPluck = (freq: number) => {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
      } catch(e) {}
    };

    // Interactive magnetism
    const links = document.querySelectorAll("a, button, .interactive");
    links.forEach(link => {
      link.addEventListener("mouseenter", () => {
        gsap.to(ring, { scale: 2.5, backgroundColor: "rgba(245, 166, 35, 0.1)", borderColor: "rgba(245, 166, 35, 0.6)", duration: 0.3 });
        gsap.to(cursor, { scale: 0, duration: 0.2 });
        playPluck(440); // A4
      });
      link.addEventListener("mouseleave", () => {
        gsap.to(ring, { scale: 1, backgroundColor: "transparent", borderColor: "rgba(255, 255, 255, 0.1)", duration: 0.3 });
        gsap.to(cursor, { scale: 1, duration: 0.2 });
      });
      link.addEventListener("mousedown", () => {
        gsap.to(ring, { scale: 1.8, duration: 0.1 });
        playPluck(659.25); // E5
      });
      link.addEventListener("mouseup", () => {
        gsap.to(ring, { scale: 2.5, duration: 0.2 });
      });
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        style={{
          position: "fixed", top: 0, left: 0, width: 36, height: 36,
          borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.1)",
          pointerEvents: "none", zIndex: 9999, transition: "background-color 0.2s, border-color 0.2s"
        }}
      />
      <div
        ref={cursorRef}
        style={{
          position: "fixed", top: 0, left: 0, width: 6, height: 6,
          borderRadius: "50%", background: "var(--amber)",
          pointerEvents: "none", zIndex: 10000,
          boxShadow: "0 0 10px rgba(245, 166, 35, 0.8)"
        }}
      />
    </>
  );
}
