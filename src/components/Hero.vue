<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import portraitImg from '../assets/hero/portrait-bw.jpg'
import childhoodImg from '../assets/hero/childhood.jpg'
import scribbleLarge from '../assets/hero/scribble-large.svg'
import scribbleMobile from '../assets/hero/scribble-mobile.svg'
import { createHoverRipple } from '../hoverRipple'

// The flip between portrait and childhood is a cross-blend, not a spatial
// wipe: a directional mask (tried first) always leaves a seam right where
// one photo's content is visibly more displaced by the shared warp than
// the other's (a busy color photo reads the same pixel displacement as
// much more "melted" than a smooth B&W one) — no feather width hides that,
// since it's a content difference, not a geometric edge. A plain opacity
// cross-fade has no such seam: both photos already warp together the
// whole time (same shared filter, see photoWarp below), so at the
// mid-blend both are visibly flowing into each other at once. Intensity
// matches the scroll-ripple's own ceiling (see scrollRipple.js) and the
// other melt filters (Projects cards, Contact cloud) so it reads as the
// same distortion everywhere, not a separate weaker effect. Hover does
// nothing to the photo — it only changes on its own timer or on click.
const photoWarp = createHoverRipple('hero-flip-displacement', null, 65)

let fadeProgress = 0
let fadeAnimId = null
const FADE_DURATION = 100

function setFade(p) {
  fadeProgress = p
  document.documentElement.style.setProperty('--hero-alt-opacity', p.toFixed(3))
}

function animateFade(target, duration) {
  if (fadeAnimId) cancelAnimationFrame(fadeAnimId)
  const start = performance.now()
  const from = fadeProgress
  function tick(now) {
    const t = Math.min(Math.max((now - start) / duration, 0), 1)
    setFade(from + (target - from) * t)
    fadeAnimId = t < 1 ? requestAnimationFrame(tick) : null
  }
  fadeAnimId = requestAnimationFrame(tick)
}

// Photo flips between the portrait and the childhood shot every 5s — or
// right away on click, which also restarts the timer so it doesn't
// immediately flip again right after.
const showChildhood = ref(false)
let flipTimer = null

function flip() {
  showChildhood.value = !showChildhood.value
  // Fresh seed each time so the warp doesn't melt the same shapes twice.
  document.getElementById('hero-flip-noise')?.setAttribute('seed', String(Math.floor(Math.random() * 1000)))
  animateFade(showChildhood.value ? 1 : 0, FADE_DURATION)
  // Stays active for the whole cross-fade, not just its start — same as
  // the hover melts elsewhere (warp and reveal run together the entire
  // time), so the swap doesn't turn into a plain flat fade partway through.
  photoWarp.enter()
  setTimeout(() => photoWarp.leave(), FADE_DURATION)
}

function restartFlipTimer() {
  clearInterval(flipTimer)
  flipTimer = setInterval(flip, 5000)
}

function onPhotoClick() {
  flip()
  restartFlipTimer()
}

onMounted(() => {
  restartFlipTimer()
})

onBeforeUnmount(() => {
  clearInterval(flipTimer)
})
</script>

