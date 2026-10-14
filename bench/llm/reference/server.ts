import type { Book } from '../lib/books'
// The spec built with Bun alone: proves the acceptance suite passes on a site that meets it, and that the suite does not lean on any framework.
import process from 'node:process'
import { allTags, loadBooks, topRated } from '../lib/books'

const books = await loadBooks()

function escape(text: string): string {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

type Section = 'books' | 'about' | 'contact' | undefined

// One script for every page: favorites, the tag filter and the contact form's checks
const clientScript = `
const key = 'bookshelf-favorites'
const favorites = () => new Set(JSON.parse(localStorage.getItem(key) ?? '[]'))
const favoriteButton = document.querySelector('[data-favorite]')
if (favoriteButton) {
  const slug = favoriteButton.dataset.favorite
  const render = () => { favoriteButton.textContent = favorites().has(slug) ? 'Remove from favorites' : 'Add to favorites' }
  favoriteButton.addEventListener('click', () => {
    const set = favorites()
    set.has(slug) ? set.delete(slug) : set.add(slug)
    localStorage.setItem(key, JSON.stringify([...set]))
    render()
  })
  render()
}
for (const item of document.querySelectorAll('[data-slug]')) {
  item.querySelector('.favorite').hidden = !favorites().has(item.dataset.slug)
}
for (const button of document.querySelectorAll('[data-tag]')) {
  button.addEventListener('click', () => {
    const tag = button.dataset.tag
    for (const other of document.querySelectorAll('[data-tag]')) other.setAttribute('aria-pressed', String(other === button))
    for (const item of document.querySelectorAll('[data-slug]')) item.hidden = tag !== '' && !item.dataset.tags.split(' ').includes(tag)
  })
}
const form = document.querySelector('form[data-contact]')
if (form) {
  form.addEventListener('submit', event => {
    const errors = (${validate.toString()})(Object.fromEntries(new FormData(form)))
    for (const field of ['name', 'email', 'message']) form.querySelector('#' + field + '-error').textContent = errors[field] ?? ''
    if (Object.keys(errors).length > 0) event.preventDefault()
  })
}
`

function layout(title: string, section: Section, main: string): string {
  const link = (href: string, label: string, name: Section): string =>
    `<a href="${href}"${section === name ? ' aria-current="page"' : ''}>${label}</a>`

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(title)}</title></head><body>
<header><a href="/">Bookshelf</a><nav aria-label="Main">${link('/books', 'Books', 'books')} ${link('/about', 'About', 'about')} ${link('/contact', 'Contact', 'contact')}</nav></header>
<main>${main}</main>
<footer>© Bookshelf</footer>
<script>${clientScript}</script>
</body></html>`
}

function validate(values: Record<string, unknown>): Record<string, string> {
  const name = String(values.name ?? '').trim()
  const email = String(values.email ?? '').trim()
  const message = String(values.message ?? '').trim()
  const errors: Record<string, string> = {}

  if (name === '') {
    errors.name = 'Name is required.'
  }

  if (email === '') {
    errors.email = 'Email is required.'
  }
  // eslint-disable-next-line e18e/prefer-static-regex -- the browser runs this function from its source, which sees nothing of this module
  else if (!(/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/).test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (message.length < 20) {
    errors.message = 'Message must be at least 20 characters.'
  }

  return errors
}

const bookLink = (book: Book): string => `<a href="/books/${book.slug}">${escape(book.title)}</a>`

function home(): string {
  return layout('Bookshelf', undefined, `<h1>Bookshelf</h1><p>A small catalog of classic books.</p>
<h2>Top rated</h2><ol>${topRated(books).map(book => `<li>${bookLink(book)}</li>`).join('')}</ol>`)
}

function list(): string {
  const tags = ['', ...allTags(books)]
  const buttons = tags.map(tag => `<button type="button" data-tag="${tag}" aria-pressed="${tag === ''}">${tag || 'All'}</button>`)
  const items = books.map(book => `<li data-slug="${book.slug}" data-tags="${book.tags.join(' ')}">${bookLink(book)} <span>${escape(book.author)}, ${book.year}</span> <span class="favorite" hidden>Favorite</span></li>`)

  return layout('Books | Bookshelf', 'books', `<h1>All books</h1><div role="group" aria-label="Tags">${buttons.join(' ')}</div><ul aria-label="Books">${items.join('')}</ul>`)
}

function bookPage(book: Book): string {
  return layout(`${book.title} | Bookshelf`, 'books', `<h1>${escape(book.title)}</h1>
<p>by ${escape(book.author)}</p><p>Published in ${book.year}</p><p>Rating: ${book.rating}/5</p>
<p>${book.tags.map(tag => `<a href="/books">${tag}</a>`).join(' ')}</p>
${Bun.markdown.html(book.body)}
<button type="button" data-favorite="${book.slug}">Add to favorites</button>`)
}

function contact(values: Record<string, string> = {}, errors: Record<string, string> = {}, sent?: string): string {
  if (sent !== undefined) {
    return layout('Contact | Bookshelf', 'contact', `<h1>Contact</h1><p>Thanks, ${escape(sent)}! Your message has been sent.</p>`)
  }

  const field = (name: string, label: string, control: string): string =>
    `<p><label for="${name}">${label}</label>${control}<span id="${name}-error">${errors[name] ?? ''}</span></p>`
  const value = (name: string): string => escape(values[name] ?? '')

  return layout('Contact | Bookshelf', 'contact', `<h1>Contact</h1><form method="post" action="/contact" novalidate data-contact>
${field('name', 'Name', `<input id="name" name="name" type="text" value="${value('name')}">`)}
${field('email', 'Email', `<input id="email" name="email" type="email" value="${value('email')}">`)}
${field('message', 'Message', `<textarea id="message" name="message">${value('message')}</textarea>`)}
<button type="submit">Send</button></form>`)
}

function notFound(): Response {
  return html(layout('Not found | Bookshelf', undefined, '<h1>Not found</h1><a href="/books">Back to the books</a>'), 404)
}

function html(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } })
}

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  hostname: process.env.HOST ?? '127.0.0.1',
  async fetch(request) {
    const { pathname } = new URL(request.url)

    if (pathname === '/contact' && request.method === 'POST') {
      const values = Object.fromEntries([...(await request.formData()).entries()].map(([k, v]) => [k, String(v)]))
      const errors = validate(values)

      return Object.keys(errors).length > 0 ? html(contact(values, errors), 400) : html(contact({}, {}, (values.name ?? '').trim()))
    }

    if (request.method !== 'GET') {
      return new Response(null, { status: 405 })
    }

    if (pathname === '/') {
      return html(home())
    }

    if (pathname === '/books') {
      return html(list())
    }

    if (pathname === '/about') {
      return html(layout('About | Bookshelf', 'about', '<h1>About</h1><p>Bookshelf lists a few classic books worth reading.</p>'))
    }

    if (pathname === '/contact') {
      return html(contact())
    }

    const book = books.find(entry => `/books/${entry.slug}` === pathname)

    return book ? html(bookPage(book)) : notFound()
  },
})

console.log(`Listening on ${server.url.href}`)
