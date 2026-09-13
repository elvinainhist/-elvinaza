<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import Projects from './components/Projects.vue'
import Results from './components/Results.vue'
import Contact from './components/Contact.vue'
import PasswordModal from './components/PasswordModal.vue'
import { initScrollRipple } from './scrollRipple'

const isPasswordModalOpen = ref(false)

function openCase() {
  isPasswordModalOpen.value = true
}

let stopScrollRipple = null

onMounted(() => {
  stopScrollRipple = initScrollRipple()
})

onBeforeUnmount(() => {
  stopScrollRipple?.()
})
</script>

<template>
  <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
    <filter id="scroll-ripple-filter" x="-20%" y="-20%" width="140%" height="140%">
      <!-- Same noise field as the hover/flip melt filters (baseFrequency
           0.012 0.022, 3 octaves) so scrolling and hovering warp images with
           the same character — only the trigger and scale differ. No edge
           containment here (unlike the hover filters) — this one also runs
           on thin decorative elements (Results' stems), where an erode wide
           enough to matter would erase them outright. Photos that need
           clean edges under scroll get their own contained variant instead
           (see project-scroll-ripple-filter in Projects.vue). -->
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="3" seed="7" result="noise" />
      <feDisplacementMap
        id="scroll-ripple-displacement"
        in="SourceGraphic"
        in2="noise"
        scale="0"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>

  <Header />
  <Hero />
  <Projects @open-case="openCase" />
  <Results />
  <Contact />
  <PasswordModal :open="isPasswordModalOpen" @close="isPasswordModalOpen = false" />
</template>
