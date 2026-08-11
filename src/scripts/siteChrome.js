import { ThemedMobileMenuController } from '../lib/ThemedMobileMenuController.js'

//* -------------------------------- initSiteChrome -------------------------------------/
/* Initializes mobile menu controller shared across all pages.
*/
function initSiteChrome() {
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
