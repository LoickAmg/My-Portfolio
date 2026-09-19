"use client";

import type { CSSProperties } from "react";
import projectsData from "@/data/projects.json";
import { arcanaFor } from "@/lib/arcana";
import { SECTIONS } from "@/lib/sections";
import { scrollToSection } from "@/lib/scroll";
import { useT, sectionLabel } from "@/lib/i18n";
import type { Project } from "@/lib/types";
import DialogueBox from "@/components/DialogueBox";
import ArcanaCardFace, { ArcanaCardFrame } from "@/components/arcana/ArcanaCardFace";
import SceneHeader from "./SceneHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Hero.module.css";

const section = SECTIONS[0];

// Les chiffres affichés sont calculés à partir du catalogue, jamais écrits en
// dur : ils suivent le contenu de src/data/projects.json.
const projects = projectsData as Project[];
const DELIVERED_COUNT = projects.filter((project) => project.status === "livré").length;
const countUsing = (tech: string) => projects.filter((project) => project.stack.includes(tech)).length;
const PYTHON_COUNT = countUsing("Python");
const RUST_COUNT = countUsing("Rust");

const CARD_SIZES = {
  "--numeral-size": "56px",
  "--numeral-size-mobile": "44px",
  "--art-max": "190px",
  "--name-size": "17px",
} as CSSProperties;

export default function Hero() {
  const { lang, t } = useT();
  const copy = t.hero;
  const arcana = arcanaFor(section.id);

  return (
    <section id={section.id} className={`${sectionStyles.scene} ${styles.hero}`}>
      <SceneHeader sectionId={section.id} />

      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>

          <h1 className={styles.heading}>
            {copy.headingLine1} {copy.headingLine2}{" "}
            <span className={styles.headingAccent}>{copy.headingAccent(DELIVERED_COUNT)}</span>
          </h1>

          <p className={styles.intro}>{copy.intro}</p>

          <div className={styles.ctas}>
            <button type="button" className={styles.cta} onClick={() => scrollToSection("projets")}>
              {copy.ctaPrimary}
            </button>
            <button type="button" className={styles.link} onClick={() => scrollToSection("contact")}>
              {copy.ctaSecondary}
            </button>
          </div>

          <ul className={styles.facts}>
            <li>{copy.facts.available}</li>
            <li>{copy.facts.repositories}</li>
            <li>{copy.facts.languages(PYTHON_COUNT, RUST_COUNT)}</li>
          </ul>
        </div>

        <div className={styles.stage}>
          <div className={styles.card} style={CARD_SIZES}>
            <ArcanaCardFrame>
              <ArcanaCardFace
                sectionId={section.id}
                numeral={arcana?.numeral ?? ""}
                name={t.arcana.names[section.id]}
                sectionIndex={section.index}
                sectionName={sectionLabel(section.id, lang)}
                highlighted
              />
            </ArcanaCardFrame>
          </div>

          <div className={styles.dialogue}>
            <DialogueBox
              channelLabel={copy.dialogue.channelLabel}
              speakerInitial="M"
              speakerTag={copy.dialogue.speakerTag}
              line={copy.dialogue.line}
              choices={[
                { key: "A", label: copy.dialogue.choiceA, primary: true, onSelect: () => scrollToSection("methode") },
                { key: "B", label: copy.dialogue.choiceB, onSelect: () => scrollToSection("projets") },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
