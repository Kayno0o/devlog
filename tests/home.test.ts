import { expect, it } from 'bun:test'
import { testSite } from 'kay/test'

const site = await testSite()

it('lists the posts, leaving drafts out', async () => {
  const home = await site.visit('/')

  expect(home.status).toBe(200)
  expect(home.html).toContain('Nothing published yet.')
  expect(home.html).not.toContain('fast to run and fast to write')
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
