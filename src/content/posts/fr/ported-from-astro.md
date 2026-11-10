---
title: "Deux sites Astro, passés à kay"
description: "Deux sites d'entreprise portés d'Astro vers kay et mesurés tels qu'ils se déploient : charge, affichages, images, mémoire et builds, pertes comprises."
date: 2026-11-10T10:20:00Z
tags: [kay, benchmarks]
draft: false
---

Deux petits sites d'entreprise, un élevage de chats et un peintre en bâtiment, tournaient sur Astro, qui n'envoie déjà presque pas de JavaScript. Passés à [kay](/posts/introducing-kay), ils servent plus de requêtes pour moins de mémoire, s'affichent plus tôt et se déploient plus petits, mais ils envoient plus de JavaScript et se construisent plus lentement. Chacun a été construit et servi comme il se déploie, le serveur autonome d'Astro sous Bun contre l'unique exécutable de kay, tous deux derrière nginx avec HTTP/2, TLS et brotli, sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux.

<Stats
  items={[
    {"value": "-33 à -37 %", "label": "lignes de code"},
    {"value": "2,0 à 3,1x", "label": "démarrage à froid plus rapide"},
    {"value": "-11 à -74 %", "label": "HTML et CSS par page"}
  ]}
/>

## Les pages sont servies plus vite, avec moins de mémoire et un déploiement plus léger

<BarChart
  title="Requêtes par seconde, une page de contenu"
  unit="req/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay, peintre", "value": 37009},
    {"label": "kay, élevage", "value": 36921},
    {"label": "Astro, élevage", "value": 12829},
    {"label": "Astro, peintre", "value": 11049}
  ]}
  bench="astro"
  source="32 clients via nginx pendant 5 s"
/>

kay sert ces pages prérendues et déjà compressées, si bien que nginx passe environ 24 µs sur chacune au lieu de 470 à 540, et les deux sites sur kay frôlent le plafond du client de charge lui-même, environ 40 000 par seconde. Les deux sites chargent leur formulaire de contact comme une server island différée, donc toutes les pages sauf l'accueil de l'élevage sont prérendues. Cet accueil, rendu à chaque requête, est servi à peu près au rythme d'Astro pour un tiers de son CPU, nginx compris, car kay le compresse lui-même.

<BarChart
  title="Mémoire du serveur après charge"
  unit="Mo"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay, peintre", "value": 77},
    {"label": "Astro, peintre", "value": 89},
    {"label": "kay, élevage", "value": 118},
    {"label": "Astro, élevage", "value": 210}
  ]}
  bench="astro"
  source="PSS après les passes de charge"
/>

<BarChart
  title="Taille déployée"
  unit="Mo"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay, peintre", "value": 110},
    {"label": "kay, élevage", "value": 121},
    {"label": "Astro, élevage", "value": 231},
    {"label": "Astro, peintre", "value": 301}
  ]}
  bench="astro"
  source="dist et node_modules de production contre un seul exécutable"
/>

## Les mobiles affichent plus tôt, avec des images plus légères et sans feuille de style

kay sert les images en AVIF à la largeur affichée, si bien que les images d'une page pèsent 52 contre 143 Ko et 37 contre 161 Ko sur ordinateur, 114 contre 143 Ko et 106 contre 185 Ko sur mobile, l'élevage d'abord. Il inline aussi les styles de chaque page, sans feuille de style à attendre : sur mobile le premier rendu arrive à 0,66 et 0,69 s au lieu de 1,51 et 1,30 s, le plus grand rendu à 1,69 et 0,84 s au lieu de 2,45 et 1,31 s.

## kay envoie plus de JavaScript et son build est plus lent

<BarChart
  title="JS envoyé par page, brotli"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "Astro, peintre", "value": 0.4},
    {"label": "Astro, élevage", "value": 5.2},
    {"label": "kay, élevage", "value": 12.3},
    {"label": "kay, peintre", "value": 12.5}
  ]}
  bench="astro"
  source="moyenne sur toutes les pages"
/>

Sur Astro, le site du peintre n'envoyait que quelques scripts simples, inlinés dans ses pages. Un mobile transfère 147 Ko par page de ce site sur kay contre 87 Ko sur Astro, surtout des polices (107 contre 35 Ko) et le script de kay.

Un `kay build` propre encode une copie AVIF et une copie WebP de chaque image, ce que `astro build` ne fait pas : 6,9 contre 2,2 s sur l'élevage et 3,7 contre 2,0 s sur le peintre, le build de l'élevage culminant à 2,0 Go de mémoire contre 1,0.

<Note title="Comment c'est mesuré">

kay 1.54.2 sur Bun 1.4.3, Chromium 151 headless et nginx 1.30.5 configuré comme en production, les deux côtés en une seule séance. Les rendus sont des médianes de 5 chargements à froid par page sous la limitation de Lighthouse ; la charge est de 32 clients pendant 5 s par URL ; les builds sont la médiane de 3 exécutions propres. Le code des sites est privé, donc le relevé est [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), chaque chiffre avec ses conditions.

</Note>

Les autres portages : [un site SvelteKit](/posts/ported-from-sveltekit) et [une app Elysia et Solid](/posts/ported-from-solid).
