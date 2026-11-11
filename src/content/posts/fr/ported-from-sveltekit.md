---
title: "Quitter SvelteKit : moins de CPU, plus de mémoire"
description: "J'ai porté un vrai site SvelteKit vers kay et l'ai mesuré contre la version qu'il remplace, en production et en développement, avec ce qui a empiré."
date: 2026-11-10T10:30:00Z
tags: [kay, benchmarks]
draft: false
---

Ce site tournait sur SvelteKit : une page d'accueil et des pages de contenu, environ 3 000 lignes réparties sur 22 composants Svelte. Passé à [kay](/posts/introducing-kay), il sert ses pages pour une fraction du CPU et s'affiche plus tôt sur mobile, mais il garde plus de mémoire au repos et affiche les modifications de style plus tard en développement. Les deux versions ont été mesurées en une seule séance sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux, exécutions entrelacées, en loopback : les ratios se transposent, les chiffres absolus sont optimistes.

<Stats
  items={[
    {"value": "-88 %", "label": "CPU serveur par visiteur"},
    {"value": "-58 %", "label": "requêtes sur la page d'accueil"},
    {"value": "-20 %", "label": "image Docker"},
    {"value": "-16 %", "label": "lignes de code"}
  ]}
/>

## Les mobiles affichent plus tôt, avec moins de JavaScript

<BarChart
  title="Premier rendu sur mobile, page de contenu"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 356},
    {"label": "SvelteKit", "value": 752}
  ]}
  bench="sveltekit"
  source="preset Lighthouse Pixel 7 (4G lente, CPU 4x), médiane de 3 exécutions"
/>

<BarChart
  title="JavaScript côté client, brotli"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "kay", "value": 30.6},
    {"label": "SvelteKit", "value": 70.1}
  ]}
  bench="sveltekit"
  source="tous les fichiers écrits par le build"
/>

Une page ne charge que la partie dont ses islands ont besoin : 13 Ko sur une page de contenu. La page d'accueil téléchargée par un mobile passe de 706 à 543 Ko, surtout grâce aux images : kay sert de l'AVIF à la largeur affichée.

Ce rendu sur mobile vient de la feuille de styles inlinée, ce que kay fait par défaut pour une feuille de moins de 14 Ko environ une fois compressée. Avec la feuille liée, un kay plus ancien s'affichait de 85 à 140 ms derrière SvelteKit. L'inlining coûte environ 2 Ko par page, et la feuille de styles n'est plus mise en cache d'une page à l'autre.

## Les pages prérendues sont servies pour une fraction du CPU

La page d'accueil est prérendue, et son formulaire de contact, la seule partie qui diffère selon le visiteur, est une server island différée : le navigateur la récupère environ un écran avant qu'elle n'entre dans la vue, tandis que kay sert la page elle-même depuis la mémoire.

<BarChart
  title="Requêtes par seconde, page d'accueil"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay", "value": 40963},
    {"label": "SvelteKit", "value": 787}
  ]}
  bench="sveltekit"
  source="oha, 64 connexions pendant 10 s, 2 passes, la plus lente de kay"
/>

L'essentiel de cet écart vient du prérendu, pas de la vitesse de rendu : à l'époque où kay rendait toute la page à chaque requête, comme SvelteKit, il la servait à environ deux fois le débit de SvelteKit.

<BarChart
  title="Requêtes par seconde, page de contenu"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay", "value": 43014},
    {"label": "SvelteKit", "value": 4228}
  ]}
  bench="sveltekit"
  source="oha, 64 connexions pendant 10 s, 2 passes, la plus lente de kay"
/>

Le build de kay garde aussi les pages de contenu, qui ne prennent rien de la requête, si bien qu'elles sont servies elles aussi depuis la mémoire. Seule la 404 est encore rendue à chaque requête, à 1,2 fois le débit de SvelteKit pour moins de CPU.

## Les builds sont plus rapides, et la mémoire au repos plus haute

<BarChart
  title="Build, caches froids"
  unit="s"
  better="lower"
  digits={2}
  rows={[
    {"label": "kay", "value": 2.94},
    {"label": "SvelteKit", "value": 3.97}
  ]}
  bench="sveltekit"
  source="hyperfine, médiane de 3 exécutions"
/>

<BarChart
  title="Mémoire du serveur au repos"
  unit="Mio"
  better="lower"
  digits={0}
  rows={[
    {"label": "SvelteKit", "value": 39},
    {"label": "kay", "value": 55}
  ]}
  bench="sveltekit"
  source="RSS après le démarrage"
/>

Sous charge, kay culmine à 92 Mio de mémoire contre 134 à 136 pour SvelteKit.

## Le serveur de dev charge les pages plus tôt et affiche les modifications de style plus tard

<BarChart
  title="Premier chargement de la page d'accueil, serveur de dev"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 120},
    {"label": "SvelteKit", "value": 1631}
  ]}
  bench="sveltekit"
  source="Chromium headless, événement load, médiane de 2 passes"
/>

<BarChart
  title="Modification à l'écran, serveur de dev"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "SvelteKit", "value": 34, "group": "modification de template"},
    {"label": "kay", "value": 47, "group": "modification de template"},
    {"label": "SvelteKit", "value": 34, "group": "modification de style"},
    {"label": "kay", "value": 71, "group": "modification de style"}
  ]}
  bench="sveltekit"
  source="de l'écriture du fichier à son affichage, médiane de 14 modifications"
/>

Le serveur de dev de kay démarre en 915 ms avec les caches vides contre 1 258 pour Vite, et sert un client groupé : 24 requêtes pour la page d'accueil contre 166 modules pour Vite, si bien que la page d'accueil répond en 381 ms après un démarrage à chaud contre 1 741. Ses processus occupent 239 Mio contre 400 pour Vite.

kay prend en compte une modification de template ou de code serveur sans redémarrer, et affiche une modification du code serveur en 59 ms en gardant l'état de la page, ce que SvelteKit n'affiche qu'après un rechargement manuel.

<Note title="Comment c'est mesuré">

kay 1.60.1 sur Bun 1.4.3, serveur de dev compris. Les rendus viennent de Playwright sous les presets mobile et bureau de Lighthouse, médiane de 3 exécutions ; les builds de hyperfine, médiane de 3 exécutions à froid ; le serveur de oha, 10 s à 64 connexions, deux passes. Le code du site est privé, donc le relevé est [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), chaque chiffre avec ses conditions.

</Note>

Les autres portages : [deux sites Astro](/posts/ported-from-astro) et [une app Elysia et Solid](/posts/ported-from-solid).
