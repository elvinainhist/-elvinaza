<script setup>
import bannerImg from '../assets/contact/banner.webp'
import { createHoverRipple } from '../hoverRipple'
import { createDissolveReveal } from '../dissolveReveal'

// Shapes the cloud's warp (below) so it grows/shrinks from organic patches
// on hover-enter/leave instead of covering the whole image evenly.
const cloudReveal = createDissolveReveal('contact-cloud-reveal-threshold')
// Same melt intensity as the Hero photo/project cards and the scroll-ripple
// ceiling (65) — kept separate from the links/knob/door below (22, a much
// finer ripple meant for text) since sharing one intensity made the cloud's
// warp read far fainter than the rest of the site's melt effect.
const cloudWarp = createHoverRipple('contact-cloud-displacement', 'contact-cloud-offset', 65)

const linkRippleLinkedin = createHoverRipple(
  ['contact-link-displacement-linkedin', 'contact-knob-displacement', 'contact-door-displacement'],
  ['contact-link-offset-linkedin', 'contact-knob-offset', 'contact-door-offset'],
  22,
)
const linkRippleEmail = createHoverRipple(
  ['contact-link-displacement-email', 'contact-knob-displacement', 'contact-door-displacement'],
  ['contact-link-offset-email', 'contact-knob-offset', 'contact-door-offset'],
  22,
)
const linkRippleTelegram = createHoverRipple(
  ['contact-link-displacement-telegram', 'contact-knob-displacement', 'contact-door-displacement'],
  ['contact-link-offset-telegram', 'contact-knob-offset', 'contact-door-offset'],
  22,
)
</script>

