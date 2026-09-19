<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import closeIcon from '../assets/password/close-x.svg'
import starfieldTile from '../assets/password/starfield.png'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

// Matches the CSS: desktop plays the full melt (450ms enter / 250ms
// leave), mobile is deliberately much snappier (200ms / 150ms — see the
// mobile media query) since it's been asked for as "instant" repeatedly,
// and a slower slide there visibly lags behind the keyboard's own much
// quicker native animation, reading as the sheet struggling to catch up
// rather than opening cleanly. This has to match whatever the live CSS
// transition/animation duration actually is: Vue only removes the
// enter/leave-active classes (and fires @after-enter/@after-leave) once
// this elapses, so a mismatch either cuts the CSS motion off early
// (which would also cut the melt rAF loop's own visible window short,
// unmounting the card before it's finished) or leaves classes lingering
// well past it. A function, called fresh from the template below rather
// than a value computed once here — PasswordModal is mounted
// unconditionally by App.vue from initial page load, so a plain const
// here would freeze whatever the window happened to be at first paint.
function getTransitionDuration() {
  return window.matchMedia('(min-width: 768px)').matches
    ? { enter: 450, leave: 250 }
    : { enter: 200, leave: 150 }
}

// Warm the browser's image cache so the desktop backdrop tile isn't
// decoded for the first time during the open transition.
new Image().src = starfieldTile

const digits = ref('')
const error = ref(false)
const isFocused = ref(false)
const inputRef = ref(null)
const cardRef = ref(null)

let debounceTimer = null

function sanitize(value) {
  return value.replace(/\D/g, '').slice(0, 4)
}

function clearDebounce() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

function validate() {
  clearDebounce()
  // No real password exists yet — any attempt is treated as wrong.
  error.value = true
}

function onInput(e) {
  digits.value = sanitize(e.target.value)
  e.target.value = digits.value
  if (error.value) error.value = false
  clearDebounce()
  if (digits.value.length === 4) {
    debounceTimer = setTimeout(validate, 500)
  }
}

function onFocus() {
  isFocused.value = true
}

function onBlur() {
  isFocused.value = false
  clearDebounce()
  if (digits.value.length === 4) validate()
}

function onKeydown(e) {
  if (e.key === 'Enter') validate()
}

function close() {
  emit('close')
}

function onOverlayKeydown(e) {
  if (e.key === 'Escape') close()
}

function focusInput() {
  // preventScroll matters here: the input auto-focuses while the card is
  // still animating in from translateY(100%), and without this the browser
  // sees a focused element outside the visible area and scrolls its
  // nearest scrollable ancestor (.password-modal, which has overflow-y:auto
  // on desktop) to reveal it — fighting the card's own slide-up transition
  // and reading as an erratic jitter instead of one smooth motion.
  inputRef.value?.focus({ preventScroll: true })
}

function onAfterEnter() {
  // Safety net: the real focus() that raises the keyboard happens
  // immediately on open (see the watcher below), synchronously enough to
  // stay in the same user-gesture chain. This just covers browsers where
  // that one didn't land (e.g. the input wasn't in the DOM yet).
  focusInput()
}

function onAfterLeave() {
  // Deliberately not called synchronously on close (see unlockBodyScroll's
  // own comment) — this is what actually restores it, once the leave
  // transition has genuinely finished.
  unlockBodyScroll()
}

// The open/close ripple filter (removed earlier — see the git history for
// why: Chromium stopped painting the title text after the filter's
// attribute animation stopped) and, later, a CSS @keyframes border-radius
// wobble tied to Vue's enter-active/leave-active classes (removed here)
// both turned out to be unreliable. The @keyframes version's failure mode
// was different and specific to WebKit: frame-by-frame inspection showed
// it freezing mid-interpolation at the exact moment Vue swaps
// enter-from→enter-to on the transitioning root (completely normal Vue
// transition mechanics) — even though `enter-active`, the class the
// animation is actually scoped to, never stops matching. A plain
// requestAnimationFrame loop writing the card's border-radius directly,
// below, doesn't care what classes are on any ancestor, so it can't be
// derailed by that: same pattern already proven reliable everywhere else
// on this site (hoverRipple.js, scrollRipple.js) that drives an attribute
// or style per frame instead of leaning on a declarative CSS animation.
// Checked fresh in onEnter/onLeave below, not once here at module setup:
// PasswordModal is mounted unconditionally by App.vue right from initial
// page load (only its internal modal div is v-if'd), so a value computed
// here would be frozen at whatever the window happened to be at first
// paint — stale if the window/zoom changes at all before the modal is
// ever opened.
function isDesktopMelt() {
  return window.matchMedia('(min-width: 768px)').matches
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function radiusAt(stops, t) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, r0] = stops[i]
    const [t1, r1] = stops[i + 1]
    if (t <= t1) {
      const local = t1 === t0 ? 1 : (t - t0) / (t1 - t0)
      return r0.map((v, idx) => lerp(v, r1[idx], local))
    }
  }
  return stops[stops.length - 1][1]
}

