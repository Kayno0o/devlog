---
title: "Une page, cinq frameworks : aucun ne gagne partout"
description: "J'ai chronométré la même page produits en Next.js, Nuxt, Astro, Svelte et Solid : navigateur, serveur et build, avec le code que chacun demande."
date: 2026-10-19
updated: 2026-11-10
tags: [benchmarks]
draft: false
---

J'ai chronométré la même page de produits, à partir des mêmes données, dans Next.js, Nuxt, Astro, Svelte et SolidJS, dans le navigateur, sur le serveur et au build. Aucun framework ne gagne sur tous les tableaux, et les raisons tiennent à la façon dont chacun rend et hydrate. Chaque page est écrite comme le feraient la doc du framework et son entrée du js-framework-benchmark, et tout a tourné sur la même machine, un Ryzen 5 7600 (12 threads) sous Linux.

## Hydrater toute la page envoie ses données deux fois

<BarChart
  title="Temps de script au chargement, page produits"
  unit="ms"
  better="lower"
  rows={[
    {"label": "Astro", "value": 1.3},
    {"label": "Nuxt", "value": 5.2},
    {"label": "SolidJS", "value": 10.8},
    {"label": "Svelte", "value": 14.3},
    {"label": "Next.js", "value": 18.6}
  ]}
  bench="syntheticNeutral"
/>

Astro n'hydrate que ses deux islands Solid. SolidJS, Svelte et Nuxt hydratent toute la page, et renvoient donc ses données une deuxième fois en JSON, et Next.js envoie le payload de ses composants en flux avec le HTML.

<BarChart
  title="HTML envoyé, page produits, gzip"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "Astro", "value": 10.3},
    {"label": "Svelte", "value": 15.7},
    {"label": "SolidJS", "value": 21.6},
    {"label": "Nuxt", "value": 23.5},
    {"label": "Next.js", "value": 23.6}
  ]}
  bench="syntheticNeutral"
/>

<BarChart
  title="JS envoyé, page tableau, gzip"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "SolidJS", "value": 8.2},
    {"label": "Astro", "value": 9.6},
    {"label": "Svelte", "value": 22.5},
    {"label": "Nuxt", "value": 72.3},
    {"label": "Next.js", "value": 134.3}
  ]}
  bench="syntheticNeutral"
/>

L'island d'Astro est exactement le même tableau Solid que l'app SolidJS, et aucune des deux n'embarque de routeur.

<BenchTable
  title="Opérations sur le tableau"
  unit="ms"
  columns={["SolidJS", "Svelte", "Astro", "Next.js", "Nuxt"]}
  rows={[
    {"label": "Créer 1 000 lignes", "values": [26.9, 26.1, 26.4, 29.9, 26.4]},
    {"label": "Remplacer 1 000 lignes", "values": [24.3, 25.9, 24.5, 29.9, 27.4]},
    {"label": "Mettre à jour une ligne sur 10", "values": [2.7, 2.6, 2.6, 4.1, 3.5]},
    {"label": "Sélectionner une ligne", "values": [0.3, 1, 0.3, 1.2, 0.7]},
    {"label": "Échanger deux lignes", "values": [2.1, 2.1, 1.9, 20.4, 2.5]},
    {"label": "Supprimer une ligne", "values": [2, 2.2, 1.9, 3.2, 4.4]},
    {"label": "Créer 10 000 lignes", "values": [226, 232, 234, 360, 266]},
    {"label": "Ajouter 1 000 lignes", "values": [22.9, 23.4, 23.1, 26.6, 25.4]},
    {"label": "Vider 1 000 lignes", "values": [2.6, 3.2, 2.5, 5, 4.2]}
  ]}
  bench="syntheticNeutral"
/>

## Next.js ne rend qu'à travers son propre serveur

<BarChart
  title="Rendu serveur, page produits"
  unit="rendus/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "Svelte", "value": 3861},
    {"label": "Astro", "value": 1898},
    {"label": "SolidJS", "value": 1712},
    {"label": "Nuxt", "value": 583}
  ]}
  bench="syntheticNeutral"
/>

Le rendu est mesuré dans le processus, donc Next.js n'y figure pas : chacun de ses rendus paierait un aller-retour réseau que les autres n'ont pas.

## Un nombre de lignes mesure surtout le formateur

<BarChart
  title="Code écrit, pages produits et tableau"
  unit="K caractères"
  better="lower"
  digits={1}
  rows={[
    {"label": "Nuxt", "value": 2.9},
    {"label": "Svelte", "value": 3.3},
    {"label": "Astro", "value": 3.4},
    {"label": "SolidJS", "value": 3.7},
    {"label": "Next.js", "value": 4.1}
  ]}
  bench="syntheticNeutral"
  source="sans les espaces ni les commentaires, ni la glue serveur du benchmark"
/>

Le code est donc compté en caractères : Prettier seul fait passer l'app Svelte de 70 à 130 lignes.

## Un build sans serveur reste petit

<BarChart
  title="Temps de build de production"
  unit="s"
  better="lower"
  digits={2}
  rows={[
    {"label": "Svelte", "value": 0.09},
    {"label": "SolidJS", "value": 0.14},
    {"label": "Astro", "value": 1.19},
    {"label": "Next.js", "value": 2.18},
    {"label": "Nuxt", "value": 2.58}
  ]}
  bench="syntheticNeutral"
/>

<BarChart
  title="Taille du build, gzip"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "SolidJS", "value": 8.2},
    {"label": "Svelte", "value": 22.5},
    {"label": "Astro", "value": 137.8},
    {"label": "Next.js", "value": 328.6},
    {"label": "Nuxt", "value": 614.7}
  ]}
  bench="syntheticNeutral"
  source="SolidJS et Svelte n'empaquettent aucun serveur"
/>

Le build de Next.js inclut la vérification de types qu'il fait et que les autres sautent.

<Note title="Comment c'est mesuré">

solid-js 1.9.17, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.3 et Nuxt 4.6.2, sur Bun 1.4.4 et Chromium 151 headless. SolidJS et Svelte tournent derrière le même serveur Elysia, Astro et Nuxt derrière leurs propres gestionnaires de requêtes, et Next.js derrière son propre serveur HTTP. Chaque chiffre est la médiane de trois passes complètes du benchmark. Dans une passe, un chargement de page est la médiane de 10 chargements à froid, une opération sur le tableau la médiane de 10 runs après 2 d'échauffement, et le rendu serveur est mesuré dans le processus par mitata. Les builds de production partent de zéro ; leur taille est ce que chacun déploie, sans ses dépendances d'exécution ni les source maps. Le code est compté en caractères, hors espaces et commentaires : pages, layouts, composants et config, sans le fichier qui branche chaque app au benchmark. Formaté par Prettier, cloc 2.10 compte 122 lignes pour Nuxt, 130 pour Svelte, 175 pour Astro, 182 pour SolidJS et 211 pour Next.js.

</Note>

Les mêmes cinq frameworks ont aussi été [confiés à un agent de code](/posts/coding-agent-bench), sur un modèle cher et un moins cher.
