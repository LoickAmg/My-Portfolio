"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

// Présentation en fil de messages : chaque projet est une ligne succincte
// (nom + aperçu tronqué), le clic déplie le détail complet (tagline entière,
// stack, statut, lien repo) — aucune donnée nouvelle n'est inventée, on ne
// fait que révéler ce qui était déjà dans projects.json.
export default function Projects() {
  const primaryStacks = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.stack[0]));
    return Array.from(set).sort();
  }, []);

  const [filter, setFilter] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

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

          <p className={styles.hint}>Clique un projet pour déplier le détail.</p>

          <motion.ul layout className={styles.thread}>
            {visible.map((p) => {
              const isOpen = openSlug === p.slug;
              return (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={styles.msgWrap}
                >
                  <button
                    type="button"
                    className={`${styles.msg} ${isOpen ? styles.msgOpen : ""} ${
                      p.highlight ? styles.msgHighlight : ""
                    }`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenSlug(isOpen ? null : p.slug)}
                  >
                    <span className={styles.avatar} aria-hidden="true">
                      {p.name.charAt(0)}
                    </span>
                    <span className={styles.msgBody}>
                      <span className={styles.msgTop}>
                        <span className={styles.msgName}>{p.name}</span>
                        <span className={styles.msgMeta}>
                          {p.stack[0]} · {p.year}
                        </span>
                      </span>
                      <span className={styles.msgPreview}>{p.tagline}</span>
                    </span>
                    {p.highlight && (
                      <span className={styles.msgBadge}>Repère</span>
                    )}
                    <span className={styles.chevron} aria-hidden="true">
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className={styles.detailWrap}
                      >
                        <div className={styles.detail}>
                          <p className={styles.detailText}>{p.tagline}</p>
                          <div className={styles.detailStack}>
                            {p.stack.map((s) => (
                              <span key={s} className={styles.stackTag}>
                                {s}
                              </span>
                            ))}
                          </div>
                          <div className={styles.detailFoot}>
                            <span className={styles.detailStatus}>
                              {p.status} · {p.year}
                            </span>
                            {p.repoUrl && (
                              <a
                                href={p.repoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.detailLink}
                              >
                                Voir le repo ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </motion.ul>

          <p className={styles.count}>
            {visible.length} / {projects.length} projets livrés
          </p>
        </>
      )}
    </section>
  );
}
