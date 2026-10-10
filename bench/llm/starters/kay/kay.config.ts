import { defineConfig } from 'kay/server'

export default defineConfig({
  lang: 'en',
  seo: { name: 'site', titleTemplate: '%s | site', description: 'site, made with kay' },
})
