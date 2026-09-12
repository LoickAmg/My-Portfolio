"use client";

import { motion } from "framer-motion";
import styles from "./DialogueBox.module.css";

export interface DialogueChoice {
  key: string;
  label: string;
  primary?: boolean;
  onSelect: () => void;
}

export default function DialogueBox({
  channelLabel,
  channelIndex,
  speakerInitial,
  speakerTag,
  line,
  choices,
}: {
  channelLabel: string;
  channelIndex: string;
  speakerInitial: string;
  speakerTag: string;
  line: string;
  choices: DialogueChoice[];
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.meta}>
        <span>{channelLabel}</span>
        <span>{channelIndex}</span>
      </div>

      <div className={styles.speaker}>
        <div className={styles.avatar}>
          <div className={styles.avatarShape} />
          <div className={styles.avatarLetter}>{speakerInitial}</div>
        </div>
        <div className={styles.nameTag}>
          <span className={styles.nameTagText}>{speakerTag}</span>
        </div>
      </div>

      <p className={styles.line}>{line}</p>

      <div className={styles.choices}>
        {choices.map((choice) => (
          <motion.button
            key={choice.key}
            type="button"
            className={`${styles.choice} ${choice.primary ? styles.choicePrimary : ""}`}
            onClick={choice.onSelect}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <span className={styles.choiceKey}>{choice.key}</span>
            <span className={styles.choiceLabel}>{choice.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
