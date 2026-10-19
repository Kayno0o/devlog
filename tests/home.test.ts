import { expect, it } from 'bun:test'
import { testSite } from 'kay/test'

const site = await testSite()

it('lists the posts, leaving drafts out', async () => {
  const home = await site.visit('/')

  expect(home.status).toBe(200)
  expect(home.links()).toContain('/posts/five-frameworks')
  expect(home.links()).not.toContain('/posts/introducing-kay')
})

it('names its author, and gives contact links in the footer', async () => {
  const home = await site.visit('/')

  const code = home.find('a[href="https://github.com/Kayno0o"]')[0]

  expect(home.text('h1')).toBe('Hi, I\'m Kévyn')
  expect(code?.text).toBe('my code')
  expect(code?.html).toStartWith('<svg')
  expect(home.links()).toContain('mailto:contact@kaynooo.fr')
  expect(home.links()).toContain('https://github.com/Kayno0o/devlog')
})

it('links kay\'s docs site from the header, on kay\'s mark', async () => {
  const home = await site.visit('/')

  expect(home.find('header a[href="https://kayjs.kaynooo.fr"] img')[0]?.attributes.src).toContain('kay-logo')
})

it('links the about page from the intro and from the header on every page', async () => {
  const home = await site.visit('/')
  const about = await site.visit('/about')

  expect(home.links().filter(link => link === '/about')).toHaveLength(2)
  expect(about.status).toBe(200)
  expect(about.links()).toContain('/about')
  expect(about.text()).toContain('How I got here')
})

it('opens every link of the about page on its icon', async () => {
  const about = await site.visit('/about')
  const links = about.find('article a')

  expect(links.length).toBeGreaterThan(10)
  expect(links.filter(link => !link.html.startsWith('<svg') && !link.html.startsWith('<img'))).toEqual([])
})

it('serves the feed', async () => {
  const feed = await site.visit('/rss.xml')

  expect(feed.status).toBe(200)
  expect(feed.html).toContain('<title>devlog</title>')
})

it('serves the favicon and links it from every page', async () => {
  const icon = await site.visit('/favicon.ico')
  const home = await site.visit('/')

  expect(icon.status).toBe(200)
  expect(home.find('link[rel="icon"][href="/favicon.ico"]')).toHaveLength(1)
})
