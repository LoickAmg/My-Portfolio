import type { CSSProperties, ReactNode } from "react";
import ArcanaGlyph from "./ArcanaGlyph";
import styles from "./ArcanaCardFace.module.css";

interface ArcanaCardFaceProps {
  sectionId: string;
  numeral: string;
  name: string;
  sectionIndex: string;
  sectionName: string;
  highlighted?: boolean;
}

// Face d'une carte : chiffre romain, illustration, plaque de nom. Partagée
// entre le menu (cartes cliquables) et le Hero (grande carte d'ouverture).
export default function ArcanaCardFace({
  sectionId,
  numeral,
  name,
  sectionIndex,
  sectionName,
  highlighted = false,
}: ArcanaCardFaceProps) {
  return (
    <span className={`${styles.face} ${highlighted ? styles.highlighted : ""}`}>
      <span className={styles.numeral}>{numeral}</span>
      <span className={styles.art}>
        <ArcanaGlyph sectionId={sectionId} />
      </span>
      <span className={styles.nameplate}>
        <span className={styles.name}>{name}</span>
        <span className={styles.section}>
          {sectionIndex} · {sectionName}
        </span>
      </span>
    </span>
  );
}

// Cadre non interactif de la même carte (bord biseauté), pour l'affichage
// statique.
export function ArcanaCardFrame({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={styles.frame} style={style}>
      {children}
    </div>
  );
}
