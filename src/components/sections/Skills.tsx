import { SECTIONS } from "@/lib/sections";
import { computeSkills, CATEGORY_ORDER } from "@/lib/skills";
import SectionHeader from "./SectionHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Skills.module.css";

const section = SECTIONS[3]; // compétences

// Compétences dérivées des technologies réellement utilisées dans les
// projets livrés (src/data/projects.json) plutôt qu'une liste déclarée à
// part — voir cadrage §5.2 : rien n'est affirmé qui ne soit vérifiable.
export default function Skills() {
  const byCategory = computeSkills();

  return (
    <section id={section.id} className={sectionStyles.section}>
      <SectionHeader index={section.index} label={section.label} />
      <h2 className={sectionStyles.title}>Compétences</h2>

      <div className={styles.groups}>
        {CATEGORY_ORDER.map((cat) => {
          const entries = byCategory[cat] ?? [];
          if (entries.length === 0) return null;
          return (
            <div key={cat} className={styles.group}>
              <span className={styles.groupLabel}>{cat}</span>
              <div className={styles.tags}>
                {entries.map((s) => (
                  <div key={s.name} className={styles.tag}>
                    <span className={styles.tagName}>{s.name}</span>
                    <span className={styles.tagCount}>× {s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className={styles.note}>
        Chaque technologie est comptée dans autant de projets livrés qu&apos;elle
        a réellement servi — voir la section Projets.
      </p>
    </section>
  );
}
