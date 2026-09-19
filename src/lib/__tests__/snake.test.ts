import { describe, expect, it } from "vitest";
import { changeDirection, createInitialState, placeFood, step } from "../snake";

const GRID = 10;

describe("snake", () => {
  it("démarre avec un serpent de longueur 3, vivant, score 0", () => {
    const state = createInitialState(GRID, () => 0);
    expect(state.snake).toHaveLength(3);
    expect(state.alive).toBe(true);
    expect(state.score).toBe(0);
    expect(state.direction).toBe("right");
  });

  it("place la nourriture sur une case libre (jamais sur le serpent)", () => {
    const state = createInitialState(GRID, () => 0.999999);
    const onSnake = state.snake.some(
      (seg) => seg.x === state.food.x && seg.y === state.food.y,
    );
    expect(onSnake).toBe(false);
  });

  it("avance la tête d'une case dans la direction courante", () => {
    const state = createInitialState(GRID, () => 0);
    const head = state.snake[0];
    const next = step({ ...state, food: { x: -1, y: -1 } }, GRID);
    expect(next.snake[0]).toEqual({ x: head.x + 1, y: head.y });
    expect(next.snake).toHaveLength(3); // pas de nourriture mangée : longueur inchangée
  });

  it("grandit et incrémente le score en mangeant la nourriture", () => {
    const state = createInitialState(GRID, () => 0);
    const head = state.snake[0];
    const withFoodAhead = { ...state, food: { x: head.x + 1, y: head.y } };
    const next = step(withFoodAhead, GRID, () => 0);
    expect(next.snake).toHaveLength(4);
    expect(next.score).toBe(1);
    // La nouvelle nourriture ne doit jamais réapparaître sur le serpent.
    const onSnake = next.snake.some(
      (seg) => seg.x === next.food.x && seg.y === next.food.y,
    );
    expect(onSnake).toBe(false);
  });

  it("meurt en percutant un mur", () => {
    const state = createInitialState(GRID, () => 0);
    const atEdge = {
      ...state,
      snake: [
        { x: GRID - 1, y: 0 },
        { x: GRID - 2, y: 0 },
        { x: GRID - 3, y: 0 },
      ],
      food: { x: 0, y: 5 },
    };
    const next = step(atEdge, GRID);
    expect(next.alive).toBe(false);
  });

  it("meurt en percutant son propre corps (pas la queue, qui se libère au même tick)", () => {
    // Serpent replié en boucle carrée : la tête va percuter le deuxième
    // segment, pas la queue (qui se libère ce tick-là et n'est donc pas un
    // obstacle — voir le commentaire sur bodyWithoutTail dans step()).
    const state = createInitialState(GRID, () => 0);
    const curled = {
      ...state,
      direction: "right" as const,
      pendingDirection: "down" as const,
      snake: [
        { x: 3, y: 3 }, // tête
        { x: 3, y: 4 },
        { x: 2, y: 4 },
        { x: 2, y: 3 }, // queue — se libère ce tick, n'est pas un obstacle
      ],
      food: { x: 0, y: 0 },
    };
    const next = step(curled, GRID);
    expect(next.alive).toBe(false);
  });

  it("peut avancer sur la case que sa queue vient de libérer, sans mourir", () => {
    // Même boucle que le test précédent, mais en tournant dans l'autre sens
    // : la tête avance vers la case tout juste libérée par la queue — un
    // mouvement parfaitement valide au Snake classique.
    const state = createInitialState(GRID, () => 0);
    const curled = {
      ...state,
      direction: "up" as const,
      pendingDirection: "left" as const,
      snake: [
        { x: 3, y: 3 }, // tête
        { x: 3, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 3 }, // queue, sur la case où la tête va se déplacer
      ],
      food: { x: 9, y: 9 },
    };
    const next = step(curled, GRID);
    expect(next.alive).toBe(true);
    expect(next.snake[0]).toEqual({ x: 2, y: 3 });
  });

  it("refuse un demi-tour direct mais accepte un virage à angle droit", () => {
    const state = createInitialState(GRID, () => 0); // direction: right
    const reversed = changeDirection(state, "left");
    expect(reversed.pendingDirection).toBe("right"); // refusé, inchangé

    const turned = changeDirection(state, "up");
    expect(turned.pendingDirection).toBe("up"); // accepté
  });

  it("placeFood ne choisit jamais une case occupée", () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ];
    for (let i = 0; i < 20; i++) {
      const food = placeFood(snake, 3, () => i / 20);
      const onSnake = snake.some((s) => s.x === food.x && s.y === food.y);
      expect(onSnake).toBe(false);
    }
  });

  it("en mode traversée, sortir par la droite réapparaît à gauche sans mourir", () => {
    const state = createInitialState(GRID);
    const atRightEdge = {
      ...state,
      snake: [
        { x: GRID - 1, y: 4 },
        { x: GRID - 2, y: 4 },
        { x: GRID - 3, y: 4 },
      ],
      food: { x: -1, y: -1 },
    };
    const next = step(atRightEdge, GRID, Math.random, true);
    expect(next.alive).toBe(true);
    expect(next.snake[0]).toEqual({ x: 0, y: 4 });
  });

  it("en mode traversée, mourir en se mordant reste possible", () => {
    const state = createInitialState(GRID);
    const curled = {
      ...state,
      direction: "up" as const,
      pendingDirection: "left" as const,
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 4 },
      ],
      food: { x: -1, y: -1 },
    };
    expect(step(curled, GRID, Math.random, true).alive).toBe(false);
  });
});
