// Correspondance section ↔ arcane majeur du tarot. Chaque section du site est
// une carte du menu ; l'ordre suit celui des sections, pas celui du tarot.
// Les numéros sont ceux du tarot de Marseille (Force = VIII, Justice = XI),
// le concept d'arcane étant libre de droits : les illustrations, elles, sont
// dessinées pour ce site (voir components/arcana/ArcanaGlyph.tsx).

export interface Arcana {
  sectionId: string;
  numeral: string;
}

export const ARCANA: Arcana[] = [
  { sectionId: "index", numeral: "0" }, // Le Fou : le point de départ
  { sectionId: "projets", numeral: "I" }, // Le Magicien : ce qu'on fabrique
  { sectionId: "methode", numeral: "XI" }, // La Justice : la rigueur
  { sectionId: "competences", numeral: "VIII" }, // La Force : la maîtrise
  { sectionId: "playground", numeral: "X" }, // La Fortune : le jeu
  { sectionId: "signal", numeral: "XVIII" }, // La Lune : le message
  { sectionId: "contact", numeral: "XX" }, // Le Jugement : l'appel
];

export function arcanaFor(sectionId: string): Arcana | undefined {
  return ARCANA.find((entry) => entry.sectionId === sectionId);
}
