<script setup>
import dot from '../assets/results/dot.svg'
import divider1 from '../assets/results/divider-1.svg'
import divider2 from '../assets/results/divider-2.svg'
import divider3 from '../assets/results/divider-3.svg'

import s1a from '../assets/results/stem-01.svg'
import s1b from '../assets/results/stem-02.svg'
import s1c from '../assets/results/stem-03.svg'
import s1d from '../assets/results/stem-04.svg'
import s1e from '../assets/results/stem-05.svg'

import s2a from '../assets/results/stem-06.svg'
import s2b from '../assets/results/stem-07.svg'
import s2c from '../assets/results/stem-08.svg'
import s2d from '../assets/results/stem-09.svg'

import s3a from '../assets/results/stem-10.svg'
import s3b from '../assets/results/stem-11.svg'
import s3c from '../assets/results/stem-12.svg'
import s3d from '../assets/results/stem-13.svg'
import s3e from '../assets/results/stem-14.svg'
import s3f from '../assets/results/stem-15.svg'
import s3g from '../assets/results/stem-16.svg'
import s3h from '../assets/results/stem-17.svg'
import s3i from '../assets/results/stem-18.svg'
import s3j from '../assets/results/stem-19.svg'
import s3k from '../assets/results/stem-20.svg'

const section1Stems = [
  { src: s1a, left: 298.5, top: 450, w: 297.5, h: 140.04, static: true },
  { src: s1b, left: 680, top: 483.39, w: 45, h: 106.61, ox: 1 },
  { src: s1c, left: 703, top: 440.54, w: 217, h: 148.96, static: true },
  { src: s1d, left: 443, top: 479, w: 196.5, h: 110.4, flip: true, ox: 0 },
  { src: s1e, left: 642.22, top: 319, w: 17.08, h: 271.5, static: true },
]
const section1Dots = [
  { left: 640, top: 304 },
  { left: 924, top: 452 },
  { left: 283, top: 457 },
]

const section2Stems = [
  { src: s2a, left: 796, top: 999.96, w: 126.5, h: 266.47, static: true },
  { src: s2b, left: 714.82, top: 886, w: 63.74, h: 380.5, static: true },
  { src: s2c, left: 421.68, top: 951, w: 329.63, h: 315.5, static: true },
  { src: s2d, left: 786.07, top: 1224.5, w: 116.93, h: 41.95, ox: 1 },
]
const section2Dots = [
  { left: 714, top: 872 },
  { left: 924, top: 1028 },
  { left: 406, top: 947 },
]

const section3Stems = [
  { src: s3a, left: 236.84, top: 1746, w: 9.86, h: 195.5, phase: 0, ox: 20 },
  // grouped with s3c (one shape, per design) — s3c reaches a dot, so both stay static
  { src: s3b, left: 853.29, top: 1749, w: 9.86, h: 195.5, flip: true, static: true },
  { src: s3c, left: 854.5, top: 1602, w: 76.52, h: 212, static: true },
  { src: s3d, left: 266, top: 1726, w: 19.16, h: 216, flip: true, phase: 1, ox: 11 },
  // grouped with s3i (one shape, per design) — s3i reaches a dot, so both stay static
  { src: s3g, left: 209, top: 1686, w: 9, h: 256, static: true },
  { src: s3h, left: 704, top: 1866.78, w: 94, h: 78.21, phase: 3, ox: 99 },
  { src: s3i, left: 165, top: 1678.5, w: 50.5, h: 94.5, static: true },
  { src: s3j, left: 255.32, top: 1605, w: 97.68, h: 337, static: true },
  { src: s3k, left: 751, top: 1605, w: 93.68, h: 340, flip: true, static: true },
]
const section3Dots = [
  { left: 156, top: 1663 },
  { left: 352, top: 1590 },
  { left: 926, top: 1586 },
  { left: 742, top: 1590 },
]
</script>

