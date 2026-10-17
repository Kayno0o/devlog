---
title: "kayjs : rapide à exécuter, simple à écrire"
description: Pourquoi j'ai construit mon propre framework web sur Bun, comment un fichier .kay devient du HTML et des islands, et ce qu'il coûte face à SolidJS, Svelte et Astro.
date: 2026-10-09
tags: [kay, benchmarks]
draft: true
---

Oui, encore un framework JavaScript. Ma défense : c'est celui que j'avais envie d'utiliser.

kay tourne sur Bun et Elysia. Un fichier `.kay` est un composant : des blocs TypeScript, puis un template indenté façon pug. Les pages sont rendues en HTML pur côté serveur, et seules les parties interactives, les islands, embarquent du JavaScript. C'est encore expérimental, donc attendez-vous à des changements cassants pendant un moment.

## À quoi ressemble un composant

La même page en kay, dans les trois frameworks dont il s'inspire, puis en Next.js et Nuxt, chacune passant son propre vérificateur :

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

La partie serveur se rend comme dans kay. Astro laisse l'état dans le navigateur à un composant d'un autre framework, ici SolidJS, dans son propre fichier et hydraté comme une island.

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

La page est un composant serveur et se rend comme dans kay. L'état demande un composant client, dans son propre fichier marqué `'use client'`.

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

## Pourquoi je l'ai construit

Je tiens à la vitesse partout : la rapidité avec laquelle une page se charge et s'exécute, la rapidité de réponse du serveur, la rapidité d'un build ou d'une suite de tests, et le peu dont le serveur a besoin, en mémoire comme pour être déployé.

Je tiens aussi à la quantité de code. J'ai deux applications à moi, une en SvelteKit d'environ 27 000 lignes et une en SolidJS d'environ 34 000, lignes vides et commentaires exclus : à cette taille, chaque ligne qu'un framework économise est une ligne de moins à écrire, à relire et à maintenir en état de marche. Aucune n'est encore migrée vers kay, et ça aura son propre article.

Pendant un temps, j'ai utilisé Astro avec SolidJS dedans : des pages rapides pour peu de code, au prix de deux frameworks et de deux façons d'écrire un composant dans un même projet. SvelteKit, SolidStart et Astro reposent aussi tous sur Vite, qui rend parfois les builds et les tests unitaires lents. kay, c'est ce que j'ai construit pour tout avoir au même endroit, avec Bun seul pour le build et les tests. Il mélange ce que j'ai aimé dans chacun :

- **Astro** : le bloc TypeScript en haut, les islands comme seul JavaScript qu'une page embarque, les content collections.
- **pug** : des templates indentés sans balises fermantes. J'ai adoré pug il y a longtemps et je n'ai jamais vu un framework le supporter. C'est court à écrire, rapide à lire, et moins de tokens pour un agent.
- **SolidJS** : les signals et les mises à jour fines, pas de DOM virtuel.
- **Svelte et SvelteKit** : un compilateur qui fait le travail en amont, des routes basées sur les fichiers avec des layouts, des form actions typées.

## Comment ça marche

1. Le compilateur lit un fichier `.kay` une seule fois et produit deux jumeaux : un constructeur de chaînes HTML pour le serveur et un constructeur DOM pour le navigateur.
2. Le serveur rend chaque page en chaîne de caractères. Une page statique n'a ni marqueurs d'hydratation ni bundle JavaScript.
3. Une island est rendue côté serveur avec des marqueurs d'hydratation, puis reprend ces nœuds dans le navigateur au lieu de rendre une seconde fois.
4. `kay build --static` écrit tout le site sous forme de fichiers, comme ce devlog, servi par un simple nginx.

Bun fait tout en dessous : le serveur, le bundler, le lanceur de tests et le driver de base de données, et un site entier se compile en un seul exécutable. Chaque build vérifie d'abord les types du projet, templates compris, si bien qu'une prop cassée ou un lien mal tapé n'arrive jamais en production.

## Un benchmark synthétique

