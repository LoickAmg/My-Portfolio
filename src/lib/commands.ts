import projects from "@/data/projects.json";
import type { Project } from "./types";

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // retire les accents pour matcher "competences" == "compétences"
}

export interface CommandResult {
  lines: string[];
}

const HELP_LIST = [
  "whoami — qui je suis",
  "projets — projets livrés",
  "competences — stack technique",
  "methode — comment je travaille",
  "contact — me joindre",
  "clear — effacer le fil",
];

function projectsResponse(): string[] {
  const list = projects as Project[];
  if (list.length === 0) {
    return ["Le catalogue de projets sera bientôt disponible ici."];
  }
  return list
    .filter((p) => p.highlight)
    .slice(0, 6)
    .map((p) => `→ ${p.name} — ${p.tagline}`);
}

export function runCommand(raw: string): CommandResult {
  const cmd = normalize(raw);

  if (cmd === "" ) {
    return { lines: ["Tape une commande — essaie 'aide'."] };
  }

  switch (cmd) {
    case "whoami":
      return { lines: ["[Nom, rôle, une phrase de positionnement.]"] };
    case "projets":
    case "projects":
      return { lines: projectsResponse() };
    case "competences":
    case "skills":
      return {
        lines: ["[Langages, frameworks, outils — liste réelle à confirmer.]"],
      };
    case "methode":
    case "method":
      return {
        lines: ["[Comment je travaille — étapes, outils, exigences.]"],
      };
    case "contact":
      return {
        lines: ["[Email, GitHub, LinkedIn — liens réels à confirmer.]"],
      };
    case "aide":
    case "help":
    case "?":
      return { lines: ["Commandes disponibles :", ...HELP_LIST] };
    default:
      return {
        lines: [`Commande inconnue : "${raw}". Tape 'aide' pour la liste.`],
      };
  }
}
