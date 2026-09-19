"use client";

// Dernier filet : remplace tout le document (layout compris), donc ni polices,
// ni feuilles de style globales, ni dictionnaire de langue ne sont disponibles
// ici. Version minimale en français, autonome, avec les couleurs du thème
// sombre par défaut.

const COLORS = {
  background: "#0a0d18",
  ink: "#eef1f8",
  inkMuted: "rgba(238, 241, 248, 0.7)",
  accent: "#4d6bff",
  accentInk: "#0a0d18",
};

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: COLORS.background,
          color: COLORS.ink,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: 480 }}>
          <h1 style={{ margin: "0 0 12px", fontSize: 32, fontWeight: 600 }}>Un incident est survenu</h1>
          <p style={{ margin: "0 0 24px", lineHeight: 1.6, color: COLORS.inkMuted }}>
            Le site n&apos;a pas pu s&apos;afficher. Ce n&apos;est pas de ta faute : réessaie dans un instant.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              padding: "12px 22px",
              border: "none",
              background: COLORS.accent,
              color: COLORS.accentInk,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          {error.digest && (
            <p style={{ margin: "24px 0 0", fontSize: 12, color: COLORS.inkMuted }}>
              Référence : {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
