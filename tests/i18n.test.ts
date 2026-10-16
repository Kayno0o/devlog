import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import { testSite } from 'kay/test'
import BarChart from '../src/components/bar-chart.kay'
import PostMeta from '../src/components/post-meta.kay'
import { pageWeight } from '../src/page-weight'

const site = await testSite()

it('serves the French copy of a page under /fr, its links staying in French', async () => {
  const home = await site.visit('/fr')

  expect(home.status).toBe(200)
  expect(home.find('html')[0]?.attributes.lang).toBe('fr')
  expect(home.text('h1')).toBe('Salut, moi c\'est Kévyn')
  expect(home.find('main a[href="/fr/about"]')[0]?.text).toBe('sur moi')
  expect(home.links()).toContain('/fr/rss.xml')
  expect(home.text('footer')).toContain('Fait avec kay')
  expect(home.find('footer a[href="https://github.com/Kayno0o/kayjs"]')[0]?.text).toBe('kay')
})

it('describes the site in each page\'s language, a page\'s own description replacing it', async () => {
  const home = await site.visit('/')
  const french = await site.visit('/fr')
  const about = await site.visit('/fr/about')

  expect(home.meta('description')).toStartWith('Notes on the software')
  expect(french.meta('description')).toStartWith('Notes sur les logiciels')
  expect(about.find('meta[name="description"]').map(({ attributes }) => attributes.content)).toEqual([about.meta('description')])
  expect(about.meta('description')).toStartWith('Kévyn, développeur')
})

it('links each page to its copy in the other language', async () => {
  const about = await site.visit('/about')
  const french = await site.visit('/fr/about')

  expect(about.find('a[hreflang]').map(({ attributes, text }) => [attributes.href, attributes.lang, text])).toEqual([['/fr/about', 'fr', 'Français']])
  expect(french.find('a[hreflang]').map(({ attributes, text }) => [attributes.href, attributes.lang, text])).toEqual([['/about', 'en', 'English']])
})

it('opens every link of the French about page on its icon', async () => {
  const about = await site.visit('/fr/about')
  const links = about.find('article a')

  expect(about.text()).toContain('Comment j\'en suis arrivé là')
  expect(links.length).toBeGreaterThan(10)
  expect(links.filter(link => !link.html.startsWith('<svg') && !link.html.startsWith('<img'))).toEqual([])
})

it('serves a feed per language', async () => {
  const feed = await site.visit('/fr/rss.xml')

  expect(feed.status).toBe(200)
  expect(feed.html).toContain('<title>devlog</title>')
  expect(feed.html).toMatch(/<link>https?:\/\/[^<]+\/fr<\/link>/)
})

it('writes a post\'s dates, reading time and chart in French', async () => {
  const meta = await renderToString(PostMeta, { date: new Date('2026-10-09'), updated: new Date('2026-10-12'), minutes: 2 }, { locale: 'fr' })
  const chart = await renderToString(BarChart, { title: 'Rendu', unit: 'ms', better: 'lower', bench: 'astro', rows: [{ label: 'kay', value: 1234.5 }] }, { locale: 'fr' })

  expect(meta).toContain('mis à jour le <time datetime="2026-10-12T00:00:00.000Z">12 oct. 2026</time>')
  expect(meta).toContain('2 min de lecture')
  expect(chart).toContain('plus bas, c\'est mieux')
  expect(chart).toContain('1\u202F234,5 ms')
  expect(chart).toContain('Source\u00A0: ports Astro, 2026-10-10')
})

it('weighs a French page in French', async () => {
  const html = await pageWeight.transformPage!({ path: '/fr', locale: 'fr', html: '<html><body><footer><span data-page-weight></span></footer></body></html>', file: async () => undefined })

  expect(html).toMatch(/Cette page\u00A0: \d+,\d\u00A0Ko, sans JavaScript\.<\/span>/)
})