<template>
  <section class="hero">
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <!-- The melt: both photos lightly warp through this during the flip
           (see photoWarp in script — kept subtle, see the comment there).
           Edge-safe like the other melt filters in this codebase: the
           erode+blur mask keeps the photo's own border crisp regardless of
           warp strength. -->
      <filter id="hero-flip-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence id="hero-flip-noise" type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="23" result="noise" />
        <feDisplacementMap
          id="hero-flip-displacement"
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
          result="warped"
        />
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
          result="silhouette"
        />
        <feMorphology in="silhouette" operator="erode" radius="12" result="eroded" />
        <feGaussianBlur in="eroded" stdDeviation="8" result="edge-mask" />
        <feComposite in="warped" in2="edge-mask" operator="in" result="warped-inset" />
        <feComposite in="warped-inset" in2="SourceGraphic" operator="over" />
      </filter>
    </svg>

    <div class="hero__frame">
      <div class="hero__stage" v-scale-stage="1280">
        <h1 class="hero__title reveal" v-reveal>
          <span class="hero__title-line hero__title-line--1">senior</span>
          <span class="hero__title-line hero__title-line--2">product</span>
          <span class="hero__title-line hero__title-line--3">designer</span>
        </h1>

        <div
          class="hero__photo reveal reveal--delay-1"
          v-reveal
          role="button"
          tabindex="0"
          aria-label="Показать другое фото"
          @click="onPhotoClick"
          @keydown.enter="onPhotoClick"
        >
          <img
            :src="portraitImg"
            alt="Эльвина Захарова"
            class="hero__photo-img hero__photo-img--main"
            :style="{ filter: photoWarp.active.value ? 'url(#hero-flip-filter)' : 'none' }"
          />
          <img
            :src="childhoodImg"
            alt="Эльвина в детстве"
            class="hero__photo-img hero__photo-img--alt"
            :style="{ filter: photoWarp.active.value ? 'url(#hero-flip-filter)' : 'none' }"
          />
        </div>

        <img :src="scribbleLarge" class="hero__scribble-large scroll-ripple" alt="" />

        <p class="hero__intro reveal reveal--delay-1" v-reveal>
          Эльвина, 8+ лет в&nbsp;дизайне. С&nbsp;2024 года в&nbsp;Uzum&nbsp;Market. Люблю, когда
          всё запутано&nbsp;— потом интереснее распутывать
        </p>

        <ul class="hero__stats">
          <li class="hero__stat hero__stat--1 reveal" v-reveal>
            <span class="hero__stat-number">1</span>
            <span class="hero__stat-text">Веду B2B- и&nbsp;B2E-продукты, где много правил и&nbsp;зависимостей</span>
          </li>
          <li class="hero__stat hero__stat--2 reveal reveal--delay-1" v-reveal>
            <span class="hero__stat-number">2</span>
            <span class="hero__stat-text">Держу контекст: ограничения, роли, исключения</span>
          </li>
          <li class="hero__stat hero__stat--3 reveal reveal--delay-2" v-reveal>
            <span class="hero__stat-number">3</span>
            <span class="hero__stat-text">Упрощаю работу команды&nbsp;— через ясный дизайн</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="hero__mobile mobile-container">
      <div class="hero__mobile-top-frame">
        <div class="hero__mobile-top-clip">
          <div class="hero__mobile-top" v-scale-stage="350">
            <div
              class="hero__mobile-photo"
              role="button"
              tabindex="0"
              aria-label="Показать другое фото"
              @click="onPhotoClick"
              @keydown.enter="onPhotoClick"
            >
              <img
                :src="portraitImg"
                alt="Эльвина Захарова"
                class="hero__photo-img hero__photo-img--main"
                :style="{ filter: photoWarp.active.value ? 'url(#hero-flip-filter)' : 'none' }"
              />
              <img
                :src="childhoodImg"
                alt="Эльвина в детстве"
                class="hero__photo-img hero__photo-img--alt"
                :style="{ filter: photoWarp.active.value ? 'url(#hero-flip-filter)' : 'none' }"
              />
            </div>

            <h1 class="hero__mobile-title">
              <span class="hero__mobile-title-line hero__mobile-title-line--1">senior</span>
              <span class="hero__mobile-title-line hero__mobile-title-line--2">product</span>
              <span class="hero__mobile-title-line hero__mobile-title-line--3">designer</span>
            </h1>
          </div>
        </div>

        <!-- Sibling of .hero__mobile-top-clip, not nested inside it: the
             clip wrapper is what contains the photo/title (needs overflow
             clipping so the frame's height actually follows its
             aspect-ratio — see .hero__mobile-top-frame's own comment), and
             that clipping was cutting off this scribble's deliberate bleed
             past the photo's right edge along with it. Positioned by
             percentage of the frame's own (unclipped, aspect-ratio-locked)
             box instead of the v-scale-stage transform, since it no longer
             sits inside that scaled stage. -->
        <img :src="scribbleMobile" class="hero__mobile-scribble scroll-ripple" alt="" />
      </div>

      <p class="hero__mobile-intro">
        Эльвина, 8+ лет в&nbsp;дизайне. С&nbsp;2024 года в&nbsp;Uzum&nbsp;Market. Люблю, когда всё запутано&nbsp;—
        потом интереснее распутывать
      </p>

      <ul class="hero__mobile-stats">
        <li class="hero__mobile-stat">
          <span class="hero__mobile-stat-number">1</span>
          <span class="hero__mobile-stat-text">Веду B2B- и&nbsp;B2E-продукты, где много правил и&nbsp;зависимостей</span>
        </li>
        <li class="hero__mobile-stat">
          <span class="hero__mobile-stat-number">2</span>
          <span class="hero__mobile-stat-text">Держу контекст: ограничения, роли, исключения</span>
        </li>
        <li class="hero__mobile-stat">
          <span class="hero__mobile-stat-number">3</span>
          <span class="hero__mobile-stat-text">Упрощаю работу команды&nbsp;— через ясный дизайн</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: #0e0e0e;
}

