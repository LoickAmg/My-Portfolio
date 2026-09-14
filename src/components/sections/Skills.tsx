"use client";

import { useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { computeSkills, CATEGORY_ORDER } from "@/lib/skills";
import SectionHeader from "./SectionHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Skills.module.css";

const section = SECTIONS[3]; // compétences

const BLADE_POSITION = ["top", "right", "bottom", "left"] as const;

// Compétences dérivées des technologies réellement utilisées dans les
// projets livrés (src/data/projects.json) plutôt qu'une liste déclarée à
// part — voir cadrage §5.2 : rien n'est affirmé qui ne soit vérifiable.
//
// Présentation en "menu radial" (4 catégories = 4 lames autour d'un hub
// central, façon menu de combat) : cliquer une lame affiche les technologies
// de cette catégorie dans le panneau ci-dessous.
export default function Skills() {
  const byCategory = computeSkills();
  const availableCategories = CATEGORY_ORDER.filter(
    (cat) => (byCategory[cat] ?? []).length > 0,
  );
  const [active, setActive] = useState<string>(availableCategories[0] ?? "");

  const totalCount = availableCategories.reduce(
    (sum, cat) => sum + (byCategory[cat]?.length ?? 0),
    0,
  );
  const activeEntries = byCategory[active] ?? [];

  return (
    <section id={section.id} className={sectionStyles.section}>
      <SectionHeader index={section.index} label={section.label} />
      <h2 className={sectionStyles.title}>Compétences</h2>

      <div className={styles.radial}>
        {availableCategories.map((cat, i) => {
          const pos = BLADE_POSITION[i % BLADE_POSITION.length];
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`${styles.blade} ${styles[`blade_${pos}`]} ${
                isActive ? styles.bladeActive : ""
              }`}
              aria-pressed={isActive}
              onClick={() => setActive(cat)}
            >
              <span className={styles.bladeLabel}>{cat}</span>
              <span className={styles.bladeCount}>{byCategory[cat].length}</span>
            </button>
          );
        })}

        <div className={styles.hub} aria-hidden="true">
          <span className={styles.hubCount}>{totalCount}</span>
          <span className={styles.hubLabel}>techs</span>
        </div>
      </div>

      <div className={styles.panel}>
        <span className={styles.panelLabel}>{active}</span>
        <div className={styles.tags}>
          {activeEntries.map((s) => (
            <div key={s.name} className={styles.tag}>
              <span className={styles.tagName}>{s.name}</span>
              <span className={styles.tagCount}>× {s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.note}>
        Chaque technologie est comptée dans autant de projets livrés qu&apos;elle
        a réellement servi — voir la section Projets.
      </p>
    </section>
  );
}