// Percentages/values mirror the old @keyframes exactly — same envelope,
// peak distortion early (matching the original SVG ripple's own timing:
// full strength by ~12% in, easing out from there).
// Amplitude pushed well past what looked right on paper — at the ~20-30fps
// this loop actually gets in practice (well short of 60fps even after the
// WebKit rAF-throttling fix; Vue's own mount/patch work right as this
// starts seems to still cost real contention), sampled frames land
// between stops more often than not, which waters down whatever peak a
// smaller swing would have hit.
const MELT_IN_STOPS = [
  [0, [60, 60, 0, 0]],
  [0.15, [0, 220, 70, 140]],
  [0.4, [200, 0, 140, 40]],
  [0.7, [40, 160, 20, 110]],
  [1, [60, 60, 0, 0]],
]
const MELT_OUT_STOPS = [
  [0, [60, 60, 0, 0]],
  [0.2, [200, 20, 120, 35]],
  [0.55, [20, 210, 40, 140]],
  [1, [60, 60, 0, 0]],
]

let meltRafId = null

function playMelt(card, stops, duration) {
  if (meltRafId) cancelAnimationFrame(meltRafId)
  const start = performance.now()
  function tick(now) {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 2) // ease-out, matches the transform transition
    const [tl, tr, br, bl] = radiusAt(stops, eased)
    card.style.borderRadius = `${tl.toFixed(1)}px ${tr.toFixed(1)}px ${br.toFixed(1)}px ${bl.toFixed(1)}px`
    if (t < 1) {
      meltRafId = requestAnimationFrame(tick)
    } else {
      meltRafId = null
      card.style.borderRadius = ''
    }
  }
  meltRafId = requestAnimationFrame(tick)
}

// Prefers the template ref (cardRef) over el.querySelector('.password-
// modal__card') — a real user's browser was observed (via a live console
// MutationObserver check) to never mutate the card's border-radius at
// all despite isDesktopMelt() correctly returning true and no thrown
// error, which points at Teleport+Transition's @enter/@leave firing
// before the teleported subtree is fully queryable from `el` yet. The
// ref, populated through Vue's own normal render/patch cycle rather than
// searched for from the hook, sidesteps that. Retrying across a few
// frames on top is a second layer of defense in case even the ref isn't
// populated the instant the hook fires.
function playMeltWhenReady(el, stops, duration, attempt = 0) {
  const card = cardRef.value || el.querySelector('.password-modal__card')
  if (card) {
    playMelt(card, stops, duration)
    return
  }
  if (attempt < 10) {
    requestAnimationFrame(() => playMeltWhenReady(el, stops, duration, attempt + 1))
  } else {
    console.warn('[PasswordModal] melt: .password-modal__card never appeared for the transition hook')
  }
}

function onEnter(el) {
  if (!isDesktopMelt()) return
  playMeltWhenReady(el, MELT_IN_STOPS, 450)
}

function onLeave(el) {
  if (!isDesktopMelt()) return
  playMeltWhenReady(el, MELT_OUT_STOPS, 250)
}

// Deliberately NOT tracking the keyboard via visualViewport (tried twice:
// once via the interactive-widget=resizes-content meta + dvh, once via
// hand-rolled visualViewport math) — both left a gap between the sheet and
// the keyboard, because neither the meta tag's shrink nor
// visualViewport.height reliably accounts for iOS's own input accessory
// bar (the Prev/Next/Done row): it sits on top of the keyboard but isn't
// consistently folded into either signal, so any offset computed from them
// undershoots by the accessory bar's height and leaves it exposed as bare
// (black) backdrop below the card.
// The fix is to stop estimating. `.password-modal__card` here just stays
// plain `position: fixed; bottom: 0` (see the mobile media query) — which
// is pinned to the TRUE device screen edge, keyboard or not, by definition
// of what fixed positioning against the layout viewport means. The card's
// own content is short enough (~416px, see the Figma reference) to always
// clear well above any real keyboard height on its own; whatever portion
// of the card's box falls below the keyboard's actual top edge — accessory
// bar included, whatever its height turns out to be — is simply hidden
// behind the (fully opaque) keyboard instead of showing through a gap,
// because the two now share the exact same anchor point instead of each
// being independently estimated.