La même page de produits et les mêmes données pour chaque framework, chacun écrit comme le font sa propre documentation et son entrée du js-framework-benchmark. kay, SolidJS et Svelte sont chronométrés derrière le même serveur Elysia, Astro et Nuxt à travers leurs propres gestionnaires de requêtes, et Next.js à travers son propre serveur HTTP. Tous les benchmarks de cet article ont tourné sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux.

### Ce que kay gagne

<BarChart title="Script du thread principal au chargement, page produits" unit="ms" better="lower" rows={[{"label": "kay", "value": 0.2}, {"label": "Astro", "value": 1.3}, {"label": "Nuxt", "value": 5.5}, {"label": "SolidJS", "value": 10.8}, {"label": "Svelte", "value": 14.2}, {"label": "Next.js", "value": 18.6}]} bench="synthetic" />

kay n'hydrate que ses islands, et Astro ses deux islands Solid. SolidJS, Svelte et Nuxt hydratent toute la page, et renvoient donc aussi ses données en JSON, et Next.js envoie le payload de ses composants en flux avec la page.

<BarChart title="HTML envoyé, page produits, gzip" unit="Ko" better="lower" rows={[{"label": "kay", "value": 8.4}, {"label": "Astro", "value": 10.3}, {"label": "Svelte", "value": 15.7}, {"label": "SolidJS", "value": 21.6}, {"label": "Nuxt", "value": 23.5}, {"label": "Next.js", "value": 23.6}]} bench="synthetic" />

<BarChart title="Rendu serveur, page produits" unit="rendus/s" better="higher" digits={0} rows={[{"label": "kay", "value": 4286}, {"label": "Svelte", "value": 3806}, {"label": "Astro", "value": 1805}, {"label": "SolidJS", "value": 1712}, {"label": "Nuxt", "value": 581}]} bench="synthetic" />

<BarChart title="Code écrit, pages produits et tableau" unit="K caractères" better="lower" digits={1} rows={[{"label": "kay", "value": 1.9}, {"label": "Nuxt", "value": 2.9}, {"label": "Svelte", "value": 3.3}, {"label": "Astro", "value": 3.4}, {"label": "SolidJS", "value": 3.7}, {"label": "Next.js", "value": 4.1}]} bench="synthetic" source="sans les espaces ni les commentaires, ni la glue serveur du benchmark" />

kay écrit les deux pages en 1 900 caractères, un tiers de moins que Nuxt, le suivant, et environ la moitié de SolidJS et Next.js. Des caractères plutôt que des lignes, puisqu'un nombre de lignes dépend de la mise en forme : l'app Svelte écrit chaque template sur une ligne, 70 lignes en tout, que Prettier transforme en 130. Les pages, layouts, composants et la config comptent ; le fichier qui branche chaque app dans le benchmark non, puisque celui de Next est un relais dont seul le benchmark a besoin.

### Ce que kay perd

<BarChart title="JS envoyé, page tableau, gzip" unit="Ko" better="lower" rows={[{"label": "SolidJS", "value": 8.2}, {"label": "Astro", "value": 9.6}, {"label": "kay", "value": 11.7}, {"label": "Svelte", "value": 22.5}, {"label": "Nuxt", "value": 71.8}, {"label": "Next.js", "value": 134.3}]} bench="synthetic" />

SolidJS envoie moins de JavaScript, et Astro aussi, dont l'island est le même tableau Solid. Celui de kay inclut sa navigation de page sur place, dont aucune des deux applis, sans routeur, ne se charge. Next.js et Nuxt en envoient 6 à 11 fois plus que kay.

<BarChart title="Création de 1 000 lignes" unit="ms" better="lower" rows={[{"label": "Svelte", "value": 25.8}, {"label": "Astro", "value": 26.6}, {"label": "SolidJS", "value": 26.7}, {"label": "Nuxt", "value": 27}, {"label": "kay", "value": 29.8}, {"label": "Next.js", "value": 29.9}]} bench="synthetic" />

