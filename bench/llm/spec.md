# Bookshelf

Bookshelf is a small catalog of classic books. Build it in this project with its framework. Every text below in quotes is exact: same words, same case, same punctuation. Styling is free and is not judged.

## Content

The books are the Markdown files in `content/books/`, one per book. A book's slug is its file name without `.md`, for example `frankenstein`. The frontmatter holds `title`, `author`, `year` (a number), `rating` (a number from 1 to 5) and `tags` (a list of strings). The body is Markdown and is rendered as HTML on the book's page: headings, paragraphs and bold text included.

Read the books as a content collection, the way the framework does it. The files may move to wherever the framework expects content, but their text must not change. Adding a book means adding a file, with no other edit.

## Layout

Every page, the 404 page included, shares one layout:

- A header holding a link "Bookshelf" to `/`, and a `nav` element labelled "Main" (`aria-label="Main"`) with three links in this order: "Books" to `/books`, "About" to `/about`, "Contact" to `/contact`.
- The nav link of the current section has `aria-current="page"`: "Books" on `/books` and on every book page, "About" on `/about`, "Contact" on `/contact`, none elsewhere.
- A footer with the text "© Bookshelf".
- A `main` element holding the page's own content.

## Pages

Page titles (the document `<title>`) are given with each page.

### Home, `/`

- Title "Bookshelf".
- An `h1` "Bookshelf", then a paragraph "A small catalog of classic books."
- An `h2` "Top rated", then an ordered list (`ol`) of the 3 best rated books, each item a link to the book's page whose text is the book's title. Order: rating, highest first, ties broken by title from A to Z.

### Books, `/books`

- Title "Books | Bookshelf".
- An `h1` "All books".
- A tag filter: a group of buttons, first "All", then one button per tag used by any book, labelled with the tag, tags sorted from A to Z. The selected button has `aria-pressed="true"`, the others `aria-pressed="false"`. "All" is selected when the page loads. Clicking a tag button selects it and shows only the books carrying that tag; clicking "All" shows every book again. Filtering happens in the browser, without reloading the page.
- A list (`ul`) labelled "Books" (`aria-label="Books"`) with one `li` per book, sorted by title from A to Z. Each `li` holds a link to the book's page whose text is the book's title, and the text "{author}, {year}", for example "Mary Shelley, 1818". A book hidden by the filter is removed from the list or hidden from view.
- A book marked as a favorite (see the book page) shows the text "Favorite" in its `li`; other books do not show it.

### Book, `/books/{slug}`

- Title "{title} | Bookshelf".
- An `h1` with the book's title.
- Each on an element of its own: "by {author}", "Published in {year}", "Rating: {rating}/5".
- The book's tags, each as a link to `/books`.
- The book's body rendered as HTML.
- A favorite button: "Add to favorites" when the book is not a favorite, "Remove from favorites" when it is. Clicking it toggles the book's favorite state, which is kept in the browser (for example in `localStorage`) and survives a reload. The books list reads the same state for its "Favorite" marks.
- A slug that matches no book answers with the 404 page.

### About, `/about`

- Title "About | Bookshelf".
- An `h1` "About", then a paragraph "Bookshelf lists a few classic books worth reading."

### Contact, `/contact`

- Title "Contact | Bookshelf".
- An `h1` "Contact".
- A form posting to the server, with three fields, each with a visible `label`: "Name" (a text input), "Email" (an email input), "Message" (a `textarea`), and a submit button "Send". The form carries `novalidate`, so the browser's own validation never blocks it.
- The same rules are checked on the server and in the browser, on trimmed values:
  - Name empty: "Name is required."
  - Email empty: "Email is required."
  - Email not matching `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`: "Enter a valid email address."
  - Message shorter than 20 characters: "Message must be at least 20 characters."
- Each error message shows as text next to its field. When several fields are wrong, every message shows at once.
- Without JavaScript, the form posts to the server, which answers with the page showing the errors and the values that were sent back in their fields, or the success message.
- With JavaScript, an invalid form shows its errors without sending anything to the server; a valid one is sent and the success message shows.
- Success message: "Thanks, {name}! Your message has been sent." where `{name}` is the trimmed name. Nothing needs to be stored.

### Not found

- Any path that matches no page, and any unknown book slug, answers with HTTP status 404 and the 404 page.
- Title "Not found | Bookshelf".
- An `h1` "Not found", then a link "Back to the books" to `/books`.

## Commands

- `bun run check` type-checks the project and passes with no errors.
- `bun run build` builds it for production.
- `bun run start` serves the production build on the port given in the `PORT` environment variable.
