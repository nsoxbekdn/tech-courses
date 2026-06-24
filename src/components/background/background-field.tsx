"use client";

import { useEffect, useRef } from "react";
import { reduceMotion } from "@/lib/motion";

// Density ramp — sparse → dense. Leading space means "empty cell, draw nothing".
const RAMP = " .··:-=+*#";
const CELL = 22; // px grid pitch — fewer cells = cheaper, calmer
const FPS = 24; // the field breathes slowly; no need for 60

/**
 * Layered, living-terminal background:
 *  · CSS film grain (.bg-noise, applied on the wrapper)
 *  · a sparse, mouse-reactive ASCII character field on <canvas>
 *  · a coordinate / status HUD written directly to the DOM (no React churn)
 *
 * Only "lit" cells are painted, so a full-viewport field stays cheap. Pauses
 * when the tab is hidden; renders a single calm frame under reduced motion.
 */
export function BackgroundField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const calm = reduceMotion();
    let cols = 0;
    let rows = 0;
    let dpr = 1;
    let isDark = document.documentElement.classList.contains("dark");
    // Pointer in cell coordinates; starts off-grid so nothing is highlighted.
    const pointer = { cx: -999, cy: -999, px: 0, py: 0 };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${CELL - 8}px ui-monospace, monospace`;
      ctx.textBaseline = "top";
    };

    const onPointer = (e: PointerEvent) => {
      pointer.px = e.clientX;
      pointer.py = e.clientY;
      pointer.cx = e.clientX / CELL;
      pointer.cy = e.clientY / CELL;
    };

    // Smooth, seedless value field — pure trig, no allocation per frame.
    const value = (x: number, y: number, t: number) =>
      (Math.sin(x * 0.2 + t * 0.6) +
        Math.cos(y * 0.18 - t * 0.4) +
        Math.sin((x + y) * 0.09 + t * 0.3)) /
      3;

    const draw = (t: number) => {
      const neutral = isDark ? "150,160,175" : "95,105,120";
      // Cursor bloom = shining silver (bright on black, gunmetal on paper).
      const accent = isDark ? "210,216,228" : "90,96,108";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const vel = Math.min(6, Math.abs(window.__scrollVelocity ?? 0));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let v = (value(c, r + vel * 0.4, t) + 1) / 2; // 0..1
          // Pointer proximity blooms the field.
          const dx = c - pointer.cx;
          const dy = r - pointer.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const near = dist < 7 ? (1 - dist / 7) : 0;
          v += near * 0.5;
          if (v < 0.66) continue; // keep it sparse
          const idx = Math.min(
            RAMP.length - 1,
            2 + Math.floor((v - 0.66) / 0.34 * (RAMP.length - 2)),
          );
          const ch = RAMP[idx];
          if (ch === " ") continue;
          const alpha = 0.05 + (v - 0.66) * 0.5 + near * 0.35;
          ctx.fillStyle = near > 0.15 ? `rgba(${accent},${alpha})` : `rgba(${neutral},${alpha * 0.7})`;
          ctx.fillText(ch, c * CELL, r * CELL);
        }
      }
      if (xRef.current) xRef.current.textContent = String(Math.round(pointer.px)).padStart(4, "0");
      if (yRef.current) yRef.current.textContent = String(Math.round(pointer.py)).padStart(4, "0");
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (calm) {
      draw(2.2); // one composed, static frame
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointer);
        themeObserver.disconnect();
      };
    }

    let raf = 0;
    let last = 0;
    const interval = 1000 / FPS;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (now - last < interval) return;
      last = now;
      draw(now / 1000);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className="bg-noise pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="hud absolute bottom-3 left-4 hidden select-none md:block">
        <div>
          x:<span ref={xRef}>0000</span> y:<span ref={yRef}>0000</span>
        </div>
        <div className="text-accent/70">grid: active</div>
      </div>
    </div>
  );
}