<template>
  <section class="results">
    <div class="results__frame">
      <div class="results__stage" v-scale-stage="1280">
        <p class="results__title reveal" v-reveal>результаты</p>

        <!-- Uzum Market -->
        <div class="results__heading reveal" v-reveal style="left: 80px; top: 177px; width: 540px">
          <h3 class="results__heading-name">Uzum&nbsp;Market</h3>
          <p class="results__heading-desc" style="width: 244px">Платное продвижение для&nbsp;продавцов</p>
        </div>

        <img
          v-for="(s, i) in section1Stems"
          :key="'s1' + i"
          :src="s.src"
          class="stem scroll-ripple"
          :class="{ 'stem--flip': s.flip, 'stem--static': s.static }"
          :style="{
            left: s.left + 'px',
            top: s.top + 'px',
            width: s.w + 'px',
            height: s.h + 'px',
            '--i': i,
            '--ox': s.ox ?? 50,
          }"
          alt=""
        />
        <img
          v-for="(d, i) in section1Dots"
          :key="'d1' + i"
          :src="dot"
          class="dot"
          :style="{ left: d.left + 'px', top: d.top + 'px' }"
          alt=""
        />

        <div class="metric reveal" v-reveal style="left: 80px; top: 444px; width: 256px">
          <p class="metric__number" style="color: #c879d3" v-count-up>×3–×5</p>
          <p class="metric__desc">Повлияла на&nbsp;рост дохода от&nbsp;рекламы, улучшив UX аукциона и&nbsp;ставок</p>
        </div>
        <div class="metric reveal reveal--delay-1" v-reveal style="left: 658px; top: 296px; width: 256px">
          <p class="metric__number" style="color: #c879d3" v-count-up>9&nbsp;исследований</p>
          <p class="metric__desc">Провожу юзабилити-тестирования и&nbsp;продуктовые интервью</p>
        </div>
        <div class="metric reveal reveal--delay-2" v-reveal style="left: 944px; top: 444px; width: 256px">
          <p class="metric__number" style="color: #c879d3" v-count-up>3&nbsp;новых продукта</p>
          <p class="metric__desc">Веду запуск продуктов, от&nbsp;концепта до&nbsp;планирования итераций</p>
        </div>

        <img :src="divider1" class="divider reveal" v-reveal style="top: 650px" alt="" />

        <!-- CDEK -->
        <div class="results__heading reveal" v-reveal style="left: 80px; top: 750px; width: 518px">
          <h3 class="results__heading-name">CDEK</h3>
          <p class="results__heading-desc" style="width: 213px">Внутренняя система для&nbsp;сотрудников</p>
        </div>

        <img
          v-for="(s, i) in section2Stems"
          :key="'s2' + i"
          :src="s.src"
          class="stem scroll-ripple"
          :class="{ 'stem--flip': s.flip, 'stem--static': s.static }"
          :style="{
            left: s.left + 'px',
            top: s.top + 'px',
            width: s.w + 'px',
            height: s.h + 'px',
            '--i': i,
            '--ox': s.ox ?? 50,
          }"
          alt=""
        />
        <img
          v-for="(d, i) in section2Dots"
          :key="'d2' + i"
          :src="dot"
          class="dot"
          :style="{ left: d.left + 'px', top: d.top + 'px' }"
          alt=""
        />

        <div class="metric reveal" v-reveal style="left: 368px; top: 939px; width: 256px">
          <p class="metric__number" style="color: #c4ee7f" v-count-up>×2</p>
          <p class="metric__desc">Ускорила подключение<br />CDEK&nbsp;ID для&nbsp;сотрудников ПВЗ</p>
        </div>
        <p
          class="metric__desc metric__desc--standalone reveal reveal--delay-1"
          v-reveal
          style="left: 656px; top: 799px; width: 256px"
        >
          Перестроила главный экран приложения для&nbsp;сотрудников ПВЗ. MAU&nbsp;12&nbsp;тыс.
        </p>
        <p
          class="metric__desc metric__desc--standalone reveal reveal--delay-2"
          v-reveal
          style="left: 944px; top: 1025px; width: 256px"
        >
          Вместе с&nbsp;дизайн-лидом разрабатывала гайдлайны для&nbsp;команды
        </p>

        <img :src="divider2" class="divider reveal" v-reveal style="top: 1327px" alt="" />

        <!-- Магнит Аптека -->
        <h3
          class="results__heading-name results__heading-name--standalone reveal"
          v-reveal
          style="left: 80px; top: 1427px"
        >
          МАгнит&nbsp;аптека
        </h3>
        <p class="results__heading-desc reveal reveal--delay-1" v-reveal style="left: 80px; top: 1506px; width: 287px">
          Спроектировала редизайн сайта Магнит&nbsp;Аптеки
        </p>
        <p
          class="results__heading-desc reveal reveal--delay-2"
          v-reveal
          style="left: 656px; top: 1506px; width: 288px"
        >
          Разработала флоу Аптеки для&nbsp;приложения Магнит
        </p>

        <img
          v-for="(s, i) in section3Stems"
          :key="'s3' + i"
          :src="s.src"
          class="stem scroll-ripple"
          :class="{ 'stem--flip': s.flip, 'stem--static': s.static }"
          :style="{
            left: s.left + 'px',
            top: s.top + 'px',
            width: s.w + 'px',
            height: s.h + 'px',
            '--i': s.phase ?? i,
            '--ox': s.ox ?? 50,
          }"
          alt=""
        />

        <!-- s3e + s3f: one shape (stem + twig growing out of it) — the twig is a
             rigid child of the stem so it inherits the stem's own root pivot -->
        <div class="stem-group" style="left: 809.5px; top: 1857.5px; width: 15.94px; height: 87.5px; --i: 2; --ox: 97">
          <img :src="s3e" class="stem--flip scroll-ripple" style="left: 1.5px; top: 0; width: 14.44px; height: 87.5px" alt="" />
          <img :src="s3f" class="scroll-ripple" style="left: 0; top: 21px; width: 15.5px; height: 12.5px" alt="" />
        </div>

        <img
          v-for="(d, i) in section3Dots"
          :key="'d3' + i"
          :src="dot"
          class="dot"
          :style="{ left: d.left + 'px', top: d.top + 'px' }"
          alt=""
        />

        <div class="metric reveal" v-reveal style="left: 80px; top: 1582px; width: 209px">
          <p class="metric__number" style="color: #5bc6f5" v-count-up>+7,4%</p>
          <p class="metric__desc">Конверсия в&nbsp;добавление в&nbsp;корзину</p>
        </div>
        <div class="metric reveal reveal--delay-1" v-reveal style="left: 369px; top: 1582px; width: 225px">
          <p class="metric__number" style="color: #5bc6f5" v-count-up>+2,4%</p>
          <p class="metric__desc">Конверсия в&nbsp;оформление заказа</p>
        </div>
        <div class="metric reveal reveal--delay-2" v-reveal style="left: 656px; top: 1578px; width: 225px">
          <p class="metric__number" style="color: #5bc6f5" v-count-up>+25%</p>
          <p class="metric__desc">Прирост заказов от&nbsp;недели к&nbsp;недели с&nbsp;момента запуска</p>
        </div>
        <div class="metric reveal reveal--delay-3" v-reveal style="left: 944px; top: 1578px; width: 206px">
          <p class="metric__number" style="color: #5bc6f5" v-count-up>19&nbsp;млн</p>
          <p class="metric__desc">MAU приложения</p>
        </div>

        <img :src="divider3" class="divider reveal" v-reveal style="top: 2002px" alt="" />
      </div>
    </div>

    <div class="results__mobile mobile-container">
      <p class="results__mobile-title reveal" v-reveal>результаты</p>

      <div class="results__mobile-block reveal" v-reveal>
        <div class="results__mobile-heading">
          <h3>Uzum&nbsp;Market</h3>
          <p>Платное продвижение для&nbsp;продавцов</p>
        </div>

        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #c879d3" v-count-up>×3–×5</p>
          <p class="results__mobile-metric-desc">Повлияла на&nbsp;рост дохода от&nbsp;рекламы, улучшив UX аукциона и&nbsp;ставок</p>
        </div>
        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #c879d3" v-count-up>9&nbsp;исследований</p>
          <p class="results__mobile-metric-desc">Провожу юзабилити-тестирования и&nbsp;продуктовые интервью</p>
        </div>
        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #c879d3" v-count-up>3&nbsp;новых продукта</p>
          <p class="results__mobile-metric-desc">Веду запуск продуктов, от&nbsp;концепта до&nbsp;планирования итераций</p>
        </div>

        <img :src="divider1" class="results__mobile-divider" alt="" />
      </div>

      <div class="results__mobile-block reveal" v-reveal>
        <div class="results__mobile-heading">
          <h3>CDEK</h3>
          <p>Внутренняя система для&nbsp;сотрудников</p>
        </div>

        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #c4ee7f" v-count-up>×2</p>
          <p class="results__mobile-metric-desc">Ускорила подключение CDEK&nbsp;ID для&nbsp;сотрудников ПВЗ</p>
        </div>
        <p class="results__mobile-metric-desc results__mobile-metric-desc--standalone">
          Перестроила главный экран приложения для&nbsp;сотрудников ПВЗ. MAU&nbsp;12&nbsp;тыс.
        </p>
        <p class="results__mobile-metric-desc results__mobile-metric-desc--standalone">
          Вместе с&nbsp;дизайн-лидом разрабатывала гайдлайны для&nbsp;команды
        </p>

        <img :src="divider2" class="results__mobile-divider" alt="" />
      </div>

      <div class="results__mobile-block reveal" v-reveal>
        <div class="results__mobile-heading">
          <h3>МАгнит&nbsp;аптека</h3>
          <p>Спроектировала редизайн сайта Магнит&nbsp;Аптеки</p>
        </div>

        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #5bc6f5" v-count-up>+7,4%</p>
          <p class="results__mobile-metric-desc">Конверсия в&nbsp;добавление в&nbsp;корзину</p>
        </div>
        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #5bc6f5" v-count-up>+2,4%</p>
          <p class="results__mobile-metric-desc">Конверсия в&nbsp;оформление заказа</p>
        </div>

        <img :src="divider3" class="results__mobile-divider" alt="" />

        <p class="results__mobile-flow-desc">Разработала флоу Аптеки для&nbsp;приложения Магнит</p>

        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #5bc6f5" v-count-up>+25%</p>
          <p class="results__mobile-metric-desc">Прирост заказов от&nbsp;недели к&nbsp;недели с&nbsp;момента запуска</p>
        </div>
        <div class="results__mobile-metric">
          <p class="results__mobile-metric-number" style="color: #5bc6f5" v-count-up>19&nbsp;млн</p>
          <p class="results__mobile-metric-desc">MAU приложения</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.results {
  background: #0e0e0e;
}

