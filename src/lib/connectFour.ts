// Puissance 4 : logique de plateau (pure, testable sans DOM) + IA minimax
// avec élagage alpha-bêta. Réimplémentation native (TypeScript) du principe
// du projet Connect-4 (Python/Pygame, voir Playground.tsx) — pas un portage
// du code original : l'IA est réécrite ici, profondeur limitée pour rester
// réactive dans le navigateur (roadmap p4-i2). Le mode réseau (sockets TCP)
// de l'original n'est pas repris : le second mode ici est un 2-joueurs
// local sur le même appareil — différence assumée et annoncée à
// l'utilisateur (caption du composant).

export const ROWS = 6;
export const COLS = 7;

export type Player = "red" | "yellow";
export type Cell = Player | null;
export type Board = Cell[][]; // board[row][col], row 0 = rangée du haut

export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

export function otherPlayer(p: Player): Player {
  return p === "red" ? "yellow" : "red";
}

export function isColumnFull(board: Board, col: number): boolean {
  return board[0][col] !== null;
}

export function validColumns(board: Board): number[] {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) if (!isColumnFull(board, c)) cols.push(c);
  return cols;
}

// Nouveau plateau (immutabilité) avec le pion posé dans la colonne donnée, à
// la ligne libre la plus basse — ou `null` si la colonne est pleine.
export function dropDisc(board: Board, col: number, player: Player): Board | null {
  if (col < 0 || col >= COLS || isColumnFull(board, col)) return null;
  let targetRow = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      targetRow = r;
      break;
    }
  }
  if (targetRow === -1) return null;
  const next = board.map((row) => row.slice());
  next[targetRow][col] = player;
  return next;
}

const DIRECTIONS: [number, number][] = [
  [0, 1], // horizontale
  [1, 0], // verticale
  [1, 1], // diagonale \
  [1, -1], // diagonale /
];

export function checkWinner(board: Board): Player | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      for (const [dr, dc] of DIRECTIONS) {
        let aligned = true;
        for (let i = 1; i < 4; i++) {
          const rr = r + dr * i;
          const cc = c + dc * i;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== cell) {
            aligned = false;
            break;
          }
        }
        if (aligned) return cell;
      }
    }
  }
  return null;
}

export type Cell2 = [row: number, col: number];

// Les quatre cases de l'alignement gagnant, pour les mettre en évidence.
// Même parcours que checkWinner : le premier alignement trouvé est renvoyé.
export function findWinningLine(board: Board): Cell2[] | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      for (const [dr, dc] of DIRECTIONS) {
        const line: Cell2[] = [[r, c]];
        for (let i = 1; i < 4; i++) {
          const rr = r + dr * i;
          const cc = c + dc * i;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== cell) break;
          line.push([rr, cc]);
        }
        if (line.length === 4) return line;
      }
    }
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== null);
}

function scoreWindow(cells: Cell[], player: Player): number {
  const opponent = otherPlayer(player);
  const mine = cells.filter((c) => c === player).length;
  const theirs = cells.filter((c) => c === opponent).length;
  const empty = cells.filter((c) => c === null).length;

  if (mine === 4) return 1000;
  if (mine === 3 && empty === 1) return 8;
  if (mine === 2 && empty === 2) return 3;
  if (theirs === 3 && empty === 1) return -80; // bloquer une menace immédiate prime sur attaquer
  return 0;
}

// Heuristique utilisée uniquement aux nœuds non terminaux (limite de
// profondeur atteinte) — jamais pour décider d'une victoire/défaite réelle,
// toujours vérifiée par checkWinner d'abord.
function evaluateBoard(board: Board, player: Player): number {
  let score = 0;

  const centerCol = Math.floor(COLS / 2);
  const centerCount = board.reduce(
    (sum, row) => sum + (row[centerCol] === player ? 1 : 0),
    0,
  );
  score += centerCount * 3;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of DIRECTIONS) {
        const cells: Cell[] = [];
        for (let i = 0; i < 4; i++) {
          const rr = r + dr * i;
          const cc = c + dc * i;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) {
            cells.length = 0;
            break;
          }
          cells.push(board[rr][cc]);
        }
        if (cells.length === 4) score += scoreWindow(cells, player);
      }
    }
  }
  return score;
}

interface MinimaxResult {
  column: number | null;
  score: number;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayer: Player,
): MinimaxResult {
  const winner = checkWinner(board);
  if (winner === aiPlayer) return { column: null, score: 1_000_000 + depth };
  if (winner === otherPlayer(aiPlayer)) return { column: null, score: -1_000_000 - depth };

  const cols = validColumns(board);
  if (cols.length === 0) return { column: null, score: 0 };
  if (depth === 0) return { column: null, score: evaluateBoard(board, aiPlayer) };

  // Colonnes centrales explorées en premier : améliore l'élagage alpha-bêta
  // (de meilleurs coups trouvés plus tôt coupent plus de branches) sans
  // changer le résultat final.
  const center = Math.floor(COLS / 2);
  const ordered = [...cols].sort((a, b) => Math.abs(a - center) - Math.abs(b - center));

  let bestCol = ordered[0];
  const turnPlayer = maximizing ? aiPlayer : otherPlayer(aiPlayer);

  if (maximizing) {
    let value = -Infinity;
    for (const col of ordered) {
      const next = dropDisc(board, col, turnPlayer);
      if (!next) continue;
      const result = minimax(next, depth - 1, alpha, beta, false, aiPlayer);
      if (result.score > value) {
        value = result.score;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return { column: bestCol, score: value };
  }

  let value = Infinity;
  for (const col of ordered) {
    const next = dropDisc(board, col, turnPlayer);
    if (!next) continue;
    const result = minimax(next, depth - 1, alpha, beta, true, aiPlayer);
    if (result.score < value) {
      value = result.score;
      bestCol = col;
    }
    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }
  return { column: bestCol, score: value };
}

// Profondeur 5 par défaut : assez fort pour bloquer les menaces immédiates
// et enchaîner une attaque à deux coups, tout en restant réactif (quelques
// dizaines à quelques centaines de ms) dans le thread principal du
// navigateur grâce à l'élagage alpha-bêta et au tri centre-first.
//
// `blunderRate` (0 à 1) : probabilité de jouer une colonne au hasard plutôt
// que le meilleur coup — sert à régler un niveau facile sans réécrire l'IA.
export function bestMove(
  board: Board,
  aiPlayer: Player,
  depth = 5,
  blunderRate = 0,
  rng: () => number = Math.random,
): number | null {
  const cols = validColumns(board);
  if (cols.length === 0) return null;
  if (blunderRate > 0 && rng() < blunderRate) return cols[Math.floor(rng() * cols.length)];
  const result = minimax(board, depth, -Infinity, Infinity, true, aiPlayer);
  return result.column ?? cols[0];
}
