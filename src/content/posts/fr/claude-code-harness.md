---
title: "Les règles de Claude Code, au moment de s'appliquer"
description: "Comment je garde Claude Code sur mes conventions après une compaction : un CLAUDE.md court, des mémoires servies par des hooks, des questions visibles."
date: 2026-11-10
tags: [llm, claude-code]
draft: true
---

Deux choses tournaient mal quand je travaillais avec Claude Code. Après une compaction, il oubliait des conventions qu'il avait suivies toute la matinée. Et quand il me posait une question, elle disparaissait sous ses vingt appels d'outils suivants, si bien que je répondais trop tard, ou jamais.

Ce qui a réglé les deux, c'est de sortir les règles du prompt pour les mettre dans des hooks : une règle arrive au moment où Claude fait l'appel qu'elle concerne, et une question reste à l'écran tant que je n'y ai pas répondu.

<Stats
  items={[
    {"value": "32", "label": "lignes dans mon CLAUDE.md, la plupart des renvois vers des mémoires"},
    {"value": "22", "label": "déclencheurs qui servent une mémoire quand un appel d'outil en a besoin"},
    {"value": "13", "label": "mods branchés sur Claude Code, environ 4 400 lignes"}
  ]}
/>

## CLAUDE.md est un index, pas le règlement

Mon `CLAUDE.md` a quatre sections, communication, travail, git et sécurité, et la plupart des lignes sont une règle en une phrase plus le chemin de la mémoire qui en détaille le contenu :

```md
- **Commits**: `global/commit-message-style`. Commit after every task that changes code, without asking. Never push unless I say so.
```

Les mémoires vivent dans lyra, mon application de notes, que Claude atteint par un serveur MCP. Au début d'une session, un hook va chercher l'index de lyra et le met dans le prompt : une ligne par mémoire, avec son chemin, son type et une description d'une ligne. Claude voit ce qui existe sans rien en lire.

## Une règle arrive avec l'appel qu'elle concerne

L'index seul n'a pas réglé les compactions : Claude devait encore décider de lire une mémoire, et après une compaction il ne savait pas ce qu'il avait oublié. Alors un hook surveille chaque appel d'outil et le confronte à 22 déclencheurs. Un `git commit` amène les règles de message de commit, un client SQL amène les règles SQL, une écriture dans une page Markdown amène les règles de rédaction.

Un déclencheur agit avant ou après l'appel. Avant, l'appel est refusé une fois, la mémoire dans le message de refus, et Claude le relance quand il suit la règle. Après, l'appel s'exécute et la mémoire est jointe à son résultat, pour vérifier ce qui vient d'être fait :

```
The rule this call falls under, to check what was just done against it:

## Memory/global/workflow/issues-with-tea
...
```

Chaque mémoire n'est servie qu'une fois par conversation, et une mémoire que Claude a lue de lui-même compte aussi. Une compaction vide cette liste, et c'est tout l'intérêt : ce que le résumé a laissé tomber revient la prochaine fois qu'un appel en a besoin.

Le même mod empêche un tour de se terminer quand il ne devrait pas. Si Claude a modifié du code sans lancer de vérification, le tour lui est renvoyé avec la règle de validation du dépôt. Si les fichiers qu'il a modifiés ne sont toujours pas commités, il est renvoyé une deuxième fois.

## Les questions restent au-dessus du prompt jusqu'à la réponse

La deuxième correction est un outil, `ask`. Claude pose ses questions avec une réponse recommandée pour chacune, et l'appel rend la main aussitôt, donc il continue sur tout ce qui ne dépend pas des réponses. Les questions restent affichées au-dessus du prompt jusqu'à ce que j'y réponde, avec les mots que je veux : un petit modèle rattache ma réponse aux questions qu'elle traite, et Claude les reçoit numérotées. Une commande que moi seul peux lancer, un push ou une connexion, suit le même chemin avec `hand`, la commande complète prête à copier.

Elles survivent aussi à une compaction : le résumé les garde, et le prompt suivant rend toutes les questions et actions encore ouvertes. Et quand Claude termine un tour sans dire ce qui reste ouvert, la liste est ajoutée après sa réponse.

## De plus petits mods corrigent de plus petites habitudes

- **guards** refuse aussi les commandes que je ne veux jamais voir lancées : tout ce qui touche un serveur distant, un push que je n'ai pas demandé, `git stash`. Le côté ligne de commande, et les incidents qui l'expliquent, sont dans [les CLI que j'ai écrites pour Claude](/posts/agent-clis).
- **agent-cap** plafonne le nombre de sous-agents qui tournent en même temps, `/agent-cap 5`, et refuse un fork dès que le contexte dépasse la moitié du seuil de compaction.
- **git-facts** ajoute la branche et le dernier commit à mon prompt, seulement s'ils ont changé depuis le précédent.
- **commit-titles** ajoute à sa réponse le titre de chaque commit que Claude a fait, pour que je voie ce qui a atterri sans avoir à demander.
- **prompt-fold** replie un log collé de plus de 150 lignes en le passant par `out` avant que Claude ne le lise.
- Après quatre appels en lecture seule d'affilée, un rappel suggère de confier la recherche à un sous-agent explorer, qui lit les fichiers et ne renvoie que sa conclusion.

## Chaque règle coûte un aller-retour

Une règle servie avant un appel coûte un appel refusé et une nouvelle tentative. Un tour renvoyé pour une vérification manquante coûte une vérification complète, même après un changement d'une ligne. Rattacher mes réponses aux questions ouvertes appelle un petit modèle à chaque prompt qui pourrait répondre à l'une d'elles. Et les hooks eux-mêmes sont du code à maintenir : le mod guards à lui seul fait environ 2 000 lignes, dont 900 de parseur shell, pour qu'une règle lise une commande comme le ferait bash plutôt que par un simple grep.

Les mods vivent dans mes dotfiles, qui sont privés. Les outils en ligne de commande sur lesquels ils s'appuient sont publics, dans [l'article sur les CLI](/posts/agent-clis).
