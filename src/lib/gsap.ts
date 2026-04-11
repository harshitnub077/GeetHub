"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, DependencyList } from "react";

/**
 * Centralized GSAP configuration for Geethub.
 * Registers ScrollTrigger once, avoids duplicate registration in hot-reload.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/**
 * useGSAP — React hook that manages GSAP context lifecycle.
 * Automatically cleans up animations on unmount (prevents memory leaks).
 * Uses useEffect (not useLayoutEffect) for SSR safety.
 */
export function useGSAP(
  fn: (ctx: gsap.Context) => void,
  deps: DependencyList = []
) {
  const ctx = useRef<gsap.Context | null>(null);

  useEffect(() => {
    ctx.current = gsap.context(fn);
    return () => ctx.current?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
