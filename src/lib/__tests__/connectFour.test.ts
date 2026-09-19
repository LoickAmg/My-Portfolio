import { describe, expect, it } from "vitest";
import {
  bestMove,
  findWinningLine,
  checkWinner,
  createEmptyBoard,
  dropDisc,
  isBoardFull,
  isColumnFull,
  ROWS,
  validColumns,
  type Board,
} from "../connectFour";

function boardFromRows(rows: string[]): Board {
  // "." = vide, "r" = rouge, "y" = jaune — une ligne par rangée, du haut vers le bas.
  return rows.map((row) =>
    row.split("").map((ch) => (ch === "r" ? "red" : ch === "y" ? "yellow" : null)),
  );
}

describe("connectFour — plateau", () => {
  it("crée un plateau vide 6x7", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(ROWS);
    expect(board.every((row) => row.every((c) => c === null))).toBe(true);
  });

  it("dropDisc place le pion à la ligne libre la plus basse", () => {
    const board = createEmptyBoard();
    const afterFirst = dropDisc(board, 3, "red")!;
    expect(afterFirst[ROWS - 1][3]).toBe("red");

    const afterSecond = dropDisc(afterFirst, 3, "yellow")!;
    expect(afterSecond[ROWS - 1][3]).toBe("red"); // inchangé
    expect(afterSecond[ROWS - 2][3]).toBe("yellow");
  });

  it("dropDisc renvoie null quand la colonne est pleine", () => {
    let board = createEmptyBoard();
    for (let i = 0; i < ROWS; i++) {
      board = dropDisc(board, 0, i % 2 === 0 ? "red" : "yellow")!;
    }
    expect(isColumnFull(board, 0)).toBe(true);
    expect(dropDisc(board, 0, "red")).toBeNull();
  });

  it("ne mute jamais le plateau passé en entrée (immutabilité)", () => {
    const board = createEmptyBoard();
    const snapshotBefore = JSON.stringify(board);
    dropDisc(board, 2, "red");
    expect(JSON.stringify(board)).toBe(snapshotBefore);
  });

  it("validColumns exclut les colonnes pleines", () => {
    let board = createEmptyBoard();
    for (let i = 0; i < ROWS; i++) {
      board = dropDisc(board, 5, i % 2 === 0 ? "red" : "yellow")!;
    }
    expect(validColumns(board)).not.toContain(5);
    expect(validColumns(board)).toHaveLength(6);
  });

  it("isBoardFull détecte un plateau complet", () => {
    let board = createEmptyBoard();
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < ROWS; r++) {
        board = dropDisc(board, c, "red")!;
      }
    }
    expect(isBoardFull(board)).toBe(true);
  });
});

describe("connectFour — détection de victoire", () => {
  it("détecte un alignement horizontal", () => {
    const board = boardFromRows([
      ".......",
      ".......",
      ".......",
      ".......",
      ".......",
      "..rrrr.",
    ]);
    expect(checkWinner(board)).toBe("red");
  });

  it("détecte un alignement vertical", () => {
    const board = boardFromRows([
      ".......",
      ".y.....",
      ".y.....",
      ".y.....",
      ".y.....",
      ".r.....",
    ]);
    expect(checkWinner(board)).toBe("yellow");
  });

  it("détecte une diagonale montante", () => {
    const board = boardFromRows([
      ".......",
      "....r..",
      "...r...",
      "..r....",
      ".r.....",
      ".......",
    ]);
    expect(checkWinner(board)).toBe("red");
  });

  it("ne déclare aucun gagnant sur un plateau vide ou sans alignement", () => {
    expect(checkWinner(createEmptyBoard())).toBeNull();
    const almost = boardFromRows([
      ".......",
      ".......",
      ".......",
      ".......",
      ".......",
      "..rrr..",
    ]);
    expect(checkWinner(almost)).toBeNull();
  });
});

describe("connectFour — IA minimax", () => {
  it("joue le coup gagnant immédiat s'il existe", () => {
    const board = boardFromRows([
      ".......",
      ".......",
      ".......",
      ".......",
      ".......",
      "yrrr...",
    ]);
    // Rouge peut gagner en jouant colonne 4 (rrrr sur la rangée du bas).
    const move = bestMove(board, "red", 4);
    expect(move).toBe(4);
  });

  it("bloque la menace immédiate de l'adversaire", () => {
    const board = boardFromRows([
      ".......",
      ".......",
      ".......",
      ".......",
      ".......",
      "rrr....",
    ]);
    // Rouge occupe les colonnes 0-1-2, contre le bord : la seule extension
    // possible est la colonne 3 (contrairement à un "three" ouvert des deux
    // côtés, qui n'a par définition aucun blocage possible). Jaune doit
    // jouer colonne 3.
    const move = bestMove(board, "yellow", 4);
    expect(move).toBe(3);
  });

  it("renvoie null sur un plateau plein", () => {
    let board = createEmptyBoard();
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < ROWS; r++) {
        board = dropDisc(board, c, (r + c) % 2 === 0 ? "red" : "yellow")!;
      }
    }
    expect(bestMove(board, "red")).toBeNull();
  });

  it("findWinningLine renvoie les quatre cases de l'alignement", () => {
    const board = boardFromRows([
      ".......",
      ".......",
      ".......",
      ".......",
      "y.y.y..",
      "rrrr...",
    ]);
    expect(findWinningLine(board)).toEqual([
      [5, 0],
      [5, 1],
      [5, 2],
      [5, 3],
    ]);
  });

  it("findWinningLine renvoie null sans alignement", () => {
    expect(findWinningLine(createEmptyBoard())).toBeNull();
  });

  it("un taux d'erreur de 1 joue toujours une colonne valide, choisie au hasard", () => {
    const board = createEmptyBoard();
    const move = bestMove(board, "red", 4, 1, () => 0.99);
    expect(move).toBe(6);
  });

  it("un taux d'erreur nul reste déterministe : bloque la menace immédiate", () => {
    const board = boardFromRows([
      ".......",
      ".......",
      ".......",
      ".......",
      "y......",
      "rrr....",
    ]);
    expect(bestMove(board, "yellow", 4, 0, () => 0)).toBe(3);
  });
});