Sur l'ensemble du benchmark du tableau, kay est premier pour sélectionner une ligne et devant Next.js sur chaque opération, devant Nuxt sur toutes sauf la création de 1 000 lignes. SolidJS, Svelte et Astro le battent sur la plupart des autres : kay a 21 % de retard sur le plus rapide pour échanger des lignes, 15 à 16 % pour créer 1 000 et 10 000 lignes, 11 % pour en supprimer une et pour vider le tableau, et 4 à 6 % sur le reste.

<Note title="Comment c'est mesuré">

kay 1.51.0, solid-js 1.9.15, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.0 et Nuxt 4.6.1, sur Bun 1.4.3 et Chromium 151 headless. Chaque chiffre est la médiane de trois passes du benchmark entier. Dans une passe, les chargements de page sont des médianes de 10 chargements à froid, les opérations sur le tableau des médianes de 10 exécutions après 2 échauffements, et le rendu serveur est mesuré en processus par mitata. Next.js n'y figure pas : il ne sert qu'à travers son propre serveur HTTP, donc chacun de ses rendus paierait un aller-retour par socket que les autres n'ont jamais. Chaque tableau et ses notes sont dans le [bench/results.md](https://github.com/Kayno0o/kayjs/blob/main/bench/results.md) de kay, et `bun run bench` dans le dépôt de kay le relance. Le code est compté sur kay 1.51.0, en caractères hors espaces et commentaires. Mis en forme par le formateur de chaque framework, kay fmt pour kay et Prettier pour les autres, cloc 2.10 compte 73 lignes pour kay, 122 pour Nuxt, 130 pour Svelte, 175 pour Astro, 182 pour SolidJS et 211 pour Next.js.

</Note>

## De vrais sites, portés vers kay

Trois vrais sites sont passés à kay : un depuis SvelteKit, environ 3 000 lignes sur 22 composants, et deux petits sites d'entreprise depuis Astro, chacun mesuré tel qu'il se déploie contre la version qu'il remplace. [Leur propre article](/posts/ported-to-kay) donne chaque chiffre, et ce que kay perd : des modifications plus lentes à apparaître en développement, plus de JavaScript qu'Astro, des builds plus lents.

<Stats items={[{"value": "-86 %", "label": "CPU serveur par visiteur, depuis SvelteKit"}, {"value": "3,1 à 3,4x", "label": "requêtes par seconde sur une page de contenu, depuis Astro"}, {"value": "-17 à -37 %", "label": "lignes de code"}]} />

## Pensé aussi pour les LLM

kay est conçu pour être aussi facile à écrire pour un agent de code que pour moi :

- Un seul format de composant et une seule façon de faire chaque chose, donc moins de choix à faire et moins de risques de se tromper.
- Des templates indentés sans balises fermantes : moins de tokens à lire et à écrire pour la même page.
- Typé de bout en bout, templates compris : `kay check` pointe la ligne du `.kay`, si bien qu'un agent corrige ses propres erreurs sans navigateur.
- Toute la référence est fournie en `llms.txt` et un fichier par sujet, lus à la demande plutôt que cherchés.

Pour le vérifier, Claude Opus 5.5 a construit le même petit site dans chaque framework : un catalogue de livres lu depuis des fichiers Markdown, un filtre par tag qui s'exécute dans le navigateur, un bouton favori, et un formulaire de contact vérifié sur le serveur et dans le navigateur qui fonctionne aussi sans JavaScript. Chaque exécution part du starter du framework avec sa documentation dans le projet, dans un bac à sable sans navigateur ni réseau, et une suite cachée de tests navigateur note le site.

<Note title="Le site construit par l'agent de kay, en fonctionnement">

<Embed src="/llm-bench/bookshelf/books" title="Le site Bookshelf construit par l'agent de kay" />

</Note>

Filtrez ses livres, ouvrez-en un, mettez-le en favori. C'est l'exécution au coût médian, exportée en fichiers statiques, sans son formulaire de contact, puisqu'il demande un serveur. Le style était libre et non noté : les agents de kay n'en ont écrit aucun, là où les autres ont écrit une centaine de lignes de CSS dans une exécution typique, donc les comptes de lignes ci-dessous laissent les styles de côté.

