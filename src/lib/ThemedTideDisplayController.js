/**
 * Manages the tides display view: time slider, tide chart, and wind readout.
 * Uses placeholder data until live API integration is implemented.
 */
export class ThemedTideDisplayController {
  constructor(options) {
    this.rootEl = options.rootEl
    this.timeSlider = options.timeSlider
    this.timeLabel = options.timeLabel
    this.tideValueEl = options.tideValueEl
    this.windSpeedEl = options.windSpeedEl
    this.windDirectionEl = options.windDirectionEl
    this.chartCanvas = options.chartCanvas
    this.locationEl = options.locationEl
    this.settings = options.settings || {}
    this.tideData = options.tideData || []
    this.windData = options.windData || []
  }

  //* -------------------------------- formatTime -------------------------------------/
  /* Formats an hour index (0–23) according to the user's 12h or 24h preference.
  */
  formatTime(hourIndex) {
    const use24h = this.settings.timeFormat === '24h'

    if (use24h) {
      return `${String(hourIndex).padStart(2, '0')}:00`
    }

    const period = hourIndex >= 12 ? 'PM' : 'AM'
    const hour12 = hourIndex % 12 === 0 ? 12 : hourIndex % 12
    return `${hour12}:00 ${period}`
  }

  //* -------------------------------- formatTideValue -------------------------------------/
  /* Formats tide height with the user's preferred units (feet or meters).
  */
  formatTideValue(valueFeet) {
    if (this.settings.units === 'meters') {
      const meters = valueFeet * 0.3048
      return `${meters.toFixed(2)} m`
    }
    return `${valueFeet.toFixed(2)} ft`
  }

  //* -------------------------------- interpolateTide -------------------------------------/
  /* Returns interpolated tide height for a fractional hour index.
  */
  interpolateTide(hourIndex) {
    if (this.tideData.length === 0) {
      return 0
    }

    const lower = Math.floor(hourIndex) % this.tideData.length
    const upper = (lower + 1) % this.tideData.length
    const fraction = hourIndex - Math.floor(hourIndex)
    const lowerVal = this.tideData[lower]
    const upperVal = this.tideData[upper]

    return lowerVal + (upperVal - lowerVal) * fraction
  }

  //* -------------------------------- getWindForHour -------------------------------------/
  /* Returns wind speed and direction for the selected hour.
  */
  getWindForHour(hourIndex) {
    const index = Math.floor(hourIndex) % this.windData.length
    return this.windData[index] || { speed: 0, direction: 'N' }
  }

  //* -------------------------------- isHighWind -------------------------------------/
  /* Returns true when wind speed exceeds the user-configured threshold.
  */
  isHighWind(speed) {
    const threshold = this.settings.windSpeedThreshold || 20
    return speed >= threshold
  }

  //* -------------------------------- updateReadouts -------------------------------------/
  /* Updates time, tide value, and wind display for the current slider position.
  */
  updateReadouts(hourIndex) {
    const tideValue = this.interpolateTide(hourIndex)
    const wind = this.getWindForHour(hourIndex)

    if (this.timeLabel) {
      this.timeLabel.textContent = this.formatTime(Math.floor(hourIndex))
    }
    if (this.tideValueEl) {
      this.tideValueEl.textContent = this.formatTideValue(tideValue)
      this.tideValueEl.classList.toggle('themed-tide-value--negative', tideValue < 0)
      this.tideValueEl.classList.toggle('themed-tide-value--positive', tideValue >= 0)
    }
    if (this.windSpeedEl) {
      this.windSpeedEl.textContent = `${wind.speed} ${this.settings.windSpeedUnit || 'knots'}`
      this.windSpeedEl.classList.toggle('themed-wind-speed--high', this.isHighWind(wind.speed))
    }
    if (this.windDirectionEl) {
      this.windDirectionEl.textContent = wind.direction
    }

    this.drawChart(hourIndex)
  }

