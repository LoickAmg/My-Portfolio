"use client";

import { setLanguage } from "@/lib/useLanguage";
import { useT } from "@/lib/i18n";
import styles from "./LanguageToggle.module.css";

// Même schéma que ThemeToggle : deux instances peuvent coexister (rail +
// en-tête mobile), synchronisées par l'événement custom de useLanguage.
// Le libellé affiché est la langue vers laquelle on bascule, pas la langue
// active (convention usuelle des sélecteurs de langue).
export default function LanguageToggle({ className }: { className?: string }) {
  const { lang, t } = useT();

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className ?? ""}`}
      onClick={() => setLanguage(lang === "fr" ? "en" : "fr")}
      aria-label={lang === "fr" ? t.languageToggle.toEnglish : t.languageToggle.toFrench}
    >
      {lang === "fr" ? "EN" : "FR"}
    </button>
  );
}
