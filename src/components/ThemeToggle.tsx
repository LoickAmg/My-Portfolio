"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/storage";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

const STORAGE_KEY = STORAGE_KEYS.theme;
const THEME_EVENT = "portfolio-theme-change";

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

// Rien à afficher côté serveur (le thème n'est connu qu'une fois le script
// bloquant de layout.tsx exécuté côté client) — évite tout écart d'hydratation.
function getServerSnapshot(): Theme | null {
  return null;
}

// Deux instances de ce composant peuvent coexister dans le DOM (rail bureau +
// en-tête mobile, chacune masquée en CSS selon la largeur d'écran) ;
// useSyncExternalStore + un évènement custom les gardent synchronisées même
// si le viewport change de palier après montage.
export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);
  const { t } = useT();

  function toggle() {
    const next: Theme = readTheme() === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // stockage indisponible (navigation privée, etc.) — le choix reste
      // actif pour la session en cours sans bloquer le changement de thème.
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className ?? ""}`}
      onClick={toggle}
      aria-label={
        theme === null
          ? t.themeToggle.unknown
          : theme === "light"
            ? t.themeToggle.toDark
            : t.themeToggle.toLight
      }
    >
      {theme === "light" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
        </svg>
      )}
      {theme === "dark" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
      )}
    </button>
  );
}
