import styles from "./FoolReveal.module.css";

// Face cachée de la carte du Fou, révélée sous le pointeur dans le Hero.
// Dessinée pour ce site : un soleil dont les rayons couvrent la carte, un
// chapeau à trois pointes, un œil dans un losange, deux ailes en plumes
// anguleuses et le motif d'arlequin en bas. Mêmes formes anguleuses en trait
// fin que les illustrations d'ArcanaGlyph.

const SUN = { x: 100, y: 74 };

// Rayons du soleil : un sur trois est plus marqué. Les extrémités sortent du
// cadre, la carte les coupe.
const RAYS = Array.from({ length: 24 }, (_, index) => {
  const angle = (index * 2 * Math.PI) / 24 + Math.PI / 24;
  return {
    x1: +(SUN.x + Math.cos(angle) * 58).toFixed(2),
    y1: +(SUN.y + Math.sin(angle) * 58).toFixed(2),
    x2: +(SUN.x + Math.cos(angle) * 420).toFixed(2),
    y2: +(SUN.y + Math.sin(angle) * 420).toFixed(2),
    heavy: index % 3 === 0,
  };
});

// Une aile faite de quatre plumes qui s'éventent vers l'extérieur. Dessinée
// pour le côté gauche ; la droite en est le reflet.
const FEATHERS = [
  "70,112 36,92 10,96 44,118",
  "70,126 30,112 8,122 46,138",
  "70,140 30,132 12,148 50,156",
  "72,152 40,156 26,172 60,172",
];

function Wing() {
  return (
    <>
      {FEATHERS.map((points) => (
        <polygon key={points} points={points} className={styles.line} />
      ))}
    </>
  );
}

export default function FoolReveal() {
  return (
    <svg
      className={styles.art}
      viewBox="0 0 200 320"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="fool-lattice" width="28" height="40" patternUnits="userSpaceOnUse">
          <polygon points="14,0 28,20 14,40 0,20" className={styles.tint} />
        </pattern>
      </defs>

      <rect width="200" height="320" className={styles.field} />

      {RAYS.map((ray) => (
        <line
          key={`${ray.x2}-${ray.y2}`}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          className={ray.heavy ? styles.rayHeavy : styles.ray}
        />
      ))}
      <circle cx={SUN.x} cy={SUN.y} r="52" className={styles.sun} />

      <rect x="0" y="196" width="200" height="124" className={styles.field} />
      <rect x="0" y="196" width="200" height="124" fill="url(#fool-lattice)" />
      <line x1="0" y1="196" x2="200" y2="196" className={styles.line} />

      <g>
        <Wing />
      </g>
      <g transform="translate(200 0) scale(-1 1)">
        <Wing />
      </g>

      <polygon points="68,88 78,56 90,80 100,46 110,80 122,56 132,88" className={styles.line} />
      <circle cx="78" cy="54" r="3" className={styles.accentFill} />
      <circle cx="100" cy="44" r="3" className={styles.accentFill} />
      <circle cx="122" cy="54" r="3" className={styles.accentFill} />

      <polygon points="100,92 128,126 100,160 72,126" className={styles.field} />
      <polygon points="100,92 128,126 100,160 72,126" className={styles.line} />
      <path d="M82 126 Q100 108 118 126 Q100 144 82 126 Z" className={styles.line} />
      <circle cx="100" cy="126" r="9" className={styles.accent} />
      <circle cx="100" cy="126" r="3.5" className={styles.accentFill} />

      <polyline points="22,298 84,298 84,280" className={styles.accent} />
    </svg>
  );
}
