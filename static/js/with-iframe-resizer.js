document.addEventListener('DOMContentLoaded', () => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })
  const isVaraTheme = params['docusaurus-data-theme-vara'] // Get the value of "docusaurus-data-theme-vara"

  if (isVaraTheme) {
    const anchors = document.body.querySelectorAll('main a[href^="/docs"]')

    const transformLinks = (interval) => {
      const anchors = document.body.querySelectorAll('main a[href^="/docs"]')

      if (anchors.length) {
        Array.from(anchors).forEach(a => {
          a.setAttribute('target', '_blank')
          a.addEventListener('click', (e) => {
            e.preventDefault()
            window.open(e.target.href, '_blank')
          })
        })
        clearInterval(interval)
      }
    }

    if (!anchors.length) {
      let count = 0
      let interval
      interval = setInterval(function () {
        if (count === 10) {
          clearInterval(interval)
          return
        }
        transformLinks(interval)
        count++
      }, 1000)
    }
  }
})
