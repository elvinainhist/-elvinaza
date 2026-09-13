<script setup>
import { ref, watch } from 'vue'
import exportIcon from '../assets/hero/export-icon.svg'
import { createHoverRipple } from '../hoverRipple'

const mobileMenuOpen = ref(false)

// Same melt as everywhere else on the site (intensity 65, matching the
// scroll-ripple's own ceiling) — a quick burst riding the menu's own
// open/close fade, not a hover effect, so it fires once per toggle instead
// of tracking the pointer.
const menuWarp = createHoverRipple('mobile-menu-displacement', null, 65)

watch(mobileMenuOpen, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
  menuWarp.enter()
  setTimeout(() => menuWarp.leave(), 220)
})

const navRippleLinkedin = createHoverRipple('nav-ripple-displacement-linkedin', 'nav-ripple-offset-linkedin', 22)
const navRippleEmail = createHoverRipple('nav-ripple-displacement-email', 'nav-ripple-offset-email', 22)
const navRippleTelegram = createHoverRipple('nav-ripple-displacement-telegram', 'nav-ripple-offset-telegram', 22)
const navRippleCv = createHoverRipple('nav-ripple-displacement-cv', 'nav-ripple-offset-cv', 22)
</script>

<template>
  <header class="site-header">
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <!-- Same noise field as the Hero photo / Projects cards / Contact
           cloud (fractalNoise + numOctaves=3), but no edge-safe erode+blur
           containment: that chain assumes a photo with content past its
           edges worth protecting — on this full-bleed solid panel, at rest
           it left a faint ring visible against the flat background (the
           blur softening the alpha right at its ~20px inset never quite
           cancels out to nothing the way it does over photo detail). The
           panel's own edges sit flush with the screen/header, so there's
           nothing there that needs protecting anyway. -->
      <filter id="mobile-menu-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="61" result="noise" />
        <feDisplacementMap
          id="mobile-menu-displacement"
          in="SourceGraphic"
          in2="noise"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="nav-ripple-filter-linkedin" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="27" result="noise" />
        <feOffset id="nav-ripple-offset-linkedin" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="nav-ripple-displacement-linkedin"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="nav-ripple-filter-email" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="33" result="noise" />
        <feOffset id="nav-ripple-offset-email" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="nav-ripple-displacement-email"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="nav-ripple-filter-telegram" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="41" result="noise" />
        <feOffset id="nav-ripple-offset-telegram" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="nav-ripple-displacement-telegram"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="nav-ripple-filter-cv" x="-40%" y="-40%" width="180%" height="180%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="49" result="noise" />
        <feOffset id="nav-ripple-offset-cv" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="nav-ripple-displacement-cv"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>

    <div class="site-header__frame">
      <div class="site-header__inner" v-scale-stage="1280">
        <p class="site-header__name">Эльвина Захарова</p>

        <ul class="site-header__social">
          <li>
            <a
              href="https://www.linkedin.com/in/elvina-zakharova-25a563173?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
              target="_blank"
              rel="noopener"
              class="site-header__link"
              style="filter: url(#nav-ripple-filter-linkedin)"
              @mouseenter="navRippleLinkedin.enter"
              @mouseleave="navRippleLinkedin.leave"
              @mousemove="navRippleLinkedin.move($event)"
              >LinkedIn</a
            >
          </li>
          <li>
            <a
              href="mailto:elvinainhist@gmail.com"
              class="site-header__link"
              style="filter: url(#nav-ripple-filter-email)"
              @mouseenter="navRippleEmail.enter"
              @mouseleave="navRippleEmail.leave"
              @mousemove="navRippleEmail.move($event)"
              >E-mail</a
            >
          </li>
          <li>
            <a
              href="https://t.me/elvinaza"
              target="_blank"
              rel="noopener"
              class="site-header__link site-header__link--alt"
              style="filter: url(#nav-ripple-filter-telegram)"
              @mouseenter="navRippleTelegram.enter"
              @mouseleave="navRippleTelegram.leave"
              @mousemove="navRippleTelegram.move($event)"
              >Telegram</a
            >
          </li>
        </ul>

        <a
          href="/zakharova-elvina-cv.pdf"
          target="_blank"
          rel="noopener"
          class="site-header__cv"
          @mouseenter="navRippleCv.enter"
          @mouseleave="navRippleCv.leave"
          @mousemove="navRippleCv.move($event)"
        >
          <span class="site-header__cv-content" style="filter: url(#nav-ripple-filter-cv)">
            <img :src="exportIcon" class="site-header__cv-icon" alt="" />
            Скачать CV
          </span>
        </a>
      </div>
    </div>

    <div class="site-header__mobile mobile-container">
      <p class="site-header__name site-header__name--mobile">Эльвина Захарова</p>

      <button
        type="button"
        class="site-header__menu-toggle"
        :class="{ 'is-open': mobileMenuOpen }"
        :aria-expanded="mobileMenuOpen"
        aria-label="Меню"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <span class="site-header__menu-line site-header__menu-line--1"></span>
        <span class="site-header__menu-line site-header__menu-line--2"></span>
        <span class="site-header__menu-line site-header__menu-line--3"></span>
      </button>
    </div>

    <Transition name="site-header__mobile-menu-fade">
      <div v-if="mobileMenuOpen" class="site-header__mobile-menu" style="filter: url(#mobile-menu-filter)">
        <ul class="site-header__mobile-menu-links">
          <li>
            <a
              href="https://www.linkedin.com/in/elvina-zakharova-25a563173?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
              target="_blank"
              rel="noopener"
              class="site-header__link"
              style="filter: url(#nav-ripple-filter-linkedin)"
              @mouseenter="navRippleLinkedin.enter"
              @mouseleave="navRippleLinkedin.leave"
              @mousemove="navRippleLinkedin.move($event)"
              >LinkedIn</a
            >
          </li>
          <li>
            <a
              href="mailto:elvinainhist@gmail.com"
              class="site-header__link"
              style="filter: url(#nav-ripple-filter-email)"
              @mouseenter="navRippleEmail.enter"
              @mouseleave="navRippleEmail.leave"
              @mousemove="navRippleEmail.move($event)"
              >E-mail</a
            >
          </li>
          <li>
            <a
              href="https://t.me/elvinaza"
              target="_blank"
              rel="noopener"
              class="site-header__link site-header__link--alt"
              style="filter: url(#nav-ripple-filter-telegram)"
              @mouseenter="navRippleTelegram.enter"
              @mouseleave="navRippleTelegram.leave"
              @mousemove="navRippleTelegram.move($event)"
              >Telegram</a
            >
          </li>
        </ul>
        <a
          href="/zakharova-elvina-cv.pdf"
          target="_blank"
          rel="noopener"
          class="site-header__cv site-header__mobile-menu-cv"
          @mouseenter="navRippleCv.enter"
          @mouseleave="navRippleCv.leave"
          @mousemove="navRippleCv.move($event)"
        >
          <span class="site-header__cv-content" style="filter: url(#nav-ripple-filter-cv)">
            <img :src="exportIcon" class="site-header__cv-icon" alt="" />
            Скачать CV
          </span>
        </a>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  background: #0e0e0e;
  border-bottom: 1px solid #fff;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.site-header__frame {
  container-type: inline-size;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 1280 / 48;
  margin: 0 auto;
  overflow: hidden;
}

