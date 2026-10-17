---
title: "Un site, construit par un agent de code dans chaque framework"
description: "Comment je mesure ce qu'un framework web coûte à un agent de code : un cahier des charges, une suite de tests cachée, des exécutions isolées et headless, et ce qui en sort pour kay, SvelteKit, SolidStart, Astro, Nuxt et Next.js."
date: 2026-10-16
tags: [kay, benchmarks, llm]
draft: true
---

L'[article sur kay](/posts/introducing-kay) donne à ce benchmark une section et quatre graphiques. Cet article, c'est le reste : comment se déroule une exécution, ce qui la garde honnête, et les mesures qui n'avaient pas leur place là-bas.

La question est simple : quand un agent de code construit un site, combien le framework lui coûte-t-il ? Des tokens, du temps, des tours, de la documentation lue, des erreurs de vérification, des lignes de code. Un framework qu'un agent écrit à moindre coût et correctement, c'est un framework auquel je peux confier du travail, et kay est fait pour en être un.

## Le site

Chaque exécution construit Bookshelf, un petit catalogue de livres classiques, à partir d'un seul cahier des charges où seul le nom du framework change :

- 8 livres en fichiers Markdown avec un frontmatter, lus comme une collection de contenu, chacun rendu sur sa propre page.
- Une liste de livres avec un filtre par tag qui tourne dans le navigateur, et un bouton favori dont l'état survit à un rechargement dans `localStorage`.
- Un formulaire de contact vérifié côté serveur et dans le navigateur, qui marche aussi JavaScript désactivé.
- Une mise en page commune, une page à propos, et une vraie 404 avec son code de statut.

Chaque texte que cherchent les tests est donné mot pour mot : une exécution ne peut pas échouer sur une de mes fautes de frappe, seulement sur les siennes. Le style est libre et n'est pas noté.

## Les tests cachés

Une exécution est notée par une suite Playwright que l'agent ne voit jamais : 11 tests qui pilotent Chromium sans interface, lancés une fois par page ou par livre quand c'est pertinent. Ils vérifient la mise en page et son lien courant, les livres les mieux notés dans l'ordre, la liste et son filtre, chaque page de livre, les favoris après un rechargement, le formulaire avec et sans JavaScript, et la 404.

Une suite ne vaut que ce contre quoi elle a été prouvée, alors elle tourne aussi contre un site de référence construit avec Bun seul, sans aucun framework. Si la référence échoue, c'est la suite qui a tort, pas les frameworks.

## Les starters et leur documentation

Chaque exécution part du générateur de projet du framework, aussi minimal que possible tout en ayant un serveur pour le formulaire : `kay new --template blank --with server`, `sv create --template minimal` avec l'adaptateur Node, le `basic` de SolidStart 2, `create-astro --template minimal` avec l'adaptateur Node, `create-nuxt --template minimal` sans module, `create-next-app --empty` avec l'App Router. Je ne touche qu'à leurs scripts, pour que `bun run check`, `bun run build` et `bun run start` veuillent dire la même chose partout, et j'ajoute le `vue-tsc` et le TypeScript 6 dont le check de Nuxt a besoin. Chaque `check` reste celui du starter, qui n'échoue que sur les erreurs.

La documentation est dans le projet, hors ligne, puisque le bac à sable n'a pas de réseau. Elle diffère autant par sa nature que par sa taille : celle de kay, ce sont le `llms.txt` et les fichiers par sujet que livre son paquet, 0,6 Mo en 39 fichiers. Celles de SvelteKit, SolidStart et Nuxt, les pages que lie leur `llms.txt`, 3,4, 0,8 et 7,8 Mo. Celle de Next.js, le Markdown des pages que lie son `llms.txt`, 3,1 Mo, plus la documentation de son paquet, vers laquelle pointe l'`AGENTS.md` qu'écrit son générateur. Astro a abandonné son `llms.txt`, donc sa documentation est la source Markdown de son site, 3,0 Mo en 424 fichiers.

La documentation compte plus pour kay que pour les autres : les cinq autres ont des années de code et de réponses sur le web dont le modèle a appris, alors que ce qu'il sait de kay vient de ces 39 fichiers et du paquet lui-même.

## Des exécutions bien séparées

Chaque exécution est une session Claude Code headless, `claude -p --safe-mode` : pas de CLAUDE.md, pas de hooks, pas de plugins, pas de serveurs MCP, et un dossier de configuration vide rien qu'à elle. Elle tourne sous bubblewrap, qui cache mon espace de travail, ma configuration et mes transcripts Claude, les autres exécutions, le site de référence et les navigateurs de test, avec un `/tmp` et une liste de processus privés. L'agent ne peut donc ni lorgner les tests, ni copier une exécution précédente, ni vérifier son travail dans un navigateur : `check`, le build et son propre raisonnement sont tout ce qu'il a.

