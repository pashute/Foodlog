// Filename: log.ts
// Version 0.1.0
// Centralized logging with level control via LOG_LEVEL env var

type LogSeverity = 'debug' | 'warn' | 'error'
type LogLevel = 'debug' | 'warn' | 'erroronly'

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL || 'warn') as LogLevel

function shouldLog(severity: LogSeverity): boolean {
  if (LOG_LEVEL === 'debug') return true
  if (LOG_LEVEL === 'warn') return severity !== 'debug'
  if (LOG_LEVEL === 'erroronly') return severity === 'error'
  return false
}

function formatTimestamp(): string {
  const now = new Date()
  return now.toISOString().split('T')[1].replace('Z', '') // HH:MM:SS.mmm
}

export function report(
  severity: LogSeverity,
  srcFolder: string,
  module: string,
  funcName: string,
  message: string,
  ...params: unknown[]
): void {
  if (!shouldLog(severity)) return

  const timestamp = formatTimestamp()
  const location = `[${srcFolder}/${module}:${funcName}]`
  const prefix = `${timestamp} ${location}`

  if (params.length > 0) {
    console[severity === 'error' ? 'error' : 'log'](`${prefix} ${message}`, ...params)
  } else {
    console[severity === 'error' ? 'error' : 'log'](`${prefix} ${message}`)
  }
}
