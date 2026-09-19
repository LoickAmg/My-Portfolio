"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { runCommand } from "@/lib/commands";
import { useT } from "@/lib/i18n";
import SceneHeader from "./SceneHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Signal.module.css";

const section = SECTIONS[5];

interface Message {
  id: number;
  from: "user" | "system";
  text: string;
}

let nextId = 0;

export default function Signal() {
  const { lang, t } = useT();
  // Le message d'accueil n'est pas stocké dans `messages` : il est dérivé à
  // chaque rendu depuis la langue active (voir displayMessages ci-dessous),
  // pour rester traduit si l'utilisateur bascule la langue avant d'avoir
  // tapé quoi que ce soit. Une fois qu'un vrai échange existe, en revanche,
  // cet historique reste dans la langue où il a été émis (comme un vrai fil
  // de discussion) : la bascule de langue ne le réécrit pas rétroactivement.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const displayMessages: Message[] = [
    { id: -1, from: "system", text: t.signal.welcome },
    ...messages,
  ];

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    if (value.toLowerCase() === "clear") {
      setMessages([]);
      setInput("");
      return;
    }

    const userMsg: Message = { id: nextId++, from: "user", text: value };
    const { lines } = runCommand(value, lang);
    const systemMsgs: Message[] = lines.map((line) => ({
      id: nextId++,
      from: "system",
      text: line,
    }));

    setMessages((prev) => [...prev, userMsg, ...systemMsgs]);
    setInput("");
  }

  return (
    <section id={section.id} className={`${sectionStyles.scene} ${sectionStyles.scenePanel} ${styles.signal}`}>
      <SceneHeader sectionId={section.id} />

      <div className={styles.layout}>
        <div className={styles.aside}>
          <h2 className={sectionStyles.title}>{t.signal.title}</h2>
          <p className={sectionStyles.lead}>{t.signal.hint}</p>
        </div>

        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerDot} />
              <span className={styles.headerTitle}>{t.signal.headerTitle}</span>
            </div>
            <div className={styles.status}>
              <span className={styles.statusDot} />
              {t.signal.online}
            </div>
          </div>

          <div className={styles.modeLabel}>{t.signal.modeLabel}</div>

          <div
            className={styles.thread}
            ref={threadRef}
            role="log"
            aria-live="polite"
          >
            {displayMessages.map((m) => (
              <div
                key={m.id}
                className={`${styles.row} ${
                  m.from === "user" ? styles.rowUser : styles.rowSystem
                }`}
              >
                <div
                  className={`${styles.bubble} ${
                    m.from === "user" ? styles.bubbleUser : styles.bubbleSystem
                  }`}
                >
                  {m.from === "user" ? `$ ${m.text}` : m.text}
                </div>
              </div>
            ))}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.signal.placeholder}
              aria-label={t.signal.commandAriaLabel}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              aria-label={t.signal.sendAriaLabel}
            >
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
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
