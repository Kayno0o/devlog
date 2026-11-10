---
title: "kayjs : rapide à exécuter, simple à écrire"
description: "Pourquoi j'ai construit mon propre framework web sur Bun, comment un fichier .kay devient du HTML et des islands, et ce qu'il coûte face à cinq autres."
date: 2026-11-10T12:00:00Z
tags: [kay, benchmarks]
draft: false
---

Oui, encore un framework JavaScript. Pour ma défense, c'est celui que j'avais envie d'utiliser.

kay tourne sur Bun et Elysia. Un fichier `.kay` est un composant : des blocs TypeScript, puis un template indenté façon pug. Les pages sont rendues en HTML pur côté serveur, et seules les parties interactives, les islands, embarquent du JavaScript. C'est encore expérimental, donc attendez-vous à des changements cassants pendant un moment.

<Stats
  items={[
    {"value": "-88 %", "label": "CPU serveur par visiteur, un site SvelteKit passé à kay"},
    {"value": "-16 à -40 %", "label": "lignes de code, quatre sites passés à kay"},
    {"value": "-24 à -62 %", "label": "tokens écrits par un agent de code pour un site, kay contre cinq autres frameworks"}
  ]}
/>

## Le code serveur et le code navigateur d'un composant tiennent dans un seul fichier

La même page en kay, dans les trois frameworks dont il s'inspire, puis en Next.js et Nuxt, chacune validée par son propre vérificateur :

<Tabs label="Une page dans six frameworks">

<Tab group="component" label="kay" checked>

```kay
--- server
const greeting = 'Hello from the server'
--- script
const count = signal(0)
---
h1 {greeting}
button(onClick={() => count++}) Clicked {count()} times
```

Le premier bloc ne s'exécute que sur le serveur, le second aussi dans le navigateur, et le template lit les deux.

</Tab>

<Tab group="component" label="SvelteKit">

```ts
export function load() {
  return { greeting: 'Hello from the server' }
}
```

```svelte
<script lang="ts">
  let { data } = $props()
  let count = $state(0)
</script>

<h1>{data.greeting}</h1>
<button onclick={() => count++}>Clicked {count} times</button>
```

Les données serveur vivent dans un second fichier, `+page.server.ts`, que la page reçoit sous le nom `data`.

</Tab>

<Tab group="component" label="SolidStart">

```tsx
import { createAsync, query } from '@solidjs/router'
import { createSignal } from 'solid-js'

const getGreeting = query(async () => {
  'use server'
  return 'Hello from the server'
}, 'greeting')

export default function Counter() {
  const greeting = createAsync(() => getGreeting())
  const [count, setCount] = createSignal(0)

  return (
    <>
      <h1>{greeting()}</h1>
      <button onClick={() => setCount(count() + 1)}>
        Clicked {count()} times
      </button>
    </>
  )
}
```

La partie serveur est marquée `'use server'` et relue de façon asynchrone.

</Tab>

<Tab group="component" label="Astro">

```tsx
import { createSignal } from 'solid-js'

export default function Counter() {
  const [count, setCount] = createSignal(0)

  return (
    <button onClick={() => setCount(count() + 1)}>
      Clicked {count()} times
    </button>
  )
}
```

```astro
---
import Counter from '../components/Counter'

const greeting = 'Hello from the server'
---
<h1>{greeting}</h1>
<Counter client:load />
```

La partie serveur est rendue comme dans kay. Astro laisse l'état dans le navigateur à un composant d'un autre framework, ici SolidJS, dans son propre fichier et hydraté comme une island.

</Tab>

<Tab group="component" label="Next.js">

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  )
}
```

```tsx
import Counter from './counter'

export default function Page() {
  const greeting = 'Hello from the server'

  return (
    <>
      <h1>{greeting}</h1>
      <Counter />
    </>
  )
}
```

La page est un composant serveur, rendue comme dans kay. L'état demande un composant client, dans son propre fichier marqué `'use client'`.

</Tab>

<Tab group="component" label="Nuxt">

```ts
export default defineEventHandler(() => 'Hello from the server')
```

```vue
<script setup lang="ts">
const { data: greeting } = await useFetch('/api/greeting')
const count = ref(0)
</script>

<template>
  <h1>{{ greeting }}</h1>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
