// Tout ce que le site écrit dans le navigateur (localStorage), en un seul
// endroit. La page /confidentialite liste ces clés à partir de cette
// constante : ajouter une clé ici la documente automatiquement, et
// l'oublier ici rend l'écart visible en relecture plutôt que silencieux.
//
// Aucune de ces valeurs ne quitte l'appareil : pas de cookie, pas de
// requête réseau, aucun identifiant de suivi.

export const STORAGE_KEYS = {
  theme: "portfolio-theme",
  lang: "portfolio-lang",
  snakeBest: "portfolio-snake-best",
  connectFourTally: "portfolio-connect-four-tally",
} as const;

export interface StorageKeyDoc {
  key: string;
  purpose: string;
}

export const STORAGE_KEY_DOCS: StorageKeyDoc[] = [
  { key: STORAGE_KEYS.theme, purpose: "Thème clair ou sombre choisi." },
  { key: STORAGE_KEYS.lang, purpose: "Langue d'affichage choisie (français ou anglais)." },
  { key: STORAGE_KEYS.snakeBest, purpose: "Meilleurs scores au Snake, un par mode de jeu." },
  {
    key: STORAGE_KEYS.connectFourTally,
    purpose: "Victoires, défaites et nuls au Puissance 4, par niveau de difficulté.",
  },
];

// Lecture/écriture tolérantes : le stockage peut être indisponible
// (navigation privée, données de site bloquées) ou renvoyer du contenu
// corrompu. Dans les deux cas le site continue de fonctionner, sans
// mémoire.
export function readStored<T>(key: string, fallback: T, isValid: (raw: unknown) => raw is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota dépassé ou stockage bloqué : la valeur reste valable pour la
    // session en cours seulement.
  }
}
