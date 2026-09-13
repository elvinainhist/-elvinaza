<script setup>
import card1Bg from '../assets/projects/card1-bg.jpg'
import card1Shot from '../assets/projects/card1-shot.jpg'
import card2Bg from '../assets/projects/card2-bg.jpg'
import card2Shot from '../assets/projects/card2-shot.png'
import card3Bg from '../assets/projects/card3-bg.jpg'
import asterisk3 from '../assets/projects/asterisk3.svg'
import asterisk4 from '../assets/projects/asterisk4.svg'
import frame1Icon from '../assets/projects/frame1-icon.svg'
import mobileCard1 from '../assets/projects/mobile-card1.jpg'
import mobileCard2 from '../assets/projects/mobile-card2.jpg'
import mobileCard3 from '../assets/projects/mobile-card3.jpg'
import { ref, onMounted } from 'vue'
import { createHoverRipple, attachLoadRipple } from '../hoverRipple'
import { createDissolveReveal } from '../dissolveReveal'

const rulerMarkers = [20, 101, 181, 261, 341]
const rulerLines = [81, 161, 241, 321]
const idLines = [0, 1, 2, 3]

const emit = defineEmits(['open-case'])

const cardRipple1 = createHoverRipple('project-ripple-displacement-1', 'project-ripple-offset-1', 65)
const cardRipple2 = createHoverRipple('project-ripple-displacement-2', 'project-ripple-offset-2', 65)
const cardRipple3 = createHoverRipple('project-ripple-displacement-3', 'project-ripple-offset-3', 65)

// Shapes the warp above so it grows/shrinks from organic patches on
// hover-enter/leave instead of covering the whole image evenly.
const cardReveal1 = createDissolveReveal('project-reveal-threshold-1')
const cardReveal2 = createDissolveReveal('project-reveal-threshold-2')
const cardReveal3 = createDissolveReveal('project-reveal-threshold-3')

const cardImage1 = ref(null)
const cardImage2 = ref(null)
const cardImage3 = ref(null)
const cardImageMobile1 = ref(null)
const cardImageMobile2 = ref(null)
const cardImageMobile3 = ref(null)

onMounted(() => {
  attachLoadRipple(cardImage1.value, cardRipple1)
  attachLoadRipple(cardImage2.value, cardRipple2)
  attachLoadRipple(cardImage3.value, cardRipple3)
  attachLoadRipple(cardImageMobile1.value, cardRipple1)
  attachLoadRipple(cardImageMobile2.value, cardRipple2)
  attachLoadRipple(cardImageMobile3.value, cardRipple3)
})
</script>

