"use client";

import { SECTIONS } from "@/lib/sections";
import { useT } from "@/lib/i18n";
import SceneHeader from "./SceneHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Method.module.css";

const section = SECTIONS[2];

// Chaque règle pointe vers UN projet précis (#slug) comme preuve : le lien
// ouvre et déplie directement ce projet dans la section Projets, y compris
// s'il vit dans l'archive repliée (voir Projects.tsx). Le slug ne change pas
// selon la langue ; titres, textes et libellés viennent du dictionnaire, dans
// le même ordre que les entrées ci-dessous.
const PROOF_SLUGS = [
  "trading-dashboard",
  "chess-engine",
  "neural-net-from-scratch",
  "thermal-camera-sim",
  "ecommerce-platform",
];

export default function Method() {
  const { t } = useT();
  const copy = t.method;

  return (
    <section id={section.id} className={`${sectionStyles.scene} ${sectionStyles.scenePanel} ${styles.method}`}>
      <SceneHeader sectionId={section.id} />
      <h2 className={`${sectionStyles.title} ${styles.title}`}>{copy.headline(copy.steps.length)}</h2>

      <ol className={styles.rules}>
        {copy.steps.map((step, index) => (
          <li key={step.title} className={styles.rule}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>

            <div className={styles.claim}>
              <p className={styles.tag}>{copy.claimTag}</p>
              <h3 className={styles.claimTitle}>{step.title}</h3>
              <p className={styles.claimText}>{step.text}</p>
            </div>

            <a href={`#${PROOF_SLUGS[index]}`} className={styles.proof}>
              <span className={styles.tag}>{copy.proofTag}</span>
              <span className={styles.proofLabel}>{step.proofLabel}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