.hero__frame {
  container-type: inline-size;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 1280 / 1028;
  margin: 0 auto;
  overflow: hidden;
}

.hero__stage {
  position: relative;
  width: 1280px;
  height: 1028px;
  /* transform (scale) is set by the v-scale-stage directive — see main.js */
  transform-origin: top left;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #fff;
}

.hero__scribble-large {
  position: absolute;
  left: 915px;
  top: 293px;
  width: 285px;
  height: 491px;
}

.hero__title {
  margin: 0;
  font-weight: 700;
}

.hero__title-line {
  position: absolute;
  left: 80px;
  font-size: 160px;
  line-height: 128px;
  text-transform: uppercase;
  white-space: nowrap;
}

.hero__title-line--1 {
  top: 202px;
}

.hero__title-line--2 {
  left: 240px;
  top: 316px;
}

.hero__title-line--3 {
  left: 79px;
  top: 430px;
}

.hero__photo {
  position: absolute;
  left: 512px;
  top: 252px;
  width: 256px;
  height: 256px;
  z-index: 1;
  overflow: hidden;
  cursor: pointer;
}

.hero__photo-img {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #0e0e0e;
  transform: scale(1.08);
  object-fit: cover;
  z-index: 1;
}

/* On top, cross-fading over the always-fully-opaque main photo underneath
   (see setFade()/flip() in script) — a plain custom property, not a
   mutated SVG filter primitive, so unlike an SVG mask resource, updating
   it here repaints live. */
.hero__photo-img--alt {
  z-index: 2;
  opacity: var(--hero-alt-opacity, 0);
}

.hero__intro {
  position: absolute;
  left: 79px;
  top: 598px;
  width: 433px;
  margin: 0;
  font-size: 20px;
  line-height: normal;
}

