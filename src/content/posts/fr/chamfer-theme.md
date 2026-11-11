---
title: "Mon bureau porte désormais le look de mes apps"
description: "Chamfer habille mon bureau KDE et dix applis de terminal selon le design de mes apps auto-hébergées : presque noir, filets fins, couleur pour les états."
date: 2026-11-10
tags: [design, linux]
draft: true
---

Chamfer est le thème de mon bureau KDE et des applis de terminal où je vis. Je l'ai refait pour suivre le design de [mes apps auto-hébergées](/posts/orbit-apps), si bien que passer d'un terminal à l'une d'elles ne donne plus l'impression de changer de machine : le même fond presque noir, les mêmes filets fins, la même police. Une règle de l'ancien Chamfer est restée : le décor est gris, et une couleur n'apparaît que pour ce qu'elle signifie.

<Note title="Capture d'écran à venir : le bureau à côté d'une app orbit">

Une fenêtre active et une inactive avec leurs coins coupés, le panneau et ses widgets, un terminal avec un prompt et un diff lazygit, à côté d'une des apps dans le navigateur.

</Note>

## Le bureau prend les tokens des apps

Mes apps partagent une même feuille de style. La page et son en-tête reposent sur un même fond, `#090a10`, et les boîtes une marche au-dessus, `#11131a` et `#191c25`. Si près du noir, le remplissage seul se voit à peine, donc chaque boîte est encadrée d'un filet de 1 px, la couleur du texte à 11 %. Rien n'a de halo ni d'ombre, et chaque app ne choisit que son accent.

Chamfer écrit désormais ces valeurs dans le jeu de couleurs de KDE, la décoration de fenêtre, le thème Plasma et chaque appli de terminal, et prend la police des apps, Space Grotesk, pour l'interface. Le terminal garde JetBrains Mono, la police à chasse fixe des apps.

## Le gris est le décor, la couleur est un état

La règle des couleurs vient du guide de la FAA pour les écrans de vol électroniques, l'AC 25-11B, et elle a survécu à la refonte. Le magenta, que la FAA réserve aux cibles, est remplacé par le cyan.

- **Blanc** : les données courantes, comme le texte des fenêtres et le chemin du prompt.
- **Gris clair** : les libellés, les séparateurs, tout ce qui est inactif, comme les onglets sans focus et le caractère du prompt.
- **L'accent** : la sélection, comme le contour de la fenêtre active, le panneau actif et la pastille de mode de nvim.
- **Cyan** : une cible, comme la branche git, les liens et la base d'un rebase dans lazygit.
- **Vert** : normal ou terminé, comme les fichiers indexés.
- **Ambre** : prudence, comme les fichiers modifiés, les commits à pousser et un voyant qui a quelque chose à faire.
- **Rouge** : agir maintenant, comme une commande échouée, un conflit ou une unité en échec.

La syntaxe est la seule exception. Sur la ligne de commande de fish et dans nvim, VS Code, bat et les diffs de lazygit, la couleur distingue les tokens, donc la syntaxe garde ses huit teintes.

## La charge est du travail, pas une panne

Le panneau a quatre widgets dessinés comme des instruments. Le widget moteur montre CPU, GPU, mémoire et VRAM en bandes, et CPU et GPU restent blancs quelle que soit leur charge : ce sont leurs températures qui portent les limites, ambre à partir de 80 °C et rouge à partir de 90 °C. La mémoire passe à l'ambre à partir de 80 % et au rouge à partir de 90 %. La VRAM n'a aucune limite, puisque les jeux la remplissent exprès.

Un annonciateur réunit quatre voyants pour le diagnostic de la machine, sa santé, la synchronisation et un redémarrage en attente, éteints quand il n'y a rien à faire. Les barres d'usage de Claude passent à l'ambre à partir de 70 % et au rouge à partir de 90 %, avec un repère cyan là où le rythme dit que je devrais en être. Le widget réseau affiche `VPN` en cyan et passe à l'ambre quand le trafic quitte un VPN à connexion automatique ou qu'il n'y a plus de route.

## Les cadres restent coupés à 45°

Les apps arrondissent leurs coins de 2 à 4 px. Chamfer garde ce qui lui donne son nom : chaque cadre a ses coins haut gauche et bas droit coupés à 45°. Le reste est aussi plat que les apps : des traits de 1 px sur la grille de pixels, ni halo, ni ombre, ni dégradé, ni animation, puisque le générateur met la vitesse d'animation de KDE à zéro.

Une fenêtre a un cadre de 5 px, une barre de titre de 28 px et ses deux coins opposés coupés de 5 px. Les boutons de la barre de titre font 21 sur 19 avec des glyphes de 9 sur 9, transparents tant qu'on ne les survole pas, et la fermeture se remplit de rouge. Les popups et les infobulles prennent le même cadre coupé. Le panneau reste carré, parce que Plasma le coupe là où il touche le bord de l'écran. Même les fenêtres flottantes de nvim dessinent leurs coins avec `╱`.

## Un générateur écrit le thème de chaque appli

`just chamfer-theme` lance un script Bun qui écrit un jeu de couleurs KDE, une décoration de fenêtre, un thème de curseur en quatre tailles, un thème global et le thème Plasma, puis les fichiers lus par kitty, fish, starship, nvim, lazygit, lazysql, bat, VS Code, yazi et Spotify, et les applique.

Rien de cette sortie n'est commité ni modifié à la main : pour changer le thème, je change le générateur et je le relance. Mes dotfiles commitent à la place des configs Catppuccin simples, sur lesquelles les fichiers générés viennent se poser, si bien qu'une machine sans le thème a quand même un thème sombre.

## Le générateur n'a pas de tests à lui

Des tests figent la palette, mais le générateur lui-même, qui écrit des fichiers SVG, TOML, JSON, XML et INI, n'en a aucun, donc une cible cassée se voit à l'écran, pas dans une vérification. Et tout ne passe pas par lui : Herdr, l'application de terminal à laquelle je suis passé après tmux, a un thème écrit à la main, si bien que les états de ses agents ont leurs propres couleurs. Le thème vit dans mes dotfiles, qui sont privés.
