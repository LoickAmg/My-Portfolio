"use client";

import { motion } from "framer-motion";
import { SECTIONS } from "@/lib/sections";
import { scrollToSection } from "@/lib/scroll";
import DialogueBox from "@/components/DialogueBox";
import SectionHeader from "./SectionHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Hero.module.css";

const section = SECTIONS[0]; // index

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.1 + i * 0.08, ease: "easeOut" as const },
  }),
};

export default function Hero() {
  return (
    <section id={section.id} className={sectionStyles.section}>
      <SectionHeader index={section.index} label={section.label} />

      <div className={styles.grid}>
        <div className={styles.copy}>
          <motion.div
            className={styles.eyebrow}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className={styles.eyebrowLine} />
            [ rôle / positionnement ]
          </motion.div>

          <motion.h1
            className={styles.heading}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Je construis
            <br />
            des systèmes
            <br />
            <span className={styles.headingAccent}>qui tiennent.</span>
          </motion.h1>

          <motion.p
            className={styles.intro}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            [Une phrase d&apos;intro à écrire ensemble — qui tu es, ce que tu
            construis, pour qui.]
          </motion.p>

          <motion.div
            className={styles.ctas}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <button
              type="button"
              className={styles.ctaPrimary}
              onClick={() => scrollToSection("projets")}
            >
              Explorer les projets
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.ctaSecondary}
              onClick={() => scrollToSection("signal")}
            >
              Ouvrir le canal
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </motion.div>

          <motion.div
            className={styles.stats}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            <div className={styles.stat}>
              <span className={styles.statIndex}>01</span>
              <strong className={styles.statLabel}>
                [Localisation / dispo]
              </strong>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIndex}>02</span>
              <strong className={styles.statLabel}>40 projets livrés</strong>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIndex}>03</span>
              <strong className={styles.statLabel}>
                Scroll pour décoder ↓
              </strong>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={styles.dialogueWrap}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          <DialogueBox
            channelLabel="Canal actif"
            channelIndex="01 / 03"
            speakerInitial="M"
            speakerTag="Mahouna // Signal 00"
            line="[Texte d'accroche — à écrire ensemble : ce que ce portfolio raconte, en une ou deux phrases.]"
            choices={[
              {
                key: "A",
                label: "Montre-moi ta méthode.",
                primary: true,
                onSelect: () => scrollToSection("methode"),
              },
              {
                key: "B",
                label: "Je veux voir les projets.",
                onSelect: () => scrollToSection("projets"),
              },
            ]}
          />
        </motion.div>
      </div>
    </section>
  );
}
