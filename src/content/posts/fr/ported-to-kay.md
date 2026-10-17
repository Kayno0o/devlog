---
title: "Trois vrais sites, passés à kay"
description: "Un site SvelteKit et deux sites Astro portés vers kay et mesurés tels qu'ils se déploient : charge serveur, affichages, images, builds, mémoire et serveur de développement, ce que kay perd compris."
date: 2026-10-17
tags: [kay, benchmarks]
draft: true
---

L'[article sur kay](/posts/introducing-kay) mesure kay sur une page de produits et sur le build d'un agent de code. Une page de produits ne mène pas bien loin, alors cet article, ce sont trois vrais sites passés à kay : un depuis SvelteKit, deux depuis Astro, chacun mesuré contre la version qu'il remplace. Tous les benchmarks de cet article ont tourné sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux.

## Un vrai site, porté depuis SvelteKit

J'ai porté un vrai site de SvelteKit vers kay : une page d'accueil et des pages de contenu, environ 3 000 lignes réparties sur 22 composants Svelte. Les deux versions ont été mesurées en une seule séance, exécutions entrelacées, en loopback : les ratios se transposent, les chiffres absolus sont optimistes.

### Ce que kay gagne

<Stats items={[{"value": "-86 %", "label": "CPU serveur par visiteur"}, {"value": "-57 %", "label": "requêtes sur la page d'accueil"}, {"value": "-19 %", "label": "image Docker"}, {"value": "-17 %", "label": "lignes de code"}]} />

<BarChart title="Premier rendu sur mobile, page de contenu" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 400}, {"label": "SvelteKit", "value": 744}]} bench="sveltekit" source="preset Lighthouse Pixel 7 (4G lente, CPU 4x), médiane de 3 exécutions" />

<BarChart title="JavaScript côté client, brotli" unit="Ko" better="lower" rows={[{"label": "kay", "value": 35.9}, {"label": "SvelteKit", "value": 70.1}]} bench="sveltekit" source="tous les fichiers écrits par le build" />

Une page ne charge que la partie dont ses islands ont besoin : 16 Ko sur une page de contenu.

La page d'accueil est prérendue, et son formulaire de contact, la seule partie qui diffère selon le visiteur, est une server island différée : le navigateur la récupère environ un écran avant qu'elle n'entre dans la vue, tandis que kay sert la page elle-même depuis la mémoire.

<BarChart title="Requêtes par seconde, page d'accueil" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 35722}, {"label": "SvelteKit", "value": 764}]} bench="sveltekit" source="oha, 64 connexions pendant 10 s, 2 passes, la plus lente de kay" />

L'essentiel de cet écart vient du prérendu, pas de la vitesse de rendu : quand kay rendait toute la page à chaque requête, comme SvelteKit, il la servait à environ deux fois le débit de SvelteKit.

<BarChart title="Build, caches froids" unit="s" better="lower" digits={2} rows={[{"label": "kay", "value": 2.97}, {"label": "SvelteKit", "value": 3.92}]} bench="sveltekit" source="hyperfine, médiane de 3 exécutions" />

Sous charge, kay culmine à 85 Mio de mémoire contre 131 à 134 pour SvelteKit. La page d'accueil téléchargée par un mobile passe de 706 à 558 Ko, surtout grâce aux images : kay sert de l'AVIF à la largeur affichée.

### Ce que kay perd

<BarChart title="Mémoire du serveur au repos" unit="Mio" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 38}, {"label": "kay", "value": 55}]} bench="sveltekit" source="RSS après le démarrage" />

- **L'inlining a un prix.** Le rendu sur mobile ci-dessus vient de la feuille de styles inlinée, que ce portage activait avant que kay 1.46 en fasse le réglage par défaut pour les feuilles de moins de 14 Ko environ une fois compressées : avec la feuille liée, kay 1.14 rendait de 85 à 140 ms derrière SvelteKit. L'inlining coûte environ 2 Ko par page, et la feuille de styles n'est plus mise en cache d'une page à l'autre.
- **Pages courtes avec styles inlinés.** Les pages rendues à chaque requête portent toute la feuille de styles, si bien que kay les sert à 0,9 à 1,0 fois le débit de SvelteKit, pour 1,1 à 1,2 fois son CPU par requête. Avec la feuille liée, kay 1.16.6 les servait à 1,8 à 2,2 fois le débit de SvelteKit.

### En développement

<BarChart title="Premier chargement de la page d'accueil, serveur de dev" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 97}, {"label": "SvelteKit", "value": 1654}]} bench="sveltekit" source="Chromium headless, événement load, médiane de 2 passes" />

<BarChart title="Modification de template à l'écran, serveur de dev" unit="ms" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 37}, {"label": "kay", "value": 257}]} bench="sveltekit" source="de l'écriture du fichier à son affichage, médiane de 14 modifications" />

