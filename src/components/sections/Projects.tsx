"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SECTIONS } from "@/lib/sections";
import projectsData from "@/data/projects.json";
import type { Project } from "@/lib/types";
import SectionHeader from "./SectionHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Projects.module.css";

const section = SECTIONS[1]; // projets
const projects = projectsData as Project[];

function sortProjects(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    if (!!a.highlight === !!b.highlight) return a.name.localeCompare(b.name);
    return a.highlight ? -1 : 1;
  });
}

export default function Projects() {
  // Filtre par langage/techno principal (premier élément de `stack`) plutôt
  // que par tag exhaustif, pour garder la barre de filtres lisible sur mobile.
  const primaryStacks = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.stack[0]));
    return Array.from(set).sort();
  }, []);

  const [filter, setFilter] = useState<string | null>(null);

  const visible = useMemo(() => {
    const list = filter ? projects.filter((p) => p.stack[0] === filter) : projects;
    return sortProjects(list);
  }, [filter]);

  return (
    <section id={section.id} className={sectionStyles.section}>
      <SectionHeader index={section.index} label={section.label} />
      <h2 className={sectionStyles.title}>Projets</h2>

      {projects.length === 0 ? (
        <p className={sectionStyles.placeholderNote}>
          Le catalogue de projets sera bientôt disponible ici.
        </p>
      ) : (
        <>
          <div className={styles.filters}>
            <button
              type="button"
              className={`${styles.filterBtn} ${
                filter === null ? styles.filterBtnActive : ""
              }`}
              onClick={() => setFilter(null)}
            >
              Tout ({projects.length})
            </button>
            {primaryStacks.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.filterBtn} ${
                  filter === s ? styles.filterBtnActive : ""
                }`}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <motion.div layout className={styles.grid}>
            {visible.map((p) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`${styles.card} ${
                  p.highlight ? styles.cardHighlight : ""
                }`}
              >
                <div className={styles.cardTop}>
                  <h3 className={styles.cardName}>{p.name}</h3>
                  {p.highlight && (
                    <span className={styles.cardBadge}>Repère</span>
                  )}
                </div>
                <p className={styles.cardTagline}>{p.tagline}</p>
                <div className={styles.cardStack}>
                  {p.stack.map((s) => (
                    <span key={s} className={styles.stackTag}>
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <p className={styles.count}>
            {visible.length} / {projects.length} projets livrés
          </p>
        </>
      )}
    </section>
  );
}
