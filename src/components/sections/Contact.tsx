"use client";

import { SECTIONS } from "@/lib/sections";
import { scrollToSection } from "@/lib/scroll";
import SectionHeader from "./SectionHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Contact.module.css";

const section = SECTIONS[5]; // contact

// Liens réels non fournis (voir cadrage §5.2) — chacun reste marqué
// explicitement "à confirmer" plutôt que de supposer une adresse ou un
// handle. Ne pas remplacer par une valeur devinée.
const LINKS = [
  { label: "Email", value: "[à confirmer]" },
  { label: "GitHub", value: "[à confirmer]" },
  { label: "LinkedIn", value: "[à confirmer]" },
];

export default function Contact() {
  return (
    <section
      id={section.id}
      className={sectionStyles.section}
      style={{ borderBottom: "none" }}
    >
      <SectionHeader index={section.index} label={section.label} />
      <h2 className={sectionStyles.title}>Contact</h2>

      <div className={styles.panel}>
        <p className={styles.intro}>
          [Phrase d&apos;invitation au contact à écrire ensemble.]
        </p>

        <div className={styles.links}>
          {LINKS.map((link) => (
            <div key={link.label} className={styles.link}>
              <div className={styles.linkLeft}>
                <span className={styles.linkLabel}>{link.label}</span>
                <span className={styles.linkValue}>{link.value}</span>
              </div>
              <span className={styles.linkPending}>à confirmer</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={styles.signalCta}
          onClick={() => scrollToSection("signal")}
        >
          Ou passe par Signal
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
