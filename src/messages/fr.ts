import { defineMessages } from 'kay/i18n'

export default defineMessages({
  site: {
    skipLink: 'Aller au contenu',
  },
  nav: {
    label: 'Navigation principale',
    about: 'À propos',
  },
  footer: {
    builtWith: 'Fait avec <kay>kay</kay>, servi en fichiers statiques.',
    source: 'Code source',
  },
  home: {
    title: 'devlog, notes de développement',
    greeting: 'Salut, moi c\'est Kévyn',
    who: 'Développeur full-stack à Bordeaux, je code depuis le collège, et depuis quatre ans pour gagner ma vie, surtout avec Bun, TypeScript, Astro, SolidJS, Svelte et Vue/Nuxt. Loin du web, j\'adore Godot et je fais des mods et des outils pour Minecraft. Plus d\'infos <about>sur moi</about>, ou <code>mon code</code>.',
    notes: 'Ici, je prends des notes sur les logiciels que je construis : comment ils marchent, ce qu\'ils coûtent, et les benchmarks derrière, à commencer par <kay>kay</kay>, un framework web pour Bun, parce que le monde en avait clairement besoin d\'un de plus.',
    posts: 'Articles',
    empty: 'Rien de publié pour l\'instant.',
  },
  about: {
    title: 'À propos',
    description: 'Kévyn, développeur full-stack à Bordeaux : comment je suis tombé dans le code, et ce qui compte pour moi.',
    intro: 'Moi c\'est Kévyn, développeur full-stack à Bordeaux. Je fais des applications web pour gagner ma vie, et des mods Minecraft, des outils et des projets <godot>Godot</godot> pour le plaisir.',
    origins: {
      title: 'Comment j\'en suis arrivé là',
      arduino: 'Tout a commencé avec un <arduino>Arduino</arduino>, découvert à un repas de famille quand j\'avais douze ans. J\'ai passé un an à jouer avec, puis j\'ai glissé vers l\'écran : un peu de HTML très basique, beaucoup de <processing>Processing</processing>, et des bots Discord hébergés sur Glitch. Un ami a vu l\'un de ces bots et m\'en a demandé un sur mesure, puis m\'a payé un VPS, mon premier vrai serveur : il m\'a beaucoup appris sur Linux et sur la façon d\'héberger des choses sur internet.',
      school: 'Processing est revenu en seconde, quand un cours nous a demandé de l\'utiliser. J\'ai rendu un jeu de plateforme, et le prof a eu du mal à croire que je l\'avais fait moi-même, alors qu\'un coup d\'œil au code aurait suffi à trancher : c\'était un fouillis qui me brûlerait les yeux aujourd\'hui. À la même époque, j\'ai écrit un bot Discord pour un YouTubeur, qui m\'a payé un autre VPS pour le faire tourner.',
      work: 'Tout ça a vraiment fait la différence une fois arrivé en IUT informatique, où, je l\'avoue, j\'ai passé plus de cours que je n\'aurais dû à jouer à <dofus>Dofus</dofus>, et encore plus à jouer aux jeux vidéo une fois que le Covid a fait passer les cours en ligne et que plus personne ne voyait mon écran. Ensuite, une licence pro web en alternance, et juste après, le poste que j\'occupe maintenant depuis quatre ans. J\'y construis de gros projets <nuxt>Nuxt</nuxt> et <symfony>Symfony</symfony> sur plusieurs mois, puis je les maintiens, en les migrant vers les nouvelles versions pour qu\'ils restent sécurisés.',
      hosting: 'J\'héberge aussi toujours mes propres affaires, sur mon propre serveur qui fait tourner <forgejo>Forgejo</forgejo>, ce blog et quelques outils perso. Mes données restent à moi, ça coûte peu, l\'empreinte reste petite, et j\'en apprends encore, ce qui fait la moitié du plaisir.',
    },
    values: {
      title: 'Ce qui compte pour moi',
      footprint: 'L\'expérience développeur, la performance et l\'accessibilité, et l\'empreinte de ce que je construis : plus c\'est petit, moins ça coûte, aux gens qui l\'utilisent comme à la planète, qui n\'a jamais demandé un bundle JavaScript de 2 Mo.',
      code: 'Je suis aussi pointilleux sur le code lui-même, et sur le formatage avant tout : le code doit respirer. J\'ai commencé <eslint>ma propre config ESLint</eslint> comme une surcouche de <antfu>celle d\'antfu</antfu>, et j\'ai fini par la réécrire de zéro. Au travail, j\'ai mis en place une config <phpcs>PHP CS Fixer</phpcs> très stricte, moitié pour embêter mes collègues, moitié pour arrêter de râler en lisant leur code.',
    },
    setup: {
      title: 'Ce que j\'utilise',
      claude: 'Je code avec <claude>Claude Code</claude>, étendu avec mon propre serveur de mémoire (un serveur <mcp>MCP</mcp>), des hooks et des mods, pour qu\'il se souvienne de comment j\'aime que mon code respire. Le reste de mon setup :',
      os: 'J\'utilise <arch>Arch</arch>, btw (et <manjaro>Manjaro</manjaro>)',
      desktop: '<plasma>KDE Plasma</plasma> sous <wayland>Wayland</wayland>',
      terminal: '<fish>fish</fish>, dans <kitty>kitty</kitty> avec <tmux>tmux</tmux>',
    },
    contact: {
      title: 'Me contacter',
      text: 'Les contributions à kay sont les bienvenues, les questions aussi : ouvrez une issue sur <repo>le dépôt de kay</repo>, ou écrivez-moi à <mail>contact@kaynooo.fr</mail>.',
    },
  },
  post: {
    all: 'Tous les articles',
    updated: 'mis à jour le',
    readingTime: '{minutes} min de lecture',
    contents: 'Sommaire',
    suggestFix: 'Proposer une correction',
  },
  chart: {
    better: {
      lower: 'plus bas, c\'est mieux',
      higher: 'plus haut, c\'est mieux',
    },
    name: 'Nom',
    value: 'Valeur',
    runs: 'Runs',
    range: '{low} à {high}',
    legend: {
      lower: 'La barre s\'arrête au run médian, le gris va jusqu\'au pire, le trait marque le meilleur.',
      higher: 'La barre s\'arrête au run médian, le gris va jusqu\'au meilleur, le trait marque le pire.',
      none: 'La barre s\'arrête au run médian, le gris va jusqu\'au plus haut, le trait marque le plus bas.',
    },
    source: 'Source : {source}',
  },
  table: {
    legend: '{unit}, {better}',
    best: 'meilleur',
  },
  benches: {
    synthetic: 'bench de kay',
    syntheticNeutral: 'benchmark synthétique',
    sveltekit: 'port SvelteKit',
    astro: 'ports Astro',
    llm: 'benchmark LLM, Opus 5.5, effort high, médiane des runs réussis',
    llmModels: 'benchmark LLM, Opus 5.5 en effort high et Sonnet 5.5 en medium, médiane des runs réussis',
  },
  notFound: {
    title: 'Rien ici',
    back: 'Retour aux articles',
  },
})
