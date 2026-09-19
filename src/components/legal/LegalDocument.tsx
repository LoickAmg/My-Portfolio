import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import { LEGAL_PAGES } from "@/lib/site";
import styles from "./LegalDocument.module.css";

interface LegalDocumentProps {
  index: string;
  title: string;
  updated: string;
  children: ReactNode;
}

// Gabarit commun aux documents légaux : retour au portfolio, titre,
// contenu numéroté, navigation vers les deux autres documents.
export default function LegalDocument({ index, title, updated, children }: LegalDocumentProps) {
  return (
    <>
      <div className={styles.page}>
        <header className={styles.top}>
          <Link href="/" className={styles.back}>
            <span className={styles.backMark} aria-hidden="true" />
            Retour au portfolio
          </Link>
        </header>

        <main className={styles.main} id="contenu">
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            <span>{index}</span>
            <span className={styles.eyebrowLabel}>Document légal</span>
          </p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.updated}>Dernière mise à jour : {updated}</p>

          <div className={styles.body}>{children}</div>

          <nav className={styles.siblings} aria-label="Autres documents légaux">
            {LEGAL_PAGES.map((page) => (
              <Link key={page.href} href={page.href} className={styles.sibling}>
                {page.label}
              </Link>
            ))}
          </nav>
        </main>
      </div>
      <Footer />
    </>
  );
}

interface LegalSectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ number, title, children }: LegalSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={`s-${number}`}>
      <h2 className={styles.sectionTitle} id={`s-${number}`}>
        <span className={styles.sectionNumber}>{number}</span>
        {title}
      </h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

// Marqueur visible d'une information que seule la personne éditrice du site
// peut fournir. Volontairement voyant : il doit être impossible de le
// laisser passer en production sans le remarquer (voir docs/A-COMPLETER.md).
export function Todo({ children }: { children: ReactNode }) {
  return <mark className={styles.todo}>[À COMPLÉTER : {children}]</mark>;
}
