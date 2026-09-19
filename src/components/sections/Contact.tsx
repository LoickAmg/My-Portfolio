"use client";

import { SECTIONS } from "@/lib/sections";
import { scrollToSection } from "@/lib/scroll";
import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/site";
import { useT } from "@/lib/i18n";
import SceneHeader from "./SceneHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Contact.module.css";

const section = SECTIONS[6];

export default function Contact() {
  const { t } = useT();
  const copy = t.contact;

  return (
    <section id={section.id} className={`${sectionStyles.scene} ${styles.contact}`}>
      <SceneHeader sectionId={section.id} />

      <div className={styles.layout}>
        <div className={styles.lead}>
          <h2 className={`${sectionStyles.title} ${styles.title}`}>{copy.title}</h2>
          <p className={sectionStyles.lead}>{copy.intro}</p>
        </div>

        <div className={styles.channels}>
          {/* Un seul appel principal : écrire. Le reste est secondaire. */}
          <div className={styles.primary}>
            <span className={styles.label}>Email</span>
            <a className={styles.email} href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </div>

          <ul className={styles.others}>
            <li className={styles.other}>
              <span className={styles.label}>GitHub</span>
              <a className={styles.otherValue} href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                {GITHUB_URL.replace("https://", "")}
              </a>
            </li>
            {/* LinkedIn reste « à confirmer » : le profil n'est pas encore à
                jour. Ne pas y mettre de valeur devinée. */}
            <li className={styles.other}>
              <span className={styles.label}>LinkedIn</span>
              <span className={styles.pending}>{copy.linkedinPending}</span>
            </li>
          </ul>

          <button type="button" className={styles.signal} onClick={() => scrollToSection("signal")}>
            {copy.signalCta}
          </button>
        </div>
      </div>
    </section>
  );
}
