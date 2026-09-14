<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import closeIcon from '../assets/password/close-x.svg'
import starfieldTile from '../assets/password/starfield.png'
import { playTransitionRipple } from '../transitionRipple'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

// Warm the browser's image cache so the backdrop texture isn't decoded
// for the first time during the open transition.
new Image().src = starfieldTile

const digits = ref('')
const error = ref(false)
const isFocused = ref(false)
const inputRef = ref(null)

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
  inputRef.value?.focus()
}

// The card warps through its displacement filter while it is in motion:
// `.password-modal-enter-active/-leave-active` hang the filter on it, these
// hooks drive how hard it bites.
let stopRipple = null

function onEnter() {
  stopRipple?.()
  stopRipple = playTransitionRipple('modal-ripple-displacement', {
    duration: 450,
    peak: 225,
    shape: 'decay',
  })
}

function onAfterEnter(el) {
  stopRipple?.()
  stopRipple = null
  // Focusing here (after the transition) is too late for the keyboard to
  // open automatically on mobile — a programmatic focus() only raises the
  // keyboard if it's still inside the browser's "recent user gesture"
  // window, which a 450ms-later transition hook has already fallen out of.
  // The real focus() that opens the keyboard happens immediately on open
  // (see the watcher below); this is just a safety net for browsers where
  // that one didn't land (e.g. the input wasn't in the DOM yet).
  focusInput()
  forceTitleRepaint(el)
}

// Chromium bug workaround: once the ripple filter's attribute animation on
// .password-modal__card-bg (painted just before the title/subtitle in the
// same box) stops, the title/subtitle silently stop being painted —
// getComputedStyle reports completely normal color/opacity/rect the whole
// time, and nothing else nearby is affected (the tip text below keeps
// rendering fine, kept alive by the blinking caret's own repaints), so
// this is Chromium failing to repaint that specific stale region rather
// than anything actually wrong with the element. A real style mutation
// (not a no-op) forces Chromium to repaint it; confirmed via Playwright
// that this reliably brings the text back every time.
function forceTitleRepaint(root) {
  const block = root?.querySelector?.('.password-modal__title-block')
  if (!block) return
  // Deliberately never reverted: reverting the opacity back to its default
  // re-triggers the exact same stale-paint bug this works around (verified
  // directly — the text goes blank again the moment the inline style is
  // cleared, even though the *computed* opacity is 1 either way). 0.999 is
  // visually identical to 1, so leaving it set is the stable fix.
  setTimeout(() => {
    block.style.opacity = '0.999'
  }, 150)
}

function onLeave() {
  stopRipple?.()
  stopRipple = playTransitionRipple('modal-ripple-displacement', {
    duration: 250,
    peak: 225,
    shape: 'attack',
  })
}

function onAfterLeave() {
  stopRipple?.()
  stopRipple = null
}

// index.html's viewport meta now carries interactive-widget=resizes-
// content, which — on browsers that support it — makes the layout
// viewport itself (and so 100dvh, which .password-modal is sized with)
// shrink when the on-screen keyboard opens, natively, with no JS needed.
// An earlier version of this hand-tracked window.visualViewport instead;
// dropped it — the sheet's own fixed-height card could end up taller than
// the shrunk box that produced, which turned this modal's own
// overflow-y:auto into an unwanted second scroll region on top of it.

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
    } else {
      unlockBodyScroll()
    }
  },
)

onBeforeUnmount(() => {
  if (props.open) unlockBodyScroll()
})
</script>

<template>
  <Teleport to="body">
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <filter id="modal-ripple-filter" x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018 0.033" numOctaves="2" seed="11" result="noise" />
        <feDisplacementMap
          id="modal-ripple-displacement"
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    <Transition
      name="password-modal"
      :duration="{ enter: 450, leave: 250 }"
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
          :style="{ backgroundImage: `url(${starfieldTile})` }"
          @click="close"
          @touchend.prevent="close"
        ></div>

        <div class="password-modal__card" role="dialog" aria-modal="true">
          <div class="password-modal__card-bg" aria-hidden="true"></div>

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
  /* On top of inset:0's implied 100% — combined with the viewport meta's
     interactive-widget=resizes-content (index.html), dvh is what actually
     shrinks to stay clear of the on-screen keyboard on mobile, natively,
     rather than the layout viewport 100% here would otherwise resolve to. */
  height: 100dvh;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.password-modal__backdrop {
  position: fixed;
  inset: 0;
  background-color: #0e0e0e;
  background-repeat: repeat;
  background-size: 260px 260px;
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
}

/* The card's own background lives here, as a real sibling element (not a
   `background` directly on .password-modal__card, and not a ::before
   pseudo-element either — that was tried first, but Chromium was found to
   stop painting the title/subtitle text entirely whenever this filter was
   present on a ::before sibling of theirs, even fully at rest with the
   filter's scale at 0; swapping to a real element made the text render
   correctly again), so the open/close ripple (below) can warp just this
   plain-colored shape without dragging the real content (title, input, tip
   text — all in .password-modal__body) or the close button through the
   same distortion: an SVG filter warps where a layer paints, not its
   hit-testing box, so text run through it reads as visually
   broken/illegible while it's in motion, and the close button's tap
   target would drift away from what's on screen the same way it did
   when the filter briefly lived on .password-modal__card itself. */
.password-modal__card-bg {
  position: absolute;
  inset: 0;
  /* No z-index: painting order alone (this sits first among the card's
     children, so it already paints behind the rest) already puts this
     behind them; a negative z-index here would instead escape
     .password-modal__card's own stacking (position:relative with no
     z-index of its own doesn't contain one) and risk painting behind the
     backdrop instead. */
  border-radius: inherit;
  background: linear-gradient(to bottom, #bbd3ee, #c9dbed);
  pointer-events: none;
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
  will-change: transform;
}

/* Filter lives on .password-modal__card::before (the card's plain-color
   background shape), not .password-modal__body or the card itself: an SVG
   filter warps where a layer paints but not its actual hit-testing box —
   putting it on the card warped the close button's tap target away from
   what was on screen (needing a second tap once the ripple settled), and
   putting it on body (holding the real title/input/tip text) made that
   text warp and read as broken/illegible while in motion. The background
   shape has neither problem — it's decorative and has no text or controls
   of its own to distort or misalign. */
.password-modal-enter-active .password-modal__card-bg {
  filter: url(#modal-ripple-filter);
}

.password-modal-leave-active .password-modal__card {
  transition: transform 0.25s ease-in;
  will-change: transform;
}

.password-modal-leave-active .password-modal__card-bg {
  filter: url(#modal-ripple-filter);
}

.password-modal-enter-from .password-modal__card,
.password-modal-leave-to .password-modal__card {
  transform: translateY(100%);
}

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
    /* Fixed directly to the (keyboard-aware, via 100dvh + the viewport
       meta's interactive-widget=resizes-content) viewport's own bottom
       edge, sized to its own content instead of a flat 508px that left
       empty space below short content and, combined with the keyboard
       shrinking things further, made .password-modal__body's old
       overflow-y:auto turn into an unwanted second scroll region stacked
       on top of the page-scroll leak this component now also blocks. */
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    max-height: 100dvh;
    height: auto;
    min-height: 0;
    margin-top: 0;
    border-radius: 24px 24px 0 0;
  }

  .password-modal__topbar {
    height: 60px;
    border-radius: 24px 24px 0 0;
  }

  .password-modal__close {
    right: 17px;
    top: 16px;
    width: 44px;
    height: 44px;
  }

  .password-modal__body {
    overflow-y: visible;
    padding: 12px 20px 52px;
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
