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
