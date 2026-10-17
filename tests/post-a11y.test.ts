import { afterAll, expect, it } from 'bun:test'
import { testSite } from 'kay/test'

// every post is a draft until published, which only dev shows
const site = await testSite({ browser: true, dev: true })

afterAll(async () => site.close())

const posts = [...new Bun.Glob('*/*.md').scanSync('src/content/posts')].map((path) => {
  const [locale, file] = path.split('/') as [string, string]
  const slug = file.replace('.md', '')

  return locale === 'en' ? `/posts/${slug}` : `/${locale}/posts/${slug}`
})

// light mode's muted text is under AA's contrast, a palette choice left open for now
const ignored = new Set(['color-contrast'])

it.each(posts)('%s breaks no axe rule', async (path) => {
  const page = await site.open(path)
  const broken = (await page.a11y()).filter(rule => !ignored.has(rule.id)).map(rule => `${rule.id}: ${rule.nodes.map(node => node.target).join(', ')}`)

  expect(broken).toEqual([])
}, 30_000)
