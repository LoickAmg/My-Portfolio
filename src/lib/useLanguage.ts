"use client";

// Langue d'affichage du site (FR par défaut, EN en option) — sélecteur
// client sans changement d'URL/routing (décision explicite de
// l'utilisateur, roadmap "i18n"). Même architecture que le thème
// (ThemeToggle.tsx) : attribut sur <html>, événement custom pour
// synchroniser plusieurs instances du sélecteur, useSyncExternalStore côté
// lecture.

import { useSyncExternalStore } from "react";
import { STORAGE_KEYS } from "./storage";

export type Lang = "fr" | "en";

const STORAGE_KEY = STORAGE_KEYS.lang;
export const LANG_EVENT = "portfolio-lang-change";

export function readLanguage(): Lang {
  return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "fr";
}

function subscribe(callback: () => void) {
  window.addEventListener(LANG_EVENT, callback);
  return () => window.removeEventListener(LANG_EVENT, callback);
}

// Rendu serveur : toujours "fr" (langue par défaut). Le script bloquant de
// layout.tsx pose data-lang avant l'hydratation d'après localStorage, donc
// la valeur client réelle peut différer de ce snapshot serveur dès le
// premier rendu — c'est exactement le cas que useSyncExternalStore gère
// nativement (il hydrate avec getServerSnapshot, puis se resynchronise
// juste après le montage si getSnapshot diffère).
function getServerSnapshot(): Lang {
  return "fr";
}

export function setLanguage(next: Lang) {
  document.documentElement.setAttribute("data-lang", next);
  document.documentElement.setAttribute("lang", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Stockage indisponible (navigation privée, etc.) — le choix reste actif
    // pour la session en cours sans bloquer le changement de langue.
  }
  window.dispatchEvent(new Event(LANG_EVENT));
}

export function useLanguage(): Lang {
  return useSyncExternalStore(subscribe, readLanguage, getServerSnapshot);
}
