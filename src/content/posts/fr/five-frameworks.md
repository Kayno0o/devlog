---
title: "Next.js, Nuxt, Astro, Svelte, Solid : mesurés, puis confiés à une IA"
description: "La même app dans cinq frameworks, chronométrée dans le navigateur, sur le serveur et au build. Puis le même site construit dans chacun par un agent de code, sur un modèle cher et un moins cher, et ce que ça a coûté."
date: 2026-10-19
tags: [benchmarks, llm]
draft: false
---

Deux questions sur les cinq mêmes frameworks. À quelle vitesse tournent-ils, une fois la page arrivée dans le navigateur ou sur le serveur ? Et combien coûte à un agent de code la construction d'un site avec chacun ? D'où deux benchmarks : un synthétique, puis un où c'est une IA qui code. Tout a tourné sur la même machine, un Ryzen 5 7600 (12 threads) sous Linux.

## La vitesse : une app, cinq frameworks

Chaque framework affiche la même page de produits avec les mêmes données, écrite comme le feraient sa propre doc et son entrée du js-framework-benchmark. SolidJS et Svelte tournent derrière le même serveur Elysia, Astro et Nuxt derrière leurs propres gestionnaires de requêtes, et Next.js derrière son propre serveur HTTP.

<BarChart title="Temps de script au chargement, page produits" unit="ms" better="lower" rows={[{"label":"Astro","value":1.3},{"label":"Nuxt","value":5.3},{"label":"SolidJS","value":10.7},{"label":"Svelte","value":13.8},{"label":"Next.js","value":18.8}]} bench="syntheticNeutral" />

Si Astro exécute si peu au chargement, c'est qu'il n'hydrate que ses deux islands Solid. SolidJS, Svelte et Nuxt hydratent toute la page, et renvoient donc ses données une deuxième fois en JSON, et Next.js envoie le payload de ses composants en flux avec le HTML.

<BarChart title="HTML envoyé, page produits, gzip" unit="Ko" better="lower" rows={[{"label":"Astro","value":10.3},{"label":"Svelte","value":15.7},{"label":"SolidJS","value":21.6},{"label":"Nuxt","value":23.5},{"label":"Next.js","value":23.6}]} bench="syntheticNeutral" />

<BarChart title="Rendu serveur, page produits" unit="rendus/s" better="higher" digits={0} rows={[{"label":"Svelte","value":3796},{"label":"Astro","value":1827},{"label":"SolidJS","value":1697},{"label":"Nuxt","value":585}]} bench="syntheticNeutral" />

<BarChart title="Code écrit, pages produits et tableau" unit="K caractères" better="lower" digits={1} rows={[{"label":"Nuxt","value":2.9},{"label":"Svelte","value":3.3},{"label":"Astro","value":3.4},{"label":"SolidJS","value":3.7},{"label":"Next.js","value":4.1}]} bench="syntheticNeutral" source="sans les espaces ni les commentaires, ni la glue serveur du benchmark" />

Le code est compté en caractères, car un nombre de lignes mesure surtout le formateur : Prettier fait passer l'app Svelte de 70 à 130 lignes.

<BarChart title="Temps de build de production" unit="s" better="lower" digits={2} rows={[{"label":"Svelte","value":0.09},{"label":"SolidJS","value":0.14},{"label":"Astro","value":0.63},{"label":"Nuxt","value":1.99},{"label":"Next.js","value":2.14}]} bench="syntheticNeutral" />

<BarChart title="Taille du build, gzip" unit="Ko" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Svelte","value":22.5},{"label":"Astro","value":138.1},{"label":"Next.js","value":328.9},{"label":"Nuxt","value":610.7}]} bench="syntheticNeutral" source="SolidJS et Svelte n'empaquettent aucun serveur" />

<BarChart title="JS envoyé, page tableau, gzip" unit="Ko" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Astro","value":9.6},{"label":"Svelte","value":22.5},{"label":"Nuxt","value":71.8},{"label":"Next.js","value":134.3}]} bench="syntheticNeutral" />

L'island d'Astro est exactement le même tableau Solid que l'app SolidJS, et aucune des deux n'embarque de routeur.

