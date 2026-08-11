import { ThemedJsonStore } from './ThemedJsonStore.js'

const SettingsDocumentId = 'wind-tide-tracker-settings'

const DefaultSettings = {
  units: 'feet',
  timeFormat: '12h',
  windSpeedUnit: 'knots',
  windSpeedThreshold: 20,
  updatedAt: new Date().toISOString()
}

/**
 * Persists user settings to localStorage as MongoDB-compatible JSON.
 */
export class ThemedAppSettings extends ThemedJsonStore {
  constructor() {
    super('app_settings')
    this.storageKey = 'wtt_app_settings'
  }

  //* -------------------------------- load -------------------------------------/
  /* Loads settings from localStorage, merging with defaults when fields are missing.
  */
  load() {
    if (typeof localStorage === 'undefined') {
      return this.wrapDocument(SettingsDocumentId, Object.assign({}, DefaultSettings))
    }

    const raw = localStorage.getItem(this.storageKey)
    if (!raw) {
      return this.wrapDocument(SettingsDocumentId, Object.assign({}, DefaultSettings))
    }

    try {
      const parsed = JSON.parse(raw)
      const merged = Object.assign({}, DefaultSettings, parsed)
      return this.wrapDocument(SettingsDocumentId, merged)
    } catch (error) {
      return this.wrapDocument(SettingsDocumentId, Object.assign({}, DefaultSettings))
    }
  }

  //* -------------------------------- save -------------------------------------/
  /* Saves settings document to localStorage with updated timestamp.
  */
  save(settings) {
    const doc = this.wrapDocument(SettingsDocumentId, Object.assign({}, settings, {
      updatedAt: new Date().toISOString()
    }))

    if (!this.validateDocument(doc)) {
      return false
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(doc))
    }

    return doc
  }

  //* -------------------------------- exportCollection -------------------------------------/
  /* Exports the settings collection envelope for MongoDB migration.
  */
  exportCollection() {
    return this.serializeCollection([this.load()])
  }
}

export { DefaultSettings, SettingsDocumentId }
