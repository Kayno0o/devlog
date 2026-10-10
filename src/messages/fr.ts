import { defineMessages } from 'kay/i18n'

export default defineMessages({
  site: {
    description: 'Notes sur les logiciels que Kévyn construit : comment ils marchent, ce qu\'ils coûtent, et les benchmarks derrière.',
    skipLink: 'Aller au contenu',
  },
  nav: {
    label: 'Navigation principale',
    about: 'À propos',
  },
  footer: {
    builtWith: 'Fait avec',
    served: ', servi en fichiers statiques.',
    source: 'Code source',
  },
  home: {
    title: 'devlog, notes de développement',
    greeting: 'Salut, moi c\'est Kévyn',
    posts: 'Articles',
    empty: 'Rien de publié pour l\'instant.',
  },
  about: {
    title: 'À propos',
    description: 'Kévyn, développeur full-stack à Bordeaux : comment je suis tombé dans le code, et ce qui compte pour moi.',
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
    source: 'Source : {source}',
  },
  benches: {
    synthetic: 'bench de kay',
    sveltekit: 'port SvelteKit',
    astro: 'ports Astro',
    llm: 'benchmark LLM, Opus 5.5, effort high, médiane des runs réussis',
  },
  notFound: {
    title: 'Rien ici',
    back: 'Retour aux articles',
  },
})
