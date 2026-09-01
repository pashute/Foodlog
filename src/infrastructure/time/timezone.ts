// Filename: timezone.ts
// Version: 0.2.5
// Consolidated timezone and time utilities

// Maps IANA city names to countries. Not in map = no country suffix.
const cityToCountry: Record<string, string> = {
  // Israel
  'Jerusalem': 'Israel',
  'Tel_Aviv': 'Israel',
  // Russia
  'Moscow': 'Russia',
  'St_Petersburg': 'Russia',
  'Volgograd': 'Russia',
  'Sakhalin': 'Russia',
  'Magadan': 'Russia',
  'Kamchatka': 'Russia',
  'Yakutsk': 'Russia',
  'Vladivostok': 'Russia',
  'Krasnoyarsk': 'Russia',
  'Novosibirsk': 'Russia',
  'Yekaterinburg': 'Russia',
  // Ukraine
  'Kyiv': 'Ukraine',
  'Simferopol': 'Ukraine',
  'Uzhgorod': 'Ukraine',
  'Zaporozhye': 'Ukraine',
  // Egypt
  'Cairo': 'Egypt',
  // USA: skip (state is part of city name)
}

export interface TimezoneInfo {
  location: string  // e.g. "Jerusalem, Israel"
  abbrev: string    // e.g. "IDT"
  offset: string    // e.g. "UTC+3" or "UTC-5:30"
}

// Parse IANA timezone to city without continent
// "Asia/Jerusalem" → "Jerusalem"
// "America/New_York" → "New_York"
function ianaToCity(ianaId: string): string {
  return ianaId.split('/')[1] ?? ''
}

// Convert offset in minutes to UTC±HH:MM format
// 180 → "UTC+3", -330 → "UTC-5:30", -210 → "UTC-3:30"
function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hours = Math.floor(abs / 60)
  const minutes = abs % 60
  if (minutes === 0) return `UTC${sign}${hours}`
  return `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`
}

/**
 * Format timezone info object: { location, abbrev, offset }
 * @param ianaId - IANA timezone ID like "Asia/Jerusalem"
 * @param abbrev - timezone abbreviation like "IDT"
 * @param offsetMinutes - UTC offset in minutes
 */
export function formatTimezone(ianaId: string, abbrev: string, offsetMinutes: number): TimezoneInfo {
  const city = ianaToCity(ianaId).replace(/_/g, ' ')
  const country = cityToCountry[ianaToCity(ianaId)]
  const location = country ? `${city}, ${country}` : city
  const offset = formatOffset(offsetMinutes)
  return {
    location,
    abbrev,
    offset,
  }
}

/**
 * Format for display in UI: "Jerusalem, Israel (IDT UTC+3)"
 */
export function formatTimezoneDisplay(ianaId: string, abbrev: string, offsetMinutes: number): string {
  const info = formatTimezone(ianaId, abbrev, offsetMinutes)
  return `${info.location} (${info.abbrev} ${info.offset})`
}

/**
 * Format date and time with GMT offset
 * Used when displaying absolute times with timezone context
 * 120 → "GMT+2", -330 → "GMT-5:30"
 */
export function formatGmtOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const hours = Math.floor(abs / 60)
  const minutes = abs % 60
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}

/**
 * Calculate "X minutes ago" from a timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @param now - current time in milliseconds (defaults to Date.now())
 */
export function formatMinutesAgo(timestamp: number, now = Date.now()): string {
  const minutesElapsed = Math.floor((now - timestamp) / 60000)
  if (minutesElapsed === 0) return 'now'
  if (minutesElapsed === 1) return '1 minute ago'
  if (minutesElapsed < 60) return `${minutesElapsed} minutes ago`

  const hoursElapsed = Math.floor(minutesElapsed / 60)
  if (hoursElapsed === 1) return '1 hour ago'
  if (hoursElapsed < 24) return `${hoursElapsed} hours ago`

  const daysElapsed = Math.floor(hoursElapsed / 24)
  if (daysElapsed === 1) return '1 day ago'
  return `${daysElapsed} days ago`
}

/**
 * Get current time formatted as HH:MM
 */
export function formatTime(date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Get system timezone offset in minutes
 */
export function getSystemTimezoneOffsetMinutes(): number {
  return -new Date().getTimezoneOffset()
}

/**
 * Get system IANA timezone ID
 */
export function getSystemTimezoneId(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
