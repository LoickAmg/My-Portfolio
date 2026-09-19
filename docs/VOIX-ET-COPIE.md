# Voix et copie

Règles d'écriture du site, issues du protocole anti-générique (partie 1.5).
Un test les applique : `src/lib/__tests__/copy.test.ts` relit tous les textes
de l'interface, en français et en anglais, ainsi que les fiches projets.

## Voix

- **Tutoiement** dans toute l'interface : scènes, Playground, menu, messages
  d'erreur, Signal. Le site est personnel et se lit comme une conversation.
- **Vouvoiement** réservé aux trois documents légaux, où il est de
  convention (`src/app/mentions-legales`, `confidentialite`, `cgu`).
- Phrases courtes, verbes concrets, un fait par phrase.
- Un libellé d'action nomme son objet : « Voir les projets phares »,
  « M'écrire », pas « Commencer » ou « En savoir plus ».

## Faits

- Aucun chiffre n'est écrit en dur dans un texte : nombre de projets,
  usage de Python et de Rust, nombre de technologies, projets par
  technologie sont **calculés** depuis `src/data/projects.json`.
- Une information inconnue reste visible : `[À COMPLÉTER : …]` dans les pages
  légales, « à confirmer » pour LinkedIn. Rien n'est deviné.
- Un élément d'interface ne prétend pas être ce qu'il n'est pas : le
  terminal Signal dit « Prêt », pas « En ligne » ; il n'y a pas de
  « Connexion établie » puisqu'aucune connexion n'existe.

## À éviter (le test échoue)

| Motif | Exemple refusé | À la place |
|---|---|---|
| Buzzwords | révolutionnaire, game-changer, tout-en-un, passionné | le fait concret |
| Triplet creux | « Simple. Rapide. Efficace. » | une seule information vérifiable |
| Contraste « pas X, mais Y » | « Documenter les limites, pas seulement les fonctionnalités » | l'affirmation seule : « Documenter ce qui n'est pas garanti » |
| Auto-éloge | honnêtement, réellement, « simulation honnête » | montrer la preuve : « caméra thermique simulée » |
| Preuve sociale inventée | « 10 000 utilisateurs satisfaits » | rien, ou un chiffre calculé |
| Libellé générique | Commencer, En savoir plus, Essayer | « Voir les projets phares » |
| Vouvoiement dans l'interface | « Choisissez une carte » | « Choisis une carte » |

## Ajouter un texte

1. L'écrire dans `src/lib/i18n.ts`, dans les deux langues (le typage force
   la parité des clés).
2. Lancer `npm run test` : le garde-fou de copie signale tout motif refusé.
3. Ne jamais ajouter un texte au garde-fou pour le faire passer : réécrire.