.site-header__inner {
  width: 1280px;
  /* transform (scale) is set by the v-scale-stage directive — see main.js */
  transform-origin: top left;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  padding-inline: 80px;
}

.site-header__mobile,
.site-header__mobile-menu {
  display: none;
}

.site-header__name {
  justify-self: start;
  margin: 0;
  padding: 14px 14px 14px 0;
  color: #fff;
  font-family: 'Golos Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 16px;
  text-transform: uppercase;
  white-space: nowrap;
}

.site-header__social {
  display: flex;
  justify-self: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-header__link {
  display: block;
  padding: 14px;
  color: #fff;
  font-family: 'Golos Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 16px;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}

.site-header__link--alt {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.site-header__cv {
  display: flex;
  justify-self: end;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 14px 14px;
  background: #fff;
  color: #0e0e0e;
  font-size: 16px;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}

.site-header__cv-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.site-header__cv-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 767px) {
  .site-header__frame {
    display: none;
  }

  .site-header__mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
  }

  .site-header__name--mobile {
    padding: 0;
    line-height: 16px;
  }

  .site-header__menu-toggle {
    position: relative;
    appearance: none;
    border: none;
    background: transparent;
    padding: 0;
    width: 44px;
    height: 44px;
    cursor: pointer;
  }

  .site-header__menu-line {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 32px;
    height: 1px;
    background: #fff;
    transform: translate(-50%, -50%) translateY(var(--menu-line-offset, 0));
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }

  .site-header__menu-line--1 {
    --menu-line-offset: -9px;
  }

  .site-header__menu-line--3 {
    --menu-line-offset: 9px;
  }

  .site-header__menu-toggle.is-open .site-header__menu-line--1 {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .site-header__menu-toggle.is-open .site-header__menu-line--2 {
    opacity: 0;
  }

  .site-header__menu-toggle.is-open .site-header__menu-line--3 {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  .site-header__mobile-menu-fade-enter-active {
    transition:
      opacity 0.45s cubic-bezier(0.25, 0.8, 0.25, 1),
      transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .site-header__mobile-menu-fade-leave-active {
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }

  .site-header__mobile-menu-fade-enter-from,
  .site-header__mobile-menu-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

  .site-header__mobile-menu {
    position: fixed;
    top: 45px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    flex-direction: column;
    background: #0e0e0e;
  }

  .site-header__mobile-menu-links {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 12px;
    margin: 0;
    padding: 24px 20px;
    list-style: none;
  }

  .site-header__mobile-menu-links .site-header__link {
    text-align: center;
  }

  .site-header__mobile-menu-cv {
    justify-self: stretch;
    justify-content: center;
    padding: 14px 16px;
  }
}
</style>
