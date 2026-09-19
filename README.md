# Personal Portfolio

Portfolio personnel — Next.js (App Router, TypeScript). Direction artistique
inspirée de **Persona 3 Reload** (palette bleu-nuit / bleu-lune, décision
finale) avec une structure narrative en « rail de navigation » et une
section **Signal** conçue comme une messagerie fonctionnelle plutôt qu'un
terminal hacker classique.

Certaines informations réelles (bio, tagline, liens de contact) n'ont pas
encore été fournies : elles apparaissent explicitement comme `[...]` dans
l'interface plutôt que d'être inventées. Les sections Projets et
Compétences, elles, sont **réelles** — dérivées directement des projets
effectivement livrés (voir `src/data/projects.json`).

## Sections

00 Index (hero + boîte de dialogue interactive) · 01 Projets (grille
dynamique, filtrable par technologie) · 02 Méthode · 03 Compétences
(dérivées du catalogue de projets) · 04 Playground (cinq expériences
interactives) · 05 Signal (interpréteur de commandes fonctionnel) ·
06 Contact.

Hors de la page principale : trois documents légaux (`/mentions-legales`,
`/confidentialite`, `/cgu`), une page 404 et une page d'erreur sur mesure,
`sitemap.xml`, `robots.txt` et une image de partage générée au build.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Framer Motion** pour les animations
- CSS Modules + tokens (`src/app/globals.css`) — pas de framework CSS
- Polices auto-hébergées via `next/font/local` : **Stardom** (titres) et
  **Satoshi** (texte et interface), fichiers `.woff2` de Fontshare sous
  licence ITF FFL, fournis tels quels. Ils ne sont pas dans le dépôt (la licence
  interdit de les redistribuer) : `scripts/fetch-fonts.mjs` les télécharge depuis
  Fontshare avant `dev` et `build`. Aucun appel réseau à l'exécution.
- **Three.js** pour le système solaire, chargé à la demande
- **Vitest** + **React Testing Library** pour les tests

## Structure

```
src/
  app/            Layout racine, tokens CSS globaux, page d'accueil
  components/     Rail de navigation, boîte de dialogue, composants de section
  data/           projects.json — source unique de vérité pour Projets/Compétences/Signal
  components/playground/  Cinq expériences + kit commun (contrôles, hooks canvas)
  components/legal/       Gabarit des documents légaux
  lib/            Types partagés, config des sections, interpréteur de commandes,
                  logique pure des jeux et du réseau de neurones (testée)
docs/             A-COMPLETER.md : ce qu'il reste à fournir avant la mise en ligne
```

## Copie

Les règles d'écriture (voix, faits calculés, motifs interdits) sont dans
`docs/VOIX-ET-COPIE.md` ; `npm run test` les vérifie sur tous les textes.

## Scènes

Chaque section est une scène avec sa propre composition et son propre rythme
vertical (pas de gabarit répété) ; son chiffre romain et son nom d'arcane
l'ouvrent (`SceneHeader`). Les chiffres affichés (nombre de projets, usage de
Python et de Rust, nombre de technologies, projets par technologie) sont
**calculés** depuis `src/data/projects.json`, jamais écrits en dur.

- **Index** : titre imposant et grande carte « 0 · Le Fou » avec la boîte de dialogue.
- **Projets** : table réglée à titre collant, détail Problème / Décision / Preuve.
- **Méthode** : chaque règle face à sa preuve, sur un fond en biais.
- **Compétences** : classement des technologies par nombre de projets.
- **Playground**, **Signal**, **Contact** : voir plus bas et `docs/A-COMPLETER.md`.

## Menu en cartes de tarot

Chaque section est un arcane majeur (`src/lib/arcana.ts`) : 0 Le Fou (Index),
I Le Magicien (Projets), XI La Justice (Méthode), VIII La Force (Compétences),
X La Fortune (Playground), XVIII La Lune (Signal), XX Le Jugement (Contact).
Le bouton du rail (ou « Menu » sur mobile) ouvre une main de cartes en
éventail, ou une grille de cartes sur petit écran. Les sept illustrations
(`components/arcana/ArcanaGlyph.tsx`) sont dessinées pour ce site : aucun
visuel du tarot classique ni d'un jeu n'est repris.

Accessibilité : dialogue modal, focus piégé et rendu au bouton à la fermeture,
flèches / Début / Fin pour naviguer, Échap pour fermer, une seule carte active
à la fois (souris et clavier), animations coupées sous
`prefers-reduced-motion`.

## Playground

Chaque expérience réécrit, en TypeScript, le principe d'un projet du
catalogue, et se charge à la demande :

- **Réseau de neurones** : perceptron multicouche avec rétropropagation écrite
  à la main, dont les gradients sont vérifiés par *gradient checking* dans les
  tests ; carte de prédiction en temps réel, courbe de perte.
- **Système solaire** (3D) : caméra qui suit la planète choisie, fiche,
  vitesse, orbites.
- **Double pendule** : mode « jumeau » (effet papillon), réglages physiques,
  dérive d'énergie mesurée.
- **Puissance 4** : minimax à trois niveaux, annulation, bilan par niveau.
- **Snake** : mode traversée, trois vitesses, commandes tactiles.

Les scores sont gardés dans le navigateur (`localStorage`) ; la liste des clés
est centralisée dans `src/lib/storage.ts` et affichée dans la page de
confidentialité.

## Direction artistique

- Fonds bleu-nuit (`--bg-void`, `--bg-panel`, ...), encre quasi-blanche
  (`--ink`), accent bleu-lune (`--moon-blue`) — palette Persona 3 Reload.
- Un attribut `data-accent` sur `<html>` (`"p3r"` par défaut, seule valeur
  active) porte une architecture d'accent réversible : un accent rouge
  Persona 5 Royal (`"p5"`) est câblé dans les tokens CSS mais **non
  utilisé**, pour garder ce choix disponible sans réécrire le CSS si on le
  redemande explicitement plus tard. Ne pas changer la valeur par défaut
  sans nouvelle décision explicite.
- Aucun élément visuel ne doit donner un effet « généré par IA » (règle
  absolue du projet).
- Aucune ressource propriétaire tierce (police, artwork, code) n'est
  réutilisée telle quelle : la DA s'en inspire sans reproduire d'éléments
  protégés.

## Données dynamiques

Les sections Projets, Compétences et la commande `projets` de Signal lisent
toutes `src/data/projects.json`, une source de données unique. Ajouter un
projet à ce fichier suffit à le faire apparaître dans les trois endroits,
sans dupliquer l'information.

## Développement

```bash
npm install
npm run dev       # serveur de développement
npm run lint      # ESLint
npm run test      # Vitest (tests unitaires + composants)
npm run build     # build de production
```

## CI

`.github/workflows/ci.yml` exécute lint, tests et build sur chaque push et
pull request vers `main`.

## État d'avancement

Toutes les sections sont en place. Les informations que seule la personne
éditrice peut fournir (identité légale, hébergeur, LinkedIn…) sont marquées
`[À COMPLÉTER : …]` ou `[...]` : la liste complète est dans
`docs/A-COMPLETER.md`. Lint, tests et build passent.
