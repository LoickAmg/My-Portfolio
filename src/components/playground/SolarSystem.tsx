"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLANETS, localizePlanet, type PlanetData } from "@/lib/solarSystemData";
import { useT } from "@/lib/i18n";
import { Button, ButtonRow, ExperienceLayout, PanelSection, Readout, Readouts, Segmented, Slider, Viewport } from "./kit/controls";
import { prefersReducedMotion, useVisibleRef } from "./kit/hooks";
import styles from "./SolarSystem.module.css";

// Compression monotone des distances réelles (0,39 à 30,07 UA) vers un
// intervalle qui tient sur un même écran, sans jamais changer leur ordre.
// Racine carrée : resserre les géantes lointaines sans écraser les
// telluriques les unes contre les autres.
function scaleDistance(au: number): number {
  return 4 + Math.sqrt(au) * 5.2;
}

// Même logique pour les rayons : le rapport réel Jupiter/Mercure est
// d'environ 29 pour 1, invisible à l'écran si respecté tel quel.
function scaleRadius(diameterKm: number): number {
  return 0.32 + Math.cbrt(diameterKm / 12756) * 0.55;
}

const SUN_RADIUS = 1.6;
const EARTH_YEAR_SECONDS = 9;
const OVERVIEW_POSITION = new THREE.Vector3(0, 24, 34);
const FOLLOW_EASING = 0.08;

interface PlanetMesh {
  data: PlanetData;
  mesh: THREE.Mesh;
  angle: number;
  distance: number;
  radius: number;
}

// Vol de caméra en cours : `distance` est la distance cible au point visé,
// `overview` ramène la vue générale.
type Flight = { kind: "planet"; distance: number } | { kind: "overview" } | null;

interface SceneApi {
  select: (id: string | null) => void;
  setOrbitsVisible: (visible: boolean) => void;
}

function hexColor(value: number): string {
  return `#${value.toString(16).padStart(6, "0")}`;
}

