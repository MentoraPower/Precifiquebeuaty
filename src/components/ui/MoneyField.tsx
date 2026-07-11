'use client'

import { useEffect, useState } from 'react'
import { Input } from './Input'
import { parsePercentToBps } from '@/lib/utils'

const groupFmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Formata centavos como "1.234,56" (sem símbolo). */
function formatCentsInput(cents: number): string {
  if (!cents) return ''
  return groupFmt.format(cents / 100)
}

/**
 * Campo de dinheiro com máscara ao vivo (pt-BR).
 * Os dígitos preenchem da direita para a esquerda como centavos:
 * "5" -> 0,05 · "500" -> 5,00 · "500000" -> 5.000,00
 */
export function MoneyField({
  label,
  valueCents,
  onChangeCents,
  hint,
  error,
  autoFocus,
}: {
  label?: string
  valueCents: number
  onChangeCents: (cents: number) => void
  hint?: string
  error?: string
  autoFocus?: boolean
}) {
  return (
    <Input
      label={label}
      prefix="R$"
      inputMode="numeric"
      placeholder="0,00"
      hint={hint}
      error={error}
      autoFocus={autoFocus}
      value={formatCentsInput(valueCents)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 11) // até ~R$ 999.999.999,99
        onChangeCents(digits ? Number.parseInt(digits, 10) : 0)
      }}
    />
  )
}

/** Campo de percentual: exibe %, emite bps. Aceita casas decimais (ex.: 4,5%). */
export function PercentField({
  label,
  valueBps,
  onChangeBps,
  hint,
  error,
}: {
  label?: string
  valueBps: number
  onChangeBps: (bps: number) => void
  hint?: string
  error?: string
}) {
  const [text, setText] = useState(() => (valueBps ? String(valueBps / 100).replace('.', ',') : ''))

  useEffect(() => {
    if (parsePercentToBps(text) !== valueBps) {
      setText(valueBps ? String(valueBps / 100).replace('.', ',') : '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueBps])

  return (
    <Input
      label={label}
      suffix="%"
      inputMode="decimal"
      placeholder="0"
      hint={hint}
      error={error}
      value={text}
      onChange={(e) => {
        // aceita apenas dígitos, vírgula e ponto
        const clean = e.target.value.replace(/[^\d.,]/g, '')
        setText(clean)
        onChangeBps(parsePercentToBps(clean))
      }}
    />
  )
}