// True scroll lock: plain `body { overflow: hidden }` still lets iOS
// Safari rubber-band-scroll the page behind a position:fixed overlay.
// Pinning the body itself in place (and restoring its scroll position on
// close) is the standard workaround.
let lockedScrollY = 0

function lockBodyScroll() {
  lockedScrollY = window.scrollY
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
}

function unlockBodyScroll() {
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  window.scrollTo(0, lockedScrollY)
}

// Called from @after-leave, not synchronously from the watcher on close:
// window.scrollTo() here, fired at the exact moment the leave transition
// starts, makes WebKit treat the card's CSS animation as already finished
// — confirmed directly (the card was gone from the DOM within ~60ms of a
// 250ms leave, animation never visibly played) and confirmed gone the
// moment scrollTo was stubbed out in the same test. Waiting until the
// transition has actually finished sidesteps it entirely; the backdrop is
// still fully covering the page for that whole window regardless of
// whether the body is technically still scroll-locked underneath it.

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      lockBodyScroll()
      digits.value = ''
      error.value = false
      isFocused.value = false
      clearDebounce()
      // Focusing synchronously off the open toggle (via nextTick, still
      // inside the same gesture chain as whatever click set `open` true)
      // is what actually raises the on-screen keyboard on mobile — see
      // onAfterEnter's comment for why waiting for the transition doesn't.
      nextTick(focusInput)
    }
    // No else branch: unlockBodyScroll() runs from @after-leave instead,
    // once the close transition has actually finished — see the comment
    // above.
  },
)

