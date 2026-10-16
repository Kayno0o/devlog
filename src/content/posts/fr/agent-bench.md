---
title: "Un site, construit par un agent de code dans chaque framework"
description: "Comment je mesure ce qu'un framework web coûte à un agent de code : un cahier des charges, une suite de tests cachée, des exécutions isolées et headless, et ce qui en sort pour kay, SvelteKit, SolidStart et Astro."
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

Chaque exécution part du générateur de projet du framework, aussi minimal que possible tout en ayant un serveur pour le formulaire : `kay new --template blank --with server`, `sv create --template minimal` avec l'adaptateur Node, le `basic` de SolidStart 2, `create-astro --template minimal` avec l'adaptateur Node. Je ne touche qu'à leurs scripts, pour que `bun run check`, `bun run build` et `bun run start` veuillent dire la même chose partout. Chaque `check` reste celui du starter : celui de kay échoue aussi sur les avertissements, ceux des autres sur les erreurs seulement.

La documentation est dans le projet, hors ligne, puisque le bac à sable n'a pas de réseau. Elle diffère autant par sa nature que par sa taille : celle de kay, ce sont le `llms.txt` et les fichiers par sujet que livre son paquet, 0,2 Mo en 18 fichiers. Celles de SvelteKit et SolidStart, les pages que lie leur `llms.txt`, 3,4 et 0,8 Mo. Astro a abandonné son `llms.txt`, donc sa documentation est la source Markdown de son site, 3,0 Mo en 424 fichiers.

La documentation compte plus pour kay que pour les autres : le modèle connaît déjà les trois autres, alors que tout ce qu'il sait de kay vient de ces 18 fichiers.

## Des exécutions bien séparées

Chaque exécution est une session Claude Code headless, `claude -p --safe-mode` : pas d'instructions de projet, pas de hooks, pas de plugins, pas de serveurs MCP, et un dossier de configuration vide rien qu'à elle. Elle tourne sous bubblewrap, qui cache mon espace de travail, ma configuration et mes transcripts Claude, les autres exécutions, le site de référence et les navigateurs de test, avec un `/tmp` et une liste de processus privés. L'agent ne peut donc ni lorgner les tests, ni copier une exécution précédente, ni vérifier son travail dans un navigateur : `check`, le build et son propre raisonnement sont tout ce qu'il a.

Une fois l'agent arrêté, le correcteur lance `bun run check` et `bun run build`, démarre le site avec `bun run start` sur un port donné, et lance la suite dessus. Une exécution réussit quand les trois passent.

Les exécutions alternent entre frameworks, dans un ordre qui tourne, pour qu'une heure lente de l'API tombe sur tout le monde pareil. Le rapport liste aussi ce que la note ne voit pas : les agents de chaque framework ont lancé `node` ou `python` quelques fois alors que le prompt demande Bun seul, et chaque exécution SvelteKit a modifié son script `start`, une entrée de la notation à relire avant de se fier au résultat.

## D'abord une sonde

Une série complète, c'est 5 exécutions par framework, donc une erreur dans le harnais coûte 20 exécutions. Chaque changement commence plutôt par une sonde : une exécution d'un seul framework sous une étiquette jetable, ses résultats et son transcript lus, puis le framework suivant. Une sonde coûte environ un dollar : de 0,79 à 1,27 $ pour le premier tour des quatre, de 0,83 à 1,71 $ pour celles de kay.

<Stats items={[{"value":"20 sur 20","label":"exécutions qui passent chaque vérification et chaque test"},{"value":"27,81 $","label":"toute la série, 20 exécutions aux tarifs API"}]} />

## Résultats

Le temps, les lignes écrites, le coût et la documentation lue sont dans l'[article sur kay](/posts/introducing-kay). Voici le reste, l'exécution médiane de chaque framework avec la plus basse et la plus haute à côté.

### Ce que kay gagne

<BarChart title="Tokens de réflexion" unit="K tokens" better="lower" digits={1} rows={[{"label":"kay","value":2.8,"range":[2.2,4.4]},{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.4]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

C'est en kay que le modèle réfléchit le moins : un tiers de moins qu'en Astro, trois à quatre fois moins qu'en SvelteKit et SolidStart.

<Stats items={[{"value":"76 contre 0","label":"lignes de tests écrites, kay contre les autres"}]} />

Les agents de kay ont écrit leurs propres tests à chaque exécution, là où aucun agent d'un autre framework n'en a écrit un seul. Ces lignes sont exclues de chaque décompte de lignes : elles coûtent des tokens à kay et ne lui rapportent rien dans les graphiques.

### Ce que kay perd

<BarChart title="Tours" unit="tours" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"kay","value":29,"range":[25,31]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Plus grand contexte d'un appel" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"kay","value":61.7,"range":[58.7,70]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

Astro y arrive en moins de tours, avec un contexte plus petit. Apprendre kay dans sa documentation coûte des lectures, et chaque appel suivant les emporte avec lui : le contexte de kay culmine environ un tiers au-dessus de celui d'Astro, tout en restant bien sous ceux de SvelteKit et SolidStart.

<Note title="Comment c'est mesuré">

Claude Opus 5.5 en effort élevé, Claude Code 2.1.289, kay 1.27.0, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, tous sur Bun, 5 exécutions chacun, celles de kay quelques heures après les autres. Chaque chiffre est la médiane des exécutions réussies, et les 20 ont réussi. Le coût est aux tarifs API, tel que Claude Code le rapporte, exécutions ratées comprises. Le cahier des charges, le prompt, les starters, la suite et chaque exécution sont dans [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.27/results.md).

</Note>
