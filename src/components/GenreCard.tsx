"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";

interface GenreCardProps {
  name: string;
  color: string;
  imageUrl: string;
  href: string;
  delay?: number;
  index?: number;
}

/**
 * GenreCard — HD image-backed genre card with GSAP hover parallax.
 * No emojis. Pure photographic + typographic design.
 */
export default function GenreCard({
  name,
  color,
  imageUrl,
  href,
  delay = 0,
  index = 0,
}: GenreCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const onEnter = () => {
    gsap.to(imgRef.current, {
      scale: 1.1,
      duration: 0.6,
      ease: "power2.out",
    });
    gsap.to(labelRef.current, {
      y: -4,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const onLeave = () => {
    gsap.to(imgRef.current, {
      scale: 1,
      duration: 0.55,
      ease: "power2.inOut",
    });
    gsap.to(labelRef.current, {
      y: 0,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  // Scroll-triggered entry animation
  useGSAP(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 32, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        delay: delay + index * 0.045,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
          once: true,
        },
      }
    );
  }, [delay, index]);

  return (
    <Link
      ref={cardRef}
      href={href}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: "block",
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        height: 180,
        border: "1px solid rgba(255,255,255,0.07)",
        textDecoration: "none",
        cursor: "pointer",
        opacity: 0, // GSAP will animate this in
      }}
    >
      {/* HD Background Image */}
      <div
        ref={imgRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${imageUrl}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          willChange: "transform",
        }}
      />

      {/* Gradient overlay — dark at bottom, medium at top */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(
            160deg,
            rgba(5,5,7,0.35) 0%,
            rgba(5,5,7,0.55) 50%,
            rgba(5,5,7,0.85) 100%
          )`,
          zIndex: 1,
        }}
      />

      {/* Color accent dot — top right */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px ${color}`,
          zIndex: 2,
        }}
      />

      {/* Genre name */}
      <span
        ref={labelRef}
        style={{
          position: "absolute",
          bottom: 16,
          left: 18,
          fontFamily: "var(--f-display)",
          fontWeight: 800,
          fontSize: 17,
          color: "#fff",
          letterSpacing: "-0.025em",
          zIndex: 2,
          willChange: "transform",
          textShadow: "0 2px 12px rgba(0,0,0,0.7)",
        }}
      >
        {name}
      </span>

      {/* Subtle border glow on hover — via box-shadow transition in CSS */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          boxShadow: `inset 0 0 0 1px ${color}22`,
          zIndex: 3,
          transition: "box-shadow 0.3s",
          pointerEvents: "none",
        }}
      />
    </Link>
  );
}
