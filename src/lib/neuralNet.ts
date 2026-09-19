// Perceptron multicouche pour la classification binaire, avec rétropropagation
// écrite à la main — même principe que le projet Neural Net (Python/NumPy,
// sans framework) : chaque couche calcule ses propres gradients par la règle
// de la chaîne. La justesse du calcul est prouvée dans les tests par
// « gradient checking » : le gradient analytique doit égaler une dérivée
// numérique par différences finies.

import { gaussian } from "./random";

export type Activation = "tanh" | "relu";

export interface Layer {
  weights: number[][]; // weights[sortie][entrée]
  biases: number[];
}

export interface Network {
  layers: Layer[];
  activation: Activation;
}

export interface Sample {
  x: number;
  y: number;
  label: 0 | 1;
}

export interface Gradients {
  weights: number[][][];
  biases: number[][];
  loss: number;
}

const EPSILON = 1e-12;

function activate(kind: Activation, z: number): number {
  return kind === "tanh" ? Math.tanh(z) : Math.max(0, z);
}

function activationDerivative(kind: Activation, z: number, a: number): number {
  return kind === "tanh" ? 1 - a * a : z > 0 ? 1 : 0;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

// `sizes` : [entrées, ...couches cachées, 1]. Initialisation de Xavier pour
// tanh, de He pour relu — évite des activations qui saturent ou meurent dès
// le premier pas.
export function createNetwork(sizes: number[], activation: Activation, rng: () => number): Network {
  const layers: Layer[] = [];
  for (let l = 1; l < sizes.length; l++) {
    const fanIn = sizes[l - 1];
    const scale = activation === "relu" ? Math.sqrt(2 / fanIn) : Math.sqrt(1 / fanIn);
    layers.push({
      weights: Array.from({ length: sizes[l] }, () => Array.from({ length: fanIn }, () => gaussian(rng) * scale)),
      biases: Array<number>(sizes[l]).fill(0),
    });
  }
  return { layers, activation };
}

interface ForwardTrace {
  activations: number[][]; // activations[0] = entrée, activations[l] = sortie de la couche l-1
  preActivations: number[][]; // preActivations[l] = pré-activation de la couche l
  probability: number;
}

function forwardTrace(net: Network, x: number, y: number): ForwardTrace {
  const activations: number[][] = [[x, y]];
  const preActivations: number[][] = [];
  let current = [x, y];
  const last = net.layers.length - 1;

  net.layers.forEach((layer, index) => {
    const z = layer.weights.map((row, o) => row.reduce((sum, w, i) => sum + w * current[i], layer.biases[o]));
    preActivations.push(z);
    current = index === last ? z.map(sigmoid) : z.map((value) => activate(net.activation, value));
    activations.push(current);
  });

  return { activations, preActivations, probability: current[0] };
}

export function predict(net: Network, x: number, y: number): number {
  return forwardTrace(net, x, y).probability;
}

function crossEntropy(p: number, label: number): number {
  const clamped = Math.min(Math.max(p, EPSILON), 1 - EPSILON);
  return -(label * Math.log(clamped) + (1 - label) * Math.log(1 - clamped));
}

export function evaluate(net: Network, samples: Sample[]): { loss: number; accuracy: number } {
  if (samples.length === 0) return { loss: 0, accuracy: 0 };
  let loss = 0;
  let correct = 0;
  for (const s of samples) {
    const p = predict(net, s.x, s.y);
    loss += crossEntropy(p, s.label);
    if ((p >= 0.5 ? 1 : 0) === s.label) correct++;
  }
  return { loss: loss / samples.length, accuracy: correct / samples.length };
}

// Gradients moyens de la perte (entropie croisée binaire) sur un lot. Avec
// une sortie sigmoïde, le gradient de la perte par rapport à la
// pré-activation de sortie se simplifie en (p − y).
export function computeGradients(net: Network, samples: Sample[]): Gradients {
  const weights = net.layers.map((layer) => layer.weights.map((row) => row.map(() => 0)));
  const biases = net.layers.map((layer) => layer.biases.map(() => 0));
  let loss = 0;

  for (const sample of samples) {
    const trace = forwardTrace(net, sample.x, sample.y);
    loss += crossEntropy(trace.probability, sample.label);

    let delta = [trace.probability - sample.label];
    for (let l = net.layers.length - 1; l >= 0; l--) {
      const input = trace.activations[l];
      delta.forEach((d, o) => {
        biases[l][o] += d;
        input.forEach((value, i) => {
          weights[l][o][i] += d * value;
        });
      });

      if (l > 0) {
        const pre = trace.preActivations[l - 1];
        const currentDelta = delta;
        delta = input.map((a, i) => {
          const propagated = currentDelta.reduce((sum, d, o) => sum + d * net.layers[l].weights[o][i], 0);
          return propagated * activationDerivative(net.activation, pre[i], a);
        });
      }
    }
  }

  const n = Math.max(samples.length, 1);
  for (const layer of weights) for (const row of layer) row.forEach((_, i) => (row[i] /= n));
  for (const layer of biases) layer.forEach((_, i) => (layer[i] /= n));
  return { weights, biases, loss: loss / n };
}

export function applyGradients(net: Network, grads: Gradients, learningRate: number): void {
  net.layers.forEach((layer, l) => {
    layer.weights.forEach((row, o) => {
      row.forEach((_, i) => {
        row[i] -= learningRate * grads.weights[l][o][i];
      });
      layer.biases[o] -= learningRate * grads.biases[l][o];
    });
  });
}

// Une époque = un passage sur tous les échantillons, par mini-lots mélangés.
// Renvoie la perte moyenne observée pendant l'époque.
export function trainEpoch(
  net: Network,
  samples: Sample[],
  learningRate: number,
  batchSize: number,
  rng: () => number,
): number {
  const order = samples.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  let totalLoss = 0;
  for (let start = 0; start < order.length; start += batchSize) {
    const batch = order.slice(start, start + batchSize).map((index) => samples[index]);
    const grads = computeGradients(net, batch);
    applyGradients(net, grads, learningRate);
    totalLoss += grads.loss * batch.length;
  }
  return totalLoss / samples.length;
}

export function countParameters(net: Network): number {
  return net.layers.reduce((sum, layer) => sum + layer.weights.length * layer.weights[0].length + layer.biases.length, 0);
}
