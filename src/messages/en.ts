import { defineMessages } from 'kay/i18n'

export default defineMessages({
  site: {
    skipLink: 'Skip to main content',
  },
  nav: {
    label: 'Main navigation',
    about: 'About',
  },
  footer: {
    builtWith: 'Built with <kay>kay</kay>, served as static files.',
    source: 'Source',
  },
  home: {
    title: 'devlog, notes on building software',
    greeting: 'Hi, I\'m Kévyn',
    who: 'A French full-stack developer based in Bordeaux, I\'ve been coding since middle school, the last four years for a living, mostly with Bun, TypeScript, Astro, SolidJS, Svelte and Vue/Nuxt. Away from the web, I love Godot and build Minecraft mods and tools. More <about>about me</about>, or <code>my code</code>.',
    notes: 'These are notes on the software I build: how it works, what it costs, and the benchmarks behind it, starting with <kay>kay</kay>, a Bun web framework, because the world clearly needed one more.',
    posts: 'Posts',
    empty: 'Nothing published yet.',
  },
  about: {
    title: 'About',
    description: 'Kévyn, a full-stack developer from Bordeaux: how I got into coding, and what I care about in it.',
    intro: 'I\'m Kévyn, a full-stack developer from Bordeaux, France. I build web apps for a living, and Minecraft mods, tools and <godot>Godot</godot> projects for fun.',
    origins: {
      title: 'How I got here',
      arduino: 'It started with an <arduino>Arduino</arduino>, discovered at a family meal when I was twelve. I spent a year playing with it, then drifted to the screen: some very basic HTML, a lot of <processing>Processing</processing>, and Discord bots hosted on Glitch. A friend saw one of those bots and asked me for a custom one, then bought me a VPS, my first real server: it taught me a lot about Linux and how to host things on the internet.',
      school: 'Processing came back in seconde, my first year of high school, when a class asked us to use it. I handed in a platform game, and the teacher had a hard time believing I had made it myself, though one look at the code would have settled it: it was a mess that would burn my eyes today. Around the same time, I wrote a Discord bot for a YouTuber, who paid for another VPS so I could run it there.',
      work: 'All of that made a real difference once I got to my computer science IUT, where, I admit, I spent more classes than I should have playing <dofus>Dofus</dofus>, and even more playing video games once Covid moved classes online and nobody could see my screen. A one-year work-study web degree followed (licence pro en alternance), and right after it, the job I\'ve now held for four years. There, I build large <nuxt>Nuxt</nuxt> and <symfony>Symfony</symfony> projects over several months, then maintain them, migrating to new versions to keep them secure.',
      hosting: 'I also still host my own things, on my own server running <forgejo>Forgejo</forgejo>, this blog and a few personal tools. My data stays mine, it costs little, the footprint stays small, and I keep learning from it, which is half the fun.',
    },
    values: {
      title: 'What I care about',
      footprint: 'Developer experience, performance and accessibility, and the footprint of what I build: the smaller it is, the less it costs, both to the people using it and to the planet, which never asked for a 2 MB JavaScript bundle.',
      code: 'I\'m also picky about code itself, and about formatting most of all: code should breathe. I started <eslint>my own ESLint ruleset</eslint> as a layer over <antfu>antfu\'s</antfu>, and ended up rewriting it from scratch. At work, I set up a very strict <phpcs>PHP CS Fixer</phpcs> config, half to annoy my coworkers, half so I stop grumbling when I read their code.',
    },
    setup: {
      title: 'What I use',
      claude: 'I code with <claude>Claude Code</claude>, extended with my own memory server (an <mcp>MCP</mcp> server), hooks and mods, so it remembers how I like my code to breathe. The rest of my setup:',
      os: 'I use <arch>Arch</arch>, btw (and <manjaro>Manjaro</manjaro>)',
      desktop: '<plasma>KDE Plasma</plasma> on <wayland>Wayland</wayland>',
      terminal: '<fish>fish</fish>, in <kitty>kitty</kitty> with <tmux>tmux</tmux>',
    },
    contact: {
      title: 'Get in touch',
      text: 'Contributions to kay are welcome, and so are questions: open an issue on <repo>kay\'s repository</repo>, or write to me at <mail>contact@kaynooo.fr</mail>.',
    },
  },
  post: {
    all: 'All posts',
    updated: 'updated',
    readingTime: '{minutes} min read',
    contents: 'Contents',
    suggestFix: 'Suggest a fix to this post',
  },
  chart: {
    better: {
      lower: 'lower is better',
      higher: 'higher is better',
    },
    name: 'Name',
    value: 'Value',
    runs: 'Runs',
    range: '{low} to {high}',
    legend: {
      lower: 'Bars stop at the median run, gray carries on to the worst, the tick marks the best.',
      higher: 'Bars stop at the median run, gray carries on to the best, the tick marks the worst.',
      none: 'Bars stop at the median run, gray carries on to the highest, the tick marks the lowest.',
    },
    source: 'Source: {source}',
  },
  benches: {
    synthetic: 'kay\'s bench',
    sveltekit: 'SvelteKit port',
    astro: 'Astro ports',
    llm: 'LLM benchmark, Opus 5.5, effort high, median of the passing runs',
  },
  notFound: {
    title: 'Nothing here',
    back: 'Back to the posts',
  },
})
