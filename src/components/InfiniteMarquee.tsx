"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";

interface InfiniteMarqueeProps {
  items: string[];
  speed?: number; // seconds for one full cycle
  direction?: "left" | "right";
  itemStyle?: React.CSSProperties;
  separator?: string;
  pauseOnHover?: boolean;
}

/**
 * InfiniteMarquee — smooth CSS-GPU-accelerated marquee.
 * Uses GSAP for buttery-smooth infinite loop with pause-on-hover support.
 */
export default function InfiniteMarquee({
  items,
  speed = 40,
  direction = "left",
  itemStyle,
  separator = "·",
  pauseOnHover = true,
}: InfiniteMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const width = track.scrollWidth / 2;

    tweenRef.current = gsap.fromTo(
      track,
      { x: direction === "left" ? 0 : -width },
      {
        x: direction === "left" ? -width : 0,
        duration: speed,
        ease: "none",
        repeat: -1,
      }
    );

    return () => {
      tweenRef.current?.kill();
    };
  }, [speed, direction]);

  const pause = () => {
    if (pauseOnHover) tweenRef.current?.pause();
  };
  const resume = () => {
    if (pauseOnHover) tweenRef.current?.resume();
  };

  return (
    <div
      style={{ overflow: "hidden", width: "100%" }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          willChange: "transform",
          gap: 0,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              paddingInline: 20,
              ...itemStyle,
            }}
          >
            {item}
            <span
              style={{
                opacity: 0.25,
                fontSize: "0.7em",
                display: "inline-block",
              }}
            >
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
