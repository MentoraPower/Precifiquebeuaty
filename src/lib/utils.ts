import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse de string monetária pt-BR (ex.: "1.234,56") para centavos. */
export function parseMoneyToCents(input: string): number {
  const cleaned = input.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.')
  const value = Number.parseFloat(cleaned)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}

/** Parse de percentual pt-BR (ex.: "4,5") para bps. */
export function parsePercentToBps(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(',', '.')
  const value = Number.parseFloat(cleaned)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}
