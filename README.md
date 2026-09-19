# Personal Portfolio

[![CI](https://github.com/LoickAmg/My-Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/LoickAmg/My-Portfolio/actions/workflows/ci.yml)

Portfolio d'un ingénieur IA, en français et en anglais : le catalogue des projets
livrés, la méthode qui les relie, et cinq expériences interactives jouables dans
le navigateur. Next.js (App Router) et TypeScript, sans framework CSS.

**Site en ligne : <https://my-portfolio-lemon-sigma-84.vercel.app>**

Chaque section est une carte d'un jeu de tarot, avec son menu de navigation en
éventail, dans une direction artistique inspirée de Persona 3 Reload et de
Persona 5 Royal (voir [Crédits](#licence-et-crédits)).

## Sections

00 Index · 01 Projets · 02 Méthode · 03 Compétences · 04 Playground ·
05 Signal · 06 Contact.

Hors de la page principale : trois documents légaux (`/mentions-legales`,
`/confidentialite`, `/cgu`), une page 404 et une page d'erreur sur mesure,
`sitemap.xml`, `robots.txt` et une image de partage générée au build.

## Démarrer

Prérequis : Node 22 (la version utilisée par la CI) et un accès réseau à
`api.fontshare.com` au premier lancement (voir [Polices](#polices)).

```bash
npm install
npm run dev       # serveur de développement, http://localhost:3000
npm run lint      # ESLint
npm run test      # Vitest : logique, composants, garde-fou de copie
npm run build     # build de production
npm run start     # sert le build
```

Le site est déployé sur Vercel. `sitemap.xml`, `robots.txt` et les images de
partage exigent une adresse absolue : `src/lib/site.ts` prend `NEXT_PUBLIC_SITE_URL`
si elle est définie (pour un domaine personnalisé, par exemple
`https://mon-domaine.fr`), sinon le domaine de production que Vercel fournit
au build, sinon `localhost` en développement.

## Stack

- **Next.js 16** (App Router) et **TypeScript**
- CSS Modules et jetons dans `src/app/globals.css`, thèmes clair et sombre
- **Three.js** pour le système solaire, chargé à la demande ; le reste du
  Playground est en canvas 2D
- **Lenis** pour le défilement lissé, désactivé sous `prefers-reduced-motion`
- **Vitest** et **React Testing Library** pour les tests
- Animations en CSS uniquement, et seulement quand elles orientent l'attention

### Polices

**Stardom** (titres) et **Satoshi** (texte et interface) viennent de Fontshare,
sous licence ITF Free Font License. Cette licence interdit de les redistribuer :
elles ne sont **pas** dans le dépôt. `scripts/fetch-fonts.mjs` les télécharge
depuis Fontshare, sans les modifier, avant `dev` et `build` quand elles
manquent (ou à la demande avec `npm run fonts`). Une fois téléchargées, elles
sont servies par le site lui-même : aucun appel à un service tiers à
l'exécution.

## Structure

```
src/
  app/                 Layout racine, jetons CSS, page d'accueil, pages légales,
                       404 et erreurs, sitemap, robots, images de partage
  components/
    sections/          Les scènes : Hero, Projets, Méthode, Compétences,
                       Playground, Signal, Contact, et leur en-tête commun
    playground/        Les cinq expériences et leur kit (contrôles, hooks canvas)
    arcana/            Face des cartes et illustrations
    legal/             Gabarit des documents légaux
    ArcanaMenu.tsx     Menu en cartes ; RailNav.tsx : rail de navigation
  data/                projects.json, source unique des projets
  lib/                 Dictionnaire FR/EN, logique pure (jeux, réseau de
                       neurones), interpréteur de commandes, constantes du site
docs/                  Voix et copie, liste de ce qu'il reste à fournir
scripts/               Récupération des polices
```

## Scènes et menu

Chaque section est une scène avec sa propre composition et son propre rythme
vertical ; son chiffre romain et son nom d'arcane l'ouvrent. Le menu associe
chaque section à un arcane majeur (`src/lib/arcana.ts`) : 0 Le Fou (Index),
I Le Magicien (Projets), XI La Justice (Méthode), VIII La Force (Compétences),
X La Fortune (Playground), XVIII La Lune (Signal), XX Le Jugement (Contact).

Le bouton du rail (« Menu » sur mobile) ouvre une main de cartes en éventail,
ou une grille sur petit écran. Les sept illustrations sont dessinées pour ce
site, sans reprendre de visuel existant.

Accessibilité : dialogue modal, focus piégé puis rendu au bouton, flèches,
Début, Fin et Échap, une seule carte active à la fois, animations coupées sous
`prefers-reduced-motion`, textes à 4,5:1 de contraste ou plus dans les deux
thèmes.

## Playground

Chaque expérience réécrit, en TypeScript, le principe d'un projet du
catalogue :

- **Réseau de neurones** : perceptron multicouche avec rétropropagation écrite
  à la main, dont les gradients sont vérifiés par *gradient checking* dans les
  tests ; carte de prédiction en temps réel, courbe de perte.
- **Système solaire** (3D) : caméra qui suit la planète choisie, fiche,
  vitesse, orbites.
- **Double pendule** : mode « jumeau » (effet papillon), réglages physiques,
  dérive d'énergie mesurée.
- **Puissance 4** : minimax à trois niveaux, annulation, bilan par niveau.
- **Snake** : mode traversée, trois vitesses, commandes tactiles.

Les scores restent dans le navigateur (`localStorage`). La liste des clés est
centralisée dans `src/lib/storage.ts` et affichée dans la page de
confidentialité, qui ne peut donc pas s'en écarter (un test le vérifie).

## Données et textes

`src/data/projects.json` est la source unique : les sections Projets et
Compétences, la commande `projets` de Signal et tous les chiffres affichés
(nombre de projets, usage de Python et de Rust, nombre de technologies, projets
par technologie, méta-description) en sont **calculés**, jamais écrits en dur.
Ajouter un projet à ce fichier suffit à le faire apparaître partout.

Les règles d'écriture (voix, faits calculés, motifs interdits) sont dans
[`docs/VOIX-ET-COPIE.md`](docs/VOIX-ET-COPIE.md) ; `npm run test` les applique à
tous les textes de l'interface, en français et en anglais.

## Direction artistique

- Fonds bleu-nuit, encre quasi blanche, accent bleu-lune : la palette de
  Persona 3 Reload. Un accent rouge de Persona 5 Royal est câblé dans les
  jetons (`data-accent="p5"`) mais n'est pas activé ; le défaut est `p3r`.
- Persona 5 Royal inspire les formes : découpes en angle, plaques inclinées.
- Choix écartés : fond blanc pur, dégradés décoratifs, ombres portées, flous,
  grille de points, verre dépoli, curseur personnalisé.
- Deux polices seulement, chacune avec un rôle.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) exécute lint, tests et
build sur chaque push et chaque pull request vers `main`. Le build télécharge
les polices depuis Fontshare.

## État d'avancement

Toutes les sections sont en place. Ce que seul l'éditeur du site peut fournir
(identité légale, hébergeur, lien LinkedIn) est marqué `[À COMPLÉTER : …]` dans
les pages légales, qui restent en `noindex` tant qu'il en reste. La liste
complète est dans [`docs/A-COMPLETER.md`](docs/A-COMPLETER.md).

## Licence et crédits

- Code : licence MIT, voir [`LICENSE`](LICENSE).
- Polices Stardom et Satoshi © Indian Type Foundry, licence ITF FFL (voir
  [Polices](#polices)).
- Persona, Persona 3 Reload et Persona 5 Royal sont des marques de leurs
  titulaires (ATLUS, SEGA). Ce site est indépendant : il n'est ni affilié, ni
  approuvé, ni sponsorisé par ces sociétés, et ne reprend aucune illustration,
  musique ni ressource tirée de ces jeux.
