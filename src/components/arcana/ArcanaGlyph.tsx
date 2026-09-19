import type { ReactNode } from "react";
import styles from "./ArcanaGlyph.module.css";

// Une illustration géométrique par arcane, dessinée pour ce site : formes
// anguleuses en trait fin, accent bleu-lune sur l'élément qui porte le sens.
// Aucune reprise d'un visuel existant (tarot classique ou jeu).

const LEMNISCATE_TOP =
  "M60 28 C50 12 26 12 26 28 C26 44 50 44 60 28 C70 12 94 12 94 28 C94 44 70 44 60 28";

const LEMNISCATE_CENTER =
  "M60 60 C52 44 32 44 32 60 C32 76 52 76 60 60 C68 44 88 44 88 60 C88 76 68 76 60 60";

// Croissant : cercle C1 (60,58, r=40) privé du cercle C2 (78,50, r=34). Les
// deux points d'intersection sont calculés, l'arc extérieur de C1 puis l'arc
// intérieur de C2 ferment la forme.
const CRESCENT = "M65.5 18.4 A40 40 0 1 0 93.1 80.5 A34 34 0 1 1 65.5 18.4 Z";

function spokes(count: number, inner: number, outer: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 2 * Math.PI) / count;
    return {
      x1: +(60 + Math.cos(angle) * inner).toFixed(2),
      y1: +(60 + Math.sin(angle) * inner).toFixed(2),
      x2: +(60 + Math.cos(angle) * outer).toFixed(2),
      y2: +(60 + Math.sin(angle) * outer).toFixed(2),
    };
  });
}

const GLYPHS: Record<string, ReactNode> = {
  // Le Fou : le losange de la marque, un pas au bord du vide, un soleil.
  index: (
    <>
      <polygon points="60,8 112,60 60,112 8,60" />
      <polygon points="60,40 80,60 60,80 40,60" className={styles.accentFill} />
      <circle cx="92" cy="28" r="6" className={styles.accent} />
      <polyline points="20,98 44,98 44,86" />
    </>
  ),

  // Le Magicien : l'infini au-dessus d'une table portant quatre objets.
  projets: (
    <>
      <path d={LEMNISCATE_TOP} className={styles.accent} />
      <circle cx="30" cy="72" r="6" />
      <polygon points="44,78 50,66 56,78" />
      <rect x="64" y="66" width="12" height="12" />
      <polygon points="90,64 96,72 90,80 84,72" />
      <line x1="16" y1="88" x2="104" y2="88" />
      <path d="M28 88 V106 M92 88 V106" />
    </>
  ),

  // La Justice : une balance, un pilier, une épée dressée.
  methode: (
    <>
      <line x1="60" y1="20" x2="60" y2="106" />
      <polygon points="60,6 66,13 60,20 54,13" className={styles.accentFill} />
      <line x1="20" y1="34" x2="100" y2="34" />
      <polygon points="20,34 10,62 30,62" />
      <polygon points="100,34 90,62 110,62" />
      <line x1="38" y1="106" x2="82" y2="106" />
    </>
  ),

  // La Force : un hexagone qui contient un infini maîtrisé.
  competences: (
    <>
      <polygon points="60,8 104,34 104,86 60,112 16,86 16,34" />
      <path d={LEMNISCATE_CENTER} className={styles.accent} />
      <circle cx="60" cy="60" r="3" className={styles.accentFill} />
    </>
  ),

  // La Fortune : une roue à huit rayons, quatre repères sur les axes.
  playground: (
    <>
      <circle cx="60" cy="60" r="44" />
      <circle cx="60" cy="60" r="14" className={styles.accent} />
      {spokes(8, 14, 44).map((line, index) => (
        <line key={index} {...line} />
      ))}
      <polygon points="60,4 64,10 60,16 56,10" className={styles.accentFill} />
      <polygon points="60,104 64,110 60,116 56,110" className={styles.accentFill} />
      <polygon points="4,60 10,56 16,60 10,64" className={styles.accentFill} />
      <polygon points="104,60 110,56 116,60 110,64" className={styles.accentFill} />
    </>
  ),

  // La Lune : un croissant, deux tours, un chemin.
  signal: (
    <>
      <g transform="translate(60 44) scale(0.8) translate(-60 -58)">
        <path d={CRESCENT} className={styles.accent} />
      </g>
      <rect x="14" y="86" width="16" height="22" />
      <rect x="90" y="86" width="16" height="22" />
      <path d="M60 108 V82" strokeDasharray="4 5" />
    </>
  ),

  // Le Jugement : un appel qui rayonne du haut, trois tombes qui s'ouvrent.
  contact: (
    <>
      <polygon points="60,6 66,13 60,20 54,13" className={styles.accentFill} />
      <line x1="60" y1="24" x2="14" y2="72" />
      <line x1="60" y1="24" x2="37" y2="72" />
      <line x1="60" y1="24" x2="60" y2="72" className={styles.accent} />
      <line x1="60" y1="24" x2="83" y2="72" />
      <line x1="60" y1="24" x2="106" y2="72" />
      <rect x="14" y="88" width="20" height="20" />
      <rect x="50" y="88" width="20" height="20" className={styles.accent} />
      <rect x="86" y="88" width="20" height="20" />
    </>
  ),
};

export default function ArcanaGlyph({ sectionId }: { sectionId: string }) {
  return (
    <svg className={styles.glyph} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      {GLYPHS[sectionId] ?? null}
    </svg>
  );
}
