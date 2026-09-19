import { describe, expect, it } from "vitest";
import {
  applyGradients,
  computeGradients,
  countParameters,
  createNetwork,
  evaluate,
  trainEpoch,
  type Network,
  type Sample,
} from "../neuralNet";
import { createRng } from "../random";
import { DATASET_IDS, generateDataset } from "../datasets";

function lossOf(net: Network, samples: Sample[]): number {
  return evaluate(net, samples).loss;
}

describe("neuralNet — rétropropagation", () => {
  it("gradient analytique égal à la dérivée numérique (gradient checking, tanh)", () => {
    const rng = createRng(7);
    const net = createNetwork([2, 4, 3, 1], "tanh", rng);
    const samples = generateDataset("circles", 12, 0.05, rng);
    const analytic = computeGradients(net, samples);
    const h = 1e-5;

    let worstRelativeError = 0;
    net.layers.forEach((layer, l) => {
      layer.weights.forEach((row, o) => {
        row.forEach((original, i) => {
          row[i] = original + h;
          const plus = lossOf(net, samples);
          row[i] = original - h;
          const minus = lossOf(net, samples);
          row[i] = original;

          const numeric = (plus - minus) / (2 * h);
          const exact = analytic.weights[l][o][i];
          const scale = Math.max(Math.abs(numeric) + Math.abs(exact), 1e-8);
          worstRelativeError = Math.max(worstRelativeError, Math.abs(numeric - exact) / scale);
        });
      });
    });

    expect(worstRelativeError).toBeLessThan(1e-6);
  });

  it("gradient checking sur les biais", () => {
    const rng = createRng(11);
    const net = createNetwork([2, 3, 1], "tanh", rng);
    const samples = generateDataset("xor", 10, 0.05, rng);
    const analytic = computeGradients(net, samples);
    const h = 1e-5;

    net.layers.forEach((layer, l) => {
      layer.biases.forEach((original, o) => {
        layer.biases[o] = original + h;
        const plus = lossOf(net, samples);
        layer.biases[o] = original - h;
        const minus = lossOf(net, samples);
        layer.biases[o] = original;
        expect(analytic.biases[l][o]).toBeCloseTo((plus - minus) / (2 * h), 6);
      });
    });
  });

  it("un pas de descente de gradient fait baisser la perte", () => {
    const rng = createRng(3);
    const net = createNetwork([2, 5, 1], "relu", rng);
    const samples = generateDataset("moons", 60, 0.05, rng);
    const before = lossOf(net, samples);
    applyGradients(net, computeGradients(net, samples), 0.05);
    expect(lossOf(net, samples)).toBeLessThan(before);
  });

  it("apprend le XOR, qu'aucune droite ne sépare", () => {
    const rng = createRng(1);
    const net = createNetwork([2, 4, 1], "tanh", rng);
    const samples = generateDataset("xor", 200, 0, rng);
    for (let epoch = 0; epoch < 400; epoch++) trainEpoch(net, samples, 0.3, 20, rng);
    expect(evaluate(net, samples).accuracy).toBeGreaterThan(0.95);
  });

  it("compte les paramètres : poids et biais de chaque couche", () => {
    const net = createNetwork([2, 4, 1], "tanh", createRng(1));
    expect(countParameters(net)).toBe(2 * 4 + 4 + 4 * 1 + 1);
  });
});

describe("datasets", () => {
  it.each(DATASET_IDS)("%s : nombre de points, étiquettes équilibrées, valeurs finies", (id) => {
    const samples = generateDataset(id, 100, 0.05, createRng(5));
    expect(samples).toHaveLength(100);
    const positives = samples.filter((s) => s.label === 1).length;
    expect(positives).toBeGreaterThan(30);
    expect(positives).toBeLessThan(70);
    expect(samples.every((s) => Number.isFinite(s.x) && Number.isFinite(s.y))).toBe(true);
  });

  it("est déterministe pour une même graine", () => {
    const a = generateDataset("spiral", 50, 0.1, createRng(42));
    const b = generateDataset("spiral", 50, 0.1, createRng(42));
    expect(a).toEqual(b);
  });
});
