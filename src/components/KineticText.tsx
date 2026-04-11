"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface KineticTextProps {
  text: string;
  tag?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  stagger?: number;
  once?: boolean;
  splitBy?: "chars" | "words";
}

/**
 * KineticText — GSAP-powered text reveal component.
 * Splits text into individual characters or words and animates them in
 * with a staggered "rise from below" effect on scroll or mount.
 */
export default function KineticText({
  text,
  tag: Tag = "h2",
  className,
  style,
  delay = 0,
  stagger = 0.03,
  once = true,
  splitBy = "chars",
}: KineticTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    const parts: string[] =
      splitBy === "words"
        ? text.split(" ").map((w) => w + "\u00A0")
        : text.split("");

    // Build inner HTML with spans
    el.innerHTML = parts
      .map(
        (c) =>
          `<span class="kt-unit" style="display:inline-block;will-change:transform">${c === " " ? "&nbsp;" : c}</span>`
      )
      .join("");

    const units = el.querySelectorAll(".kt-unit");

    gsap.fromTo(
      units,
      { opacity: 0, y: 48, rotationX: -30 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        stagger,
        duration: 0.7,
        delay,
        ease: "power3.out",
        scrollTrigger: once
          ? {
              trigger: el,
              start: "top 88%",
              once: true,
            }
          : undefined,
      }
    );
  }, [text, delay, stagger, splitBy]);

  return (
    <Tag
      // @ts-expect-error -- dynamic ref
      ref={containerRef}
      className={className}
      style={{
        perspective: 800,
        display: "block",
        overflow: "visible",
        ...style,
      }}
    >
      {text}
    </Tag>
  );
}
