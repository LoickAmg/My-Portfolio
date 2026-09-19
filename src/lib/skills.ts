import projectsData from "@/data/projects.json";
import type { Project } from "./types";

const projects = projectsData as Project[];

// Catégorisation manuelle des technologies rencontrées dans src/data/projects.json.
// Dérivé des projets réellement livrés — pas une liste de compétences déclarée
// à part, pour rester honnête et vérifiable (voir cadrage §5.2).
//
// Regroupement par domaine d'ingénierie (Core / Backend / Data-ML / Systems)
// plutôt que par nature d'artefact (langage vs framework vs infra) — voir
// roadmap phase 01, p1-i4 : la catégorie doit se lire comme une compétence,
// pas comme un compteur d'usage.
const CATEGORY_MAP: Record<string, string> = {
  Rust: "Core",
  Python: "Core",
  TypeScript: "Core",
  JavaScript: "Core",
  HTML: "Core",

  Axum: "Backend",
  "Next.js": "Backend",
  "Express": "Backend",
  Django: "Backend",
  DRF: "Backend",
  Vue: "Backend",
  Tauri: "Backend",
  FastAPI: "Backend",
  Astro: "Backend",
  "Three.js": "Backend",
  Prisma: "Backend",
  Canvas: "Backend",
  Pygame: "Backend",
  Leaflet: "Backend",
  "Node.js": "Backend",

  NumPy: "Data/ML",
  PyTorch: "Data/ML",
  "Scikit-learn": "Data/ML",
  MLflow: "Data/ML",
  MediaPipe: "Data/ML",
  OpenCV: "Data/ML",
  Matplotlib: "Data/ML",
  SciPy: "Data/ML",
  LlamaIndex: "Data/ML",

  Postgres: "Systems",
  SQLite: "Systems",
  WebSocket: "Systems",
  Tokio: "Systems",
  FUSE: "Systems",
  Prometheus: "Systems",
  Grafana: "Systems",
  asyncio: "Systems",
  httpx: "Systems",
  socket: "Systems",
  BeautifulSoup: "Systems",
};

export const CATEGORY_ORDER = ["Core", "Backend", "Data/ML", "Systems"];

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
    const category = CATEGORY_MAP[name] ?? "Systems";
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push({ name, category, count });
  });

  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }

  return byCategory;
}
