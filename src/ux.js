const EXIT_DURATION_MS = 360
const FORCE_MOTION = true

export function initPageUx() {
  if (FORCE_MOTION) {
    document.body.classList.add('force-motion')
  }
  highlightActiveNav()
  initPageTransition()
  initMobileNav()
  initRevealBlocks()
  initLiveButtons()
}

function highlightActiveNav() {
  const page = document.body.dataset.page
  if (!page) return
  const activeLink = document.querySelector(`[data-nav="${page}"]`)
  activeLink?.classList.add('active')
}

function initPageTransition() {
  requestAnimationFrame(() => {
    document.body.classList.add('page-enter')
  })

  const reduceMotion = prefersReducedMotion()
  const links = document.querySelectorAll('a[data-transition]')
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href')
      if (!href) return

      const targetUrl = new URL(href, window.location.origin)
      const samePage = targetUrl.pathname === window.location.pathname
      if (samePage || reduceMotion) return

      event.preventDefault()
      document.body.classList.add('page-exit')

      window.setTimeout(() => {
        window.location.assign(targetUrl.pathname + targetUrl.search + targetUrl.hash)
      }, EXIT_DURATION_MS)
    })
  })
}

function initMobileNav() {
  const header = document.querySelector('.floating-nav')
  const toggle = document.querySelector('.nav-toggle')
  const nav = document.querySelector('.nav-links')
  if (!header || !toggle || !nav) return

  const setOpen = (isOpen) => {
    header.classList.toggle('menu-open', isOpen)
    toggle.setAttribute('aria-expanded', String(isOpen))
  }

  toggle.addEventListener('click', () => {
    const openNow = header.classList.contains('menu-open')
    setOpen(!openNow)
  })

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false))
  })

  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) {
      setOpen(false)
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false)
    }
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 640) {
      setOpen(false)
    }
  })
}

function initRevealBlocks() {
  const blocks = Array.from(document.querySelectorAll('[data-reveal]'))
  if (!blocks.length) return

  const reduceMotion = prefersReducedMotion()
  blocks.forEach((block) => {
    const delay = Number(block.getAttribute('data-delay') ?? 0)
    block.style.setProperty('--reveal-delay', `${delay}ms`)
  })

  if (reduceMotion) {
    blocks.forEach((block) => block.classList.add('is-visible'))
    return
  }

  window.setTimeout(() => {
    blocks.forEach((block) => block.classList.add('is-visible'))
  }, 80)
}

function initLiveButtons() {
  const reduceMotion = prefersReducedMotion()
  if (reduceMotion) return

  const buttons = document.querySelectorAll('.btn-live')
  buttons.forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100
      button.style.setProperty('--mx', `${x}%`)
      button.style.setProperty('--my', `${y}%`)
    })
  })
}

function prefersReducedMotion() {
  if (FORCE_MOTION) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
