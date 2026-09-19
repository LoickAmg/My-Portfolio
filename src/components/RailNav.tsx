"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import { SECTIONS } from "@/lib/sections";
import { useScrollSpy } from "@/lib/useScrollSpy";
import { scrollToSection } from "@/lib/scroll";
import { useT, sectionLabel } from "@/lib/i18n";
import ArcanaMenu, { CardsIcon } from "./ArcanaMenu";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import styles from "./RailNav.module.css";

const SECTION_IDS = SECTIONS.map((section) => section.id);

// Laisse le temps au menu de rendre le défilement à la page (il fige
// `overflow` tant qu'il est monté) avant de lancer la navigation.
const SCROLL_AFTER_CLOSE_MS = 50;

export default function RailNav() {
  const { lang, t } = useT();
  const activeId = useScrollSpy(SECTION_IDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const activeSection = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    triggerRef.current = event.currentTarget;
    setMenuOpen(true);
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const selectFromMenu = useCallback((id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToSection(id), SCROLL_AFTER_CLOSE_MS);
  }, []);

  return (
    <>
      {/* Rail vertical — bureau */}
      <nav className={styles.rail} aria-label={t.rail.navLabel}>
        <button
          type="button"
          className={styles.mark}
          onClick={() => scrollToSection(SECTIONS[0].id)}
          aria-label={t.rail.backToIndex}
        >
          <span className={styles.markOuter} />
          <span className={styles.markInner} />
        </button>

        <button
          type="button"
          className={styles.cardsBtn}
          onClick={openMenu}
          aria-label={t.arcana.open}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
        >
          <CardsIcon />
          <span className={styles.tooltip}>{t.arcana.trigger}</span>
        </button>

        <div className={styles.dots}>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={styles.dotBtn}
              aria-current={section.id === activeId}
              aria-label={t.rail.goToSection(sectionLabel(section.id, lang))}
              onClick={() => scrollToSection(section.id)}
            >
              <span className={styles.dot} />
              <span className={styles.tooltip}>
                {section.index} — {sectionLabel(section.id, lang)}
              </span>
            </button>
          ))}
        </div>

        <ThemeToggle className={styles.railThemeToggle} />
        <LanguageToggle className={styles.railLanguageToggle} />

        <span className={styles.vertical}>{t.rail.brand}</span>
      </nav>

      {/* En-tête — mobile */}
      <div className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.mobileMark}
          onClick={() => scrollToSection(SECTIONS[0].id)}
          aria-label={t.rail.backToIndex}
        >
          <span className={styles.mobileMarkDot} />
          <span className={styles.mobileLabel}>
            {activeSection.index} — {sectionLabel(activeSection.id, lang)}
          </span>
        </button>

        <div className={styles.mobileActions}>
          <ThemeToggle className={styles.mobileThemeToggle} />
          <LanguageToggle className={styles.mobileLanguageToggle} />

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={openMenu}
            aria-label={t.arcana.open}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
          >
            <CardsIcon />
            <span>{t.arcana.trigger}</span>
          </button>
        </div>
      </div>

      {menuOpen && <ArcanaMenu activeId={activeId} onClose={closeMenu} onSelect={selectFromMenu} />}
    </>
  );
}
