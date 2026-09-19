"use client";

import { arcanaFor } from "@/lib/arcana";
import { SECTIONS } from "@/lib/sections";
import { sectionLabel, useT } from "@/lib/i18n";
import styles from "./sections.module.css";

// Ouverture de scène : le chiffre romain et le nom de l'arcane relient chaque
// section à sa carte dans le menu.
export default function SceneHeader({ sectionId }: { sectionId: string }) {
  const { lang, t } = useT();
  const arcana = arcanaFor(sectionId);
  const section = SECTIONS.find((entry) => entry.id === sectionId);

  return (
    <div className={styles.head}>
      <span className={styles.numeral} aria-hidden="true">
        {arcana?.numeral}
      </span>
      <span className={styles.headRule} aria-hidden="true" />
      <span className={styles.headMeta}>
        <span className={styles.headName}>{t.arcana.names[sectionId]}</span>
        <span className={styles.headWhere}>
          {section?.index} · {sectionLabel(sectionId, lang)}
        </span>
      </span>
    </div>
  );
}
