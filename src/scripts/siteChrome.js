import { ThemedSplashController } from '../lib/ThemedSplashController.js'
import { ThemedMobileMenuController } from '../lib/ThemedMobileMenuController.js'
import { ThemedAppSettings } from '../lib/ThemedAppSettings.js'

//* -------------------------------- initSiteChrome -------------------------------------/
/* Initializes splash screen and mobile menu controllers shared across all pages.
*/
function initSiteChrome() {
  const settingsStore = new ThemedAppSettings()
  const settings = settingsStore.load()

  const splashEl = document.getElementById('themed-splash-screen')
  const continueBtn = document.getElementById('themed-splash-continue')
  const inertTargetEl = document.querySelector('.themed-app-shell__content')
  const nextRoute = splashEl ? (splashEl.dataset.nextRoute || '').trim() : ''
  const splashController = new ThemedSplashController({
    splashEl: splashEl,
    continueBtn: continueBtn,
    inertTargetEl: inertTargetEl,
    nextRoute: nextRoute,
    displayDurationMs: 2000,
    fadeDurationMs: 800
  })
  splashController.start(settings)

  const menuRoot = document.querySelector('[data-themed-mobile-menu]')
  const menuController = new ThemedMobileMenuController({
    rootEl: menuRoot,
    toggleBtn: document.getElementById('themed-mobile-menu-toggle'),
    closeBtn: document.getElementById('themed-mobile-menu-close'),
    panelEl: document.getElementById('themed-mobile-menu-panel'),
    backdropEl: document.getElementById('themed-mobile-menu-backdrop')
  })
  menuController.init()

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* Service worker registration is optional during local development. */
    })
  }
}

initSiteChrome()
