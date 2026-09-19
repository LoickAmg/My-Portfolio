"use client";

import { useEffect, useState } from "react";

// Combine la préférence système (prefers-reduced-motion) avec un repli pour
// le mobile bas de gamme — voir roadmap p2-i7 : pointeur grossier (tactile)
// + petit écran est le meilleur indice disponible en CSS/JS standard pour
// "appareil bas de gamme" sans détection de matériel invasive. Décidé dès
// la phase 02, pas ajouté après coup : tout le nouveau motion de cette
// phase (curseur, Lenis, reveal) passe par ce hook.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const widthQuery = window.matchMedia("(max-width: 480px)");

    const update = () => {
      setReduced(
        motionQuery.matches || (pointerQuery.matches && widthQuery.matches),
      );
    };

    update();
    motionQuery.addEventListener("change", update);
    pointerQuery.addEventListener("change", update);
    widthQuery.addEventListener("change", update);

    return () => {
      motionQuery.removeEventListener("change", update);
      pointerQuery.removeEventListener("change", update);
      widthQuery.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}
