---
title: "Cinq frameworks, mesurés deux fois"
description: "Cinq frameworks web mesurés deux fois : un benchmark synthétique qui chronomètre la même page de produits dans le navigateur, sur le serveur et au build, et un agent de code qui construit le même site dans chacun."
date: 2026-10-19
tags: [benchmarks, llm]
draft: true
---

Deux benchmarks, cinq frameworks chacun. Le premier est synthétique : la même page de produits et le même tableau dans chaque framework, chronométrés dans le navigateur, sur le serveur et au build. Le second confie le même petit site à un agent de code dans chaque framework et compte ce que sa construction a coûté. Tous les benchmarks de cet article ont tourné sur une seule machine de bureau, un Ryzen 5 7600 à 12 threads sous Linux.

## Un benchmark synthétique

La même page de produits et les mêmes données pour chaque framework, chacun écrit comme le font sa propre documentation et son entrée du js-framework-benchmark. SolidJS et Svelte sont chronométrés derrière le même serveur Elysia, Astro et Nuxt à travers leurs propres gestionnaires de requêtes, et Next.js à travers son propre serveur HTTP.

<BarChart title="Script du thread principal au chargement, page produits" unit="ms" better="lower" rows={[{"label":"Astro","value":1.3},{"label":"Nuxt","value":5.3},{"label":"SolidJS","value":10.7},{"label":"Svelte","value":13.8},{"label":"Next.js","value":18.8}]} bench="syntheticNeutral" />

Astro n'hydrate que ses deux islands Solid. SolidJS, Svelte et Nuxt hydratent toute la page, et renvoient donc aussi ses données en JSON, et Next.js envoie le payload de ses composants en flux avec la page.

<BarChart title="HTML envoyé, page produits, gzip" unit="Ko" better="lower" rows={[{"label":"Astro","value":10.3},{"label":"Svelte","value":15.7},{"label":"SolidJS","value":21.6},{"label":"Nuxt","value":23.5},{"label":"Next.js","value":23.6}]} bench="syntheticNeutral" />

<BarChart title="Rendu serveur, page produits" unit="rendus/s" better="higher" digits={0} rows={[{"label":"Svelte","value":3796},{"label":"Astro","value":1827},{"label":"SolidJS","value":1697},{"label":"Nuxt","value":585}]} bench="syntheticNeutral" />

<BarChart title="Code écrit, pages produits et tableau" unit="K caractères" better="lower" digits={1} rows={[{"label":"Nuxt","value":2.9},{"label":"Svelte","value":3.3},{"label":"Astro","value":3.4},{"label":"SolidJS","value":3.7},{"label":"Next.js","value":4.1}]} bench="syntheticNeutral" source="sans les espaces ni les commentaires, ni la glue serveur du benchmark" />

Compté en caractères, car les lignes dépendent de la mise en forme : Prettier fait passer les 70 lignes de l'app Svelte à 130.

<BarChart title="Temps de build de production" unit="s" better="lower" digits={2} rows={[{"label":"Svelte","value":0.09},{"label":"SolidJS","value":0.14},{"label":"Astro","value":0.63},{"label":"Nuxt","value":1.99},{"label":"Next.js","value":2.14}]} bench="syntheticNeutral" />

<BarChart title="Sortie du build, gzip" unit="Ko" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Svelte","value":22.5},{"label":"Astro","value":138.1},{"label":"Next.js","value":328.9},{"label":"Nuxt","value":610.7}]} bench="syntheticNeutral" source="SolidJS et Svelte n'empaquettent aucun serveur" />

<BarChart title="JS envoyé, page tableau, gzip" unit="Ko" better="lower" rows={[{"label":"SolidJS","value":8.2},{"label":"Astro","value":9.6},{"label":"Svelte","value":22.5},{"label":"Nuxt","value":71.8},{"label":"Next.js","value":134.3}]} bench="syntheticNeutral" />

