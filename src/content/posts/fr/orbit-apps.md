---
title: "Dix apps auto-hébergées, un shell et un login"
description: "Notes, RSS, un assistant vocal, une bibliothèque de docs et six autres tournent sur mon serveur en apps kay qui partagent un cadre, un login et leurs API."
date: 2026-11-10
tags: [kay, self-hosting]
draft: true
---

Les apps que j'héberge pour moi vivent dans un monorepo appelé orbit, et chacune est une app kay sur Bun. C'est la moitié de leur raison d'être : c'est là que je vois si mon framework tient au quotidien, et kay est léger en mémoire et rapide, ce qui compte quand tout partage un seul serveur. Je n'ai remplacé que les services que je peux maintenir moi-même, et j'aime que le reste forme un écosystème à part entière : un cadre, un login en façade, et des apps qui s'appellent entre elles. Et ce que je dis et ce que je lis reste sur mon serveur. Cet article en présente dix.

<Stats
  items={[
    {"value": "10", "label": "apps dans cet article, chacune une app kay sur Bun"},
    {"value": "1", "label": "login devant chaque app, avec un second facteur"},
    {"value": "~1 400", "label": "tests dans ces dix apps et leur shell partagé"}
  ]}
/>

<Note title="Comment les tests ont été comptés">

Les appels `test(` et `it(` dans les fichiers de test des dix apps et du shell au 10 novembre 2026, comptés par grep plutôt que par une exécution.

</Note>

<Note title="Capture d'écran à venir : le ciel">

Le `/sky` d'atlas, avec chaque app en corps autour de la Terre et le panneau de hubble ouvert.

</Note>

## Chaque app fait un seul travail

- **lyra** garde des notes et des mémoires dans des dossiers, avec une recherche plein texte lemmatisée en anglais et en français, des wikilinks, des backlinks et une révision à chaque sauvegarde. Son serveur MCP est la mémoire que lisent mes sessions Claude Code, comme l'explique [l'article sur le harness](/posts/claude-code-harness).
- **pulsar** est un lecteur RSS piloté par j, k et o. Chaque matin, il écrit un podcast en français à partir de mes flux et le lit à voix haute, avec des chapitres et une transcription.
- **nymph** est la voix : de la reconnaissance vocale avec whisper sur le GPU, de la synthèse vocale en français avec phonon sur le CPU, derrière l'API audio d'OpenAI. Il n'a pas de page et n'est joignable que sur un réseau Docker privé.
- **selene** est un assistant domestique qu'on interroge par texte ou par la voix. Il allume les lumières, lit la météo, mon agenda, les prochains trams et trains, et les alertes de hubble.
- **pallas** est une bibliothèque de docs, des livres hors ligne plus des docs `llms.txt` en direct, avec un chat de recherche qui répond avec des citations numérotées.
- **vulcan** est une boîte à outils d'une page par outil. Ses avatars en pixels et ses QR codes sont ouverts sans le login, donc n'importe quel site peut les intégrer.
- **hubble** scanne les dépôts, les images en cours d'exécution et l'hôte à la recherche de vulnérabilités connues et de runtimes en fin de vie, et c'est le seul endroit qui envoie des alertes.
- **relay** gère les sites nginx placés devant tout le reste : certificats, login, trafic, bans et vérifications de disponibilité.
- **ceres** démarre, arrête et redémarre les stacks Docker du serveur depuis une page, et journalise chaque action.
- **atlas** est le tableau de bord, et la carte de toutes les autres.

## Un shell les encadre toutes

Chaque app dépend d'un même paquet du workspace, le shell. Dans `kay.config.ts`, un seul appel règle la police, le favicon, le modèle de titre, le signalement des erreurs à hubble et la vérification qu'une requête est passée par le login. Dans le layout de chaque app, un composant dessine l'en-tête, un sélecteur d'app et une palette Ctrl K.

La palette liste d'abord les pages de l'app elle-même, puis récupère depuis le navigateur les fonctions de toutes les autres apps, si bien que Ctrl K, dans n'importe quelle app, mène à une page de n'importe quelle autre. Le look est partagé aussi : presque noir, Space Grotesk, ni halo ni ombre, et chaque app ne choisit que sa couleur d'accent.

## Une requête n'atteint une app que par relay

relay fait tourner nginx dans un conteneur qui lit un dossier de config généré. Le login est une app kay à part, sur kayjs-auth : pas d'inscription, des comptes créés en ligne de commande, un second facteur TOTP obligatoire, et nginx l'interroge à chaque requête vers un site placé derrière le login.

Le login seul n'arrêterait pas une requête envoyée directement au port d'une app. Alors relay écrit une clé par site, nginx l'envoie dans un en-tête, et la config kay de l'app refuse toute requête qui n'en porte pas. Rien dans relay n'a besoin de root ni du socket Docker : le générateur écrit la config, demande à nginx de recharger via un fichier, et rétablit le dossier si nginx la refuse.

## Les apps s'appellent entre elles

Le podcast de pulsar, c'est trois apps au travail. pulsar choisit les articles et un modèle écrit le script, en listant les noms étrangers qu'il emploie avec leur respelling pour le français, comme Copilot devenu « Copaïlotte ». nymph lit le script avec ces respellings, et pulsar cale les chapitres sur les pauses de la voix.

selene utilise la même voix : whisper transforme ce que je dis en texte, et la réponse revient parlée. Son outil de bibliothèque interroge pallas, qui cherche dans les livres hors ligne et les articles de pulsar, une étape JSON à la fois, et répond avec une liste de sources. Chaque app envoie ses erreurs serveur à hubble.

## La carte est un ciel

Le `/sky` d'atlas dessine les apps en three.js comme des corps autour d'une Terre en fil de fer, chacun choisi pour son nom. hubble est un télescope spatial en orbite basse, relay un satellite de communication dont les antennes font face à la Terre, selene la Lune. pallas culbute sur l'orbite la plus raide, comme l'astéroïde Pallas, et vulcan est une planète en fusion sur la plus serrée, d'après la planète qu'on a crue tourner à l'intérieur de l'orbite de Mercure.

L'état en direct change la façon dont un corps pulse : le débit de requêtes de relay, les alertes de hubble, le nombre d'articles non lus de pulsar. Chaque dépôt avec du code sur mon Forgejo est une étoile, toujours au même endroit à chaque visite. Survoler un corps arrête son orbite et verrouille un réticule dessus, un clic y envoie la caméra et ouvre son panneau, et la liste à côté du canvas est faite de simples liens qui marchent sans JavaScript.

## Toutes les apps passent à un nouveau kay en même temps

Les dix épinglent la même version de kay, donc une mise à jour du framework, c'est dix apps à vérifier d'un coup. La seule app hors du monorepo, [mon app Temtem](/posts/temtem-companion), prend le shell depuis mon registre de paquets, et elle a encore deux versions mineures de retard. Chaque app a aussi son propre workflow de CI, et le shell a sa propre release quand il change.

Certaines limites sont voulues. ceres peut démarrer Forgejo et Postgres mais jamais les arrêter ni les redémarrer. selene lance ses outils sans demander d'abord, parce qu'il est derrière le login et que le pire qu'un appel puisse faire est d'allumer une lumière.
