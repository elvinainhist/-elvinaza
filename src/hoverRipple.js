import { ref } from 'vue'

// Drives one or more SVG feDisplacementMap elements toward a target ripple
// intensity on hover/leave, easing smoothly in both directions. Also, if
// offset ids are given, shifts the underlying turbulence noise to track the
// cursor position within the hovered element.
//
// `active` (returned below) tracks whether the scale is currently
// meaningfully non-zero — callers bind their element's `filter` CSS
// property to it instead of leaving `filter: url(#...)` on permanently.
// This matters a lot more than it looks: Safari/WebKit throttles
// requestAnimationFrame page-wide by roughly 20x (confirmed by measuring
// raw rAF cadence with and without it) whenever ANY element has a `filter`
// referencing an SVG filter applied, REGARDLESS of whether that filter is
// actively animating — a fully-settled scale="0" still pays the cost. On
// Chromium there's no such penalty, which is why this went unnoticed for
// so long: every real device this site was tested on is WebKit-based
// (Safari, and every other iOS browser, since iOS requires them all to be)
// while all the automated verification during development ran on
// Chromium.
export function createHoverRipple(displacementIds, offsetIds = [], intensity = 38) {
  const ids = Array.isArray(displacementIds) ? displacementIds : [displacementIds]
  const offsets = Array.isArray(offsetIds) ? offsetIds : [offsetIds]
  // Mobile plays this at 3x speed — matches the site's own mobile breakpoint.
  const easingRate = Math.min(0.12 * (window.matchMedia('(max-width: 767px)').matches ? 3 : 1), 1)
  let target = 0
  let current = 0
  let rafId = null
  const active = ref(false)

  function loop() {
    current += (target - current) * easingRate
    const value = current > 0.05 ? current.toFixed(2) : '0'
    ids.forEach((id) => {
      document.getElementById(id)?.setAttribute('scale', value)
    })
    active.value = value !== '0'

    if (Math.abs(target - current) > 0.05) {
      rafId = requestAnimationFrame(loop)
    } else {
      rafId = null
    }
  }

  function start() {
    if (!rafId) rafId = requestAnimationFrame(loop)
  }

  return {
    active,
    enter: () => {
      target = intensity
      active.value = true
      start()
    },
    leave: () => {
      target = 0
      start()
    },
    move: (event) => {
      const el = event.currentTarget
      if (!el) return
      const rect = el.getBoundingClientRect()
      const relX = (event.clientX - rect.left) / rect.width
      const relY = (event.clientY - rect.top) / rect.height

      // Drives any CSS (e.g. `calc(var(--mx) * ...)`) that wants raw 0..1
      // cursor position within the hovered element, alongside the ripple.
      el.style.setProperty('--mx', relX.toFixed(3))
      el.style.setProperty('--my', relY.toFixed(3))

      if (!offsets.length) return
      const dx = (relX - 0.5) * 40
      const dy = (relY - 0.5) * 40
      offsets.forEach((id) => {
        const node = document.getElementById(id)
        if (node) {
          node.setAttribute('dx', dx.toFixed(1))
          node.setAttribute('dy', dy.toFixed(1))
        }
      })
    },
  }
}

// Plays a one-shot ripple burst the first time `el` scrolls into view
// (or immediately if it's already visible on load), then eases back out.
export function attachLoadRipple(el, ripple, holdMs) {
  if (!el) return
  if (holdMs === undefined) {
    holdMs = window.matchMedia('(max-width: 767px)').matches ? 117 : 350
  }

  const play = () => {
    ripple.enter()
    setTimeout(() => ripple.leave(), holdMs)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          play()
          observer.unobserve(el)
        }
      })
    },
    { threshold: 0.2 },
  )
  observer.observe(el)
}