<template>
  <section class="projects">
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <!-- Same melt warp as the Hero photo (src/components/Hero.vue):
           fractalNoise + numOctaves=3 drags each image's own fine detail
           into streaks/asymmetric blobs, an erode+blur mask keeps the
           card's own edge crisp, and a second animated threshold (see
           src/dissolveReveal.js) grows/shrinks the warp from organic
           patches on hover instead of covering the image evenly. -->
      <!-- Contained variant of the shared scroll-ripple filter (App.vue),
           used only by these photos: the shared one skips edge containment
           because it also runs on thin decorative elements (Results' stems)
           that an erode would erase outright, but that leaves fast-scroll
           displacement fraying right at a photo's own border. Driven by the
           same scroll velocity as the shared filter (see scrollRipple.js). -->
      <filter id="project-scroll-ripple-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="7" result="noise" />
        <feDisplacementMap
          id="project-scroll-ripple-displacement"
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
          result="warped"
        />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="silhouette" />
        <feMorphology in="silhouette" operator="erode" radius="12" result="eroded" />
        <feGaussianBlur in="eroded" stdDeviation="8" result="edge-mask" />
        <feComposite in="warped" in2="edge-mask" operator="in" result="warped-inset" />
        <feComposite in="warped-inset" in2="SourceGraphic" operator="over" />
      </filter>
      <filter id="project-ripple-filter-1" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="3" result="noise" />
        <feOffset id="project-ripple-offset-1" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="project-ripple-displacement-1"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
          result="warped"
        />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="silhouette" />
        <feMorphology in="silhouette" operator="erode" radius="12" result="eroded" />
        <feGaussianBlur in="eroded" stdDeviation="8" result="edge-mask" />
        <feComposite in="warped" in2="edge-mask" operator="in" result="warped-inset" />
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="53" result="reveal-noise" />
        <feColorMatrix in="reveal-noise" type="luminanceToAlpha" result="reveal-noise-alpha" />
        <feComponentTransfer in="reveal-noise-alpha" result="reveal-mask">
          <feFuncA id="project-reveal-threshold-1" type="linear" slope="2.5" intercept="-2.5" />
        </feComponentTransfer>
        <feComposite in="warped-inset" in2="reveal-mask" operator="in" result="warped-revealed" />
        <feComposite in="warped-revealed" in2="SourceGraphic" operator="over" />
      </filter>
      <filter id="project-ripple-filter-2" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="11" result="noise" />
        <feOffset id="project-ripple-offset-2" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="project-ripple-displacement-2"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
          result="warped"
        />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="silhouette" />
        <feMorphology in="silhouette" operator="erode" radius="12" result="eroded" />
        <feGaussianBlur in="eroded" stdDeviation="8" result="edge-mask" />
        <feComposite in="warped" in2="edge-mask" operator="in" result="warped-inset" />
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="61" result="reveal-noise" />
        <feColorMatrix in="reveal-noise" type="luminanceToAlpha" result="reveal-noise-alpha" />
        <feComponentTransfer in="reveal-noise-alpha" result="reveal-mask">
          <feFuncA id="project-reveal-threshold-2" type="linear" slope="2.5" intercept="-2.5" />
        </feComponentTransfer>
        <feComposite in="warped-inset" in2="reveal-mask" operator="in" result="warped-revealed" />
        <feComposite in="warped-revealed" in2="SourceGraphic" operator="over" />
      </filter>
      <filter id="project-ripple-filter-3" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="19" result="noise" />
        <feOffset id="project-ripple-offset-3" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="project-ripple-displacement-3"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
          result="warped"
        />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="silhouette" />
        <feMorphology in="silhouette" operator="erode" radius="12" result="eroded" />
        <feGaussianBlur in="eroded" stdDeviation="8" result="edge-mask" />
        <feComposite in="warped" in2="edge-mask" operator="in" result="warped-inset" />
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="69" result="reveal-noise" />
        <feColorMatrix in="reveal-noise" type="luminanceToAlpha" result="reveal-noise-alpha" />
        <feComponentTransfer in="reveal-noise-alpha" result="reveal-mask">
          <feFuncA id="project-reveal-threshold-3" type="linear" slope="2.5" intercept="-2.5" />
        </feComponentTransfer>
        <feComposite in="warped-inset" in2="reveal-mask" operator="in" result="warped-revealed" />
        <feComposite in="warped-revealed" in2="SourceGraphic" operator="over" />
      </filter>
    </svg>

    <div class="projects__frame">
      <div class="projects__stage" v-scale-stage="1280">
        <p class="projects__title reveal" v-reveal>проекты</p>

        <article
          class="project project--1 reveal"
          role="button"
          tabindex="0"
          v-reveal
          @click="emit('open-case', 'uzum-market')"
          @keydown.enter="emit('open-case', 'uzum-market')"
          @mouseenter="cardRipple1.enter(); cardReveal1.enter()"
          @mouseleave="cardRipple1.leave(); cardReveal1.leave()"
          @mousemove="cardRipple1.move($event)"
        >
          <div class="project__image" ref="cardImage1">
            <div class="project__image-inner">
              <img
                :src="card1Bg"
                class="project__bg scroll-ripple"
                style="filter: url(#project-scroll-ripple-filter) url(#project-ripple-filter-1)"
                alt=""
              />
            </div>
            <div class="ruler-line ruler-line--v" style="left: 289px"></div>
            <div class="ruler-line ruler-line--v" style="left: 578px"></div>
            <div class="ruler-line ruler-line--v" style="left: 864px"></div>
            <div
              v-for="y in rulerLines"
              :key="'h' + y"
              class="ruler-line ruler-line--h"
              :style="{ top: y + 'px' }"
            ></div>
            <div
              v-for="(y, i) in rulerMarkers"
              :key="'m' + y"
              class="ruler-marker"
              :style="{ top: y + 'px', '--i': i }"
            >
              <span class="ruler-marker__pill"></span>
              <span class="ruler-marker__dot" :class="{ 'ruler-marker__dot--on': dotsOn }"></span>
            </div>
            <div class="project__image-inner">
              <img :src="card1Shot" class="project__shot project__shot--1" alt="Раздел товаров для продавцов" />
            </div>
          </div>
          <div class="project__info">
            <div class="project__text">
              <h3 class="project__heading">Раздел товаров для&nbsp;продавцов</h3>
              <p class="project__desc">
                Разобралась в&nbsp;требованиях, удержала контекст и&nbsp;довела редизайн до&nbsp;запуска
              </p>
            </div>
            <ul class="project__tags">
              <li>Uzum Market</li>
              <li>B2B</li>
              <li>Web</li>
            </ul>
          </div>
        </article>

        <article
          class="project project--2 reveal"
          role="button"
          tabindex="0"
          v-reveal
          @click="emit('open-case', 'cdek-pvz')"
          @keydown.enter="emit('open-case', 'cdek-pvz')"
          @mouseenter="cardRipple2.enter(); cardReveal2.enter()"
          @mouseleave="cardRipple2.leave(); cardReveal2.leave()"
          @mousemove="cardRipple2.move($event)"
        >
          <div class="project__image" ref="cardImage2">
            <div class="project__image-inner">
              <img
                :src="card2Bg"
                class="project__bg scroll-ripple"
                style="filter: url(#project-scroll-ripple-filter) url(#project-ripple-filter-2)"
                alt=""
              />
              <div class="project__guides">
                <div
                  v-for="(box, i) in card2Guides"
                  :key="'g1-' + i"
                  class="guide-box"
                  :style="{ left: box.left + 'px', top: box.top + 'px', width: box.w + 'px', height: box.h + 'px' }"
                ></div>
                <div
                  v-for="(box, i) in card2Guides"
                  :key="'g2-' + i"
                  class="guide-box"
                  :style="{
                    left: box.left + 'px',
                    top: box.top + 400 + 'px',
                    width: box.w + 'px',
                    height: box.h + 'px',
                  }"
                ></div>
              </div>
              <img :src="card2Shot" class="project__shot project__shot--2" alt="Главный экран для сотрудников ПВЗ" />
            </div>
          </div>
          <div class="project__info">
            <div class="project__text">
              <h3 class="project__heading">Главный экран для&nbsp;сотрудников ПВЗ</h3>
              <p class="project__desc">Собрала на&nbsp;основе реальных сценариев сотрудников</p>
            </div>
            <ul class="project__tags">
              <li>CDEK</li>
              <li>B2E</li>
              <li>Mobile</li>
            </ul>
          </div>
        </article>

        <article
          class="project project--3 reveal"
          role="button"
          tabindex="0"
          v-reveal
          @click="emit('open-case', 'cdek-id')"
          @keydown.enter="emit('open-case', 'cdek-id')"
          @mouseenter="cardRipple3.enter(); cardReveal3.enter()"
          @mouseleave="cardRipple3.leave(); cardReveal3.leave()"
          @mousemove="cardRipple3.move($event)"
        >
          <div class="project__image" ref="cardImage3">
            <div class="project__image-inner">
              <img
                :src="card3Bg"
                class="project__bg scroll-ripple"
                style="filter: url(#project-scroll-ripple-filter) url(#project-ripple-filter-3)"
                alt=""
              />
              <img :src="asterisk3" class="asterisk asterisk--3" alt="" />
              <img :src="frame1Icon" class="frame1-icon" alt="" />
              <div class="passport">
                <div class="passport__line passport__line--center"></div>
                <div class="passport__ticks" style="top: 60px">
                  <span style="height: 36px"></span>
                  <span style="height: 12px"></span>
                  <span style="height: 12px"></span>
                </div>
                <div class="passport__ticks" style="top: 274px">
                  <span style="height: 36px"></span>
                  <span style="height: 12px"></span>
                  <span style="height: 12px"></span>
                </div>
                <div class="passport__photo"></div>
                <img :src="asterisk4" class="asterisk passport__asterisk" alt="" />
                <div class="passport__lines" style="left: 137px; top: 274px; width: 100px">
                  <span v-for="n in idLines.slice(0, 3)" :key="n"></span>
                </div>
                <div class="passport__lines" style="left: 84.5px; top: 60px; width: 152px">
                  <span v-for="n in idLines" :key="n"></span>
                </div>
              </div>
            </div>
          </div>
          <div class="project__info">
            <div class="project__text">
              <h3 class="project__heading">Подключение CDEK&nbsp;ID</h3>
              <p class="project__desc">Упростила процесс, в&nbsp;котором было много шагов и&nbsp;бумажной рутины</p>
            </div>
            <ul class="project__tags">
              <li>CDEK</li>
              <li>B2E</li>
              <li>Mobile</li>
            </ul>
          </div>
        </article>
      </div>
    </div>

    <div class="projects__mobile mobile-container">
      <p class="projects__mobile-title">проекты</p>

      <article
        class="project-mobile"
        role="button"
        tabindex="0"
        @click="emit('open-case', 'uzum-market')"
        @keydown.enter="emit('open-case', 'uzum-market')"
      >
        <div class="project-mobile__image project-mobile__image--square" ref="cardImageMobile1">
          <img
            :src="mobileCard1"
            alt=""
            style="filter: url(#project-ripple-filter-1)"
          />
        </div>
        <div class="project-mobile__text">
          <h3 class="project-mobile__heading">Раздел товаров для&nbsp;продавцов</h3>
          <p class="project-mobile__desc">
            Разобралась в&nbsp;требованиях, удержала контекст и&nbsp;довела редизайн до&nbsp;запуска
          </p>
        </div>
      </article>

      <article
        class="project-mobile"
        role="button"
        tabindex="0"
        @click="emit('open-case', 'cdek-pvz')"
        @keydown.enter="emit('open-case', 'cdek-pvz')"
      >
        <div class="project-mobile__image project-mobile__image--tall" ref="cardImageMobile2">
          <img
            :src="mobileCard2"
            alt=""
            style="filter: url(#project-ripple-filter-2)"
          />
        </div>
        <div class="project-mobile__text">
          <h3 class="project-mobile__heading">Главный экран для&nbsp;сотрудников ПВЗ</h3>
          <p class="project-mobile__desc">Собрала на&nbsp;основе реальных сценариев сотрудников</p>
        </div>
      </article>

      <article
        class="project-mobile"
        role="button"
        tabindex="0"
        @click="emit('open-case', 'cdek-id')"
        @keydown.enter="emit('open-case', 'cdek-id')"
      >
        <div class="project-mobile__image project-mobile__image--square" ref="cardImageMobile3">
          <img
            :src="mobileCard3"
            alt=""
            style="filter: url(#project-ripple-filter-3)"
          />
        </div>
        <div class="project-mobile__text">
          <h3 class="project-mobile__heading">Подключение CDEK&nbsp;ID</h3>
          <p class="project-mobile__desc">Упростила процесс, в&nbsp;котором было много шагов и&nbsp;бумажной рутины</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.projects {
  background: #0e0e0e;
}

