<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import closeIcon from '../assets/password/close-x.svg'
import starfieldTile from '../assets/password/starfield.png'

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

// Both the open/close ripple filter (removed) and .password-modal__card-bg
// as a filtered sibling of the title/subtitle turned out to cost more than
// they were worth: Chromium would silently stop painting the title text
// after the filter's attribute animation stopped, and no reliable, low-risk
// way to force a repaint on every real device was found. The card's
// background now lives directly on .password-modal__card again — plain,
// with no separate layer — and the open/close motion is just the slide +
// fade below, no distortion.

// Tracks the on-screen keyboard on mobile via visualViewport instead of
// relying on the viewport meta's interactive-widget=resizes-content: that
// CSS-only mechanism isn't supported everywhere, and where it silently
// isn't, .password-modal__card's `bottom: 0` stays pinned to the full,
// keyboard-unaware layout viewport — the card ends up sitting behind the
// keyboard until the browser's own "scroll focused input into view"
// behavior yanks it up separately, which is exactly the "opens under the
// keyboard, then jumps above it" bug this replaces. Tracking
// visualViewport directly works regardless of that meta tag's support.
const keyboardOffset = ref(0)
const visibleViewportHeight = ref(null)

function updateViewportMetrics() {
  const vv = window.visualViewport
  if (!vv) return
  keyboardOffset.value = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
  visibleViewportHeight.value = vv.height
}

function watchKeyboard() {
  if (!window.visualViewport) return
  window.visualViewport.addEventListener('resize', updateViewportMetrics)
  window.visualViewport.addEventListener('scroll', updateViewportMetrics)
  updateViewportMetrics()
}

function unwatchKeyboard() {
  if (!window.visualViewport) return
  window.visualViewport.removeEventListener('resize', updateViewportMetrics)
  window.visualViewport.removeEventListener('scroll', updateViewportMetrics)
  keyboardOffset.value = 0
  visibleViewportHeight.value = null
}

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
      watchKeyboard()
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
      unwatchKeyboard()
    }
  },
)

onBeforeUnmount(() => {
  if (props.open) {
    unlockBodyScroll()
    unwatchKeyboard()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      name="password-modal"
      :duration="{ enter: 450, leave: 250 }"
      @after-enter="onAfterEnter"
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

        <div
          class="password-modal__card"
          role="dialog"
          aria-modal="true"
          :style="{
            bottom: keyboardOffset + 'px',
            maxHeight: visibleViewportHeight ? visibleViewportHeight + 'px' : undefined,
          }"
        >
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
  /* dvh here is only a same-frame fallback for the instant before the
     visualViewport JS above has run once — the card's own inline
     max-height (bound to visualViewport.height) is what actually tracks
     the on-screen keyboard, see the comment above updateViewportMetrics. */
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
  will-change: transform;
}

.password-modal-leave-active .password-modal__card {
  transition: transform 0.25s ease-in;
  will-change: transform;
}

.password-modal-enter-from .password-modal__card,
.password-modal-leave-to .password-modal__card {
  transform: translateY(100%);
}

/* The "melt" back, minus the part that kept breaking: this used to be an
   SVG displacement filter on a background layer behind the title, and
   Chromium would silently stop painting the title/subtitle once that
   filter's JS-driven attribute animation stopped — confirmed repeatedly,
   including a repaint workaround that held up in testing here but still
   failed on a real device. A border-radius wobble can't ever touch text
   painting (it only reshapes the card's own corners), so it gets the same
   "edges warping as it arrives" read with none of that risk. Desktop
   only: the mobile sheet needs to feel instant (see its own comments),
   not put through a multi-step corner wobble.
   Values ping-pong across three keyframes rather than following a single
   settle so the corners still read as sloshing side to side, not just
   easing straight back to their resting radius. */
@media (min-width: 768px) {
  .password-modal-enter-active .password-modal__card {
    transition: none;
    animation: password-modal-melt-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
  }

  .password-modal-leave-active .password-modal__card {
    transition: none;
    animation: password-modal-melt-out 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
}

@keyframes password-modal-melt-in {
  0% {
    transform: translateY(100%);
    border-radius: 60px 60px 0 0;
  }
  40% {
    border-radius: 20px 100px 10px 50px;
  }
  70% {
    border-radius: 90px 20px 50px 10px;
  }
  100% {
    transform: translateY(0);
    border-radius: 60px 60px 0 0;
  }
}

@keyframes password-modal-melt-out {
  0% {
    transform: translateY(0);
    border-radius: 60px 60px 0 0;
  }
  35% {
    border-radius: 90px 20px 50px 10px;
  }
  100% {
    transform: translateY(100%);
    border-radius: 20px 100px 10px 50px;
  }
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
    /* Fixed to the viewport's bottom edge, sized to its own content instead
       of a flat height that left empty space below short content. `bottom`
       and `max-height` here are just the pre-JS fallback (keyboard closed,
       full viewport) — the inline style bound to keyboardOffset /
       visibleViewportHeight (see the component script) overrides both the
       moment visualViewport reports the keyboard, keeping the card glued to
       the keyboard's own top edge with no gap and no second scroll region. */
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
    height: 48px;
    /* No fill on mobile — the design has the close icon sitting straight on
       the card's own gradient, not a separate colored band (see the Figma
       reference: node 1235-7178). */
    background: transparent;
    border-radius: 24px 24px 0 0;
  }

  .password-modal__close {
    /* Box stays a generous 44px tap target (shrinking the hit area was the
       direct cause of the multi-tap-to-close complaints); only the icon
       inside, via padding, renders at the smaller size from the Figma
       reference. */
    right: 8px;
    top: 2px;
    width: 44px;
    height: 44px;
    padding: 12px;
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
