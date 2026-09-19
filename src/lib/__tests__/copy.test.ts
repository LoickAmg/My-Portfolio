import { describe, expect, it } from "vitest";
import projectsData from "@/data/projects.json";
import { UI } from "../i18n";
import { localizeProjects } from "../projectsI18n";
import type { Project } from "../types";

// Garde-fou de copie : relit chaque texte affiché contre les motifs que le
// protocole anti-générique interdit (partie 1.5) et contre la règle de voix
// du site (voir docs/VOIX-ET-COPIE.md). Un texte qui échoue ici doit être
// réécrit, pas ajouté à la liste des exceptions.

interface Entry {
  path: string;
  text: string;
}

// Parcourt le dictionnaire, y compris le résultat des fonctions (avec des
// arguments d'exemple), pour que les phrases construites soient relues aussi.
function collect(value: unknown, path: string, out: Entry[]): void {
  if (typeof value === "string") {
    out.push({ path, text: value });
  } else if (typeof value === "function") {
    try {
      collect((value as (...args: unknown[]) => unknown)(3, 2), `${path}()`, out);
    } catch {
      // Fonction qui attend un autre type d'argument : rien à relire.
    }
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => collect(item, `${path}[${index}]`, out));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) collect(item, `${path}.${key}`, out);
  }
}

function entriesOf(lang: "fr" | "en"): Entry[] {
  const out: Entry[] = [];
  collect(UI[lang], lang, out);
  return out;
}

function offenders(entries: Entry[], pattern: RegExp): string[] {
  return entries.filter((entry) => pattern.test(entry.text)).map((entry) => `${entry.path}: ${entry.text}`);
}

// Buzzwords et formules creuses (protocole 1.5).
const BUZZWORDS =
  /révolutionn|game[- ]?chang|disrupt|disruptif|tout-en-un|all-in-one|propuls|transformez|transform your|leverag|optimisez|rationalisez|streamlin|cutting[- ]edge|state[- ]of[- ]the[- ]art|seamless|best[- ]in[- ]class|passionn/i;

const EMPTY_TRIPLET = /simple\.\s*rapide\.\s*efficace|simple\.\s*fast\.\s*efficient/i;
const FAQ_FILLER = /pourquoi choisir|why choose/i;
const INVENTED_PROOF = /\d[\d\s.,]*\+?\s*(utilisateurs|clients|users|customers)\s+(satisfaits|satisfied)/i;
const GENERIC_CTA = /^(commencer|en savoir plus|essayer|get started|learn more|try it|try now)\.?$/i;

// Constructions « pas X, mais Y » : le tic de rhétorique que le protocole
// cite en premier (« C'est pas X, c'est Y »).
const CONTRAST_TIC =
  /c'est pas .{1,50}, c'est|ce n'est pas .{1,50}, c'est|it's not .{1,50}, it's|\bpas seulement\b|\bnot just\b|\bplutôt qu'espérer\b|\brather than hope\b/i;

// Adverbes d'auto-éloge : la fiabilité se montre par une preuve, elle ne se
// proclame pas.
const SELF_PRAISE = /honnêtement|honnête\b|honestly|\bhonest\b|réellement|actually been/i;

// Voix du site : tutoiement dans l'interface, vouvoiement réservé aux
// documents légaux (qui ne sont pas dans ce dictionnaire).
const VOUVOIEMENT = /\b(vous|votre|vos|choisissez|glissez|appuyez|entraînez|écrivez|réessayez|revenez|cliquez|essayez|regardez)\b/i;

describe("copie : textes de l'interface", () => {
  for (const lang of ["fr", "en"] as const) {
    const entries = entriesOf(lang);

    it(`${lang} : aucun buzzword ni formule creuse`, () => {
      expect(offenders(entries, BUZZWORDS)).toEqual([]);
      expect(offenders(entries, EMPTY_TRIPLET)).toEqual([]);
      expect(offenders(entries, FAQ_FILLER)).toEqual([]);
      expect(offenders(entries, INVENTED_PROOF)).toEqual([]);
    });

    it(`${lang} : aucun libellé d'action générique`, () => {
      expect(offenders(entries, GENERIC_CTA)).toEqual([]);
    });

    it(`${lang} : pas de construction « pas X, mais Y »`, () => {
      expect(offenders(entries, CONTRAST_TIC)).toEqual([]);
    });

    it(`${lang} : pas d'adverbe d'auto-éloge`, () => {
      expect(offenders(entries, SELF_PRAISE)).toEqual([]);
    });
  }

  it("fr : tutoiement partout dans l'interface", () => {
    expect(offenders(entriesOf("fr"), VOUVOIEMENT)).toEqual([]);
  });

  it("aucun texte ne laisse un marqueur d'attente visible", () => {
    const all = [...entriesOf("fr"), ...entriesOf("en")];
    expect(offenders(all, /\[…\]|\[\.\.\.\]|lorem ipsum|TODO|FIXME/i)).toEqual([]);
  });
});

describe("copie : fiches projets", () => {
  const french: Entry[] = (projectsData as Project[]).flatMap((project) => [
    { path: `${project.slug}.tagline`, text: project.tagline },
    ...(project.story
      ? Object.entries(project.story).map(([key, text]) => ({ path: `${project.slug}.story.${key}`, text }))
      : []),
  ]);
  const english: Entry[] = localizeProjects("en").flatMap((project) => [
    { path: `${project.slug}.tagline`, text: project.tagline },
    ...(project.story
      ? Object.entries(project.story).map(([key, text]) => ({ path: `${project.slug}.story.${key}`, text }))
      : []),
  ]);

  it.each([
    ["fr", french],
    ["en", english],
  ] as const)("%s : sans buzzword ni auto-éloge", (_lang, entries) => {
    expect(offenders([...entries], BUZZWORDS)).toEqual([]);
    expect(offenders([...entries], SELF_PRAISE)).toEqual([]);
  });

  it("chaque projet a une phrase de présentation renseignée", () => {
    expect(french.filter((entry) => entry.path.endsWith(".tagline") && entry.text.trim().length < 20)).toEqual([]);
  });
});
