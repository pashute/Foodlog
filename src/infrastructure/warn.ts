// Filename: warn.ts
// Version 0.2.1

export const warningText = {
  invalidConfiguration: 'Saved configuration is invalid. Using defaults.',
} as const

export type WarningKey = keyof typeof warningText

let currentWarning: WarningKey | undefined

export function setWarning(warning: WarningKey | undefined): void {
  currentWarning = warning
}

export function getWarning(): string | undefined {
  return currentWarning ? warningText[currentWarning] : undefined
}