<BenchTable title="Opérations sur le tableau" unit="ms" columns={["SolidJS","Svelte","Astro","Next.js","Nuxt"]} rows={[{"label":"Créer 1 000 lignes","values":[26.1,27.6,26.7,29.6,26.9]},{"label":"Remplacer 1 000 lignes","values":[24.7,25.7,24.7,29.8,27.5]},{"label":"Mettre à jour une ligne sur 10","values":[2.7,2.6,2.7,4,3.5]},{"label":"Sélectionner une ligne","values":[0.3,0.9,0.3,1.2,0.6]},{"label":"Échanger deux lignes","values":[2,2.1,1.9,20.4,2.4]},{"label":"Supprimer une ligne","values":[1.9,2.2,1.9,3.2,4.5]},{"label":"Créer 10 000 lignes","values":[227,230,236,363,267]},{"label":"Ajouter 1 000 lignes","values":[23.6,23.9,23.4,26.6,25.8]},{"label":"Vider 1 000 lignes","values":[2.7,3.2,2.8,5,4.3]}]} bench="syntheticNeutral" />

<Note title="Comment c'est mesuré">

solid-js 1.9.15, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.0 et Nuxt 4.6.1, sur Bun 1.4.3 et Chromium 151 headless. Chaque chiffre est la médiane de trois passes complètes du benchmark. Dans une passe, un chargement de page est la médiane de 10 chargements à froid, une opération sur le tableau la médiane de 10 runs après 2 d'échauffement, et le rendu serveur est mesuré dans le processus par mitata. Next.js n'y figure pas : il ne sert qu'à travers son propre serveur HTTP, donc chaque rendu paierait un aller-retour réseau que les autres n'ont pas. Les builds de production partent de zéro, et celui de Next.js inclut la vérification de types qu'il fait et que les autres sautent. Leur taille est ce que chacun déploie, sans ses dépendances d'exécution ni les source maps. Le code est compté en caractères, hors espaces et commentaires : pages, layouts, composants et config, sans le fichier qui branche chaque app au benchmark. Formaté par Prettier, cloc 2.10 compte 122 lignes pour Nuxt, 130 pour Svelte, 175 pour Astro, 182 pour SolidJS et 211 pour Next.js.

</Note>

## Le même site, confié à une IA

Deuxième question : quand un agent de code construit un site, combien le framework lui coûte-t-il ? En tokens, en temps, en tours, en doc lue, en erreurs de vérification et en lignes de code. Un framework qu'un agent écrit correctement et pour pas cher, c'est un framework auquel je peux confier du travail.

### Le site

Chaque run construit Bookshelf, un petit catalogue de livres classiques, à partir d'un même cahier des charges où seul le nom du framework change :

- 8 livres en Markdown avec frontmatter, lus comme une collection de contenu, chacun avec sa propre page.
- Une liste de livres avec un filtre par tag côté navigateur, et un bouton favori dont l'état survit à un rechargement grâce à `localStorage`.
- Un formulaire de contact validé côté serveur et côté navigateur, qui marche aussi sans JavaScript.
- Un layout commun, une page à propos et une vraie 404, avec son code de statut.

Chaque texte que cherchent les tests est donné mot pour mot : un run ne peut échouer que sur ses propres fautes de frappe, pas sur les miennes. Le style est libre et n'est pas noté.

### Les tests cachés

Un run est noté par une suite Playwright que l'agent ne voit jamais : 11 tests qui pilotent un Chromium headless, répétés pour chaque page ou chaque livre quand c'est pertinent. Ils vérifient le layout et son lien actif, les livres les mieux notés dans l'ordre, la liste et son filtre, chaque page de livre, les favoris après un rechargement, le formulaire avec et sans JavaScript, et la 404.

Une suite de tests ne vaut que ce contre quoi on l'a validée, alors celle-ci tourne aussi contre un site de référence écrit avec Bun seul, sans aucun framework. Si la référence échoue, c'est la suite qui a tort, pas les frameworks.

### Les starters et leur doc

Chaque run part du générateur officiel du framework, dans sa version la plus minimale qui ait encore un serveur pour le formulaire : `sv create --template minimal` avec l'adaptateur Node, le `basic` de SolidStart 2, `create-astro --template minimal` avec l'adaptateur Node, `create-nuxt --template minimal` sans module, `create-next-app --empty` avec l'App Router. Je ne touche qu'à leurs scripts, pour que `bun run check`, `bun run build` et `bun run start` fassent la même chose partout, et j'ajoute le `vue-tsc` et le TypeScript 6 dont le check de Nuxt a besoin. Chaque `check` reste celui du starter et n'échoue que sur des erreurs.