L'island d'Astro est le même tableau Solid que l'app SolidJS, et aucune des deux n'a de routeur.

<BenchTable title="Opérations sur le tableau" unit="ms" columns={["SolidJS","Svelte","Astro","Next.js","Nuxt"]} rows={[{"label":"Créer 1 000 lignes","values":[26.1,27.6,26.7,29.6,26.9]},{"label":"Remplacer 1 000 lignes","values":[24.7,25.7,24.7,29.8,27.5]},{"label":"Mettre à jour une ligne sur 10","values":[2.7,2.6,2.7,4,3.5]},{"label":"Sélectionner une ligne","values":[0.3,0.9,0.3,1.2,0.6]},{"label":"Échanger deux lignes","values":[2,2.1,1.9,20.4,2.4]},{"label":"Supprimer une ligne","values":[1.9,2.2,1.9,3.2,4.5]},{"label":"Créer 10 000 lignes","values":[227,230,236,363,267]},{"label":"Ajouter 1 000 lignes","values":[23.6,23.9,23.4,26.6,25.8]},{"label":"Vider 1 000 lignes","values":[2.7,3.2,2.8,5,4.3]}]} bench="syntheticNeutral" />

<Note title="Comment c'est mesuré">

solid-js 1.9.15, Svelte 5.57.1, Astro 7.3.8, Next.js 16.4.0 et Nuxt 4.6.1, sur Bun 1.4.3 et Chromium 151 headless. Chaque chiffre est la médiane de trois passes du benchmark entier. Dans une passe, les chargements de page sont des médianes de 10 chargements à froid, les opérations sur le tableau des médianes de 10 exécutions après 2 échauffements, et le rendu serveur est mesuré en processus par mitata. Next.js n'y figure pas : il ne sert qu'à travers son propre serveur HTTP, donc chacun de ses rendus paierait un aller-retour par socket que les autres n'ont jamais. Les builds sont des builds de production à neuf, celui de Next.js avec la vérification de types qu'il fait et que les autres sautent ; leur taille est ce que chacun déploie, sans les dépendances dont il a besoin pour tourner ni les source maps. Le code est compté en caractères hors espaces et commentaires : pages, layouts, composants et config, sans le fichier qui branche chaque app dans le benchmark. Mis en forme par Prettier, cloc 2.10 compte 122 lignes pour Nuxt, 130 pour Svelte, 175 pour Astro, 182 pour SolidJS et 211 pour Next.js.

</Note>

## Un site, construit par un agent de code

La question est simple : quand un agent de code construit un site, combien le framework lui coûte-t-il ? Des tokens, du temps, des tours, de la documentation lue, des erreurs de vérification, des lignes de code. Un framework qu'un agent écrit à moindre coût et correctement, c'est un framework auquel je peux confier du travail.

### Le site

Chaque exécution construit Bookshelf, un petit catalogue de livres classiques, à partir d'un seul cahier des charges où seul le nom du framework change :

- 8 livres en fichiers Markdown avec un frontmatter, lus comme une collection de contenu, chacun rendu sur sa propre page.
- Une liste de livres avec un filtre par tag qui tourne dans le navigateur, et un bouton favori dont l'état survit à un rechargement dans `localStorage`.
- Un formulaire de contact vérifié côté serveur et dans le navigateur, qui marche aussi JavaScript désactivé.
- Une mise en page commune, une page à propos, et une vraie 404 avec son code de statut.

Chaque texte que cherchent les tests est donné mot pour mot : une exécution ne peut pas échouer sur une de mes fautes de frappe, seulement sur les siennes. Le style est libre et n'est pas noté.

### Les tests cachés

Une exécution est notée par une suite Playwright que l'agent ne voit jamais : 11 tests qui pilotent Chromium sans interface, lancés une fois par page ou par livre quand c'est pertinent. Ils vérifient la mise en page et son lien courant, les livres les mieux notés dans l'ordre, la liste et son filtre, chaque page de livre, les favoris après un rechargement, le formulaire avec et sans JavaScript, et la 404.

