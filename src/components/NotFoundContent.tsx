"use client";

import Link from "next/link";
import { SECTIONS } from "@/lib/sections";
import { LEGAL_PAGES } from "@/lib/site";
import { sectionLabel, useT } from "@/lib/i18n";
import StatusPage from "./StatusPage";
import styles from "./StatusPage.module.css";

export default function NotFoundContent() {
  const { lang, t } = useT();
  const copy = t.notFound;

  return (
    <StatusPage code="404" eyebrow={copy.eyebrow} title={copy.title} text={copy.text}>
      <ul className={styles.list} aria-label={copy.destinationsLabel}>
        {SECTIONS.map((section) => (
          <li key={section.id} className={styles.listItem}>
            <Link href={section.id === "index" ? "/" : `/#${section.id}`} className={styles.destination}>
              <span className={styles.destinationIndex}>{section.index}</span>
              {sectionLabel(section.id, lang)}
            </Link>
          </li>
        ))}
        {LEGAL_PAGES.map((page) => (
          <li key={page.href} className={styles.listItem}>
            <Link href={page.href} className={styles.destination}>
              <span className={styles.destinationIndex}>§</span>
              {page.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Link href="/" className={`${styles.btn} ${styles.btnPrimary}`}>
          {copy.home}
        </Link>
      </div>
    </StatusPage>
  );
}
