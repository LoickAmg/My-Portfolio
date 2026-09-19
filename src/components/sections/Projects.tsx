"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { localizeProjects } from "@/lib/projectsI18n";
import type { Project, WorkType } from "@/lib/types";
import { scrollToElement } from "@/lib/scroll";
import { useT } from "@/lib/i18n";
import type { UI } from "@/lib/i18n";
import SceneHeader from "./SceneHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Projects.module.css";

const section = SECTIONS[1];

type ProjectsCopy = (typeof UI)["fr"]["projects"];

const WORKTYPE_ORDER: WorkType[] = ["web", "outils", "data-ia", "systemes", "interactif"];

function byName(a: Project, b: Project): number {
  return a.name.localeCompare(b.name);
}

interface ProjectRowProps {
  project: Project;
  position: number;
  isOpen: boolean;
  onToggle: () => void;
  t: ProjectsCopy;
}

// Une ligne de la table : numéro, nom, phrase, pile principale et année. Le
// clic déplie le détail. Partagée entre la sélection et l'archive pour ne pas
// dupliquer le balisage. Le détail n'existe dans le DOM que déplié.
function ProjectRow({ project: p, position, isOpen, onToggle, t }: ProjectRowProps) {
  return (
    <li id={p.slug} className={styles.row}>
      <button
        type="button"
        className={`${styles.rowButton} ${p.highlight ? styles.featured : ""}`}
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        <span className={styles.rowIndex}>{String(position).padStart(2, "0")}</span>
        <span className={styles.rowMain}>
          <span className={styles.rowName}>{p.name}</span>
          <span className={styles.rowTagline}>{p.tagline}</span>
        </span>
        <span className={styles.rowMeta}>
          {p.stack[0]} · {p.year}
        </span>
        <span className={styles.rowToggle} aria-hidden="true">
          {isOpen ? "–" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className={styles.detail}>
          {p.story ? (
            <div className={styles.story}>
              <p className={styles.storyItem}>
                <strong>{t.problemLabel}</strong>
                {p.story.probleme}
              </p>
              <p className={styles.storyItem}>
                <strong>{t.decisionLabel}</strong>
                {p.story.decision}
              </p>
              <p className={styles.storyItem}>
                <strong>{t.proofLabel}</strong>
                {p.story.preuve}
              </p>
            </div>
          ) : (
            <p className={styles.plainText}>{p.tagline}</p>
          )}
          <ul className={styles.stack}>
            {p.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          <div className={styles.detailFoot}>
            <span className={styles.detailStatus}>
              {t.statusLabels[p.status] ?? p.status} · {p.year}
            </span>
            {p.repoUrl && (
              <a href={p.repoUrl} target="_blank" rel="noreferrer" className={styles.detailLink}>
                {t.viewRepo}
              </a>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

// Présentation en deux niveaux : une sélection de projets phares toujours
// visible, et l'archive complète (le reste du catalogue) derrière un bouton,
// filtrable par type de travail. Un lien depuis la section Méthode peut cibler
// un projet précis via #<slug> : on l'ouvre et on le déplie automatiquement,
// même s'il vit dans l'archive repliée. Les données sont localisées (FR/EN)
// via localizeProjects — voir src/lib/projectsI18n.ts.
export default function Projects() {
  const { lang, t } = useT();
  const copy = t.projects;
  const projects = useMemo(() => localizeProjects(lang), [lang]);

  const selection = useMemo(() => projects.filter((p) => p.highlight).sort(byName), [projects]);
  const archiveAll = useMemo(() => projects.filter((p) => !p.highlight).sort(byName), [projects]);

  const availableTypes = useMemo(() => {
    const present = new Set(archiveAll.map((p) => p.workType));
    return WORKTYPE_ORDER.filter((type) => present.has(type));
  }, [archiveAll]);

  const [typeFilter, setTypeFilter] = useState<WorkType | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const archiveVisible = useMemo(
    () => (typeFilter ? archiveAll.filter((p) => p.workType === typeFilter) : archiveAll),
    [archiveAll, typeFilter],
  );

  const openFromHash = useCallback(() => {
    const slug = window.location.hash.replace("#", "");
    if (!slug) return;
    const match = projects.find((p) => p.slug === slug);
    if (!match) return;
    setOpenSlug(slug);
    if (!match.highlight) setArchiveOpen(true);
    requestAnimationFrame(() => {
      scrollToElement(document.getElementById(slug));
    });
  }, [projects]);

  useEffect(() => {
    // Lecture du hash au montage : impossible pendant le rendu (le SSR ne
    // connaît pas window.location.hash), c'est une synchronisation ponctuelle
    // avec l'URL, exactement le cas d'usage d'un effet.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [openFromHash]);

  const toggle = (slug: string) => setOpenSlug((current) => (current === slug ? null : slug));

  return (
    <section id={section.id} className={`${sectionStyles.scene} ${styles.projects}`}>
      <SceneHeader sectionId={section.id} />

      {projects.length === 0 ? (
        <p className={sectionStyles.placeholderNote}>{copy.emptyNote}</p>
      ) : (
        <div className={styles.layout}>
          <div className={styles.aside}>
            <h2 className={styles.title}>{copy.headline(projects.length, selection.length)}</h2>
            <p className={sectionStyles.lead}>{copy.hint}</p>
          </div>

          <div className={styles.main}>
            <p className={styles.blockLabel}>{copy.selectionLabel(selection.length)}</p>
            <ul className={styles.rows}>
              {selection.map((p, index) => (
                <ProjectRow
                  key={p.slug}
                  project={p}
                  position={index + 1}
                  isOpen={openSlug === p.slug}
                  onToggle={() => toggle(p.slug)}
                  t={copy}
                />
              ))}
            </ul>

            <div className={styles.archive}>
              <button
                type="button"
                className={styles.archiveToggle}
                aria-expanded={archiveOpen}
                onClick={() => setArchiveOpen((open) => !open)}
              >
                {copy.archiveToggle(archiveOpen, archiveAll.length)}
              </button>

              {archiveOpen && (
                <div className={styles.archiveBody}>
                  <p className={styles.blockLabel}>{copy.archiveBlockLabel}</p>

                  <div className={styles.filters}>
                    <button
                      type="button"
                      className={`${styles.filterBtn} ${typeFilter === null ? styles.filterBtnActive : ""}`}
                      onClick={() => setTypeFilter(null)}
                    >
                      {copy.filterAll(archiveAll.length)}
                    </button>
                    {availableTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`${styles.filterBtn} ${typeFilter === type ? styles.filterBtnActive : ""}`}
                        onClick={() => setTypeFilter(type)}
                      >
                        {copy.worktypeLabels[type]}
                      </button>
                    ))}
                  </div>

                  <ul className={styles.rows}>
                    {archiveVisible.map((p, index) => (
                      <ProjectRow
                        key={p.slug}
                        project={p}
                        position={selection.length + index + 1}
                        isOpen={openSlug === p.slug}
                        onToggle={() => toggle(p.slug)}
                        t={copy}
                      />
                    ))}
                  </ul>

                  <p className={styles.count}>{copy.countLabel(archiveVisible.length, archiveAll.length)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
