// Types partagés du portfolio.

// Pour les projets repères : la tagline reste un résumé court (aperçu de
// liste), et `story` porte la version développée Problème → Décision →
// Preuve affichée uniquement dans le détail déplié. On évite ainsi le mur
// de texte dans la liste compacte tout en gardant l'argumentaire complet
// disponible au clic.
export interface ProjectStory {
  probleme: string;
  decision: string;
  preuve: string;
}

// Type de travail : sert à filtrer l'archive (voir Projects.tsx). Classé
// selon la nature réelle du projet, pas selon sa stack seule — un projet
// Rust peut être "systemes" (moteur, protocole bas niveau) ou "interactif"
// (simulation/démo jouable) selon ce qu'il donne concrètement à voir.
export type WorkType = "web" | "outils" | "data-ia" | "systemes" | "interactif";

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  stack: string[];
  workType: WorkType;
  year: number;
  status: "livré" | "en cours";
  repoUrl?: string;
  highlight?: boolean;
  story?: ProjectStory;
}
