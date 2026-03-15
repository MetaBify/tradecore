const EXIT_DURATION_MS = 360
const FORCE_MOTION = true

export function initPageUx() {
  if (FORCE_MOTION) {
    document.body.classList.add('force-motion')
  }
  highlightActiveNav()
  initPageTransition()
  initMobileNav()
  initNavWarp()
  initRevealBlocks()
  initLiveButtons()
  initContactModal()
  initSmoothWheel()
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

function initNavWarp() {
  const nav = document.querySelector('.floating-nav')
  if (!nav) return

  nav.addEventListener('pointermove', (event) => {
    const rect = nav.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    nav.style.setProperty('--warp-x', `${x}%`)
    nav.style.setProperty('--warp-y', `${y}%`)
  })

  nav.addEventListener('pointerleave', () => {
    nav.style.setProperty('--warp-x', '50%')
    nav.style.setProperty('--warp-y', '50%')
  })
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

function initContactModal() {
  const backdrop = document.querySelector('.modal-backdrop')
  if (!backdrop) return
  const modal = backdrop.querySelector('[data-modal="risk"]')
  const acceptBtn = backdrop.querySelector('[data-modal-accept]')
  const readLink = backdrop.querySelector('[data-modal-link]')
  const contactLinks = document.querySelectorAll(
    'a[data-nav="contact"], a[href="/contact.html"], a[href$="/contact.html"]'
  )

  let pendingHref = null

  const openModal = (href) => {
    pendingHref = href || '/contact.html'
    backdrop.classList.add('is-visible')
    backdrop.setAttribute('aria-hidden', 'false')
  }

  const closeModal = () => {
    pendingHref = null
    backdrop.classList.remove('is-visible')
    backdrop.setAttribute('aria-hidden', 'true')
  }

  contactLinks.forEach((link) => {
    link.addEventListener(
      'click',
      (event) => {
        const href = link.getAttribute('href') || link.href || '/contact.html'
        if (!href || window.location.pathname === '/contact.html') return
        event.preventDefault()
        event.stopImmediatePropagation()
        openModal(href)
      },
      true // capture so we pre-empt page-transition handler
    )
  })

  acceptBtn?.addEventListener('click', () => {
    if (pendingHref) {
      window.location.assign(pendingHref)
    }
    closeModal()
  })

  readLink?.addEventListener('click', (event) => {
    event.preventDefault()
    closeModal()
    const header = document.querySelector('.floating-nav')
    const toggle = document.querySelector('.nav-toggle')
    header?.classList.remove('menu-open')
    toggle?.setAttribute('aria-expanded', 'false')

    // Jump to the top, then animate a slow smooth scroll down to the disclaimer.
    const target = document.querySelector('#risk-full')
    if (!target) return

    const details = target.querySelector('.risk-disclaimer')
    if (details && !details.hasAttribute('open')) {
      details.setAttribute('open', '')
    }

    window.scrollTo({ top: 0, behavior: 'auto' })

    window.requestAnimationFrame(() => {
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset
      const duration = 1400
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
      let startTime = null

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)
        const position = targetTop * eased
        window.scrollTo(0, position)
        if (progress < 1) {
          window.requestAnimationFrame(animate)
        }
      }

      window.requestAnimationFrame(animate)
    })
  })
}

function initSmoothWheel() {
  const reduceMotion = prefersReducedMotion()
  if (reduceMotion) return

  let target = window.pageYOffset
  let current = target
  let rafId = null

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  const animate = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    target = clamp(target, 0, maxScroll)

    current += (target - current) * 0.12
    window.scrollTo(0, current)

    if (Math.abs(target - current) > 0.5) {
      rafId = requestAnimationFrame(animate)
    } else {
      rafId = null
      current = target = window.pageYOffset
    }
  }

  const onWheel = (event) => {
    // Smooth the step while preserving scroll direction and allowing small nudges.
    event.preventDefault()
    target += event.deltaY
    if (!rafId) {
      rafId = requestAnimationFrame(animate)
    }
  }

  window.addEventListener('wheel', onWheel, { passive: false })
}

function prefersReducedMotion() {
  if (FORCE_MOTION) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
