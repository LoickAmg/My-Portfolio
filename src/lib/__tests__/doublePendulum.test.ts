import { describe, expect, it } from "vitest";
import {
  pendulumEnergy,
  pendulumPositions,
  stepPendulum,
  type PendulumParams,
  type PendulumState,
} from "../doublePendulum";

const params: PendulumParams = { L1: 1, L2: 1, m1: 1, m2: 1, g: 9.81 };

describe("doublePendulum", () => {
  it("conserve l'énergie mécanique sur de nombreux petits pas (RK4)", () => {
    let state: PendulumState = {
      theta1: Math.PI / 2,
      theta2: Math.PI / 2,
      omega1: 0,
      omega2: 0,
    };
    const e0 = pendulumEnergy(state, params);
    const dt = 1 / 240;

    for (let i = 0; i < 2000; i++) {
      state = stepPendulum(state, params, dt);
    }

    const e1 = pendulumEnergy(state, params);
    // Tolérance large mais non triviale : une erreur de signe dans les
    // équations ferait diverger l'énergie de plusieurs ordres de grandeur
    // sur 2000 pas, pas de quelques millièmes.
    expect(Math.abs(e1 - e0)).toBeLessThan(Math.abs(e0) * 0.01 + 0.01);
  });

  it("reste immobile à l'équilibre stable (angles nuls, vitesses nulles)", () => {
    const state: PendulumState = { theta1: 0, theta2: 0, omega1: 0, omega2: 0 };
    const next = stepPendulum(state, params, 1 / 60);
    expect(next.theta1).toBeCloseTo(0, 10);
    expect(next.theta2).toBeCloseTo(0, 10);
    expect(next.omega1).toBeCloseTo(0, 10);
    expect(next.omega2).toBeCloseTo(0, 10);
  });

  it("calcule les positions cartésiennes attendues pour des angles simples", () => {
    const state: PendulumState = { theta1: 0, theta2: 0, omega1: 0, omega2: 0 };
    const { x1, y1, x2, y2 } = pendulumPositions(state, params);
    expect(x1).toBeCloseTo(0);
    expect(y1).toBeCloseTo(1);
    expect(x2).toBeCloseTo(0);
    expect(y2).toBeCloseTo(2);
  });

  it("bascule dès qu'un angle initial non nul est donné (pas d'équilibre instable figé)", () => {
    let state: PendulumState = {
      theta1: 0.4,
      theta2: 0,
      omega1: 0,
      omega2: 0,
    };
    for (let i = 0; i < 30; i++) {
      state = stepPendulum(state, params, 1 / 60);
    }
    expect(state.theta1).not.toBeCloseTo(0.4, 5);
  });
});
