import { expect, it } from 'bun:test'
import { testSite } from 'kay/test'

const site = await testSite()

it('lists the posts, leaving drafts out', async () => {
  const home = await site.visit('/')

  expect(home.status).toBe(200)
  expect(home.html).toContain('Nothing published yet.')
  expect(home.html).not.toContain('fast to run and fast to write')
})

it('names its author, and gives contact links in the footer', async () => {
  const home = await site.visit('/')

  expect(home.html).toContain('Written by kaynooo')
  expect(home.html).toContain('href="mailto:contact@kaynooo.fr"')
  expect(home.html).toContain('href="https://github.com/Kayno0o/devlog"')
})

it('links kay\'s docs site from the header, on kay\'s mark', async () => {
  const home = await site.visit('/')

  expect(home.html).toMatch(/<a[^>]*href="https:\/\/kayjs\.kaynooo\.fr"[^>]*><img[^>]*kay-logo/)
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
  expect(home.html).toContain('<link rel="icon" href="/favicon.ico"')
})
