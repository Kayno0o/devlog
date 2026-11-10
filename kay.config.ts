import process from 'node:process'
import tailwind from 'bun-plugin-tailwind'
import { defineConfig } from 'kay/server'
import { pageWeight } from './src/page-weight'

export default defineConfig({
  // English stays unprefixed so the existing links keep working; French is served under /fr.
  i18n: { locales: ['en', 'fr'], defaultLocale: 'en' },
  site: process.env.SITE_URL ?? 'https://log.kaynooo.fr',
  plugins: [tailwind],
  extensions: [pageWeight],
  favicon: { image: 'src/favicon.png', svg: 'src/favicon.svg' },
  // Chakra Petch for headings and share cards, IBM Plex Sans for text, JetBrains Mono for dates, units and code: the orbit apps' faces.
  fonts: [
    { fontsource: '@fontsource/chakra-petch', weights: [600] },
    // No italic face: the browser slants the regular one, which saves every page a 24 KB file.
    { fontsource: '@fontsource/ibm-plex-sans', weights: [400, 600] },
    { fontsource: '@fontsource/jetbrains-mono', weights: [400] },
  ],
  images: { card: { font: { family: 'Chakra Petch', weight: 600 }, background: '#090c13', color: '#dbe0ea' } },
  // Nothing here is interactive: pages load fully and ship no script.
  client: { navigation: false },
  seo: {
    name: 'devlog',
    titleTemplate: '%s | devlog',
    description: {
      en: 'Notes on the software Kévyn builds: how it works, what it costs, and the benchmarks behind it.',
      fr: 'Notes sur les logiciels que Kévyn construit : comment ils marchent, ce qu\'ils coûtent, et les benchmarks derrière.',
    },
  },
})
