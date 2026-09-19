"use client";

import { useEffect, useRef, type RefObject } from "react";

export interface Palette {
  ink: string;
  ink12: string;
  ink25: string;
  ink55: string;
  accent: string;
  panel: string;
  panelAlt: string;
  void: string;
}

const FALLBACK_PALETTE: Palette = {
  ink: "#eef1f8",
  ink12: "rgba(238, 241, 248, 0.12)",
  ink25: "rgba(238, 241, 248, 0.25)",
  ink55: "rgba(238, 241, 248, 0.55)",
  accent: "#4d6bff",
  panel: "#0f1424",
  panelAlt: "#12182b",
  void: "#0a0d18",
};

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    ink: read("--ink", FALLBACK_PALETTE.ink),
    ink12: read("--ink-12", FALLBACK_PALETTE.ink12),
    ink25: read("--ink-25", FALLBACK_PALETTE.ink25),
    ink55: read("--ink-55", FALLBACK_PALETTE.ink55),
    accent: read("--accent", FALLBACK_PALETTE.accent),
    panel: read("--bg-panel", FALLBACK_PALETTE.panel),
    panelAlt: read("--bg-panel-alt", FALLBACK_PALETTE.panelAlt),
    void: read("--bg-void", FALLBACK_PALETTE.void),
  };
}

// Couleurs du thème actif, relues à chaque bascule clair/sombre plutôt qu'à
// chaque image : les canvas les lisent depuis la ref sans coût par frame.
export function useThemeColors(): RefObject<Palette> {
  const palette = useRef<Palette>(FALLBACK_PALETTE);

  useEffect(() => {
    palette.current = readPalette();
    const observer = new MutationObserver(() => {
      palette.current = readPalette();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-accent"],
    });
    return () => observer.disconnect();
  }, []);

  return palette;
}

// Ajuste la résolution du canvas à la taille CSS de son conteneur et à la
// densité de pixels de l'écran, puis prévient le composant pour qu'il
// redessine.
export function useCanvasFit(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  onResize: (cssWidth: number, cssHeight: number) => void,
): void {
  const callback = useRef(onResize);

  useEffect(() => {
    callback.current = onResize;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const fit = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      callback.current(rect.width, rect.height);
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [canvasRef]);
}

// Vrai tant que l'élément est au moins en partie visible à l'écran. Les
// boucles d'animation s'y adossent pour ne rien calculer hors de vue.
export function useVisibleRef(elementRef: RefObject<HTMLElement | null>): RefObject<boolean> {
  const visible = useRef(true);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        visible.current = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef]);

  return visible;
}

// Boucle requestAnimationFrame unique par composant. `frame` reçoit le temps
// écoulé en secondes, plafonné pour qu'un onglet resté en arrière-plan ne
// provoque pas un saut de simulation au retour.
export function useFrameLoop(frame: (dtSeconds: number) => void): void {
  const latest = useRef(frame);

  useEffect(() => {
    latest.current = frame;
  });

  useEffect(() => {
    let handle = 0;
    let previous = performance.now();

    const tick = (now: number) => {
      handle = requestAnimationFrame(tick);
      const dt = Math.min((now - previous) / 1000, 1 / 20);
      previous = now;
      if (document.hidden) return;
      latest.current(dt);
    };

    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, []);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
