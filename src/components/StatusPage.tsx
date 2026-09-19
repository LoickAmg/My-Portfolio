import type { ReactNode } from "react";
import styles from "./StatusPage.module.css";

interface StatusPageProps {
  code: string;
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
}

// Page plein écran pour les états d'exception (404, erreur d'exécution) :
// composition en deux colonnes, code en grand à gauche, actions à droite.
export default function StatusPage({ code, eyebrow, title, text, children }: StatusPageProps) {
  return (
    <main className={styles.page} id="contenu">
      <p className={styles.code} aria-hidden="true">
        {code}
      </p>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        {children}
      </div>
    </main>
  );
}
