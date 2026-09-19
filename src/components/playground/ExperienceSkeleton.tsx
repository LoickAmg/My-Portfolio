"use client";

import { useT } from "@/lib/i18n";
import styles from "./ExperienceSkeleton.module.css";

// Squelette affiché pendant le chargement à la demande d'une expérience :
// mêmes proportions que la vraie (zone de dessin + panneau), donc aucun
// saut de mise en page à l'arrivée du contenu.
export default function ExperienceSkeleton() {
  const { t } = useT();

  return (
    <div className={styles.skeleton} role="status" aria-live="polite">
      <div className={styles.viewport} />
      <div className={styles.panel}>
        <span className={styles.line} />
        <span className={styles.line} />
        <span className={styles.lineShort} />
        <span className={styles.line} />
      </div>
      <span className="visually-hidden">{t.playground.loading}</span>
    </div>
  );
}
