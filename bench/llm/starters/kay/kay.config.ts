import tailwind from 'bun-plugin-tailwind'
import { defineConfig } from 'kay/server'

export default defineConfig({
  lang: 'en',
  plugins: [tailwind],
  seo: { name: 'kay', titleTemplate: '%s | kay', description: 'kay, made with kay' },
})
