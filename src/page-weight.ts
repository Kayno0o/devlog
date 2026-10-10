import type { KayExtension } from 'kay/server'
import { brotliCompressSync } from 'node:zlib'

const slot = '<span data-page-weight></span>'
const tag = /<(img|script|link)\b[^>]*>/g
const src = /\bsrc="([^"]+)"/
const href = /\bhref="([^"]+)"/
const rel = /\brel="([^"]+)"/
const scriptType = /\btype="([^"]+)"/
const compressed = /\.(?:css|m?js|svg|json|xml|txt|html)$/
// what a browser fetches on a first visit; touch icons, the manifest and feeds wait for the visitor to ask
const fetchedRels = new Set(['stylesheet', 'icon', 'modulepreload'])
const javascriptTypes = new Set(['module', 'text/javascript'])

function linkedUrls(html: string): { urls: Set<string>, javascript: boolean } {
  const urls = new Set<string>()
  let javascript = false

  for (const [element, name] of html.matchAll(tag)) {
    if (name === 'link') {
      const url = href.exec(element)?.[1]

      if (url !== undefined && fetchedRels.has(rel.exec(element)?.[1] ?? '')) {
        urls.add(url)
      }

      continue
    }

    if (name === 'script') {
      const type = scriptType.exec(element)?.[1]

      javascript ||= type === undefined || javascriptTypes.has(type)
    }

    const url = src.exec(element)?.[1]

    if (url !== undefined) {
      urls.add(url)
    }
  }

  return { urls, javascript }
}

// Text goes out brotli, as kay and nginx compress it; an image or an icon goes out as it is.
async function servedSize(path: string): Promise<number> {
  const bytes = await Bun.file(path).bytes()

  return compressed.test(path) ? brotliCompressSync(bytes).length : bytes.length
}

function line(bytes: number, javascript: boolean): string {
  const size = `${(bytes / 1024).toFixed(1)} KB`

  return `<span data-page-weight>This page: ${javascript ? size : `${size}, no JavaScript`}.</span>`
}

// Fills the footer's slot with what a first visit downloads as served: the page and every file it fetches, each once.
export const pageWeight: KayExtension = {
  name: 'page-weight',
  async transformPage({ html, file }) {
    if (!html.includes(slot)) {
      return html
    }

    const { urls, javascript } = linkedUrls(html)
    const paths = await Promise.all([...urls].map(async url => file(url)))
    const sizes = await Promise.all(paths.filter(path => path !== undefined).map(async path => servedSize(path)))
    const linked = sizes.reduce((sum, size) => sum + size, 0)
    // measured once more with the line in place, which it adds a few bytes to
    const estimate = html.replace(slot, () => line(brotliCompressSync(html).length + linked, javascript))

    return html.replace(slot, () => line(brotliCompressSync(estimate).length + linked, javascript))
  },
}
