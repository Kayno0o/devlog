---
title: "Un thème de bureau où chaque couleur est un état"
description: "Chamfer habille mon bureau KDE et dix applis de terminal depuis un seul générateur. Dans Cockpit, le décor est gris et la couleur réclame l'attention."
date: 2026-11-10
tags: [design, linux]
draft: true
---

Chamfer est le thème de mon bureau KDE et des applis de terminal où je vis. Sa palette Cockpit n'a qu'une règle : un nouvel élément prend la couleur de ce qu'il signifie, pas celle qui fait joli. Le décor est gris, et tout ce qui est coloré est sélectionné, une cible, ou un état qui demande de l'attention. L'ambre et le rouge n'apparaissent que pour un état réel, sinon on cesse de les remarquer.

<Stats
  items={[
    {"value": "7", "label": "couleurs dans Cockpit, chacune avec un seul sens"},
    {"value": "6", "label": "palettes, chacune quelques nombres OKLCH"},
    {"value": "10", "label": "applis thémées en plus de KDE, de kitty à VS Code"}
  ]}
/>

<Note title="Capture d'écran à venir : le bureau Cockpit">

Une fenêtre active et une inactive avec leurs coins coupés, le panneau et ses widgets, un terminal avec un prompt et un diff lazygit.

</Note>

## Le gris est le décor, la couleur est un état

Cockpit suit les conventions de couleur des recommandations de la FAA pour les affichages de vol électroniques, AC 25-11B. Le magenta, que la FAA réserve aux cibles, est remplacé par du cyan pour ne pas être confondu avec l'accent violet.

- **Blanc**, `#e5e8eb` : donnée courante, comme le texte des fenêtres et le chemin dans le prompt.
- **Gris clair**, `#727577` : libellés, séparateurs, tout ce qui est inactif, comme les onglets sans focus et le caractère du prompt.
- **Améthyste**, `#b67ef9` : sélectionné, comme le contour de la fenêtre active, le panneau actif et la pastille de mode de nvim.
- **Cyan**, `#67def2` : une cible, comme la branche git, les liens et la base du rebase dans lazygit.
- **Vert**, `#79c15f` : normal ou terminé, comme les fichiers indexés.
- **Ambre**, `#de9d16` : prudence, comme les fichiers modifiés, les commits à pousser et un voyant qui a quelque chose à faire.
- **Rouge**, `#fb817f` : agir maintenant, comme une commande en échec, un conflit ou une unité en échec.

La syntaxe est la seule exception. Sur la ligne de commande de fish et dans nvim, VS Code, bat et les diffs de lazygit, la couleur distingue les tokens, donc chaque palette y garde les huit teintes.

## La charge est du travail, pas une panne

Le panneau a quatre widgets dessinés comme des instruments. Le widget moteur montre CPU, GPU, mémoire et VRAM en bandes, et CPU et GPU restent blancs quelle que soit leur charge : ce sont leurs températures qui portent les limites, ambre à partir de 80 °C et rouge à partir de 90 °C. La mémoire passe à l'ambre à partir de 80 % et au rouge à partir de 90 %. La VRAM n'a aucune limite, puisque les jeux la remplissent exprès.

Un annonciateur réunit quatre voyants pour le diagnostic de la machine, sa santé, la synchronisation et un redémarrage en attente, éteints quand il n'y a rien à faire. Les barres d'usage de Claude passent à l'ambre à partir de 70 % et au rouge à partir de 90 %, avec un repère cyan là où le rythme dit que je devrais en être. Le widget réseau affiche `VPN` en cyan et passe à l'ambre quand le trafic quitte un VPN à connexion automatique ou qu'il n'y a plus de route.

## Les cadres sont coupés à 45°

Chaque cadre a ses coins haut gauche et bas droit coupés à 45°, la forme qui donne son nom au thème. Le reste est plat : des traits de 1 px sur la grille de pixels, ni halo, ni ombre, ni dégradé, ni animation, puisque le générateur met la vitesse d'animation de KDE à zéro.

Une fenêtre a un cadre de 5 px, une barre de titre de 28 px et ses deux coins opposés coupés de 5 px. Les boutons de la barre de titre font 21 sur 19 avec des glyphes de 9 sur 9, transparents tant qu'on ne les survole pas, et la fermeture se remplit de rouge. Les popups et les infobulles prennent le même cadre coupé. Le panneau reste carré, parce que Plasma le coupe là où il touche le bord de l'écran. Même les fenêtres flottantes de nvim dessinent leurs coins avec `╱`.

La police de l'interface est B612, la police qu'Airbus a fait dessiner pour les écrans de cockpit, qui distingue bien 0 et O, 1, l et I, 5 et S, 8 et B. Les libellés d'instruments sont en capitales espacées, les nombres sont tabulaires.

## Une palette tient en quelques nombres

Chaque palette est un appel qui nomme une teinte pour les gris, un accent et un second accent, le tout en OKLCH :

```ts
cockpit: palette({ name: 'Cockpit', tint: [250, 0.005], accent: [0.7, 0.18, 303], accent2: [0.84, 0.11, 210], hues: [0.74, 0.15], ladder: BLACK_LADDER, neutral: true, font: 'B612' }),
```

Les gris s'échelonnent sur une échelle de dix luminosités OKLCH, donc chaque palette les espace de la même façon. L'échelle de Cockpit part du noir pur pour un écran OLED, celle des cinq autres d'un charbon presque noir. Les huit teintes de syntaxe partagent une même luminosité et une même chroma, pour qu'aucune ne crie plus fort que les autres. `neutral: true` est ce qui rend le décor de Cockpit gris ; les cinq autres teintent leurs barres de titre et leur prompt avec l'accent.

## Un générateur écrit le thème de chaque appli

`just chamfer-theme cockpit` lance un script Bun qui écrit, pour chacune des six palettes, un jeu de couleurs KDE, une décoration de fenêtre, un thème de curseur en quatre tailles et un thème global, de sorte que chacune se choisit dans les réglages de KDE. Pour la palette retenue, il écrit aussi le thème Plasma et les fichiers lus par kitty, fish, starship, nvim, lazygit, lazysql, bat, VS Code, yazi et Spotify, puis les applique.

Rien de cette sortie n'est commité ni modifié à la main : pour changer le thème, je change le générateur et je le relance. Mes dotfiles commitent à la place des configs Catppuccin simples, sur lesquelles les fichiers générés viennent se poser, si bien qu'une machine sans le thème a quand même un thème sombre.

## Le générateur n'a pas de tests à lui

Six tests figent les palettes : Cockpit sur noir pur avec un décor gris et B612, les deux échelles qui s'éclaircissent pas à pas, les auteurs grisés de lazygit. Le générateur lui-même, 1 074 lignes qui écrivent des fichiers SVG, TOML, JSON, XML et INI, n'en a aucun, donc une cible cassée se voit à l'écran, pas dans une vérification. Et tout ne passe pas par lui : Herdr, l'application de terminal à laquelle je suis passé après tmux, a un thème écrit à la main, si bien que les états de ses agents ont leurs propres couleurs. Le thème vit dans mes dotfiles, qui sont privés.
