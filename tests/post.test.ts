import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import Embed from '../src/components/embed.kay'
import PostMeta from '../src/components/post-meta.kay'
import Tab from '../src/components/tab.kay'
import Toc from '../src/components/toc.kay'
import { highlight } from '../src/highlight'
import { readingMinutes } from '../src/reading-time'

const heading = (depth: number, text: string) => ({ depth, id: text.toLowerCase(), text })
const post = `${import.meta.dir}/../.kay/reading-time.md`

// 460 words of text: 2 minutes, where the frontmatter or the tag counted would make 3.
await Bun.write(post, `---\ntitle: ${'word '.repeat(300)}\n---\n<Stats items={[{"value": "1", "label": "${'word '.repeat(300)}"}]} />\n\n${'word '.repeat(460)}`)

it('lists a long post\'s sections, and nothing for a short one', async () => {
  const long = await renderToString(Toc, { headings: [heading(2, 'One'), heading(3, 'Inner'), heading(2, 'Two'), heading(2, 'Three'), heading(2, 'Four')] })
  const short = await renderToString(Toc, { headings: [heading(2, 'One'), heading(2, 'Two'), heading(2, 'Three')] })

  expect(long).toContain('<a href="#four">Four</a>')
  expect(long).not.toContain('Inner')
  expect(short).not.toContain('Contents')
})

it('reads a post at 230 words a minute, leaving its frontmatter and component tags out', () => {
  expect(readingMinutes(post)).toBe(2)
})

it('shows a post\'s date, its update, its reading time and its tags', async () => {
  const meta = await renderToString(PostMeta, { date: new Date('2026-10-09'), updated: new Date('2026-10-12'), file: post, tags: ['kay'] })
  const plain = await renderToString(PostMeta, { date: new Date('2026-10-09'), file: post })

  expect(meta).toContain('updated <time datetime="2026-10-12T00:00:00.000Z">Oct 12, 2026</time>')
  expect(meta).toContain('2 min read')
  expect(meta).toContain('#kay')
  expect(plain).not.toContain('updated')
})

it('labels a code block with its language, and a plain one with none', () => {
  expect(highlight('const a = 1', 'ts')).toContain('data-language="ts"')
  expect(highlight('plain', undefined)).not.toContain('data-language')
})

it('ties a tab\'s label to its radio, checked only when asked', async () => {
  const first = await renderToString(Tab, { group: 'component', label: 'SvelteKit', checked: true })
  const other = await renderToString(Tab, { group: 'component', label: 'Astro' })

  expect(first).toContain('name="component" id="component-sveltekit" checked')
  expect(first).toContain('<label class="tab-label" for="component-sveltekit">SvelteKit</label>')
  expect(other).not.toContain('checked')
})

it('frames a page lazily, named for screen readers', async () => {
  const html = await renderToString(Embed, { src: '/llm-bench/bookshelf/books', title: 'The bookshelf' })

  expect(html).toContain('src="/llm-bench/bookshelf/books" title="The bookshelf" loading="lazy"')
})
