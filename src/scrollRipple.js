import { ref } from 'vue'

// Whether the shared scroll-ripple filter is currently doing anything —
// components bind their `.scroll-ripple` elements' `filter` CSS property to
// this instead of leaving `filter: url(#scroll-ripple-filter)` on
// permanently (see the comment in hoverRipple.js for why that matters: it's
// a ~20x page-wide requestAnimationFrame penalty in Safari/WebKit,
// regardless of whether the filter is actually animating). Stays false for
// this module's whole lifetime on mobile, where the loop below never even
// starts — so this alone also removes the filter there, on top of the
// velocity loop already not running.
export const scrollRippleActive = ref(false)

// Drives the shared SVG displacement filter (#scroll-ripple-filter) so photos
// ripple in proportion to scroll speed, then ease back to flat when scrolling stops.
export function initScrollRipple() {
  const displacement = document.getElementById('scroll-ripple-displacement')
  // Projects' photos use a separate, edge-contained displacement (see
  // project-scroll-ripple-filter in Projects.vue) instead of this shared
  // one, but it's driven by the same scroll velocity computed below.
  const projectDisplacement = document.getElementById('project-scroll-ripple-displacement')
  if (!displacement) return () => {}

  // Off entirely on mobile: this filter is a continuous scroll-driven
  // rewrite of a shared SVG primitive, and on real (as opposed to desktop-
  // devtools-emulated) mobile hardware that was a large, confirmed source
  // of jank — visible as content staying stuck showing blank/white while
  // scrolling and, likely as a symptom of the same main-thread starvation,
  // the Contact door/cloud briefly rendering at the wrong scale. Hover-
  // driven melt effects (the site's primary interaction) are untouched —
  // this only removes the passive, always-on scroll coupling.
  if (window.matchMedia('(max-width: 767px)').matches) return () => {}

  let lastY = window.scrollY
  let lastT = performance.now()
  let currentScale = 0
  let rafId = null

  function tick(now) {
    const dt = Math.max(now - lastT, 1)
    const y = window.scrollY
    const velocity = (y - lastY) / dt
    lastY = y
    lastT = now

    const targetScale = Math.min(Math.abs(velocity) * 320, 65)
    const rising = targetScale > currentScale + 0.5
    const easing = rising ? 0.2 : 0.05
    currentScale += (targetScale - currentScale) * easing

    const scaleAttr = currentScale > 0.05 ? currentScale.toFixed(2) : '0'
    displacement.setAttribute('scale', scaleAttr)
    projectDisplacement?.setAttribute('scale', scaleAttr)
    scrollRippleActive.value = scaleAttr !== '0'
    // Elements that just wear the plain `.scroll-ripple` class (no
    // per-component override, see style.css) read this class on <body>
    // instead of scrollRippleActive directly — cheaper than a Vue watcher
    // for something already being set once per frame right here.
    document.body.classList.toggle('scroll-ripple-active', scaleAttr !== '0')

    // Stops once fully settled (no residual scale, no fresh velocity)
    // instead of looping forever — this used to run unconditionally at
    // 60fps for the page's entire lifetime, even sitting idle, which is a
    // real cost on weaker mobile hardware: setAttribute on a shared filter
    // forces the browser to re-evaluate it on every element referencing
    // it, every frame, whether or not anything was actually changing.
    if (currentScale > 0.05 || targetScale > 0.05) {
      rafId = requestAnimationFrame(tick)
    } else {
      rafId = null
    }
  }

  function onScroll() {
    if (rafId) return
    // Resets the time reference (so `dt` below isn't some large stale gap
    // since the loop last idled) but deliberately leaves `lastY` alone: a
    // real mouse wheel scrolls in discrete jumps that complete before the
    // next animation frame even runs, so by the time this fires, scrollY
    // has already landed on its new value — resetting lastY to that same
    // value here (as an earlier version of this did) made every jump
    // measure as zero velocity on the very next tick, since there was
    // nothing left to move between "now" and "now". Leaving lastY at
    // wherever the previous tick (or page load) last left it means that
    // full jump still shows up as real, fast movement on the first tick.
    lastT = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  window.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', onScroll)
    if (rafId) cancelAnimationFrame(rafId)
  }
}
