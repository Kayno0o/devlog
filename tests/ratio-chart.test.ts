import { expect, it } from 'bun:test'
import { renderToString } from 'kay/server'
import RatioChart from '../src/components/ratio-chart.kay'

it('turns each measure into how many times better or worse kay does, on a 1x to 100x log scale', async () => {
  const html = await renderToString(RatioChart, {
    title: 'Products page',
    bench: 'synthetic',
    rows: [
      { label: 'Script', unit: 'ms', kay: 1, against: 'SolidJS', other: 10, better: 'lower' },
      { label: 'Renders', unit: 'renders/s', kay: 100, against: 'Svelte', other: 200, better: 'higher', digits: 0 },
    ],
  })

  expect(html).toContain('10x better')
  expect(html).toContain('width: 50%')
  expect(html).toContain('2x worse')
  expect(html.match(/chart-bar-highlight/g)).toHaveLength(1)
  expect(html).toContain('kay 100 against Svelte\'s 200 renders/s, higher is better')
  expect(html).toContain('Source: kay\'s bench, 2026-10-07')
})
