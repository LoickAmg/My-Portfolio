// Double pendule — mêmes équations du mouvement que le projet Double
// Pendulum (Lagrangien à deux masses ponctuelles), réimplémentées ici en
// TypeScript pur pour tourner côté client dans le Playground (roadmap
// p4-i1). Ce n'est pas un portage du code Python original : les formules
// sont dérivées indépendamment, mais décrivent exactement le même système
// physique — d'où le test de conservation de l'énergie ci-dessous, qui
// sert de garde-fou contre une erreur de signe ou de facteur.

export interface PendulumParams {
  L1: number;
  L2: number;
  m1: number;
  m2: number;
  g: number;
}

export interface PendulumState {
  theta1: number;
  theta2: number;
  omega1: number;
  omega2: number;
}

function derivatives(state: PendulumState, p: PendulumParams): PendulumState {
  const { theta1, theta2, omega1, omega2 } = state;
  const { L1, L2, m1, m2, g } = p;
  const delta = theta1 - theta2;
  const cosDelta = Math.cos(delta);
  const sinDelta = Math.sin(delta);

  const den1 = L1 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));
  const domega1 =
    (-g * (2 * m1 + m2) * Math.sin(theta1) -
      m2 * g * Math.sin(theta1 - 2 * theta2) -
      2 * sinDelta * m2 * (omega2 * omega2 * L2 + omega1 * omega1 * L1 * cosDelta)) /
    den1;

  const den2 = L2 * (2 * m1 + m2 - m2 * Math.cos(2 * delta));
  const domega2 =
    (2 *
      sinDelta *
      (omega1 * omega1 * L1 * (m1 + m2) +
        g * (m1 + m2) * Math.cos(theta1) +
        omega2 * omega2 * L2 * m2 * cosDelta)) /
    den2;

  return { theta1: omega1, theta2: omega2, omega1: domega1, omega2: domega2 };
}

function addScaled(a: PendulumState, b: PendulumState, h: number): PendulumState {
  return {
    theta1: a.theta1 + h * b.theta1,
    theta2: a.theta2 + h * b.theta2,
    omega1: a.omega1 + h * b.omega1,
    omega2: a.omega2 + h * b.omega2,
  };
}

// Intégration Runge-Kutta 4 : plus stable que l'Euler explicite pour un
// système chaotique comme celui-ci, dont l'énergie doit rester quasi
// constante sur de longues sessions d'interaction (rien ne l'injecte ni
// ne la dissipe dans le modèle).
export function stepPendulum(
  state: PendulumState,
  params: PendulumParams,
  dt: number,
): PendulumState {
  const k1 = derivatives(state, params);
  const k2 = derivatives(addScaled(state, k1, dt / 2), params);
  const k3 = derivatives(addScaled(state, k2, dt / 2), params);
  const k4 = derivatives(addScaled(state, k3, dt), params);

  return {
    theta1:
      state.theta1 + (dt / 6) * (k1.theta1 + 2 * k2.theta1 + 2 * k3.theta1 + k4.theta1),
    theta2:
      state.theta2 + (dt / 6) * (k1.theta2 + 2 * k2.theta2 + 2 * k3.theta2 + k4.theta2),
    omega1:
      state.omega1 + (dt / 6) * (k1.omega1 + 2 * k2.omega1 + 2 * k3.omega1 + k4.omega1),
    omega2:
      state.omega2 + (dt / 6) * (k1.omega2 + 2 * k2.omega2 + 2 * k3.omega2 + k4.omega2),
  };
}

// Positions cartésiennes des deux masses — pivot en (0,0), y positif vers
// le bas (convention écran).
export function pendulumPositions(state: PendulumState, params: PendulumParams) {
  const x1 = params.L1 * Math.sin(state.theta1);
  const y1 = params.L1 * Math.cos(state.theta1);
  const x2 = x1 + params.L2 * Math.sin(state.theta2);
  const y2 = y1 + params.L2 * Math.cos(state.theta2);
  return { x1, y1, x2, y2 };
}

// Énergie mécanique totale (cinétique + potentielle). Sert de test de
// non-régression : sans frottement ni apport externe dans ce modèle, elle
// doit rester quasi constante d'un pas à l'autre.
export function pendulumEnergy(state: PendulumState, params: PendulumParams): number {
  const { theta1, theta2, omega1, omega2 } = state;
  const { L1, L2, m1, m2, g } = params;
  const y1 = -L1 * Math.cos(theta1);
  const y2 = y1 - L2 * Math.cos(theta2);
  const v1sq = L1 * L1 * omega1 * omega1;
  const v2sq =
    L1 * L1 * omega1 * omega1 +
    L2 * L2 * omega2 * omega2 +
    2 * L1 * L2 * omega1 * omega2 * Math.cos(theta1 - theta2);
  const ke = 0.5 * m1 * v1sq + 0.5 * m2 * v2sq;
  const pe = m1 * g * y1 + m2 * g * y2;
  return ke + pe;
}
