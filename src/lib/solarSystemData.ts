// Données réelles des huit planètes (couleur approximative, diamètre en
// km, distance moyenne au Soleil en unités astronomiques, période
// orbitale) — mêmes valeurs de référence que le projet Solar System.
// Pour le rendu 3D, ni les distances ni les tailles ni les périodes ne
// sont à l'échelle réelle (elles ne tiendraient pas dans un même écran ni
// dans une durée d'observation raisonnable) : elles sont compressées par
// une fonction monotone (voir scaleDistance/scaleRadius dans
// SolarSystem.tsx) qui préserve l'ordre et les proportions relatives,
// jamais les valeurs. Le détail affiché au clic sur une planète, lui,
// reste toujours la vraie valeur ci-dessous.

export interface PlanetData {
  id: string;
  name: string;
  type: string;
  color: number;
  diameterKm: number;
  distanceAu: number;
  orbitalPeriodLabel: string;
  orbitalPeriodEarthYears: number;
}

export const PLANETS: PlanetData[] = [
  {
    id: "mercury",
    name: "Mercure",
    type: "Tellurique",
    color: 0x9b9da4,
    diameterKm: 4879,
    distanceAu: 0.39,
    orbitalPeriodLabel: "88 jours",
    orbitalPeriodEarthYears: 88 / 365.25,
  },
  {
    id: "venus",
    name: "Vénus",
    type: "Tellurique",
    color: 0xd5a35f,
    diameterKm: 12104,
    distanceAu: 0.72,
    orbitalPeriodLabel: "225 jours",
    orbitalPeriodEarthYears: 225 / 365.25,
  },
  {
    id: "earth",
    name: "Terre",
    type: "Tellurique",
    color: 0x277bb7,
    diameterKm: 12756,
    distanceAu: 1,
    orbitalPeriodLabel: "365,25 jours",
    orbitalPeriodEarthYears: 1,
  },
  {
    id: "mars",
    name: "Mars",
    type: "Tellurique",
    color: 0xb55e45,
    diameterKm: 6792,
    distanceAu: 1.52,
    orbitalPeriodLabel: "687 jours",
    orbitalPeriodEarthYears: 687 / 365.25,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    type: "Géante gazeuse",
    color: 0xbc906a,
    diameterKm: 142984,
    distanceAu: 5.2,
    orbitalPeriodLabel: "11,86 ans",
    orbitalPeriodEarthYears: 11.86,
  },
  {
    id: "saturn",
    name: "Saturne",
    type: "Géante gazeuse",
    color: 0xd0b47b,
    diameterKm: 120536,
    distanceAu: 9.54,
    orbitalPeriodLabel: "29,46 ans",
    orbitalPeriodEarthYears: 29.46,
  },
  {
    id: "uranus",
    name: "Uranus",
    type: "Géante de glace",
    color: 0x77b8c0,
    diameterKm: 51118,
    distanceAu: 19.19,
    orbitalPeriodLabel: "84 ans",
    orbitalPeriodEarthYears: 84,
  },
  {
    id: "neptune",
    name: "Neptune",
    type: "Géante de glace",
    color: 0x3d63b5,
    diameterKm: 49528,
    distanceAu: 30.07,
    orbitalPeriodLabel: "164,8 ans",
    orbitalPeriodEarthYears: 164.8,
  },
];

// Overlay anglais (name/type/orbitalPeriodLabel affichés) — mêmes valeurs
// numériques dans les deux langues, seul le texte change. Suit le même
// principe que src/lib/projectsI18n.ts : PLANETS ci-dessus reste la source
// de vérité (français), cette table ne fournit que les chaînes traduites.
const PLANETS_EN: Record<string, Pick<PlanetData, "name" | "type" | "orbitalPeriodLabel">> = {
  mercury: { name: "Mercury", type: "Terrestrial", orbitalPeriodLabel: "88 days" },
  venus: { name: "Venus", type: "Terrestrial", orbitalPeriodLabel: "225 days" },
  earth: { name: "Earth", type: "Terrestrial", orbitalPeriodLabel: "365.25 days" },
  mars: { name: "Mars", type: "Terrestrial", orbitalPeriodLabel: "687 days" },
  jupiter: { name: "Jupiter", type: "Gas giant", orbitalPeriodLabel: "11.86 years" },
  saturn: { name: "Saturn", type: "Gas giant", orbitalPeriodLabel: "29.46 years" },
  uranus: { name: "Uranus", type: "Ice giant", orbitalPeriodLabel: "84 years" },
  neptune: { name: "Neptune", type: "Ice giant", orbitalPeriodLabel: "164.8 years" },
};

export function localizePlanet(data: PlanetData, lang: "fr" | "en"): PlanetData {
  if (lang === "fr") return data;
  const override = PLANETS_EN[data.id];
  return override ? { ...data, ...override } : data;
}
