// Plays a one-shot burst through an SVG feDisplacementMap for the duration of
// an open/close transition. The envelope is shaped like the panel's own
// velocity: 'decay' hits hard as it launches and settles as it lands (open),
// 'attack' builds as it accelerates away (close).
export function playTransitionRipple(displacementId, { duration, peak, shape = 'decay' }) {
  const node = document.getElementById(displacementId)
  const reset = () => node?.setAttribute('scale', '0')

  if (!node) return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reset()
    return () => {}
  }

  // Mobile panels travel a shorter distance, so they warp less.
  const strength = peak * (window.matchMedia('(max-width: 767px)').matches ? 0.55 : 1)
  const startTime = performance.now()
  let rafId = null

  function envelope(progress) {
    if (shape === 'attack') return Math.pow(progress, 1.6)
    // Ramp to full strength over the first 12% of the move, then ease out.
    return Math.min(progress / 0.12, 1) * Math.pow(1 - progress, 1.6)
  }

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1)
    const value = strength * envelope(progress)
    node.setAttribute('scale', value > 0.05 ? value.toFixed(2) : '0')

    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      reset()
      rafId = null
    }
  }

  rafId = requestAnimationFrame(tick)

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
    reset()
  }
}
