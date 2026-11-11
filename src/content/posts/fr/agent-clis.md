---
title: "Claude a affiché mes secrets : il a eu ses CLI"
description: "Claude Code a affiché mes secrets, cassé un stash et surchargé ma machine. Chaque erreur est devenue une règle qu'un hook applique, avec une commande sûre."
date: 2026-11-10
tags: [llm, cli]
draft: true
---

Claude Code lance mes commandes shell toute la journée, souvent dans plusieurs sessions à la fois. Trois fois, il a fait quelque chose que j'ai dû réparer derrière lui : il a affiché mes secrets dans la session, un `git stash` a cassé des fichiers que j'étais en train de modifier, et des tests lancés en parallèle expiraient ou se faisaient tuer faute de mémoire. La quatrième tenait moins de l'erreur que de l'habitude : des tickets et une CI gérés par des appels d'API bruts, alors qu'ils méritaient un vrai flux de travail.

Chacune est devenue une règle. Un hook lit chaque commande avant qu'elle ne s'exécute, refuse celles qui enfreignent une règle, et nomme une de mes commandes qui fait le travail sans risque. Ces petites CLI tiennent aujourd'hui en 26 paquets, publiés sur npm sous `@kaynooo/cli-*`.

## Chaque refus nomme la commande à lancer à la place

`guard` lit une commande comme le ferait un shell, guillemets, heredocs et `sudo` compris, et la confronte à ses règles : machines distantes, git, commandes destructrices, messages de commit, écritures SQL, fichiers d'environnement, gestionnaires de paquets et modifications en place. En hook Claude Code, il refuse l'appel et donne à Claude la marche à suivre dans le même message.

```
$ guard check 'ssh my-server uptime'
remote: Remote servers are off limits (no SSH, no deploys, no remote commands). Hand the user the exact command to run themselves.
```

## Les secrets restent masqués, même dans une sortie redirigée

La première règle vient de mon fichier `.env` affiché dans la session, où chaque message suivant l'emportait avec lui. La règle `env` refuse désormais toute commande qui lit, modifie ou affiche un fichier d'environnement ou l'environnement entier, et le hook refuse sur ces fichiers les outils Read, Edit et Write de Claude lui-même.

À la place, Claude a `ev`. `ev list` montre chaque clé avec sa valeur masquée, `ev set` lit la valeur sur l'entrée standard pour qu'elle n'apparaisse jamais dans la commande, et `ev cp` copie une clé d'un fichier à l'autre sans l'afficher. Pour tout le reste, il y a `ev redact`, qui masque les formats de jetons connus, les mots de passe dans les URL et les valeurs des fichiers d'environnement du dossier dans toute sortie qu'on lui passe : `docker compose config | ev redact`. Lancé en `git diff --cached | ev redact --check`, il indique où se trouve un secret avant qu'il ne soit commité.

## Un worktree temporaire a remplacé git stash

La deuxième règle vient d'un stash et de son pop qui ont laissé mes modifications non commitées cassées. Je les ai récupérées en les réécrivant à la main. Le refus dit maintenant pourquoi, et quoi faire à la place :

```
$ guard check 'git stash'
git: Never `git stash`: a pop with nothing saved applies someone else's old stash. To prove a test fails without your change, `base proof --keep <test> -- <cmd>` runs it at HEAD in a temporary worktree and again here; `base -- <cmd>` runs any command at HEAD (`--ref <rev>` another commit), the working tree untouched. To set edits aside before a cherry-pick, a rebase or a checkout, commit them with `gc` first, or do the other work in `git worktree add`.
```

`base proof` répond à la question par laquelle le refus commence : il ne sort avec 0 que si la commande échoue sur HEAD et passe dans l'arbre de travail. Mes fichiers ne bougent jamais.

## Les tâches lourdes attendent un créneau

