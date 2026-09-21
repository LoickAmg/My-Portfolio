// Identité et coordonnées du site, en un seul endroit : métadonnées SEO,
// pages légales, sitemap et section Contact lisent tous ces constantes.
// Les valeurs encore inconnues ne sont pas devinées ici : elles vivent dans
// les pages légales sous forme de marqueurs « À COMPLÉTER » (voir
// docs/A-COMPLETER.md pour la liste exhaustive).

import projectsData from "@/data/projects.json";

export const SITE_NAME = "Mahouna — Portfolio";
export const OWNER_NAME = "Mahouna";

// Domaine du site, dans cet ordre : NEXT_PUBLIC_SITE_URL (domaine
// personnalisé), puis le domaine de production que Vercel fournit lui-même au
// build, puis localhost en développement. Il sert au sitemap, à robots.txt et
// aux images de partage, qui exigent une adresse absolue.
const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

// `||` et non `??` : une variable définie mais vide (fréquent dans un tableau
// de bord d'hébergeur) est traitée comme absente, sinon new URL("") planterait.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || (vercelProductionHost ? `https://${vercelProductionHost}` : "http://localhost:3000");

// Le nombre de projets vient du catalogue : la description ne se périme pas.
export const SITE_DESCRIPTION = `Ingénieur IA et Architecte Logiciel. ${projectsData.length} projets livrés et publiés sur GitHub, surtout en Python et en Rust, et la méthode qui les relie.`;

export const CONTACT_EMAIL = "mahounaamg@gmail.com";
export const GITHUB_URL = "https://github.com/LoickAmg";

export const LEGAL_PAGES = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cgu", label: "CGU" },
] as const;

// Tant que les pages légales contiennent des marqueurs « À COMPLÉTER », elles
// restent hors des moteurs de recherche (noindex) et hors du sitemap.
// Passer à true une fois docs/A-COMPLETER.md entièrement traité.
export const LEGAL_PAGES_READY = false;

export const LEGAL_UPDATED = "19 septembre 2026";
