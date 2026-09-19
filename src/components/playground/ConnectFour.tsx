"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  bestMove,
  checkWinner,
  COLS,
  createEmptyBoard,
  dropDisc,
  findWinningLine,
  isBoardFull,
  ROWS,
  type Board,
  type Player,
} from "@/lib/connectFour";
import { useT } from "@/lib/i18n";
import { STORAGE_KEYS, readStored, writeStored } from "@/lib/storage";
import {
  Button,
  ButtonRow,
  ExperienceLayout,
  PanelSection,
  Readout,
  Readouts,
  Segmented,
  Status,
  Viewport,
} from "./kit/controls";
import { prefersReducedMotion, useCanvasFit, useFrameLoop, useThemeColors, useVisibleRef, type Palette } from "./kit/hooks";

type Mode = "vsAi" | "twoPlayers";
type Level = "easy" | "normal" | "hard";
type FirstMove = "human" | "ai";
type Tally = { wins: number; draws: number; losses: number };
type Tallies = Record<Level, Tally>;
interface Move {
  col: number;
  player: Player;
}

const FIRST_PLAYER: Player = "red";
const DROP_MS = 260;
const AI_DELAY_MS = 420;

// Profondeurs choisies d'après des mesures : 91 ms au pire à la profondeur 6,
// mais 617 ms à la 7, trop lourd pour le fil principal du navigateur.
const LEVELS: Record<Level, { depth: number; blunderRate: number }> = {
  easy: { depth: 2, blunderRate: 0.3 },
  normal: { depth: 4, blunderRate: 0.05 },
  hard: { depth: 6, blunderRate: 0 },
};

const EMPTY_TALLIES: Tallies = {
  easy: { wins: 0, draws: 0, losses: 0 },
  normal: { wins: 0, draws: 0, losses: 0 },
  hard: { wins: 0, draws: 0, losses: 0 },
};

function isTally(raw: unknown): raw is Tally {
  const candidate = raw as Partial<Tally> | null;
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    Number.isFinite(candidate.wins) &&
    Number.isFinite(candidate.draws) &&
    Number.isFinite(candidate.losses)
  );
}

function isTallies(raw: unknown): raw is Tallies {
  const candidate = raw as Partial<Tallies> | null;
  return typeof candidate === "object" && candidate !== null && isTally(candidate.easy) && isTally(candidate.normal) && isTally(candidate.hard);
}

function replay(moves: Move[]): Board {
  return moves.reduce<Board>((board, move) => dropDisc(board, move.col, move.player) ?? board, createEmptyBoard());
}

function landingRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) if (board[row][col] === null) return row;
  return -1;
}

interface DiscStyle {
  colors: Palette;
  radius: number;
}

