/**
 * Toggles the collapsible hamburger navigation panel on small screens.
 */
export class ThemedMobileMenuController {
  constructor(options) {
    this.rootEl = options.rootEl
    this.toggleBtn = options.toggleBtn
    this.closeBtn = options.closeBtn
    this.panelEl = options.panelEl
    this.backdropEl = options.backdropEl
    this.isOpen = false
  }

  //* -------------------------------- bindEvents -------------------------------------/
  /* Wires click and keyboard handlers for menu open, close, and escape dismissal.
  */
  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        this.open()
      })
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.close()
      })
    }

    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', () => {
        this.close()
      })
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close()
      }
    })
  }

  //* -------------------------------- open -------------------------------------/
  /* Opens the mobile menu panel and updates ARIA expanded state.
  */
  open() {
    this.isOpen = true

    if (this.panelEl) {
      this.panelEl.hidden = false
    }
    if (this.backdropEl) {
      this.backdropEl.hidden = false
    }
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-expanded', 'true')
      this.toggleBtn.setAttribute('aria-label', 'Close navigation menu')
    }
    if (this.rootEl) {
      this.rootEl.classList.add('themed-mobile-menu--open')
    }
  }

  //* -------------------------------- close -------------------------------------/
  /* Closes the mobile menu panel and restores ARIA expanded state.
  */
  close() {
    this.isOpen = false

    if (this.panelEl) {
      this.panelEl.hidden = true
    }
    if (this.backdropEl) {
      this.backdropEl.hidden = true
    }
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-expanded', 'false')
      this.toggleBtn.setAttribute('aria-label', 'Open navigation menu')
    }
    if (this.rootEl) {
      this.rootEl.classList.remove('themed-mobile-menu--open')
    }
  }

  //* -------------------------------- init -------------------------------------/
  /* Initializes the mobile menu controller and binds all event listeners.
  */
  init() {
    this.bindEvents()
  }
}
