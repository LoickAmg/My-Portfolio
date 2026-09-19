import projectsData from "@/data/projects.json";
import { localizeProjects } from "./projectsI18n";
import { UI, type Lang } from "./i18n";
import { computeSkills } from "./skills";
import { CONTACT_EMAIL, GITHUB_URL } from "./site";
import type { Project } from "./types";

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, ""); // retire les accents pour matcher "competences" == "compétences"
}

const DELIVERED_COUNT = (projectsData as Project[]).filter((project) => project.status === "livré").length;

// Les cinq technologies les plus utilisées, avec leur nombre de projets : la
// réponse suit le catalogue au lieu d'une liste écrite à la main.
function topSkills(lang: Lang): string {
  const ranked = Object.values(computeSkills()).flat().sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const format = UI[lang].skills.projectsCount;
  return ranked
    .slice(0, 5)
    .map((entry, index) => (index === 0 ? `${entry.name} (${format(entry.count)})` : `${entry.name} (${entry.count})`))
    .join(", ");
}

export interface CommandResult {
  lines: string[];
}

function projectsResponse(lang: Lang): string[] {
  const list = localizeProjects(lang);
  if (list.length === 0) {
    return [UI[lang].commands.emptyProjects];
  }
  return list
    .filter((p) => p.highlight)
    .slice(0, 7)
    .map((p) => `→ ${p.name} — ${p.tagline}`);
}

// L'interpréteur accepte les commandes en français ET en anglais quelle que
// soit la langue active de l'interface — seul le TEXTE des réponses suit la
// langue active (voir src/lib/i18n.ts, clé "commands").
export function runCommand(raw: string, lang: Lang = "fr"): CommandResult {
  const cmd = normalize(raw);
  const t = UI[lang].commands;

  if (cmd === "") {
    return { lines: [t.emptyInput] };
  }

  switch (cmd) {
    case "whoami":
      return { lines: t.whoami(DELIVERED_COUNT) };
    case "projets":
    case "projects":
      return { lines: projectsResponse(lang) };
    case "competences":
    case "skills":
      return { lines: t.skills(topSkills(lang)) };
    case "methode":
    case "method":
      return { lines: t.method };
    case "contact":
      return { lines: t.contact(CONTACT_EMAIL, GITHUB_URL.replace("https://", "")) };
    case "aide":
    case "help":
    case "?":
      return { lines: [t.availableCommands, ...t.helpList] };
    default:
      return { lines: [t.unknown(raw)] };
  }
}
