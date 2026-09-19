"use client";

import { useCallback, useRef, useState } from "react";
import { DATASET_IDS, generateDataset, type DatasetId } from "@/lib/datasets";
import {
  countParameters,
  createNetwork,
  evaluate,
  predict,
  trainEpoch,
  type Activation,
  type Network,
  type Sample,
} from "@/lib/neuralNet";
import { createRng } from "@/lib/random";
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
import styles from "./NeuralNet.module.css";

const SAMPLE_COUNT = 200;
const BATCH_SIZE = 16;
const DOMAIN = 1.3;
const HEATMAP_RESOLUTION = 64;
const FRAME_BUDGET_MS = 6;
const MAX_EPOCHS_PER_FRAME = 4;
const READOUT_INTERVAL_S = 0.12;
const HISTORY_LIMIT = 240;

interface Config {
  dataset: DatasetId;
  noise: number;
  layers: number;
  neurons: number;
  activation: Activation;
  learningRate: number;
}

const DEFAULT_CONFIG: Config = {
  dataset: "circles",
  noise: 0.08,
  layers: 2,
  neurons: 6,
  activation: "tanh",
  learningRate: 0.2,
};

function buildNetwork(config: Config, rng: () => number): Network {
  return createNetwork([2, ...Array<number>(config.layers).fill(config.neurons), 1], config.activation, rng);
}

function buildSamples(config: Config, seed: number): Sample[] {
  return generateDataset(config.dataset, SAMPLE_COUNT, config.noise, createRng(seed));
}