export default function SolarSystem() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneApiRef = useRef<SceneApi | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const flightRef = useRef<Flight>(null);
  const speedRef = useRef(1);
  const [startsRunning] = useState(() => !prefersReducedMotion());
  const runningRef = useRef(startsRunning);
  const visible = useVisibleRef(viewportRef);

  const { lang, t } = useT();
  const copy = t.playground.solarSystem;

  const [running, setRunningState] = useState(startsRunning);
  const [speed, setSpeedState] = useState(1);
  const [orbitsVisible, setOrbitsVisibleState] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [webglError, setWebglError] = useState(false);

  const selectedPlanet = selectedId ? (PLANETS.find((planet) => planet.id === selectedId) ?? null) : null;
  const selected = selectedPlanet ? localizePlanet(selectedPlanet, lang) : null;

  const setRunning = useCallback((next: boolean) => {
    runningRef.current = next;
    setRunningState(next);
  }, []);

  const select = useCallback((id: string | null) => {
    selectedIdRef.current = id;
    setSelectedId(id);
    sceneApiRef.current?.select(id);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const styleOf = getComputedStyle(container);
    const background = styleOf.getPropertyValue("--bg-void").trim() || "#0a0d18";
    const accent = styleOf.getPropertyValue("--accent").trim() || "#4d6bff";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 500);
    camera.position.copy(OVERVIEW_POSITION);

    // WebGLRenderer lève une exception synchrone quand aucun contexte WebGL
    // n'est disponible : sans ce filet, tout le Playground plantait au lieu de
    // dégrader proprement.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWebglError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = "grab";

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 90;

    // Lumière ambiante assez forte pour que la face non éclairée d'une
    // planète reste un disque sombre plutôt que de disparaître.
    scene.add(new THREE.AmbientLight(0x8a95b8, 1.1));
    scene.add(new THREE.PointLight(0xfff1d6, 4, 0, 0));

    const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 32, 24), new THREE.MeshBasicMaterial({ color: 0xffcf7a }));
    scene.add(sun);

    const orbitLines: THREE.Line[] = [];
    const orbitMaterials: THREE.LineBasicMaterial[] = [];

    const planets: PlanetMesh[] = PLANETS.map((data, index) => {
      const distance = scaleDistance(data.distanceAu);
      const radius = scaleRadius(data.diameterKm);

      const orbitPoints: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(a) * distance, 0, Math.sin(a) * distance));
      }
      const orbitMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.25 });
      orbitMaterials.push(orbitMaterial);
      const orbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial);
      orbitLines.push(orbitLine);
      scene.add(orbitLine);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 24),
        new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.85, metalness: 0.05 }),
      );
      mesh.userData.planetId = data.id;
      const angle = (index / PLANETS.length) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
      scene.add(mesh);

      if (data.id === "saturn") {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(radius * 1.4, radius * 2.2, 64),
          new THREE.MeshBasicMaterial({ color: 0xcbb078, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
        );
        ring.rotation.x = Math.PI / 2.5;
        mesh.add(ring);
      }

      return { data, mesh, angle, distance, radius };
    });

    const selectRing = new THREE.Mesh(
      new THREE.RingGeometry(1, 1.045, 64),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
    );
    selectRing.visible = false;
    scene.add(selectRing);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const pick = (event: MouseEvent): PlanetMesh | undefined => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(planets.map((planet) => planet.mesh))[0];
      return hit ? planets.find((planet) => planet.mesh === hit.object) : undefined;
    };

    sceneApiRef.current = {
      select: (id) => {
        const found = planets.find((planet) => planet.data.id === id);
        if (!found) {
          selectRing.visible = false;
          flightRef.current = { kind: "overview" };
          return;
        }
        selectRing.visible = true;
        selectRing.scale.setScalar(found.radius * 1.6);
        flightRef.current = { kind: "planet", distance: Math.max(found.radius * 7, 5) };
      },
      setOrbitsVisible: (isVisible) => {
        orbitLines.forEach((line) => {
          line.visible = isVisible;
        });
      },
    };

    const handleClick = (event: MouseEvent) => {
      const hit = pick(event);
      if (hit) select(hit.data.id);
    };
    const handleMove = (event: PointerEvent) => {
      if (event.buttons !== 0) return;
      renderer.domElement.style.cursor = pick(event) ? "pointer" : "grab";
    };
    renderer.domElement.addEventListener("click", handleClick);
    renderer.domElement.addEventListener("pointermove", handleMove);

    const offset = new THREE.Vector3();
    const desiredTarget = new THREE.Vector3();
    let frameHandle = 0;
    let previous = performance.now();

    const frame = (now: number) => {
      frameHandle = requestAnimationFrame(frame);
      const dt = Math.min((now - previous) / 1000, 1 / 30);
      previous = now;
      if (!visible.current || document.hidden) return;

      if (runningRef.current) {
        for (const planet of planets) {
          planet.angle += ((Math.PI * 2) / (EARTH_YEAR_SECONDS * planet.data.orbitalPeriodEarthYears)) * dt * speedRef.current;
          planet.mesh.position.set(Math.cos(planet.angle) * planet.distance, 0, Math.sin(planet.angle) * planet.distance);
          planet.mesh.rotation.y += dt * 0.6 * speedRef.current;
        }
      }

      const followed = planets.find((planet) => planet.data.id === selectedIdRef.current);
      if (followed) {
        selectRing.position.copy(followed.mesh.position);
        selectRing.lookAt(camera.position);
      }

      // La cible suit la planète choisie (ou revient au Soleil) ; la caméra
      // est translatée du même déplacement pour garder l'angle de vue de
      // l'utilisateur.
      const flight = flightRef.current;
      if (flight) {
        desiredTarget.copy(followed ? followed.mesh.position : new THREE.Vector3(0, 0, 0));
        const shift = desiredTarget.clone().sub(controls.target).multiplyScalar(FOLLOW_EASING);
        controls.target.add(shift);
        camera.position.add(shift);

        if (flight.kind === "planet") {
          offset.copy(camera.position).sub(controls.target);
          const length = offset.length();
          const next = length + (flight.distance - length) * 0.06;
          camera.position.copy(controls.target).add(offset.setLength(next));
          if (Math.abs(next - flight.distance) < 0.15 && shift.length() < 0.01) flightRef.current = null;
        } else {
          camera.position.lerp(OVERVIEW_POSITION, 0.06);
          if (camera.position.distanceTo(OVERVIEW_POSITION) < 0.2 && controls.target.length() < 0.05) flightRef.current = null;
        }
      } else if (followed && runningRef.current) {
        // Sans vol en cours, la caméra continue de suivre la planète en
        // orbite, sinon elle sortirait du cadre.
        const shift = followed.mesh.position.clone().sub(controls.target);
        controls.target.add(shift);
        camera.position.add(shift);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    frameHandle = requestAnimationFrame(frame);

    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    // La scène est construite une fois : les couleurs dépendantes du thème
    // sont relues à chaque bascule clair/sombre plutôt que de la recréer.
    const syncTheme = () => {
      const fresh = getComputedStyle(container).getPropertyValue("--bg-void").trim();
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (fresh) scene.background = new THREE.Color(fresh);
      for (const material of orbitMaterials) material.color.set(isLight ? 0x0e1220 : 0xeef1f8);
    };
    syncTheme();
    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      cancelAnimationFrame(frameHandle);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.domElement.removeEventListener("pointermove", handleMove);
      sceneApiRef.current = null;
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
  }, [select, visible]);

  const changeSpeed = useCallback((next: number) => {
    speedRef.current = next;
    setSpeedState(next);
  }, []);

  const changeOrbits = useCallback((next: boolean) => {
    setOrbitsVisibleState(next);
    sceneApiRef.current?.setOrbitsVisible(next);
  }, []);

  if (webglError) {
    return (
      <ExperienceLayout
        viewport={
          <Viewport ratio="4 / 3">
            <p className={styles.fallback}>{copy.webglError}</p>
          </Viewport>
        }
        panel={null}
      />
    );
  }

  return (
    <ExperienceLayout
      viewport={
        <Viewport ref={viewportRef} ratio="4 / 3">
          <div ref={containerRef} className={styles.scene} />
        </Viewport>
      }
      panel={
        <>
          <PanelSection title={copy.planets}>
            <ul className={styles.planetList}>
              {PLANETS.map((planet) => {
                const localized = localizePlanet(planet, lang);
                return (
                  <li key={planet.id}>
                    <button
                      type="button"
                      className={`${styles.planet} ${planet.id === selectedId ? styles.planetActive : ""}`}
                      aria-pressed={planet.id === selectedId}
                      onClick={() => select(planet.id === selectedId ? null : planet.id)}
                    >
                      <span className={styles.swatch} style={{ background: hexColor(planet.color) }} aria-hidden="true" />
                      {localized.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </PanelSection>
          <PanelSection>
            {selected ? (
              <div className={styles.card}>
                <p className={styles.cardType}>{selected.type}</p>
                <h4 className={styles.cardName}>{selected.name}</h4>
                <Readouts>
                  <Readout label={copy.diameter} value={`${selected.diameterKm.toLocaleString(copy.numberLocale)} km`} />
                  <Readout label={copy.distanceToSun} value={`${selected.distanceAu} ${copy.auUnit}`} />
                  <Readout label={copy.orbitalPeriod} value={selected.orbitalPeriodLabel} />
                </Readouts>
              </div>
            ) : (
              <p className={styles.hint}>{copy.hint}</p>
            )}
          </PanelSection>
          <PanelSection>
            <Slider
              label={copy.speed}
              value={speed}
              min={0.25}
              max={4}
              step={0.25}
              onChange={changeSpeed}
              format={(value) => `×${value}`}
            />
            <Segmented
              label={copy.orbits}
              value={orbitsVisible ? "show" : "hide"}
              options={[
                { value: "show", label: copy.orbitsShow },
                { value: "hide", label: copy.orbitsHide },
              ]}
              onChange={(value) => changeOrbits(value === "show")}
            />
            <ButtonRow>
              <Button primary onClick={() => setRunning(!running)}>
                {running ? copy.pause : copy.play}
              </Button>
              <Button onClick={() => select(null)}>{copy.overview}</Button>
            </ButtonRow>
          </PanelSection>
        </>
      }
      caption={copy.caption}
    />
  );
}