onBeforeUnmount(() => {
  if (props.open) unlockBodyScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      name="password-modal"
      :duration="getTransitionDuration()"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div v-if="open" class="password-modal" @keydown="onOverlayKeydown">
        <!-- touchend (in addition to click) on both dismiss targets below:
             the input auto-focuses on open now, so the keyboard is already
             up by the time someone taps to close — on iOS Safari, a tap
             elsewhere while a keyboard is open doesn't reliably raise a
             click event on that first tap (it can just dismiss the
             keyboard instead), needing a second tap to actually register.
             touchend fires immediately on the same tap regardless; .prevent
             stops the browser's follow-up synthetic click so close() only
             runs once. -->
        <div
          class="password-modal__backdrop"
          :style="{ '--backdrop-tile': `url(${starfieldTile})` }"
          @click="close"
          @touchend.prevent="close"
        ></div>

        <div ref="cardRef" class="password-modal__card" role="dialog" aria-modal="true">
          <div class="password-modal__topbar">
            <button
              type="button"
              class="password-modal__close"
              aria-label="Закрыть"
              @click="close"
              @touchend.prevent="close"
            >
              <img :src="closeIcon" alt="" />
            </button>
          </div>

          <div class="password-modal__body">
          <div class="password-modal__content">
            <div class="password-modal__title-block">
              <p class="password-modal__title">Скажите пароль</p>
              <p class="password-modal__subtitle">чтобы увидеть проекты</p>
            </div>

            <div class="password-modal__input-block">
              <div class="password-modal__pill" :class="{ 'password-modal__pill--error': error }">
                <input
                  ref="inputRef"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="4"
                  class="password-modal__native-input"
                  aria-label="Пароль"
                  @input="onInput"
                  @focus="onFocus"
                  @blur="onBlur"
                  @keydown="onKeydown"
                />

                <span v-for="i in 4" :key="'slot' + i" class="password-modal__slot">
                  <span v-if="digits.length >= i" class="password-modal__digit">{{ digits[i - 1] }}</span>
                  <span v-else-if="isFocused && digits.length === i - 1" class="password-modal__caret"></span>
                  <span v-else class="password-modal__dot"></span>
                </span>

                <p v-if="error" class="password-modal__error">Пароль не подходит</p>
              </div>

              <p class="password-modal__tip">
                Если нет пароля, напишите мне<br />
                <a href="https://t.me/elvinaza" target="_blank" rel="noopener">в Телеграм</a>
                или
                <a href="mailto:elvinainhist@gmail.com">на почту</a>
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.password-modal {
  position: fixed;
  inset: 0;
  /* This root only hosts the backdrop (itself position:fixed; inset:0,
     sized independently) and the card (position:fixed; bottom:0 on
     mobile, see the card's own comment) — neither actually depends on
     this element's own height, so dvh vs 100% doesn't matter here beyond
     keeping the flex centering sane on desktop. */
  height: 100dvh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.password-modal__backdrop {
  /* Flat 66% dim by default (mobile stays on this): a tiled texture's
     opacity animating means rasterizing every tile repetition on each
     repaint, real cost on weaker mobile GPUs. Desktop hardware doesn't
     feel that the same way, and gets the starfield tile back below. */
  position: fixed;
  inset: 0;
  background: rgba(14, 14, 14, 0.66);
}

@media (min-width: 768px) {
  .password-modal__backdrop {
    background-color: #0e0e0e;
    background-image: var(--backdrop-tile);
    background-repeat: repeat;
    background-size: 260px 260px;
  }
}

.password-modal__card {
  position: relative;
  width: 100%;
  max-width: 1120px;
  min-height: calc(100vh - 80px);
  margin-top: 80px;
  box-sizing: border-box;
  border-radius: 60px 60px 0 0;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #0e0e0e;
  background: linear-gradient(to bottom, #bbd3ee, #c9dbed);
}

.password-modal__topbar {
  position: sticky;
  top: 0;
  z-index: 1;
  flex: 0 0 auto;
  width: 100%;
  height: 120px;
  background: #bed4ee;
  border-radius: 60px 60px 0 0;
}

.password-modal__close {
  position: absolute;
  right: 40px;
  top: 40px;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.password-modal__close img {
  display: block;
  width: 100%;
  height: 100%;
}

.password-modal__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 90px 368px;
}

.password-modal__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 72px;
  width: 100%;
  max-width: 939px;
}

.password-modal__title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.password-modal__title {
  margin: 0;
  font-size: 96px;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  text-align: center;
}

.password-modal__subtitle {
  margin: 0;
  font-size: 24px;
  font-style: italic;
  line-height: normal;
  text-align: center;
}

.password-modal__input-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 52px;
}

.password-modal__pill {
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 544px;
  max-width: 100%;
  height: 80px;
  border: 1px solid #0e0e0e;
}

.password-modal__pill--error {
  border-color: #f22665;
}

.password-modal__native-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: none;
  padding: 0;
  cursor: text;
}

.password-modal__slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 52px;
}

.password-modal__digit {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 700;
  font-size: 52px;
  color: #0e0e0e;
}

.password-modal__dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #0e0e0e;
}

.password-modal__caret {
  width: 2px;
  height: 40px;
  background: #0e0e0e;
  animation: password-modal-caret-blink 1s step-end infinite;
}

@keyframes password-modal-caret-blink {
  50% {
    opacity: 0;
  }
}

.password-modal__error {
  position: absolute;
  left: 50%;
  top: 85px;
  transform: translateX(-50%);
  width: 544px;
  max-width: 100%;
  margin: 0;
  font-size: 16px;
  text-align: center;
  color: #f22665;
}

.password-modal__tip {
  margin: 0;
  width: 303px;
  max-width: 100%;
  font-size: 20px;
  line-height: normal;
  text-align: center;
}

.password-modal__tip a {
  position: relative;
  color: inherit;
  text-decoration: none;
}

.password-modal__tip a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 1px;
  background: currentColor;
}

.password-modal-enter-active .password-modal__backdrop,
.password-modal-leave-active .password-modal__backdrop {
  transition: opacity 0.25s ease;
  will-change: opacity;
}

.password-modal-enter-from .password-modal__backdrop,
.password-modal-leave-to .password-modal__backdrop {
  opacity: 0;
}

.password-modal-enter-active .password-modal__card {
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  /* No will-change: transform here anymore. Real-device evidence: the
     card's border-radius was confirmed (via a MutationObserver in the
     user's own console) to be mutating correctly through a full, smooth
     animation cycle, yet nothing visually moved on screen at all — a pure
     paint/compositing disconnect between the CSSOM and what's actually
     rendered. This exact codebase already hit one confirmed instance of
     will-change causing stale paint this session (will-change: filter,
     removed earlier for the same reason): promoting the element to its
     own GPU-composited layer for one animating property can leave that
     layer's rendering of a DIFFERENT co-animating property (border-radius
     here, changing via JS at the same time as this transform transition)
     stuck at whatever it was when the layer was promoted, particularly
     under real hardware GPU compositing — which local headless testing
     doesn't necessarily reproduce, unlike a real browser. */
}