Une fois l'agent arrêté, le correcteur lance `bun run check` et `bun run build`, démarre le site avec `bun run start` sur un port donné, et lance la suite dessus. Une exécution réussit quand les trois passent.

Le harnais alterne les exécutions entre frameworks, dans un ordre qui tourne, pour qu'une heure lente de l'API tombe sur tout le monde pareil, mais chaque séance ici n'en couvre qu'une partie : SvelteKit, SolidStart et Astro ensemble, puis Nuxt et Next.js l'un après l'autre, puis kay seul, donc le temps est la mesure à lire avec le plus de recul. Le rapport liste aussi ce que la note ne voit pas : dans 27 exécutions sur 30, l'agent a lancé `python`, `node` ou un autre gestionnaire de paquets alors que le prompt demande Bun seul, jusqu'à 16 fois dans une exécution Nuxt, et chaque exécution SvelteKit a modifié son script `start`, une entrée de la notation à relire avant de se fier au résultat.

## D'abord une sonde

Une série complète, c'est 5 exécutions par framework, donc une erreur dans le harnais coûte 30 exécutions. Chaque changement commence plutôt par une sonde : une exécution d'un seul framework sous une étiquette jetable, ses résultats et son transcript lus, puis le framework suivant. Une sonde coûte environ un dollar : de 0,79 à 1,27 $ pour le premier tour des quatre premiers, 1,20 et 1,42 $ pour celles de Nuxt et Next.js, de 0,83 à 1,71 $ pour celles de kay. La sonde de Next.js a échoué sur la suite, pas sur son site : le test des favoris attendait que le réseau se calme après un rechargement, ce que le routeur de Next ne laisse jamais arriver à une deuxième visite, alors la suite ouvre maintenant chaque visite dans un nouveau contexte de navigateur qui reprend les cookies et le stockage.

<Stats items={[{"value":"30 sur 30","label":"exécutions qui passent chaque vérification et chaque test"},{"value":"45,15 $","label":"les 30 exécutions aux tarifs API"}]} />

## Résultats

Le temps, les lignes écrites, le coût et la documentation lue sont dans l'[article sur kay](/posts/introducing-kay). Voici le reste, l'exécution médiane de chaque framework avec la plus basse et la plus haute à côté.

<BarChart title="Tokens de réflexion" unit="K tokens" better="lower" digits={1} rows={[{"label":"kay","value":3.1,"range":[2.4,5]},{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.3]},{"label":"Nuxt","value":10.2,"range":[7.5,13.8]},{"label":"Next.js","value":10.6,"range":[8.8,20.7]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

C'est en kay que le modèle réfléchit le moins : un quart de moins qu'en Astro, environ trois fois moins que dans les quatre autres.

<Stats items={[{"value":"78 contre 0","label":"lignes de tests écrites, kay contre les autres"}]} />

Les agents de kay ont écrit leurs propres tests dans 4 exécutions sur 5, là où aucun agent d'un autre framework n'en a écrit un seul. Ces lignes sont exclues de chaque décompte de lignes, mais les tokens qui les ont écrites comptent partout ailleurs.

<BarChart title="Tours" unit="tours" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"kay","value":27,"range":[21,47]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"Nuxt","value":47,"range":[30,56]},{"label":"Next.js","value":50,"range":[38,72]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Plus grand contexte d'un appel" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"kay","value":64.8,"range":[58.5,82.7]},{"label":"Nuxt","value":67,"range":[48.4,91.2]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"Next.js","value":90,"range":[71.2,120.1]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

Astro y arrive en moins de tours, avec un contexte plus petit. Apprendre kay dans sa documentation coûte des lectures : le contexte de kay culmine plus de 40 % au-dessus de celui d'Astro, tout en restant sous ceux des quatre autres, de justesse pour celui de Nuxt.

<Note title="Comment c'est mesuré">

Claude Opus 5.5 en effort élevé, Claude Code 2.1.289, kay 1.51.0, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, Nuxt 4.6.1, Next.js 16.4.2, tous sur Bun, 5 exécutions chacun, celles de Nuxt et Next.js six jours après celles de SvelteKit, SolidStart et Astro, celles de kay quelques heures après. Chaque chiffre est la médiane des exécutions réussies, et les 30 ont réussi. Le coût est aux tarifs API, tel que Claude Code le rapporte, exécutions ratées comprises. Le cahier des charges, le prompt, les starters, la suite et chaque exécution sont dans [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.51/results.md).

</Note>
