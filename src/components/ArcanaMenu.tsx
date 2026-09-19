"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { arcanaFor } from "@/lib/arcana";
import { lenisRef } from "@/lib/lenis";
import { SECTIONS } from "@/lib/sections";
import { sectionLabel, useT } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/useReducedMotion";
import ArcanaCardFace from "./arcana/ArcanaCardFace";
import styles from "./ArcanaMenu.module.css";

// Durée de l'animation de la carte choisie : elle confirme l'action sans
// retarder la navigation (bien sous les 300 ms).
const PICK_MS = 240;

export function CardsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <polygon points="3,8 10,6 13,19 6,21" transform="rotate(-8 8 14)" />
      <polygon points="9,5 20,5 20,19 9,19" />
      <line x1="12" y1="10" x2="17" y2="10" />
    </svg>
  );
}

interface ArcanaMenuProps {
  activeId: string;
  onClose: () => void;
  onSelect: (sectionId: string) => void;
}

// Menu plein écran : chaque section est une carte de tarot dans une main en
// éventail (bureau) ou une grille de cartes (mobile). Monté seulement quand il
// est ouvert, donc son état repart de zéro à chaque ouverture.
export default function ArcanaMenu({ activeId, onClose, onSelect }: ArcanaMenuProps) {
  const { lang, t } = useT();
  const copy = t.arcana;
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timerRef = useRef<number | undefined>(undefined);
  const [pickedId, setPickedId] = useState<string | null>(null);
  // Une seule carte est « active » (soulevée) à la fois, qu'elle vienne du
  // survol ou du clavier : le survol déplace aussi le focus.
  const [startIndex] = useState(() => Math.max(0, SECTIONS.findIndex((section) => section.id === activeId)));
  const [activeIndex, setActiveIndex] = useState(startIndex);

  useEffect(() => {
    cardRefs.current[startIndex]?.focus({ preventScroll: true });
  }, [startIndex]);

  // Fige la page derrière le menu, avec ou sans défilement lissé.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    lenisRef.current?.stop();
    return () => {
      root.style.overflow = previous;
      lenisRef.current?.start();
    };
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const choose = useCallback(
    (sectionId: string) => {
      if (pickedId) return;
      setPickedId(sectionId);
      timerRef.current = window.setTimeout(() => onSelect(sectionId), reduced ? 0 : PICK_MS);
    },
    [pickedId, onSelect, reduced],
  );

  const columnCount = (): number => {
    const list = listRef.current;
    if (!list || getComputedStyle(list).display !== "grid") return 1;
    return getComputedStyle(list).gridTemplateColumns.split(" ").length;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    const cards = cardRefs.current.filter((card): card is HTMLButtonElement => card !== null);
    const focusables = closeRef.current ? [closeRef.current, ...cards] : cards;
    const position = focusables.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === "Tab" && focusables.length > 0) {
      const last = focusables.length - 1;
      if (event.shiftKey && position <= 0) {
        event.preventDefault();
        focusables[last].focus();
      } else if (!event.shiftKey && position === last) {
        event.preventDefault();
        focusables[0].focus();
      }
      return;
    }

    const cardIndex = cards.indexOf(document.activeElement as HTMLButtonElement);
    if (cardIndex === -1) return;

    const step = columnCount();
    const total = cards.length;
    let next = -1;
    if (event.key === "ArrowRight") next = (cardIndex + 1) % total;
    else if (event.key === "ArrowLeft") next = (cardIndex - 1 + total) % total;
    else if (event.key === "ArrowDown") next = Math.min(cardIndex + step, total - 1);
    else if (event.key === "ArrowUp") next = Math.max(cardIndex - step, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    if (next < 0) return;
    event.preventDefault();
    cards[next].focus();
  };

  // Un clic à côté des cartes referme le menu.
  const handleTableClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target as Element).closest("button")) onClose();
  };

  const count = SECTIONS.length;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="arcana-title"
      onKeyDown={handleKeyDown}
      data-lenis-prevent
    >
      <div className={styles.bar}>
        <div>
          <p className={styles.eyebrow}>{copy.trigger}</p>
          <h2 className={styles.title} id="arcana-title">
            {copy.title}
          </h2>
        </div>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          {copy.close}
        </button>
      </div>

      <div className={styles.table} onClick={handleTableClick}>
        <ul ref={listRef} className={styles.hand} aria-label={copy.navLabel} data-picking={pickedId !== null}>
          {SECTIONS.map((section, index) => {
            const arcana = arcanaFor(section.id);
            const name = copy.names[section.id] ?? section.label;
            const label = sectionLabel(section.id, lang);
            const isCurrent = section.id === activeId;
            return (
              <li
                key={section.id}
                className={styles.slot}
                style={{ "--i": index, "--d": index - (count - 1) / 2 } as CSSProperties}
              >
                <button
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  type="button"
                  className={styles.card}
                  aria-current={isCurrent ? "true" : undefined}
                  aria-label={`${name}, ${section.index} ${label}${isCurrent ? `, ${copy.here}` : ""}`}
                  data-active={activeIndex === index}
                  data-picked={pickedId === section.id}
                  onClick={() => choose(section.id)}
                  onFocus={() => setActiveIndex(index)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") event.currentTarget.focus({ preventScroll: true });
                  }}
                >
                  <ArcanaCardFace
                    sectionId={section.id}
                    numeral={arcana?.numeral ?? ""}
                    name={name}
                    sectionIndex={section.index}
                    sectionName={label}
                    highlighted={activeIndex === index}
                  />
                </button>
              </li>
            );
          })}
        </ul>
        <p className={styles.hint}>{copy.hint}</p>
      </div>
    </div>
  );
}
