"use client";

import { useEffect, useRef } from "react";

interface SoundVisualizerProps {
  active?: boolean;
  barCount?: number;
}

export default function SoundVisualizerCanvas({ active = true, barCount = 32 }: SoundVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barWidth = (w / barCount) * 0.65;
      const gap = (w / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        // Generate pseudo-harmonic waves
        const wave1 = Math.sin(phase + i * 0.22);
        const wave2 = Math.cos(phase * 1.5 + i * 0.15);
        const intensity = active ? Math.abs(wave1 * 0.6 + wave2 * 0.4) : 0.08;
        const barHeight = Math.max(4, intensity * (h * 0.85));

        const x = i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        // Gradient from Amber to Violet
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, "rgba(245, 166, 35, 0.9)");
        grad.addColorStop(0.5, "rgba(255, 186, 82, 0.7)");
        grad.addColorStop(1, "rgba(124, 111, 205, 0.9)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      phase += 0.04;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [active, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={48}
      style={{ display: "block", maxWidth: "100%", height: "auto" }}
    />
  );
}
