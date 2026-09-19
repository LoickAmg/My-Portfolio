# À compléter avant la mise en ligne

Ce document liste tout ce que seule la personne éditrice du site peut fournir
ou vérifier. Chaque point est repérable dans le code : les pages légales
affichent un marqueur visible `[À COMPLÉTER : …]`, qui doit avoir disparu
avant publication.

Pour retrouver tous les marqueurs restants :

```bash
grep -rn "À COMPLÉTER" src
```

## 1. Pages légales

Fichiers : `src/app/mentions-legales/page.tsx`, `src/app/confidentialite/page.tsx`,
`src/app/cgu/page.tsx`.

| Où | Information à fournir |
|---|---|
| Mentions légales, §01 | Nom et prénom complets, statut (particulier ou entrepreneur individuel avec numéro SIRET), adresse postale |
| Mentions légales, §02 | Directeur de la publication, si différent de l'éditeur |
| Mentions légales, §03 | Hébergeur : nom, adresse, contact |
| Confidentialité, §04 | Durée de conservation des échanges par email |
| Confidentialité, §05 | Hébergeur : journaux conservés et durée |
| CGU, §08 | Ville ou ressort du tribunal compétent |

Le site présente une recherche de poste et de missions freelance : c'est une
activité professionnelle, donc l'identité complète de l'éditeur est en
principe exigée (loi pour la confiance dans l'économie numérique, art. 6-III).
Un particulier non professionnel peut, lui, se limiter aux coordonnées de
l'hébergeur. À faire valider selon votre situation.

**Ces textes sont un modèle de départ, pas un avis juridique.** Faites-les
relire avant publication, en particulier :

- l'absence de bandeau de cookies (justifiée par le fait que le site ne dépose
  aucun cookie ni traceur, seulement des préférences locales) ;
- la base légale et la durée de conservation des emails reçus.

Quand tout est rempli, passez `LEGAL_PAGES_READY` à `true` dans
`src/lib/site.ts` : les trois pages deviennent indexables et entrent dans le
sitemap. Tant qu'il vaut `false`, elles sont en `noindex` et absentes du
sitemap.

## 2. Contenu du portfolio

| Où | Information à fournir |
|---|---|
| Section Contact | Lien LinkedIn (aujourd'hui « à confirmer ») |
| Titre du Hero, introduction, méta-description | Réécrits pour ne contenir que des faits vérifiables dans le catalogue (« 37 projets livrés », « surtout en Python et en Rust », « chaque projet publié sur GitHub »). **À relire et valider : c'est votre voix.** Ancien titre : « je construis pour durer » ; ancienne introduction : « systèmes fiables, testés et documentés, du prototype à la mise en production » |
| Ton de la voix | Tutoiement dans l'interface, vouvoiement dans les documents légaux (voir `docs/VOIX-ET-COPIE.md`). À confirmer |
| Bio, tagline, liens | Les valeurs `[...]` restantes de l'interface (`src/lib/i18n.ts`) |

## 3. Déploiement

Site en ligne : <https://my-portfolio-lemon-sigma-84.vercel.app>

| Sujet | État |
|---|---|
| Adresse du site | Détectée automatiquement sur Vercel (`VERCEL_PROJECT_PRODUCTION_URL`). Pour un domaine personnalisé, définir `NEXT_PUBLIC_SITE_URL` dans les variables du projet Vercel |
| HTTPS | En place (Vercel, HSTS actif) |
| Polices | Téléchargées depuis Fontshare pendant le build (`prebuild`) |
| Mesure d'audience | Aucune aujourd'hui. Si vous en ajoutez une : mettre à jour la page de confidentialité **avant**, et prévoir un consentement si l'outil dépose des traceurs |
| Avant de communiquer l'adresse | Compléter le lien LinkedIn (« à confirmer » est visible sur la page d'accueil). Les pages légales sont en `noindex` tant qu'elles contiennent des `[À COMPLÉTER]` |

## 4. Polices : licence

Satoshi et Stardom (© Indian Type Foundry, licence ITF Free Font License)
sont autorisées pour un usage commercial et l'auto-hébergement sur votre
propre site. En revanche la licence **interdit** de modifier les fichiers
(pas de sous-ensemble, pas de conversion) et de les **redistribuer**, y
compris via un dépôt public.

Le dépôt étant public, `src/app/fonts/` est dans `.gitignore` : les fichiers
ne sont jamais poussés. `scripts/fetch-fonts.mjs` les télécharge depuis
Fontshare, sans les modifier, quand ils manquent : automatiquement avant
`npm run dev` et `npm run build` (`predev`, `prebuild`), ou à la demande avec
`npm run fonts`. Un déploiement (GitHub Actions, hébergeur) les récupère donc
lui-même au build ; il lui faut un accès réseau à `api.fontshare.com`.

## 5. Vérifications finales (protocole anti-générique)

- [ ] Aucun marqueur `À COMPLÉTER` restant
- [ ] `LEGAL_PAGES_READY = true`
- [x] Adresse du site en production (détectée sur Vercel)
- [x] Audit des textes : fait, et appliqué en continu par `src/lib/__tests__/copy.test.ts`
- [x] Contraste des couleurs : texte à 4,5:1 ou plus dans les deux thèmes (`--ink-40` et `--ink-25` restent réservés aux filets et séparateurs, jamais au texte)
- [ ] Test sur mobile réel
- [ ] Lien LinkedIn renseigné
