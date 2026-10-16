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
  // Only the share cards draw in it; the pages keep the system font.
  fonts: [{ fontsource: '@fontsource/inter', weights: [700] }],
  images: { card: { background: '#1e1e2e', color: '#cdd6f4' } },
  // Nothing here is interactive: pages load fully and ship no script.
  navigation: false,
  seo: {
    name: 'devlog',
    titleTemplate: '%s | devlog',
    description: {
      en: 'Notes on the software Kévyn builds: how it works, what it costs, and the benchmarks behind it.',
      fr: 'Notes sur les logiciels que Kévyn construit : comment ils marchent, ce qu\'ils coûtent, et les benchmarks derrière.',
    },
  },
})
