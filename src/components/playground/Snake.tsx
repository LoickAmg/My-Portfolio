"use client";

import { useCallback, useRef, useState } from "react";
import { changeDirection, createInitialState, step, type Direction, type SnakeState } from "@/lib/snake";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useT } from "@/lib/i18n";
import { STORAGE_KEYS, readStored, writeStored } from "@/lib/storage";
import {
  Button,
  ButtonRow,
  DPad,
  ExperienceLayout,
  Overlay,
  PanelSection,
  Readout,
  Readouts,
  Segmented,
  Viewport,
} from "./kit/controls";
import { useCanvasFit, useFrameLoop, useThemeColors, useVisibleRef } from "./kit/hooks";

const GRID_SIZE = 18;
const SWIPE_THRESHOLD_PX = 24;

type Phase = "ready" | "playing" | "paused" | "over";
type Mode = "walls" | "wrap";
type SpeedId = "slow" | "normal" | "fast";
type Records = Record<Mode, number>;

const BASE_TICK_MS: Record<SpeedId, number> = { slow: 190, normal: 140, fast: 95 };

const KEY_TO_DIRECTION: Record<string, Direction> = {
  arrowup: "up",
  arrowdown: "down",
  arrowleft: "left",
  arrowright: "right",
  w: "up",
  z: "up",
  s: "down",
  a: "left",
  q: "left",
  d: "right",
};

function tickInterval(base: number, score: number): number {
  return Math.max(base * 0.55, base - score * 3);
}

function isStoredRecords(raw: unknown): raw is Records | number {
  if (typeof raw === "number") return Number.isFinite(raw);
  if (typeof raw !== "object" || raw === null) return false;
  const candidate = raw as Partial<Records>;
  return Number.isFinite(candidate.walls) && Number.isFinite(candidate.wrap);
}