.hero__stats {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hero__stat {
  position: absolute;
  top: 770px;
  display: flex;
  align-items: center;
}

.hero__stat--1 {
  left: 80px;
  width: 256px;
  gap: 12px;
}

.hero__stat--2 {
  left: 368px;
  width: 256px;
  gap: 20px;
}

.hero__stat--3 {
  left: 656px;
  width: 250px;
  gap: 20px;
}

.hero__stat-number {
  flex-shrink: 0;
  font-size: 80px;
  font-weight: 700;
  line-height: normal;
}

.hero__stat-text {
  flex: 1;
  font-size: 16px;
  line-height: normal;
}

.hero__mobile {
  display: none;
}

@media (max-width: 767px) {
  .hero__frame {
    display: none;
  }

  .hero {
    overflow: hidden;
  }

  .hero__mobile {
    display: block;
    padding-top: 80px;
    padding-bottom: 56px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #fff;
  }

  .hero__mobile-top-frame {
    container-type: inline-size;
    width: 100%;
    aspect-ratio: 350 / 463;
    /* position:relative so .hero__mobile-scribble below (a sibling of the
       clip wrapper, not nested inside it) can be positioned by percentage
       against this exact box. No overflow here — the frame itself is
       never clipped now, so the scribble's bleed past the photo's right
       edge is never at risk of being cut off by it. */
    position: relative;
  }

  .hero__mobile-top-clip {
    /* This is what actually fixes the height bug (moved off the frame
       itself): without clipping somewhere, .hero__mobile-top keeps its
       full 463px pre-transform layout box regardless of how much the
       v-scale-stage transform visually shrinks it, and that raw box wins
       over the frame's (smaller) aspect-ratio-preferred height, leaving a
       growing gap below the photo/title the narrower the phone (see the
       identical issue and fix on .contact__mobile-frame). Sized to 100% of
       the frame rather than carrying its own explicit height, so it can't
       force the frame taller the same way. */
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .hero__mobile-top {
    position: relative;
    width: 350px;
    height: 463px;
    /* transform (scale) is set by the v-scale-stage directive — see main.js */
    transform-origin: top left;
  }

  .hero__mobile-photo {
    position: absolute;
    left: 0;
    top: 0;
    width: 350px;
    height: 350px;
    overflow: hidden;
    cursor: pointer;
    /* Contains the main/alt photos' own z-index (1/2) to inside this box —
       without it they escape into the page's stacking order and climb
       above the scribble/title, which sit later in the DOM but have no
       z-index of their own. */
    isolation: isolate;
  }

  .hero__mobile-photo .hero__photo-img {
    object-position: bottom;
  }

  .hero__mobile-scribble {
    /* Percentages of .hero__mobile-top-frame (position:relative, its
       containing block) rather than the original px values against the
       350×463 stage — this now sits outside the v-scale-stage transform
       entirely (see the template comment), so it needs to track the
       frame's own size on its own; the frame shares that exact 350/463
       aspect ratio, so these percentages reproduce the original design
       position/size exactly (246/350, 74/463, 173/350, 297/463). */
    position: absolute;
    left: 70.286%;
    top: 15.983%;
    width: 49.429%;
    height: 64.147%;
  }

  .hero__mobile-title {
    position: absolute;
    inset: 0;
    margin: 0;
    font-weight: 700;
    /* Purely decorative text spanning the whole stage — without this it
       sits on top of .hero__mobile-photo and blocks pointer events there. */
    pointer-events: none;
  }

  .hero__mobile-title-line {
    position: absolute;
    font-size: 56px;
    line-height: 72px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .hero__mobile-title-line--1 {
    left: 0;
    top: 288px;
  }

  .hero__mobile-title-line--2 {
    left: 70px;
    top: 339px;
  }

  .hero__mobile-title-line--3 {
    left: 0;
    top: 391px;
  }

  .hero__mobile-intro {
    margin: 16px 0 0;
    font-size: 16px;
    line-height: normal;
  }

  .hero__mobile-stats {
    display: flex;
    flex-direction: row;
    gap: 12px;
    margin: 60px -20px 0 0;
    padding: 0;
    list-style: none;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
  }

  .hero__mobile-stats::-webkit-scrollbar {
    display: none;
  }

  .hero__mobile-stats::after {
    /* Trailing scroll spacer: combined with the row's own 12px gap, this
       leaves a 20px gutter after card 3 once scrolled all the way — a
       flex item, not padding on the row, so it doesn't skew the % width
       math above. */
    content: '';
    flex: 0 0 8px;
  }

  .hero__mobile-stat {
    /* The row bleeds through the container's right inset (see
       .hero__mobile-stats margin above), so this 100% reaches the actual
       screen edge — cards 1 & 2 are sized off it so together (plus gaps)
       they always leave exactly 16px of card 3 poking past that edge, at
       any viewport, per the Figma mock. */
    flex: 0 0 calc((100% - 12px * 2 - 16px) / 2);
    display: flex;
    flex-direction: column;
    gap: 8px;
    scroll-snap-align: start;
  }

  .hero__mobile-stat:last-child {
    /* Card 3 keeps its own Figma width (node 1235:7101) instead of being
       squeezed to fit — it genuinely overflows the content column, with
       only the 16px reserved above actually on screen before scrolling. */
    flex-basis: 164px;
  }

  .hero__mobile-stat-number {
    font-size: 40px;
    font-weight: 700;
    line-height: normal;
  }

  .hero__mobile-stat-text {
    font-size: 14px;
    line-height: normal;
  }
}
</style>
