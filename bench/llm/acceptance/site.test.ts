// The spec's acceptance suite, hidden from the agents. It runs against SITE_URL, or against the reference site when none is given, which is how `bun run test` proves the suite itself.
import type { Browser, BrowserContext, BrowserContextOptions, Locator, Page } from 'playwright-core'
import type { Site } from '../lib/site'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { afterAll, beforeAll, describe, expect, test } from 'bun:test'
import { chromium } from 'playwright-core'
import { allTags, loadBooks, topRated } from '../lib/books'
import { startSite } from '../lib/site'

const books = await loadBooks()
const timeout = 30_000

const trailingSlash = /(.)\/$/
const curlySingle = /[\u2018\u2019]/g
const curlyDouble = /[\u201C\u201D]/g
const boldText = /\*\*(.+?)\*\*/

let base = process.env.SITE_URL ?? ''
let reference: Site | undefined
let browser: Browser | undefined

// With no browser installed, as on the CI runner, the proof against the reference is skipped; grading a run always sets SITE_URL and needs one
const skipped = base === '' && !existsSync(chromium.executablePath())
const describeSite = skipped ? describe.skip : describe

beforeAll(async () => {
  if (skipped) {
    return
  }

  if (base === '') {
    reference = await startSite(join(import.meta.dir, '../reference'), 4390)
    base = reference.url
  }

  browser = await chromium.launch()
})

afterAll(async () => {
  await browser?.close()
  await reference?.stop()
})

async function open(path: string, javaScriptEnabled = true, storageState?: BrowserContextOptions['storageState']): Promise<{ page: Page, context: BrowserContext }> {
  if (!browser) {
    throw new Error('no browser')
  }

  const context = await browser.newContext(storageState === undefined ? { javaScriptEnabled } : { javaScriptEnabled, storageState })

  // below the test timeout, so a missing element fails its own test instead of timing it out
  context.setDefaultTimeout(10_000)
  const page = await context.newPage()

  // networkidle lets islands and hydrated pages wire their handlers before a test clicks
  await page.goto(base + path, { waitUntil: javaScriptEnabled ? 'networkidle' : 'load' })

  return { page, context }
}

async function withPage(path: string, run: (page: Page) => Promise<void>, javaScriptEnabled = true): Promise<void> {
  const { page, context } = await open(path, javaScriptEnabled)

  try {
    await run(page)
  }
  finally {
    await context.close()
  }
}

const pathOf = (href: string | null): string => new URL(href ?? '', base).pathname.replace(trailingSlash, '$1')

async function hrefs(links: Locator): Promise<string[]> {
  return Promise.all((await links.all()).map(async link => pathOf(await link.getAttribute('href'))))
}

// Typographic quotes count as straight ones: Astro's Markdown turns ' into a curly quote by default, which the spec does not forbid
const plain = (text: string): string => text.replaceAll(curlySingle, '\'').replaceAll(curlyDouble, '"')

const texts = async (locator: Locator): Promise<string[]> => (await locator.allTextContents()).map(text => plain(text.trim()))

// A cross-document view transition, such as kay's starter CSS enables, covers the page until it ends, and under automation it only advances while the page is left idle, so a click waits it out
async function click(locator: Locator): Promise<void> {
  await locator.page().evaluate(async () => {
    await (document as Document & { activeViewTransition?: ViewTransition | null }).activeViewTransition?.finished
  })
  await locator.click()
}

const h1 = (page: Page): Locator => page.getByRole('heading', { level: 1 })

async function poll<T>(read: () => Promise<T>, expected: T): Promise<void> {
  const deadline = Date.now() + 5000
  let last = await read()

  while (!Bun.deepEquals(last, expected) && Date.now() < deadline) {
    await Bun.sleep(100)
    last = await read()
  }

  expect<T>(last).toEqual(expected)
}

describeSite('layout', () => {
  const pages = [
    { path: '/', current: [] },
    { path: '/books', current: ['Books'] },
    { path: '/books/frankenstein', current: ['Books'] },
    { path: '/about', current: ['About'] },
    { path: '/contact', current: ['Contact'] },
    { path: '/no-such-page', current: [] },
  ]

  for (const { path, current } of pages) {
    test(`${path} has the header, nav and footer`, async () => {
      await withPage(path, async (page) => {
        expect(pathOf(await page.getByRole('banner').getByRole('link', { name: 'Bookshelf', exact: true }).getAttribute('href'))).toBe('/')
        const nav = page.getByRole('navigation', { name: 'Main' })

        expect(await texts(nav.getByRole('link'))).toEqual(['Books', 'About', 'Contact'])
        expect(await hrefs(nav.getByRole('link'))).toEqual(['/books', '/about', '/contact'])
        expect(await texts(nav.locator('[aria-current="page"]'))).toEqual(current)
        expect(await page.getByRole('contentinfo').textContent()).toContain('© Bookshelf')
        expect(await page.getByRole('main').count()).toBe(1)
      })
    }, timeout)
  }
})

