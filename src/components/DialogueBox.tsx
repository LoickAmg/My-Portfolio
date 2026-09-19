"use client";

import styles from "./DialogueBox.module.css";

export interface DialogueChoice {
  key: string;
  label: string;
  primary?: boolean;
  onSelect: () => void;
}

interface DialogueBoxProps {
  channelLabel: string;
  speakerInitial: string;
  speakerTag: string;
  line: string;
  choices: DialogueChoice[];
}

// Boîte de dialogue façon jeu : un interlocuteur, une réplique, deux choix
// qui mènent à une section. Aucune animation d'entrée : la réplique est là
// dès l'arrivée, pour ne pas retarder la lecture.
export default function DialogueBox({
  channelLabel,
  speakerInitial,
  speakerTag,
  line,
  choices,
}: DialogueBoxProps) {
  return (
    <div className={styles.panel}>
      <p className={styles.meta}>{channelLabel}</p>

      <div className={styles.speaker}>
        <div className={styles.avatar} aria-hidden="true">
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
          <button
            key={choice.key}
            type="button"
            className={`${styles.choice} ${choice.primary ? styles.choicePrimary : ""}`}
            onClick={choice.onSelect}
          >
            <span className={styles.choiceKey}>{choice.key}</span>
            <span className={styles.choiceLabel}>{choice.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
