import { defineMessages } from 'kay/i18n'

export default defineMessages({
  site: {
    description: 'Notes on the software Kévyn builds: how it works, what it costs, and the benchmarks behind it.',
    skipLink: 'Skip to main content',
  },
  nav: {
    label: 'Main navigation',
    about: 'About',
  },
  footer: {
    builtWith: 'Built with',
    served: ', served as static files.',
    source: 'Source',
  },
  home: {
    title: 'devlog, notes on building software',
    greeting: 'Hi, I\'m Kévyn',
    posts: 'Posts',
    empty: 'Nothing published yet.',
  },
  about: {
    title: 'About',
    description: 'Kévyn, a full-stack developer from Bordeaux: how I got into coding, and what I care about in it.',
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
