// Jeux de données 2D pour la classification binaire, dans le carré
// [-1, 1]². Générés à partir d'un générateur déterministe : une même graine
// redonne exactement les mêmes points.

import { gaussian } from "./random";
import type { Sample } from "./neuralNet";

export type DatasetId = "xor" | "circles" | "moons" | "spiral";

export const DATASET_IDS: DatasetId[] = ["xor", "circles", "moons", "spiral"];

function jitter(rng: () => number, noise: number): number {
  return gaussian(rng) * noise;
}

export function generateDataset(id: DatasetId, count: number, noise: number, rng: () => number): Sample[] {
  const samples: Sample[] = [];
  const half = Math.floor(count / 2);

  switch (id) {
    case "xor":
      for (let i = 0; i < count; i++) {
        const x = rng() * 2 - 1;
        const y = rng() * 2 - 1;
        samples.push({ x: x + jitter(rng, noise), y: y + jitter(rng, noise), label: x > 0 !== y > 0 ? 1 : 0 });
      }
      break;

    case "circles":
      for (let i = 0; i < count; i++) {
        const inner = i < half;
        const radius = inner ? 0.35 : 0.8;
        const angle = rng() * Math.PI * 2;
        samples.push({
          x: Math.cos(angle) * radius + jitter(rng, noise),
          y: Math.sin(angle) * radius + jitter(rng, noise),
          label: inner ? 1 : 0,
        });
      }
      break;

    case "moons":
      for (let i = 0; i < count; i++) {
        const upper = i < half;
        const angle = rng() * Math.PI;
        const x = upper ? Math.cos(angle) : 1 - Math.cos(angle);
        const y = upper ? Math.sin(angle) : 0.5 - Math.sin(angle);
        samples.push({
          x: (x - 0.5) * 0.9 + jitter(rng, noise),
          y: (y - 0.25) * 0.9 + jitter(rng, noise),
          label: upper ? 1 : 0,
        });
      }
      break;

    case "spiral":
      for (let i = 0; i < count; i++) {
        const arm = i < half ? 0 : 1;
        const t = ((i % Math.max(half, 1)) / Math.max(half, 1)) * 1.6 + 0.15;
        const angle = t * Math.PI * 1.6 + arm * Math.PI;
        samples.push({
          x: Math.cos(angle) * t * 0.6 + jitter(rng, noise),
          y: Math.sin(angle) * t * 0.6 + jitter(rng, noise),
          label: arm === 0 ? 1 : 0,
        });
      }
      break;
  }

  return samples;
}