Une suite ne vaut que ce contre quoi elle a été prouvée, alors elle tourne aussi contre un site de référence construit avec Bun seul, sans aucun framework. Si la référence échoue, c'est la suite qui a tort, pas les frameworks.

### Les starters et leur documentation

Chaque exécution part du générateur de projet du framework, aussi minimal que possible tout en ayant un serveur pour le formulaire : `sv create --template minimal` avec l'adaptateur Node, le `basic` de SolidStart 2, `create-astro --template minimal` avec l'adaptateur Node, `create-nuxt --template minimal` sans module, `create-next-app --empty` avec l'App Router. Je ne touche qu'à leurs scripts, pour que `bun run check`, `bun run build` et `bun run start` veuillent dire la même chose partout, et j'ajoute le `vue-tsc` et le TypeScript 6 dont le check de Nuxt a besoin. Chaque `check` reste celui du starter, qui n'échoue que sur les erreurs.

La documentation est dans le projet, hors ligne, puisque le prompt n'autorise aucun accès réseau hormis `bun add`. Elle diffère autant par sa nature que par sa taille : celles de SvelteKit, SolidStart et Nuxt, ce sont les pages que lie leur `llms.txt`, 3,4, 0,8 et 7,8 Mo. Celle de Next.js, le Markdown des pages que lie son `llms.txt`, 3,1 Mo, plus la documentation de son paquet, vers laquelle pointe l'`AGENTS.md` qu'écrit son générateur. Astro a abandonné son `llms.txt`, donc sa documentation est la source Markdown de son site, 3,0 Mo en 424 fichiers.

### Des exécutions bien séparées

Chaque exécution est une session Claude Code headless, `claude -p --safe-mode` : pas de CLAUDE.md, pas de hooks, pas de plugins, pas de serveurs MCP, et un dossier de configuration vide rien qu'à elle. Elle tourne sous bubblewrap, qui cache mon espace de travail, ma configuration et mes transcripts Claude, les autres exécutions, le site de référence et les navigateurs de test, avec un `/tmp` et une liste de processus privés. L'agent ne peut donc ni lorgner les tests, ni copier une exécution précédente, ni vérifier son travail dans un navigateur : `check`, le build et son propre raisonnement sont tout ce qu'il a.

Une fois l'agent arrêté, le correcteur lance `bun run check` et `bun run build`, démarre le site avec `bun run start` sur un port donné, et lance la suite dessus. Une exécution réussit quand les trois passent.

Le harnais alterne les exécutions entre frameworks, dans un ordre qui tourne, pour qu'une heure lente de l'API tombe sur tout le monde pareil, mais chaque séance ici n'en couvre qu'une partie : SvelteKit, SolidStart et Astro ensemble, puis Nuxt et Next.js l'un après l'autre, donc le temps est la mesure à lire avec le plus de recul. Le rapport liste aussi ce que la note ne voit pas : dans 24 exécutions sur 25, l'agent a lancé `python`, `node` ou un autre gestionnaire de paquets alors que le prompt demande Bun seul, jusqu'à 16 fois dans une exécution Nuxt, et chaque exécution SvelteKit a modifié son script `start`, une entrée de la notation à relire avant de se fier au résultat.

### D'abord une sonde

Une série complète, c'est 5 exécutions par framework, donc une erreur dans le harnais coûte 25 exécutions. Chaque changement commence plutôt par une sonde : une exécution d'un seul framework sous une étiquette jetable, ses résultats et son transcript lus, puis le framework suivant. Une sonde coûte environ un dollar. La sonde de Next.js a échoué sur la suite, pas sur son site : le test des favoris attendait que le réseau se calme après un rechargement, ce que le routeur de Next ne laisse jamais arriver à une deuxième visite, alors la suite ouvre maintenant chaque visite dans un nouveau contexte de navigateur qui reprend les cookies et le stockage.