La doc est copiée hors ligne dans le projet, puisque le prompt interdit le réseau sauf pour `bun add`. Elle varie autant en nature qu'en taille : pour SvelteKit, SolidStart et Nuxt, ce sont les pages liées par leur `llms.txt`, 3,4, 0,8 et 7,8 Mo. Pour Next.js, le Markdown des pages liées par son `llms.txt`, 3,1 Mo, plus la doc de son paquet, vers laquelle pointe l'`AGENTS.md` que crée son générateur. Astro a retiré son `llms.txt`, donc sa doc est la source Markdown de son site, 3,0 Mo en 424 fichiers.

### Des runs isolés

Chaque run est une session Claude Code headless, `claude -p --safe-mode` : ni CLAUDE.md, ni hooks, ni plugins, ni serveurs MCP, et un dossier de config vide rien que pour elle. Elle tourne sous bubblewrap, qui lui cache mon espace de travail, ma config et mes transcripts Claude, les autres runs, le site de référence et les navigateurs de test, avec son propre `/tmp` et sa propre liste de processus. L'agent ne peut donc ni lorgner les tests, ni recopier un run précédent, ni vérifier son travail dans un navigateur : il n'a que `check`, le build et sa propre réflexion.

Quand l'agent s'arrête, le script de notation lance `bun run check` et `bun run build`, démarre le site avec `bun run start` sur un port donné et lance la suite dessus. Un run est réussi quand les trois passent.

Les runs alternent entre frameworks dans un ordre qui tourne, pour qu'une heure lente de l'API pénalise tout le monde pareil. Mais chaque session d'Opus n'en couvrait qu'une partie, SvelteKit, SolidStart et Astro ensemble, puis Nuxt et Next.js six jours plus tard, donc ses temps sont à prendre avec des pincettes ; ceux de Sonnet ont tourné d'une traite. Le rapport relève aussi ce que la notation ne voit pas : dans 24 runs Opus sur 25, l'agent a lancé `python`, `node` ou un autre gestionnaire de paquets alors que le prompt demandait Bun uniquement (16 fois dans un run Nuxt), contre 4 sur 25 pour Sonnet, et chaque run SvelteKit des deux modèles a modifié son script `start`, dont dépend la notation.

### D'abord un run d'essai

Une session complète, c'est 5 runs par framework : un bug dans le banc de test en gâche donc 25. Chaque changement commence plutôt par un run d'essai d'un seul framework, dont je lis les résultats et le transcript avant de passer au suivant. Un essai coûte environ un dollar, et il les vaut bien : celui de Next.js a échoué, à cause de la suite et pas du site. Le test des favoris attendait que le réseau se calme après un rechargement, ce que le routeur de Next ne fait jamais à la deuxième visite ; la suite ouvre donc maintenant chaque visite dans un nouveau contexte de navigateur, qui reprend les cookies et le stockage. Les runs de Sonnet en ont trouvé un autre : la suite cherchait les champs du formulaire par le texte de leur label, qui inclut le texte qu'un serveur remet dans un textarea, si bien qu'un site SolidStart qui marchait a échoué. Elle les cherche maintenant par leur nom accessible, et chaque site d'Opus passe toujours.

<Stats items={[{"value":"25 sur 25","label":"runs Opus qui passent toutes les vérifications et tous les tests"},{"value":"22 sur 25","label":"runs Sonnet qui passent toutes les vérifications et tous les tests"},{"value":"39,93 $ contre 5,50 $","label":"les 25 runs, Opus contre Sonnet, aux tarifs de l'API"}]} />

### Résultats

Opus 5.5 en effort high, c'est le haut de gamme : les mêmes 25 runs ont donc aussi été confiés à Sonnet 5.5 en effort medium, plus proche de ce qu'une équipe utiliserait au quotidien. Chaque graphique montre le run réussi médian de chaque framework, avec le plus bas et le plus haut à côté.

Chaque échec de Sonnet est un bug qu'un navigateur aurait montré tout de suite, et l'agent n'en avait pas. Deux fois, le store des favoris de SvelteKit écrivait son état pendant le rendu de la page, ce que Svelte refuse une fois la page hydratée : la liste des livres et leurs pages tombaient sur la page d'erreur. Une fois, le layout d'Astro comparait le chemin à `/about`, qu'une page prérendue voit comme `/about/` : aucun lien de la nav n'était marqué actif.

