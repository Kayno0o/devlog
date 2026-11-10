---
title: "Ce que kay coûte à un agent de code"
description: "Le benchmark d'agent de code, avec kay face à SvelteKit, SolidStart, Astro, Nuxt et Next.js : ce que coûte un framework appris dans sa seule doc."
date: 2026-11-10T11:00:00Z
tags: [kay, benchmarks, llm]
draft: false
---

Chaque autre framework du [benchmark d'agent de code](/posts/coding-agent-bench) vient avec des années de code et de réponses sur le web, dont le modèle s'est nourri. kay n'a que sa documentation, 39 fichiers dans le projet, et son paquet. Alors Claude Opus 5.5 a construit le même site dans kay cinq fois, à côté des cinq autres frameworks : il a lu plus de documentation pour kay que pour n'importe lequel d'entre eux, et a écrit moins.

<Stats
  items={[
    {"value": "30 sur 30", "label": "runs qui passent chaque vérification et chaque test, ceux de kay compris"},
    {"value": "-24 à -62 %", "label": "tokens écrits, kay contre les cinq autres frameworks"},
    {"value": "78 contre 0", "label": "lignes de tests écrites, kay contre les autres"}
  ]}
/>

<Note title="Le site construit par l'agent de kay, en fonctionnement">

<Embed src="/llm-bench/bookshelf/books" title="Le site Bookshelf construit par l'agent de kay" />

</Note>

Filtrez ses livres, ouvrez-en un, mettez-le en favori. C'est le run au coût médian, exporté en fichiers statiques, sans son formulaire de contact, puisqu'il demande un serveur.

## Apprendre kay coûte des lectures, et économise du code

Chaque graphique montre la médiane de chaque framework sur ses runs, avec le plus bas et le plus haut à côté.

<BarChart
  title="Documentation lue"
  unit="K caractères"
  digits={0}
  rows={[
    {"label": "Nuxt", "value": 14, "range": [8, 22]},
    {"label": "Astro", "value": 29, "range": [8, 38]},
    {"label": "SolidStart", "value": 52, "range": [26, 64]},
    {"label": "Next.js", "value": 84, "range": [70, 114]},
    {"label": "SvelteKit", "value": 89, "range": [49, 103]},
    {"label": "kay", "value": 93, "range": [77, 107]}
  ]}
  bench="llm"
/>

<BarChart
  title="Plus grand contexte d'un appel"
  unit="K tokens"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "value": 45, "range": [43.1, 58.9]},
    {"label": "kay", "value": 64.8, "range": [58.5, 82.7]},
    {"label": "Nuxt", "value": 67, "range": [48.4, 91.2]},
    {"label": "SvelteKit", "value": 80.1, "range": [73.7, 106.6]},
    {"label": "Next.js", "value": 90, "range": [71.2, 120.1]},
    {"label": "SolidStart", "value": 91.7, "range": [84.7, 114.1]}
  ]}
  bench="llm"
/>

<BarChart
  title="Lignes de code écrites, hors tests et styles"
  unit="lignes"
  better="lower"
  digits={0}
  rows={[
    {"label": "kay", "value": 323, "range": [227, 336]},
    {"label": "Nuxt", "value": 444, "range": [437, 476]},
    {"label": "Astro", "value": 463, "range": [440, 491]},
    {"label": "SvelteKit", "value": 472, "range": [455, 518]},
    {"label": "SolidStart", "value": 537, "range": [523, 549]},
    {"label": "Next.js", "value": 616, "range": [537, 636]}
  ]}
  bench="llm"
/>

Le style était libre et non noté : les agents de kay n'ont écrit aucun CSS, là où les autres en ont écrit une centaine de lignes dans un run typique, donc les comptes de lignes laissent les styles de côté. Les agents de kay ont aussi écrit leurs propres tests dans 4 runs sur 5, là où aucun agent d'un autre framework n'en a écrit un seul. Ces lignes sont exclues aussi, mais les tokens qui les ont écrites comptent partout ailleurs.

