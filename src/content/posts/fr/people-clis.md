---
title: "53 CLI qui se comportent comme une seule"
description: "arc, dl, gloss, pick, probe et proc font chacun un travail avec un défaut sûr, et un petit kit fait que mes 53 CLI lisent, aident et échouent pareil."
date: 2026-11-10
tags: [cli, bun]
draft: true
---

La plupart de mes outils en ligne de commande ont été écrits pour Claude Code, et [cet article](/posts/agent-clis) les raconte. Six ont été écrits pour moi, tapés à la main dans un terminal. Tous, 53 bins répartis sur 27 paquets, reposent sur un même petit kit, donc ils lisent leurs arguments, affichent leur aide et échouent de la même façon.

<Stats
  items={[
    {"value": "53", "label": "bins sur un seul kit, publiés sur npm sous @kaynooo/cli-*"},
    {"value": "0, 1, 2", "label": "les codes de sortie communs à tous les bins : propre, un constat, vérification impossible"},
    {"value": "229", "label": "fichiers de test, dont un qui parcourt chaque commande de chaque bin"}
  ]}
/>

## Chaque bin fait un travail, avec le défaut sûr

- **arc** range un dossier dans un `.tar.zst` et ne supprime le dossier qu'une fois l'archive vérifiée : la somme de contrôle zstd, le nombre d'entrées, puis `tar --compare` sur chaque fichier, propriétaires et attributs étendus compris. Un échec avant ce point laisse le dossier tel quel. `arc unpack` refuse d'écraser quoi que ce soit.
- **dl** télécharge dans un dossier à lui et vérifie le sha256. Une différence supprime le fichier, et une page d'erreur HTML servie avec un code 200 compte comme un échec. `dl --exec` lance un script exactement tel qu'il a été lu, après avoir listé ses lignes risquées (`sudo`, `rm -r`, modifications des profils du shell), et seulement quand une somme de contrôle l'épingle ou que `--yes` le dit.
- **gloss** explique une ligne de commande à partir des pages de man locales. Il n'utilise pas le réseau et n'exécute rien de ce qu'il explique.
- **pick** est un sélecteur flou : des lignes sur stdin, la ligne choisie sur stdout. Il dessine sur stderr et lit les touches depuis `/dev/tty`, donc un pipe ne transporte que le choix.
- **probe** montre en un appel la version HTTP d'un site, sa chaîne de redirections, ses temps, son certificat et ses en-têtes. `--dns` compare le résolveur du système à trois résolveurs publics et aux serveurs de noms de la zone, et prévient quand un certificat expire dans moins de 14 jours.
- **proc** lit un processus depuis `/proc`, son environnement caché sauf demande et ses secrets masqués même alors. `ports 3000` dit qui écoute sur un port, et `ports 3000 --kill` refuse le pid 1, le processus d'un autre utilisateur, ses propres ancêtres et le port d'un conteneur, où il affiche à la place le `docker stop` à lancer.

```
$ gloss 'tar -xzvf site.tgz -C /srv'
tar  an archiving utility
  -x        Extract files from an archive. Arguments are optional. When given, they specify names of
            the archive members to be extracted.
  -z        Filter the archive through gzip(1).
  -v        Verbosely list files processed. ...
  -f        Use archive file or device ARCHIVE. ...
  site.tgz  the ARCHIVE for -f
  -C        Change to DIR before performing any operations. ...
  /srv      the DIR for -C
```

## Chaque bin sort selon la même table

Un script qui appelle l'un de ces outils n'a jamais à lire leur doc pour savoir ce que veut dire un code de sortie. 0 veut dire propre : il a fait ce qu'on lui demandait, ou n'a rien trouvé d'anormal. 1 est un constat, une absence de résultat, ou une opération qui s'est lancée et a échoué. 2 est une erreur d'usage, ou une vérification qui n'a pas pu se faire, un délai dépassé ou un registre injoignable, si bien que « vérification impossible » n'est jamais annoncée comme « propre ».

