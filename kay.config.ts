import process from 'node:process'
import tailwind from 'bun-plugin-tailwind'
import { defineConfig } from 'kay/server'

export default defineConfig({
  lang: 'en',
  site: process.env.SITE_URL ?? 'https://log.kaynooo.fr',
  plugins: [tailwind],
  favicon: 'src/favicon.png',
  // Nothing here is interactive: pages load fully and ship no script.
  navigation: false,
  seo: { name: 'devlog', titleTemplate: '%s | devlog', description: 'Notes on the software Kévyn builds: how it works, what it costs, and the benchmarks behind it.' },
})
