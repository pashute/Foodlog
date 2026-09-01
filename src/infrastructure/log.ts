// Filename: log.ts
// Version 0.2.0
// Centralized logging with level control via LOG_LEVEL env var

export type LogSeverity = 'always' | 'error' | 'warn' | 'debug' | 'verbose'
export type LogLevel = 'always' | 'error' | 'warn' | 'debug' | 'verbose'

const SEVERITY_HIERARCHY = { always: 0, error: 1, warn: 2, debug: 3, verbose: 4 }
const LOG_LEVEL: LogLevel = (process.env.EXPO_PUBLIC_LOG_LEVEL || 'warn') as LogLevel

function shouldLog(severity: LogSeverity): boolean {
  if (severity === 'always')return true
  const severityRank = SEVERITY_HIERARCHY[severity]
  const logLevelRank = SEVERITY_HIERARCHY[LOG_LEVEL]
  return severityRank <= logLevelRank
}

function formatTimestamp(): string {
  const now = new Date()
  const iso = now.toISOString()
  return iso // Full ISO timestamp: 2026-08-31T12:34:56.789Z
}

export function report(
  severity: LogSeverity,
  srcFolder: string, // format: `parent/folder`, not full path
  module: string,
  funcName: string,
  message: string,
  ...params: unknown[]
): void {
  
  if (!shouldLog(severity)) return
  const timestamp = formatTimestamp()
  const location = `[${srcFolder}/${module}:${funcName}]`
  const severityTag = `[${severity.toUpperCase()}]`
  const prefix = `${timestamp} ${severityTag} ${location}`

  if (params.length > 0) {
    console[severity === 'error' ? 'error' : 'log'](`${prefix} ${message}`, ...params)
  } else {
    console[severity === 'error' ? 'error' : 'log'](`${prefix} ${message}`)
  }
}
