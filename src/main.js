import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.directive('reveal', {
  mounted(el) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-revealed')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
  },
})

// Scales a fixed-px "stage" to fluidly fill its responsive parent ("frame")
// container — e.g. v-scale-stage="1280" on a 1280px-wide stage. Replaces
// `transform: scale(calc(100cqw / 1280px))`: confirmed that calc() dividing
// two lengths (cqw or plain vw, either one) to get the unitless number
// scale() needs computes to invalid/`none` in this browser, silently
// leaving every such stage completely unscaled — invisible on desktop
// (where the needed ratio is already close to 1) but very visible on
// mobile, where content rendered ~13% oversized and overflowed the
// viewport horizontally.
app.directive('scale-stage', {
  mounted(el, binding) {
    const nativeWidth = Number(binding.value)
    const frame = el.parentElement
    if (!frame || !nativeWidth) return
    const apply = () => {
      const scale = frame.getBoundingClientRect().width / nativeWidth
      if (scale > 0) el.style.transform = `scale(${scale})`
    }
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(frame)
    el._scaleStageObserver = observer
    // ResizeObserver only fires on the frame's own size *changing* — if the
    // very first apply() above landed while the frame was still mid-layout
    // (e.g. before a web font swap reflows it, seen on some real mobile
    // devices but not reproduced in desktop devtools), nothing here would
    // ever recompute it. These re-run once, after layout has fully settled.
    window.addEventListener('load', apply, { once: true })
    document.fonts?.ready?.then(apply)
  },
  unmounted(el) {
    el._scaleStageObserver?.disconnect()
  },
})

const NUMBER_RE = /-?\d+(?:[.,]\d+)?/g

app.directive('count-up', {
  mounted(el) {
    const target = el.textContent
    const matches = [...target.matchAll(NUMBER_RE)]
    if (!matches.length) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const parsed = matches.map((m) => {
      const raw = m[0]
      const sep = raw.includes(',') ? ',' : '.'
      const decimals = raw.includes(',') || raw.includes('.') ? raw.split(/[.,]/)[1].length : 0
      return { value: parseFloat(raw.replace(',', '.')), decimals, sep }
    })

    function render(progress) {
      const eased = 1 - Math.pow(1 - progress, 3)
      let i = 0
      el.textContent = target.replace(NUMBER_RE, () => {
        const p = parsed[i++]
        return (p.value * eased).toFixed(p.decimals).replace('.', p.sep)
      })
    }

    render(0)

    const duration = 1400
    let startTime = null

    function tick(ts) {
      if (startTime === null) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      render(progress)
      if (progress < 1) requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(tick)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
  },
})

app.mount('#app')