La troisième vient de la charge. Plusieurs sessions qui lancent chacune une suite de tests, un vérificateur de types ou un navigateur en même temps faisaient expirer les tests, ou les faisaient tuer faute de mémoire. `slot -- <cmd>` attend l'un des créneaux de la machine, la moitié de ses cœurs par défaut, partagés par toutes les sessions, tous les worktrees et tous les shells. Un créneau se libère dès que son détenteur s'arrête, même sur un SIGKILL, car le noyau le relâche avec le processus. `--lock <nom>` tient en plus un verrou nommé, pour ce qui ne doit jamais tourner deux fois à la fois, comme une base de test partagée.

Claude n'a rien à retenir : un hook fait passer de lui-même les lanceurs de tests, les navigateurs et les vérificateurs de types par `slot`, et `check` prend un créneau tout seul.

## Les tickets et la CI ont leur propre flux

La quatrième n'était pas un accident. `ft` ramène les tickets et la CI de mon Forgejo aux étapes que Claude suit vraiment. `ft ci` attend les exécutions d'un commit et affiche la sortie de chaque test en échec. Une tâche en plusieurs étapes a sa liste de cases dans un ticket, `ft tick` coche une case à chaque étape terminée, et `ft fixed` refuse de fermer le ticket tant qu'une case reste ouverte. Après une compaction, ou dans une nouvelle session, le travail reprend aux cases restantes. `ft take` réserve un ticket à une session, pour que deux sessions ne prennent pas le même.

## Les autres outils ne réduisent la sortie que sur une chaîne bavarde

Je m'attendais à ce que les outils qui façonnent la sortie économisent beaucoup de tokens. Sur le dépôt de ce blog, avec une erreur de type, une erreur de lint et un test en échec plantés exprès, la moitié d'entre eux n'économisent rien :

<Stats
  items={[
    {"value": "-47 %", "label": "caractères pour l'état du dépôt, gst face à git status et git log"},
    {"value": "-62 %", "label": "caractères pour une fonction, src peek face à la lecture du fichier entier"},
    {"value": "+13 %", "label": "caractères pour typage, lint et tests, check face aux trois scripts"},
    {"value": "0 %", "label": "caractères pour un build en échec, out face au script de build"}
  ]}
/>

Le vérificateur et le linter de kay, comme `bun test`, n'affichent déjà que ce qui échoue ; Bun le fait quand Claude Code le lance. `check` n'ajoute alors que le chemin de chaque journal complet, et `out` ne trouve rien à replier. Sur ce dépôt, leur gain est un appel au lieu de trois et les journaux complets gardés sur disque, pas des tokens. Sur une chaîne plus bavarde, une suite de tests PHP ou un vérificateur de types Vue, c'est là que le repli paie.

<Note title="Comment c'est mesuré">

Une exécution de chaque commande depuis Claude Code le 10 novembre 2026, sur une copie de ce dépôt avec kay 1.94.0 et Bun 1.4.4, sorties standard et d'erreur comptées ensemble en caractères. gst 0.16.1, peek 0.15.1 (désormais `src peek`), check 0.20.1, out 0.14.5. Les échecs plantés, les commandes et les comptes sont dans [bench/agent-clis.md](https://github.com/Kayno0o/devlog/blob/main/bench/agent-clis.md).

</Note>

## Une commande refusée retombe sur moi

Les règles ont aussi un coût. Tout ce que le guard refuse me revient : pendant les recherches pour cet article, le clone SSH de ma propre forge par Claude a été refusé, et le travail a attendu qu'il trouve l'API publique à la place. Une valeur masquée veut aussi dire que Claude ne peut pas me dire qu'une clé est fausse, seulement qu'elle existe, alors je vérifie moi-même. Et ces CLI ne tournent que sur Bun.

## Essayer

`doctor` installe les CLI que vous choisissez et le plugin de hooks pour Claude Code, puis vérifie l'installation :

```sh
bun install -g @kaynooo/cli-doctor
doctor --install
```

Le code est sur [GitHub](https://github.com/Kayno0o/cli), et chaque commande est décrite dans [docs/bins.md](https://github.com/Kayno0o/cli/blob/main/docs/bins.md).