<BarChart
  title="Tokens de réflexion"
  unit="K tokens"
  better="lower"
  digits={1}
  rows={[
    {"label": "kay", "value": 3.1, "range": [2.4, 5]},
    {"label": "Astro", "value": 4.3, "range": [3.5, 5.7]},
    {"label": "SvelteKit", "value": 8.5, "range": [8, 13.3]},
    {"label": "Nuxt", "value": 10.2, "range": [7.5, 13.8]},
    {"label": "Next.js", "value": 10.6, "range": [8.8, 20.7]},
    {"label": "SolidStart", "value": 11.5, "range": [9.7, 15.6]}
  ]}
  bench="llm"
/>

<BarChart
  title="Tours"
  unit="tours"
  better="lower"
  digits={0}
  rows={[
    {"label": "Astro", "value": 24, "range": [21, 31]},
    {"label": "kay", "value": 27, "range": [21, 47]},
    {"label": "SvelteKit", "value": 40, "range": [30, 51]},
    {"label": "Nuxt", "value": 47, "range": [30, 56]},
    {"label": "Next.js", "value": 50, "range": [38, 72]},
    {"label": "SolidStart", "value": 53, "range": [45, 74]}
  ]}
  bench="llm"
/>

<BarChart
  title="Temps pour construire le site"
  unit="min"
  better="lower"
  digits={1}
  rows={[
    {"label": "Astro", "value": 2.6, "range": [2.5, 3.6]},
    {"label": "kay", "value": 3.4, "range": [1.8, 4.7]},
    {"label": "SvelteKit", "value": 4.5, "range": [3.3, 12.4]},
    {"label": "Next.js", "value": 5.9, "range": [4.8, 8.5]},
    {"label": "Nuxt", "value": 7.9, "range": [4.3, 9.5]},
    {"label": "SolidStart", "value": 9.3, "range": [6.5, 12.9]}
  ]}
  bench="llm"
/>

<BarChart
  title="Coût du site, tarifs API"
  unit="USD"
  better="lower"
  digits={2}
  rows={[
    {"label": "Astro", "value": 0.78, "range": [0.75, 1.12]},
    {"label": "kay", "value": 0.95, "range": [0.78, 1.54]},
    {"label": "Nuxt", "value": 1.46, "range": [0.91, 1.8]},
    {"label": "SvelteKit", "value": 1.52, "range": [1.23, 2.22]},
    {"label": "Next.js", "value": 1.87, "range": [1.37, 2.85]},
    {"label": "SolidStart", "value": 1.94, "range": [1.86, 2.79]}
  ]}
  bench="llm"
/>

## Les runs de kay suivent les mêmes règles

Le site, les tests cachés, le bac à sable et la notation sont ceux du [benchmark d'agent de code](/posts/coding-agent-bench). Chaque run de kay part de `kay new --template blank --with server`, avec sa documentation telle que la livre son paquet : le `llms.txt` et ses fichiers par sujet, 0,6 Mo en 39 fichiers, contre 0,8 à 7,8 Mo pour les autres.

La séance de kay est venue en dernier, seule, donc ses temps se comparent moins bien que ses tokens ou ses lignes. Comme les autres, son agent a parfois lancé `python` ou `node` alors que le prompt demande Bun seul, dans 3 de ses 5 runs.

<Note title="Comment c'est mesuré">

Claude Opus 5.5 en effort élevé, Claude Code 2.1.289, kay 1.51.0, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1, Next.js 16.4.2, tous sur Bun, 5 runs chacun, ceux de Nuxt et Next.js six jours après ceux de SvelteKit, SolidStart et Astro, ceux de kay quelques heures après. Chaque chiffre est la médiane des runs réussis. Le coût est aux tarifs API, tel que Claude Code le rapporte. Le cahier des charges, le prompt, les starters, la suite et chaque run sont dans [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

</Note>
