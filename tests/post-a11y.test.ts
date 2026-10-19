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

it.each(posts)('%s breaks no axe rule', async (path) => {
  await using page = await site.open(path)
  const broken = (await page.a11y()).flatMap(rule => rule.nodes.map(node => `${rule.id}: ${node.target}`))

  expect(broken).toEqual([])
}, 30_000)
