"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SECTIONS } from "@/lib/sections";
import { useT } from "@/lib/i18n";
import ExperienceBoundary from "@/components/playground/ExperienceBoundary";
import ExperienceSkeleton from "@/components/playground/ExperienceSkeleton";
import SceneHeader from "./SceneHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Playground.module.css";

const section = SECTIONS[4];

// Chaque expérience est chargée à la demande : Three.js (système solaire) ne
// pèse que sur qui l'ouvre, et les jeux canvas n'ajoutent rien au premier
// chargement de la page.
const NeuralNet = dynamic(() => import("@/components/playground/NeuralNet"), {
  ssr: false,
  loading: () => <ExperienceSkeleton />,
});
const SolarSystem = dynamic(() => import("@/components/playground/SolarSystem"), {
  ssr: false,
  loading: () => <ExperienceSkeleton />,
});
const DoublePendulum = dynamic(() => import("@/components/playground/DoublePendulum"), {
  ssr: false,
  loading: () => <ExperienceSkeleton />,
});
const ConnectFour = dynamic(() => import("@/components/playground/ConnectFour"), {
  ssr: false,
  loading: () => <ExperienceSkeleton />,
});
const Snake = dynamic(() => import("@/components/playground/Snake"), {
  ssr: false,
  loading: () => <ExperienceSkeleton />,
});

// Chaque entrée réimplémente, en TypeScript et dans la palette du site, le
// principe d'un projet du catalogue (voir repoUrl) — jamais un portage du
// code original. Libellés et descriptions viennent du dictionnaire
// (playground.experiences), pour rester bilingues sans dupliquer ce tableau.
const EXPERIENCES = [
  {
    id: "neural-net",
    key: "neuralNet",
    sourceName: "Neural Net",
    repoUrl: "https://github.com/LoickAmg/Neural-Net",
    Component: NeuralNet,
  },
  {
    id: "solar-system",
    key: "solarSystem",
    sourceName: "Solar System",
    repoUrl: "https://github.com/LoickAmg/Solar-System",
    Component: SolarSystem,
  },
  {
    id: "double-pendulum",
    key: "doublePendulum",
    sourceName: "Double Pendulum",
    repoUrl: "https://github.com/LoickAmg/Double-Pendulum",
    Component: DoublePendulum,
  },
  {
    id: "connect-four",
    key: "connectFour",
    sourceName: "Connect-4",
    repoUrl: "https://github.com/LoickAmg/Connect-4",
    Component: ConnectFour,
  },
  {
    id: "snake",
    key: "snake",
    sourceName: "Snake Clone",
    repoUrl: "https://github.com/LoickAmg/Snake-Clone",
    Component: Snake,
  },
] as const;

type ExperienceId = (typeof EXPERIENCES)[number]["id"];

const subscribeNever = () => () => {};
const readFullscreenSupport = () => document.fullscreenEnabled;
const readNoFullscreenSupport = () => false;

export default function Playground() {
  const { t } = useT();
  const copy = t.playground;
  const [activeId, setActiveId] = useState<ExperienceId>(EXPERIENCES[0].id);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const canFullscreen = useSyncExternalStore(subscribeNever, readFullscreenSupport, readNoFullscreenSupport);

  const activeIndex = EXPERIENCES.findIndex((experience) => experience.id === activeId);
  const active = EXPERIENCES[activeIndex];
  const ActiveComponent = active.Component;
  const activeCopy = copy.experiences[active.key];

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void stageRef.current?.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = EXPERIENCES.length - 1;
    let next = -1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = activeIndex === last ? 0 : activeIndex + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = activeIndex === 0 ? last : activeIndex - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next < 0) return;
    event.preventDefault();
    setActiveId(EXPERIENCES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id={section.id} className={`${sectionStyles.scene} ${styles.playground}`}>
      <SceneHeader sectionId={section.id} />
      <h2 className={sectionStyles.title}>{copy.title}</h2>

      <p className={styles.intro}>{copy.intro}</p>

      <div className={styles.console}>
        <div
          className={styles.index}
          role="tablist"
          aria-orientation="vertical"
          aria-label={copy.tabsAriaLabel}
          onKeyDown={handleTabKeyDown}
        >
          {EXPERIENCES.map((experience, index) => {
            const isActive = experience.id === activeId;
            const experienceCopy = copy.experiences[experience.key];
            return (
              <button
                key={experience.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`playground-tab-${experience.id}`}
                aria-selected={isActive}
                aria-controls="playground-stage"
                tabIndex={isActive ? 0 : -1}
                className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                onClick={() => setActiveId(experience.id)}
              >
                <span className={styles.tabNumber}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.tabBody}>
                  <span className={styles.tabName}>{experienceCopy.name}</span>
                  <span className={styles.tabKind}>{experienceCopy.kind}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          ref={stageRef}
          className={styles.stage}
          role="tabpanel"
          id="playground-stage"
          aria-labelledby={`playground-tab-${active.id}`}
        >
          <header className={styles.stageHead}>
            <div className={styles.stageTitleGroup}>
              <h3 className={styles.stageTitle}>{activeCopy.name}</h3>
              <p className={styles.stageBlurb}>{activeCopy.blurb}</p>
            </div>
            {canFullscreen && (
              <button type="button" className={styles.fullscreen} onClick={toggleFullscreen}>
                {isFullscreen ? copy.exitFullscreen : copy.fullscreen}
              </button>
            )}
          </header>

          <ExperienceBoundary key={active.id} className={styles.swap} message={copy.failure} retryLabel={copy.retry}>
            <ActiveComponent />
          </ExperienceBoundary>

          <p className={styles.source}>
            {copy.sourcePrefix}{" "}
            <a href={active.repoUrl} target="_blank" rel="noreferrer">
              {active.sourceName} ↗
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
