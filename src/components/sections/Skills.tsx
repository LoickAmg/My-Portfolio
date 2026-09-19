"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { SECTIONS } from "@/lib/sections";
import { CATEGORY_ORDER, computeSkills } from "@/lib/skills";
import { useT } from "@/lib/i18n";
import SceneHeader from "./SceneHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Skills.module.css";

const section = SECTIONS[3];

// Compétences dérivées des technologies réellement utilisées dans les
// projets livrés (src/data/projects.json), pas d'une liste déclarée à part :
// chaque barre est le nombre de projets qui emploient la technologie.
// Le domaine choisi à gauche filtre le classement à droite.
export default function Skills() {
  const { t } = useT();
  const copy = t.skills;
  const byCategory = useMemo(() => computeSkills(), []);
  const categories = CATEGORY_ORDER.filter((category) => (byCategory[category] ?? []).length > 0);
  const [active, setActive] = useState(categories[0] ?? "");

  const total = categories.reduce((sum, category) => sum + byCategory[category].length, 0);
  const highestCount = Math.max(1, ...categories.flatMap((category) => byCategory[category].map((entry) => entry.count)));
  const entries = byCategory[active] ?? [];

  return (
    <section id={section.id} className={`${sectionStyles.scene} ${styles.skills}`}>
      <SceneHeader sectionId={section.id} />
      <h2 className={`${sectionStyles.title} ${styles.title}`}>{copy.headline(total)}</h2>

      <div className={styles.layout}>
        <div className={styles.categories} role="group" aria-label={copy.categoriesLabel}>
          {categories.map((category) => {
            const size = byCategory[category].length;
            return (
              <button
                key={category}
                type="button"
                className={`${styles.category} ${category === active ? styles.categoryActive : ""}`}
                aria-pressed={category === active}
                onClick={() => setActive(category)}
                style={{ "--share": `${(size / total) * 100}%` } as CSSProperties}
              >
                <span className={styles.categoryName}>{category}</span>
                <span className={styles.categorySize}>{size}</span>
                <span className={styles.share} aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <ol className={styles.ranking} aria-label={copy.rankingLabel}>
          {entries.map((entry) => (
            <li key={entry.name} className={styles.entry}>
              <span className={styles.entryName}>{entry.name}</span>
              <span className={styles.bar} aria-hidden="true">
                <span className={styles.barFill} style={{ width: `${(entry.count / highestCount) * 100}%` }} />
              </span>
              <span className={styles.entryCount}>{copy.projectsCount(entry.count)}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className={styles.note}>{copy.note}</p>
    </section>
  );
}
