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
(dérivées du catalogue de projets) · 04 Signal (interpréteur de commandes
fonctionnel) · 05 Contact.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Framer Motion** pour les animations
- CSS Modules + tokens (`src/app/globals.css`) — pas de framework CSS
- Polices auto-hébergées via `@fontsource` (Anton, Sora, JetBrains Mono) —
  aucun appel réseau requis à la construction
- **Vitest** + **React Testing Library** pour les tests

## Structure

```
src/
  app/            Layout racine, tokens CSS globaux, page d'accueil
  components/     Rail de navigation, boîte de dialogue, composants de section
  data/           projects.json — source unique de vérité pour Projets/Compétences/Signal
  lib/            Types partagés, config des sections, interpréteur de commandes, calcul des compétences
```

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

Toutes les sections sont en place avec un contenu réel dérivé des projets
livrés (Projets, Compétences) ou explicitement marqué comme placeholder en
attente (bio, tagline, liens de contact). Tests, lint et build passent.
