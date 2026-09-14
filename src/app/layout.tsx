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

// Script bloquant exécuté avant le premier rendu visible : lit le thème
// enregistré (localStorage) ou, à défaut, la préférence système, et pose
// data-theme sur <html> avant que la page ne s'affiche — évite le flash
// d'un thème puis de l'autre au chargement. Doit rester synchrone et sans
// dépendance externe.
const THEME_INIT_SCRIPT = `(function(){try{var k="portfolio-theme";var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" data-accent="p3r" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
