// Ordre et libellés des sections du rail de navigation.
// Décidé dans cadrage-nouveaux-projets.md §5.1 — ne pas réordonner sans
// nouvelle décision explicite.
//
// "Playground" (index 04) ajouté par la roadmap phase 04 (p4-i1) : inséré
// après Compétences et avant Signal/Contact, qui restent les sections de
// clôture du parcours. Décision explicite de l'utilisateur (nouvelle
// section dédiée, plutôt qu'une sous-page séparée).

export interface SectionDef {
  id: string;
  index: string; // "00" .. "06"
  label: string;
}

export const SECTIONS: SectionDef[] = [
  { id: "index", index: "00", label: "Index" },
  { id: "projets", index: "01", label: "Projets" },
  { id: "methode", index: "02", label: "Méthode" },
  { id: "competences", index: "03", label: "Compétences" },
  { id: "playground", index: "04", label: "Playground" },
  { id: "signal", index: "05", label: "Signal" },
  { id: "contact", index: "06", label: "Contact" },
];
