import "@testing-library/jest-dom/vitest";

// jsdom n'implémente ni IntersectionObserver ni ResizeObserver. Framer
// Motion s'appuie sur IntersectionObserver dès qu'un composant motion utilise
// `layout` (voir Projects.tsx : motion.ul/motion.li en layout pour l'archive
// filtrable), même sans whileInView explicite — sans ce stub, tout test qui
// monte un composant motion "layout" plante avec
// "ReferenceError: IntersectionObserver is not defined". Stub minimal
// suffisant pour les tests : aucun test actuel n'a besoin des callbacks
// réels d'intersection/redimensionnement.
class IntersectionObserverStub {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = IntersectionObserverStub;
globalThis.ResizeObserver = ResizeObserverStub;

// jsdom n'implémente pas non plus window.matchMedia. @/lib/useReducedMotion
// (utilisé par SectionTitle, SmoothScroll, MagneticCursor...) l'appelle
// directement au montage — sans ce stub, tout test qui monte un de ces
// composants plante avec "TypeError: window.matchMedia is not a function".
// `matches: false` partout : les tests s'exécutent donc dans l'état "motion
// non réduite", ce qui correspond au comportement par défaut attendu hors
// préférence système particulière.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
