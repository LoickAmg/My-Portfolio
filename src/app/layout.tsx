import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { STORAGE_KEYS } from "@/lib/storage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Satoshi (variable, 300-900) pour le texte et l'interface, Stardom pour les
// titres : deux familles, pas plus. Fichiers .woff2 officiels de Fontshare,
// livrés tels quels (la licence FFL interdit de les modifier ou de les
// sous-ensembler) et auto-hébergés — aucun appel réseau à l'exécution.
const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  weight: "300 900",
  display: "swap",
  variable: "--font-satoshi",
});

const stardom = localFont({
  src: "./fonts/Stardom-Regular.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-stardom",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: "%s — Mahouna" },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

// Script bloquant exécuté avant le premier rendu visible : lit le thème
// enregistré (localStorage) ou, à défaut, la préférence système, et pose
// data-theme sur <html> avant que la page ne s'affiche — évite le flash
// d'un thème puis de l'autre au chargement. Doit rester synchrone et sans
// dépendance externe.
const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(STORAGE_KEYS.theme)};var t=localStorage.getItem(k);if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

// Même principe que THEME_INIT_SCRIPT, pour la langue (sélecteur client
// FR/EN, roadmap i18n) : pose data-lang et lang sur <html> avant le premier
// rendu visible, d'après la préférence enregistrée (fr par défaut). Le
// contenu textuel lui-même reste rendu côté serveur en français (pas de
// routing par locale) — un utilisateur revenant en anglais peut donc voir
// un très bref flash de texte français avant que React ne se resynchronise
// juste après l'hydratation (useLanguage, cf. src/lib/useLanguage.ts).
const LANG_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(STORAGE_KEYS.lang)};var l=localStorage.getItem(k);if(l!=="en"&&l!=="fr"){l="fr";}document.documentElement.setAttribute("data-lang",l);document.documentElement.setAttribute("lang",l);}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      data-accent="p3r"
      className={`${satoshi.variable} ${stardom.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