.projects__frame {
  container-type: inline-size;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 1280 / 2321;
  margin: 0 auto;
  overflow: hidden;
}

.projects__stage {
  position: relative;
  width: 1280px;
  height: 2321px;
  /* transform (scale) is set by the v-scale-stage directive — see main.js */
  transform-origin: top left;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #fff;
}

.projects__title {
  position: absolute;
  left: 79px;
  top: 0;
  width: 1121px;
  margin: 0;
  font-size: 96px;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
}

.project {
  position: absolute;
  cursor: pointer;
}

.project:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 4px;
}


.project--1 {
  left: 79px;
  top: 177px;
  width: 1121px;
}

.project--2 {
  left: 368px;
  top: 880px;
  width: 832px;
}

.project--3 {
  left: 79px;
  top: 1598px;
  width: 834px;
}

.project__image {
  position: relative;
  height: 400px;
  overflow: hidden;
  margin-bottom: 40px;
}

.project__image-inner {
  position: absolute;
  inset: 0;
}

.project__bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.08);
}

.project__shot {
  position: absolute;
  display: block;
  pointer-events: none;
}

.project__shot--1 {
  left: 288px;
  top: 0;
  width: 833px;
  height: 463px;
  object-fit: cover;
  object-position: top;
}

.project__shot--2 {
  left: 255px;
  top: 0;
  width: 321px;
  height: 474px;
  object-fit: cover;
}

