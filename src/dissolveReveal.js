// Animates a <feComponentTransfer><feFuncA> threshold (identified by
// `thresholdId`) from fully-hidden to fully-revealed and back — the same
// organic, patchy growth used for the Hero photo flip (see Hero.vue), reused
// here to shape a hover warp so it spreads out from patches instead of
// covering the whole image evenly. Requires a filter built like:
//
//   <feTurbulence type="fractalNoise" .../>
//   <feColorMatrix type="luminanceToAlpha" result="noise-alpha" />
//   <feComponentTransfer in="noise-alpha" result="reveal-mask">
//     <feFuncA id="<thresholdId>" type="linear" slope="S" intercept="-S" />
//   </feComponentTransfer>
//
// Applied as a normal `filter` (not a CSS `mask`) — a CSS mask's nested
// filter primitives don't repaint on setAttribute in Chromium, only a
// filter chained directly on the element does.
export function createDissolveReveal(thresholdId, options = {}) {
  const { slope = 2.5, duration = 500 } = options

  let progress = 0
  let animId = null

  function setProgress(p) {
    progress = p
    // The linear ramp only asymptotically saturates — overshoot right at
    // 0/1 so it actually reaches fully clear/fully solid, not a permanent
    // faint residue.
    const intercept = p <= 0 ? -slope * 6 : p >= 1 ? slope : slope * (p - 1)
    document.getElementById(thresholdId)?.setAttribute('intercept', intercept.toFixed(3))
  }

  function animateTo(target, dur) {
    if (animId) cancelAnimationFrame(animId)
    const start = performance.now()
    const from = progress
    function tick(now) {
      const t = Math.min(Math.max((now - start) / dur, 0), 1)
      // Linear, not eased: an ease-out front-loads almost the whole reveal
      // into the first frames, so the organic growth barely reads.
      setProgress(from + (target - from) * t)
      animId = t < 1 ? requestAnimationFrame(tick) : null
    }
    animId = requestAnimationFrame(tick)
  }

  return {
    enter: () => animateTo(1, duration),
    leave: () => animateTo(0, duration),
  }
}
