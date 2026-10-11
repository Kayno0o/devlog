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

La même page en kay et dans les trois frameworks dont il s'inspire, chacune passant son propre vérificateur :

<Tabs label="Une page dans quatre frameworks">

<Tab group="component" label="kay" checked>

```kay
--- server
const greeting = 'Hello from the server'
---
---
const count = signal(0)
---
h1 {greeting}
button(onClick={() => count.set(count + 1)}) Clicked {count} times
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
2. Le serveur rend chaque page en chaîne de caractères. Une page statique n'a ni marqueurs ni script.
3. Une island est rendue côté serveur avec des marqueurs d'hydratation, puis reprend ces nœuds dans le navigateur au lieu de rendre une seconde fois.
4. `kay build --static` écrit tout le site sous forme de fichiers, comme ce devlog, servi par un simple nginx.

Bun fait tout en dessous : le serveur, le bundler, le lanceur de tests et le driver de base de données, et un site entier se compile en un seul exécutable. Chaque build vérifie d'abord les types du projet, templates compris, si bien qu'une prop cassée ou un lien mal tapé n'arrive jamais en production.

## Un benchmark synthétique

La même page de produits, les mêmes données et le même serveur Elysia pour chaque framework, chacun écrit comme le font sa propre documentation et son entrée du js-framework-benchmark. Tous les benchmarks de cet article ont tourné sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux.

### Ce que kay gagne

<BarChart title="Script du thread principal au chargement, page produits" unit="ms" better="lower" rows={[{"label": "kay", "value": 0.3}, {"label": "SolidJS", "value": 12.0}, {"label": "Svelte", "value": 15.7}]} bench="synthetic" />

kay n'hydrate que ses islands. SolidJS et Svelte hydratent toute la page, et renvoient donc aussi ses données en JSON.

<BarChart title="HTML envoyé, page produits, gzip" unit="Ko" better="lower" rows={[{"label": "kay", "value": 8.2}, {"label": "Svelte", "value": 15.7}, {"label": "SolidJS", "value": 21.6}]} bench="synthetic" />

<BarChart title="Rendu serveur, page produits" unit="rendus/s" better="higher" digits={0} rows={[{"label": "kay", "value": 4185}, {"label": "Svelte", "value": 3684}, {"label": "SolidJS", "value": 1685}]} bench="synthetic" />

### Ce que kay perd

<BarChart title="JS envoyé, page tableau, gzip" unit="Ko" better="lower" rows={[{"label": "SolidJS", "value": 8.2}, {"label": "kay", "value": 11.2}, {"label": "Svelte", "value": 22.5}]} bench="synthetic" />

SolidJS envoie moins de JavaScript. Celui de kay inclut sa navigation de page sur place, dont l'appli Solid, qui n'a pas de routeur, se passe.

<BarChart title="Création de 1 000 lignes" unit="ms" better="lower" rows={[{"label": "SolidJS", "value": 30.8}, {"label": "Svelte", "value": 32.4}, {"label": "kay", "value": 33.9}]} bench="synthetic" />

Sur l'ensemble du benchmark du tableau, kay reste à moins de 11 % du plus rapide sur chaque opération, et il est premier pour remplacer et ajouter 1 000 lignes et pour sélectionner une ligne. Il est dernier pour créer des lignes, de 5 % sur 1 000 et de 7 % sur 10 000, pour échanger des lignes, de 4 %, et pour mettre à jour une ligne sur 10, de 5 %.

<Note title="Comment c'est mesuré">

kay 1.28.0, solid-js 1.9.15 et Svelte 5.57.1, sur Bun 1.4.4 et Chromium 151 headless. Chaque chiffre est la médiane de trois passes du benchmark entier. Dans une passe, les chargements de page sont des médianes de 10 chargements à froid, les opérations sur le tableau des médianes de 10 exécutions après 2 échauffements, et le rendu serveur est mesuré en processus par mitata. Chaque tableau et ses notes sont dans le [bench/results.md](https://github.com/Kayno0o/kayjs/blob/main/bench/results.md) de kay, et `bun run bench` dans le dépôt de kay le relance.

</Note>

## Un vrai site, porté depuis SvelteKit

Un tableau de produits ne mène pas bien loin, alors j'ai porté un vrai site de SvelteKit vers kay : une page d'accueil et des pages de contenu, environ 3 000 lignes réparties sur 22 composants Svelte. Les deux versions ont été mesurées en une seule séance, exécutions entrelacées, en loopback : les ratios se transposent, les chiffres absolus sont optimistes.

### Ce que kay gagne

<Stats items={[{"value": "-87 %", "label": "CPU serveur par visiteur"}, {"value": "-55 %", "label": "requêtes sur la page d'accueil"}, {"value": "-19 %", "label": "image Docker"}, {"value": "-16 %", "label": "lignes de code"}]} />

<BarChart title="Premier rendu sur mobile, page de contenu" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 408}, {"label": "SvelteKit", "value": 752}]} bench="sveltekit" source="preset Lighthouse Pixel 7 (4G lente, CPU 4x), médiane de 3 exécutions" />

<BarChart title="JavaScript côté client, brotli" unit="Ko" better="lower" rows={[{"label": "kay", "value": 45.9}, {"label": "SvelteKit", "value": 70.1}]} bench="sveltekit" source="tous les fichiers écrits par le build" />

Une page ne charge que la partie dont ses islands ont besoin : 16 Ko sur une page de contenu.

La page d'accueil est prérendue, et son formulaire de contact, la seule partie qui diffère selon le visiteur, est une server island différée : le navigateur la récupère environ un écran avant qu'elle n'entre dans la vue, tandis que kay sert la page elle-même depuis la mémoire.

<BarChart title="Requêtes par seconde, page d'accueil" unit="req/s" better="higher" digits={0} rows={[{"label": "kay", "value": 37793}, {"label": "SvelteKit", "value": 790}]} bench="sveltekit" source="oha, 64 connexions pendant 10 s, 2 passes, la plus lente de kay" />

L'essentiel de cet écart vient du prérendu, pas de la vitesse de rendu : quand kay rendait toute la page à chaque requête, comme SvelteKit, il la servait à environ deux fois le débit de SvelteKit.

<BarChart title="Build, caches froids" unit="s" better="lower" digits={2} rows={[{"label": "kay", "value": 3.04}, {"label": "SvelteKit", "value": 4.25}]} bench="sveltekit" source="hyperfine, médiane de 3 exécutions" />

Sous charge, kay culmine à 79 Mio de mémoire contre 136 à 142 pour SvelteKit. La page d'accueil téléchargée par un mobile passe de 706 à 558 Ko, surtout grâce aux images : kay sert de l'AVIF à la largeur affichée.

### Ce que kay perd

<BarChart title="Mémoire du serveur au repos" unit="Mio" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 42}, {"label": "kay", "value": 51}]} bench="sveltekit" source="RSS après le démarrage" />

- **Le réglage par défaut n'est pas le chemin rapide.** Le rendu sur mobile ci-dessus demande `inlineStyles`, qui est optionnel : avec la feuille de styles liée, comme kay le fait par défaut, kay rendait de 85 à 140 ms derrière SvelteKit. L'inlining coûte environ 2 Ko par page, et la feuille de styles n'est plus mise en cache d'une page à l'autre.
- **Pages courtes avec styles inlinés.** Les pages rendues à chaque requête portent toute la feuille de styles, si bien que kay les sert à 0,9 à 1,0 fois le débit de SvelteKit, pour 1,1 à 1,2 fois son CPU par requête. Avec la feuille liée, kay les servait à 1,8 à 2,2 fois le débit de SvelteKit.

### En développement

<BarChart title="Premier chargement de la page d'accueil, serveur de dev" unit="ms" better="lower" digits={0} rows={[{"label": "kay", "value": 93}, {"label": "SvelteKit", "value": 2030}]} bench="sveltekit" source="Chromium headless, événement load, médiane de 2 passes" />

<BarChart title="Modification de template à l'écran, serveur de dev" unit="ms" better="lower" digits={0} rows={[{"label": "SvelteKit", "value": 38}, {"label": "kay", "value": 361}]} bench="sveltekit" source="de l'écriture du fichier à son affichage, médiane de 14 modifications" />

- **kay démarre et charge plus vite.** Il sert un client groupé, 19 requêtes pour la page d'accueil contre 166 modules pour Vite, démarre en 666 ms contre 1 273 avec les caches vides, et occupe 167 Mio contre 488.
- **Vite applique les modifications plus tôt.** kay redémarre son serveur à chaque modification, si bien qu'un changement de template ou de style s'affiche en 360 ms environ contre 40 pour Vite. Il affiche une modification du code serveur dans le même temps en gardant l'état de la page, ce que SvelteKit n'affiche qu'après un rechargement manuel.

<Note title="Comment c'est mesuré">

kay 1.31.0 sur Bun 1.4.4 canary, kay 1.32.0 pour le serveur de dev. Les rendus viennent de Playwright sous les presets mobile et bureau de Lighthouse, médiane de 3 exécutions ; les builds de hyperfine, médiane de 3 exécutions à froid ; le serveur de oha, 10 s à 64 connexions, deux passes. Le code du site est privé, donc la trace est [bench/sveltekit-port.md](https://github.com/Kayno0o/devlog/blob/main/bench/sveltekit-port.md), chaque chiffre avec ses conditions.

</Note>

## Deux sites, portés depuis Astro

Deux petits sites d'entreprise sont passés d'Astro à kay : un élevage de chats et un peintre en bâtiment. Chacun a été construit et servi comme il se déploie, le serveur standalone d'Astro sous Bun contre l'unique exécutable de kay, tous deux derrière nginx avec HTTP/2, TLS et brotli.

### Ce que kay gagne

<Stats items={[{"value": "-32 à -37 %", "label": "lignes de code"}, {"value": "2,2 à 3,5x", "label": "démarrage à froid plus rapide"}, {"value": "-27 à -85 %", "label": "CSS par page"}]} />

<BarChart title="Requêtes par seconde, une page de contenu" unit="req/s" better="higher" digits={0} rows={[{"label": "kay, peintre", "value": 39805}, {"label": "kay, élevage", "value": 39322}, {"label": "Astro, élevage", "value": 12648}, {"label": "Astro, peintre", "value": 11798}]} bench="astro" source="32 clients via nginx pendant 5 s" />

kay sert ces pages prérendues et déjà compressées, si bien que nginx passe environ 20 µs sur chacune au lieu de 470 à 540, et tous deux frôlent le plafond du client de charge lui-même, environ 40 000 par seconde. Les deux sites chargent leur formulaire de contact comme une server island différée, donc toutes les pages sauf l'accueil de l'élevage sont prérendues.

<BarChart title="Mémoire du serveur après charge" unit="Mo" better="lower" digits={0} rows={[{"label": "Astro, élevage", "value": 281}, {"label": "kay, élevage", "value": 144}, {"label": "Astro, peintre", "value": 125}, {"label": "kay, peintre", "value": 95}]} bench="astro" source="RSS après les passes de charge" />

<BarChart title="Taille déployée" unit="Mo" better="lower" digits={0} rows={[{"label": "Astro, peintre", "value": 301}, {"label": "Astro, élevage", "value": 231}, {"label": "kay, élevage", "value": 109}, {"label": "kay, peintre", "value": 98}]} bench="astro" source="dist et node_modules de production contre un seul exécutable" />

- **Des images plus légères**, servies en AVIF à la largeur affichée : 55 contre 143 Ko et 36 contre 161 Ko par page sur desktop, 115 contre 143 Ko et 105 contre 185 Ko sur mobile.
- **Des rendus plus rapides sur le site de l'élevage** : sur mobile, le plus gros rendu arrive à 1,78 s au lieu de 2,73 s, et un mobile télécharge 201 Ko par page au lieu de 256.

### Ce que kay perd

<BarChart title="JS envoyé par page, brotli" unit="Ko" better="lower" rows={[{"label": "Astro, peintre", "value": 0.4}, {"label": "Astro, élevage", "value": 5.2}, {"label": "kay, élevage", "value": 13.1}, {"label": "kay, peintre", "value": 13.1}]} bench="astro" source="moyenne sur toutes les pages" />

- **Plus de JavaScript.** Le site du peintre envoyait 0,4 Ko sur Astro, quelques scripts simples inlinés dans ses pages, et en envoie 13,1 sur kay, surtout le runtime dont ses islands et la navigation sur place ont besoin ; celui de l'élevage passe de 5,2 à 13,1 Ko.
- **Un site de peintre plus lourd sur mobile.** Un mobile télécharge 170 Ko par page contre 126, surtout des polices (107 contre 35 Ko) et ce script. Son plus gros rendu arrive environ 70 ms plus tard sur mobile et 35 ms plus tard sur desktop.
- **Des builds plus lents.** Un `kay build` propre encode une copie AVIF et une copie WebP de chaque image à chaque largeur, et vérifie les types, ce que `astro build` ne fait pas : 11,3 contre 1,9 s sur l'élevage et 7,1 contre 1,6 s sur le peintre, le build de l'élevage culminant à 1,9 Go contre 1,1.

<Note title="Comment c'est mesuré">

kay 1.28.0 sur Bun 1.4.4, Chromium 151 headless et nginx 1.30.5 configuré comme en production, les deux côtés en une seule séance. Les rendus sont des médianes de 5 chargements à froid par page sous la limitation de Lighthouse ; la charge est de 32 clients pendant 5 s par URL ; les builds sont la médiane de 3 exécutions propres. Le code des sites est privé, donc la trace est [bench/astro-ports.md](https://github.com/Kayno0o/devlog/blob/main/bench/astro-ports.md), chaque chiffre avec ses conditions.

</Note>

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

Filtrez ses livres, ouvrez-en un, mettez-le en favori. C'est l'exécution au coût médian, passée sur le kay actuel et exportée en fichiers statiques, sans son formulaire de contact, puisqu'il demande un serveur. Le style était libre et non noté : les agents de kay n'en ont généralement écrit aucun, là où les autres ont écrit une centaine de lignes de CSS à chaque exécution, donc les comptes de lignes ci-dessous laissent les styles de côté.

### Ce que kay gagne

<Stats items={[{"value":"13K contre 17K à 34K","label":"tokens écrits, kay contre les autres"}]} />

<BarChart title="Temps pour construire le site" unit="min" better="lower" digits={1} rows={[{"label":"kay","value":2.6,"range":[1.9,2.8]},{"label":"Astro","value":2.6,"range":[2.5,3.6]},{"label":"SvelteKit","value":4.5,"range":[3.3,12.4]},{"label":"SolidStart","value":9.3,"range":[6.5,12.9]}]} bench="llm" />

<BarChart title="Lignes de code écrites, hors tests et styles" unit="lignes" better="lower" digits={0} rows={[{"label":"kay","value":348,"range":[333,360]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]}]} bench="llm" />

kay est le seul framework que le modèle n'avait jamais vu : tout ce qu'il en sait vient de la documentation du projet. Il construit pourtant le site aussi vite qu'Astro et plus vite que les deux autres, en 25 à 35 % de lignes en moins que chacun d'eux.

### Ce que kay perd

<BarChart title="Coût du site, tarifs API" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.78,"range":[0.75,1.12]},{"label":"kay","value":0.95,"range":[0.88,1.11]},{"label":"SvelteKit","value":1.52,"range":[1.23,2.22]},{"label":"SolidStart","value":1.94,"range":[1.86,2.79]}]} bench="llm" />

<BarChart title="Documentation lue" unit="K caractères" digits={0} rows={[{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"SvelteKit","value":89,"range":[49,103]},{"label":"kay","value":96,"range":[83,116]}]} bench="llm" />

Astro construit le site pour moins cher. Le modèle connaît déjà Astro, alors qu'il apprend kay dans sa documentation, en lisant trois fois plus, et chaque appel après ces lectures les repaie. kay coûte quand même moins que SvelteKit et SolidStart, que le modèle connaît eux aussi.

<Note title="Comment c'est mesuré">

kay 1.27.0, ses exécutions quelques heures après celles des autres, avec le même modèle et le même Claude Code. Chaque exécution est une session Claude Code headless, Opus 5.5 en effort élevé, sans instructions de projet, hooks ni plugins, dans une copie neuve du starter du framework sous bubblewrap, donc sans accès aux tests, aux autres exécutions ni à quoi que ce soit d'autre sur la machine. Une exécution réussit quand le `check` du starter, le build et tous les tests d'acceptation passent ; chaque framework a réussi ses 5 exécutions, et chaque chiffre est la médiane de ces exécutions. Le coût est aux tarifs API, tel que Claude Code le rapporte. Le cahier des charges, le prompt, les starters et chaque exécution sont dans [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.27/results.md).

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
