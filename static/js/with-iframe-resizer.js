document.addEventListener('DOMContentLoaded', () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })
  const isVaraTheme = params['docusaurus-data-theme-vara']

  const transformLinks = (links) => {
    Array.from(links).forEach(a => {
      a.setAttribute('target', '_blank')
      a.addEventListener('click', (e) => {
        e.preventDefault()
        window.open(e.target.href, '_blank')
      })
    })
  }

  const checkLinks = (interval) => {
    const anchors = document.body.querySelectorAll('main article a[href^="/docs"]')

    if (anchors.length) {
      transformLinks(anchors)
      clearInterval(interval)
    }
  }

  if (isVaraTheme) {
    const anchors = document.body.querySelectorAll('main a[href^="/docs"]')

    if (!anchors.length) {
      let count = 0
      let interval
      interval = setInterval(function () {
        if (count === 10) {
          clearInterval(interval)
          return
        }
        checkLinks(interval)
        count++
      }, 1000)
    } else transformLinks(anchors)
  }
})
