import type { BasisPoints, MoneyCents } from './types'

export const BPS_DENOMINATOR = 10000

/** Arredonda para centavos inteiros (evita divergência de ponto flutuante). */
export function roundCents(value: number): MoneyCents {
  return Math.round(value)
}

/** Percentual (bps) aplicado sobre um valor em centavos, arredondado. */
export function percentOfCents(amountCents: MoneyCents, bps: BasisPoints): MoneyCents {
  return roundCents((amountCents * bps) / BPS_DENOMINATOR)
}

/** Converte um número decimal de percentual (ex.: 6 => 6%) em bps. */
export function percentToBps(percent: number): BasisPoints {
  return Math.round(percent * 100)
}

/** Converte bps em percentual decimal (ex.: 600 => 6). */
export function bpsToPercent(bps: BasisPoints): number {
  return bps / 100
}

/** Converte reais (número, ex.: 58.5) em centavos inteiros. */
export function reaisToCents(reais: number): MoneyCents {
  return Math.round(reais * 100)
}

/** Converte centavos em reais (número). */
export function centsToReais(cents: MoneyCents): number {
  return cents / 100
}
