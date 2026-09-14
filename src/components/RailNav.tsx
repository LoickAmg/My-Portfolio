"use client";

import { useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { useScrollSpy } from "@/lib/useScrollSpy";
import { scrollToSection } from "@/lib/scroll";
import ThemeToggle from "./ThemeToggle";
import styles from "./RailNav.module.css";

export default function RailNav() {
  const ids = SECTIONS.map((s) => s.id);
  const activeId = useScrollSpy(ids);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSection = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  const goTo = (id: string) => {
    scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Rail vertical — bureau */}
      <nav className={styles.rail} aria-label="Navigation des sections">
        <button
          type="button"
          className={styles.mark}
          onClick={() => goTo(SECTIONS[0].id)}
          aria-label="Retour à l'index"
        >
          <span className={styles.markOuter} />
          <span className={styles.markInner} />
        </button>

        <div className={styles.dots}>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={styles.dotBtn}
              aria-current={section.id === activeId}
              aria-label={`Aller à la section ${section.label}`}
              onClick={() => goTo(section.id)}
            >
              <span className={styles.dot} />
              <span className={styles.tooltip}>
                {section.index} — {section.label}
              </span>
            </button>
          ))}
        </div>

        <ThemeToggle className={styles.railThemeToggle} />

        <span className={styles.vertical}>PORTFOLIO / 2026</span>
      </nav>

      {/* En-tête + menu plein écran — mobile */}
      <div className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.mobileMark}
          onClick={() => goTo(SECTIONS[0].id)}
          aria-label="Retour à l'index"
        >
          <span className={styles.mobileMarkDot} />
          <span className={styles.mobileLabel}>
            {activeSection.index} — {activeSection.label}
          </span>
        </button>

        <div className={styles.mobileActions}>
          <ThemeToggle className={styles.mobileThemeToggle} />

          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.menuPanel} role="menu">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              role="menuitem"
              className={styles.menuItem}
              aria-current={section.id === activeId}
              onClick={() => goTo(section.id)}
            >
              <span className={styles.menuIndex}>{section.index}</span>
              <span className={styles.menuLabel}>{section.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
