"use client";

import type { ReactNode, Ref } from "react";
import styles from "./kit.module.css";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  title?: string;
}

export function Button({ children, onClick, primary, disabled, title }: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${primary ? styles.btnPrimary : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel} id={`seg-${label}`}>
        {label}
      </span>
      <div className={styles.segmented} role="radiogroup" aria-labelledby={`seg-${label}`}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            className={`${styles.segment} ${option.value === value ? styles.segmentActive : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

export function Slider({ label, value, min, max, step, onChange, format }: SliderProps) {
  const id = `slider-${label}`;
  return (
    <div className={styles.group}>
      <label className={styles.sliderHead} htmlFor={id}>
        <span className={styles.groupLabel}>{label}</span>
        <output className={styles.sliderValue} htmlFor={id}>
          {format ? format(value) : value}
        </output>
      </label>
      <input
        id={id}
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function Readout({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.readout}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export function Readouts({ children }: { children: ReactNode }) {
  return <dl className={styles.readouts}>{children}</dl>;
}

export function PanelSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.panelSection}>
      {title && <h4 className={styles.panelTitle}>{title}</h4>}
      {children}
    </div>
  );
}

// Message d'état annoncé aux lecteurs d'écran (tour de jeu, résultat).
export function Status({ children }: { children: ReactNode }) {
  return (
    <p className={styles.status} role="status" aria-live="polite">
      {children}
    </p>
  );
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className={styles.buttonRow}>{children}</div>;
}

interface ViewportProps {
  children: ReactNode;
  ratio?: string;
  maxWidth?: number;
  ref?: Ref<HTMLDivElement>;
  label?: string;
}

// Zone de dessin : fond de panneau, filet d'accent à gauche, proportions
// fixes. `maxWidth` limite les jeux carrés pour qu'ils ne deviennent pas
// gigantesques dans la colonne large.
export function Viewport({ children, ratio = "1 / 1", maxWidth, ref, label }: ViewportProps) {
  return (
    <div
      ref={ref}
      className={styles.viewport}
      style={{ aspectRatio: ratio, maxWidth: maxWidth ? `${maxWidth}px` : undefined }}
      role={label ? "group" : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}

interface LayoutProps {
  viewport: ReactNode;
  panel: ReactNode;
  // Commandes à garder sous les yeux pendant la partie : placées juste sous la
  // zone de jeu, pas dans le panneau, qui passe sous la ligne de flottaison
  // sur mobile.
  controls?: ReactNode;
  caption?: ReactNode;
}

export function ExperienceLayout({ viewport, panel, controls, caption }: LayoutProps) {
  return (
    <div className={styles.experience}>
      <div className={styles.layout}>
        <div className={styles.viewportColumn}>
          {viewport}
          {controls}
          {caption && <p className={styles.caption}>{caption}</p>}
        </div>
        <div className={styles.panel}>{panel}</div>
      </div>
    </div>
  );
}

interface OverlayProps {
  title: string;
  text?: string;
  action?: ReactNode;
  // Sans bouton : le voile laisse passer les gestes vers la zone de jeu, sinon
  // un glissement du doigt pour démarrer n'atteint jamais le canvas.
  passthrough?: boolean;
}

export function Overlay({ title, text, action, passthrough }: OverlayProps) {
  return (
    <div className={passthrough ? `${styles.overlay} ${styles.overlayPassthrough}` : styles.overlay}>
      <p className={styles.overlayTitle}>{title}</p>
      {text && <p className={styles.overlayText}>{text}</p>}
      {action}
    </div>
  );
}

type Direction = "up" | "down" | "left" | "right";

interface DPadProps {
  label: string;
  labels: Record<Direction, string>;
  onDirection: (direction: Direction) => void;
}

const DPAD_KEYS: { direction: Direction; glyph: string }[] = [
  { direction: "up", glyph: "↑" },
  { direction: "left", glyph: "←" },
  { direction: "right", glyph: "→" },
  { direction: "down", glyph: "↓" },
];

// Croix directionnelle tactile, affichée seulement sur écran sans souris.
export function DPad({ label, labels, onDirection }: DPadProps) {
  return (
    <div className={styles.dpad} role="group" aria-label={label}>
      {DPAD_KEYS.map((key) => (
        <button
          key={key.direction}
          type="button"
          className={styles.dpadKey}
          style={{ gridArea: key.direction }}
          aria-label={labels[key.direction]}
          onPointerDown={(event) => {
            event.preventDefault();
            onDirection(key.direction);
          }}
          // Clavier et lecteurs d'écran : Entrée et Espace ne déclenchent qu'un
          // clic (detail 0), le doigt est déjà traité par pointerdown.
          onClick={(event) => {
            if (event.detail === 0) onDirection(key.direction);
          }}
        >
          {key.glyph}
        </button>
      ))}
    </div>
  );
}
