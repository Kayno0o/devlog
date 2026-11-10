---
title: "Les affinités Temtem sur l'écran de mon clavier"
description: "Mon compagnon Temtem affiche sur le clavier les faiblesses d'un adversaire en plein combat, et une app web compose une équipe pour la zone suivante."
date: 2026-11-10
tags: [games, kay]
draft: true
---

Dans un combat Temtem, je veux savoir à quoi les adversaires sont faibles et forts sans quitter le jeu. Mon clavier a un écran, c'est donc là que ça s'affiche, dès que le combat commence. Entre les combats, une app web garde ma boîte et me recommande une équipe pour la zone vers laquelle je me dirige.

<Stats
  items={[
    {"value": "165", "label": "temtem dans le jeu de données embarqué, rien n'est récupéré à l'exécution"},
    {"value": "14", "label": "outils MCP appelés par le compagnon du clavier et par Claude"},
    {"value": "~470", "label": "tests, comptés par grep sur 51 fichiers"}
  ]}
/>

<Note title="Photo à venir : l'écran du clavier en combat">

L'écran du clavier à côté du jeu, avec les deux adversaires et leurs affinités.

</Note>

## Un combat arrive sur le clavier dès qu'il commence

Une app compagnon sur mon PC de jeu repère l'instant où le jeu entre en combat. Elle capture la fenêtre du jeu, lit les plaques de noms des adversaires par OCR, et demande à l'app web à quoi chacun est faible et fort. La réponse part vers l'écran du clavier.

L'OCR ne garde que les pixels presque blancs avec un contour sombre tout près, ce qui élimine le ciel et les nuages derrière un nom. Le signe du genre colle souvent au nom, alors le compagnon retire des lettres à la fin jusqu'à ce que l'app reconnaisse un temtem.

## L'app apprend le français du jeu

Je joue en français. Les noms des temtem sont les mêmes dans les deux langues, mais pas les techniques, les traits et l'équipement, et il n'existe pas de source française publique pour les relier. L'app résout donc ce que dit l'écran à partir du jeu de données anglais, et quand il ne reste qu'un candidat, elle apprend cette orthographe. Elle refuse de deviner : un « Paharc » mal lu correspond à deux temtem, donc elle n'en retient aucun.

## Une équipe pour la zone à venir

L'onglet Team contient ma boîte, mon équipe, un sac d'équipement et un plan des zones où je vais. Le recommandeur compose une équipe à partir de la boîte :

- Chaque type auquel l'équipe a une réponse rapporte des points, et un type sans réponse en coûte autant. Une seconde réponse compte pour un tiers de la première.
- Les faiblesses coûtent et les résistances rendent des points, une faiblesse ×4 comptant double.
- Chaque technique est lue avec son bonus de type, l'équipement tenu, son coût en endurance et tout soin ou dégât subi.
- L'équipe est construite de façon gloutonne, puis on échange des membres un ou deux à la fois jusqu'à ce qu'aucun échange ne fasse mieux. Les échanges de paires piochent dans un ensemble limité, si bien qu'une boîte pleine reste sous la seconde.

Il choisit ensemble les quatre techniques de chaque membre, pour la puissance et pour la couverture qui manque encore à l'équipe, et distribue l'équipement du sac. Pour un plan, les types rencontrés dans ces zones pèsent plus et un retard de niveau coûte. Chaque membre vient avec sa raison en toutes lettres, et un outil d'audit compare mon équipe actuelle à la recommandation.

<Note title="Capture d'écran à venir : l'onglet Team">

L'équipe recommandée avec la raison et les techniques de chaque membre.

</Note>

## Le Tempedia se remplit tout seul

Le compagnon lit aussi ma sauvegarde sur le PC et envoie à l'app les temtem que j'ai vus et capturés. Chaque liste et chaque zone de la carte les marquent alors, ce qui me montre ce qu'une zone offre encore pour le Tempedia. Les marques ne font que monter : le jeu écrit sa sauvegarde à la fermeture, donc une marque posée dans l'app peut être plus récente que la sauvegarde.

## Une surcouche de terminal répond à la même question à la main

Meta+Shift+T ouvre une fenêtre kitty sans bordure par-dessus le jeu : une recherche floue sur tous les temtem, avec leurs types, affinités, techniques, lieux et évolutions. Elle liste aussi les 78 combinaisons de types, et une vue d'équipe montre chaque type d'attaque face à chaque membre. Les panneaux sont rendus à l'avance, donc l'aperçu d'une touche, c'est un `cat` et une image.

La même touche la ferme, et une règle KWin la garde au-dessus du jeu, qui doit tourner en fenêtré sans bordure : le plein écran exclusif passe au-dessus de tout ce qui est gardé au premier plan.

## Les données restent privées

Le jeu de données vient d'une API communautaire épinglée à un commit, d'un wiki et d'une carte de fans des positions des PNJ, environ 4,3 Mo embarqués dans le dépôt. Une partie n'a aucune licence, ce qui convient à une app que je suis seul à utiliser et pas à une app publique, donc l'app reste derrière mon login. L'OCR lit aussi les plaques à des positions mesurées sur l'écran de combat du jeu, donc une refonte de cet écran veut dire les mesurer de nouveau.
