import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import { testSite } from 'kay/test'
import BarChart from '../src/components/bar-chart.kay'
import PostMeta from '../src/components/post-meta.kay'
import { pageWeight } from '../src/page-weight'

const site = await testSite()
const linkOpening = /<a [^>]*>(?:<svg|<img)?/g
const post = `${import.meta.dir}/../src/content/posts/en/introducing-kay.md`

it('serves the French copy of a page under /fr, its links staying in French', async () => {
  const home = await site.visit('/fr')

  expect(home.status).toBe(200)
  expect(home.html).toContain('<html lang="fr"')
  expect(home.html).toContain('Salut, moi c\'est Kévyn</h1>')
  expect(home.html).toContain('<a href="/fr/about">sur moi</a>')
  expect(home.html).toContain('href="/fr/rss.xml"')
  expect(home.html).toContain('Fait avec <a href="https://github.com/Kayno0o/kayjs">kay</a>')
})

it('links each page to its copy in the other language', async () => {
  const about = await site.visit('/about')
  const french = await site.visit('/fr/about')

  expect(about.html).toContain('<a href="/fr/about" hreflang="fr" lang="fr">Français</a>')
  expect(french.html).toContain('<a href="/about" hreflang="en" lang="en">English</a>')
})

it('opens every link of the French about page on its icon', async () => {
  const about = await site.visit('/fr/about')
  const article = about.html.slice(about.html.indexOf('<article'), about.html.indexOf('</article>'))
  const links = article.match(linkOpening) ?? []

  expect(about.html).toContain('Comment j\'en suis arrivé là')
  expect(links.length).toBeGreaterThan(10)
  expect(links.filter(link => !link.endsWith('<svg') && !link.endsWith('<img'))).toEqual([])
})

it('serves a feed per language', async () => {
  const feed = await site.visit('/fr/rss.xml')

  expect(feed.status).toBe(200)
  expect(feed.html).toContain('<title>devlog</title>')
})

it('writes a post\'s dates, reading time and chart in French', async () => {
  const meta = await renderToString(PostMeta, { date: new Date('2026-10-09'), updated: new Date('2026-10-12'), file: post }, { locale: 'fr' })
  const chart = await renderToString(BarChart, { title: 'Rendu', unit: 'ms', better: 'lower', bench: 'astro', rows: [{ label: 'kay', value: 1234.5 }] }, { locale: 'fr' })

  expect(meta).toContain('mis à jour le <time datetime="2026-10-12T00:00:00.000Z">12 oct. 2026</time>')
  expect(meta).toContain('min de lecture')
  expect(chart).toContain('plus bas, c\'est mieux')
  expect(chart).toContain('1\u202F234,5 ms')
  expect(chart).toContain('Source\u00A0: ports Astro, 2026-10-10')
})

it('weighs a French page in French', async () => {
  const html = await pageWeight.transformPage!({ path: '/fr', html: '<html lang="fr"><body><footer><span data-page-weight></span></footer></body></html>', file: async () => undefined })

  expect(html).toMatch(/Cette page\u00A0: \d+,\d\u00A0Ko, sans JavaScript\.<\/span>/)
})