.project__info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.project__text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project--1 .project__text {
  width: 600px;
}

.project--2 .project__text,
.project--3 .project__text {
  width: 543px;
}

.project__heading {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
}

.project__desc {
  margin: 0;
  font-size: 20px;
  line-height: normal;
  font-weight: 400;
}

.project--1 .project__desc {
  width: 545px;
}

.project__tags {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
  flex-shrink: 0;
}

.project__tags li {
  padding: 4px 12px 5px;
  border: 1px solid #fff;
  border-left: none;
  font-size: 20px;
  line-height: normal;
  white-space: nowrap;
}

.project__tags li:first-child {
  border-left: 1px solid #fff;
}

/* card 1 — ruler overlay */
.ruler-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
}

.ruler-line--v {
  top: 0;
  width: 1px;
  height: 400px;
}

.ruler-line--h {
  left: 0;
  width: 100%;
  height: 1px;
}

.ruler-marker {
  position: absolute;
  left: 20px;
}

.ruler-marker__pill {
  display: block;
  width: 40px;
  height: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.4);
}

.ruler-marker__dot {
  position: absolute;
  left: 4px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.4);
  transition:
    left 0.3s ease,
    background 0.3s ease;
  transition-delay: calc(var(--i, 0) * 0.05s);
}

.ruler-marker__dot--on {
  left: 22px;
  background: #fff;
}