  //* -------------------------------- drawChart -------------------------------------/
  /* Renders the tide chart with black fill above zero and red fill below zero.
  */
  drawChart(selectedHour) {
    if (!this.chartCanvas) {
      return
    }

    const ctx = this.chartCanvas.getContext('2d')
    const width = this.chartCanvas.width
    const height = this.chartCanvas.height
    const padding = 24
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    ctx.clearRect(0, 0, width, height)

    const maxAbs = Math.max.apply(null, this.tideData.map((v) => Math.abs(v)).concat([1]))
    const zeroY = padding + chartHeight / 2

    ctx.strokeStyle = 'rgba(45, 74, 94, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, zeroY)
    ctx.lineTo(width - padding, zeroY)
    ctx.stroke()

    const points = this.tideData.map((value, index) => {
      const x = padding + (index / (this.tideData.length - 1)) * chartWidth
      const y = zeroY - (value / maxAbs) * (chartHeight / 2)
      return { x: x, y: y, value: value }
    })

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const avgValue = (p1.value + p2.value) / 2
      ctx.fillStyle = avgValue >= 0 ? 'rgba(26, 26, 26, 0.55)' : 'rgba(180, 58, 58, 0.45)'
      ctx.beginPath()
      ctx.moveTo(p1.x, zeroY)
      ctx.lineTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      ctx.lineTo(p2.x, zeroY)
      ctx.closePath()
      ctx.fill()
    }

    ctx.strokeStyle = '#1a3a4a'
    ctx.lineWidth = 2
    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    const markerX = padding + (selectedHour / (this.tideData.length - 1)) * chartWidth
    ctx.strokeStyle = '#c47a3a'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(markerX, padding)
    ctx.lineTo(markerX, height - padding)
    ctx.stroke()
    ctx.setLineDash([])
  }

  //* -------------------------------- requestLocation -------------------------------------/
  /* Requests GPS coordinates and displays them in the location readout.
  */
  requestLocation() {
    if (!this.locationEl) {
      return
    }

    if (!navigator.geolocation) {
      this.locationEl.textContent = 'GPS unavailable on this device'
      return
    }

    this.locationEl.textContent = 'Locating…'

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4)
        const lng = position.coords.longitude.toFixed(4)
        this.locationEl.textContent = `${lat}°, ${lng}°`
      },
      () => {
        this.locationEl.textContent = 'Enable location to see tides near you'
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  //* -------------------------------- bindEvents -------------------------------------/
  /* Wires the time slider input to live readout and chart updates.
  */
  bindEvents() {
    if (this.timeSlider) {
      this.timeSlider.addEventListener('input', () => {
        const hourIndex = Number(this.timeSlider.value)
        this.updateReadouts(hourIndex)
      })
    }
  }

  //* -------------------------------- init -------------------------------------/
  /* Initializes the tides display with location, chart, and slider handlers.
  */
  init() {
    this.requestLocation()
    this.bindEvents()

    const initialHour = this.timeSlider ? Number(this.timeSlider.value) : 8
    this.updateReadouts(initialHour)
  }
}

export function createSampleTideData() {
  return [2.1, 3.4, 4.8, 5.2, 4.0, 1.8, -0.5, -2.1, -3.0, -2.4, -0.8, 1.2, 3.0, 4.5, 5.0, 3.8, 1.5, -1.0, -2.8, -3.5, -2.0, 0.5, 2.8, 4.2]
}

export function createSampleWindData() {
  return [
    { speed: 8, direction: 'NW' },
    { speed: 10, direction: 'NW' },
    { speed: 12, direction: 'W' },
    { speed: 14, direction: 'W' },
    { speed: 16, direction: 'SW' },
    { speed: 18, direction: 'SW' },
    { speed: 22, direction: 'S' },
    { speed: 25, direction: 'S' },
    { speed: 24, direction: 'SE' },
    { speed: 20, direction: 'SE' },
    { speed: 15, direction: 'E' },
    { speed: 12, direction: 'E' },
    { speed: 10, direction: 'NE' },
    { speed: 8, direction: 'NE' },
    { speed: 7, direction: 'N' },
    { speed: 9, direction: 'N' },
    { speed: 11, direction: 'NW' },
    { speed: 13, direction: 'NW' },
    { speed: 17, direction: 'W' },
    { speed: 21, direction: 'W' },
    { speed: 23, direction: 'SW' },
    { speed: 19, direction: 'SW' },
    { speed: 14, direction: 'S' },
    { speed: 11, direction: 'SE' }
  ]
}
