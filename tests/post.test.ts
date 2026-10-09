import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import Toc from '../src/components/toc.kay'
import { highlight } from '../src/highlight'
import { readingMinutes } from '../src/reading-time'

const heading = (depth: number, text: string) => ({ depth, id: text.toLowerCase(), text })

it('lists a long post\'s sections, and nothing for a short one', async () => {
  const long = await renderToString(Toc, { headings: [heading(2, 'One'), heading(3, 'Inner'), heading(2, 'Two'), heading(2, 'Three'), heading(2, 'Four')] })
  const short = await renderToString(Toc, { headings: [heading(2, 'One'), heading(2, 'Two'), heading(2, 'Three')] })

  expect(long).toContain('<a href="#four">Four</a>')
  expect(long).not.toContain('Inner')
  expect(short).not.toContain('Contents')
})

it('reads a post at 230 words a minute, leaving its frontmatter and component tags out', async () => {
  const file = `${import.meta.dir}/../.kay/reading-time.md`

  await Bun.write(file, `---\ntitle: ${'word '.repeat(500)}\n---\n<Stats items={[{"value": "1", "label": "x"}]} />\n\n${'word '.repeat(460)}`)

  expect(await readingMinutes(file)).toBe(2)
})

it('labels a code block with its language, and a plain one with none', () => {
  expect(highlight('const a = 1', 'ts')).toContain('data-language="ts"')
  expect(highlight('plain', undefined)).not.toContain('data-language')
})