function parseHex(color: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return [128, 128, 128];
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

interface Readings {
  epoch: number;
  loss: number;
  accuracy: number;
  history: number[];
}

function LossChart({ history, label }: { history: number[]; label: string }) {
  const width = 240;
  const height = 56;
  const ceiling = Math.max(0.7, ...history);
  const points = history
    .map((value, index) => {
      const x = history.length > 1 ? (index / (history.length - 1)) * width : 0;
      const y = height - (Math.min(value, ceiling) / ceiling) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className={styles.chart} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} preserveAspectRatio="none">
      <line x1="0" y1={height - 1} x2={width} y2={height - 1} className={styles.chartAxis} />
      {history.length > 1 && <polyline points={points} className={styles.chartLine} />}
    </svg>
  );
}

export default function NeuralNet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });
  const heatmapRef = useRef<HTMLCanvasElement | null>(null);
  const dirtyRef = useRef(true);
  const paletteKeyRef = useRef("");
  const readoutClockRef = useRef(0);

  const [initial] = useState(() => {
    const rng = createRng(1);
    return { net: buildNetwork(DEFAULT_CONFIG, rng), rng, samples: buildSamples(DEFAULT_CONFIG, 100), running: !prefersReducedMotion() };
  });
  const netRef = useRef<Network>(initial.net);
  const rngRef = useRef(initial.rng);
  const samplesRef = useRef<Sample[]>(initial.samples);
  const epochRef = useRef(0);
  const historyRef = useRef<number[]>([]);
  const configRef = useRef<Config>(DEFAULT_CONFIG);
  const runningRef = useRef(initial.running);
  const seedRef = useRef(1);
  const historyStrideRef = useRef(1);

  const palette = useThemeColors();
  const visible = useVisibleRef(viewportRef);
  const { t } = useT();
  const copy = t.playground.neuralNet;

  const [config, setConfigState] = useState<Config>(DEFAULT_CONFIG);
  const [running, setRunningState] = useState(initial.running);
  const [readings, setReadings] = useState<Readings>({ epoch: 0, loss: 0, accuracy: 0, history: [] });
  const [parameters, setParameters] = useState(() => countParameters(initial.net));

  const setRunning = useCallback((next: boolean) => {
    runningRef.current = next;
    setRunningState(next);
  }, []);

  const rebuildNetwork = useCallback((next: Config) => {
    seedRef.current += 1;
    const rng = createRng(seedRef.current);
    rngRef.current = rng;
    netRef.current = buildNetwork(next, rng);
    epochRef.current = 0;
    historyRef.current = [];
    historyStrideRef.current = 1;
    dirtyRef.current = true;
    setParameters(countParameters(netRef.current));
    setReadings({ epoch: 0, loss: 0, accuracy: 0, history: [] });
  }, []);

  const rebuildData = useCallback((next: Config) => {
    seedRef.current += 1;
    samplesRef.current = buildSamples(next, seedRef.current + 5000);
  }, []);

  const updateConfig = useCallback(
    (patch: Partial<Config>, options: { data?: boolean; network?: boolean }) => {
      const next = { ...configRef.current, ...patch };
      configRef.current = next;
      setConfigState(next);
      if (options.data) rebuildData(next);
      if (options.network) rebuildNetwork(next);
    },
    [rebuildData, rebuildNetwork],
  );

  const refreshHeatmap = useCallback(() => {
    if (!heatmapRef.current) {
      heatmapRef.current = document.createElement("canvas");
      heatmapRef.current.width = HEATMAP_RESOLUTION;
      heatmapRef.current.height = HEATMAP_RESOLUTION;
    }
    const target = heatmapRef.current.getContext("2d");
    if (!target) return;

    const colors = palette.current;
    const positive = parseHex(colors.accent);
    const negative = parseHex(colors.ink);
    const image = target.createImageData(HEATMAP_RESOLUTION, HEATMAP_RESOLUTION);
    const net = netRef.current;

    for (let row = 0; row < HEATMAP_RESOLUTION; row++) {
      for (let col = 0; col < HEATMAP_RESOLUTION; col++) {
        const x = ((col + 0.5) / HEATMAP_RESOLUTION) * 2 * DOMAIN - DOMAIN;
        const y = DOMAIN - ((row + 0.5) / HEATMAP_RESOLUTION) * 2 * DOMAIN;
        const p = predict(net, x, y);
        const offset = (row * HEATMAP_RESOLUTION + col) * 4;
        image.data[offset] = negative[0] * (1 - p) + positive[0] * p;
        image.data[offset + 1] = negative[1] * (1 - p) + positive[1] * p;
        image.data[offset + 2] = negative[2] * (1 - p) + positive[2] * p;
        const confidence = Math.abs(p - 0.5) * 2;
        image.data[offset + 3] = 24 + confidence * (p >= 0.5 ? 160 : 52);
      }
    }
    target.putImageData(image, 0, 0);
  }, [palette]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const { width, height } = sizeRef.current;
    if (!canvas || !ctx || width === 0) return;

    const colors = palette.current;
    const key = `${colors.accent}${colors.ink}`;
    if (key !== paletteKeyRef.current) {
      paletteKeyRef.current = key;
      dirtyRef.current = true;
    }
    if (dirtyRef.current || !heatmapRef.current) {
      refreshHeatmap();
      dirtyRef.current = false;
    }

    const size = Math.min(width, height);
    const offsetX = (width - size) / 2;
    const offsetY = (height - size) / 2;
    const toX = (x: number) => offsetX + ((x + DOMAIN) / (2 * DOMAIN)) * size;
    const toY = (y: number) => offsetY + (1 - (y + DOMAIN) / (2 * DOMAIN)) * size;

    ctx.clearRect(0, 0, width, height);
    if (heatmapRef.current) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(heatmapRef.current, offsetX, offsetY, size, size);
    }

    for (const sample of samplesRef.current) {
      ctx.beginPath();
      ctx.arc(toX(sample.x), toY(sample.y), 4.2, 0, Math.PI * 2);
      ctx.fillStyle = sample.label === 1 ? colors.accent : colors.ink;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colors.void;
      ctx.stroke();
    }
  }, [palette, refreshHeatmap]);

  useCanvasFit(canvasRef, (width, height) => {
    sizeRef.current = { width, height };
    dirtyRef.current = true;
    draw();
  });

  const publishReadings = useCallback(() => {
    const { loss, accuracy } = evaluate(netRef.current, samplesRef.current);
    setReadings({ epoch: epochRef.current, loss, accuracy, history: [...historyRef.current] });
  }, []);

  const trainOnce = useCallback(() => {
    const loss = trainEpoch(netRef.current, samplesRef.current, configRef.current.learningRate, BATCH_SIZE, rngRef.current);
    epochRef.current += 1;
    // Toute la session tient dans la courbe : au-delà de la limite, un point
    // sur deux est gardé et la cadence d'échantillonnage double.
    if (epochRef.current % historyStrideRef.current === 0) historyRef.current.push(loss);
    if (historyRef.current.length > HISTORY_LIMIT) {
      historyRef.current = historyRef.current.filter((_, index) => index % 2 === 0);
      historyStrideRef.current *= 2;
    }
    dirtyRef.current = true;
  }, []);

  useFrameLoop((dt) => {
    if (!visible.current) return;

    if (runningRef.current) {
      const started = performance.now();
      let epochs = 0;
      while (epochs < MAX_EPOCHS_PER_FRAME && performance.now() - started < FRAME_BUDGET_MS) {
        trainOnce();
        epochs += 1;
      }
      readoutClockRef.current += dt;
      if (readoutClockRef.current >= READOUT_INTERVAL_S) {
        readoutClockRef.current = 0;
        publishReadings();
      }
    }

    draw();
  });

  const stepOnce = useCallback(() => {
    setRunning(false);
    trainOnce();
    publishReadings();
  }, [setRunning, trainOnce, publishReadings]);

  const datasetOptions = DATASET_IDS.map((id) => ({ value: id, label: copy.datasets[id] }));

  return (
    <ExperienceLayout
      viewport={
        <Viewport ref={viewportRef} ratio="1 / 1" maxWidth={560}>
          <canvas ref={canvasRef} role="img" aria-label={copy.ariaLabel} />
        </Viewport>
      }
      panel={
        <>
          <PanelSection>
            <Readouts>
              <Readout label={copy.epoch} value={readings.epoch} />
              <Readout label={copy.accuracy} value={`${Math.round(readings.accuracy * 100)} %`} />
              <Readout label={copy.loss} value={readings.loss.toFixed(3)} />
              <Readout label={copy.parameters} value={parameters} />
            </Readouts>
            <LossChart history={readings.history} label={copy.lossChart} />
          </PanelSection>
          <PanelSection title={copy.dataPanel}>
            <Segmented
              label={copy.dataset}
              value={config.dataset}
              options={datasetOptions}
              onChange={(dataset) => updateConfig({ dataset }, { data: true, network: true })}
            />
            <Slider
              label={copy.noise}
              value={config.noise}
              min={0}
              max={0.3}
              step={0.02}
              onChange={(noise) => updateConfig({ noise }, { data: true })}
              format={(value) => value.toFixed(2)}
            />
          </PanelSection>
          <PanelSection title={copy.architecture}>
            <Slider
              label={copy.layers}
              value={config.layers}
              min={1}
              max={3}
              step={1}
              onChange={(layers) => updateConfig({ layers }, { network: true })}
            />
            <Slider
              label={copy.neurons}
              value={config.neurons}
              min={2}
              max={8}
              step={1}
              onChange={(neurons) => updateConfig({ neurons }, { network: true })}
            />
            <Segmented
              label={copy.activation}
              value={config.activation}
              options={[
                { value: "tanh", label: "tanh" },
                { value: "relu", label: "ReLU" },
              ]}
              onChange={(activation) => updateConfig({ activation }, { network: true })}
            />
            <Slider
              label={copy.learningRate}
              value={config.learningRate}
              min={0.02}
              max={0.6}
              step={0.02}
              onChange={(learningRate) => updateConfig({ learningRate }, {})}
              format={(value) => value.toFixed(2)}
            />
          </PanelSection>
          <PanelSection>
            <ButtonRow>
              <Button primary onClick={() => setRunning(!running)}>
                {running ? copy.pause : copy.train}
              </Button>
              <Button onClick={stepOnce}>{copy.step}</Button>
              <Button onClick={() => rebuildNetwork(configRef.current)}>{copy.reset}</Button>
              <Button onClick={() => rebuildData(configRef.current)}>{copy.reshuffle}</Button>
            </ButtonRow>
          </PanelSection>
        </>
      }
      caption={copy.caption}
    />
  );
}