- **kay charge les pages plus vite.** Les deux démarrent en une seconde environ avec les caches vides, mais kay sert un client groupé, 19 requêtes pour la page d'accueil contre 166 modules pour Vite, si bien que la page d'accueil répond en 571 ms après un démarrage à chaud contre 1 440. Ses processus occupent 251 Mio contre 415 pour Vite.
- **Vite applique les modifications plus tôt.** kay redémarre son serveur à chaque modification de template, si bien qu'elle s'affiche en 260 ms environ contre 40 pour Vite ; une modification de style est appliquée sans redémarrage, en 96 ms contre 38. kay affiche une modification du code serveur dans les mêmes 260 ms en gardant l'état de la page, ce que SvelteKit n'affiche qu'après un rechargement manuel.

<Note title="Comment c'est mesuré">

kay 1.37.6 sur Bun 1.4.4 canary, kay 1.37.3 pour le serveur de dev. Les rendus viennent de Playwright sous les presets mobile et bureau de Lighthouse, médiane de 3 exécutions ; les builds de hyperfine, médiane de 3 exécutions à froid ; le serveur de oha, 10 s à 64 connexions, deux passes. Le code du site est privé, donc la trace est [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), chaque chiffre avec ses conditions.

</Note>

## Deux sites, portés depuis Astro

Deux petits sites d'entreprise sont passés d'Astro à kay : un élevage de chats et un peintre en bâtiment. Chacun a été construit et servi comme il se déploie, le serveur standalone d'Astro sous Bun contre l'unique exécutable de kay, tous deux derrière nginx avec HTTP/2, TLS et brotli.

### Ce que kay gagne

<Stats items={[{"value": "-32 à -37 %", "label": "lignes de code"}, {"value": "2,2 à 3,5x", "label": "démarrage à froid plus rapide"}, {"value": "-27 à -85 %", "label": "CSS par page"}]} />

<BarChart title="Requêtes par seconde, une page de contenu" unit="req/s" better="higher" digits={0} rows={[{"label": "kay, peintre", "value": 39805}, {"label": "kay, élevage", "value": 39322}, {"label": "Astro, élevage", "value": 12648}, {"label": "Astro, peintre", "value": 11798}]} bench="astro" source="32 clients via nginx pendant 5 s" />

kay sert ces pages prérendues et déjà compressées, si bien que nginx passe environ 20 µs sur chacune au lieu de 470 à 540, et tous deux frôlent le plafond du client de charge lui-même, environ 40 000 par seconde. Les deux sites chargent leur formulaire de contact comme une server island différée, donc toutes les pages sauf l'accueil de l'élevage sont prérendues.

<BarChart title="Mémoire du serveur après charge" unit="Mo" better="lower" digits={0} rows={[{"label": "kay, peintre", "value": 95}, {"label": "Astro, peintre", "value": 125}, {"label": "kay, élevage", "value": 144}, {"label": "Astro, élevage", "value": 281}]} bench="astro" source="RSS après les passes de charge" />

<BarChart title="Taille déployée" unit="Mo" better="lower" digits={0} rows={[{"label": "kay, peintre", "value": 98}, {"label": "kay, élevage", "value": 109}, {"label": "Astro, élevage", "value": 231}, {"label": "Astro, peintre", "value": 301}]} bench="astro" source="dist et node_modules de production contre un seul exécutable" />

- **Des images plus légères**, servies en AVIF à la largeur affichée : 55 contre 143 Ko et 36 contre 161 Ko par page sur desktop, 115 contre 143 Ko et 105 contre 185 Ko sur mobile.
- **Des rendus plus rapides sur le site de l'élevage** : sur mobile, le plus gros rendu arrive à 1,78 s au lieu de 2,73 s, et un mobile télécharge 201 Ko par page au lieu de 256.

### Ce que kay perd

<BarChart title="JS envoyé par page, brotli" unit="Ko" better="lower" rows={[{"label": "Astro, peintre", "value": 0.4}, {"label": "Astro, élevage", "value": 5.2}, {"label": "kay, élevage", "value": 13.1}, {"label": "kay, peintre", "value": 13.1}]} bench="astro" source="moyenne sur toutes les pages" />

- **Plus de JavaScript.** Le site du peintre envoyait 0,4 Ko sur Astro, quelques scripts simples inlinés dans ses pages, et en envoie 13,1 sur kay ; celui de l'élevage passe de 5,2 à 13,1 Ko.
- **Un site de peintre plus lourd sur mobile.** Un mobile télécharge 170 Ko par page contre 126, surtout des polices (107 contre 35 Ko) et ce script. Son plus gros rendu arrive environ 70 ms plus tard sur mobile et 35 ms plus tard sur desktop.
- **Des builds plus lents.** Un `kay build` propre encode une copie AVIF et une copie WebP de chaque image, ce que `astro build` ne fait pas : 11,3 contre 1,9 s sur l'élevage et 7,1 contre 1,6 s sur le peintre, le build de l'élevage culminant à 1,9 Go contre 1,1.

<Note title="Comment c'est mesuré">

kay 1.28.0 sur Bun 1.4.4, Chromium 151 headless et nginx 1.30.5 configuré comme en production, les deux côtés en une seule séance. Les rendus sont des médianes de 5 chargements à froid par page sous la limitation de Lighthouse ; la charge est de 32 clients pendant 5 s par URL ; les builds sont la médiane de 3 exécutions propres. Le code des sites est privé, donc la trace est [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), chaque chiffre avec ses conditions.

</Note>