describeSite('home', () => {
  test('shows the intro and the three top rated books in order', async () => {
    await withPage('/', async (page) => {
      expect(await page.title()).toBe('Bookshelf')
      expect(await texts(h1(page))).toEqual(['Bookshelf'])
      expect(await page.getByText('A small catalog of classic books.', { exact: true }).isVisible()).toBe(true)
      expect(await texts(page.getByRole('heading', { level: 2, name: 'Top rated' }))).toEqual(['Top rated'])
      const links = page.getByRole('main').locator('ol').getByRole('link')
      const top = topRated(books)

      expect(await texts(links)).toEqual(top.map(book => book.title))
      expect(await hrefs(links)).toEqual(top.map(book => `/books/${book.slug}`))
    })
  }, timeout)
})

describeSite('books', () => {
  const items = (page: Page): Locator => page.getByRole('list', { name: 'Books' }).locator(':scope > li')
  const visibleTitles = async (page: Page): Promise<string[]> =>
    texts(items(page).filter({ visible: true }).getByRole('link'))

  test('lists every book by title with its author and year', async () => {
    await withPage('/books', async (page) => {
      expect(await page.title()).toBe('Books | Bookshelf')
      expect(await texts(h1(page))).toEqual(['All books'])
      expect(await items(page).count()).toBe(books.length)
      expect(await visibleTitles(page)).toEqual(books.map(book => book.title))
      expect(await hrefs(items(page).getByRole('link'))).toEqual(books.map(book => `/books/${book.slug}`))
      for (const [index, book] of books.entries()) {
        expect(await items(page).nth(index).textContent()).toContain(`${book.author}, ${book.year}`)
      }
    })
  }, timeout)

  test('filters by tag in the browser', async () => {
    await withPage('/books', async (page) => {
      const buttons = page.getByRole('main').locator('button[aria-pressed]')

      expect(await texts(buttons)).toEqual(['All', ...allTags(books)])
      expect(await buttons.first().getAttribute('aria-pressed')).toBe('true')
      const requests: string[] = []

      page.on('request', (request) => {
        if (request.resourceType() === 'document') {
          requests.push(request.url())
        }
      })
      for (const tag of ['sea', 'gothic']) {
        await click(page.getByRole('button', { name: tag, exact: true }))
        await poll(async () => visibleTitles(page), books.filter(book => book.tags.includes(tag)).map(book => book.title))
        await poll(async () => page.getByRole('button', { name: tag, exact: true }).getAttribute('aria-pressed'), 'true')
        expect(await page.getByRole('button', { name: 'All', exact: true }).getAttribute('aria-pressed')).toBe('false')
      }
      await click(page.getByRole('button', { name: 'All', exact: true }))
      await poll(async () => visibleTitles(page), books.map(book => book.title))
      expect(requests).toEqual([])
    })
  }, timeout)
})

describeSite('book pages', () => {
  for (const book of books) {
    test(`/books/${book.slug} shows the book`, async () => {
      await withPage(`/books/${book.slug}`, async (page) => {
        expect(await page.title()).toBe(`${book.title} | Bookshelf`)
        expect(await texts(h1(page))).toEqual([book.title])
        const main = page.getByRole('main')

        for (const line of [`by ${book.author}`, `Published in ${book.year}`, `Rating: ${book.rating}/5`]) {
          expect(await main.getByText(line, { exact: true }).count()).toBeGreaterThan(0)
        }
        for (const tag of book.tags) {
          expect(await hrefs(main.getByRole('link', { name: tag, exact: true }))).toContain('/books')
        }
        expect(await texts(main.getByRole('heading', { level: 2 }))).toContain('Why read it')
        const bold = boldText.exec(book.body)?.[1] ?? ''

        expect(await texts(main.locator('strong'))).toContain(bold)
        const end = book.body.indexOf('\n\n')
        const firstParagraph = end === -1 ? book.body : book.body.slice(0, end)

        expect(plain(await main.textContent() ?? '')).toContain(firstParagraph)
      })
    }, timeout)
  }
})