/* card 2 — guide boxes */
.project__guides {
  position: absolute;
  inset: 0;
  transform: translateY(calc(var(--my, 0) * -400px));
  transition: transform 0.2s ease;
}

.guide-box {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* card 3 — passport wireframe */
.asterisk {
  position: absolute;
  width: 85px;
  height: 83px;
  transform: rotate(calc(var(--mx, 0) * 360deg));
  transition: transform 0.2s ease;
}

.asterisk--3 {
  left: 669px;
  top: 118px;
}

.frame1-icon {
  position: absolute;
  left: 577px;
  top: 118px;
  width: 60px;
  height: 83px;
}

.passport {
  position: absolute;
  left: 256px;
  top: 40px;
  width: 321px;
  height: 428px;
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.passport__line--center {
  position: absolute;
  left: 0;
  top: 213px;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.4);
}

.passport__ticks {
  position: absolute;
  left: 301px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0.4;
}

.passport__ticks span {
  display: block;
  width: 4px;
  background: #fff;
}

.passport__photo {
  position: absolute;
  left: 32px;
  top: 254px;
  width: 84px;
  height: 108px;
}

.passport__asterisk {
  left: 33px;
  top: 255px;
}

.passport__lines {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 16px;
  opacity: 0.4;
}

.passport__lines span {
  display: block;
  width: 100%;
  height: 4px;
  background: #fff;
}

.projects__mobile {
  display: none;
}

@media (max-width: 767px) {
  .projects__frame {
    display: none;
  }

  .projects__mobile {
    display: block;
    padding-block: 56px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #fff;
  }

  .projects__mobile-title {
    margin: 0 0 40px;
    font-size: clamp(32px, 12vw, 48px);
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  .project-mobile {
    display: flex;
    flex-direction: column;
    gap: 24px;
    cursor: pointer;
  }

  .project-mobile + .project-mobile {
    margin-top: 80px;
  }

  .project-mobile:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 4px;
  }

  .project-mobile__image {
    width: 100%;
    max-width: 440px;
    overflow: hidden;
  }

  .project-mobile__image--square {
    aspect-ratio: 1 / 1;
  }

  .project-mobile__image--tall {
    aspect-ratio: 350 / 400;
  }

  .project-mobile__image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .project-mobile__text {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .project-mobile__heading {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  .project-mobile__desc {
    margin: 0;
    font-size: 16px;
    line-height: normal;
  }
}
</style>
