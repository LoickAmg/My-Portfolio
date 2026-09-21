// Overlay de traduction anglaise pour src/data/projects.json.
//
// src/data/projects.json reste l'unique source de vérité pour tout ce qui
// n'est pas linguistique (slug, stack, year, status brut, repoUrl,
// workType, highlight) : ces champs ne changent jamais selon la langue.
// Seuls les champs textuels (name — quand le nom original n'est pas déjà en
// anglais —, tagline, story) ont une variante "en" ici, indexée par slug.
// La plupart des noms de projets sont déjà des noms anglais (Chess Engine,
// Physics Engine, ...) : ils n'ont donc pas d'entrée `name` ci-dessous, sauf
// les deux exceptions nommées en français (Dessine & Devine, Puissance 4).

import projectsData from "@/data/projects.json";
import type { Project, ProjectStory } from "./types";
import type { Lang } from "./i18n";

const projects = projectsData as Project[];

interface ProjectOverrideEn {
  name?: string;
  tagline: string;
  story?: ProjectStory;
}

const EN: Record<string, ProjectOverrideEn> = {
  "chess-engine": {
    tagline:
      "Chess engine in Rust: pruned negamax search, move generator correctness proven by perft, UCI protocol.",
    story: {
      probleme:
        "A naively explored game tree is far too large for a chess engine to play within a time limit.",
      decision:
        "Negamax with alpha-beta pruning to cut off useless branches, quiescence search to avoid evaluating a position mid piece-exchange, and the UCI protocol to stay usable by any chess client.",
      preuve:
        "Move generator validated by perft on reference positions (exact node count at every depth) before the search was even wired in.",
    },
  },
  "physics-engine": {
    tagline:
      "2D physics engine in Rust: stable impulse-based resolution, with no interpenetration or jitter over long simulations.",
    story: {
      probleme:
        "An approximate 2D collision simulation makes objects interpenetrate or numerically diverges after a few seconds.",
      decision:
        "Collision detection via SAT, sequential impulse resolution with warm starting to stabilize persistent contacts, and Coulomb friction for physically coherent behavior.",
      preuve:
        "Stress scenes (stacks of objects, multiple contacts) that stay stable over long-running simulations, with no residual interpenetration or visible jitter.",
    },
  },
  "rust-fs": {
    tagline:
      "File system in Rust mounted via FUSE: real POSIX operations, durability guaranteed by write-ahead logging.",
    story: {
      probleme:
        "A toy file system that doesn't respect POSIX semantics, or that loses data at the slightest power cut, has no demonstration value.",
      decision:
        "Real mounting via FUSE rather than an in-memory simulation, write-ahead logging (WAL) for durability, and support for sparse files.",
      preuve:
        "Mounted and usable as a real mount point — cp, dd, and du behave normally on it; state is rebuilt from the journal after a simulated power cut.",
    },
  },
  "realtime-sketch": {
    name: "Draw & Guess",
    tagline:
      "Real-time multiplayer game (Rust/Axum + WebSocket): one room = one isolated task, leaderboard persisted and load-tested.",
    story: {
      probleme:
        "A real-time multiplayer game needs to isolate each game room so the load from one doesn't slow down the others.",
      decision:
        "Rust/Axum and WebSocket with a dedicated Tokio task per room, and decreasing scoring based on how fast the right answer comes in.",
      preuve:
        "Leaderboard persisted to the database, and rooms tested under simultaneous load with no measurable interference between them.",
    },
  },
  "neural-net-from-scratch": {
    tagline:
      "Multilayer perceptron in pure NumPy, backpropagation derived by hand and verified by gradient checking.",
    story: {
      probleme:
        "A hand-coded backpropagation can look like it works — the loss goes down — while actually computing the wrong gradient.",
      decision:
        "Multilayer perceptron implemented in pure NumPy, with backpropagation derived by hand rather than a framework that would hide a computation error.",
      preuve:
        "Gradient verified numerically by finite differences, layer by layer, before any real training.",
    },
  },
  "ecommerce-platform": {
    tagline:
      "E-commerce platform (Node/Express): atomic overselling prevention validated under concurrency, idempotent Stripe webhooks.",
    story: {
      probleme:
        "A naive e-commerce cart allows overselling as soon as two concurrent purchases target the same limited stock.",
      decision:
        "Atomic stock decrement at the database level rather than in application memory, payment via Stripe Checkout, and idempotent webhook handling.",
      preuve:
        "Tested under concurrent requests on limited stock — no overselling observed; replaying the same Stripe webhook never triggers double processing.",
    },
  },
  "auth-system": {
    tagline:
      "Authentication system (Rust/Axum): Argon2id, short-lived JWTs, refresh tokens with rotation and replay detection.",
  },
  "self-healing-docs": {
    tagline:
      "Tool that detects code/documentation drift via AST analysis and automatically repairs the affected sections.",
  },
  "failure-forensics": {
    tagline:
      "Post-mortem diagnostics for an inference pipeline: regression detection via statistical testing, Prometheus export, Grafana dashboard.",
  },
  "llm-cost-autopilot": {
    tagline:
      "LLM request router (Rust): complexity estimation with no network call, daily budget, adaptive circuit breaker per route.",
  },
  "model-regression-detection": {
    tagline:
      "Drift and regression detection for models in production, with a clear-cut verdict from statistical testing.",
    story: {
      probleme:
        "A model in production can degrade silently — no exception is raised when prediction quality drops.",
      decision:
        "Combined detection of input data drift and performance regression, with a clear-cut verdict from statistical testing rather than a hand-picked arbitrary threshold.",
      preuve:
        "Verdict validated on datasets with known injected drift, correctly distinguishing benign drift from a real performance regression.",
    },
  },
  "trading-dashboard": {
    tagline:
      "Simulated portfolio tracking and technical indicators (SMA/EMA/RSI) — no real orders, no financial advice.",
  },
  "face-verification": {
    tagline:
      "1:1 face verification on a closed, consented gallery, with a siamese network trained using contrastive loss.",
  },
  "hand-gesture-recognition": {
    tagline:
      "Recognition of 8 isolated hand gestures from MediaPipe landmarks, with an MLP classifier trained on synthetic data.",
  },
  "gis-explorer": {
    tagline:
      "Geographic information system in pure Python: dependency-free geometry, spatial queries, Leaflet viewer.",
  },
  "digital-footprint-audit": {
    tagline:
      "Audit of your own digital footprint: username availability checks, compromised-password lookup via k-anonymity, WHOIS lookup.",
  },
  "face-blur-identity-protection": {
    tagline:
      "Privacy tool: face anonymization via blur, pixelation, or masking, with injectable and testable geometric detection.",
  },
  "thermal-camera-sim": {
    tagline:
      "Simulated thermal camera: IR palettes, gaussian blur, auto contrast, hottest-point detection.",
  },
  "gravity-simulation": {
    tagline:
      "N-body engine in Rust: swappable integrators, presets (solar system, binary, Chenciner–Montgomery figure-eight).",
  },
  "double-pendulum": {
    tagline:
      "Double pendulum simulation: Hamilton's equations, symplectic integrator, chaos analysis via the Lyapunov exponent.",
  },
  "solar-system": {
    tagline: "3D solar system in the browser: bloom, shaders, HD textures, chase camera.",
  },
  "weather-live-board": {
    tagline:
      "Live board of simulated weather/field readings, WebSocket broadcast per zone, real-time presence.",
  },
  "music-player": {
    tagline:
      "Desktop audio player (Rust/Tauri): local library, queue, persisted playlists, custom 3-band equalizer.",
  },
  "task-manager-app": {
    tagline: "Kanban task manager: columns, native drag & drop, tags, subtasks, comments.",
  },
  "expense-tracker": {
    tagline:
      "Expense tracker: monthly budgets by category, recurring transactions, hand-built SVG dashboard.",
  },
  "reading-tracker": {
    tagline:
      "Manga/manhwa/manhua/novel catalog (100% AniList): personal library, similarity-based recommendations.",
  },
  "poem-generator": {
    tagline: "Bilingual FR/EN poem generator: custom engine by default, optional LLM upgrade.",
  },
  "price-tracker-bot": {
    tagline:
      "Price tracking bot: scraping via generic CSS selectors, versioned history, cron running in production via GitHub Actions.",
  },
  "manga-quoting": {
    tagline:
      "Manga quotes: paper/ink design, accent-insensitive search, share image per quote, public REST API. Rewritten from Django to Next.js.",
  },
  "movie-catalog-web": {
    tagline: "Movie/show catalog with likes and personalized recommendations, no backend or API key.",
  },
  "movie-recommender": {
    tagline: "CLI for random movie recommendations via the TMDB API, with a keyless demo mode.",
  },
  "pixel-art-editor": {
    tagline: "Browser-based pixel art editor: layers × frames, animation with preview, per-stroke undo/redo.",
  },
  "socket-messenger": {
    tagline: "Low-level network messenger: multi-client TCP server, JSON Lines protocol, UDP broadcast discovery.",
  },
  "connect-four": {
    name: "Connect Four",
    tagline: "Connect Four with a minimax (alpha-beta) AI and an online 2-player mode over TCP sockets.",
  },
  "snake-clone": {
    tagline: "Classic Snake with a persistent best score, written to disk atomically.",
  },
  "typing-speedtest": {
    tagline: "Lightweight typing speed test, with reinforced keyboard accessibility.",
  },
  "ascii-camera": {
    tagline: "Live webcam-to-ASCII-art conversion: color rendering, video export, automatic contrast.",
  },
};

export function localizeProjects(lang: Lang): Project[] {
  if (lang === "fr") return projects;
  return projects.map((p) => {
    const override = EN[p.slug];
    if (!override) return p;
    return {
      ...p,
      name: override.name ?? p.name,
      tagline: override.tagline,
      story: override.story ?? p.story,
    };
  });
}

export function localizeProject(slug: string, lang: Lang): Project | undefined {
  return localizeProjects(lang).find((p) => p.slug === slug);
}
