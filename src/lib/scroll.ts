import { lenisRef } from "./lenis";

// Centralise la navigation programmatique vers un élément : passe par
// Lenis quand le scroll lissé est actif (pour ne pas se battre avec sa
// propre boucle de rendu), sinon retombe sur le scrollIntoView natif.
export function scrollToElement(el: Element | null): void {
  if (!el) return;
  if (lenisRef.current) {
    lenisRef.current.scrollTo(el as HTMLElement, { offset: 0 });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function scrollToSection(id: string): void {
  scrollToElement(document.getElementById(id));
}
