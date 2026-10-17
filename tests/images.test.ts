import { expect, it } from 'bun:test'
import { testSite } from 'kay/test'

// every post is a draft until published, which only dev shows
const site = await testSite({ dev: true })

it.each(['/', '/posts/introducing-kay'])('%s sizes every image, so it does not shift as they load', async (path) => {
  const page = await site.visit(path)
  const images = page.find('img')

  expect(images.length).toBeGreaterThan(0)
  expect(images.filter(image => image.attributes.width === undefined || image.attributes.height === undefined)).toEqual([])
})
