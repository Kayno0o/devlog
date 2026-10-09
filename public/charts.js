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
