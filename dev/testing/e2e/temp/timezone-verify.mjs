// Standalone timezone.ts function verification
// Run with: node dev/testing/e2e/temp/timezone-verify.mjs

import {
  formatTimezone,
  formatTimezoneDisplay,
  formatGmtOffset,
  formatMinutesAgo,
  formatTime,
  getSystemTimezoneOffsetMinutes,
  getSystemTimezoneId,
} from '../../../../src/infrastructure/time/timezone.ts'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`)
    passed++
  } else {
    console.log(`✗ ${message}`)
    failed++
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message}: expected "${expected}", got "${actual}"`)
}

console.log('\n=== Timezone Functions Verification ===\n')

// formatTimezone tests
console.log('formatTimezone:')
let result = formatTimezone('Asia/Jerusalem', 'IDT', 180)
assertEqual(result.location, 'Jerusalem, Israel', 'Jerusalem with country')
assertEqual(result.offset, 'UTC+3', 'Jerusalem offset')

result = formatTimezone('Europe/Moscow', 'MSK', 180)
assertEqual(result.location, 'Moscow, Russia', 'Moscow with country')

result = formatTimezone('Europe/Kyiv', 'EET', 120)
assertEqual(result.location, 'Kyiv, Ukraine', 'Kyiv with country')

result = formatTimezone('Africa/Cairo', 'EET', 120)
assertEqual(result.location, 'Cairo, Egypt', 'Cairo with country')

result = formatTimezone('Europe/London', 'GMT', 0)
assertEqual(result.location, 'London', 'London without country')

result = formatTimezone('America/New_York', 'EST', -300)
assertEqual(result.offset, 'UTC-5', 'Negative offset')

result = formatTimezone('Asia/Kolkata', 'IST', 330)
assertEqual(result.offset, 'UTC+5:30', 'Fractional offset')

// formatTimezoneDisplay tests
console.log('\nformatTimezoneDisplay:')
assertEqual(formatTimezoneDisplay('Asia/Jerusalem', 'IDT', 180), 'Jerusalem, Israel (IDT UTC+3)', 'Full display format')
assertEqual(formatTimezoneDisplay('Europe/London', 'GMT', 0), 'London (GMT UTC+0)', 'Display without country')

// formatGmtOffset tests
console.log('\nformatGmtOffset:')
assertEqual(formatGmtOffset(120), 'GMT+2', 'Positive offset')
assertEqual(formatGmtOffset(-300), 'GMT-5', 'Negative offset')
assertEqual(formatGmtOffset(0), 'GMT+0', 'Zero offset')
assertEqual(formatGmtOffset(330), 'GMT+5:30', 'Fractional offset')
assertEqual(formatGmtOffset(-210), 'GMT-3:30', 'Negative fractional offset')

// formatMinutesAgo tests
console.log('\nformatMinutesAgo:')
const baseTime = 1000000
assertEqual(formatMinutesAgo(baseTime, baseTime), 'now', '0 minutes')
assertEqual(formatMinutesAgo(baseTime, baseTime + 60000), '1 minute ago', '1 minute')
assertEqual(formatMinutesAgo(baseTime, baseTime + 300000), '5 minutes ago', '5 minutes')
assertEqual(formatMinutesAgo(baseTime, baseTime + 3600000), '1 hour ago', '1 hour')
assertEqual(formatMinutesAgo(baseTime, baseTime + 7200000), '2 hours ago', '2 hours')
assertEqual(formatMinutesAgo(baseTime, baseTime + 86400000), '1 day ago', '1 day')
assertEqual(formatMinutesAgo(baseTime, baseTime + 172800000), '2 days ago', '2 days')

// formatTime tests
console.log('\nformatTime:')
assertEqual(formatTime(new Date('2024-01-15T09:05:00')), '09:05', 'Time with padding')
assertEqual(formatTime(new Date('2024-01-15T15:45:00')), '15:45', 'Time without padding')
assertEqual(formatTime(new Date('2024-01-15T00:00:00')), '00:00', 'Midnight')
assertEqual(formatTime(new Date('2024-01-15T23:59:00')), '23:59', '23:59')

// getSystemTimezoneOffsetMinutes test
console.log('\ngetSystemTimezoneOffsetMinutes:')
const offset = getSystemTimezoneOffsetMinutes()
const systemOffset = -new Date().getTimezoneOffset()
assertEqual(offset, systemOffset, 'System offset matches calculation')

// getSystemTimezoneId test
console.log('\ngetSystemTimezoneId:')
const tz = getSystemTimezoneId()
assert(typeof tz === 'string', 'Returns string')
assert(/^[A-Za-z_]+\/[A-Za-z_]+/.test(tz), 'Valid IANA format')
assertEqual(tz, Intl.DateTimeFormat().resolvedOptions().timeZone, 'Matches Intl.DateTimeFormat')

// Summary
console.log(`\n=== Results ===`)
console.log(`✓ Passed: ${passed}`)
console.log(`✗ Failed: ${failed}`)
console.log(`Total: ${passed + failed}\n`)

process.exit(failed > 0 ? 1 : 0)