Les exceptions sont rares et chacune est écrite dans l'aide de sa commande : un bin qui enveloppe une autre commande sort avec le code de celle-ci, un sélecteur annulé sort avec 130 comme le ferait Ctrl+C, et `probe` ne sort avec 1 que quand le site n'a pas pu être joint du tout, puisque c'est là son constat.

Un test fait passer chaque commande de chaque bin par le protocole de complétion, puis vérifie trois choses : son aide indique ses codes de sortie, elle n'en utilise que de la table, et elle répond à `--help` par 0 et à une option inconnue par 2.

## Un drapeau veut dire la même chose dans tous les bins

`-n` est toujours un nombre, de lignes, de rangées ou de créneaux. `-t` est toujours le temps d'attente, sous forme de durée : `30s`, `5m`, `1h`. Une liste est coupée à sa valeur par défaut et dit `N more, rerun with --full` ; `--json` n'est jamais coupé, sauf si `-n` le demande. `--dry-run` montre ce qui changerait sans rien changer, et un drapeau renommé garde son ancienne orthographe comme alias caché, pour qu'une vieille ligne de commande continue de marcher.

## La sortie dépend de qui la lit

Le kit range chaque exécution dans une de ces catégories : un terminal, un log de CI, un pipe ou un agent de code. Seul un terminal a droit aux couleurs, aux glyphes, aux liens et aux spinners. Un pipe ou un log de CI reçoit des lignes simples qui se laissent grepper, `error: demo greet: give a name` puis une ligne `hint:`. Un agent, qui paie chaque token qu'il lit, reçoit des tableaux séparés par des tabulations, du JSON sur une ligne, et une aide sans ses exemples.

Les invites suivent la même règle : hors d'un terminal, une invite échoue tout de suite avec le code 2 au lieu d'attendre une ligne qui ne viendra jamais.

## Chaque bin dessine avec les mêmes marques

Un seul thème porte les couleurs et les glyphes avec lesquels chaque bin dessine. Une ligne d'état commence par l'une de quatre marques, un ✓ vert, un › atténué, un ▲ jaune ou un ✗ rouge, et un mot d'état reçoit l'un de cinq badges, les mêmes dans chaque bin :

```
✓ success   ✗ failure   ● running   ○ waiting   - skipped
```

Les couleurs par défaut sont des noms ANSI, pas des valeurs fixes : c'est la palette du terminal qui décide de ce qu'est le vert, et les bins suivent [mon thème de bureau](/posts/chamfer-theme) sans savoir qu'il existe. Le kit fournit quatre préréglages : celui par défaut, un contraste élevé, `mono` avec seulement le gras et l'atténué, et `ascii` pour un terminal sans les glyphes. Un `theme.json` dans mon dossier de configuration ou dans un projet restyle tous les bins d'un coup. C'est du JSON seulement, de 64 Kio au plus, si bien que le fichier de thème d'un projet ne peut jamais rien exécuter.

Aucun thème ne change ce qui s'affiche hors d'un terminal, où les marques se lisent `ok:`, `note:`, `warning:` et `error:`.

## --help ne charge aucune commande

Chaque commande n'importe son module que quand elle s'exécute, donc `--help`, la complétion et une faute de frappe répondent sans en charger aucune. Chaque bin affiche aussi son propre script de complétion pour fish, bash et zsh, et le journal d'usage du kit garde les noms des drapeaux que j'utilise, jamais leurs valeurs.

## À essayer

Les bins ne tournent que sur Bun, et chacun s'installe séparément :

```sh
bun install -g @kaynooo/cli-arc @kaynooo/cli-dl @kaynooo/cli-gloss
```

Les autres sont dans [docs/bins.md](https://github.com/Kayno0o/cli/blob/main/docs/bins.md), et le kit est `@kaynooo/cli-kit` si vous voulez que vos propres CLI se comportent de la même façon.
