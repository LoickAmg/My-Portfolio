import type { Metadata } from "next";

// Polices auto-hébergées via @fontsource (fichiers embarqués dans le
// bundle, aucun appel réseau à l'exécution ni à la construction — plus
// robuste que next/font/google pour la CI et les environnements sans accès
// direct à fonts.googleapis.com).
import "@fontsource/anton/400.css";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mahouna — Portfolio",
  description: "[Une phrase d'intro à écrire ensemble.]",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-accent="p3r">
      <body>{children}</body>
    </html>
  );
}
