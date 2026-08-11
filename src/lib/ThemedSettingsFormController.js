import { ThemedAppSettings } from './ThemedAppSettings.js'

/**
 * Binds the Settings page form to ThemedAppSettings persistence.
 */
export class ThemedSettingsFormController {
  constructor(options) {
    this.formEl = options.formEl
    this.statusEl = options.statusEl
    this.settingsStore = new ThemedAppSettings()
  }

  //* -------------------------------- populateForm -------------------------------------/
  /* Fills form fields from the persisted settings document.
  */
  populateForm() {
    const settings = this.settingsStore.load()

    if (!this.formEl) {
      return settings
    }

    const unitsField = this.formEl.querySelector('[name="units"]')
    const timeFormatField = this.formEl.querySelector('[name="timeFormat"]')
    const windUnitField = this.formEl.querySelector('[name="windSpeedUnit"]')
    const thresholdField = this.formEl.querySelector('[name="windSpeedThreshold"]')
    const splashField = this.formEl.querySelector('[name="splashEnabled"]')

    if (unitsField) {
      unitsField.value = settings.units
    }
    if (timeFormatField) {
      timeFormatField.value = settings.timeFormat
    }
    if (windUnitField) {
      windUnitField.value = settings.windSpeedUnit
    }
    if (thresholdField) {
      thresholdField.value = String(settings.windSpeedThreshold)
    }
    if (splashField) {
      splashField.checked = settings.splashEnabled !== false
    }

    return settings
  }

  //* -------------------------------- readForm -------------------------------------/
  /* Reads current form values into a settings object.
  */
  readForm() {
    const formData = new FormData(this.formEl)
    return {
      units: formData.get('units'),
      timeFormat: formData.get('timeFormat'),
      windSpeedUnit: formData.get('windSpeedUnit'),
      windSpeedThreshold: Number(formData.get('windSpeedThreshold')),
      splashEnabled: formData.get('splashEnabled') === 'on'
    }
  }

  //* -------------------------------- showStatus -------------------------------------/
  /* Displays a brief save confirmation message to the user.
  */
  showStatus(message) {
    if (!this.statusEl) {
      return
    }
    this.statusEl.textContent = message
    this.statusEl.hidden = false

    window.setTimeout(() => {
      this.statusEl.hidden = true
    }, 2400)
  }

  //* -------------------------------- bindEvents -------------------------------------/
  /* Saves settings on form submit and persists to localStorage as JSON.
  */
  bindEvents() {
    if (!this.formEl) {
      return
    }

    this.formEl.addEventListener('submit', (event) => {
      event.preventDefault()
      const settings = this.readForm()
      this.settingsStore.save(settings)
      this.showStatus('Settings saved')
    })
  }

  //* -------------------------------- init -------------------------------------/
  /* Initializes the settings form with loaded values and event handlers.
  */
  init() {
    this.populateForm()
    this.bindEvents()
  }
}
