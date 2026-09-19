// Référence partagée vers l'instance Lenis active (voir SmoothScroll.tsx).
// Un simple objet mutable plutôt qu'un contexte React : scroll.ts (utilisé
// par des composants qui ne sont pas forcément sous le même arbre) doit
// pouvoir y accéder sans prop-drilling. `current` reste null si le scroll
// lissé est désactivé (prefers-reduced-motion / mobile bas de gamme, voir
// useReducedMotion) — tout le code appelant doit gérer ce cas.
import type Lenis from "lenis";

export const lenisRef: { current: Lenis | null } = { current: null };
