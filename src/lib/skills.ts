import projectsData from "@/data/projects.json";
import type { Project } from "./types";

const projects = projectsData as Project[];

// Catégorisation manuelle des technologies rencontrées dans src/data/projects.json.
// Dérivé des projets réellement livrés — pas une liste de compétences déclarée
// à part, pour rester honnête et vérifiable (voir cadrage §5.2).
const CATEGORY_MAP: Record<string, string> = {
  Rust: "Langages",
  Python: "Langages",
  TypeScript: "Langages",
  JavaScript: "Langages",
  HTML: "Langages",

  Axum: "Frameworks & bibliothèques",
  "Next.js": "Frameworks & bibliothèques",
  "Express": "Frameworks & bibliothèques",
  Django: "Frameworks & bibliothèques",
  DRF: "Frameworks & bibliothèques",
  Vue: "Frameworks & bibliothèques",
  Tauri: "Frameworks & bibliothèques",
  FastAPI: "Frameworks & bibliothèques",
  Astro: "Frameworks & bibliothèques",
  "Three.js": "Frameworks & bibliothèques",
  Prisma: "Frameworks & bibliothèques",
  Canvas: "Frameworks & bibliothèques",
  Pygame: "Frameworks & bibliothèques",
  Leaflet: "Frameworks & bibliothèques",

  NumPy: "Données & ML",
  PyTorch: "Données & ML",
  "Scikit-learn": "Données & ML",
  MLflow: "Données & ML",
  MediaPipe: "Données & ML",
  OpenCV: "Données & ML",
  Matplotlib: "Données & ML",
  SciPy: "Données & ML",
  LlamaIndex: "Données & ML",

  Postgres: "Infrastructure & outils",
  SQLite: "Infrastructure & outils",
  WebSocket: "Infrastructure & outils",
  Tokio: "Infrastructure & outils",
  FUSE: "Infrastructure & outils",
  Prometheus: "Infrastructure & outils",
  Grafana: "Infrastructure & outils",
  asyncio: "Infrastructure & outils",
  httpx: "Infrastructure & outils",
  socket: "Infrastructure & outils",
  BeautifulSoup: "Infrastructure & outils",
  "Node.js": "Infrastructure & outils",
};

export const CATEGORY_ORDER = [
  "Langages",
  "Frameworks & bibliothèques",
  "Données & ML",
  "Infrastructure & outils",
];

export interface SkillEntry {
  name: string;
  category: string;
  count: number;
}

export function computeSkills(): Record<string, SkillEntry[]> {
  const counts = new Map<string, number>();
  projects.forEach((p) => {
    p.stack.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
  });

  const byCategory: Record<string, SkillEntry[]> = {};
  for (const cat of CATEGORY_ORDER) byCategory[cat] = [];

  counts.forEach((count, name) => {
    const category = CATEGORY_MAP[name] ?? "Infrastructure & outils";
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push({ name, category, count });
  });

  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  return byCategory;
}