.password-modal-leave-active .password-modal__card {
  transition: transform 0.25s ease-in;
  /* See the enter-active rule's comment just above. */
}

.password-modal-enter-from .password-modal__card,
.password-modal-leave-to .password-modal__card {
  transform: translateY(100%);
}

/* No CSS melt animation here — see the script's playMelt()/onEnter()/
   onLeave() comment for why the border-radius wobble moved to a plain
   requestAnimationFrame loop instead of a @keyframes animation tied to
   these enter/leave-active classes. The transform transition above is
   untouched and still does the actual slide. */

@media (max-width: 767px) {
  .password-modal {
    /* .password-modal__card below now positions itself directly (position:
       fixed, bottom:0) instead of relying on this flex container's
       align-items to place it — so this no longer needs to size or lay
       out the card at all. Kept only as the backdrop's clickable/keydown
       host; overflow stays visible since there's nothing here to scroll. */
    display: block;
    overflow-y: visible;
  }

  .password-modal__card {
    /* Always spans from a fixed 64px below the screen's top edge down to
       its true bottom edge — not sized to content. Explicit height via
       dvh (not `bottom: 0` + auto height, tried first) because `dvh` is
       what's actually built to track the current real viewport as
       browser chrome (the address bar) shows/hides — a plain `bottom: 0`
       can lag or miscompute against the wrong viewport reference through
       that, leaving a gap at the true bottom in some states. This is NOT
       the keyboard-aware `interactive-widget=resizes-content` mode (that
       was deliberately removed — see the script comment above
       lockBodyScroll); dvh here only tracks chrome, not the keyboard, so
       whatever falls behind the keyboard still just sits there covered,
       same reasoning as before. */
    position: fixed;
    left: 0;
    right: 0;
    top: 64px;
    bottom: 0;
    height: calc(100dvh - 64px);
    max-height: none;
    min-height: 0;
    margin-top: 0;
    border-radius: 24px 24px 0 0;
  }

  /* Snappier than desktop's 450ms/250ms — matches transitionDuration in
     the script, which Vue's :duration needs told explicitly (see its
     comment for why). No melt animation override here: mobile keeps the
     plain transition from the base (unscoped) rule above, just faster. */
  .password-modal-enter-active .password-modal__card {
    transition-duration: 0.2s;
  }

  .password-modal-leave-active .password-modal__card {
    transition-duration: 0.15s;
  }

  .password-modal__topbar {
    height: 48px;
    /* #bed4ee straight from Figma (node 1256-2346's own fill) — reads as
       nearly the same color as the card's own gradient top (#bbd3ee) at a
       glance, which is why this looked fill-less from a screenshot; it
       isn't, and get_design_context confirmed the literal value. */
    background: #bed4ee;
    border-radius: 24px 24px 0 0;
  }

  .password-modal__close {
    /* The Figma source (node 1256-2346) literally specifies an ~18.8px
       glyph, and matching that exactly read as too small in practice —
       going with direct real-world feedback over the literal export here.
       Box stays a generous 44px tap target (shrinking the hit area was the
       direct cause of the multi-tap-to-close complaints); only the icon
       inside, via padding, is what's sized up. */
    right: 4px;
    top: 2px;
    width: 44px;
    height: 44px;
    padding: 8px;
    box-sizing: border-box;
  }

  .password-modal__body {
    overflow-y: visible;
    /* Top padding matches the 24px gap in the Figma reference between the
       topbar's bottom edge and the title block below it (was 12px). */
    padding: 24px 20px 52px;
  }

  .password-modal__content {
    gap: 48px;
  }

  .password-modal__title {
    font-size: 32px;
    line-height: 36px;
  }

  .password-modal__subtitle {
    font-size: 16px;
    font-style: normal;
  }

  .password-modal__input-block {
    width: 100%;
    gap: 48px;
  }

  .password-modal__tip {
    font-size: 16px;
  }

  .password-modal__pill {
    width: 100%;
    gap: 14px;
  }
}
</style>