describeSite('favorites', () => {
  test('toggle on the book page, survive a reload and show on the books list', async () => {
    let { page, context } = await open('/books/dracula')

    // Next.js's router re-requests its cached prefetches on a second visit in one context and never finishes them, so networkidle never comes: each later visit opens a new context carrying the cookies and localStorage, as a reload keeps them
    const visit = async (path: string): Promise<void> => {
      const storageState = await context.storageState()

      await context.close();
      ({ page, context } = await open(path, true, storageState))
    }

    try {
      const marks = async (): Promise<string[]> =>
        texts(page.getByRole('list', { name: 'Books' }).locator(':scope > li').filter({ visible: true }).filter({ has: page.getByText('Favorite', { exact: true }).filter({ visible: true }) }).getByRole('link'))

      await click(page.getByRole('button', { name: 'Add to favorites', exact: true }))
      await page.getByRole('button', { name: 'Remove from favorites', exact: true }).waitFor()
      await visit('/books/dracula')
      await page.getByRole('button', { name: 'Remove from favorites', exact: true }).waitFor()
      await visit('/books')
      await poll(marks, ['Dracula'])
      await visit('/books/dracula')
      await click(page.getByRole('button', { name: 'Remove from favorites', exact: true }))
      await page.getByRole('button', { name: 'Add to favorites', exact: true }).waitFor()
      await visit('/books')
      await poll(marks, [])
    }
    finally {
      await context.close()
    }
  }, timeout)
})

describeSite('about', () => {
  test('shows its text', async () => {
    await withPage('/about', async (page) => {
      expect(await page.title()).toBe('About | Bookshelf')
      expect(await texts(h1(page))).toEqual(['About'])
      expect(await page.getByText('Bookshelf lists a few classic books worth reading.', { exact: true }).isVisible()).toBe(true)
    })
  }, timeout)
})

describeSite('contact', () => {
  const errors = {
    name: 'Name is required.',
    email: 'Email is required.',
    emailFormat: 'Enter a valid email address.',
    message: 'Message must be at least 20 characters.',
  }
  // a design may repeat a message, in a summary or a live region, so one visible match is enough
  const shown = async (page: Page, text: string): Promise<boolean> => await page.getByText(text, { exact: true }).filter({ visible: true }).count() > 0
  const appears = async (page: Page, text: string): Promise<void> => page.getByText(text, { exact: true }).filter({ visible: true }).first().waitFor()
  const send = async (page: Page): Promise<void> => click(page.getByRole('button', { name: 'Send', exact: true }))

  async function fill(page: Page, name: string, email: string, message: string): Promise<void> {
    await page.getByLabel('Name', { exact: true }).fill(name)
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Message', { exact: true }).fill(message)
  }

  test('has the form', async () => {
    await withPage('/contact', async (page) => {
      expect(await page.title()).toBe('Contact | Bookshelf')
      expect(await texts(h1(page))).toEqual(['Contact'])
      expect(await page.locator('form[novalidate]').count()).toBe(1)
      expect(await page.getByLabel('Message', { exact: true }).evaluate(element => element.tagName)).toBe('TEXTAREA')
      expect(await page.getByLabel('Email', { exact: true }).getAttribute('type')).toBe('email')
    })
  }, timeout)

  test('validates on the server without JavaScript', async () => {
    await withPage('/contact', async (page) => {
      await send(page)
      await appears(page, errors.name)
      for (const text of [errors.name, errors.email, errors.message]) {
        expect(await shown(page, text)).toBe(true)
      }

      await fill(page, 'Ada', 'not-an-email', 'Too short')
      await send(page)
      await appears(page, errors.emailFormat)
      expect(await shown(page, errors.message)).toBe(true)
      expect(await shown(page, errors.name)).toBe(false)
      expect(await page.getByLabel('Name', { exact: true }).inputValue()).toBe('Ada')
      expect(await page.getByLabel('Email', { exact: true }).inputValue()).toBe('not-an-email')
      expect(await page.getByLabel('Message', { exact: true }).inputValue()).toBe('Too short')

      await fill(page, '  Ada Lovelace ', 'ada@example.com', 'I would like to suggest a book for the shelf.')
      await send(page)
      await appears(page, 'Thanks, Ada Lovelace! Your message has been sent.')
    }, false)
  }, timeout)

  test('validates in the browser before sending', async () => {
    await withPage('/contact', async (page) => {
      const posts: string[] = []

      page.on('request', (request) => {
        if (request.method() === 'POST') {
          posts.push(request.url())
        }
      })
      await fill(page, ' ', 'ada@', 'Too short')
      await send(page)
      await appears(page, errors.name)
      expect(await shown(page, errors.emailFormat)).toBe(true)
      expect(await shown(page, errors.message)).toBe(true)
      expect(posts).toEqual([])

      await fill(page, 'Ada', 'ada@example.com', 'I would like to suggest a book for the shelf.')
      await send(page)
      await appears(page, 'Thanks, Ada! Your message has been sent.')
    })
  }, timeout)
})

describeSite('not found', () => {
  for (const path of ['/books/no-such-book', '/no-such-page']) {
    test(`${path} answers 404 with the 404 page`, async () => {
      expect((await fetch(base + path)).status).toBe(404)
      await withPage(path, async (page) => {
        expect(await page.title()).toBe('Not found | Bookshelf')
        expect(await texts(h1(page))).toEqual(['Not found'])
        expect(await hrefs(page.getByRole('link', { name: 'Back to the books', exact: true }))).toEqual(['/books'])
      })
    }, timeout)
  }
})
