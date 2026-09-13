// Drives the shared SVG displacement filter (#scroll-ripple-filter) so photos
// ripple in proportion to scroll speed, then ease back to flat when scrolling stops.
export function initScrollRipple() {
  const displacement = document.getElementById('scroll-ripple-displacement')
  // Projects' photos use a separate, edge-contained displacement (see
  // project-scroll-ripple-filter in Projects.vue) instead of this shared
  // one, but it's driven by the same scroll velocity computed below.
  const projectDisplacement = document.getElementById('project-scroll-ripple-displacement')
  if (!displacement) return () => {}

  // Mobile matches the site's own breakpoint: reacts 3x faster, and always
  // fully settles back to flat exactly 500ms after scrolling stops/slows.
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const attackEasing = isMobile ? 0.6 : 0.2
  const mobileReleaseMs = 500

  let lastY = window.scrollY
  let lastT = performance.now()
  let currentScale = 0
  let releaseStartScale = 0
  let releaseStartTime = null
  let rafId = requestAnimationFrame(tick)

  function tick(now) {
    const dt = Math.max(now - lastT, 1)
    const y = window.scrollY
    const velocity = (y - lastY) / dt
    lastY = y
    lastT = now

    const targetScale = Math.min(Math.abs(velocity) * 320, 65)
    const rising = targetScale > currentScale + 0.5

    if (isMobile) {
      if (rising) {
        currentScale += (targetScale - currentScale) * attackEasing
        releaseStartTime = null
      } else {
        if (releaseStartTime === null) {
          releaseStartScale = currentScale
          releaseStartTime = now
        }
        const progress = Math.min((now - releaseStartTime) / mobileReleaseMs, 1)
        currentScale = releaseStartScale * (1 - progress)
      }
    } else {
      const easing = rising ? 0.2 : 0.05
      currentScale += (targetScale - currentScale) * easing
    }

    const scaleAttr = currentScale > 0.05 ? currentScale.toFixed(2) : '0'
    displacement.setAttribute('scale', scaleAttr)
    projectDisplacement?.setAttribute('scale', scaleAttr)

    rafId = requestAnimationFrame(tick)
  }

  return () => cancelAnimationFrame(rafId)
}
