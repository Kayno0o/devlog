import type { RenderedPage } from 'kay/server'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { brotliCompressSync } from 'node:zlib'
import { afterAll, describe, expect, it } from 'bun:test'
import { pageWeight } from '../src/page-weight'

const dir = mkdtempSync(join(tmpdir(), 'page-weight-'))
const files: Record<string, string> = { '/app.css': 'a { color: red }', '/logo.svg': '<svg></svg>', '/favicon.ico': 'icon'.repeat(500), '/charts.js': 'export {}', '/apple-touch-icon.png': 'touch' }

for (const [url, text] of Object.entries(files)) {
  await Bun.write(join(dir, url), text)
}

afterAll(() => rmSync(dir, { recursive: true, force: true }))

const brotli = (text: string): number => brotliCompressSync(text).length
const weight = /This page: ([\d.]+) KB/

async function transform(body: string): Promise<string> {
  const html = `<html><head><link rel="stylesheet" href="/app.css"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"></head><body>${body}<footer><span data-page-weight></span></footer></body></html>`
  const page: RenderedPage = { path: '/', html, file: async url => url in files ? join(dir, url) : undefined }

  return pageWeight.transformPage!(page)
}

describe('pageWeight', () => {
  it('counts the page and each file a first visit fetches once, as served: text brotli, an icon as it is', async () => {
    const html = await transform('<img src="/logo.svg"><img src="/logo.svg"><iframe src="/elsewhere" loading="lazy"></iframe><script type="speculationrules">{}</script>')
    const linked = brotli(files['/app.css']!) + brotli(files['/logo.svg']!) + files['/favicon.ico']!.length

    expect(html).toContain(', no JavaScript.</span>')
    expect(Number(weight.exec(html)?.[1])).toBe(Number(((brotli(html) + linked) / 1024).toFixed(1)))
  })

  it('claims no JavaScript only on a page loading none', async () => {
    const html = await transform('<script src="/charts.js" type="module"></script>')

    expect(html).toMatch(/This page: [\d.]+ KB\.<\/span>/)
  })

  it('leaves a page without the footer slot as it is', async () => {
    const page: RenderedPage = { path: '/404', html: '<p>Nothing here</p>', file: async () => undefined }

    expect(await pageWeight.transformPage!(page)).toBe(page.html)
  })
})
