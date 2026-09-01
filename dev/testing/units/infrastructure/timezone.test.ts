import {
  formatTimezone,
  formatTimezoneDisplay,
  formatGmtOffset,
  formatMinutesAgo,
  formatTime,
  getSystemTimezoneOffsetMinutes,
  getSystemTimezoneId,
} from '../../../../src/infrastructure/time/timezone.ts'

describe('timezone module', () => {
  describe('formatTimezone', () => {
    it('formats Jerusalem with country', () => {
      const result = formatTimezone('Asia/Jerusalem', 'IDT', 180)
      expect(result.location).toBe('Jerusalem, Israel')
      expect(result.abbrev).toBe('IDT')
      expect(result.offset).toBe('UTC+3')
    })

    it('formats Moscow with country', () => {
      const result = formatTimezone('Europe/Moscow', 'MSK', 180)
      expect(result.location).toBe('Moscow, Russia')
      expect(result.offset).toBe('UTC+3')
    })

    it('formats Kyiv with country', () => {
      const result = formatTimezone('Europe/Kyiv', 'EET', 120)
      expect(result.location).toBe('Kyiv, Ukraine')
      expect(result.offset).toBe('UTC+2')
    })

    it('formats Cairo with country', () => {
      const result = formatTimezone('Africa/Cairo', 'EET', 120)
      expect(result.location).toBe('Cairo, Egypt')
      expect(result.offset).toBe('UTC+2')
    })

    it('formats unmapped city without country', () => {
      const result = formatTimezone('Europe/London', 'GMT', 0)
      expect(result.location).toBe('London')
      expect(result.offset).toBe('UTC+0')
    })

    it('handles negative offsets', () => {
      const result = formatTimezone('America/New_York', 'EST', -300)
      expect(result.location).toBe('New York')
      expect(result.offset).toBe('UTC-5')
    })

    it('handles fractional offsets', () => {
      const result = formatTimezone('Asia/Kolkata', 'IST', 330)
      expect(result.offset).toBe('UTC+5:30')
    })

    it('handles negative fractional offsets', () => {
      const result = formatTimezone('America/Argentina/St_Johns', 'NST', -210)
      expect(result.offset).toBe('UTC-3:30')
    })
  })

  describe('formatTimezoneDisplay', () => {
    it('returns formatted string for display', () => {
      const result = formatTimezoneDisplay('Asia/Jerusalem', 'IDT', 180)
      expect(result).toBe('Jerusalem, Israel (IDT UTC+3)')
    })

    it('returns formatted string without country', () => {
      const result = formatTimezoneDisplay('Europe/London', 'GMT', 0)
      expect(result).toBe('London (GMT UTC+0)')
    })
  })

  describe('formatGmtOffset', () => {
    it('formats positive offset', () => {
      expect(formatGmtOffset(120)).toBe('GMT+2')
    })

    it('formats negative offset', () => {
      expect(formatGmtOffset(-300)).toBe('GMT-5')
    })

    it('formats zero offset', () => {
      expect(formatGmtOffset(0)).toBe('GMT+0')
    })

    it('formats offset with minutes', () => {
      expect(formatGmtOffset(330)).toBe('GMT+5:30')
      expect(formatGmtOffset(-210)).toBe('GMT-3:30')
    })
  })

  describe('formatMinutesAgo', () => {
    const baseTime = 1000000

    it('returns "now" for 0 minutes', () => {
      expect(formatMinutesAgo(baseTime, baseTime)).toBe('now')
    })

    it('returns "1 minute ago" for 1 minute', () => {
      expect(formatMinutesAgo(baseTime, baseTime + 60000)).toBe('1 minute ago')
    })

    it('returns "X minutes ago" for multiple minutes', () => {
      expect(formatMinutesAgo(baseTime, baseTime + 300000)).toBe('5 minutes ago')
      expect(formatMinutesAgo(baseTime, baseTime + 3540000)).toBe('59 minutes ago')
    })

    it('returns "1 hour ago" for 1 hour', () => {
      expect(formatMinutesAgo(baseTime, baseTime + 3600000)).toBe('1 hour ago')
    })

    it('returns "X hours ago" for multiple hours', () => {
      expect(formatMinutesAgo(baseTime, baseTime + 7200000)).toBe('2 hours ago')
      expect(formatMinutesAgo(baseTime, baseTime + 82800000)).toBe('23 hours ago')
    })

    it('returns "1 day ago" for 1 day', () => {
      expect(formatMinutesAgo(baseTime, baseTime + 86400000)).toBe('1 day ago')
    })

    it('returns "X days ago" for multiple days', () => {
      expect(formatMinutesAgo(baseTime, baseTime + 172800000)).toBe('2 days ago')
      expect(formatMinutesAgo(baseTime, baseTime + 864000000)).toBe('10 days ago')
    })
  })

  describe('formatTime', () => {
    it('formats time with zero padding', () => {
      const date = new Date('2024-01-15T09:05:00')
      expect(formatTime(date)).toBe('09:05')
    })

    it('formats time without padding when not needed', () => {
      const date = new Date('2024-01-15T15:45:00')
      expect(formatTime(date)).toBe('15:45')
    })

    it('formats midnight', () => {
      const date = new Date('2024-01-15T00:00:00')
      expect(formatTime(date)).toBe('00:00')
    })

    it('formats 23:59', () => {
      const date = new Date('2024-01-15T23:59:00')
      expect(formatTime(date)).toBe('23:59')
    })
  })

  describe('getSystemTimezoneOffsetMinutes', () => {
    it('returns a number', () => {
      const offset = getSystemTimezoneOffsetMinutes()
      expect(typeof offset).toBe('number')
    })

    it('returns system timezone offset', () => {
      const offset = getSystemTimezoneOffsetMinutes()
      const systemOffset = -new Date().getTimezoneOffset()
      expect(offset).toBe(systemOffset)
    })
  })

  describe('getSystemTimezoneId', () => {
    it('returns a string', () => {
      const tz = getSystemTimezoneId()
      expect(typeof tz).toBe('string')
    })

    it('returns valid IANA timezone format', () => {
      const tz = getSystemTimezoneId()
      expect(tz).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+/)
    })

    it('matches Intl.DateTimeFormat', () => {
      const tz = getSystemTimezoneId()
      const intlTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      expect(tz).toBe(intlTz)
    })
  })
})