.results__frame {
  container-type: inline-size;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 1280 / 2182;
  margin: 0 auto;
  overflow: hidden;
}

.results__stage {
  position: relative;
  width: 1280px;
  height: 2182px;
  /* transform (scale) is set by the v-scale-stage directive — see main.js */
  transform-origin: top left;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #fff;
}

.results__title {
  position: absolute;
  left: 80px;
  top: 0;
  margin: 0;
  font-size: 96px;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  white-space: nowrap;
}

.results__heading {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.results__heading-name {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
}

.results__heading-name--standalone {
  position: absolute;
  white-space: nowrap;
}

.results__heading-desc {
  margin: 0;
  font-size: 20px;
  line-height: normal;
}

p.results__heading-desc {
  position: absolute;
}

.results__heading .results__heading-desc {
  position: static;
}

.metric {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric__number {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  font-style: italic;
  line-height: normal;
  font-variant-numeric: tabular-nums;
}

.metric__desc {
  margin: 0;
  font-size: 16px;
  line-height: normal;
}

.metric__desc--standalone {
  position: absolute;
}

.stem {
  position: absolute;
  display: block;
  pointer-events: none;
  transform-origin: calc(var(--ox, 50) * 1%) 100%;
  animation: stem-sway 9.6s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * 0.4s);
}

.stem--flip {
  transform: scaleX(-1);
}

.stem--static {
  animation: none;
}

.stem-group {
  position: absolute;
  transform-origin: calc(var(--ox, 50) * 1%) 100%;
  animation: stem-sway 9.6s ease-in-out infinite;
  animation-delay: calc(var(--i, 0) * 0.4s);
}

.stem-group img {
  position: absolute;
  display: block;
  pointer-events: none;
}

@keyframes stem-sway {
  0% {
    rotate: 0deg;
  }
  22% {
    rotate: 5deg;
  }
  50% {
    rotate: -3deg;
  }
  78% {
    rotate: 4deg;
  }
  100% {
    rotate: 0deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stem,
  .stem-group {
    animation: none;
  }
}

.dot {
  position: absolute;
  display: block;
  width: 12px;
  height: 12px;
}

.divider {
  position: absolute;
  left: 80px;
  width: 1120px;
  height: 1px;
}

.results__mobile {
  display: none;
}

@media (max-width: 767px) {
  .results__frame {
    display: none;
  }

  .results__mobile {
    display: block;
    padding-block: 56px;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #fff;
  }

  .results__mobile-title {
    margin: 0 0 40px;
    font-size: clamp(32px, 12vw, 48px);
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  .results__mobile-block {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .results__mobile-block + .results__mobile-block {
    margin-top: 40px;
  }

  .results__mobile-heading {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .results__mobile-heading h3 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    line-height: normal;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  .results__mobile-heading p {
    margin: 0;
    font-size: 20px;
    line-height: normal;
  }

  .results__mobile-metric {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .results__mobile-metric-number {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    font-style: italic;
    line-height: normal;
    font-variant-numeric: tabular-nums;
  }

  .results__mobile-metric-desc {
    margin: 0;
    font-size: 16px;
    line-height: normal;
  }

  .results__mobile-flow-desc {
    margin: 16px 0 0;
    font-size: 20px;
    line-height: normal;
  }

  .results__mobile-divider {
    display: block;
    width: 100%;
    height: 1px;
    margin-top: 16px;
  }
}
</style>