<BarChart title="Tokens écrits, réflexion comprise" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro, Opus","value":17,"range":[15.8,23.9]},{"label":"Astro, Sonnet","value":5.8,"range":[5.5,6.2]},{"label":"SvelteKit, Opus","value":25.3,"range":[21.1,36.6]},{"label":"SvelteKit, Sonnet","value":12.7,"range":[12.7,13.2]},{"label":"Nuxt, Opus","value":28.7,"range":[20.1,36.2]},{"label":"Nuxt, Sonnet","value":7.2,"range":[6.7,8.4]},{"label":"Next.js, Opus","value":29.7,"range":[24.4,46.6]},{"label":"Next.js, Sonnet","value":7.1,"range":[6.3,9.6]},{"label":"SolidStart, Opus","value":33.9,"range":[32.2,44.6]},{"label":"SolidStart, Sonnet","value":10.5,"range":[9.6,15.6]}]} bench="llmModels" />

<BarChart title="Temps pour construire le site" unit="min" better="lower" digits={1} rows={[{"label":"Astro, Opus","value":2.6,"range":[2.5,3.6]},{"label":"Astro, Sonnet","value":0.9,"range":[0.7,1.1]},{"label":"SvelteKit, Opus","value":4.5,"range":[3.3,12.4]},{"label":"SvelteKit, Sonnet","value":3.3,"range":[2.4,3.3]},{"label":"Next.js, Opus","value":5.9,"range":[4.8,8.5]},{"label":"Next.js, Sonnet","value":1.4,"range":[0.8,1.8]},{"label":"Nuxt, Opus","value":7.9,"range":[4.3,9.5]},{"label":"Nuxt, Sonnet","value":2.1,"range":[1.3,3.1]},{"label":"SolidStart, Opus","value":9.3,"range":[6.5,12.9]},{"label":"SolidStart, Sonnet","value":1.8,"range":[1.5,3.5]}]} bench="llmModels" />

<BarChart title="Coût du site, aux tarifs de l'API" unit="USD" better="lower" digits={2} rows={[{"label":"Astro, Opus","value":0.78,"range":[0.75,1.12]},{"label":"Astro, Sonnet","value":0.12,"range":[0.11,0.13]},{"label":"Nuxt, Opus","value":1.46,"range":[0.91,1.8]},{"label":"Nuxt, Sonnet","value":0.15,"range":[0.14,0.19]},{"label":"SvelteKit, Opus","value":1.52,"range":[1.23,2.22]},{"label":"SvelteKit, Sonnet","value":0.38,"range":[0.37,0.39]},{"label":"Next.js, Opus","value":1.87,"range":[1.37,2.85]},{"label":"Next.js, Sonnet","value":0.15,"range":[0.14,0.21]},{"label":"SolidStart, Opus","value":1.94,"range":[1.86,2.79]},{"label":"SolidStart, Sonnet","value":0.23,"range":[0.22,0.43]}]} bench="llmModels" />

À partir d'ici, les graphiques sont ceux d'Opus seul.

Le style était libre et non noté, donc les comptes de lignes laissent le CSS de côté : de 77 à 113 lignes dans les runs médians.

<BarChart title="Lignes de code écrites, hors tests et styles" unit="lignes" better="lower" digits={0} rows={[{"label":"Nuxt","value":444,"range":[437,476]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]},{"label":"Next.js","value":616,"range":[537,636]}]} bench="llm" />

<BarChart title="Tokens de réflexion" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.3]},{"label":"Nuxt","value":10.2,"range":[7.5,13.8]},{"label":"Next.js","value":10.6,"range":[8.8,20.7]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

<BarChart title="Tours de l'agent" unit="tours" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"Nuxt","value":47,"range":[30,56]},{"label":"Next.js","value":50,"range":[38,72]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Doc lue" unit="K caractères" digits={0} rows={[{"label":"Nuxt","value":14,"range":[8,22]},{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"Next.js","value":84,"range":[70,114]},{"label":"SvelteKit","value":89,"range":[49,103]}]} bench="llm" />

<BarChart title="Plus gros contexte en un seul appel" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"Nuxt","value":67,"range":[48.4,91.2]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"Next.js","value":90,"range":[71.2,120.1]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

<Note title="Comment c'est mesuré">

Claude Opus 5.5 en effort high et Claude Sonnet 5.5 en effort medium, Claude Code 2.1.289, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1 et Next.js 16.4.2, tous sur Bun, 5 runs chacun par modèle. Les runs Nuxt et Next.js d'Opus ont tourné six jours après ses autres, et tous ceux de Sonnet le 19 octobre. Chaque chiffre est la médiane des runs réussis. Le coût est aux tarifs de l'API, tel que Claude Code le rapporte. Le cahier des charges, le prompt, les starters, la suite et chaque run sont dans bench/llm : [les runs d'Opus](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md) et [ceux de Sonnet](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-sonnet-medium/results.md).

</Note>
