---
title: "Une app Elysia et Solid, passée à kay"
description: "Une app avec connexion, portée d'une API Elysia et d'islands Solid 2 vers kay, mesurée telle qu'elle se déploie : charge serveur, affichages, mémoire, builds et code, ce que kay perd compris."
date: 2026-10-20
tags: [kay, benchmarks]
draft: true
---

L'[article sur kay](/posts/introducing-kay) mesure kay sur une page de produits et sur le build d'un agent de code. Une page de produits ne mène pas bien loin, alors voici une vraie app passée à kay depuis une pile maison : une API Elysia, des islands Solid 2 au-dessus d'un rendu serveur fait à la main, et des sessions JWT. L'app est privée et compte exactement deux utilisateurs, qui se connectent avec Discord pour noter des cartes de profil, ce qui n'a jamais empêché personne de la tester en charge. Sur kay, la connexion passe par kayjs-auth.

Chaque côté a été construit et servi comme il se déploie, le serveur Elysia sous Bun contre l'unique exécutable de kay, tous deux derrière nginx avec HTTP/2, TLS et brotli, sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux. Chacun lit sa propre base Postgres, remplie à l'identique, et toutes les pages sauf celle de connexion sont mesurées connecté.

<Stats
  items={[
    {"value": "-40 %", "label": "lignes de code"},
    {"value": "7x", "label": "démarrage à froid plus rapide"},
    {"value": "-73 %", "label": "octets téléchargés par un mobile"},
    {"value": "-64 %", "label": "taille déployée"}
  ]}
/>

<BarChart
  title="Requêtes par seconde"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay", "value": 5208, "group": "page d'accueil"},
    {"label": "Elysia + Solid", "value": 1330, "group": "page d'accueil"},
    {"label": "kay", "value": 5139, "group": "page d'une manche"},
    {"label": "Elysia + Solid", "value": 1685, "group": "page d'une manche"}
  ]}
  bench="elysiaSolid"
  source="32 clients via nginx pendant 5 s"
/>

Les deux pages montrent les données de la personne connectée, donc aucune n'est prérendue : c'est du rendu, pour un quart à moins d'un tiers du CPU de l'ancien serveur par requête. nginx passe environ 50 µs sur chacune au lieu de 374 à 427, car kay compresse la page lui-même là où l'ancien serveur laissait ce travail à nginx.

<BarChart
  title="Rendus sur mobile"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 671, "group": "premier rendu"},
    {"label": "Elysia + Solid", "value": 1919, "group": "premier rendu"},
    {"label": "kay", "value": 1830, "group": "plus grand rendu"},
    {"label": "Elysia + Solid", "value": 4016, "group": "plus grand rendu"}
  ]}
  bench="elysiaSolid"
  source="limitation de Lighthouse, médiane de 5 chargements à froid par page"
/>

<BarChart
  title="Rendus sur ordinateur"
  unit="ms"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 80, "group": "premier rendu"},
    {"label": "Elysia + Solid", "value": 286, "group": "premier rendu"},
    {"label": "kay", "value": 405, "group": "plus grand rendu"},
    {"label": "Elysia + Solid", "value": 531, "group": "plus grand rendu"}
  ]}
  bench="elysiaSolid"
  source="limitation de Lighthouse, médiane de 5 chargements à froid par page"
/>

kay rend toute la page sur le serveur et inline ses styles, si bien qu'un mobile affiche la page sans attendre de feuille de styles ni l'hydratation. Le poids passe dans le HTML, 10,8 Ko par page contre 1,7, et le JavaScript se répartit en plus de fichiers, environ 20 par page contre 5,5, pour moins d'octets au total.

- **Plus de décalage de mise en page sur mobile**, 0,119 contre 0,019. La page étant affichée depuis le HTML du serveur, les polices web arrivent une fois son texte à l'écran et le redistribuent. La police de repli aux métriques ajustées de kay doit masquer ce changement, mais c'est Arial via `local()`, qui ne se charge jamais sur une machine sans Arial, comme celle du benchmark et probablement Android. L'ancien côté ne dessinait ces sections qu'après l'hydratation, une fois les polices arrivées.
- **Moins sur ordinateur**, 0,007 contre 0,017, depuis que le portage réserve la place de l'image de la carte.

<BarChart
  title="Mémoire du serveur après charge"
  unit="Mo"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 120},
    {"label": "Elysia + Solid", "value": 196}
  ]}
  bench="elysiaSolid"
  source="PSS après les passes de charge"
/>

Une fois démarré, avant toute charge, kay occupe 71 Mo contre 121, et il répond à sa première requête 41,5 ms après son lancement au lieu de 297.

<BarChart
  title="Build, depuis zéro"
  unit="s"
  better="lower"
  digits={2}
  rows={[
    {"label": "Elysia + Solid", "value": 0.38},
    {"label": "kay", "value": 0.74, "note": "sans vérification"},
    {"label": "kay", "value": 0.81}
  ]}
  bench="elysiaSolid"
  source="médiane de 3 exécutions"
/>

`kay build` vérifie d'abord les types de chaque template, ce que l'ancien build n'avait pas, et finit quand même en moins d'une seconde, donc personne n'a le temps d'aller chercher un café. Les tests ont fondu avec le code, 2 569 lignes contre 4 487.

<Note title="Comment c'est mesuré">

kay 1.57.0 sur Bun 1.4.3, Chromium 151 headless et nginx 1.30.5 configuré comme en production, les deux côtés en une seule séance. Les rendus sont des médianes de 5 chargements à froid par page sous la limitation de Lighthouse, moyennées sur les pages ; la charge est de 32 clients pendant 5 s par URL en HTTP/1.1 keepalive ; les builds sont la médiane de 3 exécutions propres ; les lignes sont les lignes de code de cloc pour les sources et la config. Le code de l'app est privé, donc le relevé est [bench/elysia-solid-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/elysia-solid-port.md), chaque chiffre avec ses conditions.

</Note>
