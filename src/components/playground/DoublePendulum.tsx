"use client";

import { useCallback, useRef, useState } from "react";
import {
  pendulumEnergy,
  pendulumPositions,
  stepPendulum,
  type PendulumParams,
  type PendulumState,
} from "@/lib/doublePendulum";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useT } from "@/lib/i18n";
import {
  Button,
  ButtonRow,
  ExperienceLayout,
  PanelSection,
  Readout,
  Readouts,
  Segmented,
  Slider,
  Viewport,
} from "./kit/controls";
import { prefersReducedMotion, useCanvasFit, useFrameLoop, useThemeColors, useVisibleRef } from "./kit/hooks";

const TWIN_OFFSET_RAD = 0.001;
// Pas d'intégration maximal : la précision ne dépend plus de la cadence
// d'affichage (60 Hz, 144 Hz, ou un onglet lent), seulement du temps simulé.
const MAX_STEP_S = 1 / 480;
const READOUT_INTERVAL_S = 0.12;

const DEFAULT_STATE: PendulumState = {
  theta1: (2 * Math.PI) / 3,
  theta2: Math.PI / 6,
  omega1: 0,
  omega2: 0,
};

interface Settings {
  gravity: number;
  massRatio: number;
  length2: number;
  speed: number;
  trail: number;
}

const DEFAULT_SETTINGS: Settings = { gravity: 9.81, massRatio: 1, length2: 1, speed: 1, trail: 700 };

interface TrailPoint {
  x: number;
  y: number;
}

function toParams(settings: Settings): PendulumParams {
  return { L1: 1, L2: settings.length2, m1: 1, m2: settings.massRatio, g: settings.gravity };
}

// Angles tirés dans une plage large mais toujours « haute » (proche de
// l'horizontale) : c'est là que le système est le plus chaotique, sans jamais
// partir de l'équilibre stable où rien ne bougerait.
function randomState(): PendulumState {
  const spread = Math.PI * 0.85;
  return {
    theta1: (Math.random() - 0.5) * spread + Math.PI / 2,
    theta2: (Math.random() - 0.5) * spread + Math.PI / 2,
    omega1: 0,
    omega2: 0,
  };
}

function twinOf(state: PendulumState): PendulumState {
  return { ...state, theta1: state.theta1 + TWIN_OFFSET_RAD };
}