<template>
  <section class="contact">
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <filter id="contact-link-filter-linkedin" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="5" result="noise" />
        <feOffset id="contact-link-offset-linkedin" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="contact-link-displacement-linkedin"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="contact-link-filter-email" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="13" result="noise" />
        <feOffset id="contact-link-offset-email" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="contact-link-displacement-email"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="contact-link-filter-telegram" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="21" result="noise" />
        <feOffset id="contact-link-offset-telegram" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="contact-link-displacement-telegram"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="contact-knob-filter" x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="2" seed="37" result="noise" />
        <feOffset id="contact-knob-offset" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="contact-knob-displacement"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="contact-door-filter" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.015 0.03" numOctaves="2" seed="43" result="noise" />
        <feOffset id="contact-door-offset" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="contact-door-displacement"
          in="SourceGraphic"
          in2="noise-shifted"
          scale="0"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <!-- Same melt warp as the Hero photo and project cards, plus a
           second animated threshold (src/dissolveReveal.js) that grows/
           shrinks the warp from organic patches on hover instead of
           covering the image evenly. -->
      <filter id="contact-cloud-filter" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="29" result="noise" />
        <feOffset id="contact-cloud-offset" in="noise" dx="0" dy="0" result="noise-shifted" />
        <feDisplacementMap
          id="contact-cloud-displacement"
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
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="79" result="reveal-noise" />
        <feColorMatrix in="reveal-noise" type="luminanceToAlpha" result="reveal-noise-alpha" />
        <feComponentTransfer in="reveal-noise-alpha" result="reveal-mask">
          <feFuncA id="contact-cloud-reveal-threshold" type="linear" slope="2.5" intercept="-2.5" />
        </feComponentTransfer>
        <feComposite in="warped-inset" in2="reveal-mask" operator="in" result="warped-revealed" />
        <feComposite in="warped-revealed" in2="SourceGraphic" operator="over" />
      </filter>
    </svg>

    <div class="contact__frame">
      <div class="contact__stage" v-scale-stage="1280">
        <div class="contact__door reveal" v-reveal>
          <div class="contact__glass">
            <a
              href="https://www.linkedin.com/in/elvina-zakharova-25a563173?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
              target="_blank"
              rel="noopener"
              class="contact__link"
              style="filter: url(#contact-link-filter-linkedin)"
              @mouseenter="linkRippleLinkedin.enter(); cloudWarp.enter(); cloudReveal.enter()"
              @mouseleave="linkRippleLinkedin.leave(); cloudWarp.leave(); cloudReveal.leave()"
              @mousemove="linkRippleLinkedin.move($event)"
              >linkedin</a
            >
            <a
              href="mailto:elvinainhist@gmail.com"
              class="contact__link"
              style="filter: url(#contact-link-filter-email)"
              @mouseenter="linkRippleEmail.enter(); cloudWarp.enter(); cloudReveal.enter()"
              @mouseleave="linkRippleEmail.leave(); cloudWarp.leave(); cloudReveal.leave()"
              @mousemove="linkRippleEmail.move($event)"
              >e-mail</a
            >
            <a
              href="https://t.me/elvinaza"
              target="_blank"
              rel="noopener"
              class="contact__link"
              style="filter: url(#contact-link-filter-telegram)"
              @mouseenter="linkRippleTelegram.enter(); cloudWarp.enter(); cloudReveal.enter()"
              @mouseleave="linkRippleTelegram.leave(); cloudWarp.leave(); cloudReveal.leave()"
              @mousemove="linkRippleTelegram.move($event)"
              >Telegram</a
            >
            <span
              class="contact__knob"
              style="filter: url(#scroll-ripple-filter) url(#contact-knob-filter)"
            ></span>
          </div>
        </div>

        <div class="contact__banner reveal" v-reveal>
          <img :src="bannerImg" alt="" class="scroll-ripple" style="filter: url(#scroll-ripple-filter) url(#contact-cloud-filter)" />
        </div>
      </div>
    </div>

    <div class="contact__mobile mobile-container">
      <div class="contact__mobile-frame">
        <div class="contact__mobile-stage" v-scale-stage="350">
          <div class="contact__mobile-door">
            <div class="contact__mobile-glass">
              <div class="contact__mobile-links">
                <a
                  href="https://www.linkedin.com/in/elvina-zakharova-25a563173?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
                  target="_blank"
                  rel="noopener"
                  class="contact__mobile-link"
                  style="filter: url(#contact-link-filter-linkedin)"
                  @mouseenter="linkRippleLinkedin.enter(); cloudWarp.enter(); cloudReveal.enter()"
                  @mouseleave="linkRippleLinkedin.leave(); cloudWarp.leave(); cloudReveal.leave()"
                  @mousemove="linkRippleLinkedin.move($event)"
                  >linkedin</a
                >
                <a
                  href="mailto:elvinainhist@gmail.com"
                  class="contact__mobile-link"
                  style="filter: url(#contact-link-filter-email)"
                  @mouseenter="linkRippleEmail.enter(); cloudWarp.enter(); cloudReveal.enter()"
                  @mouseleave="linkRippleEmail.leave(); cloudWarp.leave(); cloudReveal.leave()"
                  @mousemove="linkRippleEmail.move($event)"
                  >e-mail</a
                >
                <a
                  href="https://t.me/elvinaza"
                  target="_blank"
                  rel="noopener"
                  class="contact__mobile-link"
                  style="filter: url(#contact-link-filter-telegram)"
                  @mouseenter="linkRippleTelegram.enter(); cloudWarp.enter(); cloudReveal.enter()"
                  @mouseleave="linkRippleTelegram.leave(); cloudWarp.leave(); cloudReveal.leave()"
                  @mousemove="linkRippleTelegram.move($event)"
                  >Telegram</a
                >
              </div>
              <span class="contact__mobile-knob" style="filter: url(#contact-knob-filter)"></span>
            </div>
          </div>

        </div>
      </div>

      <!-- Sibling of .contact__mobile-frame, not a child of it: the frame
           has its own overflow:hidden (needed so its height actually
           follows its aspect-ratio instead of the stage's raw pre-
           transform box — see that rule's comment) which was clipping this
           down to the frame's own (mobile-container-padded, ~350-440px)
           width no matter what width was set here — the element's own box
           was genuinely 100vw, it just never visibly rendered past the
           frame's edge. Sitting outside the frame like this, with nothing
           else in .contact__mobile to clip it, is what actually lets it
           bleed to the real screen edges. Also outside .contact__mobile-
           stage for a second, separate reason: the stage is scaled via
           v-scale-stage with a top-left transform-origin, so a viewport-
           relative width placed inside it doesn't render at its true size
           — it scales (and shifts, since the origin isn't centered) with
           everything else.
           Two nested boxes matching the Figma frame's own numbers (node
           1235:7095): Figma's 390px frame holds a 512px-wide banner
           window (already 31% wider than the frame, bleeding off both
           edges) containing the image at top:-154.75% height:424.31% of
           that window. .contact__mobile-banner-viewport is the visible,
           full-bleed screen width (what Figma's 390 frame plays here);
           .contact__mobile-banner-crop reproduces the 512:390 oversize
           ratio against it (rather than hard-coding 512px) so the same
           bleed-relative-to-screen proportions hold at any width; the
           image's crop percentages (see its own comment) are tuned
           independently of Figma's, to cut the cloud off before its own
           natural lower edge instead of showing the whole shape. -->
      <div class="contact__mobile-banner-viewport">
        <div class="contact__mobile-banner-crop">
          <div class="contact__mobile-banner">
            <img :src="bannerImg" alt="" style="filter: url(#contact-cloud-filter)" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: #0e0e0e;
}

.contact__frame {
  container-type: inline-size;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 1280 / 763;
  margin: 0 auto;
  /* Not clipped: the door frame's warp needs room to bleed past the stage
     edge on every side. .contact__banner is sized to its own visible
     window below instead of relying on this to crop its overhang. */
  overflow: visible;
}

.contact__stage {
  position: relative;
  width: 1280px;
  height: 763px;
  /* transform (scale) is set by the v-scale-stage directive — see main.js */
  transform-origin: top left;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.contact__door {
  position: absolute;
  left: 369px;
  top: 0;
  width: 544px;
  height: 695px;
  border: 1px solid transparent;
  box-sizing: border-box;
}

.contact__door::before {
  /* The frame line lives on its own box so it can warp independently of
     the glass/links/knob inside — filtering .contact__door itself would
     drag its whole subtree through the same displacement. */
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid #5b92df;
  filter: url(#scroll-ripple-filter) url(#contact-door-filter);
  pointer-events: none;
}

.contact__glass {
  position: absolute;
  left: 32px;
  top: 32px;
  width: 480px;
  height: 663px;
  background: linear-gradient(to bottom, #0773cd, #77b1e3);
}

.contact__link {
  position: absolute;
  left: 0;
  width: 100%;
  color: #fff;
  font-family: 'Golos Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 24px;
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
}

.contact__link:nth-child(1) {
  top: 132px;
}

.contact__link:nth-child(2) {
  top: 185px;
}

.contact__link:nth-child(3) {
  top: 238px;
}

.contact__knob {
  position: absolute;
  left: 404px;
  top: 309px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #0e0e0e;
}

.contact__banner {
  position: absolute;
  left: 50%;
  top: 514px;
  /* Height trimmed to exactly what the 763-tall stage has left below this
     top (763 - 514) — was 362px, cropped to this same visible slice by
     the frame's old overflow:hidden. Sized to it directly now that the
     frame no longer clips. */
  width: 1024px;
  height: 249px;
  transform: translateX(-50%);
  overflow: hidden;
}

.contact__banner img {
  position: absolute;
  left: -20px;
  top: -560px;
  width: 1064px;
  height: 1536px;
  display: block;
}

.contact__mobile {
  display: none;
}

@media (max-width: 767px) {
  .contact__frame {
    display: none;
  }

  .contact {
    /* Same reasoning as .contact__frame on desktop: not clipped, so the
       door frame's warp can bleed on every side. */
    overflow: visible;
  }

  .contact__mobile {
    position: relative;
    display: block;
    padding-top: 56px;
  }

  .contact__mobile-frame {
    position: relative;
    container-type: inline-size;
    width: 100%;
    aspect-ratio: 350 / 457;
    /* Without this, the frame's height wasn't actually governed by the
       aspect-ratio above at narrower widths: .contact__mobile-stage keeps
       its full 457px pre-transform layout box regardless of how much the
       v-scale-stage transform visually shrinks it, and that raw box was
       winning over the (smaller) aspect-ratio-preferred height — leaving
       the frame taller than the visibly-scaled door, and the bottom-
       anchored cloud crop anchored to that too-low point, opening a gap
       between the door and the clouds. */
    overflow: hidden;
  }

  .contact__mobile-stage {
    position: relative;
    width: 350px;
    height: 457px;
    /* transform (scale) is set by the v-scale-stage directive — see main.js */
    transform-origin: top left;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  .contact__mobile-door {
    position: absolute;
    left: 0;
    top: 0;
    width: 350px;
    height: 448px;
    border: 1px solid transparent;
    box-sizing: border-box;
    padding: 24px 24px 5px;
  }

  .contact__mobile-door::before {
    content: '';
    position: absolute;
    inset: 0;
    /* No bottom edge: the clouds' own jagged top silhouette doesn't
       reliably cover a full-width line down there (it dips below it at
       the gaps between tufts, near the corners especially), so a drawn
       bottom border peeks out under the cloud instead of "closing" it. */
    border: 1px solid #5b92df;
    border-bottom: none;
    filter: url(#contact-door-filter);
    pointer-events: none;
  }

  .contact__mobile-glass {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(to bottom, #0773cd, #77b1e3);
  }

  .contact__mobile-links {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 270px;
    max-width: calc(100% - 32px);
    margin: 56px auto 0;
  }

  .contact__mobile-link {
    display: block;
    padding: 12px 0;
    color: #fff;
    font-family: 'Golos Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 16px;
    text-transform: uppercase;
    text-align: center;
    text-decoration: none;
  }

  .contact__mobile-knob {
    position: absolute;
    left: 262px;
    top: 192px;
    width: 24px;
    height: 25px;
    border-radius: 50%;
    background: #0e0e0e;
  }

  .contact__mobile-banner-viewport {
    /* Bleeds past the door's own width (and the mobile-container's side
       gutters) to the true screen edges — the clouds read as a full-width
       backdrop the door sits in front of, not something boxed in by it.
       This is the visible window; .contact__mobile-banner-crop below is
       deliberately wider than it (see that rule) and gets clipped here.
       No visible bottom edge to the cloud on purpose — the crop below
       stops well short of the cloud's own natural (shadowed, tapering)
       lower edge, so what's on screen always reads as "the top of a much
       bigger cloud, cut off by the screen" rather than a complete shape
       sitting inside the frame. */
    position: absolute;
    left: 50%;
    bottom: 0;
    /* True 100vw, not capped to the mobile-container's own 480px max-width
       — "full width of the screen" means the actual screen here, not just
       the content column (the door/text above stay in that column; this
       is a full-bleed backdrop behind it). */
    width: 100vw;
    height: calc(100vw / 3);
    transform: translateX(-50%);
    overflow: hidden;
    pointer-events: none;
  }

  .contact__mobile-banner-crop {
    /* Wider than the viewport above (35%, bleeding off both edges) so the
       cloud's own tapered left/right edges (it's a single puffy shape on a
       plain background, not an edge-to-edge texture) never come into view
       — only its solid center, stretched to fill the full screen width. */
    position: absolute;
    left: 50%;
    top: 0;
    width: 135%;
    height: 100%;
    transform: translateX(-50%);
    overflow: hidden;
  }

  .contact__mobile-banner {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .contact__mobile-banner img {
    /* Crops to a band starting just above the cloud's own top (~37% down
       the source image) and ending well before its shadowed base (~54%,
       short of where it starts fading out around 56-60%) — found by
       scanning the source photo's own alpha channel for where the cloud
       itself actually is, not carried over from Figma's own crop for this
       node (which runs past the cloud's natural end, showing the whole
       shape instead of cutting it off). */
    position: absolute;
    left: 0;
    top: -224.775%;
    width: 100%;
    height: 607.5%;
    display: block;
  }
}
</style>
