"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { lenisRef } from "@/lib/lenis";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Scroll lissé (roadmap p2-i2). Ne rend rien : instancie Lenis et le
// branche sur requestAnimationFrame. Désactivé sous prefers-reduced-motion
// ou sur mobile bas de gamme (p2-i7) — dans ce cas le scroll natif reste
// seul maître, scrollToSection() le détecte via lenisRef.current === null.
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return null;
}
