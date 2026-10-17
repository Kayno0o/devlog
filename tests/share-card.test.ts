import { expect, it } from 'bun:test'
import { testSite } from 'kay/test'

// every post is a draft until published, which only dev shows
const site = await testSite({ dev: true })

it('draws a kay post\'s share card on the kay banner', async () => {
  const page = await site.visit('/posts/introducing-kay')
  const card = page.find('meta[property="og:image"]')[0]?.attributes.content

  expect(card).toContain('/_kay/card?')
  expect(new URL(card!, 'http://localhost').searchParams.get('src')).toContain('kay-card')
})
