// Ordre et libellés des sections du rail de navigation.
// Décidé dans cadrage-nouveaux-projets.md §5.1 — ne pas réordonner sans
// nouvelle décision explicite.

export interface SectionDef {
  id: string;
  index: string; // "00" .. "05"
  label: string;
}

export const SECTIONS: SectionDef[] = [
  { id: "index", index: "00", label: "Index" },
  { id: "projets", index: "01", label: "Projets" },
  { id: "methode", index: "02", label: "Méthode" },
  { id: "competences", index: "03", label: "Compétences" },
  { id: "signal", index: "04", label: "Signal" },
  { id: "contact", index: "05", label: "Contact" },
];