export default function DoublePendulum() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);
  const stateRef = useRef<PendulumState>(DEFAULT_STATE);
  const twinStateRef = useRef<PendulumState>(twinOf(DEFAULT_STATE));
  const trailRef = useRef<TrailPoint[]>([]);
  const twinTrailRef = useRef<TrailPoint[]>([]);
  const twinOnRef = useRef(false);
  const [startsRunning] = useState(() => !prefersReducedMotion());
  const runningRef = useRef(startsRunning);
  const dragRef = useRef<"b1" | "b2" | null>(null);
  const energyStartRef = useRef(pendulumEnergy(DEFAULT_STATE, toParams(DEFAULT_SETTINGS)));
  const elapsedRef = useRef(0);
  const readoutClockRef = useRef(0);

  const palette = useThemeColors();
  const visible = useVisibleRef(viewportRef);
  const reduced = useReducedMotion();
  const { t } = useT();
  const copy = t.playground.doublePendulum;

  const [running, setRunningState] = useState(startsRunning);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [twinOn, setTwinOnState] = useState(false);
  const [readings, setReadings] = useState({ time: 0, drift: 0, gap: 0 });

  const setRunning = useCallback((next: boolean) => {
    runningRef.current = next;
    setRunningState(next);
  }, []);

  const geometry = useCallback(() => {
    const { width, height } = sizeRef.current;
    const params = toParams(settingsRef.current);
    const scale = Math.min(width * 0.42, height * 0.62) / (params.L1 + params.L2);
    return { pivotX: width / 2, pivotY: height * 0.3, scale, params };
  }, []);

  const resetMeasures = useCallback(() => {
    energyStartRef.current = pendulumEnergy(stateRef.current, toParams(settingsRef.current));
    elapsedRef.current = 0;
    trailRef.current = [];
    twinTrailRef.current = [];
    if (twinOnRef.current) twinStateRef.current = twinOf(stateRef.current);
    setReadings({ time: 0, drift: 0, gap: 0 });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const { width, height } = sizeRef.current;
    if (!canvas || !ctx || width === 0) return;

    const colors = palette.current;
    const { pivotX, pivotY, scale, params } = geometry();
    const toScreen = (point: TrailPoint) => ({ x: pivotX + point.x * scale, y: pivotY + point.y * scale });

    ctx.clearRect(0, 0, width, height);

    const drawTrail = (trail: TrailPoint[], color: string, peakAlpha: number) => {
      const chunk = 24;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      for (let start = 1; start < trail.length; start += chunk) {
        ctx.globalAlpha = (start / trail.length) * peakAlpha;
        ctx.beginPath();
        const first = toScreen(trail[start - 1]);
        ctx.moveTo(first.x, first.y);
        for (let i = start; i < Math.min(start + chunk, trail.length); i++) {
          const point = toScreen(trail[i]);
          ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const drawPendulum = (state: PendulumState, armColor: string, bobColor: string, alpha: number) => {
      const { x1, y1, x2, y2 } = pendulumPositions(state, params);
      const a = toScreen({ x: x1, y: y1 });
      const b = toScreen({ x: x2, y: y2 });
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = armColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.fillStyle = armColor;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 5 + params.m1 * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bobColor;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5 + params.m2 * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    if (twinOnRef.current) {
      drawTrail(twinTrailRef.current, colors.ink, 0.45);
      drawPendulum(twinStateRef.current, colors.ink55, colors.ink, 0.75);
    }
    drawTrail(trailRef.current, colors.accent, 0.6);
    drawPendulum(stateRef.current, colors.ink, colors.accent, 1);

    ctx.fillStyle = colors.ink25;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [palette, geometry]);

  useCanvasFit(canvasRef, (width, height) => {
    sizeRef.current = { width, height };
    draw();
  });

  useFrameLoop((dt) => {
    if (!visible.current) return;

    if (runningRef.current) {
      const { speed, trail } = settingsRef.current;
      const params = toParams(settingsRef.current);
      const simulated = dt * speed;
      const substeps = Math.max(1, Math.ceil(simulated / MAX_STEP_S));
      const h = simulated / substeps;
      for (let i = 0; i < substeps; i++) {
        stateRef.current = stepPendulum(stateRef.current, params, h);
        if (twinOnRef.current) twinStateRef.current = stepPendulum(twinStateRef.current, params, h);
      }
      elapsedRef.current += dt * speed;

      const tip = pendulumPositions(stateRef.current, params);
      trailRef.current.push({ x: tip.x2, y: tip.y2 });
      if (trailRef.current.length > trail) trailRef.current.splice(0, trailRef.current.length - trail);
      if (twinOnRef.current) {
        const twinTip = pendulumPositions(twinStateRef.current, params);
        twinTrailRef.current.push({ x: twinTip.x2, y: twinTip.y2 });
        if (twinTrailRef.current.length > trail) twinTrailRef.current.splice(0, twinTrailRef.current.length - trail);
      }

      readoutClockRef.current += dt;
      if (readoutClockRef.current >= READOUT_INTERVAL_S) {
        readoutClockRef.current = 0;
        const twinTip = pendulumPositions(twinStateRef.current, params);
        setReadings({
          time: elapsedRef.current,
          drift: Math.abs(pendulumEnergy(stateRef.current, params) - energyStartRef.current),
          gap: twinOnRef.current ? Math.hypot(tip.x2 - twinTip.x2, tip.y2 - twinTip.y2) : 0,
        });
      }
    }

    draw();
  });

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      settingsRef.current = { ...settingsRef.current, [key]: value };
      setSettings(settingsRef.current);
      if (key === "gravity" || key === "massRatio" || key === "length2") resetMeasures();
    },
    [resetMeasures],
  );

  const applyState = useCallback(
    (next: PendulumState) => {
      stateRef.current = next;
      resetMeasures();
      draw();
    },
    [resetMeasures, draw],
  );

  const reset = useCallback(() => {
    setRunning(false);
    applyState(DEFAULT_STATE);
  }, [applyState, setRunning]);

  const randomize = useCallback(() => {
    setRunning(false);
    applyState(randomState());
  }, [applyState, setRunning]);

  const changeTwin = useCallback(
    (next: boolean) => {
      twinOnRef.current = next;
      setTwinOnState(next);
      resetMeasures();
      draw();
    },
    [resetMeasures, draw],
  );

  const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  // Le bras saisi est le plus proche du pointeur : le second si le pointeur
  // est loin du coude, le premier sinon.
  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const { pivotX, pivotY, scale, params } = geometry();
    const point = pointerPosition(event);
    const { x1, y1 } = pendulumPositions(stateRef.current, params);
    const distanceFromElbow = Math.hypot(point.x - (pivotX + x1 * scale), point.y - (pivotY + y1 * scale));
    dragRef.current = distanceFromElbow > params.L1 * scale * 0.6 ? "b2" : "b1";
    setRunning(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const grabbed = dragRef.current;
    if (!grabbed) return;
    const { pivotX, pivotY, scale, params } = geometry();
    const point = pointerPosition(event);
    let originX = pivotX;
    let originY = pivotY;
    if (grabbed === "b2") {
      const { x1, y1 } = pendulumPositions(stateRef.current, params);
      originX = pivotX + x1 * scale;
      originY = pivotY + y1 * scale;
    }
    const theta = Math.atan2(point.x - originX, point.y - originY);
    applyState(
      grabbed === "b1"
        ? { ...stateRef.current, theta1: theta, omega1: 0, omega2: 0 }
        : { ...stateRef.current, theta2: theta, omega1: 0, omega2: 0 },
    );
  };

  const releasePointer = () => {
    dragRef.current = null;
  };

  return (
    <ExperienceLayout
      viewport={
        <Viewport ref={viewportRef} ratio="4 / 3">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={copy.ariaLabel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
          />
        </Viewport>
      }
      panel={
        <>
          <PanelSection title={copy.results}>
            <Readouts>
              <Readout label={copy.time} value={`${readings.time.toFixed(1)} s`} />
              <Readout label={copy.energyDrift} value={`${(readings.drift * 1000).toFixed(2)} mJ`} />
              {twinOn && <Readout label={copy.divergence} value={`${readings.gap.toFixed(3)} m`} />}
            </Readouts>
          </PanelSection>
          <PanelSection title={copy.twinPanel}>
            <Segmented
              label={copy.twin}
              value={twinOn ? "on" : "off"}
              options={[
                { value: "off", label: copy.twinOff },
                { value: "on", label: copy.twinOn },
              ]}
              onChange={(value) => changeTwin(value === "on")}
            />
          </PanelSection>
          <PanelSection title={copy.settings}>
            <Slider
              label={copy.gravity}
              value={settings.gravity}
              min={1}
              max={25}
              step={0.1}
              onChange={(value) => updateSetting("gravity", value)}
              format={(value) => `${value.toFixed(1)} m/s²`}
            />
            <Slider
              label={copy.massRatio}
              value={settings.massRatio}
              min={0.25}
              max={3}
              step={0.05}
              onChange={(value) => updateSetting("massRatio", value)}
              format={(value) => `×${value.toFixed(2)}`}
            />
            <Slider
              label={copy.length}
              value={settings.length2}
              min={0.4}
              max={1.6}
              step={0.05}
              onChange={(value) => updateSetting("length2", value)}
              format={(value) => `${value.toFixed(2)} m`}
            />
            <Slider
              label={copy.speed}
              value={settings.speed}
              min={0.25}
              max={2}
              step={0.25}
              onChange={(value) => updateSetting("speed", value)}
              format={(value) => `×${value}`}
            />
            <Slider
              label={copy.trail}
              value={settings.trail}
              min={100}
              max={1500}
              step={50}
              onChange={(value) => updateSetting("trail", value)}
            />
          </PanelSection>
          <PanelSection>
            <ButtonRow>
              <Button primary onClick={() => setRunning(!running)}>
                {running ? copy.pause : copy.play}
              </Button>
              <Button onClick={reset}>{copy.reset}</Button>
              <Button onClick={randomize}>{copy.randomize}</Button>
            </ButtonRow>
          </PanelSection>
        </>
      }
      caption={
        <>
          {copy.caption}
          {reduced && copy.reducedMotionNote}
        </>
      }
    />
  );
}
