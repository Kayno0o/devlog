import { expect, it } from 'bun:test'
import { testSite } from 'kay/test'

// the Herdr post is a draft with three images, which only dev shows
const site = await testSite({ browser: true, dev: true })

it('opens a post\'s image in the gallery and steps through the others', async () => {
  await using page = await site.open('/posts/herdr-review')

  await page.click('.gallery-open')
  await page.waitFor('dialog.gallery[open] .gallery-count', { text: '1 / 3' })
  expect(await page.text('dialog.gallery figcaption')).toStartWith('The Review tab')

  await page.press('ArrowRight')
  await page.waitFor('.gallery-count', { text: '2 / 3' })
  await page.click('.gallery-step[data-step="-1"]')
  await page.click('.gallery-step[data-step="-1"]')
  await page.waitFor('.gallery-count', { text: '3 / 3' })
  expect(await page.a11y('dialog.gallery')).toEqual([])

  await page.press('Escape')
  await page.waitFor('dialog.gallery[open]', { gone: true })
  await page.click('.gallery-open')
  await page.click('.gallery-close')
  await page.waitFor('dialog.gallery[open]', { gone: true })
  expect(page.errors).toEqual([])
})