<Stats items={[{"value":"25 sur 25","label":"exécutions qui passent chaque vérification et chaque test"},{"value":"39,93 $","label":"les 25 exécutions aux tarifs API"}]} />

### Résultats

Chaque graphique montre l'exécution médiane de chaque framework, avec la plus basse et la plus haute à côté.

<BarChart title="Tokens écrits, réflexion comprise" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":17,"range":[15.8,23.9]},{"label":"SvelteKit","value":25.3,"range":[21.1,36.6]},{"label":"Nuxt","value":28.7,"range":[20.1,36.2]},{"label":"Next.js","value":29.7,"range":[24.4,46.6]},{"label":"SolidStart","value":33.9,"range":[32.2,44.6]}]} bench="llm" />

<BarChart title="Temps pour construire le site" unit="min" better="lower" digits={1} rows={[{"label":"Astro","value":2.6,"range":[2.5,3.6]},{"label":"SvelteKit","value":4.5,"range":[3.3,12.4]},{"label":"Next.js","value":5.9,"range":[4.8,8.5]},{"label":"Nuxt","value":7.9,"range":[4.3,9.5]},{"label":"SolidStart","value":9.3,"range":[6.5,12.9]}]} bench="llm" />

Le style est libre et n'est pas noté, donc les comptes de lignes laissent les styles de côté : de 77 à 113 lignes dans les exécutions médianes.

<BarChart title="Lignes de code écrites, hors tests et styles" unit="lignes" better="lower" digits={0} rows={[{"label":"Nuxt","value":444,"range":[437,476]},{"label":"Astro","value":463,"range":[440,491]},{"label":"SvelteKit","value":472,"range":[455,518]},{"label":"SolidStart","value":537,"range":[523,549]},{"label":"Next.js","value":616,"range":[537,636]}]} bench="llm" />

<BarChart title="Coût du site, tarifs API" unit="USD" better="lower" digits={2} rows={[{"label":"Astro","value":0.78,"range":[0.75,1.12]},{"label":"Nuxt","value":1.46,"range":[0.91,1.8]},{"label":"SvelteKit","value":1.52,"range":[1.23,2.22]},{"label":"Next.js","value":1.87,"range":[1.37,2.85]},{"label":"SolidStart","value":1.94,"range":[1.86,2.79]}]} bench="llm" />

<BarChart title="Tokens de réflexion" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.3]},{"label":"Nuxt","value":10.2,"range":[7.5,13.8]},{"label":"Next.js","value":10.6,"range":[8.8,20.7]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

<BarChart title="Tours" unit="tours" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"Nuxt","value":47,"range":[30,56]},{"label":"Next.js","value":50,"range":[38,72]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Documentation lue" unit="K caractères" digits={0} rows={[{"label":"Nuxt","value":14,"range":[8,22]},{"label":"Astro","value":29,"range":[8,38]},{"label":"SolidStart","value":52,"range":[26,64]},{"label":"Next.js","value":84,"range":[70,114]},{"label":"SvelteKit","value":89,"range":[49,103]}]} bench="llm" />

<BarChart title="Plus grand contexte d'un appel" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"Nuxt","value":67,"range":[48.4,91.2]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"Next.js","value":90,"range":[71.2,120.1]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

<Note title="Comment c'est mesuré">

Claude Opus 5.5 en effort élevé, Claude Code 2.1.289, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1, Next.js 16.4.2, tous sur Bun, 5 exécutions chacun, celles de Nuxt et Next.js six jours après les autres. Chaque chiffre est la médiane des exécutions réussies, et les 25 ont réussi. Le coût est aux tarifs API, tel que Claude Code le rapporte. Le cahier des charges, le prompt, les starters, la suite et chaque exécution sont dans [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

</Note>