// Joueur 1 : disque plein d'accent. Joueur 2 : anneau d'encre. Deux formes
// distinctes plutôt que deux teintes : lisibles quel que soit le thème, et
// pour les personnes qui ne distinguent pas certaines couleurs.
function drawDisc(ctx: CanvasRenderingContext2D, x: number, y: number, player: Player, style: DiscStyle, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(x, y, style.radius, 0, Math.PI * 2);
  if (player === FIRST_PLAYER) {
    ctx.fillStyle = style.colors.accent;
    ctx.fill();
  } else {
    ctx.lineWidth = style.radius * 0.28;
    ctx.strokeStyle = style.colors.ink;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export default function ConnectFour() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const dropRef = useRef<{ row: number; col: number; player: Player; start: number } | null>(null);
  const cursorRef = useRef(Math.floor(COLS / 2));
  const boardRef = useRef<Board>(createEmptyBoard());
  const playableRef = useRef(true);
  const winLineRef = useRef<ReturnType<typeof findWinningLine>>(null);
  const focusedRef = useRef(false);

  const palette = useThemeColors();
  const visible = useVisibleRef(viewportRef);
  const { t } = useT();
  const copy = t.playground.connectFour;

  const [mode, setMode] = useState<Mode>("vsAi");
  const [level, setLevel] = useState<Level>("normal");
  const [firstMove, setFirstMove] = useState<FirstMove>("human");
  const [moves, setMoves] = useState<Move[]>([]);
  const [tallies, setTallies] = useState<Tallies>(() => readStored(STORAGE_KEYS.connectFourTally, EMPTY_TALLIES, isTallies));

  const board = useMemo(() => replay(moves), [moves]);
  const winner = checkWinner(board);
  const isDraw = winner === null && isBoardFull(board);
  const gameOver = winner !== null || isDraw;
  const current: Player = moves.length % 2 === 0 ? FIRST_PLAYER : FIRST_PLAYER === "red" ? "yellow" : "red";
  const humanPlayer: Player = firstMove === "human" ? "red" : "yellow";
  const aiPlayer: Player = humanPlayer === "red" ? "yellow" : "red";
  const thinking = mode === "vsAi" && !gameOver && current === aiPlayer;
  const humanCanPlay = !gameOver && (mode === "twoPlayers" || current === humanPlayer);

  useEffect(() => {
    boardRef.current = board;
    winLineRef.current = findWinningLine(board);
    playableRef.current = humanCanPlay;
  }, [board, humanCanPlay]);

  const commitMove = useCallback((col: number, player: Player, currentBoard: Board) => {
    const row = landingRow(currentBoard, col);
    if (row < 0) return;
    dropRef.current = prefersReducedMotion() ? null : { row, col, player, start: performance.now() };
    setMoves((previous) => [...previous, { col, player }]);
  }, []);

  const recordResult = useCallback(
    (result: keyof Tally) => {
      setTallies((previous) => {
        const next = { ...previous, [level]: { ...previous[level], [result]: previous[level][result] + 1 } };
        writeStored(STORAGE_KEYS.connectFourTally, next);
        return next;
      });
    },
    [level],
  );

  // Résultat enregistré une seule fois, au moment où la partie se termine.
  const resultRecordedFor = useRef(-1);
  useEffect(() => {
    if (!gameOver || mode !== "vsAi" || resultRecordedFor.current === moves.length) return;
    resultRecordedFor.current = moves.length;
    recordResult(winner === null ? "draws" : winner === humanPlayer ? "wins" : "losses");
  }, [gameOver, mode, moves.length, winner, humanPlayer, recordResult]);

  useEffect(() => {
    if (!thinking) return;
    const timeout = window.setTimeout(() => {
      const settings = LEVELS[level];
      const col = bestMove(board, aiPlayer, settings.depth, settings.blunderRate);
      if (col !== null) commitMove(col, aiPlayer, board);
    }, AI_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [thinking, board, aiPlayer, level, commitMove]);

  const play = useCallback(
    (col: number) => {
      if (!humanCanPlay || dropRef.current) return;
      commitMove(col, current, board);
    },
    [humanCanPlay, board, current, commitMove],
  );

  const newGame = useCallback(() => {
    dropRef.current = null;
    resultRecordedFor.current = -1;
    setMoves([]);
    canvasRef.current?.focus({ preventScroll: true });
  }, []);

  const undo = useCallback(() => {
    if (moves.length === 0 || gameOver || thinking) return;
    dropRef.current = null;
    setMoves((previous) => {
      const trimmed = previous.slice(0, -1);
      const last = previous[previous.length - 1];
      if (mode === "vsAi" && last.player === aiPlayer && trimmed.length > 0) return trimmed.slice(0, -1);
      return trimmed;
    });
  }, [moves.length, gameOver, thinking, mode, aiPlayer]);

  const changeMode = useCallback(
    (next: Mode) => {
      setMode(next);
      newGame();
    },
    [newGame],
  );

  const changeFirstMove = useCallback(
    (next: FirstMove) => {
      setFirstMove(next);
      newGame();
    },
    [newGame],
  );

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const { width, height } = sizeRef.current;
      if (!canvas || !ctx || width === 0) return;

      const colors = palette.current;
      const rowsTotal = ROWS + 1;
      const cell = Math.min(width / COLS, height / rowsTotal);
      const offsetX = (width - cell * COLS) / 2;
      const offsetY = (height - cell * rowsTotal) / 2;
      const style: DiscStyle = { colors, radius: cell * 0.37 };
      const centerX = (col: number) => offsetX + (col + 0.5) * cell;
      const centerY = (row: number) => offsetY + (row + 1.5) * cell;
      const drop = dropRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colors.panelAlt;
      ctx.fillRect(offsetX, offsetY + cell, cell * COLS, cell * ROWS);

      if (playableRef.current && !drop) {
        drawDisc(ctx, centerX(cursorRef.current), offsetY + cell * 0.5, moves.length % 2 === 0 ? "red" : "yellow", style, 0.55);
      }

      let dropProgress = 1;
      if (drop) {
        dropProgress = Math.min((now - drop.start) / DROP_MS, 1);
        if (dropProgress >= 1) dropRef.current = null;
      }

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const owner = boardRef.current[r][c];
          if (owner === null) {
            ctx.beginPath();
            ctx.arc(centerX(c), centerY(r), style.radius, 0, Math.PI * 2);
            ctx.fillStyle = colors.ink12;
            ctx.fill();
            continue;
          }
          const falling = drop && drop.row === r && drop.col === c && dropProgress < 1;
          const y = falling ? centerY(-1) + (centerY(r) - centerY(-1)) * dropProgress * dropProgress : centerY(r);
          drawDisc(ctx, centerX(c), y, owner, style);
        }
      }

      const line = winLineRef.current;
      if (line && !dropRef.current) {
        const pulse = prefersReducedMotion() ? 1 : 0.65 + 0.35 * Math.sin(now / 220);
        ctx.globalAlpha = pulse;
        ctx.lineWidth = cell * 0.09;
        ctx.strokeStyle = colors.accent;
        ctx.lineCap = "round";
        ctx.beginPath();
        line.forEach(([r, c], index) => {
          if (index === 0) ctx.moveTo(centerX(c), centerY(r));
          else ctx.lineTo(centerX(c), centerY(r));
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      if (focusedRef.current) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX + cursorRef.current * cell + 2, offsetY + 2, cell - 4, cell - 4);
      }
    },
    [palette, moves.length],
  );

  useCanvasFit(canvasRef, (width, height) => {
    sizeRef.current = { width, height };
    draw(performance.now());
  });

  useFrameLoop(() => {
    if (visible.current) draw(performance.now());
  });

  const columnFromPointer = (clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return cursorRef.current;
    const rect = canvas.getBoundingClientRect();
    const cell = Math.min(rect.width / COLS, rect.height / (ROWS + 1));
    const offsetX = (rect.width - cell * COLS) / 2;
    return Math.max(0, Math.min(COLS - 1, Math.floor((clientX - rect.left - offsetX) / cell)));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const digit = /^(?:Digit|Numpad)([1-7])$/.exec(event.code);
    if (digit) {
      event.preventDefault();
      cursorRef.current = Number(digit[1]) - 1;
      play(cursorRef.current);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      cursorRef.current = Math.max(0, cursorRef.current - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      cursorRef.current = Math.min(COLS - 1, cursorRef.current + 1);
    } else if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      play(cursorRef.current);
    }
  };

  const status = (() => {
    if (winner) {
      if (mode === "twoPlayers") return winner === "red" ? copy.winP1 : copy.winP2;
      return winner === humanPlayer ? copy.winYou : copy.winAi;
    }
    if (isDraw) return copy.draw;
    if (thinking) return copy.thinking;
    if (mode === "vsAi") return copy.yourTurn;
    return current === "red" ? copy.turnP1 : copy.turnP2;
  })();

  const levelOptions = [
    { value: "easy" as const, label: copy.easy },
    { value: "normal" as const, label: copy.normal },
    { value: "hard" as const, label: copy.hard },
  ];
  const tally = tallies[level];

  return (
    <ExperienceLayout
      viewport={
        <Viewport ref={viewportRef} ratio="7 / 7" maxWidth={560}>
          <canvas
            ref={canvasRef}
            tabIndex={0}
            role="img"
            aria-label={copy.ariaLabel}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              focusedRef.current = true;
            }}
            onBlur={() => {
              focusedRef.current = false;
            }}
            onPointerMove={(event) => {
              if (event.pointerType === "mouse") cursorRef.current = columnFromPointer(event.clientX);
            }}
            onClick={(event) => {
              cursorRef.current = columnFromPointer(event.clientX);
              canvasRef.current?.focus({ preventScroll: true });
              play(cursorRef.current);
            }}
          />
        </Viewport>
      }
      panel={
        <>
          <PanelSection>
            <Status>{status}</Status>
          </PanelSection>
          <PanelSection>
            <Segmented
              label={copy.mode}
              value={mode}
              options={[
                { value: "vsAi", label: copy.modeVsAi },
                { value: "twoPlayers", label: copy.modeTwoPlayers },
              ]}
              onChange={changeMode}
            />
            {mode === "vsAi" && (
              <>
                <Segmented label={copy.difficulty} value={level} options={levelOptions} onChange={setLevel} />
                <Segmented
                  label={copy.firstMove}
                  value={firstMove}
                  options={[
                    { value: "human", label: copy.firstHuman },
                    { value: "ai", label: copy.firstAi },
                  ]}
                  onChange={changeFirstMove}
                />
              </>
            )}
          </PanelSection>
          {mode === "vsAi" && (
            <PanelSection title={copy.tally}>
              <Readouts>
                <Readout label={copy.wins} value={tally.wins} />
                <Readout label={copy.draws} value={tally.draws} />
                <Readout label={copy.losses} value={tally.losses} />
              </Readouts>
            </PanelSection>
          )}
          <PanelSection>
            <ButtonRow>
              <Button primary onClick={newGame}>
                {copy.newGame}
              </Button>
              <Button onClick={undo} disabled={moves.length === 0 || gameOver || thinking}>
                {copy.undo}
              </Button>
            </ButtonRow>
          </PanelSection>
        </>
      }
      caption={
        <>
          {copy.keyboard} {copy.caption}
        </>
      }
    />
  );
}
