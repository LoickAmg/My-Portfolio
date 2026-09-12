"use client";

import { useEffect, useRef, useState } from "react";
import { SECTIONS } from "@/lib/sections";
import { runCommand } from "@/lib/commands";
import SectionHeader from "./SectionHeader";
import sectionStyles from "./sections.module.css";
import styles from "./Signal.module.css";

const section = SECTIONS[4]; // signal

interface Message {
  id: number;
  from: "user" | "system";
  text: string;
}

let nextId = 0;

const WELCOME: Message[] = [
  {
    id: nextId++,
    from: "system",
    text: "Connexion établie. Tape une commande — essaie 'aide' pour la liste.",
  },
];

export default function Signal() {
  const [messages, setMessages] = useState<Message[]>(WELCOME);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    if (value.toLowerCase() === "clear") {
      setMessages(WELCOME);
      setInput("");
      return;
    }

    const userMsg: Message = { id: nextId++, from: "user", text: value };
    const { lines } = runCommand(value);
    const systemMsgs: Message[] = lines.map((line) => ({
      id: nextId++,
      from: "system",
      text: line,
    }));

    setMessages((prev) => [...prev, userMsg, ...systemMsgs]);
    setInput("");
  }

  return (
    <section id={section.id} className={sectionStyles.section}>
      <SectionHeader index={section.index} label={section.label} />
      <h2 className={sectionStyles.title}>Signal</h2>

      <div className={styles.wrap}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerDot} />
              <span className={styles.headerTitle}>Signal</span>
            </div>
            <div className={styles.status}>
              <span className={styles.statusDot} />
              En ligne
            </div>
          </div>

          <div className={styles.modeLabel}>
            interpréteur de commandes — whoami / projets / competences /
            methode / contact
          </div>

          <div
            className={styles.thread}
            ref={threadRef}
            role="log"
            aria-live="polite"
          >
            {messages.map((m) => (
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
              placeholder="Tapez une commande…"
              aria-label="Commande"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              aria-label="Envoyer"
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

      <p className={styles.hint}>whoami · projets · competences · methode · contact · clear</p>
    </section>
  );
}