```

Le script de la page s'exécute sur le serveur puis à nouveau dans le navigateur : la partie réservée au serveur part donc dans une route d'API, `server/api/greeting.ts`, que la page récupère.

</Tab>

</Tabs>

## Un seul framework au lieu d'Astro avec Solid dedans

Je tiens à la vitesse partout : la rapidité avec laquelle une page se charge et s'exécute, la rapidité de réponse du serveur, la rapidité d'un build ou d'une suite de tests, et le peu dont le serveur a besoin, en mémoire comme pour être déployé.

Je tiens aussi à la quantité de code. J'ai deux applications à moi, une en SvelteKit d'environ 27 000 lignes et une en SolidJS d'environ 34 000, lignes vides et commentaires exclus : à cette taille, chaque ligne qu'un framework économise est une ligne de moins à écrire, à relire et à maintenir en état de marche.

Pendant un temps, j'ai utilisé Astro avec SolidJS dedans : des pages rapides pour peu de code, au prix de deux frameworks et de deux façons d'écrire un composant dans un même projet. SvelteKit, SolidStart et Astro reposent aussi tous sur Vite, qui rend parfois les builds et les tests unitaires lents. kay, c'est ce que j'ai construit pour tout avoir au même endroit, avec Bun seul pour le build et les tests. Il mélange ce que j'ai aimé dans chacun :

- **Astro** : le bloc TypeScript en haut, les islands comme seul JavaScript qu'une page embarque, les content collections.
- **pug** : des templates indentés sans balises fermantes. J'ai adoré pug il y a longtemps et je n'ai jamais vu un framework le prendre en charge. C'est court à écrire, rapide à lire, et moins de tokens pour un agent.
- **SolidJS** : les signals et les mises à jour fines, pas de DOM virtuel.
- **Svelte et SvelteKit** : un compilateur qui fait le travail en amont, des routes basées sur les fichiers avec des layouts, des form actions typées.

## Une compilation, deux sorties : du HTML pour le serveur, du DOM pour le navigateur

1. Le compilateur lit un fichier `.kay` une seule fois et produit deux jumeaux : un constructeur de chaînes HTML pour le serveur et un constructeur DOM pour le navigateur.
2. Le serveur rend chaque page en chaîne de caractères. Une page statique n'a ni marqueurs d'hydratation ni bundle JavaScript.
3. Une island est rendue côté serveur avec des marqueurs d'hydratation, puis reprend ces nœuds dans le navigateur au lieu de rendre une seconde fois.
4. `kay build --static` écrit tout le site sous forme de fichiers, comme ce devlog, servi par un simple nginx.

Bun fait tout en dessous : le serveur, le bundler, le lanceur de tests et le driver de base de données, et un site entier se compile en un seul exécutable. Chaque build vérifie d'abord les types du projet, templates compris, si bien qu'une prop cassée ou un lien mal tapé n'arrive jamais en production.

## kay mène au chargement, au rendu et au code, pas au build ni au poids du JS

Le [benchmark de la page de produits](/posts/five-frameworks) à nouveau, avec kay dedans : la même page et les mêmes données pour chaque framework, chacun écrit comme le font sa propre documentation et son entrée du js-framework-benchmark. kay, SolidJS et Svelte sont chronométrés derrière le même serveur Elysia, Astro et Nuxt à travers leurs propres gestionnaires de requêtes, et Next.js à travers son propre serveur HTTP, le tout sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux.

<BarChart
  title="Script du thread principal au chargement, page produits"
  unit="ms"
  better="lower"
  rows={[
    {"label": "kay", "value": 0.4},
    {"label": "Astro", "value": 1.3},
    {"label": "Nuxt", "value": 5.2},
    {"label": "SolidJS", "value": 10.8},
    {"label": "Svelte", "value": 14.3},
    {"label": "Next.js", "value": 18.6}
  ]}
  bench="synthetic"
/>

kay n'hydrate que ses islands, et Astro ses deux islands Solid. SolidJS, Svelte et Nuxt hydratent toute la page et renvoient donc aussi ses données en JSON ; Next.js envoie le payload de ses composants en flux avec la page.

<BarChart
  title="HTML envoyé, page produits, gzip"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "kay", "value": 8.4},
    {"label": "Astro", "value": 10.3},
    {"label": "Svelte", "value": 15.7},
    {"label": "SolidJS", "value": 21.6},
    {"label": "Nuxt", "value": 23.5},
    {"label": "Next.js", "value": 23.6}
  ]}
  bench="synthetic"
/>

<BarChart
  title="Rendu serveur, page produits"
  unit="rendus/s"
  better="higher"
  digits={0}
  rows={[
    {"label": "kay", "value": 3983},
    {"label": "Svelte", "value": 3861},
    {"label": "Astro", "value": 1898},
    {"label": "SolidJS", "value": 1712},
    {"label": "Nuxt", "value": 583}
  ]}
  bench="synthetic"
/>

<BarChart
  title="Code écrit, pages produits et tableau"
  unit="K caractères"
  better="lower"
  digits={1}
  rows={[
    {"label": "kay", "value": 1.9},
    {"label": "Nuxt", "value": 2.9},
    {"label": "Svelte", "value": 3.3},
    {"label": "Astro", "value": 3.4},
    {"label": "SolidJS", "value": 3.7},
    {"label": "Next.js", "value": 4.1}
  ]}
  bench="synthetic"
  source="sans les espaces ni les commentaires, ni la glue serveur du benchmark"
/>

Compté en caractères, car les lignes dépendent de la mise en forme : Prettier fait passer les 70 lignes de l'app Svelte à 130.

<BarChart
  title="Temps de build de production"
  unit="s"
  better="lower"
  digits={2}
  rows={[
    {"label": "Svelte", "value": 0.09},
    {"label": "SolidJS", "value": 0.14},
    {"label": "kay", "value": 0.46, "note": "sans vérification de types"},
    {"label": "kay", "value": 0.58},
    {"label": "Astro", "value": 1.19},
    {"label": "Next.js", "value": 2.18},
    {"label": "Nuxt", "value": 2.58}
  ]}
  bench="synthetic"
/>

<BarChart
  title="Sortie du build, gzip"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "SolidJS", "value": 8.2},
    {"label": "Svelte", "value": 22.5},
    {"label": "kay", "value": 65.9},
    {"label": "Astro", "value": 137.8},
    {"label": "Next.js", "value": 328.6},
    {"label": "Nuxt", "value": 614.7}
  ]}
  bench="synthetic"
  source="kay, SolidJS et Svelte n'empaquettent aucun serveur"
/>

<BarChart
  title="JS envoyé, page tableau, gzip"
  unit="Ko"
  better="lower"
  rows={[
    {"label": "SolidJS", "value": 8.2},
    {"label": "Astro", "value": 9.6},
    {"label": "kay", "value": 12.5},
    {"label": "Svelte", "value": 22.5},
    {"label": "Nuxt", "value": 72.3},
    {"label": "Next.js", "value": 134.3}
  ]}
  bench="synthetic"
/>

L'island d'Astro est le même tableau Solid que l'app SolidJS, et aucune des deux n'a de routeur, là où le JavaScript de kay inclut l'écouteur dont part sa navigation de page sur place.

<BenchTable
  title="Opérations sur le tableau"
  unit="ms"
  columns={["kay", "SolidJS", "Svelte", "Astro", "Next.js", "Nuxt"]}
  rows={[
    {"label": "Créer 1 000 lignes", "values": [29.6, 26.9, 26.1, 26.4, 29.9, 26.4]},
    {"label": "Remplacer 1 000 lignes", "values": [25.5, 24.3, 25.9, 24.5, 29.9, 27.4]},
    {"label": "Mettre à jour une ligne sur 10", "values": [2.8, 2.7, 2.6, 2.6, 4.1, 3.5]},
    {"label": "Sélectionner une ligne", "values": [0.2, 0.3, 1, 0.3, 1.2, 0.7]},
    {"label": "Échanger deux lignes", "values": [2.4, 2.1, 2.1, 1.9, 20.4, 2.5]},
    {"label": "Supprimer une ligne", "values": [2, 2, 2.2, 1.9, 3.2, 4.4]},
    {"label": "Créer 10 000 lignes", "values": [262, 226, 232, 234, 360, 266]},
    {"label": "Ajouter 1 000 lignes", "values": [23.9, 22.9, 23.4, 23.1, 26.6, 25.4]},
    {"label": "Vider 1 000 lignes", "values": [3, 2.6, 3.2, 2.5, 5, 4.2]}
  ]}
  bench="synthetic"
/>

<Note title="Comment c'est mesuré">

kay 1.82.0, solid-js 1.9.17, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.3 et Nuxt 4.6.2, sur Bun 1.4.4 et Chromium 151 headless. Chaque chiffre est la médiane de trois passes du benchmark entier. Dans une passe, les chargements de page sont des médianes de 10 chargements à froid, les opérations sur le tableau des médianes de 10 exécutions après 2 échauffements, et le rendu serveur est mesuré en processus par mitata. Next.js n'y figure pas : il ne sert qu'à travers son propre serveur HTTP, donc chacun de ses rendus paierait un aller-retour par socket que les autres ne paient jamais. Les builds sont des builds de production depuis zéro, celui de kay avec et sans sa vérification de types, que Next.js fait aussi et que les autres sautent ; leur taille est ce que chacun déploie, sans les dépendances dont il a besoin pour tourner ni les source maps. Chaque tableau et ses notes sont dans le [bench/results.md](https://github.com/Kayno0o/kayjs/blob/main/bench/results.md) de kay, et `bun run bench` dans le dépôt de kay le relance. Le code est compté sur kay 1.82.0, en caractères hors espaces et commentaires : pages, layouts, composants et config, sans le fichier qui branche chaque app dans le benchmark. Mis en forme par le formateur de chaque framework, kay fmt pour kay et Prettier pour les autres, cloc 2.10 compte 73 lignes pour kay, 122 pour Nuxt, 130 pour Svelte, 175 pour Astro, 182 pour SolidJS et 211 pour Next.js.

</Note>

## Quatre vrais sites passés à kay, pertes comprises

Une page de produits ne va pas très loin, alors quatre vrais sites sont passés à kay, chacun mesuré tel qu'il se déploie face à la version qu'il remplace : [un site SvelteKit](/posts/ported-from-sveltekit) d'environ 3 000 lignes sur 22 composants, [deux petits sites d'entreprise depuis Astro](/posts/ported-from-astro), et [une petite app avec connexion depuis Elysia et Solid](/posts/ported-from-solid). Ce que kay y perd : des modifications de template et de style plus lentes à apparaître en développement, plus de mémoire au repos que SvelteKit, plus de JavaScript et des builds plus lents qu'Astro, plus de décalage de mise en page sur mobile et un build plus lent qu'Elysia et Solid.

## Écrit pour être facile à manier par un agent de code

kay est conçu pour être aussi facile à écrire pour un agent de code que pour moi :

- Un seul format de composant et une seule façon de faire chaque chose, donc moins de choix à faire et moins de risques de se tromper.
- Des templates indentés sans balises fermantes : moins de tokens à lire et à écrire pour la même page.
- Typé de bout en bout, templates compris : `kay check` pointe la ligne du `.kay`, si bien qu'un agent corrige ses propres erreurs sans navigateur.
- Toute la référence est fournie en `llms.txt` et un fichier par sujet, lus à la demande plutôt que cherchés.

Pour le vérifier, Claude Opus 5.5 a construit le même petit site dans kay et dans cinq autres frameworks, cinq fois chacun, noté par des tests navigateur qu'il n'a jamais vus. Il a lu plus de documentation de kay que de celle de n'importe quel autre framework, et écrit moins de code : [ce que kay coûte à un agent de code](/posts/agent-bench) donne chaque mesure, et le site qu'il a construit, en fonctionnement.

## À utiliser pour un projet annexe, pas pour ce qui vous réveille la nuit

Pour un projet annexe, un site personnel ou un site de petite entreprise, si ce que vous avez vu plus haut vous plaît : foncez, et dites-moi ce qui casse. Pour tout ce qui pourrait vous valoir un réveil en pleine nuit, pas encore. kay est un projet d'une seule personne, il n'a pas d'écosystème à proprement parler, et une version mineure peut encore casser votre code : le tilde dans sa plage de versions n'est pas là pour rien. Lisez le changelog avant chaque mise à jour, ou profitez de la surprise.

## kay s'installe depuis mon propre registre, pas depuis npm

Indiquez à Bun une fois pour toutes où vit le scope `@kaynooo`, dans `~/.bunfig.toml` :

```toml
[install.scopes]
"@kaynooo" = "https://git.kaynooo.fr/api/packages/kaynooo/npm/"
```

Puis lancez un projet :

```sh
bunx -p @kaynooo/kayjs kay new my-app
cd my-app
bun install
bun run dev
```

La documentation est sur [kayjs.kaynooo.fr](https://kayjs.kaynooo.fr), et le code, les issues et les questions sur [GitHub](https://github.com/Kayno0o/kayjs).
