// Logique pure de Snake (déplacement sur grille), indépendante du rendu —
// même approche que doublePendulum.ts : testable sans canvas ni DOM.
// Réimplémentation native (React/canvas) du principe du projet Snake Clone
// (Python/Pygame, voir Playground.tsx) : pas un portage du code original,
// mais la même mécanique de jeu — grille, croissance en mangeant, collision
// avec les bords ou soi-même.

export interface Point {
  x: number;
  y: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface SnakeState {
  snake: Point[]; // tête en premier
  direction: Direction;
  // Direction demandée par le joueur, appliquée au prochain step() — separée
  // de `direction` pour qu'un appui répété entre deux ticks ne fasse jamais
  // faire un demi-tour direct au serpent (voir changeDirection).
  pendingDirection: Direction;
  food: Point;
  alive: boolean;
  score: number;
}

const DELTAS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(
  gridSize: number,
  rng: () => number = Math.random,
): SnakeState {
  const mid = Math.floor(gridSize / 2);
  const snake: Point[] = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  return {
    snake,
    direction: "right",
    pendingDirection: "right",
    food: placeFood(snake, gridSize, rng),
    alive: true,
    score: 0,
  };
}

export function placeFood(
  snake: Point[],
  gridSize: number,
  rng: () => number = Math.random,
): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const free: Point[] = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  // Grille pleine (victoire théorique) : ne devrait jamais arriver en
  // pratique sur une grille de taille normale, mais évite un crash.
  if (free.length === 0) return snake[0];
  return free[Math.floor(rng() * free.length)];
}

// N'accepte le changement de direction que s'il n'est pas l'opposé exact de
// la direction en cours (pas seulement de la dernière touche pressée) —
// sinon deux appuis rapides avant le prochain step() feraient percuter au
// serpent sa propre deuxième cellule.
export function changeDirection(state: SnakeState, next: Direction): SnakeState {
  if (OPPOSITE[state.direction] === next) return state;
  return { ...state, pendingDirection: next };
}

// `wrap` : en mode traversée, sortir par un bord fait réapparaître le serpent
// du côté opposé ; seule la collision avec soi-même reste mortelle.
export function step(
  state: SnakeState,
  gridSize: number,
  rng: () => number = Math.random,
  wrap = false,
): SnakeState {
  if (!state.alive) return state;

  const direction = state.pendingDirection;
  const delta = DELTAS[direction];
  const head = state.snake[0];
  const rawHead: Point = { x: head.x + delta.x, y: head.y + delta.y };
  const nextHead: Point = wrap
    ? { x: (rawHead.x + gridSize) % gridSize, y: (rawHead.y + gridSize) % gridSize }
    : rawHead;

  const hitsWall =
    !wrap && (nextHead.x < 0 || nextHead.x >= gridSize || nextHead.y < 0 || nextHead.y >= gridSize);
  const ateFood = !hitsWall && nextHead.x === state.food.x && nextHead.y === state.food.y;

  // La queue (dernière cellule) se libère au même tick, sauf en cas de
  // repas : sans cette exception, le serpent ne pourrait jamais repasser
  // sur l'emplacement que sa propre queue vient de quitter.
  const bodyWithoutTail = state.snake.slice(0, -1);
  const collisionBody = ateFood ? state.snake : bodyWithoutTail;
  const hitsSelf =
    !hitsWall && collisionBody.some((seg) => seg.x === nextHead.x && seg.y === nextHead.y);

  if (hitsWall || hitsSelf) {
    return { ...state, direction, alive: false };
  }

  const newSnake = [nextHead, ...(ateFood ? state.snake : bodyWithoutTail)];

  return {
    ...state,
    snake: newSnake,
    direction,
    food: ateFood ? placeFood(newSnake, gridSize, rng) : state.food,
    score: ateFood ? state.score + 1 : state.score,
  };
}
