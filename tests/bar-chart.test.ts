import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import { benches } from '../src/benches'
import BarChart from '../src/components/bar-chart.kay'

const rows = [{ label: 'kay', value: 4788 }, { label: 'Svelte', value: 3853 }]

it('scales bars to the largest value and highlights one row', async () => {
  const html = await renderToString(BarChart, { title: 'Renders', unit: 'renders/s', rows, highlight: 'kay', better: 'higher', digits: 0 })

  expect(html).toContain('width: calc((100% - 6rem) * 1)')
  expect(html).toContain(`width: calc((100% - 6rem) * ${3853 / 4788})`)
  expect(html).toContain('chart-bar-highlight')
  expect(html).toContain('higher is better')
  expect(html).toContain('<td>4,788 renders/s</td>')
})

it('highlights every row a list names', async () => {
  const html = await renderToString(BarChart, { title: 'Memory', unit: 'MB', rows: [...rows, { label: 'Astro', value: 3000 }], highlight: ['kay', 'Svelte'] })

  expect(html.match(/chart-bar-highlight/g)).toHaveLength(2)
})

it('highlights kay\'s own rows when no highlight is given', async () => {
  const html = await renderToString(BarChart, { title: 'Memory', unit: 'MB', rows: [{ label: 'kay, cattery', value: 142 }, { label: 'kay, painter', value: 104 }, { label: 'Astro, cattery', value: 283 }] })

  expect(html.match(/chart-bar-highlight/g)).toHaveLength(2)
})

it('opens a bench\'s source with its name and ends it with its date', async () => {
  const detailed = await renderToString(BarChart, { title: 'Build', unit: 's', rows, bench: 'sveltekit', source: 'hyperfine, 3 runs' })
  const plain = await renderToString(BarChart, { title: 'Build', unit: 's', rows, bench: 'synthetic' })

  expect(detailed).toContain(`Source: SvelteKit port, hyperfine, 3 runs, ${benches.sveltekit.date}`)
  expect(plain).toContain(`Source: kay's bench, ${benches.synthetic.date}`)
})

it('puts each framework\'s logo before its name, a site after the comma included', async () => {
  const html = await renderToString(BarChart, { title: 'Memory', unit: 'MB', rows: [{ label: 'kay, painter', value: 104 }, { label: 'Astro, painter', value: 134 }, { label: 'Other', value: 90 }] })

  expect(html.match(/<svg/g)).toHaveLength(1)
  expect(html).toMatch(/<img[^>]*class="size-4"/)
})

it('draws Next.js and Nuxt rows with their own logos', async () => {
  const logoOf = async (label: string): Promise<string | undefined> => (await renderToString(BarChart, { title: 'Memory', unit: 'MB', rows: [{ label, value: 1 }] })).match(/<svg[\s\S]*?<\/svg>/)?.[0]
  const next = await logoOf('Next.js')
  const nuxt = await logoOf('Nuxt, painter')

  expect(next).toBeDefined()
  expect(nuxt).toBeDefined()
  expect(nuxt).not.toBe(next)
  expect(await logoOf('Next')).toBe(next)
})

it('fills a ranged row to its median, scales it to the highest run and ticks its lowest', async () => {
  const html = await renderToString(BarChart, { title: 'Time', unit: 'min', better: 'lower', rows: [{ label: 'kay', value: 2, range: [1, 4] }, { label: 'Astro', value: 3, range: [2, 8] }] })

  expect(html).toContain('width: calc((100% - 6rem) * 0.5)')
  expect(html).toContain('width: calc((100% - 6rem) * 1)')
  expect(html).toContain('width: 50%')
  expect(html).toContain('left: 25%')
  expect(html).toContain('<td>1 to 4 min</td>')
  expect(html).toContain('gray carries on to the worst, the tick marks the best')
})

it('leaves the runs column and the legend out when no row has a range', async () => {
  const html = await renderToString(BarChart, { title: 'Renders', unit: 'renders/s', rows })

  expect(html).not.toContain('chart-range')
  expect(html).not.toContain('Runs')
})

it('hides its screen reader table in a div, since a table keeps its content\'s width', async () => {
  const html = await renderToString(BarChart, { title: 'Renders', unit: 'renders/s', rows })

  expect(html).toContain('<div class="sr-only"><table>')
})

it('writes a row\'s note after its value, telling two rows of one framework apart', async () => {
  const html = await renderToString(BarChart, { title: 'Build', unit: 's', digits: 2, rows: [{ label: 'kay', value: 0.34, note: 'no type check' }, { label: 'kay', value: 0.8 }] })

  expect(html).toMatch(/0\.34 s<span[^>]*>\(no type check\)<\/span>/)
  expect(html).toContain('<th scope="row">kay (no type check)</th>')
  expect(html.match(/chart-bar-highlight/g)).toHaveLength(2)
})

it('tints each framework\'s bar with its color, sites included', async () => {
  const html = await renderToString(BarChart, { title: 'Memory', unit: 'MB', rows: [{ label: 'Astro, cattery', value: 283 }, { label: 'SvelteKit', value: 130 }, { label: 'Reference', value: 90 }] })

  expect(html).toContain('--tint: var(--framework-astro)')
  expect(html).toContain('--tint: var(--framework-svelte)')
  expect(html.match(/--tint/g)).toHaveLength(2)
})
