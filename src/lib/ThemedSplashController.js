/**
 * Controls the full-screen splash screen fade-out lifecycle on app launch.
 * Optionally navigates to a follow-on route after dismiss (Home → tides display).
 */
export class ThemedSplashController {
  constructor(options) {
    this.splashEl = options.splashEl
    this.continueBtn = options.continueBtn
    this.inertTargetEl = options.inertTargetEl
    this.fadeDurationMs = options.fadeDurationMs || 800
    this.displayDurationMs = options.displayDurationMs || 2000
    this.nextRoute = (options.nextRoute || '').trim()
    this.storageKey = 'wtt_splash_seen'
    this._dismissed = false
    this._displayTimer = null
    this._onDismissClick = () => {
      this.dismiss()
    }
    this._onContinueClick = (event) => {
      event.stopPropagation()
      this.dismiss()
    }
    this._onDismissKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.dismiss()
      }
    }
  }

  //* -------------------------------- shouldShowSplash -------------------------------------/
  /* Returns true when splash should display based on session and settings preference.
  */
  shouldShowSplash(settings) {
    if (settings && settings.splashEnabled === false) {
      return false
    }
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(this.storageKey) !== 'true'
    }
    return true
  }

  //* -------------------------------- markSeen -------------------------------------/
  /* Records that splash was shown for the current browser session.
  */
  markSeen() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(this.storageKey, 'true')
    }
  }

  //* -------------------------------- setBackgroundInert -------------------------------------/
  /* Toggles inert on page content and footer so only splash chrome stays interactive.
  */
  setBackgroundInert(inert) {
    if (this.inertTargetEl) {
      this.inertTargetEl.inert = inert
    }
    const footerEl = document.querySelector('.themed-site-footer')
    if (footerEl) {
      footerEl.inert = inert
    }
  }

  //* -------------------------------- releaseFocus -------------------------------------/
  /* Blurs focus when it remains inside the splash before hide or navigation.
  */
  releaseFocus() {
    if (!this.splashEl) {
      return
    }
    const activeEl = document.activeElement
    if (activeEl && this.splashEl.contains(activeEl)) {
      activeEl.blur()
    }
  }

  //* -------------------------------- focusContinueButton -------------------------------------/
  /* Moves keyboard focus to the Continue control when the splash is shown.
  */
  focusContinueButton() {
    if (!this.continueBtn) {
      return
    }
    try {
      this.continueBtn.focus({ preventScroll: true })
    } catch (error) {
      /* Focus is optional when the host web view rejects programmatic focus. */
    }
  }

  //* -------------------------------- hideImmediately -------------------------------------/
  /* Hides splash without animation when it should not be shown.
  */
  hideImmediately() {
    if (!this.splashEl) {
      return
    }
    this.releaseFocus()
    this.splashEl.classList.add('themed-splash-screen--hidden')
    this.splashEl.hidden = true
  }

  //* -------------------------------- clearDisplayTimer -------------------------------------/
  /* Cancels the auto-dismiss timer when the user dismisses early.
  */
  clearDisplayTimer() {
    if (this._displayTimer !== null) {
      window.clearTimeout(this._displayTimer)
      this._displayTimer = null
    }
  }

  //* -------------------------------- unbindDismissGestures -------------------------------------/
  /* Removes tap/click and keyboard dismiss listeners from the splash element.
  */
  unbindDismissGestures() {
    if (!this.splashEl) {
      return
    }
    this.splashEl.removeEventListener('click', this._onDismissClick)
    this.splashEl.removeEventListener('keydown', this._onDismissKey)
    if (this.continueBtn) {
      this.continueBtn.removeEventListener('click', this._onContinueClick)
    }
  }

  //* -------------------------------- bindDismissGestures -------------------------------------/
  /* Enables tap/click and keyboard dismissal while the splash is visible.
  */
  bindDismissGestures() {
    if (!this.splashEl) {
      return
    }
    this.splashEl.addEventListener('click', this._onDismissClick)
    this.splashEl.addEventListener('keydown', this._onDismissKey)
    if (this.continueBtn) {
      this.continueBtn.addEventListener('click', this._onContinueClick)
    }
    this.focusContinueButton()
  }

  //* -------------------------------- navigateToNext -------------------------------------/
  /* Full page navigation to the follow-on route (no View Transitions — QWebEngine-safe).
  */
  navigateToNext() {
    if (!this.nextRoute) {
      return
    }
    window.location.assign(this.nextRoute)
  }

  //* -------------------------------- dismiss -------------------------------------/
  /* Fades the splash out, then reveals content or navigates to the next route.
  */
  dismiss() {
    if (this._dismissed || !this.splashEl) {
      return
    }

    this._dismissed = true
    this.clearDisplayTimer()
    this.releaseFocus()
    this.unbindDismissGestures()
    this.setBackgroundInert(false)
    this.markSeen()
    this.splashEl.classList.add('themed-splash-screen--fade-out')

    window.setTimeout(() => {
      this.splashEl.classList.add('themed-splash-screen--hidden')
      this.splashEl.hidden = true
      if (this.nextRoute) {
        this.navigateToNext()
      }
    }, this.fadeDurationMs)
  }

  //* -------------------------------- start -------------------------------------/
  /* Shows splash for the display duration (or until tapped), then fades to the next view.
  */
  start(settings) {
    if (!this.splashEl) {
      return
    }

    if (!this.shouldShowSplash(settings)) {
      this.hideImmediately()
      if (settings && settings.splashEnabled === false && this.nextRoute) {
        this.navigateToNext()
      }
      return
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.fadeDurationMs = 0
      this.displayDurationMs = 0
    }

    this.setBackgroundInert(true)
    this.bindDismissGestures()
    this._displayTimer = window.setTimeout(() => {
      this.dismiss()
    }, this.displayDurationMs)
  }
}
