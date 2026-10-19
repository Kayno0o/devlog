import { expect, it } from 'bun:test'
import { bodyHtml } from 'kay/content'
import { renderToString } from 'kay/server'
import Embed from '../src/components/embed.kay'
import Note from '../src/components/note.kay'
import PostMeta from '../src/components/post-meta.kay'
import Tab from '../src/components/tab.kay'
import Toc from '../src/components/toc.kay'
import { highlight } from '../src/highlight'

const heading = (depth: number, text: string) => ({ depth, id: text.toLowerCase(), text })
const frontmatter = /^---\n[\s\S]*?\n---\n/
const code = /<(pre|code)\b[\s\S]*?<\/\1>/g
// a capitalized tag left in the HTML, raw or escaped
const componentLeft = /<[A-Z]|&lt;[A-Z]/
const rankedChart = /<BarChart title="([^"]*)"[^\n]*?better="(lower|higher)"[^\n]*?rows=\{(\[.*\])\}/g

it('lists a long post\'s sections, and nothing for a short one', async () => {
  const long = await renderToString(Toc, { headings: [heading(2, 'One'), heading(3, 'Inner'), heading(2, 'Two'), heading(2, 'Three'), heading(2, 'Four')] })
  const short = await renderToString(Toc, { headings: [heading(2, 'One'), heading(2, 'Two'), heading(2, 'Three')] })

  expect(long).toContain('<a href="#four">Four</a>')
  expect(long).not.toContain('Inner')
  expect(short).not.toContain('Contents')
})

it('shows a post\'s date, its update, its reading time and its tags', async () => {
  const meta = await renderToString(PostMeta, { date: new Date('2026-10-09'), updated: new Date('2026-10-12'), minutes: 2, tags: ['kay'] })
  const plain = await renderToString(PostMeta, { date: new Date('2026-10-09'), minutes: 2 })

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

it('folds a note under its title, closed until opened', async () => {
  const html = await renderToString(Note, { title: 'How it was measured' })

  expect(html).toMatch(/<details class="note [^"]*">/)
  expect(html).toContain('<span>How it was measured</span></summary>')
})

it('frames a page lazily, named for screen readers', async () => {
  const html = await renderToString(Embed, { src: '/llm-bench/bookshelf/books', title: 'The bookshelf' })

  expect(html).toContain('src="/llm-bench/bookshelf/books" title="The bookshelf" loading="lazy"')
})

// a component tag kay cannot read stays in the post as text, which kay check does not report
it('leaves no component of the posts as text', async () => {
  const left: string[] = []

  for (const path of new Bun.Glob('src/content/posts/*/*.md').scanSync()) {
    const html = (await bodyHtml((await Bun.file(path).text()).replace(frontmatter, ''))).replace(code, '')
    const at = html.search(componentLeft)

    if (at !== -1) {
      left.push(`${path}: ${html.slice(at, at + 60)}`)
    }
  }

  expect(left).toEqual([])
})

it('ranks each group of a post\'s charts from best to worst', async () => {
  const unranked: string[] = []

  for (const path of new Bun.Glob('src/content/posts/*/*.md').scanSync()) {
    for (const [, title, better, json] of (await Bun.file(path).text()).matchAll(rankedChart)) {
      const rows: { group?: string, value: number }[] = JSON.parse(json ?? '[]')
      const sign = better === 'lower' ? 1 : -1

      if (rows.some((row, i) => i > 0 && row.group === rows[i - 1]?.group && sign * (row.value - (rows[i - 1]?.value ?? 0)) < 0)) {
        unranked.push(`${path}: ${title}`)
      }
    }
  }

  expect(unranked).toEqual([])
})
