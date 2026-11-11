// Grows a chart's bars once, the first time it comes into view.
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view')
      observer.unobserve(entry.target)
    }
  }
}, { threshold: 0.5 })

for (const chart of document.querySelectorAll('.chart'))
  observer.observe(chart)

// Marks in the contents the section being read: the last one whose heading has passed the top third of the screen.
const links = [...document.querySelectorAll('.toc a')]
const headings = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1))))
let queued = false

function mark() {
  queued = false
  let current = -1

  for (const [i, heading] of headings.entries()) {
    if (heading && heading.getBoundingClientRect().top < innerHeight / 3)
      current = i
  }

  for (const [i, link] of links.entries()) {
    if (i === current)
      link.setAttribute('aria-current', 'location')
    else
      link.removeAttribute('aria-current')
  }
}

if (links.length > 0) {
  addEventListener('scroll', () => {
    if (!queued) {
      queued = true
      requestAnimationFrame(mark)
    }
  }, { passive: true })
  mark()
}

// Opens a post's images full screen from a click, and steps through them with the buttons or the arrow keys.
const gallery = document.querySelector('dialog.gallery')
const figure = gallery.querySelector('.gallery-figure')
const count = gallery.querySelector('.gallery-count')
const steps = [...gallery.querySelectorAll('.gallery-step')]
const images = [...document.querySelectorAll('.prose img')].filter(image => !image.closest('a') && Number(image.getAttribute('width')) >= 200)
let shown = 0

function show(index) {
  shown = (index + images.length) % images.length
  const source = images[shown]
  const full = document.createElement('img')

  if (source.srcset) {
    full.srcset = source.srcset
    full.sizes = '100vw'
  }

  full.src = source.currentSrc || source.src
  full.alt = source.alt
  full.width = Number(source.getAttribute('width'))
  full.height = Number(source.getAttribute('height'))

  const caption = document.createElement('figcaption')

  caption.textContent = source.alt
  figure.replaceChildren(full, caption)
  count.textContent = `${shown + 1} / ${images.length}`
}

for (const [index, image] of images.entries()) {
  const open = document.createElement('button')

  open.type = 'button'
  open.className = 'gallery-open'
  image.replaceWith(open)
  open.append(image)
  open.addEventListener('click', () => {
    show(index)
    gallery.showModal()
  })
}

for (const element of [...steps, count])
  element.hidden = images.length < 2

for (const step of steps)
  step.addEventListener('click', () => show(shown + Number(step.dataset.step)))

gallery.querySelector('.gallery-close').addEventListener('click', () => gallery.close())

// A click beside the image closes, as does Escape, which the dialog handles itself.
gallery.addEventListener('click', (event) => {
  if (event.target === gallery || event.target === figure)
    gallery.close()
})

gallery.addEventListener('keydown', (event) => {
  if (images.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight'))
    show(shown + (event.key === 'ArrowLeft' ? -1 : 1))
})
