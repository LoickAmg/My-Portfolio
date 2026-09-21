"use client";

import { useRef, useState, type PointerEvent } from "react";
import ArcanaCardFace, { ArcanaCardFrame } from "@/components/arcana/ArcanaCardFace";
import ArcanaGlyph from "@/components/arcana/ArcanaGlyph";
import FoolReveal from "@/components/arcana/FoolReveal";
import styles from "./HeroCard.module.css";

// Inclinaison maximale, en degrés, quand le pointeur touche un bord.
const TILT_X = 11;
const TILT_Y = 14;

interface HeroCardProps {
  sectionId: string;
  numeral: string;
  name: string;
  sectionIndex: string;
  sectionName: string;
}

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Grande carte du Hero. Trois réactions au pointeur, toutes décoratives : elle
// s'incline vers lui, un halo révèle une seconde carte cachée dessous, et un
// clic (ou un appui) lui fait faire un tour complet sur elle-même. Le contenu
// lisible est celui de la face ; la face cachée et le dos sont masqués aux
// lecteurs d'écran.
export default function HeroCard(props: HeroCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);

  const aim = (event: PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const box = root.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
    root.style.setProperty("--reveal-x", `${(x * 100).toFixed(1)}%`);
    root.style.setProperty("--reveal-y", `${(y * 100).toFixed(1)}%`);
    root.style.setProperty("--tilt-x", `${((0.5 - y) * 2 * TILT_X).toFixed(2)}deg`);
    root.style.setProperty("--tilt-y", `${((x - 0.5) * 2 * TILT_Y).toFixed(2)}deg`);
  };

  const enter = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    rootRef.current?.setAttribute("data-near", "true");
    aim(event);
  };

  const leave = () => {
    const root = rootRef.current;
    if (!root) return;
    root.removeAttribute("data-near");
    root.style.setProperty("--tilt-x", "0deg");
    root.style.setProperty("--tilt-y", "0deg");
  };

  const spin = () => {
    if (spinning || prefersReducedMotion()) return;
    setSpinning(true);
  };

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onPointerEnter={enter}
      onPointerMove={aim}
      onPointerLeave={leave}
      onPointerCancel={leave}
      onClick={spin}
    >
      <div className={styles.tilt}>
        <div className={styles.turner} data-spinning={spinning} onAnimationEnd={() => setSpinning(false)}>
          <div className={styles.front}>
            <ArcanaCardFrame>
              <ArcanaCardFace {...props} highlighted />
              <div className={styles.reveal} aria-hidden="true">
                <FoolReveal />
              </div>
            </ArcanaCardFrame>
          </div>
          <div className={styles.back} aria-hidden="true">
            <ArcanaCardFrame>
              <div className={styles.backFace}>
                <ArcanaGlyph sectionId={props.sectionId} />
              </div>
            </ArcanaCardFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