### Ce que kay gagne

<Stats items={[{"value":"13K contre 17K à 34K","label":"tokens écrits, kay contre les autres"}]} />

<BarChart title="Temps pour construire le site" unit="min" better="lower" digits={1} rows={[{"label":"Astro","value":2.6,"range":[2.5,3.6]},{"label":"kay","value":3.4,"range":[1.8,4.7]},{"label":"SvelteKit","value":4.5,"range":[3.3,12.4]},{"label":"Next.js","value":5.9,"range":[4.8,8.5]},{"label":"Nuxt","value":7.9,"range":[4.3,9.5]},{"label":"SolidStart","value":9.3,"range":[6.5,12.9]}]} bench="llm" />

<BarChart title="Lignes de code écrites, hors tests et styles" unit="lignes" better="lower" digits={0} rows={[{"label":"kay","value":323,"range":[227,336]},{"label":"Nuxt","value":444,"range":[437,476]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]},{"label":"Next.js","value":616,"range":[537,636]}]} bench="llm" />

kay est le seul framework que le modèle apprend sur le moment, dans la documentation et le paquet du projet. Il construit pourtant le site juste derrière Astro et plus vite que les quatre autres, en 27 à 48 % de lignes en moins que chacun d'eux.

### Ce que kay perd

<BarChart title="Coût du site, tarifs API" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.78,"range":[0.75,1.12]},{"label":"kay","value":0.95,"range":[0.78,1.54]},{"label":"Nuxt","value":1.46,"range":[0.91,1.8]},{"label":"SvelteKit","value":1.52,"range":[1.23,2.22]},{"label":"Next.js","value":1.87,"range":[1.37,2.85]},{"label":"SolidStart","value":1.94,"range":[1.86,2.79]}]} bench="llm" />

<BarChart title="Documentation lue" unit="K caractères" digits={0} rows={[{"label":"Nuxt","value":14,"range":[8,22]},{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"Next.js","value":84,"range":[70,114]},{"label":"SvelteKit","value":89,"range":[49,103]},{"label":"kay","value":93,"range":[77,107]}]} bench="llm" />

Astro construit le site pour moins cher. Le modèle arrive en ayant vu beaucoup d'Astro, alors qu'il apprend kay dans sa documentation, en lisant trois fois plus, et chaque appel après ces lectures les repaie. kay coûte quand même moins que les quatre autres, dont il a lui aussi vu beaucoup : les agents de Nuxt lisent le moins de documentation de tous et coûtent pourtant moitié plus.

<Note title="Comment c'est mesuré">

kay 1.51.0, ses exécutions une semaine après celles de SvelteKit, SolidStart et Astro et quelques heures après celles de Nuxt et Next.js, avec le même modèle et le même Claude Code, Opus 5.5 en effort élevé. Une exécution réussit quand le `check` du starter, le build et tous les tests d'acceptation passent ; chaque framework a réussi ses 5 exécutions, et chaque chiffre est la médiane de ces exécutions. Le coût est aux tarifs API, tel que Claude Code le rapporte. La façon dont une exécution est préparée, isolée des autres et notée a [son propre article](/posts/agent-bench) ; le cahier des charges, le prompt, les starters et chaque exécution sont dans [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

</Note>

## Faut-il l'utiliser ?

Pour un projet perso, un site personnel ou un site de petite entreprise, si ce que vous avez vu plus haut vous plaît : foncez, et dites-moi ce qui casse. Pour tout ce qui vous ferait réveiller la nuit, pas encore. kay est un projet d'une seule personne, il n'a pas d'écosystème à proprement parler, et une version mineure peut encore casser votre code : le tilde dans sa plage de versions n'est pas là pour rien. Lisez le changelog avant chaque mise à jour, ou profitez de la surprise.

## Essayer

kay est publié sur mon propre registre, pas sur npm. Indiquez à Bun une fois pour toutes où vit le scope `@kaynooo`, dans `~/.bunfig.toml` :

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