// L'ancienne version enregistrait un simple nombre : il devient le record du
// mode Murs, le seul qui existait alors.
function loadRecords(): Records {
  const stored = readStored<Records | number>(STORAGE_KEYS.snakeBest, { walls: 0, wrap: 0 }, isStoredRecords);
  return typeof stored === "number" ? { walls: stored, wrap: 0 } : stored;
}

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SnakeState>(createInitialState(GRID_SIZE));
  const phaseRef = useRef<Phase>("ready");
  const modeRef = useRef<Mode>("walls");
  const speedRef = useRef<SpeedId>("normal");
  const accumulatorRef = useRef(0);
  const swipeOriginRef = useRef<{ x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });

  const palette = useThemeColors();
  const visible = useVisibleRef(viewportRef);
  const reduced = useReducedMotion();
  const { t } = useT();
  const copy = t.playground.snake;

  const [phase, setPhaseState] = useState<Phase>("ready");
  const [mode, setModeState] = useState<Mode>("walls");
  const [speed, setSpeedState] = useState<SpeedId>("normal");
  const [score, setScore] = useState(0);
  const [length, setLength] = useState(3);
  const [records, setRecords] = useState<Records>(loadRecords);

  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const focusCanvas = useCallback(() => {
    canvasRef.current?.focus({ preventScroll: true });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const { width, height } = sizeRef.current;
    if (!canvas || !ctx || width === 0) return;

    const colors = palette.current;
    const cell = Math.min(width, height) / GRID_SIZE;
    const offsetX = (width - cell * GRID_SIZE) / 2;
    const offsetY = (height - cell * GRID_SIZE) / 2;
    const { snake, food } = stateRef.current;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.panelAlt;
    ctx.fillRect(offsetX, offsetY, cell * GRID_SIZE, cell * GRID_SIZE);

    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(offsetX + (food.x + 0.5) * cell, offsetY + (food.y + 0.5) * cell, cell * 0.32, 0, Math.PI * 2);
    ctx.fill();

    const pad = cell * 0.08;
    snake.forEach((segment, index) => {
      ctx.globalAlpha = index === 0 ? 1 : Math.max(0.35, 0.9 - index * 0.025);
      ctx.fillStyle = index === 0 ? colors.accent : colors.ink;
      ctx.fillRect(offsetX + segment.x * cell + pad, offsetY + segment.y * cell + pad, cell - pad * 2, cell - pad * 2);
    });
    ctx.globalAlpha = 1;
  }, [palette]);

  useCanvasFit(canvasRef, (width, height) => {
    sizeRef.current = { width, height };
    draw();
  });

  const finish = useCallback(
    (finalScore: number) => {
      setPhase("over");
      setScore(finalScore);
      setRecords((current) => {
        const key = modeRef.current;
        if (finalScore <= current[key]) return current;
        const next = { ...current, [key]: finalScore };
        writeStored(STORAGE_KEYS.snakeBest, next);
        return next;
      });
    },
    [setPhase],
  );

  useFrameLoop((dt) => {
    if (!visible.current) return;

    if (phaseRef.current === "playing") {
      accumulatorRef.current += dt * 1000;
      const interval = tickInterval(BASE_TICK_MS[speedRef.current], stateRef.current.score);
      while (accumulatorRef.current >= interval) {
        accumulatorRef.current -= interval;
        const next = step(stateRef.current, GRID_SIZE, Math.random, modeRef.current === "wrap");
        stateRef.current = next;
        if (!next.alive) {
          finish(next.score);
          break;
        }
        setScore(next.score);
        setLength(next.snake.length);
      }
    }

    draw();
  });

  const steer = useCallback(
    (direction: Direction) => {
      if (phaseRef.current === "over" || phaseRef.current === "paused") return;
      stateRef.current = changeDirection(stateRef.current, direction);
      if (phaseRef.current === "ready") setPhase("playing");
    },
    [setPhase],
  );

  const restart = useCallback(() => {
    stateRef.current = createInitialState(GRID_SIZE);
    accumulatorRef.current = 0;
    setScore(0);
    setLength(3);
    setPhase("ready");
    focusCanvas();
  }, [focusCanvas, setPhase]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") setPhase("paused");
    else if (phaseRef.current === "paused") setPhase("playing");
    else if (phaseRef.current === "ready") setPhase("playing");
    focusCanvas();
  }, [focusCanvas, setPhase]);

  const changeMode = useCallback(
    (next: Mode) => {
      modeRef.current = next;
      setModeState(next);
      restart();
    },
    [restart],
  );

  const changeSpeed = useCallback((next: SpeedId) => {
    speedRef.current = next;
    setSpeedState(next);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const key = event.key.toLowerCase();
    if (key === " " || key === "p") {
      event.preventDefault();
      if (phaseRef.current === "over") restart();
      else togglePause();
      return;
    }
    const direction = KEY_TO_DIRECTION[key];
    if (!direction) return;
    event.preventDefault();
    steer(direction);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    swipeOriginRef.current = { x: event.clientX, y: event.clientY };
    swipedRef.current = false;
    // Le doigt peut sortir du plateau en plein glissement : on garde le geste.
    event.currentTarget.setPointerCapture(event.pointerId);
    focusCanvas();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const origin = swipeOriginRef.current;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD_PX) return;
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    swipedRef.current = true;
    swipeOriginRef.current = { x: event.clientX, y: event.clientY };
  };

  const clearSwipe = () => {
    swipeOriginRef.current = null;
  };

  // Un simple appui sur le plateau lance la partie, comme l'indique le voile.
  const handlePointerUp = () => {
    if (swipeOriginRef.current && !swipedRef.current && phaseRef.current === "ready") togglePause();
    clearSwipe();
  };

  const modeOptions = [
    { value: "walls" as const, label: copy.modeWalls },
    { value: "wrap" as const, label: copy.modeWrap },
  ];
  const speedOptions = [
    { value: "slow" as const, label: copy.speedSlow },
    { value: "normal" as const, label: copy.speedNormal },
    { value: "fast" as const, label: copy.speedFast },
  ];

  const record = Math.max(records[mode], score);

  return (
    <ExperienceLayout
      viewport={
        <Viewport ref={viewportRef} ratio="1 / 1" maxWidth={560}>
          <canvas
            ref={canvasRef}
            tabIndex={0}
            role="img"
            aria-label={copy.ariaLabel}
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={clearSwipe}
          />
          {phase === "ready" && <Overlay passthrough title={copy.ready} text={copy.readyText} />}
          {phase === "paused" && (
            <Overlay
              title={copy.paused}
              action={
                <Button primary onClick={togglePause}>
                  {copy.resume}
                </Button>
              }
            />
          )}
          {phase === "over" && (
            <Overlay
              title={copy.gameOver}
              text={`${copy.score} ${score} · ${copy.best} ${record}`}
              action={
                <Button primary onClick={restart}>
                  {copy.restart}
                </Button>
              }
            />
          )}
          <span className="visually-hidden" aria-live="polite">
            {phase === "over" ? `${copy.gameOver}. ${copy.score} ${score}.` : ""}
          </span>
        </Viewport>
      }
      panel={
        <>
          <PanelSection>
            <Readouts>
              <Readout label={copy.score} value={score} />
              <Readout label={copy.best} value={record} />
              <Readout label={copy.length} value={length} />
            </Readouts>
          </PanelSection>
          <PanelSection>
            <Segmented label={copy.mode} value={mode} options={modeOptions} onChange={changeMode} />
            <Segmented label={copy.speed} value={speed} options={speedOptions} onChange={changeSpeed} />
          </PanelSection>
          <PanelSection>
            <ButtonRow>
              <Button primary onClick={togglePause} disabled={phase === "over"}>
                {phase === "playing" ? copy.pause : phase === "paused" ? copy.resume : copy.play}
              </Button>
              <Button onClick={restart}>{copy.restart}</Button>
            </ButtonRow>
          </PanelSection>
        </>
      }
      controls={
        <DPad
          label={copy.dpad}
          labels={{ up: copy.up, down: copy.down, left: copy.left, right: copy.right }}
          onDirection={steer}
        />
      }
      caption={
        <>
          {copy.instructions} {copy.caption}
          {reduced && copy.reducedMotionNote}
        </>
      }
    />
  );
}
